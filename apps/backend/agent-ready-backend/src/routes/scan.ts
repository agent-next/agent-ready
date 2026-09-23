import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';
import { db } from '../services/db-service.js';
import { queue } from '../services/queue-service.js';
import { config } from '../config.js';

interface ScanRequest {
  repo_url: string;
  branch?: string;
  profile?: string;
  language?: 'zh' | 'en';
}

// JSON Schema for runtime validation
const scanRequestSchema = {
  type: 'object',
  required: ['repo_url'],
  properties: {
    repo_url: { type: 'string', minLength: 1 },
    branch: { type: 'string', pattern: '^[a-zA-Z0-9/_.-]+$' },
    profile: { type: 'string', enum: ['factory_compat', 'factory_strict', 'minimal'] },
    language: { type: 'string', enum: ['zh', 'en'] },
  },
  additionalProperties: false,
};

const scanIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
};

export async function scanRoutes(app: FastifyInstance) {
  // Submit scan
  app.post<{ Body: ScanRequest }>(
    '/scan',
    { schema: { body: scanRequestSchema } },
    async (request, reply) => {
      const { repo_url, branch, profile = 'factory_compat', language = 'en' } = request.body;

      // Validate URL
      try {
        const url = new URL(repo_url);
        if (!config.allowedHosts.includes(url.hostname)) {
          reply.status(400);
          return {
            error: `Only ${config.allowedHosts.join(', ')} repositories are supported`,
          };
        }
      } catch {
        reply.status(400);
        return { error: 'Invalid repository URL' };
      }

      const scanId = randomUUID();

      try {
        // Create scan record in database
        await db.createScan({
          id: scanId,
          repo_url,
          branch,
          profile,
          language,
        });

        // Queue the scan job - if this fails, mark scan as failed
        try {
          await queue.addScanJob({
            scanId,
            repoUrl: repo_url,
            branch,
            profile,
            language,
          });
        } catch (queueError) {
          // Mark scan as failed if queue operation fails
          try {
            await db.failScan(scanId, 'Failed to queue job', 0);
          } catch (dbError) {
            app.log.error(dbError, `Failed to mark scan ${scanId} as failed`);
          }
          throw queueError;
        }

        reply.status(202);
        return {
          scan_id: scanId,
          status: 'queued',
          poll_url: `/api/scan/${scanId}`,
        };
      } catch (error) {
        app.log.error(error, 'Failed to create scan');
        reply.status(500);
        return { error: 'Failed to create scan' };
      }
    }
  );

  // Get scan status
  app.get<{ Params: { id: string } }>(
    '/scan/:id',
    { schema: { params: scanIdParamsSchema } },
    async (request, reply) => {
      try {
        const record = await db.getScan(request.params.id);

        if (!record) {
          reply.status(404);
          return { error: 'Scan not found' };
        }

        // Get job progress from queue if still processing
        let progress = null;
        if (record.status !== 'completed' && record.status !== 'failed') {
          const jobStatus = await queue.getJobStatus(record.id);
          if (jobStatus) {
            progress = jobStatus.progress;
          }
        }

        return {
          scan_id: record.id,
          repo_url: record.repo_url,
          status: record.status,
          created_at: record.created_at,
          started_at: record.started_at,
          completed_at: record.completed_at,
          duration_ms: record.duration_ms,
          result: record.result,
          error: record.error,
          progress,
        };
      } catch (error) {
        app.log.error(error, 'Failed to get scan');
        reply.status(500);
        return { error: 'Failed to get scan status' };
      }
    }
  );
}
