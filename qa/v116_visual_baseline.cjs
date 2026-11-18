/* Visual baseline capture for v116 release guardrail.
   Captures deterministic screenshots at 4 breakpoints x 10 screens for
   pixel-diff regression comparison. Follows the same harness pattern as
   v116_accessibility_gate.cjs / v116_narrow_focus_layout.cjs.

   Env:
     GCC8_TEST_BUILD        HTML file to render (default: GCC_v116_release (1).html)
     GCC8_BROWSER_CAREER_DIR dir containing checkpoint-2009.json (deterministic save)
     GCC8_BASELINE_DIR      output dir for baseline PNGs (default: qa/visual/baselines)
     GCC8_CHROMIUM          path to Chromium executable (Playwright-provided)
     GCC8_EXPECT_SHA256     optional SHA-256 of expected build
   Breakpoints: 360x800, 390x844, 768x1024, 1440x900
   Screens: home, club-select, draft, xi, signing, preview, live, innings-break, result, archive
*/
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
const file=process.env.GCC8_TEST_BUILD||'GCC_v116_release (1).html';
const out=process.env.GCC8_BASELINE_DIR||'qa/visual/baselines';
const careerDir=process.env.GCC8_BROWSER_CAREER_DIR||'qa/results/whole-ui-career';
const raw=fs.readFileSync(path.join(careerDir,'checkpoint-2009.json'),'utf8');
const sha=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(process.env.GCC8_EXPECT_SHA256&&sha!==process.env.GCC8_EXPECT_SHA256)throw Error('Wrong candidate '+sha);
fs.mkdirSync(out,{recursive:true});
const report={sha256:sha,screens:[],breakpoints:[360,390,768,1440],observations:[],findings:[],errors:[],runtimeErrors:[],limits:['Chromium only. Deterministic synthetic save; offline (external image requests aborted).']};
let page;
const record=(ok,id,detail={})=>{report.observations.push({id,result:ok?'PASS':'FAIL',detail});if(!ok)report.findings.push({id,detail});};
const call=async(a,...args)=>{const r=await page.evaluate(([a,args])=>({ok:GCC8.dispatch(a,args),feedback:document.querySelector('#g8feedback')?.textContent}),[a,args]);if(!r.ok)throw Error('Rejected '+a+' '+r.feedback);};
const tryCall=async(a,...args)=>{const r=await page.evaluate(([a,args])=>({ok:GCC8.dispatch(a,args),feedback:document.querySelector('#g8feedback')?.textContent}),[a,args]);return r.ok;};
const freshCareer=async()=>{await tryCall('continue');await tryCall('home');if(await tryCall('play')){await call('fresh');await call('world');await call('revealAll');await call('clubs');await call('club',0);await call('confirmClub');}else{await tryCall('close');await call('home');if(await tryCall('play')){await call('fresh');await call('world');await call('revealAll');await call('clubs');await call('club',0);await call('confirmClub');}}};
const runFoundation=async()=>{await freshCareer();await call('signingRun');await call('signingSkip');await call('draftDraw');await call('revealAll');await call('beginDraft');for(let n=0;n<300;n++){if(await page.evaluate(()=>GCC8.G.state.pickIndex>=120))break;await tryCall('skipPick');if(await page.evaluate(()=>GCC8.G.state.pickIndex>=120))break;const id=await page.evaluate(()=>{const r=GCC8.roster(),p=GCC8.pool();return((!r.some(x=>x.keeping>=65))&&p.find(x=>x.keeping>=65)||p.find(x=>x.maxOvers>=4)||p[0])?.id;});if(!await tryCall('draftPlayer',id))break;}await call('team');await call('clearXI');const ids=await page.evaluate(()=>{const r=GCC8.roster(),k=r.find(p=>p.keeping>=65)||r[0],bow=r.filter(p=>p.id!==k.id&&p.maxOvers>=4).slice(0,5),bat=r.filter(p=>p.id!==k.id&&!bow.includes(p)).slice(0,5);return[k,...bow,...bat].map(p=>p.id);});for(const id of ids)await call('select',id);await call('lodge');};
const prepareXI=async()=>{await call('home');if(await tryCall('play')){await call('fresh');await call('world');await call('revealAll');await call('clubs');await call('club',0);await call('confirmClub');await call('signingRun');await call('signingSkip');await call('draftDraw');await call('revealAll');await call('beginDraft');for(let n=0;n<300;n++){if(await page.evaluate(()=>GCC8.G.state.pickIndex>=120))break;await tryCall('skipPick');if(await page.evaluate(()=>GCC8.G.state.pickIndex>=120))break;const id=await page.evaluate(()=>{const r=GCC8.roster(),p=GCC8.pool();return((!r.some(x=>x.keeping>=65))&&p.find(x=>x.keeping>=65)||p.find(x=>x.maxOvers>=4)||p[0])?.id;});if(!await tryCall('draftPlayer',id))break;}await call('team');}await call('clearXI');const ids=await page.evaluate(()=>{const r=GCC8.roster().filter(p=>GCC8.G.state.dynasty.injuries?.[p.id]?.status!=='OUT'),best=GCC8.G.bestXI(r),k=r.find(p=>p.keeping>=65);if(k&&!best.some(p=>p.keeping>=65))best[best.map((p,i)=>({p,i})).sort((a,b)=>a.p.overall-b.p.overall)[0].i]=k;return best.map(p=>p.id);});await call('clearXI');for(const id of ids)await call('select',id);await call('teamPane','xi');};
const toRecruit=async()=>{if(await tryCall('club',0))await call('confirmClub');else if(await tryCall('fresh')){await call('world');await call('revealAll');await call('clubs');await call('club',0);await call('confirmClub');}};
const navigateTo=async(screen)=>{
switch(screen){
case 'home':await call('home');break;
case 'club-select':await call('home');if(await tryCall('play')){await call('fresh');await call('world');await call('revealAll');}await call('clubs');break;
case 'draft':await runFoundation();break;
case 'xi':await prepareXI();await call('teamPane','xi');break;
case 'signing':await freshCareer();await call('signingRun');await page.waitForTimeout(2500);await call('signingRun');break; // run the ticker briefly so a few decisions land, then pause: same window state every run
case 'preview':await runFoundation();await call('prepare');break;
case 'live':{await runFoundation();await call('prepare');const round=await page.evaluate(()=>GCC8.G.state.round+1);await call('playMatch',round);break;}
case 'innings-break':await runFoundation().catch(()=>{});await tryCall('matchSkip');await tryCall('matchday');await call('prepare').catch(()=>{});await tryCall('playMatch',await page.evaluate(()=>GCC8.G.state.round+1));await tryCall('matchday');break;
case 'result':await runFoundation().catch(()=>{});await call('prepare').catch(()=>{});await tryCall('playMatch',await page.evaluate(()=>GCC8.G.state.round+1));await tryCall('matchSkip');await call('matchday');await call('result').catch(async()=>{await tryCall('matchday');await tryCall('result');});break;
case 'archive':{
  // archive asserts s.dynasty.history.length — a career-season must be completed first.
  // Play one match to completion via the runFoundation path, then postseason to archive it.
  await runFoundation().catch(()=>{});
  if(await tryCall('prepare')){
    await tryCall('playMatch',await page.evaluate(()=>GCC8.G.state.round+1));
    await tryCall('matchSkip');
    await tryCall('matchday');
    await tryCall('result');
    for(let n=0;n<16&&await page.evaluate(()=>GCC8.G.state.round<14);n++){
      await tryCall('prepare');await tryCall('playMatch',await page.evaluate(()=>GCC8.G.state.round+1));await tryCall('matchSkip');await tryCall('matchday');await tryCall('result');await tryCall('matchday');
    }
    await tryCall('matchday');await tryCall('postSeason');
    // proceedPostSeason only reaches openSeasonReview when the club finishes outside the top 4;
    // if it is in finals contention it diverts to the finals screen and archiveSeason never runs.
    // openSeasonReview is exposed on G and is the call that invokes archiveSeason() -> history.
    await page.evaluate(()=>GCC8.G.openSeasonReview?.());
  }
  if(!(await tryCall('archive'))){
    // season arc can stall if a match ends unconcluded (draw/DLS edge); play more rounds to force history
    for(let n=0;n<20&&!(await page.evaluate(()=>GCC8.G.state.dynasty.history.length>0));n++){
      await tryCall('prepare');await tryCall('playMatch',await page.evaluate(()=>GCC8.G.state.round+1));await tryCall('matchSkip');await tryCall('matchday');await tryCall('result');await tryCall('matchday');await tryCall('postSeason');
      await page.evaluate(()=>GCC8.G.openSeasonReview?.());
    }
    await tryCall('archive');
  }
  if(!(await tryCall('archive')))throw Error('archive: dynasty history still empty after season simulation');
  break;
}
default:throw Error('Unknown screen '+screen);
}
};
const capture=async(screen,width,height)=>{
await page.setViewportSize({width,height});
await page.evaluate(()=>document.fonts.ready);
await page.waitForTimeout(200);
const name=`${screen}-${width}x${height}`;
const p=path.join(out,`${name}.png`);
await page.screenshot({path:p,fullPage:false});
report.screens.push({name,screen,width,height,path:p,bytes:fs.statSync(p).size});
record(true,`capture ${name}`,{width,height,bytes:fs.statSync(p).size});
};
const browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
try{
const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await ctx.addInitScript(raw=>{Date.now=()=>1794484800000;let n=101;Math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};localStorage.setItem('gcc_dynasty_v8',raw);},raw);
page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>report.runtimeErrors.push(e.message));await page.route(/^https?:/,r=>r.abort());
await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForFunction(()=>!!window.GCC8?.dispatch);
await call('continue');await call('offseason');await call('cpuMarket');await call('annualDraw');await call('revealAll');await call('annualDraft');
for(const screen of ['home','club-select','draft','xi','signing','preview','live','innings-break','result','archive']){
for(const w of [360,390,768,1440]){
const h=w<=390?844:w<=768?1024:900;
await navigateTo(screen);
await capture(screen,w,h);
}
}
await ctx.close();
}catch(e){report.errors.push(String(e.stack||e));}
await browser.close();
report.status=report.errors.length||report.runtimeErrors.length?'ERROR':report.findings.length?'FINDINGS':'PASS';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sha256:sha,status:report.status,screens:report.screens.length,findings:report.findings.map(f=>f.id),errors:report.errors,runtimeErrors:report.runtimeErrors}));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
