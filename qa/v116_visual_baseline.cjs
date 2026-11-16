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
const prepareXI=async()=>{await call('continue');await call('offseason');await call('cpuMarket');await call('annualDraw');await call('revealAll');await call('annualDraft');for(let n=0;n<30&&await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft');n++){await call('skipPick');if(!await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft'))break;const id=await page.evaluate(()=>{const r=GCC8.roster(),p=GCC8.pool(true);return(p.find(x=>x.keeping>=65&&!r.some(y=>y.keeping>=65))||p.find(x=>x.maxOvers>=4&&r.filter(y=>y.maxOvers>=4).length<6)||p[0])?.id;});await call('draftPlayer',id);}await call('lodgeList');await call('annualTeam');const ids=await page.evaluate(()=>{const r=GCC8.roster().filter(p=>GCC8.G.state.dynasty.injuries?.[p.id]?.status!=='OUT'),best=GCC8.G.bestXI(r),k=r.find(p=>p.keeping>=65);if(k&&!best.some(p=>p.keeping>=65))best[best.map((p,i)=>({p,i})).sort((a,b)=>a.p.overall-b.p.overall)[0].i]=k;return best.map(p=>p.id);});await call('clearXI');for(const id of ids)await call('select',id);await call('teamPane','xi');};
const navigateTo=async(screen)=>{
switch(screen){
case 'home':await call('world');break;
case 'club-select':await call('clubs');break;
case 'draft':await call('draft');break;
case 'xi':await prepareXI();await call('teamPane','xi');break;
case 'signing':await call('signingRun');break;
case 'preview':await call('preview');break;
case 'live':await call('play');await call('lodge');break;
case 'innings-break':await call('play');await call('lodge');await call('inningsBreak');break;
case 'result':await call('play');await call('lodge');await call('matchResult');break;
case 'archive':await call('archive');break;
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
