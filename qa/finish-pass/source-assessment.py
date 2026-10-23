"""Independent Cricsheet assessment. No production rating is silently fitted to this report."""
import csv,json,zipfile,hashlib,re,unicodedata,math,collections
from pathlib import Path
root=Path('qa/finish-pass');audit=json.loads((root/'numeric-audit.json').read_text());first={}
for p in audit['players']:first.setdefault(p['name'],p)
people=list(csv.DictReader((root/'people.csv').open()))
def tokens(s):return re.findall(r'[a-z]+',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower())
def compatible(name,source):
 a,b=tokens(name),tokens(source)
 if a==b:return True
 if not a or not b or a[-1]!=b[-1]:return False
 return a[0][0]==b[0][0] and (len(b[0])<=3 or a[0]==b[0])
overrides={'Adam Gilchrist':'AC Gilchrist','AB de Villiers':'AB de Villiers','Steve Smith':'SPD Smith','Steven Smith':'SPD Smith','Chris Gayle':'CH Gayle','Chris Woakes':'CR Woakes','Adil Rashid':'AU Rashid','Jasprit Bumrah':'JJ Bumrah','Kumar Sangakkara':'KC Sangakkara','MS Dhoni':'MS Dhoni','Shakib Al Hasan':'Shakib Al Hasan','Andre Russell':'AD Russell','Dwayne Bravo':'DJ Bravo','Darren Bravo':'DM Bravo','Mitchell Marsh':'MR Marsh','Shaun Marsh':'SE Marsh','Glenn Maxwell':'GJ Maxwell','Ravichandran Ashwin':'R Ashwin','Ravindra Jadeja':'RA Jadeja','Mohammad Nabi':'Mohammad Nabi','Mohammad Rizwan':'Mohammad Rizwan','Mohammad Hafeez':'Mohammad Hafeez','Mohammad Amir':'Mohammad Amir','Mohammad Asif':'Mohammad Asif','Mohammad Irfan':'Mohammad Irfan','Mohammad Siraj':'Mohammed Siraj','Mohammed Shami':'Mohammed Shami','Nathan Ellis':'NT Ellis','Nathan Lyon':'NM Lyon','Nathan Coulter-Nile':'NM Coulter-Nile','Aaron Finch':'AJ Finch','Tom Curran':'TK Curran','Sam Curran':'SM Curran','Tom Banton':'T Banton','Tom Kohler-Cadmore':'T Kohler-Cadmore','Tom Latham':'TWM Latham','Tom Moody':'TM Moody','James Anderson':'JM Anderson','James Faulkner':'JP Faulkner','James Franklin':'JEC Franklin','James Hopes':'JR Hopes','James Neesham':'JDS Neesham','James Pattinson':'JL Pattinson','James Taylor':'JWA Taylor','Luke Wright':'LJ Wright','Luke Wood':'L Wood','Mark Wood':'MA Wood','Tim Southee':'TG Southee','Tim David':'TH David','Tim Paine':'TD Paine','Tim Seifert':'TL Seifert','Tim Bresnan':'TT Bresnan','David Warner':'DA Warner','David Miller':'DA Miller','David Hussey':'DJ Hussey','Michael Hussey':'MEK Hussey','Michael Clarke':'MJ Clarke','Michael Lumb':'MJ Lumb','Michael Carberry':'MA Carberry','Michael Neser':'MG Neser','Michael Klinger':'M Klinger','Andrew McDonald':'AB McDonald','Andrew Symonds':'A Symonds','Andrew Flintoff':'A Flintoff','Andrew Tye':'AJ Tye','Andrew Balbirnie':'A Balbirnie','Andrew Hall':'AJ Hall','Peter Siddle':'PM Siddle','Peter Handscomb':'PSP Handscomb','Peter Trego':'PD Trego','Peter Fulton':'PG Fulton','Brendon McCullum':'BB McCullum','Nathan McCullum':'NL McCullum','Daryl Mitchell':'DJ Mitchell','Daryl Tuffey':'DR Tuffey','Colin Munro':'C Munro','Colin de Grandhomme':'C de Grandhomme','Matt Henry':'MJ Henry','Matt Prior':'MJ Prior','Matt Wade':'MS Wade','Matthew Wade':'MS Wade','Matthew Hayden':'ML Hayden','Matthew Hoggard':'MJ Hoggard','Matthew Short':'MW Short','Chris Jordan':'CJ Jordan','Chris Morris':'CH Morris','Chris Lynn':'CA Lynn','Chris Green':'CJ Green','Chris Tremain':'CP Tremain','Chris Read':'CMW Read','Chris Schofield':'CP Schofield'}
nameMap={};unmatched=[]
for name in first:
 exact=[p for p in people if p['name']==overrides.get(name,name) or p['unique_name']==overrides.get(name,name)]
 found=exact or [p for p in people if compatible(name,p['name'])]
 ids={p['identifier'] for p in found}
 if len(ids)==1:nameMap[name]={'id':next(iter(ids)),'registerName':found[0]['name'],'method':'explicit-name' if exact else 'unique-surname-initial'}
 else:unmatched.append({'name':name,'candidates':[p['name'] for p in found][:15]})
