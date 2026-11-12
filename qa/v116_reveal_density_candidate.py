#!/usr/bin/env python3
"""Local-only combined decision/reveal density review candidate; no runtime edits."""
import argparse,json,re
from pathlib import Path
from hashlib import sha256
from v116_decisions_density_candidate import patch_release as decisions_candidate
from v116_source_reconciliation import BLOCK,RELEASE
BASE='b02b6d4744cf4386461f13f8f6591dcfb0fb681a16534331f88ac160487e61e0'
def patch_reveal(base):
 if sha256(base).hexdigest()!=BASE:raise ValueError('Reveal baseline mismatch: STOP')
 blocks=list(BLOCK.finditer(base));styles=[m for m in blocks if m.group(1).lower()==b'style'];scripts=[m.group(0) for m in blocks if m.group(1).lower()==b'script']
 owner=next(m for m in styles if b'id="gcc-composition-20261107"' in m.group(2));first=styles[0];css=first.group(3);comp=owner.group(3);edits=[]
 def replace(text,old,new,n,where):
  a,b=old.encode(),new.encode()
  if text.count(a)!=n:raise ValueError('Guard failed '+where+': '+old+' count='+str(text.count(a)))
  edits.append(dict(owner=where,before=old,after=new,count=n));return text.replace(a,b)
 floor='.g8revealgrid.g8invitationgrid .g8club,.g8revealgrid.g8invitationgrid .g8sealed{height:auto;min-height:'
 css=replace(css,floor+'410px}',floor+'320px}',2,'base invitation floor')
 css=replace(css,floor+'390px}',floor+'300px}',1,'base invitation mobile floor')
 anchor=floor+'320px}'
 pos=css.index(anchor.encode())+len(anchor)
 rule='\n.g8invitationgrid .g8clubcover{min-height:80px;padding:12px}\n'
 css=css[:pos]+rule.encode()+css[pos:];edits.append(dict(owner='base invitation component',added_rule=rule.strip()))
 css=replace(css,'gap:.7rem 1rem;margin:0 0 1.25rem;padding:1rem 1.2rem;background:#14274c','gap:.4rem .75rem;margin:0 0 1rem;padding:12px 16px;background:#14274c',1,'base snake intro')
 css=replace(css,'.g8snakeintro p{grid-column:1/-1;flex-basis:auto;margin:0;padding-top:.65rem;','.g8snakeintro p{grid-column:1/-1;flex-basis:auto;margin:0;padding-top:.4rem;',1,'base snake paragraph')
 comp=replace(comp,'align-items:center!important; gap:1rem!important; text-align:center;','align-items:center!important; gap:.65rem!important; padding:12px!important; margin-bottom:16px!important; text-align:center;',1,'composition draw')
 comp=replace(comp,'grid-area:1/1; justify-content:center!important; align-items:center!important;','grid-area:1/1; justify-content:center!important; align-items:stretch!important;',1,'composition overlapping control cells')
 comp=replace(comp,'.g8drawcontrols .g8drawpace>.g8button { flex:1 1 8rem; }','.g8drawcontrols .g8drawpace>.g8button { flex:1 1 0; min-width:0; flex-direction:column!important; gap:4px!important; font-size:14px!important; padding:10px 8px!important; }',1,'composition mobile pace')
 result=base
 for m,data in sorted([(first,css),(owner,comp)],key=lambda x:x[0].start(),reverse=True):result=result[:m.start(3)]+data+result[m.end(3):]
 after=list(BLOCK.finditer(result));assert len(after)==len(blocks)==39
 assert len([m for m in after if m.group(1).lower()==b'style'])==17
 assert [m.group(0) for m in after if m.group(1).lower()==b'script']==scripts and len(scripts)==22
 assert sum(a.group(0)!=b.group(0) for a,b in zip(blocks,after))==2
 return result,dict(status='REVEAL_DECISIONS_DENSITY_REVIEW_ONLY',base_sha256=BASE,candidate_sha256=sha256(result).hexdigest(),candidate_bytes=len(result),edits=edits,styles=17,scripts=22,javascript_blocks_changed=0,new_style_blocks=0,hidden_reservations_preserved=True,native_rendering='PENDING',maintained_source_parity='UNVERIFIED')
def patch_release(data):
 base,_=decisions_candidate(data);return patch_reveal(base)
def main():
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True);a=p.parse_args()
 if a.output.resolve()==RELEASE.resolve():raise ValueError('Frozen release protected')
 data,r=patch_release(RELEASE.read_bytes())
 try:patch_reveal(RELEASE.read_bytes())
 except ValueError:r['negative_baseline_guard']='PASS'
 else:raise AssertionError('Wrong baseline accepted')
 a.output.parent.mkdir(parents=True,exist_ok=True);a.report.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(data);a.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
if __name__=='__main__':main()
