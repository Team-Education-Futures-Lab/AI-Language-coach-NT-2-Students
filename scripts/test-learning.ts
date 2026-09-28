import assert from "node:assert/strict";
import { createServer } from "node:http";
import { CoachReviewRequestSchema, CoachTurnRequestSchema, generateCoachReview, generateCoachTurn, knownCorrection } from "../lib/ai/voice-coach";
import { getLearningScenarios, SECTOR_CONTEXTS } from "../lib/ai/learning-scenarios";
import { getAllMissions, getMissionForToday, getPersonalMission } from "../lib/learning/missions";
import { SECTORS } from "../lib/sector/types";

async function main() {
  assert.equal(knownCorrection("Wat moet ik nu doen?"), "Wat moet ik nu doen?");
  assert.equal(knownCorrection("Ik weet niet wat moet ik nu doen."), "Ik weet niet wat ik nu moet doen.");
  assert.equal(knownCorrection("Ik heb vandaag gewerkt."), "Ik heb vandaag gewerkt.");
  for (const sector of SECTORS) {
    const scenarios = getLearningScenarios(sector.code);
    assert.equal(new Set(scenarios.map((item) => item.id)).size, 3);
    assert.ok(scenarios[0].starter.includes(SECTOR_CONTEXTS[sector.code].place));
    assert.ok(scenarios[2].starter.includes(SECTOR_CONTEXTS[sector.code].task));
  }
  const mission = getMissionForToday(new Date("2026-09-22T12:00:00"));
  assert.ok(mission.title.length > 0);
  assert.ok(mission.starter.length > 20);
  assert.ok(mission.vocabulary.length >= 3);
  assert.equal(new Set(getAllMissions().map((item) => item.id)).size, getAllMissions().length);
  assert.equal(new Set(getAllMissions().map((item) => item.chapter)).size, getAllMissions().length);
  const personalMission = getPersonalMission(new Date("2026-09-22T12:00:00"), ["schooltaal"], ["games"]);
  assert.equal(personalMission.focus, "Schooltaal");
  const nextPersonalMission = getPersonalMission(
    new Date("2026-09-22T12:00:00"),
    ["schooltaal"],
    ["games"],
    [personalMission.id],
  );
  assert.notEqual(nextPersonalMission.id, personalMission.id);
  assert.equal(CoachTurnRequestSchema.safeParse({ mode: "turn", userText: "", messages: [], scenarioTitle: "Test" }).success, false);
  let content = JSON.stringify({
    coachReply: "Je vertelt wat je hebt gedaan.", hasCorrection: false, betterSentence: "",
    tip: "Vertel ook wanneer.", detectedFocus: "Meer vertellen", nextQuestion: "Wanneer kwam de levering?",
  });
  const server = createServer((request, response) => {
    request.resume();
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ choices: [{ message: { content }, finish_reason: "stop" }] }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const oldBase = process.env.MIRA_CONVERSE_API_BASE;
  process.env.MIRA_CONVERSE_API_BASE = `http://127.0.0.1:${address.port}/v1`;
  try {
    const input = CoachTurnRequestSchema.parse({
      mode: "turn", sector: "Handel & Logistiek", scenarioTitle: "Vertel over je werk",
      userText: "Ik heb een levering ontvangen.", messages: [],
    });
    const result = await generateCoachTurn(input);
    assert.equal(result.meta.usedFallback, false);
    assert.equal(result.hasCorrection, false);
    assert.equal(result.betterSentence, "");
    assert.equal(result.vocabulary[0].word, "levering");
    const correction = await generateCoachTurn({ ...input, userText: "Ik weet niet wat moet ik nu doen." });
    assert.equal(correction.betterSentence, "Ik weet niet wat ik nu moet doen.");
    content = "{}";
    const fallback = await generateCoachTurn(input);
    assert.equal(fallback.meta.usedFallback, true);
    assert.equal(fallback.hasCorrection, false);
    assert.match(fallback.tip, /niet door AI beoordeeld/);
    const reviewInput = CoachReviewRequestSchema.parse({
      mode: "review", sector: input.sector, scenarioTitle: input.scenarioTitle,
      messages: [
        { role: "assistant", content: "Wat heb je gedaan?" },
        { role: "user", content: input.userText },
      ],
    });
    const fallbackReview = await generateCoachReview(reviewInput);
    assert.equal(fallbackReview.meta.usedFallback, true);
    assert.equal(fallbackReview.strengths[0], "Je hebt 1 eigen antwoord gegeven.");
    content = JSON.stringify({
      summary: "Je vertelde over een levering.",
      strengths: ["Je gebruikte het woord levering."],
      focusPoints: ["Vertel ook wanneer."],
      microLessons: ["Begin je volgende zin met Vandaag."],
    });
    const review = await generateCoachReview(reviewInput);
    assert.equal(review.meta.usedFallback, false);
    assert.equal(review.summary, "Je vertelde over een levering.");
    process.stdout.write("Learning tests passed: scenarios, safe correction, schema, model response, review and transparent fallback.\n");
  } finally {
    if (oldBase === undefined) delete process.env.MIRA_CONVERSE_API_BASE;
    else process.env.MIRA_CONVERSE_API_BASE = oldBase;
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.stack : error}\n`); process.exitCode = 1; });
