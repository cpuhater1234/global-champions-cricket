"""Gate promotion on measured reports; do not turn mixed scopes into a grand total."""
from pathlib import Path
import hashlib,json,re
Q=Path(__file__).resolve().parent
R=Q.parents[1]
def read(name):return json.loads((Q/name).read_text())
sha=hashlib.sha256((Q/'candidate.html').read_bytes()).hexdigest()
assert read('build.json')['sha256']==sha
assert read('source-parity.json')['candidateSha256']==sha
s=read('static.json');assert s['sha256']==sha and len(s['scripts'])==20 and all(x['pass'] for x in s['scripts']) and not s['duplicates']
p=read('persistence/pending-final-results.json');assert p['passed']==p['total']==11
c=read('persistence/concurrency-green-results.json');assert c['total']==20 and c['silentOverwriteRounds']==0 and all(sum(t['saved'] for t in r['tabs'])==1 for r in c['rounds'])
for name,n in [('exit-guard-release',6),('clear-lock-release',2),('clear-supersede-release',2)]:
 d=read('persistence/'+name+'.json');assert d['sha']==sha and d['pass'] and len(d['checks'])==n
assert read('regressions/final-baseline77.json')['checks']==77
adv=read('regressions/final-adversarial-results.json');assert adv['sha256']==sha and adv['passed']==adv['checks']==83 and adv['failed']==0
t=read('regressions/table-validation-regression-results.json');assert t['sha256']==sha and len(t['results'])==24 and all(x['pass'] for x in t['results'])
fb=read('regressions/restore-feedback-regression-results.json');assert len(fb)==2 and all(all(x['assertions'].values()) for x in fb)
assert all(read('regressions/final-recovery-results.json')['assertions'].values())
b=read('browser/summary.json');assert b['candidateSha256']==sha and len(b['checks'])==13 and all(x['pass'] for x in b['checks']) and not b['errors']
layout=read('browser/save-status-layout.json');assert layout['sha']==sha and layout['pass'] and len(layout['checks'])==8 and all(x['pass'] for x in layout['checks'])
tr=read('regressions/full-roster-trade-GREEN.json');assert tr['sha']==sha and tr['pass'] and len(tr['checks'])==2
tr2=read('regressions/trade-role-boundaries-GREEN-REVIEW.json');assert tr2['sha']==sha and tr2['pass'] and len(tr2['checks'])==6
perf=read('performance/native-input-async.json');nav=[x for r in perf for x in r['input']];assert len(nav)==8 and all(x['after']['saves']-x['before']['saves']==1 and x['after']['codec']-x['before']['codec']==1 for x in nav)
assert all(r['gameplayUnchanged'] and r['directGo']['writes']==1 and len(r['coldRestores'])==2 for r in perf)
career=read('regressions/career/PBKS.json');assert career['sha']==sha and not career['failures'] and len(career['cases'])==1
case=career['cases'][0];assert [x['year'] for x in case['seasons']]==list(range(2008,2027)) and sum(x['managedMatches'] for x in case['seasons'])==266 and case['restores']==4
baseline=read('persistence/results.json');failures=[x['name'] for x in baseline['checks'] if not x['pass']];assert baseline['passed']==24 and baseline['total']==25 and failures==['crash-relaunch-career-content-identical']
summary={'release':'v81','sha256':sha,'bytes':(Q/'candidate.html').stat().st_size,'baselineCommit':read('build.json')['baselineCommit'],'protection':read('build.json'),'finalCandidate':{'concurrentTabRaces':20,'silentOverwrites':0,'acceptedWritersPerRace':1,'pendingSaveChecks':11,'exitGuardChecks':6,'clearChecks':4,'integrityChecks':77,'adversarialChecks':83,'tableValidationCases':24,'restoreFeedbackModes':2,'storageRecoveryChecks':6,'nativeLifecycleAccessibilityChecks':13,'saveStatusViewportCases':8,'tradeGuardCases':8,'singleSaveNavigationClicks':8,'career':{'club':case['club'],'seasons':19,'years':[2008,2026],'managedLeagueMatches':266,'worldLeagueMatches':1064,'worldFinals':57,'coldRestores':case['restores'],'acceptedTrades':case['tradeAccepted'],'releases':case['releases'],'injuryObservations':case['injuryObservations']}},'earlierUnchangedGameplayEvidence':{'draftSlotCombinations':4096,'draftSlotChecks':771430,'retirementBoundaries':[0,1,3,4,5,8,12],'scope':'v80 unchanged domain/gameplay; synthetic retirement boundaries, not natural frequencies'},'knownDurabilityFailure':{'baselineChecksPassed':24,'baselineChecksTotal':25,'failedCheck':failures[0],'status':'Browser.crash can roll back accepted localStorage writes; not fixed and not attributed as the original intermittent-loss cause.'},'limits':['Web Locks required for overlapping-writer guarantee; close older GCC builds.','Abrupt whole-browser crash disk durability not guaranteed; keep portable downloaded backups.','Indefinite lock holder remains visibly pending; beforeunload prompts are platform-dependent.','No physical-device, installed Firefox/WebKit, spoken screen-reader, human first-use or historical calibration certification.']}
(Q/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
