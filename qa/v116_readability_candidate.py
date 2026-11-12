#!/usr/bin/env python3
"""Three in-place reading-colour corrections on the pinned menu candidate.

No stylesheet, selector, script or club identity colour is added or removed.
This guarded adapter is not a claim of full maintained-source build parity.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
from v116_menu_review_candidate import patch_release as menu_candidate, ACCEPTED_MENU_SHA256
from v116_source_reconciliation import BLOCK, RELEASE

SELECTORS = (
    b'.gccuiCaptaincyGrid label>span',
    b'#g8dialog[data-prompt="player"] .gccuiProfileOverview .g8scoutoutlook>h3',
    b'#g8dialog[data-prompt="player"] .gccuiProfileOverview .g8gccrecord>h3',
)

def patch_release(data):
    base = menu_candidate(data)
    assert sha256(base).hexdigest() == ACCEPTED_MENU_SHA256
    blocks = list(BLOCK.finditer(base))
    owners = [b for b in blocks if b.group(1).lower() == b'style'
              and b'id="gcc-v116-perfection-pass"' in b.group(2)]
    assert len(owners) == 1, 'Expected exactly one original text-rule owner'
    owner = owners[0]
    css = owner.group(3)
    for selector in SELECTORS:
        pattern = re.compile(re.escape(selector) + rb'\{([^{}]*)\}')
        hits = list(pattern.finditer(css))
        assert len(hits) == 1, f'Ambiguous rule: {selector!r}'
        hit = hits[0]
        body, count = re.subn(rb'(?<![-\w])color:var\(--gcc-accent,#[0-9a-fA-F]+\)',
                             b'color:var(--gcc-text,#eef5fa)', hit.group(1))
        assert count == 1, f'Expected exactly one identity-colour reading rule: {selector!r}'
        css = css[:hit.start(1)] + body + css[hit.end(1):]
    result = base[:owner.start(3)] + css + base[owner.end(3):]
    after = list(BLOCK.finditer(result))
    assert len(after) == len(blocks) == 39
    changed = [(a,b) for a,b in zip(blocks,after) if a.group(0) != b.group(0)]
    assert len(changed) == 1 and changed[0][0].start() == owner.start()
    assert all(a.group(0) == b.group(0) for a,b in zip(blocks,after)
               if a.group(1).lower() == b'script'), 'JavaScript changed'
    assert sha256(result).hexdigest() == 'bdfa54f5784b42eb1a0ac06065b2d2333c55548dd07789ccd41560b6848e82e0'
    return result

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--report', type=Path)
    args = p.parse_args()
    assert args.output.resolve() != RELEASE.resolve(), 'Frozen release cannot be overwritten'
    result = patch_release(RELEASE.read_bytes())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(result)
    report = dict(status='READABILITY_REVIEW_ONLY', base_sha256=ACCEPTED_MENU_SHA256,
                  candidate_sha256=sha256(result).hexdigest(), candidate_bytes=len(result),
                  existing_style_blocks_changed=1, new_style_blocks=0,
                  javascript_blocks_changed=0, reading_rules_changed=3,
                  frozen_release_unchanged=True, maintained_source_parity='UNVERIFIED')
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2)+'\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
