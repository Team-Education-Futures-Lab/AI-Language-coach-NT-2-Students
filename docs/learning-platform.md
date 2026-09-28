# TaalCozy: van oefenen naar terugkijken

## Voor wie
NT2-studenten die doorstromen naar het mbo. Korte, veilige oefenmomenten
voor schooltaal en beroepstaal. Geen formele toetsing of docentvervanging.

## Werkende leerroute
- `/dashboard`: echte aantallen uit Prisma, gepubliceerde lessen op profielniveau
  en drie oefensituaties voor het gekozen vakgebied.
- `/chat`: hulp vragen, werk bespreken of presenteren. Oefenniveau A1, A2 of B1,
  typen of handsfree Nederlands spreken, eenvoudiger uitleg en voorbeeldzinnen.
- Afronden levert een terugblik. Alleen met toestemming worden tekstgesprek en
  terugblik in `Conversation` en `ConversationMessage` opgeslagen. Diezelfde
  idempotente opslag werkt XP, dagdoel, streak en skill-activiteit bij. Audio
  wordt niet opgeslagen.
- `/progress`: eigen activiteiten en maximaal twintig recente gesprekken.
- `/lessons`: daadwerkelijk gepubliceerde lessen, geen demonstratiecatalogus.
- `/teacher`: bestaand afgeschermd studentenbeheer en lesbouwer blijven intact.

## Coach
`COACH_MODEL` selecteert een apart docentmodel voor gesprekken en terugblikken.
Lokaal is `llama3.1:8b` gekozen omdat het compacte 1.5B-model in inhoudelijke
tests tekortschiet. Warme testbeurten kostten circa 5-8 seconden, exclusief
transcriptie en stemgeneratie. Dit is geen garantie of product-SLA.

Het model krijgt het vakgebied, oefendoel, taalniveau, recente context en
de laatste zin. Gestructureerde uitvoer voorkomt ongeldige veldnamen.
Correcties mogen de betekenis niet veranderen; een correcte zin hoeft niet
te worden herschreven. Een smalle, geteste lokale regel herstelt alleen
`ik weet niet wat moet ik ... doen`.

Bij een fout of timeout wordt expliciet vaste oefenhulp getoond. Dit is geen
AI-beoordeling. Vakwoordbetekenissen komen uit een kleine beheerde lijst.
AI-feedback blijft feilbaar; inhoudelijke beoordeling met NT2-docenten is
noodzakelijk voordat het platform breed in het onderwijs wordt ingezet.

## Interface
Eenvoudige Nederlandse instructies, grotere aanraakvlakken, compacte
gespreksweergave, navigatie op mobiel, rustige kleuren en lichte animaties.
`prefers-reduced-motion` schakelt beweging vrijwel uit. De bestaande
vertaalcache en vertaalindicator blijven beschikbaar.

## Verificatie
`npx tsx scripts/test-learning.ts` test scenario's voor alle sectoren,
correcte vraagzinnen, bekende correcties, modelterugblikken, ongeldige modeluitvoer en fallback.
`npx tsc --noEmit` controleert TypeScript.

`scripts/test-coach-api.ts` test toegang zonder sessie, verplichte sessie-ID,
bewaren, herhaald bewaren en niet bewaren zonder toestemming. Het script maakt
een tijdelijk account en verwijdert dat na afloop. Laad de lokale database-
en Auth.js-omgevingsvariabelen voordat je het uitvoert. Op Node 18 is
`NODE_OPTIONS=--experimental-global-webcrypto` nodig.

Browsercontrole: antwoord typen, AI-reactie, audio laden, afronden en de
bewaarde terugblik op `/progress`. Layouts van dashboard, coach, lessen en
voortgang zijn gecontroleerd in browserframes van 375, 768 en 1440 pixels,
zonder horizontale overflow. Dit vervangt geen test op echte apparaten.
Er staan nog oude debugaanroepen naar localhost:7777 in `Bilingual`;
deze geven consolefouten als de eerdere debugservice niet draait.

## Productrichting: leren door mee te doen

De student-home gebruikt nu een eerste verticale productlus rond **de eerste
weken op het mbo**:

`daily mission → roleplay met tekst of stem → feedback na het gesprek → journey`

De missions zijn geen traditionele meerkeuze-oefeningen. Ze gebruiken echte
onderwijssituaties: jezelf voorstellen in de klas, om uitleg vragen, je rooster
bespreken, met een mentor praten, samenwerken en je eerste stagegesprek.
De mission-context wordt meegegeven aan de bestaande AI-coach. De coach blijft
vrij reageren en corrigeert niet na iedere zin.

De dagelijkse mission wordt gekozen uit twaalf onderwijs- en praktijksituaties
en wordt bijgestuurd door `weakAreas`, `interests` en eerder afgeronde missions.
De dashboardkaart
laat het echte leerdoel, de benodigde tijd en XP zien. Een bewaarde
coachterugblik met dezelfde `missionId` telt de mission als gedaan. Er wordt
geen fictieve score voor spreekvaardigheid gemaakt.

`/progress` bevat daarnaast een journey-kaart en een skill map met Spreken,
Schooltaal, Luisteren en Samenwerken. Deze toont profielsignalen en
activiteiten, geen onbewezen percentages. Interesses en zwakke punten kunnen
worden aangepast via `/profile`.

Roleplay, real-life, interactieve verhalen en survival zijn varianten binnen
dezelfde mission- en coachcontext. Multiplayer en een live nieuwsfeed blijven
bewuste vervolgstappen: daarvoor zijn respectievelijk moderatie/realtime
synchronisatie en een betrouwbare redactionele databron nodig.

Zie `docs/missions-and-coach.md` voor de volledige werking en testinstructies.

## Nog voor een schoolpilot
- Docentreview van scenario's, AI-antwoorden en woordlijsten.
- Privacybeleid, bewaartermijnen en verwijderen/exporteren van gesprekken.
- Automatische browsertests met echte microfoontoestemming op Safari/Chrome.
- Leerdoelen en vooruitgang didactisch valideren; aantallen zijn activiteit,
  geen bewezen leerwinst of beoordeling van spreekvaardigheid.
- Zelfhosten van Ollama/Whisper/Piper op een geschikte server voor gebruik
  buiten deze lokale ontwikkelmachine.
