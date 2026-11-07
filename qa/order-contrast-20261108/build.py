from pathlib import Path
import hashlib,re,json,subprocess
from lxml import html
q=Path(__file__).resolve().parent;r=q.parents[1];w=r.parent
base=(w/'deliver/GCC_v111.html').read_text();assert hashlib.sha256(base.encode()).hexdigest()=='e81d5e081bc4b7e8a60b5472e34e10e43b22af56dc28c42a528961c5987c5703'
new=base
for c in json.loads((q/'changes.json').read_text()):
 assert new.count(c['old'])==1;new=new.replace(c['old'],c['new'],1)
scripts=lambda s:re.findall(r'<script\b[^>]*>(.*?)</script>',s,re.S)
assert scripts(base)==scripts(new)
for i,s in enumerate(scripts(new)):
 p=q/f'check-{i}.js';p.write_text(s);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
a,b=html.fromstring(base),html.fromstring(new)
assert [e.get('id') for e in a.xpath('//style')]==[e.get('id') for e in b.xpath('//style')]
for doc in (a,b):
 for e in doc.xpath('//style'):e.text=''
assert html.tostring(a)==html.tostring(b)
out=w/'deliver/GCC_v112.html';out.write_text(new)
report={'parent':'GCC_v111.html','sha256':hashlib.sha256(new.encode()).hexdigest(),'bytes':out.stat().st_size,'scriptsSyntaxChecked':20,'scriptsMarkupAssetsUnchanged':True,'newStyleLayers':0,'scope':'draft-order card inherited text and rank/name/status rule in existing workspace.css','nativeCandidateVerification':'pending download; defect confirmed in v111 Chrome at390px','fullBuild':'not run: partial checkout; exact two source rule substitutions'}
(q/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
