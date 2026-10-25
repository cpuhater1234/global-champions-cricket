"""Apply explicit, undisputed publisher DOB metadata; do not alter saved states."""
from pathlib import Path
import datetime,json,re
q=Path(__file__).resolve().parent;root=q.parents[1]
review=json.loads((q/'identities-bio-review.json').read_text());rows=json.loads((root/'v8/domain/player_profiles.json').read_text());by={r['name']:r for r in review['players']};changes=[]
base=(q/'published-baseline.html').read_text();m=re.search(r'window\.GCC8_PROFILE_CATALOG\s*=\s*',base);original={p['canonicalName']:p for p in json.JSONDecoder().raw_decode(base[m.end():])[0]}
for p in rows:
 r=by[p['canonicalName']];dob=r['birthYear']
 if not r['verifiedSourceIdentity'] or not dob['factuallyResolved']:continue
 try:date=datetime.datetime.strptime(dob['sourceDOB'],'%d/%m/%Y').date().isoformat()
 except (ValueError,TypeError):continue
 assert int(date[:4])==dob['sourceYear']
 p['verifiedBiography']={'birthDate':date,'registerId':r['identifier'],'cricinfoId':str(r['requestedCricinfoId']),'source':r['source']['url'],'scope':'Explicit publisher date; applied to newly created careers only. Saved ages and alternate-history skill/career windows are preserved.'}
 if original[p['canonicalName']]['birthYear']!=int(date[:4]):changes.append({'name':p['canonicalName'],'previous':original[p['canonicalName']]['birthYear'],'corrected':int(date[:4]),'source':r['source']['url']})
 p['birthYear']=int(date[:4])
fallback=json.loads((q/'identities-bio-fallback-review.json').read_text())
byname={p['canonicalName']:p for p in rows}
for r in fallback['players']:
 if not r['factuallyResolved']:continue
 p=byname[r['name']];date=r['birthDate'];assert p['registerId']==r['identifier']
 p['verifiedBiography']={'birthDate':date,'registerId':r['identifier'],'source':r['source'],'scope':'Explicit official-board/league DOB; reviewed profile identity. Newly created careers only; preserve saved ages and alternate-history templates.'}
 if original[r['name']]['birthYear']!=int(date[:4]):changes.append({'name':r['name'],'previous':original[r['name']]['birthYear'],'corrected':int(date[:4]),'source':r['source']})
 p['birthYear']=int(date[:4])
(root/'v8/domain/player_profiles.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False)+'\n')
(q/'biography-integration.json').write_text(json.dumps({'sourceProfiles':review['coverage']['retrievedExactProfileIds']+len(fallback['players']),'explicitUndisputedFullDates':sum('verifiedBiography'in p for p in rows),'birthYearCorrections':changes,'conflictRetained':['Umar Gul','Angkrish Raghuvanshi'],'unretrieved':0,'apiUnretrieved':len(review['unresolved'].get('birthYear',[])),'officialFallbacks':len(fallback['players']),'loadedCareersChanged':False,'storedNumericTemplatesChanged':False},indent=2)+'\n')
print(len(changes),'catalog birth years corrected; full biography metadata',sum('verifiedBiography'in p for p in rows))
