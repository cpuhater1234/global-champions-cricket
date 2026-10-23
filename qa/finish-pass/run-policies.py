import os,subprocess,json,time,hashlib
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
root=Path('qa/finish-pass');build=os.environ.get('GCC8_TEST_BUILD','qa/finish-pass/candidate.html');sha=hashlib.sha256(Path(build).read_bytes()).hexdigest()
def run(i):
 seed=8501+i;existing=root/f'policies-{seed}.json'
 if existing.exists():
  try:
   prior=json.loads(existing.read_text())
   if prior.get('artifactSha256')==sha and len(prior.get('runs',[]))==4:
    print(json.dumps({'seed':seed,'status':'reused complete exact-hash evidence'}),flush=True);return 0
  except (ValueError,OSError):pass
 env={**os.environ,'GCC8_TEST_BUILD':build,'GCC8_POLICY_FIRST':str(seed),'GCC8_POLICY_LAST':str(seed),'GCC8_POLICY_CLUB':str(i),'GCC8_POLICY_REPORT':str(root/f'policies-{seed}.json')}
 start=time.monotonic()
 with (root/f'policies-{seed}.log').open('w') as log:r=subprocess.run(['node',str(root/'policy-run.mjs')],stdout=log,stderr=subprocess.STDOUT,env=env)
 print(json.dumps({'seed':seed,'clubIndex':i,'exit':r.returncode,'seconds':round(time.monotonic()-start)}),flush=True)
 return r.returncode
with ThreadPoolExecutor(max_workers=int(os.environ.get('GCC8_POLICY_WORKERS','2'))) as pool:codes=list(pool.map(run,range(8)))
raise SystemExit(any(codes))
