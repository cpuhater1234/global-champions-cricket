import {fixturePath} from './v8_fixture_paths.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import {loadGame} from './offline_game_host.mjs';
const h=loadGame(process.env.GCC8_TEST_BUILD||'game/global_champions_cricket_v8_notice_polish.html',909,new Map([['gcc_dynasty_v8',fs.readFileSync(fixturePath('foundation'),'utf8')]]),{strictIds:true}),X=h.context.GCC8,s=h.G.state;let checks=0;const check=(v,m)=>{assert.ok(v,m);checks++;};check(X.dispatch('continue'),'continue');X.ui.view='team';h.G.go('team');
const rows=()=>((X.views.team().match(/class="g8squadrow"/g))||[]).length;
check(rows()===X.roster().filter(p=>!s.xi.includes(p.id)).length,'selection list shows bench rather than duplicating XI');
check((X.views.team().match(/class="g8slot"/g)||[]).length===11,'all batting order places retained');
const player=s.xi.map(h.G.byId).find(p=>X.injury(p)?.status!=='OUT');check(X.views.team().includes('g8namescout'),'selected players have direct Scout access');check(X.dispatch('inspect',[player.id]),'scout selected player');check(X.dispatch('close'),'close scout');
const n=rows();check(X.dispatch('remove',[player.id]),'remove selected player');check(rows()===n+1,'removed player appears on bench');check(X.dispatch('select',[player.id]),'select from bench');check(rows()===n,'selected player leaves bench');
const bench=X.roster().find(p=>!s.xi.includes(p.id)&&X.injury(p)?.status!=='OUT');check(!!bench,'fit bench option');check(X.dispatch('swapIn',[bench.id]),'start swap');check(X.dispatch('swapOut',[player.id]),'complete swap');check(s.xi.includes(bench.id)&&!s.xi.includes(player.id),'swap owns correct XI');
const before=s.battingOrder.indexOf(bench.id);if(before>0){check(X.dispatch('move',[bench.id,-1]),'reorder');check(s.battingOrder.indexOf(bench.id)===before-1,'reorder works');}
check(X.views.team().includes('XI analysis and development'),'depth remains available below workspace');check(!h.errors.length,'no unexpected errors');console.log({checks,scope:'Real-script VM selection, swap, reorder and complete lineup markup; no rendered alignment evidence'});
