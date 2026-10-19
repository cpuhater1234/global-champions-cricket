const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:390,height:844}}),failures=[];let checks=0;
 const check=(v,m)=>{checks++;if(!v)failures.push(m);};
 await page.route('https://**/*',r=>r.abort());await page.goto('file://'+path.resolve(process.env.GCC8_TEST_BUILD||'game/gcc_v8_stabilised.html'),{waitUntil:'domcontentloaded'});
 for(const width of [390,768,1024,1440]){
  await page.setViewportSize({width,height:844});
  check(await page.evaluate(()=>{const b=document.querySelector('.g8brand'),box=b.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(b);return [...r.getClientRects()].every(x=>x.left>=box.left&&x.right<=box.right);}),`GCC mark fits at ${width}px`);
 }
 await page.setViewportSize({width:390,height:844});
 const save=fs.readFileSync(process.env.GCC8_BROWSER_SAVE||'qa/stabilisation/fixtures/foundation.json','utf8');
 await page.evaluate(raw=>{localStorage.setItem('gcc_dynasty_v8',raw);GCC8.dispatch('continue');GCC8.G.go('team');GCC8.ui.view='team';GCC8.render(true)},save);
 const initial=await page.evaluate(()=>JSON.stringify({xi:GCC8.G.state.xi,order:GCC8.G.state.battingOrder}));
 const incoming=await page.locator('[data-action="swapIn"]').first().getAttribute('data-args');
 await page.locator('[data-action="swapIn"]').first().click();
 check(await page.evaluate(()=>document.activeElement?.dataset.action==='swapOut'),'Swap in moves focus to the replacement choices');
 check(await page.evaluate(()=>{const prompt=document.querySelector('.g8swapprompt'),list=document.querySelector('.g8order');return !!prompt&&!!(prompt.compareDocumentPosition(list)&Node.DOCUMENT_POSITION_FOLLOWING);}), 'Swap instructions precede the XI');
 check(await page.locator('[data-action="lodge"]').isDisabled(),'Lodge is disabled while a swap is pending');
 check(await page.evaluate(()=>!GCC8.dispatch('lodge')),'Pending swap cannot be silently discarded by lodging');
 // A missing command guard used to leave the team room. Restore the fixture for the next independent check.
 if(await page.evaluate(()=>GCC8.ui.view!=='team'))await page.evaluate(()=>{GCC8.G.go('team');GCC8.ui.view='team';GCC8.render(true)});
 if(!await page.locator('[data-action="cancelSwap"]').count())await page.locator(`[data-action="swapIn"][data-args='${incoming}']`).click();
 await page.locator('[data-action="cancelSwap"]').click();
 check(await page.evaluate(()=>document.activeElement?.dataset.action==='swapIn'),'Cancel returns focus to incoming bench player');
 check(await page.evaluate(()=>JSON.stringify({xi:GCC8.G.state.xi,order:GCC8.G.state.battingOrder}))===initial,'Cancel preserves XI and batting order');
 await page.locator(`[data-action="swapIn"][data-args='${incoming}']`).click();
 const outgoing=await page.locator('[data-action="swapOut"]').first().getAttribute('data-args');await page.locator('[data-action="swapOut"]').first().click();
 check(await page.evaluate(([incoming,outgoing])=>GCC8.G.state.xi.includes(JSON.parse(incoming)[0])&&!GCC8.G.state.xi.includes(JSON.parse(outgoing)[0]),[incoming,outgoing]),'Confirmed swap replaces the chosen player');
 check(await page.evaluate(incoming=>document.activeElement?.id==='g8xi-'+JSON.parse(incoming)[0],incoming),'Completed swap focuses the new player in the order');
 check(await page.locator('[data-action="lodge"]').isEnabled(),'Lodge is available after swap completes');
 await browser.close();console.log(JSON.stringify({checks,failures},null,2));if(failures.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
