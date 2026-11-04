import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true});startDraft(h);
const X=h.context.GCC8,s=h.G.state,p=s.pool.find(p=>p.name==='Ben Stokes');assert(p);s.year=p.dynastyCareer.debutYear;s.dynasty.developmentByYear={[s.year]:[{playerId:p.id,fromOverall:87,toOverall:65}]};
const before=JSON.stringify(s);assert(!X.playerRead(p).includes('Overall since last season'),'new arrival must not claim pre-entry development');assert.equal(JSON.stringify(s),before);
s.year++;s.dynasty.developmentByYear={[s.year]:[{playerId:p.id,fromOverall:65,toOverall:67}]};assert(X.playerRead(p).includes('Overall since last season'),'returning players keep development evidence');
console.log('PASS new-arrival comparison suppressed, returning comparison retained, render immutable');
