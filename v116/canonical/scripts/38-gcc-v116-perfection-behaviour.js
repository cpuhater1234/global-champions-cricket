
(()=>{
 const stage=()=>document.querySelector('#g8stage');
 const visible=e=>!!e&&e.offsetParent!==null;
 function quietRecruitWire(root){
   const wires=[...root.querySelectorAll('.g8wire')];
   for(const wire of wires){
     if(wire.dataset.gccV116==='quiet') continue;
     const t=(wire.innerText||'').replace(/\s+/g,' ').trim();
     if(!/Awaiting the first player decisions/i.test(t)) continue;
     wire.classList.add('gccQuietWire');wire.dataset.gccV116='quiet';
     wire.innerHTML='<div><strong>THE WIRE IS QUIET</strong><span>Player commitments will appear here as the five-day window unfolds.</span><em>Start signings to open the feed</em></div>';
   }
 }
 function draftNeeds(root){
   const companion=root.querySelector('.gccuiCompanion');
   if(!companion||companion.querySelector('.gccuiNeedsStrip')) return;
   const meters=[...companion.querySelectorAll('[role="meter"]')];
   const find=(word)=>{const m=meters.find(x=>new RegExp(word,'i').test(x.getAttribute('aria-label')||''));return Number(m?.getAttribute('aria-valuenow')||0)};
   const keeper=find('Keeper'),openers=find('Opener'),pace=find('Pace'),spin=find('Spin');
   const items=[['WK',keeper,keeper>0],['OPEN',openers,openers>0],['PACE',pace,pace>0],['SPIN',spin,spin>0],['MIX',pace+spin,pace+spin>=3]];
   const strip=document.createElement('div');strip.className='gccuiNeedsStrip';strip.setAttribute('aria-label','Squad needs');
   for(const [label,count,ready] of items){const el=document.createElement('span');el.className=ready?'is-ready':'is-open';el.textContent=`${label} ${count}`;el.title=ready?`${label} covered`:`${label} still needed`;strip.appendChild(el)}
   const head=companion.querySelector('.gccuiClubHead');if(head) head.after(strip);else companion.prepend(strip);
 }
 function decorate(){const root=stage();if(!root)return;quietRecruitWire(root);draftNeeds(root)}
 function boot(){decorate();const root=stage();if(!root||root.__gccV116Observer)return;let queued=false;const o=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;decorate()})});o.observe(root,{childList:true,subtree:true});root.__gccV116Observer=o}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
