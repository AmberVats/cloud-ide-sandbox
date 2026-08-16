import fs from 'fs';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { ExecutionRequest, ExecutionResult, StreamCallbacks } from '../types';
import { config } from '../config';

export class ProcessRunner {
  private activeProcesses: Map<string, ChildProcess> = new Map();

  async execute(
    request: ExecutionRequest,
    callbacks?: StreamCallbacks
  ): Promise<ExecutionResult> {
    const jobId = uuidv4();
    const tempDir = path.join(config.workspaceTempDir, jobId);
    const timeoutMs = request.timeoutMs || config.defaultTimeoutMs;

    // Ensure temp workspace directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      // 1. Write files to isolated temporary directory
      for (const file of request.files) {
        const filePath = path.join(tempDir, file.name);
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }

      const mainFile = request.entryFile || (request.files.find((f) => f.isMain) || request.files[0]).name;

      // 2. Determine command & args based on language
      let command = '';
      let args: string[] = [];

      switch (request.language) {
        case 'python':
          command = 'python';
          args = ['-u', mainFile];
          break;
        case 'javascript':
          command = 'node';
          args = [mainFile];
          break;
        case 'typescript':
          command = 'npx';
          args = ['tsx', mainFile];
          break;
        case 'cpp': {
          // If C++, compile first then run
          command = 'g++';
          args = ['-O2', mainFile, '-o', 'program.exe'];
          break;
        }
        case 'java': {
          command = 'javac';
          args = [mainFile];
          break;
        }
        case 'go': {
          command = 'go';
          args = ['run', mainFile];
          break;
        }
        default:
          command = 'node';
          args = [mainFile];
      }

      if (callbacks?.onStart) {
        callbacks.onStart(jobId);
      }

      const startTime = performance.now();
      let stdoutAcc = '';
      let stderrAcc = '';
      let isTimedOut = false;

      return await new Promise<ExecutionResult>((resolve) => {
        const child = spawn(command, args, {
          cwd: tempDir,
          shell: true,
          env: { ...process.env, PYTHONUNBUFFERED: '1' },
        });

        this.activeProcesses.set(jobId, child);

        // Watchdog timer for timeout protection
        const timer = setTimeout(() => {
          isTimedOut = true;
          try {
            if (process.platform === 'win32') {
              spawn('taskkill', ['/pid', child.pid?.toString() || '', '/f', '/t']);
            } else {
              child.kill('SIGKILL');
            }
          } catch (e) {
            // Ignore kill error
          }
        }, timeoutMs);

        // Pipe stdin if provided
        if (request.stdin && child.stdin) {
          child.stdin.write(request.stdin);
          child.stdin.end();
        }

        // Capture stdout
        child.stdout?.on('data', (data: Buffer) => {
          const text = data.toString();
          stdoutAcc += text;
          if (callbacks?.onStdout) {
            callbacks.onStdout(text);
          }
        });

        // Capture stderr
        child.stderr?.on('data', (data: Buffer) => {
          const text = data.toString();
          stderrAcc += text;
          if (callbacks?.onStderr) {
            callbacks.onStderr(text);
          }
        });

        // Process exit
        child.on('close', (code) => {
          clearTimeout(timer);
          this.activeProcesses.delete(jobId);

          const executionTimeMs = Math.round(performance.now() - startTime);

          // Approximate memory usage
          const memoryUsageMb = parseFloat((process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2));

          const result: ExecutionResult = {
            stdout: stdoutAcc,
            stderr: isTimedOut ? stderrAcc + `\nExecution timed out after ${timeoutMs}ms limit.` : stderrAcc,
            exitCode: isTimedOut ? 124 : (code ?? 0),
            executionTimeMs,
            memoryUsageMb,
            status: isTimedOut ? 'TIMEOUT' : (code === 0 ? 'SUCCESS' : 'ERROR'),
            timestamp: new Date().toISOString(),
            environment: 'process-sandbox',
          };

          if (callbacks?.onComplete) {
            callbacks.onComplete(result);
          }

          resolve(result);
        });

        child.on('error', (err) => {
          clearTimeout(timer);
          this.activeProcesses.delete(jobId);

          const result: ExecutionResult = {
            stdout: stdoutAcc,
            stderr: `Process spawn error: ${err.message}`,
            exitCode: 1,
            executionTimeMs: Math.round(performance.now() - startTime),
            memoryUsageMb: 0,
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            environment: 'process-sandbox',
          };

          resolve(result);
        });
      });
    } catch (err: any) {
      return {
        stdout: '',
        stderr: err.message,
        exitCode: 1,
        executionTimeMs: 0,
        memoryUsageMb: 0,
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        environment: 'process-sandbox',
      };
    } finally {
      // Clean up temp directory
      setTimeout(() => {
        try {
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        } catch (e) {
          // Cleanup best effort
        }
      }, 3000);
    }
  }

  sendInput(jobId: string, input: string): void {
    const child = this.activeProcesses.get(jobId);
    if (child && child.stdin && !child.stdin.destroyed) {
      child.stdin.write(input);
    }
  }

  kill(jobId: string): void {
    const child = this.activeProcesses.get(jobId);
    if (child) {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', child.pid?.toString() || '', '/f', '/t']);
      } else {
        child.kill('SIGKILL');
      }
      this.activeProcesses.delete(jobId);
    }
  }
}

export const processRunner = new ProcessRunner();
