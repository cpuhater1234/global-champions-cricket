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
const newGroundCss = `#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground{display:flex;align-items:center;justify-content:flex-start;min-height:0;margin-top:2px;padding:0;background:transparent!important;border:0!important;box-shadow:none;text-align:left}
#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground>div{display:flex;align-items:center;justify-content:flex-start;gap:8px;width:auto;min-width:0}
#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground strong{font-size:13px;line-height:1.4;font-weight:600;overflow-wrap:normal;word-break:normal}
#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground .g8icon{display:block!important;color:var(--gcc-muted)!important}`;
if (!content.includes(oldGroundCss)) { console.error('PATCH FAILED - club ground css'); process.exit(1); }
content = content.replace(oldGroundCss, newGroundCss);

const oldPlan = '/* The three cricket decisions absorb their share of the height, instead of leaving an empty lower half. */\n#g8dialog#g8dialog#g8dialog .g8clubplan .g8briefbody{height:100%!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities{display:flex!important;flex-direction:column!important;justify-content:space-between!important;flex:1!important;list-style:none!important;gap:0!important;margin:0!important;padding:0!important;min-height:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li{display:grid!important;grid-template-columns:1.4rem minmax(0,1fr)!important;gap:.55rem!important;align-items:start!important;flex:1 0 auto!important;margin:0!important;padding:.55rem 0!important;border:0!important;border-top:1px solid var(--gcc-line,#5f635d)!important;background:none!important;box-shadow:none!important;min-width:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li:first-child{border-top:0!important;padding-top:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li:last-child{padding-bottom:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities .g8prioritynumber{display:block!important;min-width:0!important;width:auto!important;height:auto!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#f2f7fc!important;font:900 1.15rem/1.2 Arial,Helvetica,sans-serif!important;text-align:left!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities strong{display:block!important;margin:0 0 .16rem!important;font-size:.91rem!important;line-height:1.3!important;color:var(--gcc-text,#eef5fa)!important;font-weight:800!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities p{margin:0!important;font-size:.89rem!important;line-height:1.39!important;color:var(--gcc-muted,#a5b7c3)!important}\n';
const newPlan = '/* Build your side is a tight plan. Do not stretch the three notes to the ground column. */\n#g8dialog#g8dialog#g8dialog .g8clubbrief{align-items:start!important}\n#g8dialog#g8dialog#g8dialog .g8clubplan{height:auto!important}\n#g8dialog#g8dialog#g8dialog .g8clubplan .g8briefbody{height:auto!important}\n#g8dialog#g8dialog#g8dialog .g8clubplan{margin-top:-8px!important}\n#g8dialog#g8dialog#g8dialog .g8clubplan .g8briefhead{margin-bottom:6px!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities{display:grid!important;gap:8px!important;margin:0!important;padding:0!important;list-style:none!important;flex:none!important;justify-content:start!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li{display:grid!important;grid-template-columns:28px minmax(0,1fr)!important;gap:10px!important;align-items:center!important;flex:none!important;margin:0!important;padding:10px 12px!important;border:1px solid var(--gcc-line,#5f635d)!important;border-radius:8px!important;background:rgba(255,255,255,.035)!important;box-shadow:none!important;min-width:0!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li:first-child{border-top:1px solid var(--gcc-line,#5f635d)!important;padding-top:10px!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities>li:last-child{padding-bottom:10px!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities .g8prioritynumber{display:grid!important;place-items:center!important;align-self:center!important;width:28px!important;height:28px!important;min-width:28px!important;padding:0!important;margin:0!important;border-radius:6px!important;background:rgba(127,224,238,.16)!important;box-shadow:none!important;color:#d7f6fb!important;font:800 14px/1 Arial,Helvetica,sans-serif!important;text-align:center!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities li>div{min-width:0!important;display:flex!important;flex-direction:column!important;justify-content:center!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities strong{display:block!important;margin:0 0 2px!important;font-size:16px!important;line-height:1.25!important;color:var(--gcc-text,#eef5fa)!important;font-weight:800!important}\n#g8dialog#g8dialog#g8dialog .g8clubpriorities p{margin:0!important;font-size:15px!important;line-height:1.35!important;color:var(--gcc-muted,#a5b7c3)!important}\n';
if (!content.includes(oldPlan)) { console.error('PATCH FAILED - build your side'); process.exit(1); }
content = content.replace(oldPlan, newPlan);
content = content.replace(
  '#g8app .g8heroart .g8homestadium .g8stadiumphoto{object-fit:contain!important;background:#17191a!important}',
  '#g8app .g8heroart .g8homestadium .g8stadiumphoto{object-fit:cover!important;object-position:center center!important;background:#17191a!important}'
);
content = content.replace(
  '#g8app .g8heroart .g8homestadium .g8stadiumphoto{object-fit:cover!important;object-position:50% 65%!important}',
  '#g8app .g8heroart .g8homestadium .g8stadiumphoto{object-fit:cover!important;object-position:center center!important}'
);
content = content.replace(
  '#g8stage#g8stage#g8stage .g8homestadium .g8stadiumphoto{animation:vx-ken 24s ease-in-out infinite alternate!important}',
  '#g8stage#g8stage#g8stage .g8homestadium .g8stadiumphoto{animation:vx-ken 24s ease-in-out infinite alternate!important;object-fit:cover!important;object-position:center center!important;transform-origin:center center!important}'
);