byid={p['id']:n for n,p in nameMap.items()};stats=collections.defaultdict(lambda:collections.Counter());innings=[];sources=[];seen=set()
# Context-normalised aggregates by competition/year/phase, not a universal raw SR cutoff.
context=collections.defaultdict(collections.Counter)
for path in sorted(root.glob('*_json.zip')):
 z=zipfile.ZipFile(path);count=0;dates=[]
 for fn in z.namelist():
  if not fn.endswith('.json') or fn in seen:continue
  d=json.loads(z.read(fn));info=d['info'];date=info['dates'][0];year=int(date[:4])
  if info.get('gender')!='male' or info.get('match_type')!='T20' or year>2026:continue
  seen.add(fn);count+=1;dates.append(date);comp=path.stem;registry=info['registry']['people']
  if comp=='t20s_male':
   major={'Australia','England','India','Pakistan','South Africa','New Zealand','Sri Lanka','West Indies','Bangladesh','Zimbabwe','Afghanistan','Ireland'}
   comp='t20i_full_members' if set(info['teams'])<=major else 't20i_other'
  for ix,inn in enumerate(d['innings']):
   if inn.get('super_over'):continue
   total=wickets=legal=0
   for over in inn['overs']:
    phase='pp' if over['over']<6 else 'middle' if over['over']<15 else 'death';c=context[(comp,year,phase)]
    for b in over['deliveries']:
     e=b.get('extras',{});islegal=not(e.get('wides',0) or e.get('noballs',0));faced=not e.get('wides',0);runs=b['runs']['batter'];charged=b['runs']['total']-e.get('byes',0)-e.get('legbyes',0);outs=b.get('wickets',[]);credited=sum(w['kind'] in ['bowled','caught','caught and bowled','lbw','stumped','hit wicket'] for w in outs);dismissed=sum(w['kind']!='retired hurt' for w in outs)
     c.update({'balls':int(islegal),'faced':int(faced),'batRuns':runs,'charged':charged,'outs':dismissed,'wickets':credited,'boundaries':int(runs in [4,6]),'dots':int(runs==0 and faced)})
     for kind,key in [('bat','batter'),('bowl','bowler')]:
      identifier=registry[b[key]]
      if identifier not in byid:continue
      p=stats[(byid[identifier],comp,year,phase,kind)]
      if kind=='bat':p.update({'balls':int(faced),'runs':runs,'outs':sum(w['player_out']==b['batter'] and w['kind']!='retired hurt' for w in outs),'boundaries':int(runs in [4,6]),'dots':int(runs==0 and faced)})
      else:p.update({'balls':int(islegal),'runs':charged,'wickets':credited,'boundaries':int(runs in [4,6]),'dots':int(islegal and b['runs']['total']==0)})
     for w in outs:
      if w['kind']!='retired hurt' and w['player_out']!=b['batter']:
       other=registry[w['player_out']]
       if other in byid:stats[(byid[other],comp,year,phase,'bat')].update({'balls':0,'runs':0,'outs':1,'boundaries':0,'dots':0})
     total+=b['runs']['total'];wickets+=dismissed;legal+=islegal
   innings.append({'year':year,'competition':comp,'first':ix==0,'total':total,'wickets':wickets,'balls':legal,'normalLength':info.get('overs')==20 and not info.get('outcome',{}).get('method')})
 sources.append({'url':'https://cricsheet.org/downloads/'+path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'matches':count,'earliest':min(dates) if dates else None,'latest':max(dates) if dates else None})
