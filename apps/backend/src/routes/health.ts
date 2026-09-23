import type { FastifyInstance } from 'fastify';
import { db } from '../services/db-service.js';
import { redis } from '../services/redis-service.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    const checks: Record<string, { status: string; latency_ms?: number }> = {};

    // Database check (uses shared pool)
    const dbHealth = await db.healthCheck();
    checks.database = {
      status: dbHealth.healthy ? 'healthy' : 'unhealthy',
      latency_ms: dbHealth.latencyMs,
    };

    // Redis check (uses shared client)
    const redisHealth = await redis.healthCheck();
    checks.redis = {
      status: redisHealth.healthy ? 'healthy' : 'unhealthy',
      latency_ms: redisHealth.latencyMs,
    };

    const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks,
    };
  });

  // Simple liveness probe (no dependency checks)
  app.get('/health/live', async () => {
    return { status: 'alive' };
  });

  // Readiness probe (checks dependencies)
  app.get('/health/ready', async (request, reply) => {
    const dbHealth = await db.healthCheck();
    const redisHealth = await redis.healthCheck();

    if (dbHealth.healthy && redisHealth.healthy) {
      return { status: 'ready' };
    }

    reply.status(503);
    return { status: 'not_ready' };
  });
}
