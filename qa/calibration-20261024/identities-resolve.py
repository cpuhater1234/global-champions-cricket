exec(open('qa/calibration-20261024/identities-build.py').read().split('ctx=')[0])
ctx=json.load(open(R/'identities-context.json')); review={x['name']:x for x in json.load(open(R/'identities-review.json'))}
country={'IND':'India','AUS':'Australia','ENG':'England','SA':'South Africa','PAK':'Pakistan','WI':'West Indies','NZ':'New Zealand','SL':'Sri Lanka','BAN':'Bangladesh','AFG':'Afghanistan','IRE':'Ireland','NED':'Netherlands','ZIM':'Zimbabwe'}
manual={'Dimitri Mascarenhas':'3edb58fc','Rana Naved-ul-Hasan':'33f28243','Varun Chakravarthy':'5b7ab5a9','Mohammad Wasim Jr':'9e9af5f2','Nitish Kumar Reddy':'aad0c365','Sai Sudharsan':'d5130a30','Rashid Khan':'5f547c8b','Manpreet Gony':'ae78bc32','Siddharth Trivedi':'3d7e087f','Graham Napier':'611926bc','Peter Trego':'93e06301','Ian Harvey':'3227beb4','Tom Hartley':'22b98d7c','Nehal Wadhera':'d1a60072','Angkrish Raghuvanshi':'d7017798'}
results={}; unresolved=[]
for p in profiles:
 n=p['canonicalName']; ex=aliases[n.casefold()];candidates=review.get(n,{}).get('candidates',[]); k=None; method=None
 if len(ex)==1:k=next(iter(ex));method='official-register-exact-name-or-alias'
 elif n in manual:k=manual[n];method='explicit-profile-and-match-registry-reconciliation'
 else:
  good=[x['id'] for x in candidates if country[p['country']] in x['teams']]
  if len(good)==1:k=good[0];method='abbreviated-register-name-plus-national-team-registry'
 if not k:unresolved.append(n);continue
 r=byid[k];context=ctx.get(k,{}); urls=['https://cricsheet.org/register/people.csv','https://cricsheet.org/register/names.csv'];cid=r['key_cricinfo']
 results[n]={'identifier':k,'registerName':r['name'],'uniqueRegisterName':r['unique_name'],'country':p['country'],'method':method,'verified':True,'evidenceUrls':urls,'externalIdentifiers':{x:r[x] for x in r if x.startswith('key_') and r[x]},'profileReferenceUrl':'https://www.cricinfo.com/cricketers/'+re.sub('[^a-z0-9]+','-',n.lower()).strip('-')+'-'+cid if cid else None,'matchContext':context,'ambiguity':{'multipleExactAliasCandidates':len(ex)>1,'exactAliasCandidateIdentifiers':sorted(ex),'resolved':True},'oldMappingCorrection':old[n] if n in old and old[n]['id']!=k else None}
json.dump(results,open(R/'identities.json','w'),indent=2)
print('mapped',len(results),'unresolved',unresolved)
# Full-name/ambiguous cases are confirmed through the register's own external
# primary-profile ID, not by selecting the first surname/initial duplicate.
profile_evidence={e['gameName']:e for e in json.load(open(R/'identities-profile-retrieval.json'))}
name_rows=list(csv.DictReader(open(R/'identities-names.csv')))
for n,r in results.items():
 p=next(p for p in profiles if p['canonicalName']==n)
 r['catalogAliases']=p['aliases'];r['identityEvidenceScope']='Name-to-register identity only; playing-team context is association evidence, not independent DOB, nationality eligibility or numeric-skill verification.'
 r['registerAliasEvidence']=[{'source':'people.csv','field':f,'name':byid[r['identifier']][f]} for f in ['name','unique_name'] if byid[r['identifier']][f].casefold()==n.casefold()]+[{'source':'names.csv','name':x['name']} for x in name_rows if x['identifier']==r['identifier'] and x['name'].casefold()==n.casefold()]
 r['profileActuallyRetrieved']=n in profile_evidence
 if n in profile_evidence:
  e=profile_evidence[n];assert e['key_cricinfo']==r['externalIdentifiers']['key_cricinfo'];r['verifiedProfileEvidence']=e;r['profileReferenceUrl']=e['url'];r['evidenceUrls'].append(e['url']);r['method']='official-register-external-ID-plus-retrieved-primary-profile'+('-and-name-alias' if r['registerAliasEvidence'] else '-and-match-context')
 if r['profileReferenceUrl'] and n not in profile_evidence:r['profileReferenceStatus']='Reference generated from official ID; page not independently retrieved in this audit; official exact alias is identity evidence.'
 r['ambiguity']['neverSelectedFirstDuplicate']=True
