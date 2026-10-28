from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='570b5476d73a8371ba2b37eb77c79d9b8e415a9b';SHA='e3b3c9295fcc01d6a6f561b136c4144d64f9c291cd4982a11f9fbcad9803f853'
def build(promote=False):
 p=Q/'baseline.html';raw=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(raw).hexdigest()==SHA
 h=raw.decode();scripts=list(re.finditer(r'<script\b[^>]*>(.*?)</script>',h,re.S));names=json.loads((R/'v8/data/blast_names.json').read_text());s=scripts[5].group(1);addition='\nwindow.GCC8_BLAST_NAMES='+json.dumps(names,separators=(',',':'))+';\n'+(R/'v8/domain/blast_names.js').read_text().strip()+'\n';h=h[:scripts[5].end(1)]+addition+h[scripts[5].end(1):]
 old=' function render(changed=false){';new=old+'\n  window.GCC8_applyClubNames(s);';assert h.count(old)==1;h=h.replace(old,new,1);p=R/'v8/ui/controller.js';source=p.read_text()
 if new not in source:assert source.count(old)==1;p.write_text(source.replace(old,new,1))
 assert p.read_text().strip() in h
 old='const resumeClub=resume.userClub?.name,';new='const resumeClub=window.GCC8_BLAST_NAMES[resume.userClub?.abbr]||resume.userClub?.name,';assert h.count(old)==1;h=h.replace(old,new,1);p=R/'v8/ui/screens.js';source=p.read_text()
 if new not in source:assert source.count(old)==1;p.write_text(source.replace(old,new,1))
 assert p.read_text().strip() in h
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert [i for i,(a,b) in enumerate(zip([m.group(1) for m in scripts],after))if a!=b]==[5,17,19]
 (Q/'candidate.html').write_text(h)
 if promote:
  for f in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(R/'game'/f).write_text(h)
  (R/'deliver/GCC_v8_Career_Clarity.html').write_text(h)
 out={'release':'v89','sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'baseCommit':BASE,'changedScripts':[5,17,19],'unchangedScripts':17,'changes':'Current Blast names; saved club-label refresh before render and home Continue label'};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
