import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { TRPCError } from '@trpc/server';
import { UploadStatus } from '@prisma/client';

export const adminRouter = router({
  analytics: adminProcedure
    .input(
      z.object({
        days: z.number().int().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - input.days);

      const [
        totalTabs,
        totalUsers,
        totalDownloads,
        totalUploads,
        recentTabs,
        popularTabs,
        adStats,
        dailyStats,
      ] = await Promise.all([
        prisma.tab.count(),
        prisma.user.count(),
        prisma.tab.aggregate({
          _sum: { downloadCount: true },
        }),
        prisma.upload.count({
          where: {
            createdAt: { gte: daysAgo },
          },
        }),
        prisma.tab.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            artist: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.tab.findMany({
          take: 10,
          orderBy: { downloadCount: 'desc' },
          include: {
            artist: true,
            _count: {
              select: {
                favorites: true,
                ratings: true,
              },
            },
          },
        }),
        prisma.ad.aggregate({
          _sum: {
            impressions: true,
            clicks: true,
            revenue: true,
          },
        }),
        prisma.tab.groupBy({
          by: ['createdAt'],
          _count: {
            id: true,
          },
          where: {
            createdAt: { gte: daysAgo },
          },
        }),
      ]);

      return {
        overview: {
          totalTabs,
          totalUsers,
          totalDownloads: totalDownloads._sum.downloadCount || 0,
          totalUploads,
        },
        recentTabs,
        popularTabs,
        adStats: {
          impressions: adStats._sum.impressions || 0,
          clicks: adStats._sum.clicks || 0,
          revenue: adStats._sum.revenue || 0,
          ctr: adStats._sum.impressions
            ? (adStats._sum.clicks || 0) / adStats._sum.impressions
            : 0,
        },
        dailyStats: dailyStats.map((stat) => ({
          date: stat.createdAt,
          count: stat._count.id,
        })),
      };
    }),

  listTabs: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const { page, limit } = input;
      const skip = (page - 1) * limit;

      const [tabs, total] = await Promise.all([
        prisma.tab.findMany({
          include: {
            artist: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
          orderBy: { createdAt: 'desc' },
        }),
        prisma.tab.count(),
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

  deleteTab: adminProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ input }) => {
      const tab = await prisma.tab.findUnique({
        where: { id: input.id },
      });

      if (!tab) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tab not found',
        });
      }

      await prisma.tab.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  listUploads: adminProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, limit, status } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) {
        where.status = status;
      }

      const [uploads, total] = await Promise.all([
        prisma.upload.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.upload.count({ where }),
      ]);

      return {
        uploads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  updateUploadStatus: adminProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
      })
    )
    .mutation(async ({ input }) => {
      const upload = await prisma.upload.findUnique({
        where: { id: input.id },
        include: { user: true },
      });

      if (!upload) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Upload not found',
        });
      }

      // If approved, create tab from upload
      if (input.status === 'APPROVED') {
        // Find or create artist
        let artist = await prisma.artist.findUnique({
          where: { name: upload.artistName || 'Unknown' },
        });

        if (!artist && upload.artistName) {
          artist = await prisma.artist.create({
            data: { name: upload.artistName },
          });
        } else if (!artist) {
          artist = await prisma.artist.create({
            data: { name: 'Unknown' },
          });
        }

        // Create tab
        await prisma.tab.create({
          data: {
            title: upload.title || upload.filename,
            artistId: artist.id,
            userId: upload.userId,
            s3Key: upload.s3Key,
            s3Bucket: upload.s3Bucket,
            fileSize: upload.fileSize,
            contentType: upload.contentType,
            difficulty: upload.difficulty,
            instrument: upload.instrument,
            genre: upload.genre,
          },
        });
      }

      // Update upload status
      await prisma.upload.update({
        where: { id: input.id },
        data: { status: input.status as UploadStatus },
      });

      return { success: true };
    }),
});
