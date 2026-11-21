#!/usr/bin/env python3
"""privacy_patch.py  <in.html> <out.html> [privacy.js]
Applies the neutralising edits to lift_station_3d.html (the merged source) and injects privacy.js right before
`window.__lsv={` (end of the chunk chain, after templates.js). Every replacement asserts its match count so a
source change that moves a string fails loudly instead of silently skipping.
Nothing here touches the network; pure text edits."""
import re, sys, os
src, dst = sys.argv[1], sys.argv[2]
chunk = sys.argv[3] if len(sys.argv) > 3 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'privacy.js')
s = open(src, encoding='utf-8').read()

def rep(a, b, n=None, minn=1):
    global s
    c = s.count(a)
    assert c >= minn and (n is None or c == n), 'privacy_patch: %r found %d times (want %s)' % (a[:60], c, n if n is not None else '>=%d' % minn)
    s = s.replace(a, b)

# ---- 1. export file names: no project / site name in any file or zip entry name ----
rep('Lift Station Viewer', 'T.O X')                                   # IFC application + header author
rep('LiftStation', 'Project')                                        # LiftStation_*.pdf/.dxf/.xlsx/.json, zip entries, .xer/.ifc
# ---- 2. title block / sheet defaults: shape only ----
rep("title:'Sewage Lift Station',sheet:'LS-01'", "title:'Sample project (demo)',sheet:'SH-01'", 1)
rep("sub:'(Circular Concrete Wet Well)',dwg:'LS-3D-01'", "sub:'',dwg:'DWG-01'", 1)
rep("proj:'',date:'2026-11-19',fmt:''", "proj:'',date:new Date().toISOString().slice(0,10),fmt:''", 1)
rep("exported:'2026-11-19'", "exported:new Date().toISOString().slice(0,10)", 1)
rep("'Generated 2026-11-19'", "'Generated '+new Date().toISOString().slice(0,10)", 1)
rep("||'SEWAGE LIFT STATION'", "||'PROJECT TITLE'", 3)
rep("# Sewage Lift Station, metres, Z up", "# Project, metres, Z up", 1)
rep("(DR.sheet||'LS-01')", "(DR.sheet||'SH-01')", 1)
rep("(the sewage lift station demo or any template)", "(the sample project or any template)", 1)
# ---- 3. IFC: project / building names from the title block, fixed neutral timestamp ----
rep("q('Sewage Lift Station')", "q(DR.title||'Project')", 1)
rep("q('Lift Station')", "q('Building')", 1)
rep("2026-11-19T00:00:00", "1970-01-01T00:00:00", 1)
# ---- 4. sample project is explicit: card + header strings say 'Sample project' ----
rep("n:['Sewage lift station','محطة رفع صرف'],title:['Sewage Lift Station','Sewage Lift Station']",
    "n:['Pump station sample (mechanical)','عيّنة: محطة طلمبات (ميكانيكا)'],title:['Sample project (demo)','مشروع تجريبي (عيّنة)']", 1)
rep("d('title','Sewage Lift Station: 3D model','محطة طلمبات الصرف: موديل 3D')", "d('title','Sample project: pump station 3D model','مشروع تجريبي: موديل 3D لمحطة طلمبات')", 1)
rep("<title>Lift Station 3D Model</title>", "<title>T.O X</title>", 1)
rep("b2('Lift Station 3D Model','موديل 3D لمحطة الصرف')", "b2('T.O X','T.O X')", 1)
rep("project name Sewage Station.", "project name My Project.", 1)
rep("واسم المشروع محطة الصرف.", "واسم المشروع مشروعي.", 1)
rep("Blank, Sewage lift station, House, Office", "Blank, Sample project, House, Office", 1)
# ---- 5. identifiers of the real drawings the sample was digitised from (sheet codes, file names, vendor names, drive folders) ----
rep('BIS-ME-LST-0', 'SMP-ME-0')
rep('ME-GLY-01', 'SMP-SITE-01')
rep('SEWEGE TANK CALCULATIONS REV 01.pdf (Drive TOX / Lift Station)', 'structural calculation summary (sample)', 1)
rep('Mecra Boru HDPE', 'HDPE pipe', None, 0)
rep('Mecra Pompa', 'Pump', None, 0)
rep('LIFT STATION (2)', 'STRUCTURE (2)', None, 0)
rep('["SEWAGE LIFT STATION",', '["PUMP STATION",', 1)
rep('SEWAGE PUMPSTATION', 'PUMP STATION', 2, 1)
m = re.search(r'"src":\{"sew":"SewerGEMS.*?\}', s)   # incoming18: the chunk is already neutral, so this is optional now
if m: s = s[:m.start()] + ('"src":{"sew":"Sewer network model (sample data), checked against sample profile sheets","storm":"Storm network model (sample data)",'
    '"water":"Water network model (sample data). Node elevation is the model junction elevation; pipe cover is not in the model.",'
    '"fireb":"Fire-fighting network model (sample data, buildings loop)","fireh":"Fire-fighting network model (sample data, zone B loop)"}') + s[m.end():]
