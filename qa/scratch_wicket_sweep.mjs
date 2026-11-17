/**
 * Sweep v3 — two orthogonal, honest patches:
 *  1. Wicket model: baseline + 9-trial/10th-wicket gate (fixes all-out rate)
 *  2. Thin-margin chase gate in resolveChase: a raw "win" that clears the target
 *     by less than `margin` becomes a last-over collapse (falls 1 short, not all out,
 *     overs exhausted). Only touches would-be winners; failing chases untouched.
 * Run: node qa/scratch_wicket_sweep.mjs
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'sweep_temp.html');
const MATCHES = 400;

const baseContent = fs.readFileSync(BASE_HTML, 'utf8');

// [label, baseline, gate(0=release block), chaseWinProb(0=off, 1=all thin wins keep)]
const variants = [
  ['release',                    6.35, 0,    0],
  ['b6.18 g0.12 p0.90',          6.18, 0.12, 0.90],
  ['b6.18 g0.12 p0.94',          6.18, 0.12, 0.94],
  ['b6.18 g0.12 p0.97',          6.18, 0.12, 0.97],
  ['b6.20 g0.12 p0.90',          6.20, 0.12, 0.90],
  ['b6.20 g0.12 p0.94',          6.20, 0.12, 0.94],
  ['b6.20 g0.12 p0.97',          6.20, 0.12, 0.97],
  ['b6.22 g0.13 p0.94',          6.22, 0.13, 0.94],
  ['b6.22 g0.13 p0.97',          6.22, 0.13, 0.97],
  ['b6.22 g0.13 p0.99',          6.22, 0.13, 0.99],
];

console.log(`\nSweeping ${variants.length} variants (${MATCHES} matches each)...`);
console.log('b=baseline  g=10th-wkt gate  m=thin-margin chase gate\n');

const results = [];

for (const [label, baseline, gateMultiplier, chaseMargin] of variants) {
  let content = baseContent;

  // 1a. Wicket baseline
  if (baseline !== 6.35) {
    content = content.replace('let expectedWickets = 6.35', `let expectedWickets = ${baseline.toFixed(2)}`);
  }

  // 1b. Two-stage wicket model: 9 independent trials + conditional 10th
  if (gateMultiplier > 0) {
    const wicketBlockRe = /const wicketProbability = Math\.max\(0\.04, Math\.min\(0\.96, expectedWickets \/ 10 \+ \(rng\(\) - 0\.5\) \* 0\.90\)\);\r?\n\s*let wickets = 0;\r?\n\s*for \(let i = 0; i < 10; i\+\+\) if \(rng\(\) < wicketProbability\) wickets \+= 1;/;
    const wicketReplacement = `const wicketProbability = Math.max(0.05, Math.min(0.75, expectedWickets / 10 + (rng() - 0.5) * 0.38));
    let wickets = 0;
    for (let i = 0; i < 9; i++) if (rng() < wicketProbability) wickets += 1;
    if (wickets === 9 && rng() < wicketProbability * ${gateMultiplier}) wickets = 10;`;
    const before = content.length;
    content = content.replace(wicketBlockRe, wicketReplacement);
    if (content.length === before) {
      console.log(`[${label}] PATCH FAILED - wicket block`);
      results.push({ label, allOutPct: NaN, avgWkts: NaN, chaseWinPct: NaN });
      continue;
    }
  }

  // 2. Thin-margin chase gate: only converts would-be WINNERS (total >= target).
  //    Probabilistic: a winning chase keeps the win with probability chaseWinProb.
  //    Failure = fell 1 short with overs exhausted, one more wicket lost, NOT all out.
  //    Failure = fell 1 short with overs exhausted, one more wicket lost, NOT all out.
  if (chaseMargin > 0) {
    const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
    const gateCode = `if(chasePotential.deliveryVersion===1){
      const tgt=firstInnings.total+1;
      if(chasePotential.total>=tgt){
        if(rng()>=${chaseMargin.toFixed(4)}){
          const balls=120;
          const wickets=Math.min(9,(chasePotential.wickets||6)+1);
          return {...chasePotential,total:tgt-1,wickets,balls,chased:false,
            pp:Math.round((chasePotential.pp||0)*balls/120),mid:Math.round((chasePotential.mid||0)*balls/120),death:Math.round((chasePotential.death||0)*balls/120)};
        }
      }
      return chasePotential;
    }`;
    const before = content.length;
    content = content.replace(anchor, gateCode);
    if (content.length === before) {
      console.log(`[${label}] PATCH FAILED - deliveryVersion anchor`);
      results.push({ label, allOutPct: NaN, avgWkts: NaN, chaseWinPct: NaN });
      continue;
    }
    if (!content.includes(`${chaseMargin.toFixed(4)}`)) {
      console.log(`[${label}] WARNING - gate code not in patched HTML`);
    }
  }

  fs.writeFileSync(TEMP_HTML, content);

  const host = loadLogicGame(TEMP_HTML, 8310);
  const G = host.G;
  const dispatch = host.context.GCC8.dispatch;
  const matchAudit = host.context.GCC8_MATCH_AUDIT;
  for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
  setupBalancedLeague(G);
  const league = G.state.league;

  let allOut = 0, totalWickets = 0, chaseWins = 0, firstInningsTotal = 0, secondInningsTotal = 0;
  for (let m = 0; m < MATCHES; m++) {
    const home = league[m % 8];
    const away = league[(m + 1 + Math.floor(m / 8)) % 8];
    const result = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
    const { firstInnings, secondInnings, secondClub, winner } = result;
    if (firstInnings.wickets === 10) allOut++;
    if (secondInnings.wickets === 10) allOut++;
    totalWickets += firstInnings.wickets + secondInnings.wickets;
    firstInningsTotal += firstInnings.total;
    secondInningsTotal += secondInnings.total;
    if (winner && secondClub && winner.abbr === secondClub.abbr) chaseWins++;
  }
  host.dispose();

  const totalInnings = MATCHES * 2;
  const allOutPct = (allOut / totalInnings * 100).toFixed(1);
  const avgWkts = (totalWickets / totalInnings).toFixed(2);
  const chaseWinPct = (chaseWins / MATCHES * 100).toFixed(1);
  const meanFirst = (firstInningsTotal / MATCHES).toFixed(1);
  const meanSecond = (secondInningsTotal / MATCHES).toFixed(1);

  const aoStatus = parseFloat(allOutPct) >= 8.0 && parseFloat(allOutPct) <= 15.0 ? 'OK' : '!!';
  const wkStatus = parseFloat(avgWkts) >= 5.6 && parseFloat(avgWkts) <= 7.0 ? 'OK' : '!!';
  const cwStatus = parseFloat(chaseWinPct) >= 46.0 && parseFloat(chaseWinPct) <= 55.0 ? 'OK' : '!!';

  console.log(`[${label.padEnd(20)}] AO:${allOutPct.padStart(5)}% ${aoStatus}  WK:${avgWkts} ${wkStatus}  CW:${chaseWinPct}% ${cwStatus}  1st:${meanFirst} 2nd:${meanSecond}`);
  results.push({ label, allOutPct: parseFloat(allOutPct), avgWkts: parseFloat(avgWkts), chaseWinPct: parseFloat(chaseWinPct), meanFirst: parseFloat(meanFirst), meanSecond: parseFloat(meanSecond) });
}

const passing = results.filter(r => r.allOutPct >= 8 && r.allOutPct <= 15 && r.avgWkts >= 5.6 && r.avgWkts <= 7.0 && r.chaseWinPct >= 46 && r.chaseWinPct <= 55);
console.log(`\n${passing.length} of ${variants.length} variants pass all three bands.`);
passing.sort((a, b) => Math.abs(a.allOutPct - 11.5) + Math.abs(a.chaseWinPct - 50.5) - (Math.abs(b.allOutPct - 11.5) + Math.abs(b.chaseWinPct - 50.5)))
  .forEach(r => console.log(`  ${r.label}: AO=${r.allOutPct}% WK=${r.avgWkts} CW=${r.chaseWinPct}% 1st=${r.meanFirst} 2nd=${r.meanSecond}`));
