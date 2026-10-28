from pathlib import Path
import re,hashlib,json,base64,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='c0b5af8de55dafdf7dbc61c97215c64d510d1c10';SHA='72bf66187f21ee0e986b3a54fac7eb3a9786acc7dafce8f87d6f2725ecd0555c'
def build(promote=False):
 p=Q/'baseline.html';b=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(b).hexdigest()==SHA;h=b.decode();scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];old=style[style.index('/* Modern arcade:'):].strip();css=(Q/'tiles.css').read_text();workspace=old+'\n\n'+css;h=h.replace(old,workspace,1);new=(Q/'screens.js').read_text();h=h.replace(scripts[17],new,1);after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert [i for i,(a,b) in enumerate(zip(scripts,after)) if a!=b]==[17];(R/'v8/ui/screens.js').write_text(new);(R/'v8/ui/workspace.css').write_text(workspace+'\n');(Q/'candidate.html').write_text(h)
 if promote:
  for f in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','deliver/GCC_v8_Career_Clarity.html']:(R/f).write_text(h)
 out={'release':'v95','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':19,'scope':'Player card CSS and signing-feed presentation only'};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
