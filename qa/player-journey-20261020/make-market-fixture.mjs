import fs from 'node:fs';import {loadGame} from '../offline_game_host.mjs';import assert from 'node:assert/strict';
const h=loadGame(process.env.GCC8_TEST_BUILD||'game/gcc_v8_player_journey.html',20261020,new Map([['gcc_dynasty_v8',fs.readFileSync('qa/stabilisation/fixtures/foundation.json','utf8')]])),X=h.context.GCC8;
assert(X.dispatch('continue'));assert(X.dispatch('offseason'));assert.equal(h.G.state.dynasty.offseason.arrivals.length,14);assert(X.dispatch('home'));fs.writeFileSync('qa/player-journey-20261020/market-fixture.json',h.storage.get('gcc_dynasty_v8'));
console.log({seed:20261020,year:h.G.state.year,arrivals:14,scope:'Actual offseason transition from the existing completed-2008 fixture, using the VM host; no invented arrivals.'});
