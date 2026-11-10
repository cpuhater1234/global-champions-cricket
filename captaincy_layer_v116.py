#!/usr/bin/env python3
"""Portable, disposable browser smoke test for the exact uploaded GCC v116 release.

Run from a repository checkout:
    python -m pip install playwright
    python -m playwright install chromium
    python captaincy_layer_v116.py --html "GCC_v116_release (1).html"

The default mode serves the supplied release on an ephemeral loopback HTTP server
and tests real browser storage inside new, private Playwright browser contexts.
`--mode isolated` is a limited fallback for environments blocking URL navigation;
its in-memory localStorage shim is NOT native save/reload acceptance.
"""
from __future__ import annotations

import argparse
from contextlib import contextmanager
import hashlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import subprocess
import sys
import threading
from playwright.sync_api import sync_playwright

OFFICIAL_SHA256 = "b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0"
DEFAULT_HTML = Path(__file__).resolve().parent / "GCC_v116_release (1).html"
# The exact original file must be used unless explicitly waived for a test build.
PARSER = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
PARSER.add_argument('--html', type=Path, default=DEFAULT_HTML, help='v116 standalone HTML file (default: alongside this test)')
PARSER.add_argument('--out-dir', type=Path, default=Path('qa/results/v116-captaincy'), help='Screenshots and JSON report directory')
PARSER.add_argument('--chromium', type=Path, help='Optional Chromium executable; uses Playwright-managed browser by default')
PARSER.add_argument('--mode', choices=('http','isolated'), default='http', help='http: native browser storage, isolated: non-native restricted-env fallback')
PARSER.add_argument('--no-hash-check', action='store_true', help='Permit an intentionally modified HTML candidate')
PARSER.add_argument('--headed', action='store_true', help='Show browser window')
PARSER.add_argument('--width', type=int, default=390)
PARSER.add_argument('--height', type=int, default=844)
PARSER.add_argument('--case', type=int, choices=(0,1), help='Run only one of the two tactical smoke cases')
PARSER.add_argument('--case-timeout', type=int, default=120, help='Timeout in seconds per isolated child process')

STORAGE_SHIM = """(()=>{const m=new Map();const api={getItem(k){return m.has(String(k))?m.get(String(k)):null},setItem(k,v){m.set(String(k),String(v))},removeItem(k){m.delete(String(k))},clear(){m.clear()},key(i){return [...m.keys()][i]||null},get length(){return m.size}};Object.defineProperty(window,'localStorage',{configurable:true,value:api});})();"""
CLICK=r"""(l)=>{const dl=document.querySelector('#g8dialog');const pool=(dl&&dl.open)?[...dl.querySelectorAll('button')]:[...document.querySelectorAll('#g8stage button')];const t=l.toLowerCase();const b=pool.filter(x=>x.offsetParent!==null&&!x.disabled).find(x=>x.textContent.replace(/\s+/g,' ').toLowerCase().includes(t));if(!b)return false;b.click();return true;}"""
ACT="""(o)=>{const els=[...document.querySelectorAll('[data-action="'+o+'"]')].filter(e=>e.offsetParent!==null&&!e.disabled);if(!els.length)return false;els[0].click();return true;}"""

@contextmanager
def temporary_release_server(data: bytes):
    class ReleaseHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path not in ('/', '/game'):
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            self.wfile.write(data)
        def log_message(self, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), ReleaseHandler)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        yield 'http://127.0.0.1:%d/game' % server.server_port
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=2)

SETTINGS = None
GAME_URL = None
HTML_BYTES = None

def load_game(pg):
    if SETTINGS.mode == 'http':
        pg.goto(GAME_URL, wait_until='load', timeout=60000)
    else:
        pg.evaluate(STORAGE_SHIM)
        pg.set_content(HTML_BYTES.decode('utf-8'), wait_until='load', timeout=60000)

def click_text(pg,t): return pg.evaluate(CLICK,t)
def click_action(pg,a): return pg.evaluate(ACT,a)

