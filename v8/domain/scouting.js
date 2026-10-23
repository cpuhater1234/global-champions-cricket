/* Recruitment consumes estimates and observed permanent ability, never a realised future. */
window.GCC8_SCOUTING=(()=>{
 const O=window.GCC8_OUTCOMES,P=window.GCC8_PROFILES,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const composite=p=>window.GCC_RATINGS.roleFit({...p,form:0});
 function publicView(p,year){
  const profile=P.lookup(p.careerKey||p.name),meta=p.careerExpected,raw=meta?.baselineByYear||{},age=year-Number(p.birthYear||1990),anchorYear=meta?.anchorYear??2008,currentSkills=Object.fromEntries(O.keys.map(k=>[k,Number(p[k]||1)]));Object.assign(currentSkills,{role:p.role,form:0});
  const prior=window.GCC_PLAYER_PROJECTIONS_2008?.[p.name],peak=Number(profile?.expectedPeak||prior?.dynasty||p.overall||65),pkYear=Number(profile?.expectedPeakYear||2008+Number(prior?.arrivalYears||0)||year);
  const publicExpectedByYear={},snapshots=Object.keys(raw).map(Number).sort((a,b)=>a-b),last=snapshots.at(-1),first=snapshots[0];
  for(let y=anchorYear;y<=2026;y++){const known=O.unpackSkills(raw[y]);if(known)publicExpectedByYear[y]={overall:known.overall,composite:composite(known)};else if(last&&y>last){const tail=O.unpackSkills(raw[last]),factor=Math.pow(.975,y-last);publicExpectedByYear[y]={overall:tail.overall*factor,composite:composite(tail)*factor};}else{const base=O.unpackSkills(raw[first])||currentSkills,t=clamp((y-anchorYear)/Math.max(1,pkYear-anchorYear),0,1),v=y<=pkYear?base.overall+(peak-base.overall)*t:peak*Math.pow(.98,y-pkYear);publicExpectedByYear[y]={overall:v,composite:composite(base)+(v-base.overall)};}}
  const expected=publicExpectedByYear[year]||{overall:p.overall,composite:composite(currentSkills)};
  return {careerKey:profile?.careerKey||p.name,year,currentSkills,currentOverall:Number(p.overall||65),age,role:p.role,publicExpectedByYear,confidence:!/provisional/.test(p.ratingAuditStatus||'')&&Math.max(0,...Object.values(p.ratingCoreConfidence||{}).map(Number))>=.25?'MEDIUM':'LOW',anchorYear,anchorExpectedComposite:publicExpectedByYear[anchorYear]?.composite||expected.composite,currentExpectedComposite:expected.composite};
 }
 function estimateAt(v,year){const prior=v.publicExpectedByYear[year]?.overall??v.currentOverall,weight=clamp((v.year-v.anchorYear)*.25,0,.75),residual=composite(v.currentSkills)-v.currentExpectedComposite;return clamp(prior+residual*weight,1,99);}
 function value(v){const endAge=v.role==='BOWL'||v.role==='AR'?36:v.role==='WK-BAT'?37:38,end=Math.min(2026,v.year+Math.max(0,endAge-v.age)),scores=[];for(let y=v.year;y<=end;y++)scores.push(y===v.year?v.currentOverall:estimateAt(v,y));const useful=scores.slice(0,6),den=useful.reduce((n,_,i)=>n+Math.pow(.86,i),0),weighted=useful.reduce((n,x,i)=>n+x*Math.pow(.86,i),0)/den,best=Math.max(...scores.map((_,i)=>{const w=scores.slice(i,i+5);return w.reduce((a,b)=>a+b,0)/w.length;}));return clamp(weighted*.65+best*.35+Math.min(5,(scores.length-1)*.65),1,99);}
 function outlook(v){const future=value(v),upside=future-v.currentOverall,label=v.age>=34?'Proven quality · shorter runway':v.age<=25&&upside>=4?'High upside · still developing':v.age<=28?'Developing · earning his place':v.age<=32?'Established · prime years':'Experienced · watch the workload';return {label,detail:'An estimate from current ability, age and expected development. Future performance remains uncertain.',confidence:v.confidence};}
 return {publicView,estimateAt,value,outlook};
})();

