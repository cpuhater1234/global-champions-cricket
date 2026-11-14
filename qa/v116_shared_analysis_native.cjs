/* QA only: real generated career, disposable storage, no connected user browser. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
 const baseline=process.env.GCC8_BASELINE_BUILD,candidate=process.env.GCC8_TEST_BUILD,career=process.env.GCC8_BROWSER_CAREER_DIR,out=process.env.GCC8_ANALYSIS_DIR||'qa/results/analysis-density-native';
 if(!baseline||!candidate||!career)throw Error('Both builds and generated checkpoint directory required');fs.mkdirSync(out,{recursive:true});
 const raw=fs.readFileSync(path.join(career,'checkpoint-2009.json'),'utf8'),hash=x=>createHash('sha256').update(x).digest('hex');
 const report={baseline_sha256:hash(fs.readFileSync(baseline)),candidate_sha256:hash(fs.readFileSync(candidate)),checkpoint_sha256:hash(raw),states:[],failures:[],errors:[],omissions:[],scope:'Actual generated2009 checkpoint legally progresses to the next manualXI; team analysis metrics are noninteractive divs. No user save. Test-only deterministic randomness.'};
 if(report.candidate_sha256!==process.env.CANDIDATE_SHA256)throw Error('Unexpected candidate hash');
 const before={};let browser,page,label;const check=(ok,scope,detail)=>{if(!ok)report.failures.push({label,scope,detail});};
 const call=async(action,...args)=>{const r=await page.evaluate(([action,args])=>({ok:GCC8.dispatch(action,args),feedback:document.querySelector('#g8feedback')?.textContent}),[action,args]);if(!r.ok)throw Error(action+': '+r.feedback);};
 const prepare=async()=>{
  await call('continue');await call('offseason');await call('cpuMarket');await call('annualDraw');await call('revealAll');await call('annualDraft');
  for(let guard=0;guard<30&&await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft');guard++){
   await call('skipPick');if(!await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft'))break;
   const id=await page.evaluate(()=>{const rs=GCC8.roster(),pool=GCC8.pool(true);return (pool.find(p=>p.keeping>=65&&!rs.some(q=>q.keeping>=65))||pool.find(p=>p.maxOvers>=4&&rs.filter(q=>q.maxOvers>=4).length<6)||pool[0])?.id;});if(id==null)throw Error('Annual pool empty');await call('draftPlayer',id);
  }
  await call('lodgeList');await call('annualTeam');
  const ids=await page.evaluate(()=>{const rs=GCC8.roster().filter(p=>GCC8.G.state.dynasty.injuries?.[p.id]?.status!=='OUT'),best=GCC8.G.bestXI(rs),keeper=rs.find(p=>p.keeping>=65);if(keeper&&!best.some(p=>p.keeping>=65))best[best.map((p,i)=>({p,i})).sort((a,b)=>a.p.overall-b.p.overall)[0].i]=keeper;return best.map(p=>p.id);});
  if(ids.length!==11)throw Error('Generated XI unavailable');await call('clearXI');for(const id of ids)await call('select',id);await call('teamPane','xi');
 };
 const snapshot=async()=>page.evaluate(()=>{
  const d=document.querySelector('#g8dialog[open]'),read=d.querySelector('.g8teamread'),rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const metrics=[...read.querySelectorAll('.g8analysisrow')].map(e=>({key:e.dataset.matchup,label:e.querySelector(':scope>span').textContent.trim(),value:e.querySelector(':scope>strong').textContent.trim(),ratingColor:getComputedStyle(e.querySelector(':scope>strong')).color,interactive:e.matches('button,a,[role=button]')||!!e.dataset.action,...rect(e),children:[...e.children].map(c=>({tag:c.tagName,text:c.textContent.trim(),...rect(c)}))}));
  return {surfaces:[...read.querySelectorAll('.g8analysissection,.g8analysisrow')].map(e=>({background:getComputedStyle(e).backgroundColor,border:getComputedStyle(e).borderTopWidth})),viewport:{width:innerWidth,height:innerHeight},prompt:d.dataset.prompt,xiIds:GCC8.G.state.xi.slice(),horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,summary:rect(read),groups:[...read.querySelectorAll('.g8analysissection>h3')].map(e=>e.textContent.trim()),metrics,close:rect(d.querySelector('.g8dialogclose')),scrollRegions:[d,...d.querySelectorAll('*')].filter(e=>e.clientHeight>0&&e.scrollHeight>e.clientHeight+2&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>({tag:e.tagName,className:e.className,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight}))};
 });
 try{
  browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  for(const [kind,file] of [['before',baseline],['after',candidate]]){label=kind;const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
   try{
    page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>report.errors.push({label,message:e.message}));await page.route(/^https?:/,r=>r.abort());
    await page.addInitScript(raw=>{Date.now=()=>1794484800000;let seed=101;Math.random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};localStorage.setItem('gcc_dynasty_v8',raw);},raw);
    await page.goto(pathToFileURL(path.resolve(file)).href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.GCC8?.dispatch);await prepare();await call('teamAnalysis');
    for(const [width,height] of [[1440,900],[1150,720],[768,900],[390,844],[320,720]]){
     await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>{scrollTo(0,0);const d=document.querySelector('#g8dialog');for(const e of [d,...d.querySelectorAll('*')])if(e.scrollTop)e.scrollTop=0;});
     const s={label,...await snapshot()};report.states.push(s);console.log('CAPTURE',label,width,height);
     check(s.metrics.length===12&&s.groups.length===3,'twelve metrics and three groups '+width,{metrics:s.metrics.length,groups:s.groups});check(!s.horizontalOverflow,'document containment '+width,s.viewport);check(s.close.width>=43.5&&s.close.height>=43.5,'44px modal close '+width,s.close);
     if(label==='before')before[width]=s;else{
      check(JSON.stringify(s.metrics.map(m=>[m.key,m.label,m.value,m.ratingColor]))===JSON.stringify(before[width].metrics.map(m=>[m.key,m.label,m.value,m.ratingColor])),'all metric keys/labels/values/colours preserved '+width,{});
      check(JSON.stringify(s.groups)===JSON.stringify(before[width].groups)&&JSON.stringify(s.xiIds)===JSON.stringify(before[width].xiIds),'group and XI identity preserved '+width,{});
      check(s.surfaces.every(x=>x.background==='rgba(0, 0, 0, 0)'&&x.border==='0px'),'unboxed shared analysis '+width,s.surfaces);s.heightChange=s.summary.height-before[width].summary.height;check(s.metrics.every(m=>m.height<70),'compact metric rows '+width,s.metrics.map(m=>({key:m.key,height:m.height})));
      for(const m of s.metrics){check(!m.interactive,'actual metric tile remains noninteractive '+width,{key:m.key});for(const c of m.children)check(c.x>=m.x-2&&c.right<=m.right+2&&c.y>=m.y-2&&c.bottom<=m.bottom+2,'metric child containment '+width,{metric:m.key,rect:m,child:c});if(m.interactive)check(m.height>=43.5,'interactive metric44px '+width,m);}
     }
     await page.screenshot({path:path.join(out,`${label}-analysis-${width}x${height}.png`),fullPage:true});
     const scroll=await page.evaluate(()=>{const d=document.querySelector('#g8dialog'),es=[d,...d.querySelectorAll('*')].filter(e=>e.clientHeight>0&&e.scrollHeight>e.clientHeight+2&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).sort((a,b)=>(b.scrollHeight-b.clientHeight)-(a.scrollHeight-a.clientHeight));if(!es.length)return {needed:false};const e=es[0];e.scrollTop=e.scrollHeight;return {needed:true,top:e.scrollTop,max:e.scrollHeight-e.clientHeight};});
     s.scrollProbe=scroll;if(scroll.needed)check(scroll.top>0,'lower content scroll reachable '+width,scroll);else report.omissions.push({label,scope:'scroll '+width,reason:'No scrollable overflow in this viewport'});
     if(width===390||width===320)await page.screenshot({path:path.join(out,`${label}-analysis-bottom-${width}x${height}.png`),fullPage:true});
    }
    await page.locator('#g8dialog .g8dialogclose').click();check(!await page.locator('#g8dialog').evaluate(e=>e.open),'real close control closes modal',{});await page.locator('.gccuiSelection [data-action=teamAnalysis]').click();check(await page.locator('#g8dialog').evaluate(e=>e.open&&e.dataset.prompt==='teamAnalysis'),'real analysis control reopens modal',{});
    report.omissions.push({label,scope:'metric click probe',reason:'Actual twelve metric tiles are noninteractive divs, not rating buttons; no click behavior or touch target was invented.'});
   }catch(e){report.failures.push({label,scope:'native analysis journey',error:String(e.stack||e)});}finally{await context.close();}
  }
 }catch(e){report.failures.push({label,scope:'browser-run',error:String(e.stack||e)});}
 finally{if(browser)await browser.close();report.status=report.failures.length||report.errors.length?'FAIL':'PASS';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,states:report.states.length},null,2));if(report.status!=='PASS')process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1;});
