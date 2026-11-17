/**
 * Margin census: distribution of (raw chase total - target) for would-be winners,
 * release build, 800 matches, 2 seeds. Tells us exactly what fraction of wins
 * clear by each margin band, so p can be computed analytically.
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'census.html');
const MATCHES = 400;

let content = fs.readFileSync(BASE_HTML, 'utf8');
// Census: record raw winning margins on the innings object
const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
const gateCode = `if(chasePotential.deliveryVersion===1){
      const tgt=firstInnings.total+1;
      if(chasePotential.total>=tgt){ chasePotential.__winMargin=chasePotential.total-tgt; }
      return chasePotential;
    }`;
content = content.replace(anchor, gateCode);
fs.writeFileSync(TEMP_HTML, content);

const all = [];
for (const seed of [8310, 8311]) {
  const host = loadLogicGame(TEMP_HTML, seed);
  const dispatch = host.context.GCC8.dispatch;
  const matchAudit = host.context.GCC8_MATCH_AUDIT;
  for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
  setupBalancedLeague(host.G);
  const league = host.G.state.league;
  for (let m = 0; m < MATCHES; m++) {
    const home = league[m % 8];
    const away = league[(m + 1 + Math.floor(m / 8)) % 8];
    const r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
    if (typeof r.secondInnings.__winMargin === 'number') all.push(r.secondInnings.__winMargin);
  }
  host.dispose();
}
console.log('would-be winner chases:', all.length);
const bands = [0, 1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50, 1000];
let prev = 0;
for (const b of bands) {
  const n = all.filter(x => x >= prev && x < b).length;
  if (b > prev) console.log(`  margin ${String(prev).padStart(3)}..<${String(b).padStart(4)}: ${String(n).padStart(4)}  (${(n / all.length * 100).toFixed(1)}%)`);
  prev = b;
}
