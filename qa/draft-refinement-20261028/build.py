from pathlib import Path
import re,hashlib,json,colorsys,subprocess
Q=Path(__file__).resolve().parent;R=Q.parents[1];b=(Q/'baseline.html').read_text();assert hashlib.sha256(b.encode()).hexdigest()=='a3d4e33271d167c31caca59d05f8b45280b00268c105a8d587edb94b66e33e29';scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',b,re.S)
for i,name in [(11,'components.js'),(12,'data.js'),(13,'roles.js'),(17,'screens.js')]:
 s=scripts[i]
 if i==11:s=s.replace("'#9ee59c'","'#f5f8ff'").replace("'#f5d96c'","'#ffc45b'").replace("'#ff9f99'","'#ff9ba8'")
 if i==12:
  a=s.index(' X.revealControls=');z=s.index('\n',a)
  s=s[:a]+''' X.revealControls=(kind,count,label,action)=>`<div class="g8decisionbar g8revealbar g8drawcontrols"><div><span class="g8eyebrow">${kind==='league'?'THE CLUBS':'THE DRAFT ORDER'}</span><p><span class="g8drawstatusreserve" aria-hidden="true">8 of 8 revealed · Drawing next club</span><span class="g8drawstatusreserve" aria-hidden="true">8 of 8 revealed · Draw complete</span><span>${count} of 8 revealed · ${count===8?'Draw complete':uiState()}</span></p></div><div class="g8actions g8drawstable"><div class="g8drawpace" ${count===8?'inert aria-hidden="true"':''}>${btn(X.ui.reveal?.running?'Pause reveal':'Resume reveal','revealRun',[],'g8ghost',count===8).replace('<span>', '<span class="g8runlabel"><span class="g8runreserve" aria-hidden="true">Resume reveal</span><span>').replace('</span></button>','</span></span></button>')}${btn(`Speed ${[1,2,4][X.ui.reveal?.speedIndex||0]}×`,'revealSpeed',[],'g8ghost',count===8)}${btn('Reveal all','revealAll',[],'g8ghost',count===8)}</div><div class="g8drawnext" ${count<8?'inert aria-hidden="true"':''}>${btn(label,action,[],'g8primary',count<8)}</div></div></div>`;'''+s[z:]
 if i==13:
  a=s.index('  const picked=d.ps,regular=');z=s.index('\n X.squadRoster=',a);tail=s[a:z];ret=tail[tail.index('  return '):];u=ret.index('<section class="g8draftverdict"');v=ret.index('<section class="g8draftselected"')
  ret=ret[:u]+'''${coverage.some(([,ps])=>ps.length)?`<div class="g8pickedroles" aria-label="Picked roles">${coverage.filter(([,ps])=>ps.length).map(([label,ps,key])=>`<div class="g8pickedrole g8pickedrole-${key}" data-key="picked-role-${key}"><span>${esc(label)}</span><strong>${ps.length}</strong></div>`).join('')}</div>`:''}'''+ret[v:]
  defs='''  const picked=d.ps;
  const coverage=[['Top-order batters',picked.filter(p=>p.role==='BAT'&&['OPEN','TOP'].includes(R.battingRoleBand(p))),'top'],['Middle-order batters',picked.filter(p=>p.role==='BAT'&&!['OPEN','TOP'].includes(R.battingRoleBand(p))),'middle'],['Keepers',picked.filter(p=>p.role==='WK-BAT'),'keeper'],['Batting all-rounders',picked.filter(p=>p.role==='AR'&&p.bat>=p.bowl),'bat-ar'],['Bowling all-rounders',picked.filter(p=>p.role==='AR'&&p.bat<p.bowl),'bowl-ar'],['Pace bowlers',picked.filter(p=>p.role==='BOWL'&&R.bowlingStyle(p)!=='SPIN'),'pace'],['Spin bowlers',picked.filter(p=>p.role==='BOWL'&&R.bowlingStyle(p)==='SPIN'),'spin']];
''';s=s[:a]+defs+ret+s[z:]
 if i==17:
  s=s.replace("btn('Close signing window'","btn('Skip to end'")
  a=s.index(' const orderCard=');z=s.index('\n v.draftDraw=',a);chunk=s[a:z]
  chunk=chunk.replace('const orderCard=(c,i,annual)=>','const orderCard=(c,i,annual,revealed=true)=>').replace("${c.abbr===own()?'g8ordermine':''}","${c.abbr===own()?'g8ordermine':''} ${revealed?'':'g8orderhidden'}")
  chunk=chunk.replace('<div class="g8orderrank">','<div class="g8orderrank" ${revealed?\'\':\'aria-hidden="true"\'}>').replace('${badge(c)}','${badge(c).replace(\'class="g8badge\',`${revealed?\'\':\'aria-hidden="true" \'}class="g8badge`)}').replace('<div class="g8orderidentity">','<div class="g8orderidentity" ${revealed?\'\':\'aria-hidden="true"\'}>')
  chunk=chunk.replace('</div></article>`;','</div>${revealed?\'\':`<div class="g8ordercover"><span>Drawing</span><b>${i+1}</b><small>Awaiting draw</small></div>`}</article>`;')
  u=chunk.index('${order.map(');v=chunk.index('</div>${annual&&',u);chunk=chunk[:u]+"${order.map((c,i)=>orderCard(c,i,annual,i<count)).join('')}"+chunk[v:];chunk=chunk.replace("+(annual&&count===8?X.pickGuide():'')+",'+')
  s=s[:a]+chunk+s[z:];s=s.replace("mine?'On the clock'","mine?'YOUR PICK'").replace("mine?'Your pick.'","mine?'Choose a player below to add to your squad.'")
 if i==17:
  s=s.replace('<p class="g8pickread">','<p class="g8pickread"><span class="g8pickreserve" aria-hidden="true">Choose a player below to add to your squad.</span><span>').replace("'Name your playing XI.')}</p>","'Name your playing XI.')}</span></p>")
 (Q/name).write_text(s);(R/'v8/ui'/name).write_text(s)
