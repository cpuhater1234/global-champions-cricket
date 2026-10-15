/* Optional CPU list turnover uses the same annual allowance as the user's club.
   Release only expendable depth when several better alternatives exist; winning
   a replacement in the draft is still uncertain. No automatic replacement signing. */
  function cpuReleaseDecisions(){
    const o=state.dynasty.offseason;if(!o||o.cpuReleases)return;o.cpuReleases={};
    for(const c of state.league){
      if(c.abbr===state.userClub.abbr)continue;
      const retired=o.retirements.filter(r=>r.owner===c.abbr).length,limit=Math.min(2,Math.max(0,4-retired)),cuts=o.cpuReleases[c.abbr]=[];
      for(let n=0;n<limit;n++){
        const rs=roster(c.abbr),keepers=rs.filter(isKeeper).length;
        const options=rs.filter(p=>!p.dynastyReplacement&&!(isKeeper(p)&&keepers<=1)&&R.oversCapacity(rs.filter(q=>q.id!==p.id))>=20).sort((a,b)=>tradeValue(a,c.abbr)-tradeValue(b,c.abbr));
        const cut=options[0];if(!cut)break;
        const value=tradeValue(cut,c.abbr),alternatives=freeAgentPool().filter(p=>!cuts.includes(p.id)&&tradeValue(p,c.abbr)>=value+5);
        if(alternatives.length<4)break;
        state.teams[c.abbr]=rosterIds(c.abbr).filter(id=>id!==cut.id);cut.draftedBy=null;cuts.push(cut.id);
        log('RELEASE',`${c.name} release ${cut.name}`,'An optional list place opens for the annual draft. No replacement is guaranteed.');
      }
    }
  }
