"""Presentation-only complete match management consequences."""
import re

RESULT = r'''X.managementResult=r=>{if(!r||!results().includes(r))return '';const events=X.managementState().events.filter(e=>e.key===keys(r)&&e.year===s.year),urgent=events.filter(e=>['broken','transfer'].includes(e.kind)).length,concerns=events.filter(e=>['selection','batting','bowling'].includes(e.kind)).length,positive=events.filter(e=>['kept','resolved'].includes(e.kind)).length;const labels={broken:'Commitment not met',transfer:'Transfer request',selection:'Selection concern',batting:'Batting role concern',bowling:'Bowling role concern',kept:'Commitment kept',resolved:'Request resolved'};return `<section class="g8dressingroom gccuiConsequences ${urgent?'has-urgent':''}" aria-label="Match management consequences"><header><span class="g8eyebrow">BEYOND THE SCORE</span><h2>What this changes</h2></header>${events.length?`<p class="gccuiConsequenceCount"><strong>${events.length} management consequence${events.length===1?'':'s'}</strong>${urgent?` · ${urgent} urgent`:''}${concerns?` · ${concerns} role or selection concern${concerns===1?'':'s'}`:''}${positive?` · ${positive} positive`:''}</p>${urgent?'<p class="gccuiConsequenceAlert">A commitment was not met or a player requested a move. Review the changes before continuing.</p>':''}<details class="gccuiConsequenceList"><summary>Review all ${events.length} consequences and affected players</summary><ol>${events.map(e=>{const p=G.byId(e.playerId);return `<li><div><strong>${esc(labels[e.kind]||'Management update')}</strong><p>${esc(e.text)}</p></div>${p&&roster().some(q=>q.id===p.id)?btn('Review '+p.name,'manageInspect',[p.id],'g8ghost g8small'):''}</li>`;}).join('')}</ol></details>`:'<p class="gccuiConsequenceQuiet">No new management consequences recorded for this match.</p>'}</section>`;};'''

def transform(source: str) -> str:
    pattern = r'X\.managementResult=r=>\{.*?\n(?= X\.storyPanel=X\.managementBrief;)'
    output, count = re.subn(pattern, lambda _: RESULT+'\n', source, flags=re.S)
    if count != 1:
        raise ValueError(f'Expected one managementResult block, found {count}')
    return output
