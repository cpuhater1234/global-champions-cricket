from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,os,json,time,hashlib
q=Path('qa/finish-pass');build='qa/finish-pass/candidate.html';sha=hashlib.sha256(Path(build).read_bytes()).hexdigest();tests=['v8_brutal_playback_resume_test','v8_delivery_career_test','v8_existing_career_test']
def run(name):
 folder=q/('final-'+name);folder.mkdir(exist_ok=True);start=time.monotonic();env={**os.environ,'GCC8_TEST_BUILD':build,'GCC8_TEST_REPORT_DIR':str(folder),'GCC8_BRUTAL_RESUME_DIR':str(folder)}
 with (q/(name+'-final-long.log')).open('w') as log:r=subprocess.run(['node','qa/'+name+'.mjs'],env=env,stdout=log,stderr=subprocess.STDOUT,timeout=3600)
 row={'test':'qa/'+name+'.mjs','exitCode':r.returncode,'seconds':round(time.monotonic()-start,2),'hash':sha,'run':name+'-final-long.log','reportDirectory':str(folder)};print(json.dumps(row),flush=True);return row
with ThreadPoolExecutor(max_workers=3) as pool:rows=list(pool.map(run,tests))
(q/'final-timeout-rechecks.json').write_text(json.dumps({'hash':sha,'rows':rows,'scope':'Long suites run in isolated report directories with sufficient timeout; initial180-second failures retained.'},indent=2))
raise SystemExit(any(r['exitCode'] for r in rows))
