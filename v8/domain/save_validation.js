// Validate persisted career structure before touching live state. Optional dynasty
// additions can still be initialised by the legacy migration after this check.
function validSave(save){
 const s=save?.state,record=x=>!!x&&typeof x==='object'&&!Array.isArray(x),unique=a=>new Set(a).size===a.length;
 if(!record(s)||!Number.isInteger(s.year)||s.year<2008||s.year>END_YEAR||!Number.isFinite(s.seed)||!Array.isArray(s.pool)||!s.pool.length||!Array.isArray(s.league)||s.league.length!==8||!record(s.teams)||!record(s.table)||!record(s.playerSeasonStats)||!Number.isInteger(s.round)||s.round<0||s.round>14)return false;
 if(s.pool.some(p=>!record(p)||!Number.isInteger(p.id)||typeof p.name!=='string'||typeof p.role!=='string')||!unique(s.pool.map(p=>p.id)))return false;
 if(s.dynasty?.careerModel!=null){const m=s.dynasty.careerModel;if(m.version!==1||!Number.isInteger(m.seed)||m.seed<0||m.seed>4294967295)return false;}
 if(s.pool.some(p=>p.careerOutcome!=null&&(!window.GCC8_CAREER_STATE.validRecord(p.careerOutcome,p)||!p.careerExpected||!window.GCC8_OUTCOMES.validate({...p.careerOutcome,baselineByYear:p.careerExpected.baselineByYear}))))return false;
 if(s.dynasty?.careerStore!=null){const store=s.dynasty.careerStore;if(!record(store))return false;const keys=Object.keys(store);for(const key of keys){const r=store[key],p=s.pool.find(p=>p.careerKey===key);if(!p||!record(r)||!window.GCC8_CAREER_STATE.validRecord(r.outcome,p)||!r.expected||r.expected.anchorYear!==r.outcome.anchorYear||!window.GCC8_OUTCOMES.validate({...r.outcome,baselineByYear:r.expected.baselineByYear}))return false;}for(const p of s.pool){if(!p.dynastyRetired&&(p.dynastyCareer?.exitYear??2026)>=s.year&&!store[p.careerKey])return false;}}
 const ids=new Set(s.pool.map(p=>p.id)),clubs=s.league.map(c=>c?.abbr);
 if(!unique(clubs)||clubs.some(c=>typeof c!=='string')||s.league.some(c=>!record(c)||typeof c.name!=='string')||s.userClub&&!clubs.includes(s.userClub.abbr))return false;
 const preDraft=s.year===2008&&Array.isArray(s.draftOrder)&&!s.draftOrder.length&&Object.keys(s.teams).length===0;
 if(!preDraft&&clubs.some(c=>!Array.isArray(s.teams[c])||s.teams[c].some(id=>!ids.has(id))))return false;
 const roster=clubs.flatMap(c=>s.teams[c]||[]);if(!unique(roster))return false;
 for(const a of [s.xi,s.battingOrder])if(!Array.isArray(a)||a.length>11||!unique(a)||a.some(id=>!s.userClub||!s.teams[s.userClub.abbr].includes(id)))return false;
 if(s.xi.length!==s.battingOrder.length||s.battingOrder.some(id=>!s.xi.includes(id)))return false;
 const club=c=>record(c)&&clubs.includes(c.abbr),match=r=>record(r)&&club(r.home)&&club(r.away)&&r.home.abbr!==r.away.abbr;
 const countKeys=['matches','innings','runs','balls','outs','fours','sixes','wickets','bowlBalls','runsConceded','bestRuns','bestWickets','bestBowlingRuns'];
 if(Object.values(s.playerSeasonStats).some(t=>!record(t)||countKeys.some(k=>t[k]!=null&&(!Number.isFinite(t[k])||t[k]<0))))return false;
 const superOverValid=r=>{
  const over=r?.superOver;if(over==null)return true; // Existing careers retain old tied-match results.
  if(!match(r)||r.tieBreak!==true||r.homeInnings?.total!==r.awayInnings?.total||!record(over)||!club(over.winner)||over.winner.abbr!==r.winner?.abbr||!Array.isArray(over.rounds)||!over.rounds.length)return false;
  const pair=[r.home.abbr,r.away.abbr];
  for(let n=0;n<over.rounds.length;n++){
   const round=over.rounds[n];if(!record(round)||!Array.isArray(round.innings)||round.innings.length!==2)return false;
   if(!unique(round.innings.map(i=>i.club?.abbr)))return false;
   for(const i of round.innings){
    if(!record(i)||!club(i.club)||!pair.includes(i.club.abbr)||!Number.isInteger(i.total)||i.total<0||i.total>36||!Number.isInteger(i.wickets)||i.wickets<0||i.wickets>2||!Number.isInteger(i.balls)||i.balls<1||i.balls>6||!record(i.bowler)||!ids.has(i.bowler.id)||typeof i.bowler.name!=='string'||!Array.isArray(i.batters)||i.batters.length!==3||!unique(i.batters.map(b=>b.id))||i.batters.some(b=>!record(b)||!ids.has(b.id)||typeof b.name!=='string'||!Number.isInteger(b.runs)||b.runs<0||!Number.isInteger(b.balls)||b.balls<0||typeof b.out!=='boolean')||!Array.isArray(i.deliveries)||i.deliveries.length!==i.balls)return false;
    if(i.deliveries.some((d,index)=>!record(d)||d.ball!==index+1||!i.batters.some(b=>b.id===d.batterId)||![0,1,2,3,4,6].includes(d.runs)||typeof d.wicket!=='boolean'||d.wicket&&d.runs!==0))return false;
    if(i.deliveries.reduce((a,d)=>a+d.runs,0)!==i.total||i.deliveries.filter(d=>d.wicket).length!==i.wickets)return false;
    if(i.batters.some(b=>b.runs!==i.deliveries.filter(d=>d.batterId===b.id).reduce((a,d)=>a+d.runs,0)||b.balls!==i.deliveries.filter(d=>d.batterId===b.id).length||b.out!==i.deliveries.some(d=>d.batterId===b.id&&d.wicket)))return false;
    let striker=0,nonStriker=1,outs=0;for(const d of i.deliveries){if(outs>=2||d.batterId!==i.batters[striker].id)return false;if(d.wicket){outs++;if(outs===1)striker=2;}else if(d.runs%2)[striker,nonStriker]=[nonStriker,striker];}
   }
   const [a,b]=round.innings;if(a.balls<6&&a.wickets<2||b.total<=a.total&&b.balls<6&&b.wickets<2)return false;
   let chase=0;for(const d of b.deliveries){if(chase>a.total)return false;chase+=d.runs;}
   if(n<over.rounds.length-1&&a.total!==b.total||n===over.rounds.length-1&&(a.total===b.total||(a.total>b.total?a:b).club.abbr!==over.winner.abbr))return false;
  }
  return true;
 };
 if(!Array.isArray(s.fullSchedule)||![0,14].includes(s.fullSchedule.length)||s.fullSchedule.some(round=>!Array.isArray(round)||round.length!==4||round.some(f=>!match(f))))return false;
 if(!Array.isArray(s.results)||s.results.some(r=>!match(r)||!club(r.winner)||!record(r.homeInnings)||!record(r.awayInnings)||!record(r.scorecard)||!Array.isArray(r.scorecard.innings)||!superOverValid(r)))return false;
 if(s.finals&&[...(s.finals.semis||[]),s.finals.gf].filter(Boolean).some(r=>!superOverValid(r)))return false;
 if(s.fullSchedule.length&&clubs.some(c=>{const t=s.table[c];return !record(t)||!Number.isFinite(t.nrr)||['p','w','l','pts','runsFor','runsAgainst','ballsFor','ballsAgainst'].some(k=>!Number.isInteger(t[k])||t[k]<0)||t.p>14||t.w>14||t.l>14||t.pts>28||t.p!==t.w+t.l||t.pts!==2*t.w;}))return false;
 if(s.dynasty){
  const d=s.dynasty;if(!record(d)||!Array.isArray(d.history)||!Array.isArray(d.transactions)||!record(d.manager)||!record(d.injuries)||!record(d.replacementFor)||!record(d.replacementOf))return false;
  if(d.developmentByYear!=null){if(!record(d.developmentByYear))return false;for(const [year,rows]of Object.entries(d.developmentByYear)){if(!Number.isInteger(Number(year))||Number(year)<2009||Number(year)>2026||!Array.isArray(rows)||rows.some(r=>!record(r)||r.year!==Number(year)||!ids.has(r.playerId)||typeof r.name!=='string'||!Number.isFinite(r.fromOverall)||!Number.isFinite(r.toOverall)||r.delta!==r.toOverall-r.fromOverall||Math.abs(r.delta)>98)||!unique(rows.map(r=>r.playerId)))return false;}}
  for(const key of ['tradeDealsByYear','departureBudgetsByYear'])if(d[key]!=null){
    if(!record(d[key]))return false;
    for(const [year,rows]of Object.entries(d[key])){
      if(!Number.isInteger(Number(year))||Number(year)<2008||Number(year)>2026||!record(rows))return false;
      for(const [abbr,v]of Object.entries(rows)){
        if(!clubs.includes(abbr))return false;
        if(key==='tradeDealsByYear'){if(!Number.isInteger(v)||v<0||v>120)return false;}
        else if(!record(v)||['retired','cuts','traded'].some(k=>!Number.isInteger(v[k])||v[k]<0||v[k]>120))return false;
      }
    }
  }
  const r=d.v8Reveal;if(r&&(!record(r)||!['league','draft','annual'].includes(r.kind)||!Number.isInteger(r.count)||r.count<0||r.count>8||!Number.isInteger(r.speedIndex)||r.speedIndex<0||r.speedIndex>2||typeof r.running!=='boolean'))return false;
  const m=d.v8Match;if(m&&(!record(m)||!Number.isInteger(m.count)||m.count<0||m.count>(m.presentationVersion===2?9:5)||!Number.isInteger(m.speedIndex)||m.speedIndex<0||m.speedIndex>2||typeof m.running!=='boolean'||!['result','finals'].includes(m.returnView)||!record(m.reference)||!['regular','semis','gf'].includes(m.reference.type)))return false;
  if(m?.presentationVersion!=null&&m.presentationVersion!==2)return false;
  if(m?.presentationVersion===2){const ref=m.reference,r=ref.type==='regular'?s.results.find(x=>x.round===ref.round):ref.type==='gf'?s.finals?.gf:s.finals?.semis?.[ref.index];if(!r||m.count>(r.superOver?9:8))return false;}

  const o=d.offseason;if(o?.returningIds&&(!Array.isArray(o.returningIds)||!unique(o.returningIds)||o.returningIds.some(id=>!Number.isInteger(id)||!ids.has(id))))return false;
  if(o&&(!record(o)||!['market','lottery','draft','cuts','ready'].includes(o.phase)||['retirements','arrivals','lottery','picks','voluntaryCuts','finalCuts'].some(k=>!Array.isArray(o[k]))||!Number.isInteger(o.pickCursor)||o.pickCursor<0))return false;
  // Validate draft administration before it can replace the live career or save.
  if(o){
    if(!record(o.pickOwners)||![0,clubs.length].includes(o.lottery.length)||!unique(o.lottery)||o.lottery.some(a=>!clubs.includes(a))||o.pickCursor>256)return false;
    if(Object.entries(o.pickOwners).some(([key,owner])=>{const parts=key.split(':');return parts.length!==2||!/^R[1-4]$/.test(parts[0])||!clubs.includes(parts[1])||!clubs.includes(owner);} ))return false;
    if(o.retirements.some(r=>!record(r)||!Number.isInteger(r.id)||!ids.has(r.id)||!clubs.includes(r.owner)))return false;
    if([...o.arrivals,...o.voluntaryCuts,...o.finalCuts].some(id=>!Number.isInteger(id)||!ids.has(id)))return false;
    for(const key of ['draftNeeds','preDraftCounts','ordinaryPickCounts'])if(o[key]!=null){
      const values=o[key],max=key==='ordinaryPickCounts'?4:15;
      if(!record(values)||Object.keys(values).length!==clubs.length||clubs.some(a=>!Number.isInteger(values[a])||values[a]<0||values[a]>max))return false;
    }
    if(o.picks.some(p=>!record(p)||!Number.isInteger(p.slot)||p.slot<1||p.slot>256||!Number.isInteger(p.round)||p.round<1||p.round>32||!clubs.includes(p.owner)||p.playerId!==null&&(!Number.isInteger(p.playerId)||!ids.has(p.playerId))))return false;
  }
  if(o?.releasePickPolicy!=null&&o.releasePickPolicy!==1)return false;
  if(o?.ordinaryPickCounts!=null&&(!record(o.ordinaryPickCounts)||Object.entries(o.ordinaryPickCounts).some(([a,n])=>!clubs.includes(a)||!Number.isInteger(n)||n<0||n>4)))return false;
  if(o?.supplementSnakePolicy!=null&&o.supplementSnakePolicy!==1)return false;
  if(o?.netTradeDepartures!=null&&(!record(o.netTradeDepartures)||Object.entries(o.netTradeDepartures).some(([a,n])=>!clubs.includes(a)||!Number.isInteger(n)||Math.abs(n)>120)))return false;
  if(o?.tradeDepartures!=null&&(!record(o.tradeDepartures)||Object.entries(o.tradeDepartures).some(([a,n])=>!clubs.includes(a)||!Number.isInteger(n)||n<0||n>120)))return false;
  if(o?.cpuReleases!=null){const moves=o.cpuReleases;if(!record(moves))return false;const released=[];for(const [abbr,cutIds] of Object.entries(moves)){if(!clubs.includes(abbr)||abbr===s.userClub?.abbr||!Array.isArray(cutIds)||cutIds.length>Math.min(2,Math.max(0,4-o.retirements.filter(r=>r.owner===abbr).length))||cutIds.some(id=>!Number.isInteger(id)||!ids.has(id)))return false;released.push(...cutIds);}if(!unique(released))return false;}
 }
 return true;
}


