/**
 * Chase-wicket bonus experiment: the release lifts expectedWickets while chasing
 * via Math.min(.55, chasePressure*.42). Sweep the bonus multiplier on the
 * audit-loop replica (verified to match the official runner).
 * Grid: bonus in [0.00, 0.15, 0.30, 0.42(release)] x seeds [8301, 8311, 8312],
 * other params fixed: baseline 6.10, gate 0.13, variance 0.38, dampen 0.55, margin gate 0.60.
 * Run: node qa/scratch_bonus_sweep.mjs
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'bonus_cell.html');
const MATCHES = 300;
const SEEDS = [8301, 8311, 8312];

const baseContent = fs.readFileSync(BASE_HTML, 'utf8');

// Fixed params from the current candidate
const BASELINE = 6.10, GATE = 0.13, VARIANCE = 0.38, DAMPEN = 0.55;

function buildCell(bonus) {
  let content = baseContent;
  content = content.replace('let expectedWickets = 6.35', `let expectedWickets = ${BASELINE.toFixed(2)}`);
  content = content.replace(
    'const chasePp=context.chasing ? chasePressure*.38 : 0;',
    `const chasePp=context.chasing ? chasePressure*.38-${DAMPEN.toFixed(2)} : 0;`
  );
  content = content.replace(
    'const chaseMid=context.chasing ? chasePressure*.68 : 0;',
    `const chaseMid=context.chasing ? chasePressure*.68-${DAMPEN.toFixed(2)} : 0;`
  );
  content = content.replace(
    'const chaseDeath=context.chasing ? chasePressure*1.00 : 0;',
    `const chaseDeath=context.chasing ? chasePressure*1.00-${DAMPEN.toFixed(2)} : 0;`
  );
  const wicketBlockRe = /const wicketProbability = Math\.max\(0\.04, Math\.min\(0\.96, expectedWickets \/ 10 \+ \(rng\(\) - 0\.5\) \* 0\.90\)\);\r?\n\s*let wickets = 0;\r?\n\s*for \(let i = 0; i < 10; i\+\+\) if \(rng\(\) < wicketProbability\) wickets \+= 1;/;
  const wicketReplacement = `const wicketProbability = Math.max(0.05, Math.min(0.75, expectedWickets / 10 + (rng() - 0.5) * ${VARIANCE}));
    let wickets = 0;
    for (let i = 0; i < 9; i++) if (rng() < wicketProbability) wickets += 1;
    if (wickets === 9 && rng() < wicketProbability * ${GATE}) wickets = 10;`;
  const before = content.length;
  content = content.replace(wicketBlockRe, wicketReplacement);
  if (content.length === before) throw new Error('wicket patch failed');
  // Chase wicket bonus: release is Math.min(.55,chasePressure*.42)
  if (bonus !== 0.42) {
    const bAnchor = 'Math.min(.55,chasePressure*.42)';
    if (!content.includes(bAnchor)) throw new Error('bonus anchor missing');
    content = content.replace(bAnchor, `Math.min(.55,chasePressure*${bonus})`);
  }
  // Thin-margin chase gate
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
  content = content.replace(anchor, gateCode);
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

for (const bonus of [0.00, 0.15, 0.30, 0.42]) {
  buildCell(bonus);
  const perSeed = SEEDS.map(auditCell);
  const aoAvg = +(perSeed.reduce((s, r) => s + r.ao, 0) / perSeed.length).toFixed(1);
  const cwAvg = +(perSeed.reduce((s, r) => s + r.cw, 0) / perSeed.length).toFixed(1);
  const wkAvg = +(perSeed.reduce((s, r) => s + r.wk, 0) / perSeed.length).toFixed(2);
  const aoAll = perSeed.every(r => r.ao >= 8 && r.ao <= 15);
  const cwAll = perSeed.every(r => r.cw >= 46 && r.cw <= 55);
  const label = bonus === 0.42 ? 'release' : bonus.toFixed(2);
  console.log(`bonus=${label.padEnd(7)}: AO=${aoAvg} (${perSeed.map(r => r.ao).join('/')}) ${aoAll ? 'OK' : '!!'}  CW=${cwAvg} (${perSeed.map(r => r.cw).join('/')}) ${cwAll ? 'OK' : '!!'}  WK=${wkAvg}  1st=${perSeed[0].f1}`);
}
