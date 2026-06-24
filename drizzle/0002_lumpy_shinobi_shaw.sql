ALTER TABLE `comments` DROP FOREIGN KEY `comments_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `comments` DROP FOREIGN KEY `comments_tabId_tabs_id_fk`;
--> statement-breakpoint
ALTER TABLE `favorites` DROP FOREIGN KEY `favorites_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `favorites` DROP FOREIGN KEY `favorites_tabId_tabs_id_fk`;
--> statement-breakpoint
ALTER TABLE `ratings` DROP FOREIGN KEY `ratings_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `ratings` DROP FOREIGN KEY `ratings_tabId_tabs_id_fk`;
--> statement-breakpoint
ALTER TABLE `tabs` DROP FOREIGN KEY `tabs_artistId_artists_id_fk`;
--> statement-breakpoint
ALTER TABLE `tabs` DROP FOREIGN KEY `tabs_uploaderId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `uploads` DROP FOREIGN KEY `uploads_uploaderId_users_id_fk`;
