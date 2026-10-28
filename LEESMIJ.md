# Online demo op Vercel en Supabase

De actuele installatie-, inlog- en database-instructies staan in [README.md](README.md). Deze branch gebruikt PostgreSQL en Supabase Auth; de oude lokale Sites/D1-login is hier niet actief.

## Vaste meertalige stemprofielen

De coach gebruikt Supertonic 3 met vijf vrouwelijke (F1–F5) en vijf mannelijke
(M1–M5) vaste profielen. Hetzelfde profiel wordt gebruikt voor alle Nederlandse
voorbeeldzinnen en alle ondersteunde moedertaalpassages. Audio wordt vooraf in
één WAV samengevoegd, met korte vloeiende overgangen, en met één speler afgespeeld.
Het tempo wordt bij de synthese toegepast, zonder pitchverschuiving.

Het model ondersteunt 31 talen, waaronder Nederlands, Engels, Arabisch en Turks.
Niet ondersteunde talen, zoals Perzisch, worden expliciet gemeld; de app probeert
ze niet met een verkeerd taalmodel uit te spreken. Browser-TTS is uitsluitend een
handmatig gekozen alternatief en kan per taal van stem veranderen. Er is geen
stilzwijgende fallback en er is geen betaalde API nodig.

De eerste download bedraagt circa 400 MB en wordt waar mogelijk via Cache Storage
bewaard. Studenttekst en audio blijven lokaal. Tijdelijke audio wordt alleen in
het geheugen hergebruikt, met aparte cachekeys voor tekst, taal, profiel en tempo.
Annuleren of een workerfout ruimt de worker op; opnieuw proberen start een nieuwe.
De profielkeuze wordt lokaal opgeslagen en gedeeld tussen coachvensters.

Model: supertone-oss-archive/supertonic-3, revision
`aafc6e32416a594460b32413efc49d7fe4ce6d46` (OpenRAIL-M).
Referentie-inferentie: supertone-oss-archive/supertonic, commit
`1e9799e964ea4c0dad7cde993b65c3c813a7b373` (MIT); helper.js is opgenomen met
alleen een aangepast runtime-importpad. De oorspronkelijke repository is gearchiveerd.
ONNX Runtime Web 1.22.0 wordt bij dev/build naar public/vendor/voice gekopieerd.
De daadwerkelijke synthese draait in een worker en blokkeert de interface niet.
Bronnen, ondersteunde talen en licenties staan op `/spraaklicenties.txt`.
