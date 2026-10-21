/* A pick adds an opportunity to improve a fifteen-player list, not a second star's full value. */
function pickAssetValue(round,toClub){
 const o=state.dynasty.offseason;if(!o?.lottery?.length||!userOwnsPick(round)||!state.teams[toClub])return 0;
 const slots=slotsWithSupplement(),key=`${round}:${state.userClub.abbr}`,index=slots.findIndex(slot=>slot.key===key);if(index<0)return 0;
 const values=new Map(),value=p=>{if(!values.has(p.id))values.set(p.id,tradeValue(p,toClub));return values.get(p.id);};
 const board=freeAgentPool().slice().sort((a,b)=>value(b)-value(a)||a.id-b.id),prospect=board[index];if(!prospect)return 0;
 const before=roster(toClub),replaceable=before.filter(p=>!p.dynastyReplacement&&!cpuTradeBlockReason(toClub,p,prospect)),alternatives=replaceable.map(value);
 // Existing vacancy picks already fill the list. An acquired earlier pick may
 // improve that last selection; otherwise it must improve a retained player.
 const need=Math.max(0,15-before.length),owned=slots.map((slot,i)=>({slot,i})).filter(x=>x.slot.owner===toClub),last=owned[Math.min(need,owned.length)-1];
 if(need&&last&&board[last.i])alternatives.push(value(board[last.i]));
 if(!alternatives.length)return 0;
 return Math.max(0,Math.round(value(prospect)-Math.min(...alternatives)));
}
