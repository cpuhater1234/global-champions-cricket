#!/bin/sh
# Official WPE wrapper settings plus task-local, SHA256-verified Ubuntu dependencies.
GCC_WEBKIT_BUNDLE=/root/.cache/ms-playwright/webkit-2336/minibrowser-wpe
export WEBKIT_EXEC_PATH="$GCC_WEBKIT_BUNDLE/bin"
export WEBKIT_INJECTED_BUNDLE_PATH="$GCC_WEBKIT_BUNDLE/lib"
export WEBKIT_INSPECTOR_RESOURCES_PATH="$GCC_WEBKIT_BUNDLE/share"
export LD_LIBRARY_PATH="/tmp/gcc-webkit-deps/prefix/usr/lib/x86_64-linux-gnu:/tmp/gcc-webkit-deps/prefix/lib/x86_64-linux-gnu:$GCC_WEBKIT_BUNDLE/lib:$GCC_WEBKIT_BUNDLE/sys/lib"
exec "$GCC_WEBKIT_BUNDLE/bin/MiniBrowser" "$@"
