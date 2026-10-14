// Validate persisted career structure before touching live state. Optional dynasty
// additions can still be initialised by the legacy migration after this check.
function validSave(save){
 const s=save?.state,record=x=>!!x&&typeof x==='object'&&!Array.isArray(x),unique=a=>new Set(a).size===a.length;
 if(!record(s)||!Number.isInteger(s.year)||s.year<2008||s.year>END_YEAR||!Number.isFinite(s.seed)||!Array.isArray(s.pool)||!s.pool.length||!Array.isArray(s.league)||s.league.length!==8||!record(s.teams)||!record(s.table)||!record(s.playerSeasonStats)||!Number.isInteger(s.round)||s.round<0||s.round>14)return false;
 if(s.pool.some(p=>!record(p)||!Number.isInteger(p.id)||typeof p.name!=='string'||typeof p.role!=='string')||!unique(s.pool.map(p=>p.id)))return false;
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
 if(s.fullSchedule.length&&clubs.some(c=>!record(s.table[c])||['p','w','l','pts','nrr','runsFor','runsAgainst','ballsFor','ballsAgainst'].some(k=>!Number.isFinite(s.table[c][k]))))return false;
 if(s.dynasty){
  const d=s.dynasty;if(!record(d)||!Array.isArray(d.history)||!Array.isArray(d.transactions)||!record(d.manager)||!record(d.injuries)||!record(d.replacementFor)||!record(d.replacementOf))return false;
  const r=d.v8Reveal;if(r&&(!record(r)||!['league','draft','annual'].includes(r.kind)||!Number.isInteger(r.count)||r.count<0||r.count>8||!Number.isInteger(r.speedIndex)||r.speedIndex<0||r.speedIndex>2||typeof r.running!=='boolean'))return false;
  const m=d.v8Match;if(m&&(!record(m)||!Number.isInteger(m.count)||m.count<0||m.count>(m.presentationVersion===2?9:5)||!Number.isInteger(m.speedIndex)||m.speedIndex<0||m.speedIndex>2||typeof m.running!=='boolean'||!['result','finals'].includes(m.returnView)||!record(m.reference)||!['regular','semis','gf'].includes(m.reference.type)))return false;
  if(m?.presentationVersion!=null&&m.presentationVersion!==2)return false;
  if(m?.presentationVersion===2){const ref=m.reference,r=ref.type==='regular'?s.results.find(x=>x.round===ref.round):ref.type==='gf'?s.finals?.gf:s.finals?.semis?.[ref.index];if(!r||m.count>(r.superOver?9:8))return false;}
  const o=d.offseason;if(o?.returningIds&&(!Array.isArray(o.returningIds)||!unique(o.returningIds)||o.returningIds.some(id=>!Number.isInteger(id)||!ids.has(id))))return false;
  if(o&&(!record(o)||!['market','lottery','draft','cuts','ready'].includes(o.phase)||['retirements','arrivals','lottery','picks','voluntaryCuts','finalCuts'].some(k=>!Array.isArray(o[k]))||!Number.isInteger(o.pickCursor)||o.pickCursor<0))return false;
 }
 return true;
}
