"""Selection cache ownership and safe restoration after legacy trades."""
from pathlib import Path
ROOT=Path(__file__).resolve().parent
def adapt(name,script):
 if name=='foundation':
  old='const cached=(state.cpuXIs?.[c.abbr]||[]).map(byId).filter(Boolean);\n    if(cached.length===11) return cached;'
  new='const owned=new Set(state.teams[c.abbr]||[]),cached=(state.cpuXIs?.[c.abbr]||[]).filter(id=>owned.has(id)).map(byId).filter(Boolean);\n    if(cached.length===11&&new Set(cached.map(p=>p.id)).size===11) return cached;'
  assert script.count(old)==1
  script=script.replace(old,new)
 if name=='dynasty':
  marker='  function resumeSave(){';assert script.count(marker)==1
  script=script.replace(marker,(ROOT/'cpu_roster_cache.js').read_text()+marker)
  old="currentScreen=save.currentScreen||state.dynasty?.lastScreen||'team';"
  assert script.count(old)==1
  script=script.replace(old,"repairCpuOwnership();"+old)
 return script
