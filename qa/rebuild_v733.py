#!/usr/bin/env python3
from pathlib import Path
import hashlib,re,subprocess,sys

ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
V732=GAME/'global_champions_cricket_v7_3_2_cricket_language.html'
V733=GAME/'global_champions_cricket_v7_3_3_visual_identity.html'
EXPECTED_732='693558f48012bc878672e7dedd4524eaed7616597319d5539dba0c9d9b7994da'
EXPECTED_733='88c1c2b21ae7593d77b94babfda74e8df247e1f1e13be7f5de89a80abe62f650'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

if not V732.exists():
    subprocess.run([sys.executable,str(ROOT/'qa'/'rebuild_v732.py')],cwd=ROOT,check=True)
if sha(V732)!=EXPECTED_732:
    raise SystemExit(f'v7.3.2 SHA mismatch: {sha(V732)}')

t=V732.read_text('utf-8')

css='''
/* v7.3.3 VISUAL IDENTITY -------------------------------------------------
   One cricket mark, one editorial rule system, fewer decorative surfaces. */
:root{
  --identity-bg:#f3eee2;
  --identity-paper:#fbf8f1;
  --identity-rule:#c9bea6;
  --identity-rule-strong:#9f8c66;
  --shadow:none;
  --premium-shadow:none;
  --premium-shadow-soft:none;
}
body{background:var(--identity-bg)}
body::before{display:none}

/* BRAND / HEADER */
.topbar{height:74px;border-bottom:1px solid var(--identity-rule);background:transparent}
.topbar::after{display:none}
.brand{gap:10px;border-radius:0;transition:color .18s ease}
.brand:hover,.brand:active{transform:none}
.brand-mark{
  width:39px!important;height:39px!important;flex:0 0 39px!important;
  color:var(--deep);background:transparent!important;border:0!important;border-radius:0!important;
  box-shadow:none!important;overflow:visible!important
}
.brand:hover .brand-mark{transform:none!important;box-shadow:none!important}
.gcc-brand-symbol{display:block;width:100%;height:100%}
.brand b{font-size:14px;letter-spacing:.105em;line-height:1.05}
.brand small{font-size:10px;letter-spacing:.11em}
.nav{gap:8px}
.nav button{
  padding:9px 3px 7px;border:0;border-bottom:2px solid transparent;border-radius:0;
  background:transparent!important;box-shadow:none!important;transform:none!important
}
.nav button:hover{color:var(--text);border-bottom-color:rgba(140,116,67,.34)}
.nav button.active{color:var(--text);border:0;border-bottom:2px solid var(--gold);background:transparent!important;box-shadow:none}

/* LAUNCHER */
.career-launcher{min-height:calc(100vh - 74px);padding:54px 18px 68px}
.launcher-shell{width:min(600px,100%);padding:0 8px;border:0}
.launcher-mark{width:58px;height:52px;margin:0 auto 19px;color:var(--deep)}
.launcher-kicker{display:none}
.launcher-shell h1{font-size:clamp(36px,5.2vw,52px);letter-spacing:-.035em}
.launcher-summary{margin-top:12px;max-width:450px;font-size:13px;line-height:1.55}
.launcher-career{margin:27px auto 0;padding:0;border:0;max-width:430px}
.launcher-career strong{font-size:25px}
.launcher-actions{margin-top:25px;gap:9px}
.launcher-links{margin-top:15px;gap:18px}
.launcher-status{margin-top:10px}

/* ONE RULE SYSTEM */
.section-head::after{background:var(--identity-rule);opacity:1}
.kicker{letter-spacing:.145em}

/* FLATTER CONTROLS / SURFACES */
.button{
  background:#f7f2e7;border-color:#c6baa2;border-radius:8px;box-shadow:none!important;
  transform:none!important
}
.button:hover{background:#efe7d8;border-color:#a99a7c;box-shadow:none!important;transform:none!important}
.button.primary{background:var(--deep);border-color:var(--deep);box-shadow:none!important}
.button.primary:hover{background:var(--deep-2);border-color:var(--deep-2);box-shadow:none!important}
.world-card,.panel,.stat,.club-card{box-shadow:none}
.club-card:hover{transform:translateY(-2px);box-shadow:none}
.club-card.selected{box-shadow:none}

/* TEAM ROOM: REMOVE DECORATIVE COLLISION, KEEP THE XI OBJECT */
#team .team-selection-panel{
  background:var(--surface);border-top:2px solid var(--deep);box-shadow:none!important
}
#team .team-selection-panel::before{display:none}
#team .team-xi-column{background:transparent}
#team .team-xi-column::before{background:var(--identity-rule-strong)}
#team .profile-panel{background:var(--surface-2);border-top:2px solid var(--gold);box-shadow:none!important}
#team .rating-card,#team .ground-report{box-shadow:none!important}
#team .selection-progress{background:transparent}

/* ROUTINE WORKSPACES STAY QUIET; CEREMONY CAN KEEP ITS OWN MOMENTS */
#season .season-panel{background:var(--surface);box-shadow:none!important}
#draft .player-card,#dynasty .player-card{box-shadow:none}

@media(max-width:700px){
  .topbar{height:68px}
  .brand-mark{width:34px!important;height:34px!important;flex-basis:34px!important}
  .brand b{font-size:13px;letter-spacing:.09em}
  .brand small{font-size:9px}
  .career-launcher{min-height:calc(100vh - 68px);padding:38px 16px 52px}
  .launcher-shell{padding:0}
  .launcher-mark{width:52px;height:47px;margin-bottom:18px}
  .launcher-shell h1{font-size:38px}
  #team .team-selection-panel{padding:12px!important}
}
'''

