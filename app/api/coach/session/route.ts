import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db/prisma";
import {
  CoachReviewRequestSchema,
  CoachTurnRequestSchema,
  generateCoachReview,
  generateCoachTurn,
  CoachReviewResponseSchema,
} from "@/lib/ai/voice-coach";
import { saveCoachProgress } from "@/lib/learning/coach-progress";

export const runtime = "nodejs";

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 8)
    : [];
}

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
  const [profile, recentConversations] = await Promise.all([
    db.profile.findUnique({
      where: { userId: session.user.id },
      select: { weakAreas: true, interests: true, learningGoals: true },
    }),
    db.conversation.findMany({
      where: { userId: session.user.id },
      select: { context: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  const recentReviews = recentConversations
    .map(({ context }) =>
      CoachReviewResponseSchema.safeParse(
        (context as { review?: unknown } | null)?.review,
      ),
    )
    .filter((review) => review.success)
    .map((review) => review.data);
  const learnerContext = {
    weakAreas: stringList(profile?.weakAreas),
    interests: stringList(profile?.interests),
    learningGoals: stringList(profile?.learningGoals),
    recentFocus: recentReviews.flatMap((review) => review.focusPoints).slice(0, 6),
    recentStrengths: recentReviews.flatMap((review) => review.strengths).slice(0, 6),
  };

  if (mode === "turn") {
    const parsed = CoachTurnRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid turn payload", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await generateCoachTurn({ ...parsed.data, learnerContext });
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

    const id = parsed.data.sessionId ? `${session.user.id}:${parsed.data.sessionId}` : null;
    if (parsed.data.saveProgress) {
      if (!id || !parsed.data.messages.some((message) => message.role === "user")) {
        return NextResponse.json({ ok: false, error: "Oefen eerst een beurt voordat je bewaart." }, { status: 400 });
      }
      const existing = await db.conversation.findUnique({ where: { id }, select: { context: true } });
      const context = existing?.context as {
        review?: unknown;
        reward?: {
          xpEarned?: number;
          level?: number;
          leveledUp?: boolean;
        };
      } | null;
      const stored = CoachReviewResponseSchema.safeParse(context?.review);
      if (stored.success) {
        return NextResponse.json({
          ok: true,
          mode: "review",
          data: stored.data,
          progress: {
            xpEarned: context?.reward?.xpEarned ?? 0,
            level: context?.reward?.level ?? 1,
            leveledUp: context?.reward?.leveledUp ?? false,
            alreadySaved: true,
          },
        });
      }
    }
    const result = await generateCoachReview({ ...parsed.data, learnerContext });
    let progress:
      | {
          xpEarned: number;
          level: number;
          leveledUp: boolean;
          alreadySaved: boolean;
        }
      | undefined;
    if (parsed.data.saveProgress) {
      try {
        progress = await saveCoachProgress({
          userId: session.user.id,
          conversationId: id!,
          title: parsed.data.scenarioTitle,
          level: parsed.data.level,
          sector: parsed.data.sector,
          missionId: parsed.data.missionId,
          messages: parsed.data.messages,
          review: result,
        });
      } catch {
        return NextResponse.json({ ok: false, error: "Bewaren is niet gelukt. Je gesprek staat nog op deze pagina. Probeer opnieuw." }, { status: 503 });
      }
    }
    return NextResponse.json({ ok: true, mode: "review", data: result, progress });
  }

  return NextResponse.json({ ok: false, error: "Unsupported mode" }, { status: 400 });
}
