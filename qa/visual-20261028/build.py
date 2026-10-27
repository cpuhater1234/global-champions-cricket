from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='5f8b35d4bf3de95853175f53136c552f8d6de8be';SHA='4a3d4d919d2fdd35d490f5e2f57359bb5fe65d209873a2f89353ee9735aa2453'
def build(promote=False):
 p=Q/'baseline.html';data=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(data).hexdigest()==SHA
 h=data.decode();scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);styles=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)
 for i,f in [(17,'v8/ui/screens.js')]:h=h.replace(scripts[i], '\n'+(R/f).read_text().strip()+'\n',1)
 assert len(styles)==4;h=h.replace(styles[2],'\n'+(R/'v8/ui/bulletproof.css').read_text().strip()+'\n',1)
 for old,new in json.loads((Q/'style-patches.json').read_text()):
  assert h.count(old)==1;h=h.replace(old,new)
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert [i for i,(a,b) in enumerate(zip(scripts,after)) if a!=b]==[17]
 out=h.encode();(Q/'candidate.html').write_bytes(out)
 if promote:
  for f in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(R/'game'/f).write_bytes(out)
 r={'baselineCommit':BASE,'baselineSha256':SHA,'sha256':hashlib.sha256(out).hexdigest(),'bytes':len(out),'editedScriptIndexes':[17],'engineAndPersistenceUnchanged':True,'unchangedScriptBodies':19};(Q/'build.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--promote',action='store_true');build(a.parse_args().promote)
