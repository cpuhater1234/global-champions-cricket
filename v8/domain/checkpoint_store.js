/* One transaction is the unit of checkpoint coordination and acknowledgement. */
function createCheckpointStore({name='gcc-career-recovery-v1',timeout=4000,onSlow=()=>{}}={}) {
 let db=null, durability='unavailable', message='';
 const failure=e=>e&&e.message?e.message:String(e||'Checkpoint storage unavailable');
 const unavailable=e=>{durability='unavailable';message=failure(e);};
 const slow=()=>{try{onSlow();}catch(e){/* Notification must not affect a commit. */}};
 const ready=new Promise(resolve=>{
  let finished=false,request;
  const finish=(record,error)=>{if(finished)return;finished=true;window.clearTimeout(timer);if(error){unavailable(error);if(db){db.close();db=null;}}resolve(record==null?null:record);};
  const timer=window.setTimeout(()=>finish(null,new Error('Checkpoint storage open timed out')),timeout);
  try{
   request=window.indexedDB.open(name,1);
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('checkpoints'))request.result.createObjectStore('checkpoints');};
   request.onerror=()=>finish(null,request.error||new Error('Checkpoint storage open failed'));
   request.onblocked=()=>finish(null,new Error('Checkpoint storage open blocked'));
   request.onsuccess=()=>{
    if(finished){request.result.close();return;}
    db=request.result;
    db.onversionchange=()=>{db.close();db=null;unavailable(new Error('Checkpoint storage version changed'));};
    let probe;
    try{probe=db.transaction('checkpoints','readwrite',{durability:'strict'});durability=probe.durability==='strict'?'strict':'transaction';}
    catch(e){try{probe=db.transaction('checkpoints','readwrite');durability='transaction';}catch(err){finish(null,err);return;}}
    let record=null;
    probe.onabort=()=>finish(null,probe.error||new Error('Checkpoint storage initialization aborted'));
    probe.onerror=()=>{};
    probe.oncomplete=()=>finish(record);
    try{const get=probe.objectStore('checkpoints').get('career');get.onsuccess=()=>{record=get.result==null?null:get.result;};}catch(e){try{probe.abort();}catch(ignore){}finish(null,e);}
   };
  }catch(e){finish(null,e);}
 });
 async function run(mutator){
  await ready;
  if(!db||durability==='unavailable')throw new Error(message||'Checkpoint storage unavailable');
  return new Promise((resolve,reject)=>{
   let tx, value,reason=null,done=false;
   const mode=durability;
   const finish=(error)=>{if(done)return;done=true;window.clearTimeout(timer);if(error){message=failure(error);reject(error);}else{message='';resolve({value,mode});}};
   const timer=window.setTimeout(()=>{
    if(done)return;
    reason=new Error('Checkpoint transaction timed out');
    try{tx.abort();}catch(e){if(e.name==='InvalidStateError'){reason=null;slow();}else{reason=null;slow();}}
   },timeout);
   try{
    tx=mode==='strict'?db.transaction('checkpoints','readwrite',{durability:'strict'}):db.transaction('checkpoints','readwrite');
    tx.oncomplete=()=>finish(null);
    tx.onabort=()=>finish(reason||tx.error||new Error('Checkpoint transaction aborted'));
    tx.onerror=()=>{};
    const objectStore=tx.objectStore('checkpoints');
    const request=objectStore.get('career');
    request.onsuccess=()=>{
     try{
      const outcome=mutator(request.result==null?null:request.result);
      if(!outcome||typeof outcome!=='object'||typeof outcome.then==='function')throw new TypeError('Checkpoint mutator must return a synchronous result');
      value=outcome.value;
      if(Object.prototype.hasOwnProperty.call(outcome,'record'))objectStore.put(outcome.record,'career');
     }catch(e){reason=e;try{tx.abort();}catch(ignore){/* Terminal event still owns acknowledgement. */}}
    };
   }catch(e){finish(e);}
  });
 }
 return {ready,available:()=>!!db&&durability!=='unavailable',mode:()=>durability,error:()=>message,run};
}
