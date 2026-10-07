import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_3_3_visual_identity.html');
const OUT=path.join(ROOT,'qa','output','v734-golden-dynasty');
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
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8787,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v734-golden-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9244','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());
async function pageTarget(){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:9244/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1400))}
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
  async function navigate(){await cdp.call('Page.navigate',{url:'http://127.0.0.1:8787/game.html'});await ready()}
  async function shot(name){const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
  async function noErrors(stage){const page=await cdp.eval(`window.__qaErrors||[]`);assert(page.length===0,`${stage}: page errors`,JSON.stringify(page));assert(runtimeErrors.length===0,`${stage}: runtime errors`,JSON.stringify(runtimeErrors));assert(consoleErrors.length===0,`${stage}: console errors`,JSON.stringify(consoleErrors))}

  await viewport(1440,900);await navigate();
  await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);await cdp.call('Page.reload',{ignoreCache:true});await ready();

  const fresh=await cdp.eval(`(()=>{const L=document.getElementById('careerLauncher'),shell=document.querySelector('.launcher-shell'),mark=document.querySelector('.launcher-mark'),brand=document.querySelector('.brand-mark'),top=document.querySelector('.topbar'),k=document.querySelector('.launcher-kicker');const cs=x=>getComputedStyle(x);return{visible:!!L&&!L.hidden&&cs(L).display!=='none',shellTop:cs(shell).borderTopWidth,shellBottom:cs(shell).borderBottomWidth,kicker:cs(k).display,markW:Math.round(mark.getBoundingClientRect().width),markH:Math.round(mark.getBoundingClientRect().height),brandImg:brand.querySelectorAll('img').length,brandSvg:brand.querySelectorAll('svg.gcc-brand-symbol').length,brandBg:cs(brand).backgroundColor,brandBorder:cs(brand).borderTopWidth,newBg:cs(document.getElementById('launcherNew')).backgroundColor,continueBg:cs(document.getElementById('launcherContinue')).backgroundColor,topAfter:getComputedStyle(top,'::after').display,topBorder:cs(top).borderBottomWidth,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(fresh.visible&&fresh.shellTop==='0px'&&fresh.shellBottom==='0px'&&fresh.kicker==='none'&&fresh.markW===58&&fresh.markH===52&&fresh.brandImg===0&&fresh.brandSvg===1&&fresh.brandBorder==='0px'&&fresh.newBg===fresh.continueBg&&fresh.topAfter==='none'&&fresh.topBorder==='1px'&&fresh.overflow<=1,'Fresh launcher visual gate failed',JSON.stringify(fresh));
  await shot('00-launcher-fresh.png');
  await viewport(390,844);await sleep(250);
  const freshMobile=await cdp.eval(`(()=>{const mark=document.querySelector('.launcher-mark'),brand=document.querySelector('.brand-mark'),top=document.querySelector('.topbar');return{markW:Math.round(mark.getBoundingClientRect().width),markH:Math.round(mark.getBoundingClientRect().height),brandW:Math.round(brand.getBoundingClientRect().width),topH:Math.round(top.getBoundingClientRect().height),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(freshMobile.markW===52&&freshMobile.markH===47&&freshMobile.brandW===34&&freshMobile.topH===68&&freshMobile.overflow<=1,'Fresh mobile launcher visual gate failed',JSON.stringify(freshMobile));
  await shot('00b-launcher-fresh-mobile.png');await viewport(1440,900);await sleep(200);

  const clubs=await cdp.eval(`(()=>{Dynasty.requestNewDynasty();GCC.skipLeagueReveal();GCC.finishLeagueReveal();return{screen:document.querySelector('.screen.active')?.id,heading:document.querySelector('#clubs h2')?.textContent.trim(),copy:document.querySelector('#clubs .section-head p')?.textContent.trim(),stage:document.querySelector('#clubs .stage-note')?.innerText||'',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(clubs.screen==='clubs'&&clubs.heading==='Which club is yours?'&&/ground/.test(clubs.copy)&&/Pick your club/.test(clubs.stage)&&clubs.overflow<=1,'Club-choice language gate failed',JSON.stringify(clubs));
  await shot('01-club-choice.png');

  const signing=await cdp.eval(`(()=>{GCC.selectClub(0);GCC.confirmClub();return{screen:document.querySelector('.screen.active')?.id,heading:document.querySelector('#recruit h2')?.textContent.trim(),intro:document.querySelector('#recruit .section-head p')?.textContent.trim(),side:(document.querySelector('#recruit .signing-side')?.innerText||'').trim(),roll:(document.getElementById('recruitRoll')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(signing.screen==='recruit'&&signing.heading==='Five days decide who enters the Draft.'&&/foundation Draft pool/.test(signing.intro)&&/Day 5 closes/.test(signing.intro)&&/WHAT IT MEANS FOR THE DRAFT/.test(signing.side)&&/Every yes puts a player into the Draft/.test(signing.side)&&/first name is waiting/i.test(signing.roll)&&/enters the foundation Draft/.test(signing.roll)&&signing.overflow<=1,'Signing Week language gate failed',JSON.stringify(signing));
  await shot('02-signing-week.png');

  const draw=await cdp.eval(`(()=>{GCC.skipRecruitment();GCC.setupDraft();return{screen:document.querySelector('.screen.active')?.id,intro:document.querySelector('#draftDraw .cinematic-head p')?.textContent.trim(),prompt:document.getElementById('draftRevealPrompt')?.innerText||'',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(draw.screen==='draftDraw'&&draw.intro.length>20&&draw.prompt.length>10&&draw.overflow<=1,'Draft Order regression gate failed',JSON.stringify(draw));
  await shot('03-draft-order.png');

  const draft=await cdp.eval(`(()=>{GCC.skipDraftReveal();GCC.beginDraft();GCC.skipToMyPick();return{screen:document.querySelector('.screen.active')?.id,note:(document.querySelector('#draft .stage-note')?.innerText||'').trim(),board:(document.querySelector('#draftBoardPanel .draft-board-head')?.innerText||'').trim(),cards:document.querySelectorAll('#players .player-card').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(draft.screen==='draft'&&draft.note.length>10&&draft.cards===24&&draft.overflow<=1,'Foundation Draft regression gate failed',JSON.stringify(draft));
  await shot('04-foundation-draft.png');

  const drafted=await cdp.eval(`(()=>{const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8,t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('skipToMyPick failed');const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id);guard++}return{finished:s.draftFinished,n:s.teams[s.userClub.abbr].length}})()`);
  assert(drafted.finished&&drafted.n===15,'Foundation Draft completion failed',JSON.stringify(drafted));await sleep(650);await cdp.eval(`GCC.closeModal();GCC.enterTeamRoom();true`);

  const team=await cdp.eval(`(()=>{const intro=document.querySelector('#team .section-head p')?.textContent.trim(),lead=document.getElementById('selectionCopy')?.textContent.trim(),squad=document.getElementById('squadColumnNote')?.textContent.trim(),order=document.querySelector('#team .team-order-note')?.textContent.trim(),swap=document.getElementById('swapStatus')?.textContent.trim();const panel=document.querySelector('#team .team-selection-panel');return{intro,lead,squad,order,swap,rows:document.querySelectorAll('#xiList .xi-row').length,before:getComputedStyle(panel,'::before').display,shadow:getComputedStyle(panel).boxShadow,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(/natural batting order/.test(team.intro)&&/innings differently/.test(team.intro)&&/Build a balanced XI/.test(team.lead)&&/Selected players stay visible/.test(team.squad)&&/natural order/.test(team.order)&&/spots still open/.test(team.swap)&&team.rows===15&&team.before==='none'&&team.shadow==='none'&&team.overflow<=1,'Team Room visual/language gate failed',JSON.stringify(team));
  await shot('05-team-room-empty.png');

  const xi=await cdp.eval(`(()=>{for(const id of GCC.state.teams[GCC.state.userClub.abbr]){if(GCC.state.xi.length>=11)break;GCC.toggleXI(id)}return{xi:GCC.state.xi.length,order:GCC.state.battingOrder.length,start:document.getElementById('startSeasonButton')?.disabled}})()`);
  assert(xi.xi===11&&xi.order===11&&!xi.start,'XI completion failed',JSON.stringify(xi));
  await shot('05b-team-room-complete.png');
  await viewport(390,844);await cdp.eval(`window.scrollTo(0,0);true`);await sleep(200);const teamMobile=await cdp.eval(`(()=>({before:getComputedStyle(document.querySelector('#team .team-selection-panel'),'::before').display,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);assert(teamMobile.before==='none'&&teamMobile.overflow<=1,'Team Room mobile visual gate failed',JSON.stringify(teamMobile));await shot('06-team-room-mobile.png');await viewport(1440,900);

  const season=await cdp.eval(`(()=>{GCC.startSeason();const nav=[...document.querySelectorAll('.season-view-button')].map(x=>x.textContent.trim());const panel=document.querySelector('#season .season-panel');return{screen:document.querySelector('.screen.active')?.id,nav,run:document.querySelector('#seasonOverview .season-overview-block:first-child .season-overview-head')?.innerText||'',finals:document.querySelector('#seasonOverview .season-overview-block:nth-child(2) .season-overview-head')?.innerText||'',shadow:panel?getComputedStyle(panel).boxShadow:'missing',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(season.screen==='season'&&JSON.stringify(season.nav)===JSON.stringify(['Overview','Fixtures','Ladder','Analysis','Players'])&&/THE RUN/.test(season.run)&&/Recent and next/.test(season.run)&&/FINALS LINE/.test(season.finals)&&/Ladder snapshot/.test(season.finals)&&season.shadow==='none'&&season.overflow<=1,'Season Hub visual regression gate failed',JSON.stringify(season));
  await shot('07-season-start.png');
  await viewport(390,844);await cdp.eval(`window.scrollTo(0,0);true`);await sleep(200);const seasonMobile=await cdp.eval(`(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);assert(seasonMobile.overflow<=1,'Season Hub mobile overflow',JSON.stringify(seasonMobile));await shot('07b-season-mobile.png');await viewport(1440,900);
  await cdp.eval(`GCC.playNextRound();GCC.setSeasonView('analysis');true`);
  const innings=await cdp.eval(`(()=>({round:GCC.state.round,why:(document.getElementById('seasonWhy')?.innerText||'').trim(),shape:(document.getElementById('seasonShape')?.innerText||'').trim(),heading:document.querySelector('#season .section-head h2')?.textContent.trim(),intro:document.querySelector('#season .section-head p')?.textContent.trim()}))()`);
  assert(innings.round===1&&/INNINGS PHASES/.test(innings.why)&&/One match is a clue, not a trend/.test(innings.why)&&/SEASON SCOREBOOK/.test(innings.shape)&&innings.heading==='Early rounds','Season innings language gate failed',JSON.stringify(innings));
  await shot('08-season-innings.png');

  await cdp.eval(`(()=>{while(GCC.state.round<14)GCC.playNextRound();const row=GCC.state.table[GCC.state.userClub.abbr];row.pts=999;row.nrr=9;GCC.state.regularSeasonPosition=1;GCC.renderSeason();GCC.proceedPostSeason();return true})()`);
  const finals=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,title:document.getElementById('finalsTitle')?.textContent.trim(),intro:document.getElementById('finalsIntro')?.textContent.trim(),stage:document.getElementById('finalsStageCopy')?.textContent.trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(finals.screen==='finals'&&finals.title==='Four clubs remain.'&&/One loss ends the season/.test(finals.intro)&&/path begins/.test(finals.stage)&&finals.overflow<=1,'Finals regression gate failed',JSON.stringify(finals));
  await shot('09-finals.png');
  await cdp.eval(`GCC.simulateFinals();GCC.advanceFinals();GCC.simulateFinals();true`);await sleep(700);await cdp.eval(`GCC.closeModal();GCC.openSeasonReview();window.scrollTo(0,0);true`);await sleep(250);
  const review=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,strength:(document.querySelector('#reviewStrengths')?.parentElement?.innerText||'').trim(),weak:(document.querySelector('#reviewWeaknesses')?.parentElement?.innerText||'').trim(),book:(document.getElementById('reviewTable')?.parentElement?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(review.screen==='review'&&/WHAT HELD UP/.test(review.strength)&&/What you can trust/.test(review.strength)&&/NEXT SEASON/.test(review.weak)&&/(The first fix|Where to improve)/.test(review.weak)&&/SEASON BOOK/.test(review.book)&&review.overflow<=1,'Season Review regression gate failed',JSON.stringify(review));
  await shot('10-season-review.png');

  await cdp.eval(`Dynasty.beginOffseason();true`);
  const market=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,title:document.getElementById('dynastyTitle')?.textContent.trim(),intro:document.getElementById('dynastyIntro')?.textContent.trim(),headline:(document.getElementById('dynastyHeadline')?.innerText||'').trim(),main:(document.getElementById('dynastyMain')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(market.screen==='dynasty'&&/^Build the 2009 side\./.test(market.title)&&/Retirements, trades and the Draft reshape the list/.test(market.intro)&&/Finish with fifteen/.test(market.intro)&&/list spots|list full|to release|cuts after Draft/i.test(market.headline)&&/Trade before the Draft Draw/.test(market.main)&&/Every club values needs differently/.test(market.main)&&/cricketer they are now/.test(market.main)&&market.overflow<=1,'Offseason language gate failed',JSON.stringify(market));
  await shot('11-offseason-market.png');

  const trade=await cdp.eval(`(()=>{Dynasty.openTradeCentre(false);return{text:(document.getElementById('modalBody')?.innerText||'').trim(),open:document.getElementById('modal')?.classList.contains('open')}})()`);
  assert(trade.open&&/Make a cricket trade\./.test(trade.text)&&/Build the deal around what each list needs/.test(trade.text)&&/decide what you are prepared to send/.test(trade.text),'Trade Centre language gate failed',JSON.stringify(trade));
  await shot('12-trade-centre.png');await cdp.eval(`GCC.closeModal();Dynasty.runCpuMarket();Dynasty.drawDraftOrder();true`);
  const lottery=await cdp.eval(`(()=>({main:(document.getElementById('dynastyMain')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(/RANDOM DRAW/.test(lottery.main)&&/Every club had the same chance/.test(lottery.main)&&/Round 2 pick/.test(lottery.main)&&lottery.overflow<=1,'Annual Draft Draw regression gate failed',JSON.stringify(lottery));
  await shot('13-annual-draw.png');

  await cdp.eval(`Dynasty.startAnnualDraft();true`);
  const annual=await cdp.eval(`(()=>({main:(document.getElementById('dynastyMain')?.innerText||'').trim(),cards:document.querySelectorAll('#annualDraftPlayers .player-card').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(/LIST BALANCE/.test(annual.main)&&/on the list/.test(annual.main)&&/Add what the list needs most/.test(annual.main)&&annual.cards===24&&annual.overflow<=1,'Annual Draft visual/language gate failed',JSON.stringify(annual));
  await shot('14-annual-draft.png');
  await viewport(390,844);await cdp.eval(`document.querySelector('.annual-draft-room')?.scrollIntoView({block:'start'});true`);await shot('15-annual-draft-mobile.png');await viewport(1440,900);

  let guard=0;
  while((await cdp.eval(`GCC.state.dynasty.offseason?.phase`))==='draft'&&guard++<30){
    const picked=await cdp.eval(`(()=>{const card=document.querySelector('#annualDraftPlayers .player-card');if(!card){Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();return false}const m=(card.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);if(!m)return false;Dynasty.userAnnualDraft(Number(m[1]));return true})()`);
    if(!picked)await sleep(20);
  }
  const cuts=await cdp.eval(`(()=>({phase:GCC.state.dynasty.offseason?.phase,main:(document.getElementById('dynastyMain')?.innerText||'').trim(),n:GCC.state.teams[GCC.state.userClub.abbr].length}))()`);
  assert(cuts.phase==='cuts'&&/FINAL 15/.test(cuts.main)&&/The Draft has taken you over fifteen/.test(cuts.main)&&/before you can name the XI/.test(cuts.main),'Final 15 language gate failed',JSON.stringify(cuts));
  await cdp.eval(`window.scrollTo(0,0);true`);await sleep(250);await shot('16-final-15.png');
  await cdp.eval(`(()=>{const ids=[...GCC.state.teams[GCC.state.userClub.abbr]];while(GCC.state.teams[GCC.state.userClub.abbr].length>15)Dynasty.cutPlayer(GCC.state.teams[GCC.state.userClub.abbr][0]);Dynasty.finishOffseason();return true})()`);
  const readyState=await cdp.eval(`(()=>({phase:GCC.state.dynasty.offseason?.phase,main:(document.getElementById('dynastyMain')?.innerText||'').trim()}))()`);
  assert(readyState.phase==='ready'&&/The 15 are lodged/.test(readyState.main)&&/Form carries over lightly; selection starts again/.test(readyState.main),'Pre-season language gate failed',JSON.stringify(readyState));
  await cdp.eval(`window.scrollTo(0,0);true`);await sleep(250);await shot('17-preseason-ready.png');

  await cdp.eval(`Dynasty.enterTeamRoom();true`);
  const team2009=await cdp.eval(`(()=>({title:document.querySelector('#team .section-head h2')?.textContent.trim(),intro:document.querySelector('#team .section-head p')?.textContent.trim()}))()`);
  assert(team2009.title==='Name your 2009 XI'&&/Name the eleven that opens 2009/.test(team2009.intro)&&/form, fitness and conditions/.test(team2009.intro),'2009 Team Room language gate failed',JSON.stringify(team2009));


  // 2009: manual XI ownership and save/resume.
  const xi2009=await cdp.eval(`(()=>{const ids=[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>(GCC.state.pool.find(p=>p.id===b)?.overall||0)-(GCC.state.pool.find(p=>p.id===a)?.overall||0));for(const id of ids){if(GCC.state.xi.length>=11)break;GCC.toggleXI(id)}return{xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],rows:document.querySelectorAll('#xiList .xi-row').length,recommend:[...document.querySelectorAll('#team button')].some(x=>/RECOMMENDED XI/i.test(x.textContent||'')),startDisabled:document.getElementById('startSeasonButton')?.disabled,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(xi2009.xi.length===11&&xi2009.order.length===11&&new Set(xi2009.xi).size===11&&xi2009.rows===15&&!xi2009.recommend&&!xi2009.startDisabled&&xi2009.overflow<=1,'2009 manual XI failed',JSON.stringify(xi2009));
  await shot('18-2009-xi.png');

  const season2009=await cdp.eval(`(()=>{GCC.startSeason();return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,round:GCC.state.round,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],rounds:GCC.state.fullSchedule.length,nav:[...document.querySelectorAll('#nav button')].map(x=>x.textContent.trim()),views:[...document.querySelectorAll('.season-view-button')].map(x=>x.textContent.trim()),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(season2009.screen==='season'&&season2009.year===2009&&season2009.round===0&&season2009.xi.length===11&&season2009.order.length===11&&season2009.rounds===14&&season2009.overflow<=1,'2009 season handoff failed',JSON.stringify(season2009));
  const round1_2009=await cdp.eval(`(()=>{GCC.playNextRound();return{round:GCC.state.round,results:GCC.state.results.length,screen:document.querySelector('.screen.active')?.id}})()`);
  assert(round1_2009.round===1&&round1_2009.results===1&&round1_2009.screen==='season','2009 Round 1 failed',JSON.stringify(round1_2009));

  const seasonSnapshot=await cdp.eval(`(()=>({year:GCC.state.year,round:GCC.state.round,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)}))()`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();await sleep(250);
  const launcher2009=await cdp.eval(`(()=>({continueHidden:document.getElementById('launcherContinue')?.hidden,label:document.getElementById('launcherContinue')?.textContent.trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(!launcher2009.continueHidden&&/^CONTINUE /.test(launcher2009.label)&&launcher2009.overflow<=1,'2009 season reload launcher failed',JSON.stringify(launcher2009));
  const seasonResume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,round:GCC.state.round,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)}})()`);
  assert(seasonResume.screen==='season'&&seasonResume.year===2009&&seasonResume.round===seasonSnapshot.round&&JSON.stringify(seasonResume.xi)===JSON.stringify(seasonSnapshot.xi)&&JSON.stringify(seasonResume.order)===JSON.stringify(seasonSnapshot.order)&&JSON.stringify(seasonResume.roster)===JSON.stringify(seasonSnapshot.roster),'2009 season reload did not preserve XI state',JSON.stringify({seasonSnapshot,seasonResume}));

  // Case A: bench cover exists. Fast sim must stop before silently changing the XI.
  const benchInjury=await cdp.eval(`(()=>{const injured=GCC.state.xi.find(id=>{const p=GCC.state.pool.find(x=>x.id===id);return p&&p.role!=='WK-BAT'})||GCC.state.xi[0];const bench=GCC.state.teams[GCC.state.userClub.abbr].find(id=>!GCC.state.xi.includes(id));window.__goldenBench={injured,bench,before:[...GCC.state.xi]};GCC.state.dynasty.injuries={[injured]:{status:'OUT',roundsLeft:2,type:'calf tightness'}};GCC.simulateSeason();return{injured,bench,before:window.__goldenBench.before,after:[...GCC.state.xi],screen:document.querySelector('.screen.active')?.id,round:GCC.state.round,lead:document.getElementById('selectionLead')?.textContent.trim(),quick:document.getElementById('quickStartSeasonButton')?.textContent.trim(),start:document.getElementById('startSeasonButton')?.textContent.trim()}})()`);
  assert(benchInjury.injured&&benchInjury.bench&&benchInjury.screen==='team'&&benchInjury.round===1&&JSON.stringify(benchInjury.before)===JSON.stringify(benchInjury.after)&&/out/i.test(benchInjury.lead)&&benchInjury.quick==='CHANGE REQUIRED'&&benchInjury.start==='CHANGE REQUIRED','Bench-cover injury did not interrupt cleanly',JSON.stringify(benchInjury));
  await shot('19-2009-injury-interruption.png');

  const benchRepair=await cdp.eval(`(()=>{const x=window.__goldenBench;GCC.beginSwap(x.bench);GCC.replaceXI(x.injured);GCC.startSeason();return{screen:document.querySelector('.screen.active')?.id,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],hasBench:GCC.state.xi.includes(x.bench),hasInjured:GCC.state.xi.includes(x.injured)}})()`);
  assert(benchRepair.screen==='season'&&benchRepair.xi.length===11&&benchRepair.order.length===11&&benchRepair.hasBench&&!benchRepair.hasInjured,'User-owned bench repair failed',JSON.stringify(benchRepair));
  await shot('20-2009-injury-repaired.png');
  await cdp.eval(`(()=>{const x=window.__goldenBench;if(GCC.state.dynasty.injuries[x.injured])GCC.state.dynasty.injuries[x.injured].roundsLeft=1;GCC.playNextRound();return true})()`);

  // Case B: one XI player plus all four bench players are unavailable, leaving only ten healthy contracted players.
  const coverNeed=await cdp.eval(`(()=>{const roster=[...GCC.state.teams[GCC.state.userClub.abbr]],main=GCC.state.xi[0],bench=roster.filter(id=>!GCC.state.xi.includes(id));if(bench.length!==4)return{ok:false,bench:bench.length};const injuries={[main]:{status:'OUT',roundsLeft:4,type:'hamstring strain'}};for(const id of bench)injuries[id]={status:'OUT',roundsLeft:3,type:'unavailable'};GCC.state.dynasty.injuries=injuries;const healthy=roster.filter(id=>!injuries[id]).length;window.__goldenCover={main};return{ok:healthy===10,main,bench,healthy,unavailable:Object.keys(injuries).length,round:GCC.state.round}})()`);
  assert(coverNeed.ok&&coverNeed.healthy===10&&coverNeed.unavailable===5,'Could not establish legitimate temporary-cover case',JSON.stringify(coverNeed));

  const coverMarket=await cdp.eval(`(()=>{const x=window.__goldenCover;Dynasty.openReplacementMarket(x.main);const btn=document.querySelector('.market-player button');const nums=((btn?.getAttribute('onclick')||'').match(/\\d+/g)||[]).map(Number);if(nums.length>=2)x.replacement=nums[1];return{open:document.getElementById('modal')?.classList.contains('open'),cards:document.querySelectorAll('.market-player').length,injured:nums.length>=2?nums[0]:null,replacement:nums.length>=2?nums[1]:null,text:(document.getElementById('modalBody')?.innerText||'').trim()}})()`);
  assert(coverMarket.open&&coverMarket.cards>0&&coverMarket.injured===coverNeed.main&&coverMarket.replacement&&/cover|temporary|returns to the player pool/i.test(coverMarket.text),'Temporary-cover market failed',JSON.stringify(coverMarket));
  await shot('21-2009-replacement-market.png');

  const coverSigned=await cdp.eval(`(()=>{const x=window.__goldenCover;Dynasty.signReplacement(x.main,x.replacement);const d=GCC.state.dynasty,rep=GCC.state.pool.find(p=>p.id===x.replacement);return{mapped:d.replacementFor[x.main],reverse:d.replacementOf[x.replacement],roster:GCC.state.teams[GCC.state.userClub.abbr].length,replacementFlag:!!rep?.dynastyReplacement}})()`);
  assert(coverSigned.mapped===coverMarket.replacement&&coverSigned.reverse===coverNeed.main&&coverSigned.roster===16&&coverSigned.replacementFlag,'Temporary cover signing failed',JSON.stringify(coverSigned));

  const coverXI=await cdp.eval(`(()=>{const x=window.__goldenCover;GCC.beginSwap(x.replacement);GCC.replaceXI(x.main);GCC.state.dynasty.injuries[x.main].roundsLeft=1;GCC.startSeason();return{screen:document.querySelector('.screen.active')?.id,xi:GCC.state.xi.length,hasReplacement:GCC.state.xi.includes(x.replacement),hasInjured:GCC.state.xi.includes(x.main)}})()`);
  assert(coverXI.screen==='season'&&coverXI.xi===11&&coverXI.hasReplacement&&!coverXI.hasInjured,'Temporary cover could not enter XI',JSON.stringify(coverXI));

  const coverReturn=await cdp.eval(`(()=>{const x=window.__goldenCover;GCC.playNextRound();const d=GCC.state.dynasty,rep=GCC.state.pool.find(p=>p.id===x.replacement);return{round:GCC.state.round,injury:d.injuries[x.main]||null,mapped:d.replacementFor[x.main]||null,reverse:d.replacementOf[x.replacement]||null,roster:GCC.state.teams[GCC.state.userClub.abbr].length,repInRoster:GCC.state.teams[GCC.state.userClub.abbr].includes(x.replacement),mainInXI:GCC.state.xi.includes(x.main),repInXI:GCC.state.xi.includes(x.replacement),replacementFlag:!!rep?.dynastyReplacement,xi:GCC.state.xi.length,order:GCC.state.battingOrder.length}})()`);
  assert(coverReturn.injury==null&&coverReturn.mapped==null&&coverReturn.reverse==null&&coverReturn.roster===15&&!coverReturn.repInRoster&&coverReturn.mainInXI&&!coverReturn.repInXI&&!coverReturn.replacementFlag&&coverReturn.xi===11&&coverReturn.order===11,'Temporary cover return lifecycle failed',JSON.stringify(coverReturn));
  await shot('22-2009-cover-returned.png');

  // Advance deterministically to Round 7 and exercise a deliberate trade decision.
  let midGuard=0;
  while((await cdp.eval(`GCC.state.round`))<7&&midGuard++<10){
    await cdp.eval(`GCC.state.dynasty.injuries={};GCC.state.dynasty.replacementFor={};GCC.state.dynasty.replacementOf={};GCC.playNextRound();true`);
  }
  const round7=await cdp.eval(`(()=>({round:GCC.state.round,done:!!GCC.state.dynasty.midseasonDone[2009],buttons:[...document.querySelectorAll('#dynastySeasonStrip button')].map(x=>x.textContent.trim()),strip:(document.getElementById('dynastySeasonStrip')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(round7.round===7&&!round7.done&&round7.buttons.includes('OPEN TRADE WINDOW')&&/Trade window open/.test(round7.strip)&&round7.overflow<=1,'Round 7 trade window failed',JSON.stringify(round7));
  await shot('23-2009-round7.png');

  const midOpen=await cdp.eval(`(()=>{Dynasty.openMidseasonMarket();return{modal:document.getElementById('modal')?.classList.contains('open'),clubs:document.querySelectorAll('#tradeClub option').length,targets:document.querySelectorAll('#tradeTarget option').length,offers:document.querySelectorAll('#tradeOffer option').length,pick:!!document.getElementById('tradePick')}})()`);
  assert(midOpen.modal&&midOpen.clubs===7&&midOpen.targets>0&&midOpen.offers>0&&!midOpen.pick,'Mid-season Trade Centre failed',JSON.stringify(midOpen));
  await cdp.eval(`GCC.closeModal();GCC.renderSeason();true`);
  const midCancel=await cdp.eval(`(()=>({done:!!GCC.state.dynasty.midseasonDone[2009],buttons:[...document.querySelectorAll('#dynastySeasonStrip button')].map(x=>x.textContent.trim())}))()`);
  assert(!midCancel.done&&midCancel.buttons.includes('OPEN TRADE WINDOW'),'Inspecting trade window consumed it',JSON.stringify(midCancel));

  await cdp.eval(`Dynasty.openMidseasonMarket();true`);
  const acceptedTrade=await cdp.eval(`(()=>{const clubEl=document.getElementById('tradeClub'),offerEl=document.getElementById('tradeOffer');const offerIds=[...offerEl.options].map(o=>Number(o.value)).sort((a,b)=>Number(GCC.state.xi.includes(a))-Number(GCC.state.xi.includes(b)));const before=GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length;for(const offerId of offerIds){offerEl.value=String(offerId);for(let ci=0;ci<clubEl.options.length;ci++){clubEl.selectedIndex=ci;Dynasty.refreshTradeTarget();const targetEl=document.getElementById('tradeTarget');for(let ti=targetEl.options.length-1;ti>=0;ti--){targetEl.selectedIndex=ti;const offer=Number(offerEl.value),target=Number(targetEl.value),club=clubEl.value,offerWasXI=GCC.state.xi.includes(offer);Dynasty.proposeTrade(true);if(document.getElementById('tradeRead')?.classList.contains('good')){window.__goldenTrade={offer,target,club,offerWasXI,before};return{accepted:true,offer,target,club,offerWasXI,before}}}}return{accepted:false,before}})()`);
  assert(acceptedTrade.accepted,'No valid mid-season trade could be completed',JSON.stringify(acceptedTrade));
  await sleep(800);

  let tradeState=await cdp.eval(`(()=>{const all=Object.values(GCC.state.teams).flat();return{done:!!GCC.state.dynasty.midseasonDone[2009],modal:document.getElementById('modal')?.classList.contains('open'),trades:GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length,total:all.length,unique:new Set(all).size,roster:GCC.state.teams[GCC.state.userClub.abbr].length,xi:GCC.state.xi.length,screen:document.querySelector('.screen.active')?.id}})()`);
  assert(tradeState.done&&!tradeState.modal&&tradeState.trades===acceptedTrade.before+1&&tradeState.total===tradeState.unique&&tradeState.roster===15,'Accepted trade corrupted ownership/state',JSON.stringify({acceptedTrade,tradeState}));
  if(tradeState.xi<11){
    const repair=await cdp.eval(`(()=>{const id=GCC.state.teams[GCC.state.userClub.abbr].find(x=>!GCC.state.xi.includes(x));if(id)GCC.toggleXI(id);return{xi:GCC.state.xi.length,order:GCC.state.battingOrder.length}})()`);
    assert(repair.xi===11&&repair.order===11,'Post-trade XI repair failed',JSON.stringify(repair));
    await cdp.eval(`GCC.startSeason();true`);
  }
  await shot('24-2009-trade-complete.png');

  const tradeSnap=await cdp.eval(`(()=>({round:GCC.state.round,roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b),xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],trades:GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length,done:!!GCC.state.dynasty.midseasonDone[2009]}))()`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const tradeResume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();return{screen:document.querySelector('.screen.active')?.id,round:GCC.state.round,roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b),xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],trades:GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length,done:!!GCC.state.dynasty.midseasonDone[2009]}})()`);
  assert(tradeResume.round===tradeSnap.round&&JSON.stringify(tradeResume.roster)===JSON.stringify(tradeSnap.roster)&&JSON.stringify(tradeResume.xi)===JSON.stringify(tradeSnap.xi)&&JSON.stringify(tradeResume.order)===JSON.stringify(tradeSnap.order)&&tradeResume.trades===tradeSnap.trades&&tradeResume.done,'Mid-season trade save/resume failed',JSON.stringify({tradeSnap,tradeResume}));

  // Finish 2009.
  let finishGuard=0;
  while((await cdp.eval(`GCC.state.round`))<14&&finishGuard++<12){
    await cdp.eval(`GCC.state.dynasty.injuries={};GCC.state.dynasty.replacementFor={};GCC.state.dynasty.replacementOf={};GCC.playNextRound();true`);
  }
  const regular2009=await cdp.eval(`(()=>({year:GCC.state.year,round:GCC.state.round,position:GCC.state.regularSeasonPosition,qualified:(GCC.state.regularSeasonPosition||99)<=4,results:GCC.state.results.length}))()`);
  assert(regular2009.year===2009&&regular2009.round===14&&regular2009.results===14,'2009 regular season failed',JSON.stringify(regular2009));

  if(regular2009.qualified){
    await cdp.eval(`GCC.proceedPostSeason();true`);
    if(await cdp.eval(`document.getElementById('modal')?.classList.contains('open')`))await cdp.eval(`GCC.enterFinalsFromModal();true`);
    let stage=await cdp.eval(`GCC.state.finals?.stage`);
    if(stage==='ready')await cdp.eval(`GCC.simulateFinals();true`);
    stage=await cdp.eval(`GCC.state.finals?.stage`);
    if(stage==='semis')await cdp.eval(`GCC.advanceFinals();true`);
    stage=await cdp.eval(`GCC.state.finals?.stage`);
    if(stage==='gf-ready')await cdp.eval(`GCC.simulateFinals();true`);
    await sleep(700);await cdp.eval(`GCC.closeModal();GCC.openSeasonReview();true`);
  }else{
    await cdp.eval(`GCC.proceedPostSeason();true`);
  }
  const review2009=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,title:document.getElementById('reviewTitle')?.textContent.trim(),footer:[...document.querySelectorAll('#review .review-footer button')].map(x=>x.textContent.trim()),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(review2009.screen==='review'&&review2009.year===2009&&review2009.title&&review2009.footer.some(x=>/CONTINUE DYNASTY/.test(x))&&review2009.overflow<=1,'2009 Review failed',JSON.stringify(review2009));
  await shot('25-2009-review.png');

  // 2010: repeat annual Draft, Final 15, XI and early season.
  const market2010=await cdp.eval(`(()=>{Dynasty.beginOffseason();const all=Object.values(GCC.state.teams).flat();return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,phase:GCC.state.dynasty.offseason?.phase,total:all.length,unique:new Set(all).size,timeline:document.querySelectorAll('#dynastyTimeline .dynasty-step').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(market2010.screen==='dynasty'&&market2010.year===2010&&market2010.phase==='market'&&market2010.total===market2010.unique&&market2010.timeline===5&&market2010.overflow<=1,'2010 offseason failed',JSON.stringify(market2010));
  await shot('26-2010-market.png');
  await cdp.eval(`Dynasty.runCpuMarket();Dynasty.drawDraftOrder();Dynasty.startAnnualDraft();true`);

  async function makeAnnualPick(){
    return cdp.eval(`(()=>{const card=document.querySelector('#annualDraftPlayers .player-card');if(!card)return null;const m=(card.getAttribute('onclick')||'').match(/userAnnualDraft\\\\((\\\\d+)\\\\)/);if(!m)return null;const id=Number(m[1]),before=GCC.state.dynasty.offseason.pickCursor;Dynasty.userAnnualDraft(id);return{id,before,after:GCC.state.dynasty.offseason.pickCursor,phase:GCC.state.dynasty.offseason.phase,picks:GCC.state.dynasty.offseason.picks.length}})()`);
  }
  let first2010=await makeAnnualPick();
  if(!first2010){await cdp.eval(`Dynasty.runCpuDraftUntilUser();true`);first2010=await makeAnnualPick()}
  assert(first2010&&first2010.after>first2010.before,'2010 first Draft pick failed',JSON.stringify(first2010));

  const draft2010Snap=await cdp.eval(`(()=>({cursor:GCC.state.dynasty.offseason.pickCursor,picks:JSON.stringify(GCC.state.dynasty.offseason.picks),roster:JSON.stringify([...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b))}))()`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const draft2010Resume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const o=GCC.state.dynasty.offseason;return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,phase:o?.phase,cursor:o?.pickCursor,picks:JSON.stringify(o?.picks||[]),roster:JSON.stringify([...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)),cards:document.querySelectorAll('#annualDraftPlayers .player-card').length}})()`);
  assert(draft2010Resume.screen==='dynasty'&&draft2010Resume.year===2010&&draft2010Resume.phase==='draft'&&draft2010Resume.cursor===draft2010Snap.cursor&&draft2010Resume.picks===draft2010Snap.picks&&draft2010Resume.roster===draft2010Snap.roster&&draft2010Resume.cards===24,'2010 Draft reload failed',JSON.stringify({draft2010Snap,draft2010Resume}));

  let draftGuard2010=0;
  while((await cdp.eval(`GCC.state.dynasty.offseason?.phase`))==='draft'&&draftGuard2010++<40){
    const p=await makeAnnualPick();
    if(!p)await cdp.eval(`Dynasty.runCpuDraftUntilUser();true`);
  }
  const draft2010Done=await cdp.eval(`(()=>{const o=GCC.state.dynasty.offseason,all=Object.values(GCC.state.teams).flat();return{phase:o.phase,complete:o.draftComplete,picks:o.picks.length,userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,total:all.length,unique:new Set(all).size}})()`);
  assert(draft2010Done.phase==='cuts'&&draft2010Done.complete&&draft2010Done.total===draft2010Done.unique&&draft2010Done.userRoster>=15,'2010 Draft completion failed',JSON.stringify(draft2010Done));
  await shot('27-2010-final15.png');

  let cutGuard2010=0;
  while((await cdp.eval(`GCC.state.teams[GCC.state.userClub.abbr].length`))>15&&cutGuard2010++<12){
    const id=await cdp.eval(`(()=>{const rows=[...document.querySelectorAll('.cut-row')].filter(x=>x.querySelector('button'));if(!rows.length)return null;rows.sort((a,b)=>Number(a.querySelector('strong')?.textContent||999)-Number(b.querySelector('strong')?.textContent||999));const m=(rows[0].querySelector('button')?.getAttribute('onclick')||'').match(/cutPlayer\\\\((\\\\d+)\\\\)/);return m?Number(m[1]):null})()`);
    assert(id,'2010 Final 15 has no releasable player');
    await cdp.eval(`Dynasty.cutPlayer(`+id+`);true`);
  }
  const pre2010=await cdp.eval(`(()=>{Dynasty.finishOffseason();return{year:GCC.state.year,phase:GCC.state.dynasty.offseason?.phase,n:GCC.state.teams[GCC.state.userClub.abbr].length,main:(document.getElementById('dynastyMain')?.innerText||'').trim()}})()`);
  assert(pre2010.year===2010&&pre2010.phase==='ready'&&pre2010.n===15&&/The 15 are lodged/.test(pre2010.main),'2010 Pre-season failed',JSON.stringify(pre2010));

  await cdp.eval(`Dynasty.enterTeamRoom();true`);
  const team2010=await cdp.eval(`(()=>{const ids=[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>(GCC.state.pool.find(p=>p.id===b)?.overall||0)-(GCC.state.pool.find(p=>p.id===a)?.overall||0));for(const id of ids){if(GCC.state.xi.length>=11)break;GCC.toggleXI(id)}return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,title:document.querySelector('#team .section-head h2')?.textContent.trim(),xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],rows:document.querySelectorAll('#xiList .xi-row').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(team2010.screen==='team'&&team2010.year===2010&&/2010 XI/.test(team2010.title)&&team2010.xi.length===11&&team2010.order.length===11&&team2010.rows===15&&team2010.overflow<=1,'2010 Team Room repetition failed',JSON.stringify(team2010));
  await shot('28-2010-xi.png');

  const season2010=await cdp.eval(`(()=>{GCC.startSeason();for(let i=0;i<3;i++){GCC.state.dynasty.injuries={};GCC.playNextRound()}return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,round:GCC.state.round,results:GCC.state.results.length,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],nav:[...document.querySelectorAll('#nav button')].map(x=>x.textContent.trim()),views:[...document.querySelectorAll('.season-view-button')].map(x=>x.textContent.trim()),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(season2010.screen==='season'&&season2010.year===2010&&season2010.round===3&&season2010.results===3&&season2010.xi.length===11&&season2010.order.length===11&&season2010.overflow<=1,'2010 repeated season failed',JSON.stringify(season2010));
  assert(JSON.stringify(season2010.nav)===JSON.stringify(season2009.nav)&&JSON.stringify(season2010.views)===JSON.stringify(season2009.views),'Season shell changed between 2009 and 2010',JSON.stringify({season2009,season2010}));
  await shot('29-2010-round3.png');

  const season2010Snap=await cdp.eval(`(()=>({round:GCC.state.round,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)}))()`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();await sleep(250);
  const finalLauncher=await cdp.eval(`(()=>({label:document.getElementById('launcherContinue')?.textContent.trim(),hidden:document.getElementById('launcherContinue')?.hidden,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(!finalLauncher.hidden&&/^CONTINUE /.test(finalLauncher.label)&&finalLauncher.overflow<=1,'2010 continue launcher failed',JSON.stringify(finalLauncher));
  await shot('30-2010-continue-launcher.png');

  const season2010Resume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,round:GCC.state.round,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)}})()`);
  assert(season2010Resume.screen==='season'&&season2010Resume.year===2010&&season2010Resume.round===season2010Snap.round&&JSON.stringify(season2010Resume.xi)===JSON.stringify(season2010Snap.xi)&&JSON.stringify(season2010Resume.order)===JSON.stringify(season2010Snap.order)&&JSON.stringify(season2010Resume.roster)===JSON.stringify(season2010Snap.roster),'2010 season reload failed',JSON.stringify({season2010Snap,season2010Resume}));

  const integrity=await cdp.eval(`(()=>{const all=Object.values(GCC.state.teams).flat(),user=GCC.state.teams[GCC.state.userClub.abbr],xi=GCC.state.xi,order=GCC.state.battingOrder;return{total:all.length,unique:new Set(all).size,userRoster:user.length,userUnique:new Set(user).size,xi:xi.length,xiUnique:new Set(xi).size,order:order.length,orderUnique:new Set(order).size,orderMatches:order.every(id=>xi.includes(id))&&xi.every(id=>order.includes(id)),year:GCC.state.year,round:GCC.state.round}})()`);
  assert(integrity.total===integrity.unique&&integrity.userRoster===15&&integrity.userUnique===15&&integrity.xi===11&&integrity.xiUnique===11&&integrity.order===11&&integrity.orderUnique===11&&integrity.orderMatches&&integrity.year===2010&&integrity.round===3,'Golden Dynasty final integrity failed',JSON.stringify(integrity));

  const classifications={
    KEEP:['2008 foundation flow','manual XI ownership and direct bench repair','temporary replacement lifecycle','annual Draft canonical recruitment room','Final 15 user-owned cuts','Season Hub / Finals / Review hierarchy','v7.3.3 launcher and visual identity'],
    CONSOLIDATE:['Trade evaluation language and list-needs logic should continue sharing one valuation model'],
    REBUILD:[],
    CUT:[]
  };
  const report={parentSha:'88c1c2b21ae7593d77b94babfda74e8df247e1f1e13be7f5de89a80abe62f650',clubs,signing,draw,draft,team,season,innings,finals,review,market,trade,lottery,annual,cuts,readyState,team2009,xi2009,season2009,seasonSnapshot,seasonResume,benchInjury,benchRepair,coverNeed,coverMarket,coverSigned,coverXI,coverReturn,round7,midOpen,midCancel,acceptedTrade,tradeState,tradeSnap,tradeResume,regular2009,review2009,market2010,first2010,draft2010Snap,draft2010Resume,draft2010Done,pre2010,team2010,season2010,season2010Snap,finalLauncher,season2010Resume,integrity,classifications,pageErrors:await cdp.eval(`window.__qaErrors||[]`),runtimeErrors,consoleErrors};
  await noErrors('v7.3.4 golden dynasty');
  fs.writeFileSync(path.join(OUT,'golden-report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));

} finally {
  cdp.close();try{proc.kill('SIGTERM')}catch{};await new Promise(r=>server.close(r));try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
