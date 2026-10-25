from pathlib import Path
import hashlib,json,re
q=Path(__file__).resolve().parent;root=q.parents[1];base=(q/'baseline.html').read_text();assert hashlib.sha256(base.encode()).hexdigest()=='39ec4a2e9fafcfc15e4ac11f9fbc59bbc9756cde40b22f3d28873071a15ee2df';h=base
for n in ['roles.js','workspace.css']:
 old=(q/(n+'.baseline')).read_text();assert h.count(old)==1;h=h.replace(old,(root/'v8/ui'/n).read_text(),1)
for p in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html']:(root/p).write_text(h)
(q/'candidate.html').write_text(h)
blocks=lambda s:[m[1]for m in re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',s)];changed=[i for i,(a,b)in enumerate(zip(blocks(base),blocks(h)))if a!=b];assert changed==[13]
r={'hash':hashlib.sha256(h.encode()).hexdigest(),'baselineHash':hashlib.sha256(base.encode()).hexdigest(),'gitBlob':hashlib.sha1(b'blob '+str(len(h.encode())).encode()+b'\0'+h.encode()).hexdigest(),'changedScriptBlocks':changed,'engineAndSaveChanges':False};(q/'build.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
