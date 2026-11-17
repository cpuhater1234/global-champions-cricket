/**
 * Diag: chase mechanics. Print winner/hi/ai totals + how 'winner' is derived,
 * using the same patch pipeline as the sweep with slope reduced.
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'diag_chase.html');

let content = fs.readFileSync(BASE_HTML, 'utf8');
// slope cut to 0.24 (harder chases), leave everything else release-frozen
content = content.replace(
  'Math.max(-.55,Math.min(1.20,(requiredRate-7.65)*.34))',
  'Math.max(-.55,Math.min(1.20,(requiredRate-7.65)*.24))'
);
fs.writeFileSync(TEMP_HTML, content);

const host = loadLogicGame(TEMP_HTML, 8310);
const dispatch = host.context.GCC8.dispatch;
const matchAudit = host.context.GCC8_MATCH_AUDIT;
for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
setupBalancedLeague(host.G);
const league = host.G.state.league;

const MATCHES = 120;
let chaseWins = 0, ties = 0, hiWinsSecond = 0;
const samples = [];
for (let m = 0; m < MATCHES; m++) {
  const home = league[m % 8];
  const away = league[(m + 1 + Math.floor(m / 8)) % 8];
  const r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
  const chased = r.ai.total >= r.hi.total;   // second innings reached target?
  if (r.ai.total === r.hi.total) ties++;
  if (chased) chaseWins++;
  samples.push({ hi: r.hi.total, ai: r.ai.total, winner: r.winner?.abbr, aiClub: r.ai?.club?.abbr || r.ai?.abbr, chased });
}
host.dispose();

const chaseWinPct = (chaseWins / MATCHES * 100).toFixed(1);
console.log(`slope=.24 sample: chased-target rate=${chaseWinPct}%  ties=${ties}`);
console.log('first 10:', JSON.stringify(samples.slice(0, 10)));
const keys = Object.keys(samples[0]);
console.log('keys:', keys.join(','));
