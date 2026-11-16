"""Keep the guide/menu/management-heading pass CSS-only and within its three owners."""
import argparse,hashlib,json,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--before',type=Path,required=True);p.add_argument('--after',type=Path,required=True);a=p.parse_args()
pattern=re.compile(rb'<(style|script)\b([^>]*)>(.*?)</\1\s*>',re.I|re.S)
b=a.before.read_bytes();n=a.after.read_bytes();bs=list(pattern.finditer(b));ns=list(pattern.finditer(n))
assert len(bs)==len(ns)==39
allowed={9,10,31};changed=[]
for i,(o,v) in enumerate(zip(bs,ns)):
 assert (o[1],o[2])==(v[1],v[2])
 if o[3]!=v[3]:
  assert o[1].lower()==b'style' and i in allowed,(i,'unexpected body change')
  changed.append(i)
assert changed==sorted(allowed),changed
strip=lambda d:pattern.sub(lambda m:m[0][:m.start(3)-m.start()]+b'BODY'+m[0][m.end(3)-m.start():],d)
assert strip(b)==strip(n),'HTML outside bodies changed'
print(json.dumps({'status':'PASS','changed_blocks':changed,'scripts_identical':22,'styles':17,'before':hashlib.sha256(b).hexdigest(),'after':hashlib.sha256(n).hexdigest()}))
