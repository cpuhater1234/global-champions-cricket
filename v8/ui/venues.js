/* Venue selection is presentation-only: never consume the cricket RNG. */
(()=>{
 const X=window.GCC8,photos=window.GCC8_MEDIA.venues,clubs=window.GCC_DATA.clubs;
 let homeClub=clubs[Math.floor(Math.random()*clubs.length)];
 X.homeVenue=()=>homeClub;
 X.rollHomeVenue=()=>{const choices=clubs.filter(c=>c.abbr!==homeClub?.abbr);homeClub=choices[Math.floor(Math.random()*choices.length)];};
 const venueSource=c=>c?.abbr==='STA'?window.GCC8_MEDIA.stadium:photos[c?.abbr]?.url.replace(/width=1280/,'width=960');
 const warmed=new Map(),loaded=new Set(),failed=new Set();
 X.primeVenue=c=>{const src=venueSource(c);if(!src||src.startsWith('data:')||warmed.has(src)||typeof Image==='undefined')return;const img=new Image();img.decoding='async';img.fetchPriority='low';img.referrerPolicy='no-referrer';img.onload=()=>loaded.add(src);warmed.set(src,img);img.src=src;};
 X.stadium=(club=null)=>{
  const c=club||X.homeVenue(),photo=photos[c?.abbr];
  if(!photo)return `<figure class="g8stadium">${X.pitch()}<figcaption>${X.esc(c?.ground||'The global arena')}</figcaption></figure>`;
  const src=venueSource(c);
  return `<figure class="g8stadium" data-venue="${X.esc(c.abbr)}"><div class="g8venueframe">${X.pitch()}<img class="g8stadiumphoto${loaded.has(src)?' g8photoready':''}" ${failed.has(src)?'hidden':''} src="${X.esc(src)}" width="${photo.width}" height="${photo.height}" alt="${X.esc(c.ground)} · ${X.esc(c.name)} home ground" decoding="async" loading="eager" fetchpriority="high" referrerpolicy="no-referrer"></div><figcaption>${X.icon('building-stadium')}<span>${X.esc(c.ground)} · Home of ${X.esc(c.name)}</span></figcaption></figure>`;
 };
 // Failed external images reveal the correctly named pitch frame, never a different stadium.
 document.addEventListener('error',event=>{const img=event.target;if(img?.classList?.contains('g8stadiumphoto')){failed.add(img.getAttribute('src'));img.hidden=true;}},true);
 document.addEventListener('load',event=>{const img=event.target;if(img?.classList?.contains('g8stadiumphoto')){loaded.add(img.getAttribute('src'));img.classList.add('g8photoready');}},true);
})();
