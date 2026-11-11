#!/usr/bin/env python3
"""Read-only CSS cascade candidate inventory for the exact GCC v116 release.

Uses tinycss2 for tokenization; records selector/property repetition under exactly
matching @media/@supports/@container conditions. It cannot certify the browser's
winning computed declarations, specificity interactions or responsive behaviour.
"""
import argparse
from collections import Counter, defaultdict
import json
from pathlib import Path
import re
import sys

import tinycss2

sys.path.insert(0, str(Path(__file__).resolve().parent))
from v116_source_reconciliation import ROOT, inspect_release

LATE_IDS = {
    "gcc-visual-pass", "gcc-cleanup-pass", "gcc-v116-perfection-pass"
}

def normalized(value):
    return re.sub(r"\s+", " ", tinycss2.serialize(value)).strip()

def split_selectors(tokens):
    chunks, part = [], []
    for t in tokens:
        if t.type == "literal" and t.value == ",":
            if part:
                chunks.append(normalized(part))
            part = []
        else:
            part.append(t)
    if part:
        chunks.append(normalized(part))
    return [s for s in chunks if s]

def analyze():
    _, blocks, metadata = inspect_release(ROOT / "GCC_v116_release (1).html")
    declarations = []
    parsing = Counter()
    per_block = Counter()
    selectors_per_block = defaultdict(set)

    def traverse(nodes, index, ident, contexts):
        for node in nodes:
            if node.type == "error":
                parsing[index] += 1
            elif node.type == "at-rule" and node.content is not None:
                name = node.lower_at_keyword
                if name in ("media", "supports", "container", "layer", "scope"):
                    label = "@" + name + " " + normalized(node.prelude)
                    traverse(
                        tinycss2.parse_rule_list(node.content, skip_whitespace=True, skip_comments=True),
                        index, ident, contexts + (label,)
                    )
            elif node.type == "qualified-rule" and node.content is not None:
                selectors = split_selectors(node.prelude)
                decls = tinycss2.parse_declaration_list(node.content, skip_whitespace=True, skip_comments=True)
                for decl in decls:
                    if decl.type == "error":
                        parsing[index] += 1
                    elif decl.type == "declaration":
                        for selector in selectors:
                            selectors_per_block[index].add(selector)
                            entry = {
                                "index": index, "id": ident,
                                "selector": selector, "property": decl.lower_name,
                                "value": normalized(decl.value), "important": bool(decl.important),
                                "context": list(contexts),
                            }
                            declarations.append(entry)
                            per_block[index] += 1

    for m, row in zip(blocks, metadata):
        if row["kind"] != "style":
            continue
        contents = m.group(3).decode("utf-8", errors="strict")
        rules = tinycss2.parse_stylesheet(contents, skip_whitespace=True, skip_comments=True)
        traverse(rules, row["index"], row["id"], ())

    grouped = defaultdict(list)
    for entry in declarations:
        key = (entry["selector"], entry["property"],
               entry["important"], tuple(entry["context"]))
        grouped[key].append(entry)

    cross_block = []
    late_collisions = []
    for entries in grouped.values():
        indices = sorted({e["index"] for e in entries})
        if len(indices) < 2:
            continue
        first = entries[0]
        values = {e["value"] for e in entries}
        example = {
            "selector": first["selector"], "property": first["property"],
            "important": first["important"], "context": first["context"],
            "block_indices": indices, "block_ids": list(dict.fromkeys(e["id"] for e in entries)),
            "values_differ": len(values) > 1,
            "declaration_count": len(entries),
        }
        cross_block.append(example)
        if any(e["id"] in LATE_IDS for e in entries):
            late_collisions.append(example)

    cross_block.sort(key=lambda x: (
        -max(x["block_indices"]), -len(x["block_indices"]), x["selector"], x["property"]))
    late_collisions.sort(key=lambda x: (
        -max(x["block_indices"]), -len(x["block_indices"]), x["selector"], x["property"]))

    per_style = [
        {"index": row["index"], "id": row["id"],
         "byte_count": row["bytes"],
         "selectors": len(selectors_per_block[row["index"]]),
         "declarations": per_block[row["index"]],
         "parse_errors": parsing[row["index"]]}
        for row in metadata if row["kind"] == "style"
    ]
    return {
        "scope": "Static same-selector/property collisions only; not browser-computed cascade",
        "release_sha256": "b27cf0b4c7e6e4e7a78eaa5c80154dfd0f70657ce9f774dd405505e97e82c6d0",
        "per_style": per_style,
        "total_declarations": len(declarations),
        "cross_style_same_context": len(cross_block),
        "cross_style_differing_values": sum(x["values_differ"] for x in cross_block),
        "late_layer_same_context": len(late_collisions),
        "late_layer_differing_values": sum(x["values_differ"] for x in late_collisions),
        "cross_style_detail": cross_block,
        "late_layer_detail": late_collisions,
        "signing_day_declarations": [
            d for d in declarations
            if ".g8days" in d["selector"] and
            d["property"] in ("display", "width", "min-width", "max-width",
                              "gap", "padding", "padding-left", "padding-right",
                              "flex", "flex-basis", "flex-shrink",
                              "grid-template-columns")
        ],
        "browser_cascade_verified": False,
        "warnings": [
            "Repeated declaration is a REVIEW CANDIDATE, not a proven defect",
            "Selectors may have differing effective specificity, state, source origin, CSS layers or inline overrides",
            "Condition groups compare literal at-rule text, not semantic media-query equivalence",
            "Pseudo selectors, variables, inheritance and active browser state require native computed-style checks",
            "No source or playable artifact changed",
        ],
    }

