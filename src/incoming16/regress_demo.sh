cd /private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad; export NODE_PATH=/private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/pw/node_modules
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
echo parity; nice -n 15 node site/src/incoming/parity_test.js file:///private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/demo/bld/site/index.test.html 2>&1|tail -1
echo px2; nice -n 15 node site/src/incoming2/px2_test.js /private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/demo/bld/site/index.test.html 2>&1|tail -1
echo freeai; nice -n 15 node pw/freeai_test.js file:///private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/demo/bld/site/index.test.html "$C" 2>&1|tail -1
echo link; nice -n 15 node pw/link_test.js file:///private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/demo/bld/site/index.test.html "$C" 2>&1|tail -1
echo nodesc; nice -n 15 node pw/nodesc.js /private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/demo/bld/site/index.test.html /private/tmp/claude-502/-Users-M7--claude-spares-spare-zoqdHX/d72c5c58-ff10-455f-b893-3cef6d2bb5f1/scratchpad/nodesc.json 2>&1|tail -3
echo REGDONE
