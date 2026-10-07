CREATE TABLE `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `display_name` text NOT NULL,
  `role` text DEFAULT 'student' NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);
--> statement-breakpoint
CREATE TABLE `classrooms` (
  `id` text PRIMARY KEY NOT NULL,
  `teacher_id` text NOT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_classrooms_teacher` ON `classrooms` (`teacher_id`);
--> statement-breakpoint
CREATE TABLE `classroom_members` (
  `classroom_id` text NOT NULL,
  `student_id` text NOT NULL,
  `joined_at` text NOT NULL,
  PRIMARY KEY(`classroom_id`, `student_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_members_student` ON `classroom_members` (`student_id`);
