# Voice Runtime

Dit is de lokale Python service voor de nieuwe voice-stack.

## Taken

- `faster-whisper` voor spraakherkenning
- `Piper` voor Nederlandse TTS
- eenvoudige HTTP API voor de Next.js app

## Installatie

```bash
cd services/voice-runtime
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8001 --reload
```

## Benodigde environment variabelen

```bash
VOICE_RUNTIME_URL=http://127.0.0.1:8001
FASTER_WHISPER_MODEL=small
FASTER_WHISPER_DEVICE=cpu
FASTER_WHISPER_COMPUTE_TYPE=int8
PIPER_BIN=piper
PIPER_MODEL_PATH=/absolute/path/to/nl_NL-alex-medium.onnx
```

## Endpoints

### `GET /health`

Controleert of de service draait en of Whisper/Piper geladen kunnen worden.

### `POST /transcribe`

Input:

- `multipart/form-data` of ruwe audiobody
- taal: `nl`

Output:

```json
{
  "text": "Ik wil graag een afspraak maken.",
  "language": "nl",
  "durationMs": 1820
}
```

### `POST /synthesize`

Input:

```json
{
  "text": "Goed gedaan. Kun je dat nog een keer zeggen?",
  "voice": "nl_NL-alex",
  "format": "wav"
}
```

Output:

- audiostream

## Opmerking

Voor TTS verwacht deze service nu een lokale Piper-installatie en een bestaand `.onnx` stemmodel. Zonder `PIPER_MODEL_PATH` geeft `/synthesize` bewust een duidelijke fout terug.
