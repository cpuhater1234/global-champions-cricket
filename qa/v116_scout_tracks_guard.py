import argparse,re,json
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--before',type=Path,required=True);p.add_argument('--after',type=Path,required=True);a=p.parse_args();before=a.before.read_bytes();after=a.after.read_bytes();rx=re.compile(rb'<(style|script)\b([^>]*)>(.*?)</\1\s*>',re.I|re.S);bs=list(rx.finditer(before));cs=list(rx.finditer(after));assert len(bs)==len(cs)==39
expected=bytearray();cursor=0;changed=[]
for i,(b,c) in enumerate(zip(bs,cs)):
 body=b[3]
 if body!=c[3]:changed.append(i)
 if i in [10]:assert b[1].lower()==b'style';body=c[3]
 expected.extend(before[cursor:b.start(3)]);expected.extend(body);cursor=b.end(3)
expected.extend(before[cursor:]);assert bytes(expected)==after;assert changed==[10],changed
print(json.dumps(dict(status='PASS',changed_css_owners=changed,scripts_identical=22,all_other_bytes_identical=True)))
