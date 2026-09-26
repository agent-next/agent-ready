/**
 * Image Generation Routes
 *
 * Endpoints for generating images using Nano Banana Pro
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  generateOGImage,
  generateBadge,
  generateHero,
  generateCertificate,
  OGImageParams,
  HeroParams,
  CertificateParams,
} from '../services/image-gen.js';

interface OGImageBody {
  repoName: string;
  level: number;
  score: number;
  headline: string;
  pillars?: { name: string; score: number }[];
}

interface BadgeParams {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

interface HeroBody {
  theme: 'dark' | 'light';
  title: string;
  subtitle?: string;
}

interface CertificateBody {
  repoName: string;
  level: number;
  score: number;
  date?: string;
  pillars: { name: string; level: number }[];
}

export async function imageRoutes(app: FastifyInstance) {
  /**
   * Generate OG/Social Share Image
   * POST /api/images/og
   */
  app.post<{ Body: OGImageBody }>(
    '/images/og',
    {
      schema: {
        body: {
          type: 'object',
          required: ['repoName', 'level', 'score', 'headline'],
          properties: {
            repoName: { type: 'string' },
            level: { type: 'number', minimum: 1, maximum: 5 },
            score: { type: 'number', minimum: 0, maximum: 100 },
            headline: { type: 'string' },
            pillars: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  score: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: OGImageBody }>, reply: FastifyReply) => {
      try {
        const image = await generateOGImage(request.body);

        return reply.send({
          success: true,
          image: {
            data: image.data,
            mimeType: image.mimeType,
            resolution: image.resolution,
            dataUrl: `data:${image.mimeType};base64,${image.data}`,
          },
        });
      } catch (error) {
        request.log.error(error, 'Failed to generate OG image');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Image generation failed',
        });
      }
    }
  );

  /**
   * Generate Level Badge
   * GET /api/images/badge/:level
   */
  app.get<{ Params: BadgeParams; Querystring: { size?: 'sm' | 'md' | 'lg' } }>(
    '/images/badge/:level',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            level: { type: 'string', pattern: '^[1-5]$' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            size: { type: 'string', enum: ['sm', 'md', 'lg'] },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: BadgeParams; Querystring: { size?: 'sm' | 'md' | 'lg' } }>, reply: FastifyReply) => {
      try {
        const level = parseInt(request.params.level, 10);
        const size = request.query.size;

        const image = await generateBadge(level, size);

        // Return as actual image
        return reply
          .header('Content-Type', image.mimeType)
          .header('Cache-Control', 'public, max-age=86400') // Cache for 24 hours
          .send(Buffer.from(image.data, 'base64'));
      } catch (error) {
        request.log.error(error, 'Failed to generate badge');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Badge generation failed',
        });
      }
    }
  );

  /**
   * Generate Hero Banner
   * POST /api/images/hero
   */
  app.post<{ Body: HeroBody }>(
    '/images/hero',
    {
      schema: {
        body: {
          type: 'object',
          required: ['theme', 'title'],
          properties: {
            theme: { type: 'string', enum: ['dark', 'light'] },
            title: { type: 'string' },
            subtitle: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: HeroBody }>, reply: FastifyReply) => {
      try {
        const image = await generateHero(request.body as HeroParams);

        return reply.send({
          success: true,
          image: {
            data: image.data,
            mimeType: image.mimeType,
            resolution: image.resolution,
            dataUrl: `data:${image.mimeType};base64,${image.data}`,
          },
        });
      } catch (error) {
        request.log.error(error, 'Failed to generate hero image');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Hero generation failed',
        });
      }
    }
  );

  /**
   * Generate Certificate
   * POST /api/images/certificate
   */
  app.post<{ Body: CertificateBody }>(
    '/images/certificate',
    {
      schema: {
        body: {
          type: 'object',
          required: ['repoName', 'level', 'score', 'pillars'],
          properties: {
            repoName: { type: 'string' },
            level: { type: 'number', minimum: 1, maximum: 5 },
            score: { type: 'number', minimum: 0, maximum: 100 },
            date: { type: 'string' },
            pillars: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  level: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: CertificateBody }>, reply: FastifyReply) => {
      try {
        const params: CertificateParams = {
          ...request.body,
          date: request.body.date || new Date().toISOString().split('T')[0],
        };

        const image = await generateCertificate(params);

        return reply.send({
          success: true,
          image: {
            data: image.data,
            mimeType: image.mimeType,
            resolution: image.resolution,
            dataUrl: `data:${image.mimeType};base64,${image.data}`,
          },
        });
      } catch (error) {
        request.log.error(error, 'Failed to generate certificate');
        return reply.status(500).send({
          success: false,
          error: error instanceof Error ? error.message : 'Certificate generation failed',
        });
      }
    }
  );

  /**
   * Generate image for scan result (convenience endpoint)
   * GET /api/images/scan/:scanId/og
   */
  app.get<{ Params: { scanId: string } }>(
    '/images/scan/:scanId/og',
    async (request: FastifyRequest<{ Params: { scanId: string } }>, reply: FastifyReply) => {
      // This would fetch scan result and generate OG image
      // For now, return a placeholder response
      return reply.status(501).send({
        success: false,
        error: 'Not implemented - requires scan result lookup',
      });
    }
  );
}
