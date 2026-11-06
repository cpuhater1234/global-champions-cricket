import hashlib
import importlib.util
import os
from pathlib import Path
import re
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
BASELINE = Path(os.environ.get('GCC_V93_BASELINE', ROOT/'qa/composition-20261107/v93-baseline.html'))
class CompositionBuildTests(unittest.TestCase):
    def setUp(self):
        path = Path(__file__).with_name('build.py')
        self.assertTrue(path.is_file(), 'hash-locked v93 composition builder is missing')
        spec = importlib.util.spec_from_file_location('composition_build', path)
        self.mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.mod)
    def test_preserves_every_original_byte_outside_one_final_insertion(self):
        baseline = BASELINE.read_bytes()
        css = (ROOT/'v8/ui/composition.css').read_text()
        result = self.mod.compose(baseline, css)
        insertion = ('<style id="gcc-composition-20261107">\n'+css+'\n</style>\n').encode()
        self.assertEqual(result.count(insertion), 1)
        self.assertEqual(result.replace(insertion,b'',1), baseline)
        self.assertEqual(re.findall(rb'<script\b[^>]*>.*?</script>', result,re.S),
                         re.findall(rb'<script\b[^>]*>.*?</script>', baseline,re.S))
    def test_wrong_baseline_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'baseline hash'):
            self.mod.compose(BASELINE.read_bytes()+b' ', 'p{}')
    def test_comment_with_body_marker_is_not_an_insertion_point(self):
        result = self.mod.compose(BASELINE.read_bytes(), 'p{color:white}')
        self.assertEqual(result.count(b'<style id="gcc-composition-20261107">'),1)
        self.assertTrue(result.endswith(b'</style>\n</body></html>\n') or
                        result.endswith(b'</style>\n</body></html>'))
    def test_css_cannot_close_its_style_element(self):
        with self.assertRaisesRegex(ValueError, 'style boundary'):
            self.mod.compose(BASELINE.read_bytes(), '/* </style> */')
if __name__ == '__main__': unittest.main()
