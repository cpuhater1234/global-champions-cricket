/**
 * Ground-condition hypothesis test: same chase-gate logic as the official audit,
 * run twice — neutral grounds vs audit-style ground conditions. If CW diverges,
 * grounds are the missing variable.
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(__dirname, 'results', 'v116-authenticity-candidate.html');
const MATCHES = 300;

function run(withGrounds) {
  const host = loadLogicGame(HTML, 8301);
  const dispatch = host.context.GCC8.dispatch;
  const matchAudit = host.context.GCC8_MATCH_AUDIT;
  for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
  setupBalancedLeague(host.G);
  const league = host.G.state.league;
  let allOut = 0, chaseWins = 0, totalWickets = 0;
  for (let m = 0; m < MATCHES; m++) {
    const home = league[m % 8];
    const away = league[(m + 1 + Math.floor(m / 8)) % 8];
    let r;
    if (withGrounds) {
      const ground = { conditions: { boundary: (m % 5) - 2 }, baseConditions: { pace: (m % 3) - 1, spin: ((m + 1) % 3) - 1 } };
      // replicate auditMatchEngine exactly: first innings via innings(), chase via innings(chasing)
      const inn1 = matchAudit.innings(home, away, ground, { round: (m % 14) + 1, chasing: false });
      const target = inn1.total + 1;
      const chase = matchAudit.innings(away, home, ground, { round: (m % 14) + 1, chasing: true, target });
      r = { firstInnings: inn1, secondInnings: chase, winner: chase.total >= target ? away : home, secondClub: away };
    } else {
      r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
    }
    if (r.firstInnings.wickets === 10) allOut++;
    if (r.secondInnings.wickets === 10) allOut++;
    totalWickets += r.firstInnings.wickets + r.secondInnings.wickets;
    if (r.winner && r.secondClub && r.winner.abbr === r.secondClub.abbr) chaseWins++;
  }
  host.dispose();
  return { ao: +(allOut / (MATCHES * 2) * 100).toFixed(1), cw: +(chaseWins / MATCHES * 100).toFixed(1), wk: +(totalWickets / (MATCHES * 2)).toFixed(2) };
}

console.log('neutral grounds :', JSON.stringify(run(false)));
console.log('audit grounds   :', JSON.stringify(run(true)));
