# T.O X Reality Capture and Drone Flight Planner: research and plan (2026-11-20)

Research only. No app source edited, nothing downloaded or installed. Labels on every fact:
**[V]** = VERIFIED today (page, API or search result read this session; source number in brackets, list in section 10).
**[M]** = FROM MEMORY, not re-checked today. **[E]** = my own calculation or engineering estimate.
Prices: only quoted where a page was read today, and marked third-party when not from the vendor. Otherwise "price not found".
Regulation notes are not legal advice. The owner must confirm with the authority before any flight.

## ملخص عربي (10 سطور)

1. المنتج اللي فاكره من Autodesk هو **ReCap Pro ومعاه ReCap Photo** (كان اسمه ReMake وقبله Memento/123D Catch). لسه موجود: فيه إصدارات ReCap Pro 2027 في 2026، بس التصوير الفوتوجرامتري فيه سحابي ومحدود، ومش أحسن اختيار للمساحة.
2. أحسن مسار مجاني ومفتوح لـ T.O X: **WebODM + NodeODM/NodeODX** على الجهاز، والـ bridge المحلي يكلّمه بـ REST. خلّي بالك: WebODM انفصل عن OpenDroneMap في أبريل 2026 وبقى له محرك اسمه ODX (اتأكدت النهارده).
3. T.O X يقدر يطلّع ملفات الطيران من المتصفح مباشرة: **KMZ بصيغة DJI WPML** (لـ Pilot 2 / FlightHub 2)، **Litchi CSV**، **QGroundControl .plan**، **Mission Planner .waypoints**، وKML وPDF. الطيار يحمّل الملف وبس.
4. DJI Fly (Mini 4 Pro / Air 3) مفيهوش استيراد رسمي؛ فيه حيلة استبدال ملف KMZ غير رسمية وممكن تتعطل مع أي تحديث.
5. الحسابات كلها بسيطة: GSD = الارتفاع × حجم البكسل ÷ البعد البؤري. مثال محلول: Mavic 3E على 75 م يدّي 2 سم/بكسل، وموقع 400×300 م = 11 خط و297 صورة وحوالي 12 دقيقة.
6. الدقة: من غير نقط تحكم ولا RTK الخطأ المطلق بالمتر. مع RTK/PPK أو نقط تحكم (5–10 نقط + نقط تحقق مستقلة) توصل 3–5 سم. لازم تقرير RMSE من نقط التحقق مش من نقط التحكم.
7. بيانات مجانية: Sentinel-2 (10 م)، Landsat (30 م)، Copernicus DEM GLO-30. اتأكدت النهارده إن بعض المصادر بتفتح من الصفحة مباشرة (Open-Meteo، تايلز Terrarium، STAC بتاع Element84، NASA GIBS) وبعضها محتاج الـ bridge (ملفات Copernicus DEM وWorldCover على S3 من غير CORS).
8. القمر الصناعي مايديش عمق تحت الأرض ولا تحت المية. ده مسح منفصل: GPR للمرافق المدفونة، وسونار أو ليدار أخضر للأعماق.
9. التصاريح: مصر = قانون 216 لسنة 2017 وتصريح من وزارة الدفاع. السعودية = الهيئة العامة للطيران المدني GACA ومنصة uas.gaca.gov.sa. لازم تتأكد بنفسك من الجهة قبل أي طيران.
10. أول 15 حاجة تتبني مترتبة في القسم 8، وأولها: حاسبة GSD + جدول الكاميرات + شبكة الخطوط على الخريطة + تصدير KMZ/WPML.

**إضافة (نفس اليوم، الأقسام 11–15):** المجاني أولًا والمدفوع اختيار مستقبلي بس. (أ) هيئة المساحة السعودية GEOSA ناشرة بيانات ارتفاعات مفتوحة 5 و10 و30 و90 م؛ مصر مالقيتش لها بوابة مفتوحة. (ب) إحداثيات بالسنتيمتر من غير اشتراك: مستقبل ثنائي التردد رخيص + AUSPOS و CSRS-PPP المجانيين + RTKLIB (نسخة demo5) عن طريق الـ bridge، وبعدين تطبيق على نقط الموقع المعروفة. (ج) كميات الحفر والردم: DEM 30 م خطؤه 100–200% على موقع هكتار بحفر متر (ماينفعش للمستخلصات)، الدرون المضبوط 2–3%، والشبكة الأرضية 10 م 1–3%. (د) جدول صيغ الاستيراد ومكتبة كل صيغة في القسم 14. (هـ) قائمة أوامر الـ AI والصوت في القسم 15.

---

## 0. What this session verified (short list)

| Fact | Result | Label |
|---|---|---|
| Autodesk product | ReCap Pro with ReCap Photo. Help pages list "ReCap Pro and ReCap Photo 2026" and 2027 release notes with builds in April, June and October 2026. No end-of-life notice found | [V 1,2] |
| RealityCapture | Renamed **RealityScan 2.0** (Epic, June 2025). Free under USD 1 million annual gross revenue; above that a paid seat. EULA lets Epic use scan data for training by default, opt-out in settings | [V 3,4,5] |
| WebODM | Split from OpenDroneMap (announcement dated April 2026). New org `WebODM` on GitHub with `ODX` (engine fork), `NodeODX`, `PyODX`. WebODM 4.0.2, AGPL-3.0 | [V 6,7,8] |
| OpenDroneMap ODM | Still active: v3.6.2 (2026-08-12), AGPL-3.0. NodeODM v3.6.2 (2026-09-24) | [V 9] |
| NodeODM REST API | `/task/new`, `/task/new/init`, `/task/new/upload/{uuid}`, `/task/new/commit/{uuid}`, `/task/{uuid}/info`, `/task/{uuid}/output`, `/task/{uuid}/download/{asset}`, `/task/cancel`, `/task/remove`, `/task/restart`, `/task/list`, `/info`, `/options`, `/auth/*` | [V 10] |
| DJI WPML | KMZ = ZIP holding `wpmz/template.kml`, `wpmz/waylines.wpml`, `wpmz/res/`. Drone enum: 89 M350 RTK, 60 M300 RTK, 67 M30, 77 M3E/M3T/M3M, 91 M3D | [V 11,12,13] |
| QGC `.plan` | JSON, `fileType: "Plan"`, `version: 1`, required `mission`, `geoFence`, `rallyPoints` | [V 14] |
| CORS (curl with `Origin` header) | Open-Meteo elevation, AWS Terrarium tiles, Element84 STAC, sentinel-cogs bucket, NASA GIBS, Planetary Computer STAC, EOX s2cloudless: allowed. Copernicus DEM S3 bucket, ESA WorldCover S3 bucket, OpenTopoData public API: no CORS header | [V 15] |
| Zenmuse P1 | 35.9 x 24 mm, 8192 x 5460, 4.4 um, 24/35/50 mm lenses, DJI claim 3 cm H / 5 cm V without GCP at 3 cm GSD | [V 16] |
| Matrice 350 RTK | 55 min max, no payload, 8 m/s, no wind, to 0% battery | [V 17] |
| KSA geodesy | KSA-GRF17 (EPSG:9332/9333), KSA-VRF14, KSA-GEOID17 (not a public download), KSA-CORS 209 stations | [V 18,19] |
| ASPRS Edition 2 | Minimum check points raised from 20 to 30; survey error of check points is included in the result | [V 20] |

---

## 1. Photogrammetry and reality-capture software

### 1.1 The Autodesk product

**Autodesk ReCap Pro** (desktop, Windows) with its companion **ReCap Photo**. History [M]: 123D Catch and Project Memento became ReMake (2016), and ReMake became ReCap Photo in 2017 [V 21]. ReCap Pro is mainly for registering **laser scans** (RCP/RCS point clouds for Revit, Civil 3D, Navisworks). ReCap Photo handles **photos** and processes them in Autodesk's cloud [M].

Status today: ReCap Pro 2026 ships with ReCap Photo, and Autodesk help has 2027 release notes [V 1,2]. I found no retirement notice. Limits I remember but did not re-read today: cloud processing with photo-count caps and cloud credits, no local processing, weak GCP/check-point reporting compared with survey tools [M]. Price not found. Conclusion: good as the bridge into Revit/Civil 3D point-cloud formats, not as the main photogrammetry engine.

### 1.2 Commercial software

| Software | Licence / status | Platform | Inputs | Outputs | GCP / RTK / PPK | API or CLI a helper could drive | Accuracy claim and source | Hardware |
|---|---|---|---|---|---|---|---|---|
| Autodesk ReCap Pro + ReCap Photo | Subscription, proprietary [V 1]. Price not found | Windows | Photos (ReCap Photo), laser scans (ReCap Pro) | RCP/RCS, RCM mesh, OBJ, ortho [M] | GCP supported in ReCap Photo aerial projects [M] | No documented local CLI [M] | None read today | Cloud does the work [M] |
| Bentley iTwin Capture Modeler (was ContextCapture) | Proprietary. "Flex" edition free for setup and editing; processing needs iTwin Capture Engine or cloud subscription [V 22]. Price not found | Windows + cloud | Photos, video, lidar | 3MX, 3SM, OBJ, FBX, I3S, OSGB, Cesium 3D Tiles (reseller list) [V 23], LAS, ortho/DSM [M] | GCP, check points, RTK/PPK [M] | iTwin Capture SDK (Python) and cloud APIs [V 22] | None read today | Strong GPU, scales to clusters [M] |
| Agisoft Metashape Professional 2.x | Perpetual licence, node-locked or floating. Version 2.3.0 current [V 24]. Third-party prices seen today: USD 3,499 (reseller), EUR 3,999 incl. VAT (reseller) [V 25] | Windows, macOS, Linux | Photos, video frames, lidar, multispectral | LAS/LAZ, OBJ/PLY/FBX, Cesium 3D Tiles, GeoTIFF ortho, DSM/DTM, contours [M] | GCP + check points with error table, RTK/PPK camera accuracy [M] | **Python API**, headless `metashape -r script.py`, Java API [V 25 reseller text; M for the command] | None read today | NVIDIA or AMD GPU, 32 GB+ RAM for 500+ photos [M] |
| Pix4D (PIX4Dmatic, PIX4Dmapper, PIX4Dcloud) | Subscription. PIX4Dmatic now has Standard, Analyst and Pro plans and absorbed PIX4Dsurvey [V 26]. A third-party page says PIX4Dmapper sales end 2027-01-01 and support ends 2027-12-01 [V 27, not confirmed on pix4d.com]. Prices rose from 2026-01-05 [V 28]. Vendor price not read | Windows (matic also macOS [M]), cloud | Photos, lidar (matic) | LAS/LAZ, OBJ, 3D Tiles, GeoTIFF, DSM/DTM, contours [M] | GCP, check points, RTK/PPK; quality report with RMSE [M] | PIX4Dengine SDK and PIX4Dcloud REST API [M] | None read today | GPU recommended; matic built for 5,000+ images [M] |
| RealityScan 2.0 (was RealityCapture, Epic) | Free for individuals and businesses under USD 1 million annual gross revenue; USD 1,250 per seat per year above that (licensing page via search) [V 3,4]. New EULA needed; data may be used for training unless you opt out [V 5] | Windows | Photos, laser scans, aerial lidar (2.0) [V 5] | OBJ/FBX, LAS, ortho, DSM, Cesium 3D Tiles [M] | GCP and check points [M]; no PPK processing | **Full CLI** (`RealityScan.exe -headless ...`) [M] | None read today | **NVIDIA CUDA GPU required** for meshing [M] |
| DJI Terra 5.x | Editions: Agriculture, Standard (was Pro), Flagship (was Electricity), Cluster, Education [V 29]. Price not found | Windows | DJI photos, DJI L1/L2 lidar | LAS/LAZ, OSGB/B3DM/OBJ/PLY, GeoTIFF, DSM; Gaussian splats in 3D Tiles/PLY (Flagship) [V 29,30] | GCP, check points, RTK and PPK from DJI base files [M] | No public CLI [M] | P1 claim: 3 cm H, 5 cm V without GCP at 3 cm GSD, 15 m/s, 75/55 overlap [V 16] | NVIDIA GPU [M] |
| DroneDeploy | Cloud subscription. Price not found | Web + mobile | Photos, video, 360 | GeoTIFF, LAS, OBJ, contours (DXF/SHP), 3D Tiles [M] | GCP and check points on higher plans, RTK/PPK [M] | REST/GraphQL API on enterprise plans [M] | None read today | None locally |
| Propeller | Cloud subscription + AeroPoints smart GCPs. Price not found | Web | Photos + AeroPoint logs | Surfaces, volumes, GeoTIFF, LAS, DXF [M] | PPK workflow with AeroPoints; 1 to 3 AeroPoints for sites up to 60 ha [V 31] | API for enterprise [M] | Vendor claim: about 3 cm (1/10 ft) with its PPK workflow [V 31, vendor marketing] | None locally |
| Trimble Business Center (Aerial Photogrammetry module), Trimble Inpho / UASMaster | Proprietary, modular. Price not found | Windows | Photos, total-station/GNSS/levelling data, lidar | Survey-grade deliverables: points, surfaces, ortho, LAS, DXF [M] | Full survey adjustment with GCP/check points, PPK [M] | Limited macros; Inpho has batch tools [M] | None read today | Workstation [M] |
| 3DF Zephyr 9.0 | Free edition: 50 images, 1 GPU. Lite: unlimited images, 2 GPUs, USD 209 (news article). Full: third-party table says EUR 4,200 + VAT perpetual [V 32, third-party] | Windows | Photos, video, laser scans (full) | OBJ/PLY/FBX, LAS, ortho, DEM, contours (full) [M] | GCP in full edition [M] | Batch/CLI in full edition [M] | None read today | NVIDIA CUDA GPU [M] |

