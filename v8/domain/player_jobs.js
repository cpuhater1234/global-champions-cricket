/* Broad factual bowling identities. Role weights remain model estimates. */
window.GCC8_PLAYER_JOBS={
 "Andrew Symonds":{style:"DUAL",source:"https://www.cricket.com.au/news/3315880"},
 "Mitchell Marsh":{style:"PACE",source:"https://www.cricket.com.au/players/CA:722"},
 "Daryl Mitchell":{style:"PACE",source:"https://archive.nzc.nz/Players/1069/1069676/1069676.html"},
 "Shane Watson":{style:"PACE",source:"https://www.cricket.com.au/players/CA:2368/shane-watson"},
 "Glenn Maxwell":{style:"SPIN",source:"https://www.cricket.com.au/news/3281770/elevated-maxwell-in-race-to-outstrip-pace"},
 "Liam Livingstone":{style:"SPIN",source:"https://www.ecb.co.uk/news/346917"},
 "Hardik Pandya":{style:"PACE",source:"https://www.icc-cricket.com/rankings/63751/hardik-pandya"}
};
window.GCC8_PLAYER_JOBS['Saim Ayub']={style:'SPIN',source:'https://www.icc-cricket.com/rankings/70241/saim-ayub?appview=true'};
window.GCC8_PLAYER_JOBS['Josh Hazlewood']={style:'PACE',source:'https://www.cricket.com.au/players/CA:1185/josh-hazlewood'};
window.GCC8_JOB_MODEL=(()=>{
 // Game calibration separates batting all-rounders from frontline bowlers.
 const bowlingPeaks={'Mitchell Marsh':74,'Glenn Maxwell':68,'Daryl Mitchell':62,'Liam Livingstone':70,'Abhishek Sharma':66,'Will Jacks':66,'Saim Ayub':68,'Rachin Ravindra':74};
 function prepare(p,year){
  if(p.name==='Josh Hazlewood'&&p.dynastyPeak)p.dynastyPeak.pace=Math.max(p.dynastyPeak.pace||0,(p.dynastyCareer?.peak||92)-2);
  const job=window.GCC8_PLAYER_JOBS[p.name];if(job)p.bowlingStyleVerified=job.style;
  if(p.dynastyPeak&&p.bowlingUsage===0&&['BOWL','AR'].includes(p.role))p.bowlingUsage=p.role==='BOWL'?3.65:2.35;
  if(p.dynastyPeak&&bowlingPeaks[p.name]){const cap=bowlingPeaks[p.name],ratio=Math.min(1,cap/(p.dynastyPeak.bowl||cap));for(const k of ['bowl','newBall','death','bowlControl','variation','spin','pace'])p.dynastyPeak[k]=Math.max(1,Math.round((p.dynastyPeak[k]||1)*ratio));p.bowlingUsage=p.name==='Daryl Mitchell'?.65:1.4;}
  if(p.name==='Steve Smith'&&year>=2013){p.role='BAT';p.preferredSlot=3;p.maxOvers=2;p.bowlingUsage=.5;}
 }
 function finish(p,year){if(p.name==='Steve Smith'&&year>=2013){for(const k of ['bowl','newBall','death','bowlControl','variation','spin','pace']){const n=Number(p.dynastyBase2008?.[k]||p[k]);p[k]=Math.min(p[k],Math.round(n*.72));}}}
 return {prepare,finish,bowlingPeaks};
})();
