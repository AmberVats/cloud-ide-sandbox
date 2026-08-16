import Docker from 'dockerode';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ExecutionRequest, ExecutionResult, StreamCallbacks } from '../types';
import { config } from '../config';

export class DockerRunner {
  private docker: Docker;
  private isDockerAvailable: boolean = false;

  constructor() {
    this.docker = new Docker();
    this.checkDockerAvailability();
  }

  async checkDockerAvailability(): Promise<boolean> {
    try {
      await this.docker.ping();
      this.isDockerAvailable = true;
    } catch {
      this.isDockerAvailable = false;
    }
    return this.isDockerAvailable;
  }

  getDockerStatus(): boolean {
    return this.isDockerAvailable;
  }

  async execute(
    request: ExecutionRequest,
    callbacks?: StreamCallbacks
  ): Promise<ExecutionResult> {
    const jobId = uuidv4();
    const tempDir = path.join(config.workspaceTempDir, jobId);
    const timeoutMs = request.timeoutMs || config.defaultTimeoutMs;

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    try {
      for (const file of request.files) {
        const filePath = path.join(tempDir, file.name);
        fs.writeFileSync(filePath, file.content, 'utf-8');
      }

      const mainFile = request.entryFile || (request.files.find((f) => f.isMain) || request.files[0]).name;
      const image = config.dockerImages[request.language] || 'node:20-slim';

      let cmd: string[] = [];
      switch (request.language) {
        case 'python':
          cmd = ['python', '-u', `/app/${mainFile}`];
          break;
        case 'javascript':
          cmd = ['node', `/app/${mainFile}`];
          break;
        case 'typescript':
          cmd = ['npx', 'tsx', `/app/${mainFile}`];
          break;
        case 'cpp':
          cmd = ['sh', '-c', `g++ -O2 /app/${mainFile} -o /app/prog && /app/prog`];
          break;
        case 'java':
          cmd = ['sh', '-c', `javac /app/${mainFile} && cd /app && java ${mainFile.replace('.java', '')}`];
          break;
        case 'go':
          cmd = ['go', 'run', `/app/${mainFile}`];
          break;
        default:
          cmd = ['node', `/app/${mainFile}`];
      }

      if (callbacks?.onStart) {
        callbacks.onStart(jobId);
      }

      const startTime = performance.now();

      // Create isolated container with strict resource limits & no network
      const container: any = await this.docker.createContainer({
        Image: image,
        Cmd: cmd,
        WorkingDir: '/app',
        HostConfig: {
          Binds: [`${tempDir}:/app:rw`],
          Memory: config.defaultMemoryLimitMb * 1024 * 1024, // 256MB cap
          NanoCpus: 500000000, // 0.5 CPU core
          NetworkMode: 'none', // Disabled networking for security
          AutoRemove: true,
        },
        Tty: false,
      });

      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true,
      });

      let stdoutAcc = '';
      let stderrAcc = '';

      container.modem.demuxStream(
        stream,
        {
          write: (chunk: Buffer) => {
            const str = chunk.toString('utf-8');
            stdoutAcc += str;
            if (callbacks?.onStdout) callbacks.onStdout(str);
          },
        },
        {
          write: (chunk: Buffer) => {
            const str = chunk.toString('utf-8');
            stderrAcc += str;
            if (callbacks?.onStderr) callbacks.onStderr(str);
          },
        }
      );

      await container.start();

      // Wait for container with timeout
      const waitPromise = container.wait();
      const timeoutPromise = new Promise<{ StatusCode: number }>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
      );

      let waitResult: any;
      let isTimedOut = false;

      try {
        waitResult = await Promise.race([waitPromise, timeoutPromise]);
      } catch (err: any) {
        if (err.message === 'TIMEOUT') {
          isTimedOut = true;
          try {
            await container.kill();
          } catch {
            // Container may have already exited
          }
        }
      }

      const executionTimeMs = Math.round(performance.now() - startTime);

      const result: ExecutionResult = {
        stdout: stdoutAcc,
        stderr: isTimedOut ? stderrAcc + `\nExecution timed out after ${timeoutMs}ms limit.` : stderrAcc,
        exitCode: isTimedOut ? 124 : (waitResult?.StatusCode ?? 0),
        executionTimeMs,
        memoryUsageMb: config.defaultMemoryLimitMb,
        status: isTimedOut ? 'TIMEOUT' : (waitResult?.StatusCode === 0 ? 'SUCCESS' : 'ERROR'),
        timestamp: new Date().toISOString(),
        environment: 'docker-sandbox',
      };

      if (callbacks?.onComplete) {
        callbacks.onComplete(result);
      }

      return result;
    } catch (err: any) {
      return {
        stdout: '',
        stderr: `Docker execution error: ${err.message}`,
        exitCode: 1,
        executionTimeMs: 0,
        memoryUsageMb: 0,
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        environment: 'docker-sandbox',
      };
    } finally {
      setTimeout(() => {
        try {
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
        } catch {
          // Cleanup
        }
      }, 3000);
    }
  }
}

export const dockerRunner = new DockerRunner();
