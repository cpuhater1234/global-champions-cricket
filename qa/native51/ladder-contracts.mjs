import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame(process.argv[2]||'qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();h.G.playNextRound();
const before=JSON.stringify(s),html=X.ladder();assert.match(html,/gccuiLadderTable/);assert.equal((html.match(/scope="col"/g)||[]).length,7);assert.equal((html.match(/scope="row"/g)||[]).length,8);
for(const t of Object.values(s.table)){assert(html.includes(`Played ${t.p}, won ${t.w}, lost ${t.l}`));assert(html.includes(`<td>${t.pts}</td><td>${t.nrr.toFixed(2)}</td>`));}
assert.match(html,/<tr class="mine">/);assert.equal(JSON.stringify(s),before);assert.deepEqual(h.errors,[]);console.log('PASS exact played/won/lost/points/NRR data, seven-column desktop semantics, eight named rows, current club and read-only rendering.');
