import type { FastifyInstance } from 'fastify';
import { listProfiles, loadProfile } from '../../../src/profiles/index.js';

export async function profileRoutes(app: FastifyInstance) {
  app.get('/profiles', async () => {
    const profiles = await listProfiles();
    const details = await Promise.all(
      profiles.map(async (name) => {
        const profile = await loadProfile(name);
        return {
          name: profile.name,
          version: profile.version,
          description: profile.description,
          check_count: profile.checks.length,
        };
      })
    );
    return { profiles: details };
  });

  app.get<{ Params: { name: string } }>('/profiles/:name', async (request, reply) => {
    try {
      const profile = await loadProfile(request.params.name);
      return profile;
    } catch {
      reply.status(404);
      return { error: 'Profile not found' };
    }
  });
}
