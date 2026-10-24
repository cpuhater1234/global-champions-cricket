"""Reproducible source normalisation. No game rating or identity is inferred here."""
import collections,hashlib,json,sqlite3,zipfile,os,fcntl
from contextlib import contextmanager
from pathlib import Path
ROOT=Path(__file__).resolve().parent
CREDIT={'bowled','caught','caught and bowled','lbw','stumped','hit wicket'}
CUTOFF='2026-10-24'
def phase(over):return 0 if over<4 else 1 if over<15 else 2
def eligible(info):
 return info.get('gender')=='male' and info.get('match_type')=='T20' and info.get('overs')==20 and info.get('balls_per_over',6)==6 and str(info['dates'][0])<=CUTOFF and not info.get('outcome',{}).get('method') and info.get('outcome',{}).get('result')!='no result'
def delivery_stats(d):
 e=d.get('extras',{});ws=d.get('wickets',[])
 return {'legal':int(not(e.get('wides',0)or e.get('noballs',0))),'faced':int(not e.get('wides',0)),'bat_runs':d['runs']['batter'],'charged':d['runs']['total']-e.get('byes',0)-e.get('legbyes',0)-e.get('penalty',0),'credited':sum(w['kind']in CREDIT for w in ws),'dismissed':[w['player_out']for w in ws if w['kind']!='retired hurt'],'four':int(d['runs']['batter']==4 and not d['runs'].get('non_boundary')),'six':int(d['runs']['batter']==6 and not d['runs'].get('non_boundary')),'dot':int(d['runs']['batter']==0 and not e.get('wides',0)),'events':1}
def valid_rosters(info):
 teams=list(info.get('players',{}).values());reg=info.get('registry',{}).get('people',{});ids=[{reg[n]for n in xs}for xs in teams]
 return len(ids)==2 and all(len(xs)==len(set(reg[n]for n in xs))for xs in teams) and not(ids[0]&ids[1])
def fielder_ids(wicket,registry):
 fs=wicket.get('fielders',[]);known=[registry[f['name']]for f in fs if f.get('name')in registry];return known,len(fs)-len(known)
@contextmanager
def dataset_lock(destination):
 with Path(str(destination)+'.lock').open('a')as lock:
  fcntl.flock(lock,fcntl.LOCK_EX|fcntl.LOCK_NB)
  try:yield
  finally:fcntl.flock(lock,fcntl.LOCK_UN)
def build():
 with dataset_lock(ROOT/'deliveries.sqlite'):return _build()
