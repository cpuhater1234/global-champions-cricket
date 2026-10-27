"""Gate final bytes against measured reports; retain provenance across test scopes."""
from pathlib import Path
import json,hashlib,re
Q=Path(__file__).resolve().parent;R=Q.parents[1]
def read(p):return json.loads((Q/p).read_text())
data=(Q/'candidate.html').read_bytes();sha=hashlib.sha256(data).hexdigest();build=read('build.json');assert build['sha256']==sha
for name in ['game/gcc_v8_product_candidate.html','game/gcc_v8_quiet_arcade.html']:assert (R/name).read_bytes()==data
scripts=re.findall(r'<script\b[^>]*>(.*?)</script>',data.decode(),re.S);base=re.findall(r'<script\b[^>]*>(.*?)</script>',(Q/'baseline.html').read_text(),re.S)
assert len(scripts)==len(base)==20 and [i for i,(a,b) in enumerate(zip(base,scripts))if a!=b]==[10,19]
wrapper='(()=>{const {setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame,cancelAnimationFrame}=window.GCC8_CLOCK;const MutationObserver=class{observe(){}disconnect(){}};'
assert scripts[10].strip()==wrapper+'\n'+(R/'v8/engine/dynasty.js').read_text().strip()+'\n})();'
assert scripts[19].strip()==(R/'v8/ui/controller.js').read_text().strip()
for p in ['v8/domain/checkpoint_store.js','v8/domain/save_coordinator.js']:assert (R/p).read_text().strip() in scripts[10]
(Q/'source-parity.json').write_text(json.dumps({'sha':sha,'engineClockWrapperPreserved':True,'controllerExact':True,'domainAssetsEmbeddedExact':True,'unchangedScriptBodies':18},indent=2)+'\n')
s=read('static.json');assert s['sha256']==sha and len(s['scripts'])==20 and all(x['pass'] for x in s['scripts']) and not s['duplicates'] and not s['externalScripts']
for p,key,n in [('integration-GREEN.json','checks',3),('edges.json','cases',6),('recovery-ui.json','checks',8),('review-cases/results-GREEN.json','cases',2)]:
 d=read(p);assert d['sha']==sha and d['pass'] and len(d[key])==n
n=read('native/results.json');assert n['sha']==sha and n['ok'] and len(n['crashes'])==10 and len(n['fixtures'])==3 and len(n['races'])==14
assert all(x['ok'] for k in ['crashes','fixtures','races'] for x in n[k])
for name in ['native','no-weblocks']:
 d=read('browsers/lifecycle-webkit-final-'+name+'.json');assert d['runtime']['buildSha256']==sha
 assert len(d['checks'])==13 and all(x['pass'] for x in d['checks']) and not d['errors']
a=read('regressions/final-adversarial-results.json');assert a['sha256']==sha and a['passed']==a['checks']==83 and a['failed']==0
t=read('regressions/table-validation-regression-results.json');assert t['sha256']==sha and len(t['results'])==24 and all(x['pass'] for x in t['results'])
assert read('regressions/final-baseline77.json')['checks']==77
assert all(read('regressions/final-recovery-results.json')['assertions'].values())
f=read('regressions/restore-feedback-regression-results.json');assert len(f)==2 and all(all(x['assertions'].values()) for x in f)
c=read('continuity.json');assert c['sha']==sha and len(c['cases'])==2 and all(x['pass'] and x['coldRound3Exact'] for x in c['cases'])
summary={'release':'v82','sha256':sha,'bytes':len(data),'baselineCommit':build['baselineCommit'],'sameSimulationScriptBodies':18,'nativeCrashes':10,'corruptPrimaryRecoveryCases':3,'noWebLocksRaces':14,'webKitLifecycleChecksPerMode':13,'modes':2,'queuedTimeoutClearAndCapabilityCases':6,'reviewRegressions':2,'recoveryUiLayoutAndFeedbackCases':8,'integrityChecks':77,'adversarialChecks':83,'tableValidationCases':24,'careerContinuity':c['cases'],'scope':'Final-byte recovery/persistence, Chromium, actual WebKit, deterministic v81-versus-v82 career transitions. Earlier full 19-season career evidence remains v81, not a v82 rerun.','limits':['No OS power-loss or physical-device certification.','Firefox content sandbox unavailable in this environment; no assertions completed.','No human spoken screen-reader or installed Safari certification.','Keep downloaded backups and close older game builds. Strict IndexedDB is measured browser behavior, not an absolute disk guarantee.','When neither usable Web Locks nor IndexedDB exists, autosave is refused and a live-session export remains available.']}
(Q/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
