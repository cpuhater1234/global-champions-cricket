import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';

const ROOT=process.cwd();
const GAME=path.join(ROOT,'game','global_champions_cricket_v7_2_6_foundation_save_continuity.html');
const OUT=path.join(ROOT,'qa','output','v726-foundation-save');
fs.mkdirSync(OUT,{recursive:true});

function fail(message,detail=''){throw new Error(detail?`${message}: ${detail}`:message)}
function assert(cond,message,detail=''){if(!cond)fail(message,detail)}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}

const html=fs.readFileSync(GAME);
const server=http.createServer((req,res)=>{
  if(req.url==='/'||req.url==='/game.html'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    res.end(html);
  }else if(req.url==='/favicon.ico'){
    res.writeHead(204);res.end();
  }else{
    res.writeHead(404);res.end('not found');
  }
});
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(8769,'127.0.0.1',resolve)});

const chrome=process.env.CHROME_BIN||'google-chrome';
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-v726-save-'));
const proc=spawn(chrome,[
  '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
  '--remote-debugging-port=9226','--remote-allow-origins=*',
  '--disable-background-networking','--disable-component-update',
  `--user-data-dir=${profile}`,'about:blank'
],{stdio:['ignore','pipe','pipe']});
let chromeStderr='';
proc.stderr.on('data',d=>{chromeStderr+=d.toString()});

async function getPageTarget(){
  for(let i=0;i<300;i++){
    if(proc.exitCode!==null)fail('Chrome exited before CDP became ready',chromeStderr.slice(-1800));
    try{
      const r=await fetch('http://127.0.0.1:9226/json/list');
      const arr=await r.json();
      const page=arr.find(x=>x.type==='page');
      if(page?.webSocketDebuggerUrl)return page;
    }catch{}
    await sleep(100);
  }
  fail('Chrome CDP unavailable',chromeStderr.slice(-1800));
}

class CDP{
  constructor(url){this.ws=new WebSocket(url);this.id=0;this.pending=new Map();this.listeners=new Map()}
  async open(){
    await new Promise((resolve,reject)=>{
      this.ws.addEventListener('open',resolve,{once:true});
      this.ws.addEventListener('error',()=>reject(new Error('WebSocket open failed')),{once:true});
    });
    this.ws.addEventListener('message',e=>{
      const msg=JSON.parse(e.data);
      if(msg.id){
        const p=this.pending.get(msg.id);if(!p)return;
        this.pending.delete(msg.id);
        if(msg.error)p.reject(new Error(`${msg.error.message} ${JSON.stringify(msg.error.data||'')}`));
        else p.resolve(msg.result||{});
      }else if(msg.method){
        for(const fn of this.listeners.get(msg.method)||[])fn(msg.params||{});
      }
    });
  }
  on(method,fn){if(!this.listeners.has(method))this.listeners.set(method,[]);this.listeners.get(method).push(fn)}
  call(method,params={}){
    const id=++this.id;
    return new Promise((resolve,reject)=>{
      this.pending.set(id,{resolve,reject});
      this.ws.send(JSON.stringify({id,method,params}));
    });
  }
  async eval(expression){
    const r=await this.call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true,userGesture:true});
    if(r.exceptionDetails)fail('Runtime evaluation failed',r.exceptionDetails.exception?.description||r.exceptionDetails.text||JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  }
  close(){try{this.ws.close()}catch{}}
}

const target=await getPageTarget();
const cdp=new CDP(target.webSocketDebuggerUrl);
const runtimeErrors=[];
const consoleErrors=[];

