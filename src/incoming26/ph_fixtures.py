"""Small hand-built result files in the formats ODM writes (tiled + deflate GeoTIFF, textured OBJ zip, GLB, LAS). Standard library only.
Used by fake_nodeodm.py and by the page tests (python3 ph_fixtures.py DIR writes them out)."""
import json, struct, sys, zlib, zipfile, io, os


def _predict3(row_bytes_per_sample_rows):
    return row_bytes_per_sample_rows


def tiff(w, h, bands=1, bits=8, fmt=1, tile=None, strip_rows=None, comp=8, pred=1, pixels=None, geo=None, nodata=None, photometric=None, extra=0):
    """Classic little-endian TIFF. pixels: flat list row-major, bands interleaved. geo=(x0_top_left, y0_top_left, scale_x, scale_y, epsg)."""
    bps = bits // 8
    px = pixels
    def enc_block(rows, bw):
        # rows: list of list of samples (bw*bands per row); returns encoded bytes
        out = bytearray()
        for r in rows:
            if fmt == 3:
                raw = b"".join(struct.pack("<f" if bits == 32 else "<d", v) for v in r)
            else:
                raw = b"".join(int(v).to_bytes(bps, "little") for v in r)
            if pred == 2:
                a = bytearray(raw)
                for i in range(len(a) - 1, bands - 1, -1):
                    a[i] = (a[i] - a[i - bands]) & 255
                raw = bytes(a)
            elif pred == 3:
                n = len(r)
                planes = bytearray(n * bps)
                for i in range(n):
                    for b in range(bps):               # MSB plane first
                        planes[b * n + i] = raw[bps * i + (bps - 1 - b)]
                for i in range(len(planes) - 1, bands - 1, -1):
                    planes[i] = (planes[i] - planes[i - bands]) & 255
                raw = bytes(planes)
            out += raw
        data = bytes(out)
        return zlib.compress(data) if comp in (8, 32946) else data
    blocks = []
    if tile:
        tw = th = tile
        ta, td = (w + tw - 1) // tw, (h + th - 1) // th
        for ty in range(td):
            for tx in range(ta):
                rows = []
                for yy in range(th):
                    row = []
                    for xx in range(tw):
                        X, Y = tx * tw + xx, ty * th + yy
                        for b in range(bands):
                            row.append(px[(Y * w + X) * bands + b] if X < w and Y < h else 0)
                    rows.append(row)
                blocks.append(enc_block(rows, tw))
    else:
        rps = strip_rows or h
        for s in range(0, h, rps):
            rows = [[px[(Y * w + X) * bands + b] for X in range(w) for b in range(bands)] for Y in range(s, min(h, s + rps))]
            blocks.append(enc_block(rows, w))
    ents = []                                             # (tag, type, values)
    def S(v): return (3, v if isinstance(v, list) else [v])
    def L(v): return (4, v if isinstance(v, list) else [v])
    ents.append((256, *L(w))); ents.append((257, *L(h)))
    ents.append((258, *S([bits] * bands))); ents.append((259, *S(comp)))
    ents.append((262, *S(photometric if photometric is not None else (2 if bands >= 3 else 1))))
    ents.append((277, *S(bands))); ents.append((284, *S(1)))
    if extra: ents.append((338, *S([2] * extra)))
    if pred != 1: ents.append((317, *S(pred)))
    ents.append((339, *S([fmt] * bands)))
    if tile:
        ents.append((322, *L(tile))); ents.append((323, *L(tile)))
    else:
        ents.append((278, *L(strip_rows or h)))
    body = bytearray(); offs = []
    base = 8
    for b in blocks:
        offs.append(base + len(body)); body += b
        if len(body) % 2: body += b"\0"
    ents.append((324 if tile else 273, *L(offs))); ents.append((325 if tile else 279, *L([len(b) for b in blocks])))
    if geo:
        x0, y0, sx, sy, epsg = geo
        ents.append((33550, 12, [sx, sy, 0.0])); ents.append((33922, 12, [0.0, 0.0, 0.0, x0, y0, 0.0]))
        ents.append((34735, 3, [1, 1, 0, 3, 1024, 0, 1, 1, 1025, 0, 1, 1, 3072, 0, 1, epsg]))
    if nodata is not None:
        s = (repr(nodata) + "\0").encode(); ents.append((42113, 2, s))
    ents.sort(key=lambda e: e[0])
    # layout: header, data blocks, then external value area, then IFD
    ext = bytearray(); ifd_entries = []
    ext_base = base + len(body)
    sz = {1: 1, 2: 1, 3: 2, 4: 4, 12: 8}
    pk = {3: "<H", 4: "<I", 12: "<d"}
    pend = []
    for tag, typ, vals in ents:
        if typ == 2:
            data = vals; cnt = len(data)
        else:
            data = b"".join(struct.pack(pk[typ], v) for v in vals); cnt = len(vals)
        if len(data) <= 4:
            ifd_entries.append((tag, typ, cnt, data.ljust(4, b"\0"), None))
        else:
            pend.append((len(ifd_entries), data))
            ifd_entries.append((tag, typ, cnt, None, None))
    for i, data in pend:
        off = ext_base + len(ext); ext += data
        if len(ext) % 2: ext += b"\0"
        t = ifd_entries[i]; ifd_entries[i] = (t[0], t[1], t[2], struct.pack("<I", off), None)
    ifd_off = ext_base + len(ext)
    ifd = struct.pack("<H", len(ifd_entries)) + b"".join(struct.pack("<HHI", t, ty, c) + d for t, ty, c, d, _ in ifd_entries) + struct.pack("<I", 0)
    return b"II*\0" + struct.pack("<I", ifd_off) + bytes(body) + bytes(ext) + ifd


