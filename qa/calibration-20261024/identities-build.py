import csv,json,collections,zipfile,re,hashlib
from pathlib import Path
R=Path('qa/calibration-20261024'); P=list(csv.DictReader(open('qa/finish-pass/people.csv'))); byid={r['identifier']:r for r in P}; aliases=collections.defaultdict(set)
for r in P:
 for k in ('name','unique_name'):aliases[r[k].casefold()].add(r['identifier'])
for r in csv.DictReader(open(R/'identities-names.csv')):aliases[r['name'].casefold()].add(r['identifier'])
profiles=json.load(open('v8/domain/player_profiles.json')); old=json.load(open('qa/finish-pass/source-assessment.json'))['nameMap']
ctx=collections.defaultdict(lambda:{'teams':collections.Counter(),'first':None,'last':None,'matches':0,'examples':[]});seen=set()
for zpath in Path('qa/finish-pass').glob('*_json.zip'):
 z=zipfile.ZipFile(zpath)
 for fn in z.namelist():
  if not fn.endswith('.json') or fn in seen:continue
  seen.add(fn);d=json.loads(z.read(fn));i=d['info'];reg=i['registry']['people'];dt=str(i['dates'][0])
  for team,names in i.get('players',{}).items():
   for n in names:
    k=reg[n];c=ctx[k];c['teams'][team]+=1;c['matches']+=1;c['first']=min(c['first'] or dt,dt);c['last']=max(c['last'] or dt,dt)
    if len(c['examples'])<2:c['examples'].append({'archive':zpath.name,'match':fn,'date':dt,'team':team,'registryName':n})
json.dump(ctx,open(R/'identities-context.json','w'),indent=2)
country={'IND':'India','AUS':'Australia','ENG':'England','SA':'South Africa','PAK':'Pakistan','WI':'West Indies','NZ':'New Zealand','SL':'Sri Lanka','BAN':'Bangladesh','AFG':'Afghanistan','IRE':'Ireland','NED':'Netherlands','ZIM':'Zimbabwe'}
out=[]
for p in profiles:
 n=p['canonicalName'];ex=aliases[n.casefold()];candidate=set(ex)
 if n in old:candidate.add(old[n]['id'])
 if not candidate:
  t=n.split();candidate={r['identifier'] for r in P if r['name'].split()[-1].lower()==t[-1].lower() and r['name'][0].lower()==n[0].lower()}
 if len(ex)!=1:
  out.append({'name':n,'country':p['country'],'exact':list(ex),'candidates':[{'id':k,'name':byid[k]['name'],'cricinfo':byid[k]['key_cricinfo'],'teams':ctx[k]['teams']} for k in candidate]})
json.dump(out,open(R/'identities-review.json','w'),indent=2)
print(json.dumps(out,indent=1))
