"""Reproduce the core-loop UI checkpoint on the verified frozen engine."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[2]
base = root / 'game/gcc_v8_decision_clarity.html'
assert hashlib.sha256(base.read_bytes()).hexdigest() == 'bc1a0a884e4666e16eb1e7039de246147d8aa1c103ef5b4a7c316bfbe292e41d'
html = base.read_text()
for name, marker in {'components': 'const playerCard=', 'screens': 'v.team=()=>'}.items():
    matches = [m for m in re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>', html) if marker in m[1]]
    assert len(matches) == 1, name
    m = matches[0]
    body = m[1]
    source = (root / f'v8/ui/{name}.js').read_text().strip()
    html = html[:m.start(1)] + body[:len(body)-len(body.lstrip())] + source + body[len(body.rstrip()):] + html[m.end(1):]
marker = '/* Modern arcade: a quiet field around one decision, with detail on demand. */'
assert html.count(marker) == 1
start = html.index(marker)
end = html.index('</style>', start)
old = html[start:end]
html = html[:start] + (root / 'v8/ui/workspace.css').read_text().strip() + old[len(old.rstrip()):] + html[end:]
output = root / 'game/gcc_v8_core_loop.html'
output.write_text(html)
print(hashlib.sha256(output.read_bytes()).hexdigest())
