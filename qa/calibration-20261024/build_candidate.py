from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[2];q=ROOT/'qa/calibration-20261024';base=(q/'published-baseline.html').read_text();assert hashlib.sha256(base.encode()).hexdigest()=='3dd348dd956017563dc006d64a2364a15a0b2d7a3d97bb9d92e3fae3399fcbdf'
m=re.search(r'window\.GCC8_PROFILE_CATALOG\s*=\s*',base);old,n=json.JSONDecoder().raw_decode(base[m.end():]);new=json.loads((ROOT/'v8/domain/player_profiles.json').read_text());assert len(old)==len(new)==412
metadata={'sources','identityStatus','registerId','identityVerificationScope','numericReviewStatus','birthYear','verifiedBiography'}
for a,b in zip(old,new):assert {k:v for k,v in a.items()if k not in metadata}=={k:v for k,v in b.items()if k not in metadata},a['canonicalName']
h=base[:m.end()]+json.dumps(new,separators=(',',':'),ensure_ascii=False)+base[m.end()+n:]
career=(ROOT/'v8/domain/career_state.js').read_text()
start=career.index('  // Sourced biography changes')
end=career.index(' function applyYear',start)
original=career[:start]+' }\n'+career[end:]
assert original in h,'Authoritative career module must match baseline before isolated addition'
h=h.replace(original,career,1)
blocks=list(re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',h));ui=blocks[15];source=(ROOT/'v8/ui/match_story.js').read_text();h=h[:ui.start(1)]+source+h[ui.end(1):]
h=re.sub(r'data-build="[a-f0-9]+"','data-build="'+hashlib.sha256(h.encode()).hexdigest()[:16]+'"',h,count=1);(q/'candidate.html').write_text(h);newblocks=list(re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',h));oldblocks=list(re.finditer(r'<script\b[^>]*>([\s\S]*?)</script>',base));changed=[i for i,(a,b)in enumerate(zip(oldblocks,newblocks))if a[1]!=b[1]];assert changed==[2,15],changed
report={'hash':hashlib.sha256(h.encode()).hexdigest(),'baselineHash':hashlib.sha256(base.encode()).hexdigest(),'changedScriptBlocks':changed,'numericSkillRulesChanged':False,'newWorldBiographyCorrections':True,'loadedBiographyChanged':False,'profileIdentityAndBiographyOnly':True,'newAgeSensitiveGameplayMayDiffer':True,'bytes':len(h.encode())};(q/'build-report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
