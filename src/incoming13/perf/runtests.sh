#!/bin/bash
# usage: runtests.sh <html> <tag>
H=$1; T=$2; SP=/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad
export NODE_PATH=$SP/pw/node_modules; cd $SP
nice -n 15 node site/src/incoming/parity_test.js file://$H > perf/t_${T}_parity.log 2>&1
nice -n 15 node site/src/incoming2/px2_test.js $H > perf/t_${T}_px2.log 2>&1
nice -n 15 node pw/freeai_test.js file://$H > perf/t_${T}_freeai.log 2>&1
nice -n 15 node pw/link_test.js file://$H > perf/t_${T}_link.log 2>&1
echo done > perf/t_${T}_done
