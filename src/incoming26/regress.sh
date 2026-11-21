#!/bin/sh
# runs the page test and the five regression suites on the PRIVATE build, one Chrome at a time
W=$(cd "$(dirname "$0")" && pwd); SP=$(dirname "$W"); cd "$SP"; export NODE_PATH=$SP/pw/node_modules
U=file://$W/out/index.test.html; run(){ n=$1; shift; echo "### $n"; nice -n 15 "$@" > $W/t/reg_$n.log 2>&1; echo "exit $?"; tail -2 $W/t/reg_$n.log; }
run ph node $W/ph_test.js $W/out/index.test.html
run parity node site/src/incoming/parity_test.js $U
run px2 node site/src/incoming2/px2_test.js $W/out/index.test.html
run freeai node site/src/incoming11/freeai_test.js $U
run link node site/src/incoming5/link_test.js $U
run privacy node site/src/incoming15/privacy_test.js $U $SP/site/tools/tox_bridge.py
echo ALLDONE
