/* Initialisation and migration only. Outcome records are never rebuilt on routine reload. */
window.GCC8_CAREER_STATE=(()=>{
 const O=window.GCC8_OUTCOMES,P=window.GCC8_PROFILES,copy=x=>JSON.parse(JSON.stringify(x));
 const snapshot=p=>Object.fromEntries([...O.keys,'role','preferredSlot','maxOvers','bowlingUsage','bowlingStyleVerified'].filter(k=>p[k]!=null).map(k=>[k,p[k]]));
 function initialise(state,mode,baselineAt){
  const d=state.dynasty;
  if(!d.careerModel)d.careerModel={version:1,seed:(Number.isFinite(state.weatherSeed)?state.weatherSeed:state.seed)>>>0};
  d.careerStore??={};
  const attach=(p,record)=>{Object.defineProperty(p,'careerOutcome',{value:record.outcome,writable:true,configurable:true,enumerable:false});Object.defineProperty(p,'careerExpected',{value:record.expected,writable:true,configurable:true,enumerable:false});};
  for(const p of state.pool){
   const existing=d.careerStore[p.careerKey||P.lookup(p.name)?.careerKey];if(existing){p.careerKey=existing.outcome.careerKey;attach(p,existing);continue;}
   if(p.careerOutcome){const record={outcome:p.careerOutcome,expected:p.careerExpected};d.careerStore[p.careerKey]=record;attach(p,record);continue;}
   const profile=P.lookup(p.name);if(!profile)throw Error('Missing player profile: '+p.name);
   p.careerKey=profile.careerKey;
   const meta=p.dynastyCareer;if(!meta||meta.exitYear<state.year||p.dynastyRetired)continue;
   const anchorYear=Math.max(mode==='new'?2008:state.year,meta.debutYear),end=Math.min(2026,meta.exitYear);if(anchorYear>end)continue;
   const peakPlayer=copy(p);baselineAt(peakPlayer,meta.peakYear);const peak={bat:peakPlayer.bat,bowl:peakPlayer.bowl};
   const baseline={};for(let year=anchorYear;year<=end;year++){
    const q=copy(p);baselineAt(q,year);q._peakSkills=peak;q._factor=q.overall/Math.max(1,peakPlayer.overall);
    // Old current ratings are authoritative; corrections affect new worlds or future years only.
    const expected=snapshot(P.expectedSkills(profile,year,q));
    baseline[year]=O.packSkills(expected);
   }
   let anchor=mode==='loaded'&&anchorYear===state.year?snapshot(p):O.unpackSkills(baseline[anchorYear]);
   if(mode==='loaded'&&anchorYear===state.year){
    // Correct future templates without rewriting the saved current ability. Bridge
    // any calibration difference over the same four-year development window.
    const correctedAnchor=O.unpackSkills(baseline[anchorYear]),finish=Math.min(end,anchorYear+4);
    for(let y=anchorYear+1;y<=end;y++){const q=O.unpackSkills(baseline[y]),weight=1-O.smoothstep((y-anchorYear)/Math.max(1,finish-anchorYear));for(const k of O.keys)q[k]=Math.max(1,Math.min(99,Math.round(q[k]+(anchor[k]-correctedAnchor[k])*weight)));baseline[y]=O.packSkills(q);}
   }
   baseline[anchorYear]=O.packSkills(anchor);
   p.careerExpected={anchorYear,baselineByYear:copy(baseline),primaryFamily:profile.primaryFamily};
   p.careerOutcome=O.create(profile,d.careerModel.seed,anchorYear,anchor,baseline);
   if(!O.validate(p.careerOutcome))throw Error('Invalid initial career: '+p.name);
   const record={outcome:p.careerOutcome,expected:p.careerExpected};d.careerStore[p.careerKey]=record;attach(p,record);
  }
 }
 function applyYear(p,year){if(!p.careerOutcome)return;Object.assign(p,O.skillsAt(p.careerOutcome,year));p.careerAnchor=p.overall;}
 function validRecord(record,p){return O.validate(record)&&record.careerKey===p.careerKey&&P.lookup(p.name)?.careerKey===record.careerKey;}
 return {initialise,applyYear,validRecord,snapshot};
})();
