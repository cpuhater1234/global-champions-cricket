from pathlib import Path
import hashlib
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text();assert hashlib.sha256(h.encode()).hexdigest()=='5485f41aa66a95d04e79c69ed41e76bc08277968e5681c7bde2f3de869b443e3'
for n in ['screens.js','workspace.css']:
 old=(q/(n+'.baseline')).read_text();assert h.count(old)==1;h=h.replace(old,(r/'v8/ui'/n).read_text(),1)
for n in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','qa/home-format-20261026/candidate.html']:(r/n).write_text(h)
print(hashlib.sha256(h.encode()).hexdigest())
