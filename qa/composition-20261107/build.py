"""Compose the reviewed UI corrections onto exact, immutable v93 bytes."""
import argparse
import hashlib
from pathlib import Path
import re

BASELINE_SHA256 = '3abf1f74a1ec77db5b3bd0322e3188015bca161853bdd3397bd116bcf1e5f026'
STYLE_ID = 'gcc-composition-20261107'

def compose(baseline: bytes, css: str) -> bytes:
    if hashlib.sha256(baseline).hexdigest() != BASELINE_SHA256:
        raise ValueError('baseline hash mismatch: use the locked v93 recovery anchor')
    if re.search(r'</?style\b', css, re.I):
        raise ValueError('CSS contains a style boundary')
    text = baseline.decode('utf-8')
    closing = re.search(r'</body>\s*</html>\s*\Z', text, re.I)
    if not closing:
        raise ValueError('missing final document boundary')
    insertion = '<style id="'+STYLE_ID+'">\n'+css+'\n</style>\n'
    return (text[:closing.start()]+insertion+text[closing.start():]).encode('utf-8')

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--baseline', type=Path, required=True)
    ap.add_argument('--output', type=Path, required=True)
    args = ap.parse_args()
    root = Path(__file__).resolve().parents[2]
    css = (root/'v8/ui/composition.css').read_text()
    output = compose(args.baseline.read_bytes(), css)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(output)
    print(args.output, len(output), hashlib.sha256(output).hexdigest())
