import { Router, Request, Response } from 'express';
import os from 'os';
import { dockerRunner } from '../services/dockerRunner';
import { sandboxEngine } from '../services/sandboxEngine';
import { ExecutionRequest } from '../types';

export const apiRouter = Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'codesphere-sandbox-engine',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.get('/status', async (_req: Request, res: Response) => {
  const dockerOk = await dockerRunner.checkDockerAvailability();

  res.json({
    dockerAvailable: dockerOk,
    activeContainers: 0,
    systemMetrics: {
      cpuCores: os.cpus().length,
      totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
      freeMemMb: Math.round(os.freemem() / 1024 / 1024),
      uptimeSec: Math.round(os.uptime()),
    },
    supportedRuntimes: [
      { language: 'python', name: 'Python', version: '3.11', dockerImage: 'python:3.11-slim' },
      { language: 'javascript', name: 'Node.js (JavaScript)', version: '20.x', dockerImage: 'node:20-slim' },
      { language: 'typescript', name: 'TypeScript', version: '5.x', dockerImage: 'node:20-slim' },
      { language: 'cpp', name: 'C++ (GCC)', version: '13', dockerImage: 'gcc:13' },
      { language: 'java', name: 'Java (OpenJDK)', version: '17', dockerImage: 'openjdk:17-slim' },
      { language: 'go', name: 'Golang', version: '1.22', dockerImage: 'golang:1.22-alpine' },
    ],
  });
});

apiRouter.post('/execute', async (req: Request, res: Response) => {
  try {
    const request: ExecutionRequest = req.body;
    if (!request.language || !request.files || request.files.length === 0) {
      return res.status(400).json({ error: 'Invalid request: language and files are required.' });
    }

    const result = await sandboxEngine.execute(request);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
