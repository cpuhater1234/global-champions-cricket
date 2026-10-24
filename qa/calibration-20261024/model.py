"""Chronological opponent/context-adjusted T20 diagnostic. Not a claim of measured technique."""
import collections,json,sqlite3,os,hashlib
from pathlib import Path
import numpy as np
from scipy.stats import spearmanr
from sklearn.feature_extraction import DictVectorizer
from sklearn.linear_model import Ridge
from sklearn.isotonic import IsotonicRegression
ROOT=Path(__file__).resolve().parent
ALPHAS=[60.,180.,480.,1200.]
VALIDATION=[2020,2021,2022]
TEST=[2023,2024,2025,2026]
def training_rows(rows,end):return [r for r in rows if end-2<=r['year']<=end]
def features(r):
 p=r['phase'];slot=0 if r['slot']<=3 else 1 if r['slot']<=7 else 2
 return {f'B:{r["bat"]}:{p}':1.,f'Q:{r["bowl"]}:{p}':-1.,f'base:{p}':10.,f'comp:{r["comp"]}:{p}':5.,f'venue:{r["venue"]}:{p}':1.,f'year:{r["year"]}:{p}':3.,f'innings:{r["innings"]}:{p}':5.,f'slot:{slot}:{p}':5.}
def cluster_interval(rows,repeats=1000):
 ids=sorted(set(r['id']for r in rows));byid={i:[r for r in rows if r['id']==i]for i in ids};rng=np.random.default_rng(62424);gains=[]
 def rho(rs,k):
  if len(rs)<3 or len(set(r[k]for r in rs))<2 or len(set(r['actual']for r in rs))<2:return 0.
  return float(spearmanr([r[k]for r in rs],[r['actual']for r in rs]).statistic)
 for _ in range(repeats):
  rs=[r for i in rng.choice(ids,len(ids),replace=True)for r in byid[i]];gains.append(rho(rs,'prediction')-rho(rs,'legacy'))
 return {'playerClusters':len(ids),'rows':len(rows),'modelSpearman':rho(rows,'prediction'),'legacySpearman':rho(rows,'legacy'),'gainInterval975':np.quantile(gains,[.0125,.9875]).tolist(),'design':'Seeded player-cluster bootstrap,97.5% intervals per family for two predeclared promotion gates; repeated years stay in each player cluster.'}
def load():
 manifest=json.loads((ROOT/'ingest-report.json').read_text());assert hashlib.sha256((ROOT/'deliveries.sqlite').read_bytes()).hexdigest()==manifest['datasetSha256'],'Incomplete or mismatched normalised data'
 c=sqlite3.connect(ROOT/'deliveries.sqlite');c.row_factory=sqlite3.Row;rows=[dict(r)for r in c.execute('SELECT * FROM records')];states=[dict(r)for r in c.execute('SELECT * FROM states')];c.close();return rows,states
def costs_from_training(states):
 costs=[];details=[]
 for ph in range(3):
  rs=[r for r in states if r['phase']==ph and r['n']>0];xs=[r['wickets']for r in rs]+[10];ys=[r['remaining']/r['n']for r in rs]+[0.];ns=[r['n']for r in rs]+[sum(r['n']for r in rs)];iso=IsotonicRegression(increasing=False,out_of_bounds='clip').fit(xs,ys,sample_weight=ns);values=iso.predict(np.arange(11));weights=np.array([next((r['n']for r in rs if r['wickets']==w),0)for w in range(10)]);cost=float(np.average(np.maximum(0,values[:-1]-values[1:]),weights=weights));costs.append(cost);details.append({'phase':ph,'cost':cost,'remainingRunsByWickets':values.tolist(),'legalStateObservations':int(weights.sum())})
 return costs,details
