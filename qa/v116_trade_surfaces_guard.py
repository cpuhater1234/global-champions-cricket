"""Bound the trade-surface pass to three existing CSS owners and one display condition."""
import argparse,json,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--before',type=Path,required=True);p.add_argument('--after',type=Path,required=True);a=p.parse_args()
pattern=re.compile(rb'<(style|script)\b([^>]*)>(.*?)</\1\s*>',re.I|re.S)
before=a.before.read_bytes();after=a.after.read_bytes();bs=list(pattern.finditer(before));cs=list(pattern.finditer(after));assert len(bs)==len(cs)==39
pairs=json.loads((Path(__file__).parent/'v116_trade_surfaces_replacements.json').read_text())['29-runtime.js'];expected=bytearray();cursor=0;changed=[]
for i,(b,c) in enumerate(zip(bs,cs)):
 body=b[3]
 if body!=c[3]:changed.append(i)
 if i in [1,10,31]:
  assert b[1].lower()==b'style';body=c[3]
 elif i==29:
  assert b[1].lower()==b'script'
  for old,new in pairs:
   assert body.count(old.encode())==1;body=body.replace(old.encode(),new.encode())
 expected.extend(before[cursor:b.start(3)]);expected.extend(body);cursor=b.end(3)
expected.extend(before[cursor:]);assert bytes(expected)==after,'Unexpected change outside CSS owners and exact render condition';assert changed==[1,10,29,31],changed
print(json.dumps(dict(status='PASS',changed_blocks=changed,other_script_bodies_identical=21,scope='Three existing CSS owners; one duplicate-warning render condition; all other bytes identical.')))
