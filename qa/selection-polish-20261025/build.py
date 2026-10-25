from pathlib import Path
import hashlib,re
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text();assert hashlib.sha256(h.encode()).hexdigest()=='22960c8b1ac875d7e905177072fd7319cbf5d2bd1093e453af682a2bb2d625b7'
for n in ['roles.js','screens.js','components.js','workspace.css']:
 old=(q/(n+'.baseline')).read_text();assert h.count(old)==1,n;h=h.replace(old,(r/'v8/ui'/n).read_text(),1)
for n in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','qa/selection-polish-20261025/candidate.html']:(r/n).write_text(h)
print(hashlib.sha256(h.encode()).hexdigest())
