
(()=>{
  const stage=()=>document.querySelector('#g8stage');
  const find=(sel)=>document.querySelector(sel);
  function addKeeperNotice(){
    const root=stage();
    if(!root || !root.querySelector('.g8draftaside') || root.querySelector('.gccKeeperNotice')) return;
    const aside=root.querySelector('.g8draftaside');
    const semantic=aside.querySelector('.g8squadcoverage strong, .gccuiRoleCoverage [role="meter"][aria-label*="Keepers"], .gccuiRoleCoverage [aria-label*="Keepers"]');
    const count=semantic?.getAttribute('aria-valuenow')!==null?Number(semantic.getAttribute('aria-valuenow')):Number(semantic?.textContent||0);
    const notice=document.createElement('div'); notice.className='gccKeeperNotice '+(count>0?'is-ready':'');
    const copy=document.createElement('div');
    copy.innerHTML=`<strong>${count>0?'Keeper covered':'One keeper still required'}</strong><span>${count>0?'Your squad can pass the XI legality check.':'Filter the player pool to Wicketkeepers before the final XI.'}</span>`;
    notice.appendChild(copy);
    if(count===0){
      const b=document.createElement('button'); b.type='button'; b.textContent='Show keepers';
      b.addEventListener('click',()=>{const f=[...root.querySelectorAll('select')].find(x=>[...x.options].some(o=>/Wicketkeeper|Keepers/i.test(o.textContent)));if(f){const o=[...f.options].find(x=>/Wicketkeeper|Keepers/i.test(x.textContent));if(o){f.value=o.value;f.dispatchEvent(new Event('change',{bubbles:true}));f.focus();}}});
      notice.appendChild(b);
    }
    aside.prepend(notice);
  }
  function decorateLabels(){
    const labels={how:'How to play',howItWorks:'How it works',breakawayStory:'The breakaway story'};
    for(const b of document.querySelectorAll('[data-action]')){const label=labels[b.dataset.action];if(label&&!b.getAttribute('aria-label'))b.setAttribute('aria-label',label);}
  }
  function decorate(){
    decorateLabels();
    const root=stage(); if(!root) return;
    addKeeperNotice();
    const pre=root.querySelector('.gccuiPreMatchPanel');
    if(pre && !pre.querySelector('.gccuiPreMatchNote')){
      const note=document.createElement('p'); note.className='gccuiPreMatchNote'; note.textContent='The toss is set. Start the match when you are ready to watch the innings unfold.';
      const actions=pre.querySelector('.gccuiPreMatchActions'); if(actions) pre.insertBefore(note,actions); else pre.appendChild(note);
    }
  }
  const boot=()=>{decorate();const roots=[stage(),document.querySelector('#g8hud')].filter(Boolean);for(const root of roots){if(root.__gccCleanupObserver)continue;let queued=false;const o=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate();});});o.observe(root,{childList:true,subtree:true});root.__gccCleanupObserver=o;}};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
