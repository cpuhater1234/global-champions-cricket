"""Embed reviewed WebP assets without changing surrounding HTML or game code."""
import base64
import hashlib
import json
import re
from pathlib import Path

IMAGE_URI = re.compile(r'data:(image/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=]+)')

def rewrite_images(html, manifest_path):
    manifest = json.loads(Path(manifest_path).read_text())
    if manifest.get('version') != 1:
        raise ValueError('unsupported media manifest version')
    images = list(manifest.get('images', []))
    for part in manifest.get('parts', []):
        part_path = Path(manifest_path).parent / part
        chunk = json.loads(part_path.read_text())
        if chunk.get('version') != 1:
            raise ValueError('unsupported media part version')
        images.extend(chunk['images'])
    replacements = {}
    for entry in images:
        digest = entry['original_sha256']
        if digest in replacements:
            raise ValueError('duplicate original image hash')
        data = base64.b64decode(entry['webp_base64'], validate=True)
        if hashlib.sha256(data).hexdigest() != entry['replacement_sha256']:
            raise ValueError('replacement hash mismatch')
        if data[:4] != b'RIFF' or data[8:12] != b'WEBP':
            raise ValueError('replacement is not WebP')
        replacements[digest] = entry
    seen = set()
    def replace(match):
        digest = hashlib.sha256(base64.b64decode(match[2], validate=True)).hexdigest()
        if digest not in replacements:
            raise ValueError('unmapped image: ' + digest)
        entry = replacements[digest]
        if match[1] != entry['original_mime']:
            raise ValueError('original image MIME mismatch')
        seen.add(digest)
        return 'data:image/webp;base64,' + entry['webp_base64']
    output = IMAGE_URI.sub(replace, html)
    if seen != replacements.keys():
        raise ValueError('missing images from build')
    return output
