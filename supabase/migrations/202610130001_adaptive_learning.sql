CREATE TABLE IF NOT EXISTS ai_usage(scope text NOT NULL, day date NOT NULL, count integer NOT NULL DEFAULT 0, PRIMARY KEY(scope,day));
CREATE TABLE IF NOT EXISTS translation_cache(key text PRIMARY KEY, translations jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS student_levels(user_id text PRIMARY KEY, override_level text CHECK(override_level IN ('A1','A2','B1','B2','C1','C2')), teacher_id text, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS assignment_schedules(id text PRIMARY KEY,teacher_id text NOT NULL,classroom_id text NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE, title text NOT NULL,category text NOT NULL, instructions text NOT NULL DEFAULT '', interval_days integer NOT NULL CHECK(interval_days IN (1,2,7,14,21,30)), active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS generated_exercises(id text PRIMARY KEY,user_id text NOT NULL,schedule_id text NOT NULL,period_start timestamptz NOT NULL,due_at timestamptz NOT NULL,exercise jsonb,lease_until timestamptz,last_error text,UNIQUE(user_id,schedule_id,period_start));
CREATE INDEX IF NOT EXISTS generated_exercises_owner ON generated_exercises(user_id,due_at);
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY; REVOKE ALL ON ai_usage FROM anon, authenticated;
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY; REVOKE ALL ON translation_cache FROM anon, authenticated;
ALTER TABLE student_levels ENABLE ROW LEVEL SECURITY; REVOKE ALL ON student_levels FROM anon, authenticated;
ALTER TABLE assignment_schedules ENABLE ROW LEVEL SECURITY; REVOKE ALL ON assignment_schedules FROM anon, authenticated;
ALTER TABLE generated_exercises ENABLE ROW LEVEL SECURITY; REVOKE ALL ON generated_exercises FROM anon, authenticated;
-- Credential exists only in the database, never in the repository or browser.
CREATE TABLE IF NOT EXISTS scheduler_secret(id text PRIMARY KEY,secret text NOT NULL);
INSERT INTO scheduler_secret(id,secret) VALUES('assignments',gen_random_uuid()::text||gen_random_uuid()::text) ON CONFLICT DO NOTHING;
ALTER TABLE scheduler_secret ENABLE ROW LEVEL SECURITY; REVOKE ALL ON scheduler_secret FROM anon, authenticated;
