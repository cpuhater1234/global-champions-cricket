import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawn} from 'node:child_process';
const build=process.env.GCC8_TEST_BUILD||'game/gcc_v8_stabilised.html',manifest='qa/preplay-20261016/suites.json',output=process.env.GCC8_RELEASE_REPORT_DIR||'qa/release-gate-current';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const missing=[build,manifest,'qa/v8_preplay_controls_test.mjs','qa/v8_clock_pause_regression.mjs','qa/v8_delivery_boundary_regression.mjs'].filter(x=>!fs.existsSync(x));
if(missing.length){console.error('BLOCKED: missing inputs\n'+missing.join('\n'));process.exit(2);}
const history=JSON.parse(fs.readFileSync(manifest,'utf8'));if(!Array.isArray(history)||history.length!==29||history.some(x=>!/^qa\/[\w./-]+\.mjs$/.test(x.script))){console.error('BLOCKED: unexpected historical manifest');process.exit(2);}
const scripts=[...history.map(x=>x.script),'qa/v8_preplay_controls_test.mjs','qa/v8_clock_pause_regression.mjs','qa/v8_delivery_boundary_regression.mjs'];
if(scripts.length!==32||new Set(scripts).size!==32||scripts.some(x=>!fs.existsSync(x))){console.error('BLOCKED: missing or duplicate suites');process.exit(2);}
fs.mkdirSync(output,{recursive:true});const artifactSha256=hash(fs.readFileSync(build)),results=Array(scripts.length),jobs=Math.min(2,Math.max(1,Number(process.env.GCC8_QA_WORKERS)||2));let cursor=0;
async function worker(){while(cursor<scripts.length){const i=cursor++,script=scripts[i],started=Date.now(),logPath=path.join(output,String(i+1).padStart(2,'0')+'-'+path.basename(script)+'.log'),log=fs.createWriteStream(logPath);let error=null,signal=null;
 const scriptSha256=hash(fs.readFileSync(script));
 const child=spawn(process.execPath,[script],{env:{...process.env,GCC8_TEST_BUILD:build,GCC8_PREPLAY_REPORT_DIR:path.join(output,'controls')},stdio:['ignore','pipe','pipe']});child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});
 const timer=setTimeout(()=>{error='Suite timed out after 10 minutes';child.kill('SIGTERM');},600000);
 const exit=await new Promise(resolve=>{child.once('error',e=>{error=e.message;resolve(null)});child.once('close',(code,sig)=>{signal=sig;resolve(code)});});clearTimeout(timer);await new Promise(resolve=>log.end(resolve));
 const pass=exit===0&&!error;results[i]={script,scriptSha256,pass,exit,signal,error,elapsedMs:Date.now()-started,logSha256:hash(fs.readFileSync(logPath)),logPath};console.log((pass?'PASS ':'FAIL ')+script);
}}
await Promise.all(Array.from({length:jobs},worker));
const artifactUnchanged=hash(fs.readFileSync(build))===artifactSha256;
const report={generatedAt:new Date().toISOString(),candidate:build,artifactSha256,artifactUnchanged,suites:32,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,nativeVisualQA:'NOT VERIFIED',fullCareerQA:'NOT INCLUDED',results};
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({artifactSha256,artifactUnchanged,passed:report.passed,failed:report.failed,report:path.join(output,'report.json')}));if(report.failed||!artifactUnchanged)process.exitCode=1;
