from pathlib import Path
import re,hashlib,json,base64,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='6012ce17d1f183d2fa702f7e5866f4841d185472';SHA='8a48c09ac1e5552227c2382f3444c2dd33f8ea8f04273696a421e75ecf85a2cd'
def build(promote=False):
 p=Q/'baseline.html';b=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(b).hexdigest()==SHA;h=b.decode();scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];old=style[style.index('/* Modern arcade:'):].strip();art=(R/'v8/assets/cricket-figures.png').read_bytes();css=':root{--g8-cricket-art:url("data:image/png;base64,'+base64.b64encode(art).decode()+'")}\n'+(Q/'watermarks.css').read_text();workspace=old+'\n\n'+css;h=h.replace(old,workspace,1);assert scripts==re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);(R/'v8/ui/workspace.css').write_text(workspace+'\n');(Q/'candidate.html').write_text(h)
 if promote:
  for f in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html','deliver/GCC_v8_Career_Clarity.html']:(R/f).write_text(h)
 out={'release':'v93','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':len(scripts),'assetSHA256':hashlib.sha256(art).hexdigest(),'scope':'CSS sprite watermarks only; original supplied artwork unchanged'};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
