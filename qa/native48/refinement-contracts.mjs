import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame(process.argv[2]||'qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
assert.equal(typeof X.managementDecisions,'function','shared decision collection exists');
startDraft(h);finishDraft(h);
const p=X.roster()[0],q=X.roster()[1];
s.dynasty.v8Management=X.managementState();
s.dynasty.v8Management.players[p.id].requested=true;
s.dynasty.v8Management.players[q.id].requested=true;
let all=X.managementDecisions();assert.equal(all.filter(x=>X.managementState().players[x.p.id].requested).length,2);
const state=JSON.stringify(s),summary=X.managementSummary();assert.match(summary,/2 move requests/);assert.match(summary,/gccuiSquadDecisions has-alert/);assert.match(summary,new RegExp('aria-label="Review '+p.name+' management"'));assert.equal(JSON.stringify(s),state);
assert.match(X.scoutingBrief(),/phase data unavailable/);assert.doesNotMatch(X.scoutingBrief(),/<details/);
// Minimal market fixture isolates presentation; no career transition is claimed here.
s.year=2009;s.dynasty.offseason={phase:'market',retired:[],released:[],tradedOut:[],incoming:[],arrivals:[]};X.ui.view='dynasty';X.ui.offseasonPane='players';
const before=JSON.stringify(s),html=X.offseasonMarket();assert.match(html,/Available squad changes/);assert.match(html,/Departure rules/);assert.match(html,new RegExp('aria-label="Trade '+p.name+'"'));assert.match(html,new RegExp('aria-label="Review release of '+p.name+'"'));assert(html.indexOf('g8managementlist')<html.indexOf('gccuiManageContinue'));assert.doesNotMatch(html,/g8offseasonsteps/);assert.equal(JSON.stringify(s),before);
assert.deepEqual(h.errors,[]);console.log('PASS shared decisions/counts, move-request signal, player action names, legacy absence, roster-before-continuation, read-only market presentation.');
