import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT = process.cwd();
const GAME = path.join(ROOT, 'game', 'global_champions_cricket_v7_2_3_draft_structure.html');
const OUT = path.join(ROOT, 'qa', 'output', 'v723');
fs.mkdirSync(OUT, {recursive:true});

function fail(message, detail='') {
  throw new Error(detail ? `${message}: ${detail}` : message);
}
function assert(cond, message, detail='') {
  if (!cond) fail(message, detail);
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

const html = fs.readFileSync(GAME);
const server = http.createServer((req,res)=>{
  if (req.url === '/' || req.url === '/game.html') {
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    res.end(html);
  } else {
    res.writeHead(404); res.end('not found');
  }
});
await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(8765,'127.0.0.1',resolve);
});

const chrome = process.env.CHROME_BIN || 'google-chrome';
const profile = fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v723-chrome-'));
const proc = spawn(chrome,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--remote-debugging-port=9222','--remote-allow-origins=*',
  `--user-data-dir=${profile}`,'about:blank'
],{stdio:['ignore','pipe','pipe']});
let chromeStderr='';
proc.stderr.on('data',d=>{ chromeStderr += d.toString(); });

async function getPageTarget(){
  let last='';
  for(let i=0;i<100;i++){
    try{
      const r=await fetch('http://127.0.0.1:9222/json/list');
      const arr=await r.json();
      const page=arr.find(x=>x.type==='page');
      if(page?.webSocketDebuggerUrl) return page;
    }catch(e){ last=String(e); }
    await sleep(100);
  }
  fail('Chrome DevTools endpoint did not become ready', last || chromeStderr.slice(-1000));
}

