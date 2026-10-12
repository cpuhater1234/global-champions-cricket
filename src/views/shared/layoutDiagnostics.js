/* Opt-in native-browser diagnostics. No collection or network transmission. */
(() => {
  function capture() {
    const modal=document.querySelector('.modal.open');
    const roots=modal?[modal]:[...document.querySelectorAll('.screen.active')];
    const texts=[],overflow=[];
    const label=el=>el.id ? '#'+el.id : el.tagName.toLowerCase()+'.'+[...el.classList].join('.');
    for(const root of roots){
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      let node;
      while((node=walker.nextNode())){
        if(!node.textContent.trim()||node.parentElement.closest('script,style,[hidden]')||getComputedStyle(node.parentElement).visibility==='hidden')continue;
        const range=document.createRange();range.selectNodeContents(node);
        for(const r of range.getClientRects())if(r.width>1&&r.height>1){texts.push({element:node.parentElement,path:label(node.parentElement),text:node.textContent.trim().slice(0,100),rect:{x:r.x,y:r.y,width:r.width,height:r.height}});}
      }
      for(const el of root.querySelectorAll('*')){
        const r=el.getBoundingClientRect(),style=getComputedStyle(el);
        if(!r.width||!r.height||style.visibility==='hidden')continue;
        if(r.right>innerWidth+2||r.left< -2)overflow.push({path:label(el),kind:'viewport overflow',rect:{x:r.x,y:r.y,width:r.width,height:r.height}});
        if(el.scrollWidth>el.clientWidth+2&&style.overflowX==='hidden')overflow.push({path:label(el),kind:'clipped content',scrollWidth:el.scrollWidth,clientWidth:el.clientWidth});
      }
    }
    const overlaps=[];
    for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){
      const a=texts[i],b=texts[j];if(a.element===b.element)continue;
      const x=Math.min(a.rect.x+a.rect.width,b.rect.x+b.rect.width)-Math.max(a.rect.x,b.rect.x);
      const y=Math.min(a.rect.y+a.rect.height,b.rect.y+b.rect.height)-Math.max(a.rect.y,b.rect.y);
      if(x>2&&y>2)overlaps.push({a:{path:a.path,text:a.text,rect:a.rect},b:{path:b.path,text:b.text,rect:b.rect},intersection:{width:x,height:y}});
    }
    return {candidate:'v7.9.3 UI rebuild',time:new Date().toISOString(),viewport:{width:innerWidth,height:innerHeight,devicePixelRatio},screens:roots.map(label),focused:document.activeElement?label(document.activeElement):null,overflow,overlaps,limits:'Geometric text intersections and clipping candidates require human review. This is not a visual approval or performance benchmark.'};
  }
  function download(){const report=capture(),url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='gcc-layout-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return report;}
  window.GCC_LAYOUT_QA={capture,download};
  document.addEventListener('keydown',event=>{if(event.altKey&&event.shiftKey&&event.code==='KeyL'){event.preventDefault();download();}});
})();
