from pathlib import Path
import subprocess,os,json,time,hashlib
root=Path('qa/finish-pass');env={**os.environ,'GCC8_TEST_BUILD':'qa/finish-pass/candidate.html'};rows=[]
for p in sorted(Path('qa').glob('v8_*test.mjs')):
 if p.name=='v8_game_test.mjs':continue
 start=time.monotonic()
 try:r=subprocess.run(['node',str(p)],capture_output=True,text=True,env=env,timeout=180);code=r.returncode;output=r.stdout+r.stderr
 except subprocess.TimeoutExpired as e:code=124;output=str(e)
 row={'test':str(p),'exitCode':code,'seconds':round(time.monotonic()-start,2)};rows.append(row);(root/(p.stem+'.log')).write_text(output);(root/'regressions.json').write_text(json.dumps({'hash':hashlib.sha256(Path(env['GCC8_TEST_BUILD']).read_bytes()).hexdigest(),'rows':rows},indent=2));print(json.dumps(row),flush=True)
raise SystemExit(any(r['exitCode'] for r in rows))
