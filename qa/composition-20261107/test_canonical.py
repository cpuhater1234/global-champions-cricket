"""The default build must reproduce the exact user-facing release."""
import hashlib
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
ROOT = Path(__file__).resolve().parents[2]
EXPECTED = '6cdff850bfeb0809cf8e74353b11db822765b12b12962e3b4563907186f5bfb2'
class CanonicalReleaseTests(unittest.TestCase):
    def test_default_pipeline_reproduces_v110_without_external_release_file(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)/'candidate.html'
            subprocess.run([sys.executable, str(ROOT/'v8/build.py'), '--output', str(output)],
                           cwd=ROOT, check=True, capture_output=True)
            self.assertEqual(hashlib.sha256(output.read_bytes()).hexdigest(), EXPECTED)
if __name__ == '__main__': unittest.main()

