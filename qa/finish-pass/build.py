from pathlib import Path
import hashlib,re
root=Path(__file__).resolve().parents[2];base=root/'qa/finish-pass/baseline.html';h=base.read_text();assert hashlib.sha256(base.read_bytes()).hexdigest()=='5088df01d3355c7a71a090e951bfe42f1e2976c0879ace591414205ad315d2b9'
# Replace source-owned modules between stable production anchors, keeping frozen data and UI intact.
for name,a,b in [('career_outcomes','window.GCC8_OUTCOMES=','/* Initialisation and migration only.'),('career_state','window.GCC8_CAREER_STATE=','/* Recruitment consumes estimates'),('scouting','window.GCC8_SCOUTING=','window.GCC8_DEVELOPMENT=')]:
 start=h.index(a);end=h.index(b,start);source=(root/f'v8/domain/{name}.js').read_text();source=source[source.index(a):].rstrip()+'\n\n';h=h[:start]+source+h[end:]
# Optional UI changes are exact module replacements; all other scripts remain byte-identical.
for n,path in [(12,'v8/ui/data.js'),(15,'v8/ui/match_story.js')]:
 source=(root/path).read_text()
 # Sources omit the clock wrapper installed by the product builder.
 blocks=list(re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',h));m=blocks[n];prefix=m[1][:m[1].find('\n')+1] if m[1].startswith('(()=>{const {setTimeout') else '';suffix='\n})();' if prefix else ''
 # Only replace if requested; untouched source line endings can differ from frozen blocks.
 if '--ui' in __import__('sys').argv:h=h[:m.start(1)]+prefix+source+suffix+h[m.end(1):]
h=re.sub(r'data-build="[a-f0-9]+"',f'data-build="{hashlib.sha256(h.encode()).hexdigest()[:16]}"',h,count=1)
out=root/'qa/finish-pass/candidate.html';out.write_text(h);print(hashlib.sha256(out.read_bytes()).hexdigest())
