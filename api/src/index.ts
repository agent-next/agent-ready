import Fastify from 'fastify';
import cors from '@fastify/cors';
import { scanRoutes } from './routes/scan.js';
import { reportRoutes } from './routes/report.js';
import { healthRoutes } from './routes/health.js';
import { profileRoutes } from './routes/profiles.js';
import { config } from './config.js';

const app = Fastify({
  logger: {
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

start();

export { app };
