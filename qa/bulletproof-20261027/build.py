"""Apply audited validation/restore-feedback fixes to immutable published v79."""
from pathlib import Path
import hashlib,json,re,subprocess,argparse
ROOT=Path(__file__).resolve().parents[2]
QA=Path(__file__).resolve().parent
BASE='4ee466683f822a6e942d63c99ea55406a87f6f90'
BASE_SHA='696bdfea1a5d177d144a652316c0d39e1d34a1522df990ef32852e45e84d9097'
PATCHES=[
 ('v8/ui/controller.js',
 "if(!b||b.disabled)return;if(b.matches('.g8candidate'))",
 "if(!b||b.disabled)return;if(b.dataset.action==='draftPlayer'&&event.detail>1){event.preventDefault();return;}if(b.matches('.g8candidate'))"),
 ('v8/ui/controller.js',
 "${canSelect?btn(s.xi.length===11?'Swap into XI':'Select for XI'",
 "${!s.pendingSwapIn&&['team','draft','dynasty'].includes(ui.view)&&X.comparisonCandidates(p.id).length?btn('Compare','comparePlayers',[p.id],'g8ghost'):''}${canSelect?btn(s.xi.length===11?'Swap into XI':'Select for XI'"),
 ('v8/domain/save_validation.js',
 "if(s.fullSchedule.length&&clubs.some(c=>!record(s.table[c])||['p','w','l','pts','nrr','runsFor','runsAgainst','ballsFor','ballsAgainst'].some(k=>!Number.isFinite(s.table[c][k]))))return false;",
 "if(s.fullSchedule.length&&clubs.some(c=>{const t=s.table[c];return !record(t)||!Number.isFinite(t.nrr)||['p','w','l','pts','runsFor','runsAgainst','ballsFor','ballsAgainst'].some(k=>!Number.isInteger(t[k])||t[k]<0)||t.p>14||t.w>14||t.l>14||t.pts>28||t.p!==t.w+t.l||t.pts!==2*t.w;}))return false;"),
 ('v8/engine/dynasty.js',
 "decorateSoon();autoSave();if(stored.key===LEGACY_SAVE_KEY)base.toast(`Dynasty upgraded · ${state.year}`);else base.toast(`Dynasty restored · ${state.year}`);return true",
 "decorateSoon();const restoredSaved=autoSave();if(restoredSaved){if(stored.key===LEGACY_SAVE_KEY)base.toast(`Dynasty upgraded · ${state.year}`);else base.toast(`Dynasty restored · ${state.year}`);}return true"),
 ('v8/ui/controller.js',
 "pendingBackup=null;closeDialog();restorePresentation();announce('Career restored from your backup.');",
 "pendingBackup=null;closeDialog();restorePresentation();save();announce(saveWarning?'Career opened from backup for this session. Progress is not saved. Keep this game open and download a backup before closing.':'Career restored from your backup.');"),
]
def build(promote=False,update_sources=False):
 local=QA/'baseline.html'
 data=local.read_bytes() if local.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=ROOT)
 assert hashlib.sha256(data).hexdigest()==BASE_SHA,'Unexpected baseline'
 html=data.decode()
 before=re.findall(r'<script\b[^>]*>(.*?)</script>',html,re.S)
 for source,old,new in PATCHES:
  assert html.count(old)==1,source+' HTML anchor'
  html=html.replace(old,new)
  if update_sources:
   p=ROOT/source;s=p.read_text();assert s.count(old)==1 or s.count(new)==1,source+' source anchor'
   if new not in s:p.write_text(s.replace(old,new))
 after=re.findall(r'<script\b[^>]*>(.*?)</script>',html,re.S)
 edited=[i for i,(a,b) in enumerate(zip(before,after)) if a!=b]
 assert edited==[10,19],edited
 css=(ROOT/'v8/ui/bulletproof.css').read_text().strip();html=html.replace('</head>','<style id="gcc-bulletproof-styles">\n'+css+'\n</style>\n</head>');out=html.encode();(QA/'candidate.html').write_bytes(out)
 if promote:
  for name in ['gcc_v8_product_candidate.html','gcc_v8_quiet_arcade.html']:(ROOT/'game'/name).write_bytes(out)
 report={'baselineCommit':BASE,'baselineSha256':BASE_SHA,'sha256':hashlib.sha256(out).hexdigest(),'bytes':len(out),'editedScriptIndexes':edited,'unchangedScripts':18,'patches':[p[0] for p in PATCHES]}
 (QA/'build.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--promote',action='store_true');p.add_argument('--update-sources',action='store_true');a=p.parse_args();build(a.promote,a.update_sources)
