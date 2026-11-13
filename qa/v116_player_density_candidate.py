#!/usr/bin/env python3
"""Guarded player report density patch; CSS only."""
import argparse,json,re
from pathlib import Path
from hashlib import sha256
from v116_reveal_density_candidate import patch_release as previous
from v116_source_reconciliation import BLOCK,RELEASE
BASE='381b5bb20f17273abe1e0c547fd253356349ed91224482a95567c7509273fab2'
def patch_release(data):
 base,_=previous(data)
 if sha256(base).hexdigest()!=BASE:raise ValueError('Player baseline mismatch')
 bs=list(BLOCK.finditer(base));m=next(x for x in bs if b'id="gcc-decision-ui-20261030"' in x[2]);css=m[3];edits=[]
 def edit(selector,old,new):
  nonlocal css
  hits=[x for x in re.finditer(re.escape(selector.encode())+rb'\s*\{([^{}]*)\}',css) if old.encode() in x[1]]
  if len(hits)!=1:raise ValueError('Ambiguous rule '+selector+' '+old)
  x=hits[0];css=css[:x.start(1)]+x[1].replace(old.encode(),new.encode(),1)+css[x.end(1):];edits.append([selector,old,new])
 p='#g8dialog[data-prompt=player] '
 edit(p+'.gccuiProfileHead','gap:14px 16px!important;padding:16px!important','gap:10px 16px!important;padding:12px!important')
 edit(p+'.gccuiFullSkills .g8skillcategory','padding:14px!important','padding:10px 0!important')
 edit(p+'.gccuiFullSkills .g8skillcategory','background:var(--gcc-panel)!important;border:1px solid var(--gcc-line)!important;border-top:3px solid var(--gcc-accent)!important','background:transparent!important;border:0!important;border-radius:0!important')
 edit(p+'.gccuiFullSkills .g8skillcategory h3','margin:0 0 10px!important;padding:0 0 8px!important;border-color:var(--gcc-line)!important','margin:0 0 4px!important;padding:0 0 4px!important;border-bottom:0!important')
 # Reuse the existing narrow-player-header media block; rating sits below close.
 anchor=b'#g8dialog[data-prompt=player] .gccuiProfileHead{padding:12px!important;gap:12px 8px!important}'
 if css.count(anchor)!=1:raise ValueError('Mobile header owner mismatch')
 mobile=b'\n@media(max-width:360px){\n#g8dialog[data-prompt=player] .gccuiProfileHead>.gccuiDossierIdentity{grid-column:1/-1}\n#g8dialog[data-prompt=player] .gccuiDossierIdentity>.g8nameandrating{align-items:start!important}\n#g8dialog[data-prompt=player] .gccuiDossierIdentity .gccuiDossierRating{padding-top:50px!important}\n}\n'
 css=css.replace(anchor,anchor+mobile,1);edits.append(['existing mobile player-header media block','identity and rating share restricted column','identity spans header; rating below close'])
 out=base[:m.start(3)]+css+base[m.end(3):];after=list(BLOCK.finditer(out))
 assert len(after)==len(bs)==39
 assert [x[0] for x in after if x[1].lower()==b'script']==[x[0] for x in bs if x[1].lower()==b'script']
 return out,dict(base_sha256=BASE,candidate_sha256=sha256(out).hexdigest(),candidate_bytes=len(out),edits=edits,scripts_unchanged=22,styles=17,new_stylesheets=0,native_validation='PENDING',maintained_source_parity='UNVERIFIED')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True);a=p.parse_args();out,r=patch_release(RELEASE.read_bytes());a.output.parent.mkdir(parents=True,exist_ok=True);a.report.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(out);a.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
