from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='fde5475c13055abe2b2684fddc2d17d2caac5fc7';SHA='65671622910aa3cbcbbb1af32f6c44e864629a0b4c67704dc9883a5d6be5ad99'
def build(promote=False):
 p=Q/'baseline.html';raw=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(raw).hexdigest()==SHA
 h=raw.decode();scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);before=scripts[12];old=next(l for l in before.splitlines() if l.startswith(' X.clubBrief=c=>'));new=old.replace('<section class="g8sheet"><span','<section class="g8sheet"><header class="g8briefhead"><span',1).replace('<h3>${esc(c.ground)}</h3><span','<h3>${esc(c.ground)}</h3></header><div class="g8briefbody"><span',1).replace('</div></section><section class="g8sheet g8clubplan"><span','</div></div></section><section class="g8sheet g8clubplan"><header class="g8briefhead"><span',1).replace('<h3>${esc(plan.title)}</h3><ol','<h3>${esc(plan.title)}</h3></header><div class="g8briefbody"><ol',1).replace('</ol></section></div>`;','</ol></div></section></div>`;',1);assert old!=new and new.count('g8briefhead')==2 and new.count('g8briefbody')==2;h=h.replace(old,new,1)
 p=R/'v8/ui/data.js';s=p.read_text()
 if old in s:assert s.count(old)==1;p.write_text(s.replace(old,new,1))
 assert p.read_text().strip() in h
 style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];base=style[style.index('/* Modern arcade:'):].strip();css=base+'\n\n'+(Q/'panels.css').read_text().strip()+'\n';h=h.replace(base,css.strip(),1);(R/'v8/ui/workspace.css').write_text(css)
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert [i for i,(a,b) in enumerate(zip(scripts,after))if a!=b]==[12];assert before.replace(old,new)==after[12]
 (Q/'candidate.html').write_text(h)
 if promote:
  for f in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(R/'game'/f).write_text(h)
  (R/'deliver/GCC_v8_Career_Clarity.html').write_text(h)
 out={'release':'v91','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':19,'changedScript':12,'scope':'Club-guide HTML wrappers and scoped CSS only'};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
