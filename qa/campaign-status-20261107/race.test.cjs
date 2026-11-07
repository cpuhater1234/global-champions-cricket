const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2],'utf8'),start=source.indexOf(' X.ordinal='),end=source.indexOf(' X.campaignOverview=',start);assert.ok(start>=0&&end>start);
const X={};vm.runInNewContext(source.slice(start,end),{X});
const clubs=Array.from({length:8},(_,i)=>({abbr:String(i)}));let seed=103;
const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n};
const brute=(rows,games,places)=>{let qualifies=false,misses=false;for(let mask=0;mask<(1<<games.length);mask++){const pts=Object.fromEntries(rows.map(r=>[r.club.abbr,r.pts]));games.forEach((g,i)=>pts[(mask&(1<<i)?g.home:g.away).abbr]+=2);const above=rows.filter(r=>r.club.abbr!=='0'&&pts[r.club.abbr]>pts['0']).length,tiedOrAbove=rows.filter(r=>r.club.abbr!=='0'&&pts[r.club.abbr]>=pts['0']).length;qualifies ||= above<places;misses ||= tiedOrAbove>=places;}return {clinched:!misses,eliminated:!qualifies};};
for(let trial=0;trial<600;trial++){
 const count=trial%2?8:4,places=count/2,rows=clubs.slice(0,count).map(club=>({club,pts:2*rand(14),p:10})).sort((a,b)=>b.pts-a.pts);
 const games=Array.from({length:1+rand(8)},()=>{let a=rand(count),b=rand(count-1);if(b>=a)b++;return {home:clubs[a],away:clubs[b]};});
 assert.deepEqual(JSON.parse(JSON.stringify(X.finalsRace(rows,games,'0',places))),brute(rows,games,places),'trial '+trial);
}
const rows=clubs.map((club,i)=>({club,pts:28-i*2,p:14}));assert.equal(X.finalsRace(rows,[],'0').clinched,true);assert.equal(X.finalsRace(rows,[],'7').eliminated,true);
assert.equal(X.campaignRaceLabel(rows,[],'0'),'Finals clinched');assert.equal(X.campaignRaceLabel(rows,[],'7'),'Eliminated');
const ownRows=clubs.map(club=>({club,pts:2,p:2}));assert.equal(X.campaignRaceLabel(ownRows,[{home:clubs[0],away:clubs[1]}],'0'),'Early days');
const begin=source.indexOf(' X.campaignOverview=()=>{'),finish=source.indexOf(' X.matchdayHub=',begin),s={table:{'0':{p:2,w:1,l:1,nrr:.53}},userClub:clubs[0],round:2,fullSchedule:[[],[],[{home:clubs[0],away:clubs[1]}]],results:[{round:1,winner:clubs[1]},{round:2,winner:clubs[0]}]};
const order=[clubs[1],clubs[2],clubs[3],clubs[0],...clubs.slice(4)].map(club=>({club,pts:2,p:2}));X.table=()=>order;vm.runInNewContext(source.slice(begin,finish),{X,s,esc:x=>String(x)});const markup=X.campaignOverview();assert.ok(markup.includes('<strong>4th</strong>'));assert.ok(markup.includes('<strong>1-1</strong>'));assert.ok(markup.includes('Early days'));assert.ok(!markup.includes('Inside the top four'));assert.ok(markup.indexOf('Round 1: lost')<markup.indexOf('Round 2: won'));
console.log('600 fixture sets matched exhaustive outcomes, including NRR ties; final standings, race copy and 4th / 1-1 rendering passed');
