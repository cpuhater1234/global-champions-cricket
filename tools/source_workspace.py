#!/usr/bin/env python3
"""Extract GCC's standalone prototype into editable sources without changing bytes.

No bundler, dependency install, runtime fetch, or function override is used. Include
markers are expanded at build time, inside their original JavaScript closure.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src"
BASE_SHA = "8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2"
MARKER = re.compile(r"@@GCC_INCLUDE:([a-zA-Z0-9_./-]+)@@")
SCRIPT_NAMES = ["players-2008", "league-data", "ratings-model", "player-projections",
                "cpu-draft", "foundation-game", "home-motion", "event-presentation",
                "dynasty-game", "home-identity"]
VIEW_GROUPS = {
    "foundation-game": {
        "season": ["seasonFixtureRow", "renderSeasonFixtures", "fullLadderHtml",
                   "renderSeasonLadder", "renderSeasonOverview", "setSeasonView",
                   "renderSeason", "renderSeasonInsights", "renderMatchStory"],
        "matchday": ["openMatchdayPreview"],
        "finals": ["finalsMatchMarkup", "renderFinals"],
        "review": ["renderSeasonReview"],
        "draft": ["renderDraftWorkspace", "renderDraftStatus", "renderDraftTransit",
                  "renderDraft", "renderDraftFlow", "renderPlayers"],
        "team": ["renderTeam"],
    },
    "dynasty-game": {
        "offseason": ["renderOffseason", "renderMarket", "renderLottery", "renderCuts", "renderReady"],
        "annual-draft": ["annualPlayerCard", "annualDraftNeedsHtml", "renderAnnualDraftPoolOnly", "renderAnnualDraft"],
        "trade": ["openTradeCentre", "refreshTradeRead"],
    },
}

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def read(path: Path) -> str:
    return path.read_bytes().decode("utf-8")

def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content.encode("utf-8"))

def function_span(text: str, name: str) -> tuple[int, int]:
    """Locate a declaration; strings and templates do not contribute braces.

    Extraction is additionally checked by exact round-trip and node --check.
    This is intentionally limited to the named presentation functions above.
    """
    match = re.search(r"\bfunction\s+" + re.escape(name) + r"\s*\(", text)
    if not match:
        raise ValueError(f"Missing presentation function: {name}")
    start = text.find("{", match.end())
    depth = 0
    quote = None
    escaped = False
    comment = None
    index = start
    while index < len(text):
        char = text[index]
        pair = text[index:index + 2]
        if comment == "line":
            if char == "\n": comment = None
        elif comment == "block":
            if pair == "*/": comment = None; index += 1
        elif escaped:
            escaped = False
        elif quote:
            if char == "\\": escaped = True
            elif char == quote: quote = None
        elif pair == "//":
            comment = "line"; index += 1
        elif pair == "/*":
            comment = "block"; index += 1
        elif char in "'\"`":
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0: return match.start(), index + 1
        index += 1
    raise ValueError(f"Unterminated presentation function: {name}")

def expand(text: str, source: Path, stack: tuple[str, ...] = ()) -> str:
    def replace(match: re.Match) -> str:
        relative = match.group(1)
        target = (source / relative).resolve()
        if not target.is_relative_to(source.resolve()):
            raise ValueError(f"Include escapes source root: {relative}")
        if relative in stack: raise ValueError(f"Include cycle: {relative}")
        return expand(read(target), source, (*stack, relative))
    return MARKER.sub(replace, text)

def build(source: Path, output: Path) -> bytes:
    result = expand(read(source / "shell.html"), source).encode("utf-8")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(result)
    return result

def extract(baseline: Path, source: Path) -> None:
    raw = baseline.read_bytes()
    if digest(raw) != BASE_SHA:
        raise ValueError("Input is not the verified v7.8.7 baseline. Refusing extraction.")
    if source.exists() and any(source.iterdir()):
        raise ValueError("Source directory already contains files. Refusing to overwrite edits.")
    text = raw.decode("utf-8")
    original = text
    files = []
    def asset(match: re.Match) -> str:
        relative = f"assets/embedded-{len(files):03d}.txt"
        write(source / relative, match.group(0))
        files.append(relative)
        return f"@@GCC_INCLUDE:{relative}@@"
    # Keep opaque embedded bitmap data out of code and CSS review.
    text = re.sub(r"data:image/[a-zA-Z0-9.+-]+;base64,[a-zA-Z0-9+/=]+", asset, text)
    blocks = list(re.finditer(r"<(style|script)([^>]*)>(.*?)</\1>", text, re.S))
    script_index = style_index = 0
    records = []
    edits = []
    for match in blocks:
        kind, attrs, content = match.group(1), match.group(2), match.group(3)
        if kind == "style":
            relative = ["styles/legacy-foundation.css", "styles/legacy-feedback.css"][style_index]
            style_index += 1
        else:
            name = SCRIPT_NAMES[script_index]
            relative = f"scripts/{name}.js"
            script_index += 1
            view_edits = []
            for group, names in VIEW_GROUPS.get(name, {}).items():
                for function in names:
                    start, end = function_span(content, function)
                    view_path = f"views/{group}/{function}.js"
                    write(source / view_path, content[start:end])
                    view_edits.append((start, end, f"@@GCC_INCLUDE:{view_path}@@"))
            for start, end, replacement in sorted(view_edits, reverse=True):
                content = content[:start] + replacement + content[end:]
        write(source / relative, content)
        records.append({"kind": kind, "attributes": attrs, "path": relative})
        edits.append((match.start(3), match.end(3), f"@@GCC_INCLUDE:{relative}@@"))
    for start, end, replacement in reversed(edits):
        text = text[:start] + replacement + text[end:]
    write(source / "shell.html", text)
    manifest = {"baseline": baseline.name, "baseline_sha256": BASE_SHA,
                "script_count": script_index, "style_count": style_index,
                "blocks": records, "embedded_assets": files,
                "presentation_functions": VIEW_GROUPS}
    write(source / "manifest.json", json.dumps(manifest, indent=2) + "\n")
    rebuilt = expand(text, source)
    if rebuilt != original: raise ValueError("Source extraction changed original bytes.")
    print(f"Extracted {script_index} scripts, {style_index} styles, "
          f"{sum(len(v) for g in VIEW_GROUPS.values() for v in g.values())} views, {len(files)} assets.")

def check(source: Path, baseline: Path | None) -> None:
    with tempfile.TemporaryDirectory() as directory:
        result = build(source, Path(directory) / "candidate.html")
        text = result.decode("utf-8")
        blocks = re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", text, re.S)
        manifest = json.loads(read(source / "manifest.json"))
        assert len(blocks) == manifest["script_count"], "Script count changed"
        for index, content in enumerate(blocks):
            file = Path(directory) / f"script-{index}.js"
            write(file, content)
            subprocess.run(["node", "--check", str(file)], check=True, capture_output=True)
        if baseline is not None:
            assert result == baseline.read_bytes(), "Round-trip changed baseline bytes"
        print(f"PASS: {len(blocks)} scripts pass node syntax checks; SHA-256 {digest(result)}")
        if baseline is not None: print("PASS: byte-for-byte baseline identity, including simulation, assets and markup")

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    extract_parser = commands.add_parser("extract")
    extract_parser.add_argument("baseline", type=Path)
    extract_parser.add_argument("--source", type=Path, default=SOURCE)
    build_parser = commands.add_parser("build")
    build_parser.add_argument("output", type=Path)
    build_parser.add_argument("--source", type=Path, default=SOURCE)
    check_parser = commands.add_parser("check")
    check_parser.add_argument("--source", type=Path, default=SOURCE)
    check_parser.add_argument("--baseline", type=Path)
    args = parser.parse_args()
    if args.command == "extract": extract(args.baseline, args.source)
    elif args.command == "build":
        result = build(args.source, args.output)
        print(f"Built {args.output}: {len(result)} bytes, SHA-256 {digest(result)}")
    else: check(args.source, args.baseline)

if __name__ == "__main__": main()
