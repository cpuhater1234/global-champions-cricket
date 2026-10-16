/* One native runner owns domain timers. Legacy presentation observers are not mounted. */
window.GCC8_CLOCK = (() => {
  const jobs=new Map(); let seq=0, runner=null, paused=false, pausedAt=0, running=false;
  const now=()=>performance.now();
  const clearNative=()=>{if(runner!==null)window.clearTimeout(runner);runner=null;};
  function arm(){
    if(running||paused)return; clearNative();
    if(!jobs.size)return;
    const due=Math.min(...[...jobs.values()].map(j=>j.due));
    runner=window.setTimeout(tick,Math.max(0,due-now()));
  }
  function tick(){
    runner=null;running=true;
    const time=now(),ready=[...jobs].filter(([,j])=>j.due<=time+1);
    try{for(const [id,j] of ready){if(paused)break; if(!jobs.has(id))continue; if(!j.repeat)jobs.delete(id);j.fn();if(j.repeat&&jobs.has(id))jobs.set(id,{...j,due:now()+j.repeat});}}
    finally{running=false;window.GCC8?.afterTick?.();arm();}
  }
  function add(fn,delay,repeat=0){const id=++seq;jobs.set(id,{fn,due:(paused?pausedAt:now())+Math.max(0,Number(delay)||0),repeat});arm();return id;}
  const cancel=id=>{const j=jobs.get(id);if(j)j.cancelled=true;jobs.delete(id);arm();};
  return {setTimeout:(fn,d)=>add(fn,d),setInterval:(fn,d)=>add(fn,d,Math.max(1,Number(d)||1)),clearTimeout:cancel,clearInterval:cancel,
    requestAnimationFrame:fn=>add(()=>fn(now()),16),cancelAnimationFrame:cancel,
    pause(){if(paused)return;paused=true;pausedAt=now();clearNative();},
    resume(){if(!paused)return;const delta=now()-pausedAt;for(const j of jobs.values())j.due+=delta;paused=false;arm();},
    get pending(){return jobs.size;},get paused(){return paused;}};
})();
