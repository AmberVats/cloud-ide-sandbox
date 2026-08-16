export type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'cpp' | 'java' | 'go';

export interface CodeFile {
  id: string;
  name: string;
  language: SupportedLanguage;
  content: string;
  isMain?: boolean;
}

export interface ExecutionRequest {
  language: SupportedLanguage;
  environment: 'docker-sandbox' | 'process-sandbox';
  files: CodeFile[];
  entryFile?: string;
  stdin?: string;
  timeoutMs?: number;
  memoryLimitMb?: number;
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
  memoryUsageMb: number;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'MEMORY_LIMIT_EXCEEDED';
  timestamp: string;
  environment: 'docker-sandbox' | 'process-sandbox';
}

export interface StreamCallbacks {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
  onStart?: (jobId: string) => void;
  onComplete?: (result: ExecutionResult) => void;
  onError?: (err: Error) => void;
}