content = content.replace("return{fx,c,text:`${fav?`${fav==='SPIN'?'Spin':'Pace'} has the stronger conditions rating.`:'No clear pace or spin advantage in the conditions ratings.'} ${options.length} regular ${fav?fav.toLowerCase()+' ':''}bowling option${options.length===1?'':'s'} in your XI.${bench?' '+bench.name+' is fit on the bench.':''}`};};", "const count=options.length,kind=fav==='SPIN'?'spinner':fav==='PACE'?'seamer':'bowler',pitch=fav==='SPIN'?'The pitch should help the spinners.':fav==='PACE'?'The pitch should help the seamers.':'Nothing in the pitch particularly suits seam or spin.',named=count===0?`No ${kind} is named.`:`${count===1?'One':count} ${kind}${count===1?' is':'s are'} named.`;return{fx,c,text:`${pitch} ${named}${bench?` ${bench.name} is available.`:''}`};};");
if (content.split("const count=options.length,kind=fav==='SPIN'?'spinner':fav==='PACE'?'seamer':'bowler',pitch=fav==='SPIN'?'The pitch should help the spinners.':fav==='PACE'?'The pitch should help the seamers.':'Nothing in the pitch particularly suits seam or spin.',named=count===0?`No ${kind} is named.`:`${count===1?'One':count} ${kind}${count===1?' is':'s are'} named.`;return{fx,c,text:`${pitch} ${named}${bench?` ${bench.name} is available.`:''}`};};").length !== 2) { console.error('PATCH FAILED - conditions wording'); process.exit(1); }
content = content.replace(
  'function draftNeeds(root){\n   const companion',
  'function draftNeeds(){}\nfunction unusedDraftNeeds(root){\n   const companion'
);
const listCss = '/* Player lists stay on one line. The XI picker is left as it is. */\n#g8app#g8app#g8app .gccui .gccuiPlayers{grid-template-columns:1fr!important;gap:6px!important;padding:8px!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayer{display:grid!important;grid-template-columns:minmax(210px,1.35fr) minmax(150px,.8fr) auto!important;align-items:center!important;border-width:1px!important;border-left:3px solid var(--role-edge,#e2b368)!important;border-radius:6px!important;min-height:0!important;transform:none!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayer::before,#g8app#g8app#g8app .gccuiPlayers .gccuiPlayer::after{display:none!important;content:none!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayer:hover{transform:none!important;box-shadow:none!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerScout{grid-template-columns:44px minmax(0,1fr)!important;gap:10px!important;align-items:center!important;padding:7px 10px!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerMonogram{display:none!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerOverall{width:44px!important;padding:0!important;border:0!important;background:transparent!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerOverall .gccuiRating,#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerOverall strong{font-size:22px!important;line-height:1!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerOverall small{display:none!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerIdentity{gap:2px!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerIdentity>b{font-size:15px!important;line-height:1.2!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerSkills{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:12px!important;padding:0 8px!important;border:0!important;background:transparent!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerSkills>div{display:flex!important;align-items:baseline!important;gap:5px!important;padding:0!important;border:0!important;text-align:left!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerSkills dt{margin:0!important;font-size:11px!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerSkills dd{margin:0}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerSkills .gccuiRating{font-size:16px!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiSortRead{padding:0 8px!important;border:0!important;background:transparent!important;white-space:nowrap}\n#g8app#g8app#g8app .gccuiPlayers .gccuiPlayer>footer{padding:4px 8px!important;border:0!important;background:transparent!important;gap:6px!important}\n#g8app#g8app#g8app .gccuiPlayers .gccuiScoutAction{display:none!important}\n#g8app#g8app#g8app .gccuiRoleCoverage>header>span{display:none!important}\n#g8app#g8app#g8app .gccuiRoleCoverage>div{display:flex!important;flex-wrap:wrap!important;gap:6px!important}\n#g8app#g8app#g8app .gccuiCoverageItem{display:inline-flex!important;align-items:baseline!important;gap:5px!important;width:auto!important;padding:4px 8px!important;border:1px solid var(--gcc-line)!important;border-radius:999px!important}\n#g8app#g8app#g8app .gccuiCoverageTrack{display:none!important}\n#g8app#g8app#g8app .gccuiPickedPlayer{padding:6px 8px!important;gap:8px!important}\n#g8app#g8app#g8app .gccuiPickedPlayer>span{gap:1px!important}\n#g8app#g8app#g8app .gccuiPickedPlayer small:first-of-type{display:none!important}\n#g8app#g8app#g8app .gccuiPickedPlayer>.gccuiRating{font-size:18px!important}\n#g8app#g8app#g8app .g8managerow{padding:8px 0!important;align-items:center!important}\n#g8app#g8app#g8app .g8manageidentity p{margin:2px 0!important}\n@media(max-width:760px){\n #g8app#g8app#g8app .gccuiPlayers .gccuiPlayer{grid-template-columns:minmax(0,1fr) auto!important}\n #g8app#g8app#g8app .gccuiPlayers .gccuiPlayerSkills{grid-column:1/-1;justify-content:flex-start!important;padding:0 10px 8px!important}\n #g8app#g8app#g8app .gccuiPlayers .gccuiPlayer>footer{display:flex!important}\n #g8app#g8app#g8app .gccuiPlayers .gccuiPlayer>footer button{width:auto!important}\n}\n';
const styleAnchor = '</style>\n<script id="gcc-v116-perfection-behaviour">';
if (!content.includes(styleAnchor)) { console.error('PATCH FAILED - list density'); process.exit(1); }
content = content.replace(styleAnchor, listCss + '\n' + styleAnchor);


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



