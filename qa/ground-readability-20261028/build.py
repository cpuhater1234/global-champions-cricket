from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='9755c69524845bd85735d012595d1367315f3695';SHA='551ef91eac802d6b85fce962abdd7270e7ddfcb6f5e11d0e7080cf8db649cf0f'
def build(promote=False):
 p=Q/'baseline.html';raw=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(raw).hexdigest()==SHA
 h=raw.decode();old=(R/'qa/visual-conditions-20261028/patch.css').read_text().strip();new=(Q/'ground.css').read_text().strip();assert h.count(old)==1;h=h.replace(old,new,1)
 p=R/'v8/ui/workspace.css';css=p.read_text()
 if old in css:assert css.count(old)==1;p.write_text(css.replace(old,new,1))
 assert p.read_text().strip() in h
 assert re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)==re.findall(r'<script\b[^>]*>(.*?)</script>',raw.decode(),re.S)
 (Q/'candidate.html').write_text(h)
 if promote:
  for f in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(R/'game'/f).write_text(h)
  (R/'deliver/GCC_v8_Career_Clarity.html').write_text(h)
 out={'release':'v90','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':20,'scope':'Club-guide conditions CSS only; three equal stacked rectangles and legible scale'};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
