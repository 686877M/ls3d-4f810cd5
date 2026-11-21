#!/bin/sh
cd "$(dirname "$0")/.."; export NODE_PATH=$PWD/pw/node_modules
for c in early mid late end; do echo "== $c"; CYCLE=$c nice -n 15 node demo/test_demo.js $PWD/demo/bld/site/index.test.html clean 0 99 $PWD/demo/shots 2>&1 | grep -v "^\[" ; done
echo ALLDONE
