import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI,closeSeason} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();for(let i=0;i<14;i++){selectManualXI(h);h.G.playNextRound();}closeSeason(h);
const before=JSON.stringify(s),html=X.views.finals();assert.equal(JSON.stringify(s),before);assert(html.includes(s.champion.abbr===s.userClub.abbr?'gccuiTitleWon':'gccuiTitleDone'));assert(html.includes('Close the season'));assert.deepEqual(h.errors,[]);console.log('PASS completed-season finals presentation reflects actual winner and leaves state unchanged');
