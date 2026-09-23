import { Queue } from 'bullmq';
import { config } from '../config.js';

export interface ScanJobData {
  scanId: string;
  repoUrl: string;
  branch?: string;
  profile: string;
}

class QueueService {
  private scanQueue: Queue<ScanJobData>;

  constructor() {
    this.scanQueue = new Queue('scan-queue', {
      connection: {
        host: config.redisHost,
        port: config.redisPort,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      },
    });
  }

  async addScanJob(data: ScanJobData): Promise<string> {
    const job = await this.scanQueue.add('scan', data, {
      jobId: data.scanId, // Use scanId as jobId for easy lookup
    });
    return job.id || data.scanId;
  }

  async getJobStatus(jobId: string): Promise<{ state: string; progress: unknown } | null> {
    const job = await this.scanQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress;

    return { state, progress };
  }

  async close(): Promise<void> {
    await this.scanQueue.close();
  }
}

// Singleton instance
export const queue = new QueueService();
