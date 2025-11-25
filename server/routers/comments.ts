import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';

const commentSchema = z.object({
  tabId: z.string().cuid(),
  content: z.string().min(1).max(1000),
});

export const commentsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        tabId: z.string().cuid(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { tabId, page, limit } = input;
      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: { tabId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.comment.count({
          where: { tabId },
        }),
      ]);

      return {
        comments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  create: protectedProcedure.input(commentSchema).mutation(async ({ input, ctx }) => {
    // Check if tab exists
    const tab = await prisma.tab.findUnique({
      where: { id: input.tabId },
    });

    if (!tab) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Tab not found',
      });
    }

    const comment = await prisma.comment.create({
      data: {
        userId: ctx.session.user.id,
        tabId: input.tabId,
        content: input.content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return { comment };
  }),
});
