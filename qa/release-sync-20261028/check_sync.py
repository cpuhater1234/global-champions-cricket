from pathlib import Path
import re,hashlib,json,subprocess,argparse
Q=Path(__file__).resolve().parent;R=Q.parents[1]
def check(file,source):
 h=file.read_text();p=Q/'baseline.html';b=p.read_text() if p.exists() else subprocess.check_output(['git','show','2bf294306fdac36ec6888f1ff154f27c734e19cd:game/gcc_v8_product_candidate.html'],cwd=R).decode()
 assert source.read_text().strip() in h,'Source workspace CSS does not match playable'
 for alias in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:
  assert (R/'game'/alias).read_bytes()==h.encode(),'Playable alias mismatch: '+alias
 assert re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)==re.findall(r'<script\b[^>]*>(.*?)</script>',b,re.S),'Inline scripts changed'
 assert len(re.findall(r'<script\b',h))==20
 for f in ['game.css','bulletproof.css','data.js','screens.js']:
  assert (R/'v8/ui'/f).read_text().strip() in h,f
 for i,s in enumerate(re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S)):
  p=Q/'syntax.js';p.write_text(s);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
 p.unlink()
 ids=re.findall(r'\bid=["\x27]([^"\x27]+)["\x27]',re.sub(r'<script\b[^>]*>.*?</script>','',h,flags=re.S));assert len(ids)==len(set(ids))
 result={'sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'inlineScriptsExact':20,'sourceParity':True,'uniqueStaticIds':len(ids),'syntaxScripts':20}
 print(json.dumps(result));return result
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--file',type=Path,default=Q/'candidate.html');p.add_argument('--source',type=Path,default=R/'v8/ui/workspace.css');a=p.parse_args();check(a.file,a.source)
