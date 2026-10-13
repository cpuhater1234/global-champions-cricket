"""Eight user-controlled franchise paths using the VM harness, never browser QA."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import argparse,json,os,subprocess
p=argparse.ArgumentParser();p.add_argument('--build',default='game/global_champions_cricket_v8_quality_tested.html');args=p.parse_args()
def run(club):
 d=Path('qa/extensive/clubs')/str(club);d.mkdir(parents=True,exist_ok=True)
 env={**os.environ,'GCC8_TEST_BUILD':args.build,'GCC8_TEST_SEED':'101','GCC8_TEST_CLUB':str(club),'GCC8_TEST_LAST_YEAR':'2008','GCC8_TEST_REPORT_DIR':str(d)}
 proc=subprocess.run(['node','qa/v8_game_test.mjs'],env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);(d/'run.log').write_text(proc.stdout)
 return {'club_index':club,'exit_code':proc.returncode,'result':json.loads((d/'v8_smoke_results.json').read_text()) if proc.returncode==0 else proc.stdout[-1800:]}
with ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(run,range(8)))
Path('qa/v8_club_matrix_results.json').write_text(json.dumps(results,indent=2)+'\n')
for r in results:print({'club_index':r['club_index'],'exit_code':r['exit_code'],'club':r['result'].get('club') if isinstance(r['result'],dict) else r['result']})
assert all(r['exit_code']==0 for r in results)
