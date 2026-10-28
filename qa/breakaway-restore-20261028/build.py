"""Restore the original colourful invitation cards on this page only."""
from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='7df3aeef9f6d085e023104c646b710ae00393259';SHA='819ef918e74cdbc885cb76fbd59b8375706799496526e5a60bd028a1a28e8b13'
def build(promote=False):
 p=Q/'baseline.html';raw=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(raw).hexdigest()==SHA
 h=raw.decode();style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];base=style[style.index('/* Modern arcade:'):].strip();old=(R/'qa/release-sync-20261028/club-surfaces.css').read_text().strip();assert base.count(old)==1
 scoped=old
 for selector in ['.g8club.g8franchise','.g8revealgrid','.g8clubgrid','.g8ordergrid','.g8matchgrid','.g8teamworkspace','.g8annualworkspace']:
  scoped=scoped.replace(selector,':where(#g8stage:not([data-view="leagueDraw"])) '+selector)
 css=base.replace(old,scoped)+'\n';assert h.count(base)==1;h=h.replace(base,css.strip(),1)
 assert re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)==re.findall(r'<script\b[^>]*>(.*?)</script>',raw.decode(),re.S)
 (R/'v8/ui/workspace.css').write_text(css);(Q/'candidate.html').write_text(h)
 if promote:
  for f in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(R/'game'/f).write_text(h)
  (R/'deliver/GCC_v8_Career_Clarity.html').write_text(h)
 result={'release':'v88','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedInlineScripts':20,'scope':'Exclude leagueDraw from external club-surface override; preserve selector specificity with :where'};(Q/'build.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
