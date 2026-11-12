#!/usr/bin/env python3
"""Review-only analysis component density, editing existing owner rules."""
import argparse,json,re
from pathlib import Path
from hashlib import sha256
from v116_xi_density_candidate import patch_release as xi_candidate
from v116_source_reconciliation import BLOCK,RELEASE
BASE='1f7ae1e1811d53327f425b80ed66779258cfd2fb52382ea6db973d99af9e385f'
D='gcc-decision-ui-20261030';C='gcc-charcoal-20261030';S=b'#g8dialog[data-prompt=teamAnalysis] '
def patch_analysis(base):
 if sha256(base).hexdigest()!=BASE:raise ValueError('Analysis baseline identity mismatch: STOP')
 blocks=list(BLOCK.finditer(base));owners={}
 for name in [D,C]:
  hits=[m for m in blocks if m.group(1).lower()==b'style' and ('id="'+name+'"').encode() in m.group(2)]
  if len(hits)!=1:raise ValueError('Ambiguous analysis owner: '+name)
  owners[name]=hits[0]
 css={n:m.group(3) for n,m in owners.items()};edits=[]
 def edit(owner,selector,old,new):
  hits=[m for m in re.finditer(re.escape(selector)+rb'\{([^{}]*)\}',css[owner]) if old in m.group(1)]
  if len(hits)!=1 or hits[0].group(1).count(old)!=1:raise ValueError('Ambiguous analysis declaration: '+selector.decode()+' '+old.decode())
  m=hits[0];start=m.start(1);end=m.end(1);body=m.group(1).replace(old,new)
  css[owner]=css[owner][:start]+body+css[owner][end:];edits.append(dict(owner=owner,selector=selector.decode(),before=old.decode(),after=new.decode()))
 edit(D,S+b'.g8teamread',b'padding:14px!important',b'padding:8px!important;border:0!important')
 edit(C,b'#g8dialog .g8analysissection',b'border-top:3px solid var(--gcc-line)!important',b'border-top:0!important')
 edit(C,b'#g8dialog .g8analysissection h3',b'border-bottom:1px solid var(--gcc-line)!important',b'border-bottom:0!important')
 edit(C,b'#g8dialog .g8analysissection h3',b'padding-bottom:12px!important',b'padding-bottom:8px!important')
 edit(D,S+b'.g8analysissection',b'padding:12px!important',b'padding:8px!important')
 edit(D,S+b'.g8analysistiles',b'grid-auto-rows:minmax(88px,auto)',b'grid-auto-rows:minmax(76px,auto)')
 edit(D,S+b'.g8analysisrow',b'min-height:88px!important',b'min-height:76px!important')
 edit(D,S+b'.g8analysisrow',b'padding:10px 8px!important',b'padding:8px 8px!important;gap:4px!important')
 edit(D,S+b'.g8analysisrow>strong',b'font-size:28px!important',b'font-size:28px!important;line-height:1.1!important')
 result=base
 for owner,m in sorted(owners.items(),key=lambda p:p[1].start(),reverse=True):result=result[:m.start(3)]+css[owner]+result[m.end(3):]
 after=list(BLOCK.finditer(result));assert len(after)==len(blocks)==39
 assert sum(m.group(1).lower()==b'style' for m in after)==17 and sum(m.group(1).lower()==b'script' for m in after)==22
 assert all(a.group(0)==b.group(0) for a,b in zip(blocks,after) if a.group(1).lower()==b'script')
 assert sum(a.group(0)!=b.group(0) for a,b in zip(blocks,after))==2
 for owner,m in owners.items():
  restored=css[owner]
  for e in reversed([e for e in edits if e['owner']==owner]):
   hits=[r for r in re.finditer(re.escape(e['selector'].encode())+rb'\{([^{}]*)\}',restored) if e['after'].encode() in r.group(1)]
   assert len(hits)==1
   r=hits[0];body=r.group(1).replace(e['after'].encode(),e['before'].encode(),1)
   restored=restored[:r.start(1)]+body+restored[r.end(1):]
  assert restored==m.group(3)
 return result,dict(status='ANALYSIS_DENSITY_REVIEW_ONLY',base_sha256=BASE,candidate_sha256=sha256(result).hexdigest(),candidate_bytes=len(result),styles=17,scripts=22,javascript_blocks_changed=0,new_style_blocks=0,existing_style_blocks_changed=2,edits=edits,metric_labels_values_groups_unchanged=True,notes=['Existing2.7em label floor remains;76px is a minimum, not guaranteed rendered tile height.','Metric tiles are noninteractive divs; no click target is invented.'],native_rendering='PENDING',maintained_source_parity='UNVERIFIED')
def patch_release(data):
 base,_=xi_candidate(data);return patch_analysis(base)
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True);a=p.parse_args()
 if a.output.resolve()==RELEASE.resolve():raise ValueError('Frozen release protected')
 data,r=patch_release(RELEASE.read_bytes());a.output.parent.mkdir(parents=True,exist_ok=True);a.report.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(data);a.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
if __name__=='__main__':main()
