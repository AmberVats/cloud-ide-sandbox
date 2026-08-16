import { ExecutionRequest, ExecutionResult, StreamCallbacks } from '../types';
import { dockerRunner } from './dockerRunner';
import { processRunner } from './processRunner';

export class SandboxEngine {
  private activeJobs: Map<string, { environment: string; cancel: () => void }> = new Map();

  async execute(
    request: ExecutionRequest,
    callbacks?: StreamCallbacks
  ): Promise<ExecutionResult> {
    const isDocker = request.environment === 'docker-sandbox' && dockerRunner.getDockerStatus();

    let currentJobId = '';

    const wrappedCallbacks: StreamCallbacks = {
      ...callbacks,
      onStart: (jobId: string) => {
        currentJobId = jobId;
        this.activeJobs.set(jobId, {
          environment: isDocker ? 'docker-sandbox' : 'process-sandbox',
          cancel: () => {
            if (!isDocker) {
              processRunner.kill(jobId);
            }
          },
        });
        if (callbacks?.onStart) callbacks.onStart(jobId);
      },
      onComplete: (result: ExecutionResult) => {
        if (currentJobId) this.activeJobs.delete(currentJobId);
        if (callbacks?.onComplete) callbacks.onComplete(result);
      },
      onError: (err: Error) => {
        if (currentJobId) this.activeJobs.delete(currentJobId);
        if (callbacks?.onError) callbacks.onError(err);
      },
    };

    if (isDocker) {
      return await dockerRunner.execute(request, wrappedCallbacks);
    } else {
      return await processRunner.execute(request, wrappedCallbacks);
    }
  }

  cancelJob(jobId: string): void {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.cancel();
      this.activeJobs.delete(jobId);
    }
  }

  sendInput(jobId: string, input: string): void {
    processRunner.sendInput(jobId, input);
  }
}

export const sandboxEngine = new SandboxEngine();
