"""Reproduce the annual-flow checkpoint on the verified core-loop engine."""
from pathlib import Path
import hashlib
import re

root = Path(__file__).resolve().parents[2]
base = root / 'game/gcc_v8_core_loop.html'
assert hashlib.sha256(base.read_bytes()).hexdigest() == 'a9ea493eebb4ddaa6146eaaf6ece06a3e4d1e0eb85cfd00edda99b11c21f0189'
html = base.read_text()
for name, marker in {'offseason': 'X.offseasonMarket=()=>', 'controller': "bind('comparePlayers'", 'data': 'X.playerRead=p=>', 'screens': 'X.orderReveal=', 'match_story': 'X.ballReveal=()=>', 'components': 'const actionIcons=', 'roles': 'X.roleLine='}.items():
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
icon=(root/'v8/assets/tabler/cricket.svg').read_text()
body=re.search(r'<svg[^>]*>([\s\S]*?)</svg>',icon)[1]
html=re.sub(r'(<symbol id="g8icon-cricket"[^>]*>)[\s\S]*?(</symbol>)',lambda m:m[1]+body+m[2],html,count=1)
# Supplied cricket illustrations retain their traced contours and inherit UI ink.
for name in ['stumps','cricket-ball']:
    asset=(root/f'v8/assets/tabler/{name}.svg').read_text()
    inner=re.search(r'<svg[^>]*>([\s\S]*?)</svg>',asset)[1]
    symbol=f'<symbol id="g8icon-{name}" viewBox="0 0 24 24">{inner}</symbol>'
    html=html.replace('</symbol>', '</symbol>'+symbol,1)
# Structural career feedback and a saved, explicit previous-XI choice.
start = html.index('window.GCC8_DEVELOPMENT=(()=>{')
end = html.index('\n})();', start) + len('\n})();')
html = html[:start] + (root/'v8/core/development.js').read_text().strip() + html[end:]
old = 'const careerBefore=window.GCC8_DEVELOPMENT.captureBefore(state.pool,state.year,state.teams);'
assert html.count(old)==1
html = html.replace(old, 'state.dynasty.previousXI={year:state.year,ids:[...state.xi],order:[...state.battingOrder]};'+old)
start = html.index('  function pickAssetValue(round)')
end = html.index('  function transferUserPick(',start)
html = html[:start] + '  ' + (root/'v8/core/draft_pick_value.js').read_text().strip() + '\n' + html[end:]
html = html.replace('offered+=pickAssetValue(pick);','offered+=pickAssetValue(pick,club);')
html = html.replace('pickValue:r=>pickAssetValue(r)', 'pickValue:(r,c)=>pickAssetValue(r,c)')
anchor = 'window.GCC8_PROFILES=(()=>{'
assert html.count(anchor)==1
html = html.replace(anchor,(root/'v8/core/arrival_calibration.js').read_text().strip()+'\n'+anchor)
anchor = 'const p=template(m,next++);p.available=m.debutYear<=2008;'
assert html.count(anchor)==1
html = html.replace(anchor,'const p=template(window.GCC8_ARRIVAL_CALIBRATION.meta(m),next++);p.available=m.debutYear<=2008;')
anchor = 'const p=template(m,next++);p.available=null;'
assert html.count(anchor)==1
html = html.replace(anchor,'const p=template(window.GCC8_ARRIVAL_CALIBRATION.meta(m),next++);p.available=null;')
anchor = 'if(!profile)return p;const original={...p};'
assert html.count(anchor)==1
html = html.replace(anchor,'if(!profile)return p;profile=window.GCC8_ARRIVAL_CALIBRATION.profile(profile,p);const original={...p};')
output = root / 'game/gcc_v8_product_candidate.html'
output.write_text(html)
print(hashlib.sha256(output.read_bytes()).hexdigest())
