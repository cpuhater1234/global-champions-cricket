/**
 * Build the authenticity candidate from the frozen v116 release.
 * Gameplay: baseline 6.10, gate 0.13, variance 0.38, dampen -0.55,
 * thin-margin gate 0.60, chase-hazard pressure multiplier 0.00.
 * Cards: one stadium row on club reveal and club selection. Full ground
 * name and trait stay in the club guide.
 * Run: node qa/scratch_build_final.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_HTML = path.join(__dirname, '..', 'GCC_v116_release (1).html');
const OUT_HTML = path.join(__dirname, 'results', 'v116-authenticity-candidate.html');

const BASELINE = 6.10, GATE = 0.13, VARIANCE = 0.38, DAMPEN = 0.55, MULT = 0.00;

let content = fs.readFileSync(BASE_HTML, 'utf8');

// 1. Wicket baseline
content = content.replace('let expectedWickets = 6.35', `let expectedWickets = ${BASELINE.toFixed(2)}`);

// 2. Chase phase dampen
content = content.replace(
  'const chasePp=context.chasing ? chasePressure*.38 : 0;',
  `const chasePp=context.chasing ? chasePressure*.38-${DAMPEN.toFixed(2)} : 0;`
);
content = content.replace(
  'const chaseMid=context.chasing ? chasePressure*.68 : 0;',
  `const chaseMid=context.chasing ? chasePressure*.68-${DAMPEN.toFixed(2)} : 0;`
);
content = content.replace(
  'const chaseDeath=context.chasing ? chasePressure*1.00 : 0;',
  `const chaseDeath=context.chasing ? chasePressure*1.00-${DAMPEN.toFixed(2)} : 0;`
);

// 3. Two-stage wicket model
const wicketBlockRe = /const wicketProbability = Math\.max\(0\.04, Math\.min\(0\.96, expectedWickets \/ 10 \+ \(rng\(\) - 0\.5\) \* 0\.90\)\);\r?\n\s*let wickets = 0;\r?\n\s*for \(let i = 0; i < 10; i\+\+\) if \(rng\(\) < wicketProbability\) wickets \+= 1;/;
const wicketReplacement = `const wicketProbability = Math.max(0.05, Math.min(0.75, expectedWickets / 10 + (rng() - 0.5) * ${VARIANCE}));
    let wickets = 0;
    for (let i = 0; i < 9; i++) if (rng() < wicketProbability) wickets += 1;
    if (wickets === 9 && rng() < wicketProbability * ${GATE}) wickets = 10;`;
const before = content.length;
content = content.replace(wicketBlockRe, wicketReplacement);
if (content.length === before) { console.error('PATCH FAILED - wicket block'); process.exit(1); }

// 4. Thin-margin chase gate
const anchor = 'if(chasePotential.deliveryVersion===1)return chasePotential;';
const gateCode = `if(chasePotential.deliveryVersion===1){
      const tgt=firstInnings.total+1;
      if(chasePotential.total<=tgt+3&&rng()>=0.60){
        const balls=120;
        const wickets=Math.min(9,(chasePotential.wickets||6)+1);
        return {...chasePotential,total:tgt-1,wickets,balls,chased:false,
          pp:Math.round((chasePotential.pp||0)*balls/120),mid:Math.round((chasePotential.mid||0)*balls/120),death:Math.round((chasePotential.death||0)*balls/120)};
      }
      return chasePotential;
    }`;
if (!content.includes(anchor)) { console.error('PATCH FAILED - resolveChase anchor'); process.exit(1); }
content = content.replace(anchor, gateCode);

// 5. Chase-hazard pressure surgery (the AO fix): release inflates wicket hazard
// while chasing behind the rate by up to (1+pressure*.65); flattening to *.00
// removes the systematic chase-collapse bias while keeping per-ball variance,
// edge-based mismatches and ground conditions intact.
const PRESSURE_ANCHOR = '(1+Math.max(0,pressure)*.65)';
if (!content.includes(PRESSURE_ANCHOR)) { console.error('PATCH FAILED - pressure anchor'); process.exit(1); }
content = content.replace(PRESSURE_ANCHOR, `(1+Math.max(0,pressure)*${MULT.toFixed(2)})`);

// 6. Club reveal / selection cards: one consistent stadium row.
// Full ground name and trait stay in the club guide.
content = content.replace(
  '<div class="g8clubground"><div>${X.icon(\'building-stadium\')}<strong>${esc(c.ground)}</strong></div><p>${esc(c.trait)}</p></div>',
  '<div class="g8clubground" title="${esc(c.ground)}"><div>${X.icon(\'building-stadium\')}<strong>${esc(cardGround(c))}</strong></div></div>'
);
content = content.replace(
  'return `<article data-key="club-${i}"',
  ' const cardGround=c=>({SRH:\'Rajiv Gandhi Stadium\',LSG:\'Ekana Stadium\',PBKS:\'Mullanpur Stadium\'})[c.abbr]||c.ground;\n return `<article data-key="club-${i}"'
);
const oldGroundCss = `#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground{background:var(--gcc-raised)!important;border-color:var(--gcc-line)!important;border-left-color:var(--accent)!important}
#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground .g8icon{color:var(--gcc-muted)!important}`;
const newGroundCss = `#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground{display:flex;align-items:center;min-height:44px;margin-top:auto;padding:4px 0;background:transparent!important;border:0!important;border-radius:0;box-shadow:none}
#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground>div{display:flex;align-items:center;gap:8px;min-width:0}
#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground strong{font-size:13px;line-height:1.4;font-weight:600;overflow-wrap:normal;word-break:normal}
#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground .g8icon{display:block!important;color:var(--gcc-muted)!important}`;
if (!content.includes(oldGroundCss)) { console.error('PATCH FAILED - club ground css'); process.exit(1); }
content = content.replace(oldGroundCss, newGroundCss);

fs.writeFileSync(OUT_HTML, content);
const candidateHtml = path.join(__dirname, 'candidates', 'v116-authenticity-candidate.html');
fs.writeFileSync(candidateHtml, content);
const sha = crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
fs.writeFileSync(path.join(__dirname, 'candidates', 'CANDIDATE_SHA256.txt'), sha + '\n');
console.log(`Final candidate written: ${OUT_HTML}`);
console.log(`Published candidate: ${candidateHtml}`);
console.log(`SHA-256 ${sha}`);
console.log(`Params: baseline=${BASELINE} gate=${GATE} variance=${VARIANCE} dampen=-${DAMPEN} pressureMult=${MULT} marginGate=0.60`);
