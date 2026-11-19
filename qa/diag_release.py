import hashlib, subprocess
from pathlib import Path

# What does git say the release file should be? Compare work tree to HEAD.
work = Path("GCC_v116_release (1).html").read_bytes()
head = subprocess.run(["git", "show", "HEAD:GCC_v116_release (1).html"], capture_output=True).stdout
print("work:", len(work), hashlib.sha256(work).hexdigest().upper())
print("head:", len(head), hashlib.sha256(head).hexdigest().upper())
print("identical:", work == head)

src = work.decode("utf-8", errors="replace")
needle = "#g8app :is(.g8invitationgrid,.g8clubchooser) .g8clubground{background:var(--gcc-raised)!important;border-color:var(--gcc-line)!important;border-left-color:var(--accent)!important}"
i = src.find(needle)
print("ground anchor at byte:", i)
if i >= 0:
    print(repr(src[i:i+320]))
