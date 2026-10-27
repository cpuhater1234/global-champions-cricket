  // Keep the compare/serialize/write sequence exclusive across actual tabs.
  let savePending=false,saveAgain=false,saveSucceeded=false,saveGeneration=0,saveSuspended=false;
  let savePromise=Promise.resolve(false);
  function notifySaveStatus(){if(typeof Event==='function'&&window.dispatchEvent)window.dispatchEvent(new Event('gcc-save-status'));}
  function invalidatePendingSaves(){saveGeneration++;savePending=false;saveAgain=false;saveSucceeded=false;}
  async function flushSave(generation=saveGeneration){
    while(generation===saveGeneration&&savePending)await savePromise;
    return generation===saveGeneration&&saveSucceeded;
  }
  function autoSave(){
    if(saveSuspended||!state.dynasty)return false;
    if(!navigator.locks?.request){saveSucceeded=commitSave();return saveSucceeded;}
    if(savePending){saveAgain=true;return false;}
    const generation=saveGeneration;savePending=true;saveSucceeded=false;notifySaveStatus();
    savePromise=Promise.resolve().then(()=>navigator.locks.request('gcc-career-save:'+SAVE_KEY,()=>{
      if(generation!==saveGeneration||saveSuspended)return false;
      // Requests made before acquiring the lock are represented by this snapshot.
      saveAgain=false;return commitSave();
    })).catch(error=>{
      if(generation!==saveGeneration)return false;
      console.error('GCC coordinated save failed',error);
      if(!saveFailureShown){saveFailureShown=true;base.toast('This browser could not save your progress. Keep this game open to continue playing.');}
      return false;
    }).then(ok=>{
      if(generation!==saveGeneration)return false;
      savePending=false;saveSucceeded=ok;
      if(saveAgain){saveAgain=false;autoSave();}
      notifySaveStatus();
      return ok;
    });
    return false;
  }
