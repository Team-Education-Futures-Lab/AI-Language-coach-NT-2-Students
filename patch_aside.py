#!/usr/bin/env python3
"""Batch replace aside card strings in _DashboardClient.tsx with Bilingual versions."""
import re

FILE = "/Users/parsasiddighi/Desktop/Mindlabs/AI taalcoach/app/(dashboard)/dashboard/_DashboardClient.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

def replace_once(old: str, new: str, label: str):
    global content
    if old not in content:
        print(f"WARN: '{label}' not found, skipping")
        return
    content = content.replace(old, new, 1)
    print(f"OK: {label}")

# ---- Recommendations card: exercises + xp + progress % ----
replace_once(
    '<span className="inline-flex items-center gap-1">\n                    <NotebookPen className="h-3.5 w-3.5" />\n                    {r.exercises} {t.common.exercisesShort}\n                  </span>',
    '''<span className="inline-flex items-center gap-1">
                    <NotebookPen className="h-3.5 w-3.5" />
                    {r.exercises} {showNlRef ? (
                      <Bilingual nl={nlSources.common.exercisesShort} size="sm" variant="inline">
                        {t.common.exercisesShort}
                      </Bilingual>
                    ) : t.common.exercisesShort}
                  </span>''',
    "exercises-short",
)

replace_once(
    '<span className="inline-flex items-center gap-1">\n                    <Star className="h-3.5 w-3.5" />\n                    +{r.xp} {t.common.xpLabel}\n                  </span>',
    '''<span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    +{r.xp} {showNlRef ? (
                      <Bilingual nl={nlSources.common.xpLabel} size="sm" variant="inline">
                        {t.common.xpLabel}
                      </Bilingual>
                    ) : t.common.xpLabel}
                  </span>''',
    "xp-label",
)

replace_once(
    '<p className="mt-1 text-[11px] font-bold text-cozy-ink/55">\n                    {r.progress}% afgerond\n                  </p>',
    '''<div className="mt-1 text-[11px] font-bold text-cozy-ink/55">
                    {r.progress}% {showNlRef ? (
                      <Bilingual nl="afgerond" size="sm" variant="inline">
                        completed
                      </Bilingual>
                    ) : "completed"}
                  </div>''',
    "progress-pct",
)

# ---- Word of the day ----
replace_once(
    '<span className="tc-chip-teal">\n                <Sparkles className="h-3.5 w-3.5" />\n                {t.dashboard.wordOfDay}\n              </span>',
    '''<span className="tc-chip-teal">
                <Sparkles className="h-3.5 w-3.5" />
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.wordOfDay} size="sm" variant="inline">
                    {t.dashboard.wordOfDay}
                  </Bilingual>
                ) : t.dashboard.wordOfDay}
              </span>''',
    "word-of-day-chip",
)

replace_once(
    '<h3 className="mt-3 font-display text-2xl font-black text-cozy-ink">\n              {t.dashboard.wordOfDayTitle}\n            </h3>',
    '''<h3 className="mt-3 font-display text-2xl font-black text-cozy-ink">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.wordOfDayTitle} size="xl">
                  {t.dashboard.wordOfDayTitle}
                </Bilingual>
              ) : t.dashboard.wordOfDayTitle}
            </h3>''',
    "word-of-day-title",
)

replace_once(
    '<p className="mt-1 text-xs font-black uppercase tracking-wider text-cozy-terracotta">\n              zelfstandig naamwoord • de/het • ERK A2\n            </p>',
    '''<p className="mt-1 text-xs font-black uppercase tracking-wider text-cozy-terracotta">
              {showNlRef ? (
                <Bilingual nl="zelfstandig naamwoord • de/het • ERK A2" size="sm" variant="inline">
                  noun • common/neuter • CEFR A2
                </Bilingual>
              ) : "noun • common/neuter • CEFR A2"}
            </p>''',
    "word-of-day-tag",
)

replace_once(
    '<p className="mt-3 text-sm font-semibold leading-relaxed text-cozy-ink/75">\n              {t.dashboard.wordOfDayExample}\n            </p>',
    '''<div className="mt-3 text-sm font-semibold leading-relaxed text-cozy-ink/75">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.wordOfDayExample} size="sm">
                  {t.dashboard.wordOfDayExample}
                </Bilingual>
              ) : t.dashboard.wordOfDayExample}
            </div>''',
    "word-of-day-example",
)

