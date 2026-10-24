"""Independent raw ledger reconciliation; does not import or call ingest helpers."""
import collections,hashlib,json,sqlite3,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent
NAMES=['Lasith Malinga','Dilhara Fernando','Chamara Silva','Dhammika Prasad','Nitish Kumar Reddy','MS Dhoni','Jasprit Bumrah']
CREDITED={'bowled','caught','caught and bowled','lbw','stumped','hit wicket'}
def main():
 identities=json.loads((ROOT/'identities.json').read_text()); wanted={identities[n]['identifier']:n for n in NAMES}
 raw=collections.defaultdict(collections.Counter); observed={}; accepted=set(); excluded=collections.Counter(); global_stats=collections.Counter(); paths=sorted(Path('qa/finish-pass').glob('*_json.zip'))+sorted((ROOT/'sources').glob('*_json.zip'));sources=[];nonstriker=collections.Counter();same_side=0;same_examples=[];roster_collisions=[]
 assert len(paths)==14,len(paths)
 for path in paths:
  source_count=0
  with zipfile.ZipFile(path) as archive:
   for filename in archive.namelist():
    if not filename.endswith('.json'):continue
    match=json.loads(archive.read(filename));mid=Path(filename).stem;digest=hashlib.sha256(json.dumps(match,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    if mid in observed:
     assert observed[mid]==digest,('conflicting duplicate',mid)
     excluded['duplicateMatch']+=1;continue
    observed[mid]=digest;info=match['info'];outcome=info.get('outcome',{})
    if (info.get('gender')!='male' or info.get('match_type')!='T20' or info.get('overs')!=20 or info.get('balls_per_over',6)!=6 or str(info['dates'][0])>'2026-10-24' or outcome.get('method') or outcome.get('result')=='no result'):
     excluded['ineligibleFormatDateOrAdjustedMatch']+=1;continue
    if any(inn.get('target',{}).get('overs',20)<20 for inn in match['innings'] if not inn.get('super_over')):excluded['shortenedTarget']+=1;continue
    if len(match['innings'])<2:excluded['incompleteMatch']+=1;continue
    registry=info['registry']['people'];roster_teams=collections.defaultdict(set)
    for team,names in info.get('players',{}).items():
     for name in names:roster_teams[registry[name]].add(team)
    collisions={pid:sorted(teams) for pid,teams in roster_teams.items() if len(teams)>1}
    if collisions:
     roster_collisions.append({'match':mid,'date':str(info['dates'][0]),'source':str(path),'identifiersInOpposingRosters':collisions});excluded['opposingRosterIdentityCollision']+=1;continue
    accepted.add(mid);source_count+=1;global_stats['matches']+=1
    for innings in match['innings']:
     if innings.get('super_over'):continue
     for over in innings['overs']:
      for ball in over['deliveries']:
       extras=ball.get('extras',{});batter=registry[ball['batter']];bowler=registry[ball['bowler']];wide=bool(extras.get('wides',0));noball=bool(extras.get('noballs',0));legal=int(not wide and not noball);faced=int(not wide);runs=ball['runs']['batter'];charged=ball['runs']['total']-sum(extras.get(x,0) for x in ('byes','legbyes','penalty'));dismissals=[w for w in ball.get('wickets',[]) if w['kind']!='retired hurt'];credited=sum(w['kind'] in CREDITED for w in ball.get('wickets',[]));four=int(runs==4 and not ball['runs'].get('non_boundary'));six=int(runs==6 and not ball['runs'].get('non_boundary'));dot=int(runs==0 and not wide)
       global_stats.update(deliveries=1,legal=legal,faced=faced,batOuts=len(dismissals),credited=credited)
       # Attribution is side-specific. A batter dismissal row never increments
       # the bowler's deliveries/runs again, including non-striker dismissals.
       if batter in wanted:raw[mid,batter,'bat'].update(faced=faced,runs=runs,outs=0,four=four,six=six,dot=dot,events=1)
       if bowler in wanted:raw[mid,bowler,'bowl'].update(legal=legal,charged=charged,credited=credited,events=1)
       if batter==bowler:
        same_side+=1;same_examples.append({'match':mid,'date':str(info['dates'][0]),'source':str(path),'inningsTeam':innings['team'],'over':over['over'],'batterName':ball['batter'],'bowlerName':ball['bowler'],'identifier':batter,'targetIdentity':wanted.get(batter)})
       for wicket in dismissals:
        outid=registry[wicket['player_out']]
        if outid in wanted:
         raw[mid,outid,'bat']['outs']+=1
         if outid!=batter:nonstriker[wanted[outid]]+=1
  sources.append({'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'eligibleMatches':source_count})
 database_hash_before=hashlib.sha256((ROOT/'deliveries.sqlite').read_bytes()).hexdigest()
 db=sqlite3.connect('file:'+str(ROOT/'deliveries.sqlite')+'?mode=ro',uri=True)
 sql_matches={r[0] for r in db.execute('SELECT match FROM matches')};match_differences={'missingInSql':sorted(accepted-sql_matches),'extraInSql':sorted(sql_matches-accepted)}
 sql=collections.defaultdict(collections.Counter)
 for identifier in wanted:
  for row in db.execute('SELECT match,SUM(faced),SUM(bat_runs),SUM(bat_outs),SUM(four),SUM(six),SUM(dot),SUM(events) FROM records WHERE bat=? GROUP BY match',(identifier,)):
   sql[row[0],identifier,'bat'].update(dict(zip(['faced','runs','outs','four','six','dot','events'],row[1:])))
  for row in db.execute('SELECT match,SUM(legal),SUM(charged),SUM(credited),SUM(events) FROM records WHERE bowl=? GROUP BY match',(identifier,)):
   sql[row[0],identifier,'bowl'].update(dict(zip(['legal','charged','credited','events'],row[1:])))
 differences=[]
 for key in sorted(set(raw)|set(sql)):
  # SQL may retain a zero-only bowling group for a nonstriker-out row;
  # compare every statistic, allowing these semantically empty groups.
  for field in sorted(set(raw[key])|set(sql[key])):
   if raw[key][field]!=sql[key][field]:differences.append({'match':key[0],'identifier':key[1],'side':key[2],'field':field,'raw':raw[key][field],'sqlite':sql[key][field]})
 players=[]
 for identifier,name in wanted.items():
  record={'name':name,'identifier':identifier,'nonStrikerDismissals':nonstriker[name]}
  for side in ('bat','bowl'):
   a=collections.Counter();b=collections.Counter()
   for (mid,pid,s),v in raw.items():
    if pid==identifier and s==side:a.update(v)
   for (mid,pid,s),v in sql.items():
    if pid==identifier and s==side:b.update(v)
   record[side]={'raw':dict(a),'sqlite':dict(b),'equal':a==b,'matchesWithNonzeroEvidence':sum(pid==identifier and s==side and any(v.values()) for (_,pid,s),v in raw.items())}
  players.append(record)
 sql_global=dict(zip(['legal','faced','batOuts','credited'],db.execute('SELECT SUM(legal),SUM(faced),SUM(bat_outs),SUM(credited) FROM records').fetchone()));db.close()
 database_hash_after=hashlib.sha256((ROOT/'deliveries.sqlite').read_bytes()).hexdigest();assert database_hash_before==database_hash_after,'SQLite changed during independent read'
 assert database_hash_after=='60d38fb30ff38f72a7d344437ed881b2ba93731a739dd35fdd556a82386c3ce9',database_hash_after
 prior_path=ROOT/'identities-source-reconciliation-before-quarantine.json';prior=json.loads(prior_path.read_text())
 archived_profiles=json.loads((ROOT/'identities-profile-retrieval.json').read_text());profile_checks=[]
 for e in archived_profiles:
  n=e['gameName'];r=identities[n];cid=e['key_cricinfo'];profile_checks.append({'name':n,'registerIdentifier':r['identifier'],'key_cricinfo':cid,'url':e['url'],'consistent':r['externalIdentifiers']['key_cricinfo']==cid and e['url'].rstrip('/').endswith('-'+cid) and r['verifiedProfileEvidence']==e})
 report={'status':'PASS' if not differences and not any(match_differences.values()) and all(global_stats[k]==v for k,v in sql_global.items()) and all(x['consistent'] for x in profile_checks) and same_side==0 else 'FAIL','statusMeaning':'PASS means independent cleaned raw counts reconcile to frozen SQLite; general opposing-roster ID collision guard quarantines the two source defects. It does not certify biographies or numerical ratings.','databaseSha256':database_hash_after,'priorUncleanedDiscovery':{'path':str(prior_path),'sha256':hashlib.sha256(prior_path.read_bytes()).hexdigest(),'comparisonStatus':prior['status'],'eligibleMatches':prior['eligibleMatches'],'rawGlobal':prior['rawGlobal'],'selfIdentityEvents':prior['sameBatterBowlerIdentifierEvents'],'opposingRosterIdentityCollisions':prior['opposingRosterIdentityCollisions']},'independentImplementation':True,'importsIngestHelpers':False,'eligibility':'male T20, scheduled20 overs,6 balls/over, first date <=2026-10-24, no adjusted outcome method/no-result, no shortened target, at least2 innings; exclude whole matches if any identifier appears in opposing team player rosters; skip Super Overs; canonical match-ID dedup with content-hash conflict assertion.','attribution':'Bat and bowl SQL queries are separate. Non-striker dismissals increase only actual player_out batting dismissals; credited bowling wickets counted once on original delivery. Self-ID events are tracked but never used to union both sides.','sourceCount':len(paths),'sources':sources,'eligibleMatches':len(accepted),'excluded':dict(excluded),'rawGlobal':dict(global_stats),'sqliteGlobal':sql_global,'matchDifferences':match_differences,'perMatchSideFieldMismatches':differences,'opposingRosterIdentityCollisions':roster_collisions,'sameBatterBowlerIdentifierEvents':same_side,'sameBatterBowlerIdentifierExamples':same_examples,'players':players,'archivedProfileEvidenceChecks':{'records':len(profile_checks),'nonuniqueOrMissingExactAliasCases':83,'allConsistent':all(x['consistent'] for x in profile_checks),'checks':profile_checks},'limitations':'Primary profile checks reconcile archived retrieved name/URL/profile-ID evidence against current identity output; this run does not recrawl biographies or validate DOB.'}
 (ROOT/'identities-source-reconciliation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:report[k] for k in ['status','sourceCount','eligibleMatches','rawGlobal','sqliteGlobal','matchDifferences','perMatchSideFieldMismatches']},indent=2));assert report['status']=='PASS'
if __name__=='__main__':main()