### 1.3 Open-source engines

| Tool | Licence | What it is | Outputs | GCP / RTK | How a local helper drives it | Notes |
|---|---|---|---|---|---|---|
| **OpenDroneMap ODM** | AGPL-3.0, v3.6.2 [V 9] | Full pipeline: OpenSfM, OpenMVS, texturing, DEM, ortho | `odm_orthophoto.tif` (GeoTIFF), `odm_dem/dsm.tif` and `dtm.tif`, `odm_georeferenced_model.laz`, `odm_textured_model_geo.obj`, optional glTF and 3D Tiles [V 33; 3D Tiles flag from memory] | `gcp_list.txt` auto-detected; `--force-gps` to combine RTK EXIF with GCPs; minimum 5 GCPs each seen in 3+ photos [V 34] | Docker CLI: `docker run opendronemap/odm --project-path ...` [M] | Runs on CPU; GPU speeds feature extraction [M] |
| **NodeODM** | AGPL-3.0 [V 9] | REST wrapper around ODM | Zip of all ODM assets via `/task/{uuid}/download/all.zip` | Send `gcp_list.txt` with the images | **REST, see section 7.2** [V 10] | Default port 3000 [M] |
| **WebODM** | AGPL-3.0, v4.0.2 [V 7] | Web UI, projects, map and 3D viewers, measurements, GCP editor, plugin system | Same as engine, plus map tiles and Potree view | Built-in GCP interface (POSM GCPi) [V 34] | REST API with `POST /api/token-auth/` (JWT), projects and tasks endpoints [V 8 index; paths from memory] | **Now separate from OpenDroneMap**, default engine "ODX"; also lists a proprietary "LGT" engine at webodm.net [V 6,8]. Check which engine images the installer pulls |
| ODX / NodeODX / PyODX | AGPL-3.0 / AGPL-3.0 / BSD-3 [V 6] | WebODM's fork of ODM, NodeODM and PyODM | Same family | Same family | NodeODX is described as "REST API to access photogrammetry engines such as ODX, MicMac and LGT" [V 6] | API compatibility with NodeODM stated for ClusterODX [V 6]; test before relying on it |
| MicMac (IGN France) | CeCILL-B [M] | Research-grade photogrammetry, strong bundle adjustment | Point clouds, ortho, DEM | GCP, check points, detailed residuals [M] | CLI `mm3d` [M] | Steep learning curve, very accurate when tuned [M] |
| COLMAP | BSD-3 [M], active (pushed 2026-11-18) [V 35] | SfM + MVS reference engine | Sparse/dense cloud, mesh | No native survey GCP workflow; `model_aligner` for georeference [M] | CLI `colmap automatic_reconstructor` [M] | Dense step needs CUDA [M]. Feeds Gaussian-splat training |
| Meshroom / AliceVision | MPL-2.0 [M], active [V 35] | Node-graph photogrammetry | Textured mesh | Weak for survey: no proper GCP report [M] | `meshroom_batch` CLI [M] | Good for objects and facades, not maps |
| OpenSfM | BSD-2 [V 35] | SfM library used inside ODM | Sparse reconstruction, camera poses | GCP file support [M] | Python/CLI [M] | Use through ODM |

### 1.4 3D Gaussian splatting

| Tool | Licence | Use |
|---|---|---|
| nerfstudio (Splatfacto) | Apache-2.0 [V 35,36] | Trains splats from COLMAP poses. Needs NVIDIA CUDA, about 6 GB VRAM [V 36] |
| gsplat | Apache-2.0 [V 35,36] | The rasteriser library under Splatfacto |
| OpenSplat (now under the WebODM org) | AGPL-3.0 [V 6] | Splat training on CPU or GPU, Windows/Mac/Linux |
| Postshot (Jawset) | Proprietary, Windows + NVIDIA. Sources seen today disagree on whether paid tiers are charged [V 36] | Easy desktop trainer. Price not found on vendor page |
| DJI Terra, PIX4D, 3DF Zephyr 9 | Commercial | All added splat output in 2025–2026 [V 29,26,32] |

What splats are good for: photoreal walk-through of a site or facade, client presentations, thin objects and reflective surfaces that meshes handle badly, fast visual progress records.
What splats are **not** good for: measurements you sign. A splat is a cloud of fuzzy coloured blobs fitted for appearance, not a surface. It has no DSM, no contours, no volume, and no accuracy report. Scale and georeference come only from the camera poses fed in. Rule for T.O X: splats are a **viewing layer**; all quantities come from the photogrammetric point cloud, DSM or lidar [E].

---

## 2. Flight planning software and file formats

### 2.1 Apps

| App | Drones | Mission types | Import a file made elsewhere? | Label |
|---|---|---|---|---|
| **DJI Pilot 2** (on enterprise controllers) | Mavic 3E/3T/3M, Matrice 30/300/350/4 series | Waypoint, 2D mapping, oblique, linear (corridor), terrain follow | **Yes: KMZ (WPML) and KML** via "Import Route (KMZ/KML)". Polygon KML becomes a mapping area. One file at a time. A plain Google Earth KML waypoint file can fail with "Task Type Error" | [V 37] |
| **DJI FlightHub 2** (cloud) | Same enterprise fleet | Same, planned on a web map, synced to controllers | Yes, KMZ import/export; syncs several routes to Pilot 2 | [V 37] |
| **DJI Fly** (consumer: Mini 4 Pro, Air 3/3S, Mavic 3 Pro) | Consumer | Manual waypoints only, no mapping grid | **No official import.** Unofficial method: create a placeholder mission, then replace its KMZ in `Android/data/dji.go.v5/files/waypoint` with a same-named WPML KMZ. Curved turns and photo interval are not supported that way; a DJI Fly update can break it | [V 38] |
| Litchi (Litchi Pilot for newer drones) | Many DJI consumer drones | Waypoints, POI, orbit | **Yes: CSV import in Mission Hub**; Mission Hub can also export a DJI Fly KMZ | [V 38,39] |
| UgCS (SPH Engineering) | DJI, MAVLink, others | Photogrammetry, corridor, facade scan, terrain following, lidar | KML import; **exports WPML KMZ for Pilot 2** | [V 37 for the export; rest M] |
| Map Pilot Pro (Maps Made Easy) | DJI, iOS | Grid, linear, terrain aware | KML boundary import | [M] |
| PIX4Dcapture Pro | DJI, Parrot | Grid, double grid, polygon, circular | KML boundary | [M]. A weak source says it was decommissioned in July 2025; **not confirmed** |
| DroneDeploy Flight | DJI enterprise + some consumer | Grid, crosshatch, corridor, facade | KML/SHP boundary; "Import Flight Path" in closed beta | [V 38 for the beta; rest M] |
| Dronelink | DJI consumer + enterprise | Scripted missions, mapping, facade, orbit | KML/CSV; can convert to DJI onboard KMZ | [V 38] |
| **QGroundControl** | PX4 / ArduPilot (MAVLink) | Survey, corridor scan, structure scan | **Yes: `.plan` JSON**, also KML/SHP polygon | [V 14] |
| **Mission Planner** | ArduPilot | Survey grid, corridor | **Yes: `.waypoints` text (QGC WPL 110)**, KML polygon | [M] |

### 2.2 DJI WPML / KMZ (the most valuable export)

Verified from DJI's own spec [V 11,12,13]:

```
mission.kmz            (ZIP archive, .kmz suffix; file name = route name)
└── wpmz/
    ├── template.kml   "template file": business parameters (area polygon, overlap, height, drone, payload)
    ├── waylines.wpml  "execution file": every waypoint and action the aircraft runs
    └── res/           optional resources (reference photos for AI spot-check)
```

- `template.kml` holds `wpml:missionConfig` (fly-to mode, `finishAction`, `exitOnRCLost`, `takeOffSecurityHeight`, `droneInfo` with `droneEnumValue`/`droneSubEnumValue`, `payloadInfo` with `payloadEnumValue`) and one `Folder` with `wpml:templateType`. `waypoint` is the type in the spec example [V 12]. The mapping types `mapping2d`, `mapping3d` and `mappingStrip` are from memory [M].
- Pilot 2 needs `template.kml` and generates `waylines.wpml` itself. MSDK v5 apps need `waylines.wpml`. Writing both makes the file work in either [V 11 via DJI SDK forum].
- Drone enum values in the public table: 89 = M350 RTK, 60 = M300 RTK, 67 = M30/M30T, 77 = M3E (sub 0) / M3T (1) / M3M (2), 91 = M3D/M3TD. Payload: 66 = Mavic 3E camera, 42/43 = H20/H20T, 82/83 = H30/H30T, 65534 = PSDK payload [V 13].
- **Not in the public table I read:** Zenmuse P1, L1/L2, Matrice 4 series, and every consumer drone. Their values must be taken from a KMZ exported by Pilot 2 or DJI Fly on the real aircraft [E].
- Heights: `wpml:heightMode` and `ellipsoidHeight` + `height` pairs exist per waypoint [V 12]. Getting the height reference wrong is the main safety risk of a generated file.
- Namespace versions seen in the wild: `http://www.dji.com/wpmz/1.0.2` and later [V 11].

Two safe strategies for T.O X [E]:
1. **Area template** (lowest risk): export a KML polygon or a `mapping2d` template and let Pilot 2 compute the lines with its own, flight-tested planner. T.O X still shows counts and time so the user knows what to expect.
2. **Explicit waypoints** (`waypoint` template + `waylines.wpml`): needed for facade, orbit, terrain-following from our DEM and for consumer drones. Must be validated by opening it in Pilot 2 and by a low-risk test flight before real use.

### 2.3 Litchi CSV

Header columns as reported from Mission Hub exports [V 39]:
`latitude,longitude,altitude(m),heading(deg),curvesize(m),rotationdir,gimbalmode,gimbalpitchangle,actiontype1,actionparam1,...,actiontype15,actionparam15,altitudemode,speed(m/s),poi_latitude,poi_longitude,poi_altitude(m),poi_altitudemode,photo_timeinterval,photo_distinterval` (the part after `actionparam15` is from memory [M]).
Verified details: `rotationdir` is 0 (clockwise) or 1; `altitudemode` 0 = above take-off, 1 = above ground; global settings (path mode, cruising speed, finish action) are not in the CSV and must be set in the app [V 39]. One forum post spells the column `curvesiz(m)`; export one file from the user's own Mission Hub and copy its header exactly [V 39].

### 2.4 MAVLink formats

**QGroundControl `.plan`** [V 14]:

```json
{ "fileType": "Plan", "version": 1, "groundStation": "QGroundControl",
  "geoFence": { "circles": [], "polygons": [], "version": 2 },
  "rallyPoints": { "points": [], "version": 2 },
  "mission": { "cruiseSpeed": 15, "hoverSpeed": 5, "firmwareType": 12,
    "globalPlanAltitudeMode": 1, "items": [
      { "type": "SimpleItem", "command": 22, "frame": 3, "autoContinue": true,
        "doJumpId": 1, "Altitude": 50, "AltitudeMode": 0,
        "params": [15, 0, 0, null, 47.3985099, 8.5451002, 50] } ],
    "plannedHomePosition": [47.39, 8.54, 488], "vehicleType": 2, "version": 2 } }
```

