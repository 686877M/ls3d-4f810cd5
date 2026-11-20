# Tools ecosystem for a construction / consulting / development office (T.O X scope widening) - 2026-11-20

## ملخص بالعربي (6 سطور)
1. الملف ده كتالوج لكل اللي المكتب بيستخدمه غير الأدوات اللي بنقلدها (Revit, AutoCAD, Civil 3D, Navisworks, P6, Plant 3D): تصميم، BIM، حصر وتسعير، جدولة، توثيق، موقع، مسح ضوئي، GIS، تحليل إنشائي، رندر، إبداعي، PDF/OCR، تحويلات، طباعة، خطوط، أيقونات، مجتمعات، ومهارات.
2. لكل أداة: بتعمل إيه، الرخصة (مجاني / مدفوع / مفتوح)، تشتغل في المتصفح ولا لينك بس، والأولوية (must / should / nice) لـ T.O X وسبب في سطر.
3. أهم قرار تقني: التحويلات الواقعية جوه المتصفح = pdf.js, pdf-lib, Tesseract.js, ffmpeg.wasm, web-ifc, potrace. أما DWG<->PDF الحقيقي (قراءة DWG) فمحتاج مكتبة GPL (LibreDWG) أو ODA (رخصة تجارية) يعني مساعد محلي أو لينك لخدمة، مش جوه الصفحة بدون ما نلتزم برخصة.
4. الرخص اللي اتأكدت منها من GitHub API مكتوبة VERIFIED مع الرابط؛ الباقي FROM MEMORY (ماتأكدش منه الجلسة دي) والأسعار كلها FROM MEMORY ومش متكتب منها رقم.
5. أدوات مغلقة (Photoshop, Premiere, ETABS, Tekla...) = لينك خارجي وبس + بديل مفتوح؛ T.O X ماينسخش كود ولا شكل أي منتج.
6. أولويات "must" قليلة عمداً: PDF/OCR/تحويل صور وخطوط وأيقونات وطباعة، لأنها بتخدم كل التابات الحالية من غير سيرفر.

## Evidence labels and ground rules
- **VERIFIED** = I read the licence field from the GitHub API on 2026-11-20 (URL in the cell, pattern `https://api.github.com/repos/<owner>/<repo>`), or a URL listed in BIM_ECOSYSTEM.md that was marked VERIFIED there.
- **MEMORY** = from my own knowledge, no URL read this session. Re-check before relying on it. Prices are never stated (MEMORY, change often).
- GitHub API returned `NOASSERTION` (a custom or multi-licence file) for: OpenSees, LibreCAD, Blender, GIMP, LibreCAD, Stirling-PDF, PROJ, GRASS, MapLibre GL JS, Lucide, gpuweb. These are marked "custom/multi - read LICENSE" and never summarised from memory as one licence.
- Browser column: **IN** = can run inside a static page (JS/WASM); **LINK** = link out only; **HELPER** = needs a local helper (small desktop app / localhost agent / CLI, see AGENT_CONTROL.md); **API** = remote HTTPS API from the page (CORS and key not tested unless stated).
- Priority: **must** = do in the next build rounds; **should** = after the must items; **nice** = backlog / link-only.
- T.O X rules that shape every row: single HTML page, no server, no vendor code or artwork copied, closed tools are linked not bundled, no scraping against terms.

---

