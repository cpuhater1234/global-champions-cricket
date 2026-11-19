import hashlib
from pathlib import Path

want = {
    "DB1545CEB2995BB2021FFA079D4E8432ABF1099952E8275879999A69D3477B93": "iter1 save+sentence",
    "CF3B24B0EBADDB833844C26D2C58DD005985DC5EC24A92538AC4FA5C486BA5C4": "iter2 toss said once",
    "528EEF19ADEC607CFD4633B6538E8E604BD951AD3D5A6A69D9D1685BB8ABA7E3": "iter3 toss = choice",
    "B80C32251DE5C31845EC537C463ECD05EF15C98D4B2908D5D68F24E3F04D7BF1": "iter4 pitch + preview (GOAL)",
}

# The candidate evolves in-place; current HEAD commit is b84b2252 'the toss names the pitch'
p = Path("qa/candidates/v116-authenticity-candidate.html")
cur = hashlib.sha256(p.read_bytes()).hexdigest().upper()
print("current candidate:", cur)
print()

# check historical blobs for each iteration sha
import subprocess
for sha, label in want.items():
    # walk recent commits touching the candidate, hash blob at each
    log = subprocess.run(["git","log","--format=%H","-8","v117","--","qa/candidates/v116-authenticity-candidate.html"],capture_output=True,text=True).stdout.split()
    found = False
    for c in log:
        blob = subprocess.run(["git","show",f"{c}:qa/candidates/v116-authenticity-candidate.html"],capture_output=True).stdout
        if hashlib.sha256(blob).hexdigest().upper() == sha:
            commit_msg = subprocess.run(["git","log","-1","--format=%s",c],capture_output=True,text=True).stdout.strip()
            print(f"{label}: FOUND at {c[:8]} ({commit_msg})")
            found = True
            break
    if not found:
        print(f"{label}: NOT FOUND in recent candidate history")
