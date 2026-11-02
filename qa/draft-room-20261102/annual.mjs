import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI,closeSeason} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();for(let i=0;i<14;i++){selectManualXI(h);h.G.playNextRound();}closeSeason(h);h.context.Dynasty.beginOffseason();X.ui.view='dynasty';
assert(X.dispatch('annualDraw'));assert(X.dispatch('revealAll'));assert(X.dispatch('annualDraft'));assert.equal(s.dynasty.offseason.phase,'draft');
const truth=()=>JSON.stringify({teams:s.teams,cursor:s.dynasty.offseason.pickCursor,picks:s.dynasty.offseason.picks}),before=truth();
assert(X.dispatch('draftSquad'));assert.equal(X.ui.modal,'mobileSquad');h.get('g8dialog').scrollTop=210;const p=X.roster()[0];assert(p);assert(X.dispatch('inspect',[p.id]));assert.equal(X.ui.scoutReturn,'mobileSquad');assert(X.dispatch('playerTab',['skills']));assert(X.dispatch('close'));assert.equal(X.ui.modal,'mobileSquad');assert.equal(h.get('g8dialog').scrollTop,210);assert(X.dispatch('close'));assert.equal(truth(),before,'annual inspection cannot consume slots or move players');
assert.deepEqual(h.errors,[]);console.log('PASS real season-to-annual-draft squad route, scouting return, scroll and immutable annual cursor/roster');
