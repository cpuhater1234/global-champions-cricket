"""Check actual inline JavaScript and static element IDs, excluding templates."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import hashlib,json,re,subprocess,tempfile,os
ROOT=Path(__file__).resolve().parents[3]
FILE=ROOT/os.environ.get('GCC8_TEST_BUILD','qa/bulletproof-20261027/candidate.html')
class Elements(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.external=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='script' and a.get('src'):self.external.append(a['src'])
text=FILE.read_text();scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',text,re.S);rows=[]
with tempfile.TemporaryDirectory() as d:
 for i,script in enumerate(scripts):
  path=Path(d)/f'{i}.js';path.write_text(script)
  result=subprocess.run(['node','--check',str(path)],capture_output=True)
  rows.append({'index':i,'pass':result.returncode==0})
  assert result.returncode==0,result.stderr.decode()
dom=Elements();dom.feed(text);duplicates=[k for k,n in Counter(dom.ids).items() if n>1]
assert len(scripts)==20 and not duplicates and not dom.external
result={'sha256':hashlib.sha256(FILE.read_bytes()).hexdigest(),'scripts':rows,'staticIds':len(dom.ids),'duplicates':duplicates,'externalScripts':dom.external}
(Path(__file__).parent/'static.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
