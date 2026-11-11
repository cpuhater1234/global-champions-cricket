const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
const {createHash}=require('crypto');

(async()=>{
 const html=process.env.GCC8_TEST_BUILD||'qa/results/v116-signing-width-review.html';
 const careerDir=process.env.GCC8_BROWSER_CAREER_DIR||'qa/results/v116-candidate-career';
 const out=process.env.GCC8_DIAGNOSTIC_DIR||'qa/results/v116-finals-diagnostic';
 const expected='a8aa0b653d2476b120353e3511e43e2b07d8f92e9a3b2ce9ff383313f7cf3ecb';
 const bytes=fs.readFileSync(html);
 const sha=createHash('sha256').update(bytes).digest('hex');
 if(sha!==expected)throw Error('Refusing to inspect unexpected candidate SHA: '+sha);
 fs.mkdirSync(out,{recursive:true});

 const browser=await chromium.launch({
  executablePath:process.env.GCC8_CHROMIUM||undefined,
  headless:true,
  args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']
 });
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[],states=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.goto(pathToFileURL(path.resolve(html)).href,{waitUntil:'domcontentloaded'});

 const call=async(action,...args)=>{
  const result=await page.evaluate(([a,args])=>({
   ok:GCC8.dispatch(a,args),
   feedback:document.getElementById('g8feedback')?.textContent||''
  }),[action,args]);
  if(!result.ok)throw Error(action+': '+result.feedback);
 };
 const inspect=()=>page.evaluate(()=>{
  const root=document.documentElement,body=document.body,stage=document.getElementById('g8stage');
  const visible=el=>{
   if(el.closest('[hidden],[inert]'))return false;
   const cs=getComputedStyle(el),r=el.getBoundingClientRect();
   return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0;
  };
  const nodes=[...document.querySelectorAll('body *')].filter(visible);
  const describe=el=>{
   const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
   const chain=[];let p=el;
   for(let n=0;p&&n<4;n++,p=p.parentElement){
    chain.push(p.tagName.toLowerCase()+(p.id?'#'+p.id:'')+(typeof p.className==='string'&&p.className.trim()?'.'+p.className.trim().split(/\s+/).slice(0,3).join('.'):''));
   }
   return {
    selector:el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(typeof el.className==='string'&&el.className.trim()?'.'+el.className.trim().split(/\s+/).slice(0,5).join('.'):''),
    chain,
    rect:{left:Math.round(r.left*10)/10,right:Math.round(r.right*10)/10,width:Math.round(r.width*10)/10},
    scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
    css:{width:cs.width,minWidth:cs.minWidth,maxWidth:cs.maxWidth,overflowX:cs.overflowX,
         display:cs.display,gridTemplateColumns:cs.gridTemplateColumns,flex:cs.flex}
   };
  };
  const outside=nodes.filter(el=>{
   const r=el.getBoundingClientRect();
   return r.right>innerWidth+2||r.left< -2;
  }).sort((a,b)=>b.getBoundingClientRect().right-a.getBoundingClientRect().right);
  const internal=nodes.filter(el=>el.scrollWidth>el.clientWidth+2)
   .sort((a,b)=>(b.scrollWidth-b.clientWidth)-(a.scrollWidth-a.clientWidth));
  const unique=[...new Set([...outside,...internal])];
  return {
   viewport:innerWidth,view:GCC8.ui.view,year:GCC8.G.state.year,finalsStage:GCC8.G.state.finals?.stage,
   document:{clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,bodyScrollWidth:body.scrollWidth,
             stageClientWidth:stage?.clientWidth??null,stageScrollWidth:stage?.scrollWidth??null},
   overflow:root.scrollWidth>innerWidth+2||body.scrollWidth>innerWidth+2||(stage?.scrollWidth||0)>innerWidth+2,
   outsideCount:outside.length,internalOverflowCount:internal.length,
   offenders:unique.slice(0,35).map(describe)
  };
 });

 for(const year of [2019,2025,2026]){
  const raw=fs.readFileSync(path.join(careerDir,'checkpoint-'+year+'.json'),'utf8');
  await page.evaluate(raw=>{
   GCC8.dispatch('home');
   localStorage.setItem('gcc_dynasty_v8',GCC8_SAVE_CODEC.stringify(GCC8_SAVE_CODEC.parse(raw)));
  },raw);
  await call('continue');
  await page.waitForTimeout(850);
  const hasFinal=await page.evaluate(()=>!!GCC8.G.state.finals?.gf&&!!GCC8.G.state.finals?.gfPair);
  if(!hasFinal)throw Error('Saved '+year+' career has no completed Grand Final to inspect');
  for(const stage of ['gf-ready','done']){
   await page.evaluate(stage=>{
    GCC8.G.state.finals.stage=stage;
    GCC8.ui.view='finals';
    GCC8.render(true);
   },stage);
   await page.waitForTimeout(120);
   for(const width of [1440,1024,768,390,360,320]){
    await page.setViewportSize({width,height:1000});
    await page.waitForTimeout(60);
    const result=await inspect();
    const name=year+'-finals-'+stage+'-'+width;
    const record={name,...result};
    states.push(record);
    if([1440,390,320].includes(width)){
     await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
    }
   }
  }
 }
 const report={
  status:'DIAGNOSTIC_ONLY',
  candidate_sha256:sha,
  years:[2019,2025,2026],
  stages:['gf-ready','done'],
  widths:[1440,1024,768,390,360,320],
  errors,states,
  note:'No game source was changed. This report identifies the DOM elements and computed layout metrics behind the finals overflow flags; it does not apply a CSS fix.'
 };
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({
  status:report.status,candidate_sha256:sha,states:states.length,errors,
  overflowStates:states.filter(s=>s.overflow).map(s=>({
   name:s.name,viewport:s.viewport,document:s.document,
   offenders:s.offenders.slice(0,8)
  }))
 },null,2));
 await browser.close();
 if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
