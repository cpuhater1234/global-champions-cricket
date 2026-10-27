  let savePending=false,saveAgain=false,saveSucceeded=false,saveGeneration=0,saveSuspended=false;
  let savePromise=Promise.resolve(false),saveSlow=false,saveError='',checkpointRecord=null,checkpointValidRaw=null,checkpointRecovery=null;
  let checkpointBooted=!('indexedDB' in window);
  function notifySaveStatus(){try{if(typeof Event==='function'&&window.dispatchEvent)window.dispatchEvent(new Event('gcc-save-status'));}catch(error){console.error(error);}}
  const checkpointStore=createCheckpointStore({onSlow:()=>{saveSlow=true;notifySaveStatus();}});
  const checkpointReadyPromise=checkpointStore.ready.then(record=>{
    checkpointRecord=record;
    if(record?.version===1&&!record.cleared){
      for(const raw of [record.raw,record.previous]){
        if(typeof raw!=='string')continue;
        try{
          const info=backupInfo(raw);checkpointValidRaw=raw;
          if(saveGeneration===0&&!state.dynasty?.started){const expected=safeStorageGet(SAVE_KEY);if(expected!==raw){let browserInfo=null;try{browserInfo=backupInfo(expected);}catch{}checkpointRecovery={raw,expected,info,browserInfo};}}
          break;
        }catch(error){console.warn('GCC recovery checkpoint rejected',error);}
      }
    }
    checkpointBooted=true;notifySaveStatus();
    return checkpointStore.mode();
  });
  function invalidatePendingSaves(){saveGeneration++;savePending=false;saveAgain=false;saveSucceeded=false;saveSlow=false;}
  async function flushSave(generation=saveGeneration){while(generation===saveGeneration&&savePending)await savePromise;return generation===saveGeneration&&saveSucceeded;}
  async function withStorageLock(work){
    if(!navigator.locks?.request)return work();
    if(typeof AbortController!=='function'){if(checkpointStore.available())return work();throw new Error('This browser cannot safely coordinate automatic saving. Download a career backup.');}
    const controller=new AbortController();let acquired=false;
    const timer=window.setTimeout(()=>{if(!acquired)controller.abort();},4000);
    try{return await navigator.locks.request('gcc-career-save:'+SAVE_KEY,{signal:controller.signal},()=>{acquired=true;window.clearTimeout(timer);return work();});}
    finally{window.clearTimeout(timer);}
  }
  function recoveryInfo(){return checkpointRecovery?{checkpoint:checkpointRecovery.info,browser:checkpointRecovery.browserInfo}:null;}
  function resolveRecovery(useCheckpoint){
    const choice=checkpointRecovery;if(!choice)return false;
    if(safeStorageGet(SAVE_KEY)!==choice.expected){saveConflict=true;base.toast('Another open game changed this save. Reload to review the latest saved progress.');return false;}
    return restoreBackup(useCheckpoint?choice.raw:choice.expected,choice.expected);
  }
  function autoSave(){
    if(saveSuspended||!state.dynasty)return false;
    if(checkpointRecovery){saveError='Review the recovery checkpoint before saving this career.';saveSucceeded=false;notifySaveStatus();return false;}
    // Without either exclusion mechanism, keep the exportable live career instead of silently racing another tab.
    if(checkpointBooted&&!checkpointStore.available()&&!navigator.locks?.request){
      try{saveConflict=localStorage.getItem(SAVE_KEY)!==lastStoredSave;}catch{saveConflict=false;}
      saveError='Automatic saving is unavailable here. Keep this game open and download a career backup.';saveSucceeded=false;notifySaveStatus();return false;
    }
    if(savePending){saveAgain=true;return false;}
    const generation=saveGeneration;savePending=true;saveSucceeded=false;saveSlow=false;saveError='';notifySaveStatus();
    savePromise=checkpointReadyPromise.then(()=>withStorageLock(()=>{
      if(generation!==saveGeneration||saveSuspended)return false;
      if(!checkpointStore.available()){
        if(!navigator.locks?.request)throw new Error('Automatic saving is unavailable here. Download a career backup.');
        saveAgain=false;return commitSave();
      }
      let nextRecord=null;
      return checkpointStore.run(record=>{
        if(generation!==saveGeneration||saveSuspended)return {value:false};
        saveAgain=false;
        if(!commitSave())return {value:false};
        nextRecord={version:1,cleared:false,raw:lastStoredSave,previous:record?.raw===checkpointRecord?.raw?checkpointValidRaw:record?.raw||null,updatedAt:Date.now(),strict:checkpointStore.mode()==='strict'};
        return {value:true,record:nextRecord};
      }).then(result=>{if(result.value&&generation===saveGeneration){checkpointRecord=nextRecord;checkpointValidRaw=nextRecord.raw;}return result.value;});
    })).catch(error=>{
      if(generation!==saveGeneration)return false;
      saveError=error?.name==='AbortError'?'Another game held the save lock too long. Keep this game open and retry or download a backup.':'The recovery checkpoint could not be completed. Keep this game open and download a backup.';
      console.error('GCC coordinated save failed',error);
      if(!saveFailureShown){saveFailureShown=true;try{base.toast(saveError);}catch{}}
      return false;
    }).then(ok=>{
      if(generation!==saveGeneration)return false;
      savePending=false;saveSucceeded=!!ok;saveSlow=false;
      if(saveAgain){saveAgain=false;autoSave();}
      notifySaveStatus();return !!ok;
    });
    return false;
  }
