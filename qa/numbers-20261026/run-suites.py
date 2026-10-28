from pathlib import Path
import subprocess,os,json,concurrent.futures,time,hashlib
subprocess.run(['node','qa/numbers-20261026/extract-ratings.mjs'],check=True)
q=Path('qa/numbers-20261026');tests=['qa/v8_chase_logic_test.mjs','qa/v8_brutal_delivery_test.mjs','qa/v8_delivery_engine_test.mjs','qa/v8_delivery_boundary_regression.mjs','qa/v8_career_distribution_test.mjs','qa/v8_career_outcomes_test.mjs','qa/v8_logic_test.mjs','qa/v8_career_strategy_test.mjs','qa/v8_cpu_market_test.mjs','qa/v8_player_profiles_test.mjs','qa/v8_development_feedback_test.mjs','qa/departure-rules/rules.mjs','qa/departure-rules/package-test.mjs','qa/departure-rules/transactions.mjs']
env=dict(os.environ,GCC8_TEST_BUILD='game/gcc_v8_product_candidate.html',GCC8_BRUTAL_MATCHES='3000',GCC8_BRUTAL_DELIVERY_DIR=str(q/'delivery-3000'))
def run(p):
 t=time.time();r=subprocess.run(['node',p],env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);log=q/(Path(p).parent.name+'-'+Path(p).stem+'.log');log.write_text(r.stdout);return dict(test=p,exit=r.returncode,seconds=round(time.time()-t,2),log=str(log),tail=r.stdout[-900:])
rows=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for r in pool.map(run,tests):rows.append(r);print(r['test'],r['exit'],flush=True);(q/'suite-results.json').write_text(json.dumps({'hash':hashlib.sha256(Path('game/gcc_v8_product_candidate.html').read_bytes()).hexdigest(),'rows':rows},indent=2))
