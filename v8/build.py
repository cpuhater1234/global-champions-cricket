"""Build the fresh UI with a frozen, DOM-backed cricket engine adapter."""
from pathlib import Path
import re,hashlib,json,argparse,base64
ROOT=Path(__file__).resolve().parent
BASE=ROOT.parent/'game/global_champions_cricket_v7_9_3_layout_rebuild.html'
EXPECTED='eddec7bc6d92eb494bef26384e0618ea63d5244c63c8a1c9d84b1f5e16e98926'
def freeze():
 (ROOT/'engine').mkdir(parents=True,exist_ok=True)
 b=BASE.read_bytes();assert hashlib.sha256(b).hexdigest()==EXPECTED
 text=b.decode();scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',text,re.S);assert len(scripts)==10
 names=['players','league','ratings','projections','cpu','foundation','home-motion','events','dynasty','identity']
 for name,script in zip(names,scripts):
  script=script.replace('window.scrollTo','window.GCC8_ENGINE_SCROLL')
  if name=='foundation':
   marker='  return {\n    state,'
   assert marker in script
   script=script.replace(marker,"  window.GCC8_FOUNDATION_READ={roleTags:playerRoleTags,playerNote,groundStory,groundBand,projectedDraftProfile,draftSnapshot,effectiveProfile,teamAverages:userTeamAverages,leagueAverages:leagueInningsAverages,standout:matchStandout,pauseDraft:()=>{clearTimeout(draftAutoTimer);draftAutoTimer=null}};\n"+marker)
  if name=='dynasty':
   script=script.replace(',importSave,clearSaveAndRestart',',clearSaveAndRestart')
   script=script.replace('return Math.max(0,4-userRetirementCount())','return Math.min(2,Math.max(0,4-userRetirementCount()))')
   script=script.replace("SAVE_KEY='gcc_dynasty_v7_2'","SAVE_KEY='gcc_dynasty_v8'").replace("META_KEY='gcc_dynasty_meta_v7_2'","META_KEY='gcc_dynasty_meta_v8'").replace("LEGACY_SAVE_KEY='gcc_dynasty_v7_0'","LEGACY_SAVE_KEY='gcc_dynasty_v7_2'")
   marker='  window.Dynasty={beginOffseason'
   assert marker in script
   script=script.replace(marker,"  window.GCC8_ENGINE_READ={contractCandidates:()=>contractDecisionPlayers().map(p=>p.id),pickSlots:()=>slotsWithSupplement().map(x=>({...x})),cutBudget:()=>({limit:voluntaryCutLimit(),retired:userRetirementCount()}),freeAgents:()=>freeAgentPool().map(p=>p.id),replacements:id=>replacementPoolFor(pById(id)).map(p=>p.id),save:()=>autoSave(),xiProblem:()=>userXIProblem(),fresh:()=>{stopFoundationWatch();return startFreshWorld()},archive:()=>archiveSeason(),ownsPick:r=>userOwnsPick(r),scout:id=>{const p=pById(id);return p?{outlook:developmentRead(p),standing:scoutingLevel(p,state.userClub?.abbr),fit:scoutingFit(p,state.userClub?.abbr),recent:recentSeasonRead(p),contractDue:contractDue(p)}:null},records:()=>archiveRecords(),honours:()=>archiveClubHonours(),legends:()=>archiveUserLegends(),legacyRating:()=>managerScore()};\n"+marker)
  (ROOT/'engine'/f'{name}.js').write_text(script)
 body=re.search(r'<body[^>]*>(.*?)</body>',text,re.S)[1]
 body=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',body,flags=re.I)
 body=re.sub(r'src="data:image/[^\"]+"','',body)
 (ROOT/'engine/bridge.html').write_text(body)
 (ROOT/'engine/manifest.json').write_text(json.dumps({'reference_sha256':EXPECTED,'reference_version':'v7.9.3','adapter':'Original rendering runs in an inert hidden host. The fresh visible UI uses state and commands. No old stylesheets are shipped. Domain extraction remains transitional.'},indent=2)+'\n')
def build(output):
 template=(ROOT/'ui/shell.html').read_text()
 symbols=[]
 for path in sorted((ROOT/'assets/tabler').glob('*.svg')):
  svg=path.read_text();body=re.search(r'<svg\b[^>]*>(.*?)</svg>',svg,re.S)[1]
  symbols.append(f'<symbol id="g8icon-{path.stem}" viewBox="0 0 24 24">{body}</symbol>')
 licence=(ROOT/'assets/tabler/LICENSE.txt').read_text()
 media='<script>window.GCC8_MEDIA='+json.dumps({'stadium':'data:image/jpeg;base64,'+base64.b64encode((ROOT/'assets/mcg-under-lights-source.jpg').read_bytes()).decode()})+';</script>'
 assets='<!-- Tabler Icons: '+licence+' -->'+ '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="g8iconsprite">'+''.join(symbols)+'</svg>'+media
 template=template.replace('@@ASSETS@@',assets)
 template=template.replace('@@CSS@@',(ROOT/'ui/game.css').read_text()).replace('@@BRIDGE@@',(ROOT/'engine/bridge.html').read_text())
 # Omit the old home motion, moment overlays and visual identity scripts.
 # Their DOM side effects would escape the inert host; none owns cricket state.
 binding='const {setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame,cancelAnimationFrame}=window.GCC8_CLOCK;const MutationObserver=class{observe(){}disconnect(){}};'
 engine='<script>window.GCC8_ENGINE_SCROLL=()=>{};'+(ROOT/'ui/clock.js').read_text()+'</script>'+ '\n'.join('<script>(()=>{'+binding+(ROOT/'engine'/f'{name}.js').read_text()+'})();</script>' for name in ['players','league','ratings','projections','cpu','foundation','dynasty'])
 ui='\n'.join('<script>'+ (ROOT/'ui'/f'{name}.js').read_text()+'</script>' for name in ['components','data','screens','dom','controller'])
 build_id=hashlib.sha256(((ROOT/'ui/game.css').read_text()+ui+engine+assets).encode()).hexdigest()[:16]
 template=template.replace('id="g8app"',f'id="g8app" data-build="{build_id}"')
 result=template.replace('@@ENGINE@@',engine).replace('@@UI@@',ui)
 output.parent.mkdir(parents=True,exist_ok=True);output.write_text(result)
 print(output,len(result.encode()),hashlib.sha256(result.encode()).hexdigest())
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--freeze',action='store_true');p.add_argument('--output',type=Path,default=ROOT.parent/'game/global_champions_cricket_v8_fresh_game.html');a=p.parse_args()
 if a.freeze:freeze()
 if all((ROOT/'ui'/f).exists() for f in ['shell.html','game.css','components.js','screens.js','controller.js']):build(a.output)
 else:print('Engine snapshot available; fresh UI scaffold is unfinished. No playable v8 build produced.')
