"""Reproduce the complete-club standalone from the exact protected v78 release.

No old source freeze/rebuild, player data rewrite or engine regeneration is used.
From a normal checkout the immutable baseline comes from its original Git commit.
"""
from pathlib import Path
import argparse
import base64
import hashlib
import json
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
QA = ROOT / 'qa/club-expansion-20261027'
BASE_COMMIT = '203753ab590c826f1c81469a3c95e459dbd6e560'
BASE_SHA = '4397ee6b8dc82cff83af86be14b790b8c0cb8997629e014979000a02e48df1ff'
ALLOWED = {0, 1, 5, 12, 17}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def build(promote=False):
    local = QA / 'baseline.html'
    baseline = local.read_bytes() if local.exists() else subprocess.check_output(
        ['git', 'show', BASE_COMMIT + ':game/gcc_v8_product_candidate.html'], cwd=ROOT)
    if sha(baseline) != BASE_SHA:
        raise SystemExit('Refusing to build from a different baseline.')
    html = baseline.decode('utf-8')
    blocks = list(re.finditer(r'<script\b[^>]*>(.*?)</script>', html, re.S))
    if len(blocks) != 20:
        raise SystemExit('Unexpected baseline script layout.')
    records = json.loads((ROOT / 'v8/data/club_expansion.json').read_text())
    clubs = [record['club'] for record in records['records']]
    if len(clubs) != 16 or len({club['abbr'] for club in clubs}) != 16:
        raise SystemExit('Expected exactly sixteen unique new clubs.')
    expansion = {
        'clubs': clubs,
        'stories': {r['club']['abbr']: r['story'] for r in records['records']},
        'groundReads': {r['club']['abbr']: r['groundRead'] for r in records['records']},
    }
    media_script = blocks[1].group(1).strip()
    media = json.loads(media_script.removeprefix('window.GCC8_MEDIA=').removesuffix(';'))
    for record in records['records']:
        abbr, photo = record['club']['abbr'], dict(record['photo'])
        path = ROOT / 'v8/assets/club-expansion' / photo.pop('file')
        content = path.read_bytes()
        if sha(content) != photo.pop('sha256'):
            raise SystemExit('Ground photo hash mismatch: ' + abbr)
        photo['dataUrl'] = 'data:image/jpeg;base64,' + base64.b64encode(content).decode('ascii')
        media['venues'][abbr] = photo
    if len(media['venues']) != 36:
        raise SystemExit('Expected thirty-six actual-ground photographs.')
    choices = list(media['venues'])
    updates = {
        0: '(()=>{const choices=' + json.dumps(choices, separators=(',', ':')) +
           ';window.GCC8_HOME_PHOTO={abbr:choices[Math.floor(Math.random()*choices.length)]};})();',
        1: 'window.GCC8_MEDIA=' + json.dumps(media, separators=(',', ':')) + ';',
        5: blocks[5].group(1) + '\nwindow.GCC8_CLUB_EXPANSION=' +
           json.dumps(expansion, separators=(',', ':')) + ';\n' +
           (ROOT / 'v8/domain/club_catalogue.js').read_text().strip() + '\n',
        12: '\n' + (ROOT / 'v8/ui/data.js').read_text().strip() + '\n',
        17: '\n' + (ROOT / 'v8/ui/screens.js').read_text().strip() + '\n',
    }
    for index in sorted(updates, reverse=True):
        a, b = blocks[index].span(1)
        html = html[:a] + updates[index] + html[b:]
    css = (ROOT / 'v8/ui/club_expansion.css').read_text().strip()
    if html.count('</head>') != 1:
        raise SystemExit('Unexpected head structure.')
    html = html.replace('</head>', '<style id="gcc-club-catalogue-styles">\n' + css + '\n</style>\n</head>')
    result = html.encode('utf-8')
    after = list(re.finditer(r'<script\b[^>]*>(.*?)</script>', html, re.S))
    unchanged = []
    for index, (old, new) in enumerate(zip(blocks, after)):
        if index not in ALLOWED:
            if old.group(1) != new.group(1):
                raise SystemExit('Protected script changed: ' + str(index))
            unchanged.append(index)
    candidate = QA / 'candidate.html'
    candidate.write_bytes(result)
    if promote:
        for name in ['gcc_v8_product_candidate.html', 'gcc_v8_quiet_arcade.html']:
            (ROOT / 'game' / name).write_bytes(result)
    report = {'baselineCommit': BASE_COMMIT, 'baselineSha256': BASE_SHA,
              'releaseSha256': sha(result), 'bytes': len(result),
              'clubs': 36, 'photos': 36, 'scopedStylesheet': 'v8/ui/club_expansion.css', 'protectedScriptsUnchanged': unchanged,
              'editedScriptIndexes': sorted(ALLOWED)}
    (QA / 'build.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--promote', action='store_true')
    build(parser.parse_args().promote)
