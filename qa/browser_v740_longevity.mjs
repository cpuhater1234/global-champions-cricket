import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_3_4_golden_dynasty.html');
const OUT=path.join(ROOT,'qa','output','v740-longevity');
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
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8788,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v740-longevity-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9245','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());
async function pageTarget(){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:9245/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1400))}
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
  async function navigate(){await cdp.call('Page.navigate',{url:'http://127.0.0.1:8788/game.html'});await ready()}
  async function shot(name){const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
  async function noErrors(stage){const page=await cdp.eval(`window.__qaErrors||[]`);assert(page.length===0,`${stage}: page errors`,JSON.stringify(page));assert(runtimeErrors.length===0,`${stage}: runtime errors`,JSON.stringify(runtimeErrors));assert(consoleErrors.length===0,`${stage}: console errors`,JSON.stringify(consoleErrors))}

  await viewport(1440,900);await navigate();
  await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);await cdp.call('Page.reload',{ignoreCache:true});await ready();

  const fresh=await cdp.eval(`(()=>{const L=document.getElementById('careerLauncher'),shell=document.querySelector('.launcher-shell'),mark=document.querySelector('.launcher-mark'),brand=document.querySelector('.brand-mark'),top=document.querySelector('.topbar'),nav=document.getElementById('nav'),k=document.querySelector('.launcher-kicker');const cs=x=>getComputedStyle(x);return{visible:!!L&&!L.hidden&&cs(L).display!=='none',shellTop:cs(shell).borderTopWidth,shellBottom:cs(shell).borderBottomWidth,kicker:cs(k).display,markW:Math.round(mark.getBoundingClientRect().width),markH:Math.round(mark.getBoundingClientRect().height),brandImg:brand.querySelectorAll('img').length,brandSvg:brand.querySelectorAll('svg.gcc-brand-symbol').length,brandBg:cs(brand).backgroundColor,brandBorder:cs(brand).borderTopWidth,newBg:cs(document.getElementById('launcherNew')).backgroundColor,continueBg:cs(document.getElementById('launcherContinue')).backgroundColor,stamp:document.getElementById('seasonStamp')?.textContent.trim(),navHidden:nav.hidden,nav:[...nav.querySelectorAll('button')].map(x=>x.textContent.trim()),topAfter:getComputedStyle(top,'::after').display,topBorder:cs(top).borderBottomWidth,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(fresh.visible&&fresh.shellTop==='0px'&&fresh.shellBottom==='0px'&&fresh.kicker==='none'&&fresh.markW===58&&fresh.markH===52&&fresh.brandImg===0&&fresh.brandSvg===1&&fresh.brandBorder==='0px'&&fresh.newBg===fresh.continueBg&&fresh.stamp==='2008'&&!fresh.navHidden&&fresh.nav.includes('World')&&fresh.topAfter==='none'&&fresh.topBorder==='1px'&&fresh.overflow<=1,'Fresh launcher visual gate failed',JSON.stringify(fresh));
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
  assert(review.screen==='review'&&/WHAT HELD UP/.test(review.strength)&&/What you can trust/.test(review.strength)&&((/NEXT SEASON/.test(review.weak)&&/(The first fix|Where to improve)/.test(review.weak))||(/FINE MARGINS/.test(review.weak)&&/Small gains/.test(review.weak)))&&/SEASON BOOK/.test(review.book)&&review.overflow<=1,'Season Review regression gate failed',JSON.stringify(review));
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
  const acceptedTrade=await cdp.eval(`(()=>{const clubEl=document.getElementById('tradeClub'),offerEl=document.getElementById('tradeOffer');const offerIds=[...offerEl.options].map(o=>Number(o.value)).sort((a,b)=>Number(GCC.state.xi.includes(a))-Number(GCC.state.xi.includes(b)));const before=GCC.state.dynasty.transactions.filter(x=>x.year===2009&&x.type==='TRADE').length;for(const offerId of offerIds){offerEl.value=String(offerId);for(let ci=0;ci<clubEl.options.length;ci++){clubEl.selectedIndex=ci;Dynasty.refreshTradeTarget();const targetEl=document.getElementById('tradeTarget');for(let ti=targetEl.options.length-1;ti>=0;ti--){targetEl.selectedIndex=ti;const offer=Number(offerEl.value),target=Number(targetEl.value),club=clubEl.value,offerWasXI=GCC.state.xi.includes(offer);Dynasty.proposeTrade(true);if(document.getElementById('tradeRead')?.classList.contains('good')){window.__goldenTrade={offer,target,club,offerWasXI,before};return{accepted:true,offer,target,club,offerWasXI,before};}}}}return{accepted:false,before};})()`);
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
    return cdp.eval(`(()=>{const card=document.querySelector('#annualDraftPlayers .player-card');if(!card){const o=GCC.state.dynasty.offseason;window.__goldenNoCard={year:GCC.state.year,phase:o?.phase,cursor:o?.pickCursor,picks:o?.picks?.length||0,lottery:[...(o?.lottery||[])],user:GCC.state.userClub?.abbr,main:(document.getElementById('dynastyMain')?.innerText||'').slice(0,1600),cards:document.querySelectorAll('#annualDraftPlayers .player-card').length};return null}const nums=((card.getAttribute('onclick')||'').match(/\\d+/g)||[]).map(Number);if(!nums.length){window.__goldenNoCard={onclick:card.getAttribute('onclick'),reason:'unparsed-card'};return null}const id=nums[0],before=GCC.state.dynasty.offseason.pickCursor;Dynasty.userAnnualDraft(id);return{id,before,after:GCC.state.dynasty.offseason.pickCursor,phase:GCC.state.dynasty.offseason.phase,picks:GCC.state.dynasty.offseason.picks.length}})()`);
  }
  let first2010=await makeAnnualPick();
  if(!first2010){await cdp.eval(`Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();true`);first2010=await makeAnnualPick()}
  const noCard2010=first2010?null:await cdp.eval(`window.__goldenNoCard||null`);assert(first2010&&first2010.after>first2010.before,'2010 first Draft pick failed',JSON.stringify({first2010,noCard2010}));

  const draft2010Snap=await cdp.eval(`(()=>({cursor:GCC.state.dynasty.offseason.pickCursor,picks:JSON.stringify(GCC.state.dynasty.offseason.picks),roster:JSON.stringify([...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b))}))()`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const draft2010Resume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const o=GCC.state.dynasty.offseason;return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,phase:o?.phase,cursor:o?.pickCursor,picks:JSON.stringify(o?.picks||[]),roster:JSON.stringify([...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)),cards:document.querySelectorAll('#annualDraftPlayers .player-card').length}})()`);
  assert(draft2010Resume.screen==='dynasty'&&draft2010Resume.year===2010&&draft2010Resume.phase==='draft'&&draft2010Resume.cursor===draft2010Snap.cursor&&draft2010Resume.picks===draft2010Snap.picks&&draft2010Resume.roster===draft2010Snap.roster&&draft2010Resume.cards===24,'2010 Draft reload failed',JSON.stringify({draft2010Snap,draft2010Resume}));

  let draftGuard2010=0;
  while((await cdp.eval(`GCC.state.dynasty.offseason?.phase`))==='draft'&&draftGuard2010++<40){
    const p=await makeAnnualPick();
    if(!p)await cdp.eval(`Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();true`);
  }
  const draft2010Done=await cdp.eval(`(()=>{const o=GCC.state.dynasty.offseason,all=Object.values(GCC.state.teams).flat();return{phase:o.phase,complete:o.draftComplete,picks:o.picks.length,userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,total:all.length,unique:new Set(all).size}})()`);
  assert(draft2010Done.phase==='cuts'&&draft2010Done.complete&&draft2010Done.total===draft2010Done.unique&&draft2010Done.userRoster>=15,'2010 Draft completion failed',JSON.stringify(draft2010Done));
  await shot('27-2010-final15.png');

  let cutGuard2010=0;
  while((await cdp.eval(`GCC.state.teams[GCC.state.userClub.abbr].length`))>15&&cutGuard2010++<12){
    const id=await cdp.eval(`(()=>{const rows=[...document.querySelectorAll('.cut-row')].filter(x=>x.querySelector('button'));if(!rows.length)return null;rows.sort((a,b)=>Number(a.querySelector('strong')?.textContent||999)-Number(b.querySelector('strong')?.textContent||999));const nums=((rows[0].querySelector('button')?.getAttribute('onclick')||'').match(/\\d+/g)||[]).map(Number);return nums.length?nums[0]:null})()`);
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
  const finalLauncher=await cdp.eval(`(()=>{const nav=document.getElementById('nav');return{label:document.getElementById('launcherContinue')?.textContent.trim(),hidden:document.getElementById('launcherContinue')?.hidden,stamp:document.getElementById('seasonStamp')?.textContent.trim(),navHidden:nav.hidden,nav:[...nav.querySelectorAll('button')].map(x=>x.textContent.trim()),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(!finalLauncher.hidden&&/^CONTINUE /.test(finalLauncher.label)&&finalLauncher.stamp==='2010'&&finalLauncher.navHidden&&finalLauncher.overflow<=1,'2010 continue launcher continuity failed',JSON.stringify(finalLauncher));
  await shot('30-2010-continue-launcher.png');

  const season2010Resume=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const nav=document.getElementById('nav');return{screen:document.querySelector('.screen.active')?.id,year:GCC.state.year,round:GCC.state.round,stamp:document.getElementById('seasonStamp')?.textContent.trim(),navHidden:nav.hidden,nav:[...nav.querySelectorAll('button')].map(x=>x.textContent.trim()),xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)}})()`);
  assert(season2010Resume.screen==='season'&&season2010Resume.year===2010&&season2010Resume.round===season2010Snap.round&&season2010Resume.stamp==='2010'&&!season2010Resume.navHidden&&JSON.stringify(season2010Resume.nav)===JSON.stringify(['SEASON','XI','ARCHIVE'])&&JSON.stringify(season2010Resume.xi)===JSON.stringify(season2010Snap.xi)&&JSON.stringify(season2010Resume.order)===JSON.stringify(season2010Snap.order)&&JSON.stringify(season2010Resume.roster)===JSON.stringify(season2010Snap.roster),'2010 season reload failed',JSON.stringify({season2010Snap,season2010Resume}));


  // v7.4 primary longevity audit: continue the proven Golden Dynasty through 2014.
  const longevity=[];

  async function repairAuditXI(){
    return cdp.eval(`(()=>{const s=GCC.state,d=s.dynasty||{},inj=d.injuries||{},roster=[...s.teams[s.userClub.abbr]];
      const out=id=>inj[id]?.status==='OUT';
      let guard=0;
      while(guard++<12){
        const bad=(s.xi||[]).find(id=>!roster.includes(id)||out(id));
        if(!bad)break;
        const bench=roster.find(id=>!(s.xi||[]).includes(id)&&!out(id));
        if(bench){GCC.beginSwap(bench);GCC.replaceXI(bad);continue}
        Dynasty.openReplacementMarket(bad);
        const btn=document.querySelector('.market-player button');
        const nums=((btn?.getAttribute('onclick')||'').match(/\\d+/g)||[]).map(Number);
        GCC.closeModal();
        if(nums.length<2)break;
        Dynasty.signReplacement(nums[0],nums[1]);
        const rep=nums[1];
        GCC.beginSwap(rep);GCC.replaceXI(bad);
        roster.splice(0,roster.length,...s.teams[s.userClub.abbr]);
      }
      while((s.xi||[]).length<11){
        const id=roster.find(x=>!s.xi.includes(x)&&!out(x));
        if(!id)break;
        GCC.toggleXI(id);
      }
      if((s.xi||[]).length===11&&((s.battingOrder||[]).length!==11||!s.battingOrder.every(id=>s.xi.includes(id))))GCC.autoOrderXI();
      return{year:s.year,round:s.round,xi:s.xi.length,order:s.battingOrder.length,outInXI:s.xi.filter(out).length,roster:s.teams[s.userClub.abbr].length}
    })()`);
  }

  async function balanceSnapshot(stage){
    return cdp.eval(`(()=>{const stage=${JSON.stringify(stage)},s=GCC.state,d=s.dynasty||{},allIds=Object.values(s.teams).flat(),used=new Set(allIds);
      const active=s.pool.filter(p=>!p.dynastyRetired&&p.available!==false&&(!p.dynastyCareer||((p.dynastyCareer.debutYear||0)<=s.year&&(p.dynastyCareer.exitYear??9999)>=s.year)));
      const keeper=p=>(p.keeping||0)>=65||p.role==='WK-BAT';
      const bowler=p=>(p.maxOvers||0)>=4||(p.bowl||0)>=65;
      const opener=p=>(p.preferredSlot||9)<=2&&(p.bat||0)>=70;
      const finisher=p=>(p.finishing||0)>=80;
      const teamRows=s.league.map(c=>{const ps=(s.teams[c.abbr]||[]).map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),vals=ps.map(p=>p.overall||0),ages=ps.map(p=>s.year-(p.birthYear||1990));return{abbr:c.abbr,n:ps.length,avg:+(vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length)).toFixed(2),max:Math.max(...vals,0),min:Math.min(...vals,99),keepers:ps.filter(keeper).length,bowlers:ps.filter(bowler).length,openers:ps.filter(opener).length,finishers:ps.filter(finisher).length,avgAge:+(ages.reduce((a,b)=>a+b,0)/Math.max(1,ages.length)).toFixed(2)}}).sort((a,b)=>b.avg-a.avg);
      const free=active.filter(p=>!used.has(p.id)&&!p.dynastyReplacement);
      const roles=xs=>({BAT:xs.filter(p=>p.role==='BAT').length,'WK-BAT':xs.filter(p=>p.role==='WK-BAT').length,AR:xs.filter(p=>p.role==='AR').length,BOWL:xs.filter(p=>p.role==='BOWL').length,keepers:xs.filter(keeper).length,bowlers:xs.filter(bowler).length,openers:xs.filter(opener).length,finishers:xs.filter(finisher).length});
      const forms={};for(let i=-3;i<=3;i++)forms[i]=s.pool.filter(p=>(p.form||0)===i&&!p.dynastyRetired).length;
      const probes=['Jos Buttler','Mitchell Starc','Glenn Maxwell','Pat Cummins','Chris Gayle','Shane Warne','Sachin Tendulkar'].map(name=>{const p=s.pool.find(x=>x.name===name);if(!p)return{name,missing:true};const owner=s.league.find(c=>(s.teams[c.abbr]||[]).includes(p.id))?.abbr||null;return{name,age:s.year-(p.birthYear||1990),overall:p.overall,bat:p.bat,bowl:p.bowl,power:p.power,pace:p.pace,control:p.control,variation:p.variation,fielding:p.fielding,keeping:p.keeping,form:p.form||0,value:Dynasty.tradeValue(p,s.userClub.abbr),retired:!!p.dynastyRetired,owner}}); 
      return{stage,year:s.year,round:s.round,total:allIds.length,unique:new Set(allIds).size,active:active.length,free:free.length,activeRoles:roles(active),freeRoles:roles(free),teams:teamRows,forms,probes,history:(d.history||[]).map(x=>({year:x.year,champion:x.champion,userPosition:x.userPosition,wins:x.wins,losses:x.losses,title:x.title}))}
    })()`);
  }

  async function seasonAuditAndReview(){
    let guard=0;
    while((await cdp.eval('GCC.state.round'))<14&&guard++<20){
      const repaired=await repairAuditXI();
      assert(repaired.xi===11&&repaired.order===11&&repaired.outInXI===0,'Longevity XI repair failed',JSON.stringify(repaired));
      await cdp.eval('GCC.playNextRound();true');
    }
    const audit=await cdp.eval(`(()=>{const s=GCC.state,d=s.dynasty||{},rows=Object.values(s.table||{}).sort((a,b)=>b.pts-a.pts||b.nrr-a.nrr),r=s.results||[];
      const innings=r.flatMap(x=>[x.homeInnings,x.awayInnings]).filter(Boolean);
      const cards=r.map(x=>x.scorecard).filter(Boolean);
      const batRows=cards.flatMap(sc=>[...(sc.home?.batting||[]),...(sc.away?.batting||[])]);
      const bowlRows=cards.flatMap(sc=>[...(sc.home?.bowling||[]),...(sc.away?.bowling||[])]);
      const avg=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:0;
      const yearTx=(d.transactions||[]).filter(x=>x.year===s.year);
      return{year:s.year,position:s.regularSeasonPosition,ladder:rows.map((x,i)=>({pos:i+1,abbr:x.club.abbr,w:x.w,l:x.l,pts:x.pts,nrr:+x.nrr.toFixed(3)})),userMatches:r.length,avgInnings:+avg(innings.map(x=>x.total||0)).toFixed(2),avgWickets:+avg(innings.map(x=>x.wickets||0)).toFixed(2),highest:Math.max(...innings.map(x=>x.total||0),0),lowest:Math.min(...innings.map(x=>x.total||0).filter(Boolean),999),sixes:batRows.reduce((a,x)=>a+(x.sixes||0),0),fours:batRows.reduce((a,x)=>a+(x.fours||0),0),fifties:batRows.filter(x=>(x.runs||0)>=50&&(x.runs||0)<100).length,hundreds:batRows.filter(x=>(x.runs||0)>=100).length,bowlEcon:+avg(bowlRows.filter(x=>(x.balls||0)>=6).map(x=>x.runs/Math.max(1,x.balls/6))).toFixed(2),injuries:yearTx.filter(x=>x.type==='INJURY').length,replacements:yearTx.filter(x=>x.type==='REPLACEMENT').length,trades:yearTx.filter(x=>x.type==='TRADE').length,formDist:Object.fromEntries([-3,-2,-1,0,1,2,3].map(v=>[v,s.pool.filter(p=>(p.form||0)===v&&!p.dynastyRetired).length]))}
    })()`);
    assert(audit.userMatches===14,'Longevity season did not complete 14 user matches',JSON.stringify(audit));
    const qualified=await cdp.eval('(GCC.state.regularSeasonPosition||99)<=4');
    if(qualified){
      await repairAuditXI();
      await cdp.eval('GCC.proceedPostSeason();true');
      if(await cdp.eval("document.getElementById('modal')?.classList.contains('open')"))await cdp.eval('GCC.enterFinalsFromModal();true');
      let stage=await cdp.eval('GCC.state.finals?.stage');
      if(stage==='ready')await cdp.eval('GCC.simulateFinals();true');
      stage=await cdp.eval('GCC.state.finals?.stage');
      if(stage==='semis')await cdp.eval('GCC.advanceFinals();true');
      stage=await cdp.eval('GCC.state.finals?.stage');
      if(stage==='gf-ready')await cdp.eval('GCC.simulateFinals();true');
      await sleep(650);await cdp.eval('GCC.closeModal();GCC.openSeasonReview();true');
    }else await cdp.eval('GCC.proceedPostSeason();true');
    audit.review=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,title:document.getElementById('reviewTitle')?.textContent.trim(),champion:GCC.state.champion?.abbr||GCC.state.finals?.gf?.winner?.abbr||null}))()`);
    return audit;
  }

  async function advanceOffseasonWithValueStrategy(){
    const before=await cdp.eval('GCC.state.year');
    await cdp.eval('Dynasty.beginOffseason();true');
    const market=await cdp.eval(`(()=>{const o=GCC.state.dynasty.offseason;return{year:GCC.state.year,phase:o.phase,retirements:o.retirements.length,arrivals:o.arrivals.length,roster:GCC.state.teams[GCC.state.userClub.abbr].length}})()`);
    assert(market.year===before+1&&market.phase==='market','Longevity offseason did not advance year',JSON.stringify(market));
    await cdp.eval('Dynasty.runCpuMarket();Dynasty.drawDraftOrder();Dynasty.startAnnualDraft();true');
    let dg=0;
    while((await cdp.eval("GCC.state.dynasty.offseason?.phase"))==='draft'&&dg++<50){
      const picked=await cdp.eval(`(()=>{const cards=[...document.querySelectorAll('#annualDraftPlayers .player-card')];if(!cards.length){Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();return false}const choices=cards.map(card=>{const nums=((card.getAttribute('onclick')||'').match(/\\d+/g)||[]).map(Number),id=nums[0],p=GCC.state.pool.find(x=>x.id===id);return{id,p,value:p?Dynasty.tradeValue(p,GCC.state.userClub.abbr):-999}}).filter(x=>x.id&&x.p).sort((a,b)=>b.value-a.value);if(!choices.length)return false;Dynasty.userAnnualDraft(choices[0].id);return true})()`);
      if(!picked)await cdp.eval('Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();true');
    }
    const draft=await cdp.eval(`(()=>{const o=GCC.state.dynasty.offseason;return{phase:o.phase,picks:o.picks.length,userPicks:o.picks.filter(x=>x.owner===GCC.state.userClub.abbr).map(x=>x.player),roster:GCC.state.teams[GCC.state.userClub.abbr].length}})()`);
    assert(draft.phase==='cuts','Longevity annual Draft did not reach cuts',JSON.stringify(draft));
    let cg=0;
    while((await cdp.eval('GCC.state.teams[GCC.state.userClub.abbr].length'))>15&&cg++<15){
      const id=await cdp.eval(`(()=>{const s=GCC.state,ids=[...s.teams[s.userClub.abbr]],ps=ids.map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),keep=p=>(p.keeping||0)>=65||p.role==='WK-BAT',bowl=p=>(p.maxOvers||0)>=4||(p.bowl||0)>=65;const k=ps.filter(keep).length,b=ps.filter(bowl).length;let cand=ps.filter(p=>!(k<=1&&keep(p))&&!(b<=6&&bowl(p))).sort((a,z)=>Dynasty.tradeValue(a,s.userClub.abbr)-Dynasty.tradeValue(z,s.userClub.abbr));if(!cand.length)cand=ps.slice().sort((a,z)=>Dynasty.tradeValue(a,s.userClub.abbr)-Dynasty.tradeValue(z,s.userClub.abbr));return cand[0]?.id||null})()`);
      assert(id,'Longevity Final 15 had no cut candidate');
      await cdp.eval('Dynasty.cutPlayer('+id+');true');
    }
    await cdp.eval('Dynasty.finishOffseason();Dynasty.enterTeamRoom();true');
    const xi=await cdp.eval(`(()=>{const s=GCC.state,ps=s.teams[s.userClub.abbr].map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),best=GCC.bestXI(ps).map(p=>p.id);GCC.clearXI();for(const id of best)GCC.toggleXI(id);if(s.battingOrder.length!==11)GCC.autoOrderXI();GCC.startSeason();return{year:s.year,xi:s.xi.length,order:s.battingOrder.length,roster:s.teams[s.userClub.abbr].length}})()`);
    assert(xi.roster===15&&xi.xi===11&&xi.order===11,'Longevity season XI setup failed',JSON.stringify(xi));
    return{market,draft,xi};
  }

  // Finish 2010 from the Golden Dynasty's Round 3 state, then continue through 2014.
  longevity.push({stage:'2010-round3',snapshot:await balanceSnapshot('2010-round3')});
  for(const targetYear of [2010,2011,2012,2013,2014]){
    assert((await cdp.eval('GCC.state.year'))===targetYear,'Longevity year mismatch before season '+targetYear);
    const before=await balanceSnapshot('pre-season-'+targetYear);
    const seasonAudit=await seasonAuditAndReview();
    const after=await balanceSnapshot('post-season-'+targetYear);
    const row={year:targetYear,before,season:seasonAudit,after};
    longevity.push(row);
    if(targetYear<2014){
      row.offseason=await advanceOffseasonWithValueStrategy();
      row.next=await balanceSnapshot('ready-'+(targetYear+1));
    }
  }

  const longIntegrity=await cdp.eval(`(()=>{const s=GCC.state,d=s.dynasty||{},all=Object.values(s.teams).flat(),badRatings=s.pool.filter(p=>['overall','bat','bowl','power','control','pace','fielding','keeping'].some(k=>Number.isFinite(Number(p[k]))&&(Number(p[k])<1||Number(p[k])>99))).map(p=>p.name);const retiredRostered=s.pool.filter(p=>p.dynastyRetired&&all.includes(p.id)).map(p=>p.name);return{year:s.year,round:s.round,total:all.length,unique:new Set(all).size,rosters:Object.fromEntries(s.league.map(c=>[c.abbr,(s.teams[c.abbr]||[]).length])),badRatings,retiredRostered,replacements:Object.keys(d.replacementOf||{}).length,history:(d.history||[]).length}})()`);
  assert(longIntegrity.year===2014&&longIntegrity.total===longIntegrity.unique&&Object.values(longIntegrity.rosters).every(n=>n===15)&&longIntegrity.badRatings.length===0&&longIntegrity.retiredRostered.length===0,'Longevity final integrity failed',JSON.stringify(longIntegrity));

  const longevityReport={testedSha:'ac7e0479d3c5fe4b5ae6d3648f71267d74e540af3b127f08e6decfe03d6bb9bc',strategy:'role-aware current/dynasty value',longevity,longIntegrity,pageErrors:await cdp.eval('window.__qaErrors||[]'),runtimeErrors,consoleErrors};
  fs.writeFileSync(path.join(OUT,'longevity-report.json'),JSON.stringify(longevityReport,null,2));
  console.log(JSON.stringify({years:longevity.filter(x=>x.year).map(x=>({year:x.year,position:x.season.position,champion:x.season.review.champion,avgInnings:x.season.avgInnings,injuries:x.season.injuries,trades:x.season.trades})),integrity:longIntegrity},null,2));

  await noErrors('v7.4 longevity audit');
  fs.writeFileSync(path.join(OUT,'longevity-golden-base.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));

} finally {
  cdp.close();try{proc.kill('SIGTERM')}catch{};await new Promise(r=>server.close(r));try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
