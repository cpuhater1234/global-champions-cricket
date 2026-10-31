import fs from 'node:fs';import assert from 'node:assert/strict';import {loadGame} from '../offline_game_host.mjs';import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();X.ui.view='season';X.ui.seasonTab='matchday';
let html=X.views.season();assert.match(html,/aria-label="Campaign overview"/,'matchday exposes campaign context before fixture');
assert(html.indexOf('Campaign overview')<html.indexOf('Next cricket match'));
assert.match(html,/aria-label="Match controls"/);assert(html.indexOf('Match controls')<html.indexOf('gccuiVenuePhoto'),'match actions precede venue artwork');
assert.match(html,/aria-label="Conditions and selection"/);
assert.match(html,/aria-label="Matchday information"/);assert.doesNotMatch(html,/class="g8matchbelow"/,'old floating action rows removed');
assert(html.includes('Ladder position does not determine next year’s draft draw'),'format retains annual draft clarification');assert.match(html,/No league matches played/);assert.doesNotMatch(html,/undefined|NaN/);
for(let i=0;i<3;i++){selectManualXI(h);h.G.playNextRound();}
html=X.views.season();assert.match(html,/aria-label="Latest match"/);assert.match(html,/data-action="result"/);assert.match(html,/Recent form/);
const bowler=X.roster().find(p=>X.R.bowlingWorkload(p)>=4&&X.R.bowlingUsagePrior(p)>=1.5);let state=X.managementState();state.players[bowler.id].underused=5;state.players[bowler.id].requested=true;s.dynasty.v8Management=state;X.managementDecide(bowler.id,'bowling');const brief=X.managementBrief(true);assert.match(brief,/full bowling opportunities remaining/,'active commitment visible even with transfer concern');
assert(brief.includes('5 full innings without a bowling role'),'promise progress must not replace concern cause');
s.dynasty.injuries[bowler.id]={status:'OUT',type:'finger',roundsLeft:2};const injuredBrief=X.managementBrief(true);assert(injuredBrief.includes('full bowling opportunities remaining'),'injury must not hide promise progress');delete s.dynasty.injuries[bowler.id];
const before=JSON.stringify(s);html=X.views.season();assert.equal(JSON.stringify(s),before,'hub rendering does not mutate career');
const first=s.xi[0];s.dynasty.injuries[first]={status:'OUT',type:'finger',roundsLeft:2};html=X.views.season();assert(html.includes('OUT'));assert.doesNotMatch(html,/data-action="watchNext"/,'unfit XI cannot start match');delete s.dynasty.injuries[first];
const keptXI=[...s.xi],keptOrder=[...s.battingOrder],keepers=s.xi.filter(id=>X.R.isKeeper(h.G.byId(id))),replacements=X.roster().filter(p=>!s.xi.includes(p.id)&&!X.R.isKeeper(p));assert(keepers.length&&replacements.length>=keepers.length);const replacementMap=new Map(keepers.map((id,i)=>[id,replacements[i].id]));s.xi=s.xi.map(id=>replacementMap.get(id)||id);s.battingOrder=s.battingOrder.map(id=>replacementMap.get(id)||id);assert(!s.xi.some(id=>X.R.isKeeper(h.G.byId(id))),'test fixture has no keeper');html=X.views.season();assert(!html.includes('data-action="watchNext"'),'keeper guard preserved in new hub');s.xi=keptXI;s.battingOrder=keptOrder;

const checks={pass:true,checks:['campaign context above fixture','actions before artwork','conditions visible beside XI','no floating matchday rows','fresh and midseason data','promise not hidden by concern','read-only renderer','injury readiness guard','recognised keeper guard','concern and promise shown together','medical absence retains promise progress','annual draft guidance retained']};fs.writeFileSync('qa/command-centre-20261031/contracts.json',JSON.stringify(checks,null,2));console.log(checks);
