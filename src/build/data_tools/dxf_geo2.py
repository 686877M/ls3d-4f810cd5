import ezdxf, json, time, math
t0=time.time()
doc=ezdxf.readfile('ME-GLY-01.dxf')
print('loaded',round(time.time()-t0),'s',flush=True)
X0,X1,Y0,Y1=252630,252770,2212850,2212990
out=[]; cnt={}
def inb(x,y): return X0<=x<=X1 and Y0<=y<=Y1
def emit(e,src):
    t=e.dxftype(); ly=e.dxf.layer
    try:
        if t=='LINE':
            a=e.dxf.start; b=e.dxf.end
            if inb(a.x,a.y) or inb(b.x,b.y): out.append(['L',ly,[round(a.x,2),round(a.y,2),round(b.x,2),round(b.y,2)],src])
        elif t=='LWPOLYLINE':
            p=[(round(x,2),round(y,2)) for x,y,*_ in e.get_points('xy')]
            if any(inb(x,y) for x,y in p): out.append(['P',ly,p,bool(e.closed),src])
        elif t=='POLYLINE':
            p=[(round(v.dxf.location.x,2),round(v.dxf.location.y,2)) for v in e.vertices]
            if any(inb(x,y) for x,y in p): out.append(['P',ly,p,bool(e.is_closed),src])
        elif t=='CIRCLE':
            c=e.dxf.center
            if inb(c.x,c.y): out.append(['C',ly,[round(c.x,2),round(c.y,2),round(e.dxf.radius,2)],src])
        elif t=='ARC':
            c=e.dxf.center
            if inb(c.x,c.y): out.append(['A',ly,[round(c.x,2),round(c.y,2),round(e.dxf.radius,2),round(e.dxf.start_angle,1),round(e.dxf.end_angle,1)],src])
    except Exception as ex: pass
msp=doc.modelspace(); n=0
for e in msp:
    n+=1; t=e.dxftype(); cnt[t]=cnt.get(t,0)+1
    if t=='INSERT':
        try:
            for v in e.virtual_entities():
                emit(v,e.dxf.name)
                if v.dxftype()=='INSERT':
                    for w in v.virtual_entities(): emit(w,e.dxf.name)
        except Exception as ex: print('ins fail',e.dxf.name,ex)
    else: emit(e,'')
json.dump({'cnt':cnt,'geo':out},open('dxf_geo2.json','w'))
print('done',n,len(out),round(time.time()-t0),'s',cnt,flush=True)
