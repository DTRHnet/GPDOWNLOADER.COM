import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { AdType } from '@prisma/client';

const adSchema = z.object({
  type: z.enum(['ADSENSE', 'CUSTOM', 'FACEBOOK', 'AMAZON']),
  position: z.string().min(1),
  title: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  script: z.string().optional(),
  isActive: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const adsRouter = router({
  getByPosition: publicProcedure
    .input(z.object({ position: z.string() }))
    .query(async ({ input }) => {
      const now = new Date();

      const ads = await prisma.ad.findMany({
        where: {
          position: input.position,
          isActive: true,
          AND: [
            {
              OR: [
                { startDate: null },
                { startDate: { lte: now } },
              ],
            },
            {
              OR: [
                { endDate: null },
                { endDate: { gte: now } },
              ],
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      return ads;
    }),

  trackImpression: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      await prisma.ad.update({
        where: { id: input.id },
        data: { impressions: { increment: 1 } },
      });

      return { success: true };
    }),

  trackClick: publicProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      await prisma.ad.update({
        where: { id: input.id },
        data: { clicks: { increment: 1 } },
      });

      return { success: true };
    }),

  list: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [ads, total] = await Promise.all([
        prisma.ad.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.ad.count(),
      ]);

      return {
        ads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  create: adminProcedure.input(adSchema).mutation(async ({ input }) => {
    const ad = await prisma.ad.create({
      data: {
        type: input.type as AdType,
        position: input.position,
        title: input.title,
        content: input.content,
        imageUrl: input.imageUrl,
        linkUrl: input.linkUrl,
        script: input.script,
        isActive: input.isActive,
        startDate: input.startDate,
        endDate: input.endDate,
      },
    });

    return { ad };
  }),

  update: adminProcedure
    .input(
      adSchema.extend({
        id: z.string().cuid(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const ad = await prisma.ad.update({
        where: { id },
        data: {
          type: data.type as AdType,
          position: data.position,
          title: data.title,
          content: data.content,
          imageUrl: data.imageUrl,
          linkUrl: data.linkUrl,
          script: data.script,
          isActive: data.isActive,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      });

      return { ad };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      await prisma.ad.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
