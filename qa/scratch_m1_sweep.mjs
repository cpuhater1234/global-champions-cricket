/**
 * Targeted fix: margin-1 winning chases (raw total == target) succeed with
 * probability KEEP_P; otherwise they become last-over collapses (fall 1 short,
 * +1 wicket, overs exhausted, NOT all out). All other wins unchanged.
 * Census: margin-1 wins = 47% of all wins; CW release = ~59.6%.
 *   CW ≈ 59.6 - 0.47*100*(1-KEEP_P)  ->  KEEP_P=0.81 gives CW≈50.
 * Validate across 3 seeds x 400 matches, sweep KEEP_P 0.70..0.90.
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'm1.html');
const MATCHES = 400;
const SEEDS = [8310, 8311];

const baseContent = fs.readFileSync(BASE_HTML, 'utf8');

function buildPatch(baseline, gate, keepP) {
  let content = baseContent;
  if (baseline !== 6.35) content = content.replace('let expectedWickets = 6.35', `let expectedWickets = ${baseline.toFixed(2)}`);
  if (gate > 0) {
    const re = /const wicketProbability = Math\.max\(0\.04, Math\.min\(0\.96, expectedWickets \/ 10 \+ \(rng\(\) - 0\.5\) \* 0\.90\)\);\r?\n\s*let wickets = 0;\r?\n\s*for \(let i = 0; i < 10; i\+\+\) if \(rng\(\) < wicketProbability\) wickets \+= 1;/;
    const rep = `const wicketProbability = Math.max(0.05, Math.min(0.75, expectedWickets / 10 + (rng() - 0.5) * 0.38));
    let wickets = 0;
    for (let i = 0; i < 9; i++) if (rng() < wicketProbability) wickets += 1;
    if (wickets === 9 && rng() < wicketProbability * ${gate}) wickets = 10;`;
    content = content.replace(re, rep);
  }
  if (keepP < 1) {
    const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
    const code = `if(chasePotential.deliveryVersion===1){
      const tgt=firstInnings.total+1;
      if(chasePotential.total<=tgt+3&&rng()>=${keepP.toFixed(4)}){
        const balls=120;
        const wickets=Math.min(9,(chasePotential.wickets||6)+1);
        return {...chasePotential,total:tgt-1,wickets,balls,chased:false,
          pp:Math.round((chasePotential.pp||0)*balls/120),mid:Math.round((chasePotential.mid||0)*balls/120),death:Math.round((chasePotential.death||0)*balls/120)};
      }
      return chasePotential;
    }`;
    content = content.replace(anchor, code);
  }
  fs.writeFileSync(TEMP_HTML, content);
}

function runCell(seed) {
  const host = loadLogicGame(TEMP_HTML, seed);
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
  return { ao: +(allOut / (MATCHES * 2) * 100).toFixed(1), wk: +(totalWickets / (MATCHES * 2)).toFixed(2), cw: +(chaseWins / MATCHES * 100).toFixed(1), f1: +(firstTotal / MATCHES).toFixed(1) };
}

const cells = [
  ['b6.20 g0.12 keep0.60', 6.20, 0.12, 0.60],
  ['b6.20 g0.12 keep0.72', 6.20, 0.12, 0.72],
  ['b6.20 g0.12 keep0.84', 6.20, 0.12, 0.84],
];

for (const [label, baseline, gate, keepP] of cells) {
  buildPatch(baseline, gate, keepP);
  const runs = SEEDS.map(runCell);
  const avg = k => +(runs.reduce((s, r) => s + r[k], 0) / runs.length).toFixed(2);
  const ao = avg('ao'), wk = avg('wk'), cw = avg('cw');
  const ok = ao >= 8 && ao <= 15 && wk >= 5.6 && wk <= 7.0 && cw >= 46 && cw <= 55 ? '  ✅ ALL BANDS' : '';
  console.log(`[${label.padEnd(22)}] AO=${ao}% WK=${wk} CW=${cw}% 1st=${avg('f1')}${ok}`);
  console.log('   per-seed AO:', runs.map(r => r.ao).join(','), ' CW:', runs.map(r => r.cw).join(','));
}
