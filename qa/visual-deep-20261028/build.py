from pathlib import Path
import re,json,hashlib,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='572a3d7e49fbe57b6210323779303ca9af129b16';SHA='aa2e3e187efc0b31366ee29b255c1ed1fa236e4c1fb98ece83d9c99c935fb7aa'
def build(promote=False):
 p=Q/'baseline.html';data=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(data).hexdigest()==SHA
 h=data.decode();before=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)
 for f,old,new in json.loads((Q/'patches.json').read_text()):assert h.count(old)==1,(f,old[:70]);h=h.replace(old,new)
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert len(after)==20 and [i for i,(a,b) in enumerate(zip(before,after))if a!=b]==[12,17]
 for f in ['game.css','workspace.css','bulletproof.css','data.js','screens.js']:assert (R/'v8/ui'/f).read_text().strip() in h,f
 out=h.encode();(Q/'candidate.html').write_bytes(out)
 if promote:
  for f in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(R/'game'/f).write_bytes(out)
 r={'baselineCommit':BASE,'baselineSha256':SHA,'sha256':hashlib.sha256(out).hexdigest(),'bytes':len(out),'editedScriptIndexes':[12,17],'unchangedScripts':18,'enginePersistenceAndControllerExact':True};(Q/'build.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('--promote',action='store_true');build(a.parse_args().promote)
