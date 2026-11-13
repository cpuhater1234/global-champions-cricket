/* Focused 320/360/390px checks: Season record tile separation and career-navigation Tab focus visibility.
   Diagnostic harness: reads GCC8_TEST_BUILD, GCC8_BROWSER_CAREER_DIR (checkpoint-2009.json), GCC8_NARROW_DIR, optional GCC8_EXPECT_SHA256. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
const file=process.env.GCC8_TEST_BUILD,out=process.env.GCC8_NARROW_DIR||'qa/results/narrow-focus-layout',raw=fs.readFileSync(path.join(process.env.GCC8_BROWSER_CAREER_DIR,'checkpoint-2009.json'),'utf8'),sha=createHash('sha256').update(fs.readFileSync(file)).digest('hex');
if(process.env.GCC8_EXPECT_SHA256&&sha!==process.env.GCC8_EXPECT_SHA256)throw Error('Wrong candidate '+sha);fs.mkdirSync(out,{recursive:true});
const report={sha256:sha,observations:[],findings:[],errors:[],runtimeErrors:[],ribbon:[],focus:[],limits:['Chromium only. Layout and focus geometry checks; not a screen-reader or full visual sign-off.']};let page;
const record=(ok,id,detail={})=>{report.observations.push({id,result:ok?'PASS':'FAIL',detail});if(!ok)report.findings.push({id,detail});};
const call=async(a,...args)=>{const r=await page.evaluate(([a,args])=>({ok:GCC8.dispatch(a,args),feedback:document.querySelector('#g8feedback')?.textContent}),[a,args]);if(!r.ok)throw Error('Rejected '+a+' '+r.feedback);};
const prepareXI=async()=>{await call('continue');await call('offseason');await call('cpuMarket');await call('annualDraw');await call('revealAll');await call('annualDraft');for(let n=0;n<30&&await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft');n++){await call('skipPick');if(!await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft'))break;const id=await page.evaluate(()=>{const r=GCC8.roster(),p=GCC8.pool(true);return(p.find(x=>x.keeping>=65&&!r.some(y=>y.keeping>=65))||p.find(x=>x.maxOvers>=4&&r.filter(y=>y.maxOvers>=4).length<6)||p[0])?.id;});await call('draftPlayer',id);}await call('lodgeList');await call('annualTeam');const ids=await page.evaluate(()=>{const r=GCC8.roster().filter(p=>GCC8.G.state.dynasty.injuries?.[p.id]?.status!=='OUT'),best=GCC8.G.bestXI(r),k=r.find(p=>p.keeping>=65);if(k&&!best.some(p=>p.keeping>=65))best[best.map((p,i)=>({p,i})).sort((a,b)=>a.p.overall-b.p.overall)[0].i]=k;return best.map(p=>p.id);});await call('clearXI');for(const id of ids)await call('select',id);await call('teamPane','xi');};
const browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
try{
const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await ctx.addInitScript(raw=>{Date.now=()=>1794484800000;let n=101;Math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};localStorage.setItem('gcc_dynasty_v8',raw);},raw);
page=await ctx.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>report.runtimeErrors.push(e.message));await page.route(/^https?:/,r=>r.abort());
await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForFunction(()=>!!window.GCC8?.dispatch);
await prepareXI();await call('lodge');
for(const width of [320,360,390]){
 await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(150);
 const r=await page.evaluate(()=>{const box=e=>{const rg=document.createRange();rg.selectNodeContents(e);const rs=[...rg.getClientRects()].filter(r=>r.width&&r.height),b=e.getBoundingClientRect();if(!rs.length)return{x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};const x=Math.min(...rs.map(r=>r.left)),y=Math.min(...rs.map(r=>r.top)),right=Math.max(...rs.map(r=>r.right)),bottom=Math.max(...rs.map(r=>r.bottom));return{x,y,width:right-x,height:bottom-y,right,bottom,lines:new Set(rs.map(r=>Math.round(r.top))).size};};
  const elbox=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const inter=(a,b)=>a.x<b.right-0.5&&b.x<a.right-0.5&&a.y<b.bottom-0.5&&b.y<a.bottom-0.5;
  const tiles=[...document.querySelectorAll('.gccuiCampaignRibbon>div')].map(d=>{const label=d.querySelector(':scope>span'),value=d.querySelector(':scope>strong,:scope>.gccuiCampaignForm'),note=d.querySelector(':scope>small'),tile=elbox(d),L=box(label),V=value?box(value):null,N=note?box(note):null,ls=getComputedStyle(label),vs=value?getComputedStyle(value):null;
   const inside=b=>!b||(b.x>=tile.x-0.5&&b.right<=tile.right+0.5&&b.y>=tile.y-0.5&&b.bottom<=tile.bottom+0.5);
   return{label:label.textContent.trim(),value:value?.textContent.trim(),labelBox:L,valueBox:V,noteBox:N,tile,labelValueIntersect:V?inter(L,V):false,valueNoteIntersect:V&&N?inter(V,N):false,contained:inside(L)&&inside(V)&&inside(N),labelFont:parseFloat(ls.fontSize),valueFont:vs?parseFloat(vs.fontSize):null,labelVisible:L.width>0&&L.height>0&&ls.visibility!=='hidden'&&ls.opacity!=='0',valueVisible:!V||(V.width>0&&V.height>0&&vs.visibility!=='hidden'),labelClipped:label.scrollWidth>label.clientWidth+1||label.scrollHeight>label.clientHeight+1};});
  return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,tiles};});
 report.ribbon.push(r);
 record(r.scrollWidth<=r.width+1,`matchday ${width} no document horizontal overflow`,{width:r.width,scroll:r.scrollWidth});
 for(const t of r.tiles){
  record(!t.labelValueIntersect,`matchday ${width} ${t.label} label/value do not intersect`,t);
  record(!t.valueNoteIntersect,`matchday ${width} ${t.label} value/note do not intersect`,t);
  record(t.contained&&t.labelVisible&&t.valueVisible&&!t.labelClipped&&t.labelFont>=11&&(t.valueFont===null||t.valueFont>=11),`matchday ${width} ${t.label} readable and contained`,t);
 }
 const season=r.tiles.find(t=>/season record/i.test(t.label));record(!!season,`matchday ${width} Season record tile present`,{});
 await page.locator('.gccuiCampaignRibbon').screenshot({path:path.join(out,`season-record-${width}.png`)});
}
const focusInfo=()=>page.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect(),s=getComputedStyle(e),ow=parseFloat(s.outlineWidth)||0,oo=parseFloat(s.outlineOffset)||0,pad=s.outlineStyle!=='none'?ow+Math.max(0,oo):0;
 const ring={x:r.x-pad,y:r.y-pad,right:r.right+pad,bottom:r.bottom+pad};let clip={x:0,y:0,right:innerWidth,bottom:innerHeight};
 for(let a=e.parentElement;a&&a!==document.documentElement;a=a.parentElement){const cs=getComputedStyle(a);if(cs.overflowX!=='visible'||cs.overflowY!=='visible'){const b=a.getBoundingClientRect();if(cs.overflowX!=='visible'){clip.x=Math.max(clip.x,b.x);clip.right=Math.min(clip.right,b.right);}if(cs.overflowY!=='visible'){clip.y=Math.max(clip.y,b.y);clip.bottom=Math.min(clip.bottom,b.bottom);}}}
 const pts=[[r.x+2,r.y+r.height/2],[r.right-2,r.y+r.height/2],[r.x+r.width/2,r.y+r.height/2]].map(([x,y])=>{const h=document.elementFromPoint(Math.max(0,Math.min(innerWidth-1,x)),Math.max(0,Math.min(innerHeight-1,y)));return !!h&&(h===e||e.contains(h));});
 const nav=e.closest('.g8careernav');return{tag:e.tagName,text:(e.textContent||'').trim(),focusVisible:e.matches(':focus-visible'),outline:s.outline,outlineWidth:ow,outlineOffset:oo,rect:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},ring,clip,controlInViewport:r.x>=-0.5&&r.right<=innerWidth+0.5&&r.y>=-0.5&&r.bottom<=innerHeight+0.5,ringInClip:ring.x>=clip.x-0.5&&ring.right<=clip.right+0.5&&ring.y>=clip.y-0.5&&ring.bottom<=clip.bottom+0.5,unobscured:pts.every(Boolean),inNav:!!nav,navScrollLeft:nav?.scrollLeft,navScrollWidth:nav?.scrollWidth,navClientWidth:nav?.clientWidth,pageScrollX:scrollX,docScrollWidth:document.documentElement.scrollWidth};});
for(const width of [320,360]){
 await page.setViewportSize({width,height:900});await page.evaluate(()=>{scrollTo(0,0);const n=document.querySelector('.g8careernav');if(n)n.scrollLeft=0;});await page.waitForTimeout(150);
 const labels=await page.locator('.g8careernav button').evaluateAll(es=>es.map(e=>e.textContent.trim()));
 // Start on the HUD Menu control that precedes the navigation, then use only real Tab presses to enter it.
 await page.locator('.g8utilitymenu summary').focus();
 const seq=async(dir)=>{const seen=[];for(let i=0;i<20&&seen.length<labels.length;i++){await page.keyboard.press(dir);await page.waitForTimeout(300);const f=await focusInfo();if(!f.inNav){if(seen.length)break;continue;}seen.push(f.text);report.focus.push({width,dir,...f});record(f.focusVisible&&f.outlineWidth>0,`nav ${width} ${dir} ${f.text} focus indicator rendered`,f);record(f.controlInViewport&&f.ringInClip,`nav ${width} ${dir} ${f.text} control and focus ring fully visible`,f);record(f.unobscured,`nav ${width} ${dir} ${f.text} unobscured`,f);record(f.pageScrollX===0&&f.docScrollWidth<=width+1,`nav ${width} ${dir} ${f.text} page did not shift horizontally`,f);if(/fixtures/i.test(f.text))await page.screenshot({path:path.join(out,`fixtures-focus-${width}-${dir.replace('+','')}.png`),clip:{x:0,y:0,width,height:220}});}return seen;};
 const fwd=await seq('Tab');record(fwd.join('|')===labels.join('|'),`nav ${width} forward Tab visits every nav button in order`,{fwd,labels});
 await page.keyboard.press('Tab');await page.waitForTimeout(100);
 const back=await seq('Shift+Tab');record(back.join('|')===[...labels].reverse().join('|'),`nav ${width} reverse Shift+Tab visits every nav button in order`,{back,labels});
}
await ctx.close();
}catch(e){report.errors.push(String(e.stack||e));}
await browser.close();
report.status=report.errors.length||report.runtimeErrors.length?'ERROR':report.findings.length?'FINDINGS':'PASS';
fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sha256:sha,status:report.status,observations:report.observations.length,findings:report.findings.map(f=>f.id),errors:report.errors,runtimeErrors:report.runtimeErrors}));
if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
