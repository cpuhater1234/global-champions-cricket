
(()=>{
  const scene=document.getElementById('foundationScene');
  const old=scene&&scene.querySelector('img.foundation-brand-logo');
  if(!scene||!old||scene.querySelector('.foundation-wordmark-svg')) return;
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','foundation-brand-logo foundation-wordmark-svg');
  svg.setAttribute('viewBox','0 0 1000 360');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','Global Champions Cricket');
  svg.innerHTML=`
    <g fill="#05331f">
      <text x="500" y="232" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="246" font-weight="700" letter-spacing="-18">GCC</text>
      <circle cx="304" cy="197" r="35" fill="#a98746"></circle>
    </g>
    <g fill="none" stroke="#05331f" stroke-width="6" stroke-linecap="round">
      <path d="M279 219l48-48"></path><path d="M287 227l48-48"></path><path d="M295 235l48-48"></path>
    </g>
    <g fill="#a98746">
      <rect x="478" y="115" width="10" height="108" rx="3"></rect><rect x="500" y="115" width="10" height="108" rx="3"></rect><rect x="522" y="115" width="10" height="108" rx="3"></rect>
      <rect x="475" y="102" width="22" height="7" rx="3"></rect><rect x="512" y="102" width="22" height="7" rx="3"></rect>
    </g>
    <g fill="#05331f">
      <text x="500" y="324" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="42" letter-spacing="11">GLOBAL CHAMPIONS CRICKET</text>
    </g>`;
  old.replaceWith(svg);
})();
