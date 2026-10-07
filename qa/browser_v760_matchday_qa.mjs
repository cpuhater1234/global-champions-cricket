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

class CDP{
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map()}
  async open(){await new Promise((res,rej)=>{this.ws.addEventListener('open',res,{once:true});this.ws.addEventListener('error',()=>rej(new Error('ws open failed')),{once:true})});this.ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(!m.id)return;const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result||{})})}
  call(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}
  async eval(expression){const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)fail('Runtime eval',r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value}
  close(){try{this.ws.close()}catch{}}
}
async function target(port){for(let i=0;i<160;i++){try{const r=await fetch(`http://127.0.0.1:${port}/json/list`),a=await r.json(),p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('CDP target unavailable')}

async function runCase(label,preview,port){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),`gcc-v760-${label}-`));
  const proc=spawn(process.env.CHROME_BIN||'chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',`--remote-debugging-port=${port}`,'--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
  const t=await target(port),cdp=new CDP(t.webSocketDebuggerUrl);await cdp.open();await Promise.all([cdp.call('Page.enable'),cdp.call('Runtime.enable')]);
  const viewport=async(w,h)=>cdp.call('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<600,screenWidth:w,screenHeight:h});
  const shot=async name=>{const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUT,name),Buffer.from(r.data,'base64'))};
  try{
    await viewport(1440,900);const tree=await cdp.call('Page.getFrameTree');await cdp.call('Page.setDocumentContent',{frameId:tree.frameTree.frame.id,html});await sleep(350);
    const ready=await cdp.eval(`document.body.dataset.uiVersion==='v7.6.0-matchday-immersion'&&typeof GCC==='object'&&typeof Dynasty==='object'`);if(!ready)fail('candidate not ready');
    await cdp.eval(`(()=>{const realNow=Date.now;Date.now=()=>101;GCC.newWorld();Date.now=realNow;GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();const s=GCC.state;let guard=0;while(s.pickIndex<120&&guard<40){GCC.skipToMyPick();if(s.pickIndex>=120)break;const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8,t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('draft handoff');const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id);guard++}GCC.closeModal();GCC.enterTeamRoom();const ps=s.teams[s.userClub.abbr].map(id=>s.pool.find(p=>p.id===id)).filter(Boolean),best=GCC.bestXI(ps).map(p=>p.id);GCC.clearXI();for(const id of best)GCC.toggleXI(id);if(s.battingOrder.length!==11)GCC.autoOrderXI();GCC.startSeason();return true})()`);await sleep(150);
    const pre=await cdp.eval(`(()=>({seed:GCC.state.seed,round:GCC.state.round,results:GCC.state.results.length,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],forms:Object.fromEntries(GCC.state.pool.map(p=>[p.id,p.form||0]))}))()`);
    let previewData=null;
    if(preview){
      await cdp.eval(`GCC.openMatchdayPreview();true`);await sleep(100);
      previewData=await cdp.eval(`(()=>{const m=document.querySelector('.matchday-preview'),card=document.querySelector('.modal-card');return{open:document.getElementById('modal').classList.contains('open'),text:m?.innerText||'',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,cardScroll:card?.scrollHeight||0,cardClient:card?.clientHeight||0}})()`);
      await shot('matchday-desktop.png');
      await viewport(390,844);await sleep(100);previewData.mobile=await cdp.eval(`(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,cardScroll:document.querySelector('.modal-card')?.scrollHeight||0,cardClient:document.querySelector('.modal-card')?.clientHeight||0}))()`);await shot('matchday-mobile.png');
      await viewport(1440,900);await cdp.eval(`GCC.closeModal();GCC.openMatchdayPreview();GCC.closeModal();GCC.openMatchdayPreview();true`);await sleep(50);
      const afterPreview=await cdp.eval(`(()=>({seed:GCC.state.seed,round:GCC.state.round,results:GCC.state.results.length,xi:[...GCC.state.xi],order:[...GCC.state.battingOrder],forms:Object.fromEntries(GCC.state.pool.map(p=>[p.id,p.form||0]))}))()`);
      if(JSON.stringify(pre)!==JSON.stringify(afterPreview))fail('preview mutated state',JSON.stringify({pre,afterPreview}));
      await cdp.eval(`GCC.closeModal();GCC.playNextRound();true`);
    }else{
      await cdp.eval(`GCC.playNextRound();true`);
    }
    await sleep(120);
    const result=await cdp.eval(`(()=>{const s=GCC.state,r=s.results.find(x=>x.round===1);return{seed:s.seed,round:s.round,winner:r?.winner?.abbr,home:r?.home?.abbr,away:r?.away?.abbr,homeInnings:r?.homeInnings,awayInnings:r?.awayInnings,scorecard:r?.scorecard,forms:Object.fromEntries(s.pool.map(p=>[p.id,p.form||0]))}})()`);
    let laterPreview=null,runHomePreview=null;
    if(preview){await cdp.eval(`GCC.playNextRound();GCC.playNextRound();GCC.openMatchdayPreview();true`);await sleep(80);laterPreview=await cdp.eval(`(()=>({text:document.querySelector('.matchday-preview')?.innerText||'',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);await shot('matchday-round4.png');await cdp.eval(`GCC.closeModal();for(let i=0;i<7;i++)GCC.playNextRound();GCC.openMatchdayPreview();true`);await sleep(80);runHomePreview=await cdp.eval(`(()=>({text:document.querySelector('.matchday-preview')?.innerText||'',overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth}))()`);await shot('matchday-round11.png');}
    return{label,pre,previewData,laterPreview,runHomePreview,result};
  }finally{cdp.close();try{proc.kill('SIGTERM')}catch{};try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
}

const direct=await runCase('direct',false,9356);
const preview=await runCase('preview',true,9357);
const a=JSON.stringify(direct.result),b=JSON.stringify(preview.result);
const identical=a===b;
const report={candidateSha:crypto.createHash('sha256').update(fs.readFileSync(GAME)).digest('hex'),identical,direct,preview};
fs.writeFileSync(path.join(OUT,'qa.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({candidateSha:report.candidateSha,identical,preview:preview.previewData,result:{winner:preview.result.winner,home:preview.result.home,away:preview.result.away,homeScore:`${preview.result.homeInnings.total}/${preview.result.homeInnings.wickets}`,awayScore:`${preview.result.awayInnings.total}/${preview.result.awayInnings.wickets}`}},null,2));
process.exit(identical?0:1);
