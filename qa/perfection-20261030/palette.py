from pathlib import Path
import json
css=Path('v8/ui/arcade-charcoal.css').read_text();

def lum(h):
 vals=[int(h[i:i+2],16)/255 for i in (1,3,5)];v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in vals];return sum(a*b for a,b in zip(v,[.2126,.7152,.0722]))
def ratio(a,b):
 a,b=sorted([lum(a),lum(b)]);return (b+.05)/(a+.05)
pairs=[('panel','#252525','#f6f4ec'),('raised','#343434','#f6f4ec'),('muted','#252525','#c9c9c5'),('button','#393939','#f6f4ec'),('primary','#df6337','#17160e'),('mine','#4a3a28','#fff4d8'),('feedback','#ead0a0','#20180e'),('alert','#78311f','#f6f4ec')]
rows=[dict(name=n,ratio=round(ratio(a,b),2),passes=ratio(a,b)>=4.5)for n,a,b in pairs];assert all(r['passes']for r in rows),rows
Path('qa/perfection-20261030/palette.json').write_text(json.dumps({'semanticPairs':rows,'limit':'Source-level semantic pairs only. Computed-style and browser layout inspection pending.'},indent=2));print(rows)
