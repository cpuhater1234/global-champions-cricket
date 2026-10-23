import assert from 'node:assert/strict';
import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/gcc_v8_mobile_clarity.html';
let checks=0;
for(const seed of [773,20261020])for(const mode of ['skip','paced']){
 const h=loadGame(file,seed),X=h.context.GCC8,s=h.G.state;
 for(const [a,args] of [['play',[]],['world',[]],['revealAll',[]],['clubs',[]],['club',[0]],['confirmClub',[]]])assert(X.dispatch(a,args),a);
 assert(X.dispatch(mode==='skip'?'signingSkip':'signingRun'));
 for(let i=0;!s.recruit.complete&&i<2000;i++)h.advance(100000);
 assert(s.recruit.complete,'signing window completes');
 const eligible=s.pool.filter(p=>(p.dynastyCareer?.debutYear??2008)<=2008);
 const future=s.pool.filter(p=>(p.dynastyCareer?.debutYear??2008)>2008);
 const signed=eligible.filter(p=>p.available===true).length,declined=eligible.filter(p=>p.available===false).length;
 assert(future.length>0,'fixture has future debutants');
 assert.equal(signed+declined,eligible.length,'all eligible players decided');
 assert(future.every(p=>p.available===false),'future debutants remain outside inaugural draft');
 const summary=s.recruit.feed.find(f=>f.title==='Signing window closed');
 const expected=`${signed} players entered the GCC draft pool. ${declined} declined.`;
 assert.equal(summary.text,expected,'stored closing summary excludes future debutants');
 assert(X.signingLive().includes(expected),'wire agrees with eligible pool');
 assert(X.signingLive().includes(`<strong>${signed}</strong><span>Committed to GCC</span>`)&&X.signingLive().includes(`<strong>${declined}</strong><span>Declined the invitation</span>`),'labelled header counts agree with wire');
 // An old completed save can contain the original inflated event text.
 summary.text=`${signed} players entered the GCC draft pool. ${s.pool.length-signed} declined.`;
 const before=JSON.stringify(s.pool),oldText=summary.text;
 assert(X.signingLive().includes(expected),'legacy completed feed displays corrected count');
 assert.equal(summary.text,oldText,'render does not rewrite historical save');
 assert.equal(JSON.stringify(s.pool),before,'render never changes availability or player state');
 assert.equal(h.errors.length,0);
 checks+=12;
}
console.log({checks,scope:'Two worlds, skipped and paced completion; eligible accounting, header/wire agreement and old completed feed display. VM, not visual QA.'});

