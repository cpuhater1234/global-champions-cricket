import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_3_0_core_game_experience.html');
const OUT=path.join(ROOT,'qa','output','v730-core-game-experience');
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
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8783,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v730-core-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9240','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());

async function pageTarget(){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:9240/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1400))}
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
  async function navigate(){await cdp.call('Page.navigate',{url:'http://127.0.0.1:8783/game.html'});await ready()}
  async function shot(name){const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
  async function noErrors(stage){const page=await cdp.eval(`window.__qaErrors||[]`);assert(page.length===0,`${stage}: page errors`,JSON.stringify(page));assert(runtimeErrors.length===0,`${stage}: runtime errors`,JSON.stringify(runtimeErrors));assert(consoleErrors.length===0,`${stage}: console errors`,JSON.stringify(consoleErrors))}

  await viewport(1440,900);
  await navigate();
  await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();

  const foundation=await cdp.eval(`(()=>{Dynasty.requestNewDynasty();return{screen:document.querySelector('.screen.active')?.id,league:GCC.state.league.length}})()`);
  assert(foundation.screen==='leagueDraw'&&foundation.league===8,'Fresh career did not enter foundation draw',JSON.stringify(foundation));
  const recruit=await cdp.eval(`(()=>{GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();GCC.skipToMyPick();return{screen:document.querySelector('.screen.active')?.id,user:GCC.state.userClub?.abbr,cards:document.querySelectorAll('#players .player-card').length}})()`);
  assert(recruit.screen==='draft'&&recruit.user&&recruit.cards===24,'Foundation-to-Draft handoff failed',JSON.stringify(recruit));

  const drafted=await cdp.eval(`(()=>{const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8;const t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('skipToMyPick failed at '+s.pickIndex);const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];if(!p)throw new Error('no available player at '+s.pickIndex);GCC.userDraft(p.id);guard++;}const all=Object.values(s.teams).flat();return{pickIndex:s.pickIndex,userSize:s.teams[s.userClub.abbr].length,total:all.length,unique:new Set(all).size,finished:s.draftFinished}})()`);
  assert(drafted.pickIndex===120&&drafted.userSize===15&&drafted.total===120&&drafted.unique===120&&drafted.finished,'Full Draft journey failed',JSON.stringify(drafted));
  await sleep(450);
  const team0=await cdp.eval(`(()=>{GCC.enterTeamRoom();const rows=[...document.querySelectorAll('#xiList .xi-row')];return{screen:document.querySelector('.screen.active')?.id,xi:GCC.state.xi.length,rows:rows.length,selected:rows.filter(x=>x.classList.contains('in')).length,layoutHidden:document.querySelector('#team .team-layout')?.hidden,recommend:!!document.getElementById('recommendXIButton'),manual:!!document.getElementById('manualXIButton'),pickButtons:rows.filter(x=>(x.querySelector('button')?.textContent||'').trim()==='PICK').length,startDisabled:document.getElementById('startSeasonButton')?.disabled,overall:(document.getElementById('teamOverall')?.innerText||'').trim(),intro:(document.querySelector('#team .section-head p')?.textContent||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(team0.screen==='team'&&team0.xi===0&&team0.rows===15&&team0.selected===0&&!team0.layoutHidden&&!team0.recommend&&!team0.manual&&team0.pickButtons===15&&team0.startDisabled&&team0.overall===''&&!/recommend/i.test(team0.intro)&&/Your picks are ordered naturally unless you change them\./i.test(team0.intro)&&team0.overflow<=1,'v7.3 empty-XI ownership state failed',JSON.stringify(team0));
  await shot('01-team-room-empty.png');

  const partial=await cdp.eval(`(()=>{const ids=(GCC.state.teams[GCC.state.userClub.abbr]||[]).slice(0,5);ids.forEach(id=>GCC.toggleXI(id));const rows=[...document.querySelectorAll('#xiList .xi-row')];return{xi:GCC.state.xi.length,order:GCC.state.battingOrder.length,rows:rows.length,selected:rows.filter(x=>x.classList.contains('in')).length,remove:rows.filter(x=>(x.querySelector('button')?.textContent||'').trim()==='REMOVE').length,pick:rows.filter(x=>(x.querySelector('button')?.textContent||'').trim()==='PICK').length,startDisabled:document.getElementById('startSeasonButton')?.disabled,overall:(document.getElementById('teamOverall')?.innerText||'').trim(),lead:document.getElementById('selectionLead')?.textContent.trim()}})()`);
  assert(partial.xi===5&&partial.order===5&&partial.rows===15&&partial.selected===5&&partial.remove===5&&partial.pick===10&&partial.startDisabled&&partial.overall===''&&/5 selected/.test(partial.lead),'v7.3 partial-XI state failed',JSON.stringify(partial));

  const complete=await cdp.eval(`(()=>{const roster=GCC.state.teams[GCC.state.userClub.abbr]||[];for(const id of roster){if(GCC.state.xi.length>=11)break;if(!GCC.state.xi.includes(id))GCC.toggleXI(id)}const rows=[...document.querySelectorAll('#xiList .xi-row')];return{xi:GCC.state.xi.length,unique:new Set(GCC.state.xi).size,order:GCC.state.battingOrder.length,rows:rows.length,selected:rows.filter(x=>x.classList.contains('in')).length,bench:rows.filter(x=>!x.classList.contains('in')).length,swap:rows.filter(x=>(x.querySelector('button')?.textContent||'').trim()==='SWAP').length,startDisabled:document.getElementById('startSeasonButton')?.disabled,overall:(document.getElementById('teamOverall')?.innerText||'').trim(),detailHidden:document.getElementById('teamDetailRead')?.hidden,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(complete.xi===11&&complete.unique===11&&complete.order===11&&complete.rows===15&&complete.selected===11&&complete.bench===4&&complete.swap===4&&!complete.startDisabled&&complete.overall.length>0&&!complete.detailHidden&&complete.overflow<=1,'v7.3 complete-XI state failed',JSON.stringify(complete));
  await shot('02-team-room-complete.png');

  const swap=await cdp.eval(`(()=>{const roster=GCC.state.teams[GCC.state.userClub.abbr]||[];const bench=roster.find(id=>!GCC.state.xi.includes(id));const outgoing=GCC.state.xi[0];GCC.beginSwap(bench);const armed={pending:GCC.state.pendingSwapIn,status:document.getElementById('swapStatus')?.innerText||'',swapOut:[...document.querySelectorAll('#xiList .xi-row button')].filter(x=>x.textContent.trim()==='SWAP OUT').length};GCC.replaceXI(outgoing);const rows=[...document.querySelectorAll('#xiList .xi-row')];return{bench,outgoing,armed,xi:GCC.state.xi.length,unique:new Set(GCC.state.xi).size,order:GCC.state.battingOrder.length,hasBench:GCC.state.xi.includes(bench),hasOutgoing:GCC.state.xi.includes(outgoing),rows:rows.length,selected:rows.filter(x=>x.classList.contains('in')).length,pending:GCC.state.pendingSwapIn,moment:document.getElementById('gccMomentLayer')?.classList.contains('show')}})()`);
  assert(swap.armed.pending===swap.bench&&swap.armed.swapOut===11&&/SWAP IN/i.test(swap.armed.status)&&swap.xi===11&&swap.unique===11&&swap.order===11&&swap.hasBench&&!swap.hasOutgoing&&swap.rows===15&&swap.selected===11&&swap.pending==null&&!swap.moment,'v7.3 direct swap failed',JSON.stringify(swap));

  await sleep(1000);
  await viewport(390,844);
  const mobile=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,rows:document.querySelectorAll('#xiList .xi-row').length,selected:document.querySelectorAll('#xiList .xi-row.in').length,startDisabled:document.getElementById('startSeasonButton')?.disabled,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(mobile.screen==='team'&&mobile.rows===15&&mobile.selected===11&&!mobile.startDisabled&&mobile.overflow<=1,'v7.3 mobile XI state failed',JSON.stringify(mobile));
  await shot('03-team-room-mobile.png');

  await viewport(1440,900);
  const season=await cdp.eval(`(()=>{GCC.state.year=2009;GCC.startSeason();return{screen:document.querySelector('.screen.active')?.id,round:GCC.state.round,xi:[...GCC.state.xi],year:GCC.state.year,rounds:GCC.state.fullSchedule.length}})()`);
  assert(season.screen==='season'&&season.round===0&&season.year===2009&&season.xi.length===11&&season.rounds===14,'Season handoff failed',JSON.stringify(season));

  const armed=await cdp.eval(`(()=>{const injured=GCC.state.xi[0];const before=[...GCC.state.xi];GCC.simulateSeason();setTimeout(()=>{GCC.state.dynasty.injuries={};GCC.state.dynasty.injuries[injured]={status:'OUT',roundsLeft:3,type:'QA forced injury'}},60);const p=GCC.state.pool.find(x=>x.id===injured);return{injured,injuredName:p?.name||'',before,round:GCC.state.round,screen:document.querySelector('.screen.active')?.id}})()`);
  assert(armed.round===1&&armed.screen==='season','Auto-run did not complete the first valid round before injury injection',JSON.stringify(armed));
  await sleep(850);
  const interrupted=await cdp.eval(`(()=>{const id=${armed.injured};return{screen:document.querySelector('.screen.active')?.id,round:GCC.state.round,xi:[...GCC.state.xi],stillSelected:GCC.state.xi.includes(id),injury:GCC.state.dynasty.injuries[id]||null,rows:document.querySelectorAll('#xiList .xi-row').length,injuredRows:[...document.querySelectorAll('#xiList .xi-row')].filter(x=>/OUT/.test(x.innerText)).length,kicker:(document.querySelector('#team .team-command-bar .kicker')?.textContent||'').trim(),lead:(document.getElementById('selectionLead')?.textContent||'').trim(),heading:(document.querySelector('#team .section-head h2')?.textContent||'').trim(),intro:(document.querySelector('#team .section-head p')?.textContent||'').trim(),quick:(document.getElementById('quickStartSeasonButton')?.textContent||'').trim(),start:(document.getElementById('startSeasonButton')?.textContent||'').trim(),quickDisabled:!!document.getElementById('quickStartSeasonButton')?.disabled,startDisabled:!!document.getElementById('startSeasonButton')?.disabled,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(interrupted.screen==='team'&&interrupted.round===1&&interrupted.stillSelected&&interrupted.injury?.status==='OUT'&&interrupted.rows===15&&interrupted.injuredRows>=1&&interrupted.overflow<=1,'Human injury did not interrupt auto-run before silent XI repair',JSON.stringify(interrupted));
  assert(interrupted.kicker==='ROUND 2 SELECTION'&&interrupted.lead===`${armed.injuredName} is out. Make one change for Round 2.`&&interrupted.heading==='Set your Round 2 XI'&&/Round 2/.test(interrupted.intro)&&interrupted.quick==='CHANGE REQUIRED'&&interrupted.start==='CHANGE REQUIRED'&&interrupted.quickDisabled&&interrupted.startDisabled,'Injury interruption did not make the required XI change explicit',JSON.stringify(interrupted));
  assert(JSON.stringify(interrupted.xi)===JSON.stringify(armed.before),'Auto-run changed the human XI after injury instead of handing control back',JSON.stringify({before:armed.before,after:interrupted.xi}));
  await shot('04-injury-interruption.png');
  const repaired=await cdp.eval(`(()=>{const injured=${armed.injured};const roster=GCC.state.teams[GCC.state.userClub.abbr]||[];const bench=roster.find(id=>!GCC.state.xi.includes(id)&&GCC.state.dynasty.injuries[id]?.status!=='OUT');if(!bench)throw new Error('No healthy bench player for injury repair');GCC.beginSwap(bench);GCC.replaceXI(injured);return{bench,xi:GCC.state.xi.length,unique:new Set(GCC.state.xi).size,injuredStill:GCC.state.xi.includes(injured),quick:(document.getElementById('quickStartSeasonButton')?.textContent||'').trim(),start:(document.getElementById('startSeasonButton')?.textContent||'').trim(),quickDisabled:!!document.getElementById('quickStartSeasonButton')?.disabled,startDisabled:!!document.getElementById('startSeasonButton')?.disabled,lead:(document.getElementById('selectionLead')?.textContent||'').trim()}})()`);
  assert(repaired.xi===11&&repaired.unique===11&&!repaired.injuredStill&&repaired.quick==='RETURN TO SEASON'&&repaired.start==='RETURN TO SEASON'&&!repaired.quickDisabled&&!repaired.startDisabled&&repaired.lead==='Your XI is set for Round 2.','XI did not unlock cleanly after the user repaired the injury',JSON.stringify(repaired));
  await shot('05-injury-repaired.png');

  await noErrors('v7.3.0 core game experience');
  const report={team0,partial,complete,swap,mobile,season,armed,interrupted,repaired,pageErrors:await cdp.eval(`window.__qaErrors||[]`),runtimeErrors,consoleErrors};
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally {
  cdp.close();
  try{proc.kill('SIGTERM')}catch{}
  await new Promise(r=>server.close(r));
  try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
