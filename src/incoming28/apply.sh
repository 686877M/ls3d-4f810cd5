#!/bin/sh
# usage: apply.sh [SP]   SP = the shared scratchpad (default below). Checks every target's sha1 first; stops on drift.
SP=${1:-/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad}
H="$(cd "$(dirname "$0")" && pwd)"
cd "$SP" || exit 1
bad=0
while read sum f; do cur=$(shasum "$f" | cut -d' ' -f1); [ "$cur" = "$sum" ] || { echo "DRIFT $f (was $sum now $cur)"; bad=1; }; done < "$H/SHA1_BEFORE.txt"
[ $bad = 0 ] || [ "$FORCE" = 1 ] || { echo "stop: shared files changed since the patch was made (FORCE=1 to try anyway)"; exit 2; }
for d in "$H"/patches/*.diff; do patch -p1 --dry-run -s < "$d" >/dev/null || { echo "does not apply: $d"; exit 3; }; done
for d in "$H"/patches/*.diff; do patch -p1 -s < "$d" && echo "applied $(basename $d)"; done
mkdir -p site/src/incoming28 && cp "$H/tests/separation_test.js" site/src/incoming28/ && cp "$H/NOTE.md" site/src/incoming28/ 2>/dev/null
echo "now run: sh make.sh ; then the suites (tests that need the sample were patched to preload it)"
