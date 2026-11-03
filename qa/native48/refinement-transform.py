"""Presentation refinement following native Build48 inspection."""
def once(s,a,b):
 n=s.count(a)
 if n!=1: raise ValueError(f'Expected one marker {a[:70]!r}, got {n}')
 return s.replace(a,b,1)
def transform(s):
 # Reuse precisely the same decision collection for disclosure counts and rows.
 start=s.index('const state=X.managementState(),all=roster().flatMap',s.index(' X.managementBrief='))
 end=s.index(',rows=all.slice(0,3)',start)
 declaration=s[start:end]
 detail_start=s.index('const detail=',s.index(' X.managementBrief='))
 detail=s[detail_start:start]
 s=s[:start]+'const all=X.managementDecisions()'+s[end:]
 s=s.replace(detail,'',1)
 helper=' X.managementDecisions=()=>{'+detail+declaration.replace('const state=X.managementState(),all=', 'const state=X.managementState();return ')+';};\n'
 helper+=''' X.managementSummary=()=>{const all=X.managementDecisions();if(!all.length)return '';const state=X.managementState(),medical=all.filter(x=>X.injury(x.p)).length,moves=all.filter(x=>state.players[x.p.id]?.requested).length,label=`${all.length} squad decision${all.length===1?'':'s'}${medical?' · '+medical+' medical':''}${moves?' · '+moves+' move request'+(moves===1?'':'s'):''}`;return X.disclosure(label,X.managementBrief(true),'gccuiSquadDecisions'+(medical||moves?' has-alert':''));};
'''
 s=once(s,' X.managementBrief=',helper+' X.managementBrief=')
 s=once(s,"${X.managementBrief(true)?X.disclosure('Squad decisions to review',X.managementBrief(true)):''}", '${X.managementSummary()}')
 # Give each button a distinct target while retaining concise visible wording.
 for old,label in [("btn('Trade','trade',[false,p.id],'g8small')",'Trade ${esc(p.name)}'),("btn('Review release','release',[p.id],'g8small g8danger',!m.remaining||p.dynastyReplacement)",'Review release of ${esc(p.name)}'),("btn('Review player','manageInspect',[p.id],'g8ghost g8small')",'Review ${esc(p.name)} management')]:
  s=once(s,old,old+".replace('type=\"button\"',`type=\"button\" aria-label=\""+label+"\"`)")
 # Compact optional planning and rules without losing any original rule text.
 helpers=''' X.scoutingBrief=()=>X.cleanSeasonBrief(X.ui.seasonBrief)?X.disclosure(`${s.year-1} scouting brief`,X.previousSeasonBrief()):'<p class="gccuiBriefUnavailable">Previous-season phase data unavailable for this save.</p>';
 X.managementAllowance=()=>{const m=X.offseasonState(),b=read.departureBudget(),t=read.tradeAllowance();return `<section class="gccuiAllowance" aria-label="Available squad changes"><strong>${m.remaining} release${m.remaining===1?'':'s'} · ${t} trade${t===1?'':'s'} left</strong><span>${b.remaining} voluntary departure${b.remaining===1?'':'s'} remaining</span>${X.disclosure('Departure rules',X.departureGuide())}</section>`;};
'''
 s=once(s,' X.offseasonMarket=',helpers+' X.offseasonMarket=')
 s=once(s,"+X.offseasonSteps()+X.disclosure(`${s.year-1} scouting brief`,X.previousSeasonBrief())+(managing?X.departureGuide():'')", "+(managing?'':X.offseasonSteps())+(managing?X.managementAllowance():'')")
 s=once(s,"managing?btn('Back to overview','offseasonPane',['overview'],'g8ghost')+btn(vacancies?'Continue to draft draw':'Keep squad · review XI',vacancies?'reviewList':'keepSquad',[],'g8primary'):''", "managing?btn('Back to overview','offseasonPane',['overview'],'g8ghost'):''")
 s=once(s,"'Manage squad':'Prepare your squad','Players stay automatically. Make changes only where you want them.'", "'Manage squad':'Prepare your squad',managing?'Review roles, fitness and requests before changing your squad.':'Players stay automatically. Make changes only where you want them.'")
 s=once(s,"${X.disclosure('Releases, trades & replacement picks'", "${X.scoutingBrief()}<div class=\"gccuiManageContinue\">${btn(vacancies?'Continue to draft draw':'Keep squad · review XI',vacancies?'reviewList':'keepSquad',[],'g8primary')}</div>${X.disclosure('Releases, trades & replacement picks'")
 s=once(s,'</section><aside class="g8annualdevelopment"', '</section>${X.scoutingBrief()}<aside class="g8annualdevelopment"')
 return s
