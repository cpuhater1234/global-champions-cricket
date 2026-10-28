from pathlib import Path
import re,json,base64,hashlib,subprocess,argparse
root=Path('qa/persistence-20261026')
args=argparse.ArgumentParser();args.add_argument('--promote',action='store_true');args=args.parse_args()
localbase=Path('qa/browser-career-20261026/final-candidate.html')
baseline=localbase.read_bytes() if localbase.exists() else subprocess.check_output(['git','show','bc797c3b9ea1a4dab051bd789c2d35d536b041ff:game/gcc_v8_product_candidate.html'])
assert hashlib.sha256(baseline).hexdigest()=='c24b4893b9d83b55ad6f5db8baa9d3dbf3d135fdac12ce44dea6bcef2e51dd70','Wrong baseline'
base=baseline.decode();scripts=list(re.finditer(r'<script\b[^>]*>(.*?)</script>',base,re.S));replacements={}
for idx,p in [(10,'v8/engine/dynasty.js'),(17,'v8/ui/screens.js'),(19,'v8/ui/controller.js')]:
 old=scripts[idx].group(1);new=Path(p).read_text().strip();replacements[idx]=old[:old.index('\n(() => {')]+'\n'+new+'\n})();' if idx==10 else '\n'+new+'\n'
m=json.loads(scripts[1].group(1).removeprefix('window.GCC8_MEDIA=').removesuffix(';'))
rows={r['club']:r for r in json.loads((root/'venue-fetch.json').read_text())}
for abbr,v in m['venues'].items():
 p=root/'photos'/f'{abbr}.jpg';parts=sorted(p.parent.glob(p.name+'.b64part*'));data=p.read_bytes() if p.exists() else base64.b64decode(''.join(q.read_text() for q in parts),validate=True);mime=rows[abbr]['contentType'].split(';')[0];v['dataUrl']='data:'+mime+';base64,'+base64.b64encode(data).decode();v['changes']='Bundled offline copy of the same Wikimedia Commons photograph, served by Wikimedia at 960px width. Source and licence retained. No implication that it depicts the simulated year or current match.'
replacements[1]='window.GCC8_MEDIA='+json.dumps(m,separators=(',',':'))+';'
replacements[0]='(()=>{const choices='+json.dumps(list(m['venues']))+';window.GCC8_HOME_PHOTO={abbr:choices[Math.floor(Math.random()*choices.length)]};})();'
venue=Path('v8/ui/venues.js').read_text();replacements[14]=venue
for i in sorted(replacements,reverse=True): a,b=scripts[i].span(1);base=base[:a]+replacements[i]+base[b:]
oldcss=(root/'baseline-workspace.css').read_text().strip();assert base.count(oldcss)==1;base=base.replace(oldcss,Path('v8/ui/workspace.css').read_text().strip());(root/'candidate.html').write_text(base)
print('candidate bytes',len(base.encode()))

data=base.encode();assert hashlib.sha256(data).hexdigest()=='4397ee6b8dc82cff83af86be14b790b8c0cb8997629e014979000a02e48df1ff','Release hash mismatch'
if args.promote:
 for name in ('gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html'): Path('game',name).write_bytes(data)
print('Verified exact release SHA256',hashlib.sha256(data).hexdigest())
