import fs from 'node:fs';
import http from 'node:http';
import {spawn} from 'node:child_process';
import path from 'node:path';
import {createHash} from 'node:crypto';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_5_0_dynasty_memory.html');
const OUT=path.join(ROOT,'qa','output','v750-full-horizon');
fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(GAME,'utf8');
const storageShim=`<script>(()=>{const make=()=>{const m=new Map();return{get length(){return m.size},key:i=>[...m.keys()][i]??null,getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear()}};try{Object.defineProperty(window,'localStorage',{value:make(),configurable:true})}catch(e){}try{Object.defineProperty(window,'sessionStorage',{value:make(),configurable:true})}catch(e){}})();<\/script>`;
const testHtml=html.replace('<head>','<head>'+storageShim);
const chrome=process.env.CHROME_BIN||'/usr/bin/chromium';
const port=9400+(process.pid%400);
const profile=`/tmp/gcc-v750-${process.pid}`;
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,'--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(c,m,d='')=>{if(!c)throw new Error(d?`${m}: ${d}`:m)};
async function json(pathname){for(let i=0;i<100;i++){try{const r=await fetch(`http://127.0.0.1:${port}${pathname}`);if(r.ok)return await r.json()}catch{}await sleep(100)}throw new Error('CDP unavailable '+stderr.slice(-1000))}

