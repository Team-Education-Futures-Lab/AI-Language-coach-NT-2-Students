# AI Taalcoach — lokaal verder ontwikkelen

Deze map bevat de volledige broncode van de laatst gepubliceerde versie, inclusief coachpersonalisatie (vos, uil, kat en panda), spraak, vertaling, oefeningen, taalspellen, leerroute en niveau-inschatting.

Bronversie: `63afee6b08c298870e9fb2ca3002df7fa5d096f4` (7 oktober 2026).
De applicatiecode is gelijk aan die versie. Alleen deze handleiding en het commando `db:local` zijn toegevoegd voor zelfstandig lokaal werken.

## Starten in je IDE

Open deze hele map als project. Gebruik Node.js 24 (minimaal 22.13) en pnpm 11.25.0. De vastgelegde afhankelijkheden staan in `pnpm-lock.yaml`; gebruik pnpm voor installatie.

Voer vanuit de terminal van je IDE uit:

```sh
pnpm install --frozen-lockfile
pnpm db:local
pnpm dev
```

Als pnpm nog niet beschikbaar is, kun je dezelfde opdrachten uitvoeren met `npx --yes pnpm@11.25.0` in plaats van `pnpm`.

Open het lokale adres dat de terminal toont, normaal `http://127.0.0.1:5173`. Log eenmalig lokaal in via:

`http://127.0.0.1:5173/signin-with-chatgpt?return_to=/`

Dit gebruikt het ingebouwde lokale testaccount. Er is hiervoor geen ChatGPT-aanmelding of API-sleutel nodig. Stop de server met Ctrl+C.

`pnpm db:local` maakt een aparte lokale database en past de SQL-migraties toe. Je kunt dit commando opnieuw uitvoeren: al toegepaste migraties worden overgeslagen. Gegevens worden opgeslagen in `.wrangler/state` en blijven bewaard na herstart.

## Waar staat wat?

- `app/page.tsx`: hoofdschermen en navigatie.
- `app/globals.css`: vormgeving en thema's.
- `components/learning/`: coach, personalisatie, oefeningen, spraak, spellen, leerroute en taalatelier.
- `app/api/`: serverroutes en opslag.
- `lib/`: AI-aansturing, leerlogica, oefeningen en configuratie.
- `public/`: personages, iconen en luisteraudio.
- `db/` en `drizzle/`: databaseschema en alle migraties.
- `db/mysql/`: MySQL-schema voor het docent-, klas- en studentenbeheer.
- `tests/`: controles voor niveau-inschatting en coachpersonalisatie.
- `build/`, `scripts/` en `vite.config.ts`: lokale ontwikkelomgeving en Cloudflare Worker-build.
- `.openai/hosting.json`: koppeling met de bestaande Site; dit is geen geheime sleutel.

## AI en spraak

De huidige coach en AI-vertaling gebruiken WebLLM op je eigen apparaat. Klik in de app op **Start [coachnaam] zonder sleutel**. Het model wordt bij de eerste keer gedownload (ongeveer 2,5 GB). Gebruik een browser met WebGPU, zoals een recente Chrome of Edge. De modelbestanden horen niet bij de broncode en worden door de browser gecachet.

Spraakherkenning gebruikt een lokaal Whisper-model dat bij het eerste gebruik wordt geladen. Voorlezen gebruikt beschikbare browser-/systeemstemmen. De vaste luisteraudio staat al in `public/audio/`. Het spraakruntimebestand wordt automatisch voorbereid bij `pnpm dev` en `pnpm build`.

Er zijn ook optionele OpenAI-serverroutes aanwezig voor onder andere Realtime. Die vereisen afzonderlijke sleutelconfiguratie; ze zijn niet nodig voor de huidige lokale AI-coach. Er zijn geen API-sleutels of geheime tokens meegeleverd. De oudere `README.md` beschrijft de starter en een eerdere AI-inrichting; gebruik deze LEESMIJ als startpunt.

## Controles en build

```sh
pnpm exec tsc --noEmit
node tests/coach-preferences.test.mjs
node tests/assessment.test.mjs
pnpm build
```

Voor nieuwe schemawijzigingen: `pnpm db:generate`, daarna `pnpm db:local`. Verander eerder toegepaste migraties niet; voeg een nieuwe migratie toe.

## Rollen, klassen en MySQL

De applicatie kent twee rollen: `teacher_admin` (docentbeheer en lessenmaker) en `student` (alleen de leerlingomgeving). Studenten zien het onderdeel **Voor docenten** niet. Stel voor productie de docentaccounts in via de Sites/Wrangler-secret `TEACHER_ADMIN_EMAILS`, als komma-gescheiden e-mailadressen. Het lokale testaccount `seedy@sites.test` is automatisch docent-admin.

De aparte XAMPP/MariaDB-database `ai_taalcoach_project` is op de lokale MySQL-server aangemaakt. Dit is een volledige nieuwe projectdatabase met het bestaande projectschema en studentenbeheer. De oude databases `nt2_taalcoach` en `nt2_taalcoach_beheer` worden niet gebruikt. Voor opnieuw initialiseren op een andere MySQL-server:

```sh
npx --yes pnpm@11.25.0 add mysql2
MYSQL_URL='mysql://user:password@127.0.0.1:3306/ai_taalcoach_project' pnpm db:mysql
```

`db:mysql` maakt alle projecttabellen aan, waaronder `users`, `classrooms` en `classroom_members`. De lokale Cloudflare/Vinext-runtime gebruikt voor requests nog de D1-binding; de nieuwe MySQL-database is de zelfstandige projectdatabase voor de MySQL-hostingkoppeling.

## Lokaal en online

Dit is een zelfstandige kopie van de broncode. Live gebruikersgegevens, bestaande accounts, gesprekken en de online database zijn niet meegekopieerd. De lokale database begint leeg. Nieuwsartikelen kunnen daardoor lokaal nog ontbreken. De wekelijkse nieuwsautomatisering hoort bij de gehoste Site en is geen lokaal draaiende taak.

Lokale wijzigingen worden niet automatisch gepubliceerd. `pnpm build` bouwt alleen. Voor publiceren naar de bestaande Site is een aparte Sites-publicatiestap nodig. De meegeleverde productie-authenticatie verwacht Sites; voor een andere hostingprovider moet je zelf authenticatie en databasebindingen inrichten.

Dependencies (`node_modules`), tijdelijke builds, browsermodelcaches, geheime instellingen en de ontwikkelgeschiedenis zijn niet onderdeel van deze broncode-export. Installeer dependencies met de opdrachten hierboven. Je kunt zelf een Git-repository initialiseren en je eigen remote toevoegen.
