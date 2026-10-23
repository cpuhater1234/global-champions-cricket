from pathlib import Path
import subprocess,os,json,time,hashlib
root=Path('qa/audit-20261023');paths=['qa/menu-dismissal/browser.cjs','qa/selection-workspace/browser.cjs','qa/draft-interaction/browser.cjs','qa/match-career/native.cjs','qa/completion/native-offseason.cjs','qa/release-20261021/save-warning.cjs','qa/club-guide-dismiss/browser.cjs','qa/recruitment-polish/browser.cjs','qa/palette-balance/browser.cjs','qa/universal-containment/entry.cjs','qa/universal-containment/modals.cjs','qa/universal-containment/later.cjs','qa/universal-containment/offseason.cjs','qa/home-continue/browser.cjs','qa/club-identity/browser.cjs','qa/solid-game/browser.cjs','qa/reference-watermarks/browser.cjs','qa/draw-motion/browser.cjs','qa/drawing-label/browser.cjs']
rows=[]
for test in paths:
 start=time.monotonic()
 try:
  r=subprocess.run(['node',test],capture_output=True,text=True,timeout=360);code=r.returncode;out=r.stdout+r.stderr
 except subprocess.TimeoutExpired as e:code=124;out=str(e)
 row={'test':test,'exitCode':code,'seconds':round(time.monotonic()-start,2),'log':str(root/('browser-'+test.replace('/','-')+'.log'))};Path(row['log']).write_text(out);rows.append(row);(root/'browser-results.json').write_text(json.dumps({'hash':hashlib.sha256(Path('game/gcc_v8_product_candidate.html').read_bytes()).hexdigest(),'rows':rows},indent=2));print(json.dumps(row),flush=True)
print('Browser suites complete',len(rows),'failed',sum(r['exitCode']!=0 for r in rows),flush=True)

raise SystemExit(any(r["exitCode"] for r in rows))
