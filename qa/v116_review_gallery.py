#!/usr/bin/env python3
"""Build the accepted GCC v116 review candidate and a local screenshot gallery.

Runs only against disposable checkpoints and browser contexts. The frozen game
and real user saves are never edited. Requires Node.js, Python Playwright and
Chromium; see docs/release/V116_FINALS_CANDIDATE_REVIEW.md.

From the repository root, after installing Playwright:
    python qa/v116_review_gallery.py --generate-checkpoints
Then open qa/results/v116-human-review/index.html.

On a machine with previously generated 2019/2025/2026 checkpoints, omit
--generate-checkpoints. No GitHub Actions artifact storage is involved.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from v116_finals_layout_candidate import (
    patch_release, ACCEPTED_CANDIDATE_SHA, ACCEPTED_CANDIDATE_BYTES,
)
from v116_source_reconciliation import RELEASE

DEFAULT_OUT = ROOT / "qa/results/v116-human-review"


def cli():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--output", type=Path, default=DEFAULT_OUT,
                   help="Destination for locally generated HTML, screenshot images and index")
    p.add_argument("--years", default="2019,2025,2026",
                   help="Comma-separated historical career checkpoints")
    p.add_argument("--widths", default="320,360,390,768,1024,1440",
                   help="Comma-separated browser screenshot widths")
    p.add_argument("--generate-checkpoints", action="store_true",
                   help="Generate deterministic 2008-2026 career checkpoints using existing Node runner")
    p.add_argument("--checkpoint-dir", type=Path,
                   default=ROOT / "qa/results/v116-human-career",
                   help="Directory containing checkpoint-YEAR.json files")
    p.add_argument("--no-open", action="store_true",
                   help="Do not open the completed screenshot gallery in the default browser")
    return p.parse_args()


def parse_numbers(raw, label, lo, hi):
    values = [int(v.strip()) for v in raw.split(",") if v.strip()]
    if not values or len(values) != len(set(values)) or not all(lo <= v <= hi for v in values):
        raise ValueError("Invalid %s list: %s" % (label, raw))
    return values


def run_cmd(args, env=None):
    print("+", " ".join(map(str, args)), flush=True)
    subprocess.run(list(map(str, args)), cwd=ROOT, env=env, check=True)


def main():
    a = cli()
    out = a.output.resolve()
    if out == RELEASE.resolve():
        raise ValueError("Refusing to overwrite the frozen release")
    years = parse_numbers(a.years, "year", 2008, 2026)
    widths = parse_numbers(a.widths, "width", 280, 3840)
    checkpoints = a.checkpoint_dir.resolve()
    out.mkdir(parents=True, exist_ok=True)
    candidate = out / "GCC_v116_layout_review.html"
    data = patch_release(RELEASE.read_bytes())
    digest = hashlib.sha256(data).hexdigest()
    assert digest == ACCEPTED_CANDIDATE_SHA and len(data) == ACCEPTED_CANDIDATE_BYTES
    candidate.write_bytes(data)
    print("Verified review candidate:", digest, flush=True)

    if a.generate_checkpoints:
        if not shutil.which("node"):
            raise RuntimeError("Node.js is required for --generate-checkpoints")
        env = dict(os.environ)
        env.update({
            "GCC8_TEST_BUILD": str(candidate),
            "GCC8_TEST_REPORT_DIR": str(checkpoints),
            "GCC8_TEST_SEED": "101",
            "GCC8_TEST_LAST_YEAR": str(max(years)),
            "GCC8_TEST_SCOREBOOKS": "1",
        })
        run_cmd(["node", "qa/structural-risk/career-run.mjs"], env)
        report = json.loads((checkpoints / "v8_game_results.json").read_text())
        if report.get("errors") or report.get("seasons") != max(years) - 2008 + 1:
            raise RuntimeError("Career checkpoint generation did not complete cleanly")

    missing = [y for y in years if not (checkpoints / ("checkpoint-%d.json" % y)).is_file()]
    if missing:
        raise FileNotFoundError(
            "Missing checkpoints for %s. Run again with --generate-checkpoints "
            "to generate them from the checksum-verified candidate." % missing
        )
    if not shutil.which("node"):
        raise RuntimeError("Node.js is required to render the saved-career screenshot gallery")

    screenshot_dir = out / "screenshots"
    screenshot_dir.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ)
    env.update({
        "GCC8_TEST_BUILD": str(candidate),
        "GCC8_BROWSER_CAREER_DIR": str(checkpoints),
        "GCC8_BROWSER_REPORT_DIR": str(screenshot_dir),
        "GCC8_BROWSER_YEARS": ",".join(map(str, years)),
        "GCC8_BROWSER_WIDTHS": ",".join(map(str, widths)),
    })
    # This is the very same native browser renderer exercised by the passing
    # 156-state candidate CI gate. It emits real PNGs into a gitignored folder.
    run_cmd(["node", "qa/v8_browser_career_audit.cjs"], env)
    report_file = screenshot_dir / "report.json"
    report = json.loads(report_file.read_text())
    issues = [r for r in report["states"] if r["overflow"] or r["clipped"]]
    if report["errors"] or issues:
        raise RuntimeError("Visual geometry audit found errors or overflow; see " + str(report_file))
    total = len(report["states"])
    if total == 0:
        raise RuntimeError("No screenshot states were rendered")

    cards = []
    for row in report["states"]:
        stem = "%s-%s" % (row["name"], row["width"])
        image = screenshot_dir / (stem + ".png")
        if not image.is_file():
            raise FileNotFoundError("Renderer omitted expected screenshot " + str(image))
        ref = "screenshots/" + image.name
        year = next((int(x) for x in row["name"].split("-") if x.isdigit() and len(x) == 4), None)
        cards.append(
            '<article class="frame" data-width="%d" data-year="%s">'
            '<a href="%s" target="_blank" rel="noopener" title="Open full-size screenshot">'
            '<img loading="lazy" src="%s" alt="%s at %d pixels"></a>'
            '<div class="meta"><strong>%s</strong><span>%d px</span></div></article>' % (
                row["width"], year or "", html.escape(ref, quote=True),
                html.escape(ref, quote=True), html.escape(row["name"], quote=True),
                row["width"], html.escape(row["name"]), row["width"]
            )
        )

    options = "".join("<option value='%d'>%d px</option>" % (w, w) for w in widths)
    years_html = "".join("<option value='%d'>%d</option>" % (y, y) for y in years)
    gallery = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GCC v116 | Visual review</title>
<style>
:root{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#eff4fe;background:#0e1520}
*{box-sizing:border-box}body{margin:0}header{border-bottom:3px solid #ffbb49;padding:24px max(20px,3vw);background:#19253a}
header h1{font-size:clamp(20px,2.8vw,32px);margin:0 0 8px;font-weight:850}
header p{margin:0;color:#cad8e9;max-width:72ch;line-height:1.55}
.toolbar{padding:16px max(20px,3vw);display:flex;align-items:end;flex-wrap:wrap;gap:16px;background:#111c2d;border-bottom:1px solid #40516c}
label{display:flex;flex-direction:column;font-size:12px;font-weight:800;letter-spacing:.08em;gap:6px;text-transform:uppercase}
select{background:#23334b;color:#fff;border:1px solid #6d839f;border-radius:6px;padding:10px;min-width:125px}
output{margin-left:auto;color:#e5ebf6;font-variant-numeric:tabular-nums}
main{padding:20px max(20px,3vw) 40px;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr));gap:18px;align-items:start}
.frame{border:2px solid #415a79;border-radius:6px;overflow:hidden;background:#18263b;box-shadow:0 5px 20px #020812}
.frame a{display:block;overflow:hidden;max-height:440px;background:#080f1b}
.frame img{display:block;width:100%;height:auto}
.frame a:hover img{filter:brightness(1.12)}
.meta{display:flex;gap:10px;justify-content:space-between;padding:12px;color:#dce8f7}
.meta strong{font-size:13px;overflow-wrap:anywhere}
.meta span{font-size:12px;color:#ffc46a;white-space:nowrap}
.frame[hidden]{display:none}
footer{padding:16px max(20px,3vw) 40px;color:#a9bdd5;font-size:12px}
</style></head><body>
<header><h1>Global Champions Cricket | v116 candidate visual review</h1>
<p>Rendered from the exact checksum-verified candidate through native Chromium.
Click any screenshot for the original resolution. These are disposable saved careers,
not real user data. Passing geometry tests does not replace visual judgement.</p></header>
<div class="toolbar">
<label>Viewport <select id="width"><option value="">All widths</option>__WIDTHS__</select></label>
<label>Career <select id="year"><option value="">All years</option>__YEARS__</select></label>
<output id="count"></output>
</div><main>__CARDS__</main>
<footer>Candidate SHA-256: __SHA__ | __TOTAL__ screen/viewport states.
No GitHub Actions artifact upload was required.</footer>
<script>
const inputs=[document.querySelector("#width"),document.querySelector("#year")];
function update(){let shown=0;for(const frame of document.querySelectorAll(".frame")){
const visible=(!inputs[0].value||frame.dataset.width===inputs[0].value)
&&(!inputs[1].value||frame.dataset.year===inputs[1].value);
frame.hidden=!visible;if(visible)shown++;}
document.querySelector("#count").textContent=shown+" screenshots";}
inputs.forEach(el=>el.addEventListener("change",update));update();
</script></body></html>
"""
    gallery = (gallery.replace("__WIDTHS__", options)
                     .replace("__YEARS__", years_html)
                     .replace("__CARDS__", "\n".join(cards))
                     .replace("__SHA__", digest)
                     .replace("__TOTAL__", str(total)))
    index = out / "index.html"
    index.write_text(gallery, encoding="utf-8")
    metadata = {
        "status": "VISUAL_REVIEW_READY",
        "candidate_sha256": digest,
        "states": total,
        "years": years,
        "widths": widths,
        "browser_errors": report["errors"],
        "geometry_issues": issues,
        "index": str(index),
        "scope": "Human-reviewed PNG gallery; no screenshot content was uploaded to GitHub",
    }
    (out / "gallery.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(json.dumps(metadata, indent=2), flush=True)
    if not a.no_open:
        webbrowser.open(index.as_uri())
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, RuntimeError, AssertionError, subprocess.CalledProcessError) as exc:
        print("VISUAL REVIEW FAILED:", exc, file=sys.stderr)
        sys.exit(1)
