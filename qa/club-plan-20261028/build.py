from pathlib import Path
import re,hashlib,json,subprocess
Q=Path(__file__).resolve().parent;R=Q.parents[1];BASE='6f53f4196e55b70d8aabb9eb4ec94426d03323c4';base=Q/'baseline.html';h=base.read_text() if base.exists() else subprocess.check_output(['git','show',BASE+':game/gcc_v8_product_candidate.html'],cwd=R).decode();assert hashlib.sha256(h.encode()).hexdigest()=='caa5f46cdd1ddb438a4864a59a43ec964eaf0564dc55034afa1e2c1042cc9b46';oldScripts=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];old=style[style.index('/* Modern arcade:'):].strip();css=old
# Replace existing component owners, including their obsolete theme overrides.
def rule(selector,body):
 global css
 pattern=re.escape(selector)+r'\{[^}]*\}';n=len(re.findall(pattern,css));assert n,selector
 first=True
 def change(m):
  nonlocal first
  boundary=max(css.rfind('}',0,m.start()),css.rfind('{',0,m.start()))
  prefix=re.sub(r'/\*.*?\*/','',css[boundary+1:m.start()],flags=re.S).strip()
  if prefix:return m.group(0) # Preserve grouped selectors and longer selectors.
  if first:first=False;return selector+'{'+body+'}'
  return ''
 css=re.sub(pattern,change,css)
 assert not first,selector
rule('#g8dialog .g8briefbody>.g8clubpriorities','display:grid;gap:0;list-style:none;margin:0;padding:0;flex:1;grid-template-rows:repeat(3,minmax(min-content,1fr));align-content:stretch')
rule('#g8dialog .g8clubpriorities>li','display:grid;grid-template-columns:2rem minmax(0,1fr);align-items:start;align-content:center;gap:1rem;padding:1rem 0;background:transparent;border:0;border-bottom:1px solid #536b96;border-radius:0;box-shadow:none;min-width:0')
rule('#g8dialog .g8clubpriorities .g8prioritynumber','display:block;align-self:start;place-items:initial;width:auto;height:auto;min-width:0;margin:.05rem 0 0;padding:0;background:transparent;border:0;border-radius:0;box-shadow:none;color:#fff;font-size:1.4rem;line-height:1.2;font-weight:900;font-variant-numeric:tabular-nums')
rule('#g8dialog .g8clubpriorities strong','display:block;margin:0;padding:0;border:0;color:#fff;font-size:1.05rem;line-height:1.4')
rule('#g8dialog .g8clubpriorities p','margin:.4rem 0 0;padding:0;color:#dce6fa;font-size:.95rem;line-height:1.55')
css=css.replace('color:#29365c','color:#e5edff')
rule('.g8snakeintro','display:grid;grid-template-columns:max-content minmax(0,1fr);align-items:center;gap:.7rem 1rem;margin:0 0 1.25rem;padding:1rem 1.2rem;background:#14274c;color:#fff;border:1px solid #5477ad;border-left:4px solid #345fd0;border-radius:8px;line-height:1.5')
rule('.g8snakeintro strong','display:block;width:fit-content;padding:.35rem .6rem;background:#214caf;color:#fff;border:1px solid #7a9bdd;border-radius:3px;font-size:.8rem;line-height:1.4;letter-spacing:.09em;text-transform:uppercase')
rule('.g8snakeintro span','display:block;color:#fff;font-size:1rem;line-height:1.5;font-weight:700')
rule('.g8snakeintro p','grid-column:1/-1;flex-basis:auto;margin:0;padding-top:.65rem;border-top:1px solid #506a97;font-size:.95rem;line-height:1.55;color:#dce6fa')
# Restore semantic positive outcomes with opaque forest/emerald fills and white ink.
rule('#g8stage .g8wirepanel .g8wirein','background:#123f30;border-left-color:#168451')
rule('#g8stage .g8wirepanel .g8wirein .g8stamp','background:#13703f;border-color:#47a476;color:#fff')
rule('#g8stage .g8signingcounts>div','background:#135138;border-color:#4a9770')
css+='\n'+(Q/'polish.css').read_text()
roles=oldScripts[13];a=roles.index('  const picked=d.ps;');z=roles.index('  return ',a)
roles=roles[:a]+"  const picked=d.ps,batters=picked.filter(p=>p.role==='BAT'||p.role==='WK-BAT'||p.role==='AR'&&p.bat>=50),regular=picked.filter(p=>R.bowlingWorkload(p)>=4&&R.bowlingUsagePrior(p)>=1.5);\n  const coverage=[['Openers',batters.filter(p=>R.battingRoleBand(p)==='OPEN'),'opener'],['Top order',batters.filter(p=>R.battingRoleBand(p)==='TOP'),'top'],['Middle order',batters.filter(p=>['MIDDLE','LOWER'].includes(R.battingRoleBand(p))),'middle'],['Finishers',batters.filter(X.isFinisher),'finisher'],['Keepers',picked.filter(R.isKeeper),'keeper'],['All-rounders',picked.filter(p=>p.role==='AR'),'allrounder'],['Pace bowlers',regular.filter(p=>['PACE','DUAL'].includes(R.bowlingStyle(p))),'pace'],['Spin bowlers',regular.filter(p=>['SPIN','DUAL'].includes(R.bowlingStyle(p))),'spin']];\n"+roles[z:]
roles=roles.replace('aria-label="Picked roles"','aria-label="Picked squad options. Players can cover more than one role."')
(R/'v8/ui/roles.js').write_text(roles);(Q/'roles.js').write_text(roles)
(R/'v8/ui/match_story.js').write_text(oldScripts[15]);(Q/'match_story.js').write_text(oldScripts[15])
controller=oldScripts[19];controller=controller.replace(".g8revealgrid>.g8sealed[data-key]",".g8revealgrid>.g8sealed[data-key],.g8revealgrid>.g8orderhidden[data-key]").replace(".g8revealgrid>[data-key]:not(.g8sealed)",".g8revealgrid>[data-key]:not(.g8sealed):not(.g8orderhidden)")
needle="card.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'cubic-bezier(.2,.7,.3,1)'});"
assert needle in controller
controller=controller.replace(needle,"card.classList.contains('g8ordercard')?card.animate([{opacity:.15,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}],{duration:480,easing:'cubic-bezier(.2,.7,.3,1)'}):"+needle)
(R/'v8/ui/controller.js').write_text(controller);(Q/'controller.js').write_text(controller);(R/'v8/ui/workspace.css').write_text(css+'\n');h=h.replace(oldScripts[19],controller,1).replace(oldScripts[13],roles,1).replace(old,css,1)
after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);assert [i for i,(x,y)in enumerate(zip(oldScripts,after))if x!=y]==[13,19]
for i,s in enumerate(after):
 p=Q/f'script-{i}.js';p.write_text(s);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
(Q/'candidate.html').write_text(h);out={'release':'v98','baseGame':'v97','baseCommit':'6f53f4196e55b70d8aabb9eb4ec94426d03323c4','sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':18,'changedPresentationScripts':[13,19]};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(out)
