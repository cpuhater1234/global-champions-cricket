import fs from 'node:fs';
const module=`window.GCC8_ARRIVAL_CALIBRATION=(()=>{
 // Cross-era model estimates, not measured historical statistics. Preserve rank and exceptional peaks.
 function peak(value){const p=Number(value);return Math.round(p<=95?p-4:91+(p-95)*2);}
 function meta(m){return {...m,authoredPeak:m.peak,peak:peak(m.peak),calibrationVersion:1};}
 function profile(profile,p){const m=p.dynastyCareer;if(m?.calibrationVersion!==1||!m.authoredPeak)return profile;const ratio=m.peak/m.authoredPeak;return {...profile,peakSkills:Object.fromEntries(Object.entries(profile.peakSkills||{}).map(([key,value])=>[key,Math.max(1,Math.min(99,Math.round(value*ratio)))]))};}
 return {peak,meta,profile};
})();\n`;
let s=fs.readFileSync(process.env.GCC8_CALIBRATION_BASE||'qa/calibration/baseline-before.html','utf8');
function replace(a,b){if(s.split(a).length!==2)throw Error('Nonunique anchor '+a);s=s.replace(a,b);}
replace('window.GCC8_PROFILES=(()=>{',module+'window.GCC8_PROFILES=(()=>{');
replace('const p=template(m,next++);p.available=m.debutYear<=2008;','const p=template(window.GCC8_ARRIVAL_CALIBRATION.meta(m),next++);p.available=m.debutYear<=2008;');
replace('if(!profile)return p;const original={...p};','if(!profile)return p;profile=window.GCC8_ARRIVAL_CALIBRATION.profile(profile,p);const original={...p};');
fs.writeFileSync('qa/calibration/candidate.html',s);
