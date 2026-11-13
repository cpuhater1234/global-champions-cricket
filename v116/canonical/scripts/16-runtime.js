(()=>{const {setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame,cancelAnimationFrame}=window.GCC8_CLOCK;const MutationObserver=class{observe(){}disconnect(){}};
window.GCC_MODEL_SPEC_2008 = Object.freeze({
  version:'2008-evidence-hunt-v10',
  principles:[
    'historical evidence -> derived cricket metrics -> attributes -> simulation',
    'overall ratings describe underlying attributes and never directly modify match odds',
    'form is a small execution modifier, not a replacement for ability',
    'ground effects interact with the bowling style and batting matchup that can exploit or resist them',
    'uncertainty belongs in evidence confidence and match variance, not arbitrary ratings'
  ],
  phases:{powerplay:'1-6',middle:'7-15',death:'16-20'},
  primaryRoles:['BAT','WK-BAT','AR','BOWL'],
  formExecutionPerStep:.75,
  formRange:[-3,3],
  status:'Cricsheet evidence pipeline + strict provenance/runtime calibration gates active; synthetic evidence is hard-rejected and candidate ratings remain quarantined until real-source promotion audit'
});

window.GCC_RATINGS = (() => {
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  const clampFloat = n => Math.max(1, Math.min(99, n));
  const clamp = n => Math.round(clampFloat(n));
  const top = (players, fn, count) => [...players].sort((a,b)=>fn(b)-fn(a)).slice(0,count);
  const weightedTop = (players, fn, weights) => {
    const list = top(players, fn, weights.length);
    if (!list.length) return 0;
    let total=0, weight=0;
    list.forEach((p,i)=>{ total += fn(p)*weights[i]; weight += weights[i]; });
    return total/weight;
  };
  const isKeeper=p=>!!p&&(p.role==='WK-BAT'||Number(p.keeping||0)>=65);
  const battingEligible = p => p.bat >= 35;
  const formExecution = p => Math.max(-2.25, Math.min(2.25, (p.form||0)*.75));

  function bowlingStyle(p){
    if (!p || (p.maxOvers||0)<=0) return null;
    const job=window.GCC8_PLAYER_JOBS[p.name];if(job)return job.style;
    if (p.bowlingStyleVerified === 'SPIN' || p.bowlingStyleVerified === 'PACE') return p.bowlingStyleVerified;
    if (p.sourceTag === 'spin') return 'SPIN';
    if (['pace','power','death'].includes(p.sourceTag)) return 'PACE';
    if (p.sourceTag === 'part') {
      if (p.name === 'Andrew Symonds') return 'DUAL';
      if (p.name === 'Chris Gayle') return 'SPIN';
      if (['Scott Styris','Ravi Bopara','Kieron Pollard','Jesse Ryder'].includes(p.name)) return 'PACE';
    }
    if (p.spin >= 45 && p.spin >= p.pace + 8) return 'SPIN';
    if (p.pace >= 45 && p.pace >= p.spin + 8) return 'PACE';
    if (p.role === 'BOWL' || p.role === 'AR') return p.spin >= p.pace ? 'SPIN' : 'PACE';
    return null;
  }

  function bowlingWorkload(p){
    // Legal/credible ceiling only. Expected usage is handled separately by bowlingUsagePrior.
    // Any genuine frontline bowler or bowling all-rounder can complete four in T20. A batter
    // only receives that legal ceiling when the data already identifies him as a real option.
    const declared=Math.max(0,Math.min(4,Number(p.maxOvers||0)));
    if (p.role === 'BOWL' || p.role === 'AR') return 4;
    if ((p.role === 'BAT' || p.role === 'WK-BAT') && declared > 0 && p.bowl >= 45) return 4;
    return declared;
  }
  function bowlingUsagePrior(p){
    if (Number.isFinite(Number(p?.bowlingUsage))) return Math.max(0,Math.min(bowlingWorkload(p),Number(p.bowlingUsage)));
    const cap=bowlingWorkload(p);
    if (!cap) return 0;
    if (p.role === 'BOWL') return Math.min(cap,3.65);
    if (p.role === 'AR') return Math.min(cap,2.35);
    return Math.min(cap,0.85);
  }
  const bowlingEligible = p => bowlingWorkload(p) > 0 && bowlingStyle(p) && (p.bowl >= 28 || bowlingUsagePrior(p) >= .35);

  function batPhaseScore(p,phase){
    const form=formExecution(p);
    if(phase==='powerplay') return clampFloat(p.bat*.24+p.power*.23+p.pacePlay*.22+p.control*.18+p.temperament*.13+form);
    if(phase==='middle') return clampFloat(p.bat*.25+p.spinPlay*.24+p.control*.23+p.running*.14+p.temperament*.14+form);
    return clampFloat(p.bat*.20+p.finishing*.29+p.power*.25+p.control*.08+p.temperament*.12+p.running*.06+form);
  }
  function bowlPhaseScore(p,phase){
    const form=formExecution(p);
    const style=bowlingStyle(p);
    if(phase==='newBall') return clampFloat(p.bowl*.22+p.newBall*.34+p.bowlControl*.24+p.variation*.12+p.temperament*.08+form);
    if(phase==='middle') {
      const spinRoute=p.bowl*.22+p.spin*.30+p.bowlControl*.24+p.variation*.16+p.temperament*.08;
      const paceRoute=p.bowl*.24+p.bowlControl*.32+p.variation*.22+p.pace*.10+p.temperament*.12;
      const base=style==='SPIN'?spinRoute:style==='PACE'?paceRoute:Math.max(spinRoute,paceRoute);
      return clampFloat(base+form);
    }
    return clampFloat(p.bowl*.20+p.death*.28+p.bowlControl*.23+p.variation*.20+p.temperament*.09+form);
  }
  function battingCore(p){ return clampFloat(p.bat*.46+p.control*.14+p.power*.12+p.pacePlay*.08+p.spinPlay*.08+p.finishing*.08+p.temperament*.04); }
  function bowlingCore(p){ return clampFloat(p.bowl*.43+p.bowlControl*.18+p.variation*.12+p.newBall*.09+p.death*.09+Math.max(p.spin,p.pace)*.05+p.temperament*.04); }
  const roleFit = p => {
    const bat=battingCore(p), bowl=bowlingCore(p);
    if (p.role==='WK-BAT') return bat*.68+p.keeping*.22+p.fielding*.04+p.temperament*.06;
    if (p.role==='AR') return bat*.42+bowl*.42+p.fielding*.08+p.temperament*.08;
    if (p.role==='BOWL') return bowl*.84+p.fielding*.10+p.temperament*.06;
    return bat*.86+p.fielding*.08+p.temperament*.06;
  };
  function battingRoleBand(p){
    const pref=Number(p?.preferredSlot||6);
    if(p?.role==='BOWL' && p.bat<55) return 'TAIL';
    if(pref<=2) return 'OPEN';
    if(pref<=4) return 'TOP';
    if(pref<=6) return 'MIDDLE';
    if(pref<=8) return 'LOWER';
    return 'TAIL';
  }
  function battingPositionFit(p,slot){
    const s=Math.max(1,Math.min(11,Number(slot||p?.battingSlot||p?.preferredSlot||6)));
    const band=battingRoleBand(p);
    const ranges={OPEN:[1,3],TOP:[2,5],MIDDLE:[4,7],LOWER:[5,8],TAIL:[8,11]};
    const [lo,hi]=ranges[band]||[1,11];
    const distance=s<lo?lo-s:s>hi?s-hi:0;
    const steps=[100,95,88,80,72,66,60];
    let fit=steps[Math.min(distance,steps.length-1)];
    // Strong batting all-rounders and unusually capable bowlers get more licence to float.
    if(p?.role==='AR' && p.bat>=72) fit=Math.max(fit, distance<=2?93:fit);
    if(p?.role==='BOWL' && p.bat>=58 && s>=6) fit=Math.max(fit,90);
    return clamp(fit);
  }
  function battingOrder(xi){ return [...xi].sort((a,b)=>((a.battingSlot??a.preferredSlot)-(b.battingSlot??b.preferredSlot))||(b.bat-a.bat)||(b.control-a.control)); }
  function oversCapacity(xi){ return xi.reduce((sum,p)=>sum+bowlingWorkload(p),0); }
  function trustedOversCapacity(xi){ return xi.reduce((sum,p)=>sum+Math.min(bowlingWorkload(p),bowlingUsagePrior(p)),0); }
  function battingResourceScore(xi){
    if (!xi.length) return 0;
    const order=battingOrder(xi);
    const vals=order.map(p=>p.bat*.56+p.control*.15+p.temperament*.12+p.finishing*.10+p.power*.07+formExecution(p));
    if(xi.length<8) return clamp(avg(vals));
    const topFour=avg(vals.slice(0,4)), engineRoom=avg(vals.slice(4,8)), tail=avg(vals.slice(8,11));
    return clamp(topFour*.20+engineRoom*.67+tail*.13);
  }
  function profile(xi,context={}){
    if(!xi.length) return emptyProfile();
    const batting=xi.filter(battingEligible), bowling=xi.filter(bowlingEligible);
    const order=battingOrder(batting), topSix=order.slice(0,6);
    const slotRows=order.map((p,i)=>({p,slot:Number(p.battingSlot||i+1),fit:battingPositionFit(p,Number(p.battingSlot||i+1))}));
    const fitAvg=rows=>rows.length?avg(rows.map(x=>x.fit)):100;
    const topOrderFit=fitAvg(slotRows.filter(x=>x.slot<=3));
    const middleOrderFit=fitAvg(slotRows.filter(x=>x.slot>=3&&x.slot<=6));
    const closingFit=fitAvg(slotRows.filter(x=>x.slot>=5&&x.slot<=8));
    const individualRoleFit=fitAvg(slotRows);
    const naturalOpeners=order.filter(p=>p.bat>=55&&p.preferredSlot<=2).length;
    const naturalMiddle=order.filter(p=>p.bat>=50&&p.preferredSlot>=3&&p.preferredSlot<=6).length;
    const naturalFinishers=order.filter(p=>p.bat>=55&&p.preferredSlot>=4&&p.finishing>=76).length;
    const shapeActive=xi.length>=9;
    const crowdingPenalty=shapeActive&&naturalOpeners>=4&&naturalMiddle<3?Math.min(7,(naturalOpeners-3)*2.5):0;
    const openingGap=shapeActive&&naturalOpeners===0?5:0;
    const middleGap=shapeActive&&naturalMiddle<2?Math.min(5,(2-naturalMiddle)*2.5):0;
    const finishingGap=shapeActive&&naturalFinishers===0?4:0;
    const battingShape=clamp(individualRoleFit-crowdingPenalty-openingGap*.45-middleGap*.55-finishingGap*.45);
    const rawPpBat=window.GCC8_PHASE_EXPOSURE.battingScore(xi,'powerplay',window.GCC_RATINGS);
    const rawMiddleBat=window.GCC8_PHASE_EXPOSURE.battingScore(xi,'middle',window.GCC_RATINGS);
    const rawFinishBat=window.GCC8_PHASE_EXPOSURE.battingScore(xi,'death',window.GCC_RATINGS);
    const battingResources=battingResourceScore(xi);
    const battingDepthPenalty=xi.length>=9?Math.max(0,70-battingResources):0;
    // Role fit is deliberately broad: an opener at 1/2/3 is fine; material mismatches matter gradually.
    const ppRolePenalty=shapeActive?Math.max(0,94-topOrderFit)*.18+openingGap*.55:0;
    const middleRolePenalty=shapeActive?Math.max(0,94-middleOrderFit)*.16+middleGap*.45+crowdingPenalty*.22:0;
    const finishRolePenalty=shapeActive?Math.max(0,94-closingFit)*.18+finishingGap*.55+crowdingPenalty*.28:0;
    const ppBat=clamp(rawPpBat-battingDepthPenalty*.05-ppRolePenalty);
    const middleBat=clamp(rawMiddleBat-battingDepthPenalty*.14-middleRolePenalty);
    const finishBat=clamp(rawFinishBat-battingDepthPenalty*.30-finishRolePenalty);

    const rawNewBall=weightedTop(bowling,p=>bowlPhaseScore(p,'newBall'),[1,1,.65]);
    const rawMiddleBowl=weightedTop(bowling,p=>bowlPhaseScore(p,'middle'),[1,1,.8,.6]);
    const rawDeath=weightedTop(bowling,p=>bowlPhaseScore(p,'death'),[1,1,.65]);
    const paceBowlers=bowling.filter(p=>['PACE','DUAL'].includes(bowlingStyle(p)));
    const spinBowlers=bowling.filter(p=>['SPIN','DUAL'].includes(bowlingStyle(p)));
    const paceAttack=paceBowlers.length?weightedTop(paceBowlers,p=>p.pace*.55+p.bowl*.30+p.bowlControl*.15,[1,.85,.6]):35;
    const spinAttack=spinBowlers.length?weightedTop(spinBowlers,p=>p.spin*.55+p.bowl*.30+p.bowlControl*.15,[1,.85,.6]):35;
    // Matchup resistance belongs to the batting unit, not the bowling attack.
    // Weight the likely top six because they consume the large majority of meaningful balls.
    const pacePlay=weightedTop(topSix,p=>p.pacePlay,[1,1,.9,.8,.7,.6]);
    const spinPlay=weightedTop(topSix,p=>p.spinPlay,[1,1,.9,.8,.7,.6]);

    const keeper=Math.max(...xi.map(p=>p.keeping||0));
    const field=avg(xi.map(p=>p.fielding));
    const cover=oversCapacity(xi), trustedCover=trustedOversCapacity(xi), bowlingOptions=bowling.length;
    const legalCapacityScore=cover>=20?94+Math.min(5,(cover-20)*.8):Math.max(20,94-(20-cover)*12);
    const trustedCapacityScore=trustedCover>=19?92+Math.min(7,(trustedCover-19)*1.4):Math.max(30,92-(19-trustedCover)*6.0);
    const optionScore=Math.min(99,40+bowlingOptions*9);
    const bowlingResources=clamp(legalCapacityScore*.32+trustedCapacityScore*.48+optionScore*.20);
    const resourcePenalty=Math.max(0,75-bowlingResources);
    const newBall=clamp(rawNewBall-resourcePenalty*.20);
    const middleBowl=clamp(rawMiddleBowl-resourcePenalty*.34);
    const death=clamp(rawDeath-resourcePenalty*.40);

    const newBallOptions=bowling.filter(p=>bowlPhaseScore(p,'newBall')>=72).length;
    const deathOptions=bowling.filter(p=>bowlPhaseScore(p,'death')>=72).length;
    const attackPenalty=shapeActive?(Math.max(0,5-bowlingOptions)*3.2+Math.max(0,2-newBallOptions)*2.4+Math.max(0,2-deathOptions)*2.7+Math.max(0,20-cover)*2.4):0;
    const attackShape=clamp(96-attackPenalty);
    const xiShape=clamp(battingShape*.56+attackShape*.44);

    const countries={}; xi.forEach(p=>countries[p.country]=(countries[p.country]||0)+1);
    const familiarPairs=Object.values(countries).reduce((sum,n)=>sum+(n>1?n*(n-1)/2:0),0);
    const roleClarity=clamp(individualRoleFit*.68+xiShape*.32);
    const continuity=context.matchesTogether?Math.min(92,58+context.matchesTogether*3.2):58;
    const leaders=top(xi,p=>p.leadership,2);
    const leadership=leaders.length?avg(leaders.map(p=>p.leadership)):50;
    // National familiarity is only a small early continuity proxy; it cannot dominate chemistry.
    const chemistry=clamp(roleClarity*.44+continuity*.30+leadership*.20+Math.min(6,familiarPairs*.33));

    return {keeperPresent:xi.some(isKeeper),powerplayBat:ppBat,middleBat,finishing:finishBat,battingResources,newBall,middleBowl,death,
      fielding:clamp(field),keeping:clamp(keeper),chemistry,bowlingCover:bowlingResources,bowlingResources,
      oversCapacity:cover,trustedOversCapacity:trustedCover,roleClarity,roleFit:clamp(individualRoleFit),xiShape,battingShape,attackShape,continuity:clamp(continuity),leadership:clamp(leadership),
      battingDepth:batting.length,bowlingOptions,paceAttack:clamp(paceAttack),spinAttack:clamp(spinAttack),
      pacePlay:clamp(pacePlay),spinPlay:clamp(spinPlay),
      overall:clamp(avg([ppBat,middleBat,finishBat,battingResources,newBall,middleBowl,death,field,Math.max(40,keeper),chemistry,bowlingResources]))};
  }
  function emptyProfile(){return {keeperPresent:false,powerplayBat:0,middleBat:0,finishing:0,battingResources:0,newBall:0,middleBowl:0,death:0,fielding:0,keeping:0,chemistry:0,bowlingCover:0,bowlingResources:0,bowlingOptions:0,oversCapacity:0,trustedOversCapacity:0,roleClarity:0,roleFit:0,xiShape:0,battingShape:0,attackShape:0,continuity:0,leadership:0,paceAttack:0,spinAttack:0,pacePlay:0,spinPlay:0,overall:0};}
  function grade(n){return n>=90?'elite':n>=82?'strong':n>=73?'sound':n>=64?'thin':'weak';}
  function explanation(key,p){if(key==='keeping'&&p.keeping<65&&p.keeperPresent)return 'A recognised keeper is selected, but current glove work is a weakness.';
    const map={
      powerplayBat:[[90,'Your top order can take the game away in the first six.'],[80,'There is enough power and control to win the powerplay.'],[70,'The top order is serviceable, but not overwhelming.'],[0,'You are short of reliable powerplay scoring.']],
      middleBat:[[90,'This side should handle spin and keep the innings moving.'],[80,'There is good control through the middle overs.'],[70,'The middle overs can stall if early wickets fall.'],[0,'Spin and strike rotation are clear pressure points.']],
      finishing:[[90,'You have more than one batter who can close an innings.'],[80,'There is a trusted finisher and enough support around him.'],[70,'The last five overs depend heavily on one or two players.'],[0,'This XI is short of late-innings hitting.']],
      battingResources:[[90,'The batting carries quality well beyond the top order.'],[80,'There is useful batting through the middle and lower order.'],[70,'The top order carries most of the run-making load.'],[0,'The batting falls away sharply once the main batters are gone.']],
      newBall:[[90,'Two genuine new-ball threats give you early wicket pressure.'],[80,'You can attack up front without losing too much control.'],[70,'The first six overs are steady rather than dangerous.'],[0,'There is no convincing new-ball pairing in this XI.']],
      middleBowl:[[90,'You can squeeze the middle overs and still take wickets.'],[80,'There is enough control and variation to hold the game.'],[70,'The middle overs rely on matchups going your way.'],[0,'Oppositions will have chances to rebuild through overs 7–15.']],
      death:[[90,'You have two trusted closers and enough variation around them.'],[80,'There is a strong first death option with useful support.'],[70,'The death is workable, but one bad over can expose the unit.'],[0,'You are short of control, variation or a second reliable closer.']],
      fielding:[[90,'This is an elite fielding side.'],[80,'The ground fielding should save runs across an innings.'],[70,'The fielding is solid enough.'],[0,'You are giving runs back in the field.']],
      keeping:[[90,'You have a specialist keeper at the top level.'],[80,'The gloves are in safe hands.'],[65,'Keeping should hold up, but it is not a strength.'],[0,'There is no genuine keeper in this XI.']],
      chemistry:[[90,'The XI looks settled. Most players are in the right jobs and the group has played enough cricket together.'],[80,'Most of the XI are doing jobs that suit them.'],[70,'The group is still settling and a few players are being stretched.'],[0,'Too many jobs are awkward and the XI has not settled yet.']],
      bowlingResources:[[90,'You have several frontline options and enough depth to get through twenty overs without hiding anyone.'],[80,'The attack has enough reliable options to cover a full innings.'],[70,'The attack can get through twenty overs, but one or two bowlers may be stretched into uncomfortable phases.'],[0,'The XI will have to lean on part-time bowling or stretch too few frontline options.']]
    };
    const score=p[key]||0,rows=map[key]||[];
    const line=(rows.find(([min])=>score>=min)||rows[rows.length-1]||[0,''])[1];
    if(key==='death'&&p.bowlingResources<70) return line+' The wider attack is also short of reliable depth.';
    if(key==='chemistry'&&p.continuity<65) return line+' They are still learning each other.';
    return line;
  }
  function conditionMatchup(batResistance,bowlAttack,condition){
    return Number(condition||0)*.035*((Number(batResistance||0)-Number(bowlAttack||0))/10);
  }
  function playerDraftValue(p){return roleFit(p);}
  return {isKeeper,profile,grade,explanation,playerDraftValue,roleFit,battingOrder,battingPositionFit,battingRoleBand,bowlingWorkload,bowlingUsagePrior,oversCapacity,trustedOversCapacity,battingResourceScore,bowlingStyle,batPhaseScore,bowlPhaseScore,formExecution,conditionMatchup};
})()

})();