def dsm_tiff(pred=3, tile=16, w=40, h=30):
    """Float32 DSM: z = 100 + 0.1*col + 0.2*row (hand-checkable), UTM 36N EPSG 32636, 0.5 m cells, top-left (500000, 3300015); one nodata cell."""
    px = [100 + 0.1 * c + 0.2 * r for r in range(h) for c in range(w)]
    px[5 * w + 7] = -9999.0
    return tiff(w, h, 1, 32, 3, tile=tile, comp=8, pred=pred, pixels=px, geo=(500000.0, 3300015.0, 0.5, 0.5, 32636), nodata=-9999)


def ortho_tiff(w=64, h=48, tile=32):
    """RGBA 8-bit: R = col*4, G = row*5, B = 128, A = 255 except the first column (0 = no data)."""
    px = []
    for r in range(h):
        for c in range(w):
            px += [min(255, c * 4), min(255, r * 5), 128, 0 if c == 0 else 255]
    return tiff(w, h, 4, 8, 1, tile=tile, comp=8, pred=2, pixels=px, geo=(500000.0, 3300024.0, 0.5, 0.5, 32636), extra=1, photometric=2)


def png(w, h, rgb):
    raw = b"".join(b"\0" + bytes(rgb) * w for _ in range(h))
    def ch(t, d): return struct.pack(">I", len(d)) + t + d + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)
    return b"\x89PNG\r\n\x1a\n" + ch(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)) + ch(b"IDAT", zlib.compress(raw)) + ch(b"IEND", b"")


def model_zip(with_coords=False):
    """Unit cube 10 x 10 x 5 m (E 0..10, N 0..10, U 0..5) in two materials (roof + walls), 12 triangles, ODM-style names."""
    v = [(0, 0, 0), (10, 0, 0), (10, 10, 0), (0, 10, 0), (0, 0, 5), (10, 0, 5), (10, 10, 5), (0, 10, 5)]
    obj = ["mtllib odm_textured_model_geo.mtl"] + ["v %g %g %g" % p for p in v]
    obj += ["vt 0 0", "vt 1 0", "vt 1 1", "vt 0 1"]
    obj += ["usemtl material0000", "f 5/1 6/2 7/3", "f 5/1 7/3 8/4"]
    obj += ["usemtl material0001", "f 1/1 3/3 2/2", "f 1/1 4/4 3/3", "f 1/1 2/2 6/3", "f 1/1 6/3 5/4", "f 2/1 3/2 7/3", "f 2/1 7/3 6/4", "f 3/1 4/2 8/3", "f 3/1 8/3 7/4", "f 4/1 1/2 5/3", "f 4/1 5/3 8/4"]
    mtl = "newmtl material0000\nmap_Kd odm_textured_model_geo_material0000_map_Kd.png\nnewmtl material0001\nmap_Kd odm_textured_model_geo_material0001_map_Kd.png\n"
    b = io.BytesIO()
    with zipfile.ZipFile(b, "w", zipfile.ZIP_DEFLATED) as z:
        pre = "odm_texturing/" if with_coords else ""
        z.writestr(pre + "odm_textured_model_geo.obj", "\n".join(obj) + "\n")
        z.writestr(pre + "odm_textured_model_geo.mtl", mtl)
        z.writestr(pre + "odm_textured_model_geo_material0000_map_Kd.png", png(4, 4, (200, 30, 30)))
        z.writestr(pre + "odm_textured_model_geo_material0001_map_Kd.png", png(4, 4, (30, 30, 200)))
        if with_coords:
            z.writestr("odm_georeferencing/coords.txt", "WGS84 UTM 36N\n500100 3300200\n")
    return b.getvalue()


