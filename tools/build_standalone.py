#!/usr/bin/env python3
"""Build a standalone (offline) page from a BVT-1 source file.

Usage: python3 tools/build_standalone.py src/<project>.html index.html
Inlines Three.js, OrbitControls and jsPDF (downloaded once from public CDNs, pinned versions).
"""
import sys, subprocess, urllib.request
LIBS = [
    ('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js', 'three.min.js'),
    ('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', 'OrbitControls.js'),
    ('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'jspdf.umd.min.js'),
]
src, out = sys.argv[1], sys.argv[2]
page = open(src, encoding='utf-8').read()
head, body = page.split('<body>', 1)
for url, _ in LIBS:
    tag = '<script src="%s"></script>' % url
    if tag in body:
        try:
            code = urllib.request.urlopen(url).read().decode('utf-8')
        except Exception:  # some Python installs have no CA bundle: fall back to curl
            code = subprocess.check_output(['curl', '-sSfL', url]).decode('utf-8')
        body = body.replace(tag, '<script>\n' + code + '\n</script>')
html = ('<!doctype html>\n<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + head + '</head><body>' + body)
open(out, 'w', encoding='utf-8').write(html)
print('wrote', out, len(html) // 1024, 'KB')
