/**
 * Diag 4: runtime probe of resolveChase. Hook the export surface: wrap
 * GCC8_MATCH_AUDIT.simulateInningsPair AFTER load, and separately count gate
 * executions via a patched sentinel that stores counts on a global the host can read.
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'diag4.html');

let content = fs.readFileSync(BASE_HTML, 'utf8');
// Sentinel uses the engine's own rng-free global scope: GCC8_LOAD_PROBE set from host before loadGame? 
// Simpler: stash counts on the innings object itself.
const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
const gateCode = `    if(chasePotential.deliveryVersion===1){
      chasePotential.__dv1Seen = (chasePotential.__dv1Seen||0)+1;
      const tgt=firstInnings.total+1;
      chasePotential.__marginSeen = chasePotential.total - tgt;
      if(chasePotential.total<tgt+15){
        chasePotential.__gateBlocked = true;
        const raw=chasePotential.total;
        const balls=Math.max(10,Math.min(119,Math.round(120*raw/tgt)));
        const wickets=Math.max(0,Math.min(10,Math.round(chasePotential.wickets*balls/120)));
        return {...chasePotential,total:raw,wickets,balls,chased:false,
          pp:Math.round((chasePotential.pp||0)*balls/120),mid:Math.round((chasePotential.mid||0)*balls/120),death:Math.round((chasePotential.death||0)*balls/120)};
      }
    }`;
console.log('anchor present:', content.includes(anchor));
content = content.replace(anchor, anchor + gateCode);
console.log('gate patched:', content.includes('__dv1Seen'));
fs.writeFileSync(TEMP_HTML, content);

const host = loadLogicGame(TEMP_HTML, 8310);
const dispatch = host.context.GCC8.dispatch;
const matchAudit = host.context.GCC8_MATCH_AUDIT;
for (const [a, b] of [['play',[]],['world',[]],['revealAll',[]],['clubs',[]],['club',[0]],['confirmClub',[]],['signingSkip',[]]]) dispatch(a, b);
setupBalancedLeague(host.G);
const league = host.G.state.league;

let dv1Count = 0, blockedCount = 0, chaseWins = 0;
const marginsSeen = [];
for (let m = 0; m < 40; m++) {
  const home = league[m % 8], away = league[(m + 1) % 8];
  const r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
  const si = r.secondInnings || {};
  if (si.__dv1Seen) dv1Count++;
  if (si.__gateBlocked) blockedCount++;
  if (typeof si.__marginSeen === 'number') marginsSeen.push(si.__marginSeen);
  if (r.winner && r.secondClub && r.winner.abbr === r.secondClub.abbr) chaseWins++;
}
host.dispose();
console.log('second innings objects reaching gate:', dv1Count, '/ 40');
console.log('gate blocked (thin margin):', blockedCount);
console.log('raw margins at gate:', JSON.stringify(marginsSeen.slice(0, 20)));
console.log('chase wins:', chaseWins, '/ 40');
