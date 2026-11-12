/* QA only: actual generated2009 save; historical GF-ready stage reconstruction. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
 const baseline=process.env.GCC8_BASELINE_BUILD,candidate=process.env.GCC8_TEST_BUILD;
 const career=process.env.GCC8_BROWSER_CAREER_DIR||process.env.GCC8_CAREER_DIR;
 const out=process.env.GCC8_IMAGE_DIR||'qa/results/finals-image-native';
 if(!baseline||!candidate||!career)throw Error('Baseline, candidate and actual generated checkpoint directory required');
 fs.mkdirSync(out,{recursive:true});
 const hash=x=>createHash('sha256').update(x).digest('hex');
 const raw=fs.readFileSync(path.join(career,'checkpoint-2009.json'),'utf8');
 const report={baseline_sha256:hash(fs.readFileSync(baseline)),candidate_sha256:hash(fs.readFileSync(candidate)),checkpoint_sha256:hash(raw),provenance:'Actual generated completed2009 checkpoint. HISTORICAL FINALS RECONSTRUCTION stage=gf-ready from real completed finalists/results; not a new live finals action transition. Disposable storage only.',states:[],failures:[],errors:[]};
 const check=(ok,scope,detail)=>{if(!ok)report.failures.push({scope,detail});};
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  const before={};
  for(const [label,file] of [['before',baseline],['after',candidate]]){
   const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
   try{
    const page=await context.newPage();page.setDefaultTimeout(12000);
    page.on('pageerror',e=>report.errors.push({label,error:e.message}));
    await page.route(/^https?:/,r=>r.abort());
    await page.addInitScript(raw=>localStorage.setItem('gcc_dynasty_v8',raw),raw);
    await page.goto(pathToFileURL(path.resolve(file)).href,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!window.GCC8?.dispatch);
    const restored=await page.evaluate(()=>GCC8.dispatch('continue',[]));
    if(!restored)throw Error('Actual generated checkpoint restore failed');
    await page.evaluate(()=>{if(!GCC8.G.state.finals?.gf)throw Error('Checkpoint lacks completed grand final');GCC8.G.state.finals.stage='gf-ready';GCC8.ui.view='finals';GCC8.render(true);});
    const selector='.gccuiFinals .g8matcharena>.g8stadium';
    await page.waitForSelector(selector+' .g8venueframe>img.g8stadiumphoto');
    for(const [width,height] of [[1440,900],[1280,720],[390,844]]){
     await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);
     await page.waitForFunction(sel=>[...document.querySelectorAll(sel+' img')].every(e=>e.complete),selector);
     await page.evaluate(()=>scrollTo(0,0));
     const state=await page.evaluate(sel=>{
      const figure=document.querySelector(sel),frame=figure.querySelector('.g8venueframe'),image=frame.querySelector('img.g8stadiumphoto');
      const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
      return {viewport:{width:innerWidth,height:innerHeight},view:GCC8.ui.view,stage:GCC8.G.state.finals.stage,figure:rect(figure),frame:rect(frame),image:rect(image),naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,frameAspectRatio:getComputedStyle(frame).aspectRatio,frameWidth:getComputedStyle(frame).width,imageObjectFit:getComputedStyle(image).objectFit,horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2};
     },selector);
     state.label=label;report.states.push(state);console.log('CAPTURE',label,width,JSON.stringify(state));
     check(state.naturalWidth>0,label+' image loaded '+width,state);
     check(!state.horizontalOverflow,label+' horizontal containment '+width,state);
     if(label==='before'){
      before[width]=state;
      if(width===390)check(state.frame.width/state.figure.width<.75,'baseline reproduces narrow mobile frame',state);
     }else if(width===390){
      check(state.frame.width/state.figure.width>=.98,'mobile frame fills figure',state);
      check(state.image.width/state.figure.width>=.98,'mobile photo fills figure',state);
      check(Math.abs(state.frame.height-120)<=1&&Math.abs(state.image.height-120)<=1,'mobile120px frame/photo height',state);
      check(state.imageObjectFit==='cover','mobile photo cover fit',state);
     }else{
      for(const component of ['figure','frame','image'])for(const key of ['x','y','width','height'])check(Math.abs(state[component][key]-before[width][component][key])<=1,'desktop geometry unchanged '+width+' '+component+'.'+key,{before:before[width][component],after:state[component]});
     }
     await page.screenshot({path:path.join(out,`${label}-finals-image-${width}x${height}.png`),fullPage:true});
    }
   }finally{await context.close();}
  }
 }catch(e){report.failures.push({scope:'native image comparison',error:String(e.stack||e)});}
 finally{
  if(browser)await browser.close();report.status=report.failures.length||report.errors.length?'FAIL':'PASS';
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));if(report.status!=='PASS')process.exitCode=1;
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
