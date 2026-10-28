from pathlib import Path
import hashlib,re
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text()
assert hashlib.sha256(h.encode()).hexdigest()=='2010a5e1868a13138644d2d33d922ceba839889888e391ea78cbd048f122a661'
for n in ['roles.js','components.js','controller.js','data.js','screens.js','workspace.css']:
 old=(q/(n+'.baseline')).read_text();assert h.count(old)==1,n;h=h.replace(old,(r/'v8/ui'/n).read_text(),1)
assert hashlib.sha256(h.encode()).hexdigest()=='fbab71f7fc017e7ca41568a2c4d1e0473f460e12816222c63b7963b4705da1e3'
for n in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','qa/presentation-20261026/candidate.html']:(r/n).write_text(h)
print(hashlib.sha256(h.encode()).hexdigest())
