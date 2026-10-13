-- Capture the registration choice once; later user_metadata edits do not change roles.
CREATE TABLE IF NOT EXISTS public.account_registrations (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 account_type text NOT NULL CHECK(account_type IN ('student','teacher')),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.account_registrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_registrations FROM anon,authenticated;
CREATE OR REPLACE FUNCTION public.capture_account_registration() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 INSERT INTO public.account_registrations(user_id,account_type)
 VALUES(NEW.id,CASE WHEN NEW.raw_user_meta_data->>'account_type'='teacher' AND NOT COALESCE(NEW.is_anonymous,false) THEN 'teacher' ELSE 'student' END)
 ON CONFLICT DO NOTHING;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.capture_account_registration() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS capture_taalcoach_registration ON auth.users;
CREATE TRIGGER capture_taalcoach_registration AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION public.capture_account_registration();
-- Existing accounts keep their current role/allowlist; never promote from mutable metadata.
INSERT INTO public.account_registrations(user_id,account_type)
SELECT id,'student' FROM auth.users ON CONFLICT DO NOTHING;
ALTER TABLE public.classrooms ADD COLUMN IF NOT EXISTS cohort text NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS public.classroom_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 classroom_id text NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
 email text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '30 days',
 UNIQUE(classroom_id,email)
);
ALTER TABLE public.classroom_invitations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.classroom_invitations FROM anon,authenticated;
CREATE INDEX IF NOT EXISTS classroom_invitations_email_idx ON public.classroom_invitations(email);
