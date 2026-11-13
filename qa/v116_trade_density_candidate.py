#!/usr/bin/env python3
import argparse,json,re
from pathlib import Path
from hashlib import sha256
from v116_player_density_candidate import patch_release as previous
from v116_source_reconciliation import BLOCK,RELEASE
BASE='7e3d9fb9c24876f76946029013103c79f6ce54e079f507dcd5d69e6a1351c128'
def patch_release(data):
 base,_=previous(data)
 if sha256(base).hexdigest()!=BASE:raise ValueError('Trade baseline mismatch')
 bs=list(BLOCK.finditer(base));m=next(x for x in bs if b'id="gcc-decision-ui-20261030"' in x[2]);css=m[3];edits=[]
 def edit(selector,old,new):
  nonlocal css
  hits=[x for x in re.finditer(re.escape(selector.encode())+rb'\s*\{([^{}]*)\}',css) if old.encode() in x[1]]
  if len(hits)!=1:raise ValueError('Ambiguous rule '+selector+' '+old)
  x=hits[0];css=css[:x.start(1)]+x[1].replace(old.encode(),new.encode(),1)+css[x.end(1):];edits.append([selector,old,new])
 p='#g8dialog[data-prompt=trade] '
 edit(p+'.gccTradePartner','padding:12px 14px;margin:12px 0','padding:10px 12px;margin:8px 0')
 edit(p+'.g8tradepackage','gap:14px!important','gap:10px!important')
 edit(p+':is(.g8give,.g8receive)','padding:14px!important','padding:12px!important')
 edit(p+':is(.g8give,.g8receive)>h3','padding-bottom:10px!important','padding-bottom:6px!important')
 edit(p+':is(.g8give,.g8receive)>h3','margin-bottom:12px!important','margin-bottom:8px!important')
 edit(p+'.g8tradepackage label','font-size:13px!important','margin:6px 0!important;font-size:13px!important')
 out=base[:m.start(3)]+css+base[m.end(3):];after=list(BLOCK.finditer(out));assert len(after)==len(bs)==39
 assert [x[0] for x in after if x[1].lower()==b'script']==[x[0] for x in bs if x[1].lower()==b'script']
 return out,dict(base_sha256=BASE,candidate_sha256=sha256(out).hexdigest(),candidate_bytes=len(out),edits=edits,scripts_unchanged=22,styles=17,new_stylesheets=0,native_validation='PENDING',maintained_source_parity='UNVERIFIED')
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--output',type=Path,required=True);p.add_argument('--report',type=Path,required=True);a=p.parse_args();out,r=patch_release(RELEASE.read_bytes());a.output.parent.mkdir(parents=True,exist_ok=True);a.report.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(out);a.report.write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
