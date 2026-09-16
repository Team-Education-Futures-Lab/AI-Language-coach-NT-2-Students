# Local Voice Stack

## Keuze

Voor TaalCozy gebruiken we als nieuwe basis:

- `faster-whisper` voor spraak naar tekst
- `Piper` voor tekst naar spraak
- `Ollama` voor de coachreacties

Deze combinatie is lokaal, gratis, licht genoeg voor development op macOS en stabieler dan browser-STT/TTS of onofficiele cloudroutes.

## Doelarchitectuur

```text
Browser mic
  -> client-side VAD / silence detection
  -> POST audio blob
  -> voice runtime (Python)
      -> faster-whisper transcription
  -> Next.js /api/coach/session
      -> Ollama coach response
  -> voice runtime (Python)
      -> Piper synthesis
  -> audio stream terug naar browser
```

## Verdeling van verantwoordelijkheden

### Browser / Next.js client

- neemt audio op via `MediaRecorder`
- detecteert stilte via Web Audio API
- stopt opname automatisch zodra de gebruiker klaar is
- verstuurt audio naar een serverroute of direct naar de voice runtime
- speelt de gegenereerde coachaudio af
- bewaakt de handsfree beurtlus

### Next.js app

- houdt auth, sessiestatus en coach-UI in beheer
- blijft eigenaar van `/api/coach/session`
- gebruikt Ollama voor de inhoud van de coachreactie
- proxiet optioneel voice-runtime requests zodat secrets/URLs niet in de client hoeven

### Python voice runtime

- endpoint `/transcribe`
  - input: `audio/webm` of `audio/wav`
  - output: transcript + confidence + timing
- endpoint `/synthesize`
  - input: tekst + voice id + taal
  - output: `audio/wav` of `audio/mpeg`
- health endpoint `/health`

## Aanbevolen bestandsstructuur

```text
app/api/voice/transcribe/route.ts
app/api/voice/speak/route.ts
lib/voice/runtime-client.ts
components/features/chat/VoiceCoachSession.tsx
services/voice-runtime/
  README.md
  requirements.txt
  app.py
  voices/
```

## Flow voor handsfree gesprekken

1. Gebruiker klikt eenmalig op `Start live roleplay`
2. Browser start microfooncapture
3. Web Audio API meet volume per frame
4. Zodra volume langer dan een drempel onder de stiltewaarde blijft:
   opname stoppen
5. Audio uploaden naar `/api/voice/transcribe`
6. Transcript doorsturen naar `/api/coach/session`
7. Coachantwoord terugkrijgen van Ollama
8. Coachtekst naar `/api/voice/speak`
9. Piper audio afspelen
10. Na einde audio automatisch opnieuw luisteren als handsfree nog aan staat

## Waarom dit beter past dan de huidige browseraanpak

- auto-stop wordt niet meer afhankelijk van grillig browsergedrag van `SpeechRecognition`
- transcriptiekwaliteit wordt consistenter voor Nederlands
- stemkwaliteit blijft lokaal en voorspelbaar
- we kunnen later nog upgraden zonder de hele UI opnieuw te schrijven

## Fase-aanpak

### Fase 1

- Python voice runtime scaffolden
- `/health`, `/transcribe`, `/synthesize` werkend krijgen
- Next.js proxy-routes toevoegen

### Fase 2

- `SpeechRecognition` vervangen door `MediaRecorder` + silence detection
- handsfree beurtlus koppelen aan de nieuwe runtime

### Fase 3

- Piper voice-selectie toevoegen
- Whisper model tuning voor snelheid/kwaliteit
- latency optimaliseren met kortere audiosegmenten
