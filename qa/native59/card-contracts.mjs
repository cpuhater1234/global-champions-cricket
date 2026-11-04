import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft} from '../club-expansion-20261027/helpers.mjs';
import {parseHTML} from '/workspace/tools/gcc-css-audit/node_modules/linkedom/esm/index.js';
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true});
startDraft(h);const X=h.context.GCC8,before=JSON.stringify(h.G.state),players=X.pool(false).slice(0,X.ui.draftShown);
const {document}=parseHTML(X.poolBoard(false)),cards=[...document.querySelectorAll('.gccuiPlayer')];assert.equal(cards.length,players.length);
for(let i=0;i<cards.length;i++){const c=cards[i],p=players[i];assert.equal(c.querySelector('.gccuiPlayerMonogram').textContent,p.name.split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join(''));assert.equal(c.getAttribute('data-rating-tier'),p.overall>=90?'90':p.overall>=80?'80':p.overall>=70?'70':'developing');assert(c.querySelector('.gccuiPlayerIdentity').textContent.includes(p.name));assert(c.querySelector('.gccuiPlayerBio').textContent.includes(p.country));assert(c.querySelector('[data-action="draftPlayer"]'));assert(c.querySelector('.gccuiPlayerMonogram').getAttribute('aria-hidden')==='true');}
assert.equal(JSON.stringify(h.G.state),before);assert.deepEqual(h.errors,[]);console.log('PASS card identities, rating bands, country/name/action preservation and read-only rendering',cards.length);
