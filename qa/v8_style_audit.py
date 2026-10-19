"""Source CSS cascade audit. Requires tinycss2, cssselect2 and lxml.
Run layout and micro-layout VM suites first to refresh markup.
No geometry, browser pixels, gradient or full accessibility certification.
"""
import sys,json,re,os
import tinycss2,cssselect2
from lxml import html
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
css=Path(os.environ.get('GCC8_AUDIT_CSS',ROOT/'v8/ui/game.css')).read_text()
def matcher_for(width):
 m=cssselect2.Matcher()
 def add(rules):
  for rule in rules:
   if rule.type=='at-rule' and rule.lower_at_keyword=='media':
    q=tinycss2.serialize(rule.prelude)
    if 'prefers-reduced-motion' in q:continue
    limits=re.findall(r'(min|max)-width:\s*(\d+)px',q)
    if all(width>=int(v) if k=='min' else width<=int(v) for k,v in limits):add(tinycss2.parse_rule_list(rule.content))
   elif rule.type=='qualified-rule':
    try:sels=cssselect2.compile_selector_list(tinycss2.serialize(rule.prelude))
    except cssselect2.SelectorError:continue
    decls=[(d.lower_name,tinycss2.serialize(d.value).strip(),d.important) for d in tinycss2.parse_declaration_list(rule.content) if d.type=='declaration']
    for s in sels:m.add_selector(s,decls)
 add(tinycss2.parse_stylesheet(css));return m

def styles(doc,width):
 m=matcher_for(width);out={};pseudo={}
 for e in cssselect2.ElementWrapper.from_html_root(doc).iter_subtree():
  st={};priority={}
  for spec,order,pse,decls in m.match(e):
   for k,v,imp in decls:
    if pse:
     if pse=='after':pseudo.setdefault(e.etree_element,{})[k]=v
     continue
    rank=(imp,spec,order)
    if k not in priority or rank>=priority[k]:st[k]=v;priority[k]=rank
  par=out.get(e.etree_element.getparent(),{})
  for k,v in par.items():
   if k.startswith('--') or k in ['color','font-size','font-weight','line-height','overflow-wrap','word-break']:st.setdefault(k,v)
  for k,v in list(st.items()):
   st[k]=re.sub(r'var\((--[\w-]+)(?:,([^()]+))?\)',lambda m:st.get(m[1],m[2] or ''),v)
   if st[k]=='inherit':st[k]=par.get(k,'')
  out[e.etree_element]=st
 return out,pseudo

def rgb(v):
 if not v:return
 if v in ['transparent','none']:return
 if v=='white':v='#ffffff'
 if v=='black':v='#000000'
 if re.fullmatch(r'#[\da-fA-F]{3}',v):v='#'+''.join(c*2 for c in v[1:])
 if re.fullmatch(r'#[\da-fA-F]{6}',v):return [int(v[i:i+2],16)/255 for i in [1,3,5]]

def contrast(a,b):
 def lum(a):
  a=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in a];return sum(x*y for x,y in zip(a,[.2126,.7152,.0722]))
 a,b=sorted([lum(a),lum(b)]);return (b+.05)/(a+.05)

def background(e,sts):
 while e is not None:
  s=sts[e];v=s.get('background-color') or s.get('background','')
  if rgb(v):return rgb(v)
  if v and v not in ['transparent','none']:return
  e=e.getparent()
 return rgb('#081828')

if __name__=='__main__':
 failures={};count=0;states=set()
 for src in ['qa/v8_layout_snapshot.json','qa/micro-layout/detail_snapshot.json']:
  for name,snap in json.loads((ROOT/src).read_text()).items():
   states.add(name)
   for width in [390,768,1440]:
    markup='<html><body><div id="g8app"><header id="g8hud">'+snap.get('hud','')+'</header><main id="g8stage">'+snap.get('stage','')+'</main><dialog id="g8dialog" open><div class="g8modalbody">'+snap.get('dialog','')+'</div></dialog></div></body></html>'
    doc=html.fromstring(markup);sts,ps=styles(doc,width)
    for e in doc.iter():
     if not isinstance(e.tag,str) or e.tag in ['svg','symbol','path']:continue
     text=(e.text or '').strip()
     if not text:continue
     if any(a.get('hidden') is not None or a.get('aria-hidden')=='true' or a.get('disabled') is not None or sts.get(a,{}).get('visibility')=='hidden' for a in [e,*e.iterancestors()]):continue
     fg=rgb(sts[e].get('color'));bg=background(e,sts)
     if fg and bg:
      count+=1;r=contrast(fg,bg)
      if r<4.5:
       key=(e.tag,e.get('class',''),text[:65],sts[e].get('color'))
       failures.setdefault(key,{'ratio':round(r,2),'states':set()})['states'].add(name)
 report={'scope':'Source CSS cascade and solid-background text contrast at 390, 768 and 1440 CSS pixels. Includes expanded detail markup. Excludes gradient backgrounds, native rendering and geometric overlap.','textChecks':count,'screenStates':len(states),'uniqueLowContrast':len(failures)}
 print(json.dumps(report))
 if os.environ.get('GCC8_AUDIT_REPORT'):Path(os.environ['GCC8_AUDIT_REPORT']).write_text(json.dumps(report,indent=2)+'\n')
 for k,v in sorted(failures.items(),key=lambda x:x[1]['ratio']):print(v['ratio'],k,'states',','.join(sorted(v['states'])[:4]))

 if failures:sys.exit(1)
