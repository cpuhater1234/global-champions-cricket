from pathlib import Path
import subprocess,os,json,time,hashlib
root=Path('qa/audit-20261023');tests=sorted(p for p in Path('qa').glob('v8_*test.mjs') if p.name!='v8_game_test.mjs');env={**os.environ,'GCC8_TEST_BUILD':'game/gcc_v8_product_candidate.html'};rows=[]
for p in tests:
 start=time.monotonic()
 try:
  r=subprocess.run(['node',str(p)],capture_output=True,text=True,env=env,timeout=600);code=r.returncode;out=r.stdout+r.stderr
 except subprocess.TimeoutExpired as e:code=124;out=str(e)
 row={'test':str(p),'exitCode':code,'seconds':round(time.monotonic()-start,2),'log':str(root/(p.stem+'.log'))};Path(row['log']).write_text(out);rows.append(row);(root/'vm-results.json').write_text(json.dumps({'hash':hashlib.sha256(Path(env['GCC8_TEST_BUILD']).read_bytes()).hexdigest(),'rows':rows},indent=2));print(json.dumps(row),flush=True)
print('VM suites complete',len(rows),'failed',sum(r['exitCode']!=0 for r in rows),flush=True)

raise SystemExit(any(r["exitCode"] for r in rows))