def setup_to_season(pg):
    load_game(pg); pg.wait_for_timeout(450)
    for t in ['start new career','reveal the eight clubs','reveal all','choose your club']:
        assert click_text(pg,t), f'missing {t}'
        pg.wait_for_timeout(700)
    assert pg.evaluate("()=>{const b=[...document.querySelectorAll('#g8stage [data-action=club]')].find(x=>x.offsetParent!==null);if(!b)return false;b.click();return true}")
    pg.wait_for_timeout(400); assert click_text(pg,'select club'); pg.wait_for_timeout(800)
    assert click_text(pg,'skip to end'); pg.wait_for_timeout(900)
    assert click_text(pg,'draft-order draw'); pg.wait_for_timeout(900)
    assert click_text(pg,'reveal all'); pg.wait_for_timeout(700)
    assert click_text(pg,'enter the draft room'); pg.wait_for_timeout(800)
    keeper=False
    for _ in range(115):
        if pg.evaluate("()=>document.querySelector('#g8stage')?.dataset.view")!='draft': break
        wk=pg.locator('article.g8role-WK-BAT [data-action="draftPlayer"]:visible:not([disabled])')
        if wk.count(): wk.first.click(); keeper=True
        elif not keeper:
            f=pg.locator('#g8filter:visible')
            if f.count(): f.select_option('WK-BAT'); pg.wait_for_timeout(180)
            wk=pg.locator('article.g8role-WK-BAT [data-action="draftPlayer"]:visible:not([disabled])')
            if wk.count(): wk.first.click(); keeper=True
            elif not click_text(pg,'skip to my pick'): break
        else:
            pg.evaluate("""()=>{const s=[...document.querySelectorAll('select')].find(x=>[...x.options].some(o=>/All players/i.test(o.textContent)));if(s){const o=[...s.options].find(o=>/All players/i.test(o.textContent));s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}))}}""")
            if not click_text(pg,'Pick'): click_text(pg,'skip to my pick')
        pg.wait_for_timeout(130)
    wk=pg.locator('.gccuiBenchRow.g8role-WK-BAT [data-action="select"]:visible:not([disabled])')
    if wk.count(): wk.first.click()
    for _ in range(20):
        if not click_text(pg,'Select'): break
        pg.wait_for_timeout(130)
    assert click_text(pg,'Lodge XI'); pg.wait_for_timeout(1500)
    return pg


