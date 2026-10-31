from pathlib import Path
import re,json,hashlib,subprocess,base64
root=Path.cwd();base=root/'baseline/GCC_v8_Career_Clarity.html';
if not base.exists():
 base.parent.mkdir(parents=True,exist_ok=True);base.write_bytes(subprocess.check_output(['git','show','52a93845d91f0f22352969d58144da678130212b:game/gcc_v8_product_candidate.html']))
assert hashlib.sha1(b'blob '+str(len(base.read_bytes())).encode()+b'\0'+base.read_bytes()).hexdigest()=='69a3d1666f9300af5a739bd32872fb4633f210c7'
raw=base.read_text();matches=list(re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',raw,re.I));parts=[m[1] for m in matches]
def rep(i,a,b):
 assert parts[i].count(a)==1,(i,a[:70],parts[i].count(a));parts[i]=parts[i].replace(a,b)
rep(10,"if(bad.length)return `${bad[0].name} is out. Name a replacement before the next match.`;return ''}","if(bad.length)return `${bad[0].name} is out. Name a replacement before the next match.`;if(!xi.some(id=>isKeeper(pById(id))))return 'Select a recognised wicketkeeper before the next match.';return ''}")
rep(10,"if(state.xi.length!==11)return base.startSeason(...args);if(state.year>2008)","if(state.xi.length!==11)return base.startSeason(...args);const selectionIssue=userXIProblem();if(selectionIssue)return base.toast(selectionIssue);if(state.year>2008)")
# Keep the established ranking and RNG consumption, then honour actual promises among legal candidates.
rep(9,'const pick=ranked[0];',"const priority=bowlClub.abbr===state.userClub?.abbr?window.GCC8_MANAGEMENT?.bowlingPriority(state.dynasty?.v8Management,candidates,assigned)||[]:[];\n      const pick=ranked.find(row=>priority.includes(row.p.id))||ranked[0];")
rep(9,'context,estimate,order:matchBattingOrder(batClub).map(fit)',"context:{...context,bowlingCommitments:bowlClub.abbr===state.userClub?.abbr?Object.entries(state.dynasty?.v8Management?.players||{}).filter(([,p])=>p.promise?.kind==='bowling'&&p.promise.status==='active').map(([id])=>Number(id)):[]},estimate,order:matchBattingOrder(batClub).map(fit)")
rep(2,"if(!choices.length)throw Error('No eligible bowler for the next over.');", "if(!choices.length)throw Error('No eligible bowler for the next over.');\n   const promised=choices.filter(p=>context.bowlingCommitments?.includes(p.id)&&bowling.get(p.id).balls<12);\n   if(promised.length)return promised.sort((a,b)=>bowling.get(a.id).balls-bowling.get(b.id).balls||a.id-b.id)[0];")
p=Path('v8/ui/management.js');old=parts[16][parts[16].index('/* Persistent squad expectations.'):].strip();s=old
s=s.replace(' concern(p){'," bowlingPriority(state,candidates,assigned){return candidates.filter(p=>{const z=state?.players?.[p.id]?.promise;return z?.kind==='bowling'&&z.status==='active'&&(assigned.get(p.id)||0)<2;}).map(p=>p.id);},\n concern(p){",1)
anchor=' X.managementPlayer=p=>'
pos=s.index(anchor)
s=s[:pos]+''' const medical=i=>!i?'Fully available':`${i.status} · ${i.type}${Number.isFinite(i.roundsLeft)?` · about ${i.roundsLeft} round${i.roundsLeft===1?'':'s'} remaining`:''}`;
 const reasons=q=>{const lines=[];if(q.omitted>=(q.regular?3:5))lines.push(`${q.omitted} fully fit matches without selection.`);if(q.mismatch>=3)lines.push(`${q.mismatch} selections outside the preferred batting role.`);if(q.underused>=3)lines.push(`${q.underused} full innings without meaningful bowling opportunities.`);if(q.broken)lines.push(`${q.broken} commitment${q.broken===1?' was':'s were'} not met.`);if(q.requested&&!lines.length)lines.push('An unresolved request from earlier in this career. Consistent opportunities can rebuild trust.');return lines.length?`<p class="g8concernreason"><b>Why this matters</b> ${esc(lines.join(' '))}</p>`:'';};
''' + s[pos:]
s=s.replace("injury?injury.status+' · '+injury.type:'Fully available'","medical(injury)")
s=s.replace('<dl class="g8playercontext">','${reasons(q)}<dl class="g8playercontext">')
s=s.replace("Give two overs in each of the next two fit, full-length bowling innings.","The automatic bowling plan prioritises two legal overs in each of the next two fit, full-length bowling innings. Short innings may end before the spell is completed.")
s=s.replace("action('Commit to bowling role','bowling',active)","action('Guarantee a two-over role','bowling',active)")
s=s.replace("p.promise.kind==='run'?'fit matches':p.promise.kind==='batting'?'selections':'full bowling opportunities'", "p.promise.kind==='run'?(p.promise.remaining===1?'fit match':'fit matches'):p.promise.kind==='batting'?(p.promise.remaining===1?'selection':'selections'):(p.promise.remaining===1?'full bowling opportunity':'full bowling opportunities')")
s=s.replace(' ${options.length} ${fav?', ' ${options.length} regular ${fav?',1)
start=s.index(' X.managementBrief=');end=s.index(' X.managementResult=',start)
s=s[:start]+''' X.managementBrief=(selection=false)=>{const detail=(q,injury)=>{const cause=q.underused>=3?`${q.underused} full innings without a bowling role`:q.mismatch>=3?`${q.mismatch} selections outside preferred role`:q.omitted>=(q.regular?3:5)?`${q.omitted} fit matches without selection`:q.broken?'A previous commitment was not met':q.requested?'Unresolved transfer request':'';const progress=q.promise?.status==='active'?promise(q)+(injury?.status==='OUT'?' · Paused during medical absence':''):'';return [cause,progress].filter(Boolean).join(' · ');};const state=X.managementState(),all=roster().flatMap((p,index)=>{const q=state.players[p.id],injury=X.injury(p),c=concern(q),selected=s.xi.includes(p.id);return injury||c||q.promise?.status==='active'?[{p,index,detail:detail(q,injury),priority:injury&&selected?0:injury?1:q.promise?.status==='active'?2:q.requested?3:4,text:injury?`${medical(injury)}${selected?' · Currently selected':''}`:c||promise(q)}]:[]}).sort((a,b)=>a.priority-b.priority||a.index-b.index),rows=all.slice(0,3),conditions=!selection?X.managementConditions():null;if(!rows.length&&!conditions)return '';const line=({p,text,detail})=>`<div class="g8decisionline"><div><strong>${esc(p.name)}</strong><span>${esc(text)}</span>${detail&&detail!==text?`<small class="gccuiDecisionDetail">${esc(detail)}</small>`:''}</div>${btn('Review player','manageInspect',[p.id],'g8ghost g8small')}</div>`;return `<section class="g8dressingroom" aria-label="Selection decisions"><header><span class="g8eyebrow">IN THE DRESSING ROOM</span><h2>${rows.length?'Squad decisions':'Read the contest'}</h2></header>${rows.map(line).join('')}${all.length>3?X.disclosure(`${all.length-3} more squad decisions`,all.slice(3).map(line).join('')):''}${conditions?`<p class="g8conditionbrief">${esc(conditions.text)}</p>`:''}</section>`;};
''' +s[end:]
assert old.strip() in parts[16];parts[16]=parts[16].replace(old.strip(),s.strip());p.write_text(s)
rep(16,'${remaining} optional releases left',"${remaining} optional release${remaining===1?'':'s'} left")
rep(16,'${all.length-3} more squad decisions',"${all.length-3} more squad decision${all.length-3===1?'':'s'}")
rep(17,"['Wins',s.dynasty.manager.wins]","['League wins',s.dynasty.manager.wins]")
rep(17,'${t.w} wins · ${t.l} losses',"${t.w} win${t.w===1?'':'s'} · ${t.l} loss${t.l===1?'':'es'}")
rep(17,"[['Finished',`${s.regularSeasonPosition} of 8`]", "[['League position',`${s.regularSeasonPosition} of 8`]")
rep(19,'${m.released.length} were released',"${m.released.length} ${m.released.length===1?'was':'were'} released")
rep(19,'${read.tradeAllowance()} trades and ${read.departureBudget().remaining} voluntary departures left this season.', "${read.tradeAllowance()} trade${read.tradeAllowance()===1?'':'s'} and ${read.departureBudget().remaining} voluntary departure${read.departureBudget().remaining===1?'':'s'} left this season.")
rep(19,"'Offseason · closes when the draft begins'","'Preseason window · closes at draft entry; reopens until Round 3'")
rep(19,'Choose the players and picks on each side. Each club can include up to two players and two picks. Nothing changes until you review and confirm.',"${ui.tradeMid?'Choose up to two players on each side. Equal numbers must move; draft picks are unavailable.':'Choose up to two players and two owned picks on each side.'} Nothing changes until you review and confirm.")
# Dynamic template requires a backtick rather than the old single-quoted static string.
parts[19]=parts[19].replace("return '<p class=\"g8tradeguide\">${ui.tradeMid?", "return `<p class=\"g8tradeguide\">${ui.tradeMid?").replace("Nothing changes until you review and confirm.</p>';", "Nothing changes until you review and confirm.</p>`;")
rep(11,"const ratingTone=value=>Number(value)>=80?'#f5f8ff':Number(value)>=65?'#ffc45b':'#ff9ba8';", "const ratingTone=value=>{const n=Number.isFinite(Number(value))?Math.max(0,Math.min(99,Number(value))):0,a=n<=65?[238,139,130]:[234,182,95],b=n<=65?[234,182,95]:[126,201,142],t=n<=65?n/65:(n-65)/34;return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('');};")
rep(11,"?'BATTED FIRST':'CHASED'", "?'BATTED FIRST':r.homeInnings.total===r.awayInnings.total?'SCORES TIED':r.winner.abbr===club.abbr?'TARGET REACHED':'CHASE FELL SHORT'")
rep(9,'${state.pool.length} eligible players across the 2008 cricket world. Five days','${state.pool.filter(p=>(p.dynastyCareer?.debutYear??2008)<=2008).length} eligible players across the 2008 cricket world. Five days')
rep(9,'${state.pool.length} eligible players across the 2008 cricket world. You jump','${state.pool.filter(p=>(p.dynastyCareer?.debutYear??2008)<=2008).length} eligible players across the 2008 cricket world. You jump')
rep(17,'</section>${X.seasonProgress()}<section class="g8sheet g8seasonstars">',"""</section>${s.finals?.gf?X.disclosure('How the title was decided',`<div class="g8finalsrecap">${(s.finals.semis||[]).map((r,i)=>`<p><b>Semi-final ${i+1}</b> ${esc(r.winner.name)} won ${esc(r.marginText)} ${btn('Open scorebook','finalScorecard',['semis',i],'g8ghost g8small')}</p>`).join('')}${resultCard(s.finals.gf)}${btn('Grand Final scorebook','finalScorecard',['gf',0],'g8ghost')}</div>`):''}${X.seasonProgress()}<section class="g8sheet g8seasonstars">""")
rep(19,"bind('finalScorecard',['finals']", "bind('finalScorecard',['finals','review']")
rep(16,"+X.offseasonSteps()+X.departureGuide()+(managing?", "+X.offseasonSteps()+(managing?X.departureGuide():'')+(managing?")
rep(16,'</aside></div><div class="g8annualdetails">', '</aside></div>${X.disclosure("Squad rules & departure allowance",X.departureGuide())}<div class="g8annualdetails">')
rep(17,'content=resultCard(f.gf)+(', 'content=resultCard(f.gf)+X.matchAwards(f.gf)+X.matchWorm(f.gf)+(')
rep(19,'${esc(result.message)}',"${esc(result.message.replace(`${deal.club} reject it.`,`${s.league.find(c=>c.abbr===deal.club)?.name||deal.club} declined this offer.`))}")
trade_rules='<p class="g8fine">${ui.tradeMid?\'Equal numbers of players must move each way, up to two per club. Draft picks cannot be included.\':\'Up to two players and two owned Round 1 / Round 2 picks per club. Picks become available after the draw.\'} Each outgoing player uses one departure; incoming players do not refund it.</p>'
rep(19,trade_rules,'${X.disclosure("Trade rules",`'+trade_rules+'`)}')
# The partner applies to both sides; keep corresponding package fields aligned.
trade_partner='<label>Other club<select data-input="tradeClub">${s.league.filter(c=>c.abbr!==own()).map(c=>`<option value="${c.abbr}" ${ui.tradeClub===c.abbr?\'selected\':\'\'}>${esc(c.name)}</option>`).join(\'\')}</select></label>'
rep(19,trade_partner,'')
rep(19,'<div class="g8trade g8tradepackage">','<div class="gccTradePartner">'+trade_partner+'</div><div class="g8trade g8tradepackage">')
rep(15,'<header class="gcc-scorebug"><div><span class="g8eyebrow">${phase}</span><h2>${badge(batClub)}${esc(batClub.name)}</h2><span class="gcc-opposition">v ${esc(opposition.name)} · ${fixtureScore(opposition)}</span></div><div class="gcc-total"><strong>${total}/${wickets}</strong><span>${overText} overs · CRR ${balls?(total*6/balls).toFixed(2):\'0.00\'}</span></div><p class="gcc-equation">${esc(scoreContext)}</p></header>','${X.liveScoreboard(r,batClub,fixtureScore,phase,overText,balls,total,scoreContext)}')
# Shared knockout fixture keeps ready semi-finals and the Grand Final aligned.
fixture='<div class="g8fixture"><div>${badge(a)}<h2>${X.teamLabel(a)}</h2></div><span>v</span><div>${badge(b)}<h2>${X.teamLabel(b)}</h2></div></div>'
assert parts[17].count(fixture)==2
parts[17]=parts[17].replace(fixture,'${X.knockoutFixture(a,b)}')
rep(15,'<section class="gcc-scoreinnings"><header>', '<section class="gcc-scoreinnings" style="--innings-club:${esc(i.club.c)};--innings-ink:${esc(X.clubInk(i.club))}"><header>')
rep(15,"${d.runs} runs${extra?","${d.runs} ${d.runs===1?'run':'runs'}${extra?")
rep(15,"last.runs+' runs'","last.runs+(last.runs===1?' run':' runs')")
rep(11,"${glyph?icon(glyph):''}","${glyph?(window.GCC8?.designIcon?window.GCC8.designIcon(glyph):icon(glyph)):''}")
rep(11,'const icon=name=>`<svg', 'const icon=name=>window.GCC8?.approvedIcon?.(name)||`<svg')
rep(11,' const resultCard=r=>{',' const resultCard=r=>window.GCC8?.designResultCard?window.GCC8.designResultCard(r):legacyResultCard(r);\n const legacyResultCard=r=>{')
rep(11,"finishCareer:'trophy'}", "finishCareer:'trophy',swapSelected:'arrows-sort',cancelSwap:'arrows-sort',naturalOrder:'arrows-sort',clearXI:'users-group',teamAnalysis:'chart-bar',watchNext:'player-play',retainXI:'shirt-sport'}")
rep(19,"pendingFocus='.g8bench .g8namescout'", "pendingFocus='.gccuiBench .gccuiRosterName, .g8bench .g8namescout'")
# Approved GCC crest, embedded once so the game remains completely offline.
rep(17,'<h1><span>Global</span><br><span class="g8titleaccent">Champions</span><br><span>Cricket</span></h1>', '<h1 class="gccBrandTitle"><button type="button" class="gccBrandStart" data-action="play" data-args="[]" aria-label="Start a Global Champions Cricket career"><svg class="gccBrandHero" viewBox="0 0 1222 1287" role="img" aria-label="Global Champions Cricket"><use href="#gcc-brand-crest"></use></svg></button></h1>')
rep(19,"${X.icon('cricket')}GCC</button>", '<svg class="gccBrandMini" viewBox="0 0 1222 1287" aria-hidden="true"><use href="#gcc-brand-crest"></use></svg></button>')
# Fresh playback waits at a truthful batting-order acknowledgement. Existing saved
# snapshots keep their count and running status, without a retroactive interruption.
rep(19,"{count:0,presentationVersion:version,speedIndex:0,running:true,year:s.year", "{count:0,preMatch:true,presentationVersion:version,speedIndex:0,running:false,year:s.year")
rep(19," bind('matchRun',['matchReveal']", " bind('startPlayback',['matchReveal'],()=>{assert(ui.match?.preMatch,'The match has already started.');ui.match.preMatch=false;ui.match.running=true;scheduleMatch();});\n bind('matchRun',['matchReveal']")
rep(17,'${position} on the ladder','Ladder position ${position}')
rep(17,'Now ${r.ladderAfter} on the ladder','Ladder position ${r.ladderAfter}')
rep(17,'Finished ${h.userPosition}','League position ${h.userPosition}')
rep(19,'Finished ${h.userPosition}','League position ${h.userPosition}')
rep(2,'const pair=[[r.homeInnings,r.home],[r.awayInnings,r.away]];', "const first=r.battingFirst||r.scorecard?.innings?.[0]?.club;\n   if(r.toss!=null&&(typeof r.toss!=='object'||Array.isArray(r.toss)||![r.home.abbr,r.away.abbr].includes(r.toss.winner)||!['bat','bowl'].includes(r.toss.decision)||!first||(r.toss.winner===first.abbr)!==(r.toss.decision==='bat')))return false;\n   const pair=[[r.homeInnings,r.home],[r.awayInnings,r.away]];")
# Record the joint toss winner/choice using the existing uniform draw. Four equal
# intervals encode the four combinations; awayFirst and subsequent RNG are unchanged.
rep(9,'// first gives the season a real chase/defence split without inventing a toss UI.','// first retains a real chase/defence split. The same draw records the toss.')
rep(9,'const awayFirst = rng() < .5;', 'const tossDraw = rng();\n    const awayFirst = tossDraw < .5;')
rep(9,'const secondClub = awayFirst ? home : away;', "const secondClub = awayFirst ? home : away;\n    const tossWinner = Math.floor(tossDraw * 4) % 2 === 0 ? home : away;\n    const toss = {winner:tossWinner.abbr,decision:tossWinner.abbr===firstClub.abbr?'bat':'bowl'};")
rep(9,'return { hi, ai, winner, tieBreak, superOver, firstClub, secondClub, firstInnings, secondInnings, weather:matchGround.weather, matchGround };', 'return { hi, ai, winner, tieBreak, superOver, firstClub, secondClub, firstInnings, secondInnings, toss, weather:matchGround.weather, matchGround };')
assert parts[9].count('battingFirst:pair.firstClub, battingSecond:pair.secondClub,')==2
parts[9]=parts[9].replace('battingFirst:pair.firstClub, battingSecond:pair.secondClub,','battingFirst:pair.firstClub, battingSecond:pair.secondClub, toss:pair.toss,')
# Remove optional file-management UI while preserving automatic save/recovery.
rep(19,"pendingRestoreFeedback=null,",'')
rep(19,"const recoveryNotice=()=>read.saveSucceeded?.()&&read.checkpointMode?.()!=='strict'?'Progress saved in this browser. Download a backup for extra crash protection.':'';", "const recoveryNotice=()=>'';")
rep(19,'Saving is taking longer. Keep the game open or download a backup.','Saving is taking longer. Keep the game open.')
assert parts[19].count('Progress is not saved. Keep this game open and download a backup before closing.')==3
parts[19]=parts[19].replace('Progress is not saved. Keep this game open and download a backup before closing.','Progress is not saved. Keep this game open.')
parts[19]='\n'.join(line for line in parts[19].split('\n') if not line.lstrip().startswith('if(pendingRestoreFeedback'))
a=parts[19].index(' let pendingBackup=null,backupReadId=0;');b=parts[19].index(" bind('home','*'",a);parts[19]=parts[19][:a]+parts[19][b:]
rep(19,'pendingBackup=null;backupReadId++;','')
rep(19,"if(action!=='confirmBackup')pendingRestoreFeedback=null;",'')
rep(19,"if(key==='careerBackup'){readBackupFile(el.files?.[0]);return;}",'')
rep(10,'Keep this game open and retry or download a backup.','Keep this game open and retry.')
rep(10,'The recovery checkpoint could not be completed. Keep this game open and download a backup.','The recovery checkpoint could not be completed. Keep this game open and retry.')
rep(10,'Could not clear this career. Keep the game open and download a backup.','Could not clear this career. Keep the game open and retry.')
parts[18]+='\n'+(root/'v8/ui/decision-ui.js').read_text()
for i in (9,10,11,16,17,19):
 path=root/('v8/engine/'+('foundation.js' if i==9 else 'dynasty.js')) if i in (9,10) else root/('v8/ui/'+{11:'components.js',16:'career.js',17:'screens.js',19:'controller.js'}[i]);path.write_text(parts[i])
domain=parts[2][parts[2].index('/* Causal T20 delivery simulation.'):];domain=domain[:domain.index('})();')+5];(root/'v8/domain/delivery_engine.js').write_text(domain)
for i in reversed(range(len(matches))):
 m=matches[i];raw=raw[:m.start(1)]+parts[i]+raw[m.end(1):]
css=(root/'v8/ui/arcade-charcoal.css').read_text();raw=raw.replace('</head>','<style id="gcc-charcoal-20261030">\n'+css+'\n</style></head>')
raw=raw.replace('</head>','<style id="gcc-decision-ui-20261030">\n'+(root/'v8/ui/decision-ui.css').read_text()+'\n</style></head>')
# Preserve the supplied PNG bytes; SVG masks make the white paper transparent at render time.
symbols=[]
for asset in json.loads((root/'v8/ui/assets/approved-icons.json').read_text()):
 name=asset['name'];w,h=asset['size'];x0,y0,x1,y1=asset['inkBounds'];pad=max(x1-x0,y1-y0)*.035
 view=f'{x0-pad} {y0-pad} {x1-x0+pad*2} {y1-y0+pad*2}';data=base64.b64encode((root/asset['path']).read_bytes()).decode()
 symbols.append(f'<symbol id="gcc-approved-{name}" viewBox="{view}"><defs><filter id="gcc-invert-{name}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"/></filter><mask id="gcc-mask-{name}" maskUnits="userSpaceOnUse" x="0" y="0" width="{w}" height="{h}" style="mask-type:luminance"><image width="{w}" height="{h}" href="data:image/png;base64,{data}" filter="url(#gcc-invert-{name})"/></mask></defs><rect width="{w}" height="{h}" fill="currentColor" stroke="none" mask="url(#gcc-mask-{name})"/></symbol>')
raw=raw.replace('</body>','<svg id="gcc-approved-icons" width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden;pointer-events:none">'+''.join(symbols)+'</svg></body>')
crest=base64.b64encode((root/'v8/ui/assets/gcc-crest.png').read_bytes()).decode()
raw=raw.replace('</body>',f'<svg width="0" height="0" aria-hidden="true" style="position:absolute;overflow:hidden;pointer-events:none"><symbol id="gcc-brand-crest" viewBox="0 0 1222 1287"><image width="1222" height="1287" href="data:image/png;base64,{crest}"/></symbol></svg></body>')
# The approved traced originals contain subpixel contours at UI sizes. A small
# same-colour contour reinforces the existing artwork without replacing it.
for glyph in ('cricket','cricket-ball','stumps'):
 pattern=r'(<symbol id="g8icon-'+glyph+r'"[\s\S]*?</symbol>)'
 match=re.search(pattern,raw);assert match
 weighted=match[0].replace('stroke="none" style="stroke:none"','stroke="currentColor" stroke-width="10" stroke-linejoin="round"')
 raw=raw[:match.start()]+weighted+raw[match.end():]
out=root/'qa/perfection-20261030/candidate.html';out.write_text(raw)
for i,part in enumerate(parts):
 tmp=root/f'qa/perfection-20261030/check-{i}.js';tmp.write_text(part);subprocess.run(['node','--check',str(tmp)],check=True,capture_output=True)
(root/'qa/perfection-20261030/build.json').write_text(json.dumps({'baseBlob':'69a3d1666f9300af5a739bd32872fb4633f210c7','baseCommit':'52a93845d91f0f22352969d58144da678130212b','sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'changedScripts':[i for i,p in enumerate(parts) if p!=matches[i][1]],'syntaxChecked':len(parts)},indent=2))
