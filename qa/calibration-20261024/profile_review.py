"""Attribute-level evidence audit: activity and sample size are not skill certification."""
from pathlib import Path
import collections,json,sqlite3
ROOT=Path(__file__).resolve().parent
c=sqlite3.connect(ROOT/'deliveries.sqlite');c.row_factory=sqlite3.Row
ids=json.loads((ROOT/'identities.json').read_text());profiles=json.loads(Path('v8/domain/player_profiles.json').read_text());a=json.loads(Path('qa/finish-pass/numeric-audit.json').read_text());test=json.loads((ROOT/'heldout-report.json').read_text());byname=collections.defaultdict(list)
for p in a['players']:byname[p['name']].append(p)
bat={r['id']:dict(r)for r in c.execute('SELECT bat id,SUM(faced) balls,SUM(bat_runs) runs,SUM(bat_outs) outs,SUM(four) fours,SUM(six) sixes,SUM(slot*faced)*1.0/NULLIF(SUM(faced),0) meanSlot,MIN(year) firstYear,MAX(year) lastYear FROM records GROUP BY bat')}
bowl={r['id']:dict(r)for r in c.execute('SELECT bowl id,SUM(legal) balls,SUM(charged) runs,SUM(credited) wickets,MIN(year) firstYear,MAX(year) lastYear FROM records GROUP BY bowl')}
apps=dict(c.execute('SELECT player,COUNT(DISTINCT match) FROM appearances GROUP BY player'));field=collections.defaultdict(dict)
for r in c.execute('SELECT player,kind,COUNT(*) n FROM fielding GROUP BY player,kind'):field[r['player']][r['kind']]=r['n']
phases=collections.defaultdict(lambda:collections.defaultdict(dict))
for family,player,den in [('bat','bat','faced'),('bowl','bowl','legal')]:
 for r in c.execute(f'SELECT {player} id,phase,SUM({den}) n FROM records GROUP BY {player},phase'):phases[r['id']][family][str(r['phase'])]=r['n']
ledger=[];flags=[]
for p in profiles:
 name=p['canonicalName'];identifier=ids[name]['identifier'];b=bat.get(identifier,{'balls':0});q=bowl.get(identifier,{'balls':0});n=apps.get(identifier,0);bowlingOversPerListedMatch=q['balls']/6/n if n else None;basis={}
 for key in ['bat','power','control','pacePlay','spinPlay','running','finishing','bowl','newBall','death','bowlControl','variation','spin','pace','fielding','keeping','temperament','leadership','overall']:
  if key=='overall':kind='Derived ordinal game composite; skill-overall-v1 preserves role equivalence; legacy methods frozen'
  elif key in ['temperament','leadership']:kind='Authored model prior; no direct delivery measurement'
  elif key in ['fielding','keeping']:kind='Authored model prior; fielding activity available, opportunity-adjusted skill unidentified'
  elif key in ['spin','pace','variation','pacePlay','spinPlay']:kind='Authored technique/style estimate; delivered ball-type or technique measurement incomplete'
  else:kind='Authored estimate with related scoring/dismissal/activity proxies; replacement model failed predeclared promotion gate'
  values=[r['attributes'][key]for r in byname[name]if key in r['attributes']];basis[key]={'basis':kind,'rangeInAuditedWorld':[min(values),max(values)]if values else None,'worldSeed':8301,'measuredSkill':False}
 primary=b['balls']if p['primaryFamily']=='batting'else q['balls']if p['primaryFamily']=='bowling'else min(b['balls'],q['balls']);tier='substantial-observations'if primary>=600 else'limited-observations'if primary else'no-direct-delivery-observations'
 row={'name':name,'registerId':identifier,'identityVerifiedScope':'name-to-register-id; not DOB or numeric certification','identitySources':ids[name]['evidenceUrls'],'originalCalibrationStatus':p['calibrationStatus'],'originalRatingAuditStatus':byname[name][0]['provenance']['status'],'reviewStatus':'reviewed-retained-prior','primaryFamily':p['primaryFamily'],'sampleSizeTier':tier,'listedMatches':n,'batting':b,'bowling':q,'bowlingOversPerListedMatch':bowlingOversPerListedMatch,'phaseBalls':phases.get(identifier,{}),'fieldingActivity':field.get(identifier,{}),'attributes':basis,'globalCandidatePromotionGates':test['promotionGates'],'uncertainty':'Missing activity is not zero ability. Substantial samples do not establish unidentifiable technique/mental/keeping ratings. Seeded alternate histories are not historical facts.'};ledger.append(row)
 if p['primaryFamily']=='bowling'and any(w['role']=='AR'for w in p['roleWindows'])and b.get('balls',0)>=180 and b.get('meanSlot',0)>=8:flags.append({'name':name,'meanObservedBattingSlot':b['meanSlot'],'bowlingOversPerListedMatch':bowlingOversPerListedMatch,'action':'T20 role classification review; not automatically reclassified'})
assert len(ledger)==412 and len(set(r['registerId']for r in ledger))==412
report={'players':412,'identityUnresolved':0,'withListedMatchEvidence':sum(r['listedMatches']>0 for r in ledger),'withBattingDeliveries':sum(r['batting']['balls']>0 for r in ledger),'withBowlingDeliveries':sum(r['bowling']['balls']>0 for r in ledger),'priorProvisionalProfilesReviewed':sum('provisional'in r['originalRatingAuditStatus']for r in ledger),'sampleTiers':dict(collections.Counter(r['sampleSizeTier']for r in ledger)),'roleReviewFlags':flags,'candidateRejected':True,'numericPriorsCertified':False,'scope':'Every catalog identity and numeric attribute classified. Activity/proxies are distinguished from measured ability. Original provisional status not cosmetically relabelled as validated.'}
(ROOT/'attribute-evidence-ledger.json').write_text(json.dumps(ledger,separators=(',',':')));(ROOT/'profile-review-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
