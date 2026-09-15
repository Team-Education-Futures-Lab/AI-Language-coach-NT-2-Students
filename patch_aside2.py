#!/usr/bin/env python3
"""Stagegesprek chip + need-help CTA + stage-sim CTA + recent activity."""
import re

FILE = "/Users/parsasiddighi/Desktop/Mindlabs/AI taalcoach/app/(dashboard)/dashboard/_DashboardClient.tsx"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

# stagegesprek chip - hardcoded NL
old = '''<span className="tc-chip-sunset">
                <Bot className="h-3.5 w-3.5" />
                Stagegesprek
              </span>'''
new = '''<span className="tc-chip-sunset">
                <Bot className="h-3.5 w-3.5" />
                {showNlRef ? (
                  <Bilingual nl="Stagegesprek" size="sm" variant="inline">
                    Job Interview
                  </Bilingual>
                ) : "Job Interview"}
              </span>'''
if old in content:
    content = content.replace(old, new, 1)
    print("OK: stagegesprek-chip")
else:
    print("WARN: stagegesprek-chip")

# need-help CTA - emoji issue, find by partial
old_pat = re.compile(r'<Link href="/chat"[^>]*>\s*[^<]*\{t\.dashboard\.needHelpCta\}')
m = old_pat.search(content)
if m:
    s, e = m.span()
    # Replace this whole match with the bilingual version
    # We need the full element. Let's just look for the closing </Link> after
    close = content.find("</Link>", e)
    if close > 0:
        full_block = content[s:close + len("</Link>")]
        # replace inside with Bilingual
        new_block = re.sub(
            r'\{t\.dashboard\.needHelpCta\}',
            '(showNlRef ? (<Bilingual nl={nlSources.dashboard.needHelpCta} size="md" variant="inline">{t.dashboard.needHelpCta}</Bilingual>) : t.dashboard.needHelpCta)',
            full_block,
            count=1,
        )
        content = content[:s] + new_block + content[close + len("</Link>"):]
        print("OK: need-help-cta")

# stage-sim CTA
old_pat2 = re.compile(r'<Link href="/practice/1"[^>]*>\s*[^<]*\{t\.dashboard\.stageSimulationCta\}')
m = old_pat2.search(content)
if m:
    s, e = m.span()
    close = content.find("</Link>", e)
    if close > 0:
        full_block = content[s:close + len("</Link>")]
        new_block = re.sub(
            r'\{t\.dashboard\.stageSimulationCta\}',
            '(showNlRef ? (<Bilingual nl={nlSources.dashboard.stageSimulationCta} size="md" variant="inline">{t.dashboard.stageSimulationCta}</Bilingual>) : t.dashboard.stageSimulationCta)',
            full_block,
            count=1,
        )
        content = content[:s] + new_block + content[close + len("</Link>"):]
        print("OK: stage-sim-cta")

with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print("DONE")
