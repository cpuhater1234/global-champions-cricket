// One modal surface, including direct opens from the dynasty layer.
function installModalInteraction() {
  const modal=document.getElementById('modal');
  if(!modal) return;
  let opened=false,returnTo=null,oldOverflow='',blocked=[];
  const available=()=>[...modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]')]
    .filter(el=>!el.disabled && el.tabIndex>=0 && el.getClientRects().length);
  const sync=()=>{
    const now=modal.classList.contains('open');
    if(now===opened)return;
    opened=now;
    if(now){
      returnTo=document.activeElement;
      oldOverflow=document.body.style.overflow;
      document.body.style.overflow='hidden';
      blocked=[...document.body.children].filter(el=>el!==modal && !el.contains(modal) && !['SCRIPT','STYLE','SVG'].includes(el.tagName)).map(el=>({el,inert:el.inert}));
      blocked.forEach(({el})=>el.inert=true);
      document.getElementById('modalBody').scrollTop=0;
      document.getElementById('modalClose')?.focus({preventScroll:true});
    }else{
      document.body.style.overflow=oldOverflow;
      blocked.forEach(({el,inert})=>el.inert=inert);
      blocked=[];
      if(returnTo?.isConnected && !returnTo.disabled)returnTo.focus({preventScroll:true});
      returnTo=null;
    }
  };
  new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',event=>{
    if(!modal.classList.contains('open'))return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeModal();return;}
    if(event.key!=='Tab')return;
    const controls=available(),first=controls[0],last=controls[controls.length-1];
    if(!first){event.preventDefault();document.getElementById('modalBody').focus();return;}
    if(event.shiftKey && (document.activeElement===first || !modal.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey && (document.activeElement===last || !modal.contains(document.activeElement))){event.preventDefault();first.focus();}
  },true);
  sync();
}
