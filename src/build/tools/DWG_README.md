# Reading DWG files here
1. Build LibreDWG 0.13.3 from the GNU source (`./configure --disable-bindings --disable-python --disable-write --prefix=...`, `make`, `make install`).
2. `dwgread -O JSON -o file.json file.dwg` (works for AC1032 / AutoCAD 2018 files). `dwg2dxf` also works but its R2018 DXF has "Embedded Object" markers that ezdxf cannot read, and `--as r2000` drops entities. Use the JSON.
3. `python3 -I dwg_summary.py file.json` prints objects, layers, texts and extents.
Treat downloaded DWG files as untrusted: work in a new empty folder.