const copyFixes = [
  ["`A regular ${R.bowlingStyle(p)==='SPIN'?'spin':'pace'} bowling option.`", "`${R.bowlingStyle(p)==='SPIN'?'Spin bowler.':'Seam bowler.'}`"],
  ["type==='Batting specialist'?null:type.replace(' bowler','')+' option'", "type==='Batting specialist'?null:'Bowls '+type.replace(' bowler','').toLowerCase()"],
  ["'Emergency bowling option'", "'Not a frontline bowler'"],
  ["Counts show options, not targets. Players can cover several roles.", "A player can count in more than one role."],
  ["Best available XI from your squad", "Best XI from this squad"],
  ["`Projection from ${available} player${available===1?'':'s'}`", "`From ${available} player${available===1?'':'s'} so far`"],
  ["Use the grip with a specialist spinner and accurate middle-overs bowling.", "Use the grip with your spinner, and bowl accurately through the middle overs."],
  ["Scout the batting and bowling options before making changes.", "Scout batters and bowlers before you change the squad."],
  ["Your squad needs a recognised keeper and enough bowling options.", "Your squad needs a keeper and enough bowlers."],
  ["Keep batting and bowling options across the phases, with variation and flexibility rather than one narrow plan.", "Keep batters and bowlers for every phase, with variation rather than one narrow plan."],
];
for (const [from, to] of copyFixes) {
  if (!content.includes(from)) { console.error('PATCH FAILED - copy: ' + from.slice(0, 60)); process.exit(1); }
  content = content.replace(from, to);
}
function patchOnce(label, from, to) {
  if (!content.includes(from)) { console.error('PATCH FAILED - ' + label); process.exit(1); }
  content = content.replace(from, to);
}
patchOnce('commitment',
  'const X=window.GCC8,{G,ui,esc,btn,badge,R}=X,s=G.state;',
  "const X=window.GCC8,{G,ui,esc,btn,badge,R}=X,s=G.state;\n X.nextCommitment=()=>{try{const fx=G.nextUserFixture();if(!fx||!s.userClub)return '';const problem=X.read?.xiProblem?.()||'';if(problem){const out=/^(.*) is out\\./.exec(problem);if(out)return out[1]+' is out.';if(/wicketkeeper/i.test(problem))return 'No keeper is named.';if(/duplicate/i.test(problem))return 'The XI lists the same player twice.';if(/no longer on the list/i.test(problem))return 'A selected player has left the squad.';return 'The XI is short.';}const person=X.selectionLine?.()||'';if(person)return person;const opp=fx.home.abbr===s.userClub.abbr?fx.away:fx.home;const ground=G.matchGroundForFixture(fx);const place=ground?.ground||fx.home.ground||'the next ground';const spin=Number(ground?.conditions?.spin)||0,pace=Number(ground?.conditions?.pace)||0;if(spin>=3&&spin>pace)return 'The pitch at '+place+' should help the spinners.';if(pace>=3&&pace>spin)return 'The pitch at '+place+' should help the seamers.';return opp.name+' are next, at '+place+'.';}catch(e){return ''}};"
);
patchOnce('result path',
  "X.views.result=()=>{const html=result(),r=ui.result,regular=s.results.includes(r),next=regular?G.nextUserFixture():null,back=btn(regular?(next?'Next match':'League wrap-up'):'Back to finals',regular?'matchday':'finalsReturn',[],'g8primary')",
  "X.views.result=()=>{const html=result(),r=ui.result,regular=s.results.includes(r),next=regular?G.nextUserFixture():null,openQ=regular&&next?(X.nextCommitment()||''):'',back=openQ?btn('Name the side','nameSide',[],'g8primary'):btn(regular?(next?'Next match':'League wrap-up'):'Back to finals',regular?'matchday':'finalsReturn',[],'g8primary')"
);
patchOnce('strip old result button',
  "body=body.replace(book,'').replace(back,'');",
  "const legacyBack=btn(regular?(next?'Next match':'League wrap-up'):'Back to finals',regular?'matchday':'finalsReturn',[],'g8primary');body=body.replace(book,'').replace(legacyBack,'').replace(back,'');"
);
patchOnce('result question',
  '<div class="gccuiResultActions">${book}${back}</div></div>${body}</div>',
  '<div class="gccuiResultActions">${book}${back}</div>${openQ?`<p class="gccuiOpenQuestion" role="status">${esc(openQ)}</p>`:\'\'}</div>${body}</div>'
);
patchOnce('xi question',
  "X.views.team=()=>{\n  const roster=X.roster()",
  "X.views.team=()=>{\n  const openQ=ui.teamReturn==='finals'?'':(X.nextCommitment()||''),roster=X.roster()"
);
patchOnce('xi header',
  "<div class=\"gccuiSelectionHeader\">${title(`${s.year} · ${s.userClub.name}`,'Name your XI','','stumps')}<section class=\"gccuiSelectionStatus\"",
  "<div class=\"gccuiSelectionHeader\">${title(`${s.year} · ${s.userClub.name}`,'Name your XI','','stumps')}${openQ?`<p class=\"gccuiOpenQuestion\" role=\"status\">${esc(openQ)}</p>`:''}<section class=\"gccuiSelectionStatus\""
);
patchOnce('selection line',
  "journal=()=>E.clean(s.dynasty?.v8Stories,identify());",
  "journal=()=>E.clean(s.dynasty?.v8Stories,identify());\n X.selectionLine=()=>{try{const e=[...journal().events].reverse().find(x=>x.year===s.year&&x.club===own());if(!e?.arc?.incumbent?.name||!e?.arc?.challenger?.name)return '';return e.arc.incumbent.name+' or '+e.arc.challenger.name+'.';}catch(err){return ''}};"
);
patchOnce('one result question',
  "const decision=consequences;",
  "const decision=openQ?'':consequences;"
);
patchOnce('match hold',
  "X.matchDelay=(m,r)=>{if(m?.presentationVersion!==3)return [1500,750,375][m?.speedIndex||0];const next=X.deliveryFrames(r)[X.matchProgress(m)];return [700,350,175,88][m.speedIndex||0]*(next?.kind==='notice'?1.8:1);};",
  "X.matchDelay=(m,r)=>{if(m?.presentationVersion!==3)return [1500,750,375][m?.speedIndex||0];const next=X.deliveryFrames(r)[X.matchProgress(m)],base=[700,350,175,88][m.speedIndex||0];let weight=1;if(next?.kind==='notice')weight=1.8;else if(next?.event){const e=next.event,ballsLeft=next.target==null?null:Math.max(0,120-(Number(e.balls)||0)),runsLeft=next.target==null?null:Math.max(0,next.target-(Number(e.total)||0)),close=ballsLeft!=null&&runsLeft!=null&&ballsLeft<=12&&runsLeft<=18,death=e.phase==='death'||Number(e.over)>=16,boundary=Number(e.runs)>=4;if(e.wicket&&(close||death))weight=2.6;else if(e.wicket)weight=2.1;else if(close&&boundary)weight=2.4;else if(close)weight=1.7;else if(death&&boundary)weight=1.6;}return Math.round(base*weight);};"
);
patchOnce('name the side',
  "bind('matchday',['result'],()=>{ui.seasonTab='matchday';G.go('season');setView('season');});",
  "bind('matchday',['result'],()=>{ui.seasonTab='matchday';G.go('season');setView('season');});\n bind('nameSide',['result'],()=>{ui.teamPane='xi';ui.teamReturn='season';setView('team');});"
);
if (!content.includes('id="gcc-standard"')) {
  content = content.replace('</body></html>', `<style id="gcc-standard">
#g8app .g8board .g8player,#g8app .g8contract .g8player,#g8app .g8recruitcard,#g8app .g8draftplayer{min-height:0!important;height:auto!important}
#g8app .g8playerhead{min-height:0!important}
#g8app :is(.gccuiRating,.g8rowrating,.g8table td,.g8table th,.g8analysisrow>strong,.g8teamrating strong),
#g8dialog :is(.gccuiRating,.g8rowrating,.g8table td,.g8table th,.g8analysisrow>strong,.g8teamrating strong){font-variant-numeric:tabular-nums}
#g8app .g8conditionbrief,#g8app .g8selectionground p{margin:2px 0 0!important;max-width:68ch;font-size:14px!important;line-height:1.45!important;color:var(--gcc-muted,#a9b7c0)!important}
#g8app .gccuiCompanion>:not(.gccuiClubHead){margin:10px!important;max-width:calc(100% - 20px)!important}
#g8app .gccui .gccuiClubHead{padding:12px 14px!important;gap:10px!important}
#g8app .gccui .gccuiClubHead h2{font-size:18px!important}
#g8app .gccui .gccuiClubHead p{margin-top:2px!important}
#g8app .gccuiRoleCoverage>header{margin:0 0 8px!important;padding:0!important;border:0!important}
#g8app .gccuiRoleCoverage h3{font-size:12px!important;letter-spacing:.08em!important;text-transform:uppercase!important;font-weight:800!important;color:var(--gcc-muted)!important}
#g8app .gccuiPlayers .gccuiPlayer:hover,#g8app .gccuiPickedPlayer:hover,#g8app .g8squadmember:hover{transform:none!important;box-shadow:none!important}
#g8app .g8managerow,#g8app .gccuiPickedPlayer,#g8app .gccuiBenchRow{min-height:0!important}
#g8stage#g8stage#g8stage :is(.g8invitationgrid,.g8clubchooser) .g8clubground{display:flex!important;align-items:center!important;justify-content:flex-start!important;min-height:0!important;height:auto!important;margin:2px 0 0!important;padding:0!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important;text-align:left!important}
#g8stage#g8stage#g8stage :is(.g8invitationgrid,.g8clubchooser) .g8clubground>div{display:flex!important;align-items:center!important;justify-content:flex-start!important;width:auto!important;gap:8px!important;margin:0!important}
#g8stage#g8stage#g8stage :is(.g8invitationgrid,.g8clubchooser) .g8clubground .g8icon{display:block!important;width:16px!important;height:16px!important;flex:0 0 16px!important;margin:0!important;color:var(--gcc-muted)!important}
#g8stage#g8stage#g8stage :is(.g8invitationgrid,.g8clubchooser) .g8clubground strong{text-align:left!important;font-size:14px!important;font-weight:600!important;line-height:1.2!important}
#g8stage#g8stage#g8stage .g8invitationgrid .gccuiClubMeta{display:none!important}
#g8stage#g8stage#g8stage .g8invitationgrid .g8clubbody h3{min-height:0!important}
#g8app#g8app#g8app .gccuiPlayers .gccuiPlayer{grid-template-columns:minmax(0,1fr) auto!important;min-height:0!important}
#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerSkills,#g8app#g8app#g8app .gccuiPlayers .gccuiPlayerBio{display:none!important}
#g8dialog#g8dialog#g8dialog .g8clubidentitypanel{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:8px 10px!important;margin:0 0 8px!important;padding:0!important;min-height:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
#g8dialog#g8dialog#g8dialog .g8clubidentitytext{flex:1 0 100%!important;margin:0!important;font-size:14px!important;line-height:1.4!important}
#g8app .gccuiResultTop{flex-wrap:wrap}
#g8app .gccuiOpenQuestion{flex:1 0 100%;margin:8px 0 0;font-size:16px;line-height:24px;font-weight:600;color:var(--gcc-text,#eef5fa)}
#g8app .gccuiSelectionHeader>.gccuiOpenQuestion{display:block;grid-column:1/-1;margin:0}
</style>
</body></html>`);
}

fs.writeFileSync(OUT_HTML, content);
const candidateHtml = path.join(__dirname, 'candidates', 'v116-authenticity-candidate.html');
fs.writeFileSync(candidateHtml, content);
const sha = crypto.createHash('sha256').update(content).digest('hex').toUpperCase();
fs.writeFileSync(path.join(__dirname, 'candidates', 'CANDIDATE_SHA256.txt'), sha + '\n');
console.log('Final candidate written: ' + OUT_HTML);
console.log('Published candidate: ' + candidateHtml);
console.log('SHA-256 ' + sha);
console.log('Params: baseline=' + BASELINE + ' gate=' + GATE + ' variance=' + VARIANCE + ' dampen=-' + DAMPEN + ' pressureMult=' + MULT + ' chaseRewrite=removed');
