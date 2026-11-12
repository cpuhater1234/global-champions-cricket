#!/usr/bin/env python3
"""Review-only in-place shared control corrections on the pinned guide build.

This adapter edits existing governing rules. It does not inject a stylesheet or
claim full maintained-source parity. Native rendering remains a separate gate.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re

from v116_menu_surface_candidate import patch_release as guide_candidate, EXCLUSION
from v116_source_reconciliation import BLOCK, RELEASE

BASE_SHA256 = '79a2fbfe965453ad0ef04d238ee7047346fb38e537deeec47d91cfcbebf51c4a'
APP = b'#g8app#g8app#g8app'
DIALOG = b'#g8dialog#g8dialog#g8dialog' + EXCLUSION


def patch_controls(base):
    if sha256(base).hexdigest() != BASE_SHA256:
        raise ValueError('Shared-controls baseline identity mismatch: STOP')
    blocks = list(BLOCK.finditer(base))
    owners = {}
    for name in ('gcc-floodlit-visual', 'gcc-cleanup-pass',
                 'gcc-composition-20261107', 'gcc-v116-perfection-pass'):
        hits = [m for m in blocks if m.group(1).lower() == b'style'
                and ('id="' + name + '"').encode() in m.group(2)]
        if len(hits) != 1:
            raise ValueError('Ambiguous governing owner: ' + name)
        owners[name] = hits[0]
    corrections = []

    def edit_rule(css, owner, selector, old, new):
        pattern = re.compile(re.escape(selector) + rb'\s*\{([^{}]*)\}')
        # This owner has a later width-only rule with the same app selector.
        # Select the declaration owner, preserving that unrelated rule verbatim.
        hits = [h for h in pattern.finditer(css) if old in h.group(1)]
        if len(hits) != 1:
            raise ValueError('Ambiguous governing rule: ' + selector.decode())
        hit = hits[0]
        body = hit.group(1)
        if body.count(old) != 1:
            raise ValueError('Unexpected governing declaration: ' + old.decode())
        body = body.replace(old, new)
        corrections.append(dict(owner=owner, selector=selector.decode(),
                                before=old.decode(), after=new.decode()))
        return css[:hit.start(1)] + body + css[hit.end(1):]

    flood = owners['gcc-floodlit-visual']
    css = flood.group(3)
    for selector in (APP + b' .g8button', DIALOG + b' .g8button'):
        css = edit_rule(css, 'gcc-floodlit-visual', selector,
                        b'font-family:var(--vx-display)!important',
                        b'font-family:var(--vx-body)!important')
        css = edit_rule(css, 'gcc-floodlit-visual', selector,
                        b'letter-spacing:.02em!important',
                        b'letter-spacing:0!important')
    for selector, old in (
        (APP + b' .g8button:not(.g8primary):hover:enabled', b'transform:translateY(-2px)'),
        (APP + b' .g8primary:hover:enabled', b'transform:translateY(-2px)'),
        (APP + b' .g8primary:active:enabled', b'transform:translateY(1px)'),
    ):
        css = edit_rule(css, 'gcc-floodlit-visual', selector, old, b'transform:none')
    # More specific ordinary-tab rules previously defeated the generic button
    # font change. Edit their existing owners rather than escalating specificity.
    for selector in (APP + b' .g8tabs .g8button',
                     b'#g8app#g8app #g8stage .gccuiPaneTabs button'):
        for old, new in ((b'font-family:var(--vx-display)!important', b'font-family:var(--vx-body)!important'),
                         (b'letter-spacing:.1em', b'letter-spacing:0'),
                         (b'text-transform:uppercase', b'text-transform:none')):
            css = edit_rule(css, 'gcc-floodlit-visual', selector, old, new)

    cleanup = owners['gcc-cleanup-pass']
    primary_selector = (APP + b' .g8button.g8primary,\n'
                        b'#g8dialog#g8dialog#g8dialog .g8button.g8primary,\n'
                        + APP + b' .g8hero .g8button.g8primary,\n'
                        + APP + b' .gccuiPreMatchActions .g8button.g8primary,\n'
                        + APP + b' [data-action="watchMatch"]')
    clean_css = edit_rule(cleanup.group(3), 'gcc-cleanup-pass', primary_selector,
                          b'box-shadow:0 3px 0 #347887!important',
                          b'box-shadow:none!important')
    composition = owners['gcc-composition-20261107']
    composition_css = composition.group(3)
    for old, new in ((b'font-family:var(--vx-display)!important', b'font-family:var(--vx-body)!important'),
                     (b'letter-spacing:.06em!important', b'letter-spacing:0!important'),
                     (b'text-transform:uppercase!important', b'text-transform:none!important')):
        composition_css = edit_rule(composition_css, 'gcc-composition-20261107',
                                    APP + b' .g8hero .g8welcomeactions>.g8button', old, new)
    perfection = owners['gcc-v116-perfection-pass']
    perfection_css = edit_rule(perfection.group(3), 'gcc-v116-perfection-pass',
                               b'#g8dialog[data-prompt="player"] .gccuiProfileViews .g8button',
                               b'min-height:42px!important', b'min-height:44px!important')
    result = base
    for m, replacement in sorted(((flood, css), (cleanup, clean_css),
                                  (composition, composition_css), (perfection, perfection_css)),
                                 key=lambda pair: pair[0].start(), reverse=True):
        result = result[:m.start(3)] + replacement + result[m.end(3):]

    after = list(BLOCK.finditer(result))
    if len(after) != len(blocks) or len(blocks) != 39:
        raise ValueError('Style/script inventory changed')
    for kind, expected in ((b'style', 17), (b'script', 22)):
        if sum(m.group(1).lower() == kind for m in after) != expected:
            raise ValueError('Unexpected ' + kind.decode() + ' count')
    changed = [(a, b) for a, b in zip(blocks, after) if a.group(0) != b.group(0)]
    if [a.start() for a, _ in changed] != sorted(m.start() for m in owners.values()):
        raise ValueError('Unexpected changed owner')
    if any(a.group(0) != b.group(0) for a, b in zip(blocks, after)
           if a.group(1).lower() == b'script'):
        raise ValueError('JavaScript changed')
    # Reversibility proves that no bytes beyond the declared corrections changed.
    restored = result
    for original, revised in sorted(changed, key=lambda pair: pair[1].start(), reverse=True):
        restored = restored[:revised.start(3)] + original.group(3) + restored[revised.end(3):]
    if restored != base:
        raise ValueError('Bytes outside governing rule bodies changed')
    return result, dict(
        status='SHARED_CONTROLS_REVIEW_ONLY', base_sha256=BASE_SHA256,
        candidate_sha256=sha256(result).hexdigest(), candidate_bytes=len(result),
        revision=2, existing_style_blocks_changed=4, new_style_blocks=0, styles=17,
        javascript_blocks_changed=0, scripts=22,
        corrections=corrections, guide_owner_byte_identical=True,
        notes=['Guide computed-style parity still requires native verification.',
               'Headings, rating plates and all other rule bodies remain byte-identical.',
               'No product source or frozen release file is overwritten.'],
        maintained_source_parity='UNVERIFIED', native_rendering='PENDING')


def patch_release(data):
    base, _ = guide_candidate(data)
    return patch_controls(base)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    if args.output.resolve() == RELEASE.resolve():
        raise ValueError('Frozen release cannot be overwritten')
    result, report = patch_release(RELEASE.read_bytes())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(result)
    args.report.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
