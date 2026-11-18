/**
 * Build the authenticity candidate from the frozen v116 release.
 * Gameplay: baseline 6.10, gate 0.13, variance 0.38, dampen -0.55,
 * chase-hazard pressure multiplier 0.00.
 * The post-match thin-margin chase rewrite is not applied. A chase result
 * is the ball-by-ball innings, so the scorecard and the save still add up.
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

content = content.replace('let expectedWickets = 6.35', `let expectedWickets = ${BASELINE.toFixed(2)}`);
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

const wicketBlockRe = /const wicketProbability = Math\.max\(0\.04, Math\.min\(0\.96, expectedWickets \/ 10 \+ \(rng\(\) - 0\.5\) \* 0\.90\)\);\r?\n\s*let wickets = 0;\r?\n\s*for \(let i = 0; i < 10; i\+\+\) if \(rng\(\) < wicketProbability\) wickets \+= 1;/;
const wicketReplacement = `const wicketProbability = Math.max(0.05, Math.min(0.75, expectedWickets / 10 + (rng() - 0.5) * ${VARIANCE}));
    let wickets = 0;
    for (let i = 0; i < 9; i++) if (rng() < wicketProbability) wickets += 1;
    if (wickets === 9 && rng() < wicketProbability * ${GATE}) wickets = 10;`;
const before = content.length;
content = content.replace(wicketBlockRe, wicketReplacement);
if (content.length === before) { console.error('PATCH FAILED - wicket block'); process.exit(1); }

// The thin-margin chase rewrite used to live here. It changed the innings total
// after the balls had been played, so the scorecard and the save no longer added up.
// Chases now return the delivery innings unchanged.

const PRESSURE_ANCHOR = '(1+Math.max(0,pressure)*.65)';
if (!content.includes(PRESSURE_ANCHOR)) { console.error('PATCH FAILED - pressure anchor'); process.exit(1); }
content = content.replace(PRESSURE_ANCHOR, `(1+Math.max(0,pressure)*${MULT.toFixed(2)})`);

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

const oldPlan = '/* The three cricket decisions absorb their share of the height, instead of leaving an empty lower half. */\n#g8dialog#g8dialog#g8dialog .g8clubplan .g8briefbody{height:100%!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities{display:flex!important;flex-direction:column!important;justify-content:space-between!important;flex:1!important;list-style:none!important;gap:0!important;margin:0!important;padding:0!important;min-height:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li{display:grid!important;grid-template-columns:1.4rem minmax(0,1fr)!important;gap:.55rem!important;align-items:start!important;flex:1 0 auto!important;margin:0!important;padding:.55rem 0!important;border:0!important;border-top:1px solid var(--gcc-line,#5f635d)!important;background:none!important;box-shadow:none!important;min-width:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li:first-child{border-top:0!important;padding-top:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li:last-child{padding-bottom:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities .g8prioritynumber{display:block!important;min-width:0!important;width:auto!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#f2f7fc!important;font:900 1.15rem/1.2 Arial,Helvetica,sans-serif!important;text-align:left!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities strong{display:block!important;margin:0 0 .16rem!important;font-size:.91rem!important;line-height:1.3!important;color:var(--gcc-text,#eef5fa)!important;font-weight:800!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities p{margin:0!important;font-size:.89rem!important;line-height:1.39!important;color:var(--gcc-muted,#a5b7c3)!important}\n';
const newPlan = '/* Build your side is a tight plan. Do not stretch the three notes to the ground column. */\n#g8dialog#g8dialog#g8dialog .g8clubbrief{align-items:start!important}\n#g8dialog#g8dialog#g8dialog .g8clubplan{height:auto!important}\n#g8dialog#g8dialog#g8dialog .g8clubplan .g8briefbody{height:auto!important}\n#g8dialog#g8dialog#g8dialog .g8clubplan{margin-top:-8px!important}\n#g8dialog#g8dialog#g8dialog .g8clubplan .g8briefhead{margin-bottom:6px!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities{display:grid!important;gap:8px!important;margin:0!important;padding:0!important;list-style:none!important;flex:none!important;justify-content:start!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li{display:grid!important;grid-template-columns:28px minmax(0,1fr)!important;gap:10px!important;align-items:center!important;flex:none!important;margin:0!important;padding:10px 12px!important;border:1px solid var(--gcc-line,#5f635d)!important;border-radius:8px!important;background:rgba(255,255,255,.035)!important;box-shadow:none!important;min-width:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li:first-child{border-top:1px solid var(--gcc-line,#5f635d)!important;padding-top:10px!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li:last-child{padding-bottom:10px!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities .g8prioritynumber{display:grid!important;place-items:center!important;align-self:center!important;width:28px!important;height:28px!important;min-width:28px!important;padding:0!important;margin:0!important;border-radius:6px!important;background:rgba(127,224,238,.16)!important;box-shadow:none!important;color:#d7f6fb!important;font:800 14px/1 Arial,Helvetica,sans-serif!important;text-align:center!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities li>div{min-width:0!important;display:flex!important;flex-direction:column!important;justify-content:center!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities strong{display:block!important;margin:0 0 2px!important;font-size:16px!important;line-height:1.25!important;color:var(--gcc-text,#eef5fa)!important;font-weight:800!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities p{margin:0!important;font-size:15px!important;line-height:1.35!important;color:var(--gcc-muted,#a5b7c3)!important}\n';
if (!content.includes(oldPlan)) { console.error('PATCH FAILED - build your side'); process.exit(1); }
content = content.replace(oldPlan, newPlan);

