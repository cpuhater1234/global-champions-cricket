"""Extract official Ubuntu packages into a task-local prefix; never install system packages."""
import gzip, hashlib, re, subprocess, urllib.request, pathlib, concurrent.futures, json
root=pathlib.Path('/tmp/gcc-webkit-deps'); prefix=root/'prefix';prefix.mkdir(parents=True,exist_ok=True)
pkgs={}
for index in root.glob('*.gz'):
 for entry in gzip.open(index,'rt').read().split('\n\n'):
  fields={line.split(': ',1)[0]:line.split(': ',1)[1] for line in entry.splitlines() if ': ' in line and not line.startswith(' ')}
  if 'Package' in fields:pkgs[fields['Package']]=fields
installed=set(subprocess.check_output(['dpkg-query','-W','-f=${Package} ${Status}\n'],text=True).splitlines());installed={x.split()[0] for x in installed if x.endswith('install ok installed')}
wanted='libgstreamer1.0-0 libgtk-4-1 libgraphene-1.0-0 libevent-2.1-7t64 libgstreamer-plugins-base1.0-0 libgstreamer-plugins-bad1.0-0 libavif16 libharfbuzz-icu0 libwayland-server0 libmanette-0.2-0 libhyphen0 libsecret-1-0 libgles2'.split(); selected={}
def add(name):
 name=name.split(':')[0]
 if name in installed or name in selected:return
 if name not in pkgs:print('UNAVAILABLE',name,flush=True);return
 p=pkgs[name];selected[name]=p
 for group in (p.get('Pre-Depends','')+','+p.get('Depends','')).split(','):
  opts=[re.split(r'\s|\(',x.strip())[0].split(':')[0] for x in group.split('|') if x.strip()]
  if any(x in installed for x in opts):continue
  for option in opts:
   if option in pkgs:add(option);break
for name in wanted:add(name)
print('SELECTED',len(selected),sum(int(x.get('Size',0)) for x in selected.values()),sorted(selected),flush=True)
(root/'packages.json').write_text(json.dumps(selected,indent=2))
def fetch(item):
 name,p=item;dest=root/pathlib.Path(p['Filename']).name
 if not dest.exists():
  with urllib.request.urlopen('https://archive.ubuntu.com/ubuntu/'+p['Filename'],timeout=25) as response:dest.write_bytes(response.read())
 assert hashlib.sha256(dest.read_bytes()).hexdigest()==p['SHA256'],name
 subprocess.run(['dpkg-deb','-x',str(dest),str(prefix)],check=True)
 print('EXTRACTED',name,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
 for result in executor.map(fetch,selected.items()):pass
