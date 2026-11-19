# Deduplicate the crlf() declaration: keep only the FIRST occurrence.
from pathlib import Path
import re

p = Path("qa/scratch_build_final.mjs")
src = p.read_text(encoding="utf-8")

decl = "// Frozen release uses CRLF line endings; builder string literals use \\n.\nconst crlf = s => s.replace(/\\n/g, '\\r\\n');\n"
first = src.find(decl)
print("first decl at:", first)

# remove all later duplicate declarations
count = src.count(decl)
print("declarations:", count)
start = first + len(decl)
while True:
    j = src.find(decl, start)
    if j < 0:
        break
    src = src[:j] + src[j + len(decl):]
    start = j
print("after dedupe:", src.count(decl))

p.write_text(src, encoding="utf-8")
print("written")
