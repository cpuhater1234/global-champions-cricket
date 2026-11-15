"""Prove the complete HTML differs only by reviewed, exact copy substitutions."""
import argparse,json,re
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--before',type=Path,required=True);p.add_argument('--after',type=Path,required=True);a=p.parse_args()
pairs=json.loads((Path(__file__).parent/'v116_copy_replacements.json').read_text())
changes={int(k[:2]):v for k,v in pairs.items()};raw=a.before.read_bytes();blocks=list(re.finditer(rb'<(style|script)\b([^>]*)>(.*?)</\1\s*>',raw,re.I|re.S));assert len(blocks)==39
expected=bytearray();cursor=0;count=0
for i,m in enumerate(blocks):
 body=m[3]
 if i in changes:
  assert m[1].lower()==b'script'
  for old,new in changes[i]:
   assert body.count(old.encode())==1,(i,old)
   body=body.replace(old.encode(),new.encode());count+=1
 expected.extend(raw[cursor:m.start(3)]);expected.extend(body);cursor=m.end(3)
expected.extend(raw[cursor:]);assert bytes(expected)==a.after.read_bytes(),'Unapproved change outside exact copy replacements'
print(json.dumps(dict(status='PASS',copy_replacements=count,changed_script_owners=sorted(changes),all_other_bytes_identical=True)))
