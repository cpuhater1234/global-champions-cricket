#!/usr/bin/env python3
"""Pixel-diff comparator for v116 visual baseline guardrail.

Compares captured screenshots against committed baselines with a <=0.1%
pixel-difference threshold. Reports per-screen diff and writes diff images
on failure.

Env:
  GCC8_BASELINE_DIR   dir with committed baseline PNGs (default: qa/visual/baselines)
  GCC8_CURRENT_DIR    dir with freshly captured PNGs (default: qa/visual/current)
  GCC8_DIFF_DIR       output dir for diff images (default: qa/visual/diffs)
  GCC8_MAX_DIFF_PCT   max allowed pixel-diff percent (default: 0.1)
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from PIL import Image, ImageChops

BASELINE_DIR = Path(os.environ.get("GCC8_BASELINE_DIR", "qa/visual/baselines"))
CURRENT_DIR = Path(os.environ.get("GCC8_CURRENT_DIR", "qa/visual/current"))
DIFF_DIR = Path(os.environ.get("GCC8_DIFF_DIR", "qa/visual/diffs"))
MAX_DIFF_PCT = float(os.environ.get("GCC8_MAX_DIFF_PCT", "0.1"))


def main() -> int:
    DIFF_DIR.mkdir(parents=True, exist_ok=True)
    report = {
        "baseline_dir": str(BASELINE_DIR),
        "current_dir": str(CURRENT_DIR),
        "diff_dir": str(DIFF_DIR),
        "max_diff_pct": MAX_DIFF_PCT,
        "comparisons": [],
        "failures": [],
        "errors": [],
        "limits": ["PNG only. Compares committed baselines against current CI capture."],
    }

    baseline_pngs = sorted(BASELINE_DIR.glob("*.png"))
    any_failure = False

    for baseline_path in baseline_pngs:
        name = baseline_path.name
        current_path = CURRENT_DIR / name
        if not current_path.exists():
            report["errors"].append(f"Missing current capture: {name}")
            report["failures"].append({"id": f"missing {name}", "detail": {"file": name}})
            any_failure = True
            continue
        try:
            with Image.open(baseline_path) as base_img, Image.open(current_path) as cur_img:
                if base_img.size != cur_img.size:
                    report["errors"].append(
                        f"Size mismatch: {name} baseline={base_img.size} current={cur_img.size}"
                    )
                    report["failures"].append({
                        "id": f"size-mismatch {name}",
                        "detail": {"file": name, "baseline": base_img.size, "current": cur_img.size},
                    })
                    any_failure = True
                    continue
                base_rgb = base_img.convert("RGB")
                cur_rgb = cur_img.convert("RGB")
                diff_img = ImageChops.difference(base_rgb, cur_rgb)
                # Count pixels where any channel differs by more than 10
                diff_data = list(diff_img.getdata())
                total = len(diff_data)
                diff_pixels = sum(
                    1 for r, g, b in diff_data if r > 10 or g > 10 or b > 10
                )
                diff_pct = (diff_pixels / total) * 100
                ok = diff_pct <= MAX_DIFF_PCT
                diff_path = DIFF_DIR / f"diff-{name}"
                diff_img.save(diff_path)
                report["comparisons"].append({
                    "file": name,
                    "diff_pixels": diff_pixels,
                    "total_pixels": total,
                    "diff_pct": round(diff_pct, 4),
                    "pass": ok,
                    "diff_path": str(diff_path),
                })
                if not ok:
                    report["failures"].append({
                        "id": f"pixel-diff {name}",
                        "detail": {
                            "file": name,
                            "diff_pct": round(diff_pct, 4),
                            "max_diff_pct": MAX_DIFF_PCT,
                            "threshold_met": ok,
                        },
                    })
                    any_failure = True
        except Exception as exc:
            report["errors"].append(f"Error comparing {name}: {exc}")
            report["failures"].append({"id": f"compare-error {name}", "detail": {"file": name, "error": str(exc)}})
            any_failure = True

    report["status"] = "ERROR" if report["errors"] else ("FAIL" if any_failure else "PASS")
    (DIFF_DIR / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({
        "status": report["status"],
        "comparisons": len(report["comparisons"]),
        "failures": len(report["failures"]),
        "max_diff_pct": MAX_DIFF_PCT,
        "errors": report["errors"],
    }))
    if report["status"] != "PASS":
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
