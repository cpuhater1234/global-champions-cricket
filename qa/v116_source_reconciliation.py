#!/usr/bin/env python3
"""GCC v116: frozen-release identity, source inventory and lossless extraction.

Round-tripping the frozen artifact is NOT proof that the maintained v8/build.py
pipeline produces v116. It is only the first, exact-identity extraction gate.
"""
import argparse
from collections import Counter
from hashlib import sha256
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
RELEASE = ROOT / "GCC_v116_release (1).html"
EXPECTED_SHA256 = "b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0"
EXPECTED_BYTES = 6635097
EXPECTED_GIT_BLOB = "088cf689ef3a464b06e8512627811ad60864b3e8"
BLOCK = re.compile(rb"<(style|script)\b([^>]*)>(.*?)</\1\s*>", re.I | re.S)
BLOCK_ID = re.compile(rb'\bid\s*=\s*([\'"])(.*?)\1', re.I | re.S)

def sha(data):
    return sha256(data).hexdigest()

class Tags(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.starts, self.ends = Counter(), Counter()
    def handle_starttag(self, tag, attrs):
        if tag in ("html", "head", "body", "style", "script"):
            self.starts[tag] += 1
    def handle_endtag(self, tag):
        if tag in ("html", "head", "body", "style", "script"):
            self.ends[tag] += 1

def inspect_release(path):
    data = path.read_bytes()
    if len(data) != EXPECTED_BYTES or sha(data) != EXPECTED_SHA256:
        raise ValueError("Frozen v116 release identity mismatch: STOP")
    blocks = list(BLOCK.finditer(data))
    counts = Counter(m.group(1).decode("ascii").lower() for m in blocks)
    tags = Tags()
    tags.feed(data.decode("utf-8", errors="strict"))
    tags.close()
    for tag, count in (("html", 1), ("head", 1), ("body", 1),
                       ("style", 14), ("script", 20)):
        if tags.starts[tag] != count or tags.ends[tag] != count:
            raise ValueError(f"Unbalanced <{tag}>: {tags.starts[tag]} starts, {tags.ends[tag]} ends")
    if counts["style"] != 14 or counts["script"] != 20:
        raise ValueError(f"Unexpected style/script block inventory: {counts}")
    seen = set()
    record = []
    for i, m in enumerate(blocks):
        raw_id = BLOCK_ID.search(m.group(2))
        block_id = raw_id.group(2).decode("utf-8") if raw_id else None
        if block_id and block_id in seen:
            raise ValueError(f"Duplicate style/script ID: {block_id}")
        if block_id:
            seen.add(block_id)
        record.append({"index": i, "kind": m.group(1).decode("ascii").lower(),
                       "id": block_id, "bytes": len(m.group(3)), "sha256": sha(m.group(3))})
    return data, blocks, record

def source_inventory(blocks):
    grouped = {"style": [], "script": []}
    for m in blocks:
        grouped[m.group(1).decode("ascii").lower()].append(m.group(3))
    files = sorted((ROOT / "v8/ui").glob("*.css")) + sorted((ROOT / "v8/ui").glob("*.js"))
    matched, unmatched = [], []
    for file in files:
        body = file.read_bytes()
        kind = "style" if file.suffix == ".css" else "script"
        included = [i for i, item in enumerate(grouped[kind]) if body and body in item]
        (matched if included else unmatched).append(str(file.relative_to(ROOT)))
    builder = (ROOT / "v8/build.py").read_text(encoding="utf-8")
    return {
        "files_checked": len(files), "exact_contiguous_matches": matched,
        "unmatched_files": unmatched,
        "historical_builder_detected": "perfection-20261030/patch.py" in builder,
        "maintained_source_reproduction": "NOT VERIFIED",
        "caution": "Substring matches are not a full build, version attribution or CSS ownership certification"
    }

def extract(data, blocks, directory):
    if directory.exists() and any(directory.iterdir()):
        raise ValueError("Refusing to overwrite an existing source directory")
    (directory / "parts").mkdir(parents=True, exist_ok=True)
    (directory / "blocks").mkdir(parents=True, exist_ok=True)
    entries = []
    cursor = 0
    for i, m in enumerate(blocks):
        kind = m.group(1).decode("ascii").lower()
        raw_id = BLOCK_ID.search(m.group(2))
        ident = raw_id.group(2).decode("utf-8") if raw_id else "unnamed"
        ident = re.sub(r"[^a-zA-Z0-9_-]", "_", ident)[:60]
        items = [
            (f"parts/{i:02d}.html", data[cursor:m.start(3)], "structure"),
            (f"blocks/{i:02d}-{kind}-{ident}.{'css' if kind == 'style' else 'js'}",
             m.group(3), kind)
        ]
        for name, body, role in items:
            (directory / name).write_bytes(body)
            entries.append({"path": name, "sha256": sha(body), "bytes": len(body), "role": role})
        cursor = m.end(3)
    tail = data[cursor:]
    (directory / "parts/tail.html").write_bytes(tail)
    entries.append({"path": "parts/tail.html", "sha256": sha(tail),
                    "bytes": len(tail), "role": "structure"})
    manifest = {"schema": 1, "release_sha256": EXPECTED_SHA256,
                "release_bytes": EXPECTED_BYTES, "entries": entries}
    (directory / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest

def rebuild(directory, output, allow_edits=False):
    if output.resolve() == RELEASE.resolve():
        raise ValueError("Refusing to overwrite the frozen v116 release")
    manifest = json.loads((directory / "manifest.json").read_text())
    if manifest.get("schema") != 1 or manifest.get("release_sha256") != EXPECTED_SHA256:
        raise ValueError("Wrong source manifest for v116")
    data = bytearray()
    for item in manifest["entries"]:
        path = (directory / item["path"]).resolve()
        if directory.resolve() not in path.parents:
            raise ValueError("Manifest path escapes source directory")
        body = path.read_bytes()
        if not allow_edits or item["role"] == "structure":
            if len(body) != item["bytes"] or sha(body) != item["sha256"]:
                raise ValueError(f"Unexpected changed source part: {item['path']}")
        data.extend(body)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(data)
    identity = sha(data) == EXPECTED_SHA256 and len(data) == EXPECTED_BYTES
    if not allow_edits and not identity:
        raise ValueError("Extracted source failed exact binary reconstruction")
    return {"byte_identical_to_release": identity,
            "output_sha256": sha(data), "output_bytes": len(data)}

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("action", choices=("audit", "extract", "build", "roundtrip"))
    p.add_argument("--release", type=Path, default=RELEASE)
    p.add_argument("--source", type=Path)
    p.add_argument("--output", type=Path)
    p.add_argument("--json", type=Path)
    p.add_argument("--allow-edits", action="store_true")
    args = p.parse_args()
    if args.action == "build":
        if not args.source or not args.output:
            p.error("build requires --source and --output")
        result = rebuild(args.source, args.output, args.allow_edits)
    else:
        data, blocks, detail = inspect_release(args.release)
        result = {"release_sha256": sha(data), "release_bytes": len(data),
                  "recorded_git_blob": EXPECTED_GIT_BLOB,
                  "styles": 14, "scripts": 20, "blocks": detail,
                  "source": source_inventory(blocks)}
        if args.action == "extract":
            if not args.source:
                p.error("extract requires --source")
            extract(data, blocks, args.source)
            result["extracted_to"] = str(args.source)
        if args.action == "roundtrip":
            with tempfile.TemporaryDirectory(prefix="gcc-v116-roundtrip-") as temp:
                workspace = Path(temp) / "source"
                extract(data, blocks, workspace)
                result["roundtrip"] = rebuild(workspace, Path(temp) / "out.html")
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(result, indent=2) + "\n")
    public = {key: value for key, value in result.items() if key not in ("blocks", "source")}
    print(json.dumps(public, indent=2))
    if "source" in result:
        s = result["source"]
        print("EXACT INCLUSIONS:", len(s["exact_contiguous_matches"]), "/", s["files_checked"])
        print("MAINTAINED V116 BUILD REPRODUCTION: NOT VERIFIED")
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, UnicodeError, json.JSONDecodeError) as exc:
        print("FAIL CLOSED:", exc, file=sys.stderr)
        sys.exit(1)
