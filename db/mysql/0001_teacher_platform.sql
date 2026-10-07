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
