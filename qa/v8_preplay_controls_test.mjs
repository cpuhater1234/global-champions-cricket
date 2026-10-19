import {fixturePath} from './v8_fixture_paths.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_career_variation.html';
const out=process.env.GCC8_PREPLAY_REPORT_DIR||'qa/preplay-20261016';
fs.mkdirSync(out,{recursive:true});
let checks=0;const snapshots={},commands=new Set();
const check=(v,m)=>{assert.ok(v,m);checks++;};
const call=(h,a,...args)=>{check(h.context.GCC8.dispatch(a,args),a+': '+h.get('g8feedback').textContent);commands.add(a);};
const snap=(h,k)=>{snapshots[k]={stage:h.get('g8stage').innerHTML,hud:h.get('g8hud').innerHTML,dialog:h.get('g8dialogContent').innerHTML};};
const fresh=loadGame(file,9401,new Map(),{strictIds:true,captureEvents:true}),F=fresh.context.GCC8;
for(const [a,args] of [['play',[]],['world',[]],['revealAll',[]],['clubs',[]],['club',[0]],['confirmClub',[]]])call(fresh,a,...args);
const speed=fresh.G.state.recruit.speedIndex;for(let i=0;i<3;i++)call(fresh,'signingSpeed');check(fresh.G.state.recruit.speedIndex===speed,'signing speed cycles back');
for(const a of ['signingSkip','draftDraw','revealAll','beginDraft'])call(fresh,a);
const before=F.ui.draftShown;call(fresh,'more');check(F.ui.draftShown===before+12,'show more extends board');
const app=fresh.get('g8app');
app.emit('input',{target:{dataset:{input:'search'},value:'warner'}});
check(F.ui.search==='warner'&&F.ui.draftShown===12,'search event resets pagination');
for(const key of ['filter','sort']){
 const value=key==='filter'?'AR':'overall';app.emit('change',{target:{dataset:{input:key},value}});
 check(F.ui[key]===value&&F.ui.draftShown===12,key+' event updates board');
}
snap(fresh,'draft-filtered');
check(F.pool().every(p=>p.role==='AR'&&`${p.name} ${p.country}`.toLowerCase().includes('warner')),'combined search and role filtering');
app.emit('input',{target:{dataset:{input:'search'},value:''}});
for(const role of ['BAT','WK-BAT','AR','BOWL']){app.emit('change',{target:{dataset:{input:'filter'},value:role}});check(F.pool().length>0&&F.pool().every(p=>p.role===role),'role filter contains only '+role);}
app.emit('change',{target:{dataset:{input:'filter'},value:'ALL'}});app.emit('change',{target:{dataset:{input:'sort'},value:'keeping'}});
check(F.pool().every((p,i,a)=>!i||a[i-1].keeping>=p.keeping),'keeping sort descends by glove rating');
const saved=fs.readFileSync(fixturePath('foundation'),'utf8');
const h=loadGame(file,9403,new Map([['gcc_dynasty_v8',saved]]),{strictIds:true,captureEvents:true}),X=h.context.GCC8,s=h.G.state;
call(h,'continue');call(h,'averages');check(h.get('g8dialogContent').innerHTML.includes('<table'),'averages opens actual table');snap(h,'averages');call(h,'close');
call(h,'offseason');call(h,'annualDraw');call(h,'revealAll');call(h,'annualDraft');
for(let guard=0;s.dynasty.offseason?.phase==='draft';guard++){
 check(guard<30,'annual draft finishes');call(h,'skipPick');if(s.dynasty.offseason?.phase!=='draft')break;
 const rs=X.roster(),pool=X.pool(true),p=pool.find(p=>p.role==='WK-BAT'&&!rs.some(q=>q.role==='WK-BAT'))||pool.find(p=>p.maxOvers>=4&&rs.filter(q=>q.maxOvers>=4).length<6)||pool[0];call(h,'draftPlayer',p.id);
}
check(X.ui.view==='team','annual handoff reaches team room');call(h,'close');call(h,'clearXI');
for(const p of h.G.bestXI(X.roster().filter(p=>s.dynasty.injuries[p.id]?.status!=='OUT')))call(h,'select',p.id);
const selected=[...s.xi];call(h,'naturalOrder');check(s.battingOrder.length===11&&new Set(s.battingOrder).size===11&&selected.every(id=>s.battingOrder.includes(id)),'natural order preserves selected eleven');
const bench=X.roster().find(p=>!s.xi.includes(p.id)&&s.dynasty.injuries[p.id]?.status!=='OUT');call(h,'swapIn',bench.id);call(h,'cancelSwap');check(!s.pendingSwapIn&&selected.every(id=>s.xi.includes(id)),'cancel swap preserves XI');
call(h,'lodge');
for(const tab of ['matchday','ladder','fixtures','players','leaguePlayers']){call(h,'seasonTab',tab);check(X.ui.seasonTab===tab&&h.get('g8stage').innerHTML.length>100,'season tab opens '+tab);snap(h,'season-'+tab);}
check(!X.dispatch('seasonTab',['invalid']),'unknown tab rejected');
call(h,'seasonTab','matchday');call(h,'prepare');call(h,'playMatch',1);call(h,'matchSkip');call(h,'matchday');call(h,'scorecard',1);
check(h.get('g8dialogContent').innerHTML.includes(s.results[0].scorecard.innings[0].club.name),'fixture scorecard opens completed match');snap(h,'fixture-scorecard');
h.get('g8dialog').emit('cancel',{preventDefault(){}});check(!h.get('g8dialog').open,'Escape callback closes scorecard');
call(h,'result',1);check(X.ui.result.round===1,'result navigation selects requested match');
// Completed-season fixture supplies a real final and its valid return target.
const finalHost=loadGame(file,9405,new Map([['gcc_dynasty_v8',saved]]),{strictIds:true});call(finalHost,'continue');
const Y=finalHost.context.GCC8;check(!!finalHost.G.state.finals?.gf,'fixture contains actual grand final');
Y.ui.result=finalHost.G.state.finals.gf;Y.ui.view='result';Y.render();
call(finalHost,'finalsReturn');check(Y.ui.view==='finals','finals result return command navigates');
// Compatibility-only overfull-list route, built explicitly rather than claiming
// that ordinary automatic draft completion naturally enters this old screen.
const legacy=loadGame(file,9407,new Map([['gcc_dynasty_v8',saved]]),{strictIds:true});call(legacy,'continue');call(legacy,'offseason');
const L=legacy.context.GCC8,ls=legacy.G.state,o=ls.dynasty.offseason,own=ls.userClub.abbr;
o.retirements=o.retirements.filter(r=>r.owner!==own);o.voluntaryCuts=[];o.finalCuts=[];
while(ls.teams[own].length<16){const p=L.read.freeAgents().map(legacy.G.byId).find(p=>!ls.teams[own].includes(p.id));check(!!p,'legacy overfull fixture candidate');ls.teams[own].push(p.id);p.draftedBy=own;}
o.phase='cuts';o.draftComplete=true;L.ui.view='dynasty';call(legacy,'annualList');
const extra=ls.teams[own].at(-1);call(legacy,'finalCut',extra);call(legacy,'confirmFinalCut',extra);check(ls.teams[own].length===15&&o.finalCuts.includes(extra)&&!ls.teams[own].includes(extra),'legacy final cut removes exactly one extra player');
check(!L.dispatch('finalCut',[extra]),'cannot cut a legal fifteen-player list');
check(!h.errors.length&&!fresh.errors.length&&!finalHost.errors.length&&!legacy.errors.length,'no unexpected script errors');
const report={artifactSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),scope:'Real-script VM direct commands and synthetic captured input/change/cancel callbacks. Finals-return uses an actual completed-final fixture; compatibility list correction uses an explicit overfull roster fixture. No native pointer, keyboard, geometry, focus or rendering certification.',checks,commands:[...commands].sort(),errors:[]};
fs.writeFileSync(out+'/controls.json',JSON.stringify(report,null,2)+'\n');fs.writeFileSync(out+'/controls-markup.json',JSON.stringify(snapshots,null,2)+'\n');console.log(report);