def fit(rows,end,alpha,costs,context_only=False):
 train=training_rows(rows,end);fs=[features(r)for r in train]
 if context_only:fs=[{k:v for k,v in x.items()if not k.startswith(('B:','Q:'))}for x in fs]
 vector=DictVectorizer(sparse=True);X=vector.fit_transform(fs);heads={};coefs={}
 for family,den,num in [('bat','faced','bat_runs'),('bowl','legal','charged')]:
  weights=np.array([r[den]for r in train],dtype=float);mask=weights>0;y=np.array([(r[num]-costs[r['phase']]*r['credited'])/max(1,r[den])for r in train]);reg=Ridge(alpha=alpha,fit_intercept=False,solver='lsqr',tol=1e-5,max_iter=500).fit(X[mask],y[mask],sample_weight=weights[mask]);heads[family]=reg;coefs[family]=dict(zip(vector.get_feature_names_out(),reg.coef_))
 slot_prior=collections.defaultdict(lambda:collections.Counter())
 for r in train:
  band=0 if r['slot']<=3 else 1 if r['slot']<=7 else 2;slot_prior[r['bat'],r['phase']][band]+=r['faced']
 slot_prior={key:{band:n/sum(v.values())for band,n in v.items()}for key,v in slot_prior.items()if sum(v.values())}
 return {'slotPrior':slot_prior,'vector':vector,'heads':heads,'coefs':coefs,'train':train,'end':end,'alpha':alpha}
def evaluate(model,rows,year,costs,game,ids):
 target=[r for r in rows if r['year']==year];X=model['vector'].transform([features(r)for r in target]);pred={k:m.predict(X)for k,m in model['heads'].items()};group=collections.defaultdict(lambda:collections.Counter());errors={}
 for family,den,num,prefix in [('bat','faced','bat_runs','B'),('bowl','legal','charged','Q')]:
  coef=model['coefs'][family];err=weight=0.
  for j,r in enumerate(target):
   n=r[den]
   if not n:continue
   actual=(r[num]-costs[r['phase']]*r['credited'])/n;err+=n*(actual-pred[family][j])**2;weight+=n;identifier=r['bat'if family=='bat'else'bowl'];name=ids.get(identifier)
   if not name or (name,year)not in game:continue
   p=r['phase'];slot=0 if r['slot']<=3 else 1 if r['slot']<=7 else 2;player=coef.get(f'{prefix}:{identifier}:{p}',0.);current_contribution=player+(coef.get(f'slot:{slot}:{p}',0.)*5 if family=='bat'else 0.)
   past_slots=model['slotPrior'].get((identifier,p),{1:1.});contribution=player+(sum(coef.get(f'slot:{band}:{p}',0.)*5*w for band,w in past_slots.items())if family=='bat'else 0.)
   # Bowler coefficient enters the batting-utility prediction with negative sign.
   rest=pred[family][j]-(current_contribution if family=='bat'else-player);observed=(actual-rest)*(1 if family=='bat'else-1);key=family,identifier,year,p;g=group[key];g['n']+=n;g['actual']+=n*observed;g['prediction']+=n*contribution
  errors[family]={'weightedMSE':err/max(1,weight),'balls':weight}
 result=[]
 for(family,identifier,y,p),g in group.items():
  if g['n']<120:continue
  name=ids[identifier];row=game[name,y];phasekey=(["pp","middle","death"]if family=='bat'else["newBall","middleBowl","deathBowl"])[p];result.append({'id':identifier,'name':name,'year':y,'family':family,'phase':p,'balls':g['n'],'actual':g['actual']/g['n'],'prediction':g['prediction']/g['n'],'legacy':row['expectedPhases'][phasekey]})
 return result,errors

