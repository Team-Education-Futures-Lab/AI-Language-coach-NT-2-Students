import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { warmMiraConverse } from "@/lib/ai/mira-converse";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await warmMiraConverse();
    return NextResponse.json({ ok: true, ...result });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Coach model could not be warmed." },
      { status: 503 },
    );
  }
}
