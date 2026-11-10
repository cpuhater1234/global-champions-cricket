from pathlib import Path
from playwright.sync_api import sync_playwright
import json

URL=Path('/home/ubuntu/gcc-work/GCC_v116_release.html').resolve().as_uri()
CLICK='''(l)=>{const dl=document.querySelector('#g8dialog');const pool=(dl&&dl.open)?[...dl.querySelectorAll('button')]:[...document.querySelectorAll('#g8stage button')];const t=l.toLowerCase();const b=pool.filter(x=>x.offsetParent!==null&&!x.disabled).find(x=>x.textContent.replace(/\\s+/g,' ').toLowerCase().includes(t));if(!b)return false;b.click();return true;}'''
ACT='''(o)=>{const els=[...document.querySelectorAll('[data-action="'+o+'"]')].filter(e=>e.offsetParent!==null&&!e.disabled);if(!els.length)return false;els[0].click();return true;}'''

def click_text(pg,t): return pg.evaluate(CLICK,t)
def click_action(pg,a): return pg.evaluate(ACT,a)

def setup_to_season(pg):
    pg.goto(URL,wait_until='load'); pg.wait_for_timeout(450)
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

def run_plan(vp,plan):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        pg=b.new_page(viewport=vp); errors=[]; console=[]
        pg.on('pageerror',lambda e:errors.append(str(e))); pg.on('console',lambda m: console.append(m.text) if m.type=='error' else None)
        setup_to_season(pg)
        view=pg.evaluate("()=>document.querySelector('#g8stage')?.dataset.view")
        # The first user fixture is reached through the pre-match command.
        opened=click_action(pg,'prepare') or click_text(pg,'prepare match') or click_text(pg,'play next round')
        pg.wait_for_timeout(300)
        board=pg.locator('.gccuiCaptaincyLayer:visible')
        if not board.count():
            # A season surface can expose the preview with a text action after rendering.
            opened=opened or click_text(pg,'match preview')
            pg.wait_for_timeout(300)
        selects={k:pg.locator(f'#gccCaptaincy-{k}:visible') for k in ('powerplay','middle','death')}
        for k,v in plan.items(): selects[k].select_option(v)
        values={k:selects[k].input_value() for k in selects}
        # Mobile overflow is part of the acceptance surface.
        metrics=pg.evaluate("""()=>({view:document.querySelector('#g8stage')?.dataset.view,dialog:!!document.querySelector('#g8dialog[open]'),scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth,boardHeight:document.querySelector('.gccuiCaptaincyLayer')?.getBoundingClientRect().height||0})""")
        pg.screenshot(path=f"/home/ubuntu/gcc-work/qa/captaincy_{vp['width']}_{plan['powerplay']}_{plan['middle']}_{plan['death']}.png",full_page=True)
        assert click_action(pg,'playMatch')
        pg.wait_for_timeout(900)
        assert pg.evaluate("()=>document.querySelector('#g8stage')?.dataset.view")=='matchReveal'
        # Skip reveal to persist a completed, inspectable result.
        click_action(pg,'matchSkip'); pg.wait_for_timeout(800)
        result=pg.evaluate("""()=>{const r=window.GCC?.state?.results?.at(-1);return {view:document.querySelector('#g8stage')?.dataset.view,captaincy:r?.captaincy,home:r?.homeInnings?.total,away:r?.awayInnings?.total,homeW:r?.homeInnings?.wickets,awayW:r?.awayInnings?.wickets,saveLength:localStorage.length}}""")
        out={'viewport':vp,'plan':plan,'opened':opened,'values':values,'metrics':metrics,'result':result,'errors':errors,'console':console}
        b.close(); return out

if __name__=='__main__':
    runs=[]
    for plan in [
        {'powerplay':'attack','middle':'control','death':'matchup'},
        {'powerplay':'control','middle':'attack','death':'attack'},
    ]:
        runs.append(run_plan({'width':390,'height':844},plan))
    print(json.dumps(runs,indent=2))
    assert all(not x['errors'] and not x['console'] for x in runs)
    assert all(x['metrics']['scrollWidth']==x['metrics']['innerWidth'] for x in runs)
    assert all(x['result']['captaincy']==x['plan'] for x in runs)
    assert runs[0]['result'] != runs[1]['result'], 'Different tactical plans produced identical saved result'
    print('CAPTAINCY LAYER: PASS')
