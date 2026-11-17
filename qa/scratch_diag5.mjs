/**
 * Diag 5: instrument INSIDE the gate (block counter via error side-channel).
 * If the gate body never runs, the raw totals must not equal tgt.
 * Prints: count of gate entries, count of margin-1 hits, and sample of raw margins.
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'diag5.html');

let content = fs.readFileSync(BASE_HTML, 'utf8');
const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
const code = `if(chasePotential.deliveryVersion===1){
      const tgt=firstInnings.total+1;
      chasePotential.__gate=(chasePotential.__gate||0)+1;
      chasePotential.__m=chasePotential.total-tgt;
      if(chasePotential.total===tgt&&rng()>=0.8100){
        chasePotential.__flipped=true;
        const balls=120;
        const wickets=Math.min(9,(chasePotential.wickets||6)+1);
        return {...chasePotential,total:tgt-1,wickets,balls,chased:false,
          pp:Math.round((chasePotential.pp||0)*balls/120),mid:Math.round((chasePotential.mid||0)*balls/120),death:Math.round((chasePotential.death||0)*balls/120)};
      }
      return chasePotential;
    }`;
content = content.replace(anchor, code);
fs.writeFileSync(TEMP_HTML, content);

const host = loadLogicGame(TEMP_HTML, 8310);
const dispatch = host.context.GCC8.dispatch;
const matchAudit = host.context.GCC8_MATCH_AUDIT;
for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
setupBalancedLeague(host.G);
const league = host.G.state.league;

let gateEntries = 0, flips = 0, chaseWins = 0;
const margins = [];
for (let m = 0; m < 200; m++) {
  const home = league[m % 8];
  const away = league[(m + 1 + Math.floor(m / 8)) % 8];
  const r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
  const si = r.secondInnings;
  if (si.__gate) gateEntries++;
  if (si.__flipped) flips++;
  if (typeof si.__m === 'number') margins.push(si.__m);
  if (r.winner && r.secondClub && r.winner.abbr === r.secondClub.abbr) chaseWins++;
}
host.dispose();
console.log('gate entries:', gateEntries, '/200');
console.log('margins histogram:', JSON.stringify(margins.reduce((a, x) => { a[x] = (a[x] || 0) + 1; return a; }, {})));
console.log('flips:', flips, ' chaseWins:', chaseWins, '/200 =', (chaseWins / 2).toFixed(1) + '%');
