from pathlib import Path
import hashlib,json,re,subprocess,argparse
ROOT=Path(__file__).resolve().parents[2];Q=Path(__file__).resolve().parent
BASE='b065bd8c2384f138fc6b05d817271fb040d34d5b';SHA='0f643bb049f277dd57550ad9fb8d6134c51ed102d3ffa00a53d20f68e10876e4'
def build(promote=False,update_sources=False):
 p=Q/'baseline.html';data=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=ROOT)
 assert hashlib.sha256(data).hexdigest()==SHA
 if not p.exists():p.write_bytes(data)
 html=data.decode();before=re.findall(r'<script\b[^>]*>(.*?)</script>',html,re.S)
 for source,old,new in json.loads((Q/'patches.json').read_text()):
  new=new.replace('@@STORE@@',(ROOT/'v8/domain/checkpoint_store.js').read_text().rstrip()).replace('@@COORDINATOR@@',(ROOT/'v8/domain/save_coordinator.js').read_text().rstrip())
  assert html.count(old)==1,(source,old[:80]);html=html.replace(old,new)
  if update_sources:
   p=ROOT/source;s=p.read_text()
   if new not in s:assert s.count(old)==1,(source,old[:80]);p.write_text(s.replace(old,new))
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',html,re.S);edited=[i for i,(a,b) in enumerate(zip(before,after))if a!=b];assert edited==[10,19]
 out=html.encode();(Q/'candidate.html').write_bytes(out)
 if promote:
  for name in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(ROOT/'game'/name).write_bytes(out)
 r={'baselineCommit':BASE,'baselineSha256':SHA,'sha256':hashlib.sha256(out).hexdigest(),'bytes':len(out),'editedScriptIndexes':edited,'otherScriptBodiesUnchanged':18};(Q/'build.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');p.add_argument('--update-sources',action='store_true');a=p.parse_args();build(a.promote,a.update_sources)
