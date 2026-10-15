/* Expected batting opportunity by broad innings job, not a delivery simulator.
   Openers can survive to the death; a finisher buried at eleven rarely contributes.
   Equal opening and adjacent middle/finishing weights preserve flexible cricket roles. */
window.GCC8_PHASE_EXPOSURE=(()=>{
 const weights={powerplay:[1,1,.72,.34,.13,.05,.02,.01,0,0,0],middle:[.68,.76,1,1,.88,.65,.36,.15,.06,.02,.01],death:[.38,.42,.60,.76,1,1,.82,.48,.22,.09,.04]};
 function battingScore(xi,phase,R){const order=R.battingOrder(xi),w=weights[phase];let runs=0,opportunity=0;for(let i=0;i<order.length;i++){const p=order[i],slot=Math.max(1,Math.min(11,Number(p.battingSlot||i+1))),share=w[slot-1];runs+=R.batPhaseScore(p,phase)*share;opportunity+=share;}return opportunity?runs/opportunity:0;}
 return {battingScore};
})();
