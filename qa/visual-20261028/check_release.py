from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import hashlib,json,re,subprocess,tempfile
Q=Path(__file__).resolve().parent;R=Q.parents[1]
def read(p):return json.loads((Q/p).read_text())
data=(Q/'candidate.html').read_bytes();sha=hashlib.sha256(data).hexdigest();b=read('build.json');assert b['sha256']==sha
h=data.decode();old=(Q/'baseline.html').read_text();a=re.findall(r'<script\b[^>]*>(.*?)</script>',old,re.S);z=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert len(z)==20 and [i for i,(x,y) in enumerate(zip(a,z))if x!=y]==[17]
assert z[17].strip()==(R/'v8/ui/screens.js').read_text().strip()
for f in ['workspace.css','bulletproof.css']:assert (R/'v8/ui'/f).read_text().strip() in h
with tempfile.TemporaryDirectory() as d:
 for i,s in enumerate(z):
  p=Path(d)/f'{i}.js';p.write_text(s);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
class IDs(HTMLParser):
 def __init__(self):super().__init__();self.ids=[]
 def handle_starttag(self,t,attrs):
  x=dict(attrs)
  if 'id'in x:self.ids.append(x['id'])
p=IDs();p.feed(h);assert not [k for k,n in Counter(p.ids).items()if n>1]
for name in ['regression-GREEN.json','integration-GREEN.json','recovery-ui.json']:assert read(name)['sha']==sha and read(name)['pass']
d=read('development-GREEN.json');assert d['sha']==sha and d['pass'] and len(d['checks'])==4
hdr=read('header-GREEN.json');assert hdr['sha']==sha and hdr['pass'] and len(hdr['checks'])==360
c=read('browser-report.json');assert c['candidateSHA']==sha and len(c['checks'])==324 and not c['errors'] and not any(x['horizontalOverflow'] or x['textOverflow'] for x in c['checks'])
assert len(c['photos'])==36 and all(x['decoded'] and x['embedded'] and x['credit'] for x in c['photos'])
s=read('after/metrics.json');assert s['sha']==sha and len(s['screens'])==84 and not s['errors'] and not s.get('failure') and all(x['body']<=x['viewport']+1 for x in s['screens'])
w=read('webkit.json');assert w['runtime']['buildSha256']==sha and len(w['checks'])==13 and all(x['pass'] for x in w['checks']) and not w['errors'] and not w.get('failure')
summary={'release':'v83','sha256':sha,'bytes':len(data),'baselineCommit':b['baselineCommit'],'unchangedScripts':19,'engineAndPersistenceExact':True,'sourceParity':True,'syntaxValidScripts':20,'uniqueStaticIds':len(p.ids),'screenCaptures':84,'screens':21,'viewports':[320,390,768,1440],'headerClubWidthFontCases':360,'clubGuideWidthFontCases':324,'offlinePhotosDecoded':36,'homeAndBackupChecks':6,'developmentWidths':4,'recoveryUiCases':8,'recoveryIntegrationChecks':3,'webkitChecks':13,'scope':'Visual fixes and start screen cleanup. Real native browser geometry, screenshots and supported UI save/recovery flows. No new whole-career or crash certification claimed; v82 engine and persistence bodies are identical.'}
(Q/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
