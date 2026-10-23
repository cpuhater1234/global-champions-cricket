from pathlib import Path
import json,math
root=Path('qa/finish-pass');reports=[json.loads((root/f'policies-{s}.json').read_text()) for s in range(8501,8509)];runs=[r for x in reports for r in x['runs']];assert len({r['artifactSha256'] for r in reports})==1,'Mixed candidate hashes; wait for all worlds';assert all(len(r['runs'])==4 for r in reports),'Incomplete policy cohorts';policies=sorted(set(r['policy'] for r in runs));summary=[]
for p in policies:
 xs=[r for r in runs if r['policy']==p];summary.append({'policy':p,'worlds':len(xs),'matches':sum(r['matches'] for r in xs),'wins':sum(r['wins'] for r in xs),'winPercentage':100*sum(r['wins'] for r in xs)/sum(r['matches'] for r in xs),'finalsQualifications':sum(r['finalsQualifications'] for r in xs),'meanRunsFor':sum(r['runsFor'] for r in xs)/sum(r['matches'] for r in xs),'worldWinPercentages':[100*r['wins']/r['matches'] for r in xs]})
contrasts=[]
for p in policies:
 if p=='balanced-current':continue
 ds=[100*(next(r for r in runs if r['seed']==s and r['policy']==p)['wins']-next(r for r in runs if r['seed']==s and r['policy']=='balanced-current')['wins'])/266 for s in range(8501,8509)];mean=sum(ds)/8;se=math.sqrt(sum((d-mean)**2 for d in ds)/7/8);contrasts.append({'policy':p,'versus':'balanced-current','pairedMeanWinPercentagePointDifference':mean,'worldCluster95Interval':[mean-2.365*se,mean+2.365*se],'positiveWorlds':sum(d>0 for d in ds)})
report={'hash':reports[0]['artifactSha256'],'worlds':8,'cohorts':len(runs),'managedMatches':sum(r['matches'] for r in runs),'scope':reports[0]['scope'],'design':'Four policies paired within each of eight distinct worlds and user club indices0–7. Roster/arrival/development functions real; annual replacement administration simplified. Intervals use paired world-level differences with t critical2.365(df7); eight worlds still do not establish universal balance or trade exploit resistance.','summary':summary,'contrasts':contrasts}
(root/'policies-summary.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
