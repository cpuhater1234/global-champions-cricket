/* Cross-era game calibration for NEW arrival records only. These are model estimates,
   not historical measurements. The strongest 143 foundation careers average about88
   at peak; the authored arrival cohort averaged92. Preserve rank and exceptional99s. */
window.GCC8_ARRIVAL_CALIBRATION=(()=>{
 function peak(value){const p=Number(value);if(!Number.isFinite(p)||p<1||p>99)throw Error('Invalid authored arrival peak');return Math.max(1,Math.round(p<=95?p-4:91+(p-95)*2));}
 function meta(m){if(m.calibrationVersion===1)return {...m};return {...m,authoredPeak:m.peak,peak:peak(m.peak),calibrationVersion:1};}
 function profile(profile,p){const m=p.dynastyCareer;if(m?.calibrationVersion!==1||!m.authoredPeak)return profile;const ratio=m.peak/m.authoredPeak;return {...profile,peakSkills:Object.fromEntries(Object.entries(profile.peakSkills||{}).map(([key,value])=>[key,Math.max(1,Math.min(99,Math.round(value*ratio)))]))};}
 return {version:1,peak,meta,profile};
})();
