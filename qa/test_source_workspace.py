"""Build-system checks. Run with python -m unittest discover -s qa -p test_source_workspace.py."""
import importlib.util
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("source_workspace", ROOT / "tools/source_workspace.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class SourceWorkspaceTests(unittest.TestCase):
    def test_verified_baseline_round_trip(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / "protected-src"
            module.extract(ROOT / "game/gcc_recovery_architecture_checkpoint.html", source)
            output = module.build(source, Path(temporary) / "gcc.html")
            self.assertEqual(module.digest(output), module.BASE_SHA)
            self.assertNotIn(b"@@GCC_INCLUDE:", output)

    def test_view_edits_replace_original_declaration(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / "src"
            shutil.copytree(ROOT / "src", source)
            view = source / "views/season/renderSeason.js"
            content = module.read(view)
            module.write(view, content.replace("The first season begins", "Season starts here"))
            output = module.build(source, Path(temporary) / "gcc.html").decode()
            self.assertIn("Season starts here", output)
            self.assertNotEqual(module.digest(output.encode()), module.BASE_SHA)
            self.assertEqual(output.count("function renderSeason(light"), 1)

    def test_include_cannot_escape_source_root(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary)
            with self.assertRaisesRegex(ValueError, "escapes source root"):
                module.expand("@@GCC_INCLUDE:../outside@@", source)

    def test_include_cycles_fail_clearly(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary)
            module.write(source / "cycle.js", "@@GCC_INCLUDE:cycle.js@@")
            with self.assertRaisesRegex(ValueError, "Include cycle"):
                module.expand("@@GCC_INCLUDE:cycle.js@@", source)

    def test_unverified_input_is_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            baseline = Path(temporary) / "wrong.html"
            baseline.write_text("<html>Not the protected baseline</html>")
            with self.assertRaisesRegex(ValueError, "not the verified"):
                module.extract(baseline, Path(temporary) / "src")

if __name__ == "__main__": unittest.main()
