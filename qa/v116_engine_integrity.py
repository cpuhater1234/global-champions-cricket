"""Read-only canonical core/data/controller byte pins; no automatic pin refresh."""
import argparse, hashlib, json, re, shutil, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / 'qa/fixtures/v116_engine_pins.json'
BLOCK = re.compile(rb'<(style|script)\b([^>]*)>(.*?)</\1\s*>', re.I | re.S)
def sha(data): return hashlib.sha256(data).hexdigest()
def verify(source, html, pins):
    source = source.resolve()
    rows = []
    blocks = list(BLOCK.finditer(html.read_bytes())) if html else None
    if blocks is not None:
        if len(blocks) != 39 or sum(m[1].lower() == b'script' for m in blocks) != 22:
            raise ValueError('Unexpected HTML block inventory')
    for row in pins['files']:
        path = (source / row['path']).resolve()
        if source not in path.parents: raise ValueError('Pin path escapes source')
        if sha(path.read_bytes()) != row['sha256']:
            raise ValueError('Source pin mismatch: ' + row['path'])
        if blocks is not None:
            block = blocks[row['block_index']]
            if block[1].lower() != b'script' or sha(block[3]) != row['sha256']:
                raise ValueError('HTML pin mismatch: ' + row['path'])
        rows.append(row['path'])
    return rows

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source', type=Path, default=ROOT / 'v116/canonical')
    p.add_argument('--html', type=Path)
    p.add_argument('--report', type=Path)
    p.add_argument('--self-test', action='store_true')
    a = p.parse_args(); pins = json.loads(MANIFEST.read_text())
    if pins['version'] != 1 or len(pins['files']) != 11 or len({r['path'] for r in pins['files']}) != 11:
        raise ValueError('Invalid integrity pin manifest')
    checked = verify(a.source, a.html, pins); probes = []
    if a.self_test:
        with tempfile.TemporaryDirectory(prefix='gcc-integrity-') as temp:
            temp = Path(temp); copied = temp / 'source'
            for row in pins['files']:
                dest = copied / row['path']; dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(a.source / row['path'], dest)
            changed = copied / 'scripts/19-runtime.js'
            changed.write_bytes(changed.read_bytes() + b'\n/* integrity mutation probe */\n')
            try: verify(copied, None, pins)
            except ValueError as e:
                if 'scripts/19-runtime.js' not in str(e): raise
                probes.append('modified core source rejected')
            else: raise AssertionError('Source mutation escaped pins')
            if a.html:
                original = a.html.read_bytes(); blocks = list(BLOCK.finditer(original))
                style = next(m for m in blocks if m[1].lower() == b'style')
                css_only = temp / 'css-only.html'
                css_only.write_bytes(original[:style.start(3)] + b'/* CSS-only probe */' + original[style.start(3):])
                verify(a.source, css_only, pins); probes.append('CSS-only HTML edit accepted')
                block = blocks[next(r['block_index'] for r in pins['files'] if r['path'] == 'scripts/19-runtime.js')]
                changed_html = temp / 'engine-mutant.html'
                changed_html.write_bytes(original[:block.start(3)] + b'/* engine mutation */' + original[block.start(3):])
                try: verify(a.source, changed_html, pins)
                except ValueError as e:
                    if 'HTML pin mismatch' not in str(e): raise
                    probes.append('modified embedded core rejected')
                else: raise AssertionError('HTML engine mutation escaped pins')
    result = dict(status='PASS', pinned_files=checked, html_sha256=sha(a.html.read_bytes()) if a.html else None,
                  self_tests=probes, scope=pins['scope'])
    if a.report:
        a.report.parent.mkdir(parents=True, exist_ok=True)
        a.report.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result))

if __name__ == '__main__': main()
