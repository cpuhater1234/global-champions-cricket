/**
 * Bisect the audit-vs-replication CW gap. Same seed, same file.
 * Replication A: exact auditMatchEngine body (copy-pasted core loop).
 * Then toggle one thing at a time.
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague, auditPlayerRatings } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(__dirname, 'results', 'v116-authenticity-candidate.html');
const MATCHES = 300;

function auditLoop(host, { withRatingsFirst = true } = {}) {
  const G = host.G;
  const dispatch = host.context.GCC8.dispatch;
  const R = host.context.GCC_RATINGS;
  const matchAudit = host.context.GCC8_MATCH_AUDIT;
  for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
  setupBalancedLeague(G);

  let chaseWins = 0;
  for (let m = 0; m < MATCHES; m++) {
    const home = league_for(G, m);
    const away = league_for(G, m, true);
    const ground = {
      conditions: { boundary: (m % 5) - 2 },
      baseConditions: { pace: (m % 3) - 1, spin: ((m + 1) % 3) - 1 }
    };
    const inn1 = matchAudit.innings(home, away, ground, { round: (m % 14) + 1, chasing: false });
    const target = inn1.total + 1;
    const chasePotential = matchAudit.innings(away, home, ground, { round: (m % 14) + 1, chasing: true, target });
    if (chasePotential.total >= target) chaseWins++;
  }
  return { cw: +(chaseWins / MATCHES * 100).toFixed(1) };
}

function league_for(G, m, offset) {
  const l = G.state.league;
  return offset ? l[(m + 1 + Math.floor(m / 8)) % 8] : l[m % 8];
}

function freshHost() {
  const host = loadLogicGame(HTML, 8301);
  return host;
}

// A: ratings audit first (official order)
{
  const host = freshHost();
  const dispatch = host.context.GCC8.dispatch;
  for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
  const R = host.context.GCC_RATINGS;
  const pool = host.G.state.pool || [];
  const ra = auditPlayerRatings(pool, R);   // official step [1/3]
  const r = auditLoop(host, { withRatingsFirst: true });
  console.log('A (ratings audit first):', JSON.stringify(r));
  host.dispose();
}
// B: no ratings audit
{
  const host = freshHost();
  const r = auditLoop(host);
  console.log('B (no ratings audit)  :', JSON.stringify(r));
  host.dispose();
}
