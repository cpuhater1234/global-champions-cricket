const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
const build=path.resolve(process.env.GCC8_TEST_BUILD||'game/gcc_v8_stabilised.html');
const out=process.env.GCC8_BROWSER_REPORT_DIR||'qa/finishing/browser';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[],report=[];
 page.on('pageerror',e=>errors.push(e.message));
 // Controlled offline image failure; no external dependency for geometry checks.
 await page.route('https://**/*',r=>r.abort());
 await page.goto('file://'+build,{waitUntil:'domcontentloaded'});
 async function call(a,...args){const result=await page.evaluate(([a,args])=>({ok:window.GCC8.dispatch(a,args),feedback:document.getElementById('g8feedback').textContent}),[a,args]);if(!result.ok)throw Error(a+': '+result.feedback);}
 async function capture(name){
  for(const width of [1440,1024,768,390]){
   await page.setViewportSize({width,height:1000});
   const metrics=await page.evaluate(()=>{
    const visible=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width&&r.height&&c.visibility!=='hidden'&&c.display!=='none'&&!e.closest('[hidden], [inert]');};
    const root=document.querySelector('dialog[open]')||document.getElementById('g8app');
    const clipped=[];for(const e of root.querySelectorAll('button,h1,h2,h3,summary,label')){
     if(!visible(e))continue;const box=e.getBoundingClientRect();
     for(const n of e.childNodes){if(n.nodeType!==3||!n.textContent.trim())continue;const range=document.createRange();range.selectNodeContents(n);for(const r of range.getClientRects())if(r.width&& (r.left<box.left-2||r.right>box.right+2))clipped.push({tag:e.tagName,cls:e.className,text:n.textContent.trim().slice(0,90),box:Math.round(box.width),textWidth:Math.round(r.width)});}
    }
    const fragmented=[];const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while(node=walker.nextNode()){const el=node.parentElement;if(!el||!visible(el)||el.closest('script,style,[hidden],[inert]'))continue;for(const word of node.textContent.matchAll(/[A-Za-z]{4,}/g)){const range=document.createRange();range.setStart(node,word.index);range.setEnd(node,word.index+word[0].length);if([...range.getClientRects()].filter(r=>r.width>0).length>1)fragmented.push({word:word[0],cls:el.className});}}
    const collisions=[];for(const e of root.querySelectorAll('.g8slot,.g8squadrow,.g8hudclub,.g8heading,.g8managerow,.g8matchuprow>summary,.g8fixture,.g8score')){if(!visible(e))continue;const kids=[...e.children].filter(visible);for(let i=0;i<kids.length;i++)for(let j=i+1;j<kids.length;j++){const a=kids[i].getBoundingClientRect(),b=kids[j].getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)collisions.push({cls:e.className,a:kids[i].textContent.trim().slice(0,60),b:kids[j].textContent.trim().slice(0,60)});}}
    return {view:window.GCC8.ui.view,modal:window.GCC8.ui.modal,overflow:document.documentElement.scrollWidth>innerWidth+2,scrollWidth:document.documentElement.scrollWidth,clipped,collisions,fragmented};
   });report.push({name,width,...metrics});
   if(!process.env.GCC8_BROWSER_NO_SCREENSHOTS)await page.screenshot({path:path.join(out,name+'-'+width+'.png'),fullPage:true});
  }
  await page.setViewportSize({width:1440,height:1000});
 }
 await capture('home');await call('play');await capture('story');await call('world');await call('revealAll');await capture('league');await call('clubs');await call('club',0);await capture('club');await call('confirmClub');await capture('signing');await call('signingSkip');await call('draftDraw');await call('revealAll');await capture('draw');await call('beginDraft');await capture('draft');
 for(let i=0;i<40;i++){
  const done=await page.evaluate(()=>GCC8.ui.view==='team');if(done)break;
  await call('skipPick');if(await page.evaluate(()=>GCC8.ui.view==='team'))break;
  const id=await page.evaluate(()=>{const X=GCC8,rs=X.roster(),pool=X.pool();return (pool.find(p=>X.R.isKeeper(p)&&!rs.some(X.R.isKeeper))||pool.find(p=>p.maxOvers>=4&&rs.filter(q=>q.maxOvers>=4).length<6)||pool[0])?.id;});
  if(id)await call('draftPlayer',id);
 }
 await call('close');await capture('team-empty');
 const xi=await page.evaluate(()=>GCC8.G.bestXI(GCC8.roster()).map(p=>p.id));for(const id of xi)await call('select',id);
 await capture('team-full');await call('rating','fielding');await capture('analysis');await call('close');
 const bench=await page.evaluate(()=>GCC8.roster().find(p=>!GCC8.G.state.xi.includes(p.id)).id);await call('swapIn',bench);await capture('swap');await call('cancelSwap');await call('lodge');await capture('matchday');await call('prepare');await capture('prepare');await call('playMatch',1);await call('matchSkip');await capture('result');await call('resultScorecard');await capture('scorebook');await call('close');
 // A real completed season produced by the existing career suite.
 const save=fs.readFileSync(process.env.GCC8_BROWSER_SAVE||'qa/stabilisation/fixtures/foundation.json','utf8');
 await page.evaluate(raw=>{GCC8.dispatch('home');localStorage.setItem('gcc_dynasty_v8',raw)},save);await call('continue');await capture('review');await call('offseason');await capture('offseason');
 const id=await page.evaluate(()=>GCC8.read.contractCandidates()[0]);await call('release',id);await capture('release');await call('close');await call('trade',false,id);await capture('trade-empty');
 await page.locator('[data-input="tradeTarget"]').selectOption(await page.locator('[data-input="tradeTarget"] option').nth(1).getAttribute('value'));await capture('trade');await call('propose');await capture('trade-review');await call('close');
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({build,errors,report},null,2));
 console.log(JSON.stringify({states:report.length,errors,issues:report.filter(r=>r.overflow||r.clipped.length||r.collisions.length||r.fragmented.length)},null,2));
 await browser.close();if(errors.length||report.some(r=>r.overflow||r.clipped.length||r.collisions.length||r.fragmented.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
