-- Additive migration for existing MySQL/MariaDB installations.
-- Apply once; existing lessons and exercises are preserved.
CREATE TABLE `LessonModule` (
  `id` VARCHAR(191) NOT NULL,
  `createdById` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `sector` VARCHAR(64) NOT NULL,
  `languageLevel` VARCHAR(8) NOT NULL,
  `instructions` TEXT NOT NULL,
  `exerciseCount` INTEGER NOT NULL DEFAULT 4,
  `cadence` VARCHAR(16) NOT NULL DEFAULT 'WEEKLY',
  `enabled` BOOLEAN NOT NULL DEFAULT false,
  `scheduleAnchor` DATETIME(3) NULL,
  `nextRunAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `LessonModule_createdById_idx` (`createdById`),
  INDEX `LessonModule_enabled_nextRunAt_idx` (`enabled`, `nextRunAt`),
  CONSTRAINT `LessonModule_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Lesson` ADD COLUMN `moduleId` VARCHAR(191) NULL;
CREATE INDEX `Lesson_moduleId_order_idx` ON `Lesson` (`moduleId`, `order`);
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `LessonModule` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `LessonGeneration` (
  `id` VARCHAR(191) NOT NULL,
  `moduleId` VARCHAR(191) NOT NULL,
  `scheduleKey` VARCHAR(191) NULL,
  `topic` VARCHAR(255) NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  `attempts` INTEGER NOT NULL DEFAULT 0,
  `claimToken` VARCHAR(64) NULL,
  `lockedUntil` DATETIME(3) NULL,
  `availableAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `error` TEXT NULL,
  `lessonId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `LessonGeneration_scheduleKey_key` (`scheduleKey`),
  UNIQUE INDEX `LessonGeneration_lessonId_key` (`lessonId`),
  INDEX `LessonGeneration_status_availableAt_idx` (`status`, `availableAt`),
  CONSTRAINT `LessonGeneration_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `LessonModule` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `LessonGeneration_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `LessonWorker` (
  `id` VARCHAR(64) NOT NULL,
  `heartbeatAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
