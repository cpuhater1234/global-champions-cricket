#!/usr/bin/env python3
import argparse,json,re
from pathlib import Path
from hashlib import sha256
from v116_trade_density_candidate import patch_release as previous
from v116_source_reconciliation import BLOCK,RELEASE
BASE='689438d0fcec9fdb0840935fd75f7d4d2cdbef6a94337cd74ef32d876a033504'
def patch_release(data):
 base,_=previous(data)
 if sha256(base).hexdigest()!=BASE:raise ValueError('Draft card baseline mismatch')
 bs=list(BLOCK.finditer(base));names=['gcc-decision-ui-20261030','gcc-floodlit-visual'];owners={n:next(x for x in bs if ('id="'+n+'"').encode() in x[2]) for n in names};css={n:m[3] for n,m in owners.items()};edits=[]
 def edit(owner,selector,old,new):
  hits=[x for x in re.finditer(re.escape(selector.encode())+rb'\s*\{([^{}]*)\}',css[owner]) if old.encode() in x[1]]
  if len(hits)!=1:raise ValueError('Ambiguous '+selector+' '+old)
  x=hits[0];css[owner]=css[owner][:x.start(1)]+x[1].replace(old.encode(),new.encode(),1)+css[owner][x.end(1):];edits.append([owner,selector,old,new])
 d,f=names
 edit(f,'#g8app#g8app#g8app .gccuiPlayerScout','padding:16px!important','padding:12px!important')
 edit(f,'#g8app#g8app#g8app .gccuiPlayerMonogram','width:38px;height:38px;margin:0 auto 10px','width:28px;height:28px;margin:0 auto 6px')
 edit(f,'#g8app#g8app#g8app .gccuiPlayerOverall','padding:8px 4px!important','padding:6px 4px!important')
 edit(f,'#g8app#g8app#g8app .gccuiPlayerOverall small','margin-top:5px!important','margin-top:3px!important')
 edit(d,'#g8app .gccui .gccuiPlayerIdentity','gap:6px','gap:4px')
 edit(d,'#g8app .gccui .gccuiPlayerSkills','padding:10px 0','padding:8px 0')
 edit(d,'#g8app .gccui .gccuiPlayerSkills dt','margin-bottom:6px','margin-bottom:4px')
 edit(d,'#g8app .gccui .gccuiPlayer>footer','padding:8px 12px','padding:6px 12px')
 out=base
 for n,m in sorted(owners.items(),key=lambda z:z[1].start(),reverse=True):out=out[:m.start(3)]+css[n]+out[m.end(3):]
 after=list(BLOCK.finditer(out));assert len(after)==len(bs)==39
 assert [x[0] for x in after if x[1].lower()==b'script']==[x[0] for x in bs if x[1].lower()==b'script']
 return out,dict(base_sha256=BASE,candidate_sha256=sha256(out).hexdigest(),candidate_bytes=len(out),edits=edits,scripts_unchanged=22,styles=17,new_stylesheets=0,native_validation='PENDING',maintained_source_parity='UNVERIFIED')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True);a=p.parse_args();out,r=patch_release(RELEASE.read_bytes());a.output.parent.mkdir(parents=True,exist_ok=True);a.report.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(out);a.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
