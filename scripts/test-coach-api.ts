import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { encode } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
const db = new PrismaClient();
const base = process.env.TEST_BASE_URL ?? "http://localhost:3003";

async function main() {
  const user = await db.user.create({ data: { email: `coach-test-${randomUUID()}@example.invalid`, name: "Automatische test" } });
  try {
    const cookieName = "authjs.session-token";
    const token = await encode({
      secret: process.env.AUTH_SECRET!, salt: cookieName,
      token: { id: user.id, sub: user.id, role: "STUDENT" },
    });
    const body = {
      mode: "review", scenarioTitle: "Hulp vragen", sector: "Zorg & Welzijn",
      level: "A2", sessionId: randomUUID(), saveProgress: true,
      messages: [
        { role: "assistant", content: "Hoe vraag je om hulp?" },
        { role: "user", content: "Kunt u dat nog een keer uitleggen?" },
      ],
    };
    const post = (data: unknown, authenticated = true) => fetch(`${base}/api/coach/session`, {
      method: "POST",
      redirect: "manual",
      signal: AbortSignal.timeout(30000),
      headers: { "Content-Type": "application/json", ...(authenticated ? { Cookie: `${cookieName}=${token}` } : {}) },
      body: JSON.stringify(data),
    });
    assert.equal((await post(body, false)).status, 401);
    assert.equal((await post({ ...body, sessionId: undefined })).status, 400);
    const first = await post(body);
    assert.equal(first.status, 200, await first.clone().text());
    const firstJson = await first.json();
    assert.equal(firstJson.ok, true);
    assert.equal(firstJson.progress.xpEarned, 30);
    const second = await post(body);
    assert.equal(second.status, 200);
    assert.equal(await db.conversation.count({ where: { userId: user.id } }), 1);
    assert.equal((await db.profile.findUniqueOrThrow({ where: { userId: user.id } })).totalXp, 30);
    assert.equal((await db.dailyGoal.findFirstOrThrow({ where: { userId: user.id } })).current, 30);
    assert.equal((await db.streak.findUniqueOrThrow({ where: { userId: user.id } })).currentStreak, 1);
    assert.equal((await db.progress.findUniqueOrThrow({ where: { userId_topic: { userId: user.id, topic: "Spreken" } } })).completed, 1);
    const saved = await db.conversation.findFirst({ where: { userId: user.id }, include: { messages: true } });
    assert.equal(saved?.messages.length, 2);
    const unsaved = await post({ ...body, sessionId: randomUUID(), saveProgress: false });
    assert.equal(unsaved.status, 200);
    assert.equal(await db.conversation.count({ where: { userId: user.id } }), 1);
    process.stdout.write("Coach API tests passed: authentication, validation, save, duplicate save and privacy opt-out.\n");
  } finally {
    await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
  }
}
main().catch(async (error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : error}\n`);
  await db.$disconnect();
  process.exitCode = 1;
});
