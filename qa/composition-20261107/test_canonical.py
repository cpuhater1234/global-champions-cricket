"""The default build must reproduce the exact user-facing release."""
import hashlib
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
ROOT = Path(__file__).resolve().parents[2]
EXPECTED = '0c98b814f74f1320974bf429a7fb9d7c3e54c6f7b772dcc8b34a382b12eb1546'
class CanonicalReleaseTests(unittest.TestCase):
    def test_default_pipeline_reproduces_v106_without_external_release_file(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)/'candidate.html'
            subprocess.run([sys.executable, str(ROOT/'v8/build.py'), '--output', str(output)],
                           cwd=ROOT, check=True, capture_output=True)
            self.assertEqual(hashlib.sha256(output.read_bytes()).hexdigest(), EXPECTED)
if __name__ == '__main__': unittest.main()

