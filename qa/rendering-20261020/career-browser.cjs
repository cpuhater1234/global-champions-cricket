const scanContrast=require('./contrast.cjs');
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
(async()=>{
 const out=process.env.GCC8_BROWSER_REPORT_DIR||'qa/finishing/browser-career';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']}),page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],states=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.goto('file://'+path.resolve(process.env.GCC8_TEST_BUILD||'game/gcc_v8_finishing.html'),{waitUntil:'domcontentloaded'});
 const call=async(a,...args)=>{const r=await page.evaluate(([a,args])=>({ok:GCC8.dispatch(a,args),feedback:document.getElementById('g8feedback').textContent}),[a,args]);if(!r.ok)throw Error(a+': '+r.feedback);};
 const capture=async name=>{for(const width of (process.env.GCC8_BROWSER_WIDTHS||'1440,1024,768,390').split(',').map(Number)){await page.setViewportSize({width,height:1000});const r=await page.evaluate(()=>{const root=document.querySelector('dialog[open]')||document.getElementById('g8app'),bad=[];for(const el of root.querySelectorAll('button,h1,h2,h3,summary')){if(el.closest('[inert],[hidden]'))continue;const b=el.getBoundingClientRect();if(!b.width||!b.height)continue;for(const n of el.childNodes){if(n.nodeType!==3||!n.textContent.trim())continue;const range=document.createRange();range.selectNode(n);if([...range.getClientRects()].some(r=>r.width&&(r.left<b.left-2||r.right>b.right+2)))bad.push(n.textContent.trim().slice(0,90));}}return {view:GCC8.ui.view,year:GCC8.G.state.year,overflow:document.documentElement.scrollWidth>innerWidth+2,clipped:bad};});r.contrast=await page.evaluate(scanContrast);states.push({name,width,...r});if(!process.env.GCC8_BROWSER_NO_SCREENSHOTS)await page.screenshot({path:path.join(out,name+'-'+width+'.png'),fullPage:true});}await page.setViewportSize({width:1440,height:1000});};
 for(const year of (process.env.GCC8_BROWSER_YEARS||'2019,2025,2026').split(',').map(Number)){
  const raw=fs.readFileSync((process.env.GCC8_BROWSER_CAREER_DIR||'qa/stabilisation/fixtures')+'/checkpoint-'+year+'.json','utf8');
  await page.evaluate(raw=>{GCC8.dispatch('home');localStorage.setItem('gcc_dynasty_v8',GCC8_SAVE_CODEC.stringify(GCC8_SAVE_CODEC.parse(raw)))},raw);await call('continue');await capture(year+'-review');await call('archive');await capture(year+'-archive');await call('archiveSeason',year);await capture(year+'-scorebook');await call('close');await call('archiveBack');
  const final=await page.evaluate(()=>!!GCC8.G.state.finals?.gf);
  if(final){
   // Reconstruct historical finals views from this real completed season; no new match is simulated here.
   for(const stage of ['ready','semis','gf-ready','done']){await page.evaluate(stage=>{GCC8.G.state.finals.stage=stage;GCC8.ui.view='finals';GCC8.render(true)},stage);await capture(year+'-finals-'+stage);}
   await page.evaluate(()=>{GCC8.ui.view='review';GCC8.render(true)});
  }
  if(year===2026){await call('finishCareer');await capture('2026-legacy');}
  else{await call('offseason');await capture((year+1)+'-squad');await call('reviewList');await call('annualDraw');await call('revealAll');await capture((year+1)+'-draw');}
 }
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({errors,states,scope:'Real completed save renders; historical finals stages reconstructed from actual finalists and results. Remote images forced to fail for deterministic offline geometry.'},null,2));console.log(JSON.stringify({states:states.length,errors,issues:states.filter(r=>r.overflow||r.clipped.length)},null,2));await browser.close();if(errors.length||states.some(r=>r.overflow||r.clipped.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