def glb():
    """One textured quad (2 triangles) 4 x 2 m standing in the XY plane of glTF (y up), embedded 4x4 PNG."""
    pos = [(0, 0, 0), (4, 0, 0), (4, 2, 0), (0, 2, 0)]
    uv = [(0, 1), (1, 1), (1, 0), (0, 0)]
    idx = [0, 1, 2, 0, 2, 3]
    bin_ = b"".join(struct.pack("<3f", *p) for p in pos) + b"".join(struct.pack("<2f", *t) for t in uv) + b"".join(struct.pack("<H", i) for i in idx)
    bin_ += b"\0" * (-len(bin_) % 4)
    img = png(4, 4, (20, 200, 20))
    iv_off = len(bin_); bin_ += img + b"\0" * (-len(img) % 4)
    j = {"asset": {"version": "2.0"}, "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0}],
         "meshes": [{"primitives": [{"attributes": {"POSITION": 0, "TEXCOORD_0": 1}, "indices": 2, "material": 0}]}],
         "materials": [{"pbrMetallicRoughness": {"baseColorTexture": {"index": 0}}}], "textures": [{"source": 0}], "images": [{"bufferView": 3, "mimeType": "image/png"}],
         "buffers": [{"byteLength": len(bin_)}],
         "bufferViews": [{"buffer": 0, "byteOffset": 0, "byteLength": 48}, {"buffer": 0, "byteOffset": 48, "byteLength": 32}, {"buffer": 0, "byteOffset": 80, "byteLength": 12}, {"buffer": 0, "byteOffset": iv_off, "byteLength": len(img)}],
         "accessors": [{"bufferView": 0, "componentType": 5126, "count": 4, "type": "VEC3", "min": [0, 0, 0], "max": [4, 2, 0]}, {"bufferView": 1, "componentType": 5126, "count": 4, "type": "VEC2"}, {"bufferView": 2, "componentType": 5123, "count": 6, "type": "SCALAR"}]}
    js = json.dumps(j).encode(); js += b" " * (-len(js) % 4)
    tot = 12 + 8 + len(js) + 8 + len(bin_)
    return struct.pack("<4sII", b"glTF", 2, tot) + struct.pack("<I4s", len(js), b"JSON") + js + struct.pack("<I4s", len(bin_), b"BIN\0") + bin_


def las(n=50):
    """LAS 1.2 point format 0, scale 0.01, points on a 7 x 7 grid-ish plane z = 100 + 0.1*x in UTM 36N coordinates near (500000, 3300000)."""
    pts = [(500000.0 + (i % 10), 3300000.0 + (i // 10), 100.0 + 0.1 * (i % 10)) for i in range(n)]
    hdr = bytearray(227)
    hdr[0:4] = b"LASF"; struct.pack_into("<BB", hdr, 24, 1, 2); struct.pack_into("<H", hdr, 94, 227); struct.pack_into("<I", hdr, 96, 227)
    struct.pack_into("<I", hdr, 100, 0); hdr[104] = 0; struct.pack_into("<H", hdr, 105, 20); struct.pack_into("<I", hdr, 107, n)
    struct.pack_into("<3d", hdr, 131, 0.01, 0.01, 0.01); struct.pack_into("<3d", hdr, 155, 500000.0, 3300000.0, 100.0)
    xs, ys, zs = [p[0] for p in pts], [p[1] for p in pts], [p[2] for p in pts]
    struct.pack_into("<6d", hdr, 179, max(xs), min(xs), max(ys), min(ys), max(zs), min(zs))
    body = b"".join(struct.pack("<iiiHBBBBH", round((x - 500000) / .01), round((y - 3300000) / .01), round((z - 100) / .01), 100, 0, 2, 0, 0, 1) for x, y, z in pts)
    return bytes(hdr) + body


def write_all(d):
    os.makedirs(d, exist_ok=True)
    W = lambda n, b: open(os.path.join(d, n), "wb").write(b)
    W("dsm_pred3.tif", dsm_tiff(3)); W("dsm_pred1.tif", dsm_tiff(1, tile=16)); W("ortho.tif", ortho_tiff())
    W("textured_model.zip", model_zip()); W("all.zip", model_zip(True)); W("model.glb", glb()); W("model.las", las())


if __name__ == "__main__":
    write_all(sys.argv[1])
