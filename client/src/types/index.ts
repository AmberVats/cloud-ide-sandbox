export type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'cpp' | 'java' | 'go';

export interface CodeFile {
  id: string;
  name: string;
  language: SupportedLanguage;
  content: string;
  isMain?: boolean;
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

export interface WorkspaceTemplate {
  id: string;
  name: string;
  language: SupportedLanguage;
  description: string;
  files: CodeFile[];
}

export interface SandboxStatus {
  dockerAvailable: boolean;
  activeContainers: number;
  supportedRuntimes: {
    language: SupportedLanguage;
    name: string;
    version: string;
    dockerImage: string;
  }[];
  systemMetrics: {
    cpuCores: number;
    totalMemMb: number;
    freeMemMb: number;
    uptimeSec: number;
  };
}
