/* Venue selection is presentation-only: never consume the cricket RNG. */
(()=>{
 const X=window.GCC8,photos=window.GCC8_MEDIA.venues,clubs=window.GCC_DATA.clubs;
 const early=window.GCC8_HOME_PHOTO;
 let homeClub=clubs.find(c=>c.abbr===early?.abbr)||clubs[Math.floor(Math.random()*clubs.length)];
 X.homeVenue=()=>homeClub;
 // Choose one actual club ground on each page load. Render only that ground;
 // never display a pitch illustration or an unrelated fallback image first.
 X.homeStadium=()=>X.stadium(X.homeVenue()).replace('class="g8stadium"','class="g8stadium g8homestadium"');
 X.rollHomeVenue=()=>{const choices=clubs.filter(c=>c.abbr!==homeClub?.abbr);homeClub=choices[Math.floor(Math.random()*choices.length)];};
 const venueSource=c=>photos[c?.abbr]?.dataUrl;
 const warmed=new Map(),loaded=new Set(),failed=new Set();
 X.primeVenue=c=>{const src=venueSource(c);if(!src||src.startsWith('data:')||warmed.has(src)||typeof Image==='undefined')return;const img=new Image();img.decoding='async';img.fetchPriority='low';img.referrerPolicy='no-referrer';img.onload=()=>loaded.add(src);warmed.set(src,img);img.src=src;};
 X.stadium=(club=null)=>{
  const c=club||X.homeVenue(),photo=photos[c?.abbr];
  if(!photo)return `<figure class="g8stadium"><div class="g8venueframe g8photofallback" role="img" aria-label="${X.esc(c?.ground||'Cricket ground')}"><span>${X.esc(c?.ground||'The global arena')}</span></div><figcaption>${X.esc(c?.ground||'The global arena')}</figcaption></figure>`;
  const src=venueSource(c);
  // Never render an illustrated pitch behind the actual ground. The photograph is
  // the sole visual; the neutral reserved frame is only a loading/error state.
  return `<figure class="g8stadium" data-venue="${X.esc(c.abbr)}"><div class="g8venueframe"><img class="g8stadiumphoto${loaded.has(src)?' g8photoready':''}" ${failed.has(src)?'hidden':''} src="${X.esc(src)}" width="${photo.width}" height="${photo.height}" alt="${X.esc(c.ground)} · ${X.esc(c.name)} home ground" decoding="sync" loading="eager" fetchpriority="high" referrerpolicy="no-referrer"><span class="g8venuefallback">${X.esc(c.ground)}</span></div><figcaption>${X.icon('building-stadium')}<span class="g8venuecaption">${X.esc(c.ground)} · Home of ${X.esc(c.name)}<small class="g8photocredit"><a href="${X.esc(photo.source)}" target="_blank" rel="noopener noreferrer">Photo: ${X.esc(photo.author)}</a> · <a href="${X.esc(photo.licenceUrl)}" target="_blank" rel="noopener noreferrer">${X.esc(photo.licence==='PD'?'Public domain':photo.licence==='CC0'?'CC0':'CC '+photo.licence.toUpperCase().replace('/',' '))}</a></small></span></figcaption></figure>`;
 };
 // Failed images retain a correctly named neutral frame across every view.
 document.addEventListener('error',event=>{const img=event.target;if(img?.classList?.contains('g8stadiumphoto')){failed.add(img.getAttribute('src'));img.hidden=true;}},true);
 document.addEventListener('load',event=>{const img=event.target;if(img?.classList?.contains('g8stadiumphoto')){loaded.add(img.getAttribute('src'));img.classList.add('g8photoready');}},true);
})();

