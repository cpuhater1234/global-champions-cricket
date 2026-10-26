import subprocess,os,json
from pathlib import Path
q=Path('qa/numbers-20261026');prev=json.loads((q/'suite-results.json').read_text());env=dict(os.environ,GCC8_TEST_BUILD='game/gcc_v8_product_candidate.html');rows=[]
for row in prev['rows']:
 if row['exit'] and row['test'] not in ['qa/departure-rules/package-test.mjs','qa/departure-rules/transactions.mjs']:
  r=subprocess.run(['node',row['test']],env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);p=q/('retry-'+Path(row['test']).stem+'.log');p.write_text(r.stdout);rows.append({'test':row['test'],'exit':r.returncode,'log':str(p),'tail':r.stdout[-1200:]});print(row['test'],r.returncode,flush=True)
(q/'retry-results.json').write_text(json.dumps(rows,indent=2))