replace_once(
    '<button type="button" className="mt-4 tc-teal-btn w-full">\n              ➕ {t.dashboard.wordOfDayCta}\n            </button>',
    '''<button type="button" className="mt-4 tc-teal-btn w-full">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.wordOfDayCta} size="sm" variant="inline">
                  {t.dashboard.wordOfDayCta}
                </Bilingual>
              ) : t.dashboard.wordOfDayCta}
            </button>''',
    "word-of-day-cta",
)

# ---- Weekly goals ----
replace_once(
    '<h3 className="font-display text-lg font-bold text-cozy-ink">\n                {t.dashboard.weeklyGoals}\n              </h3>',
    '''<h3 className="font-display text-lg font-bold text-cozy-ink">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.weeklyGoals} size="lg">
                    {t.dashboard.weeklyGoals}
                  </Bilingual>
                ) : t.dashboard.weeklyGoals}
              </h3>''',
    "weekly-goals",
)

# ---- Need help ----
replace_once(
    '<p className="text-[11px] font-black uppercase tracking-wider text-cozy-terracotta">\n                  {t.dashboard.needHelp}\n                </p>',
    '''<p className="text-[11px] font-black uppercase tracking-wider text-cozy-terracotta">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.dashboard.needHelp} size="sm" variant="inline">
                      {t.dashboard.needHelp}
                    </Bilingual>
                  ) : t.dashboard.needHelp}
                </p>''',
    "need-help-tag",
)

replace_once(
    '<h3 className="mt-0.5 font-display text-lg font-bold text-cozy-ink">\n                  {t.dashboard.needHelpTitle}\n                </h3>',
    '''<h3 className="mt-0.5 font-display text-lg font-bold text-cozy-ink">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.dashboard.needHelpTitle} size="lg">
                      {t.dashboard.needHelpTitle}
                    </Bilingual>
                  ) : t.dashboard.needHelpTitle}
                </h3>''',
    "need-help-title",
)

replace_once(
    '<p className="mt-1 text-xs font-semibold text-cozy-ink/65">\n                  {t.dashboard.needHelpSubtitle}\n                </p>',
    '''<div className="mt-1 text-xs font-semibold text-cozy-ink/65">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.dashboard.needHelpSubtitle} size="sm">
                      {t.dashboard.needHelpSubtitle}
                    </Bilingual>
                  ) : t.dashboard.needHelpSubtitle}
                </div>''',
    "need-help-subtitle",
)

replace_once(
    '<Link href="/chat" className="mt-4 tc-sunset-btn w-full">\n              �� {t.dashboard.needHelpCta}\n            </Link>',
    '''<Link href="/chat" className="mt-4 tc-sunset-btn w-full">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.needHelpCta} size="md" variant="inline">
                  {t.dashboard.needHelpCta}
                </Bilingual>
              ) : t.dashboard.needHelpCta}
            </Link>''',
    "need-help-cta",
)

# ---- Stage simulation ----
replace_once(
    '<h2 className="mt-3 font-display text-2xl sm:text-[1.8rem] font-bold text-cozy-ink">\n                {t.dashboard.stageSimulation}\n              </h2>',
    '''<h2 className="mt-3 font-display text-2xl sm:text-[1.8rem] font-bold text-cozy-ink">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.stageSimulation} size="xl">
                    {t.dashboard.stageSimulation}
                  </Bilingual>
                ) : t.dashboard.stageSimulation}
              </h2>''',
    "stage-sim-title",
)

replace_once(
    '<p className="mt-2 max-w-[520px] text-sm font-semibold text-cozy-ink/70">\n                {t.dashboard.stageSimulationSubtitle}\n              </p>',
    '''<div className="mt-2 max-w-[520px] text-sm font-semibold text-cozy-ink/70">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.stageSimulationSubtitle} size="sm">
                    {t.dashboard.stageSimulationSubtitle}
                  </Bilingual>
                ) : t.dashboard.stageSimulationSubtitle}
              </div>''',
    "stage-sim-subtitle",
)

# ---- Recent activity (no full snippet here, simpler matches will be done below) ----

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("\nDONE")
