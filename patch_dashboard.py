#!/usr/bin/env python3
"""Replace the hero section in _DashboardClient.tsx with Bilingual versions."""
import re

FILE = "/Users/parsasiddighi/Desktop/Mindlabs/AI taalcoach/app/(dashboard)/dashboard/_DashboardClient.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Find the hero chips + welcome + CTA section.
# Use literal string fragments without emoji to avoid encoding issues.
old_hero_chips = '''<div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="tc-chip-pink">
                <FireIcon className="h-3.5 w-3.5" />
                {t.dashboard.stat7day}
              </span>
              <span className="tc-chip-sand">
                <Sparkles className="h-3.5 w-3.5" />
                {t.dashboard.statLevelProgress(level, 550, level + 1)}
              </span>
            </div>'''

new_hero_chips = '''<div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="tc-chip-pink">
                <FireIcon className="h-3.5 w-3.5" />
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.stat7day} size="sm" variant="inline">
                    {t.dashboard.stat7day}
                  </Bilingual>
                ) : (
                  t.dashboard.stat7day
                )}
              </span>
              <span className="tc-chip-sand">
                <Sparkles className="h-3.5 w-3.5" />
                {showNlRef ? (
                  <Bilingual
                    nl={nlSources.dashboard.statLevelProgress(level, 550, level + 1)}
                    size="sm"
                    variant="inline"
                  >
                    {t.dashboard.statLevelProgress(level, 550, level + 1)}
                  </Bilingual>
                ) : (
                  t.dashboard.statLevelProgress(level, 550, level + 1)
                )}
              </span>
            </div>'''

if old_hero_chips not in content:
    print("ERROR: hero_chips not found")
    raise SystemExit(1)
content = content.replace(old_hero_chips, new_hero_chips, 1)

# Welcome heading: replace the {t.dashboard.welcome(userName)} (with whatever emoji) block
# Use a regex that matches the line + emoji
old_welcome_pattern = re.compile(
    r'<h1 className="font-display text-3xl sm:text-\[2\.2rem\] font-bold tracking-tight text-cozy-ink">\s*\{t\.dashboard\.welcome\(userName\)\}[^<]*</h1>',
    re.DOTALL,
)
new_welcome = '''<h1 className="font-display text-3xl sm:text-[2.2rem] font-bold tracking-tight text-cozy-ink">
              {showNlRef ? (
                <Bilingual nl={`${nlSources.dashboard.welcome} ${userName}`} size="xl">
                  {t.dashboard.welcome(userName)}
                </Bilingual>
              ) : (
                <>{t.dashboard.welcome(userName)} ��</>
              )}
            </h1>'''

if not old_welcome_pattern.search(content):
    print("ERROR: welcome h1 not found")
    raise SystemExit(1)
content = old_welcome_pattern.sub(new_welcome, content, count=1)

# welcomeBack <p>
old_wb = '<p className="mt-2 max-w-[560px] text-base font-semibold text-cozy-ink/70">\n              {t.dashboard.welcomeBack}\n            </p>'
new_wb = '''<div className="mt-2 max-w-[560px] text-base font-semibold text-cozy-ink/70">
              {showNlRef ? (
                <Bilingual nl={nlSources.dashboard.welcomeBack} size="md">
                  {t.dashboard.welcomeBack}
                </Bilingual>
              ) : (
                t.dashboard.welcomeBack
              )}
            </div>'''
if old_wb not in content:
    print("ERROR: welcomeBack p not found")
    raise SystemExit(1)
content = content.replace(old_wb, new_wb, 1)

# Hero CTAs
old_ctas = '''<Link href="/lessons" className="tc-sunset-btn">
                {t.dashboard.heroCta1}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/practice" className="tc-outline-btn">
                {t.dashboard.heroCta2}
              </Link>'''
new_ctas = '''<Link href="/lessons" className="tc-sunset-btn">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.heroCta1} size="md" variant="inline">
                    {t.dashboard.heroCta1}
                  </Bilingual>
                ) : (
                  t.dashboard.heroCta1
                )}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/practice" className="tc-outline-btn">
                {showNlRef ? (
                  <Bilingual nl={nlSources.dashboard.heroCta2} size="md" variant="inline">
                    {t.dashboard.heroCta2}
                  </Bilingual>
                ) : (
                  t.dashboard.heroCta2
                )}
              </Link>'''
if old_ctas not in content:
    print("ERROR: hero CTAs not found")
    raise SystemExit(1)
content = content.replace(old_ctas, new_ctas, 1)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("OK — hero section + welcome + CTAs updated")
