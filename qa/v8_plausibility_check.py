"""Audit generated scorebooks, with distribution diagnostics rather than a claim of historical calibration."""
import argparse,json,statistics
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('directories',nargs='+');p.add_argument('--output',required=True);a=p.parse_args()
records=[];sources=[]
for directory in a.directories:
 f=Path(directory)/'v8_scorebooks.json';records.extend(json.loads(f.read_text()));sources.append(str(f))
checks=0

def check(ok,msg):
 global checks
 assert ok,msg
 checks+=1
innings=[];firsts=[];chases=[];winning_excess=[];phase_rates=[]
for r in records:
 assert len(r['innings'])==2
 first=next(i for i in r['innings'] if i['club']==r['battingFirst']);second=next(i for i in r['innings'] if i['club']==r['battingSecond']);firsts.append(first);chases.append(second)
 check(first['total']==second['total'] if r['superOver'] else r['winner']==(first['club'] if first['total']>second['total'] else second['club']),'winner agrees with regulation scores/tie-break')
 if second['total']>first['total']:
  target=first['total']+1;winning_excess.append(second['total']-target);check(target<=second['total']<=target+5,'winning chase excess is supported by a legal six or smaller hit');check(second['wickets']<10,'winning chase does not carry a completed all-out innings')
  last='death' if second['balls']>90 else 'mid' if second['balls']>36 else 'pp';check(sum(v for k,v in second['phases'].items() if k!=last)<target,'earlier phase has not already reached the target')
 for i in r['innings']:
  innings.append(i);check(1<=i['balls']<=120 and 0<=i['wickets']<=10,'innings ball/wicket limits');check(all(isinstance(i[k],int) and i[k]>=0 for k in ['total','balls','wickets','extras']),'nonnegative integer scorebook truth');check(sum(i['phases'].values())==i['total'],'phases reconcile');check(sum(b['runs'] for b in i['batting'])+i['extras']==i['total'],'batter runs plus extras reconcile');check(sum(b['balls'] for b in i['batting'])==i['balls'],'batter balls reconcile');check(sum(b['balls'] for b in i['bowling'])==i['balls'] and all(b['balls']<=24 for b in i['bowling']),'bowling legal balls and four-over ceiling');check(len({b['id'] for b in i['batting']})==11,'eleven distinct batters in the book');check(sum(not b['dnb'] and b['dismissal']!='not out' for b in i['batting'])==i['wickets'],'dismissals reconcile');check(all(b['fours']+b['sixes']<=b['balls'] and b['fours']*4+b['sixes']*6<=b['runs'] and b['runs']<=6*b['balls'] for b in i['batting']),'model batting boundary/ball budgets');e=i['extrasBreakdown'];check(sum(e[k] for k in ['wides','noBalls','byes','legByes'])==i['extras'],'extras reconcile');check(sum(b['runs'] for b in i['bowling'])==i['total']-e['byes']-e['legByes'],'byes/leg-byes not charged to bowlers');check(sum(b['wickets'] for b in i['bowling'])<=i['wickets'],'bowling wickets exclude run-outs');plan=i['plan'][:(i['balls']+5)//6];check(len(plan)==(i['balls']+5)//6 and all(n==0 or ident!=plan[n-1] for n,ident in enumerate(plan)),'bowling sequence length and no consecutive overs')
  counts={'pp':min(36,i['balls']),'mid':max(0,min(54,i['balls']-36)),'death':max(0,i['balls']-90)}
  for k,b in counts.items():check(b>0 or i['phases'][k]==0,'unplayed phases have no runs');check(i['phases'][k]<=6*b+i['extras'],'phase fits physical legal-ball plus extras budget');phase_rates.extend([i['phases'][k]*6/b] if b else [])
  if i is first or second['total']<=first['total']:check(i['wickets']==10 or i['balls']==120,'uninterrupted non-winning innings ends by all-out or twenty overs')
check(len(set(winning_excess))>1,'successful chases do not always finish one above first-innings score')
def describe(values):
 values=sorted(values);return {'count':len(values),'min':min(values),'p10':values[int((len(values)-1)*.1)],'median':statistics.median(values),'mean':round(statistics.mean(values),2),'p90':values[int((len(values)-1)*.9)],'max':max(values)}
result={'scope':'Generated actual game scorebooks: numerical/legal-model bounds and descriptive distributions. Not an empirical fit to real-world IPL/BBL/Blast distributions, and not a ball-by-ball simulator.','sources':sources,'checks':checks,'matches':len(records),'innings':len(innings),'scores':describe([i['total'] for i in innings]),'fullLengthScores':describe([i['total'] for i in innings if i['balls']==120]),'firstInningsScores':describe([i['total'] for i in firsts]),'wickets':describe([i['wickets'] for i in innings]),'extras':describe([i['extras'] for i in innings]),'winningChaseExcessFrequency':{str(x):winning_excess.count(x) for x in sorted(set(winning_excess))},'chaseWinPercentage':round(len(winning_excess)*100/len(records),2),'allOutInnings':sum(i['wickets']==10 for i in innings),'phasesMaxRunsPerOver':round(max(phase_rates),2),'errors':[],'ruleReferences':[{'url':'https://images.icc-cricket.com/image/upload/prd/qfnsie8fz6vhyl1pmcli.pdf','sections':['13.7.1','13.9','16.5.3'],'use':'Ordinary uninterrupted twenty-over innings, bowling limits and full winning-boundary allowance. The game does not implement every ICC playing condition.'}]}
Path(a.output).write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:result[k] for k in ['checks','matches','innings','scores','winningChaseExcessFrequency','chaseWinPercentage','allOutInnings']},indent=2))
