# Convert remaining multi-line backtick templates in the builder to be CRLF-safe.
from pathlib import Path
import re

p = Path("qa/scratch_build_final.mjs")
src = p.read_text(encoding="utf-8")

# find all `const oldX = \`...\`;` template literals and wrap their use with crlf()
# simpler approach: add a global crlf() wrapper on every content.replace(old...)
# Instead: rewrite the file so every backtick "old" template defined as old* gets crlf() applied.
names = re.findall(r"const (old\w+) = `", src)
print("old* templates found:", names)

for name in names:
    # replace "content.includes(name)" with "content.includes(crlf(name))"
    src = src.replace(f"content.includes({name})", f"content.includes(crlf({name}))")
    src = src.replace(f"content.replace({name},", f"content.replace(crlf({name}),")

p.write_text(src, encoding="utf-8")
print("patched")