Items may be `SimpleItem` (one MAVLink command) or `ComplexItem` (QGC's own survey object) [V 14]. T.O X should write only `SimpleItem`s: it keeps our line geometry and works for both PX4 and ArduPilot. `vehicleType`, `plannedHomePosition` and mission `version` are from memory [M].

**Mission Planner `.waypoints`** (QGC WPL 110, tab-separated) [M]:

```
QGC WPL 110
0	1	0	16	0	0	0	0	30.0500000	31.2300000	20.0	1
1	0	3	22	0	0	0	0	0	0	75.0	1
2	0	3	206	15.8	0	1	0	0	0	0	1
3	0	3	16	0	0	0	0	30.0510000	31.2300000	75.0	1
```

Columns: index, current, frame (3 = relative altitude, 10 = terrain altitude), command, p1..p4, lat, lon, alt, autocontinue. Commands used by a survey: 22 TAKEOFF, 16 WAYPOINT, 206 DO_SET_CAM_TRIGG_DIST (p1 = metres between photos), 178 DO_CHANGE_SPEED, 205 DO_MOUNT_CONTROL (gimbal pitch), 201 DO_SET_ROI (orbit), 20 RETURN_TO_LAUNCH [M].

### 2.5 What a static web page can generate

| Output | Feasible in the browser | How |
|---|---|---|
| DJI WPML KMZ | Yes | Build two XML strings, zip them. A "stored" (no compression) ZIP writer is about 60 lines of JS, or use fflate (MIT [M]) |
| Litchi CSV | Yes | Text file |
| QGC `.plan` | Yes | `JSON.stringify` |
| Mission Planner `.waypoints` | Yes | Text file |
| KML / GeoJSON of area, lines, shot points, GCP proposals | Yes | G.X already exports KML/GeoJSON |
| CSV of planned shot positions (lat, lon, alt, yaw, pitch) | Yes | Text file; useful for any other app |
| PDF flight brief | Yes | Print stylesheet + `window.print()`, no library needed |
| Direct upload to the drone | **No** | Needs DJI MSDK/Cloud API or a MAVLink link. The pilot loads the file |

---

## 3. Mission design maths

### 3.1 Symbols

| Symbol | Meaning | Unit |
|---|---|---|
| Sw, Sh | sensor width, height | mm |
| f | real focal length | mm |
| Iw, Ih | image width, height | px |
| p = Sw / Iw | pixel pitch | mm |
| H | height above ground | m |
| GSD | ground sampling distance | m/px |
| Fw, Fl | footprint across track and along track | m |
| of, os | front and side overlap | fraction |
| B, S | photo spacing (base) and line spacing | m |
| v | ground speed | m/s |

### 3.2 Core formulas

```
GSD = H * p / f = H * Sw / (f * Iw)            H = GSD * f / p
Fw  = GSD * Iw     (long side across the flight line)
Fl  = GSD * Ih     (short side along the flight line)
B   = Fl * (1 - of)
S   = Fw * (1 - os)
lines        nL = ceil(Wsite / S) + 1
photos/line  nP = ceil(Lline / B) + 1
photos       N  = nL * nP          (double grid: about 2 N)
path         D  = nL * Lline + (nL - 1) * S + transit
interval     dt = B / v            must be >= camera minimum interval
time         T  = D / v + (nL - 1) * t_turn + t_takeoff_landing
batteries    nB = ceil(T / (T_batt * usable))     usable = 0.6 to 0.7
blur (px)    b  = v * t_shutter / GSD             keep b <= 0.5 to 1.0
```

When only the 35 mm-equivalent focal length f35 is known (consumer drones):
`GSD = H * 43.27 / (f35 * sqrt(Iw^2 + Ih^2))` (43.27 mm is the full-frame diagonal). It agrees with the exact formula to about 2% on the Mavic 3E [E].

### 3.3 Worked example

Site 400 m x 300 m (12 ha), flat. Drone: DJI Mavic 3 Enterprise wide camera. Inputs: Iw x Ih = 5280 x 3956 [V 40]; Sw = 17.3 mm, f = 12.29 mm [M]. Target GSD 2.0 cm, overlaps 80% front and 70% side, speed 10 m/s.

| Step | Calculation | Result |
|---|---|---|
| Pixel pitch | 17.3 / 5280 | 0.003277 mm (3.28 um) |
| Height | 0.02 x 12.29 / 0.003277 | **75.0 m** |
| Footprint across | 0.02 x 5280 | 105.6 m |
| Footprint along | 0.02 x 3956 | 79.1 m |
| Photo spacing B | 79.1 x (1 - 0.80) | **15.8 m** |
| Line spacing S | 105.6 x (1 - 0.70) | **31.7 m** |
| Lines (along the 400 m side) | ceil(300 / 31.7) + 1 | **11** |
| Photos per line | ceil(400 / 15.8) + 1 | 27 |
| Photos | 11 x 27 | **297** |
| Path | 11 x 400 + 10 x 31.7 | 4,717 m |
| Photo interval | 15.8 / 10 | 1.58 s (camera minimum 0.7 s [V 40], so fine) |
| Line time | 4,717 / 10 | 472 s |
| Turns | 10 x 8 s | 80 s |
| Take-off, transit, landing | allowance | 180 s |
| **Total** | | **732 s = 12.2 min** |
| Batteries | 12.2 / (45 min [M] x 0.65) | 0.42, so **1 battery**; double grid = 21 min, plan 2 |
| Blur at 1/1000 s | 10 x 0.001 / 0.02 | 0.5 px, acceptable |
| Slowest safe shutter (1 px) | 0.02 / 10 | 1/500 s |
| Storage | 297 x about 10 MB | about 3 GB [E] |

All results [E]. The drone's own planner will differ by a few photos because of line extension and turn handling.

### 3.4 Mission types

| Type | Geometry | Rules of thumb [M/E] |
|---|---|---|
| **Nadir grid** | Parallel lines, camera straight down (pitch -90 deg) | 75–80% front, 65–70% side for maps. Lines along the long side of the site. Extend one footprint beyond the boundary |
| **Double grid (crosshatch)** | Second grid at 90 deg | Use for 3D models, stockpiles with steep faces, building roofs. Gimbal -60 to -70 deg improves walls and reduces the "doming" error of nadir-only blocks |
| **Oblique (5-direction)** | Nadir + four tilted passes | Gimbal -45 deg. GSD at image centre = H / cos(tilt) x p / f. City and facade texture |
| **Orbit / POI** | Circle radius R at height h around a tower, tank or building | Gimbal pitch = -atan((h - h_target) / R). Photo every 10–15 deg (24–36 photos per ring). Several rings at different heights; overlap between rings 60%+ |
| **Facade** | Vertical lawnmower on a plane parallel to the wall | Stand-off distance D = GSD x f / p (same formula, D instead of H). Column spacing = Fw x (1 - os), row spacing = Fl x (1 - of). Gimbal 0 to -15 deg. Keep a hard minimum distance from the wall |
| **Corridor** (road, pipeline, canal) | Offset lines parallel to a centreline | Number of lines = ceil(width / S) + 1, minimum 2, better 3. Photos = length / B per line. Long thin blocks bend: put GCP pairs across the corridor every 300–500 m or use RTK/PPK |
| **Terrain following** | Altitude changes with ground | See 3.5 |

### 3.5 Terrain following with a DEM

For every waypoint: `alt_rel(i) = DEM(i) - DEM(takeoff) + H`. Sample the DEM along each line every 20–30 m, add waypoints where ground changes by more than about H/10, and limit climb angle to what the drone can fly.

Why it matters, same example with a hill 20 m above take-off and a fixed 75 m altitude [E]: clearance becomes 55 m, GSD 1.47 cm, footprint shrinks to 58 m x 77 m, front overlap drops from 80% to 73% and side overlap from 70% to 59%. A 40 m hill would break the side overlap (36%).

Limits to state in the UI [V 41 for the first, M for the rest]: Copernicus GLO-30 is a **surface** model at 30 m posting with absolute vertical accuracy under 4 m (90%). It does not contain cranes, masts, power lines or new buildings. Its heights are orthometric (EGM2008 [M]), while the drone flies relative to take-off, so only height **differences** from the DEM are used. Terrain following from a 30 m DEM is a planning aid. Obstacles need a site visit and a safety margin.

### 3.6 Shutter, sun and time of day

- Motion blur: `t <= GSD / v` for 1 px. At 2 cm GSD and 10 m/s that is 1/500 s; use 1/800–1/1000 s in practice [E].
- **Rolling shutter**: Mini 4 Pro, Air 3/3S and Mavic 3 Pro have electronic shutters [M]. Each row is exposed at a different time, which distorts geometry at speed. Fly slower (3–5 m/s) or stop at each photo, and enable rolling-shutter correction in the processing software. Mavic 3E, Phantom 4 RTK and P1 have mechanical/global shutters [V 40,16; M for P4 RTK].
- Sun: aim for solar elevation above about 30 deg to keep shadows short, and avoid the hour around local solar noon in summer. At Cairo (30 N) the June noon sun reaches 83 deg and at Riyadh (24.7 N) 89 deg [E]; with an 84 deg lens the sun's reflection ("hotspot") then falls inside the frame over sand, water and metal roofs. Mid-morning or mid-afternoon is better. Overcast light is best for 3D texture.
- T.O X can compute sun elevation and azimuth for the site and date in the browser with the standard NOAA solar-position equations (a few dozen lines; the SunCalc library does the same [M]).
- Wind and heat: desert afternoons bring strong wind and battery heat limits; plan morning flights [M].

### 3.7 Camera table

Sensor and resolution values drive every calculation, so each cell is labelled. "GSD at 100 m" is computed from the row [E].

| Drone / camera | Sensor | Sensor size (mm) | Image (px) | Focal length | Shutter | GSD at 100 m | Max flight time |
|---|---|---|---|---|---|---|---|
| Mavic 3 Enterprise (wide) | 4/3 CMOS, 20 MP [V 40] | 17.3 x 13.0 [M] | 5280 x 3956 [V 40] | 12.29 mm real [M], 24 mm eq., f/2.8–f/11 [V 40] | Mechanical, 8 s–1/2000 s, 0.7 s interval [V 40] | 2.67 cm | 45 min [M] |
| Mavic 3 Pro (Hasselblad main) | 4/3 CMOS, 20 MP [M] | 17.3 x 13.0 [M] | 5280 x 3956 [M] | 12.29 mm real, 24 mm eq. [M] | Electronic [M] | 2.67 cm | 43 min [M] |
| Air 3 (wide) | 1/1.3 in CMOS, 48 MP [M] | about 9.8 x 7.3 [M] | 8064 x 6048 (12 MP: 4032 x 3024) [M] | 24 mm eq., f/1.7 [M] | Electronic [M] | 1.79 cm (48 MP), 3.58 cm (12 MP) | 46 min [M] |
| Air 3S (wide) | 1 in CMOS, 50 MP [V 42] | about 13.1 x 9.8 [M] | 8192 x 6144 [M] | 24 mm eq., f/1.8 [M] | Electronic [M] | 1.76 cm (50 MP) | 45 min [M] |
| Mini 4 Pro | 1/1.3 in CMOS, 48 MP [V 42] | about 9.8 x 7.3 [M] | 8064 x 6048 (12 MP: 4032 x 3024) [M] | 24 mm eq., f/1.7 [M] | Electronic [M] | 1.79 cm (48 MP), 3.58 cm (12 MP) | 34 min [M] |
| Phantom 4 RTK | 1 in CMOS, 20 MP [V 43] | 13.2 x 8.8 [M] | 5472 x 3648 (3:2), 4864 x 3648 (4:3) [V 43] | 8.8 mm real, 24 mm eq. [V 43] | Mechanical [M] | **2.74 cm (DJI's own figure)** [V 43] | about 30 min [M] |
| Matrice 350 RTK + Zenmuse P1 | Full frame, 45 MP [V 16] | 35.9 x 24 [V 16] | 8192 x 5460, 4.4 um pixels [V 16] | 24, 35 or 50 mm [V 16] | Global mechanical [M] | 1.83 / 1.26 / 0.88 cm | 55 min without payload [V 17]; less with P1 |
| Matrice 350 RTK + Zenmuse L2 | Lidar + 4/3 CMOS 20 MP RGB camera [M] | 17.3 x 13.0 [M] | 5280 x 3956 [M] | 24 mm eq. [M] | Mechanical [M] | 2.67 cm (RGB) | as above |

Notes [M/E]: the 48/50 MP modes on quad-Bayer sensors do not resolve true 48 MP detail; plan mapping with the 12 MP figures and treat the higher mode as a bonus. The consumer rows use the 35 mm-equivalent formula because DJI does not publish real focal length for them. Before coding the table, each [M] cell should be replaced with the value from DJI's spec page (those pages are JavaScript-rendered and could not be read with curl today). The Matrice 4E is the current enterprise mapping drone and should be added after reading its spec page.

---

## 4. Accuracy workflow

### 4.1 Control points and check points

- **GCP** (ground control point): surveyed target used *in* the adjustment. **Check point**: surveyed target *not* used in the adjustment, only for testing. Accuracy is reported from check points only [M].
- How many GCPs: ODM's documented minimum is 5, each visible in at least 3 photos [V 34]. Practical for a site up to about 20 ha: 5 to 10 GCPs [M]. With RTK/PPK: 1 to 3 GCPs plus check points; Propeller recommends 1 to 3 AeroPoints up to 60 ha [V 31].
- How many check points: at least 5 for an internal check [M]. ASPRS Positional Accuracy Standards Edition 2 requires **30** for a formally compliant accuracy statement (20 in Edition 1), capped at 120 for large projects, and includes the survey error of the check points in the result [V 20].
- Where: the four corners and the centre first, then the highest and lowest ground, then evenly at about 100–150 m spacing; inside the flown area by at least one photo footprint; on flat, stable, open ground; never all on one line [M]. Corridors: pairs across the strip every 300–500 m [M].
- Targets: 40–60 cm high-contrast squares (size at least 5 to 10 GSD) with a clear centre [M].
- Surveying them: GNSS RTK rover on the project grid, or total station from site control. The control must be at least 2 to 3 times more accurate than the product you promise [M].

T.O X can propose GCP and check-point positions on the map automatically from the area polygon and the DEM, and export them as CSV/KML for the surveyor [E].

### 4.2 RTK, PPK, NTRIP

| Method | What it is | Needs | Typical result |
|---|---|---|---|
| Standalone GNSS in EXIF | Consumer drone position | Nothing | 1–5 m absolute; shape is good, position and height are not [M] |
| GCP-based | Adjust to surveyed targets | Targets + rover | 1–2 x GSD horizontal, 1.5–3 x GSD vertical at check points [M] |
| RTK | Real-time corrections to the drone | Base station (DJI D-RTK) or NTRIP network over mobile data | Camera positions to about 1 cm + 1 ppm horizontal [M]; map 3–5 cm with a few check points |
| PPK | Corrections applied after flight | Base observation file (RINEX) + drone raw GNSS | Same as RTK, no radio link needed |
| NTRIP | Internet protocol that delivers RTK corrections from a CORS network | Account, mount point, SIM | KSA: KSA-CORS, 209 stations, network RTK 1–3 cm, registration via GEOSA [V 18]. Egypt: no public national NTRIP service known to me [M]; private networks and own base are the norm |

A vendor example of what RTK without GCP can do: DJI states 3 cm horizontal and 5 cm vertical for the P1 at 3 cm GSD [V 16]. Even with RTK, keep at least one GCP or check point: a small focal-length error shifts the whole model vertically and only a ground point reveals it [M].

### 4.3 Coordinate systems and geoid

**Egypt** (all [M] unless marked):

| Item | Value |
|---|---|
| Legacy datum | Old Egyptian Datum 1907, Helmert 1906 ellipsoid (EPSG:4229) |
| National grids (Egyptian Transverse Mercator) | Red Belt EPSG:22992 (central meridian 31 E), Blue Belt EPSG:22991 (35 E), Purple Belt EPSG:22993 (27 E), Extended Purple Belt EPSG:22994 |
| GNSS work | WGS 84 / UTM zones 35N, 36N, 37N (EPSG:32635–32637); most new projects use UTM 36N |
| Datum shift | Old Egyptian 1907 to WGS 84 uses project- or region-specific parameters; published sets differ by metres. Always ask the client's survey department for the project parameters |
| Geoid | No official public national geoid file that I know of. Research models exist, for example EGY-HGM2016 [V 44]. Global models in Egypt: about 0.17 m standard deviation for EIGEN-6C4 in one 2023 study, about 0.13 m for a recent tailored model [V 44]. Site levels normally come from project benchmarks, so use a local fit: measure 3+ benchmarks with GNSS and apply the height offset |

**Saudi Arabia**:

| Item | Value |
|---|---|
| National frame | KSA-GRF17 (geographic 3D EPSG:9332, 2D EPSG:9333) [V 18,19] |
| Vertical | KSA-VRF14, realised through the KSA-GEOID17 grid; compound CRS EPSG:9520; transformation EPSG:9355. The geoid grid is **not a public download**, it must be requested [V 19] |
| Authority | GEOSA (General Authority for Survey and Geospatial Information), operator of KSA-CORS [V 18] |
| Projected | UTM zones 36N to 40N on KSA-GRF17 or WGS 84; many projects use a custom TM set by the client [M] |
| Legacy | Ain el Abd 1970 (EPSG:4204) with UTM zones 37N–40N, still found on old drawings [M] |

G.X already has WGS84/UTM/custom TM. Additions needed: the four ETM belts, KSA-GRF17, an EGM2008 geoid lookup for rough orthometric height, and a "local height offset from benchmarks" tool [E].

### 4.4 RMSE and the accuracy report

For n check points, with d = model minus surveyed value:

```
RMSE_x = sqrt( sum(dx^2) / n )     RMSE_y, RMSE_z likewise
RMSE_h = sqrt( RMSE_x^2 + RMSE_y^2 )         (horizontal radial)
RMSE_3D = sqrt( RMSE_x^2 + RMSE_y^2 + RMSE_z^2 )
mean and standard deviation of dz            (a non-zero mean = systematic bias)
95% confidence (older NSSDA wording, normal errors):
    horizontal = 1.7308 * RMSE_h    vertical = 1.96 * RMSE_z          [M]
```

Report contents: project, date, drone, camera, height, GSD, overlaps, number of photos, GNSS mode, coordinate system and geoid, list of GCPs with residuals, list of check points with dx, dy, dz, the RMSE values, mean error, maximum error, a map of the points, and the statement "tested with n check points". If n is under 30, say that it does not meet ASPRS Edition 2's count [V 20]. The same tool computes this for any software's output, because it only needs surveyed coordinates and coordinates picked from the orthomosaic/DSM.

### 4.5 Realistic accuracy by method

| Method | Horizontal | Vertical | Label |
|---|---|---|---|
| Consumer drone, no GCP, no RTK | 1–5 m absolute; 0.1–0.5% relative length | 2–10 m absolute | [M] |
| Consumer drone + 5–10 GCPs, 2 cm GSD | 2–4 cm | 4–6 cm | [M] |
| RTK/PPK drone (Mavic 3E, P4 RTK), no GCP | 3–5 cm | 5–8 cm, bias possible | [M] |
| RTK/PPK + 1–3 GCPs | 2–3 cm | 3–5 cm | [M]; vendor claim about 3 cm [V 31] |
| M350 + P1, RTK | 3 cm | 5 cm | DJI claim at 3 cm GSD [V 16] |
| M350 + L2 lidar | about 5 cm | about 4 cm at 150 m | DJI claim from memory [M]; lidar wins under vegetation |
| Satellite DEM (GLO-30) | 30 m posting | under 4 m (90%) | [V 41] |

Photogrammetry measures the visible surface. It does not see ground under vegetation, inside shadowed trenches, or under water [M].

---

## 5. Satellite and elevation sources

### 5.1 Free data

| Source | Resolution | Licence | Access | Fetch from a static page? |
|---|---|---|---|---|
| Sentinel-2 L2A | 10 m (visible, NIR), 5-day revisit [M] | Free and open (Copernicus) [M] | STAC at `earth-search.aws.element84.com/v1` (collections `sentinel-2-l2a`, `sentinel-2-c1-l2a`) [V 15]; COGs in the `sentinel-cogs` bucket | **Yes.** STAC returns `Access-Control-Allow-Origin: *`, the COG bucket also sends CORS headers [V 15]. Read windows with geotiff.js (MIT [V 35]) |
| Sentinel-2 cloudless mosaic (EOX) | 10 m | 2016 layer CC BY 4.0; later years CC BY-NC-SA 4.0 [M] | WMTS tiles `tiles.maps.eox.at` | **Yes**, CORS allowed [V 15]. Mind the non-commercial clause |
| Landsat 8/9 | 30 m, 15 m panchromatic, 8-day combined revisit [M] | Public domain (USGS) [M] | Same STAC (`landsat-c2-l2`) [V 15]; NASA GIBS WMTS (HLS layers) | STAC yes [V 15]; GIBS tiles yes, `Access-Control-Allow-Origin: *` [V 15]. Landsat buckets are requester-pays [M] |
| Copernicus DEM GLO-30 | 30 m DSM, vertical accuracy under 4 m LE90, relative under 2 m on slopes up to 20% [V 41] | Free licence worldwide; restricted countries released December 2023 [V 41] | AWS bucket `copernicus-dem-30m` (COG, range requests work) [V 15]; STAC `cop-dem-glo-30` [V 15] | **Not directly**: the bucket returned no CORS header today [V 15]. Use the bridge as a proxy, or the two services below |
| Open-Meteo Elevation API | Point heights from Copernicus GLO-90 [M] | Free non-commercial use, attribution [M] | `api.open-meteo.com/v1/elevation?latitude=..&longitude=..` | **Yes**, CORS `*`; returned 14 m for central Cairo today [V 15]. Up to 100 points per call [M] |
| AWS Terrain Tiles (Mapzen "terrarium") | About 30 m globally at zoom 12–13, mixed sources incl. SRTM [M] | Open, attribution list [M] | `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`, height = R*256 + G + B/256 - 32768 [M] | **Yes**, CORS `*` [V 15]. Best option for a whole-area DEM in the browser |
| SRTM 1 arc-second | About 30 m, 60 N to 56 S, year 2000, absolute vertical under 16 m LE90 by specification [M] | Public domain [M] | USGS EarthExplorer, OpenTopography (API key) [M] | Via OpenTopoData public API: **no CORS** [V 15]; via Terrarium tiles yes |
| NASADEM | 30 m, reprocessed SRTM with fewer voids [M] | Public domain [M] | NASA Earthdata (login), Planetary Computer [M] | Needs login or signed URLs; use the bridge |
| ALOS World 3D AW3D30 | 30 m DSM [M] | Free with registration and attribution (JAXA) [M] | JAXA portal, OpenTopography [M] | No (login) |
| ESA WorldCover | 10 m land cover, 2020 and 2021 [M] | CC BY 4.0 [M] | AWS bucket `esa-worldcover` (COG, range requests work) [V 15] | **Not directly**: no CORS header today [V 15]. Bridge proxy |
| Planetary Computer | Many of the above | Per dataset | STAC API | STAC yes, CORS `*` [V 15]; assets need a signed URL [M] |

What 10–30 m imagery is good for: seeing the site and its surroundings, land cover, access, rough terrain for terrain-following, and change over months. It is not good enough to place GCPs, see obstacles or measure anything on a construction site [E]. The flight planner's background should be a high-resolution basemap (the existing G.X web map layer) with the provider's attribution and terms respected; Sentinel-2 is the fallback that is clearly licensed.

### 5.2 Commercial high resolution (prices not found, none read)

| Provider | Best resolution | Notes |
|---|---|---|
| Maxar (WorldView, Legion constellation) | about 30 cm native [M] | Archive and tasking through resellers; the company's imagery business was rebranded Vantor in 2025 [M, verify] |
| Airbus Pleiades Neo | 30 cm [M] | Stereo and tri-stereo tasking can produce 1 m-class DSMs [M]. OneAtlas portal |
| Planet | SkySat about 50 cm, PlanetScope about 3 m daily [M] | Subscription model; good for frequent progress monitoring |

Even 30 cm satellite imagery is 10 to 15 times coarser than a 2–3 cm drone map. Its role is context and pre-mobilisation planning for remote sites [E].

### 5.3 What satellites cannot give

Satellite optical and radar data describe the **surface**. They do not give the depth of buried utilities, rock level, groundwater level, or seabed depth in normal water. InSAR measures surface movement in millimetres, not depth [M]. These need their own surveys:

| Need | Method | Notes [M] |
|---|---|---|
| Buried utilities, voids, rebar, shallow layers | **GPR** (ground-penetrating radar), electromagnetic locators | Depth of a few metres, much less in wet clay or saline soil |
| Rock level, soil layers | Boreholes, trial pits, seismic refraction, electrical resistivity (ERT) | Geotechnical investigation |
| Water depth (sea, canals, lakes) | **Single-beam or multibeam echo sounder** on a boat or USV | Standard hydrographic survey |
| Shallow clear water from the air | **Bathymetric (green) lidar** | To about 1–3 Secchi depths |
| Rough shallow-water depth | Satellite-derived bathymetry | Clear water only, metre-level accuracy, not a design survey |

T.O X should model these as separate imported layers (GPR lines, borehole logs, sounding points) that combine with the drone surface in S.X, not as something the drone or satellite produces.

---

## 6. Regulations to check before flying

This section says who to ask and what is commonly required. It is not legal advice and the rules change. **The owner must confirm with the authority and the client before any flight.**

### 6.1 Egypt

| Topic | What I found | Label |
|---|---|---|
| Law | Law No. 216 of 2017 on the use and trade of remotely piloted aircraft | [V 45] |
| Core rule | Import, manufacture, trade, possession and use are prohibited without a permit from the competent authority, the **Ministry of Defense** | [V 45] |
| Civil aviation | Commercial work is coordinated with the Egyptian Civil Aviation Authority (ECAA); the law refers to the Civil Aviation Law No. 28 of 1981 for conditions | [V 45] |
| Penalties (law-firm summary, not checked against the official gazette) | Imprisonment from 1 to 7 years and/or a fine of EGP 5,000 to 50,000 for use without a permit; much heavier for terrorism-related use | [V 45] |
| Customs | Drones brought in without prior approval are commonly confiscated | [V 45] |
| Aerial survey data | Aerial photography and mapping have traditionally needed clearance from military survey bodies | [M] |
| Practical route | Work through a locally licensed drone survey company that already holds permits, with the project owner's written request. Start weeks ahead | [E] |

I found no current official ECAA application procedure online today.

### 6.2 Saudi Arabia

| Topic | What I found | Label |
|---|---|---|
| Authority | General Authority of Civil Aviation (GACA) | [V 46] |
| Registration | GACAR Part 48; done on the GACA UAS portal `uas.gaca.gov.sa`; security clearance from GACA's Aviation Security Division comes before registration | [V 46] |
| Applicant data | National ID or iqama, drone make and serial number; the serial must be registered to clear customs | [V 46, older press] |
| Fees | Older press: SAR 250 recreational, SAR 500 commercial. May have changed | [V 46, old] |
| Operations | Open, Specific and Certified-type categories. Specific-category work needs a risk assessment, operations manual and a permit to operate (AC 107-01) | [V 46] |
| Pilot | Commercial applicants take training; exact current remote-pilot certificate rules not found today | [V 46] |
| Restricted areas | Airports, military and security sites, royal sites, the holy sites in Makkah and Madinah, and crowds are no-fly or need special approval | [M] |
| Survey data | Aerial survey and geospatial data collection may also need GEOSA approval or a licensed surveying firm | [M] |

### 6.3 Checklist the app can print in the brief [E]

1. Operator permit and drone registration numbers. 2. Pilot certificate. 3. Site owner's written permission. 4. Airspace check for the polygon (airport distance, restricted zones) from the authority's map. 5. Maximum height allowed versus planned height. 6. Insurance. 7. Data handling: who may hold the imagery. 8. Emergency plan and take-off/landing point. T.O X should show the checklist and store the answers, and must not claim to decide whether a flight is legal.

---

## 7. Recommended architecture for T.O X

### 7.1 Flight Planner (inside the G.X tab)

Pure browser, no server. Flow:

1. **Area**: draw or import polygon, corridor centreline, or a tower/facade line on the existing map (G.X draw tools and KML/GeoJSON import already exist).
2. **Aircraft**: pick from the camera table (JSON file, each value carrying its source label) or enter a custom camera.
3. **Quality**: enter GSD *or* height; the other is computed. Overlaps, speed, gimbal pitch, mission type (grid, double grid, oblique, orbit, facade, corridor).
4. **Geometry engine** (pure functions, unit-tested): project the polygon to the local UTM zone, rotate to the chosen line direction (default: longest side; option: minimise number of lines), clip parallel lines to the polygon, extend by one footprint, order them as a serpentine, place shot points every B metres.
5. **Terrain**: sample heights from Terrarium tiles (whole area) or Open-Meteo (points) [V 15], show the profile under each line, switch on terrain following, show minimum clearance and worst-case overlap.
6. **Checks**: blur at chosen shutter, interval against the camera's minimum, flight time and battery count, height against a user-set legal ceiling, sun elevation at the planned time, wind note.
7. **GCP proposal**: suggested GCP and check-point positions.
8. **Exports**: DJI WPML KMZ, Litchi CSV, QGC `.plan`, Mission Planner `.waypoints`, KML, GeoJSON, shot-list CSV, PDF brief (map, tables, checklist from 6.3).

Safety wording on every export: "Generated plan. Open it in the flight app, check heights and obstacles on site, and fly a test first." A generated file is a proposal, and the pilot stays responsible.

### 7.2 Reality Capture hub (through the local bridge)

The static page cannot process photos. The existing local Python bridge talks to a local NodeODM (or NodeODX) on `localhost:3000`. Photos never leave the machine.

| Step | Call [V 10] |
|---|---|
| Health and engine version | `GET /info` |
| Available options | `GET /options` |
| Start a large job | `POST /task/new/init` (options JSON), then `POST /task/new/upload/{uuid}` in batches, then `POST /task/new/commit/{uuid}` |
| Small job | `POST /task/new` with images and options |
| Progress | `GET /task/{uuid}/info`, `GET /task/{uuid}/output` (console lines) |
| Results | `GET /task/{uuid}/download/all.zip` or a single asset such as `orthophoto.tif` |
| Control | `POST /task/cancel`, `/task/restart`, `/task/remove` |

Options to expose first [M for option names except those seen in the arguments list today: `dsm`, `dtm`, `dem-resolution`, `gcp`, `force-gps`, `gps-accuracy`, `feature-quality`, `fast-orthophoto`, `gltf`]: `dsm`, `dtm`, `orthophoto-resolution`, `dem-resolution`, `feature-quality`, `pc-quality`, `gps-accuracy` (set low for RTK), `force-gps`, `3d-tiles`. GCPs go in as `gcp_list.txt`: first line the coordinate system, then `geo_x geo_y geo_z im_x im_y image_name [gcp_name]` per observation [V 34].

Importing results into T.O X:

| Result | Where it goes | Library |
|---|---|---|
| Orthomosaic GeoTIFF | G.X map layer. Bridge cuts tiles or serves the COG with range requests | geotiff.js, MIT [V 35] |
| DSM / DTM GeoTIFF | S.X surface: contours, cut and fill volumes, profiles, slope map, comparison with design surface or the previous survey | geotiff.js + existing S.X tools |
| Point cloud LAZ | 3D viewer. Convert to COPC or Potree format in the bridge | Potree, BSD-2 [M] (repo last pushed 2026-01 [V 35]); or 3D Tiles |
| Mesh OBJ / 3D Tiles | R.X/BIM scene next to the IFC model | 3DTilesRendererJS, Apache-2.0, three.js based [V 35]; CesiumJS, Apache-2.0 [V 35] |
| Gaussian splat (optional, later) | Presentation view only | Spark, MIT [V 35]; GaussianSplats3D, MIT [V 35] |
| Check-point table | RMSE report (section 4.4), PDF | none |

Other engines: because the hub talks REST to a "processing node", a Metashape or RealityScan adapter can be added later as another bridge driver (Python API and CLI respectively [M]) for users who own those licences. Results from DJI Terra, Pix4D or DroneDeploy can be imported as files (GeoTIFF, LAZ, OBJ) with no adapter.

Hardware honesty: 300 photos at 20 MP need roughly 16–32 GB RAM and 30–90 minutes in ODM on a recent desktop [M/E]. The owner's Mac is already overloaded, so the hub must show an estimate, allow a remote node URL (another PC on the LAN), and never start a job without confirmation.

Licence note: ODM, NodeODM and WebODM are AGPL-3.0 [V 7,9]. T.O X only calls them over HTTP as separate programs and does not include their code, which is the normal way to use them. If T.O X ever redistributes or modifies them, the AGPL terms apply; get proper advice then.

### 7.3 Where an AI agent fits

| Agent job | Input | Output | Guard rail |
|---|---|---|---|
| Plan from a sentence | "Map the 12 ha plot at 2 cm with the Mavic 3E" + polygon | Filled planner form, explanation of each choice | Numbers come from the geometry engine, never from the model |
| Plan review | The computed plan + DEM + sun/wind | Warnings: overlap loss on the hill, blur, battery margin, hotspot time | Rule list first, model only words it |
| Processing assistant | Job log from `/task/{uuid}/output` | Plain-language status, likely cause of a failure, suggested option change | Read-only unless the user confirms |
| Accuracy report writer | Check-point table and RMSE values | Report text in Arabic and English | Values copied from the calculation, labelled "tested with n points" |
| Progress comparison | Two DSMs / orthos from different dates | Volume moved, changed areas, link to schedule activities | States the accuracy of each survey beside the difference |
| Regulation reminder | Country + polygon | The checklist from 6.3 | Must say "confirm with the authority"; never says a flight is permitted |

Images can also be screened before processing (blurred, over-exposed, wrong tilt) with simple pixel statistics; no model needed [E].

---

## 8. Ranked list: 15 things to build first (revised after the owner's additions, sections 11 to 15)

Free sources and free methods come first. Paid engines and paid data are later options only.

| # | Build | Why first |
|---|---|---|
| 1 | Camera/drone JSON table with a source label per value | Everything else reads it |
| 2 | GSD and overlap calculator (pure functions + tests, including the worked example in 3.3) | Core maths, small, verifiable |
| 3 | Nadir grid generator on the G.X map: polygon to lines and shot points, direction control | The main visible feature |
| 4 | Counts panel: photos, distance, time, batteries, storage, blur and interval checks | Turns geometry into a decision |
| 5 | Universal importer, first group, no library needed: CSV/TXT points (PENZD variants with a column-mapping dialog), GPX, NMEA, KML, GeoJSON, drone photo EXIF/XMP (section 14) | Lets every later tool work on the user's own data |
| 6 | Exports: KML/GeoJSON, shot-list CSV, then DJI WPML KMZ (area template first, explicit waypoints for Mavic 3E second) | KMZ removes manual planning; needs a real test in Pilot 2 |
| 7 | Free terrain layer (Terrarium tiles, Open-Meteo points; GEOSA open DEM for Saudi sites) + terrain following + clearance and overlap warnings | Prevents the most common bad data set, at zero cost |
| 8 | Grid-levelling and cut/fill tool that works on any surface (ground points, drone DSM, free DEM) and prints an **error band** with every volume (section 13) | The quantity the owner is paid on; honesty about error is the feature |
| 9 | GCP and check-point proposer + check-point RMSE report (works with any software's output) | Proof of accuracy, independent of any paid tool |
| 10 | PDF flight brief with map, tables, GCP list and the regulation checklist | What the pilot and client actually receive |
| 11 | Agent tool registry: every function above exposed as a named tool call with a schema, plus voice commands with read-back confirmation (section 15) | One interface for buttons, the AI agent and voice |
| 12 | Free coordinates workflow: RINEX import, bridge to RTKLIB (demo5) for static and PPK, helper that prepares files for AUSPOS / CSRS-PPP, ITRF-epoch to project-grid conversion (section 12) | Centimetre control with no subscription |
| 13 | Double grid, corridor, orbit and facade missions; QGC `.plan`, Mission Planner `.waypoints` and Litchi CSV exporters | Roads, pipelines, towers, buildings; wider drone support |
| 14 | Reality Capture hub v1: bridge to NodeODM (`/info`, new task, progress, download), then import orthomosaic (GeoTIFF/COG) as a map layer and DSM into S.X | Local, free processing and the loop from flight to quantities |
| 15 | Second importer group with small libraries: Shapefile, DXF, LandXML, LAS/LAZ, KMZ, DJI flight logs; point cloud and mesh viewer next to the IFC model; ETM and KSA-GRF17 grids and geoid tools | Design-versus-as-built in 3D and full file coverage |

After these: sun/hotspot planner, ICESat-2 de-biasing of free DEMs, splat viewer, progress comparison, and only then adapters for paid engines (Metashape, RealityScan) and paid imagery.

---

## 9. What I could not verify

- **DJI spec pages** are JavaScript-rendered; I did not read them directly. Every [M] cell in the camera table (sensor mm, real focal length, flight times, shutter type, image size for Air 3/3S, Mini 4 Pro, Mavic 3 Pro, L2) needs checking on `dji.com` / `enterprise.dji.com` before it is coded.
- **WPML enum values** for P1, L1/L2, Matrice 4 and all consumer drones are not in the public table I read. `mapping2d` / `mapping3d` / `mappingStrip` template names are from memory. No generated KMZ was tested in Pilot 2 or on an aircraft.
- **DJI Fly KMZ replacement** on Mini 4 Pro / Air 3 / Mavic 3 Pro: reported by Litchi and Dronelink guides, not confirmed per model or on current firmware.
- **Litchi CSV** full header after `actionparam1` and the exact spelling of `curvesize(m)`: from memory and forum posts. Export a real file first.
- **Mission Planner `.waypoints`** layout and MAVLink command numbers: from memory.
- **WebODM REST paths** beyond `token-auth` and the endpoint index, and whether **NodeODX** is fully API-compatible with NodeODM. What the "LGT" engine is and how it is licensed.
- **ReCap Photo** current limits (photo count, credits, GCP reporting) and all Autodesk, Bentley, DroneDeploy, Propeller, Trimble, DJI Terra and Pix4D **vendor prices**: not found or not read. Metashape, 3DF Zephyr and Pix4D figures quoted are third-party. The PIX4Dmapper end-of-sale date and the PIX4Dcapture Pro retirement come from third-party pages only.
- **Accuracy numbers** in 4.5 are from memory and experience ranges, apart from the DJI P1 and Propeller vendor claims. No independent test report was read today.
- **Egypt**: ETM EPSG codes, datum parameters, the absence of a public geoid or NTRIP service, and the military survey clearance for aerial data are from memory. Law 216/2017 penalties come from a law-firm summary, not the official gazette. No current ECAA procedure found.
- **Saudi Arabia**: fee amounts are from old press; remote-pilot rules, restricted-area list and any GEOSA survey-permit requirement are unverified. A "KSA-GEOID21" was mentioned in one slide and not reconciled with KSA-GEOID17.
- **Data licences** for EOX s2cloudless, WorldCover, AW3D30, NASADEM, Open-Meteo and Terrarium tiles are from memory; only CORS behaviour and the GLO-30 licence/accuracy were checked today. CORS was tested with curl and an `Origin` header, not from a real browser page, and S3 buckets can change policy.
- **Satellite specifications** for Sentinel-2, Landsat, SRTM, Maxar, Pleiades Neo and Planet are from memory. The Maxar-to-Vantor rename is from memory.
- **Hardware and processing-time** figures are estimates; nothing was processed (the Mac is overloaded and heavy processes were excluded by the task).

---

## 10. Sources (read 2026-11-20)

1. https://help.autodesk.com/cloudhelp/ENU/RealityCapture-New/files/WN_Archive/WN_Archive_2026.html and https://www.autodesk.com/blogs/aec/2025/04/02/whats-new-in-recap-pro-2026/ (via search)
2. https://help.autodesk.com/cloudhelp/ENU/RealityCapture-Release/files/Release_Notes/fixed_issues.html (via search)
3. https://www.realityscan.com/license and https://www.realityscan.com/download (via search)
4. https://www.realityscan.com/news/realityscan-20-new-release-brings-powerful-new-features-to-a-rebranded-realitycapture (via search)
5. https://www.cgchannel.com/2025/06/epic-games-releases-realityscan-2-0-and-realityscan-mobile-1-7/ (via search)
6. https://api.github.com/orgs/WebODM/repos (read directly)
7. https://raw.githubusercontent.com/OpenDroneMap/WebODM/master/package.json (redirects to WebODM/WebODM; version 4.0.2, AGPL-3.0)
8. https://docs.webodm.org/ (read directly; links to https://webodm.org/blog/announcement/ and https://webodm.net/lgt)
9. https://api.github.com/repos/OpenDroneMap/ODM and `/releases/latest` for ODM and NodeODM (read directly)
10. https://raw.githubusercontent.com/OpenDroneMap/NodeODM/master/docs/index.adoc (read directly, API version 2.2.1)
11. https://raw.githubusercontent.com/dji-sdk/Cloud-API-Doc/master/docs/en/60.api-reference/00.dji-wpml/10.overview.md (read directly); https://sdk-forum.dji.net/hc/en-us/articles/8901297724313 (via search)
12. `.../00.dji-wpml/20.template-kml.md` (read directly)
13. `.../00.dji-wpml/40.common-element.md` (read directly)
14. https://raw.githubusercontent.com/mavlink/qgroundcontrol/master/docs/en/qgc-dev-guide/file_formats/plan.md (read directly)
15. curl tests with `Origin` header against: api.open-meteo.com/v1/elevation, s3.amazonaws.com/elevation-tiles-prod, earth-search.aws.element84.com/v1, sentinel-cogs.s3.us-west-2.amazonaws.com, gibs.earthdata.nasa.gov, planetarycomputer.microsoft.com/api/stac/v1, tiles.maps.eox.at, copernicus-dem-30m.s3.amazonaws.com, esa-worldcover.s3.eu-central-1.amazonaws.com, api.opentopodata.org
16. https://enterprise.dji.com/zenmuse-p1/specs (via search)
17. https://enterprise.dji.com/matrice-350-rtk/specs (via search)
18. https://www.geosa.gov.sa/en/About/Pages/Geodesy.aspx and FIG 2023 KSA-CORS presentation (via search)
19. https://epsg.io/9332 , https://epsg.io/9520 , https://epsg.io/9355 (via search)
20. https://www.asprs.org/wp-content/uploads/2024/03/October2023_HLA-Positional_Accuracy_Standards.pdf and https://lidarmag.com/2023/10/06/the-asprs-positional-accuracy-standards-edition-2/ (via search)
21. https://www.fabbaloo.com/2017/09/autodesk-remakes-remake-into-recap-photo (via search)
22. https://www.bentley.com/software/itwin-capture-modeler/ and Bentley Flex data sheet (via search)
23. https://gnss.ae/software/bentley-itwin-capture-modeler-formerly-contextcapture/ (reseller, via search)
24. https://www.agisoft.com/downloads/installer/ (via search)
25. https://motionmedia.com/agisoft-metashape-professional and https://drone-parts-center.com/en/product/agisoft-metashape-professional-node-locked-license/ (resellers, via search)
26. https://support.pix4d.com/hc/pix4dmatic-and-pix4dsurvey-unification (via search)
27. https://www.pix-pro.com/blog/pixpro-vs-pix4d (competitor page, via search)
28. https://support.pix4d.com/hc/faq-pricing-increase-2026 (via search)
29. https://www.heliguy.com/blogs/knowledge-base/what-licences-are-available-for-dji-terra and https://enterprise.dji.com/dji-terra/specs (via search)
30. https://www.heliguy.com/blogs/posts/dji-terra-update-gaussian-splatting/ (via search)
31. https://www.propelleraero.com/propeller-ppk-how-many-aeropoints-does-it-take-to-get-accurate-results and https://propelleraero.com/ppk-drone-mapping (vendor, via search)
32. https://www.cgchannel.com/2026/07/3dflow-releases-3df-zephyr-9-0-with-3d-gaussian-splatting/ and https://www.pix-pro.com/photogrammetry-software-prices-2026 (via search)
33. https://raw.githubusercontent.com/OpenDroneMap/docs/publish/source/outputs.rst (read directly)
34. https://docs.opendronemap.org/gcp/ and https://docs.opendronemap.org/arguments/ (read directly)
35. GitHub API repo metadata read directly: potree/potree, CesiumGS/cesium, NASA-AMMOS/3DTilesRendererJS, colmap/colmap, alicevision/Meshroom, mapillary/OpenSfM, nerfstudio-project/nerfstudio, nerfstudio-project/gsplat, mavlink/qgroundcontrol, ArduPilot/MissionPlanner, geotiffjs/geotiff.js, mkkellogg/GaussianSplats3D, sparkjsdev/spark
36. https://docs.nerf.studio/nerfology/methods/splat.html , https://radiancefields.com/platforms/postshot , https://www.thefuture3d.com/software/postshot/ (via search)
37. https://help.propelleraero.com/hc/en-us/articles/19384503055767 , https://manuals-ugcs.sphengineering.com/docs/route-export-to-the-dji-pilot-2 , https://mavicpilots.com/threads/mavic-3e-and-flight-hub-2-kmz-issue.144837/ (via search)
38. https://forum.flylitchi.com/t/guide-how-to-use-litchi-hub-with-dji-fly/24332 , https://support.dronelink.com/hc/en-us/articles/4410621290387 , https://help.dronedeploy.com/hc/en-us/articles/33102686051095 (via search)
39. https://www.litchiutilities.com.wesbarris.com/docs/litchiCsv.php , https://forum.flylitchi.com/t/error-invalid-rotation/5241 , https://forum.flylitchi.com/t/setting-absolute-altitudes-msl-in-litchi-csv/10731 (via search)
40. https://enterprise.dji.com/mavic-3-enterprise/specs and reseller listings (via search)
41. https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM (via search)
42. https://store.dji.com/content/dji-mini-4-pro-vs-dji-air-3s-vs-dji-mavic-3-pro and https://www.heliguy.com/blogs/posts/dji-mavic-4-pro-vs-dji-air-3s/ (via search)
43. https://ag.dji.com/phantom-4-rtk/specs and https://enterprise.dji.com/phantom-4-rtk/specs (via search)
44. https://nriag.journals.ekb.eg/article_452878.html , https://erjsh.journals.ekb.eg/article_404899.html and related Egyptian geoid papers (via search)
45. https://www.mondaq.com/aviation/1151672/legal-controls-for-the-use-of-drones-in-egypt , https://www.egyptindependent.com/new-law-prohibits-drone-use-without-defense-ministry-approval/ (via search)
46. GACAR Part 48 PDF on gaca.gov.sa, GACA AC 107-01 PDF, https://uas.gaca.gov.sa/uas/faq , https://www.menabytes.com/saudi-drone-permits/ (via search)

"Via search" means the fact came from a search result summary of that page today, not from reading the full page myself; "read directly" means the file or API response was fetched with curl.

---

# Addendum (same day): free-first sources, free coordinates, earthworks, import formats, agent tools

Added at the owner's request. Same labels: [V n] verified today with source n (list in section 16), [M] from memory, [E] my estimate. Paid options are mentioned only as a later option.

## 11. Free data first: imagery, elevation, lidar tracks, open portals

### 11.1 Priority order for T.O X [E]

1. Sources a static page can call directly with no key (Terrarium tiles, Open-Meteo, Element84 STAC for Sentinel-2/Landsat/GLO-30 metadata, NASA GIBS). Already tested in section 5.
2. Free sources that need the local bridge as a proxy or a free account (Copernicus DEM tiles, OpenTopography API key, NASA Earthdata login, GEOSA downloads).
3. Paid imagery or DEMs: future option only, never required by any T.O X feature.

### 11.2 Elevation and lidar, beyond the famous ones

| Source | What it is | Licence | Accuracy | Access | Label |
|---|---|---|---|---|---|
| Copernicus DEM GLO-30 | 30 m DSM | Free, open | Under 4 m LE90 absolute, under 2 m relative on gentle slopes | S3 bucket (bridge proxy), STAC, OpenTopography | [V 15,41] |
| **GEOSA open data (Saudi Arabia)** | National elevation data at **5 m, 10 m, 30 m and 90 m**, topographic map information, reference station coordinates, national standards | Reusable under the licence published with each dataset; GEOSA disclaims liability for errors | Not read | `geosa.gov.sa` Open data page and National Geospatial Platform; a separate licensing portal for other data | [V 47] |
| FABDEM | GLO-30 with forests and buildings removed (bare earth), 60 S to 80 N | **CC BY-NC-SA 4.0: non-commercial.** Commercial use needs a licence from Fathom | Mean absolute error 1.12 m in built-up areas (GLO-30: 1.61 m), 2.88 m in forest (5.15 m) | Bristol data repository, Earth Engine community catalog | [V 48] |
| TanDEM-X 90 m | 90 m DSM from DLR | Free download for **scientific use** | DLR states about 1 m absolute height accuracy; unedited, can contain artefacts; heights are **ellipsoidal (WGS84)**, not orthometric | `tandemx-90m.dlr.de`, registration | [V 49] |
| SRTM 1 arc-second, NASADEM | 30 m, year 2000 | Public domain | SRTM specification 16 m LE90; usually better on flat desert | Terrarium tiles, OpenTopography, Earthdata | [M] |
| ALOS AW3D30 | 30 m DSM | Free with registration and attribution | About 5 m RMSE | JAXA, OpenTopography | [M] |
| ASTER GDEM v3 | 30 m DSM from stereo optical | Free | Noisier than the others, roughly 8 to 12 m RMSE; last choice | Earthdata | [M] |
| **ICESat-2 ATL08** | Satellite laser tracks: ground height points every about 100 m along narrow tracks | Free (NASA) | About 0.2 m on plains, about 2 m in mountains; one global study: RMSE 0.93 m, bias -0.11 m | NASA Earthdata (free login), OpenAltimetry viewer (not checked today) | [V 50] |
| GEDI L2A | Space-station laser footprints (25 m), latitudes within about 51.6 degrees so Egypt and Saudi Arabia are covered [M] | Free (NASA) | Ground RMSE about 4 m in validation studies; weaker than ICESat-2 | Earthdata | [V 50] |
| OpenTopography API | One REST endpoint for COP30, COP90, SRTM, AW3D30, NASADEM and more | Free API key (registration) | As per dataset | `portal.opentopography.org/API/globaldem?demtype=COP30&south=..&north=..&west=..&east=..&outputFormat=GTiff&API_Key=..` | [V 51]: answered 401 "API Key required" with `Access-Control-Allow-Origin: *`, so a static page can call it once the user pastes their own key |

How these combine [E]: ICESat-2 points are sparse but ten times more accurate than a 30 m DEM. Fetch the ICESat-2 ground points that cross the site, compare with the DEM at the same places, and remove the average difference. That turns a DEM with a 1 to 3 m unknown bias into one with a few decimetres of bias, for free. It does not fix the 30 m detail.

For Saudi sites the GEOSA 5 m and 10 m data should be tried before any global DEM. I read only the dataset list, not the files, licence text or accuracy.

**Egypt:** I found no national open geospatial portal with downloadable elevation or base maps today [V 47, negative result]. Global free data plus the project's own survey is the realistic route.

### 11.3 Imagery and context

| Source | Use | Licence / access | Label |
|---|---|---|---|
| Sentinel-2 | 10 m optical, every 5 days | Free and open; Element84 STAC and COGs fetchable from the page | [V 15] |
| Sentinel-1 | C-band radar, about 10 m, works through cloud and at night; surface change, flooding, ground movement by InSAR | Free and open; Alaska Satellite Facility and Copernicus Data Space (free accounts) | [M] |
| Landsat 8/9 | 30 m optical, archive back to the 1980s for site history | Public domain; STAC and NASA GIBS tiles | [V 15] |
| Copernicus Browser / EO Browser | Web viewers to look at any date without downloading | Free account | [M] |
| OpenStreetMap through the Overpass API | Roads, buildings, **power lines, towers, airports, military and restricted land-use tags** around the site: useful as an obstacle and no-fly pre-check | ODbL, attribution; public Overpass servers allow browser calls | [M] |
| Google Open Buildings, Microsoft Global ML Building Footprints, Overture Maps | Building outlines (some with heights) where OSM is thin | Open licences (CC BY 4.0 / ODbL / CDLA) | [M] |
| Global Human Settlement Layer (JRC) | Built-up area and building height rasters | Free and open | [M] |
| OpenAerialMap | Openly licensed drone and aerial imagery that others uploaded; worth one check per site | CC BY mostly | [M] |
| ESA WorldCover | 10 m land cover | CC BY 4.0; bridge proxy | [V 15; licence M] |

### 11.4 Free open-source tools worth wiring to the bridge [M]

GDAL (raster and vector conversion, reprojection), PDAL (point clouds), PROJ (coordinate transforms, same engine family as proj4js), WhiteboxTools (terrain analysis, breach/fill, slope), CloudCompare (cloud-to-cloud and cloud-to-mesh distances, volume between two clouds), QGIS (desk checking), Entwine/untwine (COPC and EPT point-cloud tiling), RTKLIB (section 12). All are free; none needs a subscription.

---

## 12. Best coordinates without paid services

### 12.1 The honest picture

A precise **absolute** position (where am I on the Earth) and a position **on the project grid** (what the drawings use) are different things. Free services give the first, in a global frame (ITRF) at today's date. The project grid is fixed to the ground. The Arabian plate moves about 4 cm a year and the African (Nubian) plate about 2.5 cm a year relative to ITRF [M], so ITRF coordinates drift away from a national frame by decimetres over a decade. Therefore:

- If the project has control points (benchmarks, client stations): occupy at least 3 of them, and fit the free result to them (shift, rotation, scale, height offset). This is what makes the work match the drawings, and it costs nothing.
- If the project has no control at all: a free PPP position of one base point gives a sound, repeatable origin. Record the frame and epoch in the report.

### 12.2 Free post-processing services

| Service | Operator | Accepts | Needs | Output | Realistic accuracy | Label |
|---|---|---|---|---|---|---|
| **AUSPOS** | Geoscience Australia | Data from anywhere | Static, **dual-frequency GPS (L1+L2)** RINEX, at least 1 h, 2 h+ recommended. Decimated to 30 s. Files kept 7 days. Free, no cost | ITRF (and Australian datums), emailed report. Network (relative) solution to IGS stations, not PPP | mm to cm level reported for good sessions. My expectation: 2 to 4 cm with 2 h, 1 to 2 cm with 6 h+. Fewer IGS stations near Egypt means longer sessions help | [V 52]; expectation [M] |
| **CSRS-PPP** | Natural Resources Canada | Global PPP service | Free account. Static **or kinematic**, RINEX. Historically single or dual frequency. Since 14 May 2025: Galileo and PPP with ambiguity resolution | ITRF in IGS20 (ITRF2020 realisation) or NAD83(CSRS) | 1 to 2 cm with 24 h static (older official figure); PPP-AR "often down to the centimetre"; kinematic cm to a few dm. Single-frequency data: decimetres to a metre [M] | [V 53] |
| **OPUS** | US NGS | Worldwide data accepted; outside the US only ITRF coordinates are returned | Static dual-frequency, 15 min to 48 h | ITRF at the observation epoch | Depends on nearby reference stations, which are sparse around Egypt; treat as a second opinion | [V 54]; last remark [E] |
| Trimble CenterPoint RTX post-processing | Trimble | Static data from anywhere, Trimble or RINEX files | Dual-frequency, 1 h or more | ITRF2014 at measurement epoch (per Trimble blog) | Real-time RTX is specified at 2 cm H / 3 cm V; no explicit figure found for the web service. Described as free in a 2013 source; **current free status not confirmed** | [V 55] |

Practical rule [E]: submit the same file to AUSPOS and CSRS-PPP. If the two agree within 2 to 3 cm, trust it. If they do not, observe longer.

### 12.3 Open-source processing: RTKLIB

| Item | Fact | Label |
|---|---|---|
| Original RTKLIB (T. Takasu) | Repository last pushed 2024-05; effectively frozen | [V 56] |
| **demo5 fork (rtklibexplorer)** | Active: release v2.5.1 on 2026-06-22, pushed 2026-11-09. Tuned for low-cost receivers | [V 56] |
| Licence | BSD-2-Clause style with extra clauses | [M] |
| Tools the bridge would call | `convbin` (receiver raw or u-blox UBX to RINEX), `rnx2rtkp` (static, kinematic and PPK solutions from rover + base RINEX + navigation file), `pos2kml` | [M] |
| Inputs | Rover RINEX, base RINEX, broadcast or precise orbits, base coordinates | [M] |
| Output | `.pos` text file: time, lat, lon, height, Q flag (1 = fixed, 2 = float, 5 = single), standard deviations | [M] |

T.O X's job is small: accept the files (section 14), pass them to the bridge, show the percentage of fixed solutions and the scatter, and refuse to call a float solution "centimetre" [E].

### 12.4 Hardware classes and what each realistically gives

| Equipment | Method | Realistic accuracy | Needs | Label |
|---|---|---|---|---|
| Phone GPS (GPX / NMEA track) | Standalone | 3 to 10 m horizontal, worse vertical | Nothing | [M] |
| Android phone with raw GNSS, logged with Google **GnssLogger** (tools are Apache-2.0) | PPK against a base, or PPP | Sub-metre is the expectation and is hard to reach consistently; decimetres in the best case, open sky, static, dual-frequency phone | Raw log converted to RINEX, base data | [V 57]; best case [M] |
| **Low-cost dual-frequency receiver (u-blox ZED-F9P class) + survey antenna** | Static 1 h+ against own base or PPP | A few centimetres horizontal reported in 1 h static with 80% fixed ambiguities; comparable to survey-grade in static, weaker under multipath with a poor antenna | Good antenna on a tripod, clear sky, RINEX logging. Price not found | [V 57] |
| Two such receivers (base + rover) | Short-baseline RTK or PPK | 1 to 2 cm + 1 ppm horizontal, 2 to 4 cm vertical on baselines under about 10 km | Base on a point positioned by 12.2 or on project control | [M] |
| RTK drone (Mavic 3E with RTK module, Phantom 4 RTK, M350) + own base | **PPK of photo positions** | Photo centres to 2 to 5 cm, map 3 to 5 cm with one check/control point | Drone raw GNSS file and event marks (DJI writes observation and `.MRK` timestamp files next to the photos [M]), base RINEX within about 20 km, lever-arm correction | [M] |
| Consumer drone without raw GNSS (Mini 4 Pro, Air 3/3S) | PPK is **not possible** | Metres absolute | Use ground control points surveyed with the receivers above | [M] |
| Automatic level + staff | Levelling from a benchmark | 2 to 5 mm per set-up; the best free height | A benchmark and two people | [M] |

Recommended zero-subscription workflow [E]:
1. Set one low-cost dual-frequency receiver as a base on a stable mark for 2 to 6 h. Process with AUSPOS and CSRS-PPP. That is the site origin.
2. Occupy the project's existing control points for 15 to 30 min each as rover, process with RTKLIB against the base. Fit to the project grid.
3. Survey GCPs and check points the same way (5 to 10 min each, fixed solutions only).
4. Fly. If the drone logs raw GNSS, run PPK against the same base. If not, rely on the GCPs.
5. Heights: tie to a project benchmark by levelling or by GNSS on the benchmark, and apply the offset. Do not take orthometric heights from a global geoid alone when a benchmark exists.

### 12.5 Free reference stations and NTRIP near Egypt and Saudi Arabia

| Item | Fact | Label |
|---|---|---|
| IGS stations in Saudi Arabia | Three stations joined in January 2026, operated with GEOSA: Bisha (AS0200SAU), Ar'Ar (NB0100SAU), An Na'ayim (QS0700SAU). RINEX at CDDIS and IGN | [V 58] |
| IGS data access | CDDIS (NASA Earthdata, free login), BKG and IGN mirrors; 30 s daily and hourly files, Hatanaka-compressed RINEX 2 and 3 | [V 58] |
| Egypt | A paper states that lack of IGS coverage is a major obstacle in Egypt. The Egyptian Survey Authority runs a CORS network over the Nile valley and delta; I found no open access to it | [V 58] |
| KSA-CORS | 209 stations, registration through GEOSA; reference station coordinates are in GEOSA open data. Whether the correction stream is free was not found | [V 18,47] |
| RTK2go | Free community NTRIP caster, site reachable today. Whether any mount point exists near a given site in Egypt or Saudi Arabia was not checked; coverage depends on volunteers | [V 56 reachability only] |
| Distance rule | Kinematic PPK/RTK needs a base within roughly 10 to 30 km. IGS stations hundreds of km away are for **static** positioning of your own base (what AUSPOS does), not for flying against | [M] |

---

## 13. Earthworks from free data: how good are the volumes

### 13.1 The error model

Volume between two surfaces over area A: `V = A x mean(dh)`. The error has two parts [E]:

```
systematic part  = A x b                 b = height bias between the two surfaces (does not average out)
random part      = A x s / sqrt(n)       s = random height error per independent sample, n = number of them
relative error   = (systematic + random) / V = roughly  b / mean depth
```

The bias term dominates. A 3 cm bias over 1 hectare is 300 m3 whatever the point density. So the relative error is about "bias divided by average cut or fill depth": shallow earthworks are the hardest to measure.

### 13.2 Three data sources compared

Example site: 1 ha (100 m x 100 m), average cut 1.0 m, true volume 10,000 m3. All figures [E] from the stated accuracies; none measured.

| Source | Height error that matters | Volume error on the example | Verdict |
|---|---|---|---|
| Free 30 m DEM (GLO-30, SRTM) | Relative accuracy up to 2 m, absolute up to 4 m (90%) [V 41]; only about 11 cells cover 1 ha; the DEM is years old and is a surface model (includes buildings and trees) | 1 to 2 m x 10,000 m2 = **10,000 to 20,000 m3, that is 100 to 200%** | Not usable for site quantities. It cannot see a 1 m cut at all |
| Same DEM on a large, deep job (100 ha, average 5 m) | About 1 m correlated error after ICESat-2 de-biasing (11.2) | 1,000,000 m2 x 1 m = 1,000,000 m3 on 5,000,000 m3 = **about 20%**, 30 to 50% without de-biasing | Pre-feasibility and mass-haul sketches only. Never for payment |
| GEOSA 5 m or 10 m DEM (Saudi sites) | Not read; likely sub-metre to 1 to 2 m | Probably tens of percent on the 1 ha example | Better planning surface; still check against site levels |
| Drone DSM, 2 cm GSD, GCPs or PPK, checked | Random 3 to 6 cm per point averages away over millions of points; remaining bias 2 to 3 cm | 200 to 300 m3 = **2 to 3%**; two surveys compared: about 3 to 4% | Suitable for interim quantities when check points pass. Vegetation, water and deep shadow must be masked or surveyed on foot |
| Drone DSM without GCP or RTK | Bias of metres, and possible bowl-shaped distortion | Can exceed 100% against a design surface. Volumes between two **co-registered** flights, or of a stockpile above a base picked in the same model, can still be within about 5% | Only for relative volumes inside one model |
| Ground grid survey, 10 m grid, RTK or level | 1 to 2 cm per point; the error comes from ground shape between points | **1 to 3%** on smooth graded ground, 5 to 10% on rough or stockpiled ground | The traditional contract method. Add breaklines at toes and crests |
| Ground grid, 20 m grid | Same per point | 3 to 8% smooth, more when rough | Acceptable for bulk estimates |

Published comparisons that I remember put drone stockpile volumes within about 1 to 3% of total-station or laser-scanner volumes when control is good [M]. I read no such report today.

What T.O X must do with this: every volume result carries its **error band** computed from the declared vertical accuracy of each surface (`+/- A x sqrt(b1^2 + b2^2)`), and a plain sentence such as "30 m DEM: indicative only, not for payment".

### 13.3 Approximating a grid levelling survey

A grid levelling sheet is a table of levels at regular nodes. T.O X can produce the same deliverable from any surface [E]:

1. Define the grid on the project coordinate system: origin, bearing, spacing (5, 10 or 20 m), chainage and offset labels.
2. Fill the node levels from the best source available:
   - **Level and staff** readings typed or dictated into a booking sheet. Height of instrument method: `HI = benchmark level + backsight`, `reduced level = HI - foresight`. Check: sum of backsights minus sum of foresights equals last level minus first level.
   - Low-cost GNSS rover points (section 12), snapped to the nearest node or interpolated.
   - Drone DSM sampled at each node, using the median of a 0.5 m window to reject noise, with vegetation and machines masked.
   - Free DEM, bilinear interpolation, clearly labelled indicative.
3. Compute cut and fill against the design level at each node.
4. Volumes: grid method (average of the four corner depths x cell area, split cells where cut meets fill), and TIN prism method as a cross-check; for roads and trenches, end-area between cross-sections. Report the difference between methods as part of the error band.
5. Output: levelling sheet (node, easting, northing, existing level, design level, cut/fill), a cut/fill colour map, totals, and the accuracy statement.

A sparse set of accurate points (20 to 30 levelled or GNSS points) can also be used to **calibrate** a drone DSM or a free DEM: fit and remove a plane of differences, then report the remaining residuals as the surface's accuracy.

---

## 14. Import formats T.O X should read

Sizes are the npm **unpacked** package size read from the registry today [V 59]; the minified code actually shipped is several times smaller. "No library" means string/`DOMParser`/`DataView` code of a few dozen lines.

| Format | What it carries | Browser without a library? | Small open-source library (licence, unpacked size) | Notes |
|---|---|---|---|---|
| **CSV / TXT points** (PENZD, PNEZD, ENZ, with or without header, comma/tab/space) | Survey points | **Yes.** Split lines; a column-mapping dialog with a preview handles all variants | Optional PapaParse (MIT, 274 KB) for quoted fields | Detect swapped E/N by checking against the project extent |
| **GPX** | Tracks, waypoints, elevations, time | **Yes**, XML via `DOMParser` | `@tmcw/togeojson` (BSD-2, 368 KB) also converts KML and TCX | Phone accuracy: metres |
| **NMEA 0183 logs** | `$GPGGA`/`$GNGGA` positions with fix quality (4 = RTK fixed, 5 = float), `$GNRMC`, `$GNGST` accuracy | **Yes**, plain text, checksum is an XOR | None needed | Keep the fix-quality field; reject non-fixed points for control |
| **RINEX** observation and navigation (2.x, 3.x, Hatanaka `.crx`) | Raw GNSS for post-processing | Header only (**yes**, plain text): marker, antenna, start/end time, interval, approximate position. Full processing: no | Hand to **RTKLIB through the bridge** (section 12.3) | Show a pre-flight check: duration, interval, dual-frequency present or not |
| **KML / KMZ** | Areas, lines, points | KML **yes** (XML). KMZ is a ZIP | fflate (MIT, 797 KB unpacked, a few KB used) or JSZip (MIT or GPL-3, 693 KB) to unzip | G.X already reads KML |
| **GeoJSON** | Vector features | **Yes**, `JSON.parse` | None | Assume WGS84 unless a `crs` member says otherwise |
| **Shapefile** (.shp + .dbf + .prj, zipped) | GIS vectors with attributes | Possible with `DataView`, but DBF encodings and PRJ make a library worthwhile | **shpjs** (MIT, 677 KB), reads zipped shapefiles to GeoJSON and uses proj4 for the PRJ | Arabic attribute text needs the right code page (`.cpg`) |
| **DXF** | CAD lines, polylines, points, text, 3D faces | Text format, but many entity types | **dxf-parser** (MIT, 193 KB) or `dxf` (MIT, 535 KB) | T.O X may already have a DXF reader in its CAD tab; reuse it. DWG is not readable in a browser without a converter |
| **LandXML** | Surfaces (TIN `Pnts`/`Faces`), alignments, profiles, points | **Yes**, XML via `DOMParser` | None needed | Watch northing/easting order (`P` elements are N E Z) |
| **LAS / LAZ / COPC** | Point clouds | LAS 1.2 to 1.4: **yes** with `DataView` (fixed header + records). LAZ: no, compressed | **laz-perf** (Apache-2.0, 1.2 MB, WebAssembly) for LAZ; **copc** (MIT, 78 KB) for cloud-optimised COPC; `@loaders.gl/las` (MIT, 6.4 MB unpacked) as an all-in-one | Read the CRS from the VLRs; large files should be converted to COPC by the bridge |
| **GeoTIFF / COG** | Orthomosaics, DSM, DEM | No, practically | **geotiff.js** (MIT, 3.8 MB unpacked), reads windows by HTTP range request | Read GeoKeys for CRS and the vertical datum, which is often missing |
| **Photo EXIF + XMP** | GPS position, time, camera model, focal length; DJI XMP: `drone-dji:GpsLatitude`, `AbsoluteAltitude`, `RelativeAltitude`, `GimbalPitchDegree`/`GimbalYawDegree`/`GimbalRollDegree`, `FlightYawDegree`, `RtkFlag` (50 = fixed), `RtkStdLat/Lon/Hgt` | **Yes for XMP**: it is plain XML text inside the JPEG, found by searching the first 64 to 128 KB for `<x:xmpmeta`. EXIF binary tags need a TIFF-IFD parser | **exifr** (MIT, 1.3 MB unpacked, modular; reads only the file head) | Use to draw the actual flown positions over the plan, compute real overlap, and count RTK-fixed photos. XMP tag names are from memory [M] |
| **DJI `.MRK` timestamp files** | Photo event times and antenna-to-camera offsets for PPK | **Yes**, plain text | None | Format from memory [M] |
| **DJI flight logs** | Consumer DJI Fly `.txt` logs are binary and encrypted in recent versions; enterprise `.DAT` are proprietary | **No** | Community parsers exist (for example the open-source `dji-log-parser` project [M]); recent logs need a key fetched from DJI | Low priority. Photo EXIF/XMP gives the positions that matter; Pilot 2 can export the flown route |
| QGC `.plan`, `.waypoints`, Litchi CSV, WPML KMZ | Missions made elsewhere | **Yes** (JSON, text, XML in ZIP) | fflate for the KMZ | Import lets the planner review and re-time someone else's mission |

Shared helper: **proj4js** (MIT, 824 KB unpacked [V 59]) for every reprojection; G.X presumably already has it or equivalent code. Rule for all importers [E]: show a preview with detected coordinate system, units, point count and extent, and make the user confirm the coordinate system before anything is added to the project. A wrong CRS is the most common and most expensive import error.

---

## 15. AI agent and voice commands: tool calls to expose

### 15.1 Principles [E]

- The agent never calculates. It chooses a tool and fills its arguments; the same pure functions that the buttons call return the numbers.
- Every tool returns: `ok`, the result, units, coordinate system, the accuracy or error band, and warnings. The agent must repeat accuracy and warnings to the user.
- Read-only tools run at once. Tools that change the project, write a file or start a long job show a confirmation card first.
- Voice is only another way to type the request. The app reads back the interpreted command with its numbers before running anything that changes data ("Plan a 2 centimetre grid for the Mavic 3 Enterprise over area North Yard, 80 and 70 overlap. Confirm?").
- No tool may state that a flight is permitted. `regulation_checklist` returns questions, not answers.

### 15.2 Tool list

| Tool | Arguments | Returns | Confirm? |
|---|---|---|---|
| `list_drones` / `get_camera` | drone id | Sensor, focal length, image size, shutter type, each with its source label | No |
| `calc_gsd` | camera, height **or** gsd | Height, GSD, footprint | No |
| `plan_mission` | area id or geometry, drone, mission type (`grid`, `double_grid`, `oblique`, `orbit`, `facade`, `corridor`), gsd or height, front/side overlap, speed, direction, terrain follow on/off | Lines, shot points, counts, time, batteries, blur and overlap warnings | No (it only draws a proposal) |
| `check_mission` | mission id, date and time | Sun elevation, hotspot risk, clearance over terrain, worst overlap, height against the user's legal ceiling | No |
| `export_mission` | mission id, format (`dji_wpml_kmz`, `litchi_csv`, `qgc_plan`, `mp_waypoints`, `kml`, `shots_csv`, `pdf_brief`) | File | Yes |
| `propose_control` | mission or area id, number of GCPs and check points | Point list + CSV for the surveyor | No |
| `regulation_checklist` | country, area | Checklist and who to ask; never a verdict | No |
| `import_file` | file, optional format hint, optional CRS | Preview: type, CRS guess, extent, counts; then layer id | Yes, after the preview |
| `get_elevation` | points or area, source (`terrarium`, `open_meteo`, `opentopography`, `project_surface`) | Heights + source accuracy | No |
| `convert_coordinates` | points, from CRS, to CRS, optional epoch, optional height mode (ellipsoidal/orthometric, geoid or local offset) | Converted points + transformation used | No |
| `fit_to_control` | measured points, known points | Shift/rotation/scale/height offset and residuals | Yes, before applying |
| `make_surface` | point layer or raster, method (TIN / grid), breaklines | Surface id, point count, extent | Yes |
| `make_contours` | surface id, interval, smoothing | Contour layer | No |
| `grid_levelling` | surface id, origin, bearing, spacing, design surface or level | Levelling sheet with cut/fill per node | No |
| `compute_volumes` | existing surface, design or second surface, boundary, method (`grid`, `tin`, `end_area`) | Cut, fill, net, **error band**, method difference | No |
| `sample_profile` | line, surfaces | Long section / cross-sections | No |
| `gnss_precheck` | RINEX or NMEA file | Duration, interval, frequencies, fix statistics, suitability for AUSPOS / CSRS-PPP / PPK | No |
| `gnss_process` | rover file, base file, base coordinates, mode (`static`, `kinematic`, `ppk_photos`) | Solution file, percentage fixed, standard deviations (through the bridge and RTKLIB) | Yes |
| `photos_inspect` | photo folder | Count, positions, RTK-fixed count, measured overlap, blurred or exposed-badly list | No |
| `run_processing` | photo set, engine node URL, options preset (`fast_ortho`, `survey`, `3d_model`), GCP file | Task id, time estimate | **Yes**, with the estimate and machine load shown |
| `processing_status` / `cancel_processing` | task id | Progress, log summary / stopped | Status no, cancel yes |
| `import_results` | task id or files | Orthomosaic layer, DSM/DTM surface, point cloud, mesh | Yes |
| `report_accuracy` | check points (surveyed), surface or orthomosaic | dx, dy, dz table, RMSE x/y/z/horizontal/3D, mean, max, count, statement | No |
| `compare_surveys` | two surface ids | Difference map, volume moved, combined error band | No |
| `make_report` | sections to include, language (Arabic / English) | PDF | Yes |

### 15.3 Voice command examples (Arabic and English map to the same calls)

| Said | Tool calls |
|---|---|
| "خطّط طيران للموقع بدقة ٢ سم بالمافيك ٣" | `plan_mission(area=current, drone=mavic3e, gsd=0.02)` then `check_mission` |
| "Export it for DJI Pilot" | `export_mission(format=dji_wpml_kmz)` after read-back |
| "استورد ملف النقط ده" | `import_file` then the CRS confirmation dialog |
| "Make half-metre contours" | `make_contours(surface=current, interval=0.5)` |
| "احسب الحفر والردم لمنسوب ١٢٫٥" | `compute_volumes(existing=current, design=level 12.5)` and it speaks the error band |
| "Convert these to the Red Belt" | `convert_coordinates(to=EPSG:22992)` |
| "Is this RINEX good enough?" | `gnss_precheck` |
| "Start processing the photos" | `run_processing` only after showing time estimate and asking |
| "طلّع تقرير الدقة" | `report_accuracy` then `make_report` |

Numbers spoken in Arabic (Eastern digits, "نص متر", "اتنين سنتي") need a small normaliser before the call, and the read-back must show the parsed value in digits [E].

---

## 16. Addendum sources and what was not verified

Sources (read 2026-11-20, all via search summary unless marked "direct"):

47. https://geosa.gov.sa/en/About/Pages/Open_data.aspx , https://geosa.gov.sa/en , https://geo-licensing.geosa.gov.sa/ ; the same search returned nothing for an Egyptian portal
48. https://gee-community-catalog.org/projects/fabdem/ , https://www.fathom.global/product/global-terrain-data-fabdem/ , https://research-information.bris.ac.uk/en/publications/a-30m-global-map-of-elevation-with-forests-and-buildings-removed/
49. https://geoservice.dlr.de/web/dataguide/tdm90/ , https://tandemx-90m.dlr.de , DLR news of 2018-10-08
50. https://pmc.ncbi.nlm.nih.gov/articles/PMC11965696/ , ISPRS Archives XLVIII-1-W2-2023-1817, Pronk et al. 2024 (as quoted in results)
51. https://portal.opentopography.org/API/globaldem (direct curl: HTTP 401, CORS `*`, "API Key required")
52. https://www.ga.gov.au/applications/auspos-online-gpsd-processing-service , https://docs.emlid.com/reachrs2/tutorials/post-processing-workflow/auspos-workflow , NSW Spatial Services AUSPOS guides
53. https://webapp.csrs-scrs.nrcan-rncan.gc.ca/geod/tools-outils/ppp-info.php , https://www.gpsworld.com/canadas-csrs-ppp-service-sets-a-new-standard-for-high-precision-gnss/
54. https://geodesy.noaa.gov/OPUS/about.jsp , NGS International OPUS-GNSS policy (2013)
55. https://help.fieldsystems.trimble.com/tbc/12388.htm , https://geospatial.trimble.com/en/products/correction-services/trimble-centerpoint-rtx , https://www.gpsworld.com/anatomy-of-a-centimeter-level-precise-point-positioning-service/
56. GitHub API (direct): tomojitakasu/RTKLIB, rtklibexplorer/RTKLIB and its latest release, google/gps-measurement-tools; http://rtk2go.com/ returned HTTP 200 (direct)
57. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9144685/ , https://pmc.ncbi.nlm.nih.gov/articles/PMC8001986 , ISPRS Archives XLII-2-W17-309-2019
58. https://lists.igs.org/pipermail/igsmail/2026/008655.html , https://cddis.nasa.gov/Data_and_Derived_Products/GNSS/GNSS_data_holdings.html , https://igs.bkg.bund.de/holdings , Qassim University journal paper on GNSS in Egypt
59. https://registry.npmjs.org/<package>/latest (direct) for shpjs 6.2.0, dxf-parser 1.1.2, @tmcw/togeojson 7.1.4, laz-perf 0.0.7, copc 0.0.9, @loaders.gl/las 4.5.5, geotiff 3.0.5, exifr 7.1.3, fflate 0.8.3, proj4 2.23.0, papaparse 5.7.1, jszip 3.10.2, dxf 5.3.1

Not verified in this addendum:

- GEOSA open elevation data: only the dataset list was seen. Licence text, accuracy, format, coverage and whether download needs an account are unread.
- No Egyptian open portal was found; that is one search, not proof that none exists.
- Trimble RTX post-processing: current free status. AUSPOS and CSRS-PPP accuracy for short sessions in this region: my expectation, not a test. Single-frequency acceptance by CSRS-PPP today.
- Plate-motion rates, the KSA-GRF17 reference epoch, RTKLIB licence and command names, DJI raw GNSS and `.MRK` file details, DJI XMP tag names: from memory.
- RTK2go, KSA-CORS and Egyptian CORS: no mount point list, access terms or costs were read.
- All volume error figures in section 13 are computed from stated vertical accuracies. Nothing was measured, and no published drone-versus-ground volume comparison was read today.
- Library sizes are unpacked npm sizes, not bundle sizes. No library was loaded or tested, and T.O X's existing parsers were not inspected (no app source was read).
- ASTER, AW3D30, SRTM, Sentinel-1 figures, OpenStreetMap/Overpass CORS behaviour, building-footprint datasets and OpenAerialMap: from memory. OpenAltimetry access was not checked.
- Low-cost receiver prices: not found.
