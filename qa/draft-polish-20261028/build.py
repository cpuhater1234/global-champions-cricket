from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='6e2be475e3c9baabab2f47e03157ff31079fef20';SHA='518ba3baf5a98f8f96d7d2c543c1c89544f89fd8a2cff686688af70a6a5abb5e'
def build(promote=False):
 p=Q/'baseline.html';b=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(b).hexdigest()==SHA;h=b.decode();scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)
 for i,name in [(11,'components.js'),(13,'roles.js'),(17,'screens.js'),(19,'controller.js')]:
  new=(Q/name).read_text();h=h.replace(scripts[i],new,1);(R/'v8/ui'/name).write_text(new)
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert [i for i,(a,b)in enumerate(zip(scripts,after))if a!=b]==[11,13,17,19]
 style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];old=style[style.index('/* Modern arcade:'):].strip();css=old+'\n\n'+(Q/'polish.css').read_text();h=h.replace(old,css,1);(R/'v8/ui/workspace.css').write_text(css+'\n');(Q/'candidate.html').write_text(h)
 if promote:
  for f in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','deliver/GCC_v8_Career_Clarity.html']:(R/f).write_text(h)
 out={'release':'v96','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':16,'changedPresentationScripts':[11,13,17,19]};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
