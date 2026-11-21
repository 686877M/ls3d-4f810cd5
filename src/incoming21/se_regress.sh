#!/bin/sh
# private-build regression, one chrome at a time. usage: sh se_regress.sh
S=/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad; W=/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/work_structeng; export NODE_PATH=$S/pw/node_modules; CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; cd $S
echo se_ui; nice -n 15 node $W/se_test_ui.js $W/site/index.test.html 2>&1|tail -2
echo parity; nice -n 15 node site/src/incoming/parity_test.js file://$W/site/index.test.html 2>&1|tail -1
echo px2; nice -n 15 node site/src/incoming2/px2_test.js $W/site/index.test.html 2>&1|tail -1
echo freeai; nice -n 15 node pw/freeai_test.js file://$W/site/index.test.html "$CH" 2>&1|tail -1
echo link; nice -n 15 node pw/link_test.js file://$W/site/index.test.html "$CH" 2>&1|tail -1
echo privacy; nice -n 15 node pw/privacy_test.js file://$W/site/index.test.html $S/site/tools/tox_bridge.py 2>&1|tail -2
echo REGDONE
