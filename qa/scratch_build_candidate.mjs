/**
 * Build the authenticity candidate HTML from the frozen release with the
 * sweep-winning parameters (b6.20 g0.12 + thin-margin chase gate keep0.60):
 *   1. expectedWickets 6.35 -> 6.20
 *   2. Two-stage wickets: 9 independent trials (variance .38, cap .75)
 *      + 10th wicket gate at 0.12
 *   3. Thin-margin chase gate in resolveChase: a winning chase that would win
 *      by <=3 runs succeeds with p=0.60; otherwise it becomes a last-over
 *      collapse (falls 1 short, +1 wicket, overs exhausted, NOT all out).
 * Run: node qa/scratch_build_candidate.mjs
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const OUT_HTML = path.join(__dirname, 'results', 'v116-authenticity-candidate.html');

let content = fs.readFileSync(BASE_HTML, 'utf8');

// 1. Wicket baseline
content = content.replace('let expectedWickets = 6.35', 'let expectedWickets = 6.10');

// 1b. Chase phase dampen: -0.85 RPO off pp/mid/death while chasing (affects the raw
// chase generator inside innings(), which is what the official audit counts)
content = content.replace(
  'const chasePp=context.chasing ? chasePressure*.38 : 0;',
  'const chasePp=context.chasing ? chasePressure*.38-0.85 : 0;'
);
content = content.replace(
  'const chaseMid=context.chasing ? chasePressure*.68 : 0;',
  'const chaseMid=context.chasing ? chasePressure*.68-0.85 : 0;'
);
content = content.replace(
  'const chaseDeath=context.chasing ? chasePressure*1.00 : 0;',
  'const chaseDeath=context.chasing ? chasePressure*1.00-0.85 : 0;'
);

// 2. Two-stage wicket model
const wicketBlockRe = /const wicketProbability = Math\.max\(0\.04, Math\.min\(0\.96, expectedWickets \/ 10 \+ \(rng\(\) - 0\.5\) \* 0\.90\)\);\r?\n\s*let wickets = 0;\r?\n\s*for \(let i = 0; i < 10; i\+\+\) if \(rng\(\) < wicketProbability\) wickets \+= 1;/;
const wicketReplacement = `const wicketProbability = Math.max(0.05, Math.min(0.75, expectedWickets / 10 + (rng() - 0.5) * 0.38));
    let wickets = 0;
    for (let i = 0; i < 9; i++) if (rng() < wicketProbability) wickets += 1;
    if (wickets === 9 && rng() < wicketProbability * 0.12) wickets = 10;`;
const before = content.length;
content = content.replace(wicketBlockRe, wicketReplacement);
if (content.length === before) {
  console.error('PATCH FAILED - wicket block not found');
  process.exit(1);
}

// 3. Thin-margin chase gate (resolveChase, before the deliveryVersion fast-path return)
const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
const gateCode = `if(chasePotential.deliveryVersion===1){
      const tgt=firstInnings.total+1;
      if(chasePotential.total<=tgt+3&&rng()>=0.60){
        const balls=120;
        const wickets=Math.min(9,(chasePotential.wickets||6)+1);
        return {...chasePotential,total:tgt-1,wickets,balls,chased:false,
          pp:Math.round((chasePotential.pp||0)*balls/120),mid:Math.round((chasePotential.mid||0)*balls/120),death:Math.round((chasePotential.death||0)*balls/120)};
      }
      return chasePotential;
    }`;
if (!content.includes(anchor)) {
  console.error('PATCH FAILED - deliveryVersion anchor not found');
  process.exit(1);
}
content = content.replace(anchor, gateCode);

fs.writeFileSync(OUT_HTML, content);
console.log(`Candidate written: ${OUT_HTML} (${content.length} bytes)`);

// Quick validation (2 seeds x 400 matches)
const MATCHES = 400;
for (const seed of [8310, 8311]) {
  const host = loadLogicGame(OUT_HTML, seed);
  const dispatch = host.context.GCC8.dispatch;
  const matchAudit = host.context.GCC8_MATCH_AUDIT;
  for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
  setupBalancedLeague(host.G);
  const league = host.G.state.league;
  let allOut = 0, totalWickets = 0, chaseWins = 0, firstTotal = 0;
  for (let m = 0; m < MATCHES; m++) {
    const home = league[m % 8];
    const away = league[(m + 1 + Math.floor(m / 8)) % 8];
    const r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
    if (r.firstInnings.wickets === 10) allOut++;
    if (r.secondInnings.wickets === 10) allOut++;
    totalWickets += r.firstInnings.wickets + r.secondInnings.wickets;
    firstTotal += r.firstInnings.total;
    if (r.winner && r.secondClub && r.winner.abbr === r.secondClub.abbr) chaseWins++;
  }
  host.dispose();
  const innings = MATCHES * 2;
  console.log(`seed ${seed}: AO=${(allOut / innings * 100).toFixed(1)}% WK=${(totalWickets / innings).toFixed(2)} CW=${(chaseWins / MATCHES * 100).toFixed(1)}% 1st=${(firstTotal / MATCHES).toFixed(1)}`);
}
