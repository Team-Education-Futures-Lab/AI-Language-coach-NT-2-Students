import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  CoachReviewRequestSchema,
  CoachTurnRequestSchema,
  generateCoachReview,
  generateCoachTurn,
  runtime,
} from "@/lib/ai/voice-coach";

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

  const mode = typeof (body as { mode?: unknown })?.mode === "string"
    ? (body as { mode?: string }).mode
    : null;

  if (mode === "turn") {
    const parsed = CoachTurnRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid turn payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await generateCoachTurn(parsed.data);
    return NextResponse.json({ ok: true, mode: "turn", data: result });
  }

  if (mode === "review") {
    const parsed = CoachReviewRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid review payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await generateCoachReview(parsed.data);
    return NextResponse.json({ ok: true, mode: "review", data: result });
  }

  return NextResponse.json({ ok: false, error: "Unsupported mode" }, { status: 400 });
}
