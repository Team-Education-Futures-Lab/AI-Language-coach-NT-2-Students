# AI Taalcoach — gratis online demo

NT2-leeromgeving met vaste oefeningen, taalspellen, een persoonlijke leerroute, coachpersonages en lokale AI. Deze branch draait op **Next.js 16 + Vercel + Supabase PostgreSQL/Auth**.

## Lokaal starten

1. Installeer Node.js 24 en voer `npm ci --include=optional` uit.
2. Kopieer `.env.example` naar `.env.local` en vul de Supabase-projectgegevens in. Bewaar secrets nooit in Git.
3. Voer `npm run db:supabase` uit om het schema aan te maken.
4. Start met `npm run dev -- --hostname 127.0.0.1 --port 5180`.

`npm run build` maakt de productiebuild. `npm start` start die build.

## Supabase Free

Maak een afzonderlijk gratis project voor deze demo. Gebruik geen database met echte leerlinggegevens als testdatabase.

- Database: neem de **Transaction pooler**-URL met poort 6543 over als `DATABASE_URL`; laat het wachtwoord uit de URL en zet het ongewijzigd in de afzonderlijke geheime variabele `DATABASE_PASSWORD`.
- API: `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` komen uit de projectinstellingen. Deze twee waarden mogen in de browser; het databasewachtwoord nooit.
- Voer `supabase/migrations/202610070001_platform.sql` uit via de SQL-editor of `npm run db:supabase`.
- Auth: laat e-mail/wachtwoord en e-mailbevestiging ingeschakeld. Stel de Site URL in op de Vercel-demo-URL en voeg exact `https://DEMO_HOST/auth/callback` toe aan Redirect URLs.
- Optioneel: schakel Anonymous Sign-Ins in en zet `NEXT_PUBLIC_ENABLE_DEMO_AUTH=true` voor een gastdemo met een afzonderlijke Supabase-identiteit per bezoeker. De gast verliest toegang tot zijn voortgang na uitloggen; gebruik fictieve gegevens. Zet voor een bredere publieke uitrol CAPTCHA en passende rate limits aan.
- Docenten: voeg alleen door de eigenaar aangewezen, bevestigde e-mailadressen toe aan `TEACHER_ADMIN_EMAILS` (komma-gescheiden). Aanmelden als gast geeft nooit docentrechten.

De app-tabellen hebben Row Level Security en zijn afgesloten voor de publieke `anon`/`authenticated` REST-rollen. Alleen de Next.js-server benadert ze, na verificatie van de Supabase-gebruiker. De databaseverbinding gebruikt TLS en transaction pooling zonder prepared statements. De browser kan geen docentrol toekennen via metadata of headers.

## Vercel Hobby

Importeer dit project, kies Next.js en **Hobby**, en gebruik Node.js 24. `vercel.json` legt `npm ci` en de build vast. Voeg dezelfde vier/vijf omgevingsvariabelen uit `.env.example` toe aan Preview en Production. De publishable key en project-URL zijn build-time instellingen: wijziging vereist een nieuwe deployment.

Hobby is alleen bedoeld voor persoonlijke, niet-commerciële projecten. Bij gebruik door een organisatie of voor een commerciële dienst moet eerst de geschiktheid worden beoordeeld; activeer niet automatisch Pro. De gratis abonnementen hebben quota. Supabase Free kan na een week inactiviteit pauzeren; hervatten gaat via het dashboard. Deze demo gebruikt geen betaalde AI-API en er is geen betaalde trial nodig.

## AI en spraak

De AI en vertaling gebruiken WebLLM in de browser. De gebruiker start zelf de eenmalige download (ongeveer 2,5 GB). Dit vraagt WebGPU, voldoende geheugen en een geschikte Chrome/Edge-browser. Gewone oefeningen en vaste hints werken zonder model. Spraakherkenning gebruikt de bestaande lokale Whisper-worker; voorlezen gebruikt beschikbare apparaatstemmen. De oude OpenAI-serverroutes zijn in deze gratis configuratie uitgeschakeld en kunnen geen kosten maken.

## Verschillen met de oorspronkelijke repository

De oorspronkelijke MySQL-scripts maakten tabellen aan, maar de app las en schreef nog naar Cloudflare D1. Deze versie gebruikt daadwerkelijk PostgreSQL voor alle actieve opslagroutes. De D1/MySQL-schema's en Sites-bestanden zijn alleen historische referentie; publicatie gaat via Vercel. Oude `oai-authenticated-user-*`-headers en lokale testlogin worden niet vertrouwd. Een Supabase-sessie vervangt de Sites-inlogfunctie.

Er worden geen bestaande lokale leerlingrecords automatisch geüpload. Deze demo begint met een lege database. Een eventuele latere datamigratie vereist een export en een gecontroleerde koppeling van oude gebruikers aan nieuwe Supabase-identiteiten.

## Controle

- `npm run build`: typecheck en Next.js-productiebuild.
- `node --test tests/postgres-migration.test.mjs`: PostgreSQL-schema, RLS, profiel/coachbehoud, idempotente XP en bescherming van les-eigenaarschap (PGlite).
- Online: controleer aanmelden, profiel opslaan, een oefening afronden, uitloggen en opnieuw aanmelden. Gebruik twee testaccounts om scheiding van gegevens te controleren.
