CREATE INDEX `idx_activities_user_date` ON `activities` (`user_id`,`date`);--> statement-breakpoint
CREATE INDEX `idx_lessons_user` ON `lessons` (`user_id`);