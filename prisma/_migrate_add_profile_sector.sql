ALTER TABLE Profile
  ADD COLUMN IF NOT EXISTS sector VARCHAR(64) NULL AFTER nativeLanguage,
  ADD COLUMN IF NOT EXISTS uiLocale VARCHAR(8) NULL AFTER sector;

SET @idx1_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Profile' AND INDEX_NAME = 'profile_sector_idx');
SET @idx1_sql = IF(@idx1_exists = 0,
  'ALTER TABLE Profile ADD INDEX profile_sector_idx (sector)',
  'SELECT 1');
PREPARE stmt1 FROM @idx1_sql; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

SET @idx2_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Profile' AND INDEX_NAME = 'profile_ui_locale_idx');
SET @idx2_sql = IF(@idx2_exists = 0,
  'ALTER TABLE Profile ADD INDEX profile_ui_locale_idx (uiLocale)',
  'SELECT 1');
PREPARE stmt2 FROM @idx2_sql; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;
