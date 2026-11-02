/** Semantic rendering contracts only. The offline host cannot verify layout,
 * computed CSS, focus visibility, screen-reader behavior, or keyboard traversal. */
import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft,selectManualXI} from '../club-expansion-20261027/helpers.mjs';

const file=process.env.GCC_FILE||'deliver/GCC_v8_Playtest_33.html';
const h=loadGame(file,101,new Map(),{strictIds:true});
startDraft(h);finishDraft(h);
const X=h.context.GCC8,results=[];
function test(name,fn){try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}}
function buttons(html,action){return [...html.matchAll(/<button\b[^>]*>/g)].map(m=>m[0]).filter(tag=>tag.includes(`data-action="${action}"`));}
function value(tag,key){return tag.match(new RegExp(`\\b${key}="([^"]*)"`))?.[1];}

for(const pane of ['squad','xi'])test(`selection view ${pane} exposes one pressed pane button`,()=>{
 X.ui.teamPane=pane;
 const html=X.views.team(),tags=buttons(html,'teamPane');
 assert.equal(tags.length,2,'both view choices remain available');
 for(const tag of tags){
  const key=JSON.parse(value(tag,'data-args').replaceAll('&quot;','"'))[0];
  assert.equal(value(tag,'aria-pressed'),String(key===pane),`${key} pressed state while ${pane} is active`);
 }
 assert.equal(tags.filter(tag=>value(tag,'aria-pressed')==='true').length,1);
});

test('a pending swap announces the forced XI pane',()=>{
 selectManualXI(h);X.ui.teamPane='squad';h.G.state.pendingSwapIn=X.roster().find(p=>!h.G.state.xi.includes(p.id)).id;
 const tags=buttons(X.views.team(),'teamPane');
 for(const tag of tags){const key=JSON.parse(value(tag,'data-args').replaceAll('&quot;','"'))[0];assert.equal(value(tag,'aria-pressed'),String(key==='xi'));}
 h.G.state.pendingSwapIn=null;
});
// Guard the existing shared-helper behavior while adding teamPane semantics.
for(const active of ['matchday','ladder'])test(`seasonTab ${active} pressed semantics are preserved`,()=>{
 X.ui.seasonTab=active;
 for(const key of ['matchday','ladder']){
  const tag=buttons(X.btn(key,'seasonTab',[key]),'seasonTab')[0];
  assert.equal(value(tag,'aria-pressed'),String(key===active));
 }
});
test('batting order arrow accessible names remain present',()=>{
 for(const dir of [-1,1])assert.equal(value(buttons(X.btn(dir<0?'↑':'↓','move',[1,dir]),'move')[0],'aria-label'),`Move batter ${dir<0?'up':'down'}`);
});
test('ordinary action does not acquire toggle semantics',()=>{
 assert.equal(value(buttons(X.btn('Scout','inspect',[1]),'inspect')[0],'aria-pressed'),undefined);
});
test('offline host has no game errors',()=>assert.deepEqual(h.errors,[]));
console.log(JSON.stringify({file,results},null,2));
if(results.some(result=>!result.pass))process.exitCode=1;
