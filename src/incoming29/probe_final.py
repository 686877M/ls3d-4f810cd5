import math,subprocess,json,catalogue as C,os
LA,LO=30.0045,31.4885
def tile(z):
    n=2**z; return int((LO+180)/360*n), int((1-math.asinh(math.tan(math.radians(LA)))/math.pi)/2*n)
def get(u):
    r=subprocess.run(['curl','-s','-m','60','-o','probe/_t.bin','-w','%{http_code}|%{content_type}|%{size_download}','-H','Origin: https://example.invalid','-D','probe/_h.txt','-A','TOX-dev-probe/0.1',u],capture_output=True,text=True)
    w=(r.stdout.split('|')+['','',''])[:3]; h=open('probe/_h.txt',errors='ignore').read().lower() if os.path.exists('probe/_h.txt') else ''
    return dict(code=w[0],ct=w[1],size=w[2],cors='access-control-allow-origin' in h)
R={}
for e in C.C:
    if e['k']=='l': R[e['id']]=dict(code='-',ct='link',size='',cors=False,note='external link, not fetched'); continue
    if e.get('key'): R[e['id']]=dict(code='-',ct='',size='',cors=False,note='needs your key: not tested'); continue
    z=e['pz']
    if e['id']=='wayback':
        j=json.load(open('probe/wb.json')); k=sorted(j,key=lambda k:j[k]['itemTitle'])[-1]; z=12; x,y=tile(z); u=j[k]['itemURL'].replace('{level}',str(z)).replace('{row}',str(y)).replace('{col}',str(x)); r=get(u); r['note']='release '+j[k]['itemTitle']; R[e['id']]=r; print(e['id'],r); continue
    if e['id']=='rainviewer':
        j=json.loads(subprocess.run(['curl','-s','-m','30','https://api.rainviewer.com/public/weather-maps.json'],capture_output=True,text=True).stdout); p=j['radar']['past'][-1]; z=6; x,y=tile(z); u=j['host']+p['path']+'/256/%d/%d/%d/2/1_1.png'%(z,x,y); r=get(u); r['note']='frame '+str(p['time']); R[e['id']]=r; print(e['id'],r); continue
    x,y=tile(z); u=e['u'].replace('{z}',str(z)).replace('{x}',str(x)).replace('{y}',str(y)); note=''
    if e.get('time'): d=e['time']['d']; u=u.replace('{time}',d); note='date '+d
    r=get(u); r['note']=note; R[e['id']]=r; print(e['id'],r['code'],r['ct'],r['size'],'CORS' if r['cors'] else 'nocors',note,flush=True)
json.dump(R,open('probe_final.json','w'),indent=1)
