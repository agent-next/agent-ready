// Fail fast in production if critical env vars are missing
function requireEnvInProduction(name: string, defaultValue: string): string {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} environment variable must be set in production`);
  }
  return defaultValue;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Database (requires env var in production)
  databaseUrl: requireEnvInProduction(
    'DATABASE_URL',
    'postgresql://postgres:postgres@localhost:5432/agent_ready'
  ),

  // Redis (requires env var in production)
  redisHost: requireEnvInProduction('REDIS_HOST', 'localhost'),
  redisPort: parseInt(requireEnvInProduction('REDIS_PORT', '6379'), 10),

  // Parallel processing
  maxParallelScans: parseInt(process.env.MAX_PARALLEL_SCANS || '10', 10),

  // Scan settings
  maxConcurrentScans: parseInt(process.env.MAX_CONCURRENT_SCANS || '10', 10),
  scanTimeoutMs: parseInt(process.env.SCAN_TIMEOUT_MS || '300000', 10),
  agentConcurrency: parseInt(process.env.AGENT_CONCURRENCY || '20', 10),

  // Security
  allowedOrigins: (
    process.env.ALLOWED_ORIGINS || 'http://localhost:5173,https://agent-ready.org'
  ).split(','),
  allowedHosts: ['github.com', 'gitlab.com', 'bitbucket.org'],

  // Git
  cloneTimeoutMs: parseInt(process.env.CLONE_TIMEOUT_MS || '120000', 10),
  maxRepoSizeMb: parseInt(process.env.MAX_REPO_SIZE_MB || '500', 10),
};
