import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';import {fixturePath} from './v8_fixture_paths.mjs';
const build=process.env.GCC8_TEST_BUILD||'game/gcc_v8_stabilised.html';
const foundation=process.env.GCC8_FOUNDATION_SAVE||'qa/stabilisation/foundation/v8_final_save.json';
const careers=process.env.GCC8_CAREER_FIXTURES||'qa/stabilisation/full-career';
const partial=process.argv.includes('--available');
const host=loadGame(build,101),parse=host.context.GCC8_SAVE_CODEC.parse,hash=x=>crypto.createHash('sha256').update(x).digest('hex'),records=[];
function write(kind,source,year){const raw=fs.readFileSync(source,'utf8'),save=parse(raw);assert.equal(save.state.year,year,'fixture year');assert.equal(save.state.round,14,'completed league season');assert(save.state.dynasty.history.some(h=>h.year===year),'season archived');assert(!save.state.finals||save.state.finals.stage==='done','finals completed');const destination=fixturePath(kind,year),bytes=JSON.stringify(save);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);records.push({kind,year,club:save.state.userClub.abbr,source,sourceSha256:hash(raw),destination,sha256:hash(bytes)});return save;}
write('foundation',foundation,2008);
if(!process.argv.includes('--foundation-only')){
 let tied=false,chased=false;
 for(const year of [2009,2019,2025,2026]){const source=path.join(careers,`checkpoint-${year}.json`);if(partial&&!fs.existsSync(source))continue;write('career',source,year);}
 for(let year=2009;year<=2026&&(!tied||!chased);year++){
  const source=path.join(careers,`checkpoint-${year}.json`);if(!fs.existsSync(source))continue;
  const save=parse(fs.readFileSync(source,'utf8'));
  if(!tied&&save.state.results.some(r=>r.superOver)){write('tie',source,year);tied=true;}
  const own=save.state.userClub.abbr;if(!chased&&save.state.results.some(r=>r.winner.abbr===own&&r.battingSecond.abbr===own&&(r.home.abbr===own?r.homeInnings:r.awayInnings).death===0)){write('chase',source,year);chased=true;}
 }
 const tieSource=process.env.GCC8_TIE_SAVE||'qa/stabilisation/tie-fixture/v8_final_save.json';
 if(!tied&&fs.existsSync(tieSource)){const save=parse(fs.readFileSync(tieSource,'utf8'));assert(save.state.results.some(r=>r.superOver),'Explicit tie fixture must contain an actual tied league match');write('tie',tieSource,save.state.year);tied=true;}
 if(!partial)assert(chased,'No early-chase win in this career: generate an additional real completed fixture.');
 if(!partial)assert(tied,'No naturally tied match in this career: generate an additional real-career fixture for the tie suite.');
}
fs.writeFileSync(path.join(path.dirname(fixturePath('foundation')),'manifest.json'),JSON.stringify({candidate:build,consumerArtifactSha256:hash(fs.readFileSync(build)),producerArtifactSha256:process.env.GCC8_FIXTURE_PRODUCER_SHA256||null,generatedAt:new Date().toISOString(),complete:!partial&&!process.argv.includes('--foundation-only'),records},null,2)+'\n');console.log('Prepared '+records.length+' provenance-recorded fixtures.');