css=(Q/'baseline.css').read_text()
def remap(m):
 v=m.group();x=v[1:]
 if len(x) not in (3,6):return v
 if len(x)==3:x=''.join(c*2 for c in x)
 h,l,s=colorsys.rgb_to_hls(*(int(x[i:i+2],16)/255 for i in (0,2,4)))
 if .18<h<.52 and s>.08:
  if l>.55:return '#eaf1ff'
  rgb=colorsys.hls_to_rgb(.625,l,min(.72,max(.38,s)));return '#%02x%02x%02x'%tuple(round(c*255)for c in rgb)
 if .06<h<.19 and l>.65:return '#f1f5ff'
 return v
css='\n'.join(re.sub(r'#[0-9a-fA-F]{3,8}\b',remap,l)if len(l)<10000 else l for l in css.splitlines())+'\n'
css='\n'.join(l for l in css.splitlines()if not any(t in l for t in ['#g8stage .g8draftrole','#g8stage .g8coveragenote','#g8stage .g8draftverdict .g8bowlingrisk','#g8stage .g8draftfreedom']))+'\n'+(Q/'refinement.css').read_text();(R/'v8/ui/workspace.css').write_text(css)
h=b
for i,n in [(11,'components.js'),(12,'data.js'),(13,'roles.js'),(17,'screens.js')]:h=h.replace(scripts[i],(Q/n).read_text(),1)
style=re.findall(r'<style\b[^>]*>(.*?)</style>',h,re.S)[0];old=style[style.index('/* Modern arcade:'):].strip();h=h.replace(old,css.strip(),1)
after=re.findall(r'<script\b[^>]*>(.*?)</script>',h,re.S);changed=[i for i,(x,y)in enumerate(zip(scripts,after))if x!=y];assert changed==[11,12,13,17],changed
for i,s in enumerate(after):
 p=Q/f'script-{i}.js';p.write_text(s);subprocess.run(['node','--check',str(p)],check=True,capture_output=True)
(Q/'candidate.html').write_text(h)
out={'release':'v97','baseCommit':'21e84efc36905e12aa1919c97b540cf13224ab2c','sha256':hashlib.sha256(h.encode()).hexdigest(),'bytes':len(h.encode()),'unchangedScripts':16,'changedPresentationScripts':changed};(Q/'build.json').write_text(json.dumps(out,indent=2)+'\n');print(out)
