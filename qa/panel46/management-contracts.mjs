import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame(process.argv[2]||'qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);X.ui.view='team';
const p=X.roster().find(p=>{const q=X.managementState().players[p.id];return q.batting&&q.bowling;});
assert(p,'all rounder fixture');
function view(){const before=JSON.stringify(s),html=X.managementPlayer(p);assert.equal(JSON.stringify(s),before,'render must not change save');return html;}
function before(html,a,b){assert(html.indexOf(a)>=0,`missing ${a}`);assert(html.indexOf(b)>=0,`missing ${b}`);assert(html.indexOf(a)<html.indexOf(b),`${a} must precede ${b}`);}
let html=view();
assert.match(html,/<details class="g8commitmentoptions gccuiOptionalPromises"><summary>Make an optional commitment<\/summary>/,'settled player catalogue is an explicit closed disclosure');
for(const k of ['run','batting','bowling'])before(html,`id="g8commitment-${p.id}-${k}"`,`aria-describedby="g8commitment-${p.id}-${k}"`);
for(const term of ['next three fully fit matches','next two fit selections','at least 90 opposition balls','Medical absences pause commitments','being managed medically is not assessed','This does not promise a place in the XI.','Shorter innings pause the promise.'])assert(html.includes(term),term);
let state=X.managementState(),q=state.players[p.id];q.requested=true;q.omitted=q.regular?3:5;s.dynasty.v8Management=state;
html=view();before(html,'Agree to seek a move','Explain squad rotation');before(html,'Explain squad rotation','gccuiOptionalPromises');
X.managementDecide(p.id,'bowling');html=view();
before(html,'full bowling opportunities remaining','gccuiManagementContext');before(html,'full bowling opportunities remaining','Agree to seek a move');assert(!html.includes('gccuiOptionalPromises'),'active promise suppresses catalogue');
assert(html.includes('Being managed medically pauses assessment, including when selected.'));
assert(html.includes('Short innings may end before the spell is completed.'));
s.dynasty.injuries[p.id]={status:'MANAGING',type:'calf tightness',roundsLeft:2};if(!s.xi.includes(p.id))s.xi[0]=p.id;
html=view();before(html,'Rest and choose replacement','Agree to seek a move');before(html,'Rest and choose replacement','gccuiManagementContext');assert(html.includes('Currently selected'));
X.ui.view='season';assert(!view().includes('Rest and choose replacement'),'replacement remains guarded to XI view');X.ui.view='team';
s.pendingSwapIn=999;html=view();assert.match(html,/<button[^>]*data-action="manageRest"[^>]*disabled|<button[^>]*disabled[^>]*data-action="manageRest"/,'pending swap guard preserved');
assert.deepEqual(h.errors,[]);console.log('PASS management hierarchy, contextual action priority, disclosures, promise terms, guards and read-only render');
