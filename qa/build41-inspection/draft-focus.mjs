/** Focus intent contract, not a native DOM/keyboard test. Native BODY focus loss
 * after keyboard Pick was reproduced separately by the root browser reviewer.
 * This checks a stable focusable turn target and explicit focus after pool and
 * dossier picks, followed by a CPU-driven refresh. */
import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft} from '../club-expansion-20261027/helpers.mjs';
const file=process.argv[2]||process.env.GCC_FILE||'qa/perfection-20261030/candidate.html',results=[];
for(const path of ['pool','dossier']){
 const h=loadGame(file,101,new Map(),{strictIds:true}),X=h.context.GCC8,s=h.G.state;
 startDraft(h);for(let i=0;i<10&&X.draftCurrent(false)?.club.abbr!==s.userClub.abbr;i++)assert(X.dispatch('skipPick'));
 h.context.scrollY=1600;h.context.scrollTo=({top=0})=>{h.context.scrollY=top;};
 const retained=h.get('draft-retained-focus');h.document.activeElement=retained;
 assert.equal(X.dispatch('draftPlayer',[-1]),false);assert.equal(h.document.activeElement,retained);assert.equal(h.context.scrollY,1600);
 const p=X.pool(false)[0];if(path==='dossier')assert(X.dispatch('inspect',[p.id]));
 const target=h.get('gccuiDraftTurnTitle');
 const originalQuery=h.document.querySelector;
 h.document.querySelector=selector=>selector==='#gccuiDraftTurnTitle'?target:originalQuery(selector);
 assert(X.dispatch('draftPlayer',[p.id]));
 const html=X.views.draft();
 const checks=[
  ['stable programmatically focusable turn heading',()=>assert.match(html,/<h2\b(?=[^>]*\bid="gccuiDraftTurnTitle")(?=[^>]*\btabindex="-1")[^>]*>/)],
  ['successful pick explicitly focuses current draft turn',()=>assert.equal(h.document.activeElement,target)],
  ['successful pick keeps exact top scroll',()=>assert.equal(h.context.scrollY,0)],
  ['CPU refresh preserves the turn target focus',()=>{h.document.activeElement=target;h.G.skipToMyPick();X.afterTick();assert.equal(h.document.activeElement,target);}]
 ];
 for(const [check,fn]of checks){try{fn();results.push({path,check,pass:true});}catch(e){results.push({path,check,pass:false,error:e.message.split('\n')[0]});}}
 if(path==='pool'){finishDraft(h);assert.equal(X.ui.view,'team');assert.equal(h.document.activeElement,h.get('g8stage'),'final pick retains team stage focus');assert(!X.views.draft().includes('id="gccuiDraftTurnTitle"'),'completed draft has no obsolete focus target');}
 assert.deepEqual(h.errors,[]);
}
console.log(JSON.stringify({file,limits:'Offline focus-intent stub; no native keyboard or DOM certification.',results},null,2));
if(results.some(r=>!r.pass))process.exitCode=1;
