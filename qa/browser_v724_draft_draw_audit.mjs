import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_2_4_signing_week_structure.html');
const OUT=path.join(ROOT,'qa','output','draft-draw-audit');
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
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8767,'127.0.0.1',resolve)});
const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-draw-audit-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9224','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());
async function pageTarget(){for(let i=0;i<120;i++){try{const r=await fetch('http://127.0.0.1:9224/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1000))}
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
  async function navigate(){await cdp.call('Page.navigate',{url:'http://127.0.0.1:8767/game.html'});for(let i=0;i<240;i++){if(await cdp.eval(`document.readyState==='complete'&&typeof window.GCC==='object'`))return;await sleep(100)}fail('Game did not become ready')}
  async function fresh(){await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);await cdp.call('Page.reload',{ignoreCache:true});for(let i=0;i<240;i++){if(await cdp.eval(`document.readyState==='complete'&&typeof window.GCC==='object'`))return;await sleep(100)}fail('Fresh reload did not become ready')}
  async function setupDraw(){return cdp.eval(`(()=>{GCC.newWorld();GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();return{screen:document.querySelector('.screen.active')?.id,user:GCC.state.userClub?.abbr,order:GCC.state.draftOrder.map(c=>c.abbr)}})()`)}
  async function shot(name){const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
  async function noErrors(stage){const p=await cdp.eval(`window.__qaErrors||[]`);assert(p.length===0,`${stage}: page errors`,JSON.stringify(p));assert(runtimeErrors.length===0,`${stage}: runtime errors`,JSON.stringify(runtimeErrors));assert(consoleErrors.length===0,`${stage}: console errors`,JSON.stringify(consoleErrors))}

  await viewport(1440,900);await navigate();const setup=await setupDraw();
  const initial=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,nav:document.getElementById('nav')?.innerText.trim(),cards:document.querySelectorAll('#draftRevealGrid .draft-order-card').length,live:document.querySelectorAll('#draftRevealGrid .draft-order-card.live').length,count:document.getElementById('draftRevealCount')?.textContent.trim(),status:document.getElementById('draftRevealStatus')?.textContent.trim(),prompt:document.getElementById('draftRevealPrompt')?.innerText.trim(),continueDisabled:document.getElementById('draftRevealContinue')?.disabled,skipDisabled:document.getElementById('draftRevealSkip')?.disabled,pace:document.getElementById('draftRevealPace')?.textContent.trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(initial.screen==='draftDraw','Draft Order Draw is not active',JSON.stringify(initial));assert(initial.nav==='','Navigation should be hidden during the draw',JSON.stringify(initial));assert(initial.cards===8&&initial.live===0,'Initial envelope grid is not eight placeholders',JSON.stringify(initial));assert(initial.count==='0 of 8 positions drawn','Initial count incorrect',JSON.stringify(initial));assert(initial.continueDisabled===true&&initial.skipDisabled===false,'Initial controls incorrect',JSON.stringify(initial));assert(initial.pace==='PACE 1×','Initial pace incorrect',JSON.stringify(initial));assert(initial.overflow<=1,'Desktop initial horizontal overflow',String(initial.overflow));await shot('desktop-draw-open.png');

  // Deterministic distribution sanity: 512 independent seeds, every draw unique and every club reaches every slot.
  const distribution=await cdp.eval(`(()=>{const clubs=GCC.state.league.map(c=>c.abbr);const counts=Object.fromEntries(clubs.map(c=>[c,Array(8).fill(0)]));let duplicateOrders=0;const seen=new Set();for(let n=1;n<=512;n++){GCC.state.seed=((n*2654435761)>>>0);GCC.setupDraft();GCC.skipDraftReveal();const order=GCC.state.draftOrder.map(c=>c.abbr);if(new Set(order).size!==8)throw new Error('duplicate club inside draw '+n);const key=order.join('|');if(seen.has(key))duplicateOrders++;seen.add(key);order.forEach((c,i)=>counts[c][i]++);}const user=GCC.state.userClub.abbr;return{counts,user,userCounts:counts[user],uniqueOrders:seen.size,duplicateOrders};})()`);
  assert(distribution.userCounts.every(x=>x>35&&x<95),'User draft-position distribution is suspicious',JSON.stringify(distribution));assert(Object.values(distribution.counts).every(a=>a.every(x=>x>25)),'A club failed to reach one or more draft positions often enough',JSON.stringify(distribution));assert(distribution.uniqueOrders>490,'Too many repeated 8-club orders across deterministic seeds',JSON.stringify(distribution));

  await fresh();await setupDraw();
  const pace=await cdp.eval(`(()=>{GCC.cycleRevealPace('draft');GCC.cycleRevealPace('draft');return document.getElementById('draftRevealPace').textContent.trim()})()`);
  assert(pace==='PACE 4×','Draft reveal pace cycle failed',pace);
  const observed=new Set();let finished=null;
  for(let i=0;i<220;i++){const s=await cdp.eval(`(()=>({live:document.querySelectorAll('#draftRevealGrid .draft-order-card.live').length,disabled:document.getElementById('draftRevealContinue').disabled}))()`);observed.add(s.live);if(!s.disabled){finished=s;break}await sleep(50)}
  assert(finished&&!finished.disabled,'Automatic draft-order reveal did not finish');for(let i=1;i<=8;i++)assert(observed.has(i),'Automatic reveal skipped observable position '+i,JSON.stringify([...observed]));
  const complete=await cdp.eval(`(()=>{const order=GCC.state.draftOrder;const userIndex=order.findIndex(c=>c.abbr===GCC.state.userClub.abbr);const cards=[...document.querySelectorAll('#draftRevealGrid .draft-order-card')].map((el,i)=>({text:el.innerText,user:el.classList.contains('user'),i}));return{order:order.map(c=>c.abbr),userPick:userIndex+1,userCards:cards.filter(x=>x.user).length,userCardIndex:cards.findIndex(x=>x.user)+1,count:document.getElementById('draftRevealCount').textContent.trim(),status:document.getElementById('draftRevealStatus').textContent.trim(),prompt:document.getElementById('draftRevealPrompt').innerText.trim(),continueDisabled:document.getElementById('draftRevealContinue').disabled,skipDisabled:document.getElementById('draftRevealSkip').disabled,paceDisabled:document.getElementById('draftRevealPace').disabled,round2OK:cards.every((x,i)=>x.text.includes('Round 2: Pick '+(16-i))),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}})()`);
  assert(new Set(complete.order).size===8,'Completed draw contains duplicate clubs',JSON.stringify(complete));assert(complete.userCards===1&&complete.userCardIndex===complete.userPick,'User club highlight is wrong',JSON.stringify(complete));assert(complete.count==='8 of 8 positions drawn'&&!complete.continueDisabled&&complete.skipDisabled&&complete.paceDisabled,'Completed control state incorrect',JSON.stringify(complete));assert(complete.prompt.includes('Pick '+complete.userPick+' is yours.')&&complete.prompt.includes('pick '+(17-complete.userPick)+' overall'),'Completed snake-order prompt incorrect',JSON.stringify(complete));assert(complete.round2OK,'One or more Round 2 pick numbers are wrong',JSON.stringify(complete));assert(complete.overflow<=1,'Desktop completed draw overflow',String(complete.overflow));await shot('desktop-draw-complete.png');

  const transition=await cdp.eval(`(()=>{GCC.beginDraft();return{screen:document.querySelector('.screen.active')?.id,workspaceHidden:document.getElementById('draftWorkspace')?.hidden,boardHidden:document.getElementById('draftBoardPanel')?.hidden,pickIndex:GCC.state.pickIndex,user:GCC.state.userClub.abbr}})()`);
  assert(transition.screen==='draft'&&transition.workspaceHidden===false&&transition.boardHidden===true,'ENTER DRAFT ROOM transition failed',JSON.stringify(transition));await noErrors('desktop draw');

  await fresh();await setupDraw();await sleep(750);
  const beforeSkip=await cdp.eval(`document.querySelectorAll('#draftRevealGrid .draft-order-card.live').length`);assert(beforeSkip>=1&&beforeSkip<8,'Skip-path precondition not reached',String(beforeSkip));
  const skipped=await cdp.eval(`(()=>{GCC.skipDraftReveal();return{live:document.querySelectorAll('#draftRevealGrid .draft-order-card.live').length,continueDisabled:document.getElementById('draftRevealContinue').disabled,count:document.getElementById('draftRevealCount').textContent.trim()}})()`);
  assert(skipped.live===8&&!skipped.continueDisabled&&skipped.count==='8 of 8 positions drawn','REVEAL ALL path failed',JSON.stringify(skipped));

  await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);await viewport(390,844);await cdp.call('Page.reload',{ignoreCache:true});for(let i=0;i<240;i++){if(await cdp.eval(`document.readyState==='complete'&&typeof window.GCC==='object'`))break;await sleep(100)}await setupDraw();
  const mobileOpen=await cdp.eval(`(()=>({cards:document.querySelectorAll('#draftRevealGrid .draft-order-card').length,cols:getComputedStyle(document.getElementById('draftRevealGrid')).gridTemplateColumns,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);assert(mobileOpen.cards===8&&mobileOpen.overflow<=1,'Mobile opening state failed',JSON.stringify(mobileOpen));await shot('mobile-draw-open.png');
  await cdp.eval(`GCC.skipDraftReveal()`);const mobileDone=await cdp.eval(`(()=>({live:document.querySelectorAll('#draftRevealGrid .draft-order-card.live').length,userCards:document.querySelectorAll('#draftRevealGrid .draft-order-card.user').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);assert(mobileDone.live===8&&mobileDone.userCards===1&&mobileDone.overflow<=1,'Mobile completed draw failed',JSON.stringify(mobileDone));await shot('mobile-draw-complete.png');await noErrors('mobile draw');

  const report={setup,initial,distribution,pace,observed:[...observed],complete,transition,beforeSkip,skipped,mobileOpen,mobileDone};
  fs.writeFileSync(path.join(OUT,'browser-report.json'),JSON.stringify(report,null,2));
  console.log('Draft Order Draw audit OK');console.log(JSON.stringify(report,null,2));
}finally{cdp.close();proc.kill('SIGTERM');server.close()}
