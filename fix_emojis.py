#!/usr/bin/env python3
"""Fix emojis in sector/types.ts (they got corrupted by shell escaping)."""
import re

FILE = "/Users/parsasiddighi/Desktop/Mindlabs/AI taalcoach/lib/sector/types.ts"

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

EMOJI_FIXES = {
    "ALGEMEEN": "\U0001F310",
    "ZORG": "\U0001F489",
    "SPORT": "\U0001F4AA",
    "ICT": "\U0001F4BB",
    "HORECA": "\U0001F37D",   # plate
    "BOUW": "\U0001F3D7",     # construction
    "HANDEL": "\U0001F4E6",
    "ONDERWIJS": "\U0001F4DA",
    "TECHNIEK": "\u2699",      # gear
    "UITERLIJKE_VERZORGING": "\U0001F487",
}

pattern = re.compile(r'(code:\s*"([A-Z_]+)".*?icon:\s*)"[^"]*"(,)', re.DOTALL)

def fix_icon(match):
    prefix, code, suffix = match.group(1), match.group(2), match.group(3)
    emoji = EMOJI_FIXES.get(code, "\U0001F4C1")
    return f'{prefix}"{emoji}"{suffix}'

new_content = pattern.sub(fix_icon, content)

with open(FILE, "w", encoding="utf-8") as f:
    f.write(new_content)

print("OK")
print(new_content)
