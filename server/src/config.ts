import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  defaultTimeoutMs: parseInt(process.env.DEFAULT_TIMEOUT_MS || '5000', 10),
  defaultMemoryLimitMb: parseInt(process.env.DEFAULT_MEMORY_LIMIT_MB || '256', 10),
  workspaceTempDir: path.resolve(process.env.TEMP_DIR || path.join(__dirname, '../.tmp_workspaces')),
  dockerImages: {
    python: 'python:3.11-slim',
    javascript: 'node:20-slim',
    typescript: 'node:20-slim',
    cpp: 'gcc:13',
    java: 'openjdk:17-slim',
    go: 'golang:1.22-alpine',
  },
};
