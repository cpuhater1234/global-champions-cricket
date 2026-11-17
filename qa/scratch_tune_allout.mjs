/**
 * Scratch tuning script: find wicket formula parameters that land all-out at 11-14%
 * Tests the two-stage model: 9 independent trials + conditional 10th wicket gate
 * Run: node qa/scratch_tune_allout.mjs
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';

import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(__dirname, 'results', 'v116-authenticity-candidate.html');

const host = loadLogicGame(HTML, 8305);
const G = host.G;
const dispatch = host.context.GCC8.dispatch;
const matchAudit = host.context.GCC8_MATCH_AUDIT;

for (const [a, b] of [['play',[]],['world',[]],['revealAll',[]],['clubs',[]],['club',[0]],['confirmClub',[]],['signingSkip',[]]]) {
  dispatch(a, b);
}
setupBalancedLeague(G);
const league = G.state.league;

const MATCHES = 300;
let allOut1st = 0;
let allOut2nd = 0;
let totalWicketsAll = 0;
let chaseWins = 0;

for (let m = 0; m < MATCHES; m++) {
  const home = league[m % 8];
  const away = league[(m + 1 + Math.floor(m / 8)) % 8];
  const round = (m % 14) + 1;
  
  const result = matchAudit.simulateInningsPair(home, away, round);
  const { firstInnings, secondInnings, secondClub, winner } = result;
  
  if (firstInnings.wickets === 10) allOut1st++;
  if (secondInnings.wickets === 10) allOut2nd++;
  totalWicketsAll += firstInnings.wickets + secondInnings.wickets;
  if (winner && secondClub && winner.abbr === secondClub.abbr) chaseWins++;
}

const totalInnings = MATCHES * 2;
const allOutPct = ((allOut1st + allOut2nd) / totalInnings * 100).toFixed(1);
const avgWickets = (totalWicketsAll / totalInnings).toFixed(2);
const chaseWinPct = (chaseWins / MATCHES * 100).toFixed(1);

console.log(`\n=== Candidate HTML - ${MATCHES} Matches (${totalInnings} innings) ===`);
console.log(`All-Out Rate:        ${allOutPct}%  (target: 8-15%, ideal 11.5%)`);
console.log(`Avg Wickets/Innings: ${avgWickets}   (target: 5.6-7.0, ideal 6.3)`);
console.log(`Chase Win Rate:      ${chaseWinPct}%  (target: 46-55%, ideal 50.5%)`);
console.log(`All-out breakdown: 1st=${allOut1st} (${(allOut1st/MATCHES*100).toFixed(1)}%), 2nd=${allOut2nd} (${(allOut2nd/MATCHES*100).toFixed(1)}%)`);

host.dispose();
