/* User-operated diagnostic. Paste in DevTools after opening the local v8 build.
   This downloads geometry, not a screenshot. Attach a screenshot separately. */
(() => {
 const app=document.getElementById('g8app');if(!app||!window.GCC8)throw Error('Open a GCC v8 build first.');
 const visible=el=>{const r=el.getBoundingClientRect(),c=getComputedStyle(el);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none';};
 const records=[...app.querySelectorAll('h1,h2,h3,p,button,input,select,td,th,.g8slot b,.g8wireline b')].filter(visible).map(el=>{
  const r=el.getBoundingClientRect(),c=getComputedStyle(el);return {tag:el.tagName,id:el.id,action:el.dataset.action||null,text:(el.innerText||el.value||'').trim().slice(0,180),rect:{x:r.x,y:r.y,width:r.width,height:r.height},colour:c.color,background:c.backgroundColor,fontSize:c.fontSize,lineHeight:c.lineHeight};
 });
 const report={version:'v8-arcade-design',sourceBuild:app.dataset.build,screen:GCC8.ui.view,modal:GCC8.ui.modal,year:GCC.state.year,round:GCC.state.round,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},documentWidth:document.documentElement.scrollWidth,records,scope:'User browser geometry. Attach rendered screenshots for visual review; these bounds do not prove text-ink overlap.'};
 const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`gcc-v8-${report.screen}-${innerWidth}x${innerHeight}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);console.log(report);
})();
