import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_2_9_finals_hierarchy.html');
const OUT=path.join(ROOT,'qa','output','v729-postseason-journey');
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
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8772,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v729-postseason-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9229','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());

async function pageTarget(){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:9229/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1400))}
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
  async function navigate(){await cdp.call('Page.navigate',{url:'http://127.0.0.1:8772/game.html'});await ready()}
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
  await shot('06-mobile-season-resumed.png');
  await noErrors('mobile continue journey');

  // Season gameplay audit: move through actual rounds and verify the screen remains a cricket decision surface.
  await viewport(1440,900);
  const round1=await cdp.eval(`(()=>{GCC.playNextRound();const story=document.getElementById('matchStory')?.innerText||'';const next=document.getElementById('seasonStageTitle')?.textContent.trim();return{round:GCC.state.round,results:GCC.state.results.length,story,next,heading:document.querySelector('#season .section-head h2')?.textContent.trim(),runRows:document.querySelectorAll('#seasonRun .season-run-row').length,ladderRows:document.querySelectorAll('#ladderSnapshot .ladder-snapshot-row').length,tickerHidden:document.getElementById('seasonTicker')?.hidden,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(round1.round===1&&round1.results===1&&/ROUND 1/.test(round1.story)&&/OPEN SCORECARD/.test(round1.story),'Round 1 result story failed',JSON.stringify(round1));
  assert(round1.next&&round1.heading==='Early rounds'&&round1.runRows===4&&round1.ladderRows>=4&&round1.tickerHidden&&round1.overflow<=1,'Round 1 season hierarchy failed',JSON.stringify(round1));
  const round1Visual=await cdp.eval(`(()=>({moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),opacity:getComputedStyle(document.getElementById('gccMomentLayer')).opacity,visibility:getComputedStyle(document.getElementById('gccMomentLayer')).visibility,story:!!document.querySelector('#matchStory .story-card')}))()`);
  assert(!round1Visual.moment&&round1Visual.opacity==='0'&&round1Visual.visibility==='hidden'&&round1Visual.story,'Round 1 duplicates the persistent result with a floating bulletin',JSON.stringify(round1Visual));
  await shot('07-season-after-round-1.png');

  const scorecard=await cdp.eval(`(()=>{GCC.openScorecard(1);return{open:document.getElementById('modal')?.classList.contains('open'),innings:document.querySelectorAll('#modal .scorecard-innings').length,text:document.getElementById('modal')?.innerText||''};})()`);
  assert(scorecard.open&&scorecard.innings===2&&/BATTING/i.test(scorecard.text)&&/BOWLING/i.test(scorecard.text),'Round 1 scorecard failed',JSON.stringify(scorecard));
  await cdp.eval(`GCC.closeModal(); true`);

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
  assert(!finalsEntry.moment&&finalsEntry.overflow<=1,'Finals entry carries stale moment or overflow',JSON.stringify(finalsEntry));
  await shot('12-finals-ready.png');

  const semiStage=await cdp.eval(`(()=>{GCC.simulateFinals();const mine=GCC.state.finals.semis.find(x=>[x.home.abbr,x.away.abbr].includes(GCC.state.userClub.abbr));const alive=mine.winner.abbr===GCC.state.userClub.abbr;return{stage:GCC.state.finals.stage,alive,title:document.getElementById('finalsTitle')?.textContent.trim(),story:(document.getElementById('finalsStory')?.innerText||'').trim(),control:(document.getElementById('finalsControls')?.innerText||'').trim(),moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),momentText:(document.getElementById('gccMomentLayer')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(semiStage.stage==='semis'&&semiStage.story.length>0&&/GRAND FINAL|VIEW GRAND FINAL/.test(semiStage.control)&&semiStage.overflow<=1,'Semi-final result state failed',JSON.stringify(semiStage));
  assert(!semiStage.moment,'Semi-final result duplicates the persistent finals story with a floating bulletin',JSON.stringify(semiStage));
  await shot('13-finals-semi-result.png');

  const semiCard=await cdp.eval(`(()=>{const idx=GCC.state.finals.semis.findIndex(x=>[x.home.abbr,x.away.abbr].includes(GCC.state.userClub.abbr));GCC.openFinalsScorecard('semi',idx);return{open:document.getElementById('modal')?.classList.contains('open'),innings:document.querySelectorAll('#modal .scorecard-innings').length,text:(document.getElementById('modal')?.innerText||'').trim()};})()`);
  assert(semiCard.open&&semiCard.innings===2&&/SEMI-FINAL/.test(semiCard.text)&&/BATTING/i.test(semiCard.text),'Semi-final scorecard failed',JSON.stringify(semiCard));
  await cdp.eval(`GCC.closeModal(); true`);

  const gfReady=await cdp.eval(`(()=>{GCC.advanceFinals();return{stage:GCC.state.finals.stage,title:document.getElementById('finalsTitle')?.textContent.trim(),story:(document.getElementById('finalsStory')?.innerText||'').trim(),control:(document.getElementById('finalsControls')?.innerText||'').trim(),userIn:[GCC.state.finals.gfPair.home.abbr,GCC.state.finals.gfPair.away.abbr].includes(GCC.state.userClub.abbr),moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),momentText:(document.getElementById('gccMomentLayer')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(gfReady.stage==='gf-ready'&&gfReady.story.length>0&&/GRAND FINAL|CHAMPIONSHIP/.test(gfReady.control)&&gfReady.overflow<=1,'Grand Final ready state failed',JSON.stringify(gfReady));
  assert(!gfReady.moment,'Grand Final reveal duplicates the persistent matchup with a floating bulletin',JSON.stringify(gfReady));
  await shot('14-finals-grand-final-ready.png');

  await cdp.eval(`GCC.simulateFinals(); true`);
  await sleep(220);
  const finalsDone=await cdp.eval(`(()=>{const won=GCC.state.champion?.abbr===GCC.state.userClub.abbr;return{stage:GCC.state.finals.stage,champion:GCC.state.champion?.name,won,title:document.getElementById('finalsTitle')?.textContent.trim(),story:(document.getElementById('finalsStory')?.innerText||'').trim(),control:(document.getElementById('finalsControls')?.innerText||'').trim(),moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),momentText:(document.getElementById('gccMomentLayer')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(finalsDone.stage==='done'&&finalsDone.champion&&finalsDone.story.length>0&&/VIEW SEASON REVIEW/.test(finalsDone.control)&&finalsDone.overflow<=1,'Grand Final completion state failed',JSON.stringify(finalsDone));
  assert(finalsDone.won ? (finalsDone.moment&&/GLOBAL CHAMPIONS/.test(finalsDone.momentText)) : !finalsDone.moment,'Finals completion ceremony hierarchy failed',JSON.stringify(finalsDone));
  await shot('15a-finals-completion-moment.png');
  await sleep(1900);
  const finalsSteady=await cdp.eval(`(()=>({moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),opacity:getComputedStyle(document.getElementById('gccMomentLayer')).opacity,visibility:getComputedStyle(document.getElementById('gccMomentLayer')).visibility,title:document.getElementById('finalsTitle')?.textContent.trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(!finalsSteady.moment&&finalsSteady.opacity==='0'&&finalsSteady.visibility==='hidden'&&finalsSteady.title&&finalsSteady.overflow<=1,'Completed Finals did not settle to a clean steady state',JSON.stringify(finalsSteady));
  await shot('15-finals-complete.png');

  const review=await cdp.eval(`(()=>{GCC.openSeasonReview();return{screen:document.querySelector('.screen.active')?.id,title:document.getElementById('reviewTitle')?.textContent.trim(),intro:document.getElementById('reviewIntro')?.textContent.trim(),outcome:(document.getElementById('reviewOutcome')?.innerText||'').trim(),kpis:document.querySelectorAll('#reviewKpis .stat').length,players:document.querySelectorAll('#reviewPlayers .review-player').length,moments:document.querySelectorAll('#reviewMoments .review-item').length,strengths:document.querySelectorAll('#reviewStrengths .review-item').length,weaknesses:document.querySelectorAll('#reviewWeaknesses .review-item').length,tables:document.querySelectorAll('#reviewTable table').length,moment:document.getElementById('gccMomentLayer')?.classList.contains('show'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(review.screen==='review'&&review.title&&review.intro&&review.outcome&&review.kpis>=4&&review.players>=2&&review.moments>=1&&review.strengths>=1&&review.weaknesses>=1&&review.tables===2,'Season Review content failed',JSON.stringify(review));
  assert(!review.moment&&review.overflow<=1,'Season Review carries stale transient moment or overflow',JSON.stringify(review));
  await shot('16-season-review.png');

  await viewport(390,844);
  const mobileReview=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,players:document.querySelectorAll('#reviewPlayers .review-player').length,tables:document.querySelectorAll('#reviewTable table').length,footerButtons:document.querySelectorAll('#review .review-footer .button').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(mobileReview.screen==='review'&&mobileReview.players>=2&&mobileReview.tables===2&&mobileReview.footerButtons>=1&&mobileReview.overflow<=1,'Mobile Season Review failed',JSON.stringify(mobileReview));
  await shot('17-mobile-season-review.png');
  await viewport(1440,900);
  await noErrors('postseason and review journey');

  const report={candidate:'cab3b93391f1e526281ea77ac65e2088938339336db122cb997e35b06d364eb8',launcher,foundation,recruit,draw,draftStart,drafted,modal,teamChoice,saved,resumed,xi,season,mobileLauncher,mobileResume,seasonEntryVisual,round1,round1Visual,scorecard,round5,round5Visual,mobileRound5,round10,round14,finalsEntry,semiStage,semiCard,gfReady,finalsDone,finalsSteady,review,mobileReview};
  fs.writeFileSync(path.join(OUT,'browser-report.json'),JSON.stringify(report,null,2));
  console.log('v7.2.9 postseason journey audit OK');
  console.log(JSON.stringify(report,null,2));
}finally{cdp.close();proc.kill('SIGTERM');server.close()}
