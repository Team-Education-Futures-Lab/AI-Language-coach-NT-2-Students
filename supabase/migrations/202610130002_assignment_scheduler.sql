CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
SELECT cron.schedule('taalcoach-personal-assignments','*/10 * * * *',
$$SELECT net.http_post(
 url:='https://ai-taalcoach-demo.vercel.app/api/cron/assignments',
 headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(SELECT secret FROM public.scheduler_secret WHERE id='assignments')),
 body:='{}'::jsonb,
 timeout_milliseconds:=55000
);$$);