rows=[]
for (name,comp,year,phase,kind),s in stats.items():
 c=context[(comp,year,phase)];rows.append({'name':name,'competition':comp,'year':year,'phase':phase,'kind':kind,**s,'contextRunRate':c['batRuns']/max(1,c['faced']) if kind=='bat' else c['charged']/max(1,c['balls']),'contextWicketRate':c['outs']/max(1,c['faced']) if kind=='bat' else c['wickets']/max(1,c['balls'])})
# Rolling contemporary three-calendar-year sample, shrunk to each source environment.
comparisons=[]
for p in audit['players']:
 for kind in ['bat','bowl']:
  if kind=='bowl' and p['maxOvers']==0:continue
  for phase in ['pp','middle','death']:
   ss=[r for r in rows if r['name']==p['name'] and p['year']-2<=r['year']<=p['year'] and r['phase']==phase and r['kind']==kind];n=sum(r['balls'] for r in ss)
   if not n:continue
   runs=sum(r['runs'] for r in ss);w=sum(r.get('outs' if kind=='bat' else 'wickets',0) for r in ss);er=sum(r['contextRunRate']*r['balls'] for r in ss);ew=sum(r['contextWicketRate']*r['balls'] for r in ss);prior=180 if kind=='bat' else 240
   scoring=(runs+prior*(er/n))/(n+prior)/(er/n);wicket=(w+prior*(ew/n))/(n+prior)/(ew/n);index=(.65*(scoring-1)-.35*(wicket-1)) if kind=='bat' else (.6*(1-scoring)+.4*(wicket-1));rating=p['phases'][{'bat':{'pp':'pp','middle':'middle','death':'death'},'bowl':{'pp':'newBall','middle':'middleBowl','death':'deathBowl'}}[kind][phase]]
   comparisons.append({'name':p['name'],'year':p['year'],'kind':kind,'phase':phase,'balls':n,'runs':runs,'wickets':w,'relativeScoring':scoring,'relativeWickets':wicket,'performanceIndex':index,'gameRating':rating,'expectedGameRating':p['expectedPhases'][{'bat':{'pp':'pp','middle':'middle','death':'death'},'bowl':{'pp':'newBall','middle':'middleBowl','death':'deathBowl'}}[kind][phase]],'reliabilityWeight':n/(n+prior)})
qualified=[r for r in comparisons if r['balls']>=180];flags=[r for r in qualified if r['gameRating']>=88 and r['performanceIndex']<-.12];flags.sort(key=lambda r:r['performanceIndex'])
def summary(xs):
 if not xs:return {}
 vals=sorted(r['total'] for r in xs);return {'innings':len(xs),'meanTotal':sum(vals)/len(vals),'medianTotal':vals[len(vals)//2],'meanWickets':sum(r['wickets'] for r in xs)/len(xs),'meanBalls':sum(r['balls'] for r in xs)/len(xs)}
report={'scope':'Real downloaded Cricsheet male IPL/BBL/Blast/T20I match ledgers. Calendar years <=2026. Three-year contemporary windows, phase/competition/year contextual rates, empirical shrinkage. Phase=historical 6/9/5; GCC uses 4+2 surge, so phase comparisons are approximate. Initial/surname mappings are reviewable, not certified identities. Missing data is not zero ability. No inferred leadership/temperament/keeping/fielding precision. No production rating changes from these flags alone.','sources':sources,'register':{'url':'https://cricsheet.org/register/people.csv','sha256':hashlib.sha256((root/'people.csv').read_bytes()).hexdigest()},'mapped':len(nameMap),'withDeliveries':len(set(r['name'] for r in rows)),'unmatched':unmatched,'nameMap':nameMap,'summary':{str(a):summary([r for r in innings if r['first'] and r['normalLength'] and a<=r['year']<=b]) for a,b in [(2008,2012),(2013,2017),(2018,2022),(2023,2026)]},'competitionBenchmarks':{comp:{str(a):summary([r for r in innings if r['competition']==comp and r['first'] and r['normalLength'] and a<=r['year']<=b]) for a,b in [(2008,2012),(2013,2017),(2018,2022),(2023,2026)]} for comp in sorted(set(r['competition'] for r in innings))},'highRatingWeakEvidenceFlags':flags[:100],'comparisons':comparisons,'aggregates':rows}
(root/'source-assessment.json').write_text(json.dumps(report,indent=2));(root/'historical-innings.json').write_text(json.dumps(innings));print(json.dumps({k:v for k,v in report.items() if k not in ['nameMap','comparisons','aggregates']},indent=2)[:18000])