anchor='@media(max-width:700px){#recruit .signing-actions{display:grid;grid-template-columns:1fr 1fr;width:100%}#recruit .signing-actions .button{width:100%}#recruit .signing-actions #runRecruit{grid-column:1/-1}#recruit .signing-scoreline{white-space:normal;line-height:1.4}#recruit .day-track{grid-template-columns:repeat(5,1fr)}#recruit .day-pill{text-align:center;border-bottom:0}#recruit .recruit-roll{min-height:160px;padding:22px 18px}#recruit .recruit-roll h3{font-size:30px!important}#recruit .signing-recent{grid-template-columns:1fr}#recruit .signing-recent .feed-item{grid-template-columns:1fr;gap:3px}#recruit .signing-side .button{width:100%}#recruit .signing-wire-head{align-items:flex-start;flex-direction:column}#recruit .signing-wire-head .button{width:100%}#recruit .signing-wire-panel .recruit-feed{grid-template-columns:1fr;max-height:66vh}}\n'
if t.count(anchor)!=1:
    raise SystemExit('visual CSS insertion anchor mismatch')
t=t.replace(anchor,anchor+'\n'+css,1)

old_crest='''    <symbol id="gcc-crest" viewBox="0 0 64 64">
      <rect x="14" y="16" width="8" height="40" rx="1.8" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="28" y="16" width="8" height="40" rx="1.8" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="42" y="16" width="8" height="40" rx="1.8" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="19" y="11" width="12" height="4" rx="1.4" fill="none" stroke="currentColor" stroke-width="3"/>
      <rect x="33" y="11" width="12" height="4" rx="1.4" fill="none" stroke="currentColor" stroke-width="3"/>
    </symbol>'''
new_crest='''    <symbol id="gcc-crest" viewBox="0 0 72 64">
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 16v34M29 16v34M41 16v34" stroke-width="3.2"/>
        <path d="M14 13h18M28 13h18" stroke-width="3.2"/>
        <circle cx="56" cy="39" r="9" stroke-width="3.2"/>
        <path d="M51 32.5c3.2 2.7 5.5 6.7 6.8 12.7" stroke-width="1.7"/>
      </g>
    </symbol>'''
if t.count(old_crest)!=1:
    raise SystemExit('crest anchor mismatch')
t=t.replace(old_crest,new_crest,1)

pattern=r'<span class="brand-mark"><img src="data:image/png;base64,[^"]+" alt="" aria-hidden="true"></span>'
replacement='<span class="brand-mark" aria-hidden="true"><svg class="gcc-brand-symbol" viewBox="0 0 72 64"><use href="#gcc-crest"></use></svg></span>'
t,n=re.subn(pattern,replacement,t,count=1)
if n!=1:
    raise SystemExit(f'brand raster replacement count: {n}')

launcher_old='<div class="launcher-mark" aria-hidden="true"><svg viewBox="0 0 64 64"><use href="#gcc-crest"></use></svg></div>'
launcher_new='<div class="launcher-mark" aria-hidden="true"><svg viewBox="0 0 72 64"><use href="#gcc-crest"></use></svg></div>'
if t.count(launcher_old)!=1:
    raise SystemExit('launcher mark viewport anchor mismatch')
t=t.replace(launcher_old,launcher_new,1)

old_version="document.body.dataset.uiVersion = 'v7.3.2-cricket-language';"
new_version="document.body.dataset.uiVersion = 'v7.3.3-visual-identity';"
if t.count(old_version)!=1:
    raise SystemExit('UI version anchor mismatch')
t=t.replace(old_version,new_version,1)

V733.write_text(t,'utf-8')
if sha(V733)!=EXPECTED_733:
    raise SystemExit(f'v7.3.3 SHA mismatch: {sha(V733)}')

print(f'v7.3.2 OK  {EXPECTED_732}')
print(f'v7.3.3 OK  {EXPECTED_733}')
