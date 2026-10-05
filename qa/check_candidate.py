#!/usr/bin/env python3
"""Static guardrail for GCC candidates.

Usage:
    python qa/check_candidate.py path/to/candidate.html

This does not prove gameplay correctness. It catches accidental baseline drift,
JavaScript syntax errors, duplicate DOM IDs, and unintended edits to the
protected cricket/simulation functions before browser QA.
"""
from __future__ import annotations

import hashlib
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "game" / "global_champions_cricket_v7_0_14_mobile_interaction_hardened.html"
EXPECTED_BASELINE_NORMALISED_SHA = "147ac0db30e150a85e60332bd9b56c3e8f9edcdc2226aaed729b737dac40d54c"
PROTECTED_FUNCTIONS = [
    "profile",
    "evaluateDraft",
    "chooseAIPick",
    "bestXI",
    "assignBattingSlots",
    "effectiveProfile",
    "phaseScore",
    "simulateInningsPair",
    "allocateRuns",
    "buildBattingCard",
    "bowlingBallAllocation",
    "updateFormForMatch",
]


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def newline_normalised_sha(path: Path) -> str:
    # GitHub's initial browser upload removed six harmless newline characters at
    # transfer boundaries. Removing all CR/LF bytes gives a stable integrity
    # fingerprint for the protected content without masking any non-newline edit.
    data = path.read_bytes().replace(b"\r", b"").replace(b"\n", b"")
    return sha256_bytes(data)


def scripts(html: str) -> list[str]:
    return re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", html, re.S | re.I)


def extract_function(text: str, name: str) -> str | None:
    m = re.search(r"function\s+" + re.escape(name) + r"\s*\(", text)
    if not m:
        return None
    brace = text.find("{", m.end())
    if brace < 0:
        return None
    depth = 0
    i = brace
    single = double = template = False
    escaped = False
    while i < len(text):
        c = text[i]
        if escaped:
            escaped = False
        elif c == "\\":
            escaped = True
        elif single:
            if c == "'":
                single = False
        elif double:
            if c == '"':
                double = False
        elif template:
            if c == "`":
                template = False
        elif c == "'":
            single = True
        elif c == '"':
            double = True
        elif c == "`":
            template = True
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[m.start() : i + 1]
        i += 1
    return None


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python qa/check_candidate.py path/to/candidate.html")
        return 2

    candidate = Path(sys.argv[1]).resolve()
    if not candidate.exists():
        print(f"FAIL candidate not found: {candidate}")
        return 2

    failures: list[str] = []

    actual_base_normalised_sha = newline_normalised_sha(BASELINE)
    if actual_base_normalised_sha != EXPECTED_BASELINE_NORMALISED_SHA:
        failures.append(
            "protected baseline content drifted: "
            f"{actual_base_normalised_sha} != {EXPECTED_BASELINE_NORMALISED_SHA}"
        )

    base_text = BASELINE.read_text(encoding="utf-8")
    candidate_text = candidate.read_text(encoding="utf-8")

    ids = re.findall(r"\bid=[\"']([^\"']+)[\"']", candidate_text)
    duplicates = sorted({x for x in ids if ids.count(x) > 1})
    if duplicates:
        failures.append("duplicate DOM IDs: " + ", ".join(duplicates))

    base_functions = {n: extract_function(base_text, n) for n in PROTECTED_FUNCTIONS}
    candidate_functions = {n: extract_function(candidate_text, n) for n in PROTECTED_FUNCTIONS}
    for name in PROTECTED_FUNCTIONS:
        if base_functions[name] is None:
            failures.append(f"protected function missing from baseline: {name}")
        elif candidate_functions[name] is None:
            failures.append(f"protected function missing from candidate: {name}")
        elif candidate_functions[name] != base_functions[name]:
            failures.append(f"protected function changed: {name}")

    js_blocks = scripts(candidate_text)
    if len(js_blocks) != 9:
        failures.append(f"expected 9 script blocks, found {len(js_blocks)}")

    node = shutil.which("node")
    if node:
        with tempfile.TemporaryDirectory() as td:
            for i, js in enumerate(js_blocks):
                p = Path(td) / f"script_{i}.js"
                p.write_text(js, encoding="utf-8")
                r = subprocess.run([node, "--check", str(p)], capture_output=True, text=True)
                if r.returncode:
                    failures.append(
                        f"JavaScript syntax failure in script block {i}: {r.stderr.strip()}"
                    )
    else:
        print("WARN node is not installed; JavaScript syntax check skipped")

    print(f"Baseline normalised SHA-256: {actual_base_normalised_sha}")
    print(f"Candidate SHA-256: {sha256(candidate)}")
    print(f"Script blocks: {len(js_blocks)}")
    print(f"Duplicate DOM IDs: {len(duplicates)}")
    print(
        "Protected functions unchanged: "
        + ("yes" if not any("protected function" in x for x in failures) else "no")
    )

    if failures:
        print("\nFAIL")
        for item in failures:
            print(f"- {item}")
        return 1

    print("\nPASS static candidate guardrail")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
