const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{const browser=await chromium.launch({executablePath:'/tmp/gcc-chromium-complete',headless:true,args:['--no-sandbox']});try{
const context=await browser.newContext(); const page=await context.newPage(); await page.goto('file://'+path.resolve('qa/limits-20261027/probe/idb-origin.html'));
const source=fs.existsSync('v8/domain/checkpoint_store.js')?fs.readFileSync('v8/domain/checkpoint_store.js','utf8'):'';
await page.addScriptTag({content:source||'void 0;'}); assert.equal(await page.evaluate(()=>typeof createCheckpointStore),'function','checkpoint store factory exists');
const result=await page.evaluate(async()=>{window.store=createCheckpointStore({name:'qa-'+Date.now(),timeout:100});const initial=await store.ready; const result=await store.run(r=>({value:7,record:{count:1}}));const read=await store.run(r=>({value:r}));let rejected=false;try{await store.run(r=>{throw Error('intentional abort')})}catch(e){rejected=true}return {initial,result,read,rejected,mode:store.mode()}});
assert.equal(result.initial,null);assert.equal(result.result.value,7);assert.equal(result.read.value.count,1);assert(result.rejected);assert.equal(result.mode,'strict');
// Reload is an independent connection and readback of acknowledged commit.
const dbName=await page.evaluate(()=>store.run(r=>({value:r})).then(x=>x.value)); assert.equal(dbName.count,1);
const name='shared-'+Date.now(); const second=await context.newPage(); await second.goto(page.url()); await second.addScriptTag({content:source});
for(const tab of [page,second]) await tab.evaluate(async name=>{window.sharedName=name;window.shared=createCheckpointStore({name,timeout:2000});await shared.ready},name);
await Promise.all([page,second].map(tab=>tab.evaluate(async()=>{for(let i=0;i<40;i++)await shared.run(r=>({record:{count:(r?.count||0)+1},value:null}))})));
assert.equal(await page.evaluate(()=>shared.run(r=>({value:r.count})).then(r=>r.value)),80);
const timeoutResult=await page.evaluate(async()=>{
const db=await new Promise((resolve,reject)=>{let q=indexedDB.open(sharedName,1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
let holding=true;const hold=db.transaction('checkpoints','readwrite');const st=hold.objectStore('checkpoints');function keep(){const q=st.get('career');q.onsuccess=()=>{if(holding)keep()}}keep();
const short=createCheckpointStore({name:sharedName,timeout:100});
// Initialization also queues on the held store. Release before its deadline.
window.setTimeout(()=>{holding=false;hold.abort()},30);await short.ready;
let hold2=db.transaction('checkpoints','readwrite'),st2=hold2.objectStore('checkpoints'),active=true;function keep2(){let q=st2.get('career');q.onsuccess=()=>{if(active)keep2()}}keep2();
let calls=0,rejected=false;try{await short.run(r=>{calls++;return {record:{count:999}}})}catch(e){rejected=true}
active=false;hold2.abort();await new Promise(r=>window.setTimeout(r,30));const before=await short.run(r=>({value:r.count}));await short.run(r=>({record:{count:r.count+1},value:null}));const after=await short.run(r=>({value:r.count}));db.close();return {calls,rejected,before:before.value,after:after.value};
});
assert.deepEqual(timeoutResult,{calls:0,rejected:true,before:80,after:81});
const fallback=await second.evaluate(async()=>{const original=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){if(args[2])throw new TypeError('unsupported option');return original.apply(this,args)};const fallback=createCheckpointStore({name:'fallback-'+Date.now()});await fallback.ready;const mode=fallback.mode();await fallback.run(()=>({record:{safe:true}}));IDBDatabase.prototype.transaction=original;return mode});assert.equal(fallback,'transaction');
const ignored=await second.evaluate(async()=>{const original=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(a,b){return original.call(this,a,b)};const ignored=createCheckpointStore({name:'ignored-'+Date.now()});await ignored.ready;IDBDatabase.prototype.transaction=original;return ignored.mode()});assert.equal(ignored,'transaction');
const fresh=await second.evaluate(async()=>{const fresh=createCheckpointStore({name:sharedName});return fresh.ready});assert.equal(fresh.count,81);
const changed=await page.evaluate(async()=>{await new Promise((resolve,reject)=>{let q=indexedDB.open(sharedName,2);q.onsuccess=()=>{q.result.close();resolve()};q.onerror=()=>reject(q.error)});return {available:shared.available(),mode:shared.mode(),error:shared.error()}});assert.equal(changed.available,false);assert.equal(changed.mode,'unavailable');assert.match(changed.error,/version changed/);
const denied=await second.evaluate(async()=>{const original=indexedDB.open;indexedDB.open=()=>{throw new DOMException('Denied','SecurityError')};const denied=createCheckpointStore();const record=await denied.ready;indexedDB.open=original;return {record,available:denied.available(),mode:denied.mode(),error:denied.error()}});assert.equal(denied.available,false);assert.equal(denied.mode,'unavailable');assert.match(denied.error,/Denied/);
console.log('PASS factory, strict committed readback, abort, 80 serialized two-tab mutations, queued timeout no late write and healthy retry, unsupported strict fallback, denied open');
await context.close();
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
