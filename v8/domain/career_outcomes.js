/* Private saved career realisations. No shared match/recruitment RNG, no annual rerolls. */
window.GCC8_OUTCOMES=(()=>{
 const groups={batting:['bat','power','control','pacePlay','spinPlay','finishing'],bowling:['bowl','newBall','death','bowlControl','variation','spin','pace'],movement:['running','fielding'],keeping:['keeping'],mental:['temperament','leadership']};
 const keys=[...Object.values(groups).flat(),'overall'],clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),copy=x=>JSON.parse(JSON.stringify(x));
 function draw(seed,key,name){const str=[1,seed>>>0,key,name].map(x=>`${String(x).length}:${x}`).join('|');let h=2166136261>>>0;const bytes=encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,(_,hex)=>String.fromCharCode(parseInt(hex,16)));for(let i=0;i<bytes.length;i++){h^=bytes.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}if(!h)h=0x9e3779b9;h^=h<<13;h^=h>>>17;h^=h<<5;return (h>>>0)/4294967296;}
 const triangular=u=>u<.5?Math.sqrt(2*u)-1:1-Math.sqrt(2*(1-u));
 const componentAt=u=>u<.94?'typical':u<.96?'moderate':u<.97?'severe':'breakout';
 const smoothstep=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
 function create(profile,seed,anchorYear,anchorSkills,baselineByYear,overallMethod=null){
  const r=n=>draw(seed,profile.careerKey,n),component=componentAt(r('component')),u=r('amplitude'),amplitude=component==='typical'?triangular(u)*4:component==='moderate'?-14+u*6:component==='severe'?-28+u*8:8+u*8;
  const balanced=profile.primaryFamily==='balanced',ar=anchorSkills.role==='AR',familyOffsets={};
  for(const f of ['batting','bowling'])familyOffsets[f]=balanced?amplitude+triangular(r(f+'-jitter'))*2:profile.primaryFamily===f?amplitude:ar?amplitude*.5+triangular(r(f+'-jitter'))*2:0;
  for(const f of ['movement','keeping','mental'])familyOffsets[f]=amplitude*.25+triangular(r(f+'-jitter'));
  const t=r('timing');return {...(overallMethod?{overallMethod}:{}),version:1,careerKey:profile.careerKey,anchorYear,anchorSkills:copy(anchorSkills),baselineByYear:copy(baselineByYear),component,familyOffsets,timingOffset:t<.2?-1:t<.8?0:1};
 }
 const metadata=['role','preferredSlot','maxOvers','bowlingUsage','bowlingStyleVerified'];
 function packSkills(p){return [...keys,...metadata].map(k=>p[k]??null);}
 function unpackSkills(p){return Array.isArray(p)?Object.fromEntries([...keys,...metadata].map((k,i)=>[k,p[i]])):p;}
 // Overall is strongest specialist-equivalent ability; secondary skills cannot penalise an all-rounder.
 function overall(p){const rate=role=>window.GCC_RATINGS.roleFit({...p,role,form:0});return clamp(Math.round(p.role==='AR'?Math.max(rate('AR'),rate('BAT'),rate('BOWL')):rate(p.role)),1,99);}
 function skillsAt(o,year){
  if(year<=o.anchorYear)return copy(o.anchorSkills);
  const years=Object.keys(o.baselineByYear).map(Number).sort((a,b)=>a-b),end=years.at(-1),base=unpackSkills(o.baselineByYear[year]);if(!base)return copy(o.anchorSkills);
  const p=copy(base),last=Math.min(end,o.anchorYear+4),ramp=last>o.anchorYear?smoothstep((year-o.anchorYear)/(last-o.anchorYear)):0;
  const shifted=unpackSkills(o.baselineByYear[clamp(year-o.timingOffset,years[0],end)])||base;
  for(const [family,fields]of Object.entries(groups))for(const k of fields){const n=Number(base[k]);if(!Number.isFinite(n))continue;const offset=Number(o.familyOffsets[family]||0);p[k]=clamp(Math.round(n+ramp*(offset+Number(shifted[k]??n)-n)),1,99);}
  const rate=x=>window.GCC_RATINGS.roleFit({...x,form:0});p.overall=clamp(Math.round(o.overallMethod==='skill-overall-v1'?overall(p):o.overallMethod==='role-fit-v1'?rate(p):base.overall+rate(p)-rate(base)),1,99);p.careerAnchor=p.overall;return p;
 }
 function validSkills(p){return p&&keys.every(k=>Number.isFinite(p[k])&&p[k]>=1&&p[k]<=99)&&['BAT','WK-BAT','AR','BOWL'].includes(p.role)&&Number.isInteger(p.preferredSlot)&&p.preferredSlot>=1&&p.preferredSlot<=11&&Number.isFinite(p.maxOvers)&&p.maxOvers>=0&&p.maxOvers<=4&&(p.bowlingUsage==null||Number.isFinite(p.bowlingUsage)&&p.bowlingUsage>=0&&p.bowlingUsage<=4)&&(p.bowlingStyleVerified==null||['PACE','SPIN','DUAL'].includes(p.bowlingStyleVerified));}
 function validate(o){if(!o||o.overallMethod!=null&&!['role-fit-v1','skill-overall-v1'].includes(o.overallMethod)||o.version!==1||typeof o.careerKey!=='string'||!Number.isInteger(o.anchorYear)||o.anchorYear<2008||o.anchorYear>2026||!validSkills(o.anchorSkills)||!['typical','moderate','severe','breakout'].includes(o.component)||![-1,0,1].includes(o.timingOffset))return false;if(!o.familyOffsets||Object.keys(groups).some(f=>!Number.isFinite(o.familyOffsets[f])||Math.abs(o.familyOffsets[f])>32))return false;const years=Object.keys(o.baselineByYear||{}).map(Number).sort((a,b)=>a-b);return years.length>0&&years[0]===o.anchorYear&&years.every((y,i)=>Number.isInteger(y)&&y<=2026&&y===o.anchorYear+i&&validSkills(unpackSkills(o.baselineByYear[y])));}
 return {modelVersion:1,overall,create,skillsAt,validate,draw,componentAt,smoothstep,keys,groups,packSkills,unpackSkills};
})();

