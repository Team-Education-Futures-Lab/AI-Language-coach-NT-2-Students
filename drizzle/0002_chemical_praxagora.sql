CREATE TABLE `news` (
	`id` text PRIMARY KEY NOT NULL,
	`field` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`source` text NOT NULL,
	`published_at` text NOT NULL,
	`selected_at` text NOT NULL,
	`week` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_news_field_week` ON `news` (`field`,`week`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);
