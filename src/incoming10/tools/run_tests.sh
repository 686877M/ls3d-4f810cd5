cd "$(dirname "$0")"; export NODE_PATH=$PWD/pw/node_modules PWDIR=$PWD/pw/node_modules; P=$1; CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
r(){ echo "== $1"; shift; nice -n 15 "$@" 2>&1 | grep -E "TOTAL|passed|ALL PASS|PASS|FAIL|FAILED|Error|ok |pass,|checks" | grep -vE "^\s*(PASS|ok)" | tail -6 | cut -c1-200; }
r link node site/src/incoming5/link_test.js file://$P "$CH"
r qx node site/src/incoming8/qx_test.js $P "$CH" /tmp
r nv_a node nvt/nv_test_a.js
r nv_b node nvt/nv_test_b.js
r nv_c node nvt/nv_test_c.js
r nv_d node nvt/nv_test_d.js 1500 860
r parity node site/src/incoming/parity_test.js file://$P
r px2 node site/src/incoming2/px2_test.js $P
echo ALLDONE
