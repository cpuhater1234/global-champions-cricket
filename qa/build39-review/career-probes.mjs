import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame(process.env.GCC_FILE||'qa/perfection-20261030/candidate.html',101),G=h.G,X=h.context.GCC8,s=G.state,D=h.context.Dynasty;
startDraft(h);finishDraft(h);selectManualXI(h);G.startSeason();h.timers.clear();
// Bounded synthetic render/route fixtures, not a played nineteen-season career.
const cases=[];
s.year=2026;s.round=14;s.regularSeasonPosition=8;s.champion=s.league.find(c=>c.abbr!==s.userClub.abbr);
for(const [i,c]of s.league.entries())Object.assign(s.table[c.abbr],{p:14,w:i,l:14-i,pts:i*2,nrr:i/10});
s.table[s.userClub.abbr].pts=-1;
X.read.archive();const first=s.dynasty.history[0];assert.equal(first.year,2026);assert(s.dynasty.archivedYears[2026]);
const before=JSON.stringify({history:s.dynasty.history,manager:s.dynasty.manager});X.read.archive();assert.equal(JSON.stringify({history:s.dynasty.history,manager:s.dynasty.manager}),before);
X.ui.view='review';const review=X.views.review();assert(review.includes('data-action="finishCareer"'));assert(!review.includes('data-action="offseason"'));
assert(X.dispatch('finishCareer'));assert.equal(X.ui.view,'legacy');assert.equal(s.year,2026);assert.equal(s.dynasty.offseason,null);assert(s.dynasty.careerClosed);
assert(X.dispatch('archive'));assert.equal(X.ui.view,'archive');assert(X.dispatch('archiveBack'));assert.equal(X.ui.view,'legacy');
cases.push('2026 review closes once; archive returns to legacy; no 2027 offseason');
// Long archive intentionally uses known saved record schema, with one legacy season lacking club detail.
s.dynasty.history=Array.from({length:19},(_,i)=>({...first,year:2008+i,userPlayerStats:i===0?undefined:{[s.xi[0]]:{matches:14,runs:150+i,wickets:3}}}));
let snapshot=JSON.stringify(s.dynasty.history),archive=X.views.archive();assert.equal((archive.match(/data-action="archiveSeason"/g)||[]).length,19);assert(archive.indexOf('2026')<archive.indexOf('2008'));assert.equal(JSON.stringify(s.dynasty.history),snapshot);assert(X.archiveSeasonBody(s.dynasty.history[0]).includes('No player records were saved for this season.'));assert(X.archiveSeasonBody(s.dynasty.history.at(-1)).includes('168'));
cases.push('19-season archive order and legacy empty-detail rendering are immutable');
// Direct offseason fixture isolates composition without running another season.
s.year=2010;s.dynasty.careerClosed=false;s.dynasty.offseason={phase:'market',retirements:[],arrivals:[],voluntaryCuts:[],finalCuts:[],lottery:[],returningIds:[...s.teams[s.userClub.abbr]]};X.ui.offseasonPane='overview';
const keepers=s.teams[s.userClub.abbr].map(G.byId).filter(X.R.isKeeper);assert(keepers.length);s.teams[s.userClub.abbr]=s.teams[s.userClub.abbr].filter(id=>!keepers.some(p=>p.id===id));
const market=X.offseasonMarket();assert(market.includes(`${keepers.length} ${keepers.length===1?'place':'places'} to fill`));assert(market.includes('No wicketkeeper retained'));assert(market.includes('data-action="reviewList"'));assert(!market.includes('data-action="keepSquad"'));
cases.push('vacant/no-keeper offseason presents draft route and explicit recruitment need');
assert.deepEqual(h.errors,[]);console.log(JSON.stringify({pass:true,file:process.env.GCC_FILE||'qa/perfection-20261030/candidate.html',fixture:'synthetic state after legal foundation draft; no season engine sweep or native visual verification',cases},null,2));
