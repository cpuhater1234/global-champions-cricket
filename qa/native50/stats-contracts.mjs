import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame(process.argv[2]||'qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
assert.equal(typeof X.statsPlayer,'function','player report entry exists');
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();h.G.playNextRound();X.ui.view='season';X.ui.seasonTab='players';
const before=JSON.stringify({results:s.results,stats:s.playerSeasonStats,xi:s.xi,order:s.battingOrder,teams:s.teams}),records=X.clubSeasonRecords(),html=X.averages();
assert.equal((html.match(/scope="row"/g)||[]).length,records.length*2);assert(html.includes(`<caption>${s.year} · ${X.esc(s.userClub.name)} season detail, including finals</caption>`));assert.match(html,/<h2[^>]*>Season detail<\/h2>/);assert.doesNotMatch(html,/THE FULL PLAYER RECORD/);
for(const {p,t}of records){assert(html.includes(`View ${X.esc(p.name)} player report`));assert(html.includes(`<td>${t.matches||0}</td><td>${t.runs||0}</td>`));}
const played=records.find(r=>r.t.matches>0);assert(X.dispatch('inspect',[played.p.id]));assert.match(h.get('g8dialogContent').innerHTML,/GCC record/);assert(X.dispatch('close'));assert.equal(X.ui.seasonTab,'players');assert.equal(JSON.stringify({results:s.results,stats:s.playerSeasonStats,xi:s.xi,order:s.battingOrder,teams:s.teams}),before);assert.deepEqual(h.errors,[]);
console.log('PASS both season tables: named row/column context, honest scope, unchanged numerical records, report-open/close route and cricket-state preservation.');
