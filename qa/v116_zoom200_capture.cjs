/* Native 200% Chromium zoom capture without clipping.
   Playwright page.screenshot() computes its clip in CSS pixels and ignores browser zoom, so earlier zoomed captures showed only the top-left quarter.
   This harness captures each viewport with CDP Page.captureScreenshot (no clip, no beyond-viewport), verifies every image is exactly
   innerWidth*DPR x innerHeight*DPR, and scrolls in overlapping viewport-height steps until the end of the page (or dialog) is reached.
   Images are never resized or cropped. Env: GCC8_TEST_BUILD, GCC8_BROWSER_CAREER_DIR, GCC8_ZOOM_DIR, GCC8_CHROMIUM, optional GCC8_EXPECT_SHA256. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),os=require('os'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
const file=process.env.GCC8_TEST_BUILD,out=process.env.GCC8_ZOOM_DIR||'qa/results/zoom200',raw=fs.readFileSync(path.join(process.env.GCC8_BROWSER_CAREER_DIR,'checkpoint-2009.json'),'utf8'),sha=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(process.env.GCC8_EXPECT_SHA256&&sha!==process.env.GCC8_EXPECT_SHA256)throw Error('Wrong candidate '+sha);fs.mkdirSync(out,{recursive:true});
const report={sha256:sha,zoom:[],screens:[],observations:[],findings:[],errors:[],runtimeErrors:[],limits:['Chromium only. Automated geometry checks plus captured images for human inspection; visual sign-off requires the images to be reviewed.']};let page,cdp;
const record=(ok,id,detail={})=>{report.observations.push({id,result:ok?'PASS':'FAIL',detail});if(!ok)report.findings.push({id,detail});};
const call=async(a,...args)=>{const r=await page.evaluate(([a,args])=>({ok:GCC8.dispatch(a,args),feedback:document.querySelector('#g8feedback')?.textContent}),[a,args]);if(!r.ok)throw Error('Rejected '+a+' '+r.feedback);};
const prepareXI=async()=>{await call('continue');await call('offseason');await call('cpuMarket');await call('annualDraw');await call('revealAll');await call('annualDraft');for(let n=0;n<30&&await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft');n++){await call('skipPick');if(!await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft'))break;const id=await page.evaluate(()=>{const r=GCC8.roster(),p=GCC8.pool(true);return(p.find(x=>x.keeping>=65&&!r.some(y=>y.keeping>=65))||p.find(x=>x.maxOvers>=4&&r.filter(y=>y.maxOvers>=4).length<6)||p[0])?.id;});await call('draftPlayer',id);}await call('lodgeList');await call('annualTeam');const ids=await page.evaluate(()=>{const r=GCC8.roster().filter(p=>GCC8.G.state.dynasty.injuries?.[p.id]?.status!=='OUT'),best=GCC8.G.bestXI(r),k=r.find(p=>p.keeping>=65);if(k&&!best.some(p=>p.keeping>=65))best[best.map((p,i)=>({p,i})).sort((a,b)=>a.p.overall-b.p.overall)[0].i]=k;return best.map(p=>p.id);});await call('clearXI');for(const id of ids)await call('select',id);await call('teamPane','xi');};
const pngSize=b=>({width:b.readUInt32BE(16),height:b.readUInt32BE(20)});
// Geometry: document overflow plus visible text/control elements whose content is wider than their box or that leave the viewport/scroll container horizontally.
const geometry=()=>page.evaluate(()=>{const root=document.querySelector('#g8dialog[open]')||document.querySelector('#g8app'),vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width&&r.height&&s.visibility!=='hidden'&&s.display!=='none';};
 const inScroller=e=>{for(let a=e.parentElement;a&&a!==root;a=a.parentElement){const o=getComputedStyle(a).overflowX;if((o==='auto'||o==='scroll')&&a.scrollWidth>a.clientWidth)return true;}return false;};
 const issues=[];for(const e of root.querySelectorAll('button,summary,input,select,h1,h2,h3,p,strong,span,small,label,li,td,th')){if(!vis(e)||inScroller(e))continue;{const b=e.getBoundingClientRect();if(b.width<=2||b.height<=2)continue;}/* visually-hidden accessible text */const r=e.getBoundingClientRect(),s=getComputedStyle(e);const textOverflow=['hidden','clip'].includes(s.overflowX)&&e.scrollWidth>e.clientWidth+2;const offX=r.x<-1||r.right>innerWidth+1;if((textOverflow||offX)&&(e.textContent||'').trim())issues.push({tag:e.tagName,cls:String(e.className).slice(0,60),text:(e.textContent||'').trim().slice(0,60),x:Math.round(r.x),right:Math.round(r.right),scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,textOverflow,offX});}
 return{innerWidth,innerHeight,outerWidth,devicePixelRatio,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,issues:issues.slice(0,40),issueCount:issues.length};});
