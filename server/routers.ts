import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { eq, desc, and, like } from "drizzle-orm";
import { tabs, artists, users, favorites, ratings, comments, uploads, ads } from "../drizzle/schema";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new Error('FORBIDDEN');
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tabs: router({
    list: publicProcedure
      .input(z.object({
        query: z.string().optional(),
        genre: z.string().optional(),
        instrument: z.string().optional(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const whereClause = [];

        if (input.query) {
          whereClause.push(like(tabs.title, `%${input.query}%`));
        }
        if (input.genre) {
          whereClause.push(eq(tabs.genre, input.genre));
        }
        if (input.instrument) {
          whereClause.push(eq(tabs.instrument, input.instrument));
        }
        if (input.difficulty) {
          whereClause.push(eq(tabs.difficulty, input.difficulty));
        }

        const result = await db.select().from(tabs)
          .where(and(...whereClause))
          .orderBy(desc(tabs.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        return result;
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(tabs).where(eq(tabs.id, input.id)).limit(1);
        return result[0];
      }),
  }),

  artists: router({
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(artists).where(eq(artists.id, input.id)).limit(1);
        return result[0];
      }),
    tabsByArtist: publicProcedure
      .input(z.object({
        artistId: z.number(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(tabs)
          .where(eq(tabs.artistId, input.artistId))
          .orderBy(desc(tabs.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        return result;
      }),
  }),

  users: router({
    me: protectedProcedure.query(opts => opts.ctx.user),
    uploadedTabs: protectedProcedure
      .input(z.object({
        userId: z.number(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(tabs)
          .where(eq(tabs.uploaderId, input.userId))
          .orderBy(desc(tabs.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        return result;
      }),
    favoritedTabs: protectedProcedure
      .input(z.object({
        userId: z.number(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(favorites)
          .where(eq(favorites.userId, input.userId))
          .orderBy(desc(favorites.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        return result;
      }),
  }),

  uploads: router({
    create: protectedProcedure
      .input(z.object({
        filename: z.string(),
        s3Key: z.string(),
        s3Bucket: z.string().default('gpdownloader-tabs'),
        fileSize: z.number(),
        contentType: z.string(),
        title: z.string().optional(),
        artistName: z.string().optional(),
        instrument: z.string().optional(),
        genre: z.string().optional(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const newUpload = await db.insert(uploads).values({
          ...input,
          uploaderId: ctx.user.id,
          status: 'pending',
        });
        return newUpload;
      }),
  }),

  favorites: router({
    add: protectedProcedure
      .input(z.object({ tabId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const newFavorite = await db.insert(favorites).values({
          userId: ctx.user.id,
          tabId: input.tabId,
        });
        return newFavorite;
      }),
    remove: protectedProcedure
      .input(z.object({ tabId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(favorites).where(and(eq(favorites.userId, ctx.user.id), eq(favorites.tabId, input.tabId)));
        return { success: true };
      }),
  }),

  ratings: router({
    submit: protectedProcedure
      .input(z.object({ tabId: z.number(), value: z.number().min(1).max(5) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const newRating = await db.insert(ratings).values({
          userId: ctx.user.id,
          tabId: input.tabId,
          value: input.value,
        }).onDuplicateKeyUpdate({
          set: { value: input.value, updatedAt: new Date() },
        });
        // TODO: Update averageRating on tabs table
        return newRating;
      }),
  }),

  comments: router({
    add: protectedProcedure
      .input(z.object({ tabId: z.number(), content: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const newComment = await db.insert(comments).values({
          userId: ctx.user.id,
          tabId: input.tabId,
          content: input.content,
        });
        return newComment;
      }),
    listByTab: publicProcedure
      .input(z.object({ tabId: z.number(), limit: z.number().min(1).max(100).default(20), offset: z.number().min(0).default(0) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(comments)
          .where(eq(comments.tabId, input.tabId))
          .orderBy(desc(comments.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        return result;
      }),
  }),

  admin: router({
    pendingUploads: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(20), offset: z.number().min(0).default(0) }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(uploads)
          .where(eq(uploads.status, 'pending'))
          .orderBy(desc(uploads.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        return result;
      }),
    approveUpload: adminProcedure
      .input(z.object({ uploadId: z.number(), tabDetails: z.object({
        title: z.string(),
        artistId: z.number(),
        uploaderId: z.number(),
        s3Key: z.string(),
        s3Bucket: z.string(),
        fileSize: z.number(),
        contentType: z.string(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
        instrument: z.string().optional(),
        genre: z.string().optional(),
      }) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.transaction(async (tx: any) => {
          await tx.update(uploads).set({ status: 'approved', updatedAt: new Date() }).where(eq(uploads.id, input.uploadId));
          await tx.insert(tabs).values(input.tabDetails);
        });
        return { success: true };
      }),
    rejectUpload: adminProcedure
      .input(z.object({ uploadId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(uploads).set({ status: 'rejected', updatedAt: new Date() }).where(eq(uploads.id, input.uploadId));
        return { success: true };
      }),
  }),

  ads: router({
    getPlacements: publicProcedure
      .input(z.object({ position: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db.select().from(ads)
          .where(and(eq(ads.position, input.position), eq(ads.isActive, 1)))
          .limit(1);
        return result[0];
      }),
  }),
});

export type AppRouter = typeof appRouter;
