from pathlib import Path
import hashlib
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text()
assert hashlib.sha256(h.encode()).hexdigest()=='8ba0fc8ba43e944efdf8de025f251aa59be073d21ff67ca590cd4c59f013301d'
for n in ['roles.js','screens.js','workspace.css','components.js']:
 old=(q/(n+'.baseline')).read_text();assert h.count(old)==1,n;h=h.replace(old,(r/'v8/ui'/n).read_text(),1)
for n in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','qa/analysis-coverage-20261025/candidate.html']:(r/n).write_text(h)
print(hashlib.sha256(h.encode()).hexdigest())
