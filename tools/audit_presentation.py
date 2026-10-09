#!/usr/bin/env python3
"""Inventory GCC CSS ownership; this is evidence, not a visual QA verdict."""
import collections
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def split_selectors(header):
    depth, quote, escaped, start = 0, None, False, 0
    for index, char in enumerate(header):
        if escaped: escaped = False
        elif quote:
            if char == "\\": escaped = True
            elif char == quote: quote = None
        elif char in "'\"": quote = char
        elif char in "([": depth += 1
        elif char in ")]": depth -= 1
        elif char == "," and not depth:
            yield header[start:index].strip()
            start = index + 1
    yield header[start:].strip()

def rules(css, conditions=()):
    # Preserve character offsets while excluding comments from headers.
    css = re.sub(r"/\*.*?\*/", lambda m: " " * len(m.group()), css, flags=re.S)
    position = 0
    while position < len(css):
        start = css.find("{", position)
        if start < 0: break
        header = css[position:start].strip()
        depth, quote, escaped, end = 1, None, False, start + 1
        while end < len(css) and depth:
            char = css[end]
            if escaped: escaped = False
            elif quote:
                if char == "\\": escaped = True
                elif char == quote: quote = None
            elif char in "'\"": quote = char
            elif char == "{": depth += 1
            elif char == "}": depth -= 1
            end += 1
        if depth: raise ValueError("Unbalanced CSS rule")
        body = css[start + 1:end - 1]
        if header.startswith("@media"):
            yield from rules(body, (*conditions, header))
        elif header.startswith("@"):
            pass  # Keyframe percentages are not component selectors.
        else:
            for selector in split_selectors(header):
                yield selector.strip(), conditions, body
        position = end

def main():
    manifest = json.loads((ROOT / "src/manifest.json").read_text())
    paths = [ROOT / "src" / b["path"] for b in manifest["blocks"] if b["kind"] == "style"]
    sources = [(p.relative_to(ROOT).as_posix(), p.read_text()) for p in paths]
    selectors = collections.Counter()
    contexts = collections.defaultdict(list)
    important = sum(text.count("!important") for _, text in sources)
    media = collections.Counter()
    tokens = collections.Counter()
    layout = []
    for path, text in sources:
        media.update(re.findall(r"@media[^\{]+", text))
        tokens.update(re.findall(r"(--[a-zA-Z0-9-]+)\s*:", text))
        for selector, conditions, body in rules(text):
            selectors[selector] += 1
            contexts[selector].append({"file":path, "conditions":list(conditions)})
            if re.search(r"(?:^|;)\s*(?:grid-template-columns|order|font-size|background)\s*:", body):
                if selector in ["#team .team-layout", "#team .team-sheet-grid",
                                "#draft .draft-layout", "#dynasty .annual-draft-workspace",
                                "#season .season-stage-note", ".side-panel"]:
                    declarations = [d.strip() for d in body.split(";") if re.search(r"(?:grid-template-columns|order|font-size|background)\s*:", d)]
                    layout.append({"selector":selector,"conditions":list(conditions),"declarations":declarations,"file":path})
    report = {
        "baseline_sha256":"8dfda284f00ca7f693f96b734ae9a95edb9ad0b133165dcaef9024eae74478c2",
        "style_files":len(sources), "important_declarations":important,
        "media_blocks":sum(media.values()), "distinct_media_conditions":len(media),
        "selector_occurrences":sum(selectors.values()), "distinct_selectors":len(selectors),
        "selectors_defined_multiple_times":sum(n > 1 for n in selectors.values()),
        "tokens_defined_multiple_times":{k:v for k,v in sorted(tokens.items()) if v > 1},
        "most_repeated_selectors":[{"selector":s,"definitions":n,"contexts":contexts[s]} for s,n in selectors.most_common(15)],
        "layout_ownership_examples":layout,
        "limits":"Static inventory only. Repeated selectors show competing ownership, not proof of visual failure. Browser QA remains required."
    }
    target = ROOT / "qa/GCC_recovery_css_audit.json"
    target.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({k:v for k,v in report.items() if k not in ["most_repeated_selectors","layout_ownership_examples"]}, indent=2))

if __name__ == "__main__": main()
