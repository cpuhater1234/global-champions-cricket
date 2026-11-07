const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(process.argv[2]||'source/v8/ui/controller.js','utf8');
function harness(stored=false){
 const commands={},log=[],ui={view:'story',newCareer:false,modal:null},s={dynasty:{started:true}},read={fresh(){log.push('fresh')},save(){log.push('save')},saveSuspended(){return false}};
 const context={ui,s,read,commands,log,archiveReturn:"season",X:{hasStoredSave:()=>stored,hasSave:()=>stored,cleanSeasonBrief:()=>null},assert:(v,t)=>{if(!v)throw Error(t)},bind:(n,w,f)=>commands[n]=f,cancelMatchTimer(){},finishReveal(){},setView(v){ui.view=v},startReveal(){},render(){},save(){},btn:(label,action)=>`<button data-action="${action}">${label}</button>`,modal:(title,body,key)=>{ui.modal=key;log.push({title,body})},closeDialog:()=>ui.modal=null,G:{skipLeagueReveal(){}},refreshSaveStatus(){}};
 vm.createContext(context);
 for(const name of ['fresh','world','continueSaved']){const line=src.split('\n').find(x=>x.startsWith(` bind('${name}',`));if(line)vm.runInContext(line,context)}
 commands.continue=()=>log.push('continue');
 return {commands,ui,log,context,s,read};
}
let failures=0;function test(name,fn){try{fn();console.log('PASS',name)}catch(e){failures++;console.log('FAIL',name,e.message)}}
test('save arriving during intro offers recovery without throwing or replacing the view',()=>{const h=harness(true);assert.doesNotThrow(()=>h.commands.world());assert.equal(h.ui.view,'story');assert.equal(h.ui.modal,'fresh');const body=h.log.at(-1).body;assert.match(body,/Start again/);assert.match(body,/Open saved career/);assert(!h.log.includes('fresh'))});
test('recovery confirmation starts reveal after explicit consent',()=>{const h=harness(true);h.ui.modal='fresh';h.commands.fresh();assert.equal(h.ui.view,'leagueDraw');assert.equal(h.log.filter(x=>x==='fresh').length,1)});
test('open saved career recovers directly from intro',()=>{const h=harness(true);h.ui.modal='fresh';assert.equal(typeof h.commands.continueSaved,'function');h.commands.continueSaved();assert.equal(h.ui.view,'home');assert(h.log.includes('continue'));assert(!h.log.includes('fresh'))});
test('intro commands never save the old career presentation',()=>{const h=harness(true);vm.runInContext(src.match(/ function save\(\)\{[^\n]+/)[0],h.context);h.ui.newCareer=true;h.context.save();assert(!h.log.includes('save'));assert.equal(h.s.dynasty.v8UI,undefined)});
for(let i=0;i<10;i++)test(`clean intro reaches reveal ${i+1}`,()=>{const h=harness(false);h.commands.world();assert.equal(h.ui.view,'leagueDraw');assert.equal(h.ui.modal,null);assert.equal(h.log.filter(x=>x==='fresh').length,1)});
test('returning Home from an uncommitted intro does not write old progress',()=>{const h=harness(true);vm.runInContext(src.match(/ function save\(\)\{[^\n]+/)[0],h.context);h.ui.newCareer=true;h.ui.view='home';h.context.save();assert(!h.log.includes('save'));assert.equal(h.s.dynasty.v8UI,undefined)});
test('Continue clears abandoned new-career intent before returning to play',()=>{const h=harness(true);h.ui.newCareer=true;h.ui.view='home';Object.assign(h.context,{D:{resumeSave:()=>true},restorePresentation:()=>h.ui.view='draft'});h.context.X.draftPageSize=()=>12;vm.runInContext(src.split('\n').find(x=>x.startsWith(" bind('continue',")),h.context);h.commands.continue();assert.equal(h.ui.view,'draft');assert.equal(h.ui.newCareer,false)});
process.exitCode=failures?1:0;
