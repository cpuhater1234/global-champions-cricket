"""Reproduce base with: git show 762809f:game/gcc_v8_product_candidate.html > qa/hardening-20261023/baseline.html"""
from pathlib import Path
import re,hashlib,sys
root=Path(__file__).resolve().parents[2];base=root/'qa/hardening-20261023/baseline.html';h=base.read_text();assert hashlib.sha256(base.read_bytes()).hexdigest()=='b96edcdbe94bdd2b244bdfd05c552289345de248665852a1ce55e4c738bd3106'
a=h.index('  function clubOwnsPick(');b=h.index('  function drawDraftOrder()',a);h=h[:a]+(root/'v8/domain/trade_packages.js').read_text()+h[b:]
needle='  if(o?.releasePickPolicy!=null';assert h.count(needle)==1;h=h.replace(needle,(root/'v8/domain/offseason_save_validation.js').read_text()+needle)
sys.path.insert(0,str(root/'v8'));from domain.hardening_adapter import adapt
blocks=list(re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',h))
for m in reversed(blocks):
 name='foundation' if '  function clubXI(c)' in m[1] else 'dynasty' if '  function resumeSave()' in m[1] else None
 if name:h=h[:m.start(1)]+adapt(name,m[1])+h[m.end(1):]
h=re.sub(r'data-build="[a-f0-9]+"',f'data-build="{hashlib.sha256(h.encode()).hexdigest()[:16]}"',h,count=1)
out=root/'qa/hardening-20261023/candidate.html';out.write_text(h);print(hashlib.sha256(h.encode()).hexdigest())
