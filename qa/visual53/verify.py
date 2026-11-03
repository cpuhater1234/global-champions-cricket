"""Verify a visual-only merge, embedded fonts and licence preservation."""
import base64,hashlib,io,json,re
from pathlib import Path
from fontTools.ttLib import TTFont
root=Path(__file__).resolve().parents[2]
a=(root/'deliver/GCC_v8_Playtest_52.html').read_text();b=(root/'qa/perfection-20261030/candidate.html').read_text()
scripts=lambda s:re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',s,re.I)
assert len(scripts(a))==20 and scripts(a)==scripts(b),'Game scripts changed'
assert '@import url(\'https://fonts.googleapis' not in b
faces=json.loads((root/'v8/ui/assets/floodlit-fonts.json').read_text());assert len(faces)==5
for f in faces:
 font=TTFont(io.BytesIO(base64.b64decode(f['base64'])));cmap=font.getBestCmap()
 assert all(ord(c) in cmap for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),f['family']
assert 'gcc-floodlit-visual' in b and 'SIL OPEN FONT LICENSE Version 1.1' in b
r={'gameScriptsIdenticalToBuild52':True,'scriptCount':20,'embeddedFaces':len(faces),'remoteFontRequests':False,'sha256':hashlib.sha256(b.encode()).hexdigest(),'candidateBytes':len(b.encode())}
(root/'qa/visual53/verification.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
