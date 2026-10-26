CREATE TABLE `dedication_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dedicationId` int NOT NULL,
	`reason` enum('harmful','abusive','inappropriate','other') NOT NULL,
	`details` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dedication_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dedications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(32) NOT NULL,
	`title` varchar(120),
	`message` text NOT NULL,
	`category` enum('lost','cherished','one-sided','obsession','unattainable') NOT NULL,
	`authorName` varchar(80),
	`recipientName` varchar(80),
	`anonymous` boolean NOT NULL DEFAULT true,
	`visibility` enum('public','private') NOT NULL DEFAULT 'private',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dedications_id` PRIMARY KEY(`id`),
	CONSTRAINT `dedications_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `dedication_reports` ADD CONSTRAINT `dedication_reports_dedicationId_dedications_id_fk` FOREIGN KEY (`dedicationId`) REFERENCES `dedications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dedication_reports_dedication_idx` ON `dedication_reports` (`dedicationId`);--> statement-breakpoint
CREATE INDEX `dedications_visibility_created_idx` ON `dedications` (`visibility`,`createdAt`);--> statement-breakpoint
CREATE INDEX `dedications_category_idx` ON `dedications` (`category`);