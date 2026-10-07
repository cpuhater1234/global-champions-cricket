import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import crypto from 'node:crypto';

const ROOT=process.cwd();
const V750=path.join(ROOT,'game','global_champions_cricket_v7_5_0_dynasty_memory.html');
const V760=path.join(ROOT,'game','global_champions_cricket_v7_6_0_matchday_immersion.html');
const OUT=path.join(ROOT,'qa','output','v760-matchday');fs.mkdirSync(OUT,{recursive:true});
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

const foundation=`(()=>{const realNow=Date.now;Date.now=()=>101;GCC.newWorld();Date.now=realNow;GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8,t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('draft handoff');const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id);guard++}GCC.closeModal();GCC.enterTeamRoom();const ps=s.teams[s.userClub.abbr].map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),best=GCC.bestXI(ps).map(p=>p.id);GCC.clearXI();for(const id of best)GCC.toggleXI(id);if(s.battingOrder.length!==11)GCC.autoOrderXI();GCC.startSeason();return true})()`;

async function withGame(file,port,fn){
  const html=fs.readFileSync(file,'utf8'),profile=fs.mkdtempSync(path.join(os.tmpdir(),`gcc-v760-reg-${port}-`));
  const proc=spawn(process.env.CHROME_BIN||'chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,'--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
  const t=await target(port),cdp=new CDP(t.webSocketDebuggerUrl);await cdp.open();await Promise.all([cdp.call('Page.enable'),cdp.call('Runtime.enable')]);
  try{const tree=await cdp.call('Page.getFrameTree');await cdp.call('Page.setDocumentContent',{frameId:tree.frameTree.frame.id,html});await sleep(300);return await fn(cdp)}
  finally{cdp.close();try{proc.kill('SIGTERM')}catch{};try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
}

async function oneRound(file,port,usePreview){
  return withGame(file,port,async cdp=>{
    await cdp.eval(foundation);
    if(usePreview){await cdp.eval(`GCC.openMatchdayPreview();true`);await sleep(60);assert(await cdp.eval(`document.getElementById('modal')?.classList.contains('open')`),'Matchday preview did not open');await cdp.eval(`GCC.closeModal();GCC.playNextRound();true`)}
    else await cdp.eval(`GCC.playNextRound();true`);
    await sleep(100);
    const story=await cdp.eval(`document.getElementById('matchStory')?.innerText.trim()||''`);
    await cdp.eval(`GCC.openScorecard(1);true`);await sleep(60);
    const scorecard=await cdp.eval(`document.querySelector('.scorecard-shell')?.innerText.trim()||''`);
    const result=await cdp.eval(`(()=>{const r=GCC.state.results.find(x=>x.round===1);return{winner:r?.winner?.abbr,home:r?.homeInnings,away:r?.awayInnings}})()`);
    return{story,scorecard,result};
  });
}

const parent=await oneRound(V750,9365,false);
const candidate=await oneRound(V760,9366,true);
assert(JSON.stringify(parent.result)===JSON.stringify(candidate.result),'Round 1 data changed');
assert(parent.story===candidate.story,'Accepted Matchday result card changed',JSON.stringify({parent:parent.story,candidate:candidate.story}));
assert(parent.scorecard===candidate.scorecard,'Accepted scorecard presentation changed');

const fast=await withGame(V760,9367,async cdp=>{
  await cdp.eval(foundation);
  await cdp.eval(`(()=>{GCC.state.seasonSpeedIndex=2;GCC.simulateSeason();return true})()`);
  let done=false;
  for(let i=0;i<120;i++){const r=await cdp.eval(`GCC.state.round`);if(r>=14){done=true;break}await sleep(100)}
  assert(done,'RUN SEASON did not finish');
  const state=await cdp.eval(`(()=>({round:GCC.state.round,results:GCC.state.results.length,running:!!GCC.state.seasonRunning,preview:!!document.querySelector('.matchday-preview'),modal:document.getElementById('modal')?.classList.contains('open')}))()`);
  assert(state.round===14&&state.results===14&&!state.running&&!state.preview,'RUN SEASON regression',JSON.stringify(state));
  await cdp.eval(`(()=>{GCC.state.regularSeasonPosition=1;GCC.proceedPostSeason();return true})()`);await sleep(60);
  const finals=await cdp.eval(`(()=>({screen:document.querySelector('.screen.active')?.id,title:document.getElementById('finalsTitle')?.textContent.trim()||'',intro:document.getElementById('finalsIntro')?.textContent.trim()||'',preview:!!document.querySelector('.matchday-preview')}))()`);
  assert(finals.screen==='finals'&&!finals.preview,'Finals flow intercepted by Matchday',JSON.stringify(finals));
  return{state,finals};
});

const report={candidateSha:crypto.createHash('sha256').update(fs.readFileSync(V760)).digest('hex'),resultCardIdentical:true,scorecardIdentical:true,fast};
fs.writeFileSync(path.join(OUT,'final-regression.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
