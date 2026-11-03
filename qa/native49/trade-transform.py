"""Trade presentation fixes from native Build49 inspection."""
def once(s,a,b):
 n=s.count(a)
 if n!=1: raise ValueError(f'Expected one marker {a[:65]!r}, got {n}')
 return s.replace(a,b,1)
def transform(s):
 s=once(s,"${btn('Scout','inspect',[p.id],'g8small')}", "${btn('Scout','inspect',[p.id],'g8small').replace('type=\"button\"',`type=\"button\" aria-label=\"Scout ${esc(p.name)}\" data-trade-scout=\"${p.id}\"`)}")
 s=once(s,"'<div class=\"g8tradeempty\">Choose a player.</div>'", "''")
 s=once(s,'<label>Optional second player<select data-input="${key}2">', '<label>${give?\'Your second player (optional)\':\'Their second player (optional)\'}<select aria-describedby="gccuiTradeStatus" data-input="${key}2">')
 s=once(s,'<select data-input="${key}">${options', '<select aria-describedby="gccuiTradeStatus" data-input="${key}">${options')
 s=once(s,"${key.endsWith('2')?'Optional second pick':'Optional draft pick'}<select data-input=\"${key}\">", "${key.startsWith('tradeReceive')?'Their':'Your'} ${key.endsWith('2')?'second pick (optional)':'draft pick (optional)'}<select aria-describedby=\"gccuiTradeStatus\" data-input=\"${key}\">")
 s=once(s,'Other club<select data-input="tradeClub">', 'Other club<select aria-describedby="gccuiTradeStatus" data-input="tradeClub">')
 s=once(s,' function tradeDialog(){', ''' function tradeStatus(){if(!tradeValid())return 'Choose assets on both sides to review a trade.';const problem=read.packageProblem(tradeDeal());return problem||'Both clubs can consider this package. Review the offer before confirming.';}
 function tradeDialog(){''')
 s=once(s,'<div class="g8trade g8tradepackage">','<p id="gccuiTradeStatus" class="gccuiScreenReader" role="status">${esc(tradeStatus())}</p><div class="g8trade g8tradepackage">')
 s=once(s,"if(back==='trade')tradeDialog();", "if(back==='trade'){tradeDialog();content.querySelector(`[data-trade-scout=\"${Number(ui.selectedPlayer)}\"]`)?.focus({preventScroll:true});}")
 s=once(s,"${deal.takePicks.join(' and ')} picks.", "${deal.takePicks.map(r=>'Round '+r.slice(1)).join(' and ')} ${deal.takePicks.length===1?'pick':'picks'}.")
 return s
