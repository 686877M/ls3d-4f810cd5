# Fill ov-wrapped sources from the chunk files and write per-program dossiers. python3 pw/dossier_fill.py <dossier.json> <outdir>
import json,sys,glob,re,os
d=json.load(open(sys.argv[1])); out=sys.argv[2]; os.makedirs(out,exist_ok=True)
files={f:open(f,encoding='utf-8').read().split('\n') for f in glob.glob('c_parity*.js')+glob.glob('c_px2*.js')+glob.glob('c_*.js')}
pri=sorted(files,key=lambda f:(not f.startswith(('c_parity','c_px2')),f))
def find(x):
    pat="'"+(x.get('en') or x['id']).replace("'","\\'")+"'"
    for f in pri:
        L=files[f]
        for i,l in enumerate(L):
            if pat in l and ("ov(" in l or "ov('" in l) and ("'"+(x.get('panel') or '')+"'") in l:
                return f+':'+str(i+1), '\n'.join(L[i:i+3])[:1500]
    return '',''
by={}
for x in d:
    if x['via']=='ov' or x['src'].replace(' ','').startswith('()=>{try{constr=run()'):
        loc,src=find(x); x['loc']=loc; x['src']=src or x['src']
    by.setdefault(x['t'],[]).append(x)
for t,rows in by.items():
    with open(f'{out}/{t}.txt','w') as fo:
        for x in rows:
            fo.write(f"### {x['id']} | {x.get('tab','')} > {x.get('panel','')} > {x.get('en','')} | impl={x.get('impl','')} {x.get('loc','')} honest={x['honest']}\nHELP: {x['help'][:300]}\nSRC: {x['src'][:900]}\n\n")
    print(t,len(rows))
