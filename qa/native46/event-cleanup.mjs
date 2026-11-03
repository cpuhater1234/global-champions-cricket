import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const file=process.argv[2]||'deliver/GCC_v8_Playtest_46.html',html=fs.readFileSync(file,'utf8');
const start=html.indexOf('/* Persistent squad expectations.');
assert(start>=0,'management model exists');
const end=html.indexOf('})();',start)+5,context={window:{}};
vm.createContext(context);vm.runInContext(html.slice(start,end),context);
const E=context.window.GCC8_MANAGEMENT,identity='independent-clean-test:PBKS';
const roster=[{id:701,name:'High ID Bowler',regular:true,batting:false,bowling:true,band:'TAIL'},{id:400,name:'Actual Player Four Hundred',regular:true,bowling:true,band:'TAIL'}];
const failures=[];
function check(name,fn){try{fn();console.log('PASS '+name);}catch(e){failures.push(name+': '+e.message);console.error('FAIL '+name+': '+e.message);}}
for(const year of [2008,2026])check('applyMatch → clean → applyMatch → clean preserves '+year+' and ID701',()=>{
 let state=E.clean(null,identity,roster,year);state=E.decide(state,701,'bowling');
 for(let round=1;round<=2;round++){state=E.applyMatch(state,{key:year+':R'+round,year,oppositionBalls:120,players:[{id:701,selected:true,fit:95,bowled:12,injury:null}]});state=E.clean(state,identity,roster,year);}
 assert.equal(state.players[701].promise.status,'kept');
 const event=state.events.find(e=>e.kind==='kept');assert(event,'promise emits kept event');assert.equal(event.year,year,'event year must survive cleaning');assert.equal(event.playerId,701,'event player ID must survive cleaning');
 assert.equal(state.events.filter(e=>e.key===year+':R2'&&e.year===year).length,1,'production renderer year/key filter can see the event');
 const result={key:year+':R2'},rendererStart=html.indexOf('X.managementResult=r=>'),rendererEnd=html.indexOf('\n X.storyPanel=X.managementBrief;',rendererStart);
 const renderContext={roster:()=>roster,X:{managementState:()=>state},s:{year},results:()=>[result],keys:r=>r.key,G:{byId:id=>roster.find(p=>p.id===id)},esc:v=>String(v).replaceAll('<','&lt;'),btn:(label,action,args)=>`<button data-action="${action}" data-id="${args[0]}">${label}</button>`};
 vm.createContext(renderContext);vm.runInContext(html.slice(rendererStart,rendererEnd),renderContext);
 const rendered=renderContext.X.managementResult(result);assert.match(rendered,/1 management consequence/);assert.match(rendered,/Commitment kept/);assert.match(rendered,/data-action="manageInspect" data-id="701"/,'renderer routes to correct high-ID player');

});
check('legacy clamped year and uniquely named player can recover',()=>{
 const raw={version:1,identity,year:2008,players:{},events:[{key:'2008:R9',year:400,playerId:400,kind:'kept',text:'High ID Bowler: you kept your commitment.'}]};
 const event=E.clean(raw,identity,roster,2008).events[0];assert.equal(event.year,2008);assert.equal(event.playerId,701);
});
check('unrecoverable clamped player never routes to unrelated ID400',()=>{
 const raw={version:1,identity,year:2026,players:{},events:[{key:'2026:R14',year:400,playerId:400,kind:'transfer',text:'Departed Unavailable Player: wants a move.'}]};
 const event=E.clean(raw,identity,roster,2026).events[0];assert.equal(event.year,2026);assert.equal(event.playerId,0);
});
check('ambiguous exact name does not invent a player match',()=>{
 const raw={version:1,identity,year:2008,players:{},events:[{key:'2008:R1',year:400,playerId:400,kind:'kept',text:'High ID Bowler: you kept your commitment.'}]};
 const event=E.clean(raw,identity,[...roster,{...roster[0],id:702}],2008).events[0];assert.equal(event.playerId,0);
});
check('legitimate player400 remains400 when exact name matches',()=>{const raw={version:1,identity,year:2008,players:{},events:[{key:'2008:R2',year:2008,playerId:400,kind:'kept',text:'Actual Player Four Hundred: you kept your commitment.'}]};const e=E.clean(raw,identity,roster,2008).events[0];assert.equal(e.playerId,400);assert.equal(e.year,2008);});
check('historical key recovers historical year rather than current year',()=>{const raw={version:1,identity,year:2026,players:{},events:[{key:'2008:R2',year:400,playerId:701,kind:'kept',text:'High ID Bowler: you kept your commitment.'}]};assert.equal(E.clean(raw,identity,roster,2026).events[0].year,2008);});
check('unsafe IDs and out-of-career years are not invented',()=>{const raw={version:1,identity,year:2008,players:{},events:[{key:'2027:R1',year:2027,playerId:Number.MAX_SAFE_INTEGER+1,kind:'kept',text:'Unresolved event'}]};const e=E.clean(raw,identity,roster,2008).events[0];assert.equal(e.playerId,0);assert.equal(e.year,0);});
if(failures.length){console.error(failures.length+' event cleanup regressions failed');process.exitCode=1;}else console.log('PASS all event-cleanup regressions against '+file);
