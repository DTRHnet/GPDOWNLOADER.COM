import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';

const ratingSchema = z.object({
  tabId: z.string().cuid(),
  value: z.number().int().min(1).max(5),
});

export const ratingsRouter = router({
  submit: protectedProcedure.input(ratingSchema).mutation(async ({ input, ctx }) => {
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

    // Upsert rating
    await prisma.rating.upsert({
      where: {
        userId_tabId: {
          userId: ctx.session.user.id,
          tabId: input.tabId,
        },
      },
      update: {
        value: input.value,
      },
      create: {
        userId: ctx.session.user.id,
        tabId: input.tabId,
        value: input.value,
      },
    });

    // Recalculate average rating
    const ratings = await prisma.rating.findMany({
      where: { tabId: input.tabId },
      select: { value: true },
    });

    const averageRating =
      ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;

    await prisma.tab.update({
      where: { id: input.tabId },
      data: { averageRating },
    });

    return {
      rating: {
        value: input.value,
        averageRating,
      },
    };
  }),

  get: protectedProcedure
    .input(z.object({ tabId: z.string().cuid() }))
    .query(async ({ input, ctx }) => {
      const rating = await prisma.rating.findUnique({
        where: {
          userId_tabId: {
            userId: ctx.session.user.id,
            tabId: input.tabId,
          },
        },
      });

      return rating ? { value: rating.value } : null;
    }),
});
