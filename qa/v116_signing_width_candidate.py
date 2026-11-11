#!/usr/bin/env python3
"""Exact v116 review candidate: remove one shadowing signing-week min-width rule.

NOT a new release. Does not rewrite the frozen HTML or reconcile the full
v8/build.py pipeline. The earlier composition block already owns min-width:0;
the later cleanup block overrides it to 72px, causing 390px viewport overflow.
"""
import argparse
from hashlib import sha256
from pathlib import Path
import json
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from v116_source_reconciliation import BLOCK, RELEASE, EXPECTED_SHA256, EXPECTED_BYTES

TARGET_ID = b'gcc-cleanup-pass'
SELECTOR = rb'#g8app#g8app#g8app\s+\.g8days\s*>\s*span'
PATTERN = re.compile(
    rb'(' + SELECTOR + rb'\s*\{[^{}]*?)(\bmin-width\s*:\s*72px\s*;\s*)([^{}]*?\})',
    re.I | re.S
)

def patch_release(data):
    assert len(data) == EXPECTED_BYTES and sha256(data).hexdigest() == EXPECTED_SHA256, (
        "Input is not exact frozen v116; refusing to generate a candidate")
    blocks = list(BLOCK.finditer(data))
    styles = [
        m for m in blocks
        if m.group(1).lower() == b'style' and
        re.search(rb'\bid\s*=\s*["\']gcc-cleanup-pass["\']', m.group(2), re.I)
    ]
    assert len(styles) == 1, "Expected one gcc-cleanup-pass style block"
    target = styles[0]
    source = target.group(3)
    hits = list(PATTERN.finditer(source))
    assert len(hits) == 1, "Refusing ambiguous/unexpected signing-day rule"
    hit = hits[0]
    changed = source[:hit.start()] + hit.group(1) + hit.group(3) + source[hit.end():]
    assert len(changed) < len(source)
    assert b'min-width:72px' not in changed[hit.start():hit.start()+200]
    candidate = data[:target.start(3)] + changed + data[target.end(3):]
    new_blocks = list(BLOCK.finditer(candidate))
    assert len(new_blocks) == len(blocks) == 39, "Style/script structure changed"
    for i, (prior, after) in enumerate(zip(blocks, new_blocks)):
        if prior.group(0) != after.group(0):
            assert prior is target or prior.start() == target.start(), (
                f"Unexpected modification to block {i}")
    # We also verify that bytes before and after the target block are untouched.
    assert candidate[:target.start(3)] == data[:target.start(3)]
    assert candidate[target.start(3)+len(changed):] == data[target.end(3):]
    return candidate

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output",type=Path,required=True)
    p.add_argument("--report",type=Path)
    a=p.parse_args()
    output=a.output.resolve()
    if output == RELEASE.resolve():
        raise SystemExit("Refusing to overwrite frozen v116")
    built=patch_release(RELEASE.read_bytes())
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_bytes(built)
    result={
        "status":"CANDIDATE_ONLY",
        "source_sha256":EXPECTED_SHA256,
        "candidate_sha256":sha256(built).hexdigest(),
        "candidate_bytes":len(built),
        "edited_style_id":TARGET_ID.decode(),
        "edit":"Remove the later min-width:72px declaration, restoring earlier min-width:0",
        "playable_release_unchanged":True,
        "maintained_source_parity":"UNVERIFIED"
    }
    if a.report:
        a.report.parent.mkdir(parents=True,exist_ok=True)
        a.report.write_text(json.dumps(result,indent=2)+"\n")
    print(json.dumps(result,indent=2),flush=True)

if __name__=="__main__":
    main()
