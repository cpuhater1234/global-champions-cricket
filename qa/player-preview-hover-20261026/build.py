from pathlib import Path
import re,json,hashlib
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text();old=(q/'workspace.css.baseline').read_text();assert h.count(old)==1;b=h.replace(old,(r/'v8/ui/workspace.css').read_text());
for n in ['roles.js','controller.js','data.js','career.js']:
 old=(q/(n+'.baseline')).read_text();assert b.count(old)==1,n;b=b.replace(old,(r/'v8/ui'/n).read_text(),1)
scripts=lambda s:re.findall(r'<script\b[^>]*>[\s\S]*?</script>',s);assert scripts(h)[:11]==scripts(b)[:11]
for p in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html']:(r/p).write_text(b)
(q/'build.json').write_text(json.dumps({'sha256':hashlib.sha256(b.encode()).hexdigest(),'engineScriptsIdentical':True},indent=2));print('CSS-only build')
