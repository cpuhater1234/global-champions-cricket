#!/usr/bin/env python3
"""Generate a disposable v116 candidate with three in-place CSS corrections.

The frozen playable release is never rewritten. This preserves the exact
signing-width review change, then corrects two independently measured finals
overflows inside existing style blocks. No stylesheets, classes, or JavaScript
blocks are added. This is not a source-reproducible release.
"""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
import sys

sys.path.insert(0,str(Path(__file__).resolve().parent))
from v116_source_reconciliation import BLOCK, RELEASE
from v116_signing_width_candidate import patch_release as signing_candidate

EXPECTED_SIGNING_SHA = 'a8aa0b653d2476b120353e3511e43e2b07d8f92e9a3b2ce9ff383313f7cf3ecb'
ACCEPTED_CANDIDATE_SHA = '5ba82e499b0b8d08706aab851449d20b6d315bf9b780a8c9674b44933d3fe094'
ACCEPTED_CANDIDATE_BYTES = 6635108

# Select precisely the existing mobile Grand Final arena rule.
ARENA = re.compile(
    rb'(#g8app\s+\.gccuiFinals\s+\.g8matcharena\s*\{)([^{}]*?)(\})',
    re.I|re.S)
# The decorative champion glow currently exceeds its containing block by 6%.
GLOW = re.compile(
    rb'(#g8app#g8app#g8app\s+\.gccuiFinals\.gccuiTitleWon::after\s*\{)([^{}]*?)(\})',
    re.I|re.S)
OVERHANG = re.compile(rb'left\s*:\s*-6%\s*;\s*right\s*:\s*-6%\s*;',re.I)

def patch_release(data):
    signing = signing_candidate(data)
    assert sha256(signing).hexdigest() == EXPECTED_SIGNING_SHA, 'Unexpected signing candidate'
    blocks=list(BLOCK.finditer(signing))
    assert len(blocks)==39, 'Unexpected style and script inventory'
    css_styles=[m for m in blocks if m.group(1).lower()==b'style']
    arena_hits=[(m,h) for m in css_styles for h in ARENA.finditer(m.group(3))
                if b'flex-direction:column!important' in h.group(2)
                and b'gap:16px!important' in h.group(2)
                and b'padding:16px!important' in h.group(2)]
    assert len(arena_hits)==1, f'Expected one mobile finals arena rule; got {len(arena_hits)}'
    glow_hits=[(m,h) for m in css_styles for h in GLOW.finditer(m.group(3))]
    assert len(glow_hits)==1, f'Expected one champion glow rule; got {len(glow_hits)}'
    changed_styles={}
    for style,hit in arena_hits:
        body=hit.group(2)
        assert b'align-items' not in body, 'Arena stretch already defined'
        changed_styles[style.start(3)]=(style,hit,hit.group(1)+body+b';align-items:stretch!important'+hit.group(3))
    for style,hit in glow_hits:
        assert style.start(3) not in changed_styles, 'Unexpected shared style block'
        body=hit.group(2)
        assert len(OVERHANG.findall(body))==1, 'Expected exact 6% glow overhang'
        newbody,number=OVERHANG.subn(b'left:0;right:0;',body)
        assert number==1
        changed_styles[style.start(3)]=(style,hit,hit.group(1)+newbody+hit.group(3))

    # Work backwards so editing the second style cannot shift the first offset.
    result=signing
    for _,(style,hit,replacement) in sorted(changed_styles.items(),reverse=True):
        a=style.start(3)+hit.start()
        b=style.start(3)+hit.end()
        assert result[a:b]==hit.group(0), 'Unexpected offset or concurrent change'
        result=result[:a]+replacement+result[b:]

    after=list(BLOCK.finditer(result))
    assert len(after)==39, 'Style/script inventory changed'
    changes=0
    for previous,current in zip(blocks,after):
        assert previous.group(1).lower()==current.group(1).lower()
        if previous.group(0)!=current.group(0):
            assert previous.group(1).lower()==b'style', 'JavaScript block mutated'
            changes+=1
    assert changes==2, f'Expected precisely two CSS block edits, got {changes}'
    assert b'align-items:stretch!important' in result
    assert len(result)==ACCEPTED_CANDIDATE_BYTES, 'Accepted candidate size changed; stop and re-review'
    assert sha256(result).hexdigest()==ACCEPTED_CANDIDATE_SHA, 'Accepted candidate SHA changed; stop and re-review'
    return result

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,required=True)
    parser.add_argument('--report',type=Path)
    a=parser.parse_args()
    assert a.output.resolve()!=RELEASE.resolve(), 'Frozen playable HTML must not be overwritten'
    built=patch_release(RELEASE.read_bytes())
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_bytes(built)
    result={
        'status':'EXPERIMENTAL_CANDIDATE_ONLY',
        'base_signing_sha256':EXPECTED_SIGNING_SHA,
        'candidate_sha256':sha256(built).hexdigest(),
        'candidate_bytes':len(built),
        'css_edits':['Existing Grand Final mobile arena: stretch flex children',
                     'Existing championship glow: constrain overlay to container'],
        'playable_release_unchanged':True,
        'main_unchanged':True,
        'source_reproducibility':'UNVERIFIED'
    }
    if a.report:
        a.report.parent.mkdir(parents=True,exist_ok=True)
        a.report.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2),flush=True)

if __name__=='__main__':
    main()
