"""Compile exact-build evidence. Never silently combine results from different candidates."""
from pathlib import Path
import hashlib,json,re
root=Path(__file__).resolve().parents[2];q=root/'qa/finish-pass';load=lambda n:json.loads((q/n).read_text());sha=hashlib.sha256((q/'candidate.html').read_bytes()).hexdigest()
assert sha=='3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf'
reports={n:load(n) for n in ['ratings-regression.json','ratings-persistence.json','ar-overall-invariant.json','overall-version-compatibility.json','private-rolefit-save-compat.json','effects.json','cpu.json','browser.json','chaos.json','save-compatibility.json','statistics.json','policies-summary.json','source-reconciliation.json','regressions.json']}
for name,r in reports.items():
 if 'hash' in r:assert r['hash']==sha,name
rows={r['test']:r for r in reports['regressions.json']['rows']}
for extra in ['final-timeout-rechecks.json','additional-rechecks.json']:
 if (q/extra).exists():
  report=load(extra);assert report['hash']==sha
  for r in report['rows']:rows[r['test']]=r
assert len(rows)==75 and all(r['exitCode']==0 for r in rows.values()),[r for r in rows.values() if r['exitCode']]
fresh=load('career-final-8602/v8_game_results.json');assert fresh['seasons']==19 and not fresh['errors'] and not fresh['storageStats']['quotaFailures']
assert reports['effects.json']['innings']==20000
assert len(reports['browser.json']['rows'])==162
assert len(reports['browser.json']['engines'])==3 and all(e['status']=='launched' and 'failure' not in e for e in reports['browser.json']['engines'])
assert reports['save-compatibility.json']['checkpoints']==72
exact_legacy=[]
for name,start in [('v8_existing_career_test',2008),('v8_delivery_career_test',2009)]:
 r=load('final-'+name+'/v8_game_results.json');assert r['seasons']==19 and not r['errors'];exact_legacy.append({'suite':name,'startingCompletedYear':start,'newSeasons':2026-start,'newManagedLeagueMatches':(2026-start)*14,'checks':r['checks']})
pol=reports['policies-summary.json'];stats=reports['statistics.json'];effects=reports['effects.json'];assert pol['cohorts']==32 and pol['managedMatches']==8512
legacy=[]
for folder,start in [('legacy-2008',2008),('legacy-2009',2009)]:
 r=load(folder+'/v8_game_results.json');assert not r['errors'] and r['seasons']==19;legacy.append({'folder':folder,'hash':'8032645f0712cca8b00c1ff7927c724bb3ab9bd54f72c8a10a38a287ccafca9b','newSeasons':2026-start,'newManagedLeagueMatches':14*(2026-start),'scope':'Preceding private candidate; earlier completed saved history excluded'})
