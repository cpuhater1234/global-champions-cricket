"""Focused repeatable regression entry point; detailed/long suites are documented."""
from pathlib import Path
import os,subprocess,sys,json
ROOT=Path(__file__).resolve().parents[2]
QA=Path(__file__).resolve().parent
os.chdir(ROOT)
fixtures=ROOT/'qa/club-expansion-20261027/stock-fixtures'
if not (fixtures/'foundation.json').exists():
 raise SystemExit('Synthetic fixtures missing. Extract the saved audit evidence overlay into this checkout; see README.md.')
env=dict(os.environ,GCC8_TEST_BUILD='qa/bulletproof-20261027/candidate.html',GCC8_FIXTURE_DIR=str(fixtures),GCC_TEST_PHASE='repeat',GCC_MODAL_WORDS='1')
commands=[['python',str(QA/'build.py')],['python',str(QA/'core/static.py')]]
commands += [['node',str(QA/'saves'/name)] for name in ['final-baseline77.mjs','final-adversarial.mjs','table-validation-regression.mjs','restore-feedback-regression.cjs','final-recovery.cjs']]
commands += [['node',str(QA/'browser'/name)] for name in ['snake-regression.cjs','compare-regression.cjs','header-regression.cjs','fixture-layout.cjs']]
results=[]
for index,command in enumerate(commands):
 log=QA/f'repeat-{index}.log'
 with log.open('wb') as output:result=subprocess.run(command,env=env,stdout=output,stderr=subprocess.STDOUT)
 results.append({'command':command,'exit':result.returncode,'log':str(log.relative_to(ROOT))})
 print(command[-1],result.returncode,flush=True)
 (QA/'repeat-results.json').write_text(json.dumps(results,indent=2)+'\n')
 if result.returncode:sys.exit(result.returncode)
