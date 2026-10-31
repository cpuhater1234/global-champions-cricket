import fs from 'node:fs';import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
const file='qa/perfection-20261030/candidate.html',html=fs.readFileSync(file,'utf8'),controller=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)][19][1];
assert.doesNotMatch(controller,/Download a backup|download a backup|downloadBackup|loadBackup|confirmBackup|careerBackup/,'no backup prompts or file controls in controller');
function boot(path){const h=loadGame(path,101,new Map(),{strictIds:true});startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();return h;}
const a=boot('qa/perfection-20261030/toss-parity-base.html'),b=boot(file),X=b.context.GCC8;const choices=new Set();
for(let n=0;n<14;n++){a.G.playNextRound();b.G.playNextRound();const old=a.G.state.results.at(-1),r=b.G.state.results.at(-1);assert(r.toss,'match records a toss');assert([r.home.abbr,r.away.abbr].includes(r.toss.winner));assert(['bat','bowl'].includes(r.toss.decision));const first=r.battingFirst.abbr;assert.equal(r.toss.winner===first,r.toss.decision==='bat');choices.add(r.toss.decision);const strip=JSON.parse(JSON.stringify(r));delete strip.toss;assert.equal(JSON.stringify(strip),JSON.stringify(old),'toss consumes no extra RNG or changes match');X.ui.result=r;const note=X.battingOrderNote(r),winner=[r.home,r.away].find(c=>c.abbr===r.toss.winner);assert.equal(note,`${winner.name} won the toss and chose to ${r.toss.decision}.`);const reveal=X.preMatchReveal();assert(reveal.includes(note));assert.doesNotMatch(reveal,/bowl first|Home · Bowling|First innings/);}
assert.equal(choices.size,2,'both bat and bowl decisions covered');
const r=b.G.state.results[0],prior=r.toss;delete r.toss;assert.equal(X.battingOrderNote(r),`${r.battingFirst.name} bat first.`,'older result does not fabricate toss');r.toss=prior;
const copy=loadGame(file,333,new Map(),{strictIds:true});assert(copy.context.GCC8.read.restoreBackup(X.read.backupRaw()));assert.equal(JSON.stringify(copy.G.state.results[0].toss),JSON.stringify(r.toss),'toss survives existing save format');
const savedToss=r.toss;r.toss={winner:'UNKNOWN',decision:'bat'};assert.equal(b.context.GCC8_DELIVERY.validResult(r,new Set(b.G.state.pool.map(p=>p.id))),false,'invalid recorded toss rejected');r.toss=savedToss;
assert.deepEqual(b.errors,[]);console.log('PASS: no backup UI, truthful toss, both choices, 14-match parity, old saves and save round trip');
