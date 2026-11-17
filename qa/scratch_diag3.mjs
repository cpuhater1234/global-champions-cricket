/**
 * Diag 3: is the margin gate actually firing? Instrument the patched HTML with a
 * counter, run 60 matches, and print the counter + raw chase margin distribution.
 */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const TEMP_HTML = path.join(__dirname, 'results', 'diag3.html');
const MARGIN = 15;

let content = fs.readFileSync(BASE_HTML, 'utf8');
const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
const gateCode = `    if(chasePotential.deliveryVersion===1){
      globalThis.__GATE_FIRE=(globalThis.__GATE_FIRE||0)+1;
      const tgt=firstInnings.total+1;
      if(chasePotential.total<tgt+${MARGIN}){
        globalThis.__GATE_BLOCK=(globalThis.__GATE_BLOCK||0)+1;
        const raw=chasePotential.total;
        const balls=Math.max(10,Math.min(119,Math.round(120*raw/tgt)));
        const wickets=Math.max(0,Math.min(10,Math.round(chasePotential.wickets*balls/120)));
        return {...chasePotential,total:raw,wickets,balls,chased:false,
          pp:Math.round((chasePotential.pp||0)*balls/120),mid:Math.round((chasePotential.mid||0)*balls/120),death:Math.round((chasePotential.death||0)*balls/120)};
      }
    }`;
console.log('anchor found:', content.includes(anchor));
content = content.replace(anchor, anchor + gateCode);
console.log('gate code in patched:', content.includes('__GATE_FIRE'));
fs.writeFileSync(TEMP_HTML, content);

const host = loadLogicGame(TEMP_HTML, 8310);
const dispatch = host.context.GCC8.dispatch;
const matchAudit = host.context.GCC8_MATCH_AUDIT;
for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
setupBalancedLeague(host.G);
const league = host.G.state.league;

let chaseWins = 0;
const margins = [];
for (let m = 0; m < 60; m++) {
  const home = league[m % 8], away = league[(m + 1) % 8];
  const r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
  margins.push(r.secondInnings.total - r.firstInnings.total);
  if (r.winner && r.secondClub && r.winner.abbr === r.secondClub.abbr) chaseWins++;
}
host.dispose();

const win = host.context.GCC8;
console.log('GATE_FIRE:', globalThis.__GATE_FIRE ?? 'undefined');
console.log('GATE_BLOCK:', globalThis.__GATE_BLOCK ?? 'undefined');
console.log('chase wins:', chaseWins, '/ 60');
console.log('margins (2nd - 1st):', JSON.stringify(margins.slice(0, 30)));
console.log('margins in [0,15):', margins.filter(x => x >= 0 && x < 15).length, '/ 60');
