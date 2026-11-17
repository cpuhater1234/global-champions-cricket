/**
 * Diag 2: does the margin gate string actually appear in the patched HTML,
 * and does chasePotential even exist in the audit path?
 */
import { loadLogicGame } from './logic_game_host.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'diag2.html');

let content = fs.readFileSync(BASE_HTML, 'utf8');
const anchorCount = content.split('if (chasePotential.total < target) return chasePotential;').length - 1;
console.log('anchor occurrences in release:', anchorCount);

content = content.replace(
  'if (chasePotential.total < target) return chasePotential;',
  `if (chasePotential.total < target + 15) {
    console.log('[DIAG] margin gate fired');
    return { ...chasePotential, chased: false };
  }`
);
console.log('patch applied:', content.includes('margin gate fired'));
fs.writeFileSync(TEMP_HTML, content);

const host = loadLogicGame(TEMP_HTML, 8310);
const dispatch = host.context.GCC8.dispatch;
const matchAudit = host.context.GCC8_MATCH_AUDIT;
for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
const { setupBalancedLeague } = await import('./v116_gameplay_authenticity.mjs');
setupBalancedLeague(host.G);

// sample 20 chases, print raw chase totals vs targets
const league = host.G.state.league;
let fired = 0;
for (let m = 0; m < 20; m++) {
  const home = league[m % 8], away = league[(m + 1) % 8];
  const r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
  const margin = r.secondInnings.total - r.firstInnings.total;
  if (margin >= 0 && margin < 15) fired++;
}
console.log('chases with margin 0..14 (should have fired gate):', fired, '/ 20');
host.dispose();
