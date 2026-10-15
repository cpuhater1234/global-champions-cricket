/* Translate the existing cricket model into jobs, without guessing handedness or a spin subtype. */
(() => {
 const X=window.GCC8,{G,R,esc,btn,roster,injury}=X;
 X.battingJob=p=>({OPEN:'Opener',TOP:'Top order',MIDDLE:'Middle order',LOWER:'Lower order',TAIL:'Tail end'}[R.battingRoleBand(p)]||'Middle order');
 X.bowlingType=p=>({PACE:'Pace bowler',SPIN:'Spin bowler',DUAL:'Pace & spin'}[R.bowlingStyle(p)]||'Batting specialist');
 X.isFinisher=p=>p.bat>=50&&p.preferredSlot>=4&&p.finishing>=86&&p.power>=84;
 X.bowlingJob=p=>{
  if(!R.bowlingWorkload(p)||!R.bowlingStyle(p))return '';
  const newBall=R.bowlPhaseScore(p,'newBall'),middle=R.bowlPhaseScore(p,'middle'),death=R.bowlPhaseScore(p,'death');
  if(R.bowlingStyle(p)==='SPIN')return newBall>middle+8?'Powerplay spin option':'Middle-overs spin';
  if(R.bowlingStyle(p)==='DUAL')return 'Middle-overs option';
  if(newBall>=76&&death>=76&&newBall>=middle-4&&death>=middle-4)return 'New ball & death';
  const best=Math.max(newBall,middle,death);return best===newBall?'New-ball option':best===death?'Death-overs option':'Middle-overs option';
 };
 X.roleLine=p=>{
  const bat=X.battingJob(p),type=X.bowlingType(p),job=X.bowlingJob(p);
  if(p.role==='BOWL')return [type,job].filter(Boolean).join(' · ');
  if(p.role==='AR'){const job=p.bat>=p.bowl+15?'Batting all-rounder':p.bowl>=p.bat+15?'Bowling all-rounder':'All-rounder';return [bat,job,type==='Batting specialist'?null:type.replace(' bowler','')+' option',X.isFinisher(p)?'Finishing power':null].filter(Boolean).join(' · ');}
  return [bat,p.role==='WK-BAT'?'Wicketkeeper':null,X.isFinisher(p)?'Finishing power':null].filter(Boolean).join(' · ');
 };
 const chip=p=>btn(p.name,'inspect',[p.id],'g8rolechip'+(injury(p)?.status==='OUT'?' g8unavailable':''));
 X.teamRead=(squad=false)=>{
  const ps=squad?roster():G.state.xi.map(G.byId).filter(Boolean),fit=ps.filter(p=>injury(p)?.status!=='OUT'),profile=squad?X.squadProfile():X.profile();
  const groups=[['Openers','cricket',fit.filter(p=>X.battingJob(p)==='Opener')],['Middle order','shirt-sport',fit.filter(p=>['Top order','Middle order','Lower order'].includes(X.battingJob(p))&&p.bat>=50)],['All-rounders','users-group',fit.filter(p=>p.role==='AR')],['Pace attack','cricket',fit.filter(p=>['PACE','DUAL'].includes(R.bowlingStyle(p))&&R.bowlingWorkload(p)>0)],['Spin options','cricket',fit.filter(p=>['SPIN','DUAL'].includes(R.bowlingStyle(p))&&R.bowlingWorkload(p)>0)],['Behind the stumps','shield-check',fit.filter(R.isKeeper)]];
  const partial=fit.length<11,cover=partial?'Still taking shape':profile.oversCapacity>=20&&profile.trustedOversCapacity>=18?'Bowling depth covered':profile.trustedOversCapacity>=16?'A little short on bowling':'Needs another bowling option';
  const note=partial?'Keep building the side around its cricket jobs.':profile.roleFit<84?'Some batting jobs sit outside these players’ usual roles.':!fit.some(R.isKeeper)?'No recognised keeper. Check who can take the gloves.':profile.keeping<65?'A recognised keeper is selected, but current glove work needs attention.':profile.death<70?'Late-over bowling needs attention.':'You have options across the innings. Conditions and execution still matter.';
  return `<section class="g8teamread g8roleboard"><div class="g8roleboardhead"><span class="g8eyebrow">${squad?'YOUR SQUAD':'YOUR XI'}</span><div class="g8teamrating"><strong>${fit.length?Math.round(profile.overall):"—"}</strong><span>${squad?"Squad preview":"XI rating"}</span></div><b class="g8coverread">${cover}</b></div><div class="g8jobgrid">${groups.map(([label,icon,players])=>`<article class="g8job ${players.length?'g8jobfilled':'g8jobopen'}"><h3>${X.icon(icon)}${label}</h3><div class="g8jobplayers">${players.length?players.map(chip).join(''):'<span class="g8jobempty">No fit option selected yet</span>'}</div></article>`).join('')}</div><p>${esc(note)}</p><details class="g8moredata g8roledetail"><summary>Explore the cricket matchups</summary><div class="g8reads">${X.phases.map(([key,label])=>btn(label,'rating',[key,squad],'g8read')).join('')}</div></details></section>`;
 };
 X.squadRoster=()=>{
  const groups=[['WK-BAT','Wicketkeeper-batters'],['BAT','Batters'],['AR','All-rounders'],['BOWL','Bowlers']];
  return `<div class="g8dressingroom">${groups.map(([role,label])=>{const players=roster().filter(p=>p.role===role);return players.length?`<section class="g8squadgroup g8role-${role}"><h3>${label}</h3>${players.map(p=>`<div class="g8squadmember"><div><b>${esc(p.name)}</b><span class="g8rowrating" aria-label="Current player rating ${p.overall}">${p.overall}</span></div><small>${esc(X.roleLine(p))}</small>${btn('Scout','inspect',[p.id],'g8small')}</div>`).join('')}</section>`:'';}).join('')}</div>`;
 };
})();
