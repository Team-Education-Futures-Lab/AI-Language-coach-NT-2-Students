# Online demo op Vercel en Supabase

De actuele installatie-, inlog- en database-instructies staan in [README.md](README.md). Deze branch gebruikt PostgreSQL en Supabase Auth; de oude lokale Sites/D1-login is hier niet actief.

## Vaste meertalige stemprofielen

De coach gebruikt Supertonic 3 met vijf vrouwelijke (F1–F5) en vijf mannelijke
(M1–M5) vaste profielen. Hetzelfde profiel wordt gebruikt voor alle Nederlandse
voorbeeldzinnen en alle ondersteunde moedertaalpassages. Audio wordt per korte passage vooruit berekend en op één Web Audio-klok
aaneengesloten afgespeeld, met zachte randen. De eerste passage kan al spelen
terwijl de rest wordt gemaakt. Voor herhaald afspelen wordt ook één WAV bewaard.
Het tempo wordt bij de synthese toegepast, zonder pitchverschuiving.

Het model ondersteunt 31 talen, waaronder Nederlands, Engels, Arabisch en Turks.
Niet ondersteunde talen, zoals Perzisch, worden expliciet gemeld; de app probeert
ze niet met een verkeerd taalmodel uit te spreken. Browser-TTS is uitsluitend een
handmatig gekozen alternatief en kan per taal van stem veranderen. Er is geen
stilzwijgende fallback en er is geen betaalde API nodig.

Bij het openen van de leeromgeving worden de spraakmotor en alle 10 profielen
vooraf geladen, ook voordat een coachgesprek wordt geopend. De eerste download
bedraagt circa 400 MB en wordt via Cache Storage bewaard. Opgeslagen bestanden
worden bij volgende bezoeken opnieuw gebruikt. De status maakt onderscheid tussen
downloaden, opgeslagen stemmen openen en nieuwe audio berekenen. Bij een mislukte
cache-write meldt de app dat bestanden niet kunnen worden bewaard. Browserdata
wissen, privémodus en opslagtekort kunnen een nieuwe download nodig maken. Studenttekst en audio blijven lokaal. Tijdelijke audio wordt alleen in
het geheugen hergebruikt, met aparte cachekeys voor tekst, taal, profiel en tempo.
Annuleren stopt het afspelen direct, maar bewaart de geladen spraakmotor: de
lopende berekening stopt bij een veilige modelstap voordat een volgend verzoek start. Een
workerfout of timeout ruimt de worker wel op. Voorladen is gedeeld en wordt niet
afgebroken bij het sluiten van de chat. Nieuwe tekst vraagt nog lokale rekentijd.
De profielkeuze wordt lokaal opgeslagen en gedeeld tussen coachvensters.

Model: supertone-oss-archive/supertonic-3, revision
`aafc6e32416a594460b32413efc49d7fe4ce6d46` (OpenRAIL-M).
Referentie-inferentie: supertone-oss-archive/supertonic, commit
`1e9799e964ea4c0dad7cde993b65c3c813a7b373` (MIT); helper.js is opgenomen met
alleen een aangepast runtime-importpad. De oorspronkelijke repository is gearchiveerd.
ONNX Runtime Web 1.22.0 wordt bij dev/build naar public/vendor/voice gekopieerd.
De daadwerkelijke synthese draait in een worker en blokkeert de interface niet.
Bronnen, ondersteunde talen en licenties staan op `/spraaklicenties.txt`.


### Gesprek, uitlegtaal en automatisch voorlezen
De coach heeft een eigen zoekbare uitlegtaal (meer dan 180 suggesties plus vrije
invoer), onafhankelijk van de interface. Deze keuze wordt lokaal bewaard en naar
de tutor gestuurd. De tekstkwaliteit hangt af van de gekozen taal; lokale spraak
blijft beperkt tot de 31 modeltalen. Er is geen stilzwijgende verkeerde uitspraak.
Voorlezen is een bewaarde aan/uitstand en leest nieuwe coachantwoorden automatisch.
Zichtbare antwoorden worden bij uitgeschakeld voorlezen alvast voorbereid; opnieuw
afspelen gebruikt de audiocache. De synthese gebruikt 8 stappen, overeenkomstig de
standaard van de officiële Supertonic 3-browserdemo. Volledig directe audio is niet
gegarandeerd: apparaat, tekstlengte en modelinitialisatie bepalen de wachttijd.
De microfoon heeft een geluidsmeter, apparaatkeuze en een lokale test zonder upload.
De detectie herkent zachte spraak en beëindigt de beurt na een natuurlijke pauze.
Opnemen hangt niet meer af van een hervatte AudioContext; handmatig stoppen blijft
mogelijk. Een echte spraakbeurt wordt nog steeds door Groq getranscribeerd.
