import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI,closeSeason} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame(process.env.GCC_FILE||'qa/perfection-20261030/candidate.html',101),X=h.context.GCC8,s=h.G.state,clock=h.context.GCC8_CLOCK;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();
for(let i=0;i<14;i++){selectManualXI(h);h.G.playNextRound();}
closeSeason(h);h.context.Dynasty.beginOffseason();X.ui.view='dynasty';
assert(X.dispatch('annualDraw'));assert.equal(X.ui.reveal.count,0);
const report=label=>console.log(JSON.stringify({label,view:X.ui.view,count:X.ui.reveal.count,running:X.ui.reveal.running,clockPending:clock.pending,nativeTimers:h.timers.size}));
report('draw');
assert(X.dispatch('archive'));assert(X.dispatch('archiveBack'));
for(let i=0;i<4&&X.ui.reveal.count===0;i++)h.advance(1600);
assert(X.ui.reveal.count>0,'immediate archive return preserves progress');report('immediate return progressed');
assert(X.dispatch('archive'));for(let i=0;i<5;i++)h.advance(1600);report('archive after timer');
assert(X.dispatch('archiveBack'));const count=X.ui.reveal.count;report('delayed return');
for(let i=0;i<5;i++)h.advance(1600);report('delayed return after wait');
assert.equal(h.errors.length,0);
assert(X.ui.reveal.count>count,'annual reveal must resume progress after delayed archive return');
console.log('PASS: immediate and delayed archive returns preserve annual reveal progress');