v={'hash':sha,'gitBlob':'f5059bb1890951b9816c8cdf57670d6b21e0d0f2','bytes':(q/'candidate.html').stat().st_size,'baseCommit':'2b604dc15ebf1242730728d12123c896cb23aab0','productionChanges':['v8/domain/career_outcomes.js','v8/domain/career_state.js','v8/domain/scouting.js'],'regressions':list(rows.values()),'finalRegressionPasses':len(rows),'freshCareer':fresh,'exactFinalLegacyContinuations':exact_legacy,'exactFinalNewFullFlowSeasons':54,'exactFinalNewManagedLeagueMatches':756,'precedingCandidateLegacyContinuations':legacy,'controlledStrategy':{k:pol[k] for k in ['worlds','cohorts','managedMatches','scope','design']},'controlledInnings':effects['innings'],'browserCases':len(reports['browser.json']['rows']),'compatibilityCheckpoints':72,'compatibilityChecks':reports['save-compatibility.json']['checks'],'sourceMatches':stats['sourceMatches'],'sourceMappedPlayers':stats['mappedPlayers'],'unresolvedIdentities':stats['unresolvedIdentities'],'independentReview':'No blocking defect; numerical consistency is not historical calibration','openGates':['Historical bowling/role validity and unresolved identities','143 provisional arrival models','Human novice and returning-player playtests','Physical-device and screen-reader-user sessions','Keeping and new-ball effect uncertainty']}
(q/'verification.json').write_text(json.dumps(v,indent=2))
(q/'regression-triage.json').write_text(json.dumps({'hash':sha,'initialExactBuildRows':reports['regressions.json']['rows'],'finalRows':list(rows.values()),'notes':['Initial180-second timeouts are retained; long suites rerun to actual completion in isolated report directories.','The injury-feedback assertion assumed a specific draft composition. New draft had only10 fit players after bowlers were injured; actual UI correctly said XI incomplete. Reproduced in injured-cover-probe, then assertion checked incomplete XI versus missing bowling cover, and never advertised full cover. No product change was required.','Earlier maintenance aligned stale UI assertions with accepted Scout/Pick and annual handoff, current Round3 trade deadline and two-deal allowance; genuine fixtures were recovered and their hashes preserved.','Historical source-assessment non-striker dismissal accounting was independently corrected and reconciled in30 raw-total checks.']},indent=2))
policy_table='\n'.join(f"| {r['policy']} | {r['winPercentage']:.2f}% |" for r in pol['summary'])
contrast_table='\n'.join(f"| {r['policy']} | {r['pairedMeanWinPercentagePointDifference']:+.2f} | {r['worldCluster95Interval'][0]:+.2f} to {r['worldCluster95Interval'][1]:+.2f} |" for r in pol['contrasts'])
effect_table='\n'.join(f"| {r['name']} | {r['pairedRunDelta']:+.2f} | {r['paired95Interval'][0]:+.2f} to {r['paired95Interval'][1]:+.2f} |" for r in effects['summaries'])
population_table='\n'.join(f"| {r['year']} | {r['beforeMeanOverall']:.2f} | {r['afterMeanOverall']:.2f} | {r['beforeEliteCount']:.2f} | {r['afterEliteCount']:.2f} |" for r in stats['population'])
corr_table='\n'.join(f"| {r['kind']} {r['phase']} | {r['uniquePlayers']} | {r['expectedBaselineSpearman']:.3f} |" for r in stats['phaseRankAssociation'])
doc=f'''# GCC six-priority finishing assessment

This pass delivers focused numerical fixes and extensive automated validation. It does **not** establish that all six finished-product gates are closed. Historical rating validity and human playtesting remain material work.

## Exact build

SHA-256 `{sha}`. Git blob `{v['gitBlob']}`. {v['bytes']:,} bytes. Base commit `{v['baseCommit']}`. Both canonical playables contain identical bytes. `qa/finish-pass/build.py` reconstructs this candidate from the preserved accepted baseline.

New careers use `overallMethod=skill-overall-v1`: rounded role-based skill composites, with all-rounders rated at least as highly as identical batting or bowling specialists. This avoids penalising a strong batter for having an additional bowling option. It measures strongest specialist-equivalent ability for AR, not complete utility, win probability or historical certification. Form remains a separate context.

The preceding private candidate used direct AR roleFit, which could rate Maxwell78 despite batting90. That candidate was not promoted to the delivered playable. A failing invariant reproduced the problem before this correction. Both preceding role-fit-v1 and legacy absent/null evaluators remain frozen; global roleFit is unchanged to preserve older saved futures. Existing current skills and outcomes are not retroactively rewritten.

Scouting confidence now follows numeric evidence metadata. A biography/identity URL cannot confer skill confidence. Provisional arrival profiles remain LOW. No match probability formula, visual palette, manual-XI requirement or current trade/retirement rule changed.

## Six priorities

| Priority | Evidence delivered | Remaining gate |
| --- | --- | --- |
| First-time comprehension and strategy | Guarded journeys, deliberate poor selections,32 controlled policy cohorts and a documented uncoached protocol | Unfamiliar people successfully completing the tasks without coaching |
| CPU and cricket behaviour | Eight real foundation drafts/64 squads, production CPU XI checks and20,000 controlled innings | Historical bowling validity, uncertain small effects and broader trade-strategy balance |
| Feedback, pacing and continuity | Replay/speed/skip/reload checks, fresh19-season full-flow career, older save continuations | Actual returning-player enjoyment, attachment and pacing feedback |
| Device/accessibility and resilience | Three browser engines,162 viewport/text cases, chaotic-state checks and72 older saved checkpoints | Physical phones/tablets and regular screen-reader users |
| Targeted fixes and retesting | Three production modules,75 VM regression suites, independent review | No blocking defect identified in the tested scope |
| Numerical/statistical credibility | All412 players across5,149 active player-years per world in8 worlds;7,102 source matches and per-player evidence ledger | Full attribute-level generation, role/identity review and held-out historical validation |

## Exact-build verification

-75 applicable VM suites pass. Initial failures/timeouts and subsequent explicit rechecks remain recorded; obsolete presentation/rule assumptions were corrected and missing genuine fixtures recovered. The10,000-world distribution check explicitly uses the shipped new-world method; these are draws, not10,000 complete careers.
- Fresh full-flow career seed8602, club `{fresh['club']}`:19 seasons,266 managed league matches,{fresh['checks']:,} checks,{len(fresh['coverage']['reloads'])} cold restores,{fresh['coverage']['injurySelections']} injury-selection recoveries and{fresh['coverage']['superOvers']} natural Super Overs. No unexpected errors. Maximum saved state {fresh['storageStats']['maxUtf16Bytes']:,} UTF16 bytes under a4MiB test budget.
- Two exact-final legacy careers continued from completed2008/2009 saves through2026:35 additional newly exercised seasons and490 managed league matches. Combined with the fresh career,54 newly tested full-flow seasons and756 managed league matches. Loaded earlier history is excluded.
-72 older saved checkpoints across4 worlds: {v['compatibilityChecks']:,} comparisons against baseline restore. Existing cover normalisation may legitimately differ from raw saved bytes equally in both versions. Current skills, expected/private future stores, rosters, selection, score/stat facts agree between versions.
-{reports['ratings-regression.json']['checks']:,} rating checks;{reports['ratings-persistence.json']['checks']:,} persistence/privacy checks;{reports['ar-overall-invariant.json']['checks']:,} all-rounder/skill monotonicity checks;{reports['overall-version-compatibility.json']['checks']:,} frozen-evaluator comparisons.
-{reports['private-rolefit-save-compat.json']['checks']:,} comparisons on an actual preceding private role-fit-v1 saved career confirm unchanged current facts and later player states; this is separate from the72 historical saves.
- Chromium, Firefox and WebKit:162 cases across3 widths,3 text sizes and6 stages. Actual fresh draft/scouting plus saved-team/analysis/focus/playback journeys. Images blocked for repeatability. Phone/touch emulation is not physical-device or screen-reader-user evidence.

The preceding8032645 candidate separately completed a fresh19-season career and two older completed2008/2009 careers through2026 (35 additional newly exercised seasons,490 managed league matches). These are supplementary earlier-candidate results, **not** exact-final career totals. Earlier saved history is never counted as newly played seasons.

## Overall calculation across matched worlds

| Year | Previous mean | New mean | Previous90+ players | New90+ players |
| --- | --- | --- | --- | --- |
{population_table}

Values average the active eligible pool across8 matched worlds. They quantify this calculation change; they do not certify underlying historical attributes or prove a preferred talent distribution.

## Strategy assessment

| Policy | Managed-match win rate |
| --- | --- |
{policy_table}

Each policy has2,128 matches across8 paired worlds. Contrasts against balanced-current use world-level paired differences with a t interval(df7), retaining the small number of independent worlds.

| Policy vs balanced-current | Difference, percentage points |95% interval |
| --- | --- | --- |
{contrast_table}

These cohorts use production career, guard, public CPU evaluation and match functions, with simplified annual replacement administration. They omit the full CPU wrapper's extra role need/noise, optional trades/releases, injuries and performance-form updates. Finals qualification uses wins/alphabetical ties. They are not32 full UI careers or proof of universal strategy balance. See the intervals rather than interpreting pooled differences as superiority.

## Controlled simulation effects

2,000 paired seeds per intervention;20,000 production innings. Batting/bowling change families of attributes, while the other skill interventions isolate a parameter. Common seeds do not ensure identical later branches.

| Intervention | Mean run change | Paired95% interval |
| --- | --- | --- |
{effect_table}

Keeping and new-ball intervals include zero: inconclusive in this design, not proof of irrelevance. Overall-only changes reproduce baseline outcomes exactly for fixed XIs; the displayed number itself does not boost odds. Effects on selection remain possible because drafting and team decisions use ratings.

## Historical assessment

Original IPL, BBL, Blast and men's T20I Cricsheet archives plus register were downloaded and preserved with exact URL/hash manifests.7,102 matches;339 of412 names mapped,325 with delivery records,73 identities unresolved. Conservative initials/surname matches are review leads, not certified identities.

Contemporary three-year windows use competition/year/phase contextual scoring/wicket rates with180-ball batting and240-ball bowling shrinkage priors. These are stated diagnostic assumptions, not fitted rating-generation constants. Full-member T20I opposition groups are separated from other internationals. Non-striker dismissals and bowler-credit categories were independently reconciled against register-ID raw totals in30 checks.

| Expected baseline phase | Unique players with180+ balls | Pooled rank association |
| --- | --- | --- |
{corr_table}

Overlapping player windows are correlated; this table is not a significance test or held-out validation. The weak bowling associations remain an open concern even when private career variation is excluded. Historical six-over powerplay differs from GCC four opening overs plus a two-over surge. Opposition, competition strength, era, opportunity and identity need further work.

The per-player evidence ledger separates source claims, actual delivery evidence and estimates. These archives cannot fully measure fielding/keeping opportunities, dropped catches, leadership, temperament, variation or technique. No fabricated precision or blanket rerating was applied.143 arrival models remain provisional; bowling-family profiles labelledAR with low batting estimates need T20 role review.

## Work still required before a finished-product claim

1. Resolve identities and review role classifications; prioritise bowling-family AR labels and low-sample elite phase estimates.
2. Build a reproducible attribute-level rating pipeline with measured/proxy/estimated provenance, sparse-sample rules and held-out period/competition checks. Review bowling phases first.
3. Assess keeping/new-ball effects for meaningful gameplay decisions without arbitrary amplification.
4. Run the novice and returning-player sessions in `qa/finish-pass/PLAYTEST_PROTOCOL.md`; record actual comprehension and willingness to continue.
5. Test physical iPhone/Android hardware and regular screen-reader users.

Independent review found no blocking production defect in the narrow changes. Its evidence-scope cautions are retained. Existing accepted presentation and user-confirmed recruitment rules remain authoritative.
'''
parts=doc.split('`')
for i in range(0,len(parts),2):
 parts[i]=re.sub(r'(?<=[A-Za-z,;:])(?=[0-9])', ' ', parts[i])
 parts[i]=re.sub(r'(?<=[0-9])(?=[A-Za-z])', ' ', parts[i])
doc='`'.join(parts)
doc=re.sub(r'(?<=\d), (?=\d{3}(?:\D|$))', ',', doc)
doc=re.sub(r'^-(?=\d)', '- ', doc, flags=re.M)
for a,b in [('role-fit-v 1','role-fit-v1'),('T 20 I','T20I'),('T 20','T20'),('UTF 16','UTF-16'),('df 7','df=7'),('manifests.7','manifests. 7'),('applied.143','applied. 143'),('labelledAR','labelled AR'),('|95%','| 95%')]:doc=doc.replace(a,b)
(root/'docs/GCC_V8_FINISH_ASSESSMENT_20261024.md').write_text(doc)
print(json.dumps({k:v for k,v in v.items() if k not in ['regressions','freshCareer']},indent=2))
