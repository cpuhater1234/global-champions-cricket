/* Keep essential cricket jobs within the CPU's paid-for selections.
   No post-draft free upgrades. This reserves opportunity, not six-bowler quotas. */
window.GCC8_DRAFT_GUARD={candidates(roster,pool,remaining,R){
 const left=Math.max(0,remaining-1),used=R.oversCapacity(roster),hasKeeper=roster.some(R.isKeeper);
 const viable=pool.filter(p=>{const gloves=hasKeeper||R.isKeeper(p),gap=Math.max(0,20-used-R.bowlingWorkload(p)),bowlers=Math.ceil(gap/4),keeper=gloves?0:1;
  if(bowlers+keeper<=left)return true;
  // A remaining keeper who is also a credible bowling option can cover both jobs.
  return keeper&&left>=1&&bowlers<=left&&pool.some(q=>q.id!==p.id&&R.isKeeper(q)&&R.bowlingWorkload(q)>=4&&R.bowlingStyle(q));
 });
 return viable.length?viable:pool;
}};
