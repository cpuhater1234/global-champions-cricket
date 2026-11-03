import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame(process.argv[2]||'qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true,captureEvents:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();s.year=2009;X.ui.view='season';
const player=X.roster()[0],before=JSON.stringify({teams:s.teams,xi:s.xi,order:s.battingOrder,results:s.results,stats:s.playerSeasonStats});
assert(X.dispatch('trade',[true,player.id]));const html=h.get('g8dialogContent').innerHTML;
assert.match(html,/Your second player \(optional\)/);assert.match(html,/Their second player \(optional\)/);assert.doesNotMatch(html,/g8tradeempty/);assert.match(html,new RegExp('aria-label="Scout '+player.name+'"'));assert.match(html,/data-trade-scout="/);assert.match(html,/id="gccuiTradeStatus"[^>]*role="status"/);assert.equal((html.match(/aria-describedby="gccuiTradeStatus"/g)||[]).length,5);
const other=s.teams[X.ui.tradeClub].map(h.G.byId).find(p=>!p.dynastyReplacement);
h.get('g8app').emit('change',{target:{dataset:{input:'tradeTarget'},value:String(other.id)}});
const changed=h.get('g8dialogContent').innerHTML;assert.match(changed,/Both clubs can consider|departure|trade|keeper/i);assert.equal(JSON.stringify({teams:s.teams,xi:s.xi,order:s.battingOrder,results:s.results,stats:s.playerSeasonStats}),before);
assert(X.dispatch('close'));
s.dynasty.offseason={phase:'lottery',lottery:s.league.map(c=>c.abbr),draftNeeds:Object.fromEntries(s.league.map(c=>[c.abbr,2])),pickOwners:{}};X.ui.view='dynasty';assert(X.dispatch('trade',[false]));
const picks=h.get('g8dialogContent').innerHTML;for(const label of ['Your draft pick (optional)','Your second pick (optional)','Their draft pick (optional)','Their second pick (optional)'])assert(picks.includes(label));assert.equal((picks.match(/aria-describedby="gccuiTradeStatus"/g)||[]).length,9);
// DOM stub cannot certify real focus restoration or screen-reader announcements.
assert.deepEqual(h.errors,[]);console.log('PASS trade names, blank-preview removal, named Scout return targets, descriptive status wiring, selection update and cricket-state immutability.');
