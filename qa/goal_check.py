import hashlib
from pathlib import Path

# Iteration SHAs from the Grok session handoff notes
targets = {
    "iteration 1 (save+sentence)": "DB1545CEB2995BB2021FFA079D4E8432ABF1099952E8275879999A69D3477B93",
    "iteration 2 (toss said once)": "CF3B24B0EBADDB833844C26D2C58DD005985DC5EC24A92538AC4FA5C486BA5C4",
    "iteration 3 (winning toss = choice)": "528EEF19ADEC607CFD4633B6538E8E604BD951AD3D5A6A69D9D1685BB8ABA7E3",
    "iteration 4 (pitch + preview)": "B80C32251DE5C31845EC537C463ECD05EF15C98D4B2908D5D68F24E3F04D7BF1",
}

candidates = sorted(Path("qa/candidates").glob("*.html")) + sorted(Path(".").glob("PLAY_*.html"))
print("=== files on disk ===")
for p in candidates:
    d = p.read_bytes()
    print(f"{str(p):60s} {len(d):>9,}  {hashlib.sha256(d).hexdigest().upper()}")

print("\n=== goal check ===")
for label, want in targets.items():
    hit = any(hashlib.sha256(p.read_bytes()).hexdigest().upper() == want for p in candidates)
    print(f"{label}: {'ON DISK' if hit else 'NOT FOUND'}")
