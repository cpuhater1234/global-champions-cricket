import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const catalogPath='v8/domain/player_profiles.json';assert.ok(fs.existsSync(catalogPath),'reviewed player catalog must exist');
const catalog=JSON.parse(fs.readFileSync(catalogPath));const c={window:{GCC8_PROFILE_CATALOG:catalog}};vm.runInNewContext(fs.readFileSync('v8/domain/player_profiles.js','utf8'),c);const P=c.window.GCC8_PROFILES;
assert.deepEqual(Array.from(P.validateCatalog(catalog)),[]);assert.equal(P.lookup('Michael Hussey').careerKey,P.lookup('Mike Hussey').careerKey);
const inventory=JSON.parse(fs.readFileSync('qa/v8_individual_player_audit.json')).players;for(const p of inventory)assert.ok(P.lookup(p.name),p.name);
for(const n of ['Kane Williamson','Trent Boult','Ben Stokes','Jonny Bairstow','David Miller','Ravi Bishnoi'])assert.ok(P.lookup(n)?.addition,n);
for(const n of ['Rashid Khan','Wanindu Hasaranga','Mitchell Santner','David Willey']){const p=P.lookup(n);assert.equal(p.primaryFamily,'bowling');assert.ok(p.peakSkills.bat<80,n);assert.ok(p.bowlingUsage>=3,n);}
const narine=P.lookup('Sunil Narine');assert.equal(narine.peakSkills.power,94,'Narine remains an explosive hitter rather than an anchor');const test=P.expectedSkills(narine,2018,{bat:95,bowl:89,power:93,control:91,role:'AR',_peakSkills:{bat:95,bowl:89},_factor:1});assert.equal(test.power,94);assert.equal(P.roleAt(narine,2016).preferredSlot,8);assert.equal(P.roleAt(narine,2017).preferredSlot,1);
assert.equal(P.roleAt(P.lookup('Glenn Phillips'),2022).role,'AR','later Phillips is an off-spinning all-rounder');assert.equal(P.lookup('Glenn Phillips').bowlingStyle,'SPIN');
for(const p of catalog){assert.ok(p.calibrationStatus);assert.ok(p.identityStatus);assert.ok(p.roleWindows.length);}
assert.ok(P.validateCatalog([...catalog,catalog[0]]).length);console.log({profiles:catalog.length,checkedExisting:inventory.length,errors:0});
