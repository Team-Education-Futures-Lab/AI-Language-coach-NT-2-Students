import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runtime, synthesizeWithVoiceRuntime } from "@/lib/voice/runtime-client";

export { runtime };

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const voice =
      typeof (body as { voice?: unknown })?.voice === "string"
        ? (body as { voice: string }).voice
        : "nl_NL-alex-medium";
    const format =
      (body as { format?: "wav" | "mp3" | undefined })?.format === "mp3"
        ? "mp3"
        : "wav";

    const result = await synthesizeWithVoiceRuntime({
      text: typeof (body as { text?: unknown })?.text === "string"
        ? (body as { text: string }).text
        : "",
      voice,
      format,
    });

    return new NextResponse(new Uint8Array(result.audioBuffer), {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "Content-Length": String(result.audioBuffer.length),
        "Content-Type": result.contentType,
        "X-Audio-Format": result.format,
        "X-Voice-Id": result.voice,
        "X-Voice-Label": result.voiceLabel,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not synthesize coach voice.",
      },
      { status: 502 },
    );
  }
}