const capture=async(name,dialog=false)=>{await page.evaluate(()=>document.fonts.ready);
 const scroller=dialog?'#g8dialog[open] .g8dialogbody, #g8dialog[open]':null;
 const metrics=async()=>page.evaluate(sel=>{let el=document.scrollingElement;if(sel){const c=[...document.querySelectorAll(sel)].find(e=>e.scrollHeight>e.clientHeight+1&&['auto','scroll'].includes(getComputedStyle(e).overflowY));if(c)el=c;else{const d=document.querySelector('#g8dialog[open]');const inner=d&&[...d.querySelectorAll('*')].find(e=>e.scrollHeight>e.clientHeight+1&&['auto','scroll'].includes(getComputedStyle(e).overflowY));el=inner||document.scrollingElement;}}window.__gccScroller=el;const isDoc=el===document.scrollingElement,client=isDoc?innerHeight:el.clientHeight,top0=isDoc?0:el.getBoundingClientRect().top;let sticky=0;for(const d of (isDoc?document.querySelectorAll('#g8app *'):el.querySelectorAll('*'))){const cs=getComputedStyle(d);if(cs.position!=='sticky'&&cs.position!=='fixed')continue;const r=d.getBoundingClientRect();if(r.height&&r.top<=top0+client*0.5&&r.bottom>top0)sticky=Math.max(sticky,r.bottom-top0);}return{top:el.scrollTop,height:el.scrollHeight,client,isDoc,sticky,effective:Math.max(60,client-sticky)};},scroller);
 let m=await metrics();await page.evaluate(()=>{window.__gccScroller.scrollTop=0;});await page.waitForTimeout(200);m=await metrics();
 const g=await geometry();const segments=[];const step=Math.max(40,Math.floor(m.effective*0.8));/* step by the area not covered by sticky headers so consecutive parts overlap */
 for(let i=0;i<40;i++){const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});const buf=Buffer.from(shot.data,'base64'),size=pngSize(buf),f=`${name}-part${String(i+1).padStart(2,'0')}.png`;fs.writeFileSync(path.join(out,f),buf);
  const cur=await page.evaluate(()=>({top:window.__gccScroller.scrollTop,height:window.__gccScroller.scrollHeight,scrollX}));
  const expect={width:Math.round(g.innerWidth*g.devicePixelRatio),height:Math.round(g.innerHeight*g.devicePixelRatio)};
  segments.push({file:f,size,expect,scrollTop:cur.top,scrollX:cur.scrollX});record(size.width===expect.width&&Math.abs(size.height-expect.height)<=1,/* innerHeight can be fractional at 2x: allow 1 device px rounding */`${name} part ${i+1} captures the complete zoomed viewport`,{size,expect});
  if(cur.top+m.client>=cur.height-1)break;await page.evaluate(s=>{window.__gccScroller.scrollTop+=s;},step);await page.waitForTimeout(200);}
 const end=await page.evaluate(()=>({top:window.__gccScroller.scrollTop,height:window.__gccScroller.scrollHeight}));
 report.screens.push({name,scroller:m.isDoc?'document':'dialog',viewportCssHeight:m.client,stickyCss:m.sticky,overlapCss:m.effective-step,geometry:g,segments,reachedEnd:end.top+m.client>=end.height-1});
 record(g.scrollWidth<=g.innerWidth+1,`${name} no horizontal page overflow`,{width:g.innerWidth,scrollWidth:g.scrollWidth});
 record(end.top+m.client>=end.height-1,`${name} vertical scrolling reaches the end of content`,end);
 record(g.issueCount===0,`${name} no clipped or offscreen text/controls`,{issues:g.issues});
 await page.evaluate(()=>{window.__gccScroller.scrollTop=0;});};