let ws;let seq=0;const pending=new Map();const runtimeErrors=[];const consoleErrors=[];
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))})}
async function ev(expression){const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text||JSON.stringify(r.exceptionDetails));return r.result?.value}
async function viewport(width,height){await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600,screenWidth:width,screenHeight:height})}
async function shot(name,full=false){const p={format:'png',captureBeyondViewport:!!full};if(full){const m=await call('Page.getLayoutMetrics');p.clip={x:0,y:0,width:m.contentSize.width,height:m.contentSize.height,scale:1}}const r=await call('Page.captureScreenshot',p);fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))}
async function repairXI(){
  return ev(`(()=>{const s=GCC.state,d=s.dynasty||{},inj=d.injuries||{};let roster=[...s.teams[s.userClub.abbr]];const out=id=>inj[id]?.status==='OUT';let guard=0;while(guard++<20){const bad=(s.xi||[]).find(id=>!roster.includes(id)||out(id));if(!bad)break;let bench=roster.find(id=>!(s.xi||[]).includes(id)&&!out(id));if(!bench){Dynasty.openReplacementMarket(bad);const btn=document.querySelector('.market-player button');const nums=((btn?.getAttribute('onclick')||'').match(/\\d+/g)||[]).map(Number);GCC.closeModal();if(nums.length<2)break;Dynasty.signReplacement(nums[0],nums[1]);bench=nums[1];roster=[...s.teams[s.userClub.abbr]]}if(bench){GCC.beginSwap(bench);GCC.replaceXI(bad)}}while((s.xi||[]).length<11){const id=roster.find(x=>!s.xi.includes(x)&&!out(x));if(!id)break;GCC.toggleXI(id)}if((s.xi||[]).length===11&&((s.battingOrder||[]).length!==11||!s.battingOrder.every(id=>s.xi.includes(id))))GCC.autoOrderXI();GCC.closeModal();return{xi:s.xi.length,order:s.battingOrder.length,out:s.xi.filter(out).length,roster:roster.length}})()`)
}
async function nameBestXI(){
  return ev(`(()=>{const s=GCC.state,ps=s.teams[s.userClub.abbr].map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),best=GCC.bestXI(ps).map(p=>p.id);GCC.clearXI();for(const id of best)GCC.toggleXI(id);if(s.battingOrder.length!==11)GCC.autoOrderXI();return{xi:s.xi.length,order:s.battingOrder.length,roster:s.teams[s.userClub.abbr].length}})()`)
}
async function playSeason(year){
  let guard=0;
  while((await ev('GCC.state.round'))<14&&guard++<20){const r=await repairXI();assert(r.xi===11&&r.order===11&&r.out===0,`XI repair ${year}`,JSON.stringify(r));await ev('GCC.playNextRound();true')}
  assert(await ev('GCC.state.round')===14,`season ${year} did not reach round 14`);
  const qualified=await ev('(GCC.state.regularSeasonPosition||99)<=4');
  if(qualified){
    await repairXI();await ev('GCC.proceedPostSeason();true');
    if(await ev("document.getElementById('modal')?.classList.contains('open')"))await ev('GCC.enterFinalsFromModal();true');
    let stage=await ev('GCC.state.finals?.stage');
    if(stage==='ready'){await repairXI();await ev('GCC.simulateFinals();true')}
    stage=await ev('GCC.state.finals?.stage');
    if(stage==='semis')await ev('GCC.advanceFinals();true');
    stage=await ev('GCC.state.finals?.stage');
    if(stage==='gf-ready'){await repairXI();await ev('GCC.simulateFinals();true')}
    await sleep(50);await ev('GCC.closeModal();GCC.openSeasonReview();true');
  }else await ev('GCC.proceedPostSeason();true');
  await sleep(20);
  const row=await ev(`(()=>{const s=GCC.state,d=s.dynasty,r=d.history.find(x=>x.year===${year});return{year:s.year,round:s.round,pos:s.regularSeasonPosition,champ:r?.champion||null,history:d.history.length,archived:!!r,stats:Object.keys(r?.playerStats||{}).length,title:!!r?.title,w:r?.wins,l:r?.losses}})()`);
  assert(row.archived&&row.champ&&row.stats>0,`season ${year} archive incomplete`,JSON.stringify(row));
  return row;
}
async function offseason(){
  const oldYear=await ev('GCC.state.year');
  await ev('Dynasty.beginOffseason();true');
  const y=await ev('GCC.state.year');assert(y===oldYear+1,'offseason year did not advance',`${oldYear}->${y}`);
  await ev('Dynasty.runCpuMarket();Dynasty.drawDraftOrder();Dynasty.startAnnualDraft();true');
  let dg=0;
  while((await ev("GCC.state.dynasty?.offseason?.phase"))==='draft'&&dg++<60){
    const picked=await ev(`(()=>{const cards=[...document.querySelectorAll('#annualDraftPlayers .player-card')];if(!cards.length){Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();return false}const s=GCC.state,choices=cards.map(card=>{const nums=((card.getAttribute('onclick')||'').match(/\\d+/g)||[]).map(Number),id=nums[0],p=s.pool.find(x=>x.id===id);return{id,p,value:p?Dynasty.tradeValue(p,s.userClub.abbr):-999}}).filter(x=>x.id&&x.p).sort((a,b)=>b.value-a.value);if(!choices.length)return false;Dynasty.userAnnualDraft(choices[0].id);return true})()`);
    if(!picked)await ev('Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();true');
  }
  const phase=await ev("GCC.state.dynasty?.offseason?.phase");if(phase!=='cuts')console.log('offseason-debug',await ev(`JSON.stringify({year:GCC.state.year,hasDynasty:!!GCC.state.dynasty,screen:document.querySelector('.screen.active')?.id,body:(document.getElementById('dynastyMain')?.innerText||'').slice(0,500)})`));assert(phase==='cuts','annual draft did not reach cuts',String(phase));
  let cg=0;
  while((await ev('GCC.state.teams[GCC.state.userClub.abbr].length'))>15&&cg++<20){
    const id=await ev(`(()=>{const s=GCC.state,ids=[...s.teams[s.userClub.abbr]],ps=ids.map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),keep=p=>(p.keeping||0)>=65||p.role==='WK-BAT',bowl=p=>(p.maxOvers||0)>=4||(p.bowl||0)>=65;const k=ps.filter(keep).length,b=ps.filter(bowl).length;let cand=ps.filter(p=>!(k<=1&&keep(p))&&!(b<=6&&bowl(p))).sort((a,z)=>Dynasty.tradeValue(a,s.userClub.abbr)-Dynasty.tradeValue(z,s.userClub.abbr));if(!cand.length)cand=ps.slice().sort((a,z)=>Dynasty.tradeValue(a,s.userClub.abbr)-Dynasty.tradeValue(z,s.userClub.abbr));return cand[0]?.id||null})()`);
    assert(id,'no cut candidate');await ev(`Dynasty.cutPlayer(${id});true`);
  }
  assert(await ev('GCC.state.teams[GCC.state.userClub.abbr].length')===15,'final list not 15');
  await ev('Dynasty.finishOffseason();true');
  await ev('Dynasty.enterTeamRoom();true');
  const xi=await nameBestXI();assert(xi.roster===15&&xi.xi===11&&xi.order===11,'new season XI invalid',JSON.stringify(xi));
  await ev('GCC.startSeason();true');
}

