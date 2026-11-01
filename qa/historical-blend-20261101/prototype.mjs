/** Offline sensitivity prototype, not imported by the game.
 * estimatedAbility must come from separately validated, context-adjusted real evidence.
 * The constants below are candidate design constraints, not fitted cricket coefficients.
 */
const validDate=value=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;};
export function blend(prior,observations,cutoff){
 if(!Number.isFinite(prior.rating)||prior.rating<1||prior.rating>99||!Number.isFinite(prior.age)||prior.age<14||!Number.isFinite(prior.careerBalls)||prior.careerBalls<0||!validDate(cutoff))throw Error('Invalid prior or cutoff');
 const seen=new Set(),matches=new Set(),old=new Set(prior.evidenceIds||[]),floor=600+Math.max(0,Math.min(10,prior.age-21))*120,priorWeight=Math.max(floor,prior.careerBalls);
 let weight=0,sum=0,used=0;
 for(const o of observations){
  if(!o.id||!o.matchId||!o.source||!validDate(o.date)||!Number.isFinite(o.balls)||o.balls<0||!Number.isFinite(o.estimatedAbility)||o.estimatedAbility<1||o.estimatedAbility>99||!Number.isFinite(o.reliability)||o.reliability<0||o.reliability>1)throw Error('Invalid observation');
  if(seen.has(o.id))throw Error('Duplicate observation');if(old.has(o.id))throw Error('Observation already included in prior');if(o.date>cutoff)throw Error('Observation exceeds cutoff');seen.add(o.id);if(matches.has(o.matchId))throw Error('Repeated match observation');matches.add(o.matchId);
  const n=Math.min(60,o.balls)*o.reliability;if(!n)continue;weight+=n;sum+=n*Math.max(-12,Math.min(12,o.estimatedAbility-prior.rating));used++;
 }
 const bound=Math.min(3,used*.5),raw=sum/(priorWeight+weight),adjustment=Math.max(-bound,Math.min(bound,raw)),rating=Math.max(1,Math.min(99,prior.rating+adjustment));
 return {rating,adjustment:rating-prior.rating,priorWeight,effectiveNewBalls:weight,observationsUsed:used};
}
