  // A successful chase can clear the target with a boundary. This aggregate model
  // samples a legal excess, not a fabricated final delivery or a batter identity.
  function winningChaseTotal(target,potential,seed){
    const extras=[0,0,0,0,0,0,1,2,3,3,4,5],r=detailRng(`${seed}:winning-hit`);
    return target+Math.min(Math.max(0,potential-target),extras[Math.floor(r()*extras.length)]);
  }
  function reconcileChasePhases(phases,balls,total,target){
    const counts={pp:Math.min(36,balls),mid:Math.max(0,Math.min(54,balls-36)),death:Math.max(0,balls-90)},keys=['pp','mid','death'],active=keys.filter(k=>counts[k]>0),last=active[active.length-1],caps=Object.fromEntries(keys.map(k=>[k,counts[k]*6]));
    if(!last||total>balls*6||total<target)throw new Error('Impossible chase phase budget');
    const weights=Object.fromEntries(keys.map(k=>[k,counts[k]?Math.max(0,phases[k]||0):0])),sum=keys.reduce((n,k)=>n+weights[k],0)||balls;
    const weighted=keys.some(k=>weights[k]>0);
    const out=Object.fromEntries(keys.map(k=>[k,Math.min(caps[k],Math.floor(total*(weighted?weights[k]:counts[k])/sum))]));
    // Before the final phase the target must remain unreached, including any excess
    // from the winning boundary. No earlier phase can silently finish the chase.
    const minimum=Math.max(1,total-target+1);out[last]=Math.max(out[last],minimum);
    let diff=total-keys.reduce((n,k)=>n+out[k],0);
    for(const k of active.slice().reverse()){
      if(diff>0){const n=Math.min(diff,caps[k]-out[k]);out[k]+=n;diff-=n;}
      else if(diff<0){const n=Math.min(-diff,out[k]-(k===last?minimum:0));out[k]-=n;diff+=n;}
    }
    if(diff||out[last]>caps[last])throw new Error('Chase phase totals could not reconcile');
    return out;
  }
