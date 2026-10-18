import {fixturePath} from './v8_fixture_paths.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs';import {loadGame} from './offline_game_host.mjs';
const file=process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_reviewed.html',saved=fs.readFileSync(fixturePath('foundation'),'utf8');let checks=0;
const host=(raw=saved,options={})=>loadGame(file,707,new Map([['gcc_dynasty_v8',raw]]),{strictIds:true,...options});
const call=(h,a,...args)=>{assert.ok(h.context.GCC8.dispatch(a,args),a+': '+h.get('g8feedback').textContent);checks++;};
const h=host(),X=h.context.GCC8,s=h.G.state;call(h,'continue');
assert.ok(!X.commands.includes('export')&&!X.commands.includes('import'));assert.equal(typeof h.context.Dynasty.exportSave,'undefined');assert.equal(typeof h.context.Dynasty.importSave,'undefined');checks++;
assert.ok(!/Export|Import save|exportSave|importSave/.test(fs.readFileSync(file,'utf8')));checks++;
// A bad saved payload must not restore old memory successfully or overwrite the evidence.
const duplicated=JSON.parse(saved),firstRoster=Object.values(duplicated.state.teams).find(ids=>ids.length);firstRoster.push(firstRoster[0]);
call(h,'home');for(const raw of ['{broken',JSON.stringify(duplicated),JSON.stringify({state:{year:2009}}),JSON.stringify({...JSON.parse(saved),state:{...JSON.parse(saved).state,year:2027}})]){
 const before=JSON.stringify(s);h.storage.set('gcc_dynasty_v8',raw);assert.equal(X.dispatch('continue'),false);assert.equal(JSON.stringify(s),before);assert.equal(h.storage.get('gcc_dynasty_v8'),raw);assert.equal(X.ui.view,'home');assert.ok(h.context.GCC8_CLOCK.paused);checks+=5;
}
h.storage.set('gcc_dynasty_v8',saved);call(h,'continue');
// Preserve an in-progress XI edit and its finals destination across a cold load.
s.finals={...s.finals,stage:'gf-ready',gfPair:{home:s.userClub,away:s.league.find(c=>c.abbr!==s.userClub.abbr)}};X.ui.view='finals';call(h,'editXI','finals');call(h,'home');
const reload=host(h.storage.get('gcc_dynasty_v8'));call(reload,'continue');assert.equal(reload.context.GCC8.ui.view,'team');assert.equal(reload.context.GCC8.ui.teamReturn,'finals');checks+=2;
// Preserve the result and archive-return context across a cold load.
X.ui.view='season';call(h,'result',s.results[0].round);call(h,'archive');call(h,'home');const ar=host(h.storage.get('gcc_dynasty_v8'));call(ar,'continue');assert.equal(ar.context.GCC8.ui.view,'archive');call(ar,'archiveBack');assert.equal(ar.context.GCC8.ui.view,'result');assert.ok(ar.context.GCC8.ui.result.scorecard);checks+=3;
// Cached squad reads must react to component-rating changes, even if overall stays fixed.
const p=X.roster()[0];X.squadProfile();const old=p.fielding;p.fielding=old===99?1:99;assert.equal(JSON.stringify(X.squadProfile()),JSON.stringify(h.context.GCC8_FOUNDATION_READ.projectedDraftProfile(X.roster().filter(p=>s.dynasty.injuries[p.id]?.status!=='OUT'))));p.fielding=old;checks++;
assert.ok(ar.context.GCC8.views.result().includes('data-action="matchday"'));checks++;
// Storage-denied boot and write failures retain a usable current session.
const blocked=host(undefined,{storageBlocked:true});assert.equal(blocked.context.GCC8.ui.view,'home');assert.equal(blocked.context.GCC8.hasSave(),false);checks+=2;
call(blocked,'play');call(blocked,'how');call(blocked,'close');assert.ok(blocked.context.GCC8_CLOCK.paused);checks++;call(blocked,'world');assert.ok(blocked.get('g8feedback').textContent.includes('could not save'));call(blocked,'home');call(blocked,'continue');assert.equal(blocked.context.GCC8.ui.view,'leagueDraw');checks+=2;blocked.document.hidden=true;call(blocked,'how');call(blocked,'close');assert.ok(blocked.context.GCC8_CLOCK.paused);checks++;
// Malformed arguments and stale draft buttons cannot mutate a market stage.
assert.equal(X.dispatch('inspect',null),false);checks++;X.ui.view='dynasty';s.dynasty.offseason={phase:'market'};const prior=JSON.stringify(s);assert.equal(X.dispatch('skipPick'),false);assert.equal(JSON.stringify(s),prior);checks+=2;
assert.equal(reload.errors.length+ar.errors.length,0);checks++;
const result={scope:'VM adversarial saves, storage failures, resume context and stale-command checks; no browser rendering or server exists in this standalone build.',checks,expectedCorruptSaveErrors:h.errors.length,expectedStorageErrors:blocked.errors.length};fs.writeFileSync('qa/v8_audit_results.json',JSON.stringify(result,null,2)+'\n');console.log(result);
