import assert from 'node:assert/strict';import {loadGame} from '../offline_game_host.mjs';
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true}),X=h.context.GCC8;
const before=JSON.stringify(h.G.state);
const menu=h.get('fixture-menu-summary'),trigger=h.get('fixture-guide-trigger');trigger.closest=()=>({querySelector:()=>menu});h.document.activeElement=trigger;assert(X.dispatch('how'));assert(X.dispatch('close'));assert.equal(h.document.activeElement,menu,'guide returns focus to visible menu summary');
for(const [action,title,glyph]of[['how','How to play','stumps'],['howItWorks','How it works','cricket-ball'],['breakawayStory','The breakaway story','book']]){
 assert(X.btn(title,action).includes('#g8icon-'+glyph),'guide action uses existing glyph');
 assert(X.dispatch(action));const html=h.get('g8dialogContent').innerHTML;assert(html.includes('aria-label="Game guides"'));assert(html.includes('aria-current="page"'));assert(html.includes('Back to game'));assert(!html.includes('their supporters'));assert(X.dispatch('close'));assert.equal(X.ui.view,'home');
}
assert.equal(JSON.stringify(h.G.state),before,'guides do not change career state');assert.deepEqual(h.errors,[]);console.log('PASS: guide routes, current state, shared icons, return context and read-only game state');
