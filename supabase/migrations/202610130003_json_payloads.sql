-- Repair JSON text serialized twice by PostgreSQL parameter type inference.
UPDATE translation_cache SET translations=(translations#>>'{}')::jsonb WHERE jsonb_typeof(translations)='string';
UPDATE generated_exercises SET exercise=(exercise#>>'{}')::jsonb WHERE jsonb_typeof(exercise)='string';
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='translation_cache_array') THEN
  ALTER TABLE translation_cache ADD CONSTRAINT translation_cache_array CHECK(jsonb_typeof(translations)='array');
 END IF;
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='generated_exercise_object') THEN
  ALTER TABLE generated_exercises ADD CONSTRAINT generated_exercise_object CHECK(exercise IS NULL OR jsonb_typeof(exercise)='object');
 END IF;
END $$;
