/* QA only: disposable native contexts; real controller callbacks, no user session. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
 const baseline=process.env.GCC8_BASELINE_BUILD,candidate=process.env.GCC8_TEST_BUILD,out=process.env.GCC8_REVEAL_DIR||'qa/results/reveal-decisions-native';
 if(!baseline||!candidate)throw Error('Both exact builds required');fs.mkdirSync(out,{recursive:true});
 const sizes=[[1440,900],[1150,900],[768,900],[390,844],[320,844]],states=[],failures=[],errors=[],omissions=[],parity={};let page,label,browser;
 const hash=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
 const check=(ok,scope,detail)=>{if(!ok)failures.push({label,scope,detail});};
 const call=async(action,...args)=>{const r=await page.evaluate(([a,b])=>({ok:GCC8.dispatch(a,b),feedback:document.querySelector('#g8feedback')?.textContent}),[action,args]);if(!r.ok)throw Error(action+': '+r.feedback);};
 const section=async(name,fn)=>{try{await fn();}catch(e){failures.push({label,scope:name,error:String(e.stack||e)});}};
 const load=async(file,raw)=>{
  const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});page=await ctx.newPage();page.setDefaultTimeout(12000);
  page.on('pageerror',e=>errors.push({label,message:e.message}));await page.route(/^https?:/,r=>r.abort());
  await page.addInitScript(()=>{let n=101;Math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};});
  if(raw)await page.addInitScript(x=>localStorage.setItem('gcc_dynasty_v8',x),raw);
  await page.goto(pathToFileURL(path.resolve(file)).href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.GCC8?.dispatch);return ctx;
 };
 const snapshot=()=>page.evaluate(()=>{
  const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';};
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const grid=document.querySelector('.g8revealgrid'),draw=document.querySelector('.g8drawcontrols'),panel=document.querySelector('.gccuiMatchDecisions')||document.querySelector('.g8dressingroom');
  const cards=grid?[...grid.children].map(e=>({...rect(e),sealed:e.classList.contains('g8sealed'),name:e.querySelector('h3')?.textContent,ground:e.querySelector('.g8clubground')?.textContent})):[];
  const controls=draw?[...draw.querySelectorAll('button')].filter(vis).map(e=>({text:e.textContent.trim(),disabled:e.disabled,...rect(e)})):[];
  const pace=draw?.querySelector('.g8drawpace'),next=draw?.querySelector('.g8drawnext'),n=next?.querySelector('button');
  return {view:GCC8.ui.view,reveal:GCC8.ui.reveal?{...GCC8.ui.reveal}:null,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+2,cards,controls,draw:draw?rect(draw):null,
   gates:draw?{paceInert:pace.inert,paceHidden:pace.getAttribute('aria-hidden'),nextInert:next.inert,nextHidden:next.getAttribute('aria-hidden'),nextDisabled:n.disabled,paceDisabled:[...pace.querySelectorAll('button')].map(e=>e.disabled)}:null,
   decisions:panel?{text:panel.textContent.replace(/\s+/g,' ').trim(),...rect(panel),buttons:[...panel.querySelectorAll('button')].filter(vis).map(e=>({text:e.textContent.trim(),action:e.dataset.action,args:e.dataset.args,disabled:e.disabled,...rect(e)}))}:null};
 });
 const capture=async(name)=>{
  for(const [width,height] of sizes){await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
   const s={label,name,...await snapshot()};states.push(s);console.log('CAPTURE',label,name,width);check(!s.overflow,name+' document containment',width);
   if(s.cards.length){check(s.cards.length===8,name+' eight cards',s.cards.length);const complete=s.reveal?.count===8;
    check(s.gates.paceInert===complete&&s.gates.nextInert===!complete&&s.gates.nextDisabled===!complete,name+' inert gates',s.gates);
    check(s.gates.paceHidden===(complete?'true':null)&&s.gates.nextHidden===(complete?null:'true'),name+' aria gates',s.gates);
    check(s.gates.paceDisabled.every(x=>x===complete),name+' disabled pace gates',s.gates);
    for(const c of s.controls){check(c.height>=43.5,name+' 44px control',{width,c});check(c.x>=s.draw.x-1&&c.x+c.width<=s.draw.x+s.draw.width+1,name+' control containment',{width,c});}
    const heights=s.controls.map(c=>c.height);check(Math.max(...heights)-Math.min(...heights)<=2,name+' equal control heights',{width,heights});
    const key=name.replace(/-(sealed|partial|complete)$/,'')+'-'+width,prior=states.find(x=>x.label===label&&x.name===name.replace(/-(sealed|partial|complete)$/,'-sealed')&&x.width===width);
    if(prior&&!name.endsWith('-sealed'))check(s.cards.every((c,i)=>Math.abs(c.height-prior.cards[i].height)<=2&&Math.abs(c.y-prior.cards[i].y)<=2),name+' reserved card geometry',{width,before:prior.cards,after:s.cards});
    if(complete){const text=s.cards.map(c=>[c.name,c.ground]);if(label==='before')parity[key]=text;else check(JSON.stringify(parity[key])===JSON.stringify(text),name+' club text parity',{width});}
   }
   if(s.decisions){const key=name+'-'+width,content={text:s.decisions.text,buttons:s.decisions.buttons.map(b=>[b.text,b.action,b.args,b.disabled])};
    if(label==='before')parity[key]=content;else check(JSON.stringify(parity[key])===JSON.stringify(content),name+' decision content/actions parity',{width});
    if(label==='after')for(const b of s.decisions.buttons)check(b.height>=43.5,name+' decision 44px button',{width,b});
   }
   await page.screenshot({path:path.join(out,`${label}-${name}-${width}x${height}.png`),fullPage:true});
  }await page.setViewportSize({width:1440,height:900});
 };
 const stop=async()=>{if(await page.evaluate(()=>GCC8.ui.reveal?.running))await call('revealRun');};
 const draw=async(name,partial=false)=>{
  await stop();check(await page.evaluate(()=>GCC8.ui.reveal?.count===0),name+' initial sealed',await page.evaluate(()=>GCC8.ui.reveal));await capture(name+'-sealed');
  if(partial){await call('revealSpeed');await call('revealSpeed');await call('revealRun');await page.waitForFunction(()=>GCC8.ui.reveal.count>=2);await stop();
   check(await page.evaluate(()=>GCC8.ui.reveal.count>0&&GCC8.ui.reveal.count<8),name+' actual partial callback',{});await capture(name+'-partial');}
  await call('revealAll');await capture(name+'-complete');
 };
 try{browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  for(const [tag,file] of [['before',baseline],['after',candidate]]){label=tag;let ctx;
   await section('fresh legal reveal journey',async()=>{ctx=await load(file);try{await call('play');await call('world');await draw('club-reveal',true);await call('clubs');await call('club',0);await call('confirmClub');await call('signingSkip');await call('draftDraw');await draw('foundation-order');}finally{await ctx.close();}});
   const career=process.env.GCC8_BROWSER_CAREER_DIR;if(!career){omissions.push({label,scope:'annual/decisions',reason:'GCC8_BROWSER_CAREER_DIR missing'});continue;}
   await section('actual checkpoint decisions and annual draw',async()=>{ctx=await load(file,fs.readFileSync(path.join(career,'checkpoint-2009.json'),'utf8'));try{
    await call('continue');await call('offseason');await capture('offseason-decisions');
    const panel=page.locator('.gccuiMatchDecisions,.g8dressingroom').first();
    if(await panel.count()){
     const more=panel.locator('details').first();if(await more.count()){await more.locator('summary').click();await capture('offseason-decisions-expanded');}else omissions.push({label,scope:'expanded decisions',reason:'No disclosure on real checkpoint surface'});
     const review=panel.locator('button[data-action="inspect"]').first();if(await review.count()){await review.click();check(await page.locator('#g8dialog[open]').count()>0,'Review opens player',{});await call('playerTab','management');await capture('decision-review-management');await call('close');}else omissions.push({label,scope:'decision Review',reason:'No inspect Review on real checkpoint surface'});
    }else omissions.push({label,scope:'offseason decisions',reason:'No decision panel on real checkpoint surface'});
    await call('cpuMarket');await call('annualDraw');await draw('annual-order');
   }finally{await ctx.close();}});
   omissions.push({label,scope:'matchday/XI decisions',reason:'Optional annual-draft progression excluded from bounded reveal/decision comparator; only actual checkpoint panel covered'});
  }
 }catch(e){failures.push({label,scope:'runner',error:String(e.stack||e)});}finally{
  if(browser)await browser.close();const report={status:failures.length||errors.length?'FAIL':'PASS',baseline_sha256:hash(baseline),candidate_sha256:hash(candidate),scope:'Real disposable native journeys; deterministic fresh random seed; no user save',states,failures,errors,omissions};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,states:states.length},null,2));if(report.status!=='PASS')process.exitCode=1;
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
