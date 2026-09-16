import os
import subprocess
import tempfile
import time
from pathlib import Path

from faster_whisper import WhisperModel
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from starlette.background import BackgroundTask


app = FastAPI(title="TaalCozy Voice Runtime")
whisper_model = None


def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        whisper_model = WhisperModel(
            os.getenv("FASTER_WHISPER_MODEL", "small"),
            device=os.getenv("FASTER_WHISPER_DEVICE", "cpu"),
            compute_type=os.getenv("FASTER_WHISPER_COMPUTE_TYPE", "int8"),
        )
    return whisper_model


def get_piper_config():
    piper_bin = os.getenv("PIPER_BIN", "piper")
    model_path = os.getenv("PIPER_MODEL_PATH", "").strip()
    if not model_path:
        raise RuntimeError("PIPER_MODEL_PATH is niet ingesteld.")

    return {
        "bin": piper_bin,
        "model_path": model_path,
    }


@app.on_event("startup")
async def warm_runtime():
    # Load the whisper model during startup so the first user turn feels faster.
    get_whisper_model()


@app.get("/health")
async def health():
    piper_model_path = os.getenv("PIPER_MODEL_PATH", "").strip()
    return {
        "ok": True,
        "service": "voice-runtime",
        "stt": {
            "provider": "faster-whisper",
            "model": os.getenv("FASTER_WHISPER_MODEL", "small"),
        },
        "tts": {
            "provider": "piper",
            "configured": bool(piper_model_path),
            "modelPath": piper_model_path or None,
        },
    }


@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: str = Form("nl"),
):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="Missing audio file.")

    suffix = Path(audio.filename).suffix or ".webm"
    started_at = time.time()
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(await audio.read())
            temp_path = temp_file.name

        model = get_whisper_model()
        segments, info = model.transcribe(
            temp_path,
            language=language,
            vad_filter=True,
            beam_size=1,
            best_of=1,
            temperature=0,
            condition_on_previous_text=False,
            without_timestamps=True,
        )
        text = " ".join(segment.text.strip() for segment in segments).strip()
        if not text:
            raise HTTPException(status_code=422, detail="Geen spraak herkend in opname.")

        return {
            "ok": True,
            "text": text,
            "language": info.language or language,
            "durationMs": int((time.time() - started_at) * 1000),
        }
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/synthesize")
async def synthesize(
    text: str = Form(...),
    voice: str = Form("nl_NL-alex-medium"),
    format: str = Form("wav"),
):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Missing text.")
    if format not in {"wav"}:
        raise HTTPException(status_code=400, detail="Only wav output is currently supported.")

    temp_path = None
    try:
        config = get_piper_config()
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as temp_file:
            temp_path = temp_file.name

        result = subprocess.run(
            [
                config["bin"],
                "--model",
                config["model_path"],
                "--output_file",
                temp_path,
            ],
            input=text.strip(),
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            raise HTTPException(
                status_code=502,
                detail=result.stderr.strip() or "Piper kon geen audio genereren.",
            )

        return FileResponse(
            temp_path,
            media_type="audio/wav",
            filename=f"coach.{format}",
            background=BackgroundTask(lambda: os.path.exists(temp_path) and os.remove(temp_path)),
            headers={
                "X-Voice-Id": voice,
                "X-Voice-Label": voice,
                "X-Audio-Format": format,
            },
        )
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