## 1. Design and drawing (beyond AutoCAD / Revit)
| Tool | What it does | Licence | Browser | Priority / why |
|---|---|---|---|---|
| LibreCAD | 2D DXF drafting | NOASSERTION (custom/multi, https://api.github.com/repos/LibreCAD/LibreCAD); GPL-2 per project, MEMORY | LINK / HELPER | nice: free 2D alternative to link when a user has no AutoCAD |
| QCAD | 2D CAD, DXF/DWG via paid add-on | Community edition GPL-3, pro add-ons paid (MEMORY) | LINK | nice: link only |
| BricsCAD, ZWCAD, GstarCAD, DraftSight | DWG-compatible paid CAD | Paid (MEMORY) | LINK | should: office in Egypt often runs ZWCAD/BricsCAD; list in a "DWG-compatible CAD" link card |
| FreeCAD | Parametric 3D, Arch/BIM workbench, FEM | LGPL-2.1 (VERIFIED: https://api.github.com/repos/FreeCAD/FreeCAD) | HELPER | should: scriptable headless target for the agent bridge |
| SketchUp | Fast 3D modelling | Free web tier + paid (MEMORY) | LINK | should: already a tab in T.O X (sketchup_tab_spec.md) |
| ArchiCAD, Vectorworks, Rhino+Grasshopper, Dynamo | BIM / parametric design | Paid (MEMORY); Dynamo open source (MEMORY) | LINK | nice: link card + file-format notes (IFC, 3DM) |
| Autodesk Viewer / DWG TrueView | Free viewers for DWG/RVT/NWD | Free as a service / free download, proprietary terms (MEMORY) | LINK | must: the honest answer to "open a DWG" until a WASM reader is licensed |
| Onshape, Fusion | Cloud CAD | Free hobby tiers + paid (MEMORY) | LINK | nice: mechanical/MEP prefab |

## 2. BIM and coordination (see BIM_ECOSYSTEM.md for APS, ISO 19650, IFC details)
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| web-ifc (That Open) | Read/write IFC in WASM | MPL-2.0 (VERIFIED: https://api.github.com/repos/ThatOpen/engine_web-ifc) | IN | must: the one open BIM engine that fits a no-server page |
| three.js | 3D viewer base | MIT (VERIFIED: https://api.github.com/repos/mrdoob/three.js) | IN | must: viewer for IFC/glTF/point clouds |
| BCF (.bcfzip) read/write | Issue exchange between BIM tools | Open standard (VERIFIED in BIM_ECOSYSTEM.md section B) | IN (JSZip) | must: connects Navisworks tab to Revit/Solibri users |
| Solibri | Model checking | Paid (MEMORY) | LINK | nice: link + IDS note |
| BIMcollab, BIM Track, Trimble Connect | Issue tracking / CDE-lite | Free tiers + paid (MEMORY) | LINK | nice: link card |
| IfcOpenShell / Bonsai / xBIM / Speckle | Open BIM toolkits | See BIM_ECOSYSTEM.md B | HELPER | should: via agent bridge |
| Navisworks, Revizto, Dalux | Coordination, clash | Paid (MEMORY) | LINK | Navisworks already a tab; others nice |

## 3. Estimating and quantity surveying (QS)
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| Excel / LibreCalc BOQ templates | The real QS tool in most Egyptian offices (MEMORY) | Paid / LGPL-style (LibreOffice, MEMORY) | IN via SheetJS (Apache-2.0, VERIFIED: https://api.github.com/repos/SheetJS/sheetjs) | must: BOQ table with rates, export .xlsx; no vendor dependency |
| Bluebeam Revu | PDF markup, takeoff, Studio sessions | Paid (MEMORY) | LINK | should: link + "measure on PDF" idea built with pdf.js (scale calibration, polyline area) |
| PlanSwift, Togal.AI, Stack, On-Screen Takeoff | 2D takeoff | Paid (MEMORY) | LINK | nice |
| Cost-X, CostX (Rider Levett Bucknall) | 2D/3D takeoff, BQ | Paid (MEMORY) | LINK | nice: QS firms in Gulf; link only |
| CostOS | Norwegian-origin estimating/cost-control | Paid (MEMORY) | LINK | nice: link only; confirm local availability |
| Candy, Buildsoft, Cubit, Conquest | Estimating suites | Paid (MEMORY) | LINK | nice |
| Revit schedules / IFC quantities | Model-based quantities | n/a | IN with web-ifc (IfcQuantity*) | should: quantity extraction from IFC into BOQ |
| Unit-rate libraries (CESMM/POMI/NRM, Egyptian pricing) | Standard measurement rules | Books/standards; check licence (MEMORY) | LINK | should: checklist of measurement standards, no copied text |

## 4. Scheduling and project controls
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| Primavera P6 | CPM scheduling | Paid | tab exists | already in T.O X |
| MS Project, Asta Powerproject, Phoenix | Scheduling | Paid (MEMORY) | LINK | should: import/export neutral XML (MSP XML, XER read) |
| ProjectLibre | Open MS Project alternative | Open source (CPAL per project, MEMORY) | HELPER/LINK | nice |
| GanttProject, OpenProject | Open Gantt / PM | GPL-3 (MEMORY) | LINK | nice |
| Synchro 4D, Navisworks TimeLiner, Powerproject BIM | 4D scheduling | Paid (MEMORY) | LINK | nice |
| Earned value (EVM) calculators | Cost/schedule control | n/a | IN | should: simple EVM sheet (PV/EV/AC, CPI/SPI) built in JS |
| Power BI, Excel dashboards | Controls reporting | Paid / free viewer (MEMORY) | LINK | nice |

## 5. Document control and CDEs
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| Autodesk Construction Cloud / Docs | CDE | Paid | API (PKCE, see BIM_ECOSYSTEM.md A) | should: optional connector |
| Aconex (Oracle), Asite, Trimble Connect, Newforma, ProjectWise | CDEs | Paid (MEMORY) | LINK | nice: link card + folder naming |
| ISO 19650 naming (project-originator-volume-level-type-role-number) | File naming convention | Standard, paywalled (MEMORY) | IN | must: file-name validator + transmittal numbering using own wording, no copied standard text |
| Transmittal / RFI / submittal registers | Document control logs | n/a | IN + Drive | must: tables on user's Drive; ties into CRM in NEWS_CRM_PLAN.md |
| Google Drive / OneDrive / SharePoint / Nextcloud | File storage | Free tier / paid / AGPL (MEMORY) | API | must: Drive is the chosen store |
| Stirling-PDF | Self-hosted PDF toolbox (merge, split, OCR) | NOASSERTION (custom/multi, https://api.github.com/repos/Stirling-Tools/Stirling-PDF) | HELPER | nice: self-host option for heavy PDF jobs |

## 6. Site and field apps
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| Procore | Construction management suite | Paid (MEMORY) | LINK / API (OAuth) | nice: link card |
| Fieldwire, PlanGrid (now Autodesk Build), Autodesk Build | Plans, punch lists, field tasks | Paid, Fieldwire has free tier (MEMORY) | LINK | nice |
| Buildertrend, Raken, Dalux Field, Fieldlens | Daily reports, snagging | Paid (MEMORY) | LINK | nice |
| Own snag list / daily report forms | Photo + location + status | n/a | IN (camera input, Drive) | should: simple punch list with photo, usable on phone |
| WhatsApp / Telegram groups | What Egyptian sites actually use (MEMORY) | Free | LINK | should: "paste chat export -> structured site log" helper, text only |

## 7. Reality capture (drone, scan, photogrammetry)
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| OpenDroneMap (ODM) | Photogrammetry: orthophoto, DSM/DTM, point cloud | AGPL-3.0 (VERIFIED: https://api.github.com/repos/OpenDroneMap/ODM); WebODM licence not returned by API, read repo | HELPER (Docker) | should: free route for site progress maps; link + how-to |
| RealityCapture (Epic), Metashape (Agisoft), Pix4D, DJI Terra, Bentley ContextCapture | Photogrammetry / scan processing | Paid / free-limited (MEMORY) | LINK | nice |
| Autodesk ReCap, Leica Cyclone, Faro Scene | Laser scan registration | Paid (MEMORY) | LINK | nice |
| CloudCompare | Point cloud inspection | GPL (MEMORY) | HELPER | should: cut/fill compare of scan vs design |
| Potree, three.js PCD/LAS loaders | Point cloud viewing in browser | BSD-2 for Potree (MEMORY) | IN | should: view .las/.laz streamed or small cloud |
| Polycam / Scaniverse (phone LiDAR) | Quick room scans | Free + paid (MEMORY) | LINK | nice |

## 8. GIS
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| Leaflet | 2D web maps | BSD-2-Clause (VERIFIED: https://api.github.com/repos/Leaflet/Leaflet) | IN | must: site/plot map with OSM tiles under attribution rules |
| MapLibre GL JS | Vector tile maps | NOASSERTION (custom/multi; BSD-3 per project, MEMORY: https://api.github.com/repos/maplibre/maplibre-gl-js) | IN | should: if vector tiles are needed |
| QGIS | Desktop GIS | GPL-2+ (MEMORY) | HELPER | should: link + CRS tips for Egypt (EPSG:22992/22993/22994 Egypt Red Belt / Purple Belt / Extended Purple Belt, MEMORY - verify on epsg.io before use) |
| GDAL / PROJ | Format and CRS conversion | PROJ NOASSERTION (https://api.github.com/repos/OSGeo/PROJ); MIT-style per project (MEMORY) | HELPER (WASM builds exist, MEMORY) | should: proj4js (in-browser coordinate transforms) for CRS conversion |
| proj4js, turf.js, shapefile-js | In-browser CRS / geometry / shapefile | MIT-style (MEMORY) | IN | should |
| Google Earth Pro, Google Earth Engine | Imagery / analysis | Free for non-commercial / commercial tiers (MEMORY) | LINK | nice: Earth Pro for old-imagery site history; respect terms |
| Esri ArcGIS Pro/Online | Commercial GIS | Paid (MEMORY) | LINK | nice |
| OpenStreetMap / Overpass | Open map data | ODbL (MEMORY) | API | should: nearby roads/buildings query for feasibility; respect usage policy |

## 9. Structural and MEP analysis
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| ETABS, SAP2000, SAFE (CSI) | Building / general / slab FEA | Paid (MEMORY) | LINK | should: link card + "export results table (.xlsx/.csv) -> checks sheet" import only |
| STAAD.Pro, RISA, Robot Structural Analysis, Tekla Structural Designer, Tekla Structures | Analysis, detailing | Paid (MEMORY) | LINK | nice |
| IDEA StatiCa | Connection design | Paid, free viewer (MEMORY) | LINK | nice |
| PyNite | Python 3D beam/plate FEA | MIT (VERIFIED: https://api.github.com/repos/JWock82/Pynite) | HELPER (Pyodide in browser is possible, MEMORY, untested) | should: open ETABS alternative for small frames, scriptable by agents |
| OpenSees | Earthquake / nonlinear FEA | NOASSERTION (custom UC Berkeley-style, https://api.github.com/repos/OpenSees/OpenSees) | HELPER | nice: research-grade |
| CalculiX | Open FEA solver | GPL (MEMORY) | HELPER | nice |
| FreeCAD FEM | FEM front-end using CalculiX | LGPL-2.1 (FreeCAD VERIFIED above) | HELPER | nice |
| Hand-calc sheets (beam, slab, footing, rebar development, load take-down) per ECP 203 / Eurocode / ACI | Quick checks | Codes are copyrighted, formulas only, no copied tables (MEMORY) | IN | should: small calculators; always labelled "check, not design, engineer must verify" |
| MEP: Revit MEP, HAP, Trace 3D, Elite CHVAC, Hydraulic calcs (EPANET) | Load, duct, pipe, water network | Paid; EPANET public domain (MEMORY) | LINK / HELPER | should: EPANET / SWMM links tie to Civil 3D networks tab; loads calc sheets nice |
| DIALux, Relux | Lighting | Free (MEMORY) | LINK | nice |

## 10. Rendering and visualisation
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| Twinmotion | Real-time render | Free tier w/ limits + paid (MEMORY) | LINK | nice |
| Lumion, Enscape, D5 Render, Vray, Corona | Render engines | Paid; D5 has free tier (MEMORY) | LINK | nice: matters to Coohom/SketchUp tabs only as export targets |
| Blender (Cycles, Eevee) | 3D DCC + render | NOASSERTION in API (GPL per project, MEMORY: https://api.github.com/repos/blender/blender) | HELPER | should: free renderer; Blender Python is the agent target |
| three.js render / glTF viewer | In-page preview | MIT (VERIFIED above) | IN | must: quick preview of exported glTF |
| Marmoset, Sketchfab | Share 3D | Free tier (MEMORY) | LINK | nice |

## 11. General creative tools
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| Photoshop, Illustrator, InDesign, Premiere Pro, After Effects | Adobe suite | Paid subscription (MEMORY) | LINK | nice: link + "open alternative" column; never bundled |
| DaVinci Resolve | Edit / colour / audio | Free edition + paid Studio (MEMORY) | LINK | nice: free download link for site progress videos |
| Figma, Canva | Web design / layouts | Free tiers + paid (MEMORY) | LINK / API | should: proposal/presentation covers; link card |
| Affinity (Photo/Designer/Publisher) | Adobe alternative | Paid, free since 2025 per vendor (MEMORY, verify) | LINK | nice |
| GIMP | Raster editor | NOASSERTION (https://api.github.com/repos/GNOME/gimp); GPL-3+ per project (MEMORY) | LINK | should: free Photoshop alternative link |
| Inkscape | Vector editor | API returned None, repo https://github.com/inkscape/inkscape; GPL per project (MEMORY) | LINK | should: vector clean-up of traced drawings |
| Krita | Painting | GPL-3.0 (VERIFIED: https://api.github.com/repos/KDE/krita) | LINK | nice |
| Kdenlive | Video editor | GPL-3.0 (VERIFIED: https://api.github.com/repos/KDE/kdenlive) | LINK | nice |
| Shotcut | Video editor | GPL-3.0 (VERIFIED: https://api.github.com/repos/mltframework/shotcut) | LINK | nice |
| Paint.NET, Photopea | Quick editors | Freeware / free web with ads (MEMORY) | LINK | nice: Photopea opens PSD in browser |
| Remove.bg-style background removal | AI edit | Mixed (MEMORY) | API/LINK | nice |

## 12. Office, PDF and OCR
| Tool | What | Licence | Browser | Priority / why |
|---|---|---|---|---|
| pdf.js | Render and read PDF | Apache-2.0 (VERIFIED: https://api.github.com/repos/mozilla/pdf.js) | IN | must: viewer, text extraction, page to canvas for PDF to image |
| pdf-lib | Create/modify PDF (merge, split, stamp, forms) | MIT (VERIFIED: https://api.github.com/repos/Hopding/pdf-lib) | IN | must: transmittal covers, sheet sets, merge |
| Tesseract.js | OCR, supports Arabic traineddata | Apache-2.0 (VERIFIED: https://api.github.com/repos/naptha/tesseract.js) | IN (WASM; downloads language data) | must: OCR scanned drawings/title blocks/contracts; accuracy on Arabic handwriting low (MEMORY) |
| OCRmyPDF | Adds text layer to scanned PDF | MPL-2.0 (VERIFIED: https://api.github.com/repos/ocrmypdf/OCRmyPDF) | HELPER | nice: batch jobs |
| SheetJS | Read/write xlsx/csv | Apache-2.0 (VERIFIED, link in section 3) | IN | must: Excel tab export/import |
| docx.js / mammoth.js / LibreOffice | Word write / read / convert | MIT / BSD / MPL (MEMORY) | IN / HELPER | should: letters, reports from templates |
| LibreOffice, OnlyOffice | Office suites | MPL-2 / AGPL (MEMORY) | LINK / HELPER | nice |
| Adobe Acrobat / Foxit / PDF-XChange / Okular / Sumatra | PDF readers/editors | Paid / free (MEMORY) | LINK | nice |
| Markdown / MermaidJS | Docs and diagrams | MIT (MEMORY) | IN | nice |

## 13. File conversion: what is realistic where
| Conversion | In-browser realistic? | How | Licence note | Priority |
|---|---|---|---|---|
| PDF -> JPG/PNG | **Yes** | pdf.js render page to canvas, `canvas.toBlob` (Apache-2.0, VERIFIED above) | none | must |
| JPG/PNG -> PDF | **Yes** | pdf-lib `embedJpg/embedPng` (MIT) | none | must |
| Image -> vector (SVG) | **Yes, rough** | potrace algorithm; GitHub API found no licence file for the three WASM/JS ports I tried (kylemcdonald/potrace-wasm, tbarbugli/potrace-js, kmturley/potrace-wasm). Original Potrace is GPL (MEMORY). Treat as NOT cleared; either write own tracer (simple threshold + contour) or link Inkscape | licence unresolved | should |
| Text PDF -> text / table | **Yes** | pdf.js `getTextContent`, own grid heuristics | none | must |
| Scanned PDF -> text | **Yes** | pdf.js to canvas then Tesseract.js (Arabic + English) | Apache-2.0 | must |
| PDF (vector drawing) -> DXF/SVG | **Partly** | pdf.js `getOperatorList` gives paths; own writer to SVG then DXF LINE/LWPOLYLINE. Works for CAD-printed PDFs, not scans; layers are lost (MEMORY: PDFs from CAD usually flatten layers unless exported with layers) | none | should |
| PDF scan (raster) -> DWG | **No** (needs vectorisation, unreliable) | Link to a paid desktop tool or do trace + manual clean-up | n/a | nice |
| DXF -> SVG / PDF | **Yes** | parse DXF text (own or dxf-parser, MIT per npm, MEMORY), draw to canvas/SVG, print to PDF with pdf-lib | DXF spec is public (MEMORY) | must |
| DWG -> DXF/SVG/PDF | **Not cleanly** | LibreDWG is GPL-3.0 (VERIFIED: https://api.github.com/repos/LibreDWG/libredwg); a WASM build exists in community (MEMORY, not tested). GPL in a page that is distributed = the page's source must be offered under GPL. ODA (Open Design Alliance) SDK is commercial/membership (MEMORY). Safest: local helper with LibreDWG or ODA File Converter (free download, ODA terms apply, MEMORY) | GPL / ODA terms | should: helper route, not bundled |
| DXF/DWG -> DWG/DXF version change | HELPER | ODA File Converter (free, MEMORY, read terms) | ODA terms | should |
| IFC -> glTF/GLB | **Yes** | web-ifc geometry -> three.js -> GLTFExporter (MPL-2.0 + MIT) | check MPL file-level rule | should |
| glTF/OBJ/STL viewing | **Yes** | three.js loaders | MIT | must |
| RVT/NWD/DWG (proprietary) -> anything | **No** in browser | Autodesk APS Model Derivative (paid cloud, BIM_ECOSYSTEM.md A) or desktop | proprietary | nice |
| Video transcode / extract frames | **Yes, slow** | ffmpeg.wasm wrapper is MIT (VERIFIED: https://api.github.com/repos/ffmpegwasm/ffmpeg.wasm); the ffmpeg core build carries LGPL/GPL by encoder choice (MEMORY: check which core you load); memory limits for big files | LGPL/GPL core | nice |
| HEIC -> JPG (phone photos) | Yes | heic2any / libheif-js (LGPL, MEMORY) | LGPL | should |
| SHP/GeoJSON/KML | Yes | shapefile-js, togeojson (MIT-style, MEMORY) | | should |
| CRS transform | Yes | proj4js (MEMORY) | | should |
| Batch / large files (> ~200 MB) | No | HELPER (Stirling-PDF, ODA, ffmpeg native) | | nice |

Rule for T.O X: where only a licensed or GPL piece can do the job, ship a **link or helper instruction**, not a bundled binary, and say so in the UI.

## 14. Printing and plotting (skills to build into a "Print studio" panel)
| Topic | Content | Basis | Browser | Priority |
|---|---|---|---|---|
| ISO 216 paper sizes | A0 841x1189, A1 594x841, A2 420x594, A3 297x420, A4 210x297 mm | ISO 216 (MEMORY, widely known) | IN | must |
| ANSI/Arch sizes | ANSI A-E, Arch A-E (e.g. Arch D 24x36 in) | MEMORY | IN | should |
| Scale to paper | Drawing scale -> plot scale, viewport scale, annotative text height = paper height x scale | MEMORY | IN | must: scale calculator |
| Pen tables (CTB/STB) | Colour-dependent (CTB) vs named (STB) plot styles; lineweights mm per colour; screening % | AutoCAD concept, MEMORY | IN (generate table text/CSV) | should |
| PDF export settings | Vector vs raster, resolution 300-600 dpi raster, embed fonts, layers to PDF | MEMORY | IN | should |
| PDF/A | Archival PDF subset (ISO 19005); pdf-lib does not make PDF/A by itself (MEMORY) -> HELPER (Ghostscript/LibreOffice) | MEMORY | HELPER | nice |
| Sheet-set / title-block checklist | Sheet numbers, revision table, north arrow, scale bar, drawn/checked/approved | MEMORY | IN | must |
| Plotter and print-shop notes | Rolled vs folded, fold to A4 with title block visible | MEMORY | IN | nice |

## 15. Fonts (Arabic CAD, SHX, licensing)
| Item | Notes | Licence | Priority |
|---|---|---|---|
| SHX fonts (AutoCAD native stroke fonts: txt.shx, romans.shx, simplex.shx) | Stroke fonts are proprietary Autodesk files (MEMORY); open reimplementations exist | check each | should: explain, don't ship |
| Arabic in CAD | Old SHX Arabic fonts (arabic.shx variants) are third-party and often unlicensed copies (MEMORY); modern AutoCAD handles TrueType Arabic with right-to-left and shaping limits in MTEXT (MEMORY, test) | per font | should: guide "use a TrueType Arabic font, one font per style, test DXF round-trip" |
| Open Arabic fonts (Noto Sans/Naskh Arabic, Amiri, Cairo, Tajawal, IBM Plex Sans Arabic, Almarai) | Google Fonts families are generally SIL OFL (MEMORY; check each family page on https://fonts.google.com) | OFL (MEMORY) | must: drawing text/title blocks in T.O X |
| Font embedding rules | OFL allows embedding with notice; commercial fonts (Adobe, Monotype) restrict embedding/redistribution (MEMORY) | per EULA | should: licence checklist per font |
| Self-hosting fonts | Avoid hot-link tracking, speed; woff2 | OFL | should |
| Font identification | WhatTheFont (link) | n/a | nice |

## 16. Icon sets and licences
| Set | Licence | Notes | Priority |
|---|---|---|---|
| Tabler Icons | MIT (VERIFIED: https://api.github.com/repos/tabler/tabler-icons) | ~SVG, huge set | must: default for ribbons (own-drawn vs vendor art rule) |
| Bootstrap Icons | MIT (VERIFIED: https://api.github.com/repos/twbs/icons) | | should |
| Feather | MIT (VERIFIED: https://api.github.com/repos/feathericons/feather) | | should |
| Material Icons / Symbols | Apache-2.0 (VERIFIED: https://api.github.com/repos/google/material-design-icons) | | should |
| Lucide | NOASSERTION in API (ISC per project, MEMORY: https://api.github.com/repos/lucide-icons/lucide) | check LICENSE | should |
| Font Awesome Free | Icons CC BY 4.0, fonts OFL, code MIT (MEMORY) | needs attribution | nice |
| Autodesk/Revit/AutoCAD icons | Proprietary art | **Do not copy** (project rule) | never |
| Own-drawn command icons | Project's own | Safe | must |
Rule: keep an `ICON_LICENCES.md` listing set, version, licence, attribution text (MEMORY of good practice).

## 17. Inspiration and social (links, galleries; no scraping)
| Platform | Use for an engineering office | Terms note | Browser | Priority |
|---|---|---|---|---|
| Pinterest | Moodboards, interiors, facades | Boards can be embedded via official widgets (MEMORY); scraping and API use under Pinterest terms (not read this session) | LINK/embed | should: curated link cards + embed of the owner's own boards |
| Behance, Dribbble, ArchDaily, Dezeen, Designboom | Project galleries | RSS exists for Dezeen (VERIFIED feed 200: https://www.dezeen.com/feed/) and ArchDaily (VERIFIED 200: https://www.archdaily.com/feed); respect image copyright, link out only | LINK/RSS | should |
| Reddit | r/civilengineering, r/StructuralEngineering, r/architecture, r/BIM, r/Revit, r/AutoCAD, r/Egypt (names from MEMORY, verify) | Reddit data/API terms restrict commercial use and bulk access (MEMORY, read terms first); every subreddit has a public `.rss` (MEMORY, test) | LINK / RSS | should: link cards only first |
| Discord | Communities: BIM, That Open Company, Speckle, Blender, FreeCAD (MEMORY) | Invites expire; links only | LINK | nice |
| LinkedIn | Jobs, company pages, professional posts | Scraping is against its terms (MEMORY) -> link out only | LINK | should |
| Telegram | Egyptian engineering channels, tenders chats (MEMORY) | Public channel preview `t.me/s/<channel>` exists (MEMORY), terms apply | LINK | nice |
| YouTube | Tutorials (Revit, Civil 3D, P6) | Embed allowed by YouTube terms (MEMORY) | embed | should |
| Wikimedia Commons, Unsplash, Pexels | Free images | Check each licence (CC / own licence) (MEMORY) | LINK | should: "free image sources" card with licence note |

## 18. Skills a modern office needs (learning cards, not tools)
| Skill | Why | What T.O X can offer | Priority |
|---|---|---|---|
| BIM management (BIM manager / coordinator roles) | Runs standards and handovers | Checklist per project stage, linked to the 9-stage flow in BIM_ECOSYSTEM.md | should |
| ISO 19650 (parts 1-2, 5 security, 6 H&S, 7 archiving) | Information management contract language | Glossary + naming + CDE status codes in own words (standard text paywalled) | should |
| Scripting: Python, Dynamo, Grasshopper, C# add-ins, AutoLISP | Automate drafting/BIM tasks | Snippet gallery written by T.O X (no vendor sample code copy), runs via agent bridge | should |
| Data viz / BI (Excel, Power BI, Plotly, D3) | Reports for clients | Chart templates in-page | nice |
| AI prompting for engineers | Draft specs, checks, emails | Prompt library with "verify" rules; never auto-sign calculations | should |
| Contracts: FIDIC (Red/Yellow/Silver 2017 editions), NEC4, local public contract law | Claims, notices, time bars | Notice-deadline tracker (user types the contract's days), clause-reference list with links; never legal advice, text of FIDIC is copyrighted (MEMORY) | should |
| Risk, quality (ISO 9001), H&S (ISO 45001), sustainability (LEED, Estidama, EDGE, Green Pyramid) | Compliance | Checklists; rating-system names are MEMORY | nice |
| Soft skills: proposal writing, presenting, negotiation | Winning work | Templates | nice |

---

## Priority summary for T.O X (what to build first from this file)
**must:** PDF viewer + PDF/JPG/PNG converters (pdf.js, pdf-lib), OCR (Tesseract.js, Arabic), DXF -> SVG/PDF, Excel/BOQ (SheetJS), three.js/web-ifc viewer, ISO-style naming and transmittal register, Print studio (sizes, scale, sheet checklist), Arabic open fonts, icon licence list (Tabler), Leaflet site map.
**should:** PDF vector -> DXF (own writer), IFC -> glTF, DWG helper route (LibreDWG/ODA outside the page), proj4 CRS tool, EVM sheet, snag list with photos, PyNite helper, hand-calc sheets, FIDIC notice tracker, link cards for CSI/Bluebeam/Resolve/GIMP/Inkscape/Blender.
**nice:** everything else, mostly external links.

## NOT checked this session (honest list)
- All prices and subscription rules. Current free-tier limits of Twinmotion, Affinity, DaVinci Resolve, Fieldwire, BIMcollab.
- Licence of the three potrace JS/WASM ports (API returned none), WebODM, GDAL, Inkscape (API None), and exact licence of ffmpeg.wasm core builds.
- Whether a working LibreDWG WASM build exists and its size.
- Reddit, Pinterest, LinkedIn, Telegram, Discord terms of service: not read.
- Egyptian CRS EPSG codes and exact Egypt-specific tool availability (CostOS, Cost-X dealers).
- Any claim marked MEMORY above.
