/**
 * Grid search v2 — fast in-process replica of auditMatchEngine's core loop
 * (verified to reproduce the official audit's numbers exactly: 44.3 CW etc.).
 * baseline x dampen grid, gate 0.13, 3 seeds x 300 matches per cell.
 * Run: node qa/scratch_grid_audit.mjs
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'grid_cell.html');
const MATCHES = 300;
const SEEDS = [8301, 8311, 8312];

const baseContent = fs.readFileSync(BASE_HTML, 'utf8');

function buildCell(baseline, dampen, gate = 0.13) {
  let content = baseContent;
  content = content.replace('let expectedWickets = 6.35', `let expectedWickets = ${baseline.toFixed(2)}`);
  content = content.replace(
    'const chasePp=context.chasing ? chasePressure*.38 : 0;',
    `const chasePp=context.chasing ? chasePressure*.38-${dampen.toFixed(2)} : 0;`
  );
  content = content.replace(
    'const chaseMid=context.chasing ? chasePressure*.68 : 0;',
    `const chaseMid=context.chasing ? chasePressure*.68-${dampen.toFixed(2)} : 0;`
  );
  content = content.replace(
    'const chaseDeath=context.chasing ? chasePressure*1.00 : 0;',
    `const chaseDeath=context.chasing ? chasePressure*1.00-${dampen.toFixed(2)} : 0;`
  );
  const wicketBlockRe = /const wicketProbability = Math\.max\(0\.04, Math\.min\(0\.96, expectedWickets \/ 10 \+ \(rng\(\) - 0\.5\) \* 0\.90\)\);\r?\n\s*let wickets = 0;\r?\n\s*for \(let i = 0; i < 10; i\+\+\) if \(rng\(\) < wicketProbability\) wickets \+= 1;/;
  const wicketReplacement = `const wicketProbability = Math.max(0.05, Math.min(0.75, expectedWickets / 10 + (rng() - 0.5) * 0.38));
    let wickets = 0;
    for (let i = 0; i < 9; i++) if (rng() < wicketProbability) wickets += 1;
    if (wickets === 9 && rng() < wicketProbability * ${gate}) wickets = 10;`;
  if (!content.includes(`wicketProbability * ${gate}`)) {
    const before = content.length;
    content = content.replace(wicketBlockRe, wicketReplacement);
    if (content.length === before) throw new Error('wicket patch failed');
  }
  const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
  if (!content.includes('rng()>=0.60')) {
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
    content = content.replace(anchor, gateCode);
  }
  fs.writeFileSync(TEMP_HTML, content);
}

function auditCell(seed) {
  const host = loadLogicGame(TEMP_HTML, seed);
  const G = host.G;
  const dispatch = host.context.GCC8.dispatch;
  const matchAudit = host.context.GCC8_MATCH_AUDIT;
  for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
  setupBalancedLeague(G);
  const league = G.state.league;
  let allOut = 0, chaseWins = 0, totalWickets = 0, firstTotal = 0;
  for (let m = 0; m < MATCHES; m++) {
    const home = league[m % 8];
    const away = league[(m + 1 + Math.floor(m / 8)) % 8];
    const ground = {
      conditions: { boundary: (m % 5) - 2 },
      baseConditions: { pace: (m % 3) - 1, spin: ((m + 1) % 3) - 1 }
    };
    const inn1 = matchAudit.innings(home, away, ground, { round: (m % 14) + 1, chasing: false });
    if (inn1.wickets === 10) allOut++;
    const target = inn1.total + 1;
    const chase = matchAudit.innings(away, home, ground, { round: (m % 14) + 1, chasing: true, target });
    if (chase.wickets === 10) allOut++;
    totalWickets += inn1.wickets + chase.wickets;
    firstTotal += inn1.total;
    if (chase.total >= target) chaseWins++;
  }
  host.dispose();
  return {
    ao: +(allOut / (MATCHES * 2) * 100).toFixed(1),
    cw: +(chaseWins / MATCHES * 100).toFixed(1),
    wk: +(totalWickets / (MATCHES * 2)).toFixed(2),
    f1: +(firstTotal / MATCHES).toFixed(1),
  };
}

const results = [];
for (const baseline of [6.00, 6.10, 6.20]) {
  for (const dampen of [0.40, 0.55, 0.70]) {
    buildCell(baseline, dampen);
    const perSeed = SEEDS.map(auditCell);
    const aoAvg = +(perSeed.reduce((s, r) => s + r.ao, 0) / perSeed.length).toFixed(1);
    const cwAvg = +(perSeed.reduce((s, r) => s + r.cw, 0) / perSeed.length).toFixed(1);
    const wkAvg = +(perSeed.reduce((s, r) => s + r.wk, 0) / perSeed.length).toFixed(2);
    const aoAll = perSeed.every(r => r.ao >= 8 && r.ao <= 15);
    const cwAll = perSeed.every(r => r.cw >= 46 && r.cw <= 55);
    const wkAll = perSeed.every(r => r.wk >= 5.6 && r.wk <= 7.0);
    console.log(`b${baseline.toFixed(2)} d${dampen.toFixed(2)}: AO=${aoAvg} (${perSeed.map(r => r.ao).join('/')}) ${aoAll ? 'OK' : '!!'}  CW=${cwAvg} (${perSeed.map(r => r.cw).join('/')}) ${cwAll ? 'OK' : '!!'}  WK=${wkAvg} ${wkAll ? 'OK' : '!!'}`);
    results.push({ baseline, dampen, aoAvg, cwAvg, wkAvg, aoAll, cwAll, wkAll, perSeed });
  }
}

console.log('\n=== Cells passing all bands on all 3 seeds ===');
const winners = results.filter(r => r.aoAll && r.cwAll && r.wkAll);
if (winners.length) {
  winners.sort((a, b) => (Math.abs(a.aoAvg - 11.5) + Math.abs(a.cwAvg - 50.5)) - (Math.abs(b.aoAvg - 11.5) + Math.abs(b.cwAvg - 50.5)))
    .forEach(r => console.log(`  b${r.baseline} d${r.dampen}: AO=${r.aoAvg} CW=${r.cwAvg} WK=${r.wkAvg}`));
} else {
  console.log('None pass all bands. Closest 3 by weighted distance:');
  results.map(r => ({ ...r, d: Math.abs(r.aoAvg - 11.5) / 3.5 + Math.abs(r.cwAvg - 50.5) / 4.5 + Math.abs(r.wkAvg - 6.3) / 0.7 }))
    .sort((a, b) => a.d - b.d).slice(0, 3)
    .forEach(r => console.log(`  b${r.baseline} d${r.dampen}: AO=${r.aoAvg} CW=${r.cwAvg} WK=${r.wkAvg} dist=${r.d.toFixed(2)} (${r.perSeed.map(s => `s${s.seed}:${s.ao}/${s.cw}`).join(' ')})`));
}
