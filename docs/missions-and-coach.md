# Missions en persoonlijke AI-coach

## Productlus

De studentenervaring draait om:

`persoonlijk profiel -> daily mission -> AI-roleplay -> terugblik -> XP en skills -> volgende mission`

Het dashboard kiest een mission op basis van:

- de datum;
- nog niet afgeronde missions;
- aandachtspunten uit het profiel;
- interesses uit het profiel.

Op `/missions` staan twaalf situaties verdeeld over school, stage, dagelijks
leven en sociale contacten. Er zijn vier werkvormen:

- **Roleplay:** de AI speelt bijvoorbeeld een docent, mentor of klasgenoot.
- **Real life:** de student moet een herkenbare praktische taak uitvoeren.
- **Verhaal:** een situatie ontwikkelt zich op basis van de antwoorden.
- **Survival:** de student moet zelfstandig informatie verzamelen en een
  probleem oplossen.

## Coachgeheugen

De coach ontvangt het ERK-niveau, vakgebied, leerdoelen, interesses en
aandachtspunten uit het profiel. Ook de sterke punten en focuspunten van de
laatste vijf bewaarde gesprekken worden meegenomen. Hierdoor kan de coach
aansluiten bij terugkerende behoeften zonder audio of een verborgen
leerlingbeoordeling op te slaan.

Een gesprek kan getypt of handsfree gevoerd worden. De coach:

1. reageert op de inhoud van het antwoord;
2. corrigeert maximaal één echte taalfout;
3. stelt één vervolgvraag;
4. geeft feedback pas uitgebreid bij het afronden.

Als het taalmodel niet beschikbaar is, toont het platform herkenbare vaste
oefenhulp. Die fallback wordt expliciet niet als AI-beoordeling gepresenteerd.

## Voortgang en privacy

Bij afronden kiest de student zelf of het gesprek en de terugblik worden
bewaard. Alleen bij bewaren:

- telt de mission als afgerond;
- wordt de bijbehorende XP één keer toegekend;
- wordt het dagelijkse XP-doel bijgewerkt;
- wordt de streak bijgewerkt;
- telt de sessie mee bij Spreken, Schooltaal, Luisteren, Samenwerken of
  Woordenschat;
- kan de coach de terugblik bij toekomstige gesprekken gebruiken.

De stabiele, gebruikersgebonden sessie-ID voorkomt dubbele XP bij opnieuw
klikken of een herhaald API-verzoek. Alleen tekst en gestructureerde feedback
worden opgeslagen. Microfoonaudio wordt niet bewaard.

De skillbalken op `/progress` tonen oefenervaring richting vijf sessies. Het
zijn nadrukkelijk geen cijfers voor taalvaardigheid of uitspraak. De
achievements zijn rustige mijlpalen op basis van echte activiteit.

## Lokaal testen

### Basis

1. Start MySQL/XAMPP en controleer `DATABASE_URL` in `.env.local`.
2. Start de app:

   ```bash
   npm run dev -- --port 3003
   ```

3. Open `http://localhost:3003`.
4. Log in of maak een studentaccount.
5. Vul op `/profile` niveau, leerdoelen, aandachtspunten en interesses in.

### Volledige mission-flow

1. Open `/dashboard` en controleer de persoonlijke daily mission.
2. Open `/missions` en filter op School, Stage, Dagelijks leven of Sociaal.
3. Start een mission en geef minimaal twee antwoorden via tekst.
4. Test eventueel de microfoon. Sta microfoontoegang toe in de browser.
5. Klik `Afronden`.
6. Vink `Bewaar mijn gesprek en voortgang` aan voordat je afrondt als de
   mission moet meetellen.
7. Controleer de terugblik en de toegekende XP.
8. Open `/progress` en controleer:
   - de afgeronde mission;
   - XP en levelvoortgang;
   - de bijgewerkte skill;
   - de bewaarde terugblik;
   - de aanbevolen volgende mission.

Herhaal dezelfde opgeslagen sessie niet als nieuwe beloningstest: het systeem
hoort daarvoor geen tweede XP-beloning te geven.

### Lokale AI en spraak

- De tekstcoach gebruikt de geconfigureerde lokale Ollama/OpenAI-compatible
  endpoint uit `.env.local`.
- Spraak-naar-tekst gebruikt `/api/voice/transcribe`.
- Tekst-naar-spraak gebruikt Piper via `/api/voice/speak` en valt waar mogelijk
  terug op een Nederlandse browserstem.
- Zonder lokale AI blijft de vaste oefenhulp werken, maar is de terugblik
  bewust beperkter.

Zie `docs/voice/local-voice-stack.md` voor de lokale voice-installatie.

## Automatische controles

```bash
npx tsc --noEmit
npx tsx scripts/test-learning.ts
npm run test:lesson-builder
NODE_OPTIONS=--experimental-global-webcrypto npx tsx scripts/test-coach-api.ts
npm run build
```

De laatste API-test vereist een draaiende app op poort 3003. Op Node 20 of
nieuwer is de extra `NODE_OPTIONS`-waarde niet nodig.

## Bewuste afbakening

De afstudeer-MVP bevat de zeven onderdelen uit het voorstel: personal coach,
tekst en voice, roleplays, persoonlijke aandachtspunten, daily challenge,
XP/journey en interessepersonalisatie. Multiplayer vraagt aanvullende
moderatie, aanwezigheidssynchronisatie en privacykeuzes. Een live nieuwsfeed
vraagt een betrouwbare redactionele bron en niveaucontrole. Beide zijn daarom
bewust voorbereid als vervolgstap en niet als schijnfunctionaliteit toegevoegd.
