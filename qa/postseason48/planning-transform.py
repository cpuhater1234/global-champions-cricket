"""Presentation-only season evidence handoff; no historical backfill."""
import re

HELPERS = r''' X.seasonPhaseBrief=(results,year,club)=>{
  const totals={pp:[0,0,0,0],mid:[0,0,0,0],death:[0,0,0,0]};
  for(const r of results){if(!r?.home||!r?.away||![r.home.abbr,r.away.abbr].includes(club))continue;const mine=r.home.abbr===club?r.homeInnings:r.awayInnings,theirs=r.home.abbr===club?r.awayInnings:r.homeInnings;if(!mine||!theirs)continue;for(const k of Object.keys(totals)){const t=totals[k];t[0]+=mine[k];t[1]+=X.phaseBalls(mine,k);t[2]+=theirs[k];t[3]+=X.phaseBalls(theirs,k);}}
  return X.cleanSeasonBrief({version:1,year,club,phases:Object.entries(totals).map(([key,t])=>({key,scored:t[1]?t[0]*6/t[1]:0,conceded:t[3]?t[2]*6/t[3]:0,batBalls:t[1],bowlBalls:t[3]}))},year,club);
 };
 X.cleanSeasonBrief=(v,year=s.year-1,club=s.userClub?.abbr)=>{
  if(!v||v.version!==1||!Number.isInteger(v.year)||v.year<2008||v.year>2026||v.year!==year||typeof club!=='string'||!club||v.club!==club||!Array.isArray(v.phases)||v.phases.length!==3)return null;
  const keys=new Set();for(const p of v.phases){if(!p||!['pp','mid','death'].includes(p.key)||keys.has(p.key)||!['batBalls','bowlBalls'].every(k=>Number.isSafeInteger(p[k]))||!['scored','conceded','batBalls','bowlBalls'].every(k=>Number.isFinite(p[k])&&p[k]>=0))return null;keys.add(p.key);}
  return {version:1,year:v.year,club:v.club,phases:v.phases.map(p=>({key:p.key,scored:p.scored,conceded:p.conceded,batBalls:p.batBalls,bowlBalls:p.bowlBalls}))};
 };
 X.previousSeasonBrief=()=>{
  const brief=X.cleanSeasonBrief(X.ui.seasonBrief),labels={pp:'Field-restriction overs',mid:'Middle overs',death:'Death overs'},phases=brief?.phases.filter(p=>p.batBalls>=36&&p.bowlBalls>=36).sort((a,b)=>(a.scored-a.conceded)-(b.scored-b.conceded))||[],w=phases[0],market=s.dynasty?.offseason?.phase==='market';
  return `<section class="g8seasonplan gccuiSeasonBrief" aria-label="Previous season planning"><span class="g8eyebrow">${brief?brief.year+' · BEFORE YOU BUILD AGAIN':'PREVIOUS-SEASON EVIDENCE'}</span>${w?`<p>${w.scored<w.conceded?`${esc(labels[w.key])} had your largest sampled scoring-rate deficit: ${w.scored.toFixed(2)} scored and ${w.conceded.toFixed(2)} conceded per over.`:'You matched or outscored opponents in every sampled phase.'} Use the scorebooks as a starting point for scouting.</p><details class="g8moredata"><summary>Review ${brief.year} phase evidence</summary>${phases.map(p=>`<p><b>${esc(labels[p.key])}</b> · ${p.scored.toFixed(2)} scored / ${p.conceded.toFixed(2)} conceded per over · ${p.batBalls} batting / ${p.bowlBalls} bowling balls.</p>`).join('')}<p>Regular-season scorebooks only. Phases require at least 36 legal balls per side. Chase lengths and wickets affect these rates; they do not establish causes.</p></details>`:'<p>No previous-season phase evidence was retained for this save. Review the current squad before making changes.</p>'}${market?btn('Review squad','offseasonPane',['players'],'g8ghost'):''}</section>`;
 };
'''

def once(source, old, new):
    n=source.count(old)
    if n != 1: raise ValueError(f'Expected one marker {old[:65]!r}, found {n}')
    return source.replace(old,new,1)

def transform(reads: str, career: str, controller: str) -> tuple[str,str,str]:
    start=reads.index(' X.seasonPlan=()=>{')
    end=reads.index("  if(!reads.length)return '';",start)
    reads=reads[:start]+HELPERS+''' X.seasonPlan=()=>{
  const brief=X.seasonPhaseBrief(s.results,s.year,s.userClub.abbr),labels={pp:'field-restriction overs',mid:'middle overs',death:'death overs'},reads=(brief?.phases||[]).filter(p=>p.batBalls>=36&&p.bowlBalls>=36).map(p=>({k:p.key,for:p.scored,against:p.conceded})).sort((a,b)=>(a.for-a.against)-(b.for-b.against));
'''+reads[end:]
    career=once(career,"+X.offseasonSteps()+(managing?X.departureGuide():'')", "+X.offseasonSteps()+X.previousSeasonBrief()+(managing?X.departureGuide():'')")
    controller=once(controller,'resultFinal:ui.result?.final};','resultFinal:ui.result?.final,seasonBrief:X.cleanSeasonBrief(ui.seasonBrief)};')
    controller=once(controller,'function restorePresentation(){cancelReveal();','function restorePresentation(){ui.seasonBrief=X.cleanSeasonBrief(s.dynasty?.v8UI?.seasonBrief);cancelReveal();')
    controller=once(controller,"D.beginOffseason();resetFilters();setView('dynasty');", "ui.seasonBrief=X.seasonPhaseBrief(s.results,s.year,own());D.beginOffseason();resetFilters();setView('dynasty');")
    return reads,career,controller