inv=collections.defaultdict(list)
for n,r in results.items():inv[r['identifier']].append(n)
audit=json.load(open('qa/finish-pass/numeric-audit.json'));pool=collections.defaultdict(set)
for p in audit['players']:pool[p['name']].add(p['id'])
assert set(results)==set(p['name'] for p in audit['players'])==set(p['canonicalName'] for p in profiles)
assert len(results)==412 and not unresolved
assert len(inv)==412
aliases_report=[]
for p in profiles:
 for alias in p['aliases']:
  aliases_report.append({'canonicalName':p['canonicalName'],'alias':alias,'identifier':results[p['canonicalName']]['identifier'],'canonicalGameIds':sorted(pool[p['canonicalName']]),'aliasGameIds':sorted(pool.get(alias,set())),'separatePoolPlayer':bool(pool.get(alias,set())),'evidenceCountingPolicy':'Aggregate delivery evidence by register identifier once; catalog aliases refer to that same identity.'})
report={'auditDate':'2026-10-24','catalogNames':len(profiles),'numericAuditNames':len(pool),'mappedCanonicalNames':len(results),'distinctRegisterIdentities':len(inv),'unresolved':unresolved,'verifiedByUniqueOfficialExactNameOrAlias':sum(len(aliases[n.casefold()])==1 for n in results),'selectedIdentityHasOfficialExactNameOrAliasIncludingAmbiguousAliases':sum(bool(x['registerAliasEvidence']) for x in results.values()),'nonUniqueOrMissingExactAliasCasesResolvedByRetrievedPrimaryProfile':len(review),'additionalCorrectedProfilesRetrieved':3,'primaryProfileRetrievals':len(profile_evidence),'withRawMatchPlayerRegistryContext':sum(bool(x['matchContext']) for x in results.values()),'withoutRawMatchPlayerRegistryContext':[n for n,x in results.items() if not x['matchContext']],'duplicateCanonicalIdentifierGroups':[{'identifier':k,'canonicalNames':ns} for k,ns in inv.items() if len(ns)>1],'catalogAliasReconciliation':aliases_report,'previousMappingCorrections':[{'name':n,'previous':r['oldMappingCorrection'],'correct':{'identifier':r['identifier'],'registerName':r['registerName'],'key_cricinfo':r['externalIdentifiers']['key_cricinfo']},'reason':'Official register exact alias and/or retrieved primary profile external ID contradicts old selection; source method was '+r['oldMappingCorrection']['method']+'.'} for n,r in results.items() if r['oldMappingCorrection']],'countryAndBiographyScope':'Country codes are game catalog labels. Raw team registry establishes participation for named teams and dates only. Retrieved profile title establishes playing nation association for ambiguous/abbreviated cases. Birth year/DOB and nationality eligibility were not independently audited. Identity evidence confers no numeric skill confidence.','duplicateEvidencePolicy':'Key every observed delivery by source match and delivery location, and every player by Cricsheet identifier. Alias labels must never create additional observations. Current catalog has 412 distinct canonical IDs; Mike/Michael Hussey is one catalog identity, not duplicate active pool IDs.','registerDocumentation':'https://cricsheet.org/register/','registerLicense':'Open Data Commons Attribution License; credit Cricsheet (https://cricsheet.org/) and retain source/licensing references.','registerCurrentSnapshotMatchesPriorPeopleCsv':True,'sources':[{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size} for p in [Path('qa/finish-pass/people.csv'),R/'identities-names.csv',R/'identities-profile-retrieval.json',Path('v8/domain/player_profiles.json'),Path('qa/finish-pass/numeric-audit.json')]],'reproduce':['python qa/calibration-20261024/identities-build.py > /tmp/gcc-identity-review.log','python qa/calibration-20261024/identities-resolve.py'],'limitations':['Profile verification uses primary-source search retrieval; direct www.espncricinfo.com fetch returned HTTP 403, but www.cricinfo.com indexed primary profile title and URL were retrieved.','Exact official aliases were searched across all register names; aliases are not presumed globally unique.','Country/team participation is supporting identity context, not DOB certification.','No production data or saved-game IDs were modified by this audit.']}
(R/'identities.json').write_text(json.dumps(results,indent=2)+'\n');(R/'identities-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['catalogNames','mappedCanonicalNames','distinctRegisterIdentities','unresolved','primaryProfileRetrievals','withRawMatchPlayerRegistryContext','previousMappingCorrections','catalogAliasReconciliation']},indent=2))
