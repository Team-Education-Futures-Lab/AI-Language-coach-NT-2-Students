DROP INDEX `idx_news_field_week`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_news_field_week` ON `news` (`field`,`week`);