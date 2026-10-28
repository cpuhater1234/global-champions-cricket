"""Extract official Ubuntu packages into a task-local prefix; never install system packages."""
import gzip, hashlib, re, subprocess, urllib.request, pathlib, concurrent.futures, json
root=pathlib.Path('/tmp/gcc-webkit-deps'); prefix=root/'prefix';prefix.mkdir(parents=True,exist_ok=True)
selected=json.loads(pathlib.Path('qa/limits-20261027/browsers/packages-manifest.json').read_text())
print('SELECTED',len(selected),flush=True)
def fetch(item):
 name,p=item;dest=root/pathlib.Path(p['Filename']).name
 if not dest.exists():
  with urllib.request.urlopen('https://archive.ubuntu.com/ubuntu/'+p['Filename'],timeout=25) as response:dest.write_bytes(response.read())
 assert hashlib.sha256(dest.read_bytes()).hexdigest()==p['SHA256'],name
 subprocess.run(['dpkg-deb','-x',str(dest),str(prefix)],check=True)
 print('EXTRACTED',name,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
 for result in executor.map(fetch,selected.items()):pass
