const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM||undefined,headless:true,args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage']}),page=await browser.newPage(),issues=[];
 await page.route('https://**/*',r=>r.abort());await page.goto('file://'+path.resolve(process.env.GCC8_TEST_BUILD||'game/gcc_v8_finishing.html'),{waitUntil:'domcontentloaded'});
 const raw=fs.readFileSync(process.env.GCC8_WORDS_SAVE||'qa/stabilisation/fixtures/checkpoint-2019.json','utf8');
 await page.evaluate(raw=>{localStorage.setItem('gcc_dynasty_v8',raw);GCC8.dispatch('continue');GCC8.G.state.finals.stage='gf-ready';GCC8.ui.view='finals';GCC8.render(true)},raw);
 for(const stage of ['ready','gf-ready']){await page.evaluate(stage=>{GCC8.G.state.finals.stage=stage;GCC8.render(true)},stage);
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:1000});const bad=await page.evaluate(()=>{const rows=[];for(const el of document.querySelectorAll('.g8hudclub strong,.g8fixture h2'))for(const node of el.childNodes){if(node.nodeType!==3)continue;for(const word of node.textContent.matchAll(/[A-Za-z]{4,}/g)){const r=document.createRange();r.setStart(node,word.index);r.setEnd(node,word.index+word[0].length);if([...r.getClientRects()].filter(r=>r.width>0).length>1)rows.push(word[0]);}}return rows;});if(bad.length)issues.push({stage,width,words:bad});
 }
 }
 await browser.close();console.log(JSON.stringify({issues},null,2));if(issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
