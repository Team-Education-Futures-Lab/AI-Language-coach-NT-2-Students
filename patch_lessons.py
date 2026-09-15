#!/usr/bin/env python3
"""Patch _LessonsClient.tsx to use Bilingual on hardcoded NL strings."""
import re

FILE = "/Users/parsasiddighi/Desktop/Mindlabs/AI taalcoach/app/(dashboard)/lessons/_LessonsClient.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# 1) Import Bilingual + nlSources
old_import = 'import { cn } from "@/lib/utils";\nimport { useLocale } from "@/lib/i18n/LocaleProvider";\nimport { useSector } from "@/lib/sector/SectorProvider";\nimport type { SectorCode } from "@/lib/sector/types";'
new_import = 'import { cn } from "@/lib/utils";\nimport { useLocale } from "@/lib/i18n/LocaleProvider";\nimport { useSector } from "@/lib/sector/SectorProvider";\nimport { getSectorLabel } from "@/lib/i18n/dictionaries";\nimport { nlSources } from "@/lib/i18n/nlSources";\nimport { Bilingual } from "@/components/ui/bilingual";\nimport type { SectorCode } from "@/lib/sector/types";'
assert old_import in content, "import block not found"
content = content.replace(old_import, new_import)

# 2) useLocale + showNlRef + locale
content = content.replace(
    "const { t } = useLocale();\n  const { sector, sectorCode, sectors } = useSector();",
    "const { t, showNlRef, locale } = useLocale();\n  const { sector, sectorCode, sectors } = useSector();"
)

# 3) sector.label on chip in header → use Bilingual
content = content.replace(
    '                <span className="text-sm leading-none">{sector.icon}</span>\n                {sector.label}\n              </span>',
    '                <span className="text-sm leading-none">{sector.icon}</span>\n                {(() => {\n                  const sL = getSectorLabel(locale, sector.dictKey);\n                  const sN = getSectorLabel("nl", sector.dictKey);\n                  return showNlRef ? (\n                    <Bilingual nl={sN} size="sm" variant="inline">{sL}</Bilingual>\n                  ) : sL;\n                })()}\n              </span>'
)

# 4) "ERK B1 • {sectors.length} vakgebieden"
content = content.replace(
    '<span className="tc-chip-teal">ERK B1 • {sectors.length} vakgebieden</span>',
    '''<span className="tc-chip-teal">
                {showNlRef ? (
                  <Bilingual
                    nl={`ERK B1 • ${sectors.length} vakgebieden`}
                    size="sm"
                    variant="inline"
                  >
                    {`ERK B1 • ${sectors.length} sectors`}
                  </Bilingual>
                ) : (
                  `ERK B1 • ${sectors.length} sectors`
                )}
              </span>'''
)

# 5) lessons.title
content = content.replace(
    '            <h1 className="font-display text-2xl sm:text-3xl font-bold text-cozy-ink">\n              {t.lessons.title}\n            </h1>',
    '''<h1 className="font-display text-2xl sm:text-3xl font-bold text-cozy-ink">
              {showNlRef ? (
                <Bilingual nl={nlSources.lessons.title} size="xl">{t.lessons.title}</Bilingual>
              ) : t.lessons.title}
            </h1>'''
)

# 6) lessons.subtitle
content = content.replace(
    '            <p className="mt-1 text-sm font-semibold text-cozy-ink/65 max-w-[620px]">\n              {t.lessons.subtitle}\n            </p>',
    '''<div className="mt-1 text-sm font-semibold text-cozy-ink/65 max-w-[620px]">
              {showNlRef ? (
                <Bilingual nl={nlSources.lessons.subtitle} size="sm">{t.lessons.subtitle}</Bilingual>
              ) : t.lessons.subtitle}
            </div>'''
)

