import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_6_0_matchday_immersion.html');
const OUT=path.join(ROOT,'qa','output','v760-matchday-depth');fs.mkdirSync(OUT,{recursive:true});
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
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v760-depth-'));
const port=9318;
const proc=spawn(process.env.CHROME_BIN||'chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,'--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
let cdp;
try{
  const t=await target(port);cdp=new CDP(t.webSocketDebuggerUrl);await cdp.open();await Promise.all([cdp.call('Page.enable'),cdp.call('Runtime.enable')]);
  const viewport=(w,h)=>cdp.call('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<600,screenWidth:w,screenHeight:h});
  const shot=async name=>{const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))};
  await viewport(1440,900);const tree=await cdp.call('Page.getFrameTree');await cdp.call('Page.setDocumentContent',{frameId:tree.frameTree.frame.id,html});await sleep(350);
  assert(await cdp.eval(`document.body.dataset.uiVersion==='v7.6.0-matchday-immersion'&&typeof GCC==='object'`),'candidate not ready');
  await cdp.eval(`(()=>{Date.now=()=>101;GCC.newWorld();GCC.state.seed=101;GCC.state.weatherSeed=101;GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8,t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('draft handoff');const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id);guard++}GCC.closeModal();GCC.enterTeamRoom();const ps=s.teams[s.userClub.abbr].map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),best=GCC.bestXI(ps).map(p=>p.id);GCC.clearXI();for(const id of best)GCC.toggleXI(id);if(s.battingOrder.length!==11)GCC.autoOrderXI();GCC.startSeason();return true})()`);
  const snap=()=>cdp.eval(`(()=>({round:GCC.state.round,seed:GCC.state.seed,results:GCC.state.results.length,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],table:JSON.stringify(GCC.state.table),forms:JSON.stringify(Object.fromEntries(GCC.state.pool.map(p=>[p.id,p.form||0])))}))()`);
  async function previewAt(label,expectedRound){
    const before=await snap();await cdp.eval('GCC.openMatchdayPreview();true');await sleep(70);
    const view=await cdp.eval(`(()=>{const m=document.querySelector('.matchday-preview'),card=document.querySelector('.modal-card');return{text:m?.innerText||'',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,open:document.getElementById('modal').classList.contains('open'),cardScroll:card?.scrollHeight||0,cardClient:card?.clientHeight||0}})()`);
    const after=await snap();assert(JSON.stringify(before)===JSON.stringify(after),label+' preview mutated state');assert(view.open&&view.text.includes('MATCHDAY · ROUND '+expectedRound),label+' wrong round',view.text);assert(view.overflow<=1,label+' desktop overflow',JSON.stringify(view));
    await shot(label+'-desktop.png');await viewport(390,844);await sleep(60);const mobile=await cdp.eval(`(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,actions:getComputedStyle(document.querySelector('.matchday-actions')).position,play:document.querySelector('.matchday-actions .primary')?.textContent.trim()}))()`);assert(mobile.overflow<=1&&mobile.actions==='sticky'&&mobile.play==='PLAY MATCH',label+' mobile gate',JSON.stringify(mobile));await shot(label+'-mobile.png');await viewport(1440,900);await cdp.eval('GCC.closeModal();true');return{view,mobile};
  }
  const r1=await previewAt('round1',1);assert(/A new season starts\./.test(r1.view.text),'Round 1 stakes missing');
  for(let i=0;i<6;i++)await cdp.eval('GCC.playNextRound();true');
  const r7=await previewAt('round7',7);assert(/The table matters now\./.test(r7.view.text)&&/matches still to follow after today/.test(r7.view.text),'Round 7 stakes missing',r7.view.text);
  for(let i=0;i<7;i++)await cdp.eval('GCC.playNextRound();true');
  const r14=await previewAt('round14',14);assert(/The regular season closes here/.test(r14.view.text)&&!/1 match left after today/.test(r14.view.text),'Round 14 stakes incorrect',r14.view.text);
  // Fresh world: RUN SEASON must bypass Matchday entirely.
  await cdp.eval(`(()=>{Date.now=()=>101;GCC.newWorld();GCC.state.seed=101;GCC.state.weatherSeed=101;GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8,t=s.draftOrder[round%2===0?pos:7-pos];const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id);guard++}GCC.closeModal();GCC.enterTeamRoom();const ps=s.teams[s.userClub.abbr].map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),best=GCC.bestXI(ps).map(p=>p.id);GCC.clearXI();for(const id of best)GCC.toggleXI(id);if(s.battingOrder.length!==11)GCC.autoOrderXI();GCC.startSeason();window.__mdOpenCount=0;const __md=GCC.openMatchdayPreview;GCC.openMatchdayPreview=(...a)=>{window.__mdOpenCount++;return __md(...a)};GCC.simulateSeason();return true})()`);await sleep(120);
  const fast=await cdp.eval(`(()=>({round:GCC.state.round,running:GCC.state.seasonRunning,opens:window.__mdOpenCount||0,modal:document.getElementById('modal').classList.contains('open')}))()`);assert(fast.round>0&&fast.opens===0&&!fast.modal,'RUN SEASON entered Matchday',JSON.stringify(fast));
  const report={candidateSha:crypto.createHash('sha256').update(fs.readFileSync(GAME)).digest('hex'),round1:r1.view.text,round7:r7.view.text,round14:r14.view.text,fast};fs.writeFileSync(path.join(OUT,'qa.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({candidateSha:report.candidateSha,rounds:[1,7,14],fast},null,2));
}finally{
  cdp?.close();try{proc.kill('SIGTERM')}catch{};try{fs.rmSync(profile,{recursive:true,force:true})}catch{}
}
process.exit(0);
