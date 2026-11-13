/* Read-only finals renderer review. Historical stages use real completed results, not live transitions. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),{createHash}=require('crypto');
(async()=>{
const out=process.env.GCC8_FINALS_DIR;fs.mkdirSync(out,{recursive:true});const file=process.env.GCC8_TEST_BUILD;
const report={sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex'),scope:'Historical finals stage reconstruction from real completed checkpoints. Presentation only; no live finals transition, persistence or whole-career acceptance.',states:[],checks:[],findings:[],errors:[],observations:[]};
if(report.sha256!==process.env.CANDIDATE_SHA256)throw Error('Unexpected candidate');
const check=(ok,id,detail)=>{report.checks.push({ok,id,detail});if(!ok)report.findings.push({id,detail});};
const browser=await chromium.launch({executablePath:process.env.GCC8_CHROMIUM,headless:true,args:['--no-sandbox','--disable-gpu']});
for(const year of [2009,2019,2025]){
 const raw=fs.readFileSync(path.join(process.env.GCC8_BROWSER_CAREER_DIR,`checkpoint-${year}.json`),'utf8');const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 try{
 await ctx.addInitScript(raw=>{Date.now=()=>1794484800000;localStorage.setItem('gcc_dynasty_v8',raw);},raw);
 const page=await ctx.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.route(/^https?:/,r=>r.abort());await page.goto(pathToFileURL(path.resolve(file)).href);await page.waitForFunction(()=>!!window.GCC8?.dispatch);if(!await page.evaluate(()=>GCC8.dispatch('continue',[])))throw Error('Restore failed');
 const identity=()=>page.evaluate(()=>JSON.stringify({year:GCC8.G.state.year,xi:GCC8.G.state.xi,roster:GCC8.roster().map(p=>p.id),table:GCC8.G.state.table,results:GCC8.G.state.results,gf:GCC8.G.state.finals.gf,semis:GCC8.G.state.finals.semis}));const before=await identity();
 for(const stage of ['ready','semis','gf-ready','done']){
 await page.evaluate(stage=>{GCC8.G.state.finals.stage=stage;GCC8.ui.view='finals';GCC8.render(true);},stage);
 for(const width of [320,390,768,1440]){
 await page.setViewportSize({width,height:900});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>scrollTo(0,0));
 const d=await page.evaluate(()=>{const root=document.querySelector('#g8stage'),rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};},vis=e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height;return{docWidth:document.documentElement.scrollWidth,docHeight:document.documentElement.scrollHeight,text:root.textContent.replace(/\s+/g,' ').trim(),title:root.querySelector('h1')?.textContent,controls:[...root.querySelectorAll('button,summary')].filter(vis).map(e=>({text:e.getAttribute('aria-label')||e.textContent.trim(),action:e.dataset.action,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,...rect(e)})),cards:[...root.querySelectorAll('.gccuiScorecard')].map(e=>({box:rect(e),layout:{display:getComputedStyle(e).display,rows:getComputedStyle(e).gridTemplateRows,container:getComputedStyle(e).containerType},children:[...e.children].map(c=>({tag:c.tagName,class:c.className,text:c.textContent.trim().slice(0,180),...rect(c)})),teams:e.querySelector('.gccuiScoreTeams')?rect(e.querySelector('.gccuiScoreTeams')):null})),venue:[...root.querySelectorAll('.g8matcharena .g8venueframe')].map(e=>({box:rect(e),parent:rect(e.parentElement)})),empty:[...root.querySelectorAll('.g8phasecontest')].map(e=>({text:e.textContent.trim(),...rect(e)}))};});
 const name=`${year}-${stage}-${width}`;check(d.docWidth<=width+1,name+' document containment',d.docWidth);for(const c of d.controls){check(c.x>=-1&&c.right<=width+1&&c.scrollWidth<=c.clientWidth+2,name+' control fits '+c.text,c);check(c.height>=44,name+'44px control '+c.text,c);}
 if(stage==='semis'&&width===1440&&d.cards.length===2){const[a,b]=d.cards;const gap=Math.abs(a.teams.y-b.teams.y);report.observations.push({name,type:'paired semifinal score-row offset',pixels:gap});check(gap<=1,name+' semifinal score rows align',gap);}
 for(const v of d.venue)check(v.box.width>=v.parent.width-2,name+' venue fills figure',v);
 report.states.push({name,year,stage,width,...d});await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});
 }
 }
 check(await identity()===before,year+' historical presentation preserves cricket ledger',{});
 }catch(e){report.errors.push({year,error:e.stack||String(e)});}finally{await ctx.close();}
}
await browser.close();report.status=report.findings.length||report.errors.length?'FAIL':'PASS';fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,states:report.states.length,checks:report.checks.length,findings:report.findings,errors:report.errors,observations:report.observations}));if(report.status!=='PASS')process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
