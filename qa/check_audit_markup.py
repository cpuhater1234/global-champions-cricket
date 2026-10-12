"""Parse generated markup, resolve handlers and check structural IDs/names."""
import json,re,sys,subprocess
from pathlib import Path
from lxml import html
data=json.loads(Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/gcc-audit-markup.json').read_text())
report={'source':data['source'],'scope':'Parsed generated HTML, not browser rendering. Imperative SVG replacement, selector queries and layout are not represented.','states':[],'failures':[],'handler_checks':0}
for stage in data['stages']:
    root=html.fromstring(data['shell'])
    # Install generated roots, then hydrate existing IDs. Repeated passes allow
    # fragments whose targets are created by an outer fragment to be applied.
    for frag in stage['fragments']:
        if not root.xpath('//*[@id=$id]',id=frag['id']) and frag['parent']=='body':
            el=html.Element('section',id=frag['id']);root.xpath('//body')[0].append(el)
    applied=set()
    for _ in range(3):
        for frag in stage['fragments']:
            if frag['id'] in applied:continue
            found=root.xpath('//*[@id=$id]',id=frag['id'])
            if len(found)!=1:continue
            el=found[0]
            if 'screen' in frag['className'].split():el.set('class',frag['className'])
            if frag['html']:
                for child in list(el):el.remove(child)
                el.text=None
                parts=html.fragments_fromstring(frag['html'])
                for part in parts:
                    if isinstance(part,str):el.text=(el.text or '')+part
                    else:el.append(part)
            applied.add(frag['id'])
    ids=root.xpath('//@id');duplicates=sorted({i for i in ids if ids.count(i)>1})
    if duplicates:report['failures'].append({'stage':stage['name'],'kind':'duplicate IDs','ids':duplicates})
    handlers=[]
    for el in root.iter():
        if not isinstance(el.tag,str):continue
        for key,code in el.attrib.items():
            if key.startswith('on'):
                handlers.append(code)
                for api,name in re.findall(r'\b(GCC|Dynasty)\.([A-Za-z_]\w*)\s*\(',code):
                    report['handler_checks']+=1
                    if name not in stage['api'][api]:report['failures'].append({'stage':stage['name'],'kind':'unknown handler','api':api,'name':name})
        if el.tag=='button' and not ''.join(el.itertext()).strip() and not (el.get('aria-label') or el.get('title')):
            report['failures'].append({'stage':stage['name'],'kind':'unnamed button','id':el.get('id')})
        if el.tag=='button' and el.get('aria-selected') is not None and el.get('role')!='tab':
            report['failures'].append({'stage':stage['name'],'kind':'aria-selected on a non-tab button'})
    # Compile decoded handler attributes without executing any actions.
    result=subprocess.run(['node','--input-type=module','-e',"import vm from 'node:vm';import fs from 'node:fs';for(const code of JSON.parse(fs.readFileSync(0,'utf8')))new vm.Script('function audit(event){'+code+'}');"],input=json.dumps(handlers),text=True,capture_output=True)
    if result.returncode:report['failures'].append({'stage':stage['name'],'kind':'handler syntax','error':result.stderr[:1000]})
    report['states'].append({'stage':stage['name'],'ids':len(ids),'handlers':len(handlers),'hydrated_targets':len(applied)})
report['game_errors']=data['errors']
if data['errors']:report['failures'].append({'kind':'game console errors','errors':data['errors']})
out=Path(sys.argv[2] if len(sys.argv)>2 else 'qa/v792_markup_results.json');out.write_text(json.dumps(report,indent=2)+'\n')
print(len(report['states']),'states;',report['handler_checks'],'handler bindings;',len(report['failures']),'failures')
if report['failures']:print(json.dumps(report['failures'],indent=2));sys.exit(1)
