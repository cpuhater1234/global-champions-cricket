#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import {spawn} from 'node:child_process';

const root=new URL('../',import.meta.url);
const gameFile=process.env.GCC_GAME_FILE||'global_champions_cricket_v7_5_0_dynasty_memory.html';
const html=fs.readFileSync(new URL('game/'+gameFile,root),'utf8');
const chrome=process.env.CHROME_BIN||'/usr/bin/chromium';
const port=9335;
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu',`--remote-debugging-port=${port}`,'--remote-allow-origins=*','about:blank'],{stdio:'ignore'});

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function getJson(path){
  return new Promise((resolve,reject)=>{
    http.get({host:'127.0.0.1',port,path},res=>{
      let s='';res.on('data',d=>s+=d);res.on('end',()=>{try{resolve(JSON.parse(s))}catch(e){reject(e)}});
    }).on('error',reject);
  });
}
async function main(){
  let pages;
  for(let i=0;i<60;i++){try{pages=await getJson('/json');if(pages?.length)break}catch{}await sleep(100)}
  if(!pages?.length)throw new Error('Chrome DevTools target unavailable');
  const ws=new WebSocket(pages[0].webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
  let seq=0;
  const pending=new Map();
  ws.onmessage=e=>{const r=JSON.parse(e.data);if(r.id&&pending.has(r.id)){pending.get(r.id)(r);pending.delete(r.id)}};
  const call=(method,params={})=>new Promise((resolve,reject)=>{
    const id=++seq;pending.set(id,r=>r.error?reject(new Error(JSON.stringify(r.error))):resolve(r.result||{}));
    ws.send(JSON.stringify({id,method,params}));
  });
  const ev=async expression=>{
    const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result?.value;
  };
  await call('Page.enable');await call('Runtime.enable');
  const tree=await call('Page.getFrameTree');
  await call('Page.setDocumentContent',{frameId:tree.frameTree.frame.id,html});
  await sleep(500);
  if(await ev('document.body.dataset.uiVersion')!=='v7.5.0-dynasty-memory')throw new Error('wrong UI version');
  const setup=`(()=>{
    const state=GCC.state;GCC.newWorld();state.userClub=state.league[0];
    const [p1,p2,p3,p4,p5,p6]=state.pool;
    const st=(m,r,w,hs,bw,br,s)=>({matches:m,innings:m,runs:r,balls:Math.round(r*1.1),outs:Math.max(0,m-1),fours:Math.round(r/20),sixes:s,wickets:w,bowlBalls:w?m*18:0,runsConceded:w?m*22:0,bestRuns:hs,bestWickets:bw,bestBowlingRuns:br});
    state.dynasty={version:1,started:true,history:[],playerCareer:{},clubCareer:{},transactions:[],injuries:{},replacementFor:{},replacementOf:{},offseason:null,archivedYears:{},midseasonDone:{},captainByClub:{},seasonOpeningRosters:{},userSeasonLedger:{},lastScreen:'world',manager:{titles:1,finals:1,finalsApps:2,wins:24,losses:18,matches:42,bestFinish:1},saveStamp:0};
    state.dynasty.history=[
      {year:2008,champion:state.league[0].abbr,userPosition:1,wins:10,losses:4,played:14,finals:true,grandFinal:true,title:true,roster:[],playerStats:{[p1.id]:st(14,612,0,94,0,null,22),[p2.id]:st(14,455,18,71,4,21,8),[p3.id]:st(14,190,24,31,5,18,3)},userPlayerStats:{}},
      {year:2009,champion:state.league[1].abbr,userPosition:3,wins:8,losses:6,played:14,finals:true,grandFinal:false,title:false,roster:[],playerStats:{[p1.id]:st(14,530,0,82,0,null,18),[p4.id]:st(14,480,4,88,2,29,17),[p3.id]:st(14,155,27,28,5,16,2)},userPlayerStats:{}},
      {year:2010,champion:state.league[2].abbr,userPosition:6,wins:6,losses:8,played:14,finals:false,grandFinal:false,title:false,roster:[],playerStats:{[p5.id]:st(14,650,1,112,1,40,28),[p6.id]:st(14,210,31,45,6,19,4)},userPlayerStats:{}}
    ];
    state.dynasty.clubCareer={
      [state.league[0].abbr]:{name:state.league[0].name,titles:1,finals:1,seasons:3,wins:24},
      [state.league[1].abbr]:{name:state.league[1].name,titles:1,finals:1,seasons:3,wins:22},
      [state.league[2].abbr]:{name:state.league[2].name,titles:1,finals:1,seasons:3,wins:20}
    };
    state.dynasty.playerCareer={
      [p1.id]:{name:p1.name,country:p1.country,seasons:3,matches:42,runs:1500,wickets:0,titles:1,clubs:[state.userClub.abbr]},
      [p2.id]:{name:p2.name,country:p2.country,seasons:2,matches:28,runs:850,wickets:25,titles:1,clubs:[state.userClub.abbr]},
      [p3.id]:{name:p3.name,country:p3.country,seasons:3,matches:42,runs:600,wickets:55,titles:1,clubs:[state.userClub.abbr]}
    };
    Dynasty.openArchive();return true;
  })()`;
  await ev(setup);await sleep(200);
  const desktop=await ev(`JSON.stringify({
    sections:document.querySelectorAll('#archive .archive-section').length,
    rows:document.querySelectorAll('#archive .archive-season').length,
    honours:document.querySelectorAll('#archive .archive-honour-row').length,
    records:document.querySelectorAll('#archive .archive-record').length,
    legends:document.querySelectorAll('#archive .archive-legend-row').length,
    overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth
  })`);
  const d=JSON.parse(desktop);
  if(d.sections!==4||d.rows!==3||d.records!==8||d.legends!==3||d.overflow)throw new Error('desktop archive assertion '+desktop);
  await ev('Dynasty.openArchiveSeason(2009)');await sleep(50);
  const detail=await ev(`JSON.stringify({
    open:document.getElementById('modal').classList.contains('open'),
    summary:document.querySelector('.archive-detail-summary')?.textContent||'',
    leaders:document.querySelectorAll('.archive-detail-leaders>div').length,
    tables:document.querySelectorAll('.archive-detail-tables>div').length
  })`);
  const x=JSON.parse(detail);
  if(!x.open||!x.summary.includes('Finished 3rd')||x.leaders!==3||x.tables!==2)throw new Error('season detail assertion '+detail);
  await ev("GCC.closeModal()");
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await sleep(100);
  const mobile=await ev(`JSON.stringify({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,cols:getComputedStyle(document.querySelector('#archive .archive-record-grid')).gridTemplateColumns})`);
  const m=JSON.parse(mobile);
  if(m.sw>m.cw)throw new Error('mobile horizontal overflow '+mobile);
  console.log('v7.5 browser archive QA PASS');
  console.log('desktop',desktop);
  console.log('season detail',detail);
  console.log('mobile',mobile);
  ws.close();
}
main().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{proc.kill('SIGTERM')});
