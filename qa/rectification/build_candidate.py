"""Reproduce this UI-only checkpoint without rebuilding the frozen engine."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[2]
base = root / 'game/gcc_v8_rendering_clarity.html'
assert hashlib.sha256(base.read_bytes()).hexdigest() == '5fc59c8e40456faa9fe4571403aef45ef76da8837732b7392ba27947150cb582'
html = base.read_text()
modules = {'roles': 'X.comparisonCandidates=id=>', 'screens': 'v.team=()=>', 'controller': "bind('comparePlayers'"}
for name, marker in modules.items():
    matches = [m for m in re.finditer(r'(<script\b[^>]*>)([\s\S]*?)(</script>)', html) if marker in m[2]]
    assert len(matches) == 1, name
    match = matches[0]
    source = (root / f'v8/ui/{name}.js').read_text().strip()
    old = match[2]
    prefix, suffix = old[:len(old)-len(old.lstrip())], old[len(old.rstrip()):]
    html = html[:match.start(2)] + prefix + source + suffix + html[match.end(2):]
output = root / 'game/gcc_v8_decision_clarity.html'
output.write_text(html)
print(hashlib.sha256(output.read_bytes()).hexdigest())
