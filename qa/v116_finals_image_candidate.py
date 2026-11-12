#!/usr/bin/env python3
"""Review-only correction of the existing mobile finals venue-frame rule."""
import argparse
from hashlib import sha256
import json
from pathlib import Path
import re
from v116_charcoal_surface_candidate import patch_release as charcoal_candidate
from v116_source_reconciliation import BLOCK, RELEASE

BASE_SHA256='c0fe382f723f2f3894cc5689cf083c7ed47173efda38ec6df82dcf1fa777c0be'
OWNER=b'gcc-decision-ui-20261030'
RULE=b'#g8app .gccuiFinals .g8matcharena>.g8stadium .g8venueframe{height:120px!important;min-height:0!important}'
FIXED=RULE[:-1]+b';width:100%!important}'


def patch_image(base):
    if sha256(base).hexdigest()!=BASE_SHA256:raise ValueError('Finals image baseline identity mismatch: STOP')
    blocks=list(BLOCK.finditer(base))
    owners=[m for m in blocks if m.group(1).lower()==b'style' and b'id="'+OWNER+b'"' in m.group(2)]
    if len(owners)!=1:raise ValueError('Ambiguous finals image owner')
    m=owners[0];css=m.group(3)
    if css.count(RULE)!=1:raise ValueError('Expected unique existing mobile finals frame rule')
    # This exact rule belongs to the existing max-width760 media block. The
    # frame's inherited aspect-ratio4/3 turns fixed120px height into160px auto
    # width; an explicit width restores the figure's available inline size.
    i=css.index(RULE)
    if b'@media(max-width:760px){' not in css[max(0,i-400):i]:
        raise ValueError('Mobile media owner changed')
    revised=css.replace(RULE,FIXED)
    result=base[:m.start(3)]+revised+base[m.end(3):]
    after=list(BLOCK.finditer(result))
    if len(blocks)!=39 or len(after)!=39:raise ValueError('Block inventory changed')
    if sum(x.group(1).lower()==b'style' for x in after)!=17 or sum(x.group(1).lower()==b'script' for x in after)!=22:raise ValueError('Style/script count changed')
    changed=[a for a,b in zip(blocks,after) if a.group(0)!=b.group(0)]
    if changed!=[m]:raise ValueError('Unexpected block changed')
    if any(a.group(0)!=b.group(0) for a,b in zip(blocks,after) if a.group(1).lower()==b'script'):raise ValueError('Script changed')
    if result.replace(FIXED,RULE)!=base:raise ValueError('Unexpected bytes changed')
    return result,dict(status='FINALS_IMAGE_REVIEW_ONLY',base_sha256=BASE_SHA256,candidate_sha256=sha256(result).hexdigest(),candidate_bytes=len(result),existing_style_blocks_changed=1,new_style_blocks=0,styles=17,scripts=22,javascript_blocks_changed=0,correction=dict(owner=OWNER.decode(),selector=RULE.split(b'{')[0].decode(),added_declaration='width:100%!important',media='max-width:760px'),diagnosis='The existing120px height with inherited4/3 aspect-ratio and auto width permits a160px venue frame inside a wider figure. Explicit inline size should fill the figure.',native_rendering='PENDING',maintained_source_parity='UNVERIFIED')


def patch_release(data):
    base,_=charcoal_candidate(data)
    return patch_image(base)


def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True);a=p.parse_args()
    if a.output.resolve()==RELEASE.resolve():raise ValueError('Frozen release cannot be overwritten')
    data,r=patch_release(RELEASE.read_bytes());a.output.parent.mkdir(parents=True,exist_ok=True);a.report.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(data);a.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))


if __name__=='__main__':main()
