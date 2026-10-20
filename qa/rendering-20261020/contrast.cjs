module.exports=function scanContrast(){
 const rgb=s=>(s.match(/[\d.]+/g)||[]).map(Number),lum=a=>a.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0),bad=[],gradients=new Set(),dialog=document.querySelector('dialog[open]'),walker=document.createTreeWalker(dialog||document.getElementById('g8app'),NodeFilter.SHOW_TEXT);let n;
 while(n=walker.nextNode()){
  const el=n.parentElement;if(!n.textContent.trim()||el.closest('[disabled],script,style,[aria-hidden="true"]')||!el.checkVisibility({checkVisibilityCSS:true})||!el.getBoundingClientRect().width)continue;
  const c=getComputedStyle(el);let bg=[11,17,26],gradient=false;
  for(let a=el;a;a=a.parentElement){const s=getComputedStyle(a),v=rgb(s.backgroundColor);if(s.backgroundImage!=='none'){gradient=true;gradients.add(a.id||a.className);}if(v.length>=3&&(v.length===3||v[3]>.98)){bg=v;break;}}
  const f=lum(rgb(c.color)),b=lum(bg),contrast=(Math.max(f,b)+.05)/(Math.min(f,b)+.05),large=parseFloat(c.fontSize)>=24||(parseFloat(c.fontSize)>=18.66&&parseFloat(c.fontWeight)>=700),min=large?3:4.5;
  if(contrast<min-.05)bad.push({text:n.textContent.trim().slice(0,80),class:el.className,fg:c.color,bg,contrast:+contrast.toFixed(2),gradient});
 }
 return{bad:bad.filter((x,i,a)=>a.findIndex(y=>x.class===y.class&&x.fg===y.fg&&x.contrast===y.contrast)===i),gradients:[...gradients],limitation:'CSS nearest opaque background scan; gradient/image backdrops require visual inspection, not certified by this ratio.'};
};
