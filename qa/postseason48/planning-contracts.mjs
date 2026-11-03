import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI,closeSeason} from '../club-expansion-20261027/helpers.mjs';
const file=process.argv[2]||'qa/perfection-20261030/candidate.html',storage=new Map(),h=loadGame(file,101,storage,{strictIds:true}),X=h.context.GCC8,s=h.G.state;
// Single-tab persistence fixture: host has no browser Web Locks implementation.
function enableSingleTabLock(host){host.context.AbortController=AbortController;host.context.navigator.locks={request:(_name,_options,work)=>Promise.resolve().then(work)};}
enableSingleTabLock(h);
assert.equal(typeof X.seasonPhaseBrief,'function','structured season evidence must exist');
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();
for(let i=0;i<14;i++){selectManualXI(h);h.G.playNextRound();}closeSeason(h);
// Archive navigation uses the actual review return path before invoking offseason.
X.ui.view='review';assert(X.dispatch('archive'));assert(X.dispatch('archiveBack'));assert.equal(X.ui.view,'review');
const expected=JSON.parse(JSON.stringify(X.seasonPhaseBrief(s.results,s.year,s.userClub.abbr))),before=JSON.stringify(s);
assert.match(X.views.review(),/League wins/);assert.match(X.views.review(),/League losses/);
X.seasonPlan();assert.equal(JSON.stringify(s),before,'diagnosis rendering does not alter cricket state');
assert(expected.phases.every(p=>p.batBalls>0&&p.bowlBalls>0));
assert(X.dispatch('offseason'),'real guarded offseason action');assert.equal(s.year,2009);assert.equal(s.results.length,0);
assert.deepEqual(JSON.parse(JSON.stringify(X.ui.seasonBrief)),expected,'captured before scorebooks reset');
assert.deepEqual(JSON.parse(JSON.stringify(s.dynasty.v8UI.seasonBrief)),expected,'structured presentation metadata saved');
const market=X.views.dynasty();assert.match(market,/2008 scouting brief/);assert.match(market,/Manage players/);assert.match(market,/Continue to draft draw|Keep squad/);if(X.managementBrief(true))assert.match(market,/Squad decisions to review/);
const after=JSON.stringify(s),html=X.previousSeasonBrief();assert.match(html,/2008/);assert.match(html,/Review squad/);assert.match(html,/batting.*bowling balls/);assert.equal(JSON.stringify(s),after);
assert(X.dispatch('offseasonPane',['players']));assert.equal(X.ui.offseasonPane,'players');
assert(await X.read.saveAsync(),'async save completes before reopen: '+X.read.saveError());
const loaded=loadGame(file,202,storage,{strictIds:true}),Y=loaded.context.GCC8;enableSingleTabLock(loaded);Y.ui.view='home';assert(Y.dispatch('continue'),JSON.stringify({errors:loaded.errors,view:Y.ui.view,stored:Y.hasStoredSave()}));assert.deepEqual(JSON.parse(JSON.stringify(Y.ui.seasonBrief)),expected,'continue restores metadata');
for(const mutate of [v=>v.year=2007,v=>v.year=2009,v=>v.year=2027,v=>v.club='WRONG',v=>v.phases[1].key=v.phases[0].key,v=>v.phases[0].scored=NaN,v=>v.phases[0].bowlBalls=-1,v=>v.phases.pop(),v=>v.phases[0].batBalls=36.5,v=>v.phases[0].bowlBalls=Number.MAX_SAFE_INTEGER+1]){const bad=structuredClone(expected);mutate(bad);assert.equal(Y.cleanSeasonBrief(bad),null);}
Y.ui.seasonBrief=null;assert.match(Y.previousSeasonBrief(),/No previous-season phase evidence was retained/);
assert.deepEqual(h.errors,[]);assert.deepEqual(loaded.errors,[]);
console.log('PASS postseason planning: real archive → review → offseason capture, scorebook reset, persistence/continue, validation, legacy absence, route and render purity.');
