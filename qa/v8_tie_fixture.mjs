// Find a tied result through actual play commands, then finish that season.
// Only the test's initial match RNG seed varies; no score or statistic is fabricated.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';import {fixturePath} from './v8_fixture_paths.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/gcc_v8_stabilised.html',out=process.env.GCC8_TIE_FIXTURE_DIR||'qa/stabilisation/tie-fixture',hash=s=>crypto.createHash('sha256').update(s).digest('hex');fs.mkdirSync(out,{recursive:true});
const foundation=fs.readFileSync(fixturePath('foundation'),'utf8');let h=loadGame(file,101,new Map([['gcc_dynasty_v8',foundation]]),{strictIds:true}),tries=0;
const X=()=>h.context.GCC8,S=()=>h.G.state,call=(name,...args)=>assert(X().dispatch(name,args),name+': '+h.get('g8feedback').textContent);
function xi(){let fit=X().roster().filter(p=>S().dynasty.injuries[p.id]?.status!=='OUT');while(fit.length<11){const p=X().roster().find(p=>S().dynasty.injuries[p.id]?.status==='OUT'&&!S().dynasty.replacementFor[p.id]&&X().read.replacements(p.id).length);assert(p,'available cover');call('cover',p.id);call('signCover',X().read.replacements(p.id)[0]);fit=X().roster().filter(p=>S().dynasty.injuries[p.id]?.status!=='OUT');}call('clearXI');for(const p of h.G.bestXI(fit))call('select',p.id);call('lodge');}
call('continue');call('offseason');call('annualDraw');call('revealAll');call('annualDraft');
while(S().dynasty.offseason?.phase==='draft'){call('skipPick');if(!S().dynasty.offseason)break;const rs=X().roster(),pool=X().pool(true),p=pool.find(p=>X().R.isKeeper(p)&&!rs.some(X().R.isKeeper))||pool.find(p=>p.maxOvers>=4&&rs.filter(q=>q.maxOvers>=4).length<6)||pool[0];call('draftPlayer',p.id);}
call('close');xi();const prepared=h.storage.get('gcc_dynasty_v8');let found=false,seed;
for(seed=Number(process.env.GCC8_TIE_START_SEED||1);seed<=1000;seed++){
 h=loadGame(file,101,new Map([['gcc_dynasty_v8',prepared]]),{strictIds:true});call('continue');S().seed=seed;call('prepare');call('playMatch',1);call('matchSkip');tries++;
 if(S().results[0].superOver){found=true;console.log('Actual round-one tie found at seed',seed);break;}if(seed%25===0)console.log('Tested',seed,'actual round-one seeds');
}
assert(found,'No tied round-one result found within 1,000 seeded fixtures');
for(let round=2;round<=14;round++){call('matchday');if(X().read.xiProblem()){call('editXI');xi();}call('prepare');call('playMatch',round);call('matchSkip');}
call('matchday');call('postSeason');if(X().ui.view==='team'){xi();call('postSeason');}
if(X().ui.view==='finals'){call('simulateFinals');call('matchSkip');call('advanceFinals');if([S().finals.gfPair.home.abbr,S().finals.gfPair.away.abbr].includes(S().userClub.abbr)&&X().read.xiProblem()){call('editXI','finals');xi();}call('simulateFinals');call('matchSkip');call('review');}
assert.equal(X().ui.view,'review');assert(S().dynasty.history.some(r=>r.year===S().year));assert(!h.errors.length);assert(S().results[0].superOver);
const raw=h.storage.get('gcc_dynasty_v8'),save=h.context.GCC8_SAVE_CODEC.parse(raw);fs.writeFileSync(path.join(out,'v8_final_save.json'),raw);fs.writeFileSync(fixturePath('tie'),JSON.stringify(save));
const report={artifactSha256:hash(fs.readFileSync(file)),foundationSha256:hash(foundation),year:S().year,seed,tries,regularSeasonMatches:14,scope:'Actual UI/model round-one seed search followed by the remaining thirteen matches and finals through archived review. No invented score/stat data; this is a controlled RNG fixture, not a random career sample.',saveSha256:hash(raw),errors:h.errors};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(report);
