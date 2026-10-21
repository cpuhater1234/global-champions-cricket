import json, pathlib, statistics, collections, hashlib
root=pathlib.Path(__file__).parent
obs=json.loads((root/'world-101/observations.json').read_text())
mean=lambda a:round(statistics.mean(a),3) if a else None
out={'artifactSha256':hashlib.sha256(pathlib.Path('game/gcc_v8_product_candidate.html').read_bytes()).hexdigest(),'yearsObserved':[o['year'] for o in obs],'scope':'One actual complete-flow career, informed baseline with no trades and one optional release; descriptive, not population estimates. Controlled cohorts are separately scoped.','annual':[]}
for i,o in enumerate(obs):
 prev=obs[i-1] if i else None
 clubs=[]
 for club,ps in o['teams'].items():
  ids={p['id'] for p in ps};before={p['id'] for p in prev['teams'][club]} if prev else set()
  clubs.append({'club':club,'user':club==o['user'],'newPlayers':len(ids-before) if prev else None,'meanOverall':mean([p['overall'] for p in ps]),'roles':dict(collections.Counter(p['role'] for p in ps))})
 out['annual'].append({'year':o['year'],'userPosition':o['position'],'champion':o['champion'],'clubs':clubs,'userDraftPicks':len(o['choices']),'repeatAcquisitions':[]})
seen=set()
for o,a in zip(obs,out['annual']):
 a['repeatAcquisitions']=[p['name'] for p in o['choices'] if p['id'] in seen]
 seen.update(p['id'] for p in o['choices'])
out['abilityChangeDecomposition']=[]
for a,b in zip(obs,obs[1:]):
 pa={p['id']:p['overall'] for ps in a['teams'].values() for p in ps};pb={p['id']:p['overall'] for ps in b['teams'].values() for p in ps};common=pa.keys()&pb.keys()
 out['abilityChangeDecomposition'].append({'year':b['year'],'incumbentChangePerRosterSlot':round(sum(pb[i]-pa[i] for i in common)/120,4),'replacementChangePerRosterSlot':round((sum(pb[i] for i in pb.keys()-pa.keys())-sum(pa[i] for i in pa.keys()-pb.keys()))/120,4)})
out['championships']=dict(collections.Counter(o['champion'] for o in obs))
out['cpuTurnoverMean']=mean([c['newPlayers'] for y in out['annual'][1:] for c in y['clubs'] if not c['user']])
out['cpuUnchangedRosterTransitions']=sum(c['newPlayers']==0 for y in out['annual'][1:] for c in y['clubs'] if not c['user'])
# Consecutive checkpoint states contain real skill data, not only development rows.
skills=['bat','bowl','power','control','pacePlay','spinPlay','running','finishing','newBall','death','bowlControl','variation','spin','pace','fielding','keeping','temperament','leadership']
files=sorted((root/'world-101').glob('checkpoint-*.json'));hidden=[];allchanges=[];transitions=0
for fa,fb in zip(files,files[1:]):
 a=json.loads(fa.read_text())['state'];b=json.loads(fb.read_text())['state'];ap={p['id']:p for p in a['pool']};owner=b['userClub']['abbr'];roster=set(b['teams'][owner])
 for p in b['pool']:
  q=ap.get(p['id'])
  if not q or p['id'] not in roster or q.get('draftedBy')!=owner:continue
  transitions+=1;changed={k:p[k]-q[k] for k in skills if p.get(k)!=q.get(k)}
  if changed:
   row={'year':b['year'],'name':p['name'],'overallDelta':p['overall']-q['overall'],'skillDeltas':changed};allchanges.append(row)
   if row['overallDelta']==0:hidden.append(row)
out['development']={'retainedPlayerTransitions':transitions,'withSkillChanges':len(allchanges),'flatOverallWithSkillChanges':len(hidden),'examples':hidden[:8],'note':'Checkpoint-to-checkpoint retained players; overall-only UI cannot identify these changed skills. Top-three summary threshold is abs(overall delta)>=2.'}
devrows=[r for o in obs for r in o['development'] if r.get('owner')==o['user'] and r['playerId'] in {p['id'] for p in o['teams'][o['user']]}]
out['development']['overallChangesBelowSummaryThreshold']=sum(abs(r['delta'])<2 for r in devrows)
out['development']['retainedDevelopmentRows']=len(devrows)
out['leagueAbilityByYear']=[{'year':o['year'],'mean':mean([p['overall'] for ps in o['teams'].values() for p in ps]),'spread':round(statistics.pstdev([p['overall'] for ps in o['teams'].values() for p in ps]),3),'atLeast90':sum(p['overall']>=90 for ps in o['teams'].values() for p in ps),'atLeast95':sum(p['overall']>=95 for ps in o['teams'].values() for p in ps),'at99':sum(p['overall']==99 for ps in o['teams'].values() for p in ps)} for o in obs]
out['annualYearsWithNoUserDraftPicks']=[o['year'] for o in obs[1:] if not o['choices']]
out['draftFirstPickContext']=[{'year':o['year'],'name':o['choices'][0]['name'],'poolSize':o['choices'][0]['alternatives'],'foundationCohortAvailable':o['choices'][0]['entryYears'].get('2008',0)} for o in obs[1:] if o['choices']]
p=root/'policies.json'
if p.exists():
 d=json.loads(p.read_text());out['policySummary']=d['summary'];out['policyPairedWins']=[{'seed':seed,**{r['policy']:r['wins'] for r in d['runs'] if r['seed']==seed}} for seed in sorted({r['seed'] for r in d['runs']})]
 out['foundationDraftOverlap']=[]
 for policy in sorted({r['policy'] for r in d['runs']}):
  rs=[r for r in d['runs'] if r['policy']==policy];shared=[]
  for i,a in enumerate(rs):
   for b in rs[i+1:]:shared.append(len({p['id'] for p in a['choices'] if p['year']==2008}&{p['id'] for p in b['choices'] if p['year']==2008}))
  out['foundationDraftOverlap'].append({'policy':policy,'pairwiseSharedOf15':shared,'meanShared':mean(shared),'note':'Different worlds may have different clubs, signings, competition and realised careers. Overlap is descriptive, not independent evidence of player boredom.'})
(root/'analysis.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items() if k!='annual'},indent=2))
print('Annual: year position champion userPicks meanCPUturnover')
for y in out['annual']:print(y['year'],y['userPosition'],y['champion'],y['userDraftPicks'],mean([c['newPlayers'] for c in y['clubs'] if not c['user'] and c['newPlayers'] is not None]))
