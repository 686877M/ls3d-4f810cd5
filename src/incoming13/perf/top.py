import json,collections,sys
p=json.load(open(sys.argv[1])); N=int(sys.argv[2]) if len(sys.argv)>2 else 22
nodes={n['id']:n for n in p['nodes']}; par={}
for n in p['nodes']:
    for c in n.get('children',[]): par[c]=n['id']
selfv=collections.Counter()
for s,d in zip(p['samples'],p['timeDeltas']): selfv[s]+=d
idle=sum(v for i,v in selfv.items() if nodes[i]['callFrame']['functionName']=='(idle)')/1e6
print('total',round(sum(selfv.values())/1e6,2),'idle',round(idle,2))
bys=collections.Counter()
for i,t in selfv.items():
    cf=nodes[i]['callFrame']; bys[(cf['functionName'] or '(anon)',cf['lineNumber'])]+=t
print('SELF'); [print(round(v/1e6,3),k) for k,v in bys.most_common(12)]
inc=collections.Counter()
for i,t in selfv.items():
    seen=set(); j=i
    while j is not None:
        cf=nodes[j]['callFrame']; k=(cf['functionName'] or '(anon)',cf['lineNumber'])
        if k not in seen: inc[k]+=t; seen.add(k)
        j=par.get(j)
print('INCL'); [print(round(v/1e6,3),k) for k,v in inc.most_common(N)]
