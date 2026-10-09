function annualDraftNeedsHtml(){
    const ps=roster(state.userClub.abbr),o=state.dynasty.offseason;
    const keeper=ps.filter(isKeeper).length,bowlers=ps.filter(isBowler).length,openers=ps.filter(p=>Number(p.bat||0)>=70&&Number(p.preferredSlot||6)<=2).length,finishers=ps.filter(p=>Number(p.finishing||0)>=80).length;
    const mine=(o?.picks||[]).filter(x=>x.owner===state.userClub.abbr).length;
    const reads=[
      ['KEEPER',keeper,1,keeper?'Covered':'Need one'],
      ['BOWLING',bowlers,6,bowlers>=6?'Six options':bowlers===5?'One short':'Needs depth'],
      ['OPENERS',openers,3,openers>=3?'Covered':openers===2?'Could add one':'Needs options'],
      ['FINISHERS',finishers,2,finishers>=2?'Covered':finishers===1?'Could add one':'Needs power']
    ];
    return `<section class="annual-draft-needs"><div class="annual-draft-needs-head"><div><span class="kicker">LIST BALANCE</span><b>${ps.length}/15 on the list</b></div><span>${mine} drafted this year</span></div><div class="annual-draft-needs-grid">${reads.map(([label,value,target,detail])=>`<div class="annual-draft-need ${value>=target?'good':'warn'}"><span>${label}</span><b>${value}</b><small>${detail}</small></div>`).join('')}</div></section>`
  }