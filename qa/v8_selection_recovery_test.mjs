import assert from 'node:assert/strict';import fs from 'node:fs';import {loadGame} from './offline_game_host.mjs';
const h=loadGame(process.env.GCC8_TEST_BUILD||'game/gcc_v8_rendering_clarity.html',101,new Map([['gcc_dynasty_v8',fs.readFileSync('qa/stabilisation/fixtures/foundation.json','utf8')]]),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
assert(X.dispatch('continue'));X.G.go('team');X.ui.view='team';X.ui.teamPane='xi';X.render();
X.ui.teamPane=undefined;assert(X.dispatch('clearXI'));assert.equal(s.xi.length,0);assert.equal(X.ui.teamPane,'squad','clearing the XI returns narrow-screen players to the available squad');
assert(X.views.team().includes('Select 11 players from your squad.'),'empty XI names the immediate action');
X.ui.teamPane=undefined;for(const p of X.roster().filter(p=>p.role!=='WK-BAT').slice(0,11)){assert(X.dispatch('select',[p.id]));assert.equal(X.ui.teamPane,s.xi.length===11?'xi':'squad','squad remains visible until selection is complete');}
assert(X.views.team().includes('Keeper needed'),'full XI makes keeper weakness explicit before lodging');
assert(X.views.team().includes('Select a name to edit batting order.'),'complete XI retains order instructions');
console.log('Selection recovery: all assertions passed; no geometry claim.');
