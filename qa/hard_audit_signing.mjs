import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadGame} from './offline_game_host.mjs';
const file=process.argv[2]||'game/global_champions_cricket_v7_9_2_audited_candidate.html',report={source:file,checks:[],failures:[],scope:'Real signing functions and selected queued callbacks; no browser rendering.'};
const check=(name,fn)=>{try{fn();report.checks.push(name);}catch(e){report.failures.push({name,error:e.message});}};
function start(){const h=loadGame(file,151,new Map(),{strictIds:true}),G=h.G;G.newWorld();G.skipLeagueReveal();G.finishLeagueReveal();G.selectClub(0);G.confirmClub();return h;}
function tick(h){const r=h.G.state.recruit,id=r.timer,t=h.timers.get(id);assert.ok(t);h.timers.delete(id);t.fn();}
const h=start(),G=h.G,s=G.state;G.runRecruitment();
check('running signing exposes enabled Pause action',()=>{assert.equal(s.recruit.running,true);assert.equal(h.get('runRecruit').disabled,false);assert.equal(h.get('runRecruit').textContent,'PAUSE SIGNING WINDOW');});
tick(h);const queue=JSON.stringify(s.recruit.queue),feed=s.recruit.feed.length,stale=h.timers.get(s.recruit.timer);
G.runRecruitment();check('Pause cancels signing timer and retains pending calls',()=>{assert.equal(s.recruit.running,false);assert.equal(s.recruit.timer,null);assert.equal(JSON.stringify(s.recruit.queue),queue);assert.equal(h.get('runRecruit').textContent,'RESUME SIGNING WINDOW');});
stale.fn();check('already-queued callback cannot progress while paused',()=>{assert.equal(s.recruit.feed.length,feed);assert.equal(JSON.stringify(s.recruit.queue),queue);});
const restored=loadGame(file,151,new Map(h.storage),{strictIds:true});restored.context.Dynasty.resumeSave();check('paused signing restores pending calls unchanged',()=>{assert.equal(restored.G.state.recruit.running,false);assert.equal(JSON.stringify(restored.G.state.recruit.queue),queue);});
G.runRecruitment();while(!s.recruit.betweenDays&&!s.recruit.complete)tick(h);
check('end of day waits for the following day',()=>{assert.equal(s.recruit.day,1);assert.equal(s.recruit.betweenDays,true);});
G.runRecruitment();const betweenSave=loadGame(file,151,new Map(h.storage),{strictIds:true});betweenSave.context.Dynasty.resumeSave();betweenSave.G.runRecruitment();
check('saved day boundary resumes into next day exactly once',()=>{assert.equal(betweenSave.G.state.recruit.day,2);assert.equal(betweenSave.G.state.recruit.feed.filter(x=>x.title==='Day 1 complete').length,1);});
G.runRecruitment();check('in-memory day boundary resumes into next day',()=>{assert.equal(s.recruit.day,2);assert.equal(s.recruit.betweenDays,false);});
G.skipRecruitment();const direct=start();direct.G.skipRecruitment();
check('Pause Resume and Skip preserve the final signing pool',()=>assert.equal(JSON.stringify(s.pool.map(p=>[p.id,p.available])),JSON.stringify(direct.G.state.pool.map(p=>[p.id,p.available]))));
check('completed window disables progression controls',()=>{assert.equal(h.get('runRecruit').disabled,true);assert.equal(h.get('speedRecruit').disabled,true);assert.equal(h.get('skipRecruit').disabled,true);});
check('signing scenarios have no console errors',()=>{assert.equal(h.errors.length,0);assert.equal(restored.errors.length,0);assert.equal(betweenSave.errors.length,0);});
fs.writeFileSync(process.argv[3]||'qa/v792_signing_results.json',JSON.stringify(report,null,2)+'\n');console.log(`${report.checks.length} passed; ${report.failures.length} failed`);if(report.failures.length){console.log(report.failures);process.exitCode=1;}
