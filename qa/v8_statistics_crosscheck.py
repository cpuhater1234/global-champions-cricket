"""Read-only secondary cross-row audit of captured game scorebooks."""
from pathlib import Path
import json,argparse
p=argparse.ArgumentParser();p.add_argument("directories",nargs="*");p.add_argument("--output",default="qa/v8_numeric_crosscheck_results.json");args=p.parse_args()
roots=[Path('qa/logic/final-career-5603'),Path('qa/logic/final-career-5701')]+[Path('qa/logic/final-clubs')/str(i) for i in range(8)]
if args.directories:roots=[Path(x) for x in args.directories]
errors=[];checks=0;matches=0
for root in roots:
 for r in json.loads((root/'v8_scorebooks.json').read_text()):
  matches+=1
  for i in r['innings']:
   other=next(j for j in r['innings'] if j['club']!=i['club']);own={b['id'] for b in i['batting']};opposition={b['id'] for b in other['batting']};names={b['name'] for b in other['batting']};checks+=1
   if own&opposition:errors.append({'case':'player in both XIs','year':r['year'],'club':i['club']})
   for b in i['bowling']:
    checks+=2
    if b['id'] not in opposition:errors.append({'case':'bowler outside opposing XI','name':b['name']})
    actual=sum(not t['dnb'] and t['dismissal'].endswith('b '+b['name']) for t in i['batting'])
    if actual!=b['wickets']:errors.append({'case':'named wicket credit mismatch','name':b['name'],'year':r['year'],'book':b['wickets'],'dismissals':actual})
   for b in i['batting']:
    checks+=1
    if b['dnb'] and any(b[k] for k in ['runs','balls','fours','sixes']):errors.append({'case':'DNB has figures','name':b['name']})
    d=b['dismissal']
    if d.startswith('c ') and not d.startswith('c & b '):
     fielder=d[2:].split(' b ')[0];checks+=1
     if fielder not in names:errors.append({'case':'catch outside fielding XI','fielder':fielder})
    if d.startswith('st '):
     fielder=d[3:].split(' b ')[0];checks+=1
     if fielder not in names:errors.append({'case':'stumping outside fielding XI','fielder':fielder})
result={'scope':'Secondary cross-row identity/wicket/dismissal audit of existing captured scorebooks, additional to phase/extras/balls/NRR checks. No new matches or empirical calibration.','matches':matches,'checks':checks,'errors':errors,'warnings':[]}
Path(args.output).write_text(json.dumps(result,indent=2)+'\n');print({'matches':matches,'checks':checks,'errors':len(errors)})
assert not errors
