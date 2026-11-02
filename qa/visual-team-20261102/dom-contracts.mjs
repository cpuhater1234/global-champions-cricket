// Parsed-DOM structure check. This is not a browser/layout/focus certification.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {loadGame} from '../offline_game_host.mjs';
import {startDraft,finishDraft} from '../club-expansion-20261027/helpers.mjs';
const {parseHTML}=await import(process.env.GCC_DOM_MODULE||'linkedom');
const h=loadGame('qa/perfection-20261030/candidate.html',101,new Map(),{strictIds:true});startDraft(h);finishDraft(h);const X=h.context.GCC8,p=X.roster()[0];
const source=fs.readFileSync('v8/ui/controller.js','utf8'),a=source.indexOf("if(key==='player'){const reportViews="),b=source.indexOf("\n  document.getElementById('g8feedback')",a);assert(a>=0&&b>a);
const {document}=parseHTML(`<html><body><dialog aria-labelledby="g8dialogTitle"><div id="content"><header class="g8modalhead"><div><span>Global Champions Cricket</span><h2 id="g8dialogTitle">${X.esc(p.name)}</h2></div><button class="g8dialogclose">Close</button></header><div class="g8modalbody">${X.playerDossier(p,{actions:'<button type="button" data-action="inspectAction">Decision</button>'})}</div></div></dialog></body></html>`);
const content=document.querySelector('#content');new Function('content','key','document',source.slice(a,b))(content,'player',document);
const title=content.querySelector('#g8dialogTitle'),identity=content.querySelector('.gccuiDossierIdentity'),head=content.querySelector('.gccuiProfileHead');
assert.equal(content.querySelectorAll('#g8dialogTitle').length,1);assert.equal(title.textContent,p.name);assert.equal(title.closest('.gccuiDossierIdentity'),identity);assert.equal(identity.parentElement,head);
assert(identity.querySelector('.gccuiDossierRating'));assert(identity.querySelector('.g8scoutmeta'));assert.equal(head.querySelectorAll('.gccuiProfileViews').length,1);assert.equal(head.querySelectorAll('.g8dialogclose').length,1);assert(!content.querySelector('.g8modalbody .gccuiDossierIdentity'));
assert.equal(head.querySelector('.gccuiProfileViews').parentElement,head.querySelector('.gccuiDossierRail'));assert.equal(head.querySelector('.gccuiDossierActions').parentElement,head.querySelector('.gccuiDossierRail'));assert.equal(head.querySelectorAll('[data-action=inspectAction]').length,1);assert(!content.querySelector('.g8modalbody .gccuiDossierActions'));
console.log('PASS parsed DOM: one preserved dialog title, grouped identity, rating, bio, views and close control');
