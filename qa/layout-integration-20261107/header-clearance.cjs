const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2],'utf8');
for(const withObserver of [true,false]){
 let height=151.2,observerCallback,resizeCallback;const values=[];const hud={getBoundingClientRect:()=>({height})};
 const context={window:{GCC8:{},addEventListener:(name,cb)=>{assert.equal(name,'resize');resizeCallback=cb}},document:{getElementById:id=>{assert.equal(id,'g8hud');return hud},documentElement:{style:{setProperty:(key,value)=>{assert.equal(key,'--gcc-hud-height');values.push(value)}}}}};
 if(withObserver)context.ResizeObserver=class{constructor(cb){observerCallback=cb}observe(target){assert.equal(target,hud)}};
 vm.runInNewContext(source,context);assert.deepEqual(values,['152px']);height=203.7;(withObserver?observerCallback:resizeCallback)();assert.deepEqual(values,['152px','204px']);
}
vm.runInNewContext(source,{window:{GCC8:{}},document:{getElementById:()=>null}});
console.log('Header clearance: initial height, wrapped-header resize, fallback resize and absent-header cases passed');
