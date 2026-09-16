import { z } from "zod";

export const runtime = "nodejs";

const DEFAULT_VOICE_RUNTIME_URL = "http://127.0.0.1:8001";

const VoiceTranscriptionSchema = z.object({
  ok: z.boolean().default(true),
  text: z.string().trim().min(1),
  language: z.string().trim().default("nl"),
  durationMs: z.number().nonnegative().optional().default(0),
});

const VoiceSynthesisSchema = z.object({
  text: z.string().trim().min(1).max(900),
  voice: z.string().trim().min(1).max(120).optional().default("nl_NL-alex-medium"),
  format: z.enum(["wav", "mp3"]).optional().default("wav"),
});

export type VoiceTranscription = z.infer<typeof VoiceTranscriptionSchema>;
export type VoiceSynthesisInput = z.infer<typeof VoiceSynthesisSchema>;

function getVoiceRuntimeUrl() {
  return process.env.VOICE_RUNTIME_URL?.trim() || DEFAULT_VOICE_RUNTIME_URL;
}

export async function transcribeWithVoiceRuntime(input: {
  file: File;
  language?: string;
}) {
  const runtimeUrl = getVoiceRuntimeUrl();
  const formData = new FormData();
  formData.set("audio", input.file);
  formData.set("language", input.language?.trim() || "nl");

  const response = await fetch(`${runtimeUrl}/transcribe`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);
  if (!response.ok || !json) {
    throw new Error(
      (json as { error?: string } | null)?.error ||
        "Voice runtime kon de opname niet transcriberen.",
    );
  }

  return VoiceTranscriptionSchema.parse(json);
}

export async function synthesizeWithVoiceRuntime(input: VoiceSynthesisInput) {
  const runtimeUrl = getVoiceRuntimeUrl();
  const parsed = VoiceSynthesisSchema.parse(input);
  const formData = new FormData();
  formData.set("text", parsed.text);
  formData.set("voice", parsed.voice);
  formData.set("format", parsed.format);

  const response = await fetch(`${runtimeUrl}/synthesize`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new Error(
      json?.error ||
        "Voice runtime kon geen audio genereren.",
    );
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());

  return {
    audioBuffer,
    contentType: response.headers.get("Content-Type") || "audio/wav",
    voice: response.headers.get("X-Voice-Id") || parsed.voice,
    voiceLabel: response.headers.get("X-Voice-Label") || parsed.voice,
    format: response.headers.get("X-Audio-Format") || parsed.format,
  };
}
