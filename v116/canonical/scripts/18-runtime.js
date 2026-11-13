(()=>{const {setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame,cancelAnimationFrame}=window.GCC8_CLOCK;const MutationObserver=class{observe(){}disconnect(){}};
window.GCC_AI = (() => {
  const projections = window.GCC_PLAYER_PROJECTIONS_2008 || {};
  const ratings = window.GCC_RATINGS;

  const clubProfiles = {
    CSK:{future:.95,current:1.03,need:1.05,ground:.96,risk:.82},
    MI:{future:1.06,current:.98,need:.97,ground:.98,risk:.94},
    RR:{future:1.12,current:.92,need:1.00,ground:.96,risk:1.04},
    KKR:{future:1.00,current:1.00,need:1.02,ground:1.06,risk:.98},
    RCB:{future:1.02,current:1.04,need:.94,ground:1.05,risk:1.03},
    DC:{future:1.08,current:.96,need:1.00,ground:.98,risk:1.02},
    SIX:{future:.97,current:1.04,need:1.06,ground:1.02,risk:.86},
    THU:{future:1.04,current:.98,need:.98,ground:1.05,risk:1.05},
    STA:{future:1.02,current:1.00,need:1.00,ground:1.03,risk:.98},
    REN:{future:.99,current:1.02,need:1.03,ground:1.00,risk:.96},
    SCO:{future:1.00,current:1.04,need:1.04,ground:1.08,risk:.88},
    STR:{future:1.03,current:1.00,need:1.02,ground:1.02,risk:.95},
    HEA:{future:1.08,current:.96,need:.98,ground:1.06,risk:1.06},
    HUR:{future:1.01,current:1.01,need:1.04,ground:1.05,risk:.92},
    SUR:{future:1.01,current:1.03,need:1.00,ground:1.02,risk:.92},
    LAN:{future:.98,current:1.04,need:1.05,ground:1.03,risk:.88},
    YOR:{future:1.00,current:1.03,need:1.06,ground:1.04,risk:.88},
    NOT:{future:1.03,current:1.00,need:.99,ground:1.06,risk:.97},
    SOM:{future:1.06,current:.98,need:.98,ground:1.08,risk:1.04},
    HAM:{future:.99,current:1.03,need:1.04,ground:1.04,risk:.90}
  };

  function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
  function age(player, year=2008){ return year-player.birthYear; }

  function projection(player,year=window.GCC?.state?.year||2008){const S=window.GCC8_SCOUTING,v=S.publicView(player,year),future=S.value(v);return {dynasty:future,draftDynasty:future,arrivalYears:Math.max(0,(window.GCC8_PROFILES.lookup(player.name)?.expectedPeakYear||year)-year),peak:Math.max(player.overall,future),confidence:v.confidence==='MEDIUM'?.72:.5,longevity:clamp((38-v.age)/12,0,1),ageCurve:'estimated-career'};}
  function scoutProjection(player,year){return projection(player,year);}
  function projectedValue(player,year=2008){return window.GCC8_SCOUTING.value(window.GCC8_SCOUTING.publicView(player,year));}

  function groundFit(team, player){
    const c=team.conditions||{};
    let fit=0;
    const boundary=c.boundary||0, pace=c.pace||0, spin=c.spin||0;
    if(boundary>=3){ fit += Math.max(0,player.power-75)*.05 + Math.max(0,player.finishing-75)*.035; fit += Math.max(0,player.death-78)*.025; }
    if(boundary<=-3){ fit += Math.max(0,player.fielding-75)*.045 + Math.max(0,player.running-75)*.025 + Math.max(0,player.bowlControl-78)*.025; }
    if(pace>=3){ fit += Math.max(0,player.newBall-75)*.045 + Math.max(0,player.pace-75)*.025 + Math.max(0,player.pacePlay-78)*.025; }
    if(spin>=3){ fit += Math.max(0,player.spin-75)*.05 + Math.max(0,player.spinPlay-78)*.03; }
    return clamp(fit,0,8);
  }

  function bowlingWorkload(player){ return ratings?.bowlingWorkload ? ratings.bowlingWorkload(player) : Math.max(0,Math.min(4,player.maxOvers||0)); }
  function topWeighted(roster, fn, count=2){
    const vals=roster.filter(p=>bowlingWorkload(p)>0).map(fn).sort((a,b)=>b-a).slice(0,count);
    if(!vals.length) return 0;
    return vals.reduce((sum,v,i)=>sum+v*(i===0?1:.72),0)/vals.reduce((sum,_,i)=>sum+(i===0?1:.72),0);
  }
  function rosterShape(roster){
    const keeper=Math.max(0,...roster.map(p=>p.keeping||0));
    const capacity=roster.reduce((sum,p)=>sum+bowlingWorkload(p),0);
    const newBall=topWeighted(roster,p=>p.newBall*.50+p.bowlControl*.25+p.pace*.12+p.bowl*.13,2);
    const death=topWeighted(roster,p=>p.death*.46+p.bowlControl*.24+p.variation*.20+p.bowl*.10,2);
    const spin=topWeighted(roster,p=>p.spin*.50+p.bowlControl*.28+p.variation*.14+p.bowl*.08,2);
    const batters=[...roster].map(p=>p.bat*.70+p.control*.13+p.temperament*.09+p.finishing*.08).sort((a,b)=>b-a).slice(0,7);
    const batting=batters.length?batters.reduce((a,b)=>a+b,0)/batters.length:0;
    const openers=roster.filter(p=>p.bat>=55&&p.preferredSlot<=2).length;
    const middle=roster.filter(p=>p.bat>=50&&p.preferredSlot>=3&&p.preferredSlot<=6).length;
    const finishers=roster.filter(p=>p.bat>=55&&p.preferredSlot>=4&&p.finishing>=76).length;
    return {keeper,capacity,newBall,death,spin,batting,openers,middle,finishers};
  }
  function rosterNeed(roster, player){
    if(!roster.length) return 0;
    const before=rosterShape(roster), after=rosterShape([...roster,player]);
    let score=0;
    const rewardGain=(key,target,weight)=>{
      const gap=Math.max(0,target-before[key]);
      const gain=Math.max(0,after[key]-before[key]);
      score += Math.min(gap,gain)*weight;
    };
    rewardGain('keeper',78,.11);
    rewardGain('newBall',82,.10);
    rewardGain('death',82,.12);
    rewardGain('spin',78,.06);
    rewardGain('batting',80,.06);
    const capacityGap=Math.max(0,22-before.capacity);
    const capacityGain=Math.max(0,after.capacity-before.capacity);
    score += Math.min(capacityGap,capacityGain)*.62;
    if(before.openers<2 && after.openers>before.openers) score+=1.35;
    if(before.middle<3 && after.middle>before.middle) score+=1.10;
    if(before.finishers<1 && after.finishers>before.finishers) score+=1.10;
    // Need is not a quota system. It can gently push a club away from obvious role crowding,
    // while still allowing a high-value player to win the argument on ability or dynasty value.
    const openerCandidate=player.bat>=55&&player.preferredSlot<=2;
    const middleCandidate=player.bat>=50&&player.preferredSlot>=3&&player.preferredSlot<=6;
    const finisherCandidate=player.bat>=55&&player.preferredSlot>=4&&player.finishing>=76;
    if(roster.length>=7 && openerCandidate && before.openers>=3 && before.middle<3) score-=1.35;
    if(roster.length>=9 && openerCandidate && before.openers>=4) score-=1.10;
    if(roster.length>=8 && !middleCandidate && before.middle<2) score-=0.55;
    if(roster.length>=10 && finisherCandidate && before.finishers>=3) score-=0.45;
    return clamp(score,-2.5,12);
  }

  function functionsFor(player){
    const out=[];
    const work=bowlingWorkload(player);
    if(player.keeping>=72) out.push(['KEEP',Math.max(player.keeping,player.bat*.8)]);
    if(player.bat>=68 && player.preferredSlot<=2) out.push(['OPEN',player.bat*.55+player.power*.25+player.pacePlay*.20]);
    if(player.bat>=65 && player.finishing>=80) out.push(['FINISH',player.finishing*.55+player.power*.30+player.temperament*.15]);
    if(work>0 && player.newBall>=76) out.push(['NEW',player.newBall*.58+player.bowlControl*.27+player.pace*.15]);
    if(work>0 && player.death>=76) out.push(['DEATH',player.death*.52+player.bowlControl*.25+player.variation*.23]);
    if(work>0 && player.spin>=76) out.push(['SPIN',player.spin*.55+player.bowlControl*.28+player.variation*.17]);
    if(player.role==='AR') out.push(['AR',player.bat*.48+player.bowl*.42+player.fielding*.10]);
    if(!out.length) out.push([player.role,player.role==='BOWL'?player.bowl:player.bat]);
    return out.sort((a,b)=>b[1]-a[1]).slice(0,2);
  }
  function scarcity(player, available){
    if(!available||available.length<2) return 0;
    const funcs=functionsFor(player);
    let best=0;
    funcs.forEach(([key,value])=>{
      const comparable=available.filter(q=>q.id!==player.id && functionsFor(q).some(([k,v])=>k===key && v>=value-4)).length;
      const s=comparable<=2?3.5:comparable<=5?2:comparable<=9?1:0;
      best=Math.max(best,s);
    });
    return best;
  }

  function prospectSignal(player, year=2008){
    const future=projectedValue(player,year);
    const upside=Math.max(0,future-player.overall);
    const a=age(player,year);
    const runway=clamp((31-a)/10,0,1);
    // Expected upside is shared with user scouting; realised futures remain private.
    return clamp(upside*.42 + Math.max(0,future-88)*.20 + runway*1.4,0,10.5);
  }

  function hashNoise(teamAbbr,playerId,pickIndex){
    let h=2166136261;
    const s=`${teamAbbr}:${playerId}:${pickIndex}`;
    for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
    h>>>=0;
    const a=(h&65535)/65535;
    const b=((h>>>16)&65535)/65535;
    return ((a+b)-1)*4.4;
  }

  function evaluateDraft(team, player, context={}){
    const profile=clubProfiles[team.abbr]||{future:1,current:1,need:1,ground:1,risk:1};
    const current=(context.currentValue||(ratings?.playerDraftValue?ratings.playerDraftValue(player):player.overall))*profile.current;
    const future=projectedValue(player,context.year||2008);
    const p=projection(player);
    const need=rosterNeed(context.roster||[],player)*profile.need;
    const fit=groundFit(team,player)*profile.ground;
    const scarce=scarcity(player,context.available||[]);
    const round=Math.floor((context.pickIndex||0)/8)+1;
    // GCC is a dynasty game: estimated career value is a first-class draft input for every CPU club.
    // Current strength still matters because clubs must win now, but future stars cannot be left as hindsight steals.
    const futureWeight=clamp(.54*profile.future,.50,.59);
    const currentWeight=1-futureWeight;
    const mistake=hashNoise(team.abbr,player.id,context.pickIndex||0)*profile.risk*.48;
    const prospect=prospectSignal(player,context.year||2008)*profile.future;
    const futureGap=Math.max(0,future-current);
    const eliteFuture=Math.max(0,future-90);
    // Board pressure rises if a known long-term asset survives below his hidden dynasty tier.
    const fallingProspect=round>=3 ? (futureGap*.16 + eliteFuture*.12)*Math.min(2.2,(round-2)*.24) : 0;
    const score=current*currentWeight + future*futureWeight + need + fit + scarce + prospect + fallingProspect + mistake;
    return {score,current,future,need,fit,scarce,prospect,fallingProspect,mistake,projection:p};
  }

  function choosePlayer(team, available, context={}){
    const roster=context.roster||[];
    const ranked=available.map(player=>({player,...evaluateDraft(team,player,{...context,roster,available})})).sort((a,b)=>b.score-a.score);
    return ranked[0]||null;
  }

  return {projection,scoutProjection,projectedValue,prospectSignal,groundFit,rosterNeed,evaluateDraft,choosePlayer};
})();

})();