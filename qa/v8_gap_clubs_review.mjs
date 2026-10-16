// Every actual catalog identity gets a naturally drawn club and a played season.
import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_gap_review.html',out=process.env.GCC8_GAP_DIR||'qa/gap-review',found=new Map();fs.mkdirSync(out,{recursive:true});let catalog=[];
for(let draw=0;draw<300;draw++){
 const seed=(Math.imul(draw+1234,2654435761)>>>0)%2000000000;
 const h=loadGame(file,seed,new Map(),{strictIds:true});catalog=h.context.GCC_DATA.clubs;
 for(const[a,args]of[['play',[]],['world',[]],['revealAll',[]],['clubs',[]]])assert.ok(h.context.GCC8.dispatch(a,args));
 for(const [index,c]of h.G.state.league.entries())if(!found.has(c.abbr))found.set(c.abbr,{abbr:c.abbr,name:c.name,seed,index});
 if(found.size===catalog.length)break;
}
assert.equal(found.size,catalog.length,'naturally drawn seeds cover all catalog clubs');const work=[...found.values()];fs.writeFileSync(out+'/club-plan.json',JSON.stringify(work,null,2)+'\n');let cursor=0;const results=[];
async function worker(){while(cursor<work.length){const c=work[cursor++],dir=out+'/all-clubs/'+c.abbr;fs.mkdirSync(dir,{recursive:true});const log=fs.openSync(dir+'/run.log','w');const code=await new Promise((resolve,reject)=>{const p=spawn(process.execPath,['qa/v8_game_test.mjs'],{env:{...process.env,GCC8_TEST_BUILD:file,GCC8_TEST_SEED:String(c.seed),GCC8_TEST_CLUB:String(c.index),GCC8_TEST_LAST_YEAR:'2008',GCC8_TEST_REPORT_DIR:dir,GCC8_TEST_SCOREBOOKS:'1'},stdio:['ignore',log,log]});p.on('error',reject);p.on('exit',resolve);});fs.closeSync(log);const r={...c,exit:code,result:code===0?JSON.parse(fs.readFileSync(dir+'/v8_smoke_results.json','utf8')):null};results.push(r);console.log(c.abbr,code);}}
await Promise.all([worker(),worker()]);const report={artifactSha256:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),scope:'Every catalog club naturally selected from a seeded world; actual foundation draft, manual XI, fourteen-match 2008 season, finals when qualified and cold reload. Not complete careers for every club or native presentation evidence.',catalogClubs:catalog.length,results:results.sort((a,b)=>a.abbr.localeCompare(b.abbr)),errors:results.filter(r=>r.exit!==0).map(r=>r.abbr)};fs.writeFileSync(out+'/all-clubs.json',JSON.stringify(report,null,2)+'\n');assert.ok(!report.errors.length);assert.ok(report.results.every(r=>r.result.club===r.abbr));
