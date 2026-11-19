import json,math,colorsys,hashlib,sys
d=json.load(open('dxf_geo2.json'))['geo']
cx,cy,R=float(sys.argv[1]),float(sys.argv[2]),float(sys.argv[3]); out=sys.argv[4]
skip=('PDF_Geometry','ARMATURE')
def col(l):
    h=int(hashlib.md5(l.encode()).hexdigest()[:6],16)/0xffffff; r,g,b=colorsys.hsv_to_rgb(h,.8,.95); return '#%02x%02x%02x'%(int(r*255),int(g*255),int(b*255))
S=[]; W=1000; sc=W/(2*R)
X=lambda x:(x-cx+R)*sc; Y=lambda y:(R-(y-cy))*sc
for g in d:
    t=g[0]; ly=g[1]
    if ly in skip or 'TXT' in ly: continue
    c=col(ly)
    if t=='L':
        x1,y1,x2,y2=g[2]; S.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width=".7"/>'%(X(x1),Y(y1),X(x2),Y(y2),c))
    elif t=='P':
        S.append('<polyline fill="none" stroke="%s" stroke-width=".7" points="%s"/>'%(c,' '.join('%.1f,%.1f'%(X(x),Y(y)) for x,y in g[2]+([g[2][0]] if g[3] else []))))
    elif t=='C':
        x,y,r=g[2]; S.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" stroke-width=".7"/>'%(X(x),Y(y),r*sc,c))
    elif t=='A':
        x,y,r,a0,a1=g[2]
        if a1<a0:a1+=360
        pts=[(x+r*math.cos(math.radians(a0+(a1-a0)*i/12)),y+r*math.sin(math.radians(a0+(a1-a0)*i/12))) for i in range(13)]
        S.append('<polyline fill="none" stroke="%s" stroke-width=".7" points="%s"/>'%(c,' '.join('%.1f,%.1f'%(X(px),Y(py)) for px,py in pts)))
open(out,'w').write('<svg xmlns="http://www.w3.org/2000/svg" width="%d" height="%d" style="background:#111">%s</svg>'%(W,W,''.join(S)))
