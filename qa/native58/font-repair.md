# Embedded numeral repair

The five shipped subsets lacked the original fonts’ tabular-figure substitution feature. Existing CSS could request tabular figures but could not activate glyphs absent from those subsets.

Rebuilt all five WOFF subsets from the existing original TTFs under qa/visual53/fonts. The source SHA256 values still match the font manifest. Each rebuilt subset keeps exactly the previous Unicode cmap coverage and all original OpenType layout features, including the glyph closure required by tnum. Family/style/weight metadata is unchanged. No glyph metrics were altered.

Verified the actual GSUB tnum mappings for digits0–9 and their hmtx advances: Barlow600475units;700498;800normal520;800italic505;Inter1328 at default. Inter variable instances at weights100,400,700,900 also have equal tabular digit advances. Every WOFF reopens and retains Latin letters/digits. Detailed per-face data, feature lists, source hashes and output hashes are in font-verification.json.

The font payload grows by76,728bytes before base64. This restores source-authored typographic functionality rather than inventing numeral widths. Native browser shaping and visual checks remain necessary after the parent builds the candidate; no browser check or candidate build was performed by this agent.
