import json,sys,collections
p=sys.argv[1]
d=json.loads(open(p,encoding='utf-8',errors='replace').read())
print('top keys',list(d.keys())[:12])
objs=d.get('OBJECTS',[])
print('objects',len(objs))
c=collections.Counter(o.get('entity') or o.get('object') for o in objs)
print(c.most_common(18))
# layers
lay={}
for o in objs:
    if o.get('object')=='LAYER': lay[o.get('handle',[0,0,0])[-1] if isinstance(o.get('handle'),list) else o.get('handle')]=o.get('name')
print('layer table',len(lay),list(lay.values())[:30])
texts=[]
for o in objs:
    e=o.get('entity')
    if e in('TEXT','MTEXT'):
        t=o.get('text_value') or o.get('text') or ''
        if t: texts.append(t.replace('\\P',' | '))
print('texts',len(texts)); print(texts[:60])
ext=collections.defaultdict(list)
for o in objs:
    e=o.get('entity')
    if e=='LINE':
        s=o.get('start'); en=o.get('end')
        if s and en: ext['x']+= [s[0],en[0]]; ext['y']+=[s[1],en[1]]
    elif e in('LWPOLYLINE',):
        for pt in o.get('points',[]) or []:
            ext['x'].append(pt[0]); ext['y'].append(pt[1])
if ext['x']: print('extent X',min(ext['x']),max(ext['x']),'Y',min(ext['y']),max(ext['y']))
