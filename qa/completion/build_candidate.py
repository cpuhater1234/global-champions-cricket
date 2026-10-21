"""Reproduce the annual-flow checkpoint on the verified core-loop engine."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[2]
base = root / 'game/gcc_v8_core_loop.html'
assert hashlib.sha256(base.read_bytes()).hexdigest() == 'a9ea493eebb4ddaa6146eaaf6ece06a3e4d1e0eb85cfd00edda99b11c21f0189'
html = base.read_text()
for name, marker in {'offseason': 'X.offseasonMarket=()=>', 'controller': "bind('comparePlayers'"}.items():
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
output = root / 'game/gcc_v8_product_candidate.html'
output.write_text(html)
print(hashlib.sha256(output.read_bytes()).hexdigest())
