import type { FastifyPluginAsync } from 'fastify';
import { statsController } from '../controllers/statsController.js';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

let globalStatsCache: CacheEntry<Awaited<ReturnType<typeof statsController.getGlobalStats>>> | null = null;
let tvlCache: CacheEntry<Awaited<ReturnType<typeof statsController.getTVL>>> | null = null;
const CACHE_TTL_MS = 60 * 1000;

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/global',
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: '1 minute',
        },
      },
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              totalOrganizations: { type: 'number' },
              totalFundedStroops: { type: 'string' },
              totalFundedXlm: { type: 'string' },
              totalClaimedStroops: { type: 'string' },
              totalClaimedXlm: { type: 'string' },
              cachedAt: { type: 'string' },
              cacheExpiresAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const now = Date.now();
      if (globalStatsCache && now < globalStatsCache.expiresAt) {
        return reply.send(globalStatsCache.data);
      }
      const data = await statsController.getGlobalStats();
      globalStatsCache = { data, expiresAt: now + CACHE_TTL_MS };
      return reply.send(data);
    }
  );

  fastify.get(
    '/tvl',
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: '1 minute',
        },
      },
      schema: {
        querystring: {
          type: 'object',
          properties: {
            format: { type: 'string', enum: ['full', 'short'] },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              tvlUSD: { type: 'string' },
              lastUpdated: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const now = Date.now();
      const format = (request.query as { format?: string }).format ?? 'full';
      if (tvlCache && now < tvlCache.expiresAt) {
        return reply.send(tvlCache.data);
      }
      const data = await statsController.getTVL(format as 'full' | 'short');
      tvlCache = { data, expiresAt: now + CACHE_TTL_MS };
      return reply.send(data);
    }
  );

  fastify.get(
    '/top-maintainers',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute',
        },
      },
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                totalEarningsXlm: { type: 'string' },
                totalEarningsStroops: { type: 'string' },
                organizationsAssisted: { type: 'number' },
              },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const data = await statsController.getTopMaintainers();
      return reply.send(data);
    }
  );
};
