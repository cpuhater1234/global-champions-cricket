import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'/tmp/career-base.html';
const start=()=>{const h=loadGame(file,101,new Map(),{strictIds:true}),X=h.context.GCC8;assert(X.dispatch('play'));assert(X.dispatch('world'));h.context.GCC8_CLOCK.pause();return {h,X};};
{const {X}=start();assert(X.dispatch('revealAll'));assert.equal(X.ui.view,'clubs','Reveal all goes straight to club selection');assert.equal(X.G.state.userClub,null);assert.equal(X.G.state.league.length,8);assert(!X.views.leagueDraw().includes('data-action="clubs"'),'obsolete choose button absent');assert(X.dispatch('club',[0]));assert.equal(X.G.state.userClub,null);assert(X.dispatch('confirmClub'));assert.equal(X.ui.view,'recruit','club still explicitly confirmed');assert(X.dispatch('signingSkip'));assert(X.dispatch('draftDraw'));assert(X.dispatch('revealAll'));assert.equal(X.ui.view,'draftDraw','draft draw confirmation remains');}
{const {X}=start();for(let i=0;i<7;i++){assert(X.dispatch('revealClub'));assert.equal(X.ui.view,'leagueDraw');}assert(X.dispatch('revealClub'));assert.equal(X.ui.view,'clubs','manual eighth club completes reveal');}
console.log('PASS club flow: skip/manual completion, explicit team confirmation, unchanged draft draw');

{const {h,X}=start();X.G.state.dynasty.v8Reveal={kind:'league',year:2008,count:8,running:false,speedIndex:0};const raw=X.read.backupRaw();const restored=loadGame(file,101,new Map([['gcc_dynasty_v8',raw]]),{strictIds:true});assert(restored.context.GCC8.dispatch('continue'));assert.equal(restored.context.GCC8.ui.view,'clubs','restored completed reveal advances to club selection');}
console.log('PASS restored completed reveal');
