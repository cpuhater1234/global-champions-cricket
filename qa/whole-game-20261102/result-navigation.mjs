import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';

// Render/route contracts only: the host has no layout, focus or real browser DOM.
const file=process.argv[2]||'qa/perfection-20261030/candidate.html';
const h=loadGame(file,101,new Map(),{strictIds:true});
const X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();h.G.playNextRound();
X.ui.result=s.results[0];X.ui.view='result';
const cricket=()=>JSON.stringify({results:s.results,stats:s.playerSeasonStats,round:s.round,table:s.table,xi:s.xi,order:s.battingOrder});
const before=cricket(),html=X.views.result();
assert.equal((html.match(/data-action="matchday"/g)||[]).length,1,'one continuation action');
assert.equal((html.match(/data-action="resultScorecard"/g)||[]).length,1,'one Scorebook action');
assert.match(html,/Next match/);
const score=html.indexOf('class="gccui gccuiScorecard');
assert(score>0,'result scorecard exists');
for(const action of ['matchday','resultScorecard'])assert(html.indexOf(`data-action="${action}"`)<score,`${action} precedes result scorecard`);
const headline=html.indexOf(`${X.esc(s.results[0].winner.name)} won `),teams=html.indexOf('class="gccuiScoreTeams"');
assert(headline>score&&headline<teams,'winner headline precedes team scores');
assert(html.indexOf('class="g8nextstep"')<html.indexOf('class="gcc-awards"'),'campaign continuation precedes awards');
assert.equal(cricket(),before,'rendering does not alter cricket state');
assert(X.dispatch('resultScorecard'));assert.equal(X.ui.modal,'scorecard');assert.equal(X.ui.view,'result');
assert(X.dispatch('close'));assert.equal(X.ui.modal,null);assert.equal(X.ui.view,'result');
assert(X.dispatch('matchday'));assert.equal(X.ui.view,'season');assert.equal(X.ui.seasonTab,'matchday');
assert.equal(cricket(),before,'scorebook/close/continuation do not alter cricket state');
assert.deepEqual(h.errors,[]);
console.log(JSON.stringify({pass:true,file,checks:['single early actions','winner before scores','continuation before analysis','scorebook close returns to result','next match routes to matchday','cricket state immutable']}));
