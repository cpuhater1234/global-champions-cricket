from pathlib import Path
import re,json,hashlib,subprocess,base64
root=Path.cwd();base=root/'baseline/GCC_v8_Career_Clarity.html';
if not base.exists():
 base.parent.mkdir(parents=True,exist_ok=True);base.write_bytes(subprocess.check_output(['git','show','52a93845d91f0f22352969d58144da678130212b:game/gcc_v8_product_candidate.html']))
assert hashlib.sha1(b'blob '+str(len(base.read_bytes())).encode()+b'\0'+base.read_bytes()).hexdigest()=='69a3d1666f9300af5a739bd32872fb4633f210c7'
raw=base.read_text();matches=list(re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',raw,re.I));parts=[m[1] for m in matches]
def rep(i,a,b):
 assert parts[i].count(a)==1,(i,a[:70],parts[i].count(a));parts[i]=parts[i].replace(a,b)
# Finals share the same per-round medical boundary in visible and offscreen play.
rep(9,'  function simulateFinals() {',"  function simulateFinalsRound(pairs,round){return window.GCC8_ENGINE_READ.finalsRound(()=>pairs.map(([home,away])=>simulateKnockout(home,away,round)),round)}\n  function simulateFinals() {")
rep(9,'f.semis=[simulateKnockout(top[0],top[3],15),simulateKnockout(top[1],top[2],15)];','f.semis=simulateFinalsRound([[top[0],top[3]],[top[1],top[2]]],15);')
rep(9,'f.gf=simulateKnockout(f.gfPair.home,f.gfPair.away,16);','[f.gf]=simulateFinalsRound([[f.gfPair.home,f.gfPair.away]],16);')
rep(9,'const semis = [simulateKnockout(top[0], top[3], 15), simulateKnockout(top[1], top[2], 15)];','const semis = simulateFinalsRound([[top[0],top[3]],[top[1],top[2]]],15);')
rep(9,'const gf = simulateKnockout(host, away, 16);','const [gf] = simulateFinalsRound([[host,away]],16);')
a=parts[10].index('  function processInjuries(){');b=parts[10].index('  function cpuSelectionValue',a)
medical=parts[10][a:b].replace('function processInjuries(){','function processInjuries(medicalRound=state.round,participants=null){').replace('const played=new Set([...(state.xi||[]),...Object.values(state.cpuXIs||{}).flat()]);','const played=participants||new Set([...(state.xi||[]),...Object.values(state.cpuXIs||{}).flat()]);')
medical=medical.replace('${state.round}', '${medicalRound}').replace('if(existing.has(p.id)||d.injuries[p.id])continue;','if(!played.has(p.id)||existing.has(p.id)||d.injuries[p.id])continue;')
parts[10]=parts[10][:a]+medical+parts[10][b:]
rep(10,'const r=withFitnessContext(()=>base.simulateFinals(...args));','const r=base.simulateFinals(...args);')
rep(10,'window.GCC8_ENGINE_READ={coverStatus,','window.GCC8_ENGINE_READ={finalsRound:(play,round)=>{const matches=withFitnessContext(play),played=new Set(matches.flatMap(m=>m.scorecard.innings.flatMap(i=>i.batting.map(b=>b.player.id))));processInjuries(round,played);return matches;},coverStatus,')
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
# A closed commitment describes what happened, not a future automatic plan.
a=s.index(' X.managementPlayer=p=>')
s=s[:a]+''' const commitmentTerms=q=>q.promise.status==='kept'?'The commitment was met. Future selections and role use remain your choice.':q.promise.status==='broken'?'The commitment was not met. Rebuild trust through selections and role use.':q.promise.status==='expired'?'This commitment closed with the previous season.':(q.promise.kind==='run'?'Select for three fully fit matches.':q.promise.kind==='batting'?'Use the preferred batting role in the next two fit selections.':'The automatic bowling plan prioritises two legal overs in each of the next two fit, full-length bowling innings. Short innings may end before the spell is completed.')+' Medical absences pause the commitment. Being managed medically pauses assessment, including when selected.';
'''+s[a:]
a=s.index('<span>${q.promise.kind===',s.index(' X.managementPlayer=p=>'));b=s.index('</span>',a)+len('</span>')
s=s[:a]+'<span>${esc(commitmentTerms(q))}</span>'+s[b:]
start=s.index(' X.managementBrief=');end=s.index(' X.managementResult=',start)
s=s[:start]+''' X.managementBrief=(selection=false)=>{const detail=(q,injury)=>{const cause=q.underused>=3?`${q.underused} full innings without a bowling role`:q.mismatch>=3?`${q.mismatch} selections outside preferred role`:q.omitted>=(q.regular?3:5)?`${q.omitted} fit matches without selection`:q.broken?'A previous commitment was not met':q.requested?'Unresolved transfer request':'';const progress=q.promise?.status==='active'?promise(q)+(injury?' · Paused during medical absence':''):'';return [cause,progress].filter(Boolean).join(' · ');};const state=X.managementState(),all=roster().flatMap((p,index)=>{const q=state.players[p.id],injury=X.injury(p),c=concern(q),selected=s.xi.includes(p.id);return injury||c||q.promise?.status==='active'?[{p,index,detail:detail(q,injury),priority:injury&&selected?0:injury?1:q.promise?.status==='active'?2:q.requested?3:4,text:injury?`${medical(injury)}${selected?' · Currently selected':''}`:c||promise(q)}]:[]}).sort((a,b)=>a.priority-b.priority||a.index-b.index),rows=all.slice(0,3),conditions=!selection?X.managementConditions():null;if(!rows.length&&!conditions)return '';const line=({p,text,detail})=>`<div class="g8decisionline"><div><strong>${esc(p.name)}</strong><span>${esc(text)}</span>${detail&&detail!==text?`<small class="gccuiDecisionDetail">${esc(detail)}</small>`:''}</div>${btn('Review player','manageInspect',[p.id],'g8ghost g8small')}</div>`;return `<section class="g8dressingroom" aria-label="Selection decisions"><header><span class="g8eyebrow">IN THE DRESSING ROOM</span><h2>${rows.length?'Squad decisions':'Read the contest'}</h2></header>${rows.map(line).join('')}${all.length>3?X.disclosure(`${all.length-3} more squad decisions`,all.slice(3).map(line).join('')):''}${conditions?`<p class="g8conditionbrief">${esc(conditions.text)}</p>`:''}</section>`;};
''' +s[end:]
# Selection conversations address a concern, rather than rewarding repeated visits.
def management_rep(a,b):
 global s
 assert s.count(a)==1,(a[:90],s.count(a));s=s.replace(a,b)
management_rep('lastTalk:Number.isFinite(v.lastTalk)', "rotationExplained:typeof v.rotationExplained==='boolean'?v.rotationExplained:num(v.omitted)>0&&(num(v.grace)>0||Number.isFinite(v.lastTalk)&&v.lastTalk>=0),lastTalk:Number.isFinite(v.lastTalk)")
management_rep("q.lastTalk=-3;if(q.promise", "q.lastTalk=-3;q.rotationExplained=false;if(q.promise")
management_rep(' decide(state,id,action){', " rotationProblem(p){return p.promise?.status==='active'?'Honour your current commitment before explaining rotation.':p.omitted<(p.regular?3:5)?'There is no selection concern to address.':p.rotationExplained?'You already explained this spell out of the XI. Give the player an opportunity.':p.available-p.lastTalk<3?'Give your explanation time to take effect.':'';},\n decide(state,id,action){")
management_rep("else if(action==='rotation'){if(p.available-p.lastTalk<3)throw Error('Give your explanation time to take effect.');p.lastTalk=p.available;p.grace=2;p.trust=Math.min(100,p.trust+2);}", "else if(action==='rotation'){const issue=E.rotationProblem(p);if(issue)throw Error(issue);p.lastTalk=p.available;p.grace=2;p.rotationExplained=true;}")
management_rep('if(row.selected){p.omitted=0;', 'if(row.selected){p.omitted=0;p.rotationExplained=false;')
a=s.index(' X.managementPlayer=p=>')
s=s[:a]+''' const promiseChoice=(p,label,kind,terms)=>{const id=`g8commitment-${p.id}-${kind}`;return `<div class="g8commitmentchoice"><p id="${id}">${esc(terms)}</p>${btn(label,'managePlayer',[p.id,kind],'g8ghost',!!s.pendingSwapIn).replace('type="button"',`type="button" aria-describedby="${id}"`)}</div>`;};
'''+s[a:]
a=s.index('<div class="g8managementactions">',s.index(' X.managementPlayer=p=>'));b=s.index('${q.seekingMove&&closed?',a)
s=s[:a]+'''${!active?`<section class="g8commitmentoptions" aria-label="Make a commitment"><h4>Make a commitment</h4><p>Choose a promise you can keep. Breaking it damages trust.</p><p class="g8commitmentpause">Medical absences pause commitments. A selected player who is being managed medically is not assessed against the promise.</p><div class="g8commitmentchoices">${promiseChoice(p,'Commit to a three-match run','run','Select for the next three fully fit matches. Leaving him out counts against the promise.')}${q.batting?promiseChoice(p,'Back preferred batting role','batting',`Use the preferred ${X.battingJob(p).toLowerCase()} role in the next two fit selections. This does not promise a place in the XI.`):''}${q.bowling?promiseChoice(p,'Guarantee a two-over role','bowling','The automatic plan prioritises two legal overs in each of the next two fit selections with at least 90 opposition balls. Shorter innings pause the promise.'):''}</div></section>`:''}${q.omitted>=(q.regular?3:5)?`<section class="g8rotationconversation" aria-label="Selection conversation"><h4>Talk about selection</h4>${q.rotationExplained?`<p>Rotation explained. ${q.grace?`${q.grace} fully fit omission${q.grace===1?'':'s'} of breathing room remaining.`:'Further omissions can increase selection pressure again.'} Opportunities are still needed to resolve the concern.</p>`:`<p>Explain why he is out of the XI. The next two fully fit omissions will not add selection pressure. This does not resolve a transfer request.</p>${action('Explain squad rotation','rotation',!!E.rotationProblem(q))}${E.rotationProblem(q)?`<p class="g8managementnote">${esc(E.rotationProblem(q))}</p>`:''}`}</section>`:''}<div class="g8managementactions">${q.requested?action(q.seekingMove?'Work to keep player':'Agree to seek a move',q.seekingMove?'keep':'move'):''}${q.seekingMove?btn('Explore a trade','manageTrade',[p.id],'g8primary',closed||!!s.pendingSwapIn):''}${injury&&s.xi.includes(p.id)&&X.ui.view==='team'?btn('Rest and choose replacement','manageRest',[p.id],'g8ghost',!!s.pendingSwapIn):''}</div>'''+s[b:]
management_rep("X.managementTag=p=>{const q=X.managementState().players[p.id];if(!q)return '';const c=concern(q),injury=X.injury(p);", "X.managementTag=p=>{const q=X.managementState().players[p.id],injury=X.injury(p);if(!q)return injury?`<span class=\"g8squadpulse\"><span class=\"g8pulsealert\">${esc(injury.status)}</span></span>`:'';const c=concern(q);")
assert old.strip() in parts[16];parts[16]=parts[16].replace(old.strip(),s.strip());p.write_text(s)
rep(16,'<div class="g8actions">${btn(vacancies?', '${X.managementBrief(true)}<div class="g8actions">${btn(vacancies?')
rep(16,"${X.injury(p)||p.form?`<small class=\"g8playerstate\">${esc(X.injury(p)?.status||X.form(p))}</small>`:''}", '${X.managementTag(p)}')
rep(16,'Your core stays together. Use the draft to strengthen your batting and bowling.','Fill vacant places in the draft. Review your retained players before deciding on trades or releases.')
rep(16,'Your fifteen are intact. You can keep this group together and move on.','Your fifteen are retained. Review their fitness and concerns before deciding whether to keep this group.')
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
# Result actions precede optional narrative, awards and worm analysis.
a=parts[17].index(' v.result=()=>{');b=parts[17].index('\n v.finals=',a);chunk=parts[17][a:b]
old_order='+resultCard(r)+X.storyResult(r)+X.matchAwards(r)+X.matchWorm(r)+continuation+'
assert old_order in chunk
chunk=chunk.replace(old_order,'+resultCard(r)+continuation+',1)
end=chunk.rindex('`;');chunk=chunk[:end]+'`+X.storyResult(r)+X.matchAwards(r)+X.matchWorm(r);'+chunk[end+2:]
parts[17]=parts[17][:a]+chunk+parts[17][b:]
# Reserve room for readable three-digit chart labels on narrow viewports.
rep(15,'px=b=>48+b/maxBall*680','px=b=>80+b/maxBall*648')
rep(15,'<line x1="48" x2="728"','<line x1="80" x2="728"')
rep(15,'<text x="36" y="${py(i*50)+4}"','<text x="68" y="${py(i*50)+4}"')
rep(15,'<text x="730" y="257" text-anchor="end">Overs</text>','')
rep(15,"}).join('')}</svg></section>`;", "}).join('')}</svg><p class=\"gccuiWormAxis\">Overs</p></section>`;")
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
# Player reports expose focused views while preserving all existing read data.
a=parts[12].index(' X.playerRead=p=>{');b=parts[12].index(' X.conditionRead=',a);read_fn=parts[12][a:b]
r=read_fn.index('  return `<div class="g8playerdetail">');o=read_fn.index('<section class="g8scoutoutlook">',r);e=read_fn.index('${X.playerRecord(p)}',o)
outlook=read_fn[o:e]
prefix=read_fn[:r].replace('X.playerRead=p=>{',"X.playerRead=(p,section='all')=>{")
read_fn=prefix+'  const outlook=`'+outlook+'`;\n'+'''  const skillContent=`<div class="g8scoutcategories">${skills}</div><p>Scouting confidence · ${esc(conf)}</p>`;
  return `<div class="g8playerdetail">${section==='skills'?`<section class="gccuiFullSkills"><h3>Detailed skills</h3>${skillContent}</section>`:outlook+X.playerRecord(p)+(section==='overview'?'':`<details class="g8moredata"><summary>Detailed skills</summary>${skillContent}</details>`)}</div>`;
 };
'''
parts[12]=parts[12][:a]+read_fn+parts[12][b:]
rep(19,'function inspect(id){',"function inspect(id,tab=null){const same=ui.modal==='player'&&ui.selectedPlayer===Number(id);ui.playerTab=tab||(same?ui.playerTab:'overview')||'overview';")
rep(19,"ui.scoutReturn=['trade','undrafted','tradeReview'].includes(ui.modal)?ui.modal:null;ui.scoutReturnScroll=ui.scoutReturn?dialog.scrollTop:null;", "if(!same){ui.scoutReturn=['trade','undrafted','tradeReview'].includes(ui.modal)?ui.modal:null;ui.scoutReturnScroll=ui.scoutReturn?dialog.scrollTop:null;}")
a=parts[19].index('  modal(p.name,`<section class="g8scoutsummary');b=parts[19].index(",'player');",a)+len(",'player');")
parts[19]=parts[19][:a]+"  modal(p.name,X.playerDossier(p,{actions,selected,position}),'player');"+parts[19][b:]
rep(19,"inspect(id);});\n bind('managePlayer'", "inspect(id,'management');});\n bind('managePlayer'")
rep(19," bind('inspect','*',inspect);", " bind('playerTab','*',tab=>{assert(ui.modal==='player'&&['overview','skills','management'].includes(tab),'Open a player report first.');if(tab==='management')assert(!!X.managementPlayer(G.byId(ui.selectedPlayer)),'Management is available for your squad.');inspect(ui.selectedPlayer,tab);document.getElementById('gccuiProfileView-'+tab)?.focus({preventScroll:true});});\n bind('inspect','*',inspect);")
# Keep report navigation with the existing sticky modal heading, avoiding a
# hard-coded pixel offset for long player names or wrapped narrow view buttons.
rep(19,"document.getElementById('g8feedback').hidden=true;if(!dialog.open)", "if(key==='player'){const reportViews=content.querySelector('.gccuiProfileViews'),reportHead=content.querySelector('.g8modalhead');if(reportViews&&reportHead){reportHead.classList.add('gccuiProfileHead');const identity=content.querySelector('.gccuiDossierIdentity'),title=reportHead.querySelector('#g8dialogTitle'),titleBox=title?.parentElement;if(identity&&title){identity.querySelector('.gccuiIdentityText')?.prepend(title);titleBox?.remove();reportHead.prepend(identity);}const rail=document.createElement('div');rail.className='gccuiDossierRail';rail.append(reportViews);const reportActions=content.querySelector('.gccuiDossierActions');if(reportActions)rail.append(reportActions);reportHead.append(rail);}}\n  document.getElementById('g8feedback').hidden=true;if(!dialog.open)")
rep(19,"bind('clearXI',['team'],()=>{G.clearXI();","bind('clearXI',['team'],()=>{assert(!s.pendingSwapIn,'Finish or cancel your swap first.');G.clearXI();")
rep(19,"bind('naturalOrder',['team'],()=>G.autoOrderXI());","bind('naturalOrder',['team'],()=>{assert(!s.pendingSwapIn,'Finish or cancel your swap first.');G.autoOrderXI();});")
# Guide actions use the existing approved cricket glyphs and share an icon gutter.
rep(11,"retainXI:'shirt-sport'};","retainXI:'shirt-sport',how:'stumps',howItWorks:'cricket-ball',breakawayStory:'book'};")
rep(19,'They bring their colours, their grounds and their supporters.','They bring their colours and their grounds.')
rep(19,'if(!replacing)dialogOpener=document.activeElement;',"if(!replacing)dialogOpener=document.activeElement?.closest?.('.g8utilitymenu')?.querySelector('summary')||document.activeElement;")
# Archived scorebook gets its own scoped table layout and semantic header relationships.
a=parts[19].index(" bind('archiveSeason'");b=parts[19].index(' X.dispatch=',a)
parts[19]=parts[19][:a]+''' bind('archiveSeason',['archive'],year=>{const h=s.dynasty.history.find(h=>h.year===Number(year));assert(h,'That season is not in the archive.');modal(`${year} · The club scorebook`,X.archiveSeasonBody(h),'archiveSeason');});
'''+parts[19][b:]
rep(19,"setProperty('--club-accent',s.userClub?.c||'#91aa82')", "setProperty('--club-accent',s.userClub?.c||'#ed7547')")
rep(19,"setProperty('--club-ink',X.clubInk(s.userClub))", "setProperty('--club-ink',X.clubInk(s.userClub||{c:'#ed7547',t:'#171717'}))")
# Mobile draft squad uses the current dialog and preserves nested scouting context.
rep(19," bind('draftDetail',['draft','dynasty'],kind=>{", " function draftSquadDialog(){assert(ui.view==='draft'||annual(),'The draft room is closed.');modal('Your squad · '+roster().length+'/15',`<div class=\"gccuiDraftSquadReport\">${X.draftCompanion(false)}</div>`,'mobileSquad');}\n bind('draftSquad',['draft','dynasty'],()=>{assert(!ui.modal,'Close the current report first.');draftSquadDialog();});\n bind('draftDetail',['draft','dynasty'],kind=>{")
rep(19,"['trade','undrafted','tradeReview'].includes(ui.modal)","['trade','undrafted','tradeReview','mobileSquad'].includes(ui.modal)")
rep(19,"ui.scoutReturn=null;ui.scoutReturnScroll=null;closeDialog();", "ui.scoutReturn=null;ui.scoutReturnScroll=null;if(back==='mobileSquad'){const id=Number(ui.selectedPlayer);draftSquadDialog();if(Number.isFinite(scroll))dialog.scrollTop=scroll;content.querySelector(`.gccuiPickedPlayer[data-args=\"[${id}]\"]`)?.focus({preventScroll:true});return;}closeDialog();")
# Shared visual-system pass: keep commands and data intact, name layout regions.
rep(19,' function setView(view){'," function sceneKey(){const phase=s.dynasty?.offseason?.phase||'';return ui.view==='dynasty'?`dynasty:${phase}:${phase==='market'?(ui.offseasonPane||'overview'):''}`:ui.view==='season'?`season:${ui.seasonTab||'matchday'}`:ui.view;}\n function setView(view){")
rep(19,'closeUtilityMenu();busy=true;const view=ui.view,x=window.scrollX,y=window.scrollY;', 'closeUtilityMenu();busy=true;const view=ui.view,scene=sceneKey(),x=window.scrollX,y=window.scrollY;')
rep(19,'if(ui.view===view&&!ui.modal)render(false);', 'if(ui.view===view&&!ui.modal)render(sceneKey()!==scene);')
rep(19,'else if(ui.view===view)window.scrollTo({left:x,top:y,behavior:', 'else if(ui.view===view&&sceneKey()===scene)window.scrollTo({left:x,top:y,behavior:')
rep(11,"${action==='seasonTab'?`aria-pressed=\"${ui.seasonTab===args[0]}\"`:''}","${action==='seasonTab'?`aria-pressed=\"${ui.seasonTab===args[0]}\"`:action==='teamPane'?`aria-pressed=\"${(G.state.pendingSwapIn?'xi':ui.teamPane||(G.state.xi.length?'xi':'squad'))===args[0]}\"`:''}")
a=parts[17].index("${saved?btn('Start new career'");b=parts[17].index('}</div></div><div class="g8heroart">',a)+1
parts[17]=parts[17][:a]+'''${saved?`<button type="button" class="g8button g8primary g8continueclub" data-action="continue" style="--resumeclub:${esc(resumeTeam?.c||'#ed7547')};--resumetext:${esc(X.clubInk(resumeTeam))};--gcc-accent:var(--resumeclub);--gcc-accent-ink:var(--resumetext);--club-ink:var(--resumetext)"><span class="g8continuelabel">Continue career</span><span class="g8resumemeta">${resumeNote}</span></button>`+btn('Start new career','play',[],'g8ghost'):btn('Start new career','play',[],'g8primary')}'''+parts[17][b:]
rep(17,'</svg></button></h1><p>A Saudi-backed', '</svg></button><span class="gccBrandWordmark">Global Champions<br>Cricket</span></h1><p>A Saudi-backed')
rep(16,'<section class="g8annualhero"><span', '<section class="g8annualhero"><div class="gccuiOffseasonSummary"><span')
rep(16,'${X.managementBrief(true)}<div class="g8actions">${btn(vacancies?', '</div><div class="gccuiOffseasonIssues">${X.managementBrief(true)}</div><div class="gccuiOffseasonActions"><div class="g8actions">${btn(vacancies?')
rep(16,'</span></section><aside class="g8annualdevelopment"', '</span></div></section><aside class="g8annualdevelopment"')
# Setup and reveal returns share the same presentation lifecycle.
rep(19,"if(view==='matchReveal')scheduleMatch();}","if(view==='matchReveal')scheduleMatch();if(revealActive())scheduleReveal();}")
rep(19,'  const body=views[ui.view]();',"  const presentationClub=ui.view==='story'&&ui.newCareer?null:s.userClub;const body=views[ui.view]();")
rep(19,"setProperty('--club-accent',s.userClub?.c||'#ed7547')","setProperty('--club-accent',presentationClub?.c||'#ed7547')")
rep(19,"X.clubInk(s.userClub||{c:'#ed7547',t:'#171717'})","X.clubInk(presentationClub||{c:'#ed7547',t:'#171717'})")
a=parts[19].index('  X.patch(hud,');b=parts[19].index('\n  if(changed)',a)
hud=parts[19][a:b].replace('${s.userClub?','${presentationClub?').replace('badge(s.userClub)','badge(presentationClub)').replace('esc(s.userClub.name)','esc(presentationClub.name)')
parts[19]=parts[19][:a]+hud+parts[19][b:]
rep(19,"btn('Take over this club','confirmClub',[],'g8primary')","btn('Select club','confirmClub',[],'g8primary')")
rep(12,'const p=X.clubStory(c),plan=X.clubPlan(c);return',"const p=X.clubStory(c),plan=X.clubPlan(c),groundRead=window.GCC8_CLUB_EXPANSION?.groundReads[c.abbr]||F.groundStory(c);return")
rep(12,'<p class="g8clubidentitytext">${esc(p.identity)}</p>', '${String(p.identity||\'\').trim()!==String(groundRead||\'\').trim()?`<p class="g8clubidentitytext">${esc(p.identity)}</p>`:\'\'}')
rep(12,'<span class="g8groundtrait">${esc(c.trait)}</span><p>${esc((window.GCC8_CLUB_EXPANSION?.groundReads[c.abbr]||F.groundStory(c)))}</p>','<span class="g8groundtrait">${esc(c.trait)}</span><p>${esc(groundRead)}</p>')
# Stable signing controls precede counters and the changing decision readout.
a=parts[17].index('<div class="g8actions g8signingactions">');b=parts[17].index('</div></section><section class="g8sheet g8wirepanel">',a)+len('</div>')
actions=parts[17][a:b];parts[17]=parts[17][:a]+parts[17][b:]
rep(17,'</h2><div class="g8signingcounts">','</h2>'+actions+'<div class="g8signingcounts">')

# Completion keeps the next decision reachable by keyboard.
rep(12,"${btn(label,action,[],'g8primary',count<8)}", "${btn(label,action,[],'g8primary',count<8).replace('type=\"button\"','type=\"button\" id=\"gccuiRevealNext\"')}")
rep(12,'<span>${count} of 8 revealed ·','<span role="status" aria-live="polite" aria-atomic="true">${count} of 8 revealed ·')
rep(17,'<span class="g8windowstatus">','<span class="g8windowstatus" role="status" aria-live="polite" aria-atomic="true">')
rep(19,"ui.revealed=8;ui.reveal.running=false;});", "ui.revealed=8;ui.reveal.running=false;pendingFocus='#gccuiRevealNext';});")
rep(19,"revealTimer=null;if(!revealActive()||!ui.reveal.running)return;ui.reveal.count=", "revealTimer=null;if(!revealActive()||!ui.reveal.running)return;const focusedReveal=!!document.activeElement?.closest?.('.g8drawcontrols');ui.reveal.count=")
rep(19,"if(ui.reveal.count===8)ui.reveal.running=false;render(false);save();scheduleReveal();", "if(ui.reveal.count===8)ui.reveal.running=false;render(false);if(ui.reveal.count===8&&focusedReveal)document.getElementById('gccuiRevealNext')?.focus({preventScroll:true});save();scheduleReveal();")
rep(19,'<div class="g8actions g8clubconfirm">','<div class="g8actions g8clubconfirm" style="--gcc-accent:${esc(c.c)};--gcc-accent-ink:${esc(X.clubInk(c))}">')

# New draft decisions reset the page, while browsing/scouting remains in place.
rep(19,"dialogOpener=null,pendingFocus=null;","dialogOpener=null,pendingFocus=null,pendingScrollTop=false;")
rep(19,"else G.userDraft(Number(id));announce(","else G.userDraft(Number(id));pendingScrollTop=true;announce(")
rep(19,"finally{G.closeModal();busy=false;if(pendingFocus)","finally{G.closeModal();busy=false;const resetPosition=pendingScrollTop;pendingScrollTop=false;if(pendingFocus)")
rep(19,"}else if(ui.view===view&&sceneKey()===scene)window.scrollTo", "}else if(resetPosition)window.scrollTo({left:0,top:0,behavior:'instant'});else if(ui.view===view&&sceneKey()===scene)window.scrollTo")
# Focus the next draft decision after a committed pick; the final pick may already
# have entered the team room, whose stage focus must remain intact.
rep(19,"pendingScrollTop=false;if(pendingFocus)","pendingScrollTop=false;if(resetPosition&&(ui.view==='draft'||annual())&&X.draftCurrent(annual()))pendingFocus='#gccuiDraftTurnTitle';if(pendingFocus)")
rep(19,"target?.scrollIntoView?.({block:'center',behavior:'instant'});", "if(resetPosition&&target?.id==='gccuiDraftTurnTitle')window.scrollTo({left:0,top:0,behavior:'instant'});else target?.scrollIntoView?.({block:'center',behavior:'instant'});")

# Retain club identity in compact chooser rows without duplicating desktop metadata.
rep(17,'<h3>${esc(c.name)}</h3><div class="g8clubground">','<h3>${esc(c.name)}</h3><div class="gccuiClubMeta">${esc(c.league)} · ${esc(c.displayRegion||c.region)}</div><div class="g8clubground">')
rep(17,":'Select '+c.name",":'Open club guide for '+c.name")
# Put the launch action before secondary format metadata in the final story band.
a=parts[17].index('<div class="g8careerlaunch">');b=parts[17].index('</section>`;',a)
launch=parts[17][a:b];fmt_start=launch.index('<div class="g8careerformat">');fmt_end=launch.index('</div>',fmt_start)+len('</div>');fmt=launch[fmt_start:fmt_end]
launch=launch[:fmt_start]+launch[fmt_end:];end=launch.rindex('</div>');launch=launch[:end]+fmt+launch[end:]
parts[17]=parts[17][:a]+launch+parts[17][b:]
rep(17,'<span class="g8eyebrow">LEAGUE RECRUITMENT</span><span class="g8windowstatus"','<span class="g8windowstatus"')

rep(19,'Open a selected player to move them up or down the batting order; use Swap to change the side.','Use the arrows beside selected players to set the batting order; use Swap to change the side.')

rep(19," bind('matchday',['result'],"," bind('fixtureNext',['season'],()=>{assert(ui.seasonTab==='fixtures'&&G.nextUserFixture(),'No upcoming fixture is available here.');pendingFocus='#gccuiNextFixture';});\n bind('matchday',['result'],")

rep(16,'.map(e=>({key:txt(e.key),text:txt(e.text),year:num(e.year),playerId:num(e.playerId),kind:txt(e.kind)}))',".map(e=>{const encoded=Number(/^(\\d{4}):/.exec(e.key)?.[1]),eventYear=Number.isInteger(e.year)&&e.year>=2008&&e.year<=2026?e.year:encoded>=2008&&encoded<=2026?encoded:0,savedId=Number.isSafeInteger(e.playerId)&&e.playerId>0?e.playerId:0,matches=savedId===400?roster.filter(p=>typeof p.name==='string'&&p.name&&e.text.startsWith(p.name+':')):[],playerId=savedId===400?(matches.length===1&&Number.isSafeInteger(matches[0].id)&&matches[0].id>0?matches[0].id:0):savedId;return {key:txt(e.key),text:txt(e.text),year:eventYear,playerId,kind:txt(e.kind)};})")

import runpy
parts[16]=runpy.run_path(str(root/'qa/panel46/management-transform.py'))['transform'](parts[16])
parts[16]=runpy.run_path(str(root/'qa/panel46/consequence-transform.py'))['transform'](parts[16])

# Match consequences open the same guarded management workflow before advancement.
for key in ('manageInspect','managePlayer'):
 rep(19,f"bind('{key}',['team','season','dynasty','finals']",f"bind('{key}',['team','season','dynasty','finals','result']")
rep(19,"bind('manageTrade',['team','season','dynasty']","bind('manageTrade',['team','season','dynasty','result']")
rep(19,"if(ui.view==='team')setView('season');trade(!s.dynasty?.offseason,id);","if(ui.view==='team'||ui.view==='result')setView('season');trade(!s.dynasty?.offseason,id);")

parts[18]+='\n'+(root/'v8/ui/decision-ui.js').read_text()
for i in (9,10,11,12,16,17,19):
 path=root/('v8/engine/'+('foundation.js' if i==9 else 'dynasty.js')) if i in (9,10) else root/('v8/ui/'+{11:'components.js',12:'cricket-reads.js',16:'career.js',17:'screens.js',19:'controller.js'}[i]);path.write_text(parts[i])
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
 weighted=match[0].replace('stroke="none" style="stroke:none"',f'stroke="currentColor" stroke-width="{32 if glyph=="cricket" else 10}" stroke-linejoin="round"')
 raw=raw[:match.start()]+weighted+raw[match.end():]
out=root/'qa/perfection-20261030/candidate.html';out.write_text(raw)
for i,part in enumerate(parts):
 tmp=root/f'qa/perfection-20261030/check-{i}.js';tmp.write_text(part);subprocess.run(['node','--check',str(tmp)],check=True,capture_output=True)
(root/'qa/perfection-20261030/build.json').write_text(json.dumps({'baseBlob':'69a3d1666f9300af5a739bd32872fb4633f210c7','baseCommit':'52a93845d91f0f22352969d58144da678130212b','sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'changedScripts':[i for i,p in enumerate(parts) if p!=matches[i][1]],'syntaxChecked':len(parts)},indent=2))
