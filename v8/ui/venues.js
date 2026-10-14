/* Venue selection is presentation-only: never consume the cricket RNG. */
(()=>{
 const X=window.GCC8,photos=window.GCC8_MEDIA.venues,clubs=window.GCC_DATA.clubs;
 let homeClub=clubs[Math.floor(Math.random()*clubs.length)];
 X.homeVenue=()=>homeClub;
 X.rollHomeVenue=()=>{const choices=clubs.filter(c=>c.abbr!==homeClub?.abbr);homeClub=choices[Math.floor(Math.random()*choices.length)];};
 X.stadium=(club=null)=>{
  const c=club||X.homeVenue(),photo=photos[c?.abbr];
  if(!photo)return `<figure class="g8stadium">${X.pitch()}<figcaption>${X.esc(c?.ground||'The global arena')}</figcaption></figure>`;
  const src=c.abbr==='STA'?window.GCC8_MEDIA.stadium:photo.url;
  return `<figure class="g8stadium" data-venue="${X.esc(c.abbr)}"><div class="g8venueframe">${X.pitch()}<img class="g8stadiumphoto" src="${X.esc(src)}" width="${photo.width}" height="${photo.height}" alt="${X.esc(c.ground)} · ${X.esc(c.name)} home ground" decoding="async" referrerpolicy="no-referrer"></div><figcaption>${X.icon('building-stadium')}<span>${X.esc(c.ground)} · Home of ${X.esc(c.name)}</span></figcaption></figure>`;
 };
 // Failed external images reveal the correctly named pitch frame, never a different stadium.
 document.addEventListener('error',event=>{if(event.target?.classList?.contains('g8stadiumphoto'))event.target.hidden=true;},true);
})();
