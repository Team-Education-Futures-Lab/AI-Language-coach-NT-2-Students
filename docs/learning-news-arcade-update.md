# Nieuws, startpagina en speelhal — 11 november 2026

- Nieuws: expliciete AI-actie, drie stappen, uitleg over het plakken van brontekst, samenvatting op het server-side profielniveau, drie begripsvragen en een aparte AI-feedbackactie. Wijzigen van een antwoord wist verouderde feedback. Brontekst en antwoorden blijven alleen in de huidige dialoog; geen nieuwe databasevelden. Bestaande authenticatie, gratis AI-limieten en serverprovider blijven gelden.
- Spellen: Grachtenkoerier (route lezen, bewegen, bezorgen en depot), Zinnenexpress (woordwagons, vijf stations), Marktmeester (bestellingen, hoeveelheden en optionele klok). A2/B1/B2, pauze, toetsenbord/knoppen, bestaande geluidsknop, resultaat bewaren via bestaande activity-API. 20 XP per opgeslagen ronde. Geen nieuwe dependencies of AI-aanvragen voor spellen.
- Start: drie navigatiekaarten in één blok. Geen aanbevolen oefening meer erboven.
- Profiel: actuele oefenniveauweergave zonder korte taalcheck. Bestaande assessmentgegevens blijven bewaard.
- Rondleiding: bijgewerkte NL/EN/FA/ZH/HE-uitleg, einde en overslaan keren terug naar Start. Vier gewijzigde stappen hebben nieuwe tekst: zij gebruiken de bestaande spraakmotor en audiocache; de overige zestien opnames per opgenomen taal blijven bruikbaar. Oude opnames worden nooit voor nieuwe tekst afgespeeld.
- Oefenen: handmatig gepubliceerde docentlessen uit de bestaande toegangsgefilterde `/api/state`-respons vervangen het persoonlijke AI-uitdagingsblok. Zonder gepubliceerde lessen verschijnt geen leeg blok. Geen wijzigingen aan database of docenttoegang.
- Lezen en nieuws: geen quiz of woordzoeker; beide blijven bij Taalspellen.

## Controle

- Automatische tests: routebereikbaarheid/watergrenzen, treinvolgorde, bestelhoeveelheden, nieuws-invoer en feedbackschema plus bestaande suite.
- Browser (Chromium, lokaal met gecontroleerde API-responsen): drie volledige speelrondes, drie save-requests, pauze, nieuws genereren en feedback aanvragen/wijzigen, docentles openen, profiel zonder check, alle 19 tourstappen en terugkeer naar Start.
- Mobiel 390 px: start en spelvenster zonder horizontale overflow; visuele controle van desktop, nieuws en spellen.
- De browserchecks gebruiken testdata en testfeedback: geen claims over live AI-kwaliteit of een productie-databasewrite. Geen productieaccounts of gegevens gewijzigd tijdens tests.
