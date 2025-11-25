import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { searchRateLimit } from '../utils/rate-limit';
import { TRPCError } from '@trpc/server';

const searchSchema = z.object({
  q: z.string().optional(),
  artist: z.string().optional(),
  genre: z.string().optional(),
  instrument: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  groupBy: z.enum(['title', 'artist']).optional(),
});

export const searchRouter = router({
  search: publicProcedure
    .input(searchSchema)
    .query(async ({ input, ctx }) => {
      // Rate limiting
      const forwardedFor = ctx.req?.headers.get('x-forwarded-for') || '';
      const identifier = ctx.session?.user?.id || forwardedFor.split(',')[0] || 'anonymous';
      const { success } = await searchRateLimit.limit(identifier);
      
      if (!success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many search requests. Please try again later.',
        });
      }

      // Build cache key
      const cacheKey = `search:${JSON.stringify(input)}`;
      
      // Try cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return cached as any;
      }

      const { q, artist, genre, instrument, difficulty, page, limit, groupBy } = input;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (q) {
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { artist: { name: { contains: q, mode: 'insensitive' } } },
        ];
      }

      if (artist) {
        where.artist = { name: { contains: artist, mode: 'insensitive' } };
      }

      if (genre) {
        where.genre = { contains: genre, mode: 'insensitive' };
      }

      if (instrument) {
        where.instrument = { contains: instrument, mode: 'insensitive' };
      }

      if (difficulty) {
        where.difficulty = difficulty;
      }

      // Execute query
      const [tabs, total] = await Promise.all([
        prisma.tab.findMany({
          where,
          include: {
            artist: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                favorites: true,
                ratings: true,
                comments: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: [
            { downloadCount: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        prisma.tab.count({ where }),
      ]);

      const result = {
        tabs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };

      // Cache for 5 minutes
      await redis.set(cacheKey, result, { ex: 300 });

      return result;
    }),
});
