/* Facts observed at annual boundaries, never forecasts or hidden career rolls. */
window.GCC8_DEVELOPMENT=(()=>{
 function captureBefore(players,year){return Object.fromEntries(players.map(p=>[p.id,{year,overall:p.overall,owner:p.draftedBy||null}]));}
 function rows(before,players,year){return players.filter(p=>before[p.id]).map(p=>({careerKey:p.careerKey||p.name,year,playerId:p.id,name:p.name,fromOverall:before[p.id].overall,toOverall:p.overall,delta:p.overall-before[p.id].overall,role:p.role,owner:before[p.id].owner}));}
 function summary(rows){return rows.filter(r=>Math.abs(r.delta)>=2).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)||a.careerKey.localeCompare(b.careerKey)).slice(0,3);}
 return {captureBefore,rows,summary};
})();
