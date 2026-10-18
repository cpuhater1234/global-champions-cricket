import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
// Execute the actual planner emitted by the build; fixtures vary departures and ownership.
const code=fs.readFileSync('v8/engine/dynasty.js','utf8');
const extract=name=>{const start=code.indexOf('  function '+name+'(');assert(start>=0);const end=code.indexOf('\n  function ',start+1);return code.slice(start,end<0?undefined:end);};
const a=extract('draftSlots'),b=extract('slotsWithSupplement'),c=extract('userOwnsPick');
function plan(retired,released,{cpu=false,legacy=false,trade=false,before=false}={}){
 const clubs=['A','B','C','D','E','F','G','H'],owner=cpu?'B':'A',teams=Object.fromEntries(clubs.map(c=>[c,Array.from({length:15-(c===owner?retired+released:0)},(_,i)=>i)]));
 const o={phase:before?'lottery':'draft',lottery:clubs,pickOwners:{},draftNeeds:Object.fromEntries(clubs.map(c=>[c,15-teams[c].length])),retirements:Array.from({length:retired},(_,id)=>({owner,id})),voluntaryCuts:cpu?[]:Array.from({length:released},(_,i)=>i+50),finalCuts:[],cpuReleases:cpu?{B:Array.from({length:released},(_,i)=>i+50)}:{},picks:[]};if(!legacy)o.releasePickPolicy=1;
 if(trade)o.pickOwners['R1:'+owner]='C';
 const context={state:{teams,userClub:{abbr:'A'},dynasty:{offseason:o}},rosterIds:c=>teams[c]};vm.runInNewContext(a+'\n'+b+'\n'+c+'\nthis.slots=slotsWithSupplement();this.slots.rights=["R1","R2"].filter(userOwnsPick);',context);return context.slots;
}
for(const cpu of [false,true])for(const [retired,released]of [[0,2],[2,2],[3,1],[4,0],[6,0]]){
 const slots=plan(retired,released,{cpu}),ordinary=slots.filter(s=>!s.supplementary),supp=slots.filter(s=>s.supplementary);
 assert.equal(ordinary.length,Math.min(4,retired),`${cpu?'CPU':'user'} ${retired} retirements/${released} releases: ordinary picks`);
 assert.equal(supp.length,released+Math.max(0,retired-4),'releases and excess retirements are supplementary');
 assert.equal(slots.length,retired+released,'one selection per vacancy');assert(slots.slice(ordinary.length).every(s=>s.supplementary),'supplementary picks follow ordinary picks');assert.equal(new Set(slots.map(s=>s.key)).size,slots.length);
}
assert.equal(plan(0,2,{before:true}).rights.length,0,'supplementary-only vacancies cannot sell nonexistent ordinary picks');assert.equal(plan(1,2,{before:true}).rights.length,1,'only actual ordinary picks can be traded');
assert.equal(plan(0,2,{legacy:true,before:true,trade:true}).find(s=>s.key==='R1:A')?.owner,'C','an older revealed lottery preserves its already-transferred ordinary pick');
const traded=plan(2,2,{trade:true});assert.equal(traded[0].owner,'C','traded ordinary selection retains its snake slot');assert.equal(traded.filter(s=>s.owner==='A').length,4,'club fills vacancy after trading away pick');
assert.equal(plan(2,2,{legacy:true}).filter(s=>!s.supplementary).length,4,'already-open old drafts keep their established order');
console.log('PASS optional releases, excess retirements, CPU parity, traded picks and legacy draft order');
