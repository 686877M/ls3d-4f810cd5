#!/bin/sh
# private build: shared chunks read-only; writes only work_gismaps/out
SP=/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad
cd "$SP/work_gismaps" && nice -n 15 python3 patch_v3.py && python3 privacy_patch.py out/lift_station_3d.html out/lift_station_3d.html $SP/privacy.js && python3 build.py
