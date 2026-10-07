import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_2_15_match_day_conditions.html');
const OUT=path.join(ROOT,'qa','output','v7215-conditions-audit');
fs.mkdirSync(OUT,{recursive:true});
function fail(m,d=''){throw new Error(d?`${m}: ${d}`:m)}
function assert(c,m,d=''){if(!c)fail(m,d)}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
const html=fs.readFileSync(GAME);
const server=http.createServer((req,res)=>{
  if(req.url==='/'||req.url==='/game.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html)}
  else if(req.url==='/favicon.ico'){res.writeHead(204);res.end()}
  else{res.writeHead(404);res.end('not found')}
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8780,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v7215-conditions-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9237','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());

async function pageTarget(){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:9237/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1400))}
class CDP{
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.listeners=new Map()}
  async open(){await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',()=>reject(new Error('WebSocket open failed')),{once:true})});this.ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result||{})}else if(m.method){for(const fn of this.listeners.get(m.method)||[])fn(m.params||{})}})}
  on(m,fn){if(!this.listeners.has(m))this.listeners.set(m,[]);this.listeners.get(m).push(fn)}
  call(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}
  async eval(expression){const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)fail('Runtime evaluation failed',r.exceptionDetails.exception?.description||r.exceptionDetails.text||JSON.stringify(r.exceptionDetails));return r.result?.value}
  close(){try{this.ws.close()}catch{}}
}

