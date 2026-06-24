import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const artists = mysqlTable("artists", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Artist = typeof artists.$inferSelect;
export type InsertArtist = typeof artists.$inferInsert;

export const tabs = mysqlTable("tabs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artistId: int("artistId").notNull(),
  uploaderId: int("uploaderId").notNull(),
  s3Key: varchar("s3Key", { length: 255 }).notNull().unique(),
  s3Bucket: varchar("s3Bucket", { length: 255 }).default("gpdownloader-tabs").notNull(),
  fileSize: int("fileSize").notNull(), // Size in bytes
  contentType: varchar("contentType", { length: 255 }).default("application/x-guitar-pro").notNull(),
  version: int("version").default(1).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced", "expert"]), 
  instrument: varchar("instrument", { length: 255 }),
  genre: varchar("genre", { length: 255 }),
  downloadCount: int("downloadCount").default(0).notNull(),
  averageRating: int("averageRating").default(0).notNull(), // Storing as int to avoid float issues, will be 0-500 for 0.00-5.00
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tab = typeof tabs.$inferSelect;
export type InsertTab = typeof tabs.$inferInsert;

export const uploads = mysqlTable("uploads", {
  id: int("id").autoincrement().primaryKey(),
  uploaderId: int("uploaderId").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  s3Key: varchar("s3Key", { length: 255 }).notNull(),
  s3Bucket: varchar("s3Bucket", { length: 255 }).default("gpdownloader-tabs").notNull(),
  fileSize: int("fileSize").notNull(),
  contentType: varchar("contentType", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  title: varchar("title", { length: 255 }),
  artistName: varchar("artistName", { length: 255 }),
  instrument: varchar("instrument", { length: 255 }),
  genre: varchar("genre", { length: 255 }),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced", "expert"]), 
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = typeof uploads.$inferInsert;

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tabId: int("tabId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tabId: int("tabId").notNull(),
  value: int("value").notNull(), // 1-5
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tabId: int("tabId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const ads = mysqlTable("ads", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["banner", "sidebar"]).notNull(),
  position: varchar("position", { length: 255 }).notNull(), // e.g., "homepage-top", "tab-detail-sidebar"
  title: varchar("title", { length: 255 }),
  content: text("content"),
  imageUrl: varchar("imageUrl", { length: 255 }),
  linkUrl: varchar("linkUrl", { length: 255 }),
  script: text("script"), // For custom ad scripts
  isActive: int("isActive").default(1).notNull(), // 1 for true, 0 for false
  impressions: int("impressions").default(0).notNull(),
  clicks: int("clicks").default(0).notNull(),
  revenue: int("revenue").default(0).notNull(), // Storing as int to avoid float issues, will be in cents
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ad = typeof ads.$inferSelect;
export type InsertAd = typeof ads.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tabs: many(tabs),
  uploads: many(uploads),
  favorites: many(favorites),
  ratings: many(ratings),
  comments: many(comments),
}));

export const artistsRelations = relations(artists, ({ many }) => ({
  tabs: many(tabs),
}));

export const tabsRelations = relations(tabs, ({ one, many }) => ({
  artist: one(artists, { fields: [tabs.artistId], references: [artists.id] }),
  uploader: one(users, { fields: [tabs.uploaderId], references: [users.id] }),
  favorites: many(favorites),
  ratings: many(ratings),
  comments: many(comments),
}));

export const uploadsRelations = relations(uploads, ({ one }) => ({
  uploader: one(users, { fields: [uploads.uploaderId], references: [users.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  tab: one(tabs, { fields: [favorites.tabId], references: [tabs.id] }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, { fields: [ratings.userId], references: [users.id] }),
  tab: one(tabs, { fields: [ratings.tabId], references: [tabs.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  tab: one(tabs, { fields: [comments.tabId], references: [tabs.id] }),
}));

export const playlists = mysqlTable("playlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: int("isPublic").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

export const playlistTabs = mysqlTable("playlistTabs", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlistId").notNull(),
  tabId: int("tabId").notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type PlaylistTab = typeof playlistTabs.$inferSelect;
export type InsertPlaylistTab = typeof playlistTabs.$inferInsert;

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  budget: int("budget").notNull(),
  spent: int("spent").default(0).notNull(),
  status: mysqlEnum("status", ["active", "paused", "completed"]).default("active").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  tabId: int("tabId"),
  adId: int("adId"),
  campaignId: int("campaignId"),
  eventType: mysqlEnum("eventType", ["view", "download", "rate", "comment", "favorite", "ad_impression", "ad_click"]).notNull(),
  userId: int("userId"),
  sessionId: varchar("sessionId", { length: 255 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Analytic = typeof analytics.$inferSelect;
export type InsertAnalytic = typeof analytics.$inferInsert;

export const playlistsRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, { fields: [playlists.userId], references: [users.id] }),
  tabs: many(playlistTabs),
}));

export const playlistTabsRelations = relations(playlistTabs, ({ one }) => ({
  playlist: one(playlists, { fields: [playlistTabs.playlistId], references: [playlists.id] }),
  tab: one(tabs, { fields: [playlistTabs.tabId], references: [tabs.id] }),
}));
