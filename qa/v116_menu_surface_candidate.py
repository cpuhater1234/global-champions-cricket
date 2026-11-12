#!/usr/bin/env python3
"""Replace guide ownership, without adding a visual layer or changing scripts."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
from v116_readability_candidate import patch_release as readability_candidate
from v116_source_reconciliation import BLOCK, RELEASE, ROOT

BASE_SHA='bdfa54f5784b42eb1a0ac06065b2d2333c55548dd07789ccd41560b6848e82e0'
GUIDE_START=b'/* Guide review: Claude flat + dense layout, adapted to v116 markup and charcoal tokens. */'
GUIDE_END=b'/* Archive scorebooks: four readable columns, neutral rows and a stable name edge. */'
EXCLUSION=b':not(:where([data-prompt=how],[data-prompt=howItWorks],[data-prompt=breakawayStory]))'
PREPARE=b'#g8dialog[data-prompt=prepare] .g8previewvenue>.g8eyebrow{justify-content:flex-start!important;text-align:left!important}\n'

def patch_release(data):
    base=readability_candidate(data)
    assert sha256(base).hexdigest()==BASE_SHA
    blocks=list(BLOCK.finditer(base))
    owner=[m for m in blocks if m.group(1).lower()==b'style' and GUIDE_START in m.group(3)]
    flood=[m for m in blocks if m.group(1).lower()==b'style' and b'id="gcc-floodlit-visual"' in m.group(2)]
    assert len(owner)==len(flood)==1
    guide=owner[0]; old=guide.group(3)
    a=old.index(GUIDE_START);b=old.index(GUIDE_END,a)
    assert old[a:b].count(PREPARE)==1
    source=(ROOT/'v8/ui/decision-ui.css').read_bytes()
    start=source.index(b'/* GCC guide reference surface.')
    end=source.index(GUIDE_END,start)
    css=source[start:end]
    assert css.count(PREPARE)==1
    css=css.replace(PREPARE,b'')
    assert css.count(b'/* GCC guide reference surface.')==1
    replacement=old[:a]+css+b'\n'+PREPARE+old[b:]
    f=flood[0]
    # The :where exclusion has zero specificity. On every non-guide prompt,
    # each original selector matches the same nodes with the same specificity.
    skin,n=re.subn(rb'#g8dialog(?:#g8dialog)*',lambda m:m.group(0)+EXCLUSION,f.group(3))
    assert n>20 and skin.replace(EXCLUSION,b'')==f.group(3)
    edits=[(guide.start(3),guide.end(3),replacement),(f.start(3),f.end(3),skin)]
    result=base
    for start,end,new in sorted(edits,reverse=True):
        result=result[:start]+new+result[end:]
    after=list(BLOCK.finditer(result))
    assert len(after)==len(blocks)==39
    changed=[i for i,(x,y) in enumerate(zip(blocks,after)) if x.group(0)!=y.group(0)]
    expected=[i for i,m in enumerate(blocks) if m in (guide,f)]
    assert changed==expected,(changed,expected)
    assert all(x.group(0)==y.group(0) for x,y in zip(blocks,after) if x.group(1).lower()==b'script')
    assert result.count(GUIDE_START)==0
    assert result.count(b'/* GCC guide reference surface.')==1
    return result,dict(base_sha256=BASE_SHA,guide_owner='v8/ui/decision-ui.css',
                       late_dialog_selector_exclusions=n,existing_style_blocks_changed=2,
                       new_style_blocks=0,javascript_blocks_changed=0)

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path)
    args=p.parse_args()
    assert args.output.resolve()!=RELEASE.resolve()
    result,report=patch_release(RELEASE.read_bytes())
    report.update(status='SURGICAL_GUIDE_REVIEW_ONLY',candidate_sha256=sha256(result).hexdigest(),candidate_bytes=len(result),
                  frozen_release_unchanged=True,maintained_source_parity='UNVERIFIED')
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_bytes(result)
    if args.report:
        args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))

if __name__=='__main__':main()
