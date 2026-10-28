import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const clubs=['A','B','C','D','E','F','G','H'];let seed=77137,checks=0,cases=0,traded=0;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const ctx={state:{userClub:{abbr:'A'},dynasty:{}},rosterIds:()=>[],window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('v8/domain/draft_slots.js','utf8')+'\nwindow.slots=slotsWithSupplement;window.ordinary=draftSlots;',ctx);
const check=(v,label)=>{assert(v,label);checks++};
for(let n=0;n<4096;n++){
 const lottery=[...clubs].sort(()=>random()-.5),needs=Object.fromEntries(clubs.map(a=>[a,Math.floor(random()*16)])),ordinary=Object.fromEntries(clubs.map(a=>[a,Math.min(4,needs[a])])),pickOwners={};
 for(const a of clubs)for(const r of ['R1','R2'])if(ordinary[a]>=Number(r.slice(1))&&random()<.4){pickOwners[r+':'+a]=clubs[Math.floor(random()*8)];traded++;}
 ctx.state.dynasty.offseason={lottery,draftNeeds:needs,ordinaryPickCounts:ordinary,pickOwners,supplementSnakePolicy:1,releasePickPolicy:1};
 const slots=ctx.window.slots();check(slots.length<=152,'bounded slot count');check(new Set(slots.map(x=>x.key)).size===slots.length,'unique slot keys');
 for(const a of clubs){const owned=slots.filter(x=>x.owner===a);check(owned.length>=needs[a],'every vacancy has an owned selection');check(slots.filter(x=>x.original===a&&!x.supplementary).length===ordinary[a],'original entitlement frozen');}
 for(const round of new Set(slots.map(x=>x.round))){const row=slots.filter(x=>x.round===round),order=round%2?lottery:[...lottery].reverse(),indices=row.map(x=>order.indexOf(x.original));check(indices.every((x,i)=>!i||x>indices[i-1]),'every normal/supplement round continues snake');}
 for(const x of slots){check(clubs.includes(x.owner)&&clubs.includes(x.original),'known owners');check(x.round>=1&&Number.isInteger(x.round),'integer rounds');if(x.supplementary)check(x.owner===x.original,'supplement belongs to vacancy club');}
 cases++;
}
const result={cases,checks,tradedSlotAssignments:traded,scope:'Unchanged draft_slots.js with generated valid entitlement/vacancy/ownership combinations, including0–15 vacancies. Pure-domain invariants; not4096 complete careers.'};fs.writeFileSync('qa/deep-20261027/combinations/slots.json',JSON.stringify(result,null,2));console.log(result);
