from pathlib import Path
import re,hashlib,json
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text();base=h;assert hashlib.sha256(h.encode()).hexdigest()=='e28ccd173f92069cb690d27f6b64224c072f4b56bb061d00428edadc5a5e7af0'
for n in ['controller.js','roles.js']:
 old=(q/(n+'.baseline')).read_text();assert h.count(old)==1,n;h=h.replace(old,(r/'v8/ui'/n).read_text(),1)
scripts=lambda s:re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',s);changed=[i for i,(a,b)in enumerate(zip(scripts(base),scripts(h)))if a!=b];assert changed==[13,19],changed
for p in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html']:(r/p).write_text(h)
(q/'build.json').write_text(json.dumps({'sha256':hashlib.sha256(h.encode()).hexdigest(),'changedUiScripts':changed,'engineUnchanged':True},indent=2));print(changed)