def main():
 rows,states=load();costs,details=costs_from_training(states);gameaudit=json.loads(Path('qa/finish-pass/numeric-audit.json').read_text());game={(p['name'],p['year']):p for p in gameaudit['players']};identity=json.loads((ROOT/'identities.json').read_text());ids={v['identifier']:k for k,v in identity.items()};contract={'normalisedDatasetSha256':json.loads((ROOT/'ingest-report.json').read_text())['datasetSha256'],'identityMappingSha256':hashlib.sha256((ROOT/'identities.json').read_bytes()).hexdigest(),'sourceQuarantine':'Opposing-roster register identity collisions are excluded before all fits.','unknownBatterSlot':'Neutral middle-band prior; known players use training-window slot mixture, never future batting-order outcomes.','version':'opponent-ridge-v1','baselineArtifactSha256':gameaudit['hash'],'trainingWindows':'Three completed calendar years ending before prediction year. Walk-forward uses earlier completed test years without retuning. Separate locked2022 fit predicts entire2023–2026 block.','validationYears':VALIDATION,'testYears':TEST,'alphaCandidates':ALPHAS,'costCutoff':2019,'costs':details,'features':'Player/phase, opposing player/phase, competition/phase, venue/phase, year/phase, innings/phase, batting-slot band/phase. Context scales10/5/1/3/5/5 encode regularisation hierarchy, fixed before testing.','model':'Weighted sparse Ridge on runs minus observational wicket cost, separate batter faced/bowler legal denominators; bowler charges exclude byes/legbyes/penalties.','selection':'Minimise validation weighted per-ball squared utility error separately for each family. No test-period tuning.','promotion':'Per-family walk-forward player-cluster97.5% bootstrap lower bound of Spearman gain must exceed0 and the fixed2022 whole-block test point gain must be nonnegative; no automatic inference of unidentifiable technique/mental/keeping attributes.'};(ROOT/'model-contract.json').write_text(json.dumps(contract,indent=2))
 validation=[]
 for alpha in ALPHAS:
  losses=collections.defaultdict(float);balls=collections.defaultdict(float)
  for year in VALIDATION:
   m=fit(rows,year-1,alpha,costs);_,es=evaluate(m,rows,year,costs,game,ids);cm=fit(rows,year-1,alpha,costs,True);_,ces=evaluate(cm,rows,year,costs,game,ids)
   for k,r in ces.items():losses['context_'+k]+=r['weightedMSE']*r['balls'];balls['context_'+k]+=r['balls']
   for k,r in es.items():losses[k]+=r['weightedMSE']*r['balls'];balls[k]+=r['balls']
  validation.append({'alpha':alpha,**{k:losses[k]/balls[k]for k in losses}});print('validation',validation[-1],flush=True)
 chosen={k:min(validation,key=lambda r:r[k])['alpha']for k in ['bat','bowl','context_bat','context_bowl']};(ROOT/'validation-selection.json').write_text(json.dumps({'contract':contract,'validation':validation,'chosen':chosen,'testOpened':False},indent=2));observations=[];errors=[];locked_observations=[];locked_models=None
 for year in TEST:
  models={alpha:fit(rows,year-1,alpha,costs)for alpha in set([chosen['bat'],chosen['bowl']])};contexts={alpha:fit(rows,year-1,alpha,costs,True)for alpha in set([chosen['context_bat'],chosen['context_bowl']])}
  if locked_models is None:locked_models=models
  for family in ['bat','bowl']:
   locked,_=evaluate(locked_models[chosen[family]],rows,year,costs,game,ids);locked_observations.extend(r for r in locked if r['family']==family)
   obs,e=evaluate(models[chosen[family]],rows,year,costs,game,ids);_,ce=evaluate(contexts[chosen['context_'+family]],rows,year,costs,game,ids);observations.extend(r for r in obs if r['family']==family);errors.append({'year':year,'family':family,'model':e[family],'contextOnly':ce[family]})
  print('test year',year,flush=True)
 metrics={f:cluster_interval([r for r in observations if r['family']==f])for f in ['bat','bowl']};locked_metrics={f:cluster_interval([r for r in locked_observations if r['family']==f])for f in ['bat','bowl']};report={'baselineArtifactSha256':gameaudit['hash'],'chosen':chosen,'validation':validation,'walkForwardHeldOut':metrics,'locked2022HeldOut':locked_metrics,'errors':errors,'promotionGates':{f:metrics[f]['gainInterval975'][0]>0 and locked_metrics[f]['modelSpearman']>=locked_metrics[f]['legacySpearman'] for f in metrics},'scope':'Strict chronological forecasts to2023–2026, last year partial through2026-10-24. Player-cluster uncertainty; observational estimates, not causal skill measurements. These gates do not certify leadership, keeping, fielding or technique.'};(ROOT/'heldout-report.json').write_text(json.dumps(report,indent=2));(ROOT/'heldout-observations.json').write_text(json.dumps(observations,separators=(',',':')));print(json.dumps(report,indent=2))
if __name__=='__main__':main()
