import vm from 'node:vm';import fs from 'node:fs';import assert from 'node:assert/strict';
let now=0,id=0;const native=new Map();const ctx={performance:{now:()=>now},setTimeout:(fn,d)=>{const n=++id;native.set(n,{fn,due:now+d});return n;},clearTimeout:id=>native.delete(id)};ctx.window=ctx;vm.runInNewContext(fs.readFileSync('v8/ui/clock.js','utf8'),ctx);const c=ctx.GCC8_CLOCK;
function advance(ms){now+=ms;for(const [id,j] of [...native])if(j.due<=now){native.delete(id);j.fn();}assert.ok(native.size<=1,'only one native runner');}
let fired=0,repeat;
c.setTimeout(()=>fired++,100);c.setTimeout(()=>fired++,200);assert.equal(native.size,1);advance(100);assert.equal(fired,1);
c.pause();advance(1000);assert.equal(fired,1);assert.equal(native.size,0);c.resume();advance(99);assert.equal(fired,1);advance(1);assert.equal(fired,2);
repeat=c.setInterval(()=>{fired++;c.clearInterval(repeat);},10);advance(10);advance(1000);assert.equal(fired,3);assert.equal(c.pending,0);
const cancelled=c.setTimeout(()=>{throw Error('cancelled callback ran');},10);c.clearTimeout(cancelled);advance(20);
c.pause();advance(400);c.setTimeout(()=>fired++,100);advance(600);c.resume();advance(99);assert.equal(fired,3);advance(1);assert.equal(fired,4);assert.equal(c.pending,0);
console.log('Clock: one native runner, pause/resume, cancellation and self-cancelling interval passed.');
