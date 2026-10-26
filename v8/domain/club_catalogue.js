/* Catalogue expansion only. The eight-club career, saved leagues and cricket RNG stay owned by the existing engine. */
(() => {
  const data = window.GCC_DATA;
  const expansion = window.GCC8_CLUB_EXPANSION;
  if (!data || !Array.isArray(data.clubs) || !expansion || !Array.isArray(expansion.clubs)) {
    throw new Error('The complete club catalogue could not be loaded.');
  }
  const seen = new Set(data.clubs.map(club => club.abbr));
  for (const club of expansion.clubs) {
    if (!club || seen.has(club.abbr) || !club.name || !club.ground ||
        !['India', 'England'].includes(club.region) ||
        !['pace', 'spin', 'boundary'].every(key => Number.isFinite(club.conditions?.[key]))) {
      throw new Error('Invalid or duplicate club in the complete catalogue.');
    }
    seen.add(club.abbr);
  }
  data.clubs.push(...expansion.clubs);
})();
