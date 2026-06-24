CREATE TABLE `ads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('banner','sidebar') NOT NULL,
	`position` varchar(255) NOT NULL,
	`title` varchar(255),
	`content` text,
	`imageUrl` varchar(255),
	`linkUrl` varchar(255),
	`script` text,
	`isActive` int NOT NULL DEFAULT 1,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`revenue` int NOT NULL DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `artists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `artists_id` PRIMARY KEY(`id`),
	CONSTRAINT `artists_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tabId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tabId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tabId` int NOT NULL,
	`value` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ratings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tabs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`artistId` int NOT NULL,
	`uploaderId` int NOT NULL,
	`s3Key` varchar(255) NOT NULL,
	`s3Bucket` varchar(255) NOT NULL DEFAULT 'gpdownloader-tabs',
	`fileSize` int NOT NULL,
	`contentType` varchar(255) NOT NULL DEFAULT 'application/x-guitar-pro',
	`version` int NOT NULL DEFAULT 1,
	`difficulty` enum('beginner','intermediate','advanced','expert'),
	`instrument` varchar(255),
	`genre` varchar(255),
	`downloadCount` int NOT NULL DEFAULT 0,
	`averageRating` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tabs_id` PRIMARY KEY(`id`),
	CONSTRAINT `tabs_s3Key_unique` UNIQUE(`s3Key`)
);
--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uploaderId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`s3Key` varchar(255) NOT NULL,
	`s3Bucket` varchar(255) NOT NULL DEFAULT 'gpdownloader-tabs',
	`fileSize` int NOT NULL,
	`contentType` varchar(255) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`title` varchar(255),
	`artistName` varchar(255),
	`instrument` varchar(255),
	`genre` varchar(255),
	`difficulty` enum('beginner','intermediate','advanced','expert'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_tabId_tabs_id_fk` FOREIGN KEY (`tabId`) REFERENCES `tabs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_tabId_tabs_id_fk` FOREIGN KEY (`tabId`) REFERENCES `tabs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ratings` ADD CONSTRAINT `ratings_tabId_tabs_id_fk` FOREIGN KEY (`tabId`) REFERENCES `tabs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tabs` ADD CONSTRAINT `tabs_artistId_artists_id_fk` FOREIGN KEY (`artistId`) REFERENCES `artists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tabs` ADD CONSTRAINT `tabs_uploaderId_users_id_fk` FOREIGN KEY (`uploaderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_uploaderId_users_id_fk` FOREIGN KEY (`uploaderId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;