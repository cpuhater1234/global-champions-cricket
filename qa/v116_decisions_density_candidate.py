#!/usr/bin/env python3
"""Compact the existing squad-decision component without hiding content."""
import argparse,re,json
from pathlib import Path
from hashlib import sha256
from v116_analysis_density_candidate import patch_release as baseline_candidate
from v116_source_reconciliation import BLOCK,RELEASE
BASE='94a4d771548cbba76798461bf73bd2f888c12e9fed4bda6e6b7b2bd99a7faf41'
D='gcc-decision-ui-20261030';C='gcc-charcoal-20261030'
def patch_decisions(base):
 if sha256(base).hexdigest()!=BASE:raise ValueError('Decision baseline mismatch: STOP')
 blocks=list(BLOCK.finditer(base));owners={}
 for name in [D,C]:
  hits=[m for m in blocks if m.group(1).lower()==b'style' and ('id="'+name+'"').encode() in m.group(2)]
  if len(hits)!=1:raise ValueError('Ambiguous owner '+name)
  owners[name]=hits[0]
 css={k:m.group(3) for k,m in owners.items()};edits=[]
 def edit(owner,selector,old,new):
  sel=selector.encode();a=old.encode();b=new.encode();hits=[m for m in re.finditer(re.escape(sel)+rb'\s*\{([^{}]*)\}',css[owner]) if a in m.group(1)]
  if len(hits)!=1 or hits[0].group(1).count(a)!=1:raise ValueError('Ambiguous declaration '+selector+' '+old)
  m=hits[0];css[owner]=css[owner][:m.start(1)]+m.group(1).replace(a,b)+css[owner][m.end(1):];edits.append(dict(owner=owner,selector=selector,before=old,after=new))
 edit(C,'#g8app .g8dressingroom','padding:20px!important','padding:12px!important')
 edit(C,'#g8app .g8decisionline','padding:14px 0!important','padding:10px 0!important')
 edit(C,'#g8app .g8decisionline strong','font-size:16px!important','font-size:15px!important')
 edit(C,'#g8app .g8decisionline span','margin-top:4px','margin-top:0')
 p='#g8app .gccui .gccuiMatchDecisions '
 edit(D,p+'.g8dressingroom','padding:20px!important','padding:12px!important')
 edit(D,p+'.g8dressingroom h2','font-size:21px!important','font-size:19px!important')
 edit(D,p+'.g8dressingroom h2','margin:8px 0 16px!important','margin:4px 0 8px!important')
 edit(D,p+'.g8dressingroom>header','border-bottom:1px solid var(--gcc-line)!important','border-bottom:0!important')
 edit(D,p+'.g8dressingroom>header','margin-bottom:14px!important','margin-bottom:8px!important')
 p='#g8app .gccuiMatchDecisions '
 edit(D,p+'.g8decisionline','padding:12px 0!important','padding:8px 0!important')
 edit(D,p+'.g8decisionline>div','gap:3px!important','gap:2px!important')
 edit(D,p+'.g8decisionline .g8button','min-height:40px!important','min-height:44px!important')
 p='#g8app .gccuiCommandCentre .gccuiMatchDecisions '
 edit(D,p+'.g8dressingroom','padding:16px!important','padding:12px!important')
 edit(D,p+'.g8decisionline','padding:12px 0!important','padding:8px 0!important')
 edit(D,p+'.g8dressingroom>header','padding-bottom:10px!important','padding-bottom:6px!important')
 edit(D,p+'.g8dressingroom .g8eyebrow','margin:0 0 6px!important','margin:0 0 3px!important')
 edit(D,p+'.g8dressingroom h2','font-size:19px!important','font-size:18px!important')
 edit(D,p+'.g8decisionline>div','gap:3px!important','gap:2px!important')
 edit(D,p+'.g8dressingroom>.g8disclosure','margin:12px 0 0!important','margin:8px 0 0!important')
 result=base
 for k,m in sorted(owners.items(),key=lambda x:x[1].start(),reverse=True):result=result[:m.start(3)]+css[k]+result[m.end(3):]
 after=list(BLOCK.finditer(result));assert len(after)==len(blocks)==39
 assert sum(m.group(1).lower()==b'style' for m in after)==17
 assert all(a.group(0)==b.group(0) for a,b in zip(blocks,after) if a.group(1).lower()==b'script')
 assert sum(a.group(0)!=b.group(0) for a,b in zip(blocks,after))==2
 return result,dict(status='DECISIONS_DENSITY_REVIEW_ONLY',base_sha256=BASE,candidate_sha256=sha256(result).hexdigest(),candidate_bytes=len(result),edits=edits,styles=17,scripts=22,javascript_blocks_changed=0,new_style_blocks=0,no_content_hidden=True,native_rendering='PENDING',maintained_source_parity='UNVERIFIED')
def patch_release(data):
 base,_=baseline_candidate(data);return patch_decisions(base)
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True);a=p.parse_args()
 if a.output.resolve()==RELEASE.resolve():raise ValueError('Frozen release protected')
 data,r=patch_release(RELEASE.read_bytes());a.output.parent.mkdir(parents=True,exist_ok=True);a.report.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(data);a.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
if __name__=='__main__':main()
