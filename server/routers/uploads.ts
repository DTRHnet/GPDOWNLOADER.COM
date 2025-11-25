import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { prisma } from '@/lib/db';
import { getPresignedUploadUrl, BUCKET_NAME } from '@/lib/s3';
import { uploadRateLimit } from '../utils/rate-limit';
import { TRPCError } from '@trpc/server';
import { UploadStatus, Difficulty } from '@prisma/client';

const uploadInitSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().default('application/x-guitar-pro'),
  sizeBytes: z.number().int().positive().max(50 * 1024 * 1024), // 50MB max
  title: z.string().optional(),
  artistName: z.string().optional(),
  instrument: z.string().optional(),
  genre: z.string().optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
});

export const uploadsRouter = router({
  initiate: protectedProcedure.input(uploadInitSchema).mutation(async ({ input, ctx }) => {
    // Rate limiting
    const identifier = ctx.session.user.id;
    const { success } = await uploadRateLimit.limit(identifier);

    if (!success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Upload limit exceeded. Please try again later.',
      });
    }

    // Generate S3 key
    const timestamp = Date.now();
    const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const s3Key = `uploads/${ctx.session.user.id}/${timestamp}-${sanitizedFilename}`;

    // Create upload record
    const upload = await prisma.upload.create({
      data: {
        userId: ctx.session.user.id,
        filename: input.filename,
        s3Key,
        s3Bucket: BUCKET_NAME,
        fileSize: input.sizeBytes,
        contentType: input.contentType,
        status: UploadStatus.PENDING,
        title: input.title,
        artistName: input.artistName,
        instrument: input.instrument,
        genre: input.genre,
        difficulty: input.difficulty as Difficulty | undefined,
      },
    });

    // Generate presigned URL (1 hour expiry)
    const url = await getPresignedUploadUrl(s3Key, input.contentType, 3600);

    return {
      uploadId: upload.id,
      key: s3Key,
      url,
    };
  }),

  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
        status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, status } = input;
      const skip = (page - 1) * limit;

      const where: any = { userId: ctx.session.user.id };
      if (status) {
        where.status = status;
      }

      const [uploads, total] = await Promise.all([
        prisma.upload.findMany({
          where,
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
});
