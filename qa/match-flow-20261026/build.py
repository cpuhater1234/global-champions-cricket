from pathlib import Path
import hashlib,json,re
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text();assert hashlib.sha256(h.encode()).hexdigest()=='fbab71f7fc017e7ca41568a2c4d1e0473f460e12816222c63b7963b4705da1e3'
for n in ['v8/ui/match_story.js','v8/ui/controller.js','v8/ui/screens.js','v8/ui/components.js','v8/ui/data.js','v8/ui/workspace.css','v8/engine/dynasty.js']:
 old=(q/(Path(n).name+'.baseline')).read_text();assert h.count(old)==1,n;h=h.replace(old,(r/n).read_text(),1)
assert (r/'v8/domain/trade_packages.js').read_text() in (r/'v8/engine/dynasty.js').read_text(),'Trade package source/injected engine drift'
for n in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','qa/match-flow-20261026/candidate.html']:(r/n).write_text(h)
(q/'build.json').write_text(json.dumps({'hash':hashlib.sha256(h.encode()).hexdigest(),'baseline':'fbab71f7fc017e7ca41568a2c4d1e0473f460e12816222c63b7963b4705da1e3'},indent=2));print(hashlib.sha256(h.encode()).hexdigest())
