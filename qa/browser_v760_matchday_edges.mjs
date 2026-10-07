import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_6_0_matchday_immersion.html');
const OUT=path.join(ROOT,'qa','output','v760-matchday');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(GAME,'utf8');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const fail=(m,d='')=>{throw new Error(d?`${m}: ${d}`:m)};
const assert=(c,m,d='')=>{if(!c)fail(m,d)};

class CDP{
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map()}
  async open(){await new Promise((res,rej)=>{this.ws.addEventListener('open',res,{once:true});this.ws.addEventListener('error',()=>rej(new Error('ws open failed')),{once:true})});this.ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(!m.id)return;const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result||{})})}
  call(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}
  async eval(expression){const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)fail('Runtime eval',r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value}
  close(){try{this.ws.close()}catch{}}
}
async function target(port){for(let i=0;i<160;i++){try{const r=await fetch(`http://127.0.0.1:${port}/json/list`),a=await r.json(),p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('CDP target unavailable')}

const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v760-edges-'));
const proc=spawn(process.env.CHROME_BIN||'chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9361','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const t=await target(9361),cdp=new CDP(t.webSocketDebuggerUrl);await cdp.open();await Promise.all([cdp.call('Page.enable'),cdp.call('Runtime.enable')]);
const shot=async name=>{const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))};
try{
  await cdp.call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false,screenWidth:1440,screenHeight:900});
  const tree=await cdp.call('Page.getFrameTree');await cdp.call('Page.setDocumentContent',{frameId:tree.frameTree.frame.id,html});await sleep(300);
  assert(await cdp.eval(`document.body.dataset.uiVersion==='v7.6.0-matchday-immersion'`),'candidate not ready');

  await cdp.eval(`(()=>{const realNow=Date.now;Date.now=()=>101;GCC.newWorld();Date.now=realNow;GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8,t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('draft handoff');const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id);guard++}GCC.closeModal();GCC.enterTeamRoom();const ps=s.teams[s.userClub.abbr].map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),best=GCC.bestXI(ps).map(p=>p.id);GCC.clearXI();for(const id of best)GCC.toggleXI(id);if(s.battingOrder.length!==11)GCC.autoOrderXI();GCC.startSeason();return true})()`);

  await cdp.eval(`(()=>{for(let i=0;i<13;i++)GCC.playNextRound();return true})()`);await sleep(100);
  const before14=await cdp.eval(`JSON.stringify({round:GCC.state.round,seed:GCC.state.seed,results:GCC.state.results.length,forms:Object.fromEntries(GCC.state.pool.map(p=>[p.id,p.form||0]))})`);
  await cdp.eval(`GCC.openMatchdayPreview();true`);await sleep(80);
  const round14=await cdp.eval(`(()=>({text:document.querySelector('.matchday-preview')?.innerText||'',open:document.getElementById('modal')?.classList.contains('open'),overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  await shot('matchday-round14.png');
  const after14=await cdp.eval(`JSON.stringify({round:GCC.state.round,seed:GCC.state.seed,results:GCC.state.results.length,forms:Object.fromEntries(GCC.state.pool.map(p=>[p.id,p.form||0]))})`);
  assert(round14.open&&/MATCHDAY · ROUND 14/.test(round14.text),'Round 14 Matchday did not open',round14.text);
  assert(/regular season closes here/i.test(round14.text)&&/top four decided after today/i.test(round14.text),'Round 14 stakes wording failed',round14.text);
  assert(round14.overflow<=0,'Round 14 overflow',JSON.stringify(round14));
  assert(before14===after14,'Round 14 preview mutated state');
  await cdp.eval(`GCC.closeModal();GCC.playNextRound();true`);await sleep(100);

  await cdp.eval(`(()=>{const row=GCC.state.table[GCC.state.userClub.abbr];row.pts=999;row.nrr=9;GCC.state.regularSeasonPosition=1;GCC.renderSeason();GCC.proceedPostSeason();return true})()`);await sleep(100);
  if(await cdp.eval(`document.getElementById('modal')?.classList.contains('open')`))await cdp.eval(`GCC.enterFinalsFromModal();true`);
  let stage=await cdp.eval(`GCC.state.finals?.stage`);
  if(stage==='ready')await cdp.eval(`GCC.simulateFinals();true`);
  stage=await cdp.eval(`GCC.state.finals?.stage`);
  if(stage==='semis')await cdp.eval(`GCC.advanceFinals();true`);
  stage=await cdp.eval(`GCC.state.finals?.stage`);
  if(stage==='gf-ready')await cdp.eval(`GCC.simulateFinals();true`);
  await sleep(650);await cdp.eval(`GCC.closeModal();GCC.openSeasonReview();Dynasty.beginOffseason();true`);await sleep(100);
  await cdp.eval(`Dynasty.runCpuMarket();Dynasty.drawDraftOrder();Dynasty.startAnnualDraft();true`);
  let dg=0;
  while((await cdp.eval(`GCC.state.dynasty.offseason?.phase`))==='draft'&&dg++<50){
    const picked=await cdp.eval(`(()=>{const cards=[...document.querySelectorAll('#annualDraftPlayers .player-card')];if(!cards.length){Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();return false}const choices=cards.map(card=>{const nums=((card.getAttribute('onclick')||'').match(/\\d+/g)||[]).map(Number),id=nums[0],p=GCC.state.pool.find(x=>x.id===id);return{id,p,value:p?Dynasty.tradeValue(p,GCC.state.userClub.abbr):-999}}).filter(x=>x.id&&x.p).sort((a,b)=>b.value-a.value);if(!choices.length)return false;Dynasty.userAnnualDraft(choices[0].id);return true})()`);
    if(!picked)await cdp.eval(`Dynasty.runCpuDraftUntilUser();Dynasty.renderOffseason();true`);
  }
  let cg=0;
  while((await cdp.eval(`GCC.state.teams[GCC.state.userClub.abbr].length`))>15&&cg++<15){
    const id=await cdp.eval(`(()=>{const s=GCC.state,ids=[...s.teams[s.userClub.abbr]],ps=ids.map(id=>s.pool.find(p=>p.id===id)).filter(Boolean);return ps.slice().sort((a,z)=>Dynasty.tradeValue(a,s.userClub.abbr)-Dynasty.tradeValue(z,s.userClub.abbr))[0]?.id||null})()`);
    assert(id,'No 2009 Final 15 cut candidate');await cdp.eval(`Dynasty.cutPlayer(${id});true`);
  }
  await cdp.eval(`Dynasty.finishOffseason();Dynasty.enterTeamRoom();(()=>{const s=GCC.state,ps=s.teams[s.userClub.abbr].map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),best=GCC.bestXI(ps).map(p=>p.id);GCC.clearXI();for(const id of best)GCC.toggleXI(id);if(s.battingOrder.length!==11)GCC.autoOrderXI();GCC.startSeason();return true})()`);await sleep(120);
  const y=await cdp.eval(`GCC.state.year`);assert(y===2009,'Did not reach 2009',String(y));

  const injured=await cdp.eval(`(()=>{const s=GCC.state,id=s.xi.find(x=>{const p=s.pool.find(q=>q.id===x);return p&&p.role!=='WK-BAT'})||s.xi[0];s.dynasty.injuries={[id]:{status:'OUT',roundsLeft:2,type:'calf tightness'}};return{id,name:s.pool.find(p=>p.id===id)?.name}})()`);
  await cdp.eval(`GCC.openMatchdayPreview();true`);await sleep(100);
  const blocked=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,modal:document.getElementById('modal')?.classList.contains('open'),toast:document.getElementById('toast')?.textContent||''}))()`);
  await shot('matchday-2009-injury-block.png');
  assert(blocked.screen==='team'&&!blocked.modal,'Injured XI did not route to Team Room',JSON.stringify(blocked));
  assert(blocked.toast.includes(injured.name)&&/out/i.test(blocked.toast),'Injury toast is not player-specific',JSON.stringify({injured,blocked}));

  const repair=await cdp.eval(`(()=>{const s=GCC.state,bench=s.teams[s.userClub.abbr].find(id=>!s.xi.includes(id)&&s.dynasty.injuries?.[id]?.status!=='OUT');if(!bench)return{ok:false};GCC.beginSwap(bench);GCC.replaceXI(${injured.id});return{ok:true,bench,xi:s.xi.length,order:s.battingOrder.length}})()`);
  assert(repair.ok&&repair.xi===11&&repair.order===11,'Could not repair injured 2009 XI',JSON.stringify(repair));
  await cdp.eval(`GCC.openMatchdayPreview();true`);await sleep(100);
  const fixed=await cdp.eval(`(()=>({open:document.getElementById('modal')?.classList.contains('open'),text:document.querySelector('.matchday-preview')?.innerText||'',year:GCC.state.year,round:GCC.state.round,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);
  await shot('matchday-2009-repaired.png');
  assert(fixed.open&&fixed.year===2009&&fixed.round===0&&/MATCHDAY · ROUND 1/.test(fixed.text),'2009 repaired Matchday did not open',JSON.stringify(fixed));
  assert(fixed.overflow<=0,'2009 repaired Matchday overflow',JSON.stringify(fixed));

  const report={candidateSha:crypto.createHash('sha256').update(fs.readFileSync(GAME)).digest('hex'),round14,injured,blocked,repair,fixed};
  fs.writeFileSync(path.join(OUT,'edges.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}finally{
  cdp.close();try{proc.kill('SIGTERM')}catch{};try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