for(const physical of [1440,640]){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-zoom-'));fs.mkdirSync(path.join(dir,'Default'));fs.writeFileSync(path.join(dir,'Default','Preferences'),JSON.stringify({partition:{default_zoom_level:{x:Math.log(2)/Math.log(1.2)}}}));
 const c=await chromium.launchPersistentContext(dir,{executablePath:process.env.GCC8_CHROMIUM,headless:true,viewport:null,reducedMotion:'reduce',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--window-size='+physical+',1000']});
 try{await c.addInitScript(raw=>{Date.now=()=>1794484800000;let n=101;Math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};localStorage.setItem('gcc_dynasty_v8',raw);},raw);
  page=c.pages()[0]||await c.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>report.runtimeErrors.push(e.message));await page.route(/^https?:/,r=>r.abort());
  await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForFunction(()=>!!window.GCC8?.dispatch);cdp=await c.newCDPSession(page);
  const metrics=await page.evaluate(()=>({innerWidth,outerWidth,innerHeight,devicePixelRatio,visualScale:visualViewport.scale}));
  const verified=Math.abs(metrics.devicePixelRatio-2)<0.05&&Math.abs(metrics.outerWidth/metrics.innerWidth-2)<0.05&&metrics.innerWidth===physical/2;
  report.zoom.push({physical,metrics,verified});record(verified,`native 200% zoom active at ${physical}px physical (CSS ${physical/2}px)`,metrics);if(!verified)continue;
  const w=physical/2;await capture(`zoom200-home-${w}`);
  await prepareXI();await call('lodge');await capture(`zoom200-matchday-${w}`);
  await page.locator('[data-action=manageInspect]:visible').first().click();await page.waitForSelector('#g8dialog[open]');await page.waitForTimeout(250);await capture(`zoom200-player-${w}`,true);
  // Keyboard focus indicator on the dialog close control while zoomed.
  await page.locator('#g8dialog[open] .g8dialogclose').focus();await page.keyboard.press('Shift+Tab');await page.keyboard.press('Tab');await page.waitForTimeout(250);
  const f=await page.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),s=getComputedStyle(e);return{text:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),focusVisible:e.matches(':focus-visible'),outlineWidth:parseFloat(s.outlineWidth),inViewport:r.x>=-1&&r.right<=innerWidth+1&&r.y>=-1&&r.bottom<=innerHeight+1};});
  record(f.focusVisible&&f.outlineWidth>0&&f.inViewport,`zoom200-player-${w} keyboard focus indicator visible`,f);
  const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,`zoom200-player-${w}-focus.png`),Buffer.from(shot.data,'base64'));
 }catch(e){report.errors.push(`${physical}: ${e.stack||e}`);}finally{await c.close();fs.rmSync(dir,{recursive:true,force:true});}
}
report.status=report.errors.length||report.runtimeErrors.length?'ERROR':report.findings.length?'FINDINGS':'PASS';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sha256:sha,status:report.status,zoom:report.zoom,screens:report.screens.map(s=>({name:s.name,parts:s.segments.length,reachedEnd:s.reachedEnd,issues:s.geometry.issueCount})),findings:report.findings.map(f=>f.id),errors:report.errors,runtimeErrors:report.runtimeErrors}));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
