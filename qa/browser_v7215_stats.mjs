import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const BASE=path.join(ROOT,'game','global_champions_cricket_v7_2_14_year_shell_continuity.html');
const WEATHER=path.join(ROOT,'game','global_champions_cricket_v7_2_15_match_day_conditions.html');
const OUT=path.join(ROOT,'qa','output','v7215-conditions-audit');
fs.mkdirSync(OUT,{recursive:true});
function fail(m,d=''){throw new Error(d?`${m}: ${d}`:m)}
function assert(c,m,d=''){if(!c)fail(m,d)}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function expose(html){
  const marker="    toast\n  };\n})();";
  if(!html.includes(marker)) fail('QA export marker missing');
  return html.replace(marker,"    __qaSimulateInningsPair: simulateInningsPair,\n    toast\n  };\n})();");
}
const pages={
  '/base.html':expose(fs.readFileSync(BASE,'utf8')),
  '/weather.html':expose(fs.readFileSync(WEATHER,'utf8'))
};
const server=http.createServer((req,res)=>{
  const body=pages[req.url];
  if(body){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(body)}
  else if(req.url==='/favicon.ico'){res.writeHead(204);res.end()}
  else{res.writeHead(404);res.end('not found')}
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8781,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'chromium';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v7215-stats-'));
const proc=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=9238','--remote-allow-origins=*',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe']});
let stderr='';proc.stderr.on('data',d=>stderr+=d.toString());
async function pageTarget(){for(let i=0;i<160;i++){try{const r=await fetch('http://127.0.0.1:9238/json/list');const a=await r.json();const p=a.find(x=>x.type==='page');if(p?.webSocketDebuggerUrl)return p}catch{}await sleep(100)}fail('Chrome CDP unavailable',stderr.slice(-1200))}
class CDP{
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map()}
  async open(){await new Promise((resolve,reject)=>{this.ws.addEventListener('open',resolve,{once:true});this.ws.addEventListener('error',()=>reject(new Error('WebSocket open failed')),{once:true})});this.ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(!m.id)return;const p=this.pending.get(m.id);if(!p)return;this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result||{})})}
  call(method,params={}){const id=++this.id;return new Promise((resolve,reject)=>{this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params}))})}
  async eval(expression){const r=await this.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true,userGesture:true});if(r.exceptionDetails)fail('Runtime evaluation failed',r.exceptionDetails.exception?.description||r.exceptionDetails.text||JSON.stringify(r.exceptionDetails));return r.result?.value}
  close(){try{this.ws.close()}catch{}}
}
const target=await pageTarget();const cdp=new CDP(target.webSocketDebuggerUrl);
async function ready(){for(let i=0;i<260;i++){if(await cdp.eval(`document.readyState==='complete'&&typeof window.GCC==='object'&&typeof GCC.__qaSimulateInningsPair==='function'`))return;await sleep(100)}fail('QA game did not become ready')}
async function nav(page){await cdp.call('Page.navigate',{url:`http://127.0.0.1:8781/${page}.html`});await ready()}
async function setup(){
  return cdp.eval(`(()=>{localStorage.clear();sessionStorage.clear();GCC.newWorld();GCC.skipLeagueReveal();GCC.finishLeagueReveal();GCC.selectClub(0);GCC.confirmClub();GCC.skipRecruitment();GCC.setupDraft();GCC.skipDraftReveal();GCC.beginDraft();let guard=0;while(GCC.state.pickIndex<120&&guard++<40){GCC.skipToMyPick();if(GCC.state.pickIndex>=120)break;const s=GCC.state,round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8,t=s.draftOrder[round%2===0?pos:7-pos];if(!t||t.abbr!==s.userClub.abbr)throw new Error('skipToMyPick failed');const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];GCC.userDraft(p.id);}if(document.getElementById('modal')?.classList.contains('open'))GCC.closeModal();GCC.enterTeamRoom();GCC.selectRecommendedXI();GCC.startSeason();const f=GCC.state.schedule[0];return{user:GCC.state.userClub.abbr,home:f.home.abbr,away:f.away.abbr,ground:f.home.ground,xi:GCC.state.xi.length,rounds:GCC.state.fullSchedule.length};})()`);
}
async function sample(){
  return cdp.eval(`(()=>{const f=GCC.state.schedule[0],home=f.home,away=f.away;const rows=[];for(let i=0;i<500;i++){const seed=((123456789+(i*2654435761))>>>0)||1;GCC.state.seed=seed;const p=GCC.__qaSimulateInningsPair(home,away,1);rows.push({seed,weather:p.weather?.code||'BASE',hi:{t:p.hi.total,w:p.hi.wickets,pp:p.hi.pp,mid:p.hi.mid,death:p.hi.death},ai:{t:p.ai.total,w:p.ai.wickets,pp:p.ai.pp,mid:p.ai.mid,death:p.ai.death}})}return rows})()`);
}
function observations(rows){return rows.flatMap(r=>[{seed:r.seed,weather:r.weather,...r.hi},{seed:r.seed,weather:r.weather,...r.ai}])}
function mean(a){return a.reduce((s,x)=>s+x,0)/a.length}
function sd(a){const m=mean(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/a.length)}
function deltaStats(base,target,code=null){
  const pairs=[];
  for(let i=0;i<target.length;i++) if(!code||target[i].weather===code) pairs.push([base[i],target[i]]);
  return {
    n:pairs.length,
    total:mean(pairs.map(([a,b])=>b.t-a.t)),
    wickets:mean(pairs.map(([a,b])=>b.w-a.w)),
    pp:mean(pairs.map(([a,b])=>b.pp-a.pp)),
    middle:mean(pairs.map(([a,b])=>b.mid-a.mid)),
    death:mean(pairs.map(([a,b])=>b.death-a.death))
  };
}
try{
  await cdp.open();
  await cdp.call('Page.enable');
  await cdp.call('Runtime.enable');
  await cdp.call('Page.addScriptToEvaluateOnNewDocument',{source:'Date.now=()=>1234567890;'});
  await nav('base');const baseSetup=await setup();const baseRows=await sample();
  await nav('weather');const weatherSetup=await setup();const weatherRows=await sample();
  assert(JSON.stringify(baseSetup)===JSON.stringify(weatherSetup),'Base/weather deterministic setup diverged',JSON.stringify({baseSetup,weatherSetup}));
  assert(baseRows.length===500&&weatherRows.length===500,'Paired sample size wrong');
  const b=observations(baseRows),w=observations(weatherRows);
  assert(b.length===1000&&w.length===1000,'Innings sample size wrong');
  const settledIndexes=w.map((x,i)=>[x,i]).filter(([x])=>x.weather==='SETTLED').map(([,i])=>i);
  assert(settledIndexes.length>250,'Too few settled innings for exact-equality gate',String(settledIndexes.length));
  const settledMismatch=settledIndexes.filter(i=>JSON.stringify({...b[i],weather:'SETTLED'})!==JSON.stringify(w[i]));
  assert(settledMismatch.length===0,'Settled weather changed v7.2.14 simulation output',JSON.stringify(settledMismatch.slice(0,10)));
  const summary={
    setup:weatherSetup,
    base:{meanTotal:mean(b.map(x=>x.t)),sdTotal:sd(b.map(x=>x.t)),meanWickets:mean(b.map(x=>x.w))},
    weather:{meanTotal:mean(w.map(x=>x.t)),sdTotal:sd(w.map(x=>x.t)),meanWickets:mean(w.map(x=>x.w))},
    overall:deltaStats(b,w),
    settled:deltaStats(b,w,'SETTLED'),
    overcast:deltaStats(b,w,'OVERCAST'),
    coolDamp:deltaStats(b,w,'COOL_DAMP'),
    hotDry:deltaStats(b,w,'HOT_DRY')
  };
  summary.meanShift=summary.weather.meanTotal-summary.base.meanTotal;
  summary.sdShift=summary.weather.sdTotal-summary.base.sdTotal;
  summary.wicketShift=summary.weather.meanWickets-summary.base.meanWickets;
  assert(Math.abs(summary.meanShift)<1.5,'Weather materially shifted league scoring mean',JSON.stringify(summary));
  assert(Math.abs(summary.sdShift)<2.5,'Weather materially shifted innings variance',JSON.stringify(summary));
  assert(Math.abs(summary.wicketShift)<.40,'Weather materially shifted wickets league-wide',JSON.stringify(summary));
  assert(summary.settled.total===0&&summary.settled.wickets===0&&summary.settled.pp===0&&summary.settled.middle===0&&summary.settled.death===0,'Settled condition is not an exact baseline',JSON.stringify(summary.settled));
  assert(summary.overcast.n>70&&summary.overcast.total>-4&&summary.overcast.total<1.5,'Overcast scoring effect is too large or wrong-direction',JSON.stringify(summary.overcast));
  assert(summary.coolDamp.n>35&&summary.coolDamp.total>-5&&summary.coolDamp.total<1.5,'Cool/damp scoring effect is too large',JSON.stringify(summary.coolDamp));
  assert(summary.hotDry.n>120&&summary.hotDry.total>-1.5&&summary.hotDry.total<3,'Hot/dry scoring effect is too large',JSON.stringify(summary.hotDry));
  fs.writeFileSync(path.join(OUT,'statistical-report.json'),JSON.stringify(summary,null,2));
  console.log('v7.2.15 paired statistical QA OK');
  console.log(JSON.stringify(summary,null,2));
}finally{cdp.close();proc.kill('SIGTERM');server.close()}