class CDP {
  constructor(url){
    this.ws=new WebSocket(url);
    this.id=0; this.pending=new Map(); this.listeners=new Map();
  }
  async open(){
    await new Promise((resolve,reject)=>{
      this.ws.addEventListener('open',resolve,{once:true});
      this.ws.addEventListener('error',()=>reject(new Error('WebSocket open failed')),{once:true});
    });
    this.ws.addEventListener('message',e=>{
      const msg=JSON.parse(e.data);
      if(msg.id){
        const p=this.pending.get(msg.id); if(!p) return;
        this.pending.delete(msg.id);
        if(msg.error) p.reject(new Error(`${msg.error.message} ${JSON.stringify(msg.error.data||'')}`));
        else p.resolve(msg.result||{});
      } else if(msg.method){
        for(const fn of this.listeners.get(msg.method)||[]) fn(msg.params||{});
      }
    });
  }
  on(method,fn){
    if(!this.listeners.has(method)) this.listeners.set(method,[]);
    this.listeners.get(method).push(fn);
  }
  call(method,params={}){
    const id=++this.id;
    return new Promise((resolve,reject)=>{
      this.pending.set(id,{resolve,reject});
      this.ws.send(JSON.stringify({id,method,params}));
    });
  }
  async eval(expression, awaitPromise=true){
    const r=await this.call('Runtime.evaluate',{expression,awaitPromise,returnByValue:true,userGesture:true});
    if(r.exceptionDetails) fail('Runtime evaluation failed', r.exceptionDetails.text || JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  }
  close(){ try{this.ws.close();}catch{} }
}

const target=await getPageTarget();
const cdp=new CDP(target.webSocketDebuggerUrl);
const protocolErrors=[]; const consoleErrors=[];
try {
  await cdp.open();
  cdp.on('Runtime.exceptionThrown',p=>protocolErrors.push(p.exceptionDetails?.text || JSON.stringify(p)));
  cdp.on('Runtime.consoleAPICalled',p=>{
    if(p.type==='error') consoleErrors.push((p.args||[]).map(a=>a.value ?? a.description ?? '').join(' '));
  });
  cdp.on('Log.entryAdded',p=>{ if(p.entry?.level==='error') consoleErrors.push(p.entry.text); });
  await Promise.all([cdp.call('Page.enable'),cdp.call('Runtime.enable'),cdp.call('Log.enable')]);
  await cdp.call('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__qaErrors=[];
    window.addEventListener('error',e=>window.__qaErrors.push('error: '+(e.message||e.error||'unknown')));
    window.addEventListener('unhandledrejection',e=>window.__qaErrors.push('rejection: '+String(e.reason)));
    const oldError=console.error.bind(console);
    console.error=(...args)=>{window.__qaErrors.push('console.error: '+args.map(String).join(' '));oldError(...args)};
  `});

  async function viewport(width,height){
    await cdp.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600,screenWidth:width,screenHeight:height});
  }
  async function navigate(){
    await cdp.call('Page.navigate',{url:'http://127.0.0.1:8765/game.html'});
    for(let i=0;i<240;i++){
      const ok=await cdp.eval(`document.readyState==='complete' && typeof window.GCC==='object'`);
      if(ok) return;
      await sleep(100);
    }
    fail('Game did not become ready');
  }
  async function setupDraft(){
    return cdp.eval(`(()=>{
      GCC.newWorld();
      GCC.skipLeagueReveal();
      GCC.finishLeagueReveal();
      GCC.selectClub(0);
      GCC.confirmClub();
      GCC.skipRecruitment();
      GCC.setupDraft();
      GCC.skipDraftReveal();
      GCC.beginDraft();
      GCC.skipToMyPick();
      return {pickIndex:GCC.state.pickIndex,user:GCC.state.userClub?.abbr,screen:document.querySelector('.screen.active')?.id};
    })()`);
  }
  async function snapshot(file){
    const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(OUT,file),Buffer.from(r.data,'base64'));
  }
  async function errorState(){
    const page=await cdp.eval(`window.__qaErrors || []`);
    return {page,protocol:[...protocolErrors],console:[...consoleErrors]};
  }
  async function assertNoErrors(stage){
    const e=await errorState();
    assert(e.page.length===0,`${stage}: page errors`,JSON.stringify(e.page));
    assert(e.protocol.length===0,`${stage}: runtime exceptions`,JSON.stringify(e.protocol));
    assert(e.console.length===0,`${stage}: console errors`,JSON.stringify(e.console));
  }

  // Desktop first-pick structure.
  await viewport(1440,900);
  await navigate();
  const start=await setupDraft();
  assert(start.screen==='draft','Draft screen did not become active',JSON.stringify(start));
  const initial=await cdp.eval(`(()=>({
    cards:document.querySelectorAll('#players .player-card').length,
    showMore:!!document.querySelector('#draftPoolControls button'),
    controls:(document.querySelector('#draftPoolControls')?.innerText||''),
    boardHidden:document.getElementById('draftBoardPanel')?.hidden,
    workspaceHidden:document.getElementById('draftWorkspace')?.hidden,
    boardPicks:document.querySelectorAll('#draftBoard .draft-pick').length,
    boardCols:document.querySelectorAll('#draftBoard .draft-col').length,
    priority:(document.getElementById('draftNeeds')?.innerText||'').trim(),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }))()`);
  assert(initial.cards===24,'Initial draft pool is not 24 cards',JSON.stringify(initial));
  assert(initial.showMore && /SHOW MORE/.test(initial.controls),'Show More control missing',JSON.stringify(initial));
  assert(initial.boardHidden===true && initial.workspaceHidden===false,'Draft Board is not secondary by default',JSON.stringify(initial));
  assert(initial.boardPicks===0 && initial.boardCols===0,'Full Draft Board rendered before requested',JSON.stringify(initial));
  assert(initial.priority.length>0,'First-pick cricket context missing');
  assert(initial.overflow<=1,'Desktop page-level horizontal overflow',String(initial.overflow));
  await snapshot('desktop-first-pick.png');

  // Progressive disclosure, role filter and search.
  const more=await cdp.eval(`(()=>{GCC.showMoreDraftPlayers();return {cards:document.querySelectorAll('#players .player-card').length,text:document.getElementById('draftPoolControls')?.innerText||''}})()`);
  assert(more.cards>24 && more.cards<=48,'Show More did not reveal the next bounded pool',JSON.stringify(more));
  const bat=await cdp.eval(`(()=>{GCC.setFilter('BAT');return {cards:document.querySelectorAll('#players .player-card').length,active:[...document.querySelectorAll('#filters button.primary')].map(x=>x.textContent.trim())}})()`);
  assert(bat.cards>0 && bat.cards<=24 && bat.active.includes('BAT'),'BAT filter failed',JSON.stringify(bat));
  await cdp.eval(`GCC.setFilter('ALL')`);
  const search=await cdp.eval(`(()=>{const first=GCC.state.pool.filter(p=>p.available&&!p.draftedBy).sort((a,b)=>b.overall-a.overall)[0];const q=first.name.split(/\\s+/)[0];const el=document.getElementById('playerSearch');el.value=q;el.dispatchEvent(new Event('input',{bubbles:true}));return {q,cards:document.querySelectorAll('#players .player-card').length};})()`);
  assert(search.cards>=1 && search.cards<=24,'Player search did not bound matching results',JSON.stringify(search));
  await cdp.eval(`(()=>{const el=document.getElementById('playerSearch');el.value='';el.dispatchEvent(new Event('input',{bubbles:true}));})()`);

  // Full board is deliberate secondary view.
  const board=await cdp.eval(`(()=>{GCC.toggleDraftBoard();return {boardHidden:document.getElementById('draftBoardPanel').hidden,workspaceHidden:document.getElementById('draftWorkspace').hidden,cols:document.querySelectorAll('#draftBoard .draft-col').length,picks:document.querySelectorAll('#draftBoard .draft-pick').length,toggle:document.getElementById('draftBoardToggle').textContent.trim()};})()`);
  assert(board.boardHidden===false && board.workspaceHidden===true,'Draft Board toggle did not switch views',JSON.stringify(board));
  assert(board.cols===8 && board.picks===120,'Draft Board is not the complete 120-slot board',JSON.stringify(board));
  assert(board.toggle==='BACK TO PLAYER POOL','Draft Board back action copy incorrect',JSON.stringify(board));
  await snapshot('desktop-full-board.png');
  await cdp.eval(`GCC.toggleDraftBoard()`);

  // Complete the full 120-pick snake draft with the user's actual turns.
  const completed=await cdp.eval(`(()=>{
    const s=GCC.state;
    let guard=0;
    while(s.pickIndex<120 && guard<40){
      GCC.skipToMyPick();
      if(s.pickIndex>=120) break;
      const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8;
      const t=s.draftOrder[round%2===0?pos:7-pos];
      if(!t || t.abbr!==s.userClub.abbr) throw new Error('skipToMyPick failed at '+s.pickIndex);
      const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];
      if(!p) throw new Error('no available player at '+s.pickIndex);
      GCC.userDraft(p.id);
      guard++;
    }
    const sizes=Object.fromEntries(Object.entries(s.teams).map(([k,v])=>[k,v.length]));
    const allIds=Object.values(s.teams).flat();
    return {pickIndex:s.pickIndex,sizes,userSize:s.teams[s.userClub.abbr].length,total:allIds.length,unique:new Set(allIds).size,draftFinished:s.draftFinished,guard};
  })()`);
  assert(completed.pickIndex===120,'Draft did not reach pick 120',JSON.stringify(completed));
  assert(Object.values(completed.sizes).every(x=>x===15),'One or more CPU/user squads did not finish 15/15',JSON.stringify(completed.sizes));
  assert(completed.userSize===15 && completed.total===120 && completed.unique===120,'Draft roster uniqueness failed',JSON.stringify(completed));
  assert(completed.draftFinished===true,'draftFinished flag not set',JSON.stringify(completed));
  await sleep(500);
  const finish=await cdp.eval(`(()=>({open:document.getElementById('modal')?.classList.contains('open'),text:document.getElementById('modal')?.innerText||''}))()`);
  assert(finish.open && /DRAFT COMPLETE/.test(finish.text) && /ENTER TEAM ROOM/.test(finish.text),'Draft completion modal/CTA missing',JSON.stringify(finish));
  await assertNoErrors('desktop full draft');
  await snapshot('desktop-draft-complete.png');

  const team=await cdp.eval(`(()=>{GCC.enterTeamRoom();return {screen:document.querySelector('.screen.active')?.id,squad:GCC.state.teams[GCC.state.userClub.abbr].length,xi:GCC.state.xi.length};})()`);
  assert(team.screen==='team' && team.squad===15 && team.xi===0,'Enter Team Room transition failed',JSON.stringify(team));
  await assertNoErrors('team-room transition');

  // Mobile regression on a fresh foundation draft.
  await viewport(390,844);
  await cdp.call('Page.reload',{ignoreCache:true});
  for(let i=0;i<240;i++){
    if(await cdp.eval(`document.readyState==='complete' && typeof window.GCC==='object'`)) break;
    await sleep(100);
  }
  await setupDraft();
  const mobile=await cdp.eval(`(()=>({cards:document.querySelectorAll('#players .player-card').length,boardHidden:document.getElementById('draftBoardPanel')?.hidden,priority:(document.getElementById('draftNeeds')?.innerText||'').trim(),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  assert(mobile.cards===24 && mobile.boardHidden===true && mobile.priority.length>0,'Mobile first-pick structure failed',JSON.stringify(mobile));
  assert(mobile.overflow<=1,'Mobile page-level horizontal overflow',String(mobile.overflow));
  await snapshot('mobile-first-pick.png');
  const mobileBoard=await cdp.eval(`(()=>{GCC.toggleDraftBoard();return {cols:document.querySelectorAll('#draftBoard .draft-col').length,picks:document.querySelectorAll('#draftBoard .draft-pick').length,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,boardScroll:document.getElementById('draftBoardPanel')?.scrollWidth-document.getElementById('draftBoardPanel')?.clientWidth};})()`);
  assert(mobileBoard.cols===8 && mobileBoard.picks===120,'Mobile full Draft Board incomplete',JSON.stringify(mobileBoard));
  assert(mobileBoard.overflow<=1,'Mobile Draft Board leaks page-level horizontal overflow',JSON.stringify(mobileBoard));
  await snapshot('mobile-full-board.png');
  await assertNoErrors('mobile draft');

  const report={candidate:'ff2c6bd7c351d2f709f6952c1faf81a462d700458b4f3b251a71246faf58de32',initial,showMore:more,batFilter:bat,search,board,completed,finish,team,mobile,mobileBoard,errors:await errorState()};
  fs.writeFileSync(path.join(OUT,'browser-report.json'),JSON.stringify(report,null,2));
  console.log('v7.2.3 browser QA OK');
  console.log(JSON.stringify(report,null,2));
} finally {
  cdp.close();
  proc.kill('SIGTERM');
  server.close();
}
