import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { loadEnvConfig } from "@next/env";
import { nextOccurrence, moduleSchema, scheduleSchema } from "../lib/validations/lesson-module";
import { canReadLesson } from "../lib/auth/lesson-access";
import { generatedLessonSchema } from "../lib/ai/lesson-generator";

loadEnvConfig(process.cwd());

const sample = {
  title: "Om uitleg vragen",
  description: "Je begrijpt een opdracht niet. Vraag rustig om uitleg. Zeg: Kunt u dat nog een keer uitleggen? Je kunt ook zeggen: Wat betekent dit woord?",
  goals: ["Ik kan om uitleg vragen."],
  exercises: [
    { question: "Hoe vraag je beleefd om uitleg?", options: ["Kunt u dat uitleggen?", "Doe het zelf.", "Ik ga weg.", "Geen zin."], correctIndex: 0, explanation: "Met kunt u stel je een beleefde vraag." },
    { question: "Wat betekent uitleg?", options: ["Een tas", "Informatie die iets duidelijk maakt", "Een trein", "Een pauze"], correctIndex: 1, explanation: "Uitleg helpt je iets te begrijpen." },
  ],
};

async function main() {
  const anchor = new Date("2026-01-31T09:00:00Z");
  assert.equal(nextOccurrence(anchor, "MONTHLY", anchor).toISOString(), "2026-02-28T09:00:00.000Z");
  assert.equal(nextOccurrence(anchor, "MONTHLY", new Date("2026-02-28T09:00:00Z")).toISOString(), "2026-03-31T09:00:00.000Z");
  assert.equal(nextOccurrence(new Date("2024-01-31T09:00:00Z"), "MONTHLY", new Date("2024-02-01T09:00:00Z")).toISOString(), "2024-02-29T09:00:00.000Z");
  assert.equal(nextOccurrence(anchor, "WEEKLY", new Date("2026-09-01T09:00:00Z")).toISOString(), "2026-09-05T09:00:00.000Z");
  assert.equal(scheduleSchema.safeParse({ enabled: true, cadence: "MONTHLY", firstRunAt: "2020-01-01T00:00:00Z" }).success, false);
  assert.equal(scheduleSchema.safeParse({ enabled: false, cadence: "WEEKLY" }).success, true);
  assert.equal(generatedLessonSchema.safeParse(sample).success, true);
  assert.equal(generatedLessonSchema.safeParse({ ...sample, exercises: [{ ...sample.exercises[0], options: ["A", "a", "B", "C"] }, sample.exercises[1]] }).success, false);
  assert.equal(generatedLessonSchema.safeParse({ ...sample, exercises: [{ ...sample.exercises[0], correctIndex: 4 }, sample.exercises[1]] }).success, false);
  assert.equal(canReadLesson({ id: "student", role: "STUDENT" }, { published: false, createdById: "teacher" }), false);
  assert.equal(canReadLesson({ id: "teacher", role: "TEACHER" }, { published: false, createdById: "teacher" }), true);
  assert.equal(canReadLesson({ id: "other", role: "TEACHER" }, { published: false, createdById: "teacher" }), false);
  assert.equal(canReadLesson({ id: "student", role: "STUDENT" }, { published: true, createdById: "teacher" }), true);

  const { db } = await import("../lib/db/prisma");
  const { enqueueScheduledLessons, processNextLessonJob } = await import("../lib/ai/lesson-jobs");
  let content: unknown = sample;
  let calls = 0;
  const server = createServer((request, response) => {
    request.resume();
    calls++;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ response: JSON.stringify(content), done: true }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const oldBase = process.env.MIRA_CONVERSE_API_BASE;
  process.env.MIRA_CONVERSE_API_BASE = `http://127.0.0.1:${address.port}/v1`;
  let userId: string | undefined;
  try {
    const user = await db.user.create({ data: { email: `module-test-${randomUUID()}@example.invalid`, role: "TEACHER" } });
    userId = user.id;
    const settings = moduleSchema.parse({ title: "Stagegesprekken", sector: "ZORG", languageLevel: "A2", instructions: "Leer beleefd om hulp vragen.", exerciseCount: 2 });
    const module = await db.lessonModule.create({ data: {
      ...settings, createdById: user.id, enabled: true, cadence: "MONTHLY", scheduleAnchor: anchor, nextRunAt: anchor,
    } });
    await Promise.all([enqueueScheduledLessons(new Date("2026-09-01T10:00:00Z"), module.id), enqueueScheduledLessons(new Date("2026-09-01T10:00:00Z"), module.id)]);
    assert.equal(await db.lessonGeneration.count({ where: { moduleId: module.id } }), 1, "Achterstand en dubbele workers maken maar een taak");
    const rescheduled = await db.lessonModule.findUniqueOrThrow({ where: { id: module.id } });
    assert.equal(rescheduled.nextRunAt?.toISOString(), "2026-09-30T09:00:00.000Z");
    await Promise.all([processNextLessonJob(module.id), processNextLessonJob(module.id)]);
    assert.equal(calls, 1, "Slechts een worker roept het model aan");
    const lesson = await db.lesson.findFirstOrThrow({ where: { moduleId: module.id }, include: { exercises: true } });
    assert.equal(lesson.published, false);
    assert.equal(lesson.createdById, user.id);
    assert.equal(lesson.exercises.length, 2);
    const job = await db.lessonGeneration.findFirstOrThrow({ where: { moduleId: module.id } });
    assert.equal(job.status, "COMPLETED");
    assert.equal(job.lessonId, lesson.id);
    assert.equal(await processNextLessonJob(module.id), false, "Voltooide taken worden niet opnieuw gemaakt");

    const cancelled = await db.lessonGeneration.create({ data: { moduleId: module.id, topic: "", status: "CANCELLED" } });
    assert.equal(await processNextLessonJob(module.id), false);
    assert.equal(calls, 1);
    await db.lessonGeneration.delete({ where: { id: cancelled.id } });

    content = {};
    const invalid = await db.lessonGeneration.create({ data: { moduleId: module.id, topic: "Nieuwe les" } });
    await processNextLessonJob(module.id);
    let failed = await db.lessonGeneration.findUniqueOrThrow({ where: { id: invalid.id } });
    assert.equal(failed.status, "PENDING");
    assert.equal(failed.attempts, 1);
    assert.ok(failed.error);
    assert.equal(await db.lesson.count({ where: { moduleId: module.id } }), 1, "Ongeldige AI-uitvoer maakt geen les");
    await db.lessonGeneration.update({ where: { id: invalid.id }, data: { status: "RUNNING", attempts: 3, lockedUntil: new Date(0) } });
    await processNextLessonJob(module.id);
    failed = await db.lessonGeneration.findUniqueOrThrow({ where: { id: invalid.id } });
    assert.equal(failed.status, "FAILED", "Laatste vastgelopen poging wordt afgesloten");

    const recover = await db.lessonGeneration.create({ data: {
      moduleId: module.id, topic: "", status: "RUNNING", lockedUntil: new Date(0), claimToken: "old", attempts: 1,
    } });
    content = { ...sample, title: "Hulp bij je opdracht" };
    await processNextLessonJob(module.id);
    assert.equal((await db.lessonGeneration.findUniqueOrThrow({ where: { id: recover.id } })).status, "COMPLETED");
    await db.user.update({ where: { id: user.id }, data: { role: "STUDENT" } });
    await db.lessonModule.update({ where: { id: module.id }, data: { nextRunAt: anchor } });
    const before = await db.lessonGeneration.count({ where: { moduleId: module.id } });
    await enqueueScheduledLessons(new Date(), module.id);
    assert.equal(await db.lessonGeneration.count({ where: { moduleId: module.id } }), before);
    const denied = await db.lessonGeneration.create({ data: { moduleId: module.id, topic: "" } });
    const beforeCalls = calls;
    await processNextLessonJob(module.id);
    assert.equal(calls, beforeCalls, "Zonder docentrechten wordt geen AI aangeroepen");
    assert.notEqual((await db.lessonGeneration.findUniqueOrThrow({ where: { id: denied.id } })).status, "COMPLETED");
    console.log("Geslaagd: planning, maandgrenzen, roltoegang, concurrerende workers, conceptopslag, annuleren, retries en crashherstel.");
  } finally {
    if (userId) {
      await db.lesson.deleteMany({ where: { createdById: userId } });
      await db.user.delete({ where: { id: userId } });
    }
    await db.$disconnect();
    if (oldBase === undefined) delete process.env.MIRA_CONVERSE_API_BASE;
    else process.env.MIRA_CONVERSE_API_BASE = oldBase;
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
