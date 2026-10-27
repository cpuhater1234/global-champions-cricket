"""Reproduce coordinated-save release from immutable v80, without engine freeze."""
from pathlib import Path
import hashlib,json,re,subprocess,argparse
ROOT=Path(__file__).resolve().parents[2];QA=Path(__file__).resolve().parent
BASE='afe67378cf3e415683af2ff43ecd24e5a3638319';SHA='c7ba52edcbee16d66b8651362a61939cd6c0507382b6bea49f81b51869b1bafb'
def build(promote=False,update_sources=False):
 p=QA/'baseline.html';data=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=ROOT)
 assert hashlib.sha256(data).hexdigest()==SHA
 html=data.decode();before=re.findall(r'<script\b[^>]*>(.*?)</script>',html,re.S)
 for source,old,new in json.loads((QA/'patches.json').read_text()):
  new=new.replace('@@COORDINATOR@@',(ROOT/'v8/domain/save_coordinator.js').read_text().rstrip())
  assert html.count(old)==1,(source,old[:80]);html=html.replace(old,new)
  if update_sources:
   p=ROOT/source;s=p.read_text()
   if new not in s:assert s.count(old)==1; p.write_text(s.replace(old,new))
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',html,re.S);edited=[i for i,(a,b) in enumerate(zip(before,after))if a!=b];assert edited==[10,19]
 css=(ROOT/'v8/ui/save_status.css').read_text().strip();html=html.replace('</head>','<style id="gcc-save-status-styles">\n'+css+'\n</style>\n</head>')
 out=html.encode();(QA/'candidate.html').write_bytes(out)
 if promote:
  for name in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(ROOT/'game'/name).write_bytes(out)
 report={'baselineCommit':BASE,'baselineSha256':SHA,'sha256':hashlib.sha256(out).hexdigest(),'bytes':len(out),'editedScriptIndexes':edited,'protectedScriptBodiesUnchanged':18}
 (QA/'build.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');p.add_argument('--update-sources',action='store_true');a=p.parse_args();build(a.promote,a.update_sources)
