#!/bin/sh
SP=/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad
cd $SP/work_agentux; export NODE_PATH=$SP/pw/node_modules; U=file://$SP/work_agentux/out/index.test.html; mkdir -p reg
run(){ n=$1; shift; echo "### $n $(date +%T)" >> reg/all.log; nice -n 15 "$@" > reg/$n.log 2>&1; echo "exit $? $n $(date +%T)" >> reg/all.log; grep -E "passed|ALL PASS|FAILED" reg/$n.log | tail -2 >> reg/all.log; }
: > reg/all.log
run ag5 node tests/ag5_test.js $U
run parity node $SP/site/src/incoming/parity_test.js $U
run px2 node $SP/site/src/incoming2/px2_test.js $SP/work_agentux/out/index.test.html
run freeai node $SP/pw/freeai_test.js $U
run privacy node $SP/pw/privacy_test.js $U $SP/site/tools/tox_bridge.py
run separation node $SP/pw/separation_test.js $U
run gm node $SP/pw/gm_test.js $U $SP/work_agentux/reg
echo ALLDONE >> reg/all.log