def run_plan(browser, vp, plan):
    # Each case has its own new browser context: never touches a real user save.
    context = browser.new_context(viewport=vp, accept_downloads=False)
    pg = context.new_page()
    errors, console = [], []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: console.append(m.text) if m.type == 'error' else None)
    try:
        print('TEST: entering season', flush=True)
        setup_to_season(pg)
        print('TEST: season reached', flush=True)
        opened = click_action(pg,'prepare') or click_text(pg,'prepare match') or click_text(pg,'play next round')
        pg.wait_for_timeout(300)
        if not pg.locator('.gccuiCaptaincyLayer:visible').count():
            opened = opened or click_text(pg, 'match preview')
            pg.wait_for_timeout(300)
        assert pg.locator('.gccuiCaptaincyLayer:visible').count(), 'captaincy board not visible'
        selects={k:pg.locator(f'#gccCaptaincy-{k}:visible') for k in ('powerplay','middle','death')}
        for k,v in plan.items():
            assert selects[k].count(), f'missing {k} selector'
            selects[k].select_option(v)
        values={k:selects[k].input_value() for k in selects}
        metrics=pg.evaluate("""()=>({view:document.querySelector('#g8stage')?.dataset.view,dialog:!!document.querySelector('#g8dialog[open]'),scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth,boardHeight:document.querySelector('.gccuiCaptaincyLayer')?.getBoundingClientRect().height||0})""")
        SETTINGS.out_dir.mkdir(parents=True, exist_ok=True)
        screenshot=SETTINGS.out_dir / ('captaincy_%d_%s_%s_%s.png' % (vp['width'],plan['powerplay'],plan['middle'],plan['death']))
        print('TEST: screenshot', flush=True)
        pg.screenshot(path=str(screenshot), full_page=True)
        print('TEST: before playMatch', flush=True)
        assert click_action(pg,'playMatch'), 'playMatch action missing'
        print('TEST: playMatch returned',flush=True)
        pg.wait_for_timeout(900)
        assert pg.evaluate("()=>document.querySelector('#g8stage')?.dataset.view")=='matchReveal', 'match reveal not reached'
        print('TEST: matchReveal reached',flush=True)
        assert click_action(pg,'matchSkip'), 'matchSkip action missing'
        pg.wait_for_timeout(800)
        print('TEST: matchSkip returned',flush=True)
        result=pg.evaluate("""()=>{const r=window.GCC?.state?.results?.at(-1);return {view:document.querySelector('#g8stage')?.dataset.view,captaincy:r?.captaincy,home:r?.homeInnings?.total,away:r?.awayInnings?.total,homeW:r?.homeInnings?.wickets,awayW:r?.awayInnings?.wickets,saveLength:localStorage.length}}""")
        assert values == plan, 'selector values do not match requested plan'
        assert result['captaincy'] == plan, 'completed match failed to persist selected captaincy metadata in state'
        assert not errors, f'page exceptions: {errors}'
        assert not console, f'console errors: {console}'
        assert metrics['scrollWidth'] <= metrics['innerWidth'], 'horizontal overflow'
        assert metrics['boardHeight'] > 0, 'captaincy board has zero height'
        reloaded = None
        if SETTINGS.mode == 'http':
            # Autosave is coordinated asynchronously through IndexedDB and
            # Web Locks. Wait for the *persisted* Round 1 match before reload,
            # not an arbitrary timeout or just the existence of a prior save.
            saved=pg.wait_for_function("""() => {
                const raw=localStorage.getItem('gcc_dynasty_v8');
                const meta=JSON.parse(localStorage.getItem('gcc_dynasty_meta_v8')||'null');
                return !!raw && meta?.round===1;
            }""",timeout=30000,polling=350)
            persisted=pg.evaluate("""()=>{
                const raw=localStorage.getItem('gcc_dynasty_v8');
                const payload=window.GCC8_SAVE_CODEC.parse(raw);
                const s=payload?.state, r=s?.results?.at(-1);
                return {club:s?.userClub?.abbr,year:s?.year,round:s?.round,
                        xi:s?.xi,results:s?.results?.length,
                        captaincy:r?.captaincy,score:[r?.homeInnings?.total,r?.awayInnings?.total]};
            }""")
            assert persisted['captaincy']==plan, 'captaincy plan missing from durable browser save'
            assert persisted['club'] and persisted['year']==2008 and persisted['round']==1, 'saved Round 1 state is incorrect'
            assert len(persisted['xi'] or [])==11, 'saved XI is incomplete'
            pg.reload(wait_until='load', timeout=60000)
            pg.wait_for_timeout(750)
            assert pg.evaluate('localStorage.length') > 0, 'storage missing after reload'
            # v116 intentionally shows Home after reload, and requires Continue.
            continued=click_text(pg, 'continue career') or click_text(pg, 'continue')
            assert continued, 'saved career is not offered in the Home launcher'
            pg.wait_for_timeout(900)
            reloaded=pg.evaluate("""()=>({
                view:document.querySelector('#g8stage')?.dataset.view,
                captaincy:window.GCC?.state?.results?.at(-1)?.captaincy,
                storageKeys:localStorage.length,club:window.GCC?.state?.userClub?.abbr,
                round:window.GCC?.state?.round,year:window.GCC?.state?.year,
                xi:window.GCC?.state?.xi,results:window.GCC?.state?.results?.length})""")
            assert reloaded['storageKeys']>0, 'browser storage missing after Continue'
            for field in ('club','year','round','xi','results','captaincy'):
                assert reloaded[field]==persisted[field], f'{field} changed across real reload and Continue'
        print('TEST: assertions passed',flush=True)
        return {'viewport':vp,'plan':plan,'opened':opened,'values':values,'metrics':metrics,
                'result':result,'reloaded':reloaded,'screenshots':str(screenshot),
                'errors':errors,'console':console,'storage_mode':SETTINGS.mode}
    finally:
        context.close()

