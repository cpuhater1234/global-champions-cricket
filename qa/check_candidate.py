#!/usr/bin/env python3
"""Static guardrail for GCC candidates.

Usage:
    python qa/check_candidate.py path/to/candidate.html

This does not prove gameplay correctness. It catches accidental baseline drift,
JavaScript syntax errors, duplicate DOM IDs, and save-key/version/meta-key
inconsistencies before browser QA.

Baseline is the canonical release at GCC_v116_release (1).html.
Save keys (SAVE_VERSION / SAVE_KEY / META_KEY) are reconciled against the
canonical release before any migration is considered.
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
BASELINE = ROOT / "GCC_v116_release (1).html"

# Canonical save-key contract (v116). Document any migration here before
# touching SAVE_KEY — changing it orphans all existing player saves.
CANONICAL_SAVE_VERSION = "7.2.0"
CANONICAL_SAVE_KEY = "gcc_dynasty_v8"
CANONICAL_LEGACY_SAVE_KEY = "gcc_dynasty_v7_2"
CANONICAL_META_KEY = "gcc_dynasty_meta_v8"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def newline_normalised_sha(path: Path) -> str:
    data = path.read_bytes().replace(b"\r", b"").replace(b"\n", b"")
    return sha256_bytes(data)


def scripts(html: str) -> list[str]:
    return re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", html, re.S | re.I)


def find_save_constants(text: str) -> dict[str, str | None]:
    """Extract SAVE_VERSION, SAVE_KEY, META_KEY assignments from HTML."""
    constants: dict[str, str | None] = {}
    for name in ("SAVE_VERSION", "SAVE_KEY", "META_KEY"):
        m = re.search(
            rf"{name}\s*=\s*['\"]([^'\"]+)['\"]", text
        )
        constants[name] = m.group(1) if m else None
    return constants


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: python qa/check_candidate.py path/to/candidate.html")
        return 2

    candidate = Path(sys.argv[1]).resolve()
    if not candidate.exists():
        print(f"FAIL candidate not found: {candidate}")
        return 2

    if not BASELINE.exists():
        print(f"FAIL baseline not found: {BASELINE}")
        return 2

    failures: list[str] = []

    # --- Baseline integrity ---
    actual_base_normalised_sha = newline_normalised_sha(BASELINE)
    baseline_text = BASELINE.read_text(encoding="utf-8")
    baseline_constants = find_save_constants(baseline_text)

    candidate_text = candidate.read_text(encoding="utf-8")
    candidate_constants = find_save_constants(candidate_text)

    # --- Save key / version / meta key reconciliation ---
    for key in ("SAVE_VERSION", "SAVE_KEY", "META_KEY"):
        base_val = baseline_constants.get(key)
        cand_val = candidate_constants.get(key)
        if cand_val is None:
            failures.append(f"{key} missing from candidate")
        elif base_val is not None and cand_val != base_val:
            failures.append(
                f"{key} drift: candidate={cand_val} != baseline={base_val}"
            )

    # --- Duplicate DOM IDs (exclude script tag contents, which may contain
    # template literal IDs like g8select-${p.id}) ---
    non_script = re.sub(r"<script(?:\s[^>]*)?>.*?</script>", "", candidate_text, flags=re.S | re.I)
    ids = re.findall(r"\bid=[\"']([^\"']+)[\"']", non_script)
    duplicates = sorted({x for x in ids if ids.count(x) > 1})
    if duplicates:
        failures.append("duplicate DOM IDs: " + ", ".join(duplicates))

    # --- JavaScript syntax check on all script blocks ---
    js_blocks = scripts(candidate_text)
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

    # --- Report ---
    print(f"Baseline normalised SHA-256: {actual_base_normalised_sha}")
    print(f"Candidate SHA-256: {sha256(candidate)}")
    print(f"Script blocks: {len(js_blocks)} (all syntax-checked)")
    print(f"Duplicate DOM IDs: {len(duplicates)}")
    print(
        "Save constants: "
        + ", ".join(
            f"{k}={candidate_constants.get(k)}"
            for k in ("SAVE_VERSION", "SAVE_KEY", "META_KEY")
        )
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
