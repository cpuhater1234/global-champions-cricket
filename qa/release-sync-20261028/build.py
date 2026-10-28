"""Reconcile presentation only. Never regenerate engine or saved-state scripts."""
from pathlib import Path
import re,hashlib,subprocess,argparse,json
Q=Path(__file__).resolve().parent;R=Q.parents[1]
BASE='2bf294306fdac36ec6888f1ff154f27c734e19cd'
SHA='9a253947041974e26a91729e06a9a93e1812d518b04519a6f533e9793a7cc5ca'
def build(promote=False):
 p=Q/'baseline.html';raw=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R)
 assert hashlib.sha256(raw).hexdigest()==SHA
 h=raw.decode();old=(Q/'v84-workspace.css').read_text().strip();assert h.count(old)==1
 parts=[old,(R/'qa/visual-conditions-20261028/patch.css').read_text().strip(),(Q/'design-intent.css').read_text().strip(),(Q/'club-surfaces.css').read_text().strip()]
 css='\n\n'.join(parts)+'\n';h=h.replace(old,css.strip(),1)
 assert re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)==re.findall(r'<script\b[^>]*>(.*?)</script>',raw.decode(),re.S)
 (R/'v8/ui/workspace.css').write_text(css);(Q/'candidate.html').write_text(h)
 if promote:
  for f in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(R/'game'/f).write_text(h)
  (R/'deliver/GCC_v8_Career_Clarity.html').write_text(h)
 result={'release':'v86','baseCommit':BASE,'externalHead':'cdfc461ae4e3331839c758db39bf2875cf72a2df','sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'inlineScriptsUnchanged':20,'composition':['v84 tested foundation','v85 conditions','external decorative-art intent','external final club-surface override']}
 (Q/'build.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
