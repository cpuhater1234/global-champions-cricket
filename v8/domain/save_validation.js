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
 const club=c=>record(c)&&clubs.includes(c.abbr),match=r=>record(r)&&club(r.home)&&club(r.away);
 if(!Array.isArray(s.fullSchedule)||![0,14].includes(s.fullSchedule.length)||s.fullSchedule.some(round=>!Array.isArray(round)||round.length!==4||round.some(f=>!match(f))))return false;
 if(!Array.isArray(s.results)||s.results.some(r=>!match(r)||!club(r.winner)||!record(r.homeInnings)||!record(r.awayInnings)||!record(r.scorecard)||!Array.isArray(r.scorecard.innings)))return false;
 if(s.fullSchedule.length&&clubs.some(c=>!record(s.table[c])||['p','w','l','pts','nrr','runsFor','runsAgainst','ballsFor','ballsAgainst'].some(k=>!Number.isFinite(s.table[c][k]))))return false;
 if(s.dynasty){
  const d=s.dynasty;if(!record(d)||!Array.isArray(d.history)||!Array.isArray(d.transactions)||!record(d.manager)||!record(d.injuries)||!record(d.replacementFor)||!record(d.replacementOf))return false;
  const r=d.v8Reveal;if(r&&(!record(r)||!['league','draft','annual'].includes(r.kind)||!Number.isInteger(r.count)||r.count<0||r.count>8||!Number.isInteger(r.speedIndex)||r.speedIndex<0||r.speedIndex>2||typeof r.running!=='boolean'))return false;
  const o=d.offseason;if(o&&(!record(o)||!['market','lottery','draft','cuts','ready'].includes(o.phase)||['retirements','arrivals','lottery','picks','voluntaryCuts','finalCuts'].some(k=>!Array.isArray(o[k]))||!Number.isInteger(o.pickCursor)||o.pickCursor<0))return false;
 }
 return true;
}
