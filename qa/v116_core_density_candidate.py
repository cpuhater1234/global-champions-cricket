#!/usr/bin/env python3
"""Review-only density correction at existing owners; no scripts or new layers."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
from v116_shared_controls_candidate import patch_release as controls_candidate
from v116_source_reconciliation import BLOCK, RELEASE

BASE_SHA256 = '3de1ed8c1ffdaa2c51db41782004ebff71c8a87fd6c95d7575067aed9fd05735'


def patch_density(base):
    if sha256(base).hexdigest() != BASE_SHA256:
        raise ValueError('Density baseline identity mismatch: STOP')
    blocks = list(BLOCK.finditer(base))
    base_matches = [m for m in blocks if m.group(1).lower() == b'style'
                    and b'.g8hudclub{min-height:68px}' in m.group(3)]
    if len(base_matches) != 1:
        raise ValueError('Ambiguous base HUD owner')
    owners = {'base-hud-styles': base_matches[0]}
    for name in ('gcc-decision-ui-20261030', 'gcc-floodlit-visual'):
        hits = [m for m in blocks if m.group(1).lower() == b'style'
                and ('id="' + name + '"').encode() in m.group(2)]
        if len(hits) != 1:
            raise ValueError('Ambiguous density owner: ' + name)
        owners[name] = hits[0]
    css_by_owner = {name: m.group(3) for name, m in owners.items()}
    corrections = []

    def edit(owner, selector, old, new):
        css = css_by_owner[owner]
        pattern = re.compile(re.escape(selector) + rb'\s*\{([^{}]*)\}')
        hits = [m for m in pattern.finditer(css) if old in m.group(1)]
        if len(hits) != 1 or hits[0].group(1).count(old) != 1:
            raise ValueError('Ambiguous density declaration: ' + owner + ' ' + selector.decode() + ' ' + old.decode())
        m = hits[0]
        revised = m.group(1).replace(old, new)
        css_by_owner[owner] = css[:m.start(1)] + revised + css[m.end(1):]
        corrections.append(dict(owner=owner, selector=selector.decode(), before=old.decode(), after=new.decode()))

    # The older 68px floor and tall slogan survive later 48px logo rules.
    edit('base-hud-styles', b'.g8hudclub', b'min-height:68px', b'min-height:48px')
    edit('base-hud-styles', b'#g8hud>.g8headerslogan', b'padding:.35rem 1rem', b'padding:0 1rem')
    edit('base-hud-styles', b'#g8hud>.g8headerslogan', b'line-height:1.6', b'line-height:1.25')
    edit('base-hud-styles', b'#g8hud .g8careernav', b'padding-top:.55rem', b'padding-top:.375rem')
    edit('gcc-decision-ui-20261030', b'#g8app #g8hud:has(.g8hudclub>.g8badge)', b'padding:8px 16px!important', b'padding:6px 16px!important')
    edit('gcc-decision-ui-20261030', b'#g8app #g8hud:has(.g8hudclub>.g8badge)', b'gap:10px!important', b'gap:8px!important')

    # Metrics are read-only values; their 44px floors are not touch targets.
    edit('gcc-decision-ui-20261030', b'#g8app .gccuiCampaignRibbon>div', b'grid-template-rows:18px minmax(44px,auto) auto', b'grid-template-rows:18px minmax(32px,auto) auto')
    edit('gcc-decision-ui-20261030', b'#g8app .gccuiCampaignRibbon strong', b'min-height:44px', b'min-height:32px')
    edit('gcc-decision-ui-20261030', b'#g8app .gccuiCampaignForm', b'min-height:44px', b'min-height:32px')
    edit('gcc-floodlit-visual', b'#g8app#g8app #g8stage .gccuiCampaignRibbon>div', b'padding:.9rem 1.1rem', b'padding:8px 14px')
    edit('gcc-floodlit-visual', b'#g8app#g8app #g8stage .gccuiCampaignRibbon>div>strong', b'font-size:2.4rem!important', b'font-size:2rem!important')
    # Remove double top spacing before the optional trade link, retaining margins.
    edit('gcc-decision-ui-20261030', b'#g8app .gccuiTradeEntry', b'padding:16px 0 0', b'padding:0')

    result = base
    for name, m in sorted(owners.items(), key=lambda pair: pair[1].start(), reverse=True):
        result = result[:m.start(3)] + css_by_owner[name] + result[m.end(3):]
    after = list(BLOCK.finditer(result))
    if len(after) != len(blocks) or len(blocks) != 39:
        raise ValueError('Style/script inventory changed')
    if sum(m.group(1).lower() == b'style' for m in after) != 17 or sum(m.group(1).lower() == b'script' for m in after) != 22:
        raise ValueError('Unexpected style/script counts')
    if any(a.group(0) != b.group(0) for a, b in zip(blocks, after) if a.group(1).lower() == b'script'):
        raise ValueError('JavaScript changed')
    changed = [(a,b) for a,b in zip(blocks,after) if a.group(0) != b.group(0)]
    if [a.start() for a,_ in changed] != sorted(m.start() for m in owners.values()):
        raise ValueError('Unexpected density owner changed')
    restored = result
    for original,revised in sorted(changed,key=lambda pair:pair[1].start(),reverse=True):
        restored = restored[:revised.start(3)] + original.group(3) + restored[revised.end(3):]
    if restored != base:
        raise ValueError('Bytes outside declared owners changed')
    return result, dict(status='CORE_DENSITY_REVIEW_ONLY',base_sha256=BASE_SHA256,
        candidate_sha256=sha256(result).hexdigest(),candidate_bytes=len(result),
        corrections=corrections,existing_style_blocks_changed=3,new_style_blocks=0,
        styles=17,scripts=22,javascript_blocks_changed=0,
        notes=['HUD/logo controls retain current sizes; no interaction target is reduced.',
               'Campaign strong/form floors are read-only metrics, not buttons.',
               'XI, rosters, annual celebration, all scripts and media-specific compact header rules are unchanged.',
               'Savings are hypotheses pending native geometry and visual comparison: roughly60px above fixture on a desktop with trade window.',
               'Small-screen HUD uses existing independent grid rules; do not assume the desktop savings apply there.'],
        native_rendering='PENDING',maintained_source_parity='UNVERIFIED')


def patch_release(data):
    base,_ = controls_candidate(data)
    return patch_density(base)


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True)
    args=p.parse_args()
    if args.output.resolve()==RELEASE.resolve():raise ValueError('Frozen release cannot be overwritten')
    data,r=patch_release(RELEASE.read_bytes())
    args.output.parent.mkdir(parents=True,exist_ok=True);args.report.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_bytes(data);args.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))


if __name__=='__main__':main()
