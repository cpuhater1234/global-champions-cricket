import json,zipfile,collections
from pathlib import Path
root=Path('qa/finish-pass');r=json.loads((root/'source-assessment.json').read_text());names=['MS Dhoni','Adil Rashid','Chris Woakes','Jasprit Bumrah','Kumar Sangakkara'];ids={r['nameMap'][n]['id']:n for n in names};totals={n:collections.Counter() for n in names};seen=set()
for path in root.glob('*_json.zip'):
 z=zipfile.ZipFile(path)
 for fn in z.namelist():
  if not fn.endswith('.json') or fn in seen:continue
  d=json.loads(z.read(fn));i=d['info']
  if i.get('gender')!='male' or i.get('match_type')!='T20' or int(i['dates'][0][:4])>2026:continue
  seen.add(fn);reg=i['registry']['people']
  for inn in d['innings']:
   if inn.get('super_over'):continue
   for over in inn['overs']:
    for ball in over['deliveries']:
     batter=ids.get(reg[ball['batter']]);bowler=ids.get(reg[ball['bowler']]);ex=ball.get('extras',{})
     if batter:totals[batter].update({'batRuns':ball['runs']['batter'],'batBalls':int('wides' not in ex)})
     if bowler:totals[bowler].update({'bowlRuns':ball['runs']['total']-ex.get('byes',0)-ex.get('legbyes',0),'bowlBalls':int('wides' not in ex and 'noballs' not in ex)})
     for w in ball.get('wickets',[]):
      out=ids.get(reg[w['player_out']])
      if out and w['kind']!='retired hurt':totals[out]['batOuts']+=1
      if bowler and w['kind'] in ['bowled','caught','caught and bowled','lbw','stumped','hit wicket']:totals[bowler]['bowlWickets']+=1
checks=0
for n in names:
 got=collections.Counter()
 for x in r['aggregates']:
  if x['name']!=n:continue
  if x['kind']=='bat':got.update({'batRuns':x['runs'],'batBalls':x['balls'],'batOuts':x['outs']})
  else:got.update({'bowlRuns':x['runs'],'bowlBalls':x['balls'],'bowlWickets':x['wickets']})
 for k in ['batRuns','batBalls','batOuts','bowlRuns','bowlBalls','bowlWickets']:
  assert got[k]==totals[n][k],(n,k,got[k],totals[n][k]);checks+=1
(root/'source-reconciliation.json').write_text(json.dumps({'checks':checks,'players':names,'scope':'Independent per-delivery register-ID totals reconcile batting runs/balls/all dismissals including non-striker run-outs and legal bowling runs/balls/credited wickets, across all four downloaded archives.'},indent=2));print(checks,'source reconciliation checks passed')
