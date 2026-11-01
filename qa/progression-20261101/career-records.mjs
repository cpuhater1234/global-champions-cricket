import assert from 'node:assert/strict';import fs from 'node:fs';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI,closeSeason} from '../club-expansion-20261027/helpers.mjs';
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();
assert.equal(typeof X.playerCareerRecord,'function','career aggregation is available');
for(let i=0;i<14;i++){selectManualXI(h);h.G.playNextRound();}
const p=s.pool.find(p=>s.playerSeasonStats[p.id]?.matches>=10),before={...s.playerSeasonStats[p.id]};
let c=X.playerCareerRecord(p);assert.equal(c.totals.runs,before.runs);assert.equal(c.totals.matches,before.matches);
closeSeason(h);const archive=s.dynasty.history.find(r=>r.year===2008),t=archive.playerStats[p.id];
c=X.playerCareerRecord(p);assert.equal(c.totals.runs,t.runs,'archived current season counted once');assert.equal(c.totals.matches,t.matches);
h.context.Dynasty.beginOffseason();
c=X.playerCareerRecord(p);assert.equal(c.totals.runs,t.runs,'archived totals survive new season');assert.equal(c.latest.year,2008);
const D=h.context.Dynasty;D.drawDraftOrder();D.startAnnualDraft();
for(let guard=0;s.dynasty.offseason.phase==='draft'&&guard<160;guard++){
 D.runCpuDraftUntilUser(true);if(s.dynasty.offseason.phase!=='draft')break;
 const mine=X.roster(),pool=X.pool(true),legal=h.context.GCC8_DRAFT_GUARD.candidates(mine,pool,15-mine.length,X.R);assert(legal.length);D.userAnnualDraft(legal[0].id);
}
assert.equal(s.dynasty.offseason.phase,'cuts');D.finishOffseason();D.enterTeamRoom();h.timers.clear();selectManualXI(h);h.G.startSeason();h.G.playNextRound();
const current=s.playerSeasonStats[p.id]||{runs:0,matches:0};c=X.playerCareerRecord(p);assert.equal(c.totals.runs,t.runs+current.runs);assert.equal(c.totals.matches,t.matches+current.matches);
const q=s.pool.find(q=>Number(s.playerSeasonStats[q.id]?.runs)>0&&Number(archive.playerStats[q.id]?.runs)>0);assert(q,'player with runs in both years');const qExpected=archive.playerStats[q.id].runs+s.playerSeasonStats[q.id].runs;assert.equal(X.playerCareerRecord(q).totals.runs,qExpected);assert.equal(X.playerCareerRecord({id:-1}).latest,null);assert(X.playerRecord(q).includes('GCC career'));
const raw=X.read.backupRaw(),copy=loadGame('qa/perfection-20261030/candidate.html',909,new Map(),{strictIds:true});assert(copy.context.GCC8.read.restoreBackup(raw));assert.equal(copy.context.GCC8.playerCareerRecord(copy.G.byId(p.id)).totals.runs,t.runs+current.runs);
assert.equal(copy.context.GCC8.playerCareerRecord(copy.G.byId(q.id)).totals.runs,qExpected);
assert.deepEqual(h.errors,[]);assert.deepEqual(copy.errors,[]);
const report={pass:true,player:p.name,archivedSeasonRuns:t.runs,careerRunsWithCurrent:t.runs+current.runs,crossYearExample:{player:q.name,previous:archive.playerStats[q.id].runs,current:s.playerSeasonStats[q.id].runs,total:qExpected},checks:['live match totals','archive current-year deduplication','season boundary','current plus archived totals','save restore']};fs.writeFileSync('qa/progression-20261101/records.json',JSON.stringify(report,null,2));console.log(report);
