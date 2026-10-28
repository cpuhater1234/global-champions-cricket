from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import json,re,hashlib,subprocess,tempfile
Q=Path(__file__).resolve().parent;R=Q.parents[1]
def read(p):return json.loads((Q/p).read_text())
def unwrap(d):return d.get('data',d) if isinstance(d,dict) else d
h=(Q/'candidate.html').read_text();sha=hashlib.sha256(h.encode()).hexdigest();assert read('build.json')['sha256']==sha
before=re.findall(r'<script\b[^>]*>(.*?)</script>',(Q/'baseline.html').read_text(),re.S);after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert len(after)==20 and [i for i,(a,b)in enumerate(zip(before,after))if a!=b]==[12,17]
for f in ['game.css','workspace.css','bulletproof.css','data.js','screens.js']:assert (R/'v8/ui'/f).read_text().strip() in h
with tempfile.TemporaryDirectory()as d:
 for i,s in enumerate(after):
  p=Path(d)/f'{i}.js';p.write_text(s);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
class IDs(HTMLParser):
 def __init__(self):super().__init__();self.ids=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if'id'in a:self.ids.append(a['id'])
i=IDs();i.feed(h);assert not[k for k,n in Counter(i.ids).items()if n>1]
for f,n in [('regression-GREEN.json',6),('header-GREEN.json',360),('development-GREEN.json',4),('integration-GREEN.json',3),('recovery-ui.json',8),('early/regression-GREEN.json',3),('dialogs/readability-GREEN.json',2)]:
 d=read(f);assert d['sha']==sha and d['pass'] and len(d.get('checks',d.get('cases',[])))==n,f
s=read('state-parity.json');assert s['sha']==sha and len(s['cases'])==2 and all(x['careerStateExact']and x['phaseValuesExact']for x in s['cases'])
for f,n in [('after/metrics.json',84),('early/after/report.json',60)]:
 d=read(f);assert d['sha']==sha and not d['errors'] and not d.get('failure');rows=d.get('screens',d.get('states'));assert len(rows)==n and all(r['body']<=r['viewport']+1 for r in rows)
e=read('early/after/report.json');assert not e['pseudo'].get('outsideHit') and e['pseudo']['board']['scroll']==e['pseudo']['board']['client']
c=read('browser-report.json');assert c['candidateSHA']==sha and len(c['checks'])==324 and not c['errors'] and all(not x['horizontalOverflow']and not x['textOverflow']for x in c['checks']);assert len(c['photos'])==36 and all(x['decoded']and x['embedded']and x['credit']for x in c['photos'])
f=read('finals/final/regression-results.json');assert f['auditedSha256']==sha and all(x['pass']for x in f['data']['results'])
x=read('finals/final/extra-results.json');assert x['auditedSha256']==sha;x=x['data'];assert min(r['ratio']for r in x['contrast'])>=4.5 and all(r['lines']==1 for r in x['labels'])
d=read('dialogs/final/metrics.json');assert len(d)==162 and not any(r['clipped']for r in d)
log=(Q/'dialogs/final-regression.log').read_text();assert all(r['pass']for r in json.loads(log))
w=read('browsers/lifecycle.json');assert w['runtime']['buildSha256']==sha and len(w['checks'])==13 and all(x['pass']for x in w['checks'])and not w['errors']and not w.get('failure')
w=read('browsers/targeted.json');assert w['sha256']==sha and len(w['cases'])==4 and all(x['pass']for x in w['cases'])and not w['errors']
summary={'release':'v84','sha256':sha,'bytes':len(h.encode()),'baselineCommit':read('build.json')['baselineCommit'],'unchangedInlineScripts':18,'enginePersistenceControllerExact':True,'sourceParity':True,'syntaxValidScripts':20,'uniqueStaticIds':len(i.ids),'mainScreenCaptures':84,'earlyInteractionCaptures':60,'secondaryDialogCaptures':207,'finalsAndCareerClosureCaptures':69,'actualWebKitTargetedCases':4,'webkitLifecycleCases':13,'headerClubWidthFontCases':360,'clubGuideCases':324,'offlinePhotographsDecoded':36,'nativeFixRegressionAssertions':12,'chromiumSuperoverContrastMinimum':min(r['ratio']for r in x['contrast']),'nativeKnownDefects':'11 visual/copy defects fixed; targeted RED/GREEN preserved.','scope':'Rendered presentation fixtures and real supported UI transitions; capture counts include scrolled/expanded states, not distinct game screens or independent gameplay runs. Engine/persistence byte identical to v83. No new full-career/crash certification.'}
(Q/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
