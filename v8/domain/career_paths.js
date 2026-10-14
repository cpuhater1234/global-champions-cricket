/* One deterministic career path for development and CPU asset decisions.
   Model peaks are game design inputs, not historical performance measurements. */
window.GCC8_CAREERS=(()=>{
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function foundationCurve(age){return age<=20?.90:age===21?.92:age===22?.94:age===23?.96:age===24?.98:age===25?1:age<=30?1.015:age===31?1:age===32?.985:age===33?.965:age===34?.94:age===35?.915:age===36?.885:age===37?.85:age===38?.815:age===39?.78:.745;}
 function overallAt(p,year){
  const m=p.dynastyCareer;if(!m)return Number(p.overall)||0;
  if(year>m.exitYear)return 0;
  if(p.dynastyBase2008){
   const base=Number(p.dynastyBaseOverall||p.overall),birth=p.birthYear||1980,young=2008-birth<=26;
   const truth=window.GCC_PLAYER_PROJECTIONS_2008?.[p.name];
   const peak=young?Math.max(base,Number(truth?.dynasty)||base):base;
   const peakYear=Math.max(2009,Number(m.peakYear)||2009,2008+Number(truth?.arrivalYears||0));
   if(year<=2008)return base;
   if(young&&peak>base){if(year<=peakYear)return Math.round(base+(peak-base)*clamp((year-2008)/(peakYear-2008),0,1));return Math.round(peak*clamp(foundationCurve(year-birth)/foundationCurve(peakYear-birth),.72,1));}
   return Math.round(base*clamp(foundationCurve(year-birth)/Math.max(.72,foundationCurve(2008-birth)),.72,1.08));
  }
  const debut=m.debutYear,pk=m.peakYear,span=Math.max(1,pk-debut),start=Number.isFinite(m.startFactor)?clamp(m.startFactor,.70,.97):span<=1?.94:span<=3?.90:span<=6?.86:.82;
  let f=year<=debut?start:year<pk?start+(1-start)*(year-debut)/span:1;
  if(year>pk){let decline=0;for(let y=pk+1;y<=year;y++){const age=y-(m.birthYear||p.birthYear||1990);decline+=age<=31?.005:age<=34?.012:age<=36?.020:age<=38?.030:.040;}if(m.exitYear<2026&&m.exitYear>pk)decline+=.05*Math.pow(clamp((year-pk)/(m.exitYear-pk),0,1),1.5);f=clamp(1-decline,.76,1.01);}
  return Math.round((Number(m.peak)||p.overall)*f);
 }
 function value(p,year){const end=Math.min(2026,p.dynastyCareer?.exitYear??year+5),scores=[];for(let y=year;y<=end;y++)scores.push(overallAt(p,y));if(!scores.length)return 0;const useful=scores.slice(0,6);const weighted=useful.reduce((n,v,i)=>n+v*Math.pow(.86,i),0)/useful.reduce((n,_,i)=>n+Math.pow(.86,i),0);const windows=scores.map((_,i)=>{const w=scores.slice(i,i+5);return w.reduce((a,b)=>a+b,0)/w.length;});const bestWindow=Math.max(...windows);return clamp(weighted*.65+bestWindow*.35+Math.min(5,Math.max(0,scores.length-1)*.65),0,99);}
 function applyFoundation(p,year,keys){if(year===2008){for(const k of keys){if(Number.isFinite(p.dynastyBase2008[k]))p[k]=p.dynastyBase2008[k];}p.overall=p.dynastyBaseOverall||p.overall;p.careerAnchor=p.overall;return;}const base=Number(p.dynastyBaseOverall||p.overall),score=overallAt(p,year),ratio=base?score/base:1,age=year-(p.birthYear||1980);for(const k of keys){const n=Number(p.dynastyBase2008[k]||0);if(!n)continue;let r=ratio;if(ratio>1){const batting=['bat','power','control','pacePlay','spinPlay','finishing','temperament'].includes(k),bowling=['bowl','newBall','death','bowlControl','variation','spin','pace'].includes(k);r=(batting&&p.role!=='BOWL'||bowling&&['BOWL','AR'].includes(p.role)||k==='keeping'&&p.role==='WK-BAT')?ratio:Math.min(ratio,1.10);}else{if(['control','temperament','leadership','variation'].includes(k)&&age>=31)r=Math.min(1.06,ratio+.025);if(['pace','power','running'].includes(k)&&age>=32)r=Math.max(.68,ratio-.03);}p[k]=clamp(Math.round(n*r),1,99);}p.overall=clamp(score,1,99);p.careerAnchor=p.overall;}
 return {overallAt,value,applyFoundation};
})();
