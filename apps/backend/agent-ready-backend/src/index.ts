import Fastify from 'fastify';
import cors from '@fastify/cors';
import { scanRoutes } from './routes/scan.js';
import { reportRoutes } from './routes/report.js';
import { healthRoutes } from './routes/health.js';
import { profileRoutes } from './routes/profiles.js';
import { config } from './config.js';
import { db } from './services/db-service.js';
import { redis } from './services/redis-service.js';
import { queue } from './services/queue-service.js';

const app = Fastify({
  logger:
    config.nodeEnv === 'production'
      ? { level: config.logLevel }
      : {
          level: config.logLevel,
          transport: {
            target: 'pino-pretty',
            options: { colorize: true },
          },
        },
});

// CORS for frontend
await app.register(cors, {
  origin: config.allowedOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
});

// Routes
app.register(healthRoutes, { prefix: '/api' });
app.register(scanRoutes, { prefix: '/api' });
app.register(reportRoutes, { prefix: '/api' });
app.register(profileRoutes, { prefix: '/api' });

// Start server
const start = async () => {
  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Agent-Ready API running on port ${config.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`[Server] Received ${signal}, shutting down gracefully...`);
  try {
    await app.close();
    await queue.close();
    await redis.close();
    await db.close();
    console.log('[Server] All connections closed');
    process.exit(0);
  } catch (err) {
    console.error('[Server] Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();

export { app };
