/* Keep live controls, cards and scroll containers mounted when their values change. */
(() => {
 const X=window.GCC8;
 X.layoutShifts=[];X.layoutShiftSupported=false;
 if(typeof PerformanceObserver!=='undefined'&&PerformanceObserver.supportedEntryTypes?.includes('layout-shift')){
  X.layoutShiftSupported=true;const observer=new PerformanceObserver(list=>{for(const e of list.getEntries())X.layoutShifts.push({time:e.startTime,value:e.value,recentInput:e.hadRecentInput,view:X.ui.view,sources:(e.sources||[]).map(x=>({id:x.node?.id||null,tag:x.node?.tagName||null,previous:x.previousRect?{x:x.previousRect.x,y:x.previousRect.y,width:x.previousRect.width,height:x.previousRect.height}:null,current:x.currentRect?{x:x.currentRect.x,y:x.currentRect.y,width:x.currentRect.width,height:x.currentRect.height}:null}))});if(X.layoutShifts.length>300)X.layoutShifts.splice(0,X.layoutShifts.length-300);});observer.observe({type:'layout-shift',buffered:true});
 }
 const key=n=>n.nodeType===1?(n.getAttribute('data-key')||n.id||null):null;
 function sync(old,next){
  if(old.nodeType!==next.nodeType||old.nodeName!==next.nodeName){const replacement=next.cloneNode(true);old.replaceWith(replacement);return replacement;}
  if(old.isEqualNode(next))return old;
  if(old.nodeType!==1){old.nodeValue=next.nodeValue;return old;}
  for(const a of [...old.attributes])if(!next.hasAttribute(a.name))old.removeAttribute(a.name);
  for(const a of [...next.attributes])if(old.getAttribute(a.name)!==a.value)old.setAttribute(a.name,a.value);
  // Native details are an intentional user choice. Their open state is not in the game model.
  if(old.tagName==='INPUT'||old.tagName==='SELECT'||old.tagName==='TEXTAREA'){
   if(old!==document.activeElement&&old.value!==next.value)old.value=next.value;
  }
  const keyed=new Map([...old.childNodes].map(n=>[key(n),n]).filter(([k])=>k));
  let cursor=old.firstChild;
  for(const wanted of [...next.childNodes]){
   const k=key(wanted);let current=k?keyed.get(k):cursor&&!key(cursor)?cursor:null;
   if(!current){current=wanted.cloneNode(true);old.insertBefore(current,cursor);}else{
    if(current!==cursor)old.insertBefore(current,cursor);
    const open=current.tagName==='DETAILS'&&current.open;current=sync(current,wanted);if(open)current.open=true;
   }
   cursor=current.nextSibling;
  }
  while(cursor){const rest=cursor.nextSibling;cursor.remove();cursor=rest;}
  return old;
 }
 X.scrollAnchor=el=>{if(!el||!el.scrollTop)return null;const top=el.getBoundingClientRect().top,node=[...el.querySelectorAll('[data-key]')].find(n=>n.getBoundingClientRect().bottom>top);return node?{key:key(node),offset:node.getBoundingClientRect().top-top,scroll:el.scrollTop}:null;};
 X.restoreAnchor=(el,a)=>{if(!el||!a)return;const node=[...el.querySelectorAll('[data-key]')].find(n=>key(n)===a.key);el.scrollTop=node?el.scrollTop+node.getBoundingClientRect().top-el.getBoundingClientRect().top-a.offset:a.scroll;};
 X.patch=(el,markup)=>{
  if(!el)return;
  if(el.__g8markup===markup)return;
  el.__g8markup=markup;
  const template=document.createElement('template');
  if(!template.content){el.innerHTML=markup;return;} // VM test host, not browser certification.
  template.innerHTML=markup;
  const next=el.cloneNode(false);next.appendChild(template.content);
  sync(el,next);
 };
})();
