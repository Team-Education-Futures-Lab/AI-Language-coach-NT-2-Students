# AI-lesbouwer en modules

## Voor docenten
Open **Lesbouwer** in de navigatie of ga naar `/lesson-builder`.

1. Maak een module met titel, beschrijving, vakgebied, taalniveau en leerdoelen.
2. Kies **Zelf schrijven** om een les in de bestaande editor te maken.
   Je kunt daar ook bestaande lessen aan een module koppelen en de volgorde instellen.
3. Of kies **Laat AI een concept maken**, met eventueel een specifiek onderwerp.
   De achtergrondwerker maakt uitleg, voorbeeldzinnen, leerdoelen en 2-6
   meerkeuzeoefeningen. Deze oefenvorm is direct speelbaar voor studenten.
4. Open het concept via **Bewerken**. Controleer taal, uitleg en juiste antwoorden;
   AI kan inhoudelijke fouten maken. Pas de les aan en publiceer daarna zelf.
5. Kies onder **Automatisch nieuwe lessen** wekelijks of maandelijks en een
   eerste moment. Met **Pauzeren** stop je toekomstige taken. Reeds ingeplande
   of lopende taken annuleer je afzonderlijk bij **Recente AI-taken**.

Studenten zien uitsluitend gepubliceerde lessen, gegroepeerd per module.
Concepten zijn ook via directe les- en oefeninglinks afgeschermd. Docenten
beheren hun eigen modules en lessen; admins kunnen alles beheren.

## Achtergrondwerker

De planning is onderdeel van de applicatie en wordt in MySQL bewaard.
Geen browser-tab of externe assistentagenda is nodig.

```sh
npm run lessons:worker
```

De werker laadt `.env.local`, controleert iedere 15 seconden op taken en maakt
maximaal een les tegelijk per proces. Het scherm toont een heartbeat-status.
De site zelf start deze werker niet. Gebruik in productie een procesbeheerder
zoals systemd, launchd of een container met herstartbeleid.

Voor een periodieke systeemtaak is ook een eenmalige cyclus beschikbaar:

```sh
npm run lessons:worker -- --once
```

MySQL, Ollama en de werker moeten beschikbaar zijn. Op een slapende of
uitgeschakelde laptop ontstaan geen lessen. Na hervatten wordt per module
maximaal een gemist moment ingehaald; de volgende datum ligt in de toekomst.
De planning gebruikt een vaste UTC-tijd. Rond zomer-/wintertijd kan de
weergegeven lokale tijd dus een uur verschuiven. Maandelijkse planning op
de 31e gebruikt in korte maanden de laatste dag en keert daarna terug naar
de 31e. De gekozen startdatum blijft het anker.

`LESSON_MODEL` kiest het model, met `COACH_MODEL` en `llama3.1:8b` als fallback.
Het model krijgt maximaal 120 seconden per poging. Dit staat los van de
korte timeouts voor spraakcoaching. Volledige lessen vragen meer rekentijd
en kunnen bij gelijktijdig gebruik met de spraakcoach om capaciteit concurreren.

## Betrouwbaarheid

- AI-lessen blijven altijd concept; publiceren is een docentactie.
- JSON-schema en Zod controleren structuur, aantal vragen en antwoordopties.
- Ongeldige AI-uitvoer wordt niet vervangen door ongemelde voorbeeldlessen.
- Mislukte taken worden maximaal drie keer geprobeerd, met vijf minuten
  tussen pogingen. Daarna kan de docent een nieuwe taak starten.
- Databaseclaims en een unieke sleutel per planningsmoment voorkomen
  dubbel werk bij concurrerende workers.
- Een verlopen claim wordt na vijf minuten overgenomen. Een oude worker mag
  daarna niet meer opslaan. Annuleren maakt de claim eveneens ongeldig.
- Opslag van les, oefeningen en afgeronde taak gebeurt in een transactie.
- Docentrechten worden zowel bij plannen als bij genereren/opslag gecontroleerd.
- Wijzigingen in module-instellingen gelden voor taken die nog niet begonnen zijn.
- Recente taken (maximaal acht) verschijnen in de interface; de database
  bewaart de overige taakgeschiedenis. Retentiebeheer is nog niet toegevoegd.

## Database

Nieuwe modellen: `LessonModule`, `LessonGeneration`, `LessonWorker`.
`Lesson.moduleId` is optioneel, zodat bestaande losse lessen blijven werken.

Voor bestaande XAMPP-installaties staat een eenmalige, toevoegende migratie in
`prisma/_migrate_lesson_modules.sql`. Laad eerst `DATABASE_URL` en maak bij
een productie-installatie een databaseback-up. Voer dit bestand niet opnieuw
uit nadat de tabellen al bestaan.

```sh
npx prisma db execute --file prisma/_migrate_lesson_modules.sql --schema prisma/schema.prisma
npx prisma generate
```

De lokale database is bijgewerkt. Prisma-introspectie blijft daar geblokkeerd
door het bestaande `mysql.proc`-probleem; de gerichte migratie werkt wel.

## Tests

```sh
npm run test:lesson-builder
npx tsc --noEmit
```

De test gebruikt een lokale mock-AI en de geconfigureerde database, maakt een
tijdelijke docent en module aan en ruimt deze op. Tests dekken week/maandgrenzen,
schrikkeljaar, gemiste momenten, dubbele workers, conceptopslag, ongeldige
uitvoer, annuleren, retries, verlopen claims en ingetrokken docentrechten.
Gebruik hiervoor een ontwikkel- of testdatabase.
