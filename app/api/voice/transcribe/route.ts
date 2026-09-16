import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { runtime, transcribeWithVoiceRuntime } from "@/lib/voice/runtime-client";

export { runtime };

function isFileLike(
  value: FormDataEntryValue | null,
): value is File & {
  arrayBuffer: () => Promise<ArrayBuffer>;
  name: string;
  size: number;
  type: string;
} {
  return !!value &&
    typeof value === "object" &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function" &&
    "size" in value &&
    typeof value.size === "number" &&
    "type" in value &&
    typeof value.type === "string" &&
    "name" in value &&
    typeof value.name === "string";
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const audio = formData.get("audio");
  if (!isFileLike(audio)) {
    return NextResponse.json({ ok: false, error: "Missing audio file" }, { status: 400 });
  }

  const language =
    typeof formData.get("language") === "string"
      ? String(formData.get("language"))
      : "nl";

  try {
    const result = await transcribeWithVoiceRuntime({
      file: audio,
      language,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not transcribe voice input.",
      },
      { status: 502 },
    );
  }
}