const START_YEAR=Number(process.env.GCC_START_YEAR||2008);
const END_YEAR_CHUNK=Number(process.env.GCC_END_YEAR||2014);
const SAVE_IN=process.env.GCC_SAVE_IN||'';
const SAVE_OUT=process.env.GCC_SAVE_OUT||path.join(OUT,`save-after-${END_YEAR_CHUNK}.json`);
const candidateSha=createHash('sha256').update(fs.readFileSync(GAME)).digest('hex');
const AUDIT_SEED=Number(process.env.GCC_AUDIT_SEED||101);

try{
  const pages=await json('/json');const page=pages.find(x=>x.type==='page')||pages[0];ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej});
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result||{})}else if(m.method==='Runtime.exceptionThrown')runtimeErrors.push(m.params.exceptionDetails?.exception?.description||m.params.exceptionDetails?.text||'runtime error');else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')consoleErrors.push((m.params.args||[]).map(a=>a.value??a.description??'').join(' '))};
  await Promise.all([call('Page.enable'),call('Runtime.enable')]);
  const tree=await call('Page.getFrameTree');await call('Page.setDocumentContent',{frameId:tree.frameTree.frame.id,html:testHtml});
  for(let i=0;i<260;i++){if(await ev(`document.readyState==='complete'&&typeof window.GCC==='object'&&typeof window.Dynasty==='object'`))break;await sleep(50)}
  assert(await ev(`typeof window.GCC==='object'&&typeof window.Dynasty==='object'`),'Game document did not become ready');
  await viewport(1440,900);
  assert(await ev('document.body.dataset.uiVersion')==='v7.5.0-dynasty-memory','wrong build');

  if(SAVE_IN){
    const saved=JSON.parse(fs.readFileSync(SAVE_IN,'utf8'));
    await ev(`localStorage.setItem('gcc_dynasty_v7_2',${JSON.stringify(saved.raw)});localStorage.setItem('gcc_dynasty_meta_v7_2',${JSON.stringify(saved.meta)});true`);
    await ev('Dynasty.continueFromLauncher();true');await sleep(30);
    const restored=await ev(`(()=>({year:GCC.state.year,round:GCC.state.round,screen:document.querySelector('.screen.active')?.id,history:GCC.state.dynasty?.history?.length||0,userClub:GCC.state.userClub?.abbr||null}))()`);
    assert(restored.year===START_YEAR&&restored.round===0&&restored.screen==='season'&&restored.userClub,`resume ${START_YEAR} failed`,JSON.stringify(restored));
    console.log('RESTORED',JSON.stringify(restored));
    await ev("document.body.style.display='none';true");
  }else{
    assert(START_YEAR===2008,'fresh chunk must start 2008');
    await ev(`Dynasty.requestNewDynasty();GCC.state.seed=${AUDIT_SEED};GCC.state.weatherSeed=${AUDIT_SEED};GCC.skipLeagueReveal();GCC.finishLeagueReveal();true`);
    await ev(`GCC.selectClub(0);GCC.confirmClub();true`);
    await ev(`GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();GCC.skipToMyPick();true`);
    let fg=0;
    while((await ev('GCC.state.pickIndex'))<120&&fg++<50){await ev(`(()=>{const s=GCC.state;GCC.skipToMyPick();if(s.pickIndex>=120)return true;const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];if(!p)throw new Error('no foundation pick');GCC.userDraft(p.id);return true})()`)}
    assert(await ev('GCC.state.draftFinished')===true,'foundation draft incomplete');
    await ev('GCC.closeModal();GCC.enterTeamRoom();true');const startXI=await nameBestXI();assert(startXI.xi===11&&startXI.order===11,'foundation XI invalid',JSON.stringify(startXI));await ev("GCC.startSeason();document.body.style.display='none';true");
  }

  const seasons=[];
  for(let year=START_YEAR;year<=END_YEAR_CHUNK;year++){
    assert(await ev('GCC.state.year')===year,'year mismatch',`${await ev('GCC.state.year')} vs ${year}`);
    const row=await playSeason(year);seasons.push(row);console.log('SEASON',year,row.pos,row.champ,row.w+'-'+row.l);
    try{await call('HeapProfiler.collectGarbage')}catch{}
    if(year<END_YEAR_CHUNK || END_YEAR_CHUNK<2026){await offseason();try{await call('HeapProfiler.collectGarbage')}catch{}}
  }

  if(END_YEAR_CHUNK<2026){
    const next=END_YEAR_CHUNK+1;
    const stateSnap=await ev(`(()=>({year:GCC.state.year,round:GCC.state.round,screen:document.querySelector('.screen.active')?.id,history:GCC.state.dynasty.history.length,userClub:GCC.state.userClub?.abbr||null,roster:GCC.state.teams[GCC.state.userClub.abbr].length,xi:GCC.state.xi.length}))()`);
    assert(stateSnap.year===next&&stateSnap.round===0&&stateSnap.screen==='season'&&stateSnap.history===END_YEAR_CHUNK-2007&&stateSnap.roster===15&&stateSnap.xi===11,'chunk handoff invalid',JSON.stringify(stateSnap));
    const raw=await ev(`localStorage.getItem('gcc_dynasty_v7_2')`),meta=await ev(`localStorage.getItem('gcc_dynasty_meta_v7_2')`);
    assert(raw&&meta,'autosave missing at chunk boundary');
    fs.writeFileSync(SAVE_OUT,JSON.stringify({candidate:candidateSha,seed:AUDIT_SEED,completedThrough:END_YEAR_CHUNK,nextYear:next,raw,meta,seasons},null,2));
    console.log('CHUNK PASS',START_YEAR,END_YEAR_CHUNK,JSON.stringify(stateSnap));
  }else{
    await ev("document.body.style.display='';Dynasty.finishCareer();true");await sleep(50);
    const legacy=await ev(`(()=>({screen:document.querySelector('.screen.active')?.id,history:GCC.state.dynasty.history.length,years:GCC.state.dynasty.history.map(x=>x.year),world:[...document.querySelectorAll('.legacy-world>div')].map(x=>x.innerText.trim()),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}))()`);
    assert(legacy.screen==='legacy'&&legacy.history===19&&legacy.years[0]===2008&&legacy.years.at(-1)===2026&&legacy.world.length===4&&!legacy.overflow,'Legacy full-horizon gate',JSON.stringify(legacy));
    await shot('v750-legacy-final.png',true);
    const before=await ev(`JSON.stringify({history:GCC.state.dynasty.history,manager:GCC.state.dynasty.manager,clubCareer:GCC.state.dynasty.clubCareer,playerCareer:GCC.state.dynasty.playerCareer})`);
    await ev('Dynasty.openArchive();true');await sleep(30);
    const archive=await ev(`(()=>({screen:document.querySelector('.screen.active')?.id,rows:document.querySelectorAll('#archive .archive-season').length,honours:document.querySelectorAll('#archive .archive-honour-row').length,records:document.querySelectorAll('#archive .archive-record').length,legends:document.querySelectorAll('#archive .archive-legend-row').length,score:[...document.querySelectorAll('#archiveHero .archive-scoreboard b')].map(x=>x.textContent.trim()),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}))()`);
    assert(archive.screen==='archive'&&archive.rows===19&&archive.honours===8&&archive.records===8&&archive.legends>0&&archive.score[0]==='19'&&!archive.overflow,'Archive full-horizon gate',JSON.stringify(archive));
    await shot('v750-archive-final.png',true);
    const after=await ev(`JSON.stringify({history:GCC.state.dynasty.history,manager:GCC.state.dynasty.manager,clubCareer:GCC.state.dynasty.clubCareer,playerCareer:GCC.state.dynasty.playerCareer})`);assert(before===after,'Archive mutated historical cricket state');
    await ev('Dynasty.openArchiveSeason(2008);true');await sleep(20);const early=await ev(`(()=>({open:document.getElementById('modal').classList.contains('open'),year:document.querySelector('.archive-detail-year')?.textContent.trim(),leaders:document.querySelectorAll('.archive-detail-leaders>div').length,lists:document.querySelectorAll('.archive-detail-row').length,summary:document.querySelector('.archive-detail-summary')?.textContent.trim()}))()`);assert(early.open&&early.year==='2008'&&early.leaders===3&&early.lists>=2,'2008 scorebook failed',JSON.stringify(early));await shot('v750-archive-2008-detail.png',true);await ev('GCC.closeModal()');
    await ev('Dynasty.openArchiveSeason(2026);true');await sleep(20);const late=await ev(`(()=>({open:document.getElementById('modal').classList.contains('open'),year:document.querySelector('.archive-detail-year')?.textContent.trim(),leaders:document.querySelectorAll('.archive-detail-leaders>div').length,summary:document.querySelector('.archive-detail-summary')?.textContent.trim()}))()`);assert(late.open&&late.year==='2026'&&late.leaders===3,'2026 scorebook failed',JSON.stringify(late));await shot('v750-archive-2026-detail.png',true);await ev('GCC.closeModal()');
    await viewport(390,844);await sleep(30);const mob=await ev(`(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,rows:document.querySelectorAll('#archive .archive-season').length,recordCols:getComputedStyle(document.querySelector('#archive .archive-record-grid')).gridTemplateColumns}))()`);assert(mob.sw<=mob.cw&&mob.rows===19,'Archive mobile overflow',JSON.stringify(mob));await shot('v750-archive-mobile-final.png',true);
    const integrity=await ev(`(()=>{const s=GCC.state,d=s.dynasty,all=Object.values(s.teams).flat();return{history:d.history.length,total:all.length,unique:new Set(all).size,rosters:Object.fromEntries(s.league.map(c=>[c.abbr,(s.teams[c.abbr]||[]).length])),retiredRostered:s.pool.filter(p=>p.dynastyRetired&&all.includes(p.id)).map(p=>p.name),replacements:Object.keys(d.replacementOf||{}).length}})()`);
    assert(integrity.history===19&&integrity.total===integrity.unique&&Object.values(integrity.rosters).every(n=>n===15)&&integrity.retiredRostered.length===0,'final integrity failed',JSON.stringify(integrity));
    assert(runtimeErrors.length===0&&consoleErrors.length===0,'browser errors',JSON.stringify({runtimeErrors,consoleErrors}));
    fs.writeFileSync(SAVE_OUT,JSON.stringify({candidate:candidateSha,seed:AUDIT_SEED,completedThrough:2026,seasons,legacy,archive,early,late,mobile:mob,integrity,runtimeErrors,consoleErrors},null,2));
    console.log('V750 FULL HORIZON PASS',JSON.stringify({legacy,archive,integrity}));
  }
}finally{try{ws?.close()}catch{};try{proc.kill('SIGTERM')}catch{};try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
