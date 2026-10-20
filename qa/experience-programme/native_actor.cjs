// Source-blind actor transport: no product evaluator, IDs, API or save contents.
// Save files are opaque assessor-owned material; never give them to the actor.
const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto');
const {chromium}=require('playwright');
const readline=require('readline');
const [build,root,sessionId,resumeFile]=process.argv.slice(2);
if(!build||!root||!sessionId)throw Error('Usage: native_actor.cjs BUILD NEW_OUTPUT SESSION_ID [OPAQUE_SAVE]');
fs.mkdirSync(root,{recursive:false}); // Existing trial paths must fail, never overwrite evidence.
const bytes=fs.readFileSync(build),sha=crypto.createHash('sha256').update(bytes).digest('hex');
const port=Number(process.env.GCC_ACTOR_PORT||8766),url=`http://127.0.0.1:${port}/game.html`;
const server=http.createServer((req,res)=>{if(req.url!='/game.html'){res.writeHead(404);return res.end();}res.setHeader('Content-Type','text/html; charset=utf-8');res.end(bytes);});
let seq=0,browser,context,page;
const log=event=>fs.appendFileSync(path.join(root,'events.jsonl'),JSON.stringify({session_id:sessionId,event_id:++seq,timestamp:new Date().toISOString(),...event})+'\n');
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
 browser=await chromium.launch({executablePath:process.env.GCC_CHROMIUM||'/workspace/scratch/24b2d895d4e2/test-runtime/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 context=await browser.newContext({viewport:{width:1280,height:900},...(resumeFile?{storageState:resumeFile}:{})});
 page=await context.newPage();
 const metadata={session_id:sessionId,transport_sha256:crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),browser_version:browser.version(),build_sha256:sha,viewport:{width:1280,height:900},origin:url,world_provenance:resumeFile?'opaque previous-session browser storage':'fresh browser context',resume_file_supplied:!!resumeFile,external_images_blocked:false,screen_scope:'viewport screenshot only; no DOM text; explicit scrolling',actor_scope:'screenshots and native accessible controls only'};
 fs.writeFileSync(path.join(root,'metadata.json'),JSON.stringify(metadata,null,2)+'\n');
 page.on('pageerror',e=>log({type:'application_error',message:e.message}));
 await page.goto(url);
 async function snapshot(){
  const file=`screen-${String(seq+1).padStart(4,'0')}.png`;
  await page.screenshot({path:path.join(root,file),fullPage:false});
  log({type:'snapshot',screenshot:file});console.log(JSON.stringify({type:'screen',screenshot_path:path.resolve(root,file)}));
 }
 await snapshot();
 for await(const line of readline.createInterface({input:process.stdin})){
  let c;
  try{
   c=JSON.parse(line);
   if(c.command==='close'){
    log({type:'session_boundary',record:c.record||{}});
    await context.storageState({path:path.join(root,'opaque-save.json')});
    log({type:'opaque_save_captured'});break;
   }
   if(c.command==='note'){log({type:'actor_note',record:c.record});console.log('NOTE_RECORDED');continue;}
   if(c.command==='snapshot'){await snapshot();continue;}
   if(!c.prediction||!c.intended_outcome)throw Error('Prediction and intended_outcome required before action');
   if(c.command==='click'){
    if(!Number.isFinite(c.x)||!Number.isFinite(c.y)||c.x<0||c.y<0||c.x>=1280||c.y>=900)throw Error('Click coordinates must lie inside viewport');
    log({type:'prediction',episode_id:c.episode_id,intended_outcome:c.intended_outcome,prediction:c.prediction,visible_evidence:c.visible_evidence||''});
    await page.mouse.click(c.x,c.y);log({type:'action_completed',episode_id:c.episode_id,action:'pointer_click',x:c.x,y:c.y});await snapshot();continue;
   }
   if(c.command==='scroll'){
    log({type:'prediction',episode_id:c.episode_id,intended_outcome:c.intended_outcome,prediction:c.prediction});
    await page.mouse.wheel(0,Math.max(-800,Math.min(800,Number(c.delta_y)||600)));
    await page.waitForTimeout(150);log({type:'action_completed',episode_id:c.episode_id,action:'scroll'});await snapshot();continue;
   }
   if(!['button','combobox','textbox','heading','link'].includes(c.role))throw Error('Only visible accessible roles allowed');
   if(typeof c.name!=='string')throw Error('Accessible name required');
   log({type:'prediction',episode_id:c.episode_id,intended_outcome:c.intended_outcome,prediction:c.prediction,visible_evidence:c.visible_evidence||'',uncertainty:c.uncertainty||''});
   const control=page.getByRole(c.role,{name:c.name,exact:c.exact!==false}).nth(c.index||0);
   const box=await control.boundingBox({timeout:5000});
   if(box&&(box.y+box.height<0||box.y>900||box.x+box.width<0||box.x>1280))throw Error('Control outside viewport; scroll before acting');
   if(box&&!await control.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return !!hit&&(hit===el||el.contains(hit));}))throw Error('Control centre is clipped or covered; reveal it before acting');
   if(c.action==='fill')await control.fill(c.value,{timeout:5000});
   else if(c.action==='select')await control.selectOption({label:c.value},{timeout:5000});
   else await control.click({timeout:5000});
   log({type:'action_completed',episode_id:c.episode_id,role:c.role,name:c.name,action:c.action||'click'});
   await snapshot();
  }catch(e){log({type:'transport_or_action_failure',episode_id:c?.episode_id,message:e.message});console.log(JSON.stringify({type:'failure',message:e.message}));}
 }
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();server.close();});
