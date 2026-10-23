"""Apply the bounded rule fix to the exact accepted palette build.
Reproduce baseline: git show 9494eb1:game/gcc_v8_product_candidate.html > qa/departure-rules/baseline.html
"""
from pathlib import Path
import sys,re,hashlib
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'v8'))
from domain.departure_adapter import adapt
base=ROOT/'qa/departure-rules/baseline.html'
h=base.read_text();assert hashlib.sha256(base.read_bytes()).hexdigest()=='32f9396b38627c2c4112905abaf1bad43567bf56e20c3914d288af0da3b4c040'
def patch_engine(s):
 s=adapt('dynasty',s)
 start=s.index('  function draftSlots(){');end=s.index('\n\n  function freeAgentPool',start)
 s=s[:start]+(ROOT/'v8/domain/draft_slots.js').read_text().rstrip()+s[end:]
 start=s.index('  let annualDraftTimer=null;');end=s.index('\n  function userAnnualDraft',start)
 s=s[:start]+(ROOT/'v8/domain/annual_draft_pace.js').read_text().rstrip()+'\n'+s[end:]
 needle='  if(o?.releasePickPolicy!=null&&o.releasePickPolicy!==1)return false;'
 assert s.count(needle)==1
 extra=(ROOT/'v8/domain/save_validation.js').read_text().split(needle)[1].split('  if(o?.cpuReleases')[0]
 s=s.replace(needle,needle+extra.rstrip())
 validation=(ROOT/'v8/domain/save_validation.js').read_text()
 start=validation.index("  for(const key of ['tradeDealsByYear'");end=validation.index('  const r=d.v8Reveal;',start)
 s=s.replace('  const r=d.v8Reveal;',validation[start:end]+'  const r=d.v8Reveal;')
 return s
matches=[m for m in re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',h) if 'function slotsWithSupplement()' in m[1]];assert len(matches)==1
m=matches[0];h=h[:m.start(1)]+patch_engine(m[1])+h[m.end(1):]
for name,marker in [('offseason','X.offseasonMarket=()=>'),('controller',"bind('comparePlayers'"),('screens','X.orderReveal=')]:
 matches=[m for m in re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',h) if marker in m[1]];assert len(matches)==1
 m=matches[0];h=h[:m.start(1)]+(ROOT/f'v8/ui/{name}.js').read_text()+h[m.end(1):]
h=re.sub(r'data-build="[a-f0-9]+"',f'data-build="{hashlib.sha256(h.encode()).hexdigest()[:16]}"',h,count=1)
for file in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html']:(ROOT/file).write_text(h)
print(hashlib.sha256(h.encode()).hexdigest())
