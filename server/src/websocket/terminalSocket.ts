import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { sandboxEngine } from '../services/sandboxEngine';
import { ExecutionRequest } from '../types';

export function setupWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let currentJobId: string | null = null;

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'RUN_CODE') {
          const request: ExecutionRequest = {
            language: message.language,
            environment: message.environment || 'process-sandbox',
            files: message.files,
            entryFile: message.entryFile,
            stdin: message.stdin,
            timeoutMs: message.timeoutMs,
          };

          await sandboxEngine.execute(request, {
            onStart: (jobId) => {
              currentJobId = jobId;
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: 'EXECUTION_START',
                    jobId,
                    environment: request.environment,
                  })
                );
              }
            },
            onStdout: (text) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: 'STDOUT',
                    data: text,
                  })
                );
              }
            },
            onStderr: (text) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: 'STDERR',
                    data: text,
                  })
                );
              }
            },
            onComplete: (result) => {
              currentJobId = null;
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: 'EXECUTION_COMPLETE',
                    result,
                  })
                );
              }
            },
            onError: (err) => {
              currentJobId = null;
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: 'ERROR',
                    message: err.message,
                  })
                );
              }
            },
          });
        } else if (message.type === 'STDIN_INPUT') {
          if (currentJobId) {
            sandboxEngine.sendInput(currentJobId, message.data);
          }
        } else if (message.type === 'STOP_EXECUTION') {
          if (currentJobId) {
            sandboxEngine.cancelJob(currentJobId);
            currentJobId = null;
          }
        }
      } catch (err: any) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'ERROR',
              message: `WebSocket frame error: ${err.message}`,
            })
          );
        }
      }
    });

    ws.on('close', () => {
      if (currentJobId) {
        sandboxEngine.cancelJob(currentJobId);
      }
    });
  });

  return wss;
}
