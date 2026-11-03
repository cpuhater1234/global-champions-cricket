import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('v8/ui/decision-ui.js','utf8');
const line=source.split('\n').find(x=>x.startsWith(' const finals=X.views.finals;'));
assert(line);
const mine={abbr:'M',name:'My club'},other={abbr:'O',name:'Other club'},third={abbr:'T',name:'Third club'};
const s={year:2008,userClub:mine,champion:mine,finals:{stage:'ready',top:[mine,other,third]}};
const btn=(label,action)=>`<button data-action="${action}">${label}</button>`;
let seen=[];
const X={heading:(a,b,c,d)=>`heading:${a}:${b}:${d}`,storyResult:r=>{seen.push(r);return '<p>management proof</p>';},views:{finals:()=>{
const f=s.finals,action=f.stage==='semis'?'advanceFinals':f.stage==='done'?'review':'simulateFinals',pending=f.stage==='ready'?f.top.some(c=>c.abbr===mine.abbr):f.stage==='gf-ready'?[f.gfPair.home,f.gfPair.away].some(c=>c.abbr===mine.abbr):false;
const label=f.stage==='semis'?'The Grand Final matchup':f.stage==='done'?'Close the season':f.stage==='gf-ready'?(pending?'Play the Grand Final':'Watch the Grand Final'):(pending?'Play the semi-finals':'Watch the semi-finals');
return X.heading(`${s.year} · FINALS`,f.stage==='done'?`${s.champion.name} are champions.`:f.stage==='gf-ready'?'The Grand Final.':'The finals.','',btn(label,action))+'<div>bracket</div>';
}}};
const ctx={X,s,btn,esc:String,title:x=>`<h1>${x}</h1>`};vm.createContext(ctx);vm.runInContext(line,ctx);
for(const stage of ['ready','gf-ready']){s.finals.stage=stage;s.finals.gfPair={home:mine,away:other};seen=[];const html=X.views.finals();assert.equal(seen.length,0);assert.match(html,/Review XI/);}
const result={home:mine,away:other,winner:mine,marginText:'5 runs'};
for(const stage of ['semis','done']){s.finals.stage=stage;s.finals.semis=[result];s.finals.gf=result;seen=[];const before=JSON.stringify(s),html=X.views.finals();assert.equal(seen[0],result);assert(html.indexOf('management proof')<html.indexOf('class="gccuiFinalActions"'));assert.match(html,/My club won 5 runs/);assert.equal(JSON.stringify(s),before);}
s.finals.stage='done';s.finals.gf={...result,home:other,away:third};seen=[];assert.doesNotMatch(X.views.finals(),/gccuiFinalDecision/);assert.equal(seen.length,0);
s.finals.stage='semis';s.finals.semis=[s.finals.gf];seen=[];assert.doesNotMatch(X.views.finals(),/gccuiFinalDecision/);assert.equal(seen.length,0);
console.log('PASS finals presentation: both upcoming stages, own semifinal/GF result before advancement, spectator isolation, read-only rendering.');