const oldIdentity = `/* Club identity: one concise crest-and-metadata band with its actual scouting voice directly below. */
#g8dialog#g8dialog#g8dialog .g8clubidentitypanel{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;grid-template-rows:auto auto!important;align-items:center!important;gap:0!important;margin:0!important;padding:0!important;min-height:0!important;border:1px solid var(--gcc-line,#5f635d)!important;border-left:3px solid var(--club-accent,#ed7547)!important;border-radius:9px!important;background:color-mix(in srgb,var(--club-accent,#ed7547) 8%,#171d26)!important;box-shadow:none!important;overflow:hidden!important}
#g8dialog#g8dialog#g8dialog .g8clubidentitypanel .g8clubmark{grid-column:1!important;grid-row:1!important;padding:.6rem .5rem .6rem .75rem!important;margin:0!important;min-width:0!important;border:0!important;background:transparent!important;align-self:center!important}`;
const newIdentity = `/* Club identity: crest, one meta line, one sentence. No second band. */
#g8dialog#g8dialog#g8dialog .g8clubidentitypanel{display:grid!important;grid-template-columns:auto minmax(0,1fr)!important;grid-template-rows:auto auto!important;align-items:center!important;column-gap:12px!important;row-gap:2px!important;margin:0 0 10px!important;padding:8px 12px!important;min-height:0!important;border:1px solid var(--gcc-line,#5f635d)!important;border-left:3px solid var(--club-accent,#ed7547)!important;border-radius:9px!important;background:color-mix(in srgb,var(--club-accent,#ed7547) 7%,#171d26)!important;box-shadow:none!important;overflow:hidden!important}
#g8dialog#g8dialog#g8dialog .g8clubidentitypanel .g8clubmark{grid-column:1!important;grid-row:1 / span 2!important;padding:0!important;margin:0!important;min-width:0!important;border:0!important;background:transparent!important;align-self:center!important}`;
if (!content.includes(oldIdentity)) { console.error('PATCH FAILED - club identity'); process.exit(1); }
content = content.replace(oldIdentity, newIdentity);
content = content.replace(
  '#g8dialog#g8dialog#g8dialog .g8clubmetastrip{grid-column:2!important;grid-row:1!important;display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:.25rem .75rem!important;margin:0!important;padding:.65rem .75rem .65rem .3rem!important;background:transparent!important;border:0!important;min-width:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubmetastrip>span{display:inline-block!important;padding:0!important;border:0!important;min-width:0!important;background:none!important;color:var(--gcc-text,#eef5fa)!important;font-size:.86rem!important;font-weight:700!important;line-height:1.35!important;letter-spacing:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubmetastrip>span+span{border-left:1px solid var(--gcc-line,#5f635d)!important;padding-left:.75rem!important}\n#g8dialog#g8dialog#g8dialog .g8clubmetastrip>span+span::before{content:none!important}\n#g8dialog#g8dialog#g8dialog .g8clubidentitytext{grid-column:1/-1!important;grid-row:2!important;margin:0!important;padding:.62rem .82rem!important;border-top:1px solid var(--gcc-line,#5f635d)!important;background:transparent!important;color:var(--gcc-muted,#a5b7c3)!important;font-size:.9rem!important;line-height:1.4!important;max-width:none!important}',
  '#g8dialog#g8dialog#g8dialog .g8clubmetastrip{grid-column:2!important;grid-row:1!important;display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:0 .35rem!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;min-width:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubmetastrip>span{display:inline!important;padding:0!important;border:0!important;min-width:0!important;background:none!important;color:var(--gcc-muted,#a5b7c3)!important;font-size:12px!important;font-weight:700!important;line-height:1.3!important;letter-spacing:.04em!important;text-transform:uppercase!important}\n#g8dialog#g8dialog#g8dialog .g8clubmetastrip>span+span{border:0!important;padding:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubmetastrip>span+span::before{content:"·"!important;margin:0 .35rem 0 0!important;color:var(--gcc-muted,#a5b7c3)!important}\n#g8dialog#g8dialog#g8dialog .g8clubidentitytext{grid-column:2!important;grid-row:2!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;color:var(--gcc-text,#eef5fa)!important;font-size:15px!important;line-height:1.35!important;max-width:none!important}'
);
content = content.replace(
  "return `<section class=\"g8gccrecord\"><h3>${X.icon('cricket-ball')}GCC record</h3>${record?`<span class=\"g8recordyear\">${record.year} season</span><div class=\"g8recordstats\">${[['Matches',record.stats.matches],['Runs',record.stats.runs],['Wickets',record.stats.wickets]].map(([label,n])=>`<div><strong>${Number(n||0)}</strong><span>${label}</span></div>`).join('')}</div>`:'<p class=\"g8recordempty\">No GCC appearances recorded.</p>'}</section>`;",
  "return record?`<section class=\"g8gccrecord\"><h3>${X.icon('cricket-ball')}GCC record</h3><span class=\"g8recordyear\">${record.year} season</span><div class=\"g8recordstats\">${[['Matches',record.stats.matches],['Runs',record.stats.runs],['Wickets',record.stats.wickets]].map(([label,n])=>`<div><strong>${Number(n||0)}</strong><span>${label}</span></div>`).join('')}</div></section>`:'';"
);
content = content.replace(
  "if(!latest)return `<section class=\"g8gccrecord\"><h3>${X.icon('cricket-ball')}GCC record</h3><p class=\"g8recordempty\">No GCC appearances recorded.</p></section>`;",
  "if(!latest)return '';"
);
content = content.replace(
  '.g8gccrecord{background:#f1f5ff;color:#1e2742;border:1px solid #f1f5ff;border-radius:8px;padding:.9rem;margin:.8rem 0}',
  '.g8gccrecord{background:transparent;color:inherit;border:0;border-top:1px solid var(--gcc-line,#5f635d);border-radius:0;padding:.75rem 0 0;margin:.8rem 0 0}'
);
const oldOutlook = `#g8dialog[data-prompt="player"] .gccuiProfileOverview .g8scoutoutlook{
  align-self:stretch;
  background:linear-gradient(145deg,rgba(20,48,63,.72),rgba(10,27,40,.72))!important;
  border:1px solid var(--gcc-line)!important;
  border-top:2px solid var(--gcc-accent,#67d9e6)!important;
  border-radius:8px!important;
  padding:14px 16px!important;
  min-height:100%;
  box-sizing:border-box;
}`;
const newOutlook = `#g8dialog[data-prompt="player"] .gccuiProfileOverview .g8scoutoutlook{
  align-self:start;
  background:transparent!important;
  border:0!important;
  border-radius:0!important;
  padding:0!important;
  min-height:0!important;
  box-sizing:border-box;
}`;
if (!content.includes(oldOutlook)) { console.error('PATCH FAILED - outlook'); process.exit(1); }
content = content.replace(oldOutlook, newOutlook);
content = content.replace(
`#g8dialog[data-prompt="player"] .gccuiProfileOverview .g8scoutoutlook>h3{
  margin:0 0 10px!important;
  color:var(--gcc-accent,#67d9e6)!important;
  font-size:12px!important;
  letter-spacing:.12em!important;
  text-transform:uppercase!important;
}`,
`#g8dialog[data-prompt="player"] .gccuiProfileOverview .g8scoutoutlook>h3{
  margin:2px 0 0!important;
  color:var(--gcc-text,#eef5fa)!important;
  font-size:16px!important;
  letter-spacing:0!important;
  text-transform:none!important;
  line-height:1.3!important;
}`
);


fs.writeFileSync(OUT_HTML, content);
const candidateHtml = path.join(__dirname, 'candidates', 'v116-authenticity-candidate.html');
fs.writeFileSync(candidateHtml, content);
const sha = crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
fs.writeFileSync(path.join(__dirname, 'candidates', 'CANDIDATE_SHA256.txt'), sha + '\n');
console.log('Final candidate written: ' + OUT_HTML);
console.log('Published candidate: ' + candidateHtml);
console.log('SHA-256 ' + sha);
console.log('Params: baseline=' + BASELINE + ' gate=' + GATE + ' variance=' + VARIANCE + ' dampen=-' + DAMPEN + ' pressureMult=' + MULT + ' chaseRewrite=removed');
