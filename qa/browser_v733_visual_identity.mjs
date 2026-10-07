import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_3_3_visual_identity.html');
const OUT=path.join(ROOT,'qa','output','v733-visual-identity');
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
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8786,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v733-visual-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9243','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());
async function pageTarget(){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:9243/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1400))}
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
  async function navigate(){await cdp.call('Page.navigate',{url:'http://127.0.0.1:8786/game.html'});await ready()}
  async function shot(name){const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
  async function noErrors(stage){const page=await cdp.eval(`window.__qaErrors||[]`);assert(page.length===0,`${stage}: page errors`,JSON.stringify(page));assert(runtimeErrors.length===0,`${stage}: runtime errors`,JSON.stringify(runtimeErrors));assert(consoleErrors.length===0,`${stage}: console errors`,JSON.stringify(consoleErrors))}

  await viewport(1440,900);await navigate();
  await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);await cdp.call('Page.reload',{ignoreCache:true});await ready();

  const fresh=await cdp.eval(`(()=>{const L=document.getElementById('careerLauncher'),shell=document.querySelector('.launcher-shell'),mark=document.querySelector('.launcher-mark'),brand=document.querySelector('.brand-mark'),top=document.querySelector('.topbar'),k=document.querySelector('.launcher-kicker');const cs=x=>getComputedStyle(x);return{visible:!!L&&!L.hidden&&cs(L).display!=='none',shellTop:cs(shell).borderTopWidth,shellBottom:cs(shell).borderBottomWidth,kicker:cs(k).display,markW:Math.round(mark.getBoundingClientRect().width),markH:Math.round(mark.getBoundingClientRect().height),brandImg:brand.querySelectorAll('img').length,brandSvg:brand.querySelectorAll('svg.gcc-brand-symbol').length,brandBg:cs(brand).backgroundColor,brandBorder:cs(brand).borderTopWidth,topAfter:getComputedStyle(top,'::after').display,topBorder:cs(top).borderBottomWidth,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(fresh.visible&&fresh.shellTop==='0px'&&fresh.shellBottom==='0px'&&fresh.kicker==='none'&&fresh.markW===58&&fresh.markH===52&&fresh.brandImg===0&&fresh.brandSvg===1&&fresh.brandBorder==='0px'&&fresh.topAfter==='none'&&fresh.topBorder==='1px'&&fresh.overflow<=1,'Fresh launcher visual gate failed',JSON.stringify(fresh));
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
  assert(review.screen==='review'&&/WHAT HELD UP/.test(review.strength)&&/What you can trust/.test(review.strength)&&/NEXT SEASON/.test(review.weak)&&/The first fix/.test(review.weak)&&/SEASON BOOK/.test(review.book)&&review.overflow<=1,'Season Review regression gate failed',JSON.stringify(review));
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


  await cdp.call('Page.reload',{ignoreCache:true});await ready();await sleep(300);
  const continued=await cdp.eval(`(()=>{const btn=document.getElementById('launcherContinue'),career=document.getElementById('launcherCareer'),brand=document.querySelector('.brand-mark'),shell=document.querySelector('.launcher-shell');return{visible:!!btn&&!btn.hidden,career:!!career&&!career.hidden,button:btn?.textContent.trim(),brandImg:brand.querySelectorAll('img').length,brandSvg:brand.querySelectorAll('svg.gcc-brand-symbol').length,shellTop:getComputedStyle(shell).borderTopWidth,shellBottom:getComputedStyle(shell).borderBottomWidth,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(continued.visible&&continued.career&&/^CONTINUE /.test(continued.button)&&continued.brandImg===0&&continued.brandSvg===1&&continued.shellTop==='0px'&&continued.shellBottom==='0px'&&continued.overflow<=1,'Continue launcher visual gate failed',JSON.stringify(continued));
  await shot('18-launcher-continue.png');
  await viewport(390,844);await sleep(200);const continueMobile=await cdp.eval(`(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,topH:Math.round(document.querySelector('.topbar').getBoundingClientRect().height)}))()`);assert(continueMobile.overflow<=1&&continueMobile.topH===68,'Continue launcher mobile visual gate failed',JSON.stringify(continueMobile));await shot('19-launcher-continue-mobile.png');await viewport(1440,900);
  const report={clubs,signing,draw,draft,team,season,innings,finals,review,market,trade,lottery,annual,cuts,readyState,team2009,pageErrors:await cdp.eval(`window.__qaErrors||[]`),runtimeErrors,consoleErrors};
  await noErrors('v7.3.3 visual identity');
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally {
  cdp.close();try{proc.kill('SIGTERM')}catch{};await new Promise(r=>server.close(r));try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
