  function clubOwnsPick(round,abbr){const o=state.dynasty?.offseason;return !!(o&&['market','lottery'].includes(o.phase)&&['R1','R2'].includes(round)&&draftSlots().some(p=>p.key===`${round}:${abbr}`&&p.owner===abbr));}
  function packageShapeBlock(abbr,outIds,inIds){
    const before=roster(abbr),after=before.filter(p=>!outIds.includes(p.id)).concat(inIds.map(pById));
    for(const [test,min,label]of [[isKeeper,1,'recognised wicketkeeper'],[isBowler,6,'viable bowling group'],[isBattingOption,7,'viable batting depth']]){const a=before.filter(test).length,b=after.filter(test).length;if(b<Math.min(min,a))return `They will not weaken their ${label}.`;}
    return '';
  }
  function packageProblem(deal){
    if(!deal||typeof deal!=='object'||typeof deal.mid!=='boolean')return 'Build a trade package first.';
    const {club,give,take,givePicks,takePicks,mid}=deal,own=state.userClub?.abbr,o=state.dynasty?.offseason;
    if(!own||!state.teams[club]||club===own)return 'Choose another club.';
    if(mid?state.round>=3||!state.fullSchedule?.length||!!o:!o||!['market','lottery'].includes(o.phase))return 'The trade window is closed.';
    for(const a of [give,take,givePicks,takePicks])if(!Array.isArray(a)||a.length>2||new Set(a).size!==a.length)return 'Each club can include at most two different players and two different picks.';
    if(!give.length&&!givePicks.length||!take.length&&!takePicks.length)return 'Each club must contribute a player or a pick.';
    for(const [abbr,ids]of [[own,give],[club,take]])if(ids.some(id=>!Number.isInteger(id)||!rosterIds(abbr).includes(id)||pById(id)?.dynastyReplacement||pById(id)?.dynastyRetired))return 'A selected player is no longer available.';
    if(mid&&(givePicks.length||takePicks.length))return 'Draft picks can only be traded after the offseason draw.';
    if(givePicks.some(r=>!clubOwnsPick(r,own))||takePicks.some(r=>!clubOwnsPick(r,club)))return 'A selected draft pick is no longer owned by that club.';
    for(const [abbr,n]of [[own,give.length],[club,take.length]]){
      if(!seasonTradeAllowance(abbr))return `${abbr===own?'Your club':clubByAbbr(abbr).name} has already completed two trades this season.`;
      if(n>clubDepartureBudget(abbr).remaining)return `${abbr===own?'Your club':clubByAbbr(abbr).name} has no voluntary departures available for this package. Retirements, releases and outgoing players share the four-departure allowance.`;
    }
    if(rosterIds(own).length-give.length+take.length>15||rosterIds(club).length-take.length+give.length>15)return 'This package would leave a club with more than fifteen players. Balance the players or create a vacancy first.';
    if(mid&&give.length!==take.length)return 'Midseason exchanges must leave both squads at fifteen players.';
    return packageShapeBlock(club,take,give);
  }
  function packagePickValue(round,from,to){
    if(!clubOwnsPick(round,from))return 0;
    if(from===state.userClub.abbr)return pickAssetValue(round,to);
    const slots=slotsWithSupplement(),index=slots.findIndex(s=>s.key===`${round}:${from}`),board=freeAgentPool().map(p=>({p,value:tradeValue(p,to)})).sort((a,b)=>b.value-a.value||a.p.id-b.p.id),prospect=board[index];if(!prospect)return 0;
    const retained=roster(to).filter(p=>!p.dynastyReplacement&&!cpuTradeBlockReason(to,p,prospect.p)).map(p=>tradeValue(p,to));
    const needs=Math.max(0,15-rosterIds(to).length),owned=slots.map((s,i)=>({s,i})).filter(x=>x.s.owner===to),last=owned[Math.min(needs,owned.length)-1];if(needs&&last&&board[last.i])retained.push(board[last.i].value);
    return retained.length?Math.max(0,Math.round(prospect.value-Math.min(...retained))):0;
  }
  function proposePackage(deal){
    const problem=packageProblem(deal);if(problem)return {accepted:false,message:problem};
    const {club,give,take,givePicks,takePicks,mid}=deal,own=state.userClub.abbr;
    let offered=give.reduce((n,id)=>n+tradeValue(pById(id),club),0)+givePicks.reduce((n,r)=>n+packagePickValue(r,own,club),0);
    let asked=take.reduce((n,id)=>n+tradeValue(pById(id),own),0)+takePicks.reduce((n,r)=>n+packagePickValue(r,club,own),0);
    // Additional depth players have an opportunity cost, rather than adding their full rating to a star bid.
    offered-=Math.max(0,give.length-take.length)*70;asked-=Math.max(0,take.length-give.length)*70;
    const threshold=.96+prand(`${state.seed}|${state.year}|${club}|${take.map(id=>pById(id).name).join('|')}`)*.14;
    if(offered<Math.max(1,asked)*threshold)return {accepted:false,message:`${club} reject it. They value their side of the package more highly.`};
    if(!mid&&state.dynasty.offseason?.lottery?.length)lockDraftEntitlements();
    const tradedFromXI=mid&&give.some(id=>state.xi.includes(id)||state.xi.includes(state.dynasty.replacementFor[id]));
    if(mid){for(const id of [...give,...take])if(state.dynasty.replacementFor[id])resolveReplacementReturn(id,'trade');for(const id of give)settleUserTenure(id);state.xi=state.xi.filter(id=>!give.includes(id));state.battingOrder=state.battingOrder.filter(id=>!give.includes(id));if(give.includes(state.pendingSwapIn))state.pendingSwapIn=null;}
    state.teams[own]=rosterIds(own).filter(id=>!give.includes(id)).concat(take);state.teams[club]=rosterIds(club).filter(id=>!take.includes(id)).concat(give);
    for(const id of give)pById(id).draftedBy=club;for(const id of take){pById(id).draftedBy=own;if(mid)beginUserTenure(id);}
    for(const r of givePicks)state.dynasty.offseason.pickOwners[`${r}:${own}`]=club;
    for(const r of takePicks)state.dynasty.offseason.pickOwners[`${r}:${club}`]=own;
    recordOffseasonTrade(own,club,give.length,take.length);
    const receive=take.map(id=>pById(id).name).join(', ')||takePicks.join(' + '),send=give.map(id=>pById(id).name).join(', ')||givePicks.join(' + ');
    log('TRADE',`${own} acquire ${receive}`,`${send} → ${club}${givePicks.length?` · ${givePicks.join(' + ')} picks included`:''}`,'good');
    if(mid){base.renderTeam();renderSeasonLayer();if(tradedFromXI)specialGo('team');}else renderOffseason();autoSave();return {accepted:true,message:`${club} accept. The players and picks have changed clubs.`,give:[...give],take:[...take]};
  }
  function proposeTrade(midseason=false){
    const result=proposePackage({club:$('tradeClub')?.value,give:[Number($('tradeOffer')?.value)],take:[Number($('tradeTarget')?.value)],givePicks:$('tradePick')?.value?[$('tradePick').value]:[],takePicks:[],mid:midseason});
    const r=$('tradeRead');if(r){r.className=`trade-read ${result.accepted?'good':'bad'}`;r.textContent=result.message;}return result;
  }
