#!/usr/bin/env python3
"""Manually create the 390px signing-width fix candidate.

Removes the obsolete `min-width:72px` declaration from the gcc-cleanup-pass
style block's .g8days>span rule, restoring the earlier min-width:0 from
gcc-composition-20261107. No style layer is added; no script changes.

This is a review candidate artifact, not a new release. The frozen HTML is
not modified.
"""
from pathlib import Path
from hashlib import sha256

RELEASE = Path("GCC_v116_release (1).html")
OUTPUT = Path("qa/results/v116-signing-width-review.html")

data = RELEASE.read_bytes()
sha_before = sha256(data).hexdigest()
print(f"Source SHA-256: {sha_before}")
print(f"Source bytes: {len(data)}")

old = b"#g8app#g8app#g8app .g8days>span{flex:1;text-align:center;min-width:72px;background:#10263a!important;border-color:#365667!important;color:#a9cfd7!important}"
new = b"#g8app#g8app#g8app .g8days>span{flex:1;text-align:center;background:#10263a!important;border-color:#365667!important;color:#a9cfd7!important}"

count = data.count(old)
print(f"Occurrences of target rule: {count}")
assert count == 1, f"Expected exactly 1 occurrence, found {count}"

candidate = data.replace(old, new)
sha_after = sha256(candidate).hexdigest()
print(f"Candidate SHA-256: {sha_after}")
print(f"Candidate bytes: {len(candidate)}")
print(f"Bytes removed: {len(data) - len(candidate)}")

assert b"min-width:72px" not in candidate, "min-width:72px still present in candidate"
assert b"min-width:0" in candidate, "min-width:0 not found in candidate"

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_bytes(candidate)
print(f"Candidate written to {OUTPUT}")

# Also write a build report
report = {
    "status": "CANDIDATE_ONLY",
    "source_sha256": sha_before,
    "candidate_sha256": sha_after,
    "candidate_bytes": len(candidate),
    "source_bytes": len(data),
    "edit": "Remove min-width:72px from gcc-cleanup-pass .g8days>span rule",
    "playable_release_unchanged": True,
    "bytes_removed": len(data) - len(candidate),
}
report_path = Path("qa/results/v116-signing-candidate-build.json")
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(__import__("json").dumps(report, indent=2) + "\n")
print(f"Report written to {report_path}")
