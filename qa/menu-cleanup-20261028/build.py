"""Remove two presentation affordances; preserve automatic persistence."""
from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='d4d69a0fb434cb3c03c92c0fdcc84913ddb1d37f';SHA='8b0519d4fef0e10a0a05356387788e346c9a36487ca500eb755055aae36a147a'
PATCHES=[('controller.js',"${btn('Career backup','careerBackup',[],'g8ghost g8small')}",''),('venues.js',"<figcaption>${X.icon('building-stadium')}",'<figcaption>'),('components.js',"<figcaption>${icon('building-stadium')}",'<figcaption>')]
def build(promote=False):
 p=Q/'baseline.html';raw=p.read_bytes() if p.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R);assert hashlib.sha256(raw).hexdigest()==SHA
 h=raw.decode();before=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)
 for f,old,new in PATCHES:
  assert h.count(old)==1;h=h.replace(old,new,1);p=R/'v8/ui'/f;s=p.read_text()
  if old in s:assert s.count(old)==1;p.write_text(s.replace(old,new,1))
  assert p.read_text().strip() in h,f
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);changed=[i for i,(a,b) in enumerate(zip(before,after)) if a!=b];assert len(before)==len(after)==20 and len(changed)==3
 for a,b in zip(before,after):
  if a!=b:
   for _,old,new in PATCHES:a=a.replace(old,new)
   assert a==b
 (Q/'candidate.html').write_text(h)
 if promote:
  for f in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(R/'game'/f).write_text(h)
  (R/'deliver/GCC_v8_Career_Clarity.html').write_text(h)
 result={'release':'v87','baseCommit':BASE,'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'editedPresentationScriptIndexes':changed,'otherScriptsUnchanged':17,'automaticPersistenceUnchanged':True}
 (Q/'build.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');build(p.parse_args().promote)
