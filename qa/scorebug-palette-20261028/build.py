from pathlib import Path
import re,hashlib,json,base64,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='987354d02381fe10d09386ccb57fcedf946dea9e';SHA='427bca91a0bbfbe4fc704777849b7aa33caa599bd34c3f7df4483d7c115b62aa'
def build(promote=False):
 p=Q/'baseline.html';b=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(b).hexdigest()==SHA;h=b.decode();scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];old=style[style.index('/* Modern arcade:'):].strip();grain='<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" opacity=".045" filter="url(#n)"/></svg>';css=':root{--g8-canvas-grain:url("data:image/svg+xml;base64,'+base64.b64encode(grain.encode()).decode()+'")}\n'+(Q/'palette.css').read_text();workspace=old+'\n\n'+css;h=h.replace(old,workspace,1);assert scripts==re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);(R/'v8/ui/workspace.css').write_text(workspace+'\n');(Q/'candidate.html').write_text(h)
 if promote:
  for f in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','deliver/GCC_v8_Career_Clarity.html']:(R/f).write_text(h)
 out={'release':'v94','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':len(scripts),'scope':'Matte panel palette, procedural background and content-width trait labels; CSS only'};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
