import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { getPresignedDownloadUrl } from '@/lib/s3';
import { downloadRateLimit } from '../utils/rate-limit';
import { TRPCError } from '@trpc/server';

const tabIdSchema = z.object({
  id: z.string().cuid(),
});

export const tabsRouter = router({
  getById: publicProcedure.input(tabIdSchema).query(async ({ input }) => {
    const tab = await prisma.tab.findUnique({
      where: { id: input.id },
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
    });

    if (!tab) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tab not found',
      });
    }

    return tab;
  }),

  getDownloadUrl: publicProcedure
    .input(tabIdSchema)
    .query(async ({ input, ctx }) => {
      // Rate limiting for anonymous users
      const forwardedFor = ctx.req?.headers.get('x-forwarded-for') || '';
      const identifier = ctx.session?.user?.id || forwardedFor.split(',')[0] || 'anonymous';
      const { success } = await downloadRateLimit.limit(identifier);

      if (!success) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Download limit exceeded. Please sign in for unlimited downloads.',
        });
      }

      const tab = await prisma.tab.findUnique({
        where: { id: input.id },
      });

      if (!tab) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tab not found',
        });
      }

      // Increment download count
      await prisma.tab.update({
        where: { id: input.id },
        data: { downloadCount: { increment: 1 } },
      });

      // Generate presigned URL (10 minute expiry)
      const url = await getPresignedDownloadUrl(tab.s3Key, 600);

      return { url };
    }),

  getVersions: publicProcedure
    .input(
      z.object({
        title: z.string(),
        artist: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const where: any = {
        title: { contains: input.title, mode: 'insensitive' },
      };

      if (input.artist) {
        where.artist = { name: { contains: input.artist, mode: 'insensitive' } };
      }

      const tabs = await prisma.tab.findMany({
        where,
        include: {
          artist: true,
          _count: {
            select: {
              favorites: true,
              ratings: true,
              comments: true,
            },
          },
        },
        orderBy: [{ version: 'asc' }, { createdAt: 'asc' }],
      });

      return tabs;
    }),

  getUserTabs: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [tabs, total] = await Promise.all([
        prisma.tab.findMany({
          where: { userId: ctx.session.user.id },
          include: {
            artist: true,
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
          orderBy: { createdAt: 'desc' },
        }),
        prisma.tab.count({
          where: { userId: ctx.session.user.id },
        }),
      ]);

      return {
        tabs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),
});
