"""Install causal deliveries beside the foundation's existing profiles and RNG."""
def adapt(name,script):
    if name == 'dynasty':
        script=script.replace("!superOverValid(r)))return false;", "!superOverValid(r)||!window.GCC8_DELIVERY.validResult(r,ids)))return false;")
        script=script.replace("m.count>(m.presentationVersion===2?9:5)","m.count>(m.presentationVersion===3?2000:m.presentationVersion===2?9:5)").replace("m.speedIndex>2||typeof m.running", "m.speedIndex>(m.presentationVersion===3?3:2)||typeof m.running")
        script=script.replace("m.presentationVersion!==2)return false;", "![2,3].includes(m.presentationVersion))return false;")
        marker="  if(m?.presentationVersion===2){"
        assert marker in script
        script=script.replace(marker,"  if(m?.presentationVersion===3){const ref=m.reference,r=ref.type==='regular'?s.results.find(x=>x.round===ref.round):ref.type==='gf'?s.finals?.gf:s.finals?.semis?.[ref.index];if(!r||r.homeInnings?.deliveryVersion!==1||m.count>window.GCC8_DELIVERY.frameCount(r))return false;}\n"+marker)
        return script
    if name != 'foundation': return script
    old='  function innings(batClub, bowlClub, ground, context = {}) {'
    assert old in script
    script=script.replace(old,'''  function innings(batClub,bowlClub,ground,context={}){
    const estimate=estimateInnings(batClub,bowlClub,ground,context);
    // Dynasty already applies fitness around the complete simulation. Snapshot it once.
    const fit=p=>({...p});
    return window.GCC8_DELIVERY.play({batClub,bowlClub,ground,context,estimate,order:matchBattingOrder(batClub).map(fit),bowlers:clubXI(bowlClub).map(fit),batProfile:effectiveProfile(batClub),bowlProfile:effectiveProfile(bowlClub),random:rng,R});
  }
  function estimateInnings(batClub, bowlClub, ground, context = {}) {''',1)
    old='  function resolveChase(firstInnings, chasePotential) {'
    assert old in script
    script=script.replace(old,old+'\n    if(chasePotential.deliveryVersion===1)return chasePotential;',1)
    old='  function buildMatchScorecard(home, away, hi, ai, homeRuns, awayRuns, homeExtras, awayExtras, seed, firstBattingClub = home) {'
    assert old in script
    script=script.replace(old,old+'\n    if(hi.deliveryVersion===1&&ai.deliveryVersion===1)return window.GCC8_DELIVERY.scorecard(home,away,hi,ai,firstBattingClub);',1)
    for prefix,inn,club in [('home','hi','home'),('away','ai','away')]:
        old=f"const {prefix}Extras = scorecardExtrasBreakdown({inn}.total, detailSeed + ':{prefix[0]}e');"
        assert script.count(old)==2
        script=script.replace(old,f"const {prefix}Extras = {inn}.extrasBreakdown || scorecardExtrasBreakdown({inn}.total, detailSeed + ':{prefix[0]}e');")
        old=f"const {prefix}Runs = allocateRuns({club}, Math.max(0,{inn}.total-{prefix}Extras.total), {inn}.wickets, detailSeed + ':{prefix}');"
        assert script.count(old)==2
        script=script.replace(old,f"const {prefix}Runs = {inn}.batterRuns || allocateRuns({club}, Math.max(0,{inn}.total-{prefix}Extras.total), {inn}.wickets, detailSeed + ':{prefix}');")
    return script