# ---- 6. AI context: agentBrief must not carry project title / share URL / full state when privacy mode is on ----
# (the wrapper itself lives in privacy.js; here we only make XAGSAFE never offer the wipe command to a model)
rep("'w_reset','rec','recdis','recasm','recsch']", "'w_reset','rec','recdis','recasm','recsch','wipe_project','privacy_panel']", 1)
# ---- 6b. agents are told: never wipe, ask the owner ----
rep("لو الطلب ناقص اسأل سؤال واحد بس.'", "لو الطلب ناقص اسأل سؤال واحد بس. ما تمسحش بيانات المشروع أبداً ولا تنفذ ده بنفسك: اسأل المالك والقرار بتاعه.'", 1)
rep("Say what you could not do.'", "Say what you could not do. Never wipe or delete project data yourself: ask the owner, who decides.'", 1)
rep("Use at most 5 actions.", "Use at most 5 actions. Never wipe or delete project data.", 1)
# ---- 6c. share link: a file:// page must not put the local path (user / folder names) in links, QR or the agent brief ----
rep("const shareUrl=()=>location.origin+location.pathname+stateHash();", "const shareUrl=()=>(location.protocol==='file:'?'T.O X':location.origin+location.pathname)+stateHash();", 1)
# ---- 6d. error bar: no file paths in the message or the stack head ----
rep("b.textContent='Script error: '+(e.message||e.error)", "b.textContent=X('Script error: '+(e.message||e.error)", 1)
rep(".join(' < '):'');}});</script>", ".join(' < '):''));}});</script>", 1)
rep("window.addEventListener('error',function(e){var b=document.getElementById('errbar');", "window.addEventListener('error',function(e){var X=function(t){return String(t).replace(/(?:file|https?|blob):\\/\\/[^\\s)]*\\//g,'')};var b=document.getElementById('errbar');", 1)
# ---- 6e. Telegram token is a credential: its own key (removed with the other keys), not inside the project store xto-ctrl ----
rep("tg:{token:CT.tg.token,chat:CT.tg.chat,off:CT.tg.off,log:CT.tg.log.slice(-40)}})); }catch(e){} }", "tg:{chat:CT.tg.chat,off:CT.tg.off,log:CT.tg.log.slice(-40)}})); if(CT.tg.token)localStorage.setItem('xto-tgtok',CT.tg.token); else localStorage.removeItem('xto-tgtok'); }catch(e){} }", 1)
rep("Object.assign(CT.tg,j.tg||{}); CT.tg.timer=null;", "Object.assign(CT.tg,j.tg||{}); CT.tg.token=localStorage.getItem('xto-tgtok')||CT.tg.token||''; CT.tg.timer=null;", 1)
# ---- 7. inject chunk ----
if os.path.exists(chunk):
    c = open(chunk, encoding='utf-8').read()
    assert s.count('window.__lsv={') == 1
    s = s.replace('window.__lsv={', '/* ===== privacy.js ===== */\n' + c + '\n/* ===== /privacy.js ===== */\nwindow.__lsv={', 1)
open(dst, 'w', encoding='utf-8').write(s)
print('privacy_patch ok', len(s) // 1024, 'KB (chunk %s)' % ('yes' if os.path.exists(chunk) else 'no'))
