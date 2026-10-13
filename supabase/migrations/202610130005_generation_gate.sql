CREATE TABLE IF NOT EXISTS ai_generation_gates (
 scope text PRIMARY KEY,
 next_at timestamptz NOT NULL
);
ALTER TABLE ai_generation_gates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ai_generation_gates FROM anon,authenticated;
