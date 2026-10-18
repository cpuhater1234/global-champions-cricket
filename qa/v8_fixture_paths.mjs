import path from 'node:path';
// Fixtures come from fresh completed careers, never from an unrelated old report.
export function fixturePath(kind,year){
 const root=process.env.GCC8_FIXTURE_DIR||'qa/stabilisation/fixtures';
 if(kind==='foundation')return path.join(root,'foundation.json');
 if(kind==='chase')return path.join(root,'early-chase.json');
 if(kind==='tie')return path.join(root,'natural-tie.json');
 if(kind==='career'&&Number.isInteger(year))return path.join(root,`checkpoint-${year}.json`);
 throw new Error('Unknown GCC fixture '+kind);
}
// Explicit compatibility fixture: retain score/stat facts while selecting the
// pre-delivery highlights format. This is not a claim of historical provenance.
export function legacyHighlights(save){
 const copy=JSON.parse(JSON.stringify(save));
 for(const r of [...copy.state.results,...(copy.state.finals?.semis||[]),copy.state.finals?.gf].filter(Boolean))for(const innings of [r.homeInnings,r.awayInnings])delete innings.deliveryVersion;
 return copy;
}
