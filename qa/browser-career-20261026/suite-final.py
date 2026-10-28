import json,os,subprocess,time
from pathlib import Path
root=Path('qa/browser-career-20261026');tests=[r['test'] for r in json.load(open('qa/numbers-20261026/final-suite-results.json'))['rows']];tests=[{'qa/departure-rules/package-test.mjs':'qa/browser-career-20261026/package-current.mjs','qa/departure-rules/transactions.mjs':'qa/numbers-20261026/transactions-controlled.mjs'}.get(t,t) for t in tests];out=[]
for test in tests:
 start=time.time();log=root/('suite-final-'+Path(test).stem+'.log')
 with open(log,'w') as f:r=subprocess.run(['node',test],env={**os.environ,'GCC8_TEST_BUILD':str(root/'final-candidate.html')},stdout=f,stderr=subprocess.STDOUT)
 out.append({'test':test,'exit':r.returncode,'seconds':round(time.time()-start,2),'log':str(log)});(root/'suite-final.json').write_text(json.dumps(out,indent=2));print(test,r.returncode,flush=True)
