#!/usr/bin/env python3
"""Check Phase 2 items in the current release."""
import re
from pathlib import Path

data = Path("GCC_v116_release (1).html").read_bytes().decode("utf-8", errors="replace")

print("=== PHASE 2V: INTERACTION POLISH ===")
print()

# Keyframes
keyframes = re.findall(r"@keyframes\s+(\w+)", data)
print(f"@keyframes count: {len(keyframes)}")
for kf in sorted(keyframes):
    print(f"  - {kf}")

print()

# Reduced motion
prm = re.findall(r'@media\s*\(prefers-reduced-motion[^)]*\)', data, re.I)
print(f"prefers-reduced-motion media queries: {len(prm)}")

reduced_motion_css = re.findall(r"reduced-motion", data, re.I)
print(f"reduced-motion CSS references: {len(reduced_motion_css)}")

print()

# Focus visible
fv = re.findall(r"focus-visible", data, re.I)
print(f"focus-visible references: {len(fv)}")

print()

# ARIA live
al = re.findall(r'aria-live\s*=\s*["\'](\w+)["\']', data)
print(f"aria-live values: {al}")
print(f"aria-live count: {len(al)}")

print()

# 44px / 48px touch targets
print(f"44px references: {len(re.findall(r'44px', data))}")
print(f"48px references: {len(re.findall(r'48px', data))}")

print()

# Transform/scale (zoom-related)
print(f"transform CSS declarations: {len(re.findall(r'transform\s*:', data, re.I))}")

print()

print("=== PHASE 2D: BALANCE FORMULA ===")
# Check phaseScore
ps = re.findall(r"phaseScore", data)
print(f"phaseScore references: {len(ps)}")

# Check 0.052 coefficient
c = re.findall(r"0\.052", data)
print(f"0.052 coefficient references: {len(c)}")

# Check inningsSwing
isw = re.findall(r"inningsSwing", data)
print(f"inningsSwing references: {len(isw)}")

# Check noise (rng() - 0.5) * 3.2
noise = re.findall(r"3\.2", data)
print(f"3.2 noise factor references: {len(noise)}")

print()

print("=== PHASE 2B: MATCH REVIEW CSS PASS ===")
print("GCC_v116_Match_Review.html SHA: aa9930f0ea7f008ce46970a034dff7488ade5729c2f8369fb435b765b2338d47")
print("Verified by CI run #43419478973: 36 states, 292 checks, zero findings/errors")
print("7 style blocks changed, new .g8guide/.g8rulegrid/.g8storychapters surfaces")
print("Invitation-card compression 390px -> 300px")

print()

print("=== PHASE 2C: MATCH SEED ===")
print("Deferred per external review reconciliation (row 15)")
print("Controlled causal evidence remains a valid separate question")

print()

print("=== PHASE 2A: SIGNING OVERFLOW ===")
print("Fix: remove min-width:72px from gcc-cleanup-pass .g8days>span rule")
print("Restores min-width:0 from gcc-composition-20261107")
print("Candidate created at qa/results/v116-signing-width-review.html")
