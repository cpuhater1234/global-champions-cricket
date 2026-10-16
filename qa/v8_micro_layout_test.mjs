import fs from 'node:fs';import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';
const snapshots={};
const file=process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_gap_review.html';
const h=loadGame(file,909,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};
for(const [a,...args] of [['play'],['world'],['revealAll'],['clubs'],['club',4],['confirmClub'],['signingSkip'],['draftDraw'],['revealAll'],['beginDraft']])check(X.dispatch(a,args),a);
for(let i=0;i<3;i++){check(X.dispatch('skipPick'),'reach own pick');check(X.dispatch('draftPlayer',[X.pool(false)[0].id]),'add real player');}
const before=JSON.stringify({teams:s.teams,picks:s.picks,seed:s.seed});
check(X.dispatch('draftDetail',['analysis']),'squad analysis opens a dedicated dialog');
check(h.get('g8dialogContent').innerHTML.includes('g8roleboard'),'full analysis available');snapshots.analysis={stage:'',hud:'',dialog:h.get('g8dialogContent').innerHTML};check(h.context.GCC8_CLOCK.paused,'detail pauses CPU draft');check(X.dispatch('close'),'close analysis');
check(X.dispatch('draftDetail',['picks']),'recent picks dialog opens');check(h.get('g8dialogContent').innerHTML.includes('Recent picks'),'recent picks heading');snapshots.picks={stage:'',hud:'',dialog:h.get('g8dialogContent').innerHTML};check(X.dispatch('close'),'close picks');
check(!X.dispatch('draftDetail',['invalid']),'invalid detail rejected');check(JSON.stringify({teams:s.teams,picks:s.picks,seed:s.seed})===before,'detail navigation leaves cricket state intact');
const draft=X.views.draft();check(!draft.includes('<details class="g8moredata"><summary>Squad analysis'),'analysis no longer stacked in narrow sidebar');
const squad=X.squadRoster();for(const p of X.roster())check(squad.includes(X.esc(p.name)),'every squad name present: '+p.name);
const shell=fs.readFileSync('v8/ui/shell.html','utf8');check(shell.indexOf('id="g8feedback"')<shell.indexOf('id="g8stage"'),'page feedback is near the active screen header');
const css=fs.readFileSync('v8/ui/game.css','utf8');check(!/\.g8draftroster\{[^}]*height:\s*\d+px/.test(css),'no fixed-height nested roster scroll');
check(css.includes('minmax(min(100%,240px),1fr)'),'phase labels get usable track width');check(css.includes('.g8read>span{overflow-wrap:normal;word-break:normal}'),'cricket words stay intact');
check(!/#g8feedback\{[^}]*position:fixed/.test(css),'feedback cannot float over home controls');
check(css.includes('grid-template-rows:repeat(6,auto);grid-auto-flow:column'),'wide batting order uses two numbered columns');
const annual=loadGame(file,818,new Map([['gcc_dynasty_v8',fs.readFileSync('qa/extensive/clubs/0/v8_smoke_save.json','utf8')]]),{strictIds:true}),Y=annual.context.GCC8;
check(Y.dispatch('continue'),'resume annual fixture');
for(const p of Y.roster())check(Y.squadRoster().includes(Y.esc(p.name)),'complete fifteen visible in roster markup');
check((Y.views.team().match(/class="g8slot"/g)||[]).length===11,'all eleven order slots rendered');
check(Y.dispatch('offseason'),'enter offseason');for(const c of annual.G.state.league){for(let i=0;i<2;i++){const id=annual.G.state.teams[c.abbr].pop();annual.G.byId(id).draftedBy=null;}}
for(const a of ['annualDraw','revealAll','annualDraft'])check(Y.dispatch(a),a);
check(Y.dispatch('draftDetail',['analysis']),'annual squad analysis');snapshots.annualAnalysis={stage:'',hud:'',dialog:annual.get('g8dialogContent').innerHTML};check(annual.context.GCC8_CLOCK.paused,'annual detail pauses draft');check(Y.dispatch('close'),'close annual detail');
check(Y.dispatch('draftDetail',['picks']),'annual recent picks');check(annual.get('g8dialogContent').innerHTML.includes('No selections yet'),'annual pick history starts empty');snapshots.annualPicks={stage:'',hud:'',dialog:annual.get('g8dialogContent').innerHTML};check(Y.dispatch('close'),'close annual picks');
check(!annual.errors.length,'annual has no unexpected script errors');
check(!h.errors.length,'no unexpected script errors');fs.writeFileSync('qa/micro-layout/detail_snapshot.json',JSON.stringify(snapshots));console.log(JSON.stringify({checks,scope:'VM controls, complete roster markup and CSS contracts; no rendered geometry'}));
