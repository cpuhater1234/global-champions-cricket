"""Build the fresh UI with a frozen, DOM-backed cricket engine adapter."""
from pathlib import Path
import re,hashlib,json,argparse
ROOT=Path(__file__).resolve().parent
BASE=ROOT.parent/'game/global_champions_cricket_v7_9_3_layout_rebuild.html'
EXPECTED='eddec7bc6d92eb494bef26384e0618ea63d5244c63c8a1c9d84b1f5e16e98926'
def freeze():
 b=BASE.read_bytes();assert hashlib.sha256(b).hexdigest()==EXPECTED
 text=b.decode();scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',text,re.S);assert len(scripts)==10
 names=['players','league','ratings','projections','cpu','foundation','home-motion','events','dynasty','identity']
 for name,script in zip(names,scripts):
  if name=='dynasty':
   marker='  window.Dynasty={beginOffseason'
   assert marker in script
   script=script.replace(marker,"  window.GCC8_ENGINE_READ={contractCandidates:()=>contractDecisionPlayers().map(p=>p.id),pickSlots:()=>slotsWithSupplement().map(x=>({...x})),cutBudget:()=>({limit:voluntaryCutLimit(),retired:userRetirementCount()})};\n"+marker)
  (ROOT/'engine'/f'{name}.js').write_text(script)
 body=re.search(r'<body[^>]*>(.*?)</body>',text,re.S)[1]
 body=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',body,flags=re.I)
 body=re.sub(r'src="data:image/[^\"]+"','',body)
 (ROOT/'engine/bridge.html').write_text(body)
 (ROOT/'engine/manifest.json').write_text(json.dumps({'reference_sha256':EXPECTED,'reference_version':'v7.9.3','adapter':'Original rendering runs in an inert hidden host. The fresh visible UI uses state and commands. No old stylesheets are shipped. Domain extraction remains transitional.'},indent=2)+'\n')
def build(output):
 template=(ROOT/'ui/shell.html').read_text()
 template=template.replace('@@CSS@@',(ROOT/'ui/game.css').read_text()).replace('@@BRIDGE@@',(ROOT/'engine/bridge.html').read_text())
 engine='\n'.join('<script>'+ (ROOT/'engine'/f'{name}.js').read_text()+'</script>' for name in ['players','league','ratings','projections','cpu','foundation','home-motion','events','dynasty','identity'])
 ui='\n'.join('<script>'+ (ROOT/'ui'/f'{name}.js').read_text()+'</script>' for name in ['components','screens','controller'])
 result=template.replace('@@ENGINE@@',engine).replace('@@UI@@',ui)
 output.parent.mkdir(parents=True,exist_ok=True);output.write_text(result)
 print(output,len(result.encode()),hashlib.sha256(result.encode()).hexdigest())
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--freeze',action='store_true');p.add_argument('--output',type=Path,default=ROOT.parent/'game/global_champions_cricket_v8_fresh_game.html');a=p.parse_args()
 if a.freeze:freeze()
 if all((ROOT/'ui'/f).exists() for f in ['shell.html','game.css','components.js','screens.js','controller.js']):build(a.output)
 else:print('Engine snapshot available; fresh UI scaffold is unfinished. No playable v8 build produced.')
