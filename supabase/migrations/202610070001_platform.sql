CREATE TABLE IF NOT EXISTS activities (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	kind text NOT NULL,
	skill text NOT NULL,
	xp integer NOT NULL,
	date text NOT NULL,
	detail text NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	title text NOT NULL,
	module text NOT NULL,
	body text NOT NULL,
	status text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities (user_id,date);
CREATE INDEX IF NOT EXISTS idx_lessons_user ON lessons (user_id);
CREATE TABLE IF NOT EXISTS news (
	id text PRIMARY KEY NOT NULL,
	field text NOT NULL,
	title text NOT NULL,
	url text NOT NULL,
	source text NOT NULL,
	published_at text NOT NULL,
	selected_at text NOT NULL,
	week text NOT NULL
);


CREATE TABLE IF NOT EXISTS profiles (
	user_id text PRIMARY KEY NOT NULL,
	data text NOT NULL,
	updated_at text NOT NULL
);


CREATE UNIQUE INDEX IF NOT EXISTS idx_news_field_week ON news (field,week);
CREATE TABLE IF NOT EXISTS exercise_work (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	exercise_id text NOT NULL,
	data text NOT NULL,
	completed integer DEFAULT 0 NOT NULL,
	updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exercise_work_user ON exercise_work (user_id);
CREATE TABLE IF NOT EXISTS learning_assessments (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	data text NOT NULL,
	created_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_assessments_user_date ON learning_assessments (user_id,created_at);
CREATE TABLE IF NOT EXISTS learning_entries (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	data text NOT NULL,
	updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_entries_user_date ON learning_entries (user_id,updated_at);
CREATE TABLE IF NOT EXISTS learning_evidence (
	id text PRIMARY KEY NOT NULL,
	user_id text NOT NULL,
	data text NOT NULL,
	created_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_learning_evidence_user_date ON learning_evidence (user_id,created_at);
CREATE TABLE IF NOT EXISTS learning_state (
	user_id text PRIMARY KEY NOT NULL,
	plan text,
	draft text,
	updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL,
  display_name text NOT NULL,
  role text DEFAULT 'student' NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE TABLE IF NOT EXISTS classrooms (
  id text PRIMARY KEY NOT NULL,
  teacher_id text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '' NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_classrooms_teacher ON classrooms (teacher_id);

CREATE TABLE IF NOT EXISTS classroom_members (
  classroom_id text NOT NULL,
  student_id text NOT NULL,
  joined_at text NOT NULL,
  PRIMARY KEY(classroom_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_members_student ON classroom_members (student_id);

-- Access is exclusively through authenticated Next.js handlers.
-- No application data is exposed by the public Supabase REST API.
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.activities FROM anon, authenticated;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lessons FROM anon, authenticated;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles FROM anon, authenticated;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.news FROM anon, authenticated;
ALTER TABLE public.exercise_work ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.exercise_work FROM anon, authenticated;
ALTER TABLE public.learning_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_state FROM anon, authenticated;
ALTER TABLE public.learning_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_entries FROM anon, authenticated;
ALTER TABLE public.learning_assessments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_assessments FROM anon, authenticated;
ALTER TABLE public.learning_evidence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.learning_evidence FROM anon, authenticated;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.users FROM anon, authenticated;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.classrooms FROM anon, authenticated;
ALTER TABLE public.classroom_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.classroom_members FROM anon, authenticated;
