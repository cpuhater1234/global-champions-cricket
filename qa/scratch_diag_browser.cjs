/** Probe: fix XI selection then reach match screens. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
(async () => {
  const raw = fs.readFileSync('qa/results/whole-ui-career/checkpoint-2009.json', 'utf8');
  const browser = await chromium.launch({ executablePath: process.env.GCC8_CHROMIUM, headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(raw => { Date.now = () => 1794484800000; let n = 101; Math.random = () => { n = (Math.imul(1664525, n) + 1013904223) >>> 0; return n / 4294967296; }; localStorage.setItem('gcc_dynasty_v8', raw); }, raw);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await page.route(/^https?:/, r => r.abort());
  await page.goto(pathToFileURL(path.resolve('qa/results/v116-authenticity-candidate.html')).href);
  await page.waitForFunction(() => !!window.GCC8?.dispatch, null, { timeout: 60000 });
  const out = await page.evaluate(() => {
    const out = [];
    const step = (n, ...args) => { const ok = GCC8.dispatch(n, args); out.push(n + (ok ? '' : '!') + '>' + window.GCC8.ui?.view); };
    step('continue'); step('home'); step('play'); step('fresh'); step('world'); step('revealAll'); step('clubs'); step('club',0); step('confirmClub');
    step('signingRun'); step('signingSkip'); step('draftDraw'); step('revealAll'); step('beginDraft');
    let guard = 0;
    while (window.GCC8.G.state.pickIndex < 120 && guard++ < 400) {
      const before = window.GCC8.G.state.pickIndex;
      const needKeeper = !GCC8.roster().some(x => x.keeping >= 65);
      const pool = GCC8.pool();
      const target = (needKeeper && pool.find(x => x.keeping >= 65)) || pool.find(x => x.maxOvers >= 4) || pool[0];
      if (!GCC8.dispatch('skipPick') || window.GCC8.G.state.pickIndex === before) {
        if (!GCC8.dispatch('draftPlayer', [target.id])) break;
      }
    }
    step('team');
    // build XI: keeper + bowlers + fill
    const roster = GCC8.roster();
    const keeper = roster.find(p => p.keeping >= 65) || roster[0];
    const bowlers = roster.filter(p => p.id !== keeper.id && p.maxOvers >= 4).slice(0, 5);
    const bats = roster.filter(p => p.id !== keeper.id && !bowlers.includes(p)).slice(0, 5);
    GCC8.dispatch('clearXI');
    for (const p of [keeper, ...bowlers, ...bats]) GCC8.dispatch('select', [p.id]);
    out.push('xiSize=' + GCC8.G.state.xi.length);
    const lodgeOk = GCC8.dispatch('lodge');
    out.push('lodge=' + lodgeOk + ' fb=' + (document.querySelector('#g8feedback')?.textContent || '').slice(0, 100));
    if (lodgeOk) {
      step('prepare');
      step('playMatch', GCC8.G.state.round + 1);
      step('matchSkip');
      out.push('afterMatch view=' + window.GCC8.ui?.view);
      step('matchday');
      step('result');
      out.push('final view=' + window.GCC8.ui?.view);
    }
    return out;
  });
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
