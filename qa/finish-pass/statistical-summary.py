import json,math,collections
from pathlib import Path
root=Path('qa/finish-pass');source=json.loads((root/'source-assessment.json').read_text());base=json.loads((root/'numeric-baseline.json').read_text());final=json.loads((root/'numeric-audit.json').read_text())
def ranks(xs):
 out=[0]*len(xs);s=sorted(range(len(xs)),key=lambda i:xs[i]);i=0
 while i<len(s):
  j=i+1
  while j<len(s) and xs[s[j]]==xs[s[i]]:j+=1
  for k in range(i,j):out[s[k]]=(i+j-1)/2
  i=j
 return out
def corr(a,b):
 if len(a)<3:return None
 a=ranks(a);b=ranks(b);am=sum(a)/len(a);bm=sum(b)/len(b);den=math.sqrt(sum((x-am)**2 for x in a)*sum((y-bm)**2 for y in b));return sum((x-am)*(y-bm) for x,y in zip(a,b))/den if den else None
cs=source['comparisons'];correlations=[]
for kind in ['bat','bowl']:
 for phase in ['pp','middle','death']:
  rs=[r for r in cs if r['kind']==kind and r['phase']==phase and r['balls']>=180];correlations.append({'kind':kind,'phase':phase,'playerWindows':len(rs),'uniquePlayers':len(set(r['name'] for r in rs)),'pooledSpearman':corr([r['gameRating'] for r in rs],[r['performanceIndex'] for r in rs]),'expectedBaselineSpearman':corr([r['expectedGameRating'] for r in rs],[r['performanceIndex'] for r in rs])})
mean=lambda xs:sum(xs)/len(xs) if xs else None
population=[]
for year in [2008,2013,2018,2023,2026]:
 a=[r['annual'][year-2008] for r in base['worlds']];b=[r['annual'][year-2008] for r in final['worlds']];population.append({'year':year,'beforeMeanOverall':mean([r['meanOverall'] for r in a]),'afterMeanOverall':mean([r['meanOverall'] for r in b]),'beforeEliteCount':mean([r['elite'] for r in a]),'afterEliteCount':mean([r['elite'] for r in b])})
first={}
for p in final['players']:first.setdefault(p['id'],p)
ledger=[]
for p in first.values():
 m=source['nameMap'].get(p['name']);rows=[r for r in cs if r['name']==p['name']];ledger.append({'id':p['id'],'name':p['name'],'currentRatingBasis':p['provenance'],'registerLink':m,'deliveredEvidence':{'battingBallsAcrossNonoverlappingSeasons':sum(r['balls'] for r in source['aggregates'] if r['name']==p['name'] and r['kind']=='bat'),'bowlingBallsAcrossNonoverlappingSeasons':sum(r['balls'] for r in source['aggregates'] if r['name']==p['name'] and r['kind']=='bowl')},'attributeAssessment':{'overall':'Role-based new-save composite with an AR specialist-equivalent floor; historical and preceding private evaluators preserved','battingAndBowlingPhases':'Context-normalised historical comparison available, rating-generation method not independently reproduced' if rows else 'No matched delivery evidence in selected archives; model estimate','powerControlTechnique':'Model attributes; boundary/dot/wicket proxies need individual generation/validation','keepingFielding':'Model estimate; opportunity-adjusted historical evidence incomplete','temperamentLeadership':'Authored model estimate; not measured by delivery archive','careerDevelopment':'Seeded alternate-history model, not historical certainty'}})
catalog=json.loads(Path('v8/domain/player_profiles.json').read_text());roleFlags=[{'name':p['canonicalName'],'primaryFamily':p['primaryFamily'],'battingPeak':p.get('peakSkills',{}).get('bat'),'roleWindows':p['roleWindows'],'status':'Review role identity against T20 evidence; heuristic flag, not automatic reclassification'} for p in catalog if p['primaryFamily']=='bowling' and p.get('peakSkills',{}).get('bat',99)<60 and any(w['role']=='AR' for w in p['roleWindows'])]
report={'roleIdentityReviewFlags':roleFlags,'scope':'Independent diagnostic only. Pooled repeated player-year windows are correlated; no p-values or causal calibration claims. Historical six-over PP differs from GCC surge. Comparisons depend on reviewable identity mappings and selected archives. Positive rank association is not certification; weak association remains a release watch.','sourceMatches':sum(s['matches'] for s in source['sources']),'mappedPlayers':source['mapped'],'playersWithDeliveries':source['withDeliveries'],'unresolvedIdentities':len(source['unmatched']),'phaseRankAssociation':correlations,'population':population,'maxRawRoleCompositeGapDiagnosticOnly':max(abs(p['overall']-p['roleComposite']) for p in final['players']),'maxNewOverallContractGap':max(abs(p['overall']-p['skillOverall']) for p in final['players']),'sourceManifest':source['sources'],'register':source['register'],'identityExceptions':source['unmatched'],'modelBasisCounts':final['summary']}
(root/'statistics.json').write_text(json.dumps(report,indent=2));(root/'player-evidence-ledger.json').write_text(json.dumps(ledger,indent=2));print(json.dumps({'rankAssociation':correlations,'population':population},indent=2))