try{
  await cdp.open();
  cdp.on('Runtime.exceptionThrown',p=>runtimeErrors.push(p.exceptionDetails?.exception?.description||p.exceptionDetails?.text||JSON.stringify(p)));
  cdp.on('Runtime.consoleAPICalled',p=>{
    if(p.type==='error')consoleErrors.push((p.args||[]).map(a=>a.value??a.description??'').join(' '));
  });
  cdp.on('Log.entryAdded',p=>{if(p.entry?.level==='error')consoleErrors.push(p.entry.text)});
  await Promise.all([cdp.call('Page.enable'),cdp.call('Runtime.enable'),cdp.call('Log.enable')]);
  await cdp.call('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__qaErrors=[];
    window.addEventListener('error',e=>window.__qaErrors.push('error: '+String(e.message||e.error||'unknown')));
    window.addEventListener('unhandledrejection',e=>window.__qaErrors.push('rejection: '+String(e.reason)));
  `});

  async function viewport(width,height){
    await cdp.call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600,screenWidth:width,screenHeight:height});
  }
  async function ready(){
    for(let i=0;i<280;i++){
      if(await cdp.eval(`document.readyState==='complete'&&typeof window.GCC==='object'&&typeof window.Dynasty==='object'`))return;
      await sleep(100);
    }
    fail('Game did not become ready');
  }
  async function navigate(){
    await cdp.call('Page.navigate',{url:'http://127.0.0.1:8769/game.html'});
    await ready();
  }
  async function reload(){
    await cdp.call('Page.reload',{ignoreCache:true});
    await ready();
  }
  async function shot(file){
    const r=await cdp.call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(OUT,file),Buffer.from(r.data,'base64'));
  }
  async function noErrors(stage){
    const page=await cdp.eval(`window.__qaErrors||[]`);
    assert(page.length===0,`${stage}: page errors`,JSON.stringify(page));
    assert(runtimeErrors.length===0,`${stage}: runtime exceptions`,JSON.stringify(runtimeErrors));
    assert(consoleErrors.length===0,`${stage}: console errors`,JSON.stringify(consoleErrors));
  }
  async function launcherState(){
    return cdp.eval(`(()=>({
      launcherHidden:document.getElementById('careerLauncher')?.hidden,
      continueHidden:document.getElementById('launcherContinue')?.hidden,
      heroHidden:document.getElementById('homeHero')?.hidden,
      league:GCC.state.league.length,
      pool:GCC.state.pool.length,
      user:!!GCC.state.userClub,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    }))()`);
  }
  async function assertLightLauncher(stage){
    const s=await launcherState();
    assert(s.launcherHidden===false&&s.continueHidden===false&&s.heroHidden===true,`${stage}: Continue launcher not shown`,JSON.stringify(s));
    assert(s.league===0&&s.pool===0&&!s.user,`${stage}: dynasty hydrated before Continue`,JSON.stringify(s));
    assert(s.overflow<=1,`${stage}: launcher horizontal overflow`,String(s.overflow));
    return s;
  }
  async function stored(){
    return cdp.eval(`(()=>{const raw=localStorage.getItem('gcc_dynasty_v7_2');return raw?JSON.parse(raw):null})()`);
  }
  async function continueDynasty(){
    return cdp.eval(`(()=>{Dynasty.continueFromLauncher();return{
      screen:document.querySelector('.screen.active')?.id,
      user:GCC.state.userClub?.abbr||null,
      xi:GCC.state.xi?.length||0,
      order:GCC.state.battingOrder?.length||0,
      pickIndex:GCC.state.pickIndex||0,
      draftOrder:(GCC.state.draftOrder||[]).map(c=>c.abbr),
      recruitDay:GCC.state.recruit?.day??null,
      recruitFeed:GCC.state.recruit?.feed?.length??null,
      recruitRunning:GCC.state.recruit?.running??null,
      squad:GCC.state.userClub?(GCC.state.teams[GCC.state.userClub.abbr]?.length||0):0,
      round:GCC.state.round??null,
      fullRounds:GCC.state.fullSchedule?.length||0,
      userFixtures:GCC.state.schedule?.length||0
    }})()`);
  }

  await viewport(1440,900);
  await navigate();
  await cdp.eval(`localStorage.clear();sessionStorage.clear();true`);
  await reload();

  const clean=await launcherState();
  assert(!clean.launcherHidden&&clean.continueHidden&&clean.heroHidden,'Clean boot launcher incorrect',JSON.stringify(clean));
  assert(clean.league===0&&clean.pool===0&&!clean.user,'Clean boot hydrated dynasty',JSON.stringify(clean));
  await shot('01-clean-launcher.png');

  // Start the 2008 foundation and lock a club.
  const club=await cdp.eval(`(()=>{
    Dynasty.requestNewDynasty();
    GCC.newWorld();
    GCC.skipLeagueReveal();
    GCC.finishLeagueReveal();
    GCC.selectClub(0);
    GCC.confirmClub();
    const save=JSON.parse(localStorage.getItem('gcc_dynasty_v7_2'));
    return{
      screen:document.querySelector('.screen.active')?.id,
      user:GCC.state.userClub?.abbr,
      league:GCC.state.league.length,
      pool:GCC.state.pool.length,
      savedScreen:save?.currentScreen,
      savedUser:save?.state?.userClub?.abbr,
      version:save?.version
    };
  })()`);
  assert(club.screen==='recruit'&&club.user&&club.league===8&&club.pool>200,'Club lock did not reach Signing Week',JSON.stringify(club));
  assert(club.savedScreen==='recruit'&&club.savedUser===club.user,'Club lock was not checkpointed',JSON.stringify(club));
  assert(club.version==='7.2.0','Save schema changed unexpectedly',JSON.stringify(club));

  // Hard reload boundary 1: club -> Signing Week.
  await reload();
  const clubLauncher=await assertLightLauncher('club reload');
  const clubResume=await continueDynasty();
  assert(clubResume.screen==='recruit'&&clubResume.user===club.user,'Club/Signing resume failed',JSON.stringify(clubResume));
  await shot('02-recruit-resumed.png');

  // Start live recruitment, wait for real decisions, ensure the watcher persists partial progress.
  await cdp.eval(`GCC.cycleRecruitSpeed();GCC.cycleRecruitSpeed();GCC.runRecruitment()`);
  let partial=null;
  for(let i=0;i<500;i++){
    partial=await cdp.eval(`(()=>({
      day:GCC.state.recruit.day,
      feed:GCC.state.recruit.feed.length,
      decisions:GCC.state.recruit.feed.filter(x=>x.tone==='signed'||x.tone==='declined').length,
      signed:GCC.state.pool.filter(p=>p.available===true).length,
      declined:GCC.state.pool.filter(p=>p.available===false).length
    }))()`);
    if(partial.decisions>=8)break;
    await sleep(25);
  }
  assert(partial&&partial.decisions>=8,'Live Signing Week did not advance enough for persistence test',JSON.stringify(partial));
  await sleep(400);
  const partialSave=await stored();
  const savedDecisionCount=(partialSave?.state?.recruit?.feed||[]).filter(x=>x.tone==='signed'||x.tone==='declined').length;
  assert(partialSave?.currentScreen==='recruit','Partial Signing Week saved wrong screen',JSON.stringify({screen:partialSave?.currentScreen}));
  assert(savedDecisionCount>=partial.decisions,'Partial Signing Week watcher lagged behind live decisions',JSON.stringify({partial,savedDecisionCount}));

  // Hard reload boundary 2: partially completed live Signing Week.
  await reload();
  await assertLightLauncher('partial signing reload');
  const recruitResume=await continueDynasty();
  const recruitState=await cdp.eval(`(()=>({
    screen:document.querySelector('.screen.active')?.id,
    user:GCC.state.userClub?.abbr,
    day:GCC.state.recruit?.day,
    running:GCC.state.recruit?.running,
    decisions:GCC.state.recruit?.feed?.filter(x=>x.tone==='signed'||x.tone==='declined').length,
    signed:GCC.state.pool.filter(p=>p.available===true).length,
    declined:GCC.state.pool.filter(p=>p.available===false).length,
    wireHidden:document.getElementById('recruitWirePanel')?.hidden,
    liveHidden:document.getElementById('recruitLiveView')?.hidden
  }))()`);
  assert(recruitResume.screen==='recruit'&&recruitState.user===club.user,'Partial Signing Week restored wrong club/screen',JSON.stringify(recruitState));
  assert(recruitState.decisions>=savedDecisionCount&&recruitState.signed+recruitState.declined>=partial.signed+partial.declined,'Partial Signing Week progress was lost',JSON.stringify(recruitState));
  assert(recruitState.running===false,'Reloaded recruitment retained a dead browser timer',JSON.stringify(recruitState));
  assert(recruitState.wireHidden===true&&recruitState.liveHidden===false,'Recruit view reconstructed incorrectly',JSON.stringify(recruitState));

  // Finish Signing Week and create the draft order.
  const draw=await cdp.eval(`(()=>{
    GCC.skipRecruitment();
    GCC.setupDraft();
    const save=JSON.parse(localStorage.getItem('gcc_dynasty_v7_2'));
    return{
      screen:document.querySelector('.screen.active')?.id,
      complete:GCC.state.recruit.complete,
      order:GCC.state.draftOrder.map(c=>c.abbr),
      target:GCC.state.recruit.targetSigned,
      signed:GCC.state.pool.filter(p=>p.available===true).length,
      pending:GCC.state.pool.filter(p=>p.available==null).length,
      savedScreen:save?.currentScreen,
      savedOrder:(save?.state?.draftOrder||[]).map(c=>c.abbr)
    };
  })()`);
  assert(draw.screen==='draftDraw'&&draw.complete&&draw.order.length===8&&draw.signed===draw.target&&draw.pending===0,'Signing-to-Draw state failed',JSON.stringify(draw));
  assert(draw.savedScreen==='draft'&&JSON.stringify(draw.savedOrder)===JSON.stringify(draw.order),'Draft order was not checkpointed for resume',JSON.stringify(draw));

  // Hard reload boundary 3: Draft Order created. Resume deliberately enters Draft, preserving the order.
  await reload();
  await assertLightLauncher('draft order reload');
  const drawResume=await continueDynasty();
  assert(drawResume.screen==='draft'&&JSON.stringify(drawResume.draftOrder)===JSON.stringify(draw.order),'Draft Order resume did not preserve order/enter Draft',JSON.stringify(drawResume));
  const userFirstPick=draw.order.indexOf(club.user);
  assert(drawResume.pickIndex===userFirstPick,'Draft resume did not stop at the user first pick',JSON.stringify({userFirstPick,drawResume}));

  // Make one real user pick and persist the resulting partial Draft.
  const onePick=await cdp.eval(`(()=>{
    const s=GCC.state;
    const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];
    if(!p)throw new Error('No player available for user pick');
    GCC.userDraft(p.id);
    const save=JSON.parse(localStorage.getItem('gcc_dynasty_v7_2'));
    return{
      player:p.id,
      pickIndex:s.pickIndex,
      userTeam:[...s.teams[s.userClub.abbr]],
      savedPickIndex:save?.state?.pickIndex,
      savedTeam:[...(save?.state?.teams?.[s.userClub.abbr]||[])],
      savedScreen:save?.currentScreen
    };
  })()`);
  assert(onePick.userTeam.includes(onePick.player),'User pick was not added to squad',JSON.stringify(onePick));
  assert(onePick.savedScreen==='draft'&&onePick.savedTeam.includes(onePick.player)&&onePick.savedPickIndex===onePick.pickIndex,'Partial Draft pick was not checkpointed',JSON.stringify(onePick));

  // Hard reload boundary 4: partial Draft.
  await reload();
  await assertLightLauncher('partial draft reload');
  const partialDraftResume=await continueDynasty();
  const partialDraftState=await cdp.eval(`(()=>({
    screen:document.querySelector('.screen.active')?.id,
    pickIndex:GCC.state.pickIndex,
    playerPresent:GCC.state.teams[GCC.state.userClub.abbr].includes(${onePick.player}),
    userTeam:[...GCC.state.teams[GCC.state.userClub.abbr]],
    order:GCC.state.draftOrder.map(c=>c.abbr)
  }))()`);
  assert(partialDraftResume.screen==='draft'&&partialDraftState.playerPresent,'Partial Draft resume lost the user pick',JSON.stringify(partialDraftState));
  assert(JSON.stringify(partialDraftState.order)===JSON.stringify(draw.order),'Partial Draft resume changed the draft order',JSON.stringify(partialDraftState));
  assert(partialDraftState.pickIndex===onePick.pickIndex,'Partial Draft resume changed pick progress',JSON.stringify({onePick,partialDraftState}));

  // Complete all 120 picks.
  const drafted=await cdp.eval(`(()=>{
    const s=GCC.state;let guard=0;
    while(s.pickIndex<120&&guard<40){
      GCC.skipToMyPick();
      if(s.pickIndex>=120)break;
      const round=Math.floor(s.pickIndex/8),pos=s.pickIndex%8;
      const t=s.draftOrder[round%2===0?pos:7-pos];
      if(!t||t.abbr!==s.userClub.abbr)throw new Error('skipToMyPick failed at '+s.pickIndex);
      const p=s.pool.filter(x=>x.available&&!x.draftedBy).sort((a,b)=>b.overall-a.overall)[0];
      if(!p)throw new Error('No available player at '+s.pickIndex);
      GCC.userDraft(p.id);guard++;
    }
    const all=Object.values(s.teams).flat();
    return{
      pickIndex:s.pickIndex,
      finished:s.draftFinished,
      userSize:s.teams[s.userClub.abbr].length,
      sizes:Object.values(s.teams).map(x=>x.length),
      total:all.length,
      unique:new Set(all).size
    };
  })()`);
  assert(drafted.pickIndex===120&&drafted.finished&&drafted.userSize===15&&drafted.sizes.every(x=>x===15)&&drafted.total===120&&drafted.unique===120,'Full Draft completion failed',JSON.stringify(drafted));
  await sleep(300);
  await cdp.eval(`GCC.enterTeamRoom()`);
  const teamSave=await stored();
  assert(teamSave?.currentScreen==='team'&&teamSave?.state?.userClub?.abbr===club.user,'Team Room entry was not checkpointed',JSON.stringify({screen:teamSave?.currentScreen,user:teamSave?.state?.userClub?.abbr}));

  // Hard reload boundary 5: completed Draft -> Team Room.
  await reload();
  await assertLightLauncher('team room reload');
  const teamResume=await continueDynasty();
  const team=await cdp.eval(`(()=>({
    screen:document.querySelector('.screen.active')?.id,
    user:GCC.state.userClub?.abbr,
    squad:GCC.state.teams[GCC.state.userClub.abbr]?.length,
    xi:GCC.state.xi.length,
    layoutHidden:document.querySelector('#team .team-layout')?.hidden,
    recommendHidden:document.getElementById('recommendXIButton')?.hidden,
    manualHidden:document.getElementById('manualXIButton')?.hidden,
    overall:(document.getElementById('teamOverall')?.innerText||'').trim(),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }))()`);
  assert(teamResume.screen==='team'&&team.user===club.user&&team.squad===15&&team.xi===0,'Team Room resume failed',JSON.stringify(team));
  assert(team.layoutHidden===true&&!team.recommendHidden&&!team.manualHidden&&team.overall===''&&team.overflow<=1,'Team Room decision gateway corrupted after resume',JSON.stringify(team));
  await shot('03-team-room-resumed.png');

  // Choose recommended XI and verify XI state is autosaved.
  const xi=await cdp.eval(`(()=>{
    GCC.selectRecommendedXI();
    const save=JSON.parse(localStorage.getItem('gcc_dynasty_v7_2'));
    const essentials=document.getElementById('xiEssentials')?.innerText||'';
    const cover=[...document.querySelectorAll('#xiEssentials b')].map(x=>x.textContent.trim()).find(x=>/ ov$/.test(x))||'';
    return{
      ids:[...GCC.state.xi],
      order:[...GCC.state.battingOrder],
      count:GCC.state.xi.length,
      keeperNeeded:/Needed/.test(essentials),
      coverNum:parseFloat(cover),
      savedScreen:save?.currentScreen,
      savedXi:[...(save?.state?.xi||[])],
      savedOrder:[...(save?.state?.battingOrder||[])]
    };
  })()`);
  assert(xi.count===11&&!xi.keeperNeeded&&Number.isFinite(xi.coverNum)&&xi.coverNum>=20,'Recommended XI integrity failed',JSON.stringify(xi));
  assert(xi.savedScreen==='team'&&JSON.stringify(xi.savedXi)===JSON.stringify(xi.ids)&&JSON.stringify(xi.savedOrder)===JSON.stringify(xi.order),'XI selection was not checkpointed',JSON.stringify(xi));

  // Hard reload boundary 6: XI selected.
  await reload();
  await assertLightLauncher('XI reload');
  const xiResume=await continueDynasty();
  const xiRestored=await cdp.eval(`(()=>({
    screen:document.querySelector('.screen.active')?.id,
    ids:[...GCC.state.xi],
    order:[...GCC.state.battingOrder],
    xiCount:document.getElementById('xiCount')?.textContent.trim(),
    layoutHidden:document.querySelector('#team .team-layout')?.hidden,
    startDisabled:document.getElementById('startSeasonButton')?.disabled,
    overall:(document.getElementById('teamOverall')?.innerText||'').trim(),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }))()`);
  assert(xiResume.screen==='team'&&JSON.stringify(xiRestored.ids)===JSON.stringify(xi.ids)&&JSON.stringify(xiRestored.order)===JSON.stringify(xi.order),'XI resume changed selection/order',JSON.stringify(xiRestored));
  assert(xiRestored.xiCount==='11/11'&&!xiRestored.layoutHidden&&!xiRestored.startDisabled&&xiRestored.overall&&xiRestored.overflow<=1,'Restored XI UI state failed',JSON.stringify(xiRestored));
  await shot('04-xi-resumed.png');

  // Start season. Existing Dynasty startSeason override should checkpoint Round 1.
  const season=await cdp.eval(`(()=>{
    GCC.startSeason();
    const save=JSON.parse(localStorage.getItem('gcc_dynasty_v7_2'));
    const appearances={};
    for(const round of GCC.state.fullSchedule)for(const f of round){
      appearances[f.home.abbr]=(appearances[f.home.abbr]||0)+1;
      appearances[f.away.abbr]=(appearances[f.away.abbr]||0)+1;
    }
    return{
      screen:document.querySelector('.screen.active')?.id,
      round:GCC.state.round,
      fullRounds:GCC.state.fullSchedule.length,
      userFixtures:GCC.state.schedule.length,
      results:GCC.state.results.length,
      appearances,
      savedScreen:save?.currentScreen,
      savedXi:[...(save?.state?.xi||[])],
      overview:document.getElementById('seasonOverview')?.classList.contains('active'),
      play:document.getElementById('playRound')?.textContent.trim()
    };
  })()`);
  assert(season.screen==='season'&&season.round===0&&season.fullRounds===14&&season.userFixtures===14&&season.results===0,'Season start state failed',JSON.stringify(season));
  assert(Object.values(season.appearances).length===8&&Object.values(season.appearances).every(x=>x===14),'Double round-robin schedule integrity failed',JSON.stringify(season.appearances));
  assert(season.savedScreen==='season'&&JSON.stringify(season.savedXi)===JSON.stringify(xi.ids),'Season start save checkpoint failed',JSON.stringify(season));
  assert(season.overview&&season.play==='PLAY ROUND 1','Season Hub did not open at Round 1 overview',JSON.stringify(season));
  await shot('05-season-round-1.png');
  await noErrors('desktop foundation journey');

  // Hard reload boundary 7 on mobile: boot remains lightweight, Continue restores exact Round 1.
  await viewport(390,844);
  await reload();
  const mobileLauncher=await assertLightLauncher('mobile season reload');
  await shot('06-mobile-continue-launcher.png');
  const mobileResume=await continueDynasty();
  const mobileSeason=await cdp.eval(`(()=>({
    screen:document.querySelector('.screen.active')?.id,
    round:GCC.state.round,
    xi:[...GCC.state.xi],
    order:[...GCC.state.battingOrder],
    fullRounds:GCC.state.fullSchedule.length,
    userFixtures:GCC.state.schedule.length,
    overview:document.getElementById('seasonOverview')?.classList.contains('active'),
    play:document.getElementById('playRound')?.textContent.trim(),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }))()`);
  assert(mobileResume.screen==='season'&&mobileSeason.round===0&&mobileSeason.fullRounds===14&&mobileSeason.userFixtures===14,'Mobile Continue did not restore Round 1',JSON.stringify(mobileSeason));
  assert(JSON.stringify(mobileSeason.xi)===JSON.stringify(xi.ids)&&JSON.stringify(mobileSeason.order)===JSON.stringify(xi.order),'Mobile Continue changed XI/order',JSON.stringify(mobileSeason));
  assert(mobileSeason.overview&&mobileSeason.play==='PLAY ROUND 1'&&mobileSeason.overflow<=1,'Mobile resumed Season Hub failed',JSON.stringify(mobileSeason));
  await shot('07-mobile-season-resumed.png');
  await noErrors('mobile foundation journey');

  const report={
    candidate:'58d64d554df9ed9090c3d47499258786e97355845c27cb071efa5512ec0c200c',
    clean,club,clubLauncher,clubResume,partial,savedDecisionCount,recruitState,draw,drawResume,
    onePick,partialDraftResume,partialDraftState,drafted,team,xi,xiRestored,season,mobileLauncher,mobileSeason
  };
  fs.writeFileSync(path.join(OUT,'browser-report.json'),JSON.stringify(report,null,2));
  console.log('v7.2.6 foundation save-continuity QA OK');
  console.log(JSON.stringify(report,null,2));
}finally{
  cdp.close();
  proc.kill('SIGTERM');
  server.close();
}
