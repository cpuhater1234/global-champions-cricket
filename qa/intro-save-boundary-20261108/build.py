from pathlib import Path
import hashlib,re,json,subprocess
from lxml import html
q=Path(__file__).resolve().parent;r=q.parents[1];w=r.parent
base=(w/'deliver/GCC_v110.html').read_text();assert hashlib.sha256(base.encode()).hexdigest()=='6cdff850bfeb0809cf8e74353b11db822765b12b12962e3b4563907186f5bfb2'
a=re.findall(r'<script\b[^>]*>(.*?)</script>',base,re.S)[19].rstrip('\n');b=(r/'v8/ui/controller.js').read_text().rstrip('\n');assert base.count(a)==1
new=base.replace(a,b,1)
scripts=lambda s:re.findall(r'<script\b[^>]*>(.*?)</script>',s,re.S)
x,y=scripts(base),scripts(new);assert len(x)==len(y)==20
changed=[i for i,(a,b) in enumerate(zip(x,y)) if a!=b];assert changed==[19],changed
for i,s in enumerate(y):
 p=q/f'check-{i}.js';p.write_text(s);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
x,y=html.fromstring(base),html.fromstring(new)
assert x.xpath('//style/text()')==y.xpath('//style/text()')
for doc in (x,y):
 for e in doc.xpath('//script'):e.text=''
assert html.tostring(x)==html.tostring(y)
assert 'Another open game has started a career.' not in new
out=w/'deliver/GCC_v111.html';out.write_text(new)
report={'parent':'GCC_v110.html','sha256':hashlib.sha256(new.encode()).hexdigest(),'bytes':out.stat().st_size,'changedScripts':changed,'scriptsSyntaxChecked':20,'allStylesMarkupAssetsUnchanged':True,'controllerTests':'16 passed including10 clean handler iterations; intro-back/Continue cases failed before fix','nativeCandidateVerification':'pending download; clean storage x10 and full two-tab stress not yet browser-certified','fullBuild':'not run: partial checkout; exact controller substitution'}
(q/'verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
