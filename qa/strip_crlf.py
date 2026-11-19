# Remove ALL crlf() wrappers in the builder: the release is LF-only after the
# git normalization step, so raw literals match directly.
from pathlib import Path
import re

p = Path("qa/scratch_build_final.mjs")
s = p.read_text(encoding="utf-8")
before = s.count("crlf(")
s = re.sub(r"crlf\((old\w+)\)", r"\1", s)
s = s.replace('const crlf = s => s.replace(/\\n/g, \'\\r\\n\');\n', '')
after = s.count("crlf(")
print("crlf uses:", before, "->", after)
p.write_text(s, encoding="utf-8")
