import { eq, desc, and, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, artists, tabs, uploads, favorites, ratings, comments, ads, playlists, playlistTabs, campaigns, analytics, InsertArtist, InsertTab, InsertUpload, InsertFavorite, InsertRating, InsertComment, InsertAd, InsertPlaylist, InsertPlaylistTab, InsertCampaign, InsertAnalytic } from "../drizzle/schema";
import { ENV } from './_core/env';

let dbInstance: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!dbInstance && process.env.DATABASE_URL) {
    try {
      dbInstance = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      dbInstance = null;
    }
  }
  return dbInstance;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createArtist(artist: InsertArtist): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create artist: database not available");
    return;
  }
  await db.insert(artists).values(artist);
}

export async function getArtistByName(name: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get artist: database not available");
    return undefined;
  }
  const result = await db.select().from(artists).where(eq(artists.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTab(tab: InsertTab): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create tab: database not available");
    return;
  }
  await db.insert(tabs).values(tab);
}

export async function createUpload(upload: InsertUpload): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create upload: database not available");
    return;
  }
  await db.insert(uploads).values(upload);
}

export async function addFavorite(favorite: InsertFavorite): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add favorite: database not available");
    return;
  }
  await db.insert(favorites).values(favorite);
}

export async function addRating(rating: InsertRating): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add rating: database not available");
    return;
  }
  await db.insert(ratings).values(rating);
}

export async function addComment(comment: InsertComment): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add comment: database not available");
    return;
  }
  await db.insert(comments).values(comment);
}

export async function createAd(ad: InsertAd): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create ad: database not available");
    return;
  }
  await db.insert(ads).values(ad);
}

export async function getAdByPosition(position: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get ad: database not available");
    return undefined;
  }
  const result = await db.select().from(ads).where(eq(ads.position, position)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPlaylist(playlist: InsertPlaylist): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create playlist: database not available");
    return;
  }
  await db.insert(playlists).values(playlist);
}

export async function getPlaylistsByUser(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get playlists: database not available");
    return [];
  }
  return await db.select().from(playlists).where(eq(playlists.userId, userId));
}

export async function addTabToPlaylist(playlistTab: InsertPlaylistTab): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add tab to playlist: database not available");
    return;
  }
  await db.insert(playlistTabs).values(playlistTab);
}

export async function createCampaign(campaign: InsertCampaign): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create campaign: database not available");
    return;
  }
  await db.insert(campaigns).values(campaign);
}

export async function trackAnalytic(analytic: InsertAnalytic): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot track analytic: database not available");
    return;
  }
  await db.insert(analytics).values(analytic);
}
