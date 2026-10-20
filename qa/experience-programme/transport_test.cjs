// Test the assessor transport on a synthetic page, never claim this tests GCC.
const {spawn}=require('child_process'),fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict'),readline=require('readline');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'gcc-actor-')),fixture=path.join(root,'fixture.html');
fs.writeFileSync(fixture,'<!doctype html><body><button>Visible top</button><div style="height:1200px"></div><button onclick="this.textContent=\'Bottom clicked\'">Bottom sentinel</button></body>');
const child=spawn(process.execPath,['qa/experience-programme/native_actor.cjs',fixture,path.join(root,'session'),'transport-check'],{env:{...process.env,GCC_ACTOR_PORT:'8777'},stdio:['pipe','pipe','inherit']});
const lines=[],waiting=[];const rl=readline.createInterface({input:child.stdout});rl.on('line',line=>{if(waiting.length)waiting.shift()(line);else lines.push(line);});
const next=()=>lines.length?Promise.resolve(lines.shift()):new Promise(resolve=>waiting.push(resolve));
const send=async c=>{child.stdin.write(JSON.stringify(c)+'\n');return JSON.parse(await next());};
const sha=p=>require('crypto').createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const timer=setTimeout(()=>{child.kill();throw Error('Transport test timeout');},30000);
(async()=>{try{
 let r=JSON.parse(await next());assert(!('text' in r),'no DOM text exposed');const first=fs.readFileSync(r.screenshot_path);assert.equal(first.readUInt32BE(16),1280);assert.equal(first.readUInt32BE(20),900);
 r=await send({command:'click',x:50,y:18,prediction:'activate top visible button',intended_outcome:'test native pointer route',episode_id:'pointer'});assert(r.screenshot_path);
 r=await send({role:'button',name:'Bottom sentinel',prediction:'would click if reached',intended_outcome:'test viewport boundary',episode_id:'e1'});assert.equal(r.type,'failure');assert.match(r.message,/outside viewport/);
 r=await send({command:'scroll',delta_y:800,prediction:'bottom becomes visible',intended_outcome:'find bottom control',episode_id:'e2'});assert(r.screenshot_path);const beforeClick=sha(r.screenshot_path);
 r=await send({role:'button',name:'Bottom sentinel',prediction:'button changes label',intended_outcome:'activate bottom control',episode_id:'e3'});assert.notEqual(sha(r.screenshot_path),beforeClick,'native click changes visible screenshot');
 child.stdin.write(JSON.stringify({command:'close',record:{stop_reason:'goal_reached'}})+'\n');child.stdin.end();await new Promise(resolve=>child.once('close',resolve));
 const events=fs.readFileSync(path.join(root,'session/events.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
 assert(events.find(e=>e.type==='prediction'&&e.episode_id==='e3').event_id<events.find(e=>e.type==='action_completed'&&e.episode_id==='e3').event_id);
 assert(events.some(e=>e.type==='action_completed'&&e.episode_id==='pointer'&&e.action==='pointer_click'));
 assert(fs.existsSync(path.join(root,'session/opaque-save.json')));
 console.log({pass:true,scope:'Synthetic transport: screenshot-only output and dimensions, offscreen action guard, explicit scroll, pointer and role clicks, prediction ordering, opaque capture. Not GCC player evidence.'});
 }finally{clearTimeout(timer);child.kill();rl.close();}})().catch(e=>{console.error(e);process.exitCode=1});
