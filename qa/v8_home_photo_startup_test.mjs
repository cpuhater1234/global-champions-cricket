import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync(process.env.GCC8_TEST_BUILD||'game/gcc_v8_stabilised.html','utf8');
const head=html.split('</head>')[0];
const bootstrap=head.match(/<script id="g8homephoto">([\s\S]*?)<\/script>/)?.[1];
assert.ok(bootstrap,'home photo request must start in the head before engine and screen rendering');
const clubs=vm.runInNewContext(fs.readFileSync('v8/engine/league.js','utf8')+';window.GCC_DATA.clubs',{window:{}});
const photos=JSON.parse(fs.readFileSync('v8/assets/venue_photos.json'));
let checks=0;
for(let i=0;i<clubs.length;i++){
 const requests=[],math=Object.create(Math);math.random=()=> (i+.5)/clubs.length;
 const context={Math:math,Image:class {set src(value){requests.push({src:value,priority:this.fetchPriority,referrer:this.referrerPolicy});}},document:{addEventListener(){}},window:{}};
 vm.createContext(context);vm.runInContext(bootstrap,context);
 const early=context.window.GCC8_HOME_PHOTO;
 assert.equal(early.abbr,clubs[i].abbr,'every random club remains selectable');
 assert.equal(requests.length,i===8?0:1,'one selected external venue requested before engine');
 context.window.GCC_DATA={clubs};context.window.GCC8_MEDIA={venues:photos,stadium:'data:image/jpeg;base64,bundled'};
 context.window.GCC8={esc:String,icon:()=>''};
 vm.runInContext(fs.readFileSync('v8/ui/venues.js','utf8'),context);
 const X=context.window.GCC8;
 assert.equal(X.homeVenue().abbr,clubs[i].abbr,'render reuses the early random choice');
 if(requests.length){assert.equal(requests[0].priority,'high');assert.equal(requests[0].referrer,'no-referrer');assert.equal(X.homeStadium().match(/src="([^"]+)"/)[1],requests[0].src,'early request and visible image share exact URL');}
 X.rollHomeVenue();assert.notEqual(X.homeVenue().abbr,clubs[i].abbr,'return home can still rotate grounds');checks++;
}
console.log({checks,scope:'All 20 random home grounds; early request ordering and exact URL reuse. No browser network timing claim.'});
