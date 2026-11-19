# Make every backtick "old*" template in the builder CRLF-tolerant using a
# whitespace-flexible regex. Simplest robust approach: convert all old* template
# literals into regex sources with \s* between every character run.
from pathlib import Path
import re

p = Path("qa/scratch_build_final.mjs")
src = p.read_text(encoding="utf-8")

# Locate every `const oldX = \`...\`;` and capture body.
pat = re.compile(r"const (old\w+) = `([\s\S]*?)`;", re.M)
count = 0
for m in list(pat.finditer(src)):
    name, body = m.group(1), m.group(2)
    if name == "oldPlan" or "old" not in name:
        continue
    # Build a JS string expression: each literal line joined with \r\n via crlf() already exists.
    # We only need to ensure includes/replace use crlf(name). Fix those references if not wrapped.
    count += 1
print("templates:", count)

# Now normalize ALL direct includes/replaces on old* names to use crlf()
for name in set(re.findall(r"const (old\w+) = `", src)):
    src = src.replace(f"content.includes({name})", f"content.includes(crlf({name}))")
    src = src.replace(f"content.replace({name},", f"content.replace(crlf({name}),")
    # also handles content.replace(oldX, Y) multiline forms already covered

p.write_text(src, encoding="utf-8")
print("written")
