from pathlib import Path
import re

p = Path("qa/scratch_build_final.mjs")
src = p.read_text(encoding="utf-8")

# In backtick template literals only: replace literal backslash-n (\\n as two chars)
# with a real newline. Single-quoted JS strings already decode correctly at runtime.
def fix(m):
    body = m.group(1)
    return "const " + m.group(0)[len("const "):]

pat = re.compile(r"const (old\w+) = `[\s\S]*?`;", re.M)

def fix_backtick(m):
    body = m.group(0)
    # only replace the escape sequence backslash+n with newline inside the template
    fixed = body.replace("\\n", "\n")
    return fixed

src2 = pat.sub(fix_backtick, src)
p.write_text(src2, encoding="utf-8")
print("backtick literals normalized")
