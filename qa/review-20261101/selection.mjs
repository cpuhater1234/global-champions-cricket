import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame(process.argv[2]||'qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);
function lodge(){return X.views.team().match(/<button\b[^>]*data-action="lodge"[^>]*>/)?.[0]||'';}
assert(!lodge().includes('disabled'),'legal XI remains confirmable');
const legal=[...s.xi],nonkeepers=X.roster().filter(p=>!X.R.isKeeper(p));
assert(nonkeepers.length>=11,'fixture has eleven nonkeepers');
s.xi=nonkeepers.slice(0,11).map(p=>p.id);s.battingOrder=[...s.xi];
const missing=X.read.xiProblem();assert.match(missing,/wicketkeeper/);
assert(lodge().includes('disabled'),'eleven players without a keeper cannot confirm');
assert(X.views.team().includes(missing),'blocking reason is beside selection count');
s.xi=legal;s.battingOrder=[...legal];s.year=2009;s.dynasty.injuries[legal[0]]={status:'OUT',roundsLeft:2,type:'calf tightness'};
assert(lodge().includes('disabled'),'injured selected player blocks confirmation');
assert(X.views.team().includes(X.read.xiProblem()),'injury reason is visible');
delete s.dynasty.injuries[legal[0]];s.xi=legal.slice(0,10);s.battingOrder=[...s.xi];
assert(lodge().includes('disabled'),'incomplete XI remains blocked');
assert.deepEqual(h.errors,[]);console.log('PASS legal, missing keeper, injury and incomplete XI confirmation');