def format_report(data):
    lines = [
        "# GCC v116 static CSS cascade review",
        "",
        "This is an exact-release, read-only STATIC collision inventory. It does not replace native computed style or screenshot checks.",
        "",
        f"- CSS declarations inspected: **{data['total_declarations']:,}**",
        f"- Same-selector/property/importance/condition pairs spanning different style blocks: **{data['cross_style_same_context']:,}**",
        f"- Those with different values: **{data['cross_style_differing_values']:,}**",
        f"- Repeated pairs involving one of the three late visual/cleanup/perfection blocks: **{data['late_layer_same_context']:,}**",
        f"- Of those, different values: **{data['late_layer_differing_values']:,}**",
        "",
        "| CSS index | Style block | Selectors | Declarations | Parse errors |",
        "|---:|---|---:|---:|---:|",
    ]
    for block in data["per_style"]:
        lines.append(
            f"| {block['index']:02d} | \`{block['id'] or '(none)'}\` | "
            f"{block['selectors']:,} | {block['declarations']:,} | {block['parse_errors']} |")
    lines += [
        "",
        "## Signing-day layout declarations by source block",
        "",
        "| Block | Selector | Property | Value | Context |",
        "|---|---|---|---|---|",
    ]
    for entry in data["signing_day_declarations"][:90]:
        sel = entry["selector"].replace("|", "\\|")
        val = entry["value"].replace("|", "\\|")
        context = " / ".join(entry["context"]).replace("|", "\\|") or "global"
        lines.append(
            f"| {entry['index']:02d} `{entry['id'] or '(none)'}` | "
            f"`{sel}` | `{entry['property']}` | `{val}` | {context} |")
    lines += [
        "",
        "## High-priority late-block duplication candidates",
        "",
        "| Selector | Property | Block indices | Values differ? |",
        "|---|---|---|---|",
    ]
    for item in data["late_layer_detail"][:40]:
        selector = item["selector"].replace("|", "\\|").replace("\n", " ")
        if len(selector) > 100:
            selector = selector[:97] + "..."
        lines.append(
            f"| \`{selector}\` | \`{item['property']}\` | "
            f"{', '.join(map(str,item['block_indices']))} | "
            f"{'Yes' if item['values_differ'] else 'No'} |")
    if not data["late_layer_detail"]:
        lines.append("| None under identical condition strings | | | |")
    lines += [
        "",
        "**No automated deletion or automatic winner attribution is permitted from this report.**",
        "",
    ]
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", type=Path)
    parser.add_argument("--md", type=Path)
    parser.add_argument("--summary", action="store_true")
    args = parser.parse_args()
    report = analyze()
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(report, indent=2) + "\n")
    if args.md:
        args.md.parent.mkdir(parents=True, exist_ok=True)
        args.md.write_text(format_report(report))
    print(json.dumps({
        k: report[k] for k in (
            "total_declarations", "cross_style_same_context",
            "cross_style_differing_values", "late_layer_same_context",
            "late_layer_differing_values", "browser_cascade_verified")
    }, indent=2))
    if args.summary:
        print(format_report(report))
    return 0

if __name__ == "__main__":
    sys.exit(main())
