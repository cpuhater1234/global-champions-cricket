# GCC v112 source reconciliation, 9 November 2026

## Result
Canonical delivered v112 is unchanged, SHA-256 `e7e2c5fc4013cfd43f556145b0b35243130268a7329cb9dfba7011d2f727b2d3`. The tested **safe integrated review**, `GCC_v112_Integrated_Composition_Safe_Review.html`, is SHA-256 `942c357419e39970d8e5b55271c8a5952dbb001944d57eaeb5a8b0348eda931a`, 6,601,234 bytes.

The exact owned CSS source bodies from that safe HTML were synced in commit `e1fce929c802a0fee02bb90596705b103d050356`:
- `v8/ui/decision-ui.css` blob `5dfeea8df5334185f1d3052a286e6f974db90593`
- `v8/ui/broadcast.css` blob `4454c579f847286c7008542ed48e81b87108055f`
- `v8/ui/composition.css` blob `31db0ffb0ddb47ae5164d3c758ee4a217ca91f12`

The corresponding canonical source blobs before the change were `05e8c717cdc1e28637b458db1b156dd399e13fc3`, `128bea92abe4e6f1cc3bbd721974d3530959d99d`, and `96bace38e1cde38b94631fd90152015594a5f08e`. These identities were verified before the commit.

## Reproduction
Starting from **exact verified canonical v112 HTML**:
1. Replace the CSS body of `gcc-decision-ui-20261030` with newline + current `decision-ui.css` + newline.
2. In `gcc-floodlit-visual`, leave the unchanged `floodlit.css` and `floodlit-compat.css` prefix intact, and replace the `broadcast.css` portion with current source.
3. Replace the CSS body of `gcc-composition-20261107` with newline + current `composition.css` + newline.
4. Do not alter scripts, assets, other HTML, style count or ordering.

This reconstruction was run and compared **byte-for-byte** with the safe integrated review, with an exact match at the hash above. Parsed HTML has one head/body, 14 styles and 20 byte-identical scripts. Tinycss2 reported no errors for the 14 styles.

**This is a source substitution reproduction, not a full `python v8/build.py` rebuild.** The full-project builder and native localhost storage verification remain outstanding.

## External work boundary
A later Grok handoff describes `gcc-season-hub-owner-patch` in the `gcc-decision-ui-20261030` owner, covering fixture altitude, actions, ladder surfaces and club accent. That exact marker is **not present** in the source HTML available to this chat. It was intentionally not fabricated or merged. Obtain Grok's updated HTML or exact patch for a real three-way reconciliation. No global override layer should be added.

The safe integration restores the original canonical v112 `play` handler. The rejected change setting `ui.newCareer=true` too early bypassed save-arrival recovery and must stay excluded.

## Acceptance boundaries
Isolated Chromium previously reached 15 picks, 11-player legal XI, Lodge XI, match result and next round; 10 simulated cold starts and three simulated save-arrival routes passed, but these used an in-memory storage substitute. True localhost cold launches, actual two-tab storage events, user browser acceptance, trade footer, knockout transitions and full-project build remain open.

Do not label this as v113 or claim the newer external season patch is merged.
