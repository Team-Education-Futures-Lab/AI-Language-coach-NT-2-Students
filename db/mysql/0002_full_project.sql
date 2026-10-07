CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  kind VARCHAR(80) NOT NULL,
  skill VARCHAR(120) NOT NULL,
  xp INT NOT NULL,
  date VARCHAR(40) NOT NULL,
  detail TEXT NOT NULL,
  KEY idx_activities_user_date (user_id, date)
);

CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  title VARCHAR(200) NOT NULL,
  module VARCHAR(120) NOT NULL,
  body TEXT NOT NULL,
  status VARCHAR(30) NOT NULL,
  KEY idx_lessons_user (user_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  user_id VARCHAR(191) NOT NULL PRIMARY KEY,
  data JSON NOT NULL,
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS news (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  field VARCHAR(160) NOT NULL,
  title VARCHAR(500) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  source VARCHAR(200) NOT NULL,
  published_at VARCHAR(40) NOT NULL,
  selected_at VARCHAR(40) NOT NULL,
  week VARCHAR(20) NOT NULL,
  UNIQUE KEY idx_news_field_week (field, week)
);

CREATE TABLE IF NOT EXISTS exercise_work (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  exercise_id VARCHAR(191) NOT NULL,
  data JSON NOT NULL,
  completed TINYINT NOT NULL DEFAULT 0,
  updated_at VARCHAR(40) NOT NULL,
  KEY idx_exercise_work_user (user_id)
);

CREATE TABLE IF NOT EXISTS learning_state (
  user_id VARCHAR(191) NOT NULL PRIMARY KEY,
  plan JSON NULL,
  draft JSON NULL,
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS learning_entries (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  data JSON NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  KEY idx_learning_entries_user_date (user_id, updated_at)
);

CREATE TABLE IF NOT EXISTS learning_assessments (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  data JSON NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  KEY idx_learning_assessments_user_date (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS learning_evidence (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  data JSON NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  KEY idx_learning_evidence_user_date (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  display_name VARCHAR(160) NOT NULL,
  role ENUM('teacher_admin','student') NOT NULL DEFAULT 'student',
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  UNIQUE KEY idx_users_email (email)
);

CREATE TABLE IF NOT EXISTS classrooms (
  id CHAR(36) NOT NULL PRIMARY KEY,
  teacher_id VARCHAR(191) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  KEY idx_classrooms_teacher (teacher_id),
  CONSTRAINT fk_classrooms_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS classroom_members (
  classroom_id CHAR(36) NOT NULL,
  student_id VARCHAR(191) NOT NULL,
  joined_at DATETIME(3) NOT NULL,
  PRIMARY KEY (classroom_id, student_id),
  KEY idx_members_student (student_id),
  CONSTRAINT fk_members_classroom FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  CONSTRAINT fk_members_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);
