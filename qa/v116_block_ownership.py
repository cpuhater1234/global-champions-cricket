#!/usr/bin/env python3
"""Trace frozen GCC v116 inline blocks to candidate tracked source files.

Evidence is deliberately conservative:
- identical_file = the full block byte-for-byte equals a tracked source file
- source_embedded = the whole tracked source file occurs byte-for-byte in block
- block_embedded = the whole block occurs byte-for-byte in tracked source file
- line_overlap_hint = overlapping nontrivial lines; NOT proof of ownership
- unmapped = no evidence of a matching current file

No rebuilding, mutations to game HTML, or source-owner claims are made.
"""
import argparse
from collections import Counter
from hashlib import sha256
import json
from pathlib import Path
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from v116_source_reconciliation import ROOT, inspect_release

MIN_SIGNAL = 30
SOURCE_DIRS = ("v8/ui", "v8/engine", "v8/domain", "v8/core", "src")
SIGNAL = re.compile(rb"\s+")

def informative_lines(data):
    """Unique, nontrivial line tokens; score is heuristic and never an ownership claim."""
    result = set()
    for line in data.splitlines():
        line = SIGNAL.sub(b" ", line.strip())
        if MIN_SIGNAL <= len(line) <= 500:
            result.add(sha256(line).digest()[:12])
    return result

def sources():
    result = []
    for base in SOURCE_DIRS:
        directory = ROOT / base
        if not directory.exists():
            continue
        for file in sorted(directory.rglob("*")):
            if file.is_file() and file.suffix.lower() in (".js", ".css"):
                data = file.read_bytes()
                if data:
                    result.append({
                        "path": file.relative_to(ROOT).as_posix(),
                        "kind": "style" if file.suffix == ".css" else "script",
                        "bytes": len(data), "sha256": sha256(data).hexdigest(),
                        "_data": data, "_lines": informative_lines(data)
                    })
    return result

def classify(body, candidates):
    exact = []
    hints = []
    b_lines = informative_lines(body)
    for source in candidates:
        data = source["_data"]
        evidence = (
            "identical_file" if body == data else
            "source_embedded" if data in body else
            "block_embedded" if body and body in data else None
        )
        if evidence:
            exact.append({
                "path": source["path"], "evidence": evidence,
                "source_bytes": source["bytes"], "source_sha256": source["sha256"]
            })
            continue
        overlap = len(b_lines & source["_lines"])
        if len(b_lines) >= 6 and len(source["_lines"]) >= 6 and overlap >= 3:
            source_coverage = overlap / len(source["_lines"])
            block_coverage = overlap / len(b_lines)
            hints.append({
                "path": source["path"], "shared_unique_lines": overlap,
                "block_unique_lines": len(b_lines),
                "source_unique_lines": len(source["_lines"]),
                "block_coverage": round(block_coverage, 3),
                "source_coverage": round(source_coverage, 3),
            })
    # A complete exact source match is evidence. Overlap is for targeting review only.
    exact.sort(key=lambda x: (
        {"identical_file": 0, "source_embedded": 1, "block_embedded": 2}[x["evidence"]],
        x["path"]))
    hints.sort(key=lambda x: (
        -min(x["block_coverage"], x["source_coverage"]),
        -x["shared_unique_lines"], x["path"]))
    return exact, hints[:3]

def create_report():
    data, blocks, metadata = inspect_release(ROOT / "GCC_v116_release (1).html")
    files = sources()
    by_kind = {
        kind: [s for s in files if s["kind"] == kind]
        for kind in ("style", "script")
    }
    rows = []
    for match, row in zip(blocks, metadata):
        body = match.group(3)
        matches, hints = classify(body, by_kind[row["kind"]])
        entry = dict(row)
        entry["exact_file_evidence"] = matches
        entry["line_overlap_hints"] = hints
        entry["status"] = (
            "exact_source_correspondence" if matches
            else "heuristic_only" if hints else "unmapped"
        )
        rows.append(entry)
    status = Counter(row["status"] for row in rows)
    return {
        "scope": "v116 frozen artifact; read-only source correspondence audit",
        "release_sha256": sha256(data).hexdigest(),
        "source_files_scanned": len(files),
        "scanned_directories": list(SOURCE_DIRS),
        "counters": dict(status),
        "styles": [r for r in rows if r["kind"] == "style"],
        "scripts": [r for r in rows if r["kind"] == "script"],
        "maintained_build_parity": "UNVERIFIED",
        "limitations": [
            "Byte inclusion does not prove that the matched file generated the block",
            "Line-overlap hints are not identity, ownership or reproducibility proof",
            "Style cascade conflicts and gameplay behaviour require separate verification",
            "Original frozen v116 artifact remains the playable source of truth",
        ],
    }

def markdown(report):
    lines = [
        "# GCC v116 frozen block correspondence",
        "",
        f"Frozen SHA-256: \`{report['release_sha256']}\`",
        f"Scanned {report['source_files_scanned']} source CSS/JS files.",
        "This maps byte-level correspondences, not maintained build provenance.",
        "",
        "| Block | ID | Bytes | Byte-level correspondence | Review hint |",
        "|---|---|---:|---|---|",
    ]
    for row in report["styles"] + report["scripts"]:
        label = ("CSS" if row["kind"] == "style" else "JS") + f" {row['index']:02d}"
        ident = (row["id"] or "(none)").replace("|", "\\|")
        match = row["exact_file_evidence"]
        hint = row["line_overlap_hints"]
        evidence = "; ".join(
            f"\`{m['path']}\` ({m['evidence']})" for m in match[:3]
        ) or "**Not byte-matched**"
        clue = "; ".join(
            f"\`{h['path']}\` ({h['shared_unique_lines']} shared lines)" for h in hint[:2]
        ) or "None"
        lines.append(f"| {label} | \`{ident}\` | {row['bytes']:,} | {evidence} | {clue} |")
    lines += [
        "",
        "## Interpretation",
        "",
        "- **identical_file:** exact full-block bytes match a tracked file.",
        "- **source_embedded:** the full tracked file occurs as an exact contiguous fragment within the block.",
        "- **block_embedded:** the whole block occurs within a tracked file.",
        "- **Review hint:** significant identical lines, potentially a shared ancestor. Not source identity.",
        "- **Not byte-matched:** do not overwrite that block from an old source file.",
        "",
        "**NOT VERIFIED:** a maintained-source v116 build, one CSS owner per component, or visual/gameplay acceptance.",
        "",
    ]
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", type=Path)
    parser.add_argument("--md", type=Path)
    parser.add_argument("--summary", action="store_true")
    a = parser.parse_args()
    report = create_report()
    if a.json:
        a.json.parent.mkdir(parents=True, exist_ok=True)
        a.json.write_text(json.dumps(report, indent=2) + "\n")
    if a.md:
        a.md.parent.mkdir(parents=True, exist_ok=True)
        a.md.write_text(markdown(report))
    print(json.dumps({
        "release_sha256": report["release_sha256"],
        "sources": report["source_files_scanned"],
        "styles": len(report["styles"]), "scripts": len(report["scripts"]),
        "classifications": report["counters"],
        "maintained_build_parity": "UNVERIFIED"
    }, indent=2))
    if a.summary:
        print(markdown(report))
    return 0

if __name__ == "__main__":
    sys.exit(main())
