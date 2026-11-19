import json,sys
from ezdxf.addons import iterdxf
out=[];ins=[];n=0
doc=iterdxf.opendxf('ME-GLY-01.dxf')
for e in doc.modelspace():
    n+=1; t=e.dxftype()
    try:
        if t=='TEXT': out.append([e.dxf.layer,e.dxf.text,round(e.dxf.insert.x,1),round(e.dxf.insert.y,1),round(e.dxf.height,2)])
        elif t=='MTEXT': out.append([e.dxf.layer,e.plain_text() if hasattr(e,'plain_text') else e.text,round(e.dxf.insert.x,1),round(e.dxf.insert.y,1),round(e.dxf.char_height,2)])
        elif t=='INSERT': ins.append([e.dxf.layer,e.dxf.name,round(e.dxf.insert.x,1),round(e.dxf.insert.y,1)])
    except Exception as ex: pass
json.dump({'n':n,'texts':out,'inserts':ins},open('dxf_texts.json','w'))
print('done',n,len(out),len(ins))