const target=await pageTarget();const cdp=new CDP(target.webSocketDebuggerUrl);const runtimeErrors=[];const consoleErrors=[];
try{
  await cdp.open();
  cdp.on('Runtime.exceptionThrown',p=>runtimeErrors.push(p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||JSON.stringify(p)));
  cdp.on('Runtime.consoleAPICalled',p=>{if(p.type==='error')consoleErrors.push((p.args||[]).map(a=>a.value??a.description??'').join(' '))});
  cdp.on('Log.entryAdded',p=>{if(p.entry?.level==='error')consoleErrors.push(p.entry.text)});
  await Promise.all([cdp.call('Page.enable'),cdp.call('Runtime.enable'),cdp.call('Log.enable')]);
  await cdp.call('Page.addScriptToEvaluateOnNewDocument',{source:`window.__qaErrors=[];window.addEventListener('error',e=>window.__qaErrors.push(String(e.message||e.error||'error')));window.addEventListener('unhandledrejection',e=>window.__qaErrors.push(String(e.reason)));`});

  async function viewport(width,height){await cdp.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600,screenWidth:width,screenHeight:height})}
  async function ready(){for(let i=0;i<260;i++){if(await cdp.eval(`document.readyState==='complete'&&typeof window.GCC==='object'&&typeof window.Dynasty==='object'`))return;await sleep(100)}fail('Game did not become ready')}
  async function navigate(){await cdp.call('Page.navigate',{url:'http://127.0.0.1:8780/game.html'});await ready()}
  async function shot(name){const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
  async function noErrors(stage){const page=await cdp.eval(`window.__qaErrors||[]`);assert(page.length===0,`${stage}: page errors`,JSON.stringify(page));assert(runtimeErrors.length===0,`${stage}: runtime errors`,JSON.stringify(runtimeErrors));assert(consoleErrors.length===0,`${stage}: console errors`,JSON.stringify(consoleErrors))}

  await viewport(1440,900);
  await navigate();
  await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();

  const launcher=await cdp.eval(`(()=>({launcherHidden:document.getElementById('careerLauncher')?.hidden,heroHidden:document.getElementById('homeHero')?.hidden,continueHidden:document.getElementById('launcherContinue')?.hidden,league:GCC.state.league.length,pool:GCC.state.pool.length,user:!!GCC.state.userClub,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(launcher.launcherHidden===false&&launcher.heroHidden===true&&launcher.continueHidden===true,'Fresh launcher state incorrect',JSON.stringify(launcher));
  assert(launcher.league===0&&launcher.pool===0&&!launcher.user,'Dynasty hydrated before player choice',JSON.stringify(launcher));
  assert(launcher.overflow<=1,'Launcher horizontal overflow',String(launcher.overflow));
  await shot('01-launcher.png');

  const foundation=await cdp.eval(`(()=>{Dynasty.requestNewDynasty();return{launcherHidden:document.getElementById('careerLauncher').hidden,heroHidden:document.getElementById('homeHero').hidden}})()`);
  assert(foundation.launcherHidden===true&&foundation.heroHidden===false,'New Dynasty did not reveal foundation story',JSON.stringify(foundation));

  const recruit=await cdp.eval(`(()=>{GCC.newWorld();GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();return{screen:document.querySelector('.screen.active')?.id,user:GCC.state.userClub?.abbr,league:GCC.state.league.length,pool:GCC.state.pool.length,recruit:!!GCC.state.recruit}})()`);
  assert(recruit.screen==='recruit'&&recruit.user&&recruit.league===8&&recruit.pool>200&&recruit.recruit,'Club-to-Signing handoff failed',JSON.stringify(recruit));

  const weatherPriors=await cdp.eval(`(()=>{const samples=(home)=>{const counts={SETTLED:0,OVERCAST:0,COOL_DAMP:0,HOT_DRY:0};for(let y=2008;y<2038;y++)for(let r=1;r<=14;r++)counts[GCC.matchWeather(home,r,y).code]++;return counts};const eng=samples({abbr:'YOR',region:'England',ground:'Headingley'});const aus=samples({abbr:'SCO',region:'Australia',ground:'WACA Ground'});const ind=samples({abbr:'DC',region:'India',ground:'Arun Jaitley Stadium'});const dock=samples({abbr:'REN',region:'Australia',ground:'Docklands Stadium'});const sameA=GCC.matchWeather({abbr:'YOR',region:'England',ground:'Headingley'},4,2011);const sameB=GCC.matchWeather({abbr:'YOR',region:'England',ground:'Headingley'},4,2011);return{eng,aus,ind,dock,same:sameA.code===sameB.code&&sameA.label===sameB.label,total:Object.values(eng).reduce((a,b)=>a+b,0)}})()`);
  assert(weatherPriors.same&&weatherPriors.total===420,'Weather is not deterministic over stable match identity',JSON.stringify(weatherPriors));
  assert(weatherPriors.dock.SETTLED===420&&weatherPriors.dock.OVERCAST===0&&weatherPriors.dock.COOL_DAMP===0&&weatherPriors.dock.HOT_DRY===0,'Docklands weather overwhelms the roofed venue',JSON.stringify(weatherPriors.dock));
  assert(weatherPriors.eng.OVERCAST>80&&weatherPriors.eng.COOL_DAMP>45&&weatherPriors.eng.HOT_DRY<65,'England climate prior is implausible',JSON.stringify(weatherPriors.eng));
  assert(weatherPriors.aus.HOT_DRY>95&&weatherPriors.aus.COOL_DAMP<60,'Dry Australian venue prior is implausible',JSON.stringify(weatherPriors.aus));
  assert(weatherPriors.ind.HOT_DRY>75&&weatherPriors.ind.SETTLED>160,'India climate prior is implausible',JSON.stringify(weatherPriors.ind));

  const draw=await cdp.eval(`(()=>{GCC.skipRecruitment();GCC.setupDraft();return{screen:document.querySelector('.screen.active')?.id,complete:GCC.state.recruit.complete,order:GCC.state.draftOrder.length,moment:document.getElementById('gccMomentLayer')?.classList.contains('show')}})()`);
  assert(draw.screen==='draftDraw'&&draw.complete&&draw.order===8&&draw.moment===false,'Signing-to-Draw handoff failed',JSON.stringify(draw));

  const draftStart=await cdp.eval(`(()=>{GCC.skipDraftReveal();GCC.beginDraft();GCC.skipToMyPick();return{screen:document.querySelector('.screen.active')?.id,pickIndex:GCC.state.pickIndex,cards:document.querySelectorAll('#players .player-card').length,boardHidden:document.getElementById('draftBoardPanel')?.hidden}})()`);
  assert(draftStart.screen==='draft'&&draftStart.cards===24&&draftStart.boardHidden===true,'Draw-to-Draft handoff failed',JSON.stringify(draftStart));

  const drafted=await cdp.eval(`(()=>{const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8;const t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('skipToMyPick failed at '+s.pickIndex);const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];if(!p)throw new Error('no available player at '+s.pickIndex);GCC.userDraft(p.id);guard++;}const all=Object.values(s.teams).flat();return{pickIndex:s.pickIndex,userSize:s.teams[s.userClub.abbr].length,sizes:Object.values(s.teams).map(x=>x.length),total:all.length,unique:new Set(all).size,finished:s.draftFinished}})()`);
  assert(drafted.pickIndex===120&&drafted.userSize===15&&drafted.sizes.every(x=>x===15)&&drafted.total===120&&drafted.unique===120&&drafted.finished,'Full Draft journey failed',JSON.stringify(drafted));
  await sleep(500);
  const modal=await cdp.eval(`(()=>({open:document.getElementById('modal')?.classList.contains('open'),text:document.getElementById('modal')?.innerText||''}))()`);
  assert(modal.open&&/DRAFT COMPLETE/.test(modal.text)&&/ENTER TEAM ROOM/.test(modal.text),'Draft completion handoff missing',JSON.stringify(modal));

  const teamChoice=await cdp.eval(`(()=>{GCC.enterTeamRoom();return{screen:document.querySelector('.screen.active')?.id,xi:GCC.state.xi.length,squad:GCC.state.teams[GCC.state.userClub.abbr].length,layoutHidden:document.querySelector('#team .team-layout')?.hidden,lead:document.getElementById('selectionLead')?.textContent.trim(),recommendHidden:document.getElementById('recommendXIButton')?.hidden,manualHidden:document.getElementById('manualXIButton')?.hidden,quickHidden:document.getElementById('quickStartSeasonButton')?.hidden,startDisabled:document.getElementById('startSeasonButton')?.disabled,overall:(document.getElementById('teamOverall')?.innerText||'').trim(),detailHidden:document.getElementById('teamDetailRead')?.hidden,moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),momentOpacity:getComputedStyle(document.getElementById('gccMomentLayer')).opacity,momentVisibility:getComputedStyle(document.getElementById('gccMomentLayer')).visibility,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(teamChoice.screen==='team'&&teamChoice.xi===0&&teamChoice.squad===15,'Team Room entry state wrong',JSON.stringify(teamChoice));
  assert(teamChoice.layoutHidden===true&&!teamChoice.recommendHidden&&!teamChoice.manualHidden&&teamChoice.quickHidden&&teamChoice.startDisabled,'Team Room decision gateway is not focused',JSON.stringify(teamChoice));
  assert(teamChoice.overall===''&&teamChoice.detailHidden===true,'Team Room shows ratings before XI selection',JSON.stringify(teamChoice));
  assert(teamChoice.moment===false&&teamChoice.momentOpacity==='0'&&teamChoice.momentVisibility==='hidden','Stale Draft bulletin is still visually present on Team Room entry',JSON.stringify(teamChoice));
  assert(teamChoice.overflow<=1,'Team Room choice state overflow',String(teamChoice.overflow));
  const round1Conditions=await cdp.eval(`(()=>{const fx=GCC.nextUserFixture();const g=GCC.matchGroundForFixture(fx);const opp=fx.home.abbr===GCC.state.userClub.abbr?fx.away:fx.home;const home=fx.home.abbr===GCC.state.userClub.abbr;return{round:fx.round,home,opp:opp.name,host:fx.home.abbr,ground:g.ground,trait:g.trait,weather:g.weather,base:{...fx.home.conditions},effective:{...g.conditions},kicker:(document.querySelector('#team .team-command-bar .kicker')?.textContent||'').trim(),copy:(document.getElementById('selectionCopy')?.textContent||'').trim(),groundText:(document.getElementById('groundCard')?.innerText||'').trim()}})()`);
  assert(round1Conditions.round===1&&round1Conditions.kicker==='ROUND 1 SELECTION'&&round1Conditions.copy.includes(round1Conditions.ground)&&round1Conditions.copy.includes(round1Conditions.trait)&&round1Conditions.copy.includes(round1Conditions.weather.label)&&round1Conditions.copy.includes(round1Conditions.weather.read)&&!round1Conditions.copy.includes('..'),'Round 1 conditions are not actionable/clean before XI selection',JSON.stringify(round1Conditions));
  assert(Math.abs(round1Conditions.effective.pace-round1Conditions.base.pace)<=1.11&&Math.abs(round1Conditions.effective.spin-round1Conditions.base.spin)<=.81&&Math.abs(round1Conditions.effective.boundary-round1Conditions.base.boundary)<=.56,'Weather exceeds restrained ground-overlay bounds',JSON.stringify(round1Conditions));
  await shot('02a-round-1-conditions.png');

    await shot('02-team-room-choice.png');

  // Team Room audit: manual entry should reveal the selection workspace without inventing ratings.
  const manualEntry=await cdp.eval(`(()=>{GCC.showManualXI();return{layoutHidden:document.querySelector('#team .team-layout')?.hidden,xi:GCC.state.xi.length,available:document.querySelectorAll('#xiList .xi-row').length,battingSlots:document.querySelectorAll('#xiBattingOrder .batting-slot').length,emptySlots:document.querySelectorAll('#xiBattingOrder .empty-slot').length,startDisabled:document.getElementById('startSeasonButton')?.disabled,overall:(document.getElementById('teamOverall')?.innerText||'').trim(),detailHidden:document.getElementById('teamDetailRead')?.hidden,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(!manualEntry.layoutHidden&&manualEntry.xi===0&&manualEntry.available===15&&manualEntry.battingSlots===11&&manualEntry.emptySlots===11,'Manual XI entry state failed',JSON.stringify(manualEntry));
  assert(manualEntry.startDisabled&&manualEntry.overall===''&&manualEntry.detailHidden&&manualEntry.overflow<=1,'Manual XI entry leaks ratings/start/overflow',JSON.stringify(manualEntry));
  const clearedChoice=await cdp.eval(`(()=>{GCC.clearXI();return{layoutHidden:document.querySelector('#team .team-layout')?.hidden,manualHidden:document.getElementById('manualXIButton')?.hidden,recommendHidden:document.getElementById('recommendXIButton')?.hidden,xi:GCC.state.xi.length}})()`);
  assert(clearedChoice.layoutHidden===true&&!clearedChoice.manualHidden&&!clearedChoice.recommendHidden&&clearedChoice.xi===0,'Clear XI did not return to focused choice state',JSON.stringify(clearedChoice));

  const saved=await cdp.eval(`(()=>{Dynasty.openLauncher();return{launcherHidden:document.getElementById('careerLauncher')?.hidden,continueHidden:document.getElementById('launcherContinue')?.hidden,club:document.getElementById('launcherClub')?.textContent.trim(),detail:document.getElementById('launcherDetail')?.textContent.trim()}})()`);
  assert(saved.launcherHidden===false&&saved.continueHidden===false&&saved.club,'Saved dynasty is not available from launcher after Draft',JSON.stringify(saved));
  const resumed=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();return{screen:document.querySelector('.screen.active')?.id,user:GCC.state.userClub?.abbr,xi:GCC.state.xi.length,squad:GCC.state.teams[GCC.state.userClub.abbr]?.length}})()`);
  assert(resumed.screen==='team'&&resumed.user&&resumed.xi===0&&resumed.squad===15,'Continue Dynasty did not restore Team Room accurately',JSON.stringify(resumed));

  const xi=await cdp.eval(`(()=>{GCC.selectRecommendedXI();const essentials=document.getElementById('xiEssentials')?.innerText||'';const cover=[...document.querySelectorAll('#xiEssentials b')].map(x=>x.textContent.trim()).find(x=>/ ov$/.test(x))||'';const coverNum=parseFloat(cover);return{count:GCC.state.xi.length,order:GCC.state.battingOrder.length,layoutHidden:document.querySelector('#team .team-layout')?.hidden,quickHidden:document.getElementById('quickStartSeasonButton')?.hidden,startDisabled:document.getElementById('startSeasonButton')?.disabled,xiCount:document.getElementById('xiCount')?.textContent.trim(),bench:document.querySelectorAll('#xiList .xi-row').length,keeperNeeded:/Needed/.test(essentials),cover,coverNum,overall:(document.getElementById('teamOverall')?.innerText||'').trim(),detailHidden:document.getElementById('teamDetailRead')?.hidden,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(xi.count===11&&xi.order===11&&!xi.layoutHidden&&!xi.quickHidden&&!xi.startDisabled&&xi.xiCount==='11/11'&&xi.bench===4,'Recommended XI completion state failed',JSON.stringify(xi));
  const keeperState=await cdp.eval(`(()=>{const squad=(GCC.state.teams[GCC.state.userClub.abbr]||[]).map(id=>GCC.state.pool.find(p=>p.id===id)).filter(Boolean);const selected=GCC.state.xi.map(id=>GCC.state.pool.find(p=>p.id===id)).filter(Boolean);const keep=p=>(p.keeping||0)>=65||p.role==='WK-BAT';return{squadKeepers:squad.filter(keep).length,selectedKeepers:selected.filter(keep).length}})()`);assert(Number.isFinite(xi.coverNum)&&xi.coverNum>=20,'Recommended XI lacks 20-over cover',JSON.stringify(xi));assert(keeperState.squadKeepers===0 ? xi.keeperNeeded===true : (keeperState.selectedKeepers>=1&&xi.keeperNeeded===false),'Recommended XI keeper fallback integrity failed',JSON.stringify({xi,keeperState}));
  assert(xi.overall.length>0&&xi.detailHidden===false,'Selected-XI ratings/detail missing',JSON.stringify(xi));
  const xiConditions=await cdp.eval(`(()=>({kicker:(document.querySelector('#team .team-command-bar .kicker')?.textContent||'').trim(),copy:(document.getElementById('selectionCopy')?.textContent||'').trim(),quick:(document.getElementById('quickStartSeasonButton')?.textContent||'').trim()}))()`);
  assert(xiConditions.kicker==='ROUND 1 SELECTION'&&xiConditions.copy.includes(round1Conditions.ground)&&xiConditions.copy.includes(round1Conditions.trait)&&xiConditions.copy.includes(round1Conditions.weather.label)&&xiConditions.copy.includes(round1Conditions.weather.read)&&!xiConditions.copy.includes('..'),'Completed XI lost or corrupted the pre-selection fixture/weather context',JSON.stringify({round1Conditions,xiConditions}));
  assert(xi.overflow<=1,'Completed XI desktop overflow',String(xi.overflow));
  await shot('03-team-room-xi-ready.png');

  // Direct bench swap must preserve an eleven-player XI and a valid batting order.
  const swapAudit=await cdp.eval(`(()=>{const beforeXI=[...GCC.state.xi];const beforeOrder=[...GCC.state.battingOrder];const bench=(GCC.state.teams[GCC.state.userClub.abbr]||[]).find(id=>!GCC.state.xi.includes(id));const outgoing=GCC.state.xi[0];if(!bench||!outgoing)throw new Error('swap precondition missing');GCC.beginSwap(bench);const armed={pending:GCC.state.pendingSwapIn,status:document.getElementById('swapStatus')?.innerText||''};GCC.replaceXI(outgoing);const afterXI=[...GCC.state.xi],afterOrder=[...GCC.state.battingOrder];const moveId=afterOrder[1];const firstBefore=afterOrder[0];GCC.moveBattingPlayer(moveId,-1);const moved=[...GCC.state.battingOrder];const touched=GCC.state.orderTouched;GCC.autoOrderXI();const reset=[...GCC.state.battingOrder];const resetTouched=GCC.state.orderTouched;return{bench,outgoing,armed,beforeXI,beforeOrder,afterXI,afterOrder,moved,touched,reset,resetTouched,pending:GCC.state.pendingSwapIn,unique:new Set(GCC.state.xi).size,count:GCC.state.xi.length,firstBefore};})()`);
  assert(swapAudit.armed.pending===swapAudit.bench&&/SWAP IN/i.test(swapAudit.armed.status),'Bench swap did not enter explicit swap mode',JSON.stringify(swapAudit));
  assert(swapAudit.count===11&&swapAudit.unique===11&&swapAudit.afterXI.includes(swapAudit.bench)&&!swapAudit.afterXI.includes(swapAudit.outgoing)&&swapAudit.afterOrder.length===11&&swapAudit.pending==null,'Direct bench swap corrupted XI/order',JSON.stringify(swapAudit));
  assert(swapAudit.moved[0]===swapAudit.afterOrder[1]&&swapAudit.touched===true,'Batting-order move did not apply cleanly',JSON.stringify(swapAudit));
  assert(swapAudit.reset.length===11&&new Set(swapAudit.reset).size===11&&swapAudit.resetTouched===false,'Reset order did not restore a valid natural order',JSON.stringify(swapAudit));
  // Restore the balanced recommendation before the season handoff.
  await cdp.eval(`GCC.selectRecommendedXI(); true`);
  // Let legitimate swap/recommendation feedback clear before judging the steady-state mobile layout.
  await sleep(1250);

  // Completed XI must remain usable on mobile, with the quick start promoted and no page-level overflow.
  await viewport(390,844);
  const mobileTeam=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,xi:GCC.state.xi.length,quickHidden:document.getElementById('quickStartSeasonButton')?.hidden,quickDisplay:getComputedStyle(document.getElementById('quickStartSeasonButton')).display,startDisabled:document.getElementById('startSeasonButton')?.disabled,sheetCols:getComputedStyle(document.querySelector('#team .team-sheet-grid')).gridTemplateColumns,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(mobileTeam.screen==='team'&&mobileTeam.xi===11&&!mobileTeam.quickHidden&&mobileTeam.quickDisplay!=='none'&&!mobileTeam.startDisabled,'Completed XI mobile controls failed',JSON.stringify(mobileTeam));
  assert(mobileTeam.overflow<=1,'Completed XI mobile overflow',JSON.stringify(mobileTeam));
  await shot('03b-team-room-mobile-xi-ready.png');
  await viewport(1440,900);

  const season=await cdp.eval(`(()=>{GCC.startSeason();const appearances={};for(const round of GCC.state.fullSchedule)for(const f of round){appearances[f.home.abbr]=(appearances[f.home.abbr]||0)+1;appearances[f.away.abbr]=(appearances[f.away.abbr]||0)+1}return{screen:document.querySelector('.screen.active')?.id,round:GCC.state.round,fullRounds:GCC.state.fullSchedule.length,userFixtures:GCC.state.schedule.length,appearances,results:GCC.state.results.length,overview:document.getElementById('seasonOverview')?.classList.contains('active'),stage:document.getElementById('seasonStageTitle')?.textContent.trim(),play:document.getElementById('playRound')?.textContent.trim(),seasonNav:[...document.querySelectorAll('[data-season-view]')].filter(x=>x.classList.contains('active')).map(x=>x.dataset.seasonView),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(season.screen==='season'&&season.round===0&&season.fullRounds===14&&season.userFixtures===14&&season.results===0,'Season start state failed',JSON.stringify(season));
  assert(Object.values(season.appearances).length===8&&Object.values(season.appearances).every(x=>x===14),'Double round-robin schedule integrity failed',JSON.stringify(season.appearances));
  assert(season.overview&&season.seasonNav.length===1&&season.seasonNav[0]==='overview'&&season.play==='PLAY ROUND 1','Season Hub did not open in clean Round 1 overview',JSON.stringify(season));
  assert(season.overflow<=1,'Season start desktop overflow',String(season.overflow));
  const round1AfterStart=await cdp.eval(`(()=>{const fx=GCC.nextUserFixture();const g=GCC.matchGroundForFixture(fx);GCC.setSeasonView('fixtures');const rows=[...document.querySelectorAll('#fixtures .fixture')].map(x=>x.innerText.trim());GCC.setSeasonView('overview');const labels=['Settled','Overcast','Cool & damp','Hot & dry'];return{round:fx.round,ground:g.ground,weather:g.weather,rows,nextLabels:labels.filter(x=>rows[0]?.includes(x)),futureWeatherRows:rows.slice(1).filter(row=>labels.some(x=>row.includes(x))).length,stage:(document.getElementById('seasonStageCopy')?.textContent||'').trim()}})()`);
  assert(round1AfterStart.round===round1Conditions.round&&round1AfterStart.ground===round1Conditions.ground&&round1AfterStart.weather.code===round1Conditions.weather.code,'Round 1 weather changed when the Season schedule was committed',JSON.stringify({before:round1Conditions,after:round1AfterStart}));
  assert(round1AfterStart.nextLabels.length===1&&round1AfterStart.futureWeatherRows===0,'Fixtures reveal exact weather beyond the immediate next match',JSON.stringify(round1AfterStart));
  assert(round1AfterStart.stage.includes(round1Conditions.ground)&&round1AfterStart.stage.includes(round1Conditions.weather.label),'Season Hub next-fixture read disagrees with Team Room conditions',JSON.stringify(round1AfterStart));
  const seasonEntryVisual=await cdp.eval(`(()=>({moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),opacity:getComputedStyle(document.getElementById('gccMomentLayer')).opacity,visibility:getComputedStyle(document.getElementById('gccMomentLayer')).visibility,toast:document.getElementById('toast')?.classList.contains('show')}))()`);
  assert(!seasonEntryVisual.moment&&seasonEntryVisual.opacity==='0'&&seasonEntryVisual.visibility==='hidden'&&!seasonEntryVisual.toast,'Season entry stacks transient XI/season feedback over the page',JSON.stringify(seasonEntryVisual));
  await shot('04-season-round-1.png');
  await noErrors('desktop preseason journey');

  // Hard reload: boot must stay light and offer Continue, then restore the exact Round 1 state.
  await viewport(390,844);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const mobileLauncher=await cdp.eval(`(()=>({launcherHidden:document.getElementById('careerLauncher')?.hidden,continueHidden:document.getElementById('launcherContinue')?.hidden,heroHidden:document.getElementById('homeHero')?.hidden,league:GCC.state.league.length,pool:GCC.state.pool.length,user:!!GCC.state.userClub,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(!mobileLauncher.launcherHidden&&!mobileLauncher.continueHidden&&mobileLauncher.heroHidden,'Reload did not return to lightweight Continue launcher',JSON.stringify(mobileLauncher));
  assert(mobileLauncher.league===0&&mobileLauncher.pool===0&&!mobileLauncher.user,'Reload hydrated dynasty before Continue',JSON.stringify(mobileLauncher));
  assert(mobileLauncher.overflow<=1,'Mobile launcher overflow',String(mobileLauncher.overflow));
  await shot('05-mobile-continue-launcher.png');

  const mobileResume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();return{screen:document.querySelector('.screen.active')?.id,round:GCC.state.round,xi:GCC.state.xi.length,userFixtures:GCC.state.schedule.length,fullRounds:GCC.state.fullSchedule.length,overview:document.getElementById('seasonOverview')?.classList.contains('active'),play:document.getElementById('playRound')?.textContent.trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(mobileResume.screen==='season'&&mobileResume.round===0&&mobileResume.xi===11&&mobileResume.userFixtures===14&&mobileResume.fullRounds===14,'Continue did not restore Round 1 season state',JSON.stringify(mobileResume));
  assert(mobileResume.overview&&mobileResume.play==='PLAY ROUND 1'&&mobileResume.overflow<=1,'Mobile resumed Season Hub state failed',JSON.stringify(mobileResume));
  const reloadWeather=await cdp.eval(`(()=>{const fx=GCC.nextUserFixture();const g=GCC.matchGroundForFixture(fx);return{ground:g.ground,code:g.weather.code,label:g.weather.label}})()`);
  assert(reloadWeather.ground===round1Conditions.ground&&reloadWeather.code===round1Conditions.weather.code&&reloadWeather.label===round1Conditions.weather.label,'Round 1 conditions changed after hard reload / Continue',JSON.stringify({before:round1Conditions,reloadWeather}));
  await shot('06-mobile-season-resumed.png');
  await noErrors('mobile continue journey');

  // Season gameplay audit: move through actual rounds and verify the screen remains a cricket decision surface.
  await viewport(1440,900);
  const round1=await cdp.eval(`(()=>{GCC.playNextRound();const story=document.getElementById('matchStory')?.innerText||'';const next=document.getElementById('seasonStageTitle')?.textContent.trim();return{round:GCC.state.round,results:GCC.state.results.length,story,next,heading:document.querySelector('#season .section-head h2')?.textContent.trim(),runRows:document.querySelectorAll('#seasonRun .season-run-row').length,ladderRows:document.querySelectorAll('#ladderSnapshot .ladder-snapshot-row').length,tickerHidden:document.getElementById('seasonTicker')?.hidden,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(round1.round===1&&round1.results===1&&/ROUND 1/.test(round1.story)&&/OPEN SCORECARD/.test(round1.story),'Round 1 result story failed',JSON.stringify(round1));
  assert(round1.next&&round1.heading==='Early rounds'&&round1.runRows===4&&round1.ladderRows>=4&&round1.tickerHidden&&round1.overflow<=1,'Round 1 season hierarchy failed',JSON.stringify(round1));
  const round1WeatherResult=await cdp.eval(`(()=>{const res=GCC.state.results.find(x=>x.round===1);GCC.setSeasonView('fixtures');const rows=[...document.querySelectorAll('#fixtures .fixture')].map(x=>x.innerText.trim());GCC.setSeasonView('overview');const labels=['Settled','Overcast','Cool & damp','Hot & dry'];return{code:res.weather?.code,label:res.weather?.label,story:(document.getElementById('matchStory')?.innerText||'').trim(),completedLabels:labels.filter(x=>rows[0]?.includes(x)),nextLabels:labels.filter(x=>rows[1]?.includes(x)),futureWeatherRows:rows.slice(2).filter(row=>labels.some(x=>row.includes(x))).length}})()`);
  assert(round1WeatherResult.code===round1Conditions.weather.code&&round1WeatherResult.label===round1Conditions.weather.label&&round1WeatherResult.story.toUpperCase().includes(round1Conditions.weather.label.toUpperCase()),'Played Round 1 result does not retain the pre-match conditions',JSON.stringify(round1WeatherResult));
  assert(round1WeatherResult.completedLabels.length===1&&round1WeatherResult.nextLabels.length===1&&round1WeatherResult.futureWeatherRows===0,'Fixtures weather visibility is not limited to played + next match',JSON.stringify(round1WeatherResult));
  const round1Visual=await cdp.eval(`(()=>({moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),opacity:getComputedStyle(document.getElementById('gccMomentLayer')).opacity,visibility:getComputedStyle(document.getElementById('gccMomentLayer')).visibility,story:!!document.querySelector('#matchStory .story-card')}))()`);
  assert(!round1Visual.moment&&round1Visual.opacity==='0'&&round1Visual.visibility==='hidden'&&round1Visual.story,'Round 1 duplicates the persistent result with a floating bulletin',JSON.stringify(round1Visual));
  await shot('07-season-after-round-1.png');

  const scorecard=await cdp.eval(`(()=>{GCC.openScorecard(1);return{open:document.getElementById('modal')?.classList.contains('open'),innings:document.querySelectorAll('#modal .scorecard-innings').length,text:document.getElementById('modal')?.innerText||''};})()`);
  assert(scorecard.open&&scorecard.innings===2&&/BATTING/i.test(scorecard.text)&&/BOWLING/i.test(scorecard.text),'Round 1 scorecard failed',JSON.stringify(scorecard));
  assert(scorecard.text.toUpperCase().includes(round1Conditions.weather.label.toUpperCase())&&scorecard.text.toUpperCase().includes(round1Conditions.ground.toUpperCase()),'Round 1 scorecard conditions disagree with the pre-match read',JSON.stringify({weather:round1Conditions.weather,ground:round1Conditions.ground,text:scorecard.text.slice(0,500)}));
  await cdp.eval(`GCC.closeModal(); true`);

  const round2Team=await cdp.eval(`(()=>{GCC.renderTeam();GCC.go('team');const fx=GCC.nextUserFixture();const g=GCC.matchGroundForFixture(fx);const opp=fx.home.abbr===GCC.state.userClub.abbr?fx.away:fx.home;const before={round:GCC.state.round,results:GCC.state.results.length,rounds:GCC.state.fullSchedule.length};const data={round:fx.round,home:fx.home.abbr===GCC.state.userClub.abbr,opp:opp.name,ground:g.ground,trait:g.trait,weather:g.weather,kicker:(document.querySelector('#team .team-command-bar .kicker')?.textContent||'').trim(),copy:(document.getElementById('selectionCopy')?.textContent||'').trim(),quick:(document.getElementById('quickStartSeasonButton')?.textContent||'').trim(),start:(document.getElementById('startSeasonButton')?.textContent||'').trim(),before};GCC.startSeason();data.after={screen:document.querySelector('.screen.active')?.id,round:GCC.state.round,results:GCC.state.results.length,rounds:GCC.state.fullSchedule.length};return data})()`);
  assert(round2Team.round===2&&round2Team.kicker==='ROUND 2 SELECTION'&&round2Team.copy.includes(round2Team.ground)&&round2Team.copy.includes(round2Team.trait)&&round2Team.copy.includes(round2Team.weather.label)&&round2Team.copy.includes(round2Team.weather.read)&&!round2Team.copy.includes('..'),'Round 2 Team Room does not follow the real next fixture',JSON.stringify(round2Team));
  assert(round2Team.quick==='RETURN TO SEASON'&&round2Team.start==='RETURN TO SEASON','Mid-season Team Room still presents a season-start action',JSON.stringify(round2Team));
  assert(round2Team.after.screen==='season'&&round2Team.after.round===round2Team.before.round&&round2Team.after.results===round2Team.before.results&&round2Team.after.rounds===14,'Returning from Team Room reset or mutated the active season',JSON.stringify(round2Team));
  await viewport(390,844);
  await cdp.eval(`GCC.renderTeam();GCC.go('team');true`);
  const mobileConditions=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,kicker:(document.querySelector('#team .team-command-bar .kicker')?.textContent||'').trim(),copy:(document.getElementById('selectionCopy')?.textContent||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(mobileConditions.screen==='team'&&mobileConditions.kicker==='ROUND 2 SELECTION'&&mobileConditions.copy.includes(round2Team.ground)&&mobileConditions.copy.includes(round2Team.trait)&&mobileConditions.copy.includes(round2Team.weather.label)&&mobileConditions.copy.includes(round2Team.weather.read)&&!mobileConditions.copy.includes('..')&&mobileConditions.overflow<=1,'Mobile next-match conditions state failed',JSON.stringify(mobileConditions));
  await shot('07b-mobile-round-2-conditions.png');
  await viewport(1440,900);
  await cdp.eval(`GCC.startSeason();true`);

  const round5=await cdp.eval(`(()=>{while(GCC.state.round<5)GCC.playNextRound();GCC.setSeasonView('overview');const views={};for(const v of ['fixtures','ladder','analysis','players']){GCC.setSeasonView(v);views[v]={active:document.querySelector('[data-season-panel="'+v+'"]')?.classList.contains('active'),text:(document.querySelector('[data-season-panel="'+v+'"]')?.innerText||'').trim().length};}GCC.setSeasonView('overview');return{round:GCC.state.round,results:GCC.state.results.length,heading:document.querySelector('#season .section-head h2')?.textContent.trim(),intro:document.querySelector('#season .section-head p')?.textContent.trim(),runRows:document.querySelectorAll('#seasonRun .season-run-row').length,ladderRows:document.querySelectorAll('#ladderSnapshot .ladder-snapshot-row').length,views,story:(document.getElementById('matchStory')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(round5.round===5&&round5.results===5&&round5.heading==='The season is taking shape'&&round5.runRows===5,'Round 5 overview structure failed',JSON.stringify(round5));
  assert(Object.values(round5.views).every(v=>v.active&&v.text>0),'One or more Season secondary views failed after results accumulated',JSON.stringify(round5.views));
  assert(round5.story.length>0&&round5.ladderRows>=4&&round5.overflow<=1,'Round 5 cricket context failed',JSON.stringify(round5));
  const round5Visual=await cdp.eval(`(()=>({moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),opacity:getComputedStyle(document.getElementById('gccMomentLayer')).opacity,visibility:getComputedStyle(document.getElementById('gccMomentLayer')).visibility,story:!!document.querySelector('#matchStory .story-card')}))()`);
  assert(!round5Visual.moment&&round5Visual.opacity==='0'&&round5Visual.visibility==='hidden'&&round5Visual.story,'Round 5 duplicates the persistent result with a floating bulletin',JSON.stringify(round5Visual));
  await shot('08-season-round-5.png');

  await viewport(390,844);
  const mobileRound5=await cdp.eval(`(()=>({round:GCC.state.round,overview:document.getElementById('seasonOverview')?.classList.contains('active'),story:!!document.querySelector('#matchStory .story-card'),navButtons:document.querySelectorAll('.season-view-button').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(mobileRound5.round===5&&mobileRound5.overview&&mobileRound5.story&&mobileRound5.navButtons===5&&mobileRound5.overflow<=1,'Round 5 mobile Season Hub failed',JSON.stringify(mobileRound5));
  await shot('09-mobile-season-round-5.png');
  await viewport(1440,900);

  const round10=await cdp.eval(`(()=>{while(GCC.state.round<10)GCC.playNextRound();GCC.setSeasonView('overview');return{round:GCC.state.round,results:GCC.state.results.length,heading:document.querySelector('#season .section-head h2')?.textContent.trim(),intro:document.querySelector('#season .section-head p')?.textContent.trim(),stage:document.getElementById('seasonStageTitle')?.textContent.trim(),story:(document.getElementById('matchStory')?.innerText||'').trim(),runRows:document.querySelectorAll('#seasonRun .season-run-row').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(round10.round===10&&round10.results===10&&round10.heading==='The run home'&&/4 matches left/.test(round10.intro||''),'Round 10 run-home state failed',JSON.stringify(round10));
  assert(round10.stage&&round10.story.length>0&&round10.runRows>=4&&round10.overflow<=1,'Round 10 context failed',JSON.stringify(round10));
  await shot('10-season-round-10.png');

  const round14=await cdp.eval(`(()=>{while(GCC.state.round<14)GCC.playNextRound();const qualified=(GCC.state.regularSeasonPosition||99)<=4;const modalOpen=document.getElementById('modal')?.classList.contains('open');if(modalOpen)GCC.closeModal();GCC.setSeasonView('overview');return{round:GCC.state.round,results:GCC.state.results.length,position:GCC.state.regularSeasonPosition,qualified,heading:document.querySelector('#season .section-head h2')?.textContent.trim(),intro:document.querySelector('#season .section-head p')?.textContent.trim(),stage:document.getElementById('seasonStageTitle')?.textContent.trim(),actionsHidden:document.getElementById('seasonActions')?.hidden,cta:(document.getElementById('postSeasonCta')?.innerText||'').trim(),story:(document.getElementById('matchStory')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(round14.round===14&&round14.results===14&&round14.heading==='Regular season complete'&&round14.actionsHidden,'Round 14 completion state failed',JSON.stringify(round14));
  assert(round14.position>=1&&round14.position<=8&&/REGULAR SEASON COMPLETE/.test(round14.cta)&&round14.story.length>0&&round14.overflow<=1,'Round 14 handoff/context failed',JSON.stringify(round14));
  await shot('11-season-round-14.png');
  await noErrors('full regular-season journey');

  // Postseason audit: force only the ladder seed if needed so the finals presentation is always exercised.
  const finalsEntry=await cdp.eval(`(()=>{const me=GCC.state.table[GCC.state.userClub.abbr];const maxPts=Math.max(...Object.values(GCC.state.table).map(x=>x.pts||0));if((GCC.state.regularSeasonPosition||99)>4){me.pts=maxPts+4;me.w=Math.max(me.w||0,10);me.l=14-me.w;me.nrr=Math.max(me.nrr||0,1.5);GCC.state.regularSeasonPosition=1;}if(document.getElementById('modal')?.classList.contains('open'))GCC.closeModal();GCC.proceedPostSeason();return{screen:document.querySelector('.screen.active')?.id,stage:GCC.state.finals?.stage,seed:GCC.state.finals?.top.findIndex(c=>c.abbr===GCC.state.userClub.abbr)+1,title:document.getElementById('finalsTitle')?.textContent.trim(),semis:document.querySelectorAll('#finalsSemis .final-match').length,gf:document.querySelectorAll('#finalsGrandFinal .final-match').length,control:(document.getElementById('finalsControls')?.innerText||'').trim(),moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(finalsEntry.screen==='finals'&&finalsEntry.stage==='ready'&&finalsEntry.seed>=1&&finalsEntry.seed<=4&&finalsEntry.semis===2&&finalsEntry.gf===1&&/PLAY SEMI-FINAL/.test(finalsEntry.control),'Finals entry state failed',JSON.stringify(finalsEntry));
  const semiForecast=await cdp.eval(`(()=>{const f=GCC.state.finals;const pairs=[[f.top[0],f.top[3]],[f.top[1],f.top[2]]];const pair=pairs.find(x=>x.some(c=>c.abbr===GCC.state.userClub.abbr));const host=pair[0];const w=GCC.matchWeather(host,15,GCC.state.year||2008);return{host:host.abbr,ground:host.ground,code:w.code,label:w.label,copy:(document.getElementById('finalsStageCopy')?.textContent||'').trim()}})()`);
  assert(semiForecast.copy.includes(semiForecast.ground)&&semiForecast.copy.includes(semiForecast.label),'Semi-final conditions are not visible before the knockout',JSON.stringify(semiForecast));
  assert(!finalsEntry.moment&&finalsEntry.overflow<=1,'Finals entry carries stale moment or overflow',JSON.stringify(finalsEntry));
  await shot('12-finals-ready.png');

  const semiStage=await cdp.eval(`(()=>{GCC.simulateFinals();const mine=GCC.state.finals.semis.find(x=>[x.home.abbr,x.away.abbr].includes(GCC.state.userClub.abbr));const alive=mine.winner.abbr===GCC.state.userClub.abbr;return{stage:GCC.state.finals.stage,alive,title:document.getElementById('finalsTitle')?.textContent.trim(),story:(document.getElementById('finalsStory')?.innerText||'').trim(),control:(document.getElementById('finalsControls')?.innerText||'').trim(),moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),momentText:(document.getElementById('gccMomentLayer')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(semiStage.stage==='semis'&&semiStage.story.length>0&&/GRAND FINAL|VIEW GRAND FINAL/.test(semiStage.control)&&semiStage.overflow<=1,'Semi-final result state failed',JSON.stringify(semiStage));
  const semiWeatherResult=await cdp.eval(`(()=>{const mine=GCC.state.finals.semis.find(x=>[x.home.abbr,x.away.abbr].includes(GCC.state.userClub.abbr));return{host:mine.home.abbr,code:mine.weather?.code,label:mine.weather?.label}})()`);
  assert(semiWeatherResult.host===semiForecast.host&&semiWeatherResult.code===semiForecast.code,'Semi-final result weather does not match the published forecast',JSON.stringify({semiForecast,semiWeatherResult}));
  assert(!semiStage.moment,'Semi-final result duplicates the persistent finals story with a floating bulletin',JSON.stringify(semiStage));
  await shot('13-finals-semi-result.png');

  const semiCard=await cdp.eval(`(()=>{const idx=GCC.state.finals.semis.findIndex(x=>[x.home.abbr,x.away.abbr].includes(GCC.state.userClub.abbr));GCC.openFinalsScorecard('semi',idx);return{open:document.getElementById('modal')?.classList.contains('open'),innings:document.querySelectorAll('#modal .scorecard-innings').length,text:(document.getElementById('modal')?.innerText||'').trim()};})()`);
  assert(semiCard.open&&semiCard.innings===2&&/SEMI-FINAL/.test(semiCard.text)&&/BATTING/i.test(semiCard.text),'Semi-final scorecard failed',JSON.stringify(semiCard));
  await cdp.eval(`GCC.closeModal(); true`);

  const gfReady=await cdp.eval(`(()=>{GCC.advanceFinals();return{stage:GCC.state.finals.stage,title:document.getElementById('finalsTitle')?.textContent.trim(),story:(document.getElementById('finalsStory')?.innerText||'').trim(),control:(document.getElementById('finalsControls')?.innerText||'').trim(),userIn:[GCC.state.finals.gfPair.home.abbr,GCC.state.finals.gfPair.away.abbr].includes(GCC.state.userClub.abbr),moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),momentText:(document.getElementById('gccMomentLayer')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(gfReady.stage==='gf-ready'&&gfReady.story.length>0&&/GRAND FINAL|CHAMPIONSHIP/.test(gfReady.control)&&gfReady.overflow<=1,'Grand Final ready state failed',JSON.stringify(gfReady));
  const gfForecast=await cdp.eval(`(()=>{const pair=GCC.state.finals.gfPair;const w=GCC.matchWeather(pair.home,16,GCC.state.year||2008);return{host:pair.home.abbr,ground:pair.home.ground,code:w.code,label:w.label,copy:(document.getElementById('finalsStageCopy')?.textContent||'').trim()}})()`);
  assert(gfForecast.copy.includes(gfForecast.ground)&&gfForecast.copy.includes(gfForecast.label),'Grand Final conditions are not visible before the championship match',JSON.stringify(gfForecast));
  assert(!gfReady.moment,'Grand Final reveal duplicates the persistent matchup with a floating bulletin',JSON.stringify(gfReady));
  await shot('14-finals-grand-final-ready.png');

  await cdp.eval(`GCC.simulateFinals(); true`);
  await sleep(220);
  const finalsDone=await cdp.eval(`(()=>{const won=GCC.state.champion?.abbr===GCC.state.userClub.abbr;return{stage:GCC.state.finals.stage,champion:GCC.state.champion?.name,won,title:document.getElementById('finalsTitle')?.textContent.trim(),story:(document.getElementById('finalsStory')?.innerText||'').trim(),control:(document.getElementById('finalsControls')?.innerText||'').trim(),moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),momentText:(document.getElementById('gccMomentLayer')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(finalsDone.stage==='done'&&finalsDone.champion&&finalsDone.story.length>0&&/VIEW SEASON REVIEW/.test(finalsDone.control)&&finalsDone.overflow<=1,'Grand Final completion state failed',JSON.stringify(finalsDone));
  const gfWeatherResult=await cdp.eval(`(()=>({host:GCC.state.finals.gf.home.abbr,code:GCC.state.finals.gf.weather?.code,label:GCC.state.finals.gf.weather?.label}))()`);
  assert(gfWeatherResult.host===gfForecast.host&&gfWeatherResult.code===gfForecast.code,'Grand Final result weather does not match the separate Grand Final forecast identity',JSON.stringify({gfForecast,gfWeatherResult}));
  assert(finalsDone.won ? (finalsDone.moment&&/GLOBAL CHAMPIONS/.test(finalsDone.momentText)) : !finalsDone.moment,'Finals completion ceremony hierarchy failed',JSON.stringify(finalsDone));
  await shot('15a-finals-completion-moment.png');
  await sleep(1900);
  const finalsSteady=await cdp.eval(`(()=>({moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),opacity:getComputedStyle(document.getElementById('gccMomentLayer')).opacity,visibility:getComputedStyle(document.getElementById('gccMomentLayer')).visibility,title:document.getElementById('finalsTitle')?.textContent.trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(!finalsSteady.moment&&finalsSteady.opacity==='0'&&finalsSteady.visibility==='hidden'&&finalsSteady.title&&finalsSteady.overflow<=1,'Completed Finals did not settle to a clean steady state',JSON.stringify(finalsSteady));
  await shot('15-finals-complete.png');

  const review=await cdp.eval(`(()=>{GCC.openSeasonReview();return{screen:document.querySelector('.screen.active')?.id,title:document.getElementById('reviewTitle')?.textContent.trim(),intro:document.getElementById('reviewIntro')?.textContent.trim(),outcome:(document.getElementById('reviewOutcome')?.innerText||'').trim(),kpis:document.querySelectorAll('#reviewKpis .stat').length,players:document.querySelectorAll('#reviewPlayers .review-player').length,moments:document.querySelectorAll('#reviewMoments .review-item').length,strengths:document.querySelectorAll('#reviewStrengths .review-item').length,weaknesses:document.querySelectorAll('#reviewWeaknesses .review-item').length,tables:document.querySelectorAll('#reviewTable table').length,moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(review.screen==='review'&&review.title&&review.intro&&review.outcome&&review.kpis>=4&&review.players>=2&&review.moments>=1&&review.strengths>=1&&review.weaknesses>=1&&review.tables===2,'Season Review content failed',JSON.stringify(review));
  assert(!review.moment&&review.overflow<=1,'Season Review carries stale transient moment or overflow',JSON.stringify(review));
  assert(!/^You (won|reached|finished)/i.test(review.intro),'Season Review intro redundantly restates the outcome',JSON.stringify(review));
  const outcomeLines=review.outcome.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  assert(!outcomeLines.some(line=>line.length>8&&review.title.toLowerCase().includes(line.toLowerCase())),'Season Review title duplicates the outcome band',JSON.stringify({title:review.title,outcomeLines}));
  await shot('16-season-review.png');

  await viewport(390,844);
  const mobileReview=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,players:document.querySelectorAll('#reviewPlayers .review-player').length,tables:document.querySelectorAll('#reviewTable table').length,footerButtons:document.querySelectorAll('#review .review-footer .button').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(mobileReview.screen==='review'&&mobileReview.players>=2&&mobileReview.tables===2&&mobileReview.footerButtons>=1&&mobileReview.overflow<=1,'Mobile Season Review failed',JSON.stringify(mobileReview));
  await shot('17-mobile-season-review.png');
  await viewport(1440,900);
  await noErrors('postseason and review journey');

  // Dynasty continuation audit: Review -> 2009 market -> draw -> draft -> final 15 -> Team Room -> Round 1.
  const reviewFooter=await cdp.eval(`(()=>({buttons:[...document.querySelectorAll('#review .review-footer button')].map(x=>x.textContent.trim()),year:GCC.state.year,history:GCC.state.dynasty?.history?.length||0,archived:!!GCC.state.dynasty?.archivedYears?.[GCC.state.year]}))()`);
  assert(reviewFooter.year===2008&&reviewFooter.history>=1&&reviewFooter.archived&&reviewFooter.buttons.some(x=>/CONTINUE DYNASTY/.test(x)),'Season Review does not expose a valid dynasty continuation',JSON.stringify(reviewFooter));

  const market=await cdp.eval(`(()=>{Dynasty.beginOffseason();const o=GCC.state.dynasty.offseason;const all=Object.values(GCC.state.teams).flat();return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,phase:o?.phase,retirements:o?.retirements?.length,arrivals:o?.arrivals?.length,userRoster:GCC.state.teams[GCC.state.userClub.abbr]?.length,totalRosterIds:all.length,uniqueRosterIds:new Set(all).size,timeline:document.querySelectorAll('#dynastyTimeline .dynasty-step').length,headline:(document.getElementById('dynastyHeadline')?.innerText||'').trim(),actions:[...document.querySelectorAll('#dynastyMain .dynasty-actions button')].map(x=>x.textContent.trim()),wire:document.querySelectorAll('#dynastyWire .wire-row').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(market.screen==='dynasty'&&market.year===2009&&market.phase==='market'&&market.timeline===5&&market.actions.some(x=>/TRADE CENTRE/.test(x))&&market.actions.some(x=>/DRAFT ORDER/.test(x)),'2009 market opening state failed',JSON.stringify(market));
  assert(market.totalRosterIds===market.uniqueRosterIds&&market.headline.length>0&&market.wire>=1&&market.overflow<=1,'2009 market integrity/hierarchy failed',JSON.stringify(market));
  await shot('18-2009-market.png');

  const tradeCentre=await cdp.eval(`(()=>{Dynasty.openTradeCentre(false);return{open:document.getElementById('modal')?.classList.contains('open'),clubs:document.querySelectorAll('#tradeClub option').length,targets:document.querySelectorAll('#tradeTarget option').length,offers:document.querySelectorAll('#tradeOffer option').length,read:(document.getElementById('tradeRead')?.textContent||'').trim()};})()`);
  assert(tradeCentre.open&&tradeCentre.clubs===7&&tradeCentre.targets>0&&tradeCentre.offers>0&&/cricket case/i.test(tradeCentre.read),'Off-season Trade Centre failed',JSON.stringify(tradeCentre));
  await cdp.eval(`GCC.closeModal(); true`);

  // Hard reload at market boundary.
  const marketSnapshot=await cdp.eval(`(()=>({roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b),retirements:[...GCC.state.dynasty.offseason.retirements.map(x=>x.id)].sort((a,b)=>a-b),arrivals:[...GCC.state.dynasty.offseason.arrivals].sort((a,b)=>a-b)}))()`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const marketLauncher=await cdp.eval(`(()=>({launcherHidden:document.getElementById('careerLauncher')?.hidden,continueHidden:document.getElementById('launcherContinue')?.hidden,league:GCC.state.league.length,pool:GCC.state.pool.length,user:!!GCC.state.userClub}))()`);
  assert(!marketLauncher.launcherHidden&&!marketLauncher.continueHidden&&marketLauncher.league===0&&marketLauncher.pool===0&&!marketLauncher.user,'Market reload hydrated dynasty before Continue',JSON.stringify(marketLauncher));
  const marketResume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const o=GCC.state.dynasty.offseason;return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,phase:o?.phase,roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b),retirements:[...o.retirements.map(x=>x.id)].sort((a,b)=>a-b),arrivals:[...o.arrivals].sort((a,b)=>a-b)};})()`);
  assert(marketResume.screen==='dynasty'&&marketResume.year===2009&&marketResume.phase==='market'&&JSON.stringify(marketResume.roster)===JSON.stringify(marketSnapshot.roster)&&JSON.stringify(marketResume.retirements)===JSON.stringify(marketSnapshot.retirements)&&JSON.stringify(marketResume.arrivals)===JSON.stringify(marketSnapshot.arrivals),'Market reload/Continue did not preserve offseason state',JSON.stringify({marketSnapshot,marketResume}));

  const cpuMarket=await cdp.eval(`(()=>{Dynasty.runCpuMarket();const all=Object.values(GCC.state.teams).flat();return{run:GCC.state.dynasty.offseason.cpuMarketRun,phase:GCC.state.dynasty.offseason.phase,transactions:GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length,total:all.length,unique:new Set(all).size};})()`);
  assert(cpuMarket.run&&cpuMarket.phase==='market'&&cpuMarket.total===cpuMarket.unique,'CPU market corrupted roster ownership',JSON.stringify(cpuMarket));

  const lottery=await cdp.eval(`(()=>{Dynasty.drawDraftOrder();const o=GCC.state.dynasty.offseason;return{phase:o.phase,order:[...o.lottery],unique:new Set(o.lottery).size,userPick:o.lottery.indexOf(GCC.state.userClub.abbr)+1,slots:document.querySelectorAll('.lottery-slot').length,actions:[...document.querySelectorAll('#dynastyMain .dynasty-actions button')].map(x=>x.textContent.trim()),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(lottery.phase==='lottery'&&lottery.order.length===8&&lottery.unique===8&&lottery.userPick>=1&&lottery.userPick<=8&&lottery.slots===8&&lottery.actions.some(x=>/ENTER 2009 DRAFT/.test(x))&&lottery.overflow<=1,'2009 Draft Draw failed',JSON.stringify(lottery));
  await shot('19-2009-draft-draw.png');

  const pickAssets=await cdp.eval(`(()=>{Dynasty.openTradeCentre(false);return{pickOptions:[...document.querySelectorAll('#tradePick option')].map(x=>x.value),open:document.getElementById('modal')?.classList.contains('open')};})()`);
  assert(pickAssets.open&&pickAssets.pickOptions.includes('R1')&&pickAssets.pickOptions.includes('R2'),'Post-draw Trade Centre does not expose owned draft picks',JSON.stringify(pickAssets));
  await cdp.eval(`GCC.closeModal(); true`);

  const lotteryOrder=[...lottery.order];
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const lotteryResume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const o=GCC.state.dynasty.offseason;return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,phase:o?.phase,order:[...o.lottery],slots:document.querySelectorAll('.lottery-slot').length};})()`);
  assert(lotteryResume.screen==='dynasty'&&lotteryResume.year===2009&&lotteryResume.phase==='lottery'&&lotteryResume.slots===8&&JSON.stringify(lotteryResume.order)===JSON.stringify(lotteryOrder),'Draft Draw reload/Continue failed',JSON.stringify(lotteryResume));

  const draftOpen=await cdp.eval(`(()=>{Dynasty.startAnnualDraft();const o=GCC.state.dynasty.offseason;return{phase:o.phase,cursor:o.pickCursor,picks:o.picks.length,board:document.querySelectorAll('.annual-draft-col').length,userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,currentText:(document.querySelector('#dynastyMain h3')?.textContent||'').trim(),poolCards:document.querySelectorAll('.dynasty-player-card').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(draftOpen.phase==='draft'&&draftOpen.board===8&&draftOpen.cursor>=0&&draftOpen.currentText&&draftOpen.overflow<=1,'Annual Draft opening state failed',JSON.stringify(draftOpen));

  async function makeUserDraftPick(){
    return cdp.eval(`(()=>{const btn=document.querySelector('.dynasty-player-card');if(!btn)return null;const m=(btn.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);if(!m)return null;const id=Number(m[1]);const before=GCC.state.dynasty.offseason.pickCursor;Dynasty.userAnnualDraft(id);return{id,before,after:GCC.state.dynasty.offseason.pickCursor,phase:GCC.state.dynasty.offseason.phase,picks:GCC.state.dynasty.offseason.picks.length,roster:GCC.state.teams[GCC.state.userClub.abbr].length};})()`);
  }
  let firstPick=await makeUserDraftPick();
  if(!firstPick){
    await cdp.eval(`Dynasty.runCpuDraftUntilUser(); true`);
    firstPick=await makeUserDraftPick();
  }
  assert(firstPick&&firstPick.after>firstPick.before,'User annual Draft pick did not advance the Draft',JSON.stringify(firstPick));
  const partialDraft=await cdp.eval(`(()=>({cursor:GCC.state.dynasty.offseason.pickCursor,picks:JSON.parse(JSON.stringify(GCC.state.dynasty.offseason.picks)),roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b),phase:GCC.state.dynasty.offseason.phase}))()`);

  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const draftResume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const o=GCC.state.dynasty.offseason;return{screen:document.querySelector('.screen.active')?.id,phase:o?.phase,cursor:o?.pickCursor,picks:JSON.parse(JSON.stringify(o?.picks||[])),roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b),board:document.querySelectorAll('.annual-draft-col').length};})()`);
  assert(draftResume.screen==='dynasty'&&draftResume.phase==='draft'&&draftResume.cursor===partialDraft.cursor&&JSON.stringify(draftResume.picks)===JSON.stringify(partialDraft.picks)&&JSON.stringify(draftResume.roster)===JSON.stringify(partialDraft.roster)&&draftResume.board===8,'Partial annual Draft reload/Continue failed',JSON.stringify({partialDraft,draftResume}));

  // Complete the annual draft by taking the top visible option at every user selection.
  let draftGuard=0;
  while(draftGuard++<40){
    const phase=await cdp.eval(`GCC.state.dynasty.offseason?.phase`);
    if(phase!=='draft')break;
    const pick=await makeUserDraftPick();
    if(!pick)await cdp.eval(`Dynasty.runCpuDraftUntilUser(); true`);
  }
  const draftDone=await cdp.eval(`(()=>{const o=GCC.state.dynasty.offseason;const all=Object.values(GCC.state.teams).flat();const cpu=Object.fromEntries(GCC.state.league.filter(c=>c.abbr!==GCC.state.userClub.abbr).map(c=>{const ps=GCC.state.teams[c.abbr].map(id=>GCC.state.pool.find(p=>p.id===id)).filter(Boolean);const keep=ps.filter(p=>(p.keeping||0)>=65||p.role==='WK-BAT').length;const bowl=ps.filter(p=>(p.maxOvers||0)>0||(p.bowl||0)>=45).length;return[c.abbr,{n:ps.length,keep,bowl}]}));return{phase:o.phase,draftComplete:o.draftComplete,picks:o.picks.length,userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,total:all.length,unique:new Set(all).size,cpu,cutsHeading:(document.querySelector('#dynastyMain h3')?.textContent||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(draftDone.phase==='cuts'&&draftDone.draftComplete&&draftDone.picks>=16&&draftDone.total===draftDone.unique&&Object.values(draftDone.cpu).every(x=>x.n===15&&x.keep>=1&&x.bowl>=6),'Annual Draft/CPU list integrity failed',JSON.stringify(draftDone));
  assert(draftDone.userRoster>=15&&draftDone.cutsHeading&&draftDone.overflow<=1,'Final-15 entry failed',JSON.stringify(draftDone));
  await shot('20-2009-final-15.png');

  // Trim user list to exactly 15 using the lowest-rated visible release each time.
  let cutGuard=0;
  while((await cdp.eval(`GCC.state.teams[GCC.state.userClub.abbr].length`))>15&&cutGuard++<12){
    const id=await cdp.eval(`(()=>{const rows=[...document.querySelectorAll('.cut-row')].filter(x=>x.querySelector('button'));if(!rows.length)return null;rows.sort((a,b)=>Number(a.querySelector('strong')?.textContent||999)-Number(b.querySelector('strong')?.textContent||999));const m=(rows[0].querySelector('button')?.getAttribute('onclick')||'').match(/cutPlayer\\((\\d+)\\)/);return m?Number(m[1]):null;})()`);
    assert(id,'No releasable player found while roster exceeds 15');
    await cdp.eval(`Dynasty.cutPlayer(${id}); true`);
  }
  const final15=await cdp.eval(`(()=>({phase:GCC.state.dynasty.offseason.phase,n:GCC.state.teams[GCC.state.userClub.abbr].length,unique:new Set(GCC.state.teams[GCC.state.userClub.abbr]).size,cta:(document.querySelector('#dynastyMain .button.primary')?.textContent||'').trim()}))()`);
  assert(final15.phase==='cuts'&&final15.n===15&&final15.unique===15&&/ENTER 2009 TEAM ROOM/.test(final15.cta),'Final 15 could not be lodged cleanly',JSON.stringify(final15));

  const preSeasonReady=await cdp.eval(`(()=>{Dynasty.finishOffseason();return{phase:GCC.state.dynasty.offseason?.phase,cutsComplete:GCC.state.dynasty.offseason?.cutsComplete,heading:(document.querySelector('#dynastyMain h3')?.textContent||'').trim(),cta:(document.querySelector('#dynastyMain .button.primary')?.textContent||'').trim(),opening:Object.fromEntries(Object.entries(GCC.state.dynasty.seasonOpeningRosters?.[2009]||{}).map(([k,v])=>[k,v.length])),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(preSeasonReady.phase==='ready'&&preSeasonReady.cutsComplete&&preSeasonReady.heading==='The 15 are lodged.'&&/NAME THE 2009 XI/.test(preSeasonReady.cta)&&Object.keys(preSeasonReady.opening).length===8&&Object.values(preSeasonReady.opening).every(n=>n===15)&&preSeasonReady.overflow<=1,'Pre-season ready state failed',JSON.stringify(preSeasonReady));
  await shot('21-2009-preseason-ready.png');

  // Hard reload is the acceptance gate for the Final 15 -> Pre-season transition.
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const readyResume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const o=GCC.state.dynasty.offseason;return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,phase:o?.phase,cutsComplete:o?.cutsComplete,heading:(document.querySelector('#dynastyMain h3')?.textContent||'').trim(),cta:(document.querySelector('#dynastyMain .button.primary')?.textContent||'').trim()};})()`);
  assert(readyResume.screen==='dynasty'&&readyResume.year===2009&&readyResume.phase==='ready'&&readyResume.cutsComplete&&readyResume.heading==='The 15 are lodged.'&&/NAME THE 2009 XI/.test(readyResume.cta),'Pre-season ready state was not saved across reload',JSON.stringify(readyResume));

  const team2009=await cdp.eval(`(()=>{Dynasty.enterTeamRoom();return{screen:document.querySelector('.screen.active')?.id,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id),dynastyActive:document.getElementById('dynasty')?.classList.contains('active'),year:GCC.state.year,offseason:GCC.state.dynasty.offseason,roster:GCC.state.teams[GCC.state.userClub.abbr].length,xi:GCC.state.xi.length,title:(document.querySelector('#team .section-head h2')?.textContent||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(team2009.screen==='team'&&team2009.active.length===1&&team2009.active[0]==='team'&&!team2009.dynastyActive&&team2009.year===2009&&team2009.offseason==null&&team2009.roster===15&&team2009.xi===0&&team2009.overflow<=1,'2009 Team Room handoff/isolation failed',JSON.stringify(team2009));
  await shot('21b-2009-team-room.png');
  const xi2009=await cdp.eval(`(()=>{GCC.selectRecommendedXI();const selected=GCC.state.xi.map(id=>GCC.state.pool.find(p=>p.id===id)).filter(Boolean);const squad=GCC.state.teams[GCC.state.userClub.abbr].map(id=>GCC.state.pool.find(p=>p.id===id)).filter(Boolean);const keep=p=>(p.keeping||0)>=65||p.role==='WK-BAT';const cover=[...document.querySelectorAll('#xiEssentials b')].map(x=>x.textContent.trim()).find(x=>/ ov$/.test(x))||'';return{xi:GCC.state.xi.length,order:GCC.state.battingOrder.length,squadKeepers:squad.filter(keep).length,selectedKeepers:selected.filter(keep).length,keeperNeeded:/Needed/.test(document.getElementById('xiEssentials')?.innerText||''),cover,coverNum:parseFloat(cover),startDisabled:document.getElementById('startSeasonButton')?.disabled};})()`);
  assert(xi2009.xi===11&&xi2009.order===11&&Number.isFinite(xi2009.coverNum)&&xi2009.coverNum>=20&&!xi2009.startDisabled,'2009 Recommended XI lacks size/20-over cover',JSON.stringify(xi2009));
  assert(xi2009.squadKeepers===0 ? xi2009.keeperNeeded===true : (xi2009.selectedKeepers>=1&&xi2009.keeperNeeded===false),'2009 Recommended XI keeper fallback integrity failed',JSON.stringify(xi2009));
  const season2009=await cdp.eval(`(()=>{GCC.startSeason();return{screen:document.querySelector('.screen.active')?.id,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id),dynastyActive:document.getElementById('dynasty')?.classList.contains('active'),year:GCC.state.year,round:GCC.state.round,xi:GCC.state.xi.length,fixtures:GCC.state.schedule.length,rounds:GCC.state.fullSchedule.length,results:GCC.state.results.length,play:(document.getElementById('playRound')?.textContent||'').trim(),nav:[...document.querySelectorAll('#nav button')].map(x=>x.textContent.trim()),views:[...document.querySelectorAll('.season-view-button')].map(x=>x.textContent.trim()),kpis:document.querySelectorAll('#seasonKpis .stat').length,dynastyStrip:!!document.getElementById('dynastySeasonStrip'),sectionClass:document.getElementById('season')?.className||'',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(season2009.screen==='season'&&season2009.active.length===1&&season2009.active[0]==='season'&&!season2009.dynastyActive&&season2009.year===2009&&season2009.round===0&&season2009.xi===11&&season2009.fixtures===14&&season2009.rounds===14&&season2009.results===0&&season2009.play==='PLAY ROUND 1'&&season2009.overflow<=1,'2009 Round 1 handoff/isolation failed',JSON.stringify(season2009));
  await shot('22-2009-round-1.png');
  await noErrors('2009 offseason continuation');

  // 2009 in-season dynasty audit: injury cover lifecycle and the Round 7 trade window.
  const injurySetup=await cdp.eval(`(()=>{const id=GCC.state.xi.find(pid=>{const p=GCC.state.pool.find(x=>x.id===pid);return p&&p.role!=='WK-BAT';})||GCC.state.xi[0];const p=GCC.state.pool.find(x=>x.id===id);GCC.state.dynasty.injuries={[id]:{status:'OUT',roundsLeft:4,type:'hamstring strain'}};return{id,name:p?.name,roster:GCC.state.teams[GCC.state.userClub.abbr].length,xi:GCC.state.xi.length};})()`);
  assert(injurySetup.id&&injurySetup.roster===15&&injurySetup.xi===11,'Forced injury precondition failed',JSON.stringify(injurySetup));

  const coverMarket=await cdp.eval(`(()=>{Dynasty.openReplacementMarket(${injurySetup.id});const btn=document.querySelector('.market-player button');const m=(btn?.getAttribute('onclick')||'').match(/signReplacement\\((\\d+),(\\d+)\\)/);return{open:document.getElementById('modal')?.classList.contains('open'),cards:document.querySelectorAll('.market-player').length,injured:m?Number(m[1]):null,replacement:m?Number(m[2]):null,text:(document.getElementById('modalBody')?.innerText||'').trim()};})()`);
  assert(coverMarket.open&&coverMarket.cards>0&&coverMarket.injured===injurySetup.id&&coverMarket.replacement,'Injury replacement market failed',JSON.stringify(coverMarket));
  await shot('23-2009-injury-cover-market.png');

  const coverSigned=await cdp.eval(`(()=>{Dynasty.signReplacement(${injurySetup.id},${coverMarket.replacement});const d=GCC.state.dynasty,rep=GCC.state.pool.find(p=>p.id===${coverMarket.replacement});return{mapped:d.replacementFor[${injurySetup.id}],reverse:d.replacementOf[${coverMarket.replacement}],roster:GCC.state.teams[GCC.state.userClub.abbr].length,replacementFlag:rep?.dynastyReplacement,modalOpen:document.getElementById('modal')?.classList.contains('open')};})()`);
  assert(coverSigned.mapped===coverMarket.replacement&&coverSigned.reverse===injurySetup.id&&coverSigned.roster===16&&coverSigned.replacementFlag===true&&!coverSigned.modalOpen,'Temporary replacement signing failed',JSON.stringify(coverSigned));

  const coverXI=await cdp.eval(`(()=>{GCC.beginSwap(${coverMarket.replacement});GCC.replaceXI(${injurySetup.id});GCC.state.dynasty.injuries[${injurySetup.id}].roundsLeft=1;return{xi:GCC.state.xi.length,hasReplacement:GCC.state.xi.includes(${coverMarket.replacement}),hasInjured:GCC.state.xi.includes(${injurySetup.id}),order:GCC.state.battingOrder.length};})()`);
  assert(coverXI.xi===11&&coverXI.order===11&&coverXI.hasReplacement&&!coverXI.hasInjured,'Replacement could not cover the injured XI player',JSON.stringify(coverXI));

  const coverReturn=await cdp.eval(`(()=>{GCC.playNextRound();const d=GCC.state.dynasty,rep=GCC.state.pool.find(p=>p.id===${coverMarket.replacement});return{round:GCC.state.round,injury:d.injuries[${injurySetup.id}]||null,mapped:d.replacementFor[${injurySetup.id}]||null,reverse:d.replacementOf[${coverMarket.replacement}]||null,roster:GCC.state.teams[GCC.state.userClub.abbr].length,repInRoster:GCC.state.teams[GCC.state.userClub.abbr].includes(${coverMarket.replacement}),injuredInXI:GCC.state.xi.includes(${injurySetup.id}),repInXI:GCC.state.xi.includes(${coverMarket.replacement}),replacementFlag:rep?.dynastyReplacement,xi:GCC.state.xi.length,order:GCC.state.battingOrder.length};})()`);
  assert(coverReturn.round===1&&coverReturn.injury==null&&coverReturn.mapped==null&&coverReturn.reverse==null&&coverReturn.roster===15&&!coverReturn.repInRoster&&coverReturn.injuredInXI&&!coverReturn.repInXI&&coverReturn.replacementFlag===false&&coverReturn.xi===11&&coverReturn.order===11,'Injury-cover return lifecycle failed',JSON.stringify(coverReturn));
  await shot('24-2009-cover-returned.png');

  // Keep the route deterministic while moving to the mid-season boundary.
  let midGuard=0;
  while((await cdp.eval(`GCC.state.round`))<7&&midGuard++<10){
    await cdp.eval(`GCC.state.dynasty.injuries={};GCC.state.dynasty.replacementFor={};GCC.state.dynasty.replacementOf={};true`);
    await cdp.eval(`GCC.playNextRound(); true`);
  }
  const round7=await cdp.eval(`(()=>({round:GCC.state.round,done:!!GCC.state.dynasty.midseasonDone[2009],strip:(document.getElementById('dynastySeasonStrip')?.innerText||'').trim(),buttons:[...document.querySelectorAll('#dynastySeasonStrip button')].map(x=>x.textContent.trim()),screen:document.querySelector('.screen.active')?.id,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(round7.round===7&&!round7.done&&round7.buttons.includes('OPEN TRADE WINDOW')&&/Trade window open/.test(round7.strip)&&round7.screen==='season'&&round7.active.length===1&&round7.overflow<=1,'Round 7 mid-season window did not open cleanly',JSON.stringify(round7));
  await shot('25-2009-round-7-trade-window.png');

  const midOpen=await cdp.eval(`(()=>{Dynasty.openMidseasonMarket();return{done:!!GCC.state.dynasty.midseasonDone[2009],modal:document.getElementById('modal')?.classList.contains('open'),clubs:document.querySelectorAll('#tradeClub option').length,targets:document.querySelectorAll('#tradeTarget option').length,offers:document.querySelectorAll('#tradeOffer option').length,pick:!!document.getElementById('tradePick')};})()`);
  assert(midOpen.modal&&midOpen.clubs===7&&midOpen.targets>0&&midOpen.offers>0&&!midOpen.pick,'Mid-season Trade Centre failed to open',JSON.stringify(midOpen));
  await shot('26-2009-midseason-trade-centre.png');

  // Opening the market must not consume the Round 7 opportunity if the user simply inspects and cancels.
  await cdp.eval(`GCC.closeModal();GCC.renderSeason();true`);
  await sleep(80);
  const midCancel=await cdp.eval(`(()=>({round:GCC.state.round,done:!!GCC.state.dynasty.midseasonDone[2009],buttons:[...document.querySelectorAll('#dynastySeasonStrip button')].map(x=>x.textContent.trim()),strip:(document.getElementById('dynastySeasonStrip')?.innerText||'').trim()}))()`);
  assert(!midCancel.done&&midCancel.buttons.includes('OPEN TRADE WINDOW')&&/Trade window open/.test(midCancel.strip),'Cancelling the mid-season Trade Centre consumed the only Round 7 window',JSON.stringify(midCancel));

  // Complete one valid mid-season trade. Prefer a bench player so this test isolates window semantics from XI repair.
  await cdp.eval(`Dynasty.openMidseasonMarket(); true`);
  const acceptedTrade=await cdp.eval(`(()=>{const clubEl=document.getElementById('tradeClub'),offerEl=document.getElementById('tradeOffer');const offerIds=[...offerEl.options].map(o=>Number(o.value));const benchFirst=offerIds.slice().sort((a,b)=>Number(GCC.state.xi.includes(a))-Number(GCC.state.xi.includes(b)));const beforeTrades=GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length;for(const offerId of benchFirst){offerEl.value=String(offerId);for(let ci=0;ci<clubEl.options.length;ci++){clubEl.selectedIndex=ci;Dynasty.refreshTradeTarget();const targetEl=document.getElementById('tradeTarget');for(let ti=targetEl.options.length-1;ti>=0;ti--){targetEl.selectedIndex=ti;const club=clubEl.value,target=Number(targetEl.value),offer=Number(offerEl.value),offerWasXI=GCC.state.xi.includes(offer);Dynasty.proposeTrade(true);if(document.getElementById('tradeRead')?.classList.contains('good'))return{accepted:true,club,target,offer,offerWasXI,beforeTrades,done:!!GCC.state.dynasty.midseasonDone[2009],read:document.getElementById('tradeRead')?.textContent||''};}}}return{accepted:false,done:!!GCC.state.dynasty.midseasonDone[2009],read:document.getElementById('tradeRead')?.textContent||'',beforeTrades};})()`);
  assert(acceptedTrade.accepted&&acceptedTrade.done,'No valid mid-season trade could be completed / accepted trade did not consume window',JSON.stringify(acceptedTrade));
  await sleep(800);
  const tradeClosed=await cdp.eval(`(()=>{const all=Object.values(GCC.state.teams).flat();const trades=GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length;return{done:!!GCC.state.dynasty.midseasonDone[2009],modal:document.getElementById('modal')?.classList.contains('open'),screen:document.querySelector('.screen.active')?.id,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id),trades,total:all.length,unique:new Set(all).size,strip:(document.getElementById('dynastySeasonStrip')?.innerText||'').trim(),buttons:[...document.querySelectorAll('#dynastySeasonStrip button')].map(x=>x.textContent.trim()),userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,xi:GCC.state.xi.length};})()`);
  assert(tradeClosed.done&&!tradeClosed.modal&&tradeClosed.trades===acceptedTrade.beforeTrades+1&&tradeClosed.total===tradeClosed.unique&&tradeClosed.userRoster===15,'Accepted mid-season trade did not settle cleanly',JSON.stringify({acceptedTrade,tradeClosed}));
  if(!acceptedTrade.offerWasXI)assert(tradeClosed.screen==='season'&&tradeClosed.active.length===1&&tradeClosed.active[0]==='season'&&!tradeClosed.buttons.includes('OPEN TRADE WINDOW')&&!/Trade window open/.test(tradeClosed.strip),'Accepted bench trade did not close the Round 7 window cleanly',JSON.stringify(tradeClosed));
  await shot('27-2009-midseason-trade-complete.png');

  // The completed trade and consumed window must survive a hard reload.
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const tradeReloadLauncher=await cdp.eval(`(()=>({launcherHidden:document.getElementById('careerLauncher')?.hidden,continueHidden:document.getElementById('launcherContinue')?.hidden,league:GCC.state.league.length,pool:GCC.state.pool.length,user:!!GCC.state.userClub}))()`);
  assert(!tradeReloadLauncher.launcherHidden&&!tradeReloadLauncher.continueHidden&&tradeReloadLauncher.league===0&&tradeReloadLauncher.pool===0&&!tradeReloadLauncher.user,'Mid-season trade reload hydrated dynasty before Continue',JSON.stringify(tradeReloadLauncher));
  const tradeReload=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const all=Object.values(GCC.state.teams).flat();return{screen:document.querySelector('.screen.active')?.id,round:GCC.state.round,done:!!GCC.state.dynasty.midseasonDone[2009],trades:GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length,total:all.length,unique:new Set(all).size,userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,xi:GCC.state.xi.length,buttons:[...document.querySelectorAll('#dynastySeasonStrip button')].map(x=>x.textContent.trim())};})()`);
  assert(tradeReload.round===7&&tradeReload.done&&tradeReload.trades===acceptedTrade.beforeTrades+1&&tradeReload.total===tradeReload.unique&&tradeReload.userRoster===15,'Accepted mid-season trade did not persist across reload',JSON.stringify(tradeReload));
  if(!acceptedTrade.offerWasXI)assert(tradeReload.screen==='season'&&tradeReload.xi===11&&!tradeReload.buttons.includes('OPEN TRADE WINDOW'),'Reload reopened consumed Round 7 window / broke XI after bench trade',JSON.stringify(tradeReload));
  await noErrors('2009 injury cover and mid-season trade window');

  // Year-to-year continuity audit: finish 2009, enter 2010, and prove the core product shell does not mutate.
  let finishGuard=0;
  while((await cdp.eval(`GCC.state.round`))<14&&finishGuard++<12){
    await cdp.eval(`GCC.state.dynasty.injuries={};GCC.state.dynasty.replacementFor={};GCC.state.dynasty.replacementOf={};true`);
    await cdp.eval(`GCC.playNextRound(); true`);
  }
  const regular2009=await cdp.eval(`(()=>({year:GCC.state.year,round:GCC.state.round,position:GCC.state.regularSeasonPosition,qualified:(GCC.state.regularSeasonPosition||99)<=4,results:GCC.state.results.length,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id)}))()`);
  assert(regular2009.year===2009&&regular2009.round===14&&regular2009.results===14,'2009 regular season did not complete cleanly',JSON.stringify(regular2009));

  await cdp.eval(`GCC.state.dynasty.injuries={};GCC.state.dynasty.replacementFor={};GCC.state.dynasty.replacementOf={};true`);
  if(regular2009.qualified){
    await cdp.eval(`GCC.proceedPostSeason(); true`);
    const modalOpen=await cdp.eval(`document.getElementById('modal')?.classList.contains('open')`);
    if(modalOpen)await cdp.eval(`GCC.enterFinalsFromModal(); true`);
    let stage=await cdp.eval(`GCC.state.finals?.stage`);
    if(stage==='ready')await cdp.eval(`GCC.simulateFinals(); true`);
    stage=await cdp.eval(`GCC.state.finals?.stage`);
    if(stage==='semis')await cdp.eval(`GCC.advanceFinals(); true`);
    stage=await cdp.eval(`GCC.state.finals?.stage`);
    if(stage==='gf-ready')await cdp.eval(`GCC.simulateFinals(); true`);
    await sleep(1900);
    await cdp.eval(`GCC.openSeasonReview(); true`);
  }else{
    await cdp.eval(`GCC.proceedPostSeason(); true`);
  }
  const review2009=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id),year:GCC.state.year,title:(document.getElementById('reviewTitle')?.textContent||'').trim(),intro:(document.getElementById('reviewIntro')?.textContent||'').trim(),outcome:(document.getElementById('reviewOutcome')?.innerText||'').trim(),nav:[...document.querySelectorAll('#nav button')].map(x=>x.textContent.trim()),kpis:document.querySelectorAll('#reviewKpis .stat').length,footer:[...document.querySelectorAll('#review .review-footer button')].map(x=>x.textContent.trim()),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(review2009.screen==='review'&&review2009.active.length===1&&review2009.year===2009&&review2009.title&&review2009.outcome&&review2009.kpis>=4&&review2009.footer.some(x=>/CONTINUE DYNASTY/.test(x))&&review2009.overflow<=1,'2009 Review handoff failed',JSON.stringify(review2009));
  await shot('28-2009-season-review.png');

  const market2010=await cdp.eval(`(()=>{Dynasty.beginOffseason();const o=GCC.state.dynasty.offseason;const all=Object.values(GCC.state.teams).flat();return{screen:document.querySelector('.screen.active')?.id,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id),year:GCC.state.year,phase:o?.phase,timeline:document.querySelectorAll('#dynastyTimeline .dynasty-step').length,nav:[...document.querySelectorAll('#nav button')].map(x=>x.textContent.trim()),headline:(document.getElementById('dynastyHeadline')?.innerText||'').trim(),userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,total:all.length,unique:new Set(all).size,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(market2010.screen==='dynasty'&&market2010.active.length===1&&market2010.year===2010&&market2010.phase==='market'&&market2010.timeline===5&&market2010.total===market2010.unique&&market2010.headline&&market2010.overflow<=1,'2010 offseason did not begin cleanly',JSON.stringify(market2010));
  assert(JSON.stringify(market2010.nav)===JSON.stringify(review2009.nav),'Top-level dynasty navigation changed between 2009 Review and 2010 offseason',JSON.stringify({review:review2009.nav,market:market2010.nav}));
  await shot('29-2010-market.png');

  await cdp.eval(`Dynasty.runCpuMarket();Dynasty.drawDraftOrder();Dynasty.startAnnualDraft();true`);
  let draft2010Guard=0;
  while(draft2010Guard++<40){
    const phase=await cdp.eval(`GCC.state.dynasty.offseason?.phase`);
    if(phase!=='draft')break;
    const pick=await makeUserDraftPick();
    if(!pick)await cdp.eval(`Dynasty.runCpuDraftUntilUser(); true`);
  }
  const draft2010Done=await cdp.eval(`(()=>{const o=GCC.state.dynasty.offseason;const all=Object.values(GCC.state.teams).flat();return{phase:o.phase,complete:o.draftComplete,picks:o.picks.length,userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,total:all.length,unique:new Set(all).size};})()`);
  assert(draft2010Done.phase==='cuts'&&draft2010Done.complete&&draft2010Done.total===draft2010Done.unique&&draft2010Done.userRoster>=15,'2010 annual Draft did not complete cleanly',JSON.stringify(draft2010Done));

  let cut2010Guard=0;
  while((await cdp.eval(`GCC.state.teams[GCC.state.userClub.abbr].length`))>15&&cut2010Guard++<12){
    const id=await cdp.eval(`(()=>{const rows=[...document.querySelectorAll('.cut-row')].filter(x=>x.querySelector('button'));if(!rows.length)return null;rows.sort((a,b)=>Number(a.querySelector('strong')?.textContent||999)-Number(b.querySelector('strong')?.textContent||999));const m=(rows[0].querySelector('button')?.getAttribute('onclick')||'').match(/cutPlayer\\((\\d+)\\)/);return m?Number(m[1]):null;})()`);
    assert(id,'2010 Final 15 has no releasable player while above 15');
    await cdp.eval(`Dynasty.cutPlayer(${id}); true`);
  }
  const pre2010=await cdp.eval(`(()=>{Dynasty.finishOffseason();return{year:GCC.state.year,phase:GCC.state.dynasty.offseason?.phase,n:GCC.state.teams[GCC.state.userClub.abbr].length,heading:(document.querySelector('#dynastyMain h3')?.textContent||'').trim(),cta:(document.querySelector('#dynastyMain .button.primary')?.textContent||'').trim()};})()`);
  assert(pre2010.year===2010&&pre2010.phase==='ready'&&pre2010.n===15&&pre2010.heading==='The 15 are lodged.'&&/NAME THE 2010 XI/.test(pre2010.cta),'2010 Pre-season state failed',JSON.stringify(pre2010));

  const team2010=await cdp.eval(`(()=>{Dynasty.enterTeamRoom();return{screen:document.querySelector('.screen.active')?.id,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id),year:GCC.state.year,title:(document.querySelector('#team .section-head h2')?.textContent||'').trim(),lead:(document.getElementById('selectionLead')?.textContent||'').trim(),nav:[...document.querySelectorAll('#nav button')].map(x=>x.textContent.trim()),layoutHidden:document.querySelector('#team .team-layout')?.hidden,recommendHidden:document.getElementById('recommendXIButton')?.hidden,manualHidden:document.getElementById('manualXIButton')?.hidden,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(team2010.screen==='team'&&team2010.active.length===1&&team2010.year===2010&&/2010 XI/.test(team2010.title)&&team2010.layoutHidden===true&&!team2010.recommendHidden&&!team2010.manualHidden&&team2010.overflow<=1,'2010 Team Room visual/state handoff failed',JSON.stringify(team2010));
  assert(JSON.stringify(team2010.nav)===JSON.stringify(season2009.nav),'Permanent dynasty navigation changed between 2009 Season and 2010 Team Room',JSON.stringify({season2009:season2009.nav,team2010:team2010.nav}));
  await shot('30-2010-team-room.png');

  const season2010=await cdp.eval(`(()=>{GCC.selectRecommendedXI();GCC.startSeason();return{screen:document.querySelector('.screen.active')?.id,active:[...document.querySelectorAll('.screen.active')].map(x=>x.id),year:GCC.state.year,round:GCC.state.round,xi:GCC.state.xi.length,fixtures:GCC.state.schedule.length,rounds:GCC.state.fullSchedule.length,nav:[...document.querySelectorAll('#nav button')].map(x=>x.textContent.trim()),views:[...document.querySelectorAll('.season-view-button')].map(x=>x.textContent.trim()),kpis:document.querySelectorAll('#seasonKpis .stat').length,dynastyStrip:!!document.getElementById('dynastySeasonStrip'),sectionClass:document.getElementById('season')?.className||'',heading:(document.querySelector('#season .section-head h2')?.textContent||'').trim(),intro:(document.querySelector('#season .section-head p')?.textContent||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(season2010.screen==='season'&&season2010.active.length===1&&season2010.year===2010&&season2010.round===0&&season2010.xi===11&&season2010.fixtures===14&&season2010.rounds===14&&season2010.overflow<=1,'2010 Round 1 state failed',JSON.stringify(season2010));
  assert(JSON.stringify(season2010.nav)===JSON.stringify(season2009.nav)&&JSON.stringify(season2010.views)===JSON.stringify(season2009.views)&&season2010.kpis===season2009.kpis&&season2010.dynastyStrip===season2009.dynastyStrip&&season2010.sectionClass===season2009.sectionClass,'Core Season shell changed between 2009 and 2010',JSON.stringify({season2009,season2010}));
  await shot('31-2010-round-1.png');
  await noErrors('2009 to 2010 visual/state continuity');

  const report={candidate:'90821b2cd6756fc2649e3a579b210935d5a3439d4e721f543b274f192b6a552e',launcher,foundation,recruit,draw,draftStart,drafted,modal,teamChoice,saved,resumed,xi,season,mobileLauncher,mobileResume,seasonEntryVisual,round1,round1Visual,scorecard,round5,round5Visual,mobileRound5,round10,round14,weatherPriors,round1Conditions,round1AfterStart,reloadWeather,round1WeatherResult,round2Team,mobileConditions,finalsEntry,semiForecast,semiStage,semiWeatherResult,semiCard,gfReady,gfForecast,finalsDone,gfWeatherResult,finalsSteady,review,mobileReview,reviewFooter,market,tradeCentre,marketResume,cpuMarket,lottery,pickAssets,lotteryResume,draftOpen,partialDraft,draftResume,draftDone,final15,preSeasonReady,readyResume,team2009,xi2009,season2009,injurySetup,coverMarket,coverSigned,coverXI,coverReturn,round7,midOpen,midCancel,acceptedTrade,tradeClosed,tradeReloadLauncher,tradeReload,regular2009,review2009,market2010,draft2010Done,pre2010,team2010,season2010};
  fs.writeFileSync(path.join(OUT,'browser-report.json'),JSON.stringify(report,null,2));
  console.log('v7.2.15 match-day conditions audit OK');
  console.log(JSON.stringify(report,null,2));
}finally{cdp.close();proc.kill('SIGTERM');server.close()}
