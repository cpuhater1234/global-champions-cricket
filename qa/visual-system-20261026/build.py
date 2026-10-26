from pathlib import Path
import re,json,hashlib
q=Path(__file__).resolve().parent;r=q.parents[1];h=(q/'baseline.html').read_text();base=h;old=(q/'workspace.css.baseline').read_text();assert h.count(old)==1;h=h.replace(old,(r/'v8/ui/workspace.css').read_text());scripts=lambda s:re.findall(r'<script\b[^>]*>[\s\S]*?</script>',s);assert scripts(base)==scripts(h)
for p in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html']:(r/p).write_text(h)
(q/'build.json').write_text(json.dumps({'sha256':hashlib.sha256(h.encode()).hexdigest(),'allScriptsIdentical':True},indent=2));print('CSS-only build; all scripts identical')
