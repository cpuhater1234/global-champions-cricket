/* QA only: actual generated career, disposable native contexts, no user browser. */
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
 const baseline=process.env.GCC8_BASELINE_BUILD,candidate=process.env.GCC8_TEST_BUILD,career=process.env.GCC8_BROWSER_CAREER_DIR;
 if(!baseline||!candidate||!career)throw Error('Both builds and generated career directory are required');
 const out=process.env.GCC8_XI_DIR||'qa/results/xi-density-native';fs.mkdirSync(out,{recursive:true});
 const raw=fs.readFileSync(path.join(career,'checkpoint-2009.json'),'utf8'),hash=x=>createHash('sha256').update(x).digest('hex');
 const sizes=[[1440,900],[1280,720],[1150,720],[1024,768],[768,900],[390,844],[320,720]];
 const report={baseline_sha256:hash(fs.readFileSync(baseline)),candidate_sha256:hash(fs.readFileSync(candidate)),checkpoint_sha256:hash(raw),states:[],failures:[],errors:[],omissions:[],actions:[],scope:'Actual completed-2009 generated checkpoint legally progresses to the next XI. Test-only deterministic randomness, disposable storage, no user save or connected browser.'};
 let browser,page,label;const before={};
 const check=(ok,scope,detail)=>{if(!ok)report.failures.push({label,scope,detail});};
 const call=async(action,...args)=>{const r=await page.evaluate(([action,args])=>({ok:GCC8.dispatch(action,args),feedback:document.querySelector('#g8feedback')?.textContent}),[action,args]);report.actions.push({label,action,args,ok:r.ok});if(!r.ok)throw Error(action+': '+r.feedback);};
 const median=xs=>{const s=xs.slice().sort((a,b)=>a-b);return s.length?s[Math.floor(s.length/2)]:null;};
 const snapshot=async()=>page.evaluate(()=>{
  const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
  const visible=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&e.checkVisibility();};
  const rows=[...document.querySelectorAll('.gccuiSelection .gccuiOrderRow,.gccuiSelection .gccuiBenchRow')].filter(visible).map(e=>{
   const name=e.querySelector('.gccuiRosterName'),status=[...e.querySelectorAll('.g8squadpulse>span')].map(s=>{const c=getComputedStyle(s);return {text:s.textContent.trim(),className:s.className,alert:s.matches('.g8pulsealert,.g8pulsepromise'),padding:c.padding,border:c.borderWidth,background:c.backgroundColor,color:c.color,...rect(s)};});
   return {kind:e.matches('.gccuiOrderRow')?'xi':'bench',id:JSON.parse(name.dataset.args)[0],text:e.textContent.trim().replace(/\s+/g,' '),name:name.querySelector('b').textContent,...rect(e),status,children:[...e.children].filter(visible).map(c=>({className:c.className,...rect(c)})),controls:[...e.querySelectorAll('.gccuiRosterActions button,.gccuiArrows button,.g8button')].filter(visible).map(b=>({action:b.dataset.action,args:b.dataset.args,disabled:b.disabled,...rect(b)}))};
  });
  return {view:GCC8.ui.view,year:GCC8.G.state.year,viewport:{width:innerWidth,height:innerHeight},horizontalOverflow:document.documentElement.scrollWidth>innerWidth+2,rows,xiIds:rows.filter(r=>r.kind==='xi').map(r=>r.id)};
 });
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
 try{
  browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
  for(const pair of [['before',baseline],['after',candidate]]){
   label=pair[0];const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
   try{
    page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>report.errors.push({label,message:e.message}));await page.route(/^https?:/,r=>r.abort());
    await page.addInitScript(raw=>{let seed=101;Math.random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};localStorage.setItem('gcc_dynasty_v8',raw);},raw);
    await page.goto(pathToFileURL(path.resolve(pair[1])).href,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.GCC8?.dispatch);await prepare();
    for(const [width,height] of sizes){
     await page.setViewportSize({width,height});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
     const s={label,...await snapshot()};report.states.push(s);console.log('CAPTURE',label,width,height);
     check(s.xiIds.length===11,'eleven visible XI rows '+width,s.xiIds);check(!s.horizontalOverflow,'document containment '+width,s.viewport);
     const xi=s.rows.filter(r=>r.kind==='xi');check(xi[0]?.controls.find(c=>c.action==='move'&&JSON.parse(c.args)[1]===-1)?.disabled,'first up arrow disabled '+width,xi[0]);check(xi.at(-1)?.controls.find(c=>c.action==='move'&&JSON.parse(c.args)[1]===1)?.disabled,'last down arrow disabled '+width,xi.at(-1));
     if(label==='before')before[width]=s;
     else{
      check(JSON.stringify(s.rows.map(r=>[r.kind,r.id,r.text]))===JSON.stringify(before[width].rows.map(r=>[r.kind,r.id,r.text])),'all roster text/IDs preserved '+width,{});
      for(const row of s.rows){
       for(const c of row.children)check(c.x>=row.x-2&&c.right<=row.right+2&&c.y>=row.y-2&&c.bottom<=row.bottom+2,'row child containment '+width,{row:row.name,child:c,rowRect:row});
       for(const c of row.controls)check(c.width>=43.5&&c.height>=43.5,'44px ordering/swap control '+width,{row:row.name,control:c});
       for(const status of row.status){
        const old=before[width].rows.find(r=>r.kind===row.kind&&r.id===row.id)?.status.find(x=>x.text===status.text&&x.className===status.className);
        if(status.alert)check(old&&status.padding===old.padding&&status.border===old.border&&status.background===old.background&&status.color===old.color,'alert/promise treatment preserved '+width,{name:row.name,before:old,after:status});
        else check(parseFloat(status.padding)===0&&parseFloat(status.border)===0&&status.background==='rgba(0, 0, 0, 0)','neutral status unboxed '+width,{name:row.name,status});
       }
      }
      if(width>=1150){const ordinary=r=>r.kind==='xi'&&!r.status.some(x=>x.alert),a=median(before[width].rows.filter(ordinary).map(r=>r.height)),b=median(s.rows.filter(ordinary).map(r=>r.height));if(a==null||b==null)report.omissions.push({label,scope:'ordinary XI density '+width,reason:'No ordinary XI rows in this actual roster'});else check(a-b>=6,'ordinary median height reduced at least6px '+width,{before:a,after:b,reduction:a-b});}
     }
     await page.screenshot({path:path.join(out,`${label}-xi-${width}x${height}.png`),fullPage:true});
    }
    if(label==='after'){
     await page.setViewportSize({width:1440,height:900});const ids=await page.evaluate(()=>GCC8.G.state.battingOrder.slice());await call('move',ids[0],1);
     check(await page.evaluate(id=>GCC8.G.state.battingOrder[1]===id,ids[0]),'manual move updates order',{});
     const swap=await page.evaluate(()=>{const rs=GCC8.roster(),s=GCC8.G.state,healthy=p=>s.dynasty.injuries?.[p.id]?.status!=='OUT',bench=rs.find(p=>healthy(p)&&!s.xi.includes(p.id)&&p.keeping<65),out=rs.find(p=>s.xi.includes(p.id)&&p.keeping<65);return bench&&out?{incoming:bench.id,outgoing:out.id}:null;});
     if(swap){await call('swapIn',swap.incoming);await call('swapOut',swap.outgoing);const truth=await page.evaluate(()=>({ids:GCC8.G.state.xi.slice(),keeper:GCC8.roster().some(p=>GCC8.G.state.xi.includes(p.id)&&p.keeping>=65)}));check(truth.ids.length===11&&new Set(truth.ids).size===11&&truth.ids.includes(swap.incoming)&&!truth.ids.includes(swap.outgoing)&&truth.keeper,'manual swap preserves eleven and keeper',{swap,truth});}
     else report.omissions.push({label,scope:'manual nonkeeper swap',reason:'Actual roster has no eligible nonkeeper swap pair'});
     await page.screenshot({path:path.join(out,'after-xi-manual-actions-1440x900.png'),fullPage:true});
    }
   }catch(e){report.failures.push({label,scope:'generated native XI journey',error:String(e.stack||e)});}finally{await context.close();}
  }
 }catch(e){report.failures.push({label,scope:'browser-run',error:String(e.stack||e)});}
 finally{if(browser)await browser.close();report.status=report.failures.length||report.errors.length?'FAIL':'PASS';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,states:report.states.length},null,2));if(report.status!=='PASS')process.exitCode=1;}
})().catch(e=>{console.error(e);process.exitCode=1;});
