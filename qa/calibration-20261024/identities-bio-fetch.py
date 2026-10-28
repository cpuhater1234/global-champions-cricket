"""Fetch public ESPN athlete bio facts using register profile IDs, max4 workers."""
import concurrent.futures,datetime,hashlib,json,time,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parent
CACHE=ROOT/'identities-bio-source-cache.json'
def fetch(item):
 name,row=item;cid=row['externalIdentifiers'].get('key_cricinfo');url='https://site.web.api.espn.com/apis/common/v3/sports/cricket/8048/athletes/'+str(cid)
 out={'canonicalName':name,'identifier':row['identifier'],'requestedCricinfoId':cid,'url':url,'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'publicAuthenticated':False}
 if not cid:return {**out,'status':'missing-register-profile-id'}
 try:
  with urllib.request.urlopen(url,timeout=30) as response:
   raw=response.read();out.update(httpStatus=response.status,responseSha256=hashlib.sha256(raw).hexdigest(),responseBytes=len(raw));data=json.loads(raw)
  a=data.get('athlete',{});team=a.get('team',{})
  out['athlete']={k:a.get(k) for k in ['id','uid','type','firstName','lastName','displayName','fullName','shortName','displayDOB','dateOfBirth','age','gender','position','batStyle','bowlStyle']}
  out['athlete']['team']={k:team.get(k) for k in ['id','name','displayName','abbreviation','slug','isNational']};out['athlete']['playerCardLinks']=[x['href'] for x in a.get('links',[]) if 'playercard' in x.get('rel',[])]
  out['status']='ok' if str(a.get('id'))==str(cid) and a.get('type')=='cricket' else 'identity-response-mismatch'
 except Exception as e:out.update(status='fetch-failed',errorType=type(e).__name__,error=str(e))
 return out
def main():
 mapping=json.loads((ROOT/'identities.json').read_text());cache=json.loads(CACHE.read_text()) if CACHE.exists() else {};pending=[x for x in mapping.items() if x[0] not in cache or cache[x[0]].get('status')!='ok'];print('pending',len(pending),flush=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for i,r in enumerate(pool.map(fetch,pending),1):
   cache[r['canonicalName']]=r;temp=CACHE.with_suffix('.json.tmp');temp.write_text(json.dumps(cache,indent=2)+'\n');temp.replace(CACHE)
   if i%20==0 or r['status']!='ok':print('completed',i,'/',len(pending),r['canonicalName'],r['status'],flush=True)
 print('cached',len(cache),'ok',sum(x.get('status')=='ok' for x in cache.values()),flush=True)
if __name__=='__main__':main()
