#!/usr/bin/env python3
"""Patch multiple-choice component to use t.practice.* + Bilingual."""
FILE = "/Users/parsasiddighi/Desktop/Mindlabs/AI taalcoach/components/features/exercises/multiple-choice.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Add imports
old_import = 'import type { ParsedMultipleChoice } from "@/lib/validations/exercise";\nimport { submitExerciseAction } from "@/app/(dashboard)/exercise/[id]/actions";'
new_import = 'import type { ParsedMultipleChoice } from "@/lib/validations/exercise";\nimport { submitExerciseAction } from "@/app/(dashboard)/exercise/[id]/actions";\nimport { useLocale } from "@/lib/i18n/LocaleProvider";\nimport { nlSources } from "@/lib/i18n/nlSources";\nimport { Bilingual } from "@/components/ui/bilingual";'
assert old_import in content, "import block not found"
content = content.replace(old_import, new_import)

# 2) useLocale hook + showNlRef + locale
content = content.replace(
    '  const router = useRouter();\n  const [selected, setSelected] = useState<number | null>(null);',
    '  const router = useRouter();\n  const { t, showNlRef } = useLocale();\n  const [selected, setSelected] = useState<number | null>(null);'
)

# 3) submitFailed toast
content = content.replace(
    'toast.error(r.error ?? "Inzenden mislukt.");',
    'toast.error(r.error ?? (showNlRef ? nlSources.practice.submitFailed : t.practice.submitFailed ?? "Submit failed."));'
)

# 4) feedbackGood / feedbackAlmost toast
content = content.replace(
    'r.correct ? "Goed gedaan!" : "Bijna goed, probeer het nog een keer.",',
    'r.correct ? (showNlRef ? nlSources.practice.feedbackGood : t.practice.feedbackGood) : (showNlRef ? nlSources.practice.feedbackAlmost : t.practice.feedbackRetry),'
)

# 5) xpEarned description - this is template literal with XP and level up
old_desc = '''`Je hebt ${r.xpEarned} XP verdient${
            r.leveledUp ? ` \u2014 nieuw level: ${r.newLevel}!` : ""
          }.`'''
# Just use bilingual: have nl as xpEarned + levelUp combined
def xp_replacer(match):
    return '''(showNlRef
                ? `${nlSources.practice.xpEarned(r.xpEarned)}${r.leveledUp ? ` \u2014 ${nlSources.practice.levelUp(r.newLevel!)}` : ""}.`
                : `${t.practice.rewardXp(r.xpEarned).replace("+", "")} earned${r.leveledUp ? ` \u2014 Level up to ${r.newLevel}!` : ""}.`)'''
content = content.replace(old_desc, xp_replacer("dummy"))

# 6) Multiple choice badge
content = content.replace(
    '<Badge variant="outline">Multiple choice</Badge>',
    '''<Badge variant="outline">
            {showNlRef ? (
              <Bilingual nl={nlSources.practice.multipleChoiceBadge} size="sm" variant="inline">
                Multiple choice
              </Bilingual>
            ) : "Multiple choice"}
          </Badge>'''
)

# 7) Score badge + XP badge + Level up badge
content = content.replace(
    '<Badge variant={result.correct ? "success" : "warning"}>\n                Score {result.score}%\n              </Badge>',
    '''<Badge variant={result.correct ? "success" : "warning"}>
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.scorePercent(result.score)} size="sm" variant="inline">
                    {`Score ${result.score}%`}
                  </Bilingual>
                ) : `Score ${result.score}%`}
              </Badge>'''
)

content = content.replace(
    '<Badge variant="outline">+{result.xpEarned} XP</Badge>',
    '''<Badge variant="outline">
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.rewardXp(result.xpEarned)} size="sm" variant="inline">
                    {t.practice.rewardXp(result.xpEarned)}
                  </Bilingual>
                ) : t.practice.rewardXp(result.xpEarned)}
              </Badge>'''
)

content = content.replace(
    '<Badge variant="default">Level up! Level {result.newLevel}</Badge>',
    '''<Badge variant="default">
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.levelUp(result.newLevel!)} size="sm" variant="inline">
                    {t.practice.rewardXp(0).replace("+0 XP", `Level up to ${result.newLevel}!`)}
                  </Bilingual>
                ) : `Level up to ${result.newLevel}!`}
              </Badge>'''
)

# 8) Correct answer + explanation
content = content.replace(
    '<span className="font-semibold">Juiste antwoord:</span>{" "}',
    '''<span className="font-semibold">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.practice.correctAnswer} size="sm" variant="inline">
                      Correct answer:
                    </Bilingual>
                  ) : "Correct answer:"}
                </span>{" "}'''
)

content = content.replace(
    '<span className="font-semibold text-foreground">Uitleg:</span>{" "}',
    '''<span className="font-semibold text-foreground">
                  {showNlRef ? (
                    <Bilingual nl={nlSources.practice.explanationLabel} size="sm" variant="inline">
                      Explanation:
                    </Bilingual>
                  ) : "Explanation:"}
                </span>{" "}'''
)

# 9) Submit button
content = content.replace(
    'Controleer antwoord\n              </Button>',
    '''{showNlRef ? (
                  <Bilingual nl={nlSources.practice.ctaCheckAnswer} size="md" variant="inline">
                    Check answer
                  </Bilingual>
                ) : "Check answer"}
              </Button>'''
)

# 10) Server saved hint
content = content.replace(
    '<span className="text-xs text-muted-foreground">\n                Je score en XP worden opgeslagen op de server.\n              </span>',
    '''<span className="text-xs text-muted-foreground">
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.serverSavedHint} size="sm">
                    Your score and XP are saved on the server.
                  </Bilingual>
                ) : "Your score and XP are saved on the server."}
              </span>'''
)

# 11) Retry button
content = content.replace(
    '<Button variant="outline" onClick={reset}>\n                Opnieuw proberen\n              </Button>',
    '''<Button variant="outline" onClick={reset}>
                {showNlRef ? (
                  <Bilingual nl={nlSources.practice.ctaRetry} size="md" variant="inline">
                    Try again
                  </Bilingual>
                ) : "Try again"}
              </Button>'''
)

# 12) Next exercise button
content = content.replace(
    'Volgende oefening\n                    <ChevronRight className="ml-1 h-4 w-4" />',
    '''{showNlRef ? (
                      <Bilingual nl={nlSources.practice.ctaNextExercise} size="md" variant="inline">
                        Next exercise
                      </Bilingual>
                    ) : "Next exercise"}
                    <ChevronRight className="ml-1 h-4 w-4" />'''
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("OK — multiple-choice patched")
