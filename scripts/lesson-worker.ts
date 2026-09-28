import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function main() {
  const { db } = await import("../lib/db/prisma");
  const { heartbeatLessonWorker, enqueueScheduledLessons, processNextLessonJob } = await import("../lib/ai/lesson-jobs");
  let stopping = false;
  process.on("SIGTERM", () => { stopping = true; });
  process.on("SIGINT", () => { stopping = true; });
  const once = process.argv.includes("--once");
  const heartbeat = setInterval(() => {
    void heartbeatLessonWorker().catch((error) => console.error("Heartbeat mislukt:", error.message));
  }, 15000);
  try {
    console.log("Leswerker actief. Controleert iedere 15 seconden op taken; publiceert nooit automatisch.");
    do {
      try {
        await heartbeatLessonWorker();
        await enqueueScheduledLessons();
        await processNextLessonJob();
      } catch (error) {
        console.error("Leswerker:", error instanceof Error ? error.message : error);
        if (once) throw error;
      }
      if (!once && !stopping) await new Promise((resolve) => setTimeout(resolve, 15000));
    } while (!once && !stopping);
  } finally {
    clearInterval(heartbeat);
    await db.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
