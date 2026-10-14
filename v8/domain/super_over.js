  // GCC's simplified tie-break: six legal deliveries, two wickets, repeated if tied.
  // Separate from regulation totals, NRR, player statistics and form updates.
  // The model selects three hitters and one bowler from each actual match XI.
  function simulateSuperOver(firstClub, secondClub, ground, random=rng) {
    const rounds=[];
    function miniInnings(batClub,bowlClub,target=Infinity){
      const hitters=clubXI(batClub).filter(Boolean).slice().sort((a,b)=>R.batPhaseScore(b,'death')-R.batPhaseScore(a,'death')||a.id-b.id).slice(0,3);
      const options=clubXI(bowlClub).filter(Boolean),credible=options.filter(p=>R.bowlingWorkload(p)>0);
      const bowler=(credible.length?credible:options).slice().sort((a,b)=>R.bowlPhaseScore(b,'death')-R.bowlPhaseScore(a,'death')||a.id-b.id)[0];
      if(hitters.length<3||!bowler)throw new Error('A Super Over requires complete match XIs.');
      let total=0,wickets=0,striker=0,nonStriker=1;
      const deliveries=[],batters=hitters.map(p=>({id:p.id,name:p.name,runs:0,balls:0,out:false}));
      for(let ball=1;ball<=6&&wickets<2&&total<target;ball++){
        const p=hitters[striker],edge=R.batPhaseScore(p,'death')-R.bowlPhaseScore(bowler,'death');
        const wicketChance=Math.max(.06,Math.min(.24,.14-edge*.001));
        const batter=batters[striker];batter.balls++;
        let runs=0,out=random()<wicketChance;
        if(out){wickets++;batter.out=true;}
        else{
          const roll=random()+Math.max(-.08,Math.min(.08,edge*.002))+(ground.conditions?.boundary||0)*.003;
          runs=roll<.20?0:roll<.48?1:roll<.65?2:roll<.68?3:roll<.87?4:6;
          total+=runs;batter.runs+=runs;
        }
        deliveries.push({ball,batterId:p.id,runs,wicket:out});
        if(out&&wickets===1)striker=2;
        else if(!out&&runs%2)[striker,nonStriker]=[nonStriker,striker];
      }
      return {club:batClub,total,wickets,balls:deliveries.length,bowler:{id:bowler.id,name:bowler.name},batters,deliveries};
    }
    let first=firstClub,second=secondClub;
    for(;;){
      const a=miniInnings(first,second),b=miniInnings(second,first,a.total+1);
      rounds.push({innings:[a,b]});
      if(a.total!==b.total)return {rounds,winner:a.total>b.total?first:second};
      [first,second]=[second,first];
    }
  }
