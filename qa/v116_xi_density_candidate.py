#!/usr/bin/env python3
"""Bounded XI component density review; no new stylesheet or game script changes."""
import argparse,re,json
from pathlib import Path
from hashlib import sha256
from v116_finals_image_candidate import patch_release as current_candidate
from v116_source_reconciliation import BLOCK,RELEASE
BASE='32a4802cfd8a1ceba0cf26cdd5a9c740c0fcf7a15432329922912f832b38d10e'
NEUTRAL=b'#g8app .gccuiSelection .gccuiRosterName .g8squadpulse>span:not(.g8pulsealert):not(.g8pulsepromise){padding:0;border:0;background:none!important;color:var(--ui-muted)!important}\n'
def patch_xi(base):
 if sha256(base).hexdigest()!=BASE:raise ValueError('XI baseline mismatch: STOP')
 blocks=list(BLOCK.finditer(base));hits=[m for m in blocks if m.group(1).lower()==b'style' and b'id="gcc-decision-ui-20261030"' in m.group(2)]
 if len(hits)!=1:raise ValueError('Ambiguous decision component owner')
 m=hits[0];css=m.group(3);edits=[]
 def replace(old,new):
  nonlocal css
  if css.count(old)!=1:raise ValueError('Expected exact unique XI owner declaration: '+old.decode())
  css=css.replace(old,new);edits.append({'before':old.decode(),'after':new.decode()})
 replace(b'#g8app .gccuiSelection .gccuiOrderRow,#g8app .gccuiSelection .gccuiBenchRow{min-height:88px;padding:10px 12px}',b'#g8app .gccuiSelection .gccuiOrderRow,#g8app .gccuiSelection .gccuiBenchRow{min-height:76px;padding:8px 12px}')
 replace(b'#g8app .gccuiSelection .gccuiRosterName{gap:4px}',b'#g8app .gccuiSelection .gccuiRosterName{gap:3px}')
 anchor=b'#g8app .gccuiSelection .gccuiRosterName{gap:3px}\n'
 if css.count(anchor)!=1:raise ValueError('Ambiguous scoped neutral status insertion')
 css=css.replace(anchor,anchor+NEUTRAL)
 result=base[:m.start(3)]+css+base[m.end(3):];after=list(BLOCK.finditer(result))
 assert len(after)==len(blocks)==39
 assert sum(x.group(1).lower()==b'style' for x in after)==17
 assert sum(x.group(1).lower()==b'script' for x in after)==22
 assert all(a.group(0)==b.group(0) for a,b in zip(blocks,after) if a.group(1).lower()==b'script')
 assert sum(a.group(0)!=b.group(0) for a,b in zip(blocks,after))==1
 reverted=css.replace(NEUTRAL,b'')
 for edit in reversed(edits):reverted=reverted.replace(edit['after'].encode(),edit['before'].encode())
 assert reverted==m.group(3)
 return result,dict(status='XI_DENSITY_REVIEW_ONLY',base_sha256=BASE,candidate_sha256=sha256(result).hexdigest(),candidate_bytes=len(result),styles=17,scripts=22,javascript_blocks_changed=0,new_style_blocks=0,existing_style_blocks_changed=1,owner='gcc-decision-ui-20261030',edits=edits,scoped_neutral_status_rule=NEUTRAL.decode(),alert_promise_excluded=True,native_rendering='PENDING',maintained_source_parity='UNVERIFIED')
def patch_release(data):
 base,_=current_candidate(data);return patch_xi(base)
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True);a=p.parse_args()
 if a.output.resolve()==RELEASE.resolve():raise ValueError('Frozen release protected')
 data,r=patch_release(RELEASE.read_bytes());a.output.parent.mkdir(parents=True,exist_ok=True);a.report.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(data);a.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
if __name__=='__main__':main()
