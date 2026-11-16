"""Exact bounded HUD presentation delta; no command/persistence/engine edits."""
import argparse,hashlib,json,re
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--before',type=Path,required=True);p.add_argument('--after',type=Path,required=True);a=p.parse_args()
rx=re.compile(rb'<(style|script)\b([^>]*)>(.*?)</\1\s*>',re.I|re.S)
b=a.before.read_bytes();n=a.after.read_bytes();bs=list(rx.finditer(b));ns=list(rx.finditer(n));assert len(bs)==len(ns)==39
allowed={1,3,4,9,10,29,31,32};changed=[]
for i,(o,v) in enumerate(zip(bs,ns)):
 assert (o[1],o[2])==(v[1],v[2])
 if o[3]!=v[3]:assert i in allowed,i;changed.append(i)
assert set(changed)==allowed,changed
spec=json.loads((Path(__file__).parent/'fixtures/v116_career_frame_ui_delta.json').read_text())
old=bs[29][3].decode();new=ns[29][3].decode()
for patch in spec:
 assert old.count(patch['before'])==1,'ambiguous old HUD fragment'
 old=old.replace(patch['before'],patch['after'],1)
assert old==new,'controller differs outside reviewed HUD fragments'
strip=lambda d:rx.sub(lambda m:m[0][:m.start(3)-m.start()]+b'BODY'+m[0][m.end(3)-m.start():],d)
assert strip(b)==strip(n)
assert bs[37][3]==ns[37][3],'needs strip changed'
print(json.dumps({'status':'PASS','changed_blocks':changed,'unchanged_scripts':21,'controller_scope':'save-status/HUD markup and horizontal-only nav focus listener; exact fragments checked','before':hashlib.sha256(b).hexdigest(),'after':hashlib.sha256(n).hexdigest()}))
