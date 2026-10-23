from pathlib import Path
import subprocess,os,json,time,hashlib
root=Path('qa/audit-20261023');paths=['qa/trade-structure/pick-value-test.mjs','qa/career-experience/behaviour.mjs','qa/career-experience/growth-probe.mjs','qa/calibration/compatibility.mjs','qa/structural-risk/cpu-boards.mjs'];rows=[];env={**os.environ,'GCC8_TEST_BUILD':'game/gcc_v8_product_candidate.html','GCC8_GROWTH_REPORT':str(root/'growth.json')}
for test in paths:
 start=time.monotonic()
 try:r=subprocess.run(['node',test],capture_output=True,text=True,env=env,timeout=600);code=r.returncode;out=r.stdout+r.stderr
 except subprocess.TimeoutExpired as e:code=124;out=str(e)
 row={'test':test,'exitCode':code,'seconds':round(time.monotonic()-start,2),'log':str(root/('extra-'+test.replace('/','-')+'.log'))};Path(row['log']).write_text(out);rows.append(row);(root/'extra-results.json').write_text(json.dumps({'hash':hashlib.sha256(Path(env['GCC8_TEST_BUILD']).read_bytes()).hexdigest(),'rows':rows},indent=2));print(json.dumps(row),flush=True)

raise SystemExit(any(r["exitCode"] for r in rows))
