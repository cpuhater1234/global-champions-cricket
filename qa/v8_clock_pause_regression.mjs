import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
// Directly executes the committed clock source with a deterministic native-timer shim.
const source=fs.readFileSync('v8/ui/clock.js','utf8');
let current=1000,sequence=0;
const native=new Map(),output=[];
const window={setTimeout(fn,delay){const id=++sequence;native.set(id,{fn,due:current+delay});return id;},clearTimeout(id){native.delete(id);}};
vm.runInNewContext(source,{window,performance:{now:()=>current}});
const clock=window.GCC8_CLOCK;
function advance(delta){current+=delta;for(let n=0;n<100;n++){const due=[...native].filter(([,v])=>v.due<=current).sort((a,b)=>a[1].due-b[1].due);if(!due.length)return;const [id,j]=due[0];native.delete(id);j.fn();}throw Error('Unexpected timer runaway');}
clock.setTimeout(()=>{output.push('first');clock.pause()},10);
clock.setTimeout(()=>output.push('second'),10);
advance(10);assert.deepEqual(output,['first'],'a callback must not run after an earlier simultaneous callback pauses');
assert.equal(clock.pending,1,'paused job remains scheduled');
advance(500);assert.deepEqual(output,['first'],'paused clock must not advance jobs');
clock.resume();advance(0);assert.deepEqual(output,['first','second'],'pending callback fires after resumption');
clock.setTimeout(()=>{output.push('third');clock.pause()},10);
const cancel=clock.setTimeout(()=>output.push('canceled'),10);
advance(10);clock.clearTimeout(cancel);clock.resume();advance(100);
assert(!output.includes('canceled'),'canceled paused callback must never fire');
console.log('PASS clock pause/resume same-time and cancellation regression');
