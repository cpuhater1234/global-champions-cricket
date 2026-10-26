from pathlib import Path
import hashlib,re,json
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text();assert hashlib.sha256(h.encode()).hexdigest()=='13da26e2ff1104b6299d026a5f271c2fc9bdad20ecb1febd2ba1ce8574debb70'
base=h
for n in ['controller.js','workspace.css']:
 old=(q/(n+'.baseline')).read_text();assert h.count(old)==1,n;h=h.replace(old,(r/'v8/ui'/n).read_text(),1)
blocks=lambda s:re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',s)
changed=[i for i,(a,b)in enumerate(zip(blocks(base),blocks(h)))if a!=b];assert changed==[19],changed
for n in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','qa/guides-20261026/candidate.html']:(r/n).write_text(h)
r={'hash':hashlib.sha256(h.encode()).hexdigest(),'changedScripts':changed,'engineChanged':False};(q/'build.json').write_text(json.dumps(r,indent=2));print(r)
