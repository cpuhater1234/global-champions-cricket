from pathlib import Path
import hashlib,re,json
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text();base=h
assert hashlib.sha256(h.encode()).hexdigest()=='669a6e0c2cba41f61af84c54652bbc003763e21eac6bec4732d347f85719ff9d'
for n in ['career.js','screens.js','controller.js','workspace.css']:
 old=(q/(n+'.baseline')).read_text();assert h.count(old)==1,n;h=h.replace(old,(r/'v8/ui'/n).read_text(),1)
blocks=lambda s:re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',s)
changed=[i for i,(a,b) in enumerate(zip(blocks(base),blocks(h))) if a!=b];assert changed==[16,17,19],changed
for n in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html']:(r/n).write_text(h)
(q/'build.json').write_text(json.dumps({'sha256':hashlib.sha256(h.encode()).hexdigest(),'changedScripts':changed,'engineChanged':False},indent=2));print('built',changed)
