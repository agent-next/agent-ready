import { Worker, Job } from 'bullmq';
import { cpus } from 'node:os';
import { OrchestratorAgent } from '../agents/orchestrator.js';
import { GitService } from '../services/git-service.js';
import { config } from '../config.js';

// Optimal concurrency based on CPU cores
const CONCURRENCY = Math.min(cpus().length * 2, config.maxParallelScans);

interface ScanJob {
  scanId: string;
  repoUrl: string;
  branch?: string;
  profile: string;
  language: 'zh' | 'en';
}

interface ScanResult {
  scanId: string;
  status: 'completed' | 'failed';
  result?: unknown;
  error?: string;
  duration_ms: number;
}

const worker = new Worker<ScanJob, ScanResult>(
  'scan-queue',
  async (job: Job<ScanJob>) => {
    const startTime = Date.now();
    const { scanId, repoUrl, branch, profile, language } = job.data;
    const gitService = new GitService();

    console.log(`[Worker] Starting scan ${scanId} for ${repoUrl}`);

    try {
      // Update progress: cloning
      await job.updateProgress({ stage: 'cloning', progress: 10 });

      // Clone repository
      const { path, cleanup } = await gitService.cloneRepository(repoUrl, branch);

      try {
        // Update progress: scanning
        await job.updateProgress({ stage: 'scanning', progress: 30 });

        // Run multi-agent analysis
        const orchestrator = new OrchestratorAgent();
        const result = await orchestrator.execute({
          path,
          profile,
          language,
        });

        // Update progress: completed
        await job.updateProgress({ stage: 'completed', progress: 100 });

        console.log(`[Worker] Completed scan ${scanId} in ${Date.now() - startTime}ms`);

        return {
          scanId,
          status: 'completed',
          result,
          duration_ms: Date.now() - startTime,
        };
      } finally {
        // Always cleanup cloned repo
        await cleanup();
      }
    } catch (error) {
      console.error(`[Worker] Failed scan ${scanId}:`, error);

      return {
        scanId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration_ms: Date.now() - startTime,
      };
    }
  },
  {
    connection: {
      host: config.redisHost,
      port: config.redisPort,
    },
    concurrency: CONCURRENCY,
    limiter: {
      max: 100,
      duration: 60000, // Max 100 jobs per minute
    },
  }
);

// Worker event handlers
worker.on('completed', (job, result) => {
  console.log(`[Worker] Job ${job.id} completed: ${result.status}`);
});

worker.on('failed', (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, error);
});

worker.on('error', (error) => {
  console.error('[Worker] Worker error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] Shutting down...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Worker] Interrupted, shutting down...');
  await worker.close();
  process.exit(0);
});

console.log(`[Worker] Started with concurrency: ${CONCURRENCY}`);
