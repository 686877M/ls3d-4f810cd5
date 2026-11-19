import json,math,re,collections
d=json.load(open('amr/dxf_geo2.json'))['geo']; tx=json.load(open('amr/dxf_texts.json'))['texts']
cx,cy=252698.97,2212944.61; th=math.radians(6.5); c,s=math.cos(th),math.sin(th)
def T(x,y):
    rx,ry=x-cx,y-cy; return round(rx*c-ry*s,2), round(-(rx*s+ry*c),2)   # model X, Z
def segs(g):
    if g[0]=='L': yield g[2]
    elif g[0]=='P':
        p=g[2]; q=p+([p[0]] if g[3] else [])
        for a,b in zip(q,q[1:]): yield [a[0],a[1],b[0],b[1]]
    elif g[0]=='C':
        x,y,r=g[2]
        if r>.4:
            for i in range(16):
                a0=2*math.pi*i/16; a1=2*math.pi*(i+1)/16; yield [x+r*math.cos(a0),y+r*math.sin(a0),x+r*math.cos(a1),y+r*math.sin(a1)]
    elif g[0]=='A':
        x,y,r,a0,a1=g[2]
        if r>.4:
            if a1<a0:a1+=360
            n=max(3,int((a1-a0)/15))
            for i in range(n):
                u=math.radians(a0+(a1-a0)*i/n); v=math.radians(a0+(a1-a0)*(i+1)/n); yield [x+r*math.cos(u),y+r*math.sin(u),x+r*math.cos(v),y+r*math.sin(v)]
skip=lambda l: l in('PDF_Geometry','ARMATURE','0') or 'TXT' in l or 'HATCH' in l.upper()
def cat(l):
    u=l.upper()
    if re.search(r'ROAD|CURB|SHOULDER|PARKING|C-ROAD',u): return 0
    if re.search(r'PIPE|ME-P|P2|FLANGE|PLUMB|FIRE',u): return 2
    if re.search(r'TANK|GPS|IRTK|WATER|PSO|PS-09',u): return 1
    if re.search(r'A-|WALL|S-COL|BEAM|STRU|FLOR|ROOF|DOOR|LIFT|RS|OLCU',u): return 3
    return 4
layers=[]; li={}; lines=[]; seen=set(); pipes=[]
for g in d:
    if skip(g[1]): continue
    for q in segs(g):
        if math.hypot(q[2]-q[0],q[3]-q[1])<.3: continue
        a=T(q[0],q[1]); b=T(q[2],q[3])
        if abs(a[0])>85 or abs(b[0])>85 or abs(a[1])>130 or abs(b[1])>130: continue
        k=(round(min(a[0],b[0]),1),round(min(a[1],b[1]),1),round(max(a[0],b[0]),1),round(max(a[1],b[1]),1))
        if k in seen: continue
        seen.add(k)
        l=g[1]
        if l not in li: li[l]=len(layers); layers.append([l[:40],cat(l)])
        lines.append([li[l],a[0],a[1],b[0],b[1]])
        if cat(l)==2 and 'PLUMB' not in l.upper() and 'FIRE' not in l.upper() and math.hypot(b[0]-a[0],b[1]-a[1])>1.0: pipes.append([a[0],a[1],b[0],b[1],('irr' if 'IRTK' in l.upper() else 'fire' if ('GPS' in l.upper() or 'FIRE' in l.upper() or 'DFTK' in l.upper()) else 'sew' if ('PSO' in l.upper() or 'LIFT' in l.upper()) else 'oth')])
labels=[]
for t in tx:
    if t[0]=='vehicles' or str(t[1]).strip().isdigit(): continue
    p=T(t[2],t[3])
    if abs(p[0])<90 and abs(p[1])<140: labels.append([str(t[1]).replace('\n',' ')[:60],p[0],p[1]])
print(len(lines),len(pipes),len(labels),len(layers))
S={'rot':6.5,'cx':cx,'cy':cy,'cats':['Roads and curbs','Tanks','Pipes','Buildings and structure','Other'],'layers':layers,'lines':lines,'pipes':pipes[:700],'labels':labels}
open('c_site_data.js','w').write('const SITE='+json.dumps(S,separators=(',',':'))+';\n')
import os; print(os.path.getsize('c_site_data.js')//1024,'KB'); print(collections.Counter(l[1] for l in lines).most_common())
