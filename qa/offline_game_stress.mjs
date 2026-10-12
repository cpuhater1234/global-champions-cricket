import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadGame} from './offline_game_host.mjs';
import {foundation,assertRosters} from './offline_game_scenarios.mjs';
const file=process.argv[2]||'game/gcc_recovery_architecture_checkpoint.html';
const report={kind:'targeted manipulated-state functional stress',checks:[],failures:[],retirementScenarios:[]};
function check(name,fn){try{fn();report.checks.push(name)}catch(e){report.failures.push({name,error:e.message})}}
const base=foundation(loadGame(file,151)),saved=new Map(base.storage);
function fresh(){const h=loadGame(file,151,new Map(saved));h.context.Dynasty.resumeSave();assert.equal(h.errors.length,0);return h;}
for(const count of [0,1,2,3,4,5,7]){const h=fresh(),s=h.G.state,D=h.context.Dynasty;const mine=s.teams[s.userClub.abbr];for(const p of s.pool){if(p.dynastyCareer)p.dynastyCareer.exitYear=2026;}for(const id of mine.slice(0,count))s.pool.find(p=>p.id===id).dynastyCareer.exitYear=2008;D.beginOffseason();const o=s.dynasty.offseason;check(`${count} retirements removed`,()=>{assert.equal(o.retirements.filter(r=>r.owner===s.userClub.abbr).length,count);assert.equal(s.teams[s.userClub.abbr].length,15-count)});for(const id of [...s.teams[s.userClub.abbr]])D.releaseContractPlayer(id);check(`${count} retirements cap voluntary releases`,()=>assert.equal(o.voluntaryCuts.length,Math.max(0,4-count)));report.retirementScenarios.push({forced:count,controlled:o.voluntaryCuts.length,cap:Math.max(0,4-count)});D.drawDraftOrder();D.startAnnualDraft();let guard=0;while(o.phase==='draft'&&guard++<30){const used=new Set(Object.values(s.teams).flat()),p=s.pool.find(p=>p.available!==false&&!p.dynastyRetired&&!p.draftedBy&&!used.has(p.id));assert.ok(p);D.userAnnualDraft(p.id);}check(`${count} retirements draft restores unique lists`,()=>assertRosters(s));check(`${count} retirements user receives vacancy picks`,()=>assert.equal(o.picks.filter(p=>p.owner===s.userClub.abbr).length,o.draftNeeds[s.userClub.abbr]));console.log(`Retirement stress ${count} complete`);}
// Manipulated injuries isolate selection and replacement guards without relying on luck.
{const h=fresh(),G=h.G,D=h.context.Dynasty,s=G.state;G.startSeason();const xi=[...s.xi];s.xi[0]=s.xi[1];G.playNextRound();check('duplicate XI blocks match',()=>assert.equal(s.round,0));s.xi=[...xi];const id=xi[0];s.dynasty.injuries[id]={status:'OUT',roundsLeft:4,type:'test injury'};G.playNextRound();check('unavailable XI blocks match',()=>assert.equal(s.round,0));const injured=s.pool.find(p=>p.id===id),used=new Set(Object.values(s.teams).flat()),isKeeper=p=>(p.keeping||0)>=65||p.role==='WK-BAT',isBowler=p=>(p.bowl||0)>=58||(p.maxOvers||0)>=2||['AR','BOWL'].includes(p.role);const cover=s.pool.find(p=>p.available!==false&&!p.dynastyRetired&&!used.has(p.id)&&(isKeeper(injured)?isKeeper(p):isBowler(injured)?isBowler(p):!isBowler(p)||p.role===injured.role));assert.ok(cover);D.signReplacement(id,cover.id);check('injury cover registers both directions',()=>{assert.equal(s.dynasty.replacementFor[id],cover.id);assert.equal(s.dynasty.replacementOf[cover.id],id);assert.ok(s.teams[s.userClub.abbr].includes(cover.id));assert.ok(cover.dynastyReplacement)});const count=s.teams[s.userClub.abbr].length;D.signReplacement(id,cover.id);check('duplicate replacement signing cannot enlarge list',()=>assert.equal(s.teams[s.userClub.abbr].length,count));check('injury scenario has no console errors',()=>assert.equal(h.errors.length,0));}
const h=fresh(),s=h.G.state,D=h.context.Dynasty,club=s.league.find(c=>c.abbr!==s.userClub.abbr).abbr;
D.openTradeCentre(false);h.get('tradeClub').value=club;D.refreshTradeTarget();h.get('tradeTarget').value=String(s.teams[club][0]);h.get('tradeOffer').value='-1';
const original=JSON.stringify(s.teams);D.proposeTrade(false);check('invalid offer cannot mutate rosters',()=>assert.equal(JSON.stringify(s.teams),original));
D.beginOffseason();D.drawDraftOrder();
// A zero-vacancy club cannot spend a fictional pick, even in an otherwise attractive offer.
const beforeInvalidPick=JSON.stringify(s.teams);
for(const targetId of [...s.teams[club]])for(const offerId of [...s.teams[s.userClub.abbr]]){
 h.get('tradeClub').value=club;h.get('tradeTarget').value=String(targetId);h.get('tradeOffer').value=String(offerId);h.get('tradePick').value='R1';D.proposeTrade(false);
}
check('zero-vacancy pick rejected without roster mutation',()=>assert.equal(JSON.stringify(s.teams),beforeInvalidPick));
check('zero-vacancy pick ownership unchanged',()=>assert.equal(s.dynasty.offseason.pickOwners['R1:'+s.userClub.abbr],s.userClub.abbr));
check('no game console errors in trading',()=>assert.equal(h.errors.length,0));
// Contrast the zero-vacancy defect with a genuinely available first-round pick.
{const h=fresh(),s=h.G.state,D=h.context.Dynasty,user=s.userClub.abbr,club=s.league.find(c=>c.abbr!==user).abbr;
 s.pool.find(p=>p.id===s.teams[user][0]).dynastyCareer.exitYear=2008;
 D.beginOffseason();D.drawDraftOrder();D.openTradeCentre(false);let accepted=false;
 outer:for(const target of [...s.teams[club]])for(const offer of [...s.teams[user]]){
  h.get('tradeClub').value=club;h.get('tradeTarget').value=String(target);h.get('tradeOffer').value=String(offer);h.get('tradePick').value='R1';const before=JSON.stringify(s.teams);D.proposeTrade(false);if(JSON.stringify(s.teams)!==before){accepted=true;break outer;}
 }
 check('valid vacancy pick trade is accepted',()=>assert.ok(accepted));
 if(accepted){const before=JSON.stringify(s.teams);h.get('tradeTarget').value=String(s.teams[club][0]);h.get('tradeOffer').value=String(s.teams[user][0]);D.proposeTrade(false);check('traded draft pick cannot be spent twice',()=>assert.equal(JSON.stringify(s.teams),before));}
 if(accepted){D.startAnnualDraft();const o=s.dynasty.offseason;
  check('real first-round pick is exercised by acquiring club',()=>{assert.equal(o.draftNeeds[user],1);assert.equal(o.picks.length,1);assert.equal(o.picks[0].owner,club);assert.equal(o.picks[0].round,1);assert.ok(o.picks[0].playerId)});
  check('transferred pick stops on human supplementary choice',()=>{assert.equal(o.phase,'draft');assert.equal(s.teams[user].length,14);});
  const used=new Set(Object.values(s.teams).flat()),p=s.pool.find(p=>p.available!==false&&!p.dynastyRetired&&!p.draftedBy&&!used.has(p.id));assert.ok(p);D.userAnnualDraft(p.id);
  check('supplementary choice belongs to user',()=>assert.equal(o.picks.at(-1).owner,user));
  check('valid pick trade ends with 15 unique players per club',()=>assertRosters(s));D.finishOffseason();report.validPickTrade={userClub:user,acquiringClub:club,rosterSizes:Object.fromEntries(s.league.map(c=>[c.abbr,s.teams[c.abbr].length])),phaseAfterFinish:o.phase};check('supplementary choice unlocks lodged list',()=>assert.equal(o.phase,'ready'));
 }
 check('valid pick scenario has no console errors',()=>assert.equal(h.errors.length,0));
}
fs.writeFileSync(process.argv[3]||'qa/offline_game_stress_results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(report.failures.length)process.exitCode=1;
