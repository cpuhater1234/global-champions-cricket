const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const {pathToFileURL}=require('url');
const {createHash}=require('crypto');

// Real guide journeys plus narrowly labelled non-guide cascade fixtures.
let activeBrowser;
(async()=>{
 const baseline=process.env.GCC8_BASELINE_BUILD;
 const candidate=process.env.GCC8_TEST_BUILD;
 const out=process.env.GCC8_MENU_SCREENSHOT_DIR||'qa/results/menu-surgical';
 if(!baseline||!candidate)throw Error('Both exact builds are required');
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true});
 activeBrowser=browser;
 const states=[],errors=[],failures=[],focusBoundaries=[];
 const inspect=async page=>page.evaluate(()=>{
  const d=document.querySelector('#g8dialog'),b=d.querySelector('.g8modalbody'),h=d.querySelector('.g8modalhead'),g=d.querySelector('.g8guide');
  const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width,height:r.height,left:r.left,right:r.right}};
  const text=(e)=>({font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize,weight:getComputedStyle(e).fontWeight,color:getComputedStyle(e).color});
  const columns=e=>{
   if(!e)return 0;
   const value=getComputedStyle(e).gridTemplateColumns;if(value==='none')return 0;
   let depth=0,count=0,token=false;
   for(const c of value){if(c==='(')depth++;if(c===')')depth--;if(/\s/.test(c)&&depth===0){if(token)count++;token=false;}else token=true;}
   return count+(token?1:0);
  };
  return {viewport:{width:innerWidth,height:innerHeight},dialog:rect(d),head:rect(h),body:rect(b),
   bodyOverflow:getComputedStyle(b).overflowY,dialogOverflow:getComputedStyle(d).overflowY,
   background:getComputedStyle(d).backgroundColor,title:text(h.querySelector('h2')),
   headings:[...g.querySelectorAll('h3')].map(text),footer:rect(b.querySelector('.g8guidefooter')),
   guideColumns:columns(g.querySelector('.g8guidegrid')),ruleColumns:columns(g.querySelector('.g8rulegrid')),
   hasGrid:!!g.querySelector('.g8guidegrid'),hasRules:!!g.querySelector('.g8rulegrid'),
   documentOverflow:document.documentElement.scrollWidth>innerWidth+1,
   dialogOverflowX:d.scrollWidth>d.clientWidth+1,
   buttons:[...b.querySelectorAll('.g8guidefooter button')].map(e=>({text:e.textContent.trim(),background:getComputedStyle(e).backgroundColor,image:getComputedStyle(e).backgroundImage,shadow:getComputedStyle(e).boxShadow,...rect(e)})),
   headingOutsideBody:[...g.querySelectorAll('h3')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&(r.left<b.getBoundingClientRect().left-1||r.right>b.getBoundingClientRect().right+1)}).length,
   scroll:{top:b.scrollTop,height:b.scrollHeight,client:b.clientHeight},
  };
 });
 for(const [label,file] of [['before',baseline],['after',candidate]]){
  const page=await browser.newPage({viewport:{width:1150,height:720},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push({label,message:e.message}));
  await page.route('https://**/*',r=>r.abort());
  await page.goto(pathToFileURL(path.resolve(file)).href,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.GCC8?.dispatch);
  for(const action of ['how','howItWorks','breakawayStory']){
   await page.evaluate(a=>GCC8.dispatch(a,[]),action);
   await page.waitForFunction(()=>document.querySelector('#g8dialog[open] .g8guide'));
   await page.evaluate(()=>document.fonts.ready);
   for(const [width,height] of [[1150,720],[1440,1000],[1024,768],[768,1000],[390,844],[320,720],[844,390]]){
    console.log('CAPTURE',label,action,width,height);
    await page.setViewportSize({width,height});
    await page.locator('#g8dialog').evaluate(e=>e.scrollTop=0);
    await page.locator('#g8dialog .g8modalbody').evaluate(e=>e.scrollTop=0);
    const state={label,action,...await inspect(page)};states.push(state);
    if(label==='after'){
     const issues=[];
     if(state.documentOverflow||state.dialogOverflowX||state.headingOutsideBody)issues.push('horizontal containment');
     if(state.background!=='rgb(23, 27, 32)')issues.push('guide surface owner lost');
     if(!state.title.font.startsWith('Inter')||state.headings.some(h=>!h.font.startsWith('Inter')))issues.push('reading font owner lost');
     if(state.body.top<state.head.bottom-1||state.body.bottom>state.dialog.bottom+1)issues.push('reading pane overlaps shell');
     if(state.bodyOverflow!=='auto'||state.body.height<100)issues.push('reading pane inaccessible');
     if(state.hasGrid&&state.guideColumns!==(width>=860?2:1))issues.push('step column contract');
     if(state.hasRules&&state.ruleColumns!==1)issues.push('reference rules must be rows');
     if(width>650&&state.footer.height>76)issues.push('desktop footer too tall');
     const allowedFills=['rgba(0, 0, 0, 0)','rgb(36, 45, 53)','rgb(37, 47, 55)'];
     if(state.buttons.some(b=>b.image!=='none'||b.shadow!=='none'||!allowedFills.includes(b.background)))issues.push('footer inherited an unowned button skin');
     const navHeights=state.buttons.slice(0,3).map(b=>b.height);
     if(Math.max(...navHeights)-Math.min(...navHeights)>1)issues.push('guide navigation control heights differ');
     if(issues.length)failures.push({action,width,height,issues});
    }
    await page.screenshot({path:path.join(out,`${label}-${action}-${width}x${height}.png`)});
    // Last control must be reachable through focus-induced scrolling.
    const last=page.locator('#g8dialog .g8guidefooter>button');
    // Move focus away first: calling focus() on an already-focused element is
    // a no-op after the test explicitly resets its scroll container.
    await page.locator('#g8dialog .g8dialogclose').focus();
    await last.focus();
    const bottom=await inspect(page);
    if(label==='after'){
     const r=await last.boundingBox();
     state.returnAfterFocus={control:r,body:bottom.body,scroll:bottom.scroll};
     if(!r||r.y<bottom.head.bottom-1||r.y+r.height>bottom.body.bottom+1)failures.push({action,width,height,issues:['return control not reachable']});
    }
   }
   if(action==='how'){
    for(const [width,height] of [[1150,720],[390,844]]){
     await page.setViewportSize({width,height});
     const summaries=page.locator('#g8dialog .g8guiderules details>summary');
     for(let i=0;i<await summaries.count();i++){
      console.log('EXPAND',label,width,i+1);
      await summaries.nth(i).click();
      await page.locator('#g8dialog .g8modalbody').evaluate(e=>e.scrollTop=e.scrollHeight);
      const state={label,action,expanded:i,width,height,...await inspect(page)};states.push(state);
      if(label==='after'&&(state.documentOverflow||state.dialogOverflowX||state.body.top<state.head.bottom-1))failures.push({action,width,expanded:i,issues:['expanded rule containment']});
      await page.screenshot({path:path.join(out,`${label}-rule-${i+1}-${width}.png`)});
      console.log('COLLAPSE',label,width,i+1);
      await summaries.nth(i).click();
     }
    }
   }
   if(label==='after'){
    await page.setViewportSize({width:390,height:844});
    await page.locator('#g8dialog .g8dialogclose').focus();
    let reachedReturn=false;
    for(let i=0;i<14;i++){
     await page.keyboard.press('Tab');
     const focus=await page.evaluate(()=>({inside:!!document.activeElement?.closest('#g8dialog'),tag:document.activeElement?.tagName,isReturn:document.activeElement?.matches('.g8guidefooter>.g8primary')}));
     if(!focus.inside){
      if(['BODY','HTML'].includes(focus.tag))focusBoundaries.push({action,tag:focus.tag});
      else failures.push({action,issues:['keyboard focus reached background content'],focus});
     }
     reachedReturn=reachedReturn||focus.isReturn;
    }
    if(!reachedReturn)failures.push({action,issues:['return action missing from Tab order']});
    // Chromium can visit its browser-level focus boundary during Tab traversal.
    // Independently verify that a real background control cannot take page focus.
    const backgroundFocusBlocked=await page.evaluate(()=>{
     const background=document.querySelector('#g8stage button');
     if(!background)return null;
     background.focus();return document.activeElement!==background;
    });
    if(backgroundFocusBlocked!==true)failures.push({action,issues:['native modal failed to block background focus']});
    await page.locator('#g8dialog .g8guidefooter>button').click();
    if(await page.locator('#g8dialog').evaluate(e=>e.open))failures.push({action,issues:['return action failed to close guide']});
    await page.evaluate(a=>GCC8.dispatch(a,[]),action);
    await page.waitForFunction(()=>document.querySelector('#g8dialog[open] .g8guide'));
   }
   await page.keyboard.press('Escape');
   if(await page.locator('#g8dialog').evaluate(e=>e.open))throw Error('Escape did not close '+action);
   if(label==='after'&&await page.locator('#g8dialog').evaluate(e=>getComputedStyle(e).display!=='none'&&e.getClientRects().length>0))failures.push({action,issues:['closed dialog still rendered']});
  }
  await page.close();
 }
 // Compare exact computed styling for unchanged dialog types. These fixtures
 // validate cascade isolation, not full native gameplay for those screens.
 const fixture='<div id="g8app"><div class="gccui gccuiMatchday"><h2>Matchday</h2><button class="g8button g8primary">Watch match</button></div></div><dialog id="g8dialog" open><header class="g8modalhead"><div><h2>Player report</h2></div><button class="g8dialogclose">×</button></header><div class="g8modalbody"><h3>Player identity</h3><p>Player information</p><button class="g8button g8primary">Primary</button><button class="g8button g8ghost">Secondary</button></div></dialog>';
 const probes={};
 for(const [label,file] of [['before',baseline],['after',candidate]]){
  const page=await browser.newPage();
  const html=fs.readFileSync(file,'utf8');
  const styles=[...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi)].map(m=>m[0]).join('');
  await page.setContent('<!doctype html><html><head>'+styles+'</head><body>'+fixture+'</body></html>');
  probes[label]={};
  for(const prompt of ['player','prepare','trade','scorecard','archiveSeason']){
   await page.locator('#g8dialog').evaluate((e,p)=>e.setAttribute('data-prompt',p),prompt);
   probes[label][prompt]=await page.locator('#g8app h2,#g8app button,#g8dialog,#g8dialog h2,#g8dialog h3,#g8dialog p,#g8dialog button').evaluateAll(es=>es.map(e=>{
    const s=getComputedStyle(e);return Object.fromEntries(['display','fontFamily','fontSize','fontWeight','color','backgroundColor','borderRadius','padding','border','boxShadow'].map(p=>[p,s[p]]));
   }));
  }
  await page.close();
 }
 if(JSON.stringify(probes.before)!==JSON.stringify(probes.after))failures.push({issues:['non-guide cascade changed'],probes});
 const report={status:failures.length||errors.length?'FAIL':'PASS',baseline_sha256:createHash('sha256').update(fs.readFileSync(baseline)).digest('hex'),candidate_sha256:createHash('sha256').update(fs.readFileSync(candidate)).digest('hex'),states,errors,failures,browser_focus_boundaries:focusBoundaries,non_guide_fixture_parity:JSON.stringify(probes.before)===JSON.stringify(probes.after)};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({...report,states:states.length},null,2));
 await browser.close();if(report.status!=='PASS')process.exitCode=1;
})().catch(async e=>{console.error(e);if(activeBrowser)await activeBrowser.close();process.exitCode=1});
