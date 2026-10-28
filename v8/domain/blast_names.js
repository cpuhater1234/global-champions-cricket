/* Current T20 identities only: club IDs, conditions and cricket state stay fixed. */
(() => {
 const names=window.GCC8_BLAST_NAMES;
 const rename=club=>{if(club&&typeof club==='object'&&names[club.abbr])club.name=names[club.abbr];};
 window.GCC_DATA.clubs.forEach(rename);
 window.GCC8_applyClubNames=state=>{
  if(!state)return;
  const each=(items,fn)=>{if(Array.isArray(items))items.flat(2).forEach(fn);};
  const match=m=>{if(!m||typeof m!=='object')return;[m.home,m.away,m.winner].forEach(rename);each(m.scorecard?.innings,i=>rename(i?.club));rename(m.superOver?.winner);each(m.superOver?.rounds,r=>each(r?.innings,i=>rename(i?.club)));};
  each(state.league,rename);each(state.draftOrder,rename);[state.userClub,state.champion].forEach(rename);
  each(state.schedule,match);each(state.fullSchedule,match);each(state.results,match);each(state.finals?.semis,match);match(state.finals?.gf);
  for(const[abbr,record]of Object.entries(state.dynasty?.clubCareer||{}))if(record&&names[abbr])record.name=names[abbr];
 };
})();
