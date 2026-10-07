import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_3_1_dynasty_continuity.html');
const OUT=path.join(ROOT,'qa','output','v731-dynasty-continuity');
fs.mkdirSync(OUT,{recursive:true});
function fail(m,d=''){throw new Error(m+(d?': '+d:''))}
function assert(c,m,d=''){if(!c)fail(m,d)}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
const html=fs.readFileSync(GAME);
const server=http.createServer((req,res)=>{if(req.url==='/'||req.url==='/game.html'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html)}else if(req.url==='/favicon.ico'){res.writeHead(204);res.end()}else{res.writeHead(404);res.end('not found')}});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8784,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v731-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9241','--remote-allow-origins=*','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());
async function pageTarget(){for(let i=0;i<150;i++){try{const r=await fetch('http://127.0.0.1:9241/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p&&p.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1200))}
class CDP{constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.listeners=new Map()}async open(){await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',()=>reject(new Error('WebSocket open failed')),{once:true})});this.ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result||{})}else if(m.method){for(const fn of this.listeners.get(m.method)||[])fn(m.params||{})}})}on(m,fn){if(!this.listeners.has(m))this.listeners.set(m,[]);this.listeners.get(m).push(fn)}call(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}async eval(expression){const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)fail('Runtime evaluation failed',r.exceptionDetails.exception?.description||r.exceptionDetails.text||JSON.stringify(r.exceptionDetails));return r.result&&r.result.value}close(){try{this.ws.close()}catch{}}}

const target=await pageTarget();const cdp=new CDP(target.webSocketDebuggerUrl);const runtimeErrors=[];const consoleErrors=[];
try{
  await cdp.open();
  cdp.on('Runtime.exceptionThrown',p=>runtimeErrors.push(p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||JSON.stringify(p)));
  cdp.on('Runtime.consoleAPICalled',p=>{if(p.type==='error')consoleErrors.push((p.args||[]).map(a=>a.value??a.description??'').join(' '))});
  cdp.on('Log.entryAdded',p=>{if(p.entry&&p.entry.level==='error')consoleErrors.push(p.entry.text)});
  await Promise.all([cdp.call('Page.enable'),cdp.call('Runtime.enable'),cdp.call('Log.enable')]);
  await cdp.call('Page.addScriptToEvaluateOnNewDocument',{source:"window.__qaErrors=[];window.addEventListener('error',e=>window.__qaErrors.push(String(e.message||e.error||'error')));window.addEventListener('unhandledrejection',e=>window.__qaErrors.push(String(e.reason)));"});
  async function viewport(width,height){await cdp.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600,screenWidth:width,screenHeight:height})}
  async function ready(){for(let i=0;i<140;i++){if(await cdp.eval("document.readyState==='complete'&&typeof window.GCC==='object'&&typeof window.Dynasty==='object'"))return;await sleep(100)}fail('Game did not become ready',await cdp.eval("location.href+' | '+document.readyState+' | '+typeof window.GCC+' | '+typeof window.Dynasty"))}
  async function shot(name){const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
  async function noErrors(){const page=await cdp.eval('window.__qaErrors||[]');assert(page.length===0,'page errors',JSON.stringify(page));assert(runtimeErrors.length===0,'runtime errors',JSON.stringify(runtimeErrors));assert(consoleErrors.length===0,'console errors',JSON.stringify(consoleErrors))}

  await viewport(1440,900);await cdp.call('Page.navigate',{url:'http://127.0.0.1:8784/game.html'});await ready();
  await cdp.eval('localStorage.clear();sessionStorage.clear();true');await cdp.call('Page.reload',{ignoreCache:true});await ready();

  const foundation=await cdp.eval("(()=>{Dynasty.requestNewDynasty();GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();let guard=0;while(GCC.state.pickIndex<120&&guard++<40){GCC.skipToMyPick();if(GCC.state.pickIndex>=120)break;const p=GCC.state.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id)}return{finished:GCC.state.draftFinished,n:GCC.state.teams[GCC.state.userClub.abbr].length,user:GCC.state.userClub.abbr}})()");
  assert(foundation.finished&&foundation.n===15,'foundation Draft failed',JSON.stringify(foundation));
  await sleep(650);
  await cdp.eval('GCC.closeModal();Dynasty.beginOffseason();Dynasty.runCpuMarket();Dynasty.drawDraftOrder();true');
  const draw=await cdp.eval("(()=>{const o=GCC.state.dynasty.offseason;return{year:GCC.state.year,phase:o.phase,n:o.lottery.length,u:new Set(o.lottery).size,user:o.lottery.indexOf(GCC.state.userClub.abbr)}})()");
  assert(draw.year===2009&&draw.phase==='lottery'&&draw.n===8&&draw.u===8&&draw.user>=0,'2009 Draft draw failed',JSON.stringify(draw));

  const opened=await cdp.eval("(()=>{Dynasty.startAnnualDraft();const o=GCC.state.dynasty.offseason;return{phase:o.phase,cards:document.querySelectorAll('#annualDraftPlayers .player-card').length,legacy:document.querySelectorAll('.dynasty-player-card').length,search:!!document.getElementById('annualDraftSearch'),filters:[...document.querySelectorAll('#dynasty .annual-draft-pool .filters button')].map(x=>x.textContent.trim()),needs:document.querySelectorAll('.annual-draft-need').length,board:document.querySelectorAll('.annual-draft-col').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()");
  assert(opened.phase==='draft'&&opened.cards===24&&opened.legacy===0&&opened.search&&opened.filters.join('|')==='ALL|BAT|WK-BAT|AR|BOWL'&&opened.needs===4&&opened.board===0&&opened.overflow<=1,'annual Draft opening failed',JSON.stringify(opened));await shot('01-annual-draft-pool.png');

  const more=await cdp.eval("(()=>{const before=document.querySelectorAll('#annualDraftPlayers .player-card').length;Dynasty.showMoreAnnualDraftPlayers();return{before,after:document.querySelectorAll('#annualDraftPlayers .player-card').length}})()");
  assert(more.before===24&&more.after>36,'show more failed',JSON.stringify(more));
  const search=await cdp.eval("(()=>{Dynasty.setAnnualDraftFilter('ALL');const name=document.querySelector('#annualDraftPlayers .player-card h4').textContent.trim();const input=document.getElementById('annualDraftSearch');input.value=name;Dynasty.setAnnualDraftSearch(input.value);return{name,rows:[...document.querySelectorAll('#annualDraftPlayers .player-card h4')].map(x=>x.textContent.trim()),value:document.getElementById('annualDraftSearch').value}})()");
  assert(search.rows.length>=1&&search.rows.every(x=>x.toLowerCase().includes(search.name.toLowerCase()))&&search.value===search.name,'search failed',JSON.stringify(search));await cdp.eval("Dynasty.setAnnualDraftSearch('');true");
  const filters=await cdp.eval("(()=>{const out={};for(const role of ['BAT','WK-BAT','AR','BOWL']){Dynasty.setAnnualDraftFilter(role);const ids=[...document.querySelectorAll('#annualDraftPlayers .player-card')].map(x=>{const m=(x.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);return m?Number(m[1]):null}).filter(Boolean);out[role]=[ids.length,...new Set(ids.map(id=>GCC.state.pool.find(p=>p.id===id).role))]}return out})()");
  assert(Object.entries(filters).every(([r,x])=>x[0]>0&&x.length===2&&x[1]===r),'role filters failed',JSON.stringify(filters));

  await cdp.eval("Dynasty.setAnnualDraftFilter('ALL');Dynasty.toggleAnnualDraftBoard(true);true");
  const board=await cdp.eval("(()=>({cols:document.querySelectorAll('.annual-draft-col').length,pool:!!document.getElementById('annualDraftPlayers'),back:[...document.querySelectorAll('#dynastyMain button')].some(x=>x.textContent.includes('BACK TO PLAYER POOL')),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()");
  assert(board.cols===8&&!board.pool&&board.back&&board.overflow<=1,'Draft Board secondary view failed',JSON.stringify(board));await shot('02-annual-draft-board.png');
  await cdp.eval('Dynasty.toggleAnnualDraftBoard(false);true');

  const first=await cdp.eval("(()=>{Dynasty.setAnnualDraftFilter('BOWL');const card=document.querySelector('#annualDraftPlayers .player-card');const m=(card.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);const before=GCC.state.dynasty.offseason.pickCursor;Dynasty.userAnnualDraft(Number(m[1]));const ids=[...document.querySelectorAll('#annualDraftPlayers .player-card')].map(x=>{const z=(x.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);return z?Number(z[1]):null}).filter(Boolean);return{before,after:GCC.state.dynasty.offseason.pickCursor,phase:GCC.state.dynasty.offseason.phase,active:[...document.querySelectorAll('#dynasty .annual-draft-pool .filters .button.primary')].map(x=>x.textContent.trim()),roles:[...new Set(ids.map(id=>GCC.state.pool.find(p=>p.id===id).role))]}})()");
  assert(first.after>first.before&&first.phase==='draft'&&first.active.includes('BOWL')&&first.roles.length===1&&first.roles[0]==='BOWL','first user pick continuity failed',JSON.stringify(first));await shot('03-second-user-pick.png');

  const snap=await cdp.eval("(()=>({cursor:GCC.state.dynasty.offseason.pickCursor,picks:JSON.stringify(GCC.state.dynasty.offseason.picks),roster:JSON.stringify([...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b))}))()");
  await cdp.call('Page.reload',{ignoreCache:true});await ready();
  const resumed=await cdp.eval("(()=>{Dynasty.continueFromLauncher();const o=GCC.state.dynasty.offseason;return{screen:document.querySelector('.screen.active').id,phase:o.phase,cursor:o.pickCursor,picks:JSON.stringify(o.picks),roster:JSON.stringify([...GCC.state.teams[GCC.state.userClub.abbr]].sort((a,b)=>a-b)),cards:document.querySelectorAll('#annualDraftPlayers .player-card').length,legacy:document.querySelectorAll('.dynasty-player-card').length,board:document.querySelectorAll('.annual-draft-col').length}})()");
  assert(resumed.screen==='dynasty'&&resumed.phase==='draft'&&resumed.cursor===snap.cursor&&resumed.picks===snap.picks&&resumed.roster===snap.roster&&resumed.cards===24&&resumed.legacy===0&&resumed.board===0,'annual Draft resume failed',JSON.stringify({snap,resumed}));

  await viewport(390,844);const mobile=await cdp.eval("(()=>({cards:document.querySelectorAll('#annualDraftPlayers .player-card').length,needs:document.querySelectorAll('.annual-draft-need').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()");assert(mobile.cards===24&&mobile.needs===4&&mobile.overflow<=1,'mobile annual Draft failed',JSON.stringify(mobile));await shot('04-annual-draft-mobile.png');await viewport(1440,900);

  let guard=0;while((await cdp.eval("GCC.state.dynasty.offseason.phase"))==='draft'&&guard++<30){const did=await cdp.eval("(()=>{const c=document.querySelector('#annualDraftPlayers .player-card');if(!c){Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();return false}const m=(c.getAttribute('onclick')||'').match(/userAnnualDraft\\((\\d+)\\)/);if(!m)return false;Dynasty.userAnnualDraft(Number(m[1]));return true})()");if(!did)await sleep(20)}
  const done=await cdp.eval("(()=>{const o=GCC.state.dynasty.offseason,all=Object.values(GCC.state.teams).flat();return{phase:o.phase,complete:o.draftComplete,picks:o.picks.length,userPicks:o.picks.filter(x=>x.owner===GCC.state.userClub.abbr).length,userRoster:GCC.state.teams[GCC.state.userClub.abbr].length,total:all.length,unique:new Set(all).size,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()");
  assert(done.phase==='cuts'&&done.complete&&done.picks>=16&&done.userPicks>=2&&done.userRoster>=15&&done.total===done.unique&&done.overflow<=1,'Final 15 handoff failed',JSON.stringify(done));await shot('05-final-15-handoff.png');
  await noErrors();fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({draw,opened,more,search,filters,board,first,snap,resumed,mobile,done,runtimeErrors,consoleErrors},null,2));console.log(JSON.stringify({draw,opened,more,search,filters,board,first,resumed,mobile,done},null,2));
} finally {cdp.close();try{proc.kill('SIGTERM')}catch{}await new Promise(r=>server.close(r));try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
