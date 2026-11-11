#!/usr/bin/env python3
"""GCC v116 native two-tab stale-save test. Disposable HTTP origin and browser context."""
import argparse, hashlib, json, sys
from pathlib import Path
from types import SimpleNamespace
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import captaincy_layer_v116 as native

ONE={'powerplay':'attack','middle':'control','death':'matchup'}
TWO={'powerplay':'matchup','middle':'attack','death':'control'}

def view(p):
    return p.evaluate("() => document.querySelector('#g8stage')?.dataset.view")

def snap(p):
    return p.evaluate("""() => {
      const raw=localStorage.getItem('gcc_dynasty_v8');
      const s=raw?GCC8_SAVE_CODEC.parse(raw)?.state:null;
      return {raw,liveRound:GCC.state.round,savedRound:s?.round,
       lastCaptaincy:s?.results?.at(-1)?.captaincy,
       conflict:GCC8_ENGINE_READ.saveConflict(),
       mode:GCC8_ENGINE_READ.checkpointMode(),
       coordinated:GCC8_ENGINE_READ.saveCoordinated()};
    }""")

def play(p, plan):
    if view(p)=='result':
        assert native.click_action(p,'matchday') or native.click_text(p,'Next match'), 'Next match absent'
        p.wait_for_timeout(100)
    assert native.click_action(p,'prepare') or native.click_text(p,'match preview'), 'Prepare absent'
    p.wait_for_timeout(150)
    assert p.locator('.gccuiCaptaincyLayer:visible').count()==1,'Captaincy board absent'
    for phase, value in plan.items():
        p.locator('#gccCaptaincy-%s:visible' % phase).select_option(value)
    assert native.click_action(p,'playMatch'), 'Play match absent'
    p.wait_for_timeout(200)
    assert view(p)=='matchReveal', 'Match reveal absent'
    assert native.click_action(p,'matchSkip'), 'Match skip absent'
    p.wait_for_function("() => document.querySelector('#g8stage')?.dataset.view==='result'",timeout=10000)

def durable(p, rnd, plan):
    p.wait_for_function("""({r,t}) => {
      const raw=localStorage.getItem('gcc_dynasty_v8');
      if(!raw)return false;
      try {
        const s=GCC8_SAVE_CODEC.parse(raw)?.state;
        return s?.round===r&&JSON.stringify(s?.results?.at(-1)?.captaincy)===JSON.stringify(t);
      }catch(e){return false;}
    }""",arg={'r':rnd,'t':plan},timeout=45000,polling=400)
    return snap(p)

def checkpoint(p):
    return p.evaluate("""async () => new Promise((resolve,reject) => {
      const o=indexedDB.open('gcc-career-recovery-v1',1);
      o.onerror=()=>reject(new Error('IDB open failed'));
      o.onsuccess=()=>{
        const db=o.result, tx=db.transaction('checkpoints','readonly');
        const q=tx.objectStore('checkpoints').get('career');
        q.onerror=()=>reject(new Error('checkpoint read failed'));
        q.onsuccess=()=>{const raw=q.result?.raw||null;db.close();resolve(raw)};
      };
    })""")

def run():
    ap=argparse.ArgumentParser()
    ap.add_argument('--html',type=Path,default=Path(__file__).resolve().parents[1]/'GCC_v116_release (1).html')
    ap.add_argument('--out',type=Path,default=Path('qa/results/v116-native-two-tab.json'))
    a=ap.parse_args()
    data=a.html.read_bytes()
    sha=hashlib.sha256(data).hexdigest()
    assert sha==native.OFFICIAL_SHA256, 'Canonical v116 SHA mismatch'
    native.SETTINGS=SimpleNamespace(mode='http')
    native.HTML_BYTES=data
    errors=[]
    with native.temporary_release_server(data) as url:
        native.GAME_URL=url
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            ctx=browser.new_context(viewport={'width':1280,'height':900})
            tab_a=ctx.new_page()
            tab_a.on('pageerror',lambda e: errors.append('A: '+str(e)))
            try:
                native.setup_to_season(tab_a)
                play(tab_a,ONE)
                first=durable(tab_a,1,ONE)
                assert first['coordinated'] and first['mode'] in ('strict','transaction'), 'No native coordination'
                assert checkpoint(tab_a)==first['raw'], 'Round 1 IDB mismatch'
                tab_b=ctx.new_page()
                tab_b.on('pageerror',lambda e: errors.append('B: '+str(e)))
                tab_b.goto(url,wait_until='load',timeout=60000)
                tab_b.wait_for_timeout(500)
                assert native.click_text(tab_b,'continue career'), 'Continue unavailable in B'
                tab_b.wait_for_timeout(850)
                assert tab_b.evaluate('GCC.state.round')==1, 'B did not restore Round 1'
                assert snap(tab_b)['raw'], 'No shared native storage'
                play(tab_b,TWO)
                second=durable(tab_b,2,TWO)
                assert second['raw']!=first['raw'], 'Round 2 save unchanged'
                assert checkpoint(tab_b)==second['raw'], 'Round 2 IDB mismatch'
                assert tab_a.evaluate('GCC.state.round')==1, 'A unexpectedly updated'
                attempted=tab_a.evaluate('async () => await GCC8_ENGINE_READ.saveAsync()')
                tab_a.wait_for_timeout(350)
                stale=snap(tab_a)
                assert attempted is False and stale['conflict'] is True, 'Stale save not rejected'
                assert stale['raw']==second['raw'], 'Stale tab overwrote localStorage'
                assert checkpoint(tab_a)==second['raw'], 'Stale tab overwrote IDB'
                tab_a.reload(wait_until='load',timeout=60000)
                tab_a.wait_for_timeout(650)
                assert native.click_text(tab_a,'continue career'), 'Continue unavailable after conflict'
                tab_a.wait_for_timeout(900)
                recovered=snap(tab_a)
                assert recovered['liveRound']==2, 'Latest Round 2 not recovered'
                assert recovered['lastCaptaincy']==TWO, 'Captaincy not recovered'
                assert recovered['raw']==second['raw'], 'Recovery changed saved bytes'
                assert not errors, errors
                result={'status':'PASS','sha256':sha,'native_origin':True,
                  'rounds':[first['savedRound'],second['savedRound']],
                  'stale_save_rejected':True,'local_storage_preserved':True,
                  'indexeddb_preserved':True,'reloaded_latest':True,
                  'checkpoint_mode':second['mode'],'page_errors':errors}
                a.out.parent.mkdir(parents=True,exist_ok=True)
                a.out.write_text(json.dumps(result,indent=2)+'\n')
                print(json.dumps(result,indent=2),flush=True)
            finally:
                ctx.close()
                browser.close()

if __name__=='__main__':
    run()
