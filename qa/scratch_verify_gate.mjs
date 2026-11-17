/** Verify the sweep's exact patched HTML has the gate and that simulateInningsPair
    responds to it: run 60 matches with margin 0 vs 15, same seed. */
import { loadLogicGame } from './logic_game_host.mjs';
import { setupBalancedLeague } from './v116_gameplay_authenticity.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
const baseContent = fs.readFileSync(BASE_HTML, 'utf8');
console.log('anchor in base:', baseContent.includes(anchor));

function build(margin) {
  let content = baseContent;
  if (margin > 0) {
    const gateCode = `if(chasePotential.deliveryVersion===1){
      const tgt=firstInnings.total+1;
      if(chasePotential.total<tgt+${margin}){
        const raw=chasePotential.total;
        const balls=Math.max(10,Math.min(119,Math.round(120*raw/tgt)));
        const wickets=Math.max(0,Math.min(10,Math.round(chasePotential.wickets*balls/120)));
        return {...chasePotential,total:raw,wickets,balls,chased:false,
          pp:Math.round((chasePotential.pp||0)*balls/120),mid:Math.round((chasePotential.mid||0)*balls/120),death:Math.round((chasePotential.death||0)*balls/120)};
      }
      return chasePotential;
    }`;
    const before = content.length;
    content = content.replace(anchor, gateCode);
    console.log(`margin=${margin} patch applied: ${content.length !== before}, gate in file: ${content.includes('tgt+' + margin)}`);
  }
  const temp = path.join(__dirname, 'results', `verify_m${margin}.html`);
  fs.writeFileSync(temp, content);
  return temp;
}

function run(file) {
  const host = loadLogicGame(file, 8310);
  const dispatch = host.context.GCC8.dispatch;
  const matchAudit = host.context.GCC8_MATCH_AUDIT;
  for (const [a, b] of [['play', []], ['world', []], ['revealAll', []], ['clubs', []], ['club', [0]], ['confirmClub', []], ['signingSkip', []]]) dispatch(a, b);
  setupBalancedLeague(host.G);
  const league = host.G.state.league;
  let chaseWins = 0, allOut = 0;
  const margins = [];
  for (let m = 0; m < 60; m++) {
    const home = league[m % 8], away = league[(m + 1) % 8];
    const r = matchAudit.simulateInningsPair(home, away, (m % 14) + 1);
    margins.push(r.secondInnings.total - r.firstInnings.total);
    if (r.winner && r.secondClub && r.winner.abbr === r.secondClub.abbr) chaseWins++;
    if (r.firstInnings.wickets === 10 || r.secondInnings.wickets === 10) allOut++;
  }
  host.dispose();
  return { chaseWins, allOut, margins };
}

const f0 = build(0);
const r0 = run(f0);
const f15 = build(15);
const r15 = run(f15);
console.log('m0 : CW', r0.chaseWins, '/60  AO', r0.allOut, ' margins[0..15):', r0.margins.filter(x => x >= 0 && x < 15).length);
console.log('m15: CW', r15.chaseWins, '/60  AO', r15.allOut, ' margins[0..15):', r15.margins.filter(x => x >= 0 && x < 15).length);
console.log('m0 margins sample :', JSON.stringify(r0.margins.slice(0, 12)));
console.log('m15 margins sample:', JSON.stringify(r15.margins.slice(0, 12)));
