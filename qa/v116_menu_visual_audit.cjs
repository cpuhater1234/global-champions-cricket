const {chromium}=require('playwright');
const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');
const {createHash}=require('crypto');

(async()=>{
 const html=process.env.GCC8_TEST_BUILD||'qa/results/v116-menu-review/GCC_v116_menu_review.html';
 const out=process.env.GCC8_MENU_SCREENSHOT_DIR||'qa/results/v116-menu-review/screenshots';
 const expected=process.env.GCC8_MENU_EXPECTED_SHA||null;
 const bytes=fs.readFileSync(html);
 const sha=createHash('sha256').update(bytes).digest('hex');
 if(expected&&sha!==expected)throw Error('Unexpected menu candidate SHA: '+sha);
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({
  executablePath:process.env.GCC8_CHROMIUM||undefined,
  headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']
 });
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[],states=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.goto(pathToFileURL(path.resolve(html)).href,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.GCC8?.dispatch,{timeout:20000});

 const open=async action=>{
  const ok=await page.evaluate(a=>GCC8.dispatch(a,[]),action);
  if(!ok)throw Error('Could not open guide '+action);
  await page.waitForFunction(()=>document.querySelector('#g8dialog')?.open&&!!document.querySelector('#g8dialog .g8guide'));
  await page.waitForTimeout(100);
 };
 const close=async()=>{
  await page.evaluate(()=>GCC8.dispatch('close',[]));
  await page.waitForFunction(()=>!document.querySelector('#g8dialog')?.open);
 };
 const inspect=async()=>page.evaluate(()=>{
  const d=document.getElementById('g8dialog'),guide=d?.querySelector('.g8guide');
  const visible=el=>{
   if(el.closest('[hidden],[inert]'))return false;
   const cs=getComputedStyle(el),r=el.getBoundingClientRect();
   return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0;
  };
  const all=[...guide.querySelectorAll('*')].filter(visible);
  const r=d.getBoundingClientRect(),grid=guide.querySelector('.g8guidegrid');
  const rules=guide.querySelector('.g8rulegrid');
  const footer=guide.querySelector('.g8guidefooter nav');
  const columns=el=>{
   if(!el)return 0;
   const style=getComputedStyle(el).gridTemplateColumns;
   return style==='none'?0:style.split(' ').filter(Boolean).length;
  };
  const outside=all.filter(el=>{
   const b=el.getBoundingClientRect();
   return b.left<r.left-2||b.right>r.right+2;
  }).slice(0,12).map(el=>({
   tag:el.tagName,cls:typeof el.className==='string'?el.className:'',
   left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right)
  }));
  const lastStory=guide.querySelector('.g8storychapters>.g8guidecard:last-child');
  const number=guide.querySelector('.g8guidenumber');
  const modalBody=d.querySelector('.g8modalbody');
  return {
   prompt:d.dataset.prompt,viewport:innerWidth,dialog:{width:Math.round(r.width),clientWidth:d.clientWidth,scrollWidth:d.scrollWidth},
   document:{clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth},
   horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2||d.scrollWidth>d.clientWidth+2,
   guideCards:guide.querySelectorAll('.g8guidegrid>.g8guidecard').length,
   guideColumns:columns(grid),ruleColumns:columns(rules),footerColumns:columns(footer),
   introHeading:guide.querySelector('.g8guideintro h3')?getComputedStyle(guide.querySelector('.g8guideintro h3')).fontSize:null,
   introBackground:guide.querySelector('.g8guideintro')?getComputedStyle(guide.querySelector('.g8guideintro')).backgroundColor:null,
   cardBackground:guide.querySelector('.g8guidecard')?getComputedStyle(guide.querySelector('.g8guidecard')).backgroundColor:null,
   cardBorderTop:guide.querySelector('.g8guidecard')?getComputedStyle(guide.querySelector('.g8guidecard')).borderTopWidth+' '+getComputedStyle(guide.querySelector('.g8guidecard')).borderTopStyle:null,
   numberRadius:number?getComputedStyle(number).borderRadius:null,
   modalBodyBackground:modalBody?getComputedStyle(modalBody).backgroundColor:null,
   lastStoryHeadingColor:lastStory?getComputedStyle(lastStory.querySelector('h3')).color:null,
   outsideCount:outside.length,outside,
  };
 });

 for(const action of ['how','howItWorks','breakawayStory']){
  await open(action);
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:1000});
   await page.waitForTimeout(60);
   const state=await inspect();
   const name=action+'-'+width;
   states.push({name,...state});
   await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
  }
  if(action==='how'){
   await page.setViewportSize({width:390,height:1000});
   const summaries=await page.locator('#g8dialog .g8guiderules details.g8disclosure>summary').count();
   for(let i=0;i<summaries;i++){
    const summary=page.locator('#g8dialog .g8guiderules details.g8disclosure>summary').nth(i);
    await summary.click();
    await page.waitForTimeout(60);
    const state=await inspect();
    const name='how-rule-'+(i+1)+'-390';
    states.push({name,...state,ruleOpen:true});
    await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
    await summary.click();
   }
  }
  await close();
 }
 const report={
  status:'MENU_VISUAL_REVIEW',
  candidate_sha256:sha,candidate_bytes:bytes.length,
  guides:['how','howItWorks','breakawayStory'],
  widths:[320,390,768,1024,1440],
  errors,states,
  failures:states.filter(s=>s.horizontalOverflow||s.outsideCount>0||
   (s.viewport>=860&&s.guideColumns!==2)||
   (s.viewport<860&&s.guideColumns!==1)||
   (s.viewport>=860&&s.ruleColumns!==2)||
   (s.viewport<860&&s.ruleColumns!==1))
 };
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({
  status:report.status,candidate_sha256:sha,states:states.length,errors,
  failures:report.failures.map(s=>({name:s.name,overflow:s.horizontalOverflow,outside:s.outsideCount,guideColumns:s.guideColumns,ruleColumns:s.ruleColumns,dialog:s.dialog}))
 },null,2));
 await browser.close();
 if(errors.length||report.failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
