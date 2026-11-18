import hashlib, subprocess
from pathlib import Path

# candidate from HEAD vs working tree
head = subprocess.run(["git", "cat-file", "-p", "HEAD:qa/candidates/v116-authenticity-candidate.html"], capture_output=True).stdout
work = Path("qa/candidates/v116-authenticity-candidate.html").read_bytes()
print("work sha", hashlib.sha256(work).hexdigest().upper())
print("head sha", hashlib.sha256(head).hexdigest().upper())
print("work==head", work == head)
