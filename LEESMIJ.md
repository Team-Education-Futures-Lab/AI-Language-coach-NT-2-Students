# Online demo op Vercel en Supabase

De actuele installatie-, inlog- en database-instructies staan in [README.md](README.md). Deze branch gebruikt PostgreSQL en Supabase Auth; de oude lokale Sites/D1-login is hier niet actief.

## Lokale Nederlandse spraak

De coach gebruikt standaard Piper TTS Web 1.1.2 met `nl_NL-mls-medium`, speaker 0.
Nederlandse passages worden op het apparaat in hun geheel als WAV gegenereerd.
Bij het eerste gebruik worden runtime en model automatisch geladen. Modelbestanden
worden waar mogelijk in de browsercache bewaard; privéstand, weinig opslag of het
wissen van websitegegevens kunnen een nieuwe download veroorzaken. Tekst en
gegenereerde audio worden hiervoor niet naar een AI-dienst gestuurd. De drie
recentste audiofragmenten blijven alleen tijdelijk in het geheugen.

Andere talen en expliciet gekozen systeemstemmen gebruiken browser-TTS. Bij een
Piper-fout volgt een zichtbare melding en browserfallback. Annuleren stopt audio
en generatie; een fout maakt een nieuwe engine bij de volgende poging mogelijk.
Het tempo geldt ook voor Piper (pitchbehoud); de browserpitch 0,98 geldt alleen
voor browserstemmen. De stemkwaliteit verschilt per taal en apparaat.

`scripts/prepare-speech.mjs` kopieert de vastgelegde dependency ongewijzigd naar
`public/onnx`, `public/piper`, `public/worker` en `public/vendor/piper`. Deze
bestanden worden bij dev/build gemaakt, niet gecommit. De grote upstream ES-module
wordt pas bij afspelen als statische module geladen, zodat Next deze niet opnieuw
transformeert. De upstream `eval`-plaatsen horen bij optionele CommonJS/Node-
compatibiliteit; er wordt geen eval op studentinvoer uitgevoerd en geen CSP versoepeld.
Attributie en bronverwijzingen: `/spraaklicenties.txt`.
