import hashlib
from pathlib import Path

cands = [
    "qa/candidates/v116-signing-width-candidate.html",
    "qa/candidates/v116-authenticity-candidate.html",
]
for c in cands:
    p = Path(c)
    if p.exists():
        data = p.read_bytes()
        print(c, "size", len(data), "sha256", hashlib.sha256(data).hexdigest().upper())

for f in Path(".").glob("GCC_v116*"):
    print(f.name, "size", f.stat().st_size, "sha256", hashlib.sha256(f.read_bytes()).hexdigest().upper())

# also the frozen reference copy if present
for f in Path("qa").glob("scratch_frozen*"):
    print(f.as_posix(), "size", f.stat().st_size, "sha256", hashlib.sha256(f.read_bytes()).hexdigest().upper())
