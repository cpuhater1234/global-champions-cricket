# Coordinated browser saves

The native two-tab test reproduced silent overwrite20/20 times. Moving the comparison closer to setItem is insufficient. Use a same-origin Web Lock around comparison, serialization and both storage writes. Retain the synchronous legacy path when the API is absent, explicitly without a concurrency guarantee for that path.

AutoSave requests coalesce until the lock callback runs, then serialize the latest in-memory state. A later request while completion is pending schedules another commit. Public pending/succeeded/flush helpers let the UI distinguish saving from failure. Native UI never reports durable success merely because a request was queued.

Changing career identity invalidates older queued generations. Old callbacks resolve false and cannot write the new/old career unexpectedly. Clearing a career suspends autosave through reload, including pagehide. Failed restores reinstate a previously pending old-career save. Existing storage-token conflict checks run inside the lock and refuse newer data.

Tests: actual two-tab overlap, blocked/quota/lock failure, superseded pending restore/new-world/clear, coalesced navigation with exact cold UI restore, direct legacy save defaults, existing77integrity checks and prior native regressions. This cannot force Chromium to flush localStorage to disk before an abrupt whole-browser crash; do not claim that limitation fixed.
