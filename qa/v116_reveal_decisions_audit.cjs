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
  await page.addInitScript(()=>{Date.now=()=>1794484800000;let n=101;Math.random=()=>{n=(Math.imul(1664525,n)+1013904223)>>>0;return n/4294967296;};});
  if(raw)await page.addInitScript(x=>localStorage.setItem('gcc_dynasty_v8',x),raw);
  await page.goto(pathToFileURL(path.resolve(file)).href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.GCC8?.dispatch);return ctx;
 };
 const snapshot=()=>page.evaluate(()=>{
  const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';};
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
  const dialog=document.querySelector('#g8dialog[open]'),grid=document.querySelector('.g8revealgrid'),draw=document.querySelector('.g8drawcontrols'),panel=[...document.querySelectorAll('.gccuiMatchDecisions,.g8dressingroom')].find(vis);
  const cards=grid?[...grid.children].map(e=>({...rect(e),sealed:e.classList.contains('g8sealed'),name:e.querySelector('h3')?.textContent,ground:e.querySelector('.g8clubground')?.textContent,content:[...e.querySelectorAll('.g8clubcover,.g8clubbody,h3,.g8clubground,.g8clubcardaction')].map(c=>({className:c.className,...rect(c)}))})):[];
  const controls=draw?[...draw.querySelectorAll('button')].filter(vis).map(e=>({text:e.textContent.trim(),disabled:e.disabled,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,...rect(e)})):[];
  const pace=draw?.querySelector('.g8drawpace'),next=draw?.querySelector('.g8drawnext'),n=next?.querySelector('button');
  return {view:GCC8.ui.view,reveal:GCC8.ui.reveal?{...GCC8.ui.reveal}:null,width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+2,cards,controls,draw:draw?rect(draw):null,
   tabReachable:draw?[...draw.querySelectorAll('button')].filter(e=>vis(e)&&!e.disabled&&!e.closest('[inert]')&&e.tabIndex>=0).map(e=>({text:e.textContent.trim(),group:e.closest('.g8drawpace')?'pace':'next'})):[],
   gates:draw?{paceInert:pace.inert,paceHidden:pace.getAttribute('aria-hidden'),nextInert:next.inert,nextHidden:next.getAttribute('aria-hidden'),nextDisabled:n.disabled,paceDisabled:[...pace.querySelectorAll('button')].map(e=>e.disabled)}:null,
   dialog:dialog?{text:dialog.textContent.replace(/\s+/g,' ').trim(),buttons:[...dialog.querySelectorAll('button')].map(e=>[e.textContent.trim(),e.dataset.action,e.dataset.args,e.disabled])}:null,
   decisions:panel?{rows:[...panel.querySelectorAll('.g8decisionline')].filter(vis).map(e=>({...rect(e),children:[...e.children].filter(vis).map(c=>({...rect(c),text:c.textContent.trim()}))})),text:panel.textContent.replace(/\s+/g,' ').trim(),...rect(panel),buttons:[...panel.querySelectorAll('button')].filter(vis).map(e=>({text:e.textContent.trim(),action:e.dataset.action,args:e.dataset.args,disabled:e.disabled,...rect(e)}))}:null};
 });
 const capture=async(name)=>{
  for(const [width,height] of sizes){await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
   const s={label,name,...await snapshot()};states.push(s);console.log('CAPTURE',label,name,width);check(!s.overflow,name+' document containment',width);
   if(s.cards.length){check(s.cards.length===8,name+' eight cards',s.cards.length);const complete=s.reveal?.count===8;
    check(s.gates.paceInert===complete&&s.gates.nextInert===!complete&&s.gates.nextDisabled===!complete,name+' inert gates',s.gates);
    check(s.gates.paceHidden===(complete?'true':null)&&s.gates.nextHidden===(complete?null:'true'),name+' aria gates',s.gates);
    check(s.gates.paceDisabled.every(x=>x===complete),name+' disabled pace gates',s.gates);
    check(s.tabReachable.length===(complete?1:3)&&s.tabReachable.every(c=>c.group===(complete?'next':'pace')),name+' tab reachable active gate',{width,controls:s.tabReachable});
    for(const c of s.controls){check(c.height>=43.5,name+' 44px control',{width,c});check(c.x>=s.draw.x-1&&c.x+c.width<=s.draw.x+s.draw.width+1,name+' control containment',{width,c});}
    if(label==='after')for(const c of s.controls)check(c.scrollWidth<=c.clientWidth+2&&c.scrollHeight<=c.clientHeight+2,name+' control text fits',{width,c});
    for(const c of s.cards.filter(c=>!c.sealed))for(const child of c.content)check(child.x>=c.x-2&&child.x+child.width<=c.x+c.width+2&&child.y>=c.y-2&&child.y+child.height<=c.y+c.height+2,name+' card content bounds',{width,card:c.name,child});
    const heights=s.controls.map(c=>c.height);if(label==='after')check(Math.max(...heights)-Math.min(...heights)<=2,name+' equal control heights',{width,heights});
    const key=name.replace(/-(sealed|partial|complete)$/,'')+'-'+width,prior=states.find(x=>x.label===label&&x.name===name.replace(/-(sealed|partial|complete)$/,'-sealed')&&x.width===width);
    if(prior&&!name.endsWith('-sealed'))check(s.cards.every((c,i)=>Math.abs(c.height-prior.cards[i].height)<=2&&Math.abs(c.y-prior.cards[i].y)<=2),name+' reserved card geometry',{width,before:prior.cards,after:s.cards});
    if(complete){const text=s.cards.map(c=>[c.name,c.ground]);if(label==='before')parity[key]=text;else check(JSON.stringify(parity[key])===JSON.stringify(text),name+' club text parity',{width});}
   }
   if(s.dialog){const k=name+'-dialog-'+width;if(label==='before')parity[k]=s.dialog;else check(JSON.stringify(parity[k])===JSON.stringify(s.dialog),name+' management dialog content/actions parity',{width});}
   if(s.decisions){const key=name+'-'+width,content={text:s.decisions.text,buttons:s.decisions.buttons.map(b=>[b.text,b.action,b.args,b.disabled])};
    if(label==='before')parity[key]=content;else check(JSON.stringify(parity[key])===JSON.stringify(content),name+' decision content/actions parity',{width});
    if(label==='after'){for(const b of s.decisions.buttons)check(b.height>=43.5,name+' decision 44px button',{width,b});for(const row of s.decisions.rows)for(const child of row.children)check(child.x>=row.x-2&&child.x+child.width<=row.x+row.width+2&&child.y>=row.y-2&&child.y+child.height<=row.y+row.height+2,name+' decision row content bounds',{width,row,child});}
   }
   if(s.cards.length){const eligible=await page.locator('.g8drawcontrols button').evaluateAll(es=>es.findIndex(e=>!e.disabled&&!e.closest('[inert]')&&getComputedStyle(e).visibility!=='hidden'));if(eligible>=0){await page.locator('.g8drawcontrols button').nth(eligible).focus();await page.keyboard.press('Tab');const focus=await page.evaluate(()=>{const e=document.activeElement;return {inDraw:!!e.closest('.g8drawcontrols'),inert:!!e.closest('[inert]'),group:e.closest('.g8drawpace')?'pace':e.closest('.g8drawnext')?'next':null};});check(!focus.inert&&(!focus.inDraw||focus.group===(s.reveal.count===8?'next':'pace')),name+' real Tab respects gate',{width,focus});}}
   await page.screenshot({path:path.join(out,`${label}-${name}-${width}x${height}.png`),fullPage:true});
  }await page.setViewportSize({width:1440,height:900});
 };
 const decisions=async(name)=>{
  await capture(name);
  const panel=page.locator('.gccuiMatchDecisions:visible,.g8dressingroom:visible').first();
  if(!await panel.count()){omissions.push({label,scope:name,reason:'No decision panel on actual legal surface'});return;}
  const more=panel.locator('details:visible').first();
  if(await more.count()){if(!await more.evaluate(e=>e.open))await more.locator('summary').click();await capture(name+'-expanded');}
  else omissions.push({label,scope:name+' disclosure',reason:'No disclosure on actual legal surface'});
  const review=panel.locator('button[data-action="manageInspect"]:visible,button[data-action="inspect"]:visible').first();
  if(await review.count()){await review.click();check(await page.locator('#g8dialog[open]').count()>0,name+' Review opens player',{});await call('playerTab','management');await capture(name+'-review-management');await page.locator('#g8dialog[open] .g8dialogclose').click();check(!await page.locator('#g8dialog').evaluate(e=>e.open),name+' close restores surface',{});}
  else omissions.push({label,scope:name+' Review',reason:'No actual visible Review control; no fabricated action'});
 };
 const finishAnnual=async()=>{
  await call('annualDraft');
  for(let guard=0;guard<30&&await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft');guard++){
   await call('skipPick');if(!await page.evaluate(()=>GCC8.G.state.dynasty.offseason?.phase==='draft'))break;
   const id=await page.evaluate(()=>{const rs=GCC8.roster(),pool=GCC8.pool(true);return (pool.find(p=>p.keeping>=65&&!rs.some(q=>q.keeping>=65))||pool.find(p=>p.maxOvers>=4&&rs.filter(q=>q.maxOvers>=4).length<6)||pool[0])?.id;});if(id==null)throw Error('Annual pool empty');await call('draftPlayer',id);
  }
  await call('lodgeList');await call('annualTeam');await decisions('annual-XI-decisions');
  const ids=await page.evaluate(()=>{const rs=GCC8.roster().filter(p=>GCC8.G.state.dynasty.injuries?.[p.id]?.status!=='OUT'),best=GCC8.G.bestXI(rs),keeper=rs.find(p=>p.keeping>=65);if(keeper&&!best.some(p=>p.keeping>=65))best[best.map((p,i)=>({p,i})).sort((a,b)=>a.p.overall-b.p.overall)[0].i]=keeper;return best.map(p=>p.id);});
  if(ids.length!==11)throw Error('Generated XI unavailable');await call('clearXI');for(const id of ids)await call('select',id);await call('teamPane','xi');await decisions('selected-XI-decisions');await call('lodge');await decisions('matchday-decisions');
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
    await call('continue');
    if(await page.evaluate(()=>!!GCC8.G.state.finals?.gf)){await page.evaluate(()=>{GCC8.G.state.finals.stage='ready';GCC8.ui.view='finals';GCC8.render(true);});await decisions('historical-finals-ready-decisions');await page.evaluate(()=>{GCC8.G.state.finals.stage='done';GCC8.ui.view='review';GCC8.render(true);});}else omissions.push({label,scope:'historical finals',reason:'Actual checkpoint has no completed grand final'});
    await call('offseason');await decisions('offseason-decisions');
    await call('cpuMarket');await call('annualDraw');await draw('annual-order');await finishAnnual();
   }finally{await ctx.close();}});
  }
 }catch(e){failures.push({label,scope:'runner',error:String(e.stack||e)});}finally{
  if(browser)await browser.close();const report={status:failures.length||errors.length?'FAIL':'PASS',baseline_sha256:hash(baseline),candidate_sha256:hash(candidate),scope:'Real disposable native journeys; deterministic fresh random seed; historical finals ready stage explicitly reconstructed from actual completed finalists/results; no user save',states,failures,errors,omissions};
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,states:states.length},null,2));if(report.status!=='PASS')process.exitCode=1;
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
