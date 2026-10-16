# Vendored save codec dependency

`lz-string-1.5.0.js` is the unmodified `libs/lz-string.js` from the official `pieroxy/lz-string` repository tag `1.5.0`, fetched through the GitHub connector. Its internal historical header says algorithm version 1.4.5. Both its original notice and the tag's MIT `LICENSE` are retained; the MIT licence is embedded in the standalone build.

Source: https://github.com/pieroxy/lz-string/blob/1.5.0/libs/lz-string.js
Licence: https://github.com/pieroxy/lz-string/blob/1.5.0/LICENSE

GCC uses its UTF-16 lossless codec for large saved blocks. The versioned envelope, length and checksum validation, legacy compatibility, caching and tests are owned by GCC's `domain/save_codec.js`.
