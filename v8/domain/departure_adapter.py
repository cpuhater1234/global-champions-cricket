"""Shared departure accounting, applied to the preserved dynasty engine."""
from pathlib import Path
ROOT=Path(__file__).resolve().parent
def adapt(name,script):
 if name!='dynasty':return script
 def swap(old,new):
  nonlocal script
  assert script.count(old)==1,(old[:100],script.count(old))
  script=script.replace(old,new)
 swap('  function voluntaryCutLimit(){return Math.min(2,Math.max(0,4-userRetirementCount()))}',(ROOT/'departure_budget.js').read_text().rstrip())
 swap('userPickAssets:{},voluntaryCuts:[]','userPickAssets:{},tradeDepartures:{},voluntaryCuts:[]')
 swap('used.has(a.abbr)||used.has(b.abbr))continue;', 'used.has(a.abbr)||used.has(b.abbr)||offseasonTradeBlock(a.abbr,b.abbr))continue;')
 swap("used.add(a.abbr);used.add(b.abbr);log('TRADE'", "used.add(a.abbr);used.add(b.abbr);recordOffseasonTrade(a.abbr,b.abbr);log('TRADE'")
 swap('const shapeBlock=cpuTradeBlockReason(club,target,offer);','const shapeBlock=(!midseason&&offseasonTradeBlock(state.userClub.abbr,club))||cpuTradeBlockReason(club,target,offer);')
 swap("if(pick)transferUserPick(pick,club);log('TRADE'", "if(pick)transferUserPick(pick,club);if(!midseason)recordOffseasonTrade(state.userClub.abbr,club);log('TRADE'")
 swap('o.releasePickPolicy=1;o.lottery=', 'o.releasePickPolicy=1;o.supplementSnakePolicy=1;o.lottery=')
 swap("annualDraftBoardVisible=false;o.phase='draft';", "annualDraftBoardVisible=false;o.supplementSnakePolicy=1;o.phase='draft';")
 swap('function cpuDraftPick(abbr){const o=', 'function cpuDraftPick(abbr){if(rosterIds(abbr).length>=15)return null;const o=')
 swap("if(!o||o.phase!=='draft'||!p||!slot||draftOwner(slot)!==state.userClub.abbr||", "if(!o||o.phase!=='draft'||!p||!slot||rosterIds(state.userClub.abbr).length>=15||draftOwner(slot)!==state.userClub.abbr||")
 swap('tradeBlock:(abbr,target,offer)=>cpuTradeBlockReason(abbr,pById(target),pById(offer)),','tradeBlock:(abbr,target,offer)=>offseasonTradeBlock(state.userClub.abbr,abbr)||cpuTradeBlockReason(abbr,pById(target),pById(offer)),departureBudget:abbr=>clubDepartureBudget(abbr||state.userClub.abbr),')
 swap('cutBudget:()=>({limit:voluntaryCutLimit(),retired:userRetirementCount()})','cutBudget:()=>({...clubDepartureBudget(state.userClub.abbr),limit:voluntaryCutLimit()})')
 swap("o.phase='lottery';log('DRAFT DRAW'","lockDraftEntitlements();o.phase='lottery';log('DRAFT DRAW'")
 swap("annualDraftBoardVisible=false;o.supplementSnakePolicy=1;","annualDraftBoardVisible=false;lockDraftEntitlements();o.supplementSnakePolicy=1;")
 swap('tradeValue,marketBand};','tradeValue,marketBand,proposePackage};')
 swap('departureBudget:abbr=>clubDepartureBudget(abbr||state.userClub.abbr),','departureBudget:abbr=>clubDepartureBudget(abbr||state.userClub.abbr),tradeAllowance:abbr=>seasonTradeAllowance(abbr||state.userClub.abbr),packageProblem,clubOwnsPick,')
 swap("o.phase='ready';o.cutsComplete=true;", "snapshotDepartureBudgets();o.phase='ready';o.cutsComplete=true;")
 start=script.index('  function proposeTrade(midseason=false)');end=script.index('  function drawDraftOrder()',start)
 script=script[:start]+(ROOT/'trade_packages.js').read_text()+script[end:]
 script=script.replace('state.round===7&&!state.dynasty.midseasonDone[state.year]', 'state.round<3&&seasonTradeAllowance(state.userClub.abbr)>0')
 return script
