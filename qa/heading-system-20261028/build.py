from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1]
BASE='7a5ed5a4c07cb19af85828f9e18d8742af74b7f5';SHA='cec128ae13075540da552afe56dc87b9d6c2bcadad4fd2f0a2518165a13fc4b7'
def build(promote=False):
 p=Q/'baseline.html';raw=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R)
 assert hashlib.sha256(raw).hexdigest()==SHA
 h=raw.decode();scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)
 style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];base=style[style.index('/* Modern arcade:'):].strip();css=base+'\n\n'+(Q/'headings.css').read_text().strip()+'\n'
 h=h.replace(base,css.strip(),1);assert scripts==re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)
 (Q/'candidate.html').write_text(h);(R/'v8/ui/workspace.css').write_text(css)
 if promote:
  for f in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','deliver/GCC_v8_Career_Clarity.html']:(R/f).write_text(h)
 out={'release':'v92','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':len(scripts),'scope':'Scoped heading CSS only'};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
