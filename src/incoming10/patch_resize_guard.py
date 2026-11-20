# Add to patch_v3.py just before the final open(...'lift_station_3d.html','w'...) line.
# Skips renderer.setSize (which reallocates the GL drawing buffer) when host size and pixel ratio did not change.
a0="function resize(){if(!renderer)return; const w=host.clientWidth,h=host.clientHeight; renderer.setSize(w,h,false);"
assert a0 in s
s=s.replace(a0,"function resize(){if(!renderer)return; const w=host.clientWidth,h=host.clientHeight, key=w+'x'+h+'@'+(renderer.getPixelRatio?renderer.getPixelRatio():1); if(resize.k===key)return; resize.k=key; renderer.setSize(w,h,false);",1)
