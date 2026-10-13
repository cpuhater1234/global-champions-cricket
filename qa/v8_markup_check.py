"""Checks rendered strings, not pixels or native browser behavior."""
import json,re
from html.parser import HTMLParser
from pathlib import Path
class View(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.ids=[];self.actions=[];self.inline=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if 'data-action' in a:
   self.actions.append(a['data-action']);assert isinstance(json.loads(a.get('data-args','[]')),list)
   assert t=='button',f'Action {a["data-action"]} is not a button'
  self.inline.extend(k for k in a if k.startswith('on'))
snap=json.loads(Path('qa/v8_markup_snapshot.json').read_text())
commands=set(re.findall(r"bind\('([^']+)'",Path('v8/ui/controller.js').read_text()))
count=0
for name,v in snap.items():
 p=View();p.feed(v['stage']+v['hud']+v['dialog'])
 assert len(p.ids)==len(set(p.ids)),f'{name}: duplicate IDs'
 assert not p.inline,f'{name}: legacy inline action leaked'
 assert set(p.actions)<=commands,f'{name}: missing command {set(p.actions)-commands}'
 assert 'undefined' not in v['stage']+v['dialog'],f'{name}: undefined output'
 assert 'NaN' not in v['stage']+v['dialog'],f'{name}: non-finite rating'
 count+=len(p.actions)
result={'scope':'Parsed HTML strings from the VM DOM stub; does not validate geometry or visual quality.','view_states':len(snap),'action_bindings':count,'errors':[]}
Path('qa/v8_markup_results.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