# 7) newLessonCta button
content = content.replace(
    '          <Link href="/lessons/new" className="tc-sunset-btn whitespace-nowrap">\n            <Plus className="h-4 w-4" />\n            {t.lessons.newLessonCta}\n          </Link>',
    '''<Link href="/lessons/new" className="tc-sunset-btn whitespace-nowrap">
            <Plus className="h-4 w-4" />
            {showNlRef ? (
              <Bilingual nl={nlSources.lessons.newLessonCta} size="md" variant="inline">{t.lessons.newLessonCta}</Bilingual>
            ) : t.lessons.newLessonCta}
          </Link>'''
)

# 8) sortBy chip - hardcoded "Meest recent"
content = content.replace(
    '            <button type="button" className="tc-chip tc-chip-ink !px-3">\n              <SortAsc className="h-3.5 w-3.5" />\n              Meest recent\n            </button>',
    '''<button type="button" className="tc-chip tc-chip-ink !px-3">
              <SortAsc className="h-3.5 w-3.5" />
              {showNlRef ? (
                <Bilingual nl="Meest recent" size="sm" variant="inline">Most recent</Bilingual>
              ) : "Most recent"}
            </button>'''
)

# 9) empty state
content = content.replace(
    '''<h3 className="mt-2 font-display text-xl font-bold text-cozy-ink">
                Geen resultaten
              </h3>
              <p className="mt-1 text-sm font-semibold text-cozy-ink/60">
                Pas je filters aan of wis je zoekopdracht.
              </p>''',
    '''<h3 className="mt-2 font-display text-xl font-bold text-cozy-ink">
                {showNlRef ? (
                  <Bilingual nl="Geen resultaten" size="lg">No results</Bilingual>
                ) : "No results"}
              </h3>
              <div className="mt-1 text-sm font-semibold text-cozy-ink/60">
                {showNlRef ? (
                  <Bilingual nl="Pas je filters aan of wis je zoekopdracht." size="sm">
                    Adjust your filters or clear your search.
                  </Bilingual>
                ) : "Adjust your filters or clear your search."}
              </div>'''
)

# 10) Favoriet aria-label
content = content.replace(
    'aria-label="Favoriet"',
    'aria-label={showNlRef ? (t.locale === "nl" ? "Favoriet" : "Favorite") : "Favorite"}'
)

# 11) "Voortgang XX%" + "+YY XP" hardcoded
content = content.replace(
    '                        <span>Voortgang {l.progress}%</span>',
    '''<span>
                          {showNlRef ? (
                            <Bilingual nl={`Voortgang ${l.progress}%`} size="sm" variant="inline">
                              {`Progress ${l.progress}%`}
                            </Bilingual>
                          ) : `Progress ${l.progress}%`}
                        </span>'''
)

# 12) "+YY XP" hardcoded
content = content.replace(
    '                          +{l.xp} XP\n                        </span>',
    '''                          +{l.xp} {showNlRef ? (
                            <Bilingual nl="XP" size="sm" variant="inline">XP</Bilingual>
                          ) : "XP"}
                        </span>'''
)

# 13) "Hervatten" / "Starten"
content = content.replace(
    '                        {l.progress > 0 ? "Hervatten" : "Starten"}',
    'l.progress > 0 ? (showNlRef ? "Resume" : "Resume") : (showNlRef ? "Start" : "Start")'
)

# 14) Concept card "2 concepten"
content = content.replace(
    '                      2 concepten\n                    </span>',
    '''{showNlRef ? (
                        <Bilingual nl="2 concepten" size="sm" variant="inline">
                          2 drafts
                        </Bilingual>
                      ) : "2 drafts"}
                    </span>'''
)

# 15) recommendedPath aside list - the sector label is hardcoded in step 3
content = content.replace(
    '                  { p: 25,  label: "3. Jouw vakgebied: " + sector.label, c: "sand" },',
    '''{ p: 25,  label: `3. Jouw vakgebied: ${getSectorLabel(locale, sector.dictKey)}`, c: "sand" },'''
)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("OK — LessonsClient patched")
