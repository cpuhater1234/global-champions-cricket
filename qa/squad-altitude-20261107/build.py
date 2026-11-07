from pathlib import Path
import hashlib,re,json,subprocess
from lxml import html
q=Path(__file__).resolve().parent;r=q.parents[1];w=r.parent
p=r/'v8/ui/floodlit-compat.css';before=p.read_text()
old='#g8stage#g8stage#g8stage :is(.g8sheet,.g8annualhero,.g8annualdevelopment,.g8departureguide,.gccuiAllowance,.gccuiFixture,.gccuiMatchPreparation,.gccuiLatestResult,.gccuiMatchLinks,.gccuiSummary,.g8dressingroom,.g8reviewsummary,.g8development,.g8teamread){background:linear-gradient(155deg,var(--gcc-raised),var(--gcc-panel) 60%)!important;border-color:var(--gcc-line)!important}'
new=old.replace('.g8annualhero,.g8annualdevelopment,.g8departureguide,','')+'\n/* Squad update: the decision surface owns club identity; supporting detail is inset. */\n#g8stage#g8stage#g8stage .g8annualhero{background:linear-gradient(120deg,color-mix(in srgb,var(--gcc-accent) 16%,var(--gcc-raised)),var(--gcc-panel) 72%)!important;border-color:var(--gcc-line)!important;border-top-color:var(--vx-signal)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 18px 40px -26px #000!important}\n#g8stage#g8stage#g8stage :is(.g8annualdevelopment,.g8departureguide){background:var(--gcc-inset)!important;border-color:var(--gcc-line)!important}'
assert before.count(old)==1
(q/'floodlit-compat.css.before').write_text(before)
p.write_text(before.replace(old,new))
base=(w/'deliver/GCC_v108.html').read_text();assert hashlib.sha256(base.encode()).hexdigest()=='48b8896918a6a51b8604f82e1b293496a0455745066cbec5fa5415129d69bdfc'
assert base.count(old)==1
candidate=base.replace(old,new)
scripts=lambda s:re.findall(r'<script\b[^>]*>(.*?)</script>',s,re.S)
assert scripts(base)==scripts(candidate)
for i,s in enumerate(scripts(candidate)):
 t=q/f'check-{i}.js';t.write_text(s);subprocess.run(['node','--check',str(t)],check=True,capture_output=True)
a,b=html.fromstring(base),html.fromstring(candidate)
assert [e.get('id') for e in a.xpath('//style')]==[e.get('id') for e in b.xpath('//style')]
for e in b.xpath('//style'):assert (e.text or '').count('{')==(e.text or '').count('}')
assert a.xpath('//style[@id="gcc-composition-20261107"]/text()')==b.xpath('//style[@id="gcc-composition-20261107"]/text()')
for doc in (a,b):
 for e in doc.xpath('//style'):e.text=''
assert html.tostring(a)==html.tostring(b)
out=w/'deliver/GCC_v109.html';out.write_text(candidate)
report={'sha256':hashlib.sha256(candidate.encode()).hexdigest(),'bytes':out.stat().st_size,'parent':'GCC_v108.html','scriptsByteIdentical':True,'scriptsSyntaxChecked':len(scripts(candidate)),'markupAndAssetsIdentical':True,'homeCompositionIdentical':True,'newStyleBlocks':0,'scope':['g8annualhero','g8annualdevelopment','g8departureguide'],'nativeCandidateVerification':'pending download; v108 baseline inspected in Chrome','fullSourceBuild':'not run: partial checkout; exact owned CSS substitution'}
(q/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
(q/'changes.json').write_text(json.dumps([{'path':'v8/ui/floodlit-compat.css','old':old,'new':new}],indent=2)+'\n')
print(json.dumps(report))
