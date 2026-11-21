import json,catalogue as C
P=json.load(open('probe_final.json')); G=dict(street='Streets',topo='Topo / terrain',aerial='Aerial / satellite',satellite='Daily satellite',thermal='Thermal',land='Night / vegetation / land / water',weather='Weather',ref='Reference / trails',key='Needs key',links='Links')
LIC={'free':'free','open':'open data (credit)','light':'light use only','nc':'NON-commercial only','unclear':'UNCLEAR','check':'not checked','key':'your key','link':'-'}
rows=['| Layer (id) | Group | Real tile (curl, 2026-11-21, Cairo) | CORS | Licence | Needs | Catalogue it came from |','|---|---|---|---|---|---|---|']
for e in C.C:
    p=P[e['id']]
    if e['k']=='l': res='link (not fetched)'; cors='-'
    elif e.get('key'): res='NOT TESTED (needs your key)'; cors='-'
    else:
        ok=p['code']=='200' and p['ct'].startswith('image/'); res=('OK ' if ok and p['cors'] else 'FAIL ')+('HTTP '+p['code']+' '+p['ct']+' '+p['size']+' B' if p['code']!='000' else 'no connection (curl 000)')+((' · '+p['note']) if p.get('note') else '')+('' if p['cors'] or p['code']=='000' else ' · no CORS header: unusable in the map canvas'); cors='yes' if p['cors'] else 'no'
    rows.append('| %s (`%s`) | %s | %s | %s | %s | %s | %s |'%(e['en'],e['id'],G[e['g']],res,cors,LIC[e['lic']],'key' if e.get('key') else ('date' if e.get('time') else ''),e.get('src','')))
open('LAYER_STATUS.md','w').write('\n'.join(rows)+'\n'); print(len(rows)-2,'layers')
