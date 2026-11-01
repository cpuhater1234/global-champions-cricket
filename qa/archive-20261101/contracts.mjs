import assert from 'node:assert/strict';import {loadGame}from'../offline_game_host.mjs';
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8;
assert.equal(typeof X.archiveSeasonBody,'function');
const record={year:2011,wins:6,losses:8,userPosition:6,userPlayerStats:{1:{matches:14,runs:360,wickets:9},2:{matches:14,runs:231,wickets:0}}},before=JSON.stringify(record),html=X.archiveSeasonBody(record);
assert(html.includes('<caption>2011 · Club player records</caption>'));assert.equal((html.match(/scope="col"/g)||[]).length,4);assert.equal((html.match(/scope="row"/g)||[]).length,2);assert(html.indexOf('360')<html.indexOf('231'));assert.equal(JSON.stringify(record),before,'archive rendering does not mutate saved records');
assert(X.archiveSeasonBody({...record,userPlayerStats:{}}).includes('No player records were saved for this season.'));assert.deepEqual(h.errors,[]);console.log('PASS: archive table caption, headers, order, empty state and immutable records');
