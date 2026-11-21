#!/bin/bash
SP=/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad; export SP; cd $SP
for i in 1 2 3 4 5; do for m in login app; do for v in basepub new3pub; do
 echo "$v $m $(nice -n 15 node perf/measure.js file://$SP/perf/$v.html $m 4)" >> perf/bench.log; done; done; done
echo finished >> perf/bench.log
