import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_3_1_dynasty_continuity.html');
const OUT=path.join(ROOT,'qa','output','v731-dynasty-continuity');
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
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8784,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v731-dynasty-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9241','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());

async function pageTarget(){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:9241/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1400))}
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
  async function navigate(){await cdp.call('Page.navigate',{url:'http://127.0.0.1:8784/game.html'});await ready()}
  async function shot(name){const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
  async function noErrors(stage){const page=await cdp.eval(`window.__qaErrors||[]`);assert(page.length===0,`${stage}: page errors`,JSON.stringify(page));assert(runtimeErrors.length===0,`${stage}: runtime errors`,JSON.stringify(runtimeErrors));assert(consoleErrors.length===0,`${stage}: console errors`,JSON.stringify(consoleErrors))}

  await viewport(1440,900);await navigate();
  await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);await cdp.call('Page.reload',{ignoreCache:true});await ready();

  const foundation=await cdp.eval(`(()=>{Dynasty.requestNewDynasty();GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();GCC.skipToMyPick();return{screen:document.querySelector('.screen.active')?.id,user:GCC.state.userClub?.abbr,cards:document.querySelectorAll('#players .player-card').length,boardHidden:document.getElementById('draftBoardPanel')?.hidden}})()`);
  assert(foundation.screen==='draft'&&foundation.user&&foundation.cards===24&&foundation.boardHidden,'Foundation Draft setup/regression failed',JSON.stringify(foundation));
  const drafted=await cdp.eval(`(()=>{const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8,t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('skipToMyPick failed');const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id);guard++;}return{finished:s.draftFinished,user:s.teams[s.userClub.abbr].length,pickIndex:s.pickIndex};})()`);
  assert(drafted.finished&&drafted.user===15&&drafted.pickIndex===120,'Foundation Draft failed',JSON.stringify(drafted));
  await sleep(600);
  const foundationComplete=await cdp.eval(`(()=>({open:document.getElementById('modal')?.classList.contains('open'),text:(document.getElementById('modal')?.innerText||'').trim()}))()`);
  assert(foundationComplete.open&&/DRAFT COMPLETE/.test(foundationComplete.text),'Foundation Draft completion modal did not settle before offseason handoff',JSON.stringify(foundationComplete));
  await cdp.eval(`GCC.closeModal();true`);await sleep(300);
  await cdp.eval(`Dynasty.beginOffseason();Dynasty.runCpuMarket();Dynasty.drawDraftOrder();true`);
  const lottery=await cdp.eval(`(()=>{const o=GCC.state.dynasty.offseason;return{year:GCC.state.year,phase:o.phase,order:o.lottery.length,unique:new Set(o.lottery).size,userPick:o.lottery.indexOf(GCC.state.userClub.abbr)+1}})()`);
  assert(lottery.year===2009&&lottery.phase==='lottery'&&lottery.order===8&&lottery.unique===8&&lottery.userPick>=1,'2009 Draft Draw failed',JSON.stringify(lottery));

  const opened=await cdp.eval(`(()=>{Dynasty.startAnnualDraft();const o=GCC.state.dynasty.offseason;const cards=[...document.querySelectorAll('#annualDraftPlayers .player-card')];const actionable=cards.filter(card=>/userAnnualDraft\\(\\d+\\)/.test(card.getAttribute('onclick')||'')).length;return{phase:o.phase,cursor:o.pickCursor,cards:cards.length,actionable,legacyCards:document.querySelectorAll('.dynasty-player-card').length,search:!!document.getElementById('annualDraftSearch'),filters:[...document.querySelectorAll('#dynasty .annual-draft-pool .filters button')].map(x=>x.textContent.trim()),needs:document.querySelectorAll('.annual-draft-need').length,boardCols:document.querySelectorAll('.annual-draft-col').length,controls:(document.getElementById('annualDraftPoolControls')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(opened.phase==='draft'&&opened.cards===24&&opened.actionable===24&&opened.legacyCards===0&&opened.search&&JSON.stringify(opened.filters)===JSON.stringify(['ALL','BAT','WK-BAT','AR','BOWL'])&&opened.needs===4&&opened.boardCols===0&&/24 of/i.test(opened.controls)&&opened.overflow<=1,'Annual Draft canonical opening failed',JSON.stringify(opened));
  await shot('01-annual-draft-pool.png');

  const more=await cdp.eval(`(()=>{const before=document.querySelectorAll('#annualDraftPlayers .player-card').length;Dynasty.showMoreAnnualDraftPlayers();const after=document.querySelectorAll('#annualDraftPlayers .player-card').length;return{before,after,controls:(document.getElementById('annualDraftPoolControls')?.innerText||'').trim()}})()`);
  assert(more.before===24&&more.after>36,'SHOW MORE did not break old 36-player ceiling',JSON.stringify(more));

  const search=await cdp.eval(`(()=>{Dynasty.setAnnualDraftFilter('ALL');const name=document.querySelector('#annualDraftPlayers .player-card h4')?.textContent.trim();if(!name)throw new Error('No annual player for search');const input=document.getElementById('annualDraftSearch');input.value=name;input.dispatchEvent(new Event('input',{bubbles:true}));const names=[...document.querySelectorAll('#annualDraftPlayers .player-card h4')].map(x=>x.textContent.trim());return{name,names,input:document.getElementById('annualDraftSearch')?.value,screen:document.querySelector('.screen.active')?.id}})()`);
  assert(search.names.length>=1&&search.names.every(x=>x.toLowerCase().includes(search.name.toLowerCase()))&&search.input===search.name&&search.screen==='dynasty','Annual Draft search failed',JSON.stringify(search));
  await cdp.eval(`Dynasty.setAnnualDraftSearch('');true`);

  const filters=await cdp.eval(`(()=>{const out={};for(const role of ['BAT','WK-BAT','AR','BOWL']){Dynasty.setAnnualDraftFilter(role);const ids=[...document.querySelectorAll('#annualDraftPlayers .player-card')].map(card=>{const m=(card.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);return m?Number(m[1]):null}).filter(Boolean);out[role]={n:ids.length,roles:[...new Set(ids.map(id=>GCC.state.pool.find(p=>p.id===id)?.role))]};}return out})()`);
  assert(Object.entries(filters).every(([role,x])=>x.n>0&&x.roles.length===1&&x.roles[0]===role),'Annual Draft role filters failed',JSON.stringify(filters));

  await cdp.eval(`Dynasty.setAnnualDraftFilter('ALL');Dynasty.toggleAnnualDraftBoard(true);true`);
  const board=await cdp.eval(`(()=>({cols:document.querySelectorAll('.annual-draft-col').length,pool:!!document.getElementById('annualDraftPlayers'),back:[...document.querySelectorAll('#dynastyMain button')].some(x=>/BACK TO PLAYER POOL/.test(x.textContent)),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(board.cols===8&&!board.pool&&board.back&&board.overflow<=1,'Annual Draft Board did not behave as secondary view',JSON.stringify(board));
  await shot('02-annual-draft-board.png');
  await cdp.eval(`Dynasty.toggleAnnualDraftBoard(false);true`);
  const back=await cdp.eval(`(()=>({cards:document.querySelectorAll('#annualDraftPlayers .player-card').length,board:document.querySelectorAll('.annual-draft-col').length}))()`);
  assert(back.cards===24&&back.board===0,'Annual Draft did not return to player pool cleanly',JSON.stringify(back));

  const first=await cdp.eval(`(()=>{Dynasty.setAnnualDraftFilter('BOWL');const card=document.querySelector('#annualDraftPlayers .player-card');const m=(card?.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);if(!m)return null;const id=Number(m[1]),before=GCC.state.dynasty.offseason.pickCursor;Dynasty.userAnnualDraft(id);const o=GCC.state.dynasty.offseason;const active=[...document.querySelectorAll('#dynasty .annual-draft-pool .filters .button.primary')].map(x=>x.textContent.trim());const ids=[...document.querySelectorAll('#annualDraftPlayers .player-card')].map(x=>{const z=(x.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);return z?Number(z[1]):null}).filter(Boolean);return{id,before,after:o.pickCursor,phase:o.phase,roster:GCC.state.teams[GCC.state.userClub.abbr].length,active,roles:[...new Set(ids.map(pid=>GCC.state.pool.find(p=>p.id===pid)?.role))],cards:ids.length};})()`);
  assert(first&&first.after>first.before&&first.phase==='draft'&&first.active.includes('BOWL')&&first.cards>0&&first.roles.length===1&&first.roles[0]==='BOWL','First annual Draft pick did not preserve canonical interaction state',JSON.stringify(first));
  await shot('03-second-user-pick.png');

  const snap=await cdp.eval(`(()=>({cursor:GCC.state.dynasty.offseason.pickCursor,picks:JSON.parse(JSON.stringify(GCC.state.dynasty.offseason.picks)),roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)}))()`);
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const resumed=await cdp.eval(`(()=>{Dynasty.continueFromLauncher();const o=GCC.state.dynasty.offseason;return{screen:document.querySelector('.screen.active')?.id,phase:o?.phase,cursor:o?.pickCursor,picks:JSON.parse(JSON.stringify(o?.picks||[])),roster:[...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b),cards:document.querySelectorAll('#annualDraftPlayers .player-card').length,legacy:document.querySelectorAll('.dynasty-player-card').length,board:document.querySelectorAll('.annual-draft-col').length};})()`);
  assert(resumed.screen==='dynasty'&&resumed.phase==='draft'&&resumed.cursor===snap.cursor&&JSON.stringify(resumed.picks)===JSON.stringify(snap.picks)&&JSON.stringify(resumed.roster)===JSON.stringify(snap.roster)&&resumed.cards===24&&resumed.legacy===0&&resumed.board===0,'Annual Draft save/resume failed',JSON.stringify({snap,resumed}));

  await viewport(390,844);
  await sleep(1400);
  await cdp.eval(`document.querySelector('.annual-draft-room')?.scrollIntoView({block:'start'});true`);await sleep(120);
  const mobile=await cdp.eval(`(()=>({cards:document.querySelectorAll('#annualDraftPlayers .player-card').length,needs:document.querySelectorAll('.annual-draft-need').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,columns:getComputedStyle(document.querySelector('#annualDraftPlayers')).gridTemplateColumns,heading:(document.querySelector('.annual-draft-room h3')?.textContent||'').trim(),search:!!document.getElementById('annualDraftSearch')}))()`);
  assert(mobile.cards===24&&mobile.needs===4&&mobile.search&&/on the clock/i.test(mobile.heading)&&mobile.overflow<=1,'Annual Draft mobile layout failed',JSON.stringify(mobile));
  await shot('04-annual-draft-mobile.png');
  await viewport(1440,900);

  const second=await cdp.eval(`(()=>{const card=document.querySelector('#annualDraftPlayers .player-card');const m=(card?.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);if(!m)return null;const id=Number(m[1]),before=GCC.state.dynasty.offseason.pickCursor;Dynasty.userAnnualDraft(id);return{id,before,after:GCC.state.dynasty.offseason.pickCursor,phase:GCC.state.dynasty.offseason.phase,picks:GCC.state.dynasty.offseason.picks.length};})()`);
  assert(second&&second.after>second.before,'Second annual Draft pick failed',JSON.stringify(second));
  let guard=0;
  while((await cdp.eval(`GCC.state.dynasty.offseason?.phase`))==='draft'&&guard++<30){
    const picked=await cdp.eval(`(()=>{const card=document.querySelector('#annualDraftPlayers .player-card');if(!card){Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();return false}const m=(card.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);if(!m)return false;Dynasty.userAnnualDraft(Number(m[1]));return true})()`);
    if(!picked)await sleep(20);
  }
  const done=await cdp.eval(`(()=>{const o=GCC.state.dynasty.offseason,all=Object.values(GCC.state.teams).flat();const userPicks=o.picks.filter(x=>x.owner===GCC.state.userClub.abbr).length;return{phase:o.phase,draftComplete:o.draftComplete,picks:o.picks.length,userPicks,userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,total:all.length,unique:new Set(all).size,heading:(document.querySelector('#dynastyMain h3')?.textContent||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};})()`);
  assert(done.phase==='cuts'&&done.draftComplete&&done.picks>=16&&done.userPicks>=2&&done.userRoster>=15&&done.total===done.unique&&done.heading&&done.overflow<=1,'Annual Draft did not hand off to Final 15 cleanly',JSON.stringify(done));
  await shot('05-final-15-handoff.png');

  await noErrors('v7.3.1 dynasty continuity');
  const report={lottery,opened,more,search,filters,board,back,first,snap,resumed,mobile,second,done,pageErrors:await cdp.eval(`window.__qaErrors||[]`),runtimeErrors,consoleErrors};
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
} finally {
  cdp.close();try{proc.kill('SIGTERM')}catch{};await new Promise(r=>server.close(r));try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
