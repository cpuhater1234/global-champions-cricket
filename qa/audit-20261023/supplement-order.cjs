const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('game/gcc_v8_product_candidate.html','utf8');
const source=html.slice(html.indexOf('  function draftSlots(){'),html.indexOf('  function userOwnsPick('));
const state={userClub:{abbr:'A'},dynasty:{offseason:{lottery:['A','B','C','D'],draftNeeds:{A:6,B:5,C:4,D:4},releasePickPolicy:1,voluntaryCuts:[],finalCuts:[],cpuReleases:{},pickOwners:{}}}};
const rosterIds=()=>[];
const slots=eval(source+';slotsWithSupplement()');
const actual=slots.filter(s=>s.supplementary).map(s=>s.owner);
const expected=['A','B','A']; // round five forward, round six reverse, skipping full clubs
assert.deepStrictEqual(slots.filter(s=>!s.supplementary).slice(-4).map(s=>s.owner),['D','C','B','A']);
const result={scenario:'Two clubs exceed four natural departures; A needs six, B five; ordinary round four ends in reverse order',actual,expected,passes:JSON.stringify(actual)===JSON.stringify(expected),finding:'Supplementary picks are grouped by club in lottery order rather than continuing snake rounds.'};
fs.writeFileSync('qa/audit-20261023/supplement-order.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
