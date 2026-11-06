"""The default build must reproduce the exact user-facing release."""
import hashlib
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
ROOT = Path(__file__).resolve().parents[2]
EXPECTED = '61b801cf8af2c913a46f9696d2645bb4d2b31a354ba15d522f05dd2a6ec39e93'
class CanonicalReleaseTests(unittest.TestCase):
    def test_default_pipeline_reproduces_v97_without_external_release_file(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)/'candidate.html'
            subprocess.run([sys.executable, str(ROOT/'v8/build.py'), '--output', str(output)],
                           cwd=ROOT, check=True, capture_output=True)
            self.assertEqual(hashlib.sha256(output.read_bytes()).hexdigest(), EXPECTED)
if __name__ == '__main__': unittest.main()

