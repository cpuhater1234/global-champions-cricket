"""Safety checks for the one-time ownership migration, not visual rendering."""
import importlib.util
from pathlib import Path
import unittest
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('ownership',ROOT/'tools/recovery_css_ownership.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class OwnershipTests(unittest.TestCase):
    def setUp(self):module.owners.clear();module.removed=0
    def test_grouped_unowned_selector_keeps_properties(self):
        module.collect('.a{color:green}')
        result=module.migrate('.a,.b{color:red;padding:4px}')
        self.assertIn('.a{padding:4px;}',result)
        self.assertIn('.b{color:red;padding:4px;}',result)
    def test_quoted_braces_and_semicolons_remain_intact(self):
        source='.a{background:url("data:x;{y}");content:";{}";color:red}'
        module.collect('.a{color:green}')
        result=module.migrate(source)
        self.assertIn('url("data:x;{y}")',result)
        self.assertIn('content:";{}"',result)
        self.assertNotIn('color:red',result)
    def test_nested_media_and_keyframes_preserved(self):
        module.collect('.a{color:green}')
        result=module.migrate('@media(max-width:700px){.a{color:red;padding:8px}}@keyframes fade{from{opacity:0}to{opacity:1}}')
        self.assertIn('@media(max-width:700px)',result)
        self.assertIn('padding:8px',result)
        self.assertIn('@keyframes fade{from{opacity:0}to{opacity:1}}',result)
    def test_hidden_display_gate_is_not_removed(self):
        module.collect('#team .panel{display:grid}')
        self.assertEqual(module.migrate('#team .panel[hidden]{display:none!important}'),'#team .panel[hidden]{display:none!important}')
if __name__=='__main__':unittest.main()
