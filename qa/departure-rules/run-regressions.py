from pathlib import Path
import subprocess,os,json,time,hashlib
root=Path('qa/departure-rules');env={**os.environ,'GCC8_TEST_BUILD':'game/gcc_v8_product_candidate.html'};rows=[]
for p in sorted(Path('qa').glob('v8_*test.mjs')):
 if p.name=='v8_game_test.mjs':continue
 start=time.monotonic();r=subprocess.run(['node',str(p)],capture_output=True,text=True,env=env,timeout=600)
 row={'test':str(p),'exitCode':r.returncode,'seconds':round(time.monotonic()-start,2)};rows.append(row);(root/(p.stem+'.log')).write_text(r.stdout+r.stderr);(root/'regressions.json').write_text(json.dumps({'hash':hashlib.sha256(Path(env['GCC8_TEST_BUILD']).read_bytes()).hexdigest(),'rows':rows},indent=2));print(json.dumps(row),flush=True)
raise SystemExit(any(r['exitCode'] for r in rows))
