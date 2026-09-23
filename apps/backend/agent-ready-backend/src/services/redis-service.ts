import { Redis } from 'ioredis';
import { config } from '../config.js';

class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: config.redisHost,
      port: config.redisPort,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
    });
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      await this.client.ping();
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      console.error('[Redis] Health check failed:', error);
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async close(): Promise<void> {
    await this.client.quit();
  }
}

// Singleton instance
export const redis = new RedisService();
