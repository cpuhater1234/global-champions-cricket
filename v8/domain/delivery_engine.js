/* Causal T20 delivery simulation. Every scorecard figure comes from this ledger.
   GCC rule: four opening powerplay overs plus a two-over surge from over eleven.
   Captains call the surge automatically; viewing pace never consumes match RNG. */
window.GCC8_DELIVERY=(()=>{
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),overs=n=>`${Math.floor(n/6)}.${n%6}`;
 function play({batClub,bowlClub,order,bowlers,estimate,batProfile,bowlProfile,context={},random,R}){
  if(order.length!==11||bowlers.length!==11)throw Error('A delivery match needs two complete elevens.');
  const batting=order.map(p=>({player:p,dismissal:'not out',runs:0,balls:0,fours:0,sixes:0,sr:null,dnb:true})),byBat=new Map(batting.map(p=>[p.player.id,p]));
  const bowling=new Map(bowlers.map(p=>[p.id,{player:p,balls:0,runs:0,wickets:0,overs:'0.0',economy:0}]));
  const extras={total:0,wides:0,noBalls:0,byes:0,legByes:0,bowlerCharged:0},phases={pp:0,mid:0,death:0},phaseBalls={pp:0,mid:0,death:0};
  const deliveries=[],notices=[],plan=[],surge={startOver:null,overs:2},target=context.chasing?Number(context.target||0):0;
  let total=0,wickets=0,balls=0,striker=0,nonStriker=1,next=2,lastBowler=null,freeHit=false,surgeEnd=null;
  batting[0].dnb=batting[1].dnb=false;
  const note=(type,text)=>notices.push({after:deliveries.length,type,text,total,wickets,balls});
  const pickRuns=(mean,p)=>{const sixShare=clamp(.18+((p.power||75)-80)*.004,.08,.34),boundary=clamp((mean-.495)/(4+2*sixShare),.035,.51),weights=[[0,1-.405-boundary],[1,.32],[2,.08],[3,.005],[4,boundary*(1-sixShare)],[6,boundary*sixShare]];let roll=random();for(const [runs,weight]of weights){roll-=weight;if(roll<=0)return runs;}return 6;};
  const chooseBowler=(over,restricted)=>{
   const eligible=bowlers.filter(p=>p.id!==lastBowler&&bowling.get(p.id).balls<24),primary=eligible.filter(p=>R.bowlingWorkload(p)>0&&bowling.get(p.id).balls<R.bowlingWorkload(p)*6);
   const options=primary.length?primary:eligible.filter(p=>!R.isKeeper(p));const choices=options.length?options:eligible;
   if(!choices.length)throw Error('No eligible bowler for the next over.');
   const planned=estimate.bowlingPlan?.[over-1],plannedPlayer=choices.find(p=>p.id===planned);
   // Preserve the model's captaincy plan except that the surge gets its own selection.
   if(plannedPlayer&&!restricted)return plannedPlayer;
   const phase=over<=4?'newBall':over>=16||restricted?'death':'middle';
   return choices.map(p=>({p,score:R.bowlPhaseScore(p,phase)-bowling.get(p.id).balls*.10+random()*5})).sort((a,b)=>b.score-a.score||a.p.id-b.p.id)[0].p;
  };
  for(let over=1;over<=20&&wickets<10&&(!target||total<target);over++){
   if(!surge.startOver&&over>=11){
    const set=batting[striker].balls+batting[nonStriker].balls>=24,pressure=target?(target-total)/(Math.max(1,120-balls)/6):0;
    const chance=clamp(.16+(set?.18:0)+(wickets<=4?.10:0)+(pressure>9?.18:0)+(over-11)*.045,.1,.92);
    if(over===19||random()<chance){surge.startOver=over;surgeEnd=over+1;note('surgeStart',`${batClub.name} call the Power Surge. Two overs with the field up.`);}
   }
   const restricted=over<=4||(surge.startOver&&over>=surge.startOver&&over<=surgeEnd),phase=restricted?'pp':over<=15?'mid':'death';
   const bowler=chooseBowler(over,!!(surge.startOver&&over>=surge.startOver&&over<=surgeEnd)),br=bowling.get(bowler.id);plan.push(bowler.id);lastBowler=bowler.id;
   let legal=0,attempts=0;const overStart=total;
   while(legal<6&&wickets<10&&(!target||total<target)){
    if(++attempts>40)throw Error('Delivery over exceeded its safety bound.');
    const p=order[striker],b=byBat.get(p.id),beforeRuns=b.runs,batKey=restricted?'powerplay':over>=16?'death':'middle',bowlKey=over<=4?'newBall':over>=16?'death':'middle';
    const teamBat=restricted?batProfile.powerplayBat:over>=16?batProfile.finishing:batProfile.middleBat,teamBowl=over<=4?bowlProfile.newBall:over>=16?bowlProfile.death:bowlProfile.middleBowl;
    const role=.75+.25*(R.battingPositionFit?.(p,striker+1)||100)/100;
    const edge=(R.batPhaseScore(p,batKey)*role-teamBat)-(R.bowlPhaseScore(bowler,bowlKey)-teamBowl);
    const baseline=over<=4?estimate.pp/36:over>=16?estimate.death/30:estimate.mid/54;
    const required=target?(target-total)/Math.max(1,120-balls)*6:0,pressure=target?clamp((required-8)*.05,-.12,.42):0;
    const mean=clamp(baseline+edge*.009+pressure+(restricted&&over>4?.18:0),.45,3.0);
    const hazard=clamp((clamp((estimate.wickets+.8)/120,.025,.085))*(1-edge*.008)*(1+Math.max(0,pressure)*.65),.014,.15);
    const e={kind:'ball',over,ball:legal+1,batterId:p.id,nonStrikerId:order[nonStriker].id,bowlerId:bowler.id,legal:true,batRuns:0,runs:0,wicket:false,dismissal:null,extra:null,extraRuns:0,phase,surge:!!(surge.startOver&&over>=surge.startOver&&over<=surgeEnd),freeHit};
    const special=random();let runOut=false;
    if(special<.025){e.legal=false;e.extra='wides';e.extraRuns=1;}
    else if(special<.031){e.legal=false;e.extra='noBalls';e.extraRuns=1;e.batRuns=target&&total+1>=target?0:pickRuns(mean,p);}
    else if(special<.041){e.extra='byes';e.extraRuns=random()<.88?1:2;}
    else if(special<.056){e.extra='legByes';e.extraRuns=random()<.90?1:2;}
    else if(random()<(freeHit?.002:hazard)){
     e.wicket=true;const type=random(),spin=['SPIN','DUAL'].includes(R.bowlingStyle(bowler)),keeper=bowlers.filter(R.isKeeper).sort((a,b)=>b.keeping-a.keeping)[0];runOut=freeHit||type>.94;
     if(runOut){const f=bowlers[Math.floor(random()*bowlers.length)];e.dismissal=`run out (${f.name})`;}
     else if(type<.53){const f=bowlers[Math.floor(random()*bowlers.length)];e.dismissal=f.id===bowler.id?`c & b ${bowler.name}`:`c ${f.name} b ${bowler.name}`;}
     else if(type<.76)e.dismissal=`b ${bowler.name}`;
     else if(type<.89||!spin||!keeper)e.dismissal=`lbw b ${bowler.name}`;
     else e.dismissal=`st ${keeper.name} b ${bowler.name}`;
    }else e.batRuns=pickRuns(mean/(1-hazard),p);
    e.runs=e.batRuns+e.extraRuns;total+=e.runs;phases[phase]+=e.runs;b.runs+=e.batRuns;if(e.batRuns===4)b.fours++;if(e.batRuns===6)b.sixes++;
    if(e.extra){extras[e.extra]+=e.extraRuns;extras.total+=e.extraRuns;if(['wides','noBalls'].includes(e.extra))extras.bowlerCharged+=e.extraRuns;}
    br.runs+=e.batRuns+(['wides','noBalls'].includes(e.extra)?e.extraRuns:0);
    if(e.legal){legal++;balls++;br.balls++;phaseBalls[phase]++;freeHit=false;}if(e.extra!=='wides')b.balls++;
    if(e.extra==='noBalls')freeHit=true;
    if(e.wicket){wickets++;b.dismissal=e.dismissal;if(!runOut)br.wickets++;if(wickets<10&&(!target||total<target)&&balls<120){striker=next++;batting[striker].dnb=false;}}
    else if((e.batRuns+(['byes','legByes'].includes(e.extra)?e.extraRuns:0))%2)[striker,nonStriker]=[nonStriker,striker];
    if(e.legal&&legal===6&&wickets<10)[striker,nonStriker]=[nonStriker,striker];
    Object.assign(e,{total,wickets,balls,nextStrikerId:wickets<10?order[striker]?.id:null,nextNonStrikerId:wickets<10?order[nonStriker]?.id:null});deliveries.push(e);
    if(beforeRuns<50&&b.runs>=50)note('fifty',`${p.name} reaches fifty from ${b.balls} balls.`);
    if(beforeRuns<100&&b.runs>=100)note('hundred',`A century for ${p.name}. ${b.runs} from ${b.balls} balls.`);
   }
   if(legal===6){
    if(over===4)note('powerplayEnd',`Opening powerplay complete. ${batClub.abbr} ${total}/${wickets} after four overs.`);
    else if(surgeEnd===over)note('surgeEnd',`Power Surge complete. ${batClub.abbr} ${total}/${wickets}.`);
    else if(over<20&&wickets<10&&(!target||total<target))note('overEnd',`Over ${over}: ${total-overStart} runs. ${batClub.abbr} ${total}/${wickets}.`);
   }
  }
  for(const b of batting){b.sr=b.balls?b.runs*100/b.balls:null;if(b.dnb)b.dismissal='did not bat';}
  const bowlingRows=[...bowling.values()].filter(b=>b.balls>0||b.runs>0);for(const b of bowlingRows){b.overs=overs(b.balls);b.economy=b.balls?b.runs*6/b.balls:null;}
  note('inningsEnd',target&&total>=target?`${batClub.name} complete the chase.`:`${batClub.name} finish on ${total}/${wickets}.`);
  const card={club:batClub,total,wickets,balls,overs:overs(balls),extras:extras.total,extrasBreakdown:extras,phases,phaseBalls,batting,bowling:bowlingRows,deliveryVersion:1,surge};
  return {total,wickets,balls,pp:phases.pp,mid:phases.mid,death:phases.death,requiredRate:target?target/20:0,chasePressure:0,bowlingPlan:plan,deliveryVersion:1,deliveries,notices,surge,phaseBalls,extrasBreakdown:extras,batterRuns:Object.fromEntries(batting.map(b=>[b.player.id,b.runs])),card};
 }
 function scorecard(home,away,hi,ai,first){
  const homeCard=hi.card,awayCard=ai.card;if(!homeCard||!awayCard)throw Error('Delivery scorecard missing.');
  // Batting card belongs to the batting side; its bowling rows belong to its opponent.
  delete hi.card;delete ai.card;
  return {innings:first.abbr===away.abbr?[awayCard,homeCard]:[homeCard,awayCard],wickets:{home:Object.fromEntries(awayCard.bowling.map(b=>[b.player.id,b.wickets])),away:Object.fromEntries(homeCard.bowling.map(b=>[b.player.id,b.wickets]))}};
 }
 function frameCount(r){return 2+[r.homeInnings,r.awayInnings].reduce((n,i)=>n+(i?.deliveries?.length||0)+(i?.notices?.length||0),0)+(r.superOver?.rounds||[]).reduce((n,round)=>n+round.innings.reduce((a,i)=>a+1+i.deliveries.length,0),0);}
 function validResult(r,ids){
  try{
   const pair=[[r.homeInnings,r.home],[r.awayInnings,r.away]];
   if(pair.every(([i])=>i?.deliveryVersion==null))return true;
   if(pair.some(([i])=>i?.deliveryVersion!==1))return false;
   for(const [inn,club]of pair){
    const card=r.scorecard?.innings?.find(c=>c.club.abbr===club.abbr),ds=inn.deliveries;
    if(!card||!Array.isArray(ds)||!ds.length||ds.length>800||!Array.isArray(inn.notices)||inn.notices.length>200)return false;
    const bats=new Map(card.batting.map(b=>[b.player.id,{runs:0,balls:0,fours:0,sixes:0,outs:0}])),bowls=new Map(card.bowling.map(b=>[b.player.id,{runs:0,balls:0,wickets:0}])),ex={total:0,wides:0,noBalls:0,byes:0,legByes:0},ph={pp:0,mid:0,death:0},pb={pp:0,mid:0,death:0};
    let total=0,wickets=0,balls=0,previous=null,freeHit=false;
    const surge=inn.surge?.startOver;if(surge!=null&&(!Number.isInteger(surge)||surge<11||surge>19))return false;
    for(const d of ds){
     if(!d||d.kind!=='ball'||!ids.has(d.batterId)||!ids.has(d.nonStrikerId)||!ids.has(d.bowlerId)||d.batterId===d.nonStrikerId||!bats.has(d.batterId)||!bowls.has(d.bowlerId)||typeof d.legal!=='boolean'||typeof d.wicket!=='boolean'||typeof d.surge!=='boolean'||d.freeHit!==freeHit||!Number.isInteger(d.runs)||!Number.isInteger(d.batRuns)||![0,1,2,3,4,6].includes(d.batRuns)||!Number.isInteger(d.extraRuns)||d.extraRuns<0||d.extraRuns>6||d.runs!==d.batRuns+d.extraRuns)return false;
     if(wickets===10||balls===120||d.over!==Math.floor(balls/6)+1||d.ball!==balls%6+1)return false;
     if(previous&&previous.nextStrikerId!==d.batterId||previous&&previous.nextNonStrikerId!==d.nonStrikerId)return false;
     if(previous&&previous.over===d.over&&previous.bowlerId!==d.bowlerId||previous&&previous.over!==d.over&&previous.bowlerId===d.bowlerId)return false;
     const restricted=d.over<=4||(surge!=null&&d.over>=surge&&d.over<surge+2),phase=restricted?'pp':d.over<=15?'mid':'death';
     if(d.phase!==phase||d.surge!==!!(surge!=null&&d.over>=surge&&d.over<surge+2))return false;
     if(d.extra!=null&&!['wides','noBalls','byes','legByes'].includes(d.extra)||d.legal===['wides','noBalls'].includes(d.extra)||d.extra==null&&d.extraRuns!==0)return false;
     if(d.wicket&&(typeof d.dismissal!=='string'||!d.legal||freeHit&&!d.dismissal.startsWith('run out')))return false;
     const b=bats.get(d.batterId),bo=bowls.get(d.bowlerId);total+=d.runs;ph[phase]+=d.runs;b.runs+=d.batRuns;if(d.batRuns===4)b.fours++;if(d.batRuns===6)b.sixes++;
     if(d.extra){ex[d.extra]+=d.extraRuns;ex.total+=d.extraRuns;}bo.runs+=d.batRuns+(['wides','noBalls'].includes(d.extra)?d.extraRuns:0);
     if(d.legal){balls++;bo.balls++;pb[phase]++;freeHit=false;}if(d.extra!=='wides')b.balls++;if(d.extra==='noBalls')freeHit=true;
     if(d.wicket){wickets++;b.outs++;if(!d.dismissal.startsWith('run out'))bo.wickets++;}
     if(d.total!==total||d.wickets!==wickets||d.balls!==balls||bo.balls>24)return false;previous=d;
    }
    if(inn.total!==total||inn.balls!==balls||inn.wickets!==wickets||card.total!==total||card.balls!==balls||card.wickets!==wickets||card.extras!==ex.total)return false;
    for(const k of ['pp','mid','death'])if(inn[k]!==ph[k]||card.phases[k]!==ph[k]||card.phaseBalls?.[k]!==pb[k]||inn.phaseBalls?.[k]!==pb[k])return false;
    for(const k of Object.keys(ex))if(card.extrasBreakdown[k]!==ex[k]||inn.extrasBreakdown?.[k]!==ex[k])return false;
    for(const b of card.batting){const t=bats.get(b.player.id),historicalBalls=t.balls-ds.filter(d=>d.batterId===b.player.id&&d.extra==='noBalls').length;/* Previous delivery saves omitted no-balls from balls faced. Preserve those records without rewriting them. */const savedBalls=b.balls;if(b.runs!==t.runs||inn.batterRuns?.[b.player.id]!==t.runs||![t.balls,historicalBalls].includes(savedBalls)||b.fours!==t.fours||b.sixes!==t.sixes||(b.dismissal!=='not out'&&!b.dnb?1:0)!==t.outs||(savedBalls?Math.abs(b.sr-b.runs*100/savedBalls)>1e-9:b.sr!==null))return false;}
    for(const b of card.bowling){const t=bowls.get(b.player.id);if(b.runs!==t.runs||b.balls!==t.balls||b.wickets!==t.wickets||(b.balls?Math.abs(b.economy-b.runs*6/b.balls)>1e-9:b.economy!==null))return false;}
    for(const n of inn.notices){if(!Number.isInteger(n.after)||n.after<0||n.after>ds.length||typeof n.text!=='string'||n.text.length>500)return false;const last=ds[n.after-1];if(n.total!==(last?.total||0)||n.balls!==(last?.balls||0)||n.wickets!==(last?.wickets||0))return false;}
    const chasing=r.battingSecond?.abbr===club.abbr,target=chasing?(r.battingFirst.abbr===r.home.abbr?r.homeInnings:r.awayInnings).total+1:0;
    if(target&&ds.slice(0,-1).some(d=>d.total>=target)||balls!==120&&wickets!==10&&!(target&&total>=target))return false;
   }
   return true;
  }catch{return false;}
 }
 return {play,scorecard,frameCount,validResult};
})();
