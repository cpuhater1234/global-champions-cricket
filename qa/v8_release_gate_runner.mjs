import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const build=process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_career_variation.html';
const manifest='qa/preplay-20261016/suites.json';
const output=process.env.GCC8_RELEASE_REPORT_DIR||'qa/release-gate-current';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const required=[build,manifest,'qa/v8_preplay_controls_test.mjs','qa/v8_clock_pause_regression.mjs','qa/v8_delivery_boundary_regression.mjs'];
const missing=required.filter(x=>!fs.existsSync(x));
if(missing.length){console.error('BLOCKED: missing inputs\n'+missing.join('\n'));process.exit(2);}
const history=JSON.parse(fs.readFileSync(manifest,'utf8'));
if(!Array.isArray(history)||history.length!==29||history.some(x=>!/^qa\/[\w./-]+\.mjs$/.test(x.script))){console.error('BLOCKED: unexpected historical manifest');process.exit(2);}
const scripts=[...history.map(x=>x.script),'qa/v8_preplay_controls_test.mjs','qa/v8_clock_pause_regression.mjs','qa/v8_delivery_boundary_regression.mjs'];
if(scripts.length!==32||new Set(scripts).size!==32||scripts.some(x=>!fs.existsSync(x))){console.error('BLOCKED: missing or duplicate suites');process.exit(2);}
fs.mkdirSync(output,{recursive:true});
const results=[];
for(let i=0;i<scripts.length;i++){
 const script=scripts[i],started=Date.now();
 const run=spawnSync(process.execPath,[script],{env:{...process.env,GCC8_TEST_BUILD:build,GCC8_PREPLAY_REPORT_DIR:path.join(output,'controls')},encoding:'utf8',timeout:600000,maxBuffer:40*1024*1024});
 const log=(run.stdout||'')+'\n--- stderr ---\n'+(run.stderr||'');
 const logPath=path.join(output,String(i+1).padStart(2,'0')+'-'+path.basename(script)+'.log');
 fs.writeFileSync(logPath,log);
 const pass=run.status===0&&!run.error;
 results.push({script,pass,exit:run.status,signal:run.signal,error:run.error?.message||null,elapsedMs:Date.now()-started,logSha256:hash(log),logPath});
 console.log((pass?'PASS ':'FAIL ')+script);
}
const report={generatedAt:new Date().toISOString(),candidate:build,artifactSha256:hash(fs.readFileSync(build)),suites:32,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,nativeVisualQA:'NOT VERIFIED',fullCareerQA:'NOT INCLUDED',results};
fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({artifactSha256:report.artifactSha256,passed:report.passed,failed:report.failed,report:path.join(output,'report.json')}));
if(report.failed)process.exit(1);