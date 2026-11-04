import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';
import {parseHTML} from '/workspace/tools/gcc-css-audit/node_modules/linkedom/esm/index.js';
const h=loadGame(process.argv[2]||'qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
startDraft(h);finishDraft(h);selectManualXI(h);h.G.startSeason();h.G.playNextRound();
const r=s.results.find(r=>[r.home.abbr,r.away.abbr].includes(s.userClub.abbr)),before=JSON.stringify(s),{document}=parseHTML(X.matchScorecard(r)),sections=[...document.querySelectorAll('.gcc-scoreinnings')];assert.equal(sections.length,2);
for(let n=0;n<2;n++){const inn=r.scorecard.innings[n],other=r.scorecard.innings[1-n].club,section=sections[n],bat=section.querySelector('.gcc-batting'),bowl=section.querySelector('.gcc-bowling');assert.equal(bat.getAttribute('aria-label'),inn.club.name+' batting');assert.equal(bowl.getAttribute('aria-label'),other.name+' bowling against '+inn.club.name);assert.equal(bat.querySelectorAll('tbody tr').length,inn.batting.filter(b=>!b.dnb).length);assert.equal(bowl.querySelectorAll('tbody tr').length,inn.bowling.length);assert(section.getAttribute('style').includes('--innings-club:'+inn.club.c));assert(section.getAttribute('style').includes('--innings-ink:'+X.clubInk(inn.club)));}
assert.equal(JSON.stringify(s),before);assert.deepEqual(h.errors,[]);console.log('PASS scorebook: correct batting and opposition-bowling labels, matched club colour/ink metadata, row counts and immutable cricket state.');
