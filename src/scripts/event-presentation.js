
/* v6.69 signature-experience choreography. Presentation layer only. */
(() => {
  if (!window.GCC || !document.body) return;
  document.body.dataset.uiVersion = 'v7.8.7-brutal-qa';
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = window.GCC.state;

  const layer = document.createElement('div');
  layer.id = 'gccMomentLayer';
  layer.className = 'gcc-moment-layer';
  layer.setAttribute('aria-hidden','true');
  layer.innerHTML = '<div class="gcc-moment-card"><span class="gcc-moment-eyebrow"></span><strong class="gcc-moment-title"></strong><span class="gcc-moment-detail"></span></div>';
  document.body.appendChild(layer);
  const eyebrow = layer.querySelector('.gcc-moment-eyebrow');
  const title = layer.querySelector('.gcc-moment-title');
  const detail = layer.querySelector('.gcc-moment-detail');
  let momentTimer = null;
  let pendingMomentTimer = null;
  let momentSeq = 0;

  function showMoment(opts={}) {
    const seq = ++momentSeq;
    clearTimeout(momentTimer);
    if(pendingMomentTimer){ clearTimeout(pendingMomentTimer); pendingMomentTimer=null; }
    const toastEl=document.getElementById('toast');
    if(toastEl){ clearTimeout(toastEl._hideTimer); toastEl.classList.remove('show'); }
    layer.className = `gcc-moment-layer ${opts.tone || ''}`.trim();
    eyebrow.textContent = opts.eyebrow || 'GLOBAL CHAMPIONS CRICKET';
    title.textContent = opts.title || '';
    detail.textContent = opts.detail || '';
    // Even reduced-motion users receive the hierarchy, just without animated travel.
    requestAnimationFrame(() => { if (seq === momentSeq) layer.classList.add('show'); });
    const duration = reduced ? Math.min(opts.duration || 1050, 700) : (opts.duration || 1050);
    momentTimer = setTimeout(() => {
      if (seq !== momentSeq) return;
      layer.classList.remove('show');
      setTimeout(() => { if (seq === momentSeq) layer.className = 'gcc-moment-layer'; }, reduced ? 0 : 260);
    }, duration);
  }

  function dismissMoment() {
    momentSeq++;
    clearTimeout(momentTimer);
    if(pendingMomentTimer){ clearTimeout(pendingMomentTimer); pendingMomentTimer=null; }
    layer.classList.remove('show');
    layer.className = 'gcc-moment-layer';
  }

  function hashStyle(abbr='') {
    const styles=['band','split','chevron','quartered','pinstripe'];
    let h=17;
    for (const ch of abbr) h=(h*31+ch.charCodeAt(0))>>>0;
    return styles[h%styles.length];
  }
  function decorateClubMarks(root=document) {
    root.querySelectorAll('.club-mark').forEach(el => {
      const abbr=(el.textContent||'').trim().toUpperCase();
      if(!abbr || el.dataset.crestStyle) return;
      el.dataset.crestStyle=hashStyle(abbr);
      el.dataset.clubKey=abbr;
    });
  }
  decorateClubMarks();
  const crestObserver = new MutationObserver(muts => {
    let needed=false;
    for(const m of muts){ if(m.addedNodes && m.addedNodes.length){needed=true;break;} }
    if(needed) requestAnimationFrame(()=>decorateClubMarks());
  });
  crestObserver.observe(document.body,{childList:true,subtree:true});

  function reanimate(el, cls) {
    if(!el || reduced) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(()=>el.classList.remove(cls),720);
  }

  let lastRecruitDecision='';
  let marqueeMoments=0;
  let suppressRecruitMoment=false;
  const recruitRoll=document.getElementById('recruitRoll');
  if(recruitRoll){
    const recruitObserver=new MutationObserver(()=>{
      const d=state.recruit && state.recruit.currentDecision;
      if(!d || !d.name || d.name===lastRecruitDecision) return;
      lastRecruitDecision=d.name;
      reanimate(recruitRoll,'decision-fresh');
      if(suppressRecruitMoment || marqueeMoments>=4) return;
      const p=(state.pool||[]).find(x=>x.name===d.name);
      if(!p || (p.overall||0)<93) return;
      marqueeMoments++;
      showMoment({
        eyebrow:d.joins?'MARQUEE SIGNING':'MARQUEE PASS',
        title:d.name,
        detail:`${d.joins?'SIGNED WITH GCC':'DECLINED GCC'} · ${d.country} · ${d.role}`,
        tone:d.joins?'win':'loss',duration:1100
      });
    });
    recruitObserver.observe(recruitRoll,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  function wrap(name, handler){
    const original=window.GCC[name];
    if(typeof original!=='function') return;
    window.GCC[name]=function(...args){ return handler.call(this, original.bind(this), args); };
  }

  function clearMoment(){
    clearTimeout(momentTimer);
    if(pendingMomentTimer){ clearTimeout(pendingMomentTimer); pendingMomentTimer=null; }
    momentSeq++;
    // A screen transition is a hard boundary: do not let the previous bulletin fade across the next screen.
    const priorTransition=layer.style.transition;
    layer.style.transition='none';
    layer.classList.remove('show');
    layer.className='gcc-moment-layer';
    layer.setAttribute('aria-hidden','true');
    void layer.offsetWidth;
    layer.style.transition=priorTransition;
    const toastEl=document.getElementById('toast');
    if(toastEl){ clearTimeout(toastEl._hideTimer); toastEl.classList.remove('show'); toastEl.textContent=''; }
  }

  wrap('go',(original,args)=>{
    clearMoment();
    return original(...args);
  });

  // Core setupDraft() uses its private go(), so do not carry a stale signing/club bulletin into the draw.
  wrap('setupDraft',(original,args)=>{
    clearMoment();
    return original(...args);
  });

  // The core enterTeamRoom() calls its private go(), so clear the Draft bulletin explicitly.
  wrap('enterTeamRoom',(original,args)=>{
    clearMoment();
    const out=original(...args);
    clearMoment();
    return out;
  });

  wrap('openSeasonReview',(original,args)=>{
    clearMoment();
    return original(...args);
  });

  wrap('confirmClub',(original,args)=>{
    const club=state.selectedClub!=null ? state.league[state.selectedClub] : null;
    const out=original(...args);
    if(club) showMoment({eyebrow:'FRANCHISE CONFIRMED',title:club.name,detail:`${club.league} · ${club.ground} · FOUNDATION CLUB`,tone:'draft',duration:1050});
    return out;
  });

  wrap('skipRecruitment',(original,args)=>{
    suppressRecruitMoment=true;
    const out=original(...args);
    setTimeout(()=>{suppressRecruitMoment=false;},80);
    return out;
  });

  wrap('userDraft',(original,args)=>{
    const id=Number(args[0]);
    const p=(state.pool||[]).find(x=>x.id===id);
    const pickNo=(state.pickIndex||0)+1;
    const before=state.pickIndex||0;
    const club=state.userClub;
    const out=original(...args);
    if(p && club && (state.pickIndex||0)>before && p.draftedBy===club.abbr){
      showMoment({eyebrow:`PICK ${pickNo} · ${club.abbr}`,title:p.name,detail:`${p.country} · ${(p.role||'PLAYER').replace('WK-BAT','WK / BAT')} · ${p.overall} OVR`,tone:'draft',duration:1050});
    }
    return out;
  });

  wrap('replaceXI',(original,args)=>{
    const outId=Number(args[0]);
    const inId=Number(state.pendingSwapIn||0);
    const incoming=(state.pool||[]).find(x=>x.id===inId);
    const outgoing=(state.pool||[]).find(x=>x.id===outId);
    const out=original(...args);
    if(incoming && outgoing && (state.xi||[]).includes(inId) && !(state.xi||[]).includes(outId)){
      requestAnimationFrame(()=>{
        const rows=[...document.querySelectorAll('#team .batting-slot')];
        const row=rows.find(x=>x.textContent.includes(incoming.name));
        if(row) reanimate(row,'xi-change-land');
      });
    }
    return out;
  });

  wrap('startSeason',(original,args)=>{
    // The Season screen already owns the Round 1 hierarchy. Clear XI feedback at the boundary
    // rather than stacking another floating bulletin over the Season heading.
    clearMoment();
    return original(...args);
  });

  function resultMoment(res){
    if(!res || !state.userClub) return;
    // The persistent match story is the result. Keep the landing animation and ladder movement,
    // but do not duplicate the same result in a floating bulletin over the Season heading.
    requestAnimationFrame(()=>{
      reanimate(document.querySelector('#matchStory .story-card'),'result-fresh');
      const row=document.querySelector('#ladder .user-row');
      if(row && res.ladderBefore && res.ladderAfter && res.ladderBefore!==res.ladderAfter){
        const cls=res.ladderAfter<res.ladderBefore?'ladder-climb':'ladder-fall';
        row.classList.add(cls);setTimeout(()=>row.classList.remove(cls),1500);
      }
    });
  }

  wrap('playNextRound',(original,args)=>{
    const before=state.round||0;
    const out=original(...args);
    if((state.round||0)===before+1){
      const res=[...(state.results||[])].reverse().find(x=>x.round===state.round);
      const modalOpen=document.getElementById('modal')?.classList.contains('open');
      const activeScreen=document.querySelector('.screen.active')?.id;
      // Do not stack a round bulletin over the Finals qualification modal or Season Review.
      // If Round 14 opens the qualification modal, clear any still-visible bulletin from Round 13.
      if(modalOpen){ dismissMoment(); return out; }
      if(activeScreen==='season') resultMoment(res);
    }
    return out;
  });

  wrap('advanceFinals',(original,args)=>{
    // The finals page itself reveals the Grand Final pairing. Clear any semi-final
    // feedback instead of stacking a second matchup bulletin over that reveal.
    clearMoment();
    return original(...args);
  });

  wrap('simulateFinals',(original,args)=>{
    const before=state.finals && state.finals.stage;
    // Semi-final and Grand Final result pages already carry the full cricket story.
    // Clear earlier feedback first so only a genuine championship win earns a ceremony moment.
    clearMoment();
    const out=original(...args);
    const f=state.finals;
    if(!f || !state.userClub) return out;
    if(before==='gf-ready' && f.stage==='done' && f.gf && [f.gf.home.abbr,f.gf.away.abbr].includes(state.userClub.abbr)){
      const won=f.gf.winner.abbr===state.userClub.abbr;
      if(won){
        pendingMomentTimer=setTimeout(()=>{pendingMomentTimer=null;showMoment({eyebrow:'GLOBAL CHAMPIONS CRICKET',title:'GLOBAL CHAMPIONS',detail:`${state.userClub.name.toUpperCase()} · FOUNDATION SEASON 2008`,tone:'ceremony',duration:1750})},120);
      }
    }
    return out;
  });

  // Expose only for visual QA; no simulation code depends on it.
  window.GCC_UI = Object.freeze({showMoment,dismissMoment,decorateClubMarks});
})();
