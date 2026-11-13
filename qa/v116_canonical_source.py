#!/usr/bin/env python3
"""Lossless, byte-exact source extraction/build for the staged v116 review candidate."""
import argparse,json,re
from pathlib import Path
from hashlib import sha256
from v116_source_reconciliation import BLOCK

def digest(data):return sha256(data).hexdigest()
def extract(source,target):
 data=source.read_bytes();blocks=list(BLOCK.finditer(data));counts={t:sum(m[1].lower()==t.encode() for m in blocks) for t in ['style','script']}
 if counts!={'style':17,'script':22}:raise ValueError('Unexpected block inventory; stop rather than reinterpret source')
 target.mkdir(parents=True,exist_ok=True);parts=[];entries=[];end=0
 for i,m in enumerate(blocks):
  kind=m[1].decode().lower();identity=re.search(rb'\bid=["\']([^"\']+)["\']',m[2]);name=identity[1].decode() if identity else 'base' if kind=='style' else 'runtime'
  name=re.sub(r'[^a-zA-Z0-9_-]','-',name);rel=f'{"styles" if kind=="style" else "scripts"}/{i:02d}-{name}.{ "css" if kind=="style" else "js"}'
  token=f'@@GCC_V116_BODY_{i:02d}@@'.encode()
  if token in data:raise ValueError('Token collision')
  file=target/rel;file.parent.mkdir(parents=True,exist_ok=True);file.write_bytes(m[3]);entries.append(dict(index=i,kind=kind,path=rel,token=token.decode(),sha256=digest(m[3]),attributes=m[2].decode()))
  parts.extend([data[end:m.start(3)],token]);end=m.end(3)
 parts.append(data[end:]);template=b''.join(parts);(target/'template.html').write_bytes(template)
 manifest=dict(format=1,scope='QA review candidate only; main/frozen release not promoted',reference_sha256=digest(data),reference_bytes=len(data),template_sha256=digest(template),blocks=entries)
 (target/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
 (target/'README.md').write_text('''# Staged v116 canonical candidate source

This directory is a lossless, editable source snapshot of the validated QA review candidate. It does not promote main or the frozen release, and it does not claim that the legacy v8 module tree is equivalent.

`template.html` retains all assets, markup and block attributes in their original positions. `styles/` contains the17 existing style-owner bodies. `scripts/` contains the22 unchanged runtime bodies. Block order is preserved. The template is an input, not a runnable game.

Build from repository root:

`python qa/v116_canonical_source.py build --source v116/canonical --output qa/results/canonical-review.html --report qa/results/canonical-build.json`

Check the current snapshot against its recorded manifest:

`python qa/v116_canonical_source.py build --source v116/canonical --output qa/results/canonical-review.html --check-manifest --report qa/results/canonical-check.json`

Future candidate edits should edit the relevant owner body and rebuild. A strict manifest check intentionally fails after edits until a newly reviewed snapshot is recorded. CSS edits must preserve runtime body hashes; script edits require renewed engine acceptance. Existing staged composers are historical reproductions, not an alternate maintained source to import wholesale. Do not edit the legacy v8 CSS and inject it into this candidate.

This snapshot resolves candidate source/build identity. It does not consolidate the17 legacy style owners into one design stylesheet or remove every competing declaration. Cascade consolidation remains a separate, render-verified task.
''')
 return manifest

def build(source,output,reference=None,strict=False,allow_runtime=False):
 manifest=json.loads((source/'manifest.json').read_text());template=(source/'template.html').read_bytes()
 if digest(template)!=manifest['template_sha256']:raise ValueError('Template changed without a new extraction')
 data=template;changed=[]
 for e in manifest['blocks']:
  token=e['token'].encode();body=(source/e['path']).read_bytes()
  if data.count(token)!=1:raise ValueError('Missing or duplicate body marker '+e['path'])
  if digest(body)!=e['sha256']:changed.append(e['path'])
  data=data.replace(token,body,1)
 if b'@@GCC_V116_BODY_' in data:raise ValueError('Unexpanded marker')
 runtime=[e['path'] for e in manifest['blocks'] if e['kind']=='script' and e['path'] in changed]
 if runtime and not allow_runtime:raise ValueError('Runtime edits require explicit renewed-engine-QA intent: '+str(runtime))
 inventory=list(BLOCK.finditer(data))
 if sum(m[1].lower()==b'style' for m in inventory)!=17 or sum(m[1].lower()==b'script' for m in inventory)!=22:raise ValueError('Block inventory changed')
 if strict and (changed or digest(data)!=manifest['reference_sha256']):raise ValueError('Manifest parity failed: '+str(changed))
 if reference and data!=reference.read_bytes():raise ValueError('Byte-exact reference parity failed')
 output.parent.mkdir(parents=True,exist_ok=True);output.write_bytes(data)
 return dict(status='PASS',sha256=digest(data),bytes=len(data),changed_bodies=changed,reference_parity='BYTE_IDENTICAL' if reference else 'NOT_REQUESTED',manifest_parity='BYTE_IDENTICAL' if strict else 'NOT_REQUESTED',styles=17,scripts=22,scope=manifest['scope'])

if __name__=='__main__':
 p=argparse.ArgumentParser();sub=p.add_subparsers(dest='action',required=True)
 e=sub.add_parser('extract');e.add_argument('--input',type=Path,required=True);e.add_argument('--source',type=Path,required=True);e.add_argument('--report',type=Path)
 b=sub.add_parser('build');b.add_argument('--source',type=Path,required=True);b.add_argument('--output',type=Path,required=True);b.add_argument('--reference',type=Path);b.add_argument('--check-manifest',action='store_true');b.add_argument('--allow-runtime-changes',action='store_true');b.add_argument('--report',type=Path)
 a=p.parse_args();r=extract(a.input,a.source) if a.action=='extract' else build(a.source,a.output,a.reference,a.check_manifest,a.allow_runtime_changes)
 if a.report:a.report.parent.mkdir(parents=True,exist_ok=True);a.report.write_text(json.dumps(r,indent=2)+'\n')
 print(json.dumps({k:v for k,v in r.items() if k!='blocks'}))
