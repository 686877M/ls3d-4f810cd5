#!/bin/sh
# full build: chunks -> assembled html -> privacy patch -> single-file build
cd "$(dirname "$0")" && python3 patch_v3.py && python3 privacy_patch.py site/src/lift_station_3d.html site/src/lift_station_3d.html privacy.js && python3 build.py
