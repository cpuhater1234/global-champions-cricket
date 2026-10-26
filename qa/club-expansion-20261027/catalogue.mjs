import fs from 'node:fs';
import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/gcc_v8_product_candidate.html';
const h=loadGame(file,101,new Map(),{strictIds:true}),c=h.context,clubs=c.GCC_DATA.clubs;
const expectedIPL=['CSK','MI','RR','KKR','RCB','DC','PBKS','SRH','GT','LSG'];
const expectedCounties=['SUR','LAN','YOR','NOT','SOM','HAM','DER','DUR','ESS','GLA','GLO','KEN','LEI','MID','NOR','SUS','WAR','WOR'];
assert.equal(clubs.length,36,'Complete catalogue has36 clubs');
assert.deepEqual(Array.from(clubs.filter(x=>x.league==='IPL'),x=>x.abbr).sort(),expectedIPL.sort(),'All10IPL clubs exactly once');
assert.deepEqual(Array.from(clubs.filter(x=>x.league==='Vitality Blast'),x=>x.abbr).sort(),expectedCounties.sort(),'All18 counties exactly once');
assert.equal(clubs.filter(x=>x.region==='Australia').length,8);
assert.equal(new Set(clubs.map(x=>x.abbr)).size,36);
const old=JSON.parse(fs.readFileSync('qa/club-expansion-20261027/original-clubs.json','utf8'));
for(const club of old)assert.deepEqual(JSON.parse(JSON.stringify(clubs.find(x=>x.abbr===club.abbr))),club,'Existing club preserved '+club.abbr);
assert.equal(c.GCC_DATA.clubCount,8);assert.equal(c.GCC_DATA.squadSize,15);assert.equal(c.GCC_DATA.seasonStart,2008);assert.equal(c.GCC_DATA.seasonEnd,2026);
for(const club of clubs){assert(club.name&&club.ground&&club.trait);for(const key of ['c','a','t'])assert.match(club[key],/^#[0-9a-f]{6}$/i);for(const[k,lo,hi]of[['pace',-1,6],['spin',-2,5],['boundary',-5,6]])assert(Number.isFinite(club.conditions[k])&&club.conditions[k]>=lo&&club.conditions[k]<=hi,club.abbr+' '+k);const media=c.GCC8_MEDIA.venues[club.abbr];assert(media?.dataUrl?.startsWith('data:image/'),'Offline actual-ground photograph '+club.abbr);assert(media.author&&media.source&&(media.licence==='PD'||media.licenceUrl),'Photo provenance '+club.abbr);assert(c.GCC8.clubStory(club).city!==club.region,'Specific club identity '+club.abbr);}
const glamorgan=clubs.find(x=>x.abbr==='GLA');assert.match(c.GCC8.clubBrief(glamorgan),/Wales/);assert(!c.GCC8.clubBrief(glamorgan).includes('<span>England</span>'),'Glamorgan geography saysWales');
assert.deepEqual(h.errors,[]);console.log('PASS36clubs:10IPL,8BBL,18counties; original20unchanged;36offlinephotos; identities,conditions,colours andWelshgeography');