def _build():
 paths=sorted(Path('qa/finish-pass').glob('*_json.zip'))+sorted((ROOT/'sources').glob('*_json.zip'));db=ROOT/'deliveries.sqlite';temp=ROOT/f'deliveries.build-{os.getpid()}.sqlite';temp.unlink(missing_ok=True);c=sqlite3.connect(temp);c.executescript('DROP TABLE IF EXISTS records;DROP TABLE IF EXISTS matches;DROP TABLE IF EXISTS states;DROP TABLE IF EXISTS appearances;DROP TABLE IF EXISTS fielding;CREATE TABLE appearances(match TEXT,player TEXT,team TEXT);CREATE TABLE fielding(match TEXT,player TEXT,kind TEXT,innings INT);CREATE TABLE records(match TEXT,year INT,date TEXT,comp TEXT,venue TEXT,innings INT,phase INT,bat TEXT,bowl TEXT,slot INT,legal INT,faced INT,bat_runs INT,charged INT,credited INT,bat_outs INT,four INT,six INT,dot INT,events INT);CREATE TABLE matches(match TEXT PRIMARY KEY,date TEXT,comp TEXT,venue TEXT,first_total INT);CREATE TABLE states(phase INT,wickets INT,remaining REAL,n INT);');seen={};sources=[];skips=collections.Counter();totals=collections.Counter();state=collections.defaultdict(lambda:[0.,0]);pending=[]
 for path in paths:
  count=0;comp=path.name.removesuffix('_male_json.zip').removesuffix('_json.zip')
  with zipfile.ZipFile(path)as z:
   for fn in z.namelist():
    if not fn.endswith('.json'):continue
    d=json.loads(z.read(fn));info=d['info'];digest=hashlib.sha256(json.dumps(d,sort_keys=True,separators=(',',':')).encode()).hexdigest();mid=Path(fn).stem
    if mid in seen:
     if seen[mid]!=digest:raise ValueError('Conflicting duplicate match '+mid)
     skips['duplicateMatch']+=1;continue
    seen[mid]=digest
    if not eligible(info):skips['ineligibleFormatDateOrAdjustedMatch']+=1;continue
    if any(inn.get('target',{}).get('overs',20)<20 for inn in d['innings']if not inn.get('super_over')):skips['shortenedTarget']+=1;continue
    if not valid_rosters(info):skips['invalidOpposingIdentityCollision']+=1;continue
    if len(d['innings'])<2:skips['incompleteMatch']+=1;continue
    reg=info['registry']['people'];c.executemany('INSERT INTO appearances VALUES(?,?,?)',[(mid,reg[n],team)for team,names in info['players'].items()for n in names]);date=str(info['dates'][0]);year=int(date[:4]);venue=info.get('venue','Unknown');first_total=0;rows=collections.defaultdict(collections.Counter)
    for ix,inn in enumerate(d['innings']):
     if inn.get('super_over'):continue
     ds=[(over['over'],b)for over in inn['overs']for b in over['deliveries']];total=sum(b['runs']['total']for _,b in ds);prefix=wkts=legal=0;slots={}
     if ix==0:first_total=total
     for over,b in ds:
      ph=phase(over);x=delivery_stats(b)
      for wicket in b.get('wickets',[]):
       known,missing=fielder_ids(wicket,reg);totals['unidentifiedFielders']+=missing
       for identifier in known:c.execute('INSERT INTO fielding VALUES(?,?,?,?)',(mid,identifier,wicket['kind'],ix))
      for name in [b['batter'],b['non_striker']]:
       if name not in slots:slots[name]=len(slots)+1
      key=(ix,ph,reg[b['batter']],reg[b['bowler']],slots[b['batter']]);a=rows[key]
      for k,v in x.items():
       if k!='dismissed':a[k]+=v
      a['bat_outs']+=sum(name==b['batter']for name in x['dismissed'])
      for name in x['dismissed']:
       if name!=b['batter']:
        if name not in slots:slots[name]=len(slots)+1
        rows[(ix,ph,reg[name],reg[b['bowler']],slots[name])]['bat_outs']+=1
      if ix==0 and year<=2019 and x['legal']:
       v=state[ph,min(9,wkts)];v[0]+=total-prefix;v[1]+=1
      prefix+=b['runs']['total'];wkts+=len(x['dismissed']);legal+=x['legal'];totals['deliveries']+=1;totals['legal']+=x['legal'];totals['faced']+=x['faced'];totals['batOuts']+=len(x['dismissed']);totals['credited']+=x['credited']
    fields=['legal','faced','bat_runs','charged','credited','bat_outs','four','six','dot','events']
    for (ix,ph,bat,bowl,slot),a in rows.items():pending.append((mid,year,date,comp,venue,ix,ph,bat,bowl,slot,*[a[k]for k in fields]))
    c.execute('INSERT INTO matches VALUES(?,?,?,?,?)',(mid,date,comp,venue,first_total));count+=1;totals['matches']+=1
    if len(pending)>10000:c.executemany('INSERT INTO records VALUES('+','.join('?'for _ in range(20))+')',pending);pending=[]
  sources.append({'path':str(path),'url':'https://cricsheet.org/downloads/'+path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'eligibleMatches':count});print(path.name,count,flush=True);c.commit()
 if pending:c.executemany('INSERT INTO records VALUES('+','.join('?'for _ in range(20))+')',pending)
 c.executemany('INSERT INTO states VALUES(?,?,?,?)',[(ph,w,s,n)for(ph,w),(s,n)in state.items()]);c.executescript('CREATE INDEX by_year ON records(year);CREATE INDEX by_bat ON records(bat);CREATE INDEX by_bowl ON records(bowl);CREATE INDEX by_appearance ON appearances(player);');c.commit()
 check=dict(c.execute('SELECT SUM(legal),SUM(faced),SUM(bat_outs),SUM(credited) FROM records').fetchone()and zip(['legal','faced','batOuts','credited'],c.execute('SELECT SUM(legal),SUM(faced),SUM(bat_outs),SUM(credited) FROM records').fetchone()));assert all(check[k]==totals[k]for k in check),(check,totals)
 assert c.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
 report={'schemaVersion':2,'cutoff':CUTOFF,'phases':'Opening overs0–3, middle4–14, death15–19; GCC opening aligns exactly. Later surge skill not separately identified by every source.','sources':sources,'totals':dict(totals),'excluded':dict(skips),'normalisedRows':c.execute('SELECT COUNT(*) FROM records').fetchone()[0],'trainingWicketCostDataCutoff':2019,'reconciliation':check};c.close();os.replace(temp,db);report['datasetSha256']=hashlib.sha256(db.read_bytes()).hexdigest();(ROOT/'ingest-report.json').write_text(json.dumps(report,indent=2));return report
if __name__=='__main__':print(json.dumps(build(),indent=2))
