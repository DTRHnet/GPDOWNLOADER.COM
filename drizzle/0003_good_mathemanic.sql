CREATE TABLE `analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tabId` int,
	`adId` int,
	`campaignId` int,
	`eventType` enum('view','download','rate','comment','favorite','ad_impression','ad_click') NOT NULL,
	`userId` int,
	`sessionId` varchar(255),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`budget` int NOT NULL,
	`spent` int NOT NULL DEFAULT 0,
	`status` enum('active','paused','completed') NOT NULL DEFAULT 'active',
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlistTabs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`playlistId` int NOT NULL,
	`tabId` int NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `playlistTabs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublic` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `playlists_id` PRIMARY KEY(`id`)
);
