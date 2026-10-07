CREATE TABLE `learning_assessments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_learning_assessments_user_date` ON `learning_assessments` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `learning_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_learning_entries_user_date` ON `learning_entries` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `learning_evidence` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_learning_evidence_user_date` ON `learning_evidence` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `learning_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`plan` text,
	`draft` text,
	`updated_at` text NOT NULL
);
