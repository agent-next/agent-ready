import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { OrchestratorAgent } from '../agents/orchestrator.js';
import { GitService } from '../services/git-service.js';
import { config } from '../config.js';

interface ScanRequest {
  repo_url: string;
  branch?: string;
  profile?: string;
  language?: 'zh' | 'en';
}

interface ScanRecord {
  id: string;
  repo_url: string;
  branch?: string;
  profile: string;
  language: 'zh' | 'en';
  status: 'queued' | 'cloning' | 'scanning' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  result?: unknown;
  error?: string;
}

// In-memory store (replace with database in production)
const scans = new Map<string, ScanRecord>();

export async function scanRoutes(app: FastifyInstance) {
  // Submit scan
  app.post<{ Body: ScanRequest }>('/scan', async (request, reply) => {
    const { repo_url, branch, profile = 'factory_compat', language = 'en' } = request.body;

    // Validate URL
    try {
      const url = new URL(repo_url);
      if (!config.allowedHosts.includes(url.hostname)) {
        reply.status(400);
        return { error: `Only ${config.allowedHosts.join(', ')} repositories are supported` };
      }
    } catch {
      reply.status(400);
      return { error: 'Invalid repository URL' };
    }

    const scanId = randomUUID();
    const record: ScanRecord = {
      id: scanId,
      repo_url,
      branch,
      profile,
      language,
      status: 'queued',
      created_at: new Date().toISOString(),
    };

    scans.set(scanId, record);

    // Start scan in background
    processScan(scanId).catch((err) => {
      app.log.error(err, `Scan ${scanId} failed`);
    });

    reply.status(202);
    return {
      scan_id: scanId,
      status: 'queued',
      poll_url: `/api/scan/${scanId}`,
    };
  });

  // Get scan status
  app.get<{ Params: { id: string } }>('/scan/:id', async (request, reply) => {
    const record = scans.get(request.params.id);

    if (!record) {
      reply.status(404);
      return { error: 'Scan not found' };
    }

    return {
      scan_id: record.id,
      repo_url: record.repo_url,
      status: record.status,
      created_at: record.created_at,
      completed_at: record.completed_at,
      result: record.result,
      error: record.error,
    };
  });
}

async function processScan(scanId: string) {
  const record = scans.get(scanId);
  if (!record) return;

  const gitService = new GitService();

  try {
    // Clone repository
    record.status = 'cloning';
    const { path, cleanup } = await gitService.cloneRepository(record.repo_url, record.branch);

    try {
      // Run scan
      record.status = 'scanning';
      const orchestrator = new OrchestratorAgent();
      const result = await orchestrator.execute({
        path,
        profile: record.profile,
        language: record.language,
      });

      record.status = 'completed';
      record.completed_at = new Date().toISOString();
      record.result = result;
    } finally {
      // Cleanup cloned repo
      await cleanup();
    }
  } catch (err) {
    record.status = 'failed';
    record.completed_at = new Date().toISOString();
    record.error = err instanceof Error ? err.message : 'Unknown error';
  }
}
