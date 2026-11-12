#!/usr/bin/env python3
"""Browser cascade regression using all real styles and scoped markup fixtures.

This checks text colours across the release's club palettes. It does not claim
full gameplay, native save, or visual acceptance of these fixture screens.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
from v116_source_reconciliation import BLOCK

MARKUP = '''<div id="g8app"><main id="g8stage"></main></div>
<dialog id="g8dialog" open data-prompt="player"><div class="g8modalbody">
<section class="gccuiCaptaincyLayer"><div class="gccuiCaptaincyGrid">
<label><span>Powerplay · overs 1–6</span><select><option>Matchups</option></select></label>
<label><span>Middle · overs 7–15</span><select><option>Matchups</option></select></label>
<label><span>Death · overs 16–20</span><select><option>Matchups</option></select></label>
</div></section><div class="gccuiProfileOverview">
<section class="g8scoutoutlook"><h3>Career outlook</h3></section>
<section class="g8gccrecord"><h3>GCC record</h3></section>
</div></div></dialog>'''
TARGETS = '.gccuiProfileOverview .g8scoutoutlook>h3,.gccuiProfileOverview .g8gccrecord>h3'

def luminance(rgb):
    values = [v/255 for v in rgb]
    values = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in values]
    return sum(x*w for x,w in zip(values,(.2126,.7152,.0722)))

def contrast(a,b):
    x,y = sorted((luminance(a),luminance(b)))
    return (y+.05)/(x+.05)

def audit(path, chromium=None):
    data = path.read_bytes()
    styles = [m.group(0).decode() for m in BLOCK.finditer(data) if m.group(1).lower() == b'style']
    assert len(styles) == 17
    # Read each real club identity colour; always include the confirmed Lucknow case.
    colours = sorted(set(re.findall(rb"(?:\bc:|\"c\":)\s*['\"](#[0-9a-fA-F]{6})",data)))
    assert b'#17468b' in colours and len(colours) >= 20
    rows, failures = [], []
    with sync_playwright() as pw:
        options = dict(headless=True)
        if chromium:
            options['executable_path'] = str(chromium)
        browser = pw.chromium.launch(**options)
        try:
            page = browser.new_page()
            page.set_content('<!doctype html><html><head>'+''.join(styles)+'</head><body>'+MARKUP+'</body></html>')
            for width in (320,390,1440):
                page.set_viewport_size(dict(width=width,height=900))
                for raw in colours:
                    colour = raw.decode()
                    page.evaluate('colour => document.documentElement.style.setProperty("--club-accent",colour)',colour)
                    page.locator('#g8dialog').evaluate('(e)=>e.setAttribute("data-prompt","prepare")')
                    samples = page.locator('.gccuiCaptaincyGrid label>span').evaluate_all('(els)=>els.map(e=>({text:e.textContent,colour:getComputedStyle(e).color}))')
                    page.locator('#g8dialog').evaluate('(e)=>e.setAttribute("data-prompt","player")')
                    samples += page.locator(TARGETS).evaluate_all('(els)=>els.map(e=>({text:e.textContent,colour:getComputedStyle(e).color}))')
                    assert len(samples) == 5
                    for sample in samples:
                        rgb = tuple(map(float,re.findall(r'[\d.]+',sample['colour'])[:3]))
                        # Opaque upper-end colours of the actual dark gradients,
                        # plus both effective dark theme surfaces. This deliberately
                        # avoids claiming pixel-sampled translucent contrast.
                        backgrounds = ((20,48,63),(18,45,60),(12,26,40),(40,40,40))
                        ratio = min(contrast(rgb,bg) for bg in backgrounds)
                        row = dict(width=width,club_colour=colour,text=sample['text'],
                                   computed_colour=sample['colour'],contrast=round(ratio,3))
                        rows.append(row)
                        if ratio < 4.5:
                            failures.append(row)
            return dict(status='CONTRAST_FAIL' if failures else 'PASS',
                        sha256=sha256(data).hexdigest(),palette_count=len(colours),
                        samples=len(rows),failures=failures,minimum_contrast=min(r['contrast'] for r in rows),
                        scope='Real stylesheet cascade with scoped DOM fixtures; not gameplay or save acceptance')
        finally:
            browser.close()

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--html',type=Path,required=True)
    p.add_argument('--report',type=Path,required=True)
    p.add_argument('--chromium',type=Path)
    args = p.parse_args()
    report = audit(args.html,args.chromium)
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k != 'failures'},indent=2))
    raise SystemExit(1 if report['failures'] else 0)

if __name__ == '__main__':
    main()
