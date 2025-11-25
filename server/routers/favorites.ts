import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';

const tabIdSchema = z.object({
  id: z.string().cuid(),
});

export const favoritesRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [favorites, total] = await Promise.all([
        prisma.favorite.findMany({
          where: { userId: ctx.session.user.id },
          include: {
            tab: {
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
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.favorite.count({
          where: { userId: ctx.session.user.id },
        }),
      ]);

      return {
        favorites: favorites.map((f) => f.tab),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  add: protectedProcedure.input(tabIdSchema).mutation(async ({ input, ctx }) => {
    // Check if tab exists
    const tab = await prisma.tab.findUnique({
      where: { id: input.id },
    });

    if (!tab) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tab not found',
      });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_tabId: {
          userId: ctx.session.user.id,
          tabId: input.id,
        },
      },
    });

    if (existing) {
      return { favorited: true };
    }

    await prisma.favorite.create({
      data: {
        userId: ctx.session.user.id,
        tabId: input.id,
      },
    });

    return { favorited: true };
  }),

  remove: protectedProcedure.input(tabIdSchema).mutation(async ({ input, ctx }) => {
    await prisma.favorite.deleteMany({
      where: {
        userId: ctx.session.user.id,
        tabId: input.id,
      },
    });

    return { favorited: false };
  }),

  check: protectedProcedure.input(tabIdSchema).query(async ({ input, ctx }) => {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_tabId: {
          userId: ctx.session.user.id,
          tabId: input.id,
        },
      },
    });

    return { favorited: !!favorite };
  }),
});
