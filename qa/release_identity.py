"""Fail closed on the GCC v94 malformed-style regression and identify releases."""
import argparse
from collections import Counter
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys

class Structure(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.style_ids = []
        self.style_depth = 0
        self.errors = []
        self.body_starts = self.body_ends = 0
    def handle_starttag(self, tag, attrs):
        if tag == "body":
            self.body_starts += 1
        if tag == "style":
            self.style_depth += 1
            self.style_ids.extend(v for k, v in attrs if k == "id")
    def handle_endtag(self, tag):
        if tag == "body":
            self.body_ends += 1
        if tag == "style":
            if self.style_depth != 1:
                self.errors.append("unmatched style boundary")
            self.style_depth = max(0, self.style_depth - 1)
    def handle_data(self, data):
        if self.style_depth and re.search(r"<\s*/?\s*style\b", re.sub(r"/\*.*?\*/", "", data, flags=re.S), re.I):
            self.errors.append("style markup embedded inside stylesheet")

def inspect(path, expected_sha256=None):
    raw = Path(path).read_bytes()
    text = raw.decode("utf-8")
    parser = Structure()
    parser.feed(text)
    parser.close()
    errors = list(parser.errors)
    duplicates = [key for key, n in Counter(parser.style_ids).items() if n > 1]
    if duplicates:
        errors.append("duplicate style IDs: " + ", ".join(duplicates))
    if parser.style_depth or parser.body_starts != 1 or parser.body_ends != 1:
        errors.append("invalid body/style boundary counts")
    sha = hashlib.sha256(raw).hexdigest()
    if expected_sha256 and sha != expected_sha256:
        errors.append("release hash mismatch")
    scripts = re.findall(r"<script\b[^>]*>(.*?)</script\s*>", text, re.S | re.I)
    if len(scripts) != 20:
        errors.append("expected 20 script blocks")
    normalise = lambda s: re.sub(r"data:image/[^;]+;base64,[A-Za-z0-9+/=]+", "IMAGE", s)
    return dict(path=str(path), bytes=len(raw), sha256=sha,
                scripts=len(scripts), script_sha256=[
                    hashlib.sha256(normalise(s).encode()).hexdigest() for s in scripts],
                style_ids=parser.style_ids, errors=errors, passed=not errors)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("--expected-sha256")
    args = ap.parse_args()
    result = inspect(args.html, args.expected_sha256)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["passed"] else 1)
