/* QA only. Disposable native contexts; no connection to the user's browser/save. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
 const baseline=process.env.GCC8_BASELINE_BUILD,candidate=process.env.GCC8_TEST_BUILD;
 if(!baseline||!candidate)throw Error('Both exact builds are required');
 const out=process.env.GCC8_CONTROL_DIR||'qa/results/shared-controls-native';fs.mkdirSync(out,{recursive:true});
 const sizes=[[1440,900],[1280,720],[390,844]],guides={},states=[],failures=[],errors=[],omissions=[];
 const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 const report={baseline_sha256:hash(baseline),candidate_sha256:hash(candidate),states,failures,errors,omissions,
  scope:'Real game DOM and controller actions in disposable browser contexts. Generated completed-2009 checkpoint optionally progresses legally through the next annual draft; no live user data.'};
 let browser,page,label;
 const check=(ok,scope,detail)=>{if(!ok)failures.push({label,scope,detail});};
 const call=async(action,...args)=>{const r=await page.evaluate(([action,args])=>({ok:GCC8.dispatch(action,args),feedback:document.querySelector('#g8feedback')?.textContent}),[action,args]);if(!r.ok)throw Error(action+': '+r.feedback);};
 const section=async(scope,fn)=>{try{await fn();}catch(e){failures.push({label,scope,error:String(e.stack||e)});}};
 const snapshot=async()=>page.evaluate(()=>{
  const root=document.querySelector('dialog[open]')||document.querySelector('#g8app');
  const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const properties=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','textTransform','color','backgroundColor','backgroundImage','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderColor','borderRadius','padding','margin','boxShadow','transform','display','gap','gridTemplateColumns'];
  const style=e=>{const s=getComputedStyle(e);return Object.fromEntries(properties.map(p=>[p,s[p]]));};
  const controls=[...root.querySelectorAll('.g8button')].filter(visible).map(e=>({text:e.textContent.trim(),classes:e.className,disabled:e.disabled,selected:e.getAttribute('aria-pressed'),...rect(e),...style(e)}));
  return {view:GCC8.ui.view,modal:GCC8.ui.modal,viewport:{width:innerWidth,height:innerHeight},horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,controls,
   guide:root.querySelector('.g8guide')?[...root.querySelectorAll('.g8modalhead,.g8modalhead *, .g8guide,.g8guide *, .g8guidefooter,.g8guidefooter *')].filter(visible).map(e=>({tag:e.tagName,text:e.children.length?'':e.textContent.trim(),...rect(e),...style(e)})):null};
 });
 const capture=async(name,{guide=false}={})=>{for(const [width,height] of sizes){
  await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);await page.mouse.move(0,0);
  await page.evaluate(()=>{scrollTo(0,0);for(const e of document.querySelectorAll('#g8dialog,.g8modalbody'))e.scrollTop=0;});
  const state={label,name,...await snapshot()};states.push(state);console.log('CAPTURE',label,name,width,height);
  if(label==='after'&&!guide){
   check(!state.horizontalOverflow,name+' containment',state.viewport);
   for(const c of state.controls){
    check(c.fontFamily.startsWith('Inter'),name+' body font',{viewport:state.viewport,control:c});
    if(c.text&&!/g8iconbutton|g8icononly/.test(c.classes))check(c.height>=43.5,name+' 44px ordinary control',{viewport:state.viewport,control:c});
    if(c.classes.split(/\s+/).includes('g8primary'))check(c.boxShadow==='none',name+' flat primary',{viewport:state.viewport,control:c});
   }
  }
  if(guide){check(Array.isArray(state.guide)&&state.guide.length>0,name+' guide rendered',state.viewport);const key=name+'-'+width;if(label==='before')guides[key]=state.guide;else check(JSON.stringify(guides[key])===JSON.stringify(state.guide),name+' guide computed-style/geometry parity',{viewport:state.viewport,before:guides[key],after:state.guide});}
  await page.screenshot({path:path.join(out,`${label}-${name}-${width}x${height}.png`),fullPage:true});
 }await page.setViewportSize({width:1440,height:900});};
 const probeInteractions=async(name)=>{
  for(const kind of ['g8primary','g8ghost']){
   const b=page.locator(`.g8button.${kind}:visible:not(:disabled)`).first();if(!await b.count()){omissions.push({label,scope:name+' '+kind,reason:'No enabled visible instance'});continue;}
   await b.hover();let style=await b.evaluate(e=>({text:e.textContent.trim(),transform:getComputedStyle(e).transform,shadow:getComputedStyle(e).boxShadow}));states.push({label,name:name+' hover '+kind,...style});
   if(label==='after')check(style.transform==='none',name+' stationary hover',style);
   const box=await b.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
   try{style=await b.evaluate(e=>({text:e.textContent.trim(),transform:getComputedStyle(e).transform}));if(label==='after')check(style.transform==='none',name+' stationary active',style);states.push({label,name:name+' active '+kind,...style});}
   finally{await page.mouse.move(0,0);await page.mouse.up();}
  }
  const first=page.locator('.g8button:visible:not(:disabled)').first();await first.focus();await page.keyboard.press('Tab');
  const focus=await page.evaluate(()=>{const e=document.activeElement,s=getComputedStyle(e);return {tag:e.tagName,text:e.textContent.trim().slice(0,100),outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,disabled:e.disabled,insideModal:!!e.closest('#g8dialog')};});states.push({label,name:name+' keyboard Tab',focus});
  if(label==='after')check(!focus.disabled&&focus.outlineStyle!=='none'&&parseFloat(focus.outlineWidth)>=2,name+' visible keyboard focus',focus);
 };
 const load=async(file,raw)=>{
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});page=await context.newPage();page.setDefaultTimeout(12000);
  page.on('pageerror',e=>errors.push({label,message:e.message}));await page.route(/^https?:/,r=>r.abort());
  if(raw)await page.addInitScript(raw=>localStorage.setItem('gcc_dynasty_v8',raw),raw);
  await page.goto(pathToFileURL(path.resolve(file)).href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.GCC8?.dispatch);return context;
 };
 try{
  browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  for(const pair of [['before',baseline],['after',candidate]]){label=pair[0];const file=pair[1];let context;
   try{
    context=await load(file);await section('home',async()=>{await capture('home');await probeInteractions('home');
     const disabled=await page.locator('.g8button:disabled:visible').evaluateAll(es=>es.map(e=>({text:e.textContent.trim(),disabled:e.disabled,opacity:getComputedStyle(e).opacity})));states.push({label,name:'home disabled controls',disabled});check(disabled.length>0,'home disabled coverage','Fresh career should expose disabled Continue');});
    for(const action of ['how','howItWorks','breakawayStory'])await section(action,async()=>{
     await call(action);await capture(action,{guide:true});
     await page.locator('#g8dialog .g8dialogclose').focus();await page.keyboard.press('Tab');
     const focusedInside=await page.evaluate(()=>!!document.activeElement.closest('#g8dialog'));check(focusedInside,action+' modal Tab containment',{});
     await page.keyboard.press('Escape');check(!await page.locator('#g8dialog').evaluate(e=>e.open),action+' Escape closes',{});
    });
   }finally{if(context)await context.close();}
   const career=process.env.GCC8_BROWSER_CAREER_DIR;
   if(!career){omissions.push({label,scope:'generated career surfaces',reason:'GCC8_BROWSER_CAREER_DIR not supplied'});continue;}
   await section('generated career journey',async()=>{
    const raw=fs.readFileSync(path.join(career,'checkpoint-2009.json'),'utf8');context=await load(file,raw);
    try{
     await call('continue');await capture('season-review');
     const id=await page.evaluate(()=>GCC8.roster().sort((a,b)=>b.name.length-a.name.length)[0].id);
     await call('inspect',id);await capture('player');await call('playerTab','skills');await capture('player-attributes');await call('close');
     await call('offseason');await call('trade');await capture('trade');await probeInteractions('trade');await call('close');
     await call('cpuMarket');await call('annualDraw');await call('revealAll');await call('annualDraft');
     for(let guard=0;guard<30&&await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft');guard++){
      await call('skipPick');if(!await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft'))break;
      const pick=await page.evaluate(()=>{const rs=GCC8.roster(),pool=GCC8.pool(true);return (pool.find(p=>p.keeping>=65&&!rs.some(q=>q.keeping>=65))||pool.find(p=>p.maxOvers>=4&&rs.filter(q=>q.maxOvers>=4).length<6)||pool[0])?.id;});if(pick==null)throw Error('Annual pool empty');await call('draftPlayer',pick);
     }
     await call('lodgeList');await call('annualTeam');await capture('team');
     const ids=await page.evaluate(()=>{const rs=GCC8.roster().filter(p=>GCC8.G.state.dynasty.injuries?.[p.id]?.status!=='OUT'),best=GCC8.G.bestXI(rs),keeper=rs.find(p=>p.keeping>=65);if(keeper&&!best.some(p=>p.keeping>=65))best[best.map((p,i)=>({p,i})).sort((a,b)=>a.p.overall-b.p.overall)[0].i]=keeper;return best.map(p=>p.id);});
     await call('clearXI');for(const id of ids)await call('select',id);await capture('team-selected');await call('lodge');await capture('season');await probeInteractions('season');
    }finally{if(context)await context.close();context=null;}
   });
  }
 }catch(e){failures.push({label,scope:'browser-run',error:String(e.stack||e)});}
 finally{if(browser)await browser.close();report.status=failures.length||errors.length?'FAIL':'PASS';report.guide_computed_style_parity=Object.keys(guides).length===9&&states.filter(s=>s.label==='after'&&s.guide?.length).length===9&&!failures.some(f=>f.scope.includes('guide computed-style')||f.scope.includes('guide rendered'));fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,states:states.length},null,2));if(report.status!=='PASS')process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1;});
