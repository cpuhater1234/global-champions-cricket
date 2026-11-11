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
 const years=(process.env.GCC8_DIAGNOSTIC_YEARS||'2019').split(',').map(Number);
 const hypothesisCss='@media(max-width:760px){#g8app .gccuiFinals .g8matcharena{align-items:stretch!important}}';
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
  const campaign=document.querySelector('#g8stage>.gccuiFinals');
  const campaignRect=campaign?.getBoundingClientRect();
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
  const relevant=[...document.querySelectorAll('#g8stage .gccuiKnockoutFixture,#g8stage .gccuiKnockoutSide,#g8stage .g8matcharena,#g8stage .g8matcharena>div,#g8stage .gccuiScorecard,#g8stage .gcc-awards,#g8stage .gcc-worm,#g8stage .g8resultread,#g8stage .g8phasecards,#g8stage .g8phasecontest')]
   .filter(visible).map(describe);
  const overCampaign=campaignRect?nodes.filter(el=>{
   if(!campaign.contains(el))return false;
   const r=el.getBoundingClientRect();
   return r.right>campaignRect.right+2||r.left<campaignRect.left-2;
  }).sort((a,b)=>b.getBoundingClientRect().right-a.getBoundingClientRect().right).slice(0,12).map(describe):[];
  const spillText=[];
  if(campaignRect){
   const walk=document.createTreeWalker(campaign,NodeFilter.SHOW_TEXT);
   let node;
   while((node=walk.nextNode())){
    if(!node.textContent.trim()||!node.parentElement||!visible(node.parentElement))continue;
    try{
     const range=document.createRange();range.selectNodeContents(node);
     for(const r of range.getClientRects()){
      if(r.right>campaignRect.right+2||r.left<campaignRect.left-2){
       spillText.push({text:node.textContent.trim().slice(0,90),
        parent:node.parentElement.className?.baseVal||node.parentElement.className||node.parentElement.tagName,
        right:Math.round(r.right),left:Math.round(r.left)});
       break;
      }
     }
    }catch{}
   }
  }
  const rootChildren=campaign?[...campaign.children].filter(visible).map(el=>{
   const r=el.getBoundingClientRect();
   return {tag:el.tagName,cls:el.className?.baseVal||el.className,
    left:Math.round(r.left),right:Math.round(r.right),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};
  }):[];
  return {
   viewport:innerWidth,view:GCC8.ui.view,year:GCC8.G.state.year,finalsStage:GCC8.G.state.finals?.stage,
   document:{clientWidth:root.clientWidth,scrollWidth:root.scrollWidth,bodyScrollWidth:body.scrollWidth,
             stageClientWidth:stage?.clientWidth??null,stageScrollWidth:stage?.scrollWidth??null},
   overflow:root.scrollWidth>innerWidth+2||body.scrollWidth>innerWidth+2||(stage?.scrollWidth||0)>innerWidth+2,
   outsideCount:outside.length,internalOverflowCount:internal.length,
   offenders:unique.slice(0,12).map(describe),
   campaignRight:campaignRect?.right??null,relevant,overCampaign,spillText:spillText.slice(0,20),rootChildren
  };
 });

 for(const year of years){
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
    const baseline=await inspect();
    const tag=await page.addStyleTag({content:hypothesisCss});
    await page.waitForTimeout(40);
    const experiment=await inspect();
    await tag.evaluate(el=>el.remove());
    const name=year+'-finals-'+stage+'-'+width;
    states.push({name,baseline,experiment});
    if(process.env.GCC8_DIAGNOSTIC_SCREENSHOTS==='1'&&[390,320].includes(width)){
     await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
    }
   }
  }
 }
 const report={
  status:'DIAGNOSTIC_ONLY',
  candidate_sha256:sha,
  years,
  stages:['gf-ready','done'],
  widths:[1440,1024,768,390,360,320],
  errors,states,hypothesisCss,
  note:'Browser-only CSS hypothesis, removed after each measurement. No release or game source was changed. No artifact uploads.'
 };
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({
  status:report.status,candidate_sha256:sha,states:states.length,errors,
  hypothesisCss,
  findings:states.filter(s=>s.baseline.overflow||s.experiment.overflow).map(s=>({
   name:s.name,baselineWidth:s.baseline.document.scrollWidth,
   experimentalWidth:s.experiment.document.scrollWidth,viewport:s.baseline.viewport,
   previewSides:s.baseline.relevant.filter(e=>e.selector.includes('gccuiKnockoutSide')).map(e=>e.rect.width),
   previewSidesAfter:s.experiment.relevant.filter(e=>e.selector.includes('gccuiKnockoutSide')).map(e=>e.rect.width),
   baselineTextSpill:s.baseline.spillText.slice(0,10),
   experimentalTextSpill:s.experiment.spillText.slice(0,10),
   baselineRootChildren:s.baseline.rootChildren,
   baselineOverCampaign:s.baseline.overCampaign.slice(0,10).map(e=>({selector:e.selector,rect:e.rect})),
   baselineRelevant:s.baseline.relevant.slice(0,20).map(e=>({selector:e.selector,rect:e.rect,scroll:e.scrollWidth,client:e.clientWidth,min:e.css.minWidth,display:e.css.display,grid:e.css.gridTemplateColumns})),
   experimentRelevant:s.experiment.relevant.slice(0,20).map(e=>({selector:e.selector,rect:e.rect,scroll:e.scrollWidth,client:e.clientWidth}))
  }))
 },null,2));
 await browser.close();
 if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
