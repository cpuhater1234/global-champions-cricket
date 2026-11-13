# Staged v116 canonical candidate source

This directory is a lossless, editable source snapshot of the validated QA review candidate. It does not promote main or the frozen release, and it does not claim that the legacy v8 module tree is equivalent.

`template.html` retains all assets, markup and block attributes in their original positions. `styles/` contains the17 existing style-owner bodies. `scripts/` contains the22 unchanged runtime bodies. Block order is preserved. The template is an input, not a runnable game.

Build from repository root:

`python qa/v116_canonical_source.py build --source v116/canonical --output qa/results/canonical-review.html --report qa/results/canonical-build.json`

Check the current snapshot against its recorded manifest:

`python qa/v116_canonical_source.py build --source v116/canonical --output qa/results/canonical-review.html --check-manifest --report qa/results/canonical-check.json`

Future candidate edits should edit the relevant owner body and rebuild. A strict manifest check intentionally fails after edits until a newly reviewed snapshot is recorded. CSS edits must preserve runtime body hashes; script edits require renewed engine acceptance. Existing staged composers are historical reproductions, not an alternate maintained source to import wholesale. Do not edit the legacy v8 CSS and inject it into this candidate.

This snapshot resolves candidate source/build identity. It does not consolidate the17 legacy style owners into one design stylesheet or remove every competing declaration. Cascade consolidation remains a separate, render-verified task.

Existing historical-composer workflows do not automatically validate edits to this source tree. Build the edited canonical tree and run the appropriate native acceptance against that output before recording a new reviewed snapshot.
