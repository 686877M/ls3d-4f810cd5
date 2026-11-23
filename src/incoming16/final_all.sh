#!/bin/sh
cd "$(dirname "$0")/.."; export NODE_PATH=$PWD/pw/node_modules; F=$PWD/demo/bld/site/index.test.html; C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for sc in smoke entry stop; do echo "== $sc"; nice -n 15 node demo/test_demo.js $F $sc 0 99 $PWD/demo/shots 2>&1 | grep -v "^\[" ; done
echo "== run (all chapters, 4x)"; nice -n 15 node demo/test_demo.js $F run 0 99 $PWD/demo/shots 2>&1 | grep -v "^\[" | grep -v "^   note"
demo/clean_all.sh
echo "== regress"; demo/regress_demo.sh 2>&1
echo "== link"; nice -n 15 node pw/link_test.js file://$F "$C" 2>&1 | grep "TOTAL\|FAILED"
echo FINALDONE
