
(()=>{
  const scene=document.getElementById('foundationScene');
  const old=scene&&scene.querySelector('img.foundation-brand-logo');
  if(!scene||!old||scene.querySelector('.foundation-wordmark-svg')) return;
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','foundation-brand-logo foundation-wordmark-svg');
  svg.setAttribute('viewBox','0 0 1000 300');
  svg.setAttribute('role','img');
  svg.setAttribute('aria-label','Global Champions Cricket');
  svg.innerHTML=`
    <g fill="none" stroke="#173e30" stroke-width="10" stroke-linecap="round">
      <path d="M154 66V206 M183 66V206 M212 66V206"/>
      <path d="M149 55H182 M185 55H218" stroke-width="7"/>
    </g>
    <circle cx="250" cy="185" r="29" fill="#974a36"/>
    <g fill="none" stroke="#f7efe0" stroke-width="2">
      <path d="M234 161Q260 183 267 209 M230 164Q255 185 263 211"/>
      <path d="M235 166l-4 3 M241 172l-4 3 M247 179l-4 3 M253 187l-4 3 M257 195l-4 3 M261 203l-4 3"/>
    </g>
    <text x="310" y="212" fill="#173e30" font-family="Georgia, Times New Roman, serif" font-size="216" font-weight="700" letter-spacing="-8">GCC</text>
    <text x="500" y="276" fill="#173e30" text-anchor="middle" font-family="Georgia, Times New Roman, serif" font-size="31" letter-spacing="7">GLOBAL CHAMPIONS CRICKET</text>`;
  old.replaceWith(svg);
})();
