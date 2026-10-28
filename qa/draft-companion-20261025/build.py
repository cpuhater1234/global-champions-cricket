from pathlib import Path
import hashlib,json,re
q=Path(__file__).resolve().parent;root=q.parents[1];base=(q/'baseline.html').read_text();assert hashlib.sha256(base.encode()).hexdigest()=='7568403962160d660198867d75f6de487512817de0a339220264e7cf783eae45';h=base
for name in ['roles.js','screens.js','workspace.css']:
 old=(q/(name+'.baseline')).read_text();new=(root/'v8/ui'/name).read_text();assert h.count(old)==1,name;h=h.replace(old,new,1)
for p in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html']: (root/p).write_text(h)
(q/'candidate.html').write_text(h)
blocks=lambda s:[m[1]for m in re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',s)];changed=[i for i,(a,b)in enumerate(zip(blocks(base),blocks(h)))if a!=b]
r={'hash':hashlib.sha256(h.encode()).hexdigest(),'baselineHash':hashlib.sha256(base.encode()).hexdigest(),'changedScriptBlocks':changed,'gitBlob':hashlib.sha1(b'blob '+str(len(h.encode())).encode()+b'\0'+h.encode()).hexdigest(),'gameEngineOrSaveCodeChanged':False};(q/'build.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