def main():
    global SETTINGS, GAME_URL, HTML_BYTES
    SETTINGS=PARSER.parse_args()
    html=SETTINGS.html.resolve()
    assert html.is_file(), f'HTML not found: {html}. Use --html PATH'
    HTML_BYTES=html.read_bytes()
    sha=hashlib.sha256(HTML_BYTES).hexdigest()
    assert SETTINGS.no_hash_check or sha==OFFICIAL_SHA256, f'Unexpected HTML SHA-256 {sha}; pass --no-hash-check only for an intentional candidate'
    SETTINGS.out_dir=SETTINGS.out_dir.resolve()
    plans=[{'powerplay':'attack','middle':'control','death':'matchup'},
           {'powerplay':'control','middle':'attack','death':'attack'}]
    if SETTINGS.case is None:
        # Separate OS processes keep Playwright/Chromium lifecycle independent.
        # A hung case fails with a useful timeout rather than blocking indefinitely.
        runs=[]
        for i in range(len(plans)):
            child_dir=SETTINGS.out_dir / ('case_%d' % i)
            cmd=[sys.executable,str(Path(__file__).resolve()), '--html',str(html),
                 '--out-dir',str(child_dir),'--mode',SETTINGS.mode,
                 '--width',str(SETTINGS.width),'--height',str(SETTINGS.height),
                 '--case',str(i)]
            if SETTINGS.chromium: cmd += ['--chromium',str(SETTINGS.chromium.resolve())]
            if SETTINGS.no_hash_check: cmd += ['--no-hash-check']
            if SETTINGS.headed: cmd += ['--headed']
            print('Running scenario %d/%d ...' % (i+1,len(plans)),flush=True)
            child_dir.mkdir(parents=True,exist_ok=True)
            log=child_dir/'scenario.log'
            try:
                # Write to a file rather than a pipe: Chromium descendants must
                # not keep captured stdout pipes open after a timed-out parent.
                with log.open('w',encoding='utf-8') as stream:
                    proc=subprocess.run(cmd,stdout=stream,stderr=subprocess.STDOUT,
                                        timeout=SETTINGS.case_timeout)
            except subprocess.TimeoutExpired as exc:
                raise SystemExit('FAIL: scenario %d exceeded %ds; log: %s' %
                                 (i+1, SETTINGS.case_timeout, log)) from exc
            if proc.returncode:
                raise SystemExit('FAIL scenario %d (exit %d), log: %s\n%s' %
                                 (i+1,proc.returncode,log,log.read_text()[-4000:]))
            child=json.loads((child_dir/'captaincy_result.json').read_text())
            runs.extend(child['runs'])
            print('Scenario %d PASS' % (i+1),flush=True)
        SETTINGS.out_dir.mkdir(parents=True,exist_ok=True)
        report={'status':'PASS','html':str(html),'sha256':sha,'mode':SETTINGS.mode,
                'native_storage_checked':SETTINGS.mode=='http','runs':runs,
                'note':'Two independent newly drafted careers; differing final scores alone are not controlled tactical causality.'}
        output=SETTINGS.out_dir / 'captaincy_result.json'
        output.write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps({'status':'PASS','mode':SETTINGS.mode,'runs':len(runs),
                          'native_storage_checked':report['native_storage_checked'],
                          'report':str(output)},indent=2))
        return
    plans=[plans[SETTINGS.case]]
    # Hosted mode uses loopback URL + normal browser storage; isolated mode
    # exercises the UI/engine only, with an in-memory storage shim.
    from contextlib import nullcontext
    with (temporary_release_server(HTML_BYTES) if SETTINGS.mode=='http' else nullcontext(None)) as url:
        GAME_URL=url
        with sync_playwright() as pw:
            launch={'headless':not SETTINGS.headed}
            if SETTINGS.chromium:
                launch['executable_path']=str(SETTINGS.chromium.resolve())
            runs=[]
            for plan in plans:
                # A fresh Chromium process per scenario avoids cross-case resource stalls.
                browser=pw.chromium.launch(**launch)
                try:
                    runs.append(run_plan(browser, {'width':SETTINGS.width,'height':SETTINGS.height},plan))
                finally:
                    browser.close()
    report={'status':'PASS', 'html':str(html),'sha256':sha,'mode':SETTINGS.mode,
            'native_storage_checked': SETTINGS.mode=='http', 'runs':runs,
            'note':'Two independent newly drafted careers; differing final scores alone are not controlled tactical causality.'}
    SETTINGS.out_dir.mkdir(parents=True, exist_ok=True)
    (SETTINGS.out_dir / 'captaincy_result.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'status':'PASS','mode':SETTINGS.mode,'runs':len(runs),'native_storage_checked':report['native_storage_checked'],'report':str(SETTINGS.out_dir / 'captaincy_result.json')},indent=2))

if __name__=='__main__':
    main()
