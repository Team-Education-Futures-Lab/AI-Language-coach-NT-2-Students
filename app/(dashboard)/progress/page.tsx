import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  Check,
  MessageCircle,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db/prisma";
import { CoachReviewResponseSchema } from "@/lib/ai/voice-coach";
import {
  getAllMissions,
  getNextMission,
  type MissionFocus,
} from "@/lib/learning/missions";
import { levelFromTotalXp } from "@/lib/constants";

export const metadata = { title: "Mijn groei" };

const skillCopy: Record<MissionFocus, string> = {
  Spreken: "Vertel duidelijk wat je bedoelt en houd een gesprek gaande.",
  Schooltaal: "Begrijp opdrachten en gebruik woorden van school en stage.",
  Luisteren: "Controleer of je de ander goed hebt begrepen.",
  Samenwerken: "Maak afspraken, reageer en vraag door.",
  Woordenschat: "Gebruik nieuwe woorden in een echte situatie.",
};

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [attempts, correct, conversations, words, profile, streak, skills] =
    await Promise.all([
      db.exerciseAttempt.count({ where: { userId: user.id } }),
      db.exerciseAttempt.count({ where: { userId: user.id, correct: true } }),
      db.conversation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      db.userVocabulary.count({ where: { userId: user.id } }),
      db.profile.findUnique({
        where: { userId: user.id },
        select: {
          weakAreas: true,
          strongAreas: true,
          level: true,
          totalXp: true,
        },
      }),
      db.streak.findUnique({
        where: { userId: user.id },
        select: { currentStreak: true },
      }),
      db.progress.findMany({
        where: {
          userId: user.id,
          topic: { in: Object.keys(skillCopy) },
        },
      }),
    ]);

  const completedMissionIds = Array.from(
    new Set(
      conversations
        .map(
          ({ context }) =>
            (context as { missionId?: unknown } | null)?.missionId,
        )
        .filter((id): id is string => typeof id === "string"),
    ),
  );
  const totalMissions = getAllMissions().length;
  const lastMissionId = completedMissionIds[0];
  const nextMission =
    (lastMissionId && getNextMission(lastMissionId, completedMissionIds)) ??
    getAllMissions().find((mission) => !completedMissionIds.includes(mission.id)) ??
    getAllMissions()[0];
  const totalXp = profile?.totalXp ?? 0;
  const level = levelFromTotalXp(totalXp);
  const levelPercentage = Math.min(
    100,
    Math.round((level.currentXpInLevel / level.xpNeededForNext) * 100),
  );
  const achievements = [
    {
      title: "Eerste echte gesprek",
      description: "Bewaar je eerste gesprek met de AI-coach.",
      unlocked: conversations.length >= 1,
    },
    {
      title: "Schoolverkenner",
      description: "Rond drie verschillende missions af.",
      unlocked: completedMissionIds.length >= 3,
    },
    {
      title: "Doorzetter",
      description: "Oefen op drie verschillende dagen achter elkaar.",
      unlocked: (streak?.currentStreak ?? 0) >= 3,
    },
    {
      title: "Klaar voor het mbo",
      description: "Ervaar acht verschillende praktijksituaties.",
      unlocked: completedMissionIds.length >= 8,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <header className="rounded-xl border border-white/10 bg-black/40 p-7 backdrop-blur-2xl sm:p-9">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-300">
          Jouw persoonlijke journey
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">Mijn groei</h1>
        <p className="mt-3 max-w-2xl leading-7 text-white/70">
          Hier zie je wat je echt hebt geoefend. Activiteit is geen toetscijfer:
          je coach gebruikt dit om een passende volgende stap te kiezen.
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Missions", completedMissionIds.length],
          ["Gesprekken", conversations.length],
          ["Oefenpogingen", attempts],
          ["Woorden", words],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <dd className="text-3xl font-bold text-white">{value}</dd>
            <dt className="mt-2 text-sm text-white/60">{label}</dt>
          </div>
        ))}
      </dl>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-7">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-transparent to-fuchsia-500/15" />
          <div className="relative">
            <p className="flex items-center gap-2 text-sm font-bold text-indigo-200">
              <Trophy size={17} /> Level {profile?.level ?? 1}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Mbo-verkenner
            </h2>
            <p className="mt-3 text-white/65">
              {totalXp} XP · {streak?.currentStreak ?? 0} dagen actief
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400"
                style={{ width: `${levelPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-white/50">
              {level.currentXpInLevel} van {level.xpNeededForNext} XP naar het
              volgende level
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-4">
              <BookOpenCheck className="text-fuchsia-300" />
              <div>
                <p className="font-bold text-white">
                  {completedMissionIds.length} van {totalMissions} situaties ervaren
                </p>
                <p className="text-sm text-white/55">
                  Iedere situatie mag je zo vaak herhalen als je wilt.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-7 backdrop-blur-xl">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-fuchsia-300">
            <Target size={15} /> Skill map
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Waar heb je mee geoefend?
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(Object.keys(skillCopy) as MissionFocus[]).map((name) => {
              const activity =
                skills.find((skill) => skill.topic === name)?.completed ?? 0;
              const progress = Math.min(100, activity * 20);
              return (
                <div
                  key={name}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-white">{name}</p>
                    <span className="text-xs font-bold text-white/50">
                      {activity} {activity === 1 ? "sessie" : "sessies"}
                    </span>
                  </div>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-white/55">
                    {skillCopy[name]}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-white/45">
            De balk toont oefenervaring richting vijf sessies, niet jouw
            taalniveau of een beoordeling.
          </p>
        </div>
      </section>

      <section>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-300">
          Achievements
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Mijlpalen zonder kinderachtige druk
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.title}
              className={`rounded-xl border p-5 ${
                achievement.unlocked
                  ? "border-emerald-400/25 bg-emerald-500/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <Trophy
                size={20}
                className={
                  achievement.unlocked ? "text-emerald-300" : "text-white/25"
                }
              />
              <h3 className="mt-4 font-bold text-white">{achievement.title}</h3>
              <p className="mt-2 text-sm leading-5 text-white/55">
                {achievement.description}
              </p>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-white/45">
                {achievement.unlocked ? "Behaald" : "Nog te ontdekken"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {nextMission && (
        <section className="flex flex-col gap-5 rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-300">
              Volgende stap
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">
              {nextMission.title}
            </h2>
            <p className="mt-1 text-sm text-white/65">{nextMission.goal}</p>
          </div>
          <Link
            href={`/chat?mission=${nextMission.id}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 font-bold text-white"
          >
            Start missie <ArrowRight size={17} />
          </Link>
        </section>
      )}

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-fuchsia-300">
              Coachgeheugen
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Mijn terugblikken
            </h2>
          </div>
          <span className="text-sm text-white/50">
            {correct} goede oefenantwoorden
          </span>
        </div>
        {!conversations.length && (
          <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-8">
            <MessageCircle className="mb-4 text-white/60" />
            <p className="text-lg font-bold text-white">
              Je eerste gesprek begint met één zin.
            </p>
            <p className="mt-2 text-white/60">
              Rond een coachgesprek af en kies ervoor om je terugblik te bewaren.
            </p>
            <Link
              href="/missions"
              className="mt-5 inline-flex items-center gap-2 font-bold text-fuchsia-300"
            >
              Kies een missie <ArrowRight size={18} />
            </Link>
          </div>
        )}
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const context = conversation.context as {
              review?: unknown;
              missionId?: string;
              reward?: { xpEarned?: number };
            } | null;
            const review = CoachReviewResponseSchema.safeParse(context?.review);
            return (
              <details
                key={conversation.id}
                className="rounded-xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl"
              >
                <summary className="cursor-pointer list-none text-white">
                  <span className="flex flex-wrap items-center justify-between gap-3">
                    <span className="font-bold">
                      {conversation.title ?? "Oefengesprek"}
                    </span>
                    <span className="text-sm text-white/50">
                      {conversation.createdAt.toLocaleDateString("nl-NL")} ·{" "}
                      {conversation.languageLevel}
                      {context?.reward?.xpEarned
                        ? ` · +${context.reward.xpEarned} XP`
                        : ""}
                    </span>
                  </span>
                </summary>
                {review.success ? (
                  <div className="mt-5 space-y-4 border-t border-white/10 pt-5 leading-7 text-white/70">
                    <p>{review.data.summary}</p>
                    {review.data.strengths.length > 0 && (
                      <div>
                        <h3 className="flex items-center gap-2 font-bold text-white">
                          <Check size={16} className="text-emerald-300" /> Dit
                          ging goed
                        </h3>
                        <ul className="mt-2 space-y-1">
                          {review.data.strengths.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <h3 className="flex items-center gap-2 font-bold text-white">
                        <Sparkles size={16} className="text-fuchsia-300" /> Kleine
                        volgende stap
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {review.data.microLessons.map((lesson) => (
                          <li key={lesson}>{lesson}</li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href={
                        context?.missionId
                          ? `/chat?mission=${context.missionId}`
                          : "/chat"
                      }
                      className="inline-flex items-center gap-2 font-bold text-fuchsia-300"
                    >
                      Nog eens oefenen <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 text-white/60">
                    Voor dit gesprek is geen terugblik beschikbaar.
                  </p>
                )}
              </details>
            );
          })}
        </div>
      </section>
    </div>
  );
}
