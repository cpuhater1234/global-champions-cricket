#!/usr/bin/env python3
"""Static guardrail for GCC premium-polish candidates."""
from __future__ import annotations
import hashlib, re, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "game" / "global_champions_cricket_v7_0_23_release_candidate.html"
EXPECTED_BASELINE_SHA = "47861e9c0328ae2f57c9f3cc0c05184c7c48e3ec7bd8b1c642f5f3e01e0f42ce"
PROTECTED_FUNCTIONS = ["profile","evaluateDraft","chooseAIPick","bestXI","assignBattingSlots","effectiveProfile","phaseScore","simulateInningsPair","allocateRuns","buildBattingCard","bowlingBallAllocation","updateFormForMatch"]

def sha256(path: Path) -> str:
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()

def scripts(html: str) -> list[str]:
    return re.findall(r"<script(?:\s[^>]*)?>(.*?)</script>", html, re.S|re.I)

def extract_function(text: str, name: str) -> str|None:
    m=re.search(r"function\s+"+re.escape(name)+r"\s*\(",text)
    if not m:return None
    brace=text.find("{",m.end())
    if brace<0:return None
    depth=0;i=brace;single=double=template=False;escaped=False
    while i<len(text):
        c=text[i]
        if escaped: escaped=False
        elif c=="\\": escaped=True
        elif single:
            if c=="'": single=False
        elif double:
            if c=='"': double=False
        elif template:
            if c=="`": template=False
        elif c=="'": single=True
        elif c=='"': double=True
        elif c=="`": template=True
        elif c=="{": depth+=1
        elif c=="}":
            depth-=1
            if depth==0:return text[m.start():i+1]
        i+=1
    return None

def main()->int:
    if len(sys.argv)!=2:
        print("Usage: python qa/check_premium_candidate.py path/to/candidate.html");return 2
    candidate=Path(sys.argv[1]).resolve()
    if not candidate.exists():
        print(f"FAIL candidate not found: {candidate}");return 2
    failures=[]
    actual=sha256(BASELINE)
    if actual!=EXPECTED_BASELINE_SHA: failures.append(f"protected baseline drifted: {actual} != {EXPECTED_BASELINE_SHA}")
    base=BASELINE.read_text(encoding="utf-8"); cand=candidate.read_text(encoding="utf-8")
    ids=re.findall(r"\bid=[\"']([^\"']+)[\"']",cand)
    dup=sorted({x for x in ids if ids.count(x)>1})
    if dup: failures.append("duplicate DOM IDs: "+", ".join(dup))
    for name in PROTECTED_FUNCTIONS:
        a=extract_function(base,name);b=extract_function(cand,name)
        if a is None: failures.append(f"protected function missing from baseline: {name}")
        elif b is None: failures.append(f"protected function missing from candidate: {name}")
        elif a!=b: failures.append(f"protected function changed: {name}")
    blocks=scripts(cand)
    if len(blocks)!=9: failures.append(f"expected 9 script blocks, found {len(blocks)}")
    node=shutil.which("node")
    if node:
        with tempfile.TemporaryDirectory() as td:
            for i,js in enumerate(blocks):
                p=Path(td)/f"script_{i}.js";p.write_text(js,encoding="utf-8")
                r=subprocess.run([node,"--check",str(p)],capture_output=True,text=True)
                if r.returncode: failures.append(f"JavaScript syntax failure in script block {i}: {r.stderr.strip()}")
    else: print("WARN node is not installed; JavaScript syntax check skipped")
    print(f"Baseline SHA-256: {actual}")
    print(f"Candidate SHA-256: {sha256(candidate)}")
    print(f"Script blocks: {len(blocks)}")
    print(f"Duplicate DOM IDs: {len(dup)}")
    print("Protected functions unchanged: "+("yes" if not any("protected function" in x for x in failures) else "no"))
    if failures:
        print("\nFAIL")
        for item in failures: print(f"- {item}")
        return 1
    print("\nPASS static candidate guardrail");return 0

if __name__=="__main__": raise SystemExit(main())
