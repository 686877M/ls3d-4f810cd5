# T.O X versus the well-known systems (2026-11-20)

## ملخص بالعربي (6 سطور)
1. T.O X صفحة HTML واحدة مجانية بتشتغل أوفلاين وبتجمع (موديل، رسم، جدول P6، تنسيق، مستندات DC، GIS، وكلاء) في مكان واحد؛ ماحدش من المنافسين بيعمل كده بدون ترخيص وبدون سيرفر.
2. نقطة قوتها: التكلفة صفر، السرعة في الفتح، وجسر الوكلاء (`window.TOX` + WebSocket)؛ نقطة ضعفها: مفيش سيرفر فالصلاحيات "تعاونية مش أمنية"، ومفيش DWG/RVT/NWD حقيقي.
3. الأنظمة المدفوعة (Revit، ACC، Procore، ProjectWise، Primavera) أقوى في الصلاحيات الحقيقية، التدقيق، التوسع على مشاريع ضخمة، والتوافق مع الصيغ الأصلية.
4. المفتوحة (Speckle، That Open، Bonsai، FreeCAD، QGIS) أقرب لفلسفة T.O X؛ وأنفع ما يتاخد منها: web-ifc لقراءة IFC و BCF و IDS كلها تشتغل في المتصفح بدون سيرفر.
5. أعلى 5 تحسينات قيمة/جهد: صلاحيات وموافقة لكل أمر وكيل، وسيط وناتج للأمر، سجل تدقيق دائم، BCF، قراءة IFC بـ web-ifc.
6. المخاطر الأساسية: حقن أوامر عبر المستندات، سر الجسر في localStorage، ادعاء صلاحيات وهمية، وأسعار الموردين اللي بتتغير؛ كل رقم سعر هنا لازم يتراجع قبل أي قرار.

## How to read this file
- **[V]** = the claim appeared in a web search result excerpt from the URL cited, 2026-11-20. Excerpts, not always full pages. Prices change by region and date: re-check before any decision.
- **[V-weak]** = seen only on a third-party aggregator or review site, URL given. Conflicting numbers are shown as conflicting.
- **[M]** = from my own memory, no URL read in this session. Re-check before relying on it. All strengths, weaknesses and "what a browser tool can take" lines are [M] unless a URL is next to them.
- **[R]** = read directly from T.O X's own docs in this repo (`MEETING_ROOM.md`, `research/*.md`). No source file was read or edited.
- No vendor code or artwork copied. No value invented: "unknown" means unknown.

## 0. What T.O X is today (all [R] from `docs/MEETING_ROOM.md`, `research/AGENT_CONTROL.md`, `research/gap_*.md`)
- One HTML file (about 1.8 MB), no server. Tabs per discipline: model, drafting, schedule (P6-style CPM, XER and MS Project XML export), survey, coordination (Navisworks-style), detection, take-off, levels, simulation, analysis, office; GIS and environment tab; technical office and document control (22 document types, auto numbers, status, due dates, link to schedule activity); calendar, Telegram bot, handover "Pulse" rules; teams, 120-step history in IndexedDB, activity log, live session in the same browser (BroadcastChannel) or WebRTC copy-paste.
- Exports: IFC2X3 (opened by ifcopenshell in a test: 57 products, 0 failures), DXF (ezdxf, no audit errors), OBJ, XLSX, PDF, SVG, project ZIP. Not tested: opening any export in AutoCAD, Revit, Plant 3D, Navisworks. DWG, RVT, NWD cannot be written by a web page.
- Roles are "cooperative, not security" (the build log says so). No real login or server-side permission.
- Agents: `window.TOX` (commands, run(id) with no arguments and no result, state, pulse, docs, search) plus an optional WebSocket bridge with a shared secret. Known gaps: no arguments, no structured result, no per-command permission, no approval prompt, audit log only 60 lines in memory, secret in plain localStorage (`AGENT_CONTROL.md` section 1).
- Calculations are offline code (ASCE 7 wind and seismic, site class, weather scenario). Egyptian code (ECP) methods not done.
- Clash detection is mesh bounding-box level plus clearances and time-based site conflicts; the Navisworks gap file lists the full clash workflow (tests, rules, statuses) as missing.
- Live internet features (radio, YouTube, Telegram, Google) were only mock-tested; real-browser behaviour not verified.

---

## 1. System by system

Template per system: pricing, openness, 3 strengths, 3 weaknesses, what a browser-only free tool can realistically take, what T.O X can do better.

### 1.1 Autodesk Revit and Autodesk Construction Cloud (ACC, formerly BIM 360)
- **Pricing:** Revit standard subscription $380/month, $3,005/year, $9,020 for 3 years per Autodesk's FAQ [V: https://www.autodesk.com/solutions/revit-subscription-faq]. Third parties list slightly different numbers [V-weak: https://www.capterra.com/p/265023/Revit/pricing/]. Flex pay-as-you-go tokens exist, $300 per 100 tokens, Revit uses 10 tokens a day [V, same FAQ search]. ACC / Autodesk Build price: not found, contact sales (not verified).
- **Openness:** proprietary desktop product; open APIs through APS (OAuth with PKCE for single-page apps works from a browser) [V: https://aps.autodesk.com/blog/getting-token-pkce-single-page-app]; Revit MCP server by Autodesk exists per `AGENT_CONTROL.md` (Apache 2.0, Revit 2027) [R, not re-checked]. Design Automation runs headless, billed by usage, 100 calls/min per app [V: https://aps.autodesk.com/en/docs/design-automation/v3/developers_guide/rate-limits/da-rate-limits].
- **Strengths [M]:** (1) deep parametric families and a huge element library; (2) schedules, sheets and documentation tied to one model; (3) worksharing plus cloud common data environment (ACC) with role-based project access.
- **Weaknesses [M]:** (1) cost and per-seat licences; (2) heavy install, large models slow on modest PCs; (3) closed file format; automation needs C# add-ins built on a desktop.
- **A browser tool can take:** the UI frame (Project Browser, Properties palette, Type Selector, View Control Bar, Options Bar, all [V] in `gap_revit.md`), IFC export, schedules as tables over element parameters, optional ACC connector with PKCE (calls only; webhooks need a server [R]).
- **T.O X can do better:** zero cost; opens in seconds and offline; scripts and agents can drive every command by id; the same page also holds schedule, DC register and handover rules, which Revit alone does not.

### 1.2 Trimble Connect
- **Pricing:** Personal plan is free: one project, up to five invited members, 10 GB [V: https://community.trimble.com/blogs/lindsay-renkel/2025/05/05/trimble-connect-new-pro-and-innovate-plans-faq via search]. Business Premium $23.95 per user per month billed annually on the official page [V: https://geospatial.trimble.com/en/products/software/trimble-connect/subscription-plans]. Since 20 May 2025 Pro and Innovate plans replace Business and Business Premium for new web purchases (same Trimble post). Older third-party numbers conflict [V-weak: https://www.capterra.co.uk/software/208909/trimble-connect].
- **Openness:** proprietary cloud; public APIs and openCDE participation [M]; reads IFC [M].
- **Strengths [M]:** (1) free tier with real project storage; (2) works on web, mobile and field hardware from the same vendor; (3) good IFC and model viewing with issues (BCF-style).
- **Weaknesses [M]:** (1) free tier limited to one project and five invites [V above]; (2) advanced BIM tools sit in paid plans [V: the Trimble plans page says Business Premium adds them]; (3) needs the cloud and an account.
- **A browser tool can take:** BCF issues, folder/CDE structure with version history, free-tier-style simple sharing.
- **T.O X can do better:** no account, no storage cap, no project count limit; project data stays on the user's machine; works with no internet.

### 1.3 Bentley (OpenBuildings Designer, ProjectWise)
- **Pricing:** OpenBuildings Designer starts at $3,844 for a 12-month Virtuoso subscription [V: https://www.bentley.com/products/openbuildings-designer]. ProjectWise starting price shows $960 on one page and $312 on another (conflict, unexplained) [V: https://www.bentley.com/en/products/projectwise/]; ProjectWise bundle starts at $10,440 with 1 licence plus 15 Connect subscriptions [V: https://www.bentley.com/en/Products/Product-Line/Project-Delivery-Software/ProjectWise-365].
- **Openness:** proprietary; IFC and open standards support is claimed by Bentley (not checked here) [M].
- **Strengths [M]:** (1) infrastructure and large-asset strength (roads, rail, plant, utilities); (2) ProjectWise document control with workflows, used by large owners; (3) federated multi-discipline handling at big scale.
- **Weaknesses [M]:** (1) high price and sales-led purchase; (2) steep learning curve; (3) smaller community and fewer free learning resources than Autodesk.
- **A browser tool can take:** the ProjectWise ideas of document status workflow, naming rules and transmittals (T.O X already has a DC register).
- **T.O X can do better:** cost, onboarding time (opens and works), bilingual Arabic/English UI [R], and agents over the same DC register.

### 1.4 Graphisoft Archicad / BIMcloud
- **Pricing:** two subscription plans now, Archicad Studio (BIMcloud Basic) and Archicad Collaborate (BIMcloud SaaS) [V: https://architosh.com/2025/03/graphisoft-launches-archicad-studio-subscription-plan/]. Prices vary by country and date: Solo €148 or US$200 per month in different pages, Collaborate $406 or $234.17 per month in different pages, BIMcloud $45 or $99 per month (conflicting) [V-weak: https://graphisoft.com/buy-now].
- **Openness:** proprietary; IFC support and open API/add-on SDK [M].
- **Strengths [M]:** (1) strong IFC interoperability reputation; (2) fast, light desktop BIM for small and mid practices; (3) BIMcloud delta-based teamwork.
- **Weaknesses [M]:** (1) smaller market than Revit in many regions; (2) per-seat subscription; (3) automation less common than Revit's add-in ecosystem.
- **A browser tool can take:** IFC-first workflow and the "teamwork as deltas" idea (send changes, not whole files).
- **T.O X can do better:** price and install; plan, section, sheet, BOQ and schedule in one page.

### 1.5 Procore
- **Pricing:** annual fee by product, based on annual construction volume; unlimited users, unlimited storage and support included; no public rate card [V: https://procore.com/pricing]. Third-party estimates (USD 15,000 to 80,000 per year for many firms, far higher for large contractors) are unofficial [V-weak: https://www.getonecrew.com/post/procore-pricing].
- **Openness:** proprietary cloud, public REST API and marketplace [M].
- **Strengths [M]:** (1) owner, contractor and subcontractor all work in one tenant with project roles; (2) RFIs, submittals, daily logs, punch lists, change events are mature; (3) unlimited users removes per-seat friction [V above].
- **Weaknesses [M]:** (1) cost scales with construction volume [V above]; (2) not a modelling or CPM scheduling tool; (3) needs internet and sales-led onboarding.
- **A browser tool can take:** the workflow list (RFI, submittal, NCR, daily log, punch list, change order) and the role matrix per document type. T.O X already has 22 document types [R].
- **T.O X can do better:** works offline at site, free, and links a document to a schedule activity and a model element in the same page [R]. Cannot match: real multi-party tenant with server enforcement.

### 1.6 Oracle Primavera Cloud and P6
- **Pricing:** P6 Professional about $2,570/year in one guide, $3,520 perpetual in a reseller page; Primavera Cloud modules priced per user per year (scheduling $1,320 in one guide). Not confirmed on Oracle's own list [V-weak: https://www.projectmanager.com/blog/what-is-primavera-p6, https://www.taradigm.com/?p=222705].
- **Openness:** proprietary; XER text export is the de facto interchange [M]; Oracle documents the Activities window layouts and Resource Usage Profile [V: https://docs.oracle.com/cd/F74771_01/client_help//en_US/activities_window.htm, https://docs.oracle.com/cd/F74771_01/English/User_Guides/p6_pro_user/the_resource_usage_profile.htm].
- **Strengths [M]:** (1) accepted standard for large-project CPM and claims; (2) resource and cost loading, baselines, EPS/OBS enterprise structure [V list of concepts in the Activities help]; (3) multi-project portfolio and permissions in the enterprise edition.
- **Weaknesses [M]:** (1) expensive and dated desktop UI; (2) steep learning curve; (3) slow to do quick what-if work for small teams.
- **A browser tool can take:** CPM engine (4 relation types, lags, calendars, constraints), top/bottom layout with Activity Details, resource histogram, XER import/export (`gap_p6.md` sections 3-4 [R]).
- **T.O X can do better:** instant what-if (Monte Carlo risk already built [R]), schedule tied to the 3D model (4D) and to DC documents; free. Missing today per `gap_p6.md`: relationship editing, calendars per activity, baselines, resources.

### 1.7 Microsoft Project
- **Pricing:** Planner and Project Plan 1 $10, Plan 3 $30, Plan 5 $55 per user per month, annual billing; one source says new Plan 5 purchases ended after 1 May 2026 (single source, unverified) [V: https://www.microsoft.com/en-sg/microsoft-365/project/project-plan-5 and https://thedigitalprojectmanager.com/tools/microsoft-project-pricing].
- **Openness:** proprietary; MPP file; MS Project XML is a documented interchange [M].
- **Strengths [M]:** (1) familiar to most office staff; (2) integrates with Microsoft 365 and Teams; (3) resource and cost features at a lower price than P6.
- **Weaknesses [M]:** (1) per-user cloud subscription; (2) weaker on very large construction logic than P6; (3) tied to the Microsoft ecosystem.
- **A browser tool can take:** MS Project XML import/export (T.O X exports it already [R]); familiar Gantt conventions.
- **T.O X can do better:** price, offline, and the schedule can drive a 3D model and a document register.

### 1.8 Autodesk Navisworks
- **Pricing:** Simulate $1,110/year (3-year $3,330) on Autodesk's page; Manage price not found in Autodesk's text, a reseller-style aggregator shows $2,285 per year [V: https://autodesk.com/products/navisworks/compare; V-weak: https://www.saasworthy.com/product/navisworks/pricing].
- **Openness:** proprietary NWD/NWF/NWC [M]; reads many formats.
- **Strengths [M]:** (1) federates many source formats in one review model; (2) Clash Detective with tests, rules, tolerance, statuses (Manage only [V: the dockable windows reference https://help.autodesk.com/cloudhelp/2022/ENU/Navisworks/files/GUID-3539A344-FD91-4F2C-8744-2A5A9828B4C1.htm]); (3) TimeLiner 4D plus quantification.
- **Weaknesses [M]:** (1) review-oriented, weak authoring; (2) Windows desktop only; (3) cost of Manage and slow with huge models.
- **A browser tool can take:** Selection Tree and Sets, Find Items, clash tests with statuses, TimeLiner playback, viewpoints. Shortcuts seen in a search snippet: Ctrl+F2 Clash Detective, Ctrl+F3 TimeLiner, Ctrl+F5 Animator, Ctrl+F8 Quantification Workbook, Ctrl+F12 Selection Tree [V-weak: snippet in `gap_navisworks.md`].
- **T.O X can do better:** model, schedule and review in one page, free, and time-based site clashes (workers, crane swing) already exist [R]. Do not claim NWD compatibility.

### 1.9 Solibri
- **Pricing:** conflicting. Individual annual $1,200 per user and $149 monthly [V-weak: https://www.trustradius.com/products/solibri-office/pricing]; tier list Starter €99, Essential €1,428, Advanced €2,109, Premium €2,772 per year per licence [V-weak: search snippet, https://store.solibri.com/]. Re-check.
- **Openness:** proprietary desktop; works through IFC and BCF [V: https://www.trustradius.com/products/solibri-office/pricing says it imports models by IFC].
- **Strengths [M]:** (1) rule-based model checking (quality, accessibility, code); (2) clear issue reports; (3) vendor-neutral through IFC.
- **Weaknesses [M]:** (1) review only, no authoring; (2) licence cost; (3) rule sets need expert tuning.
- **A browser tool can take:** a small IDS-style checker over IFC properties and BCF issue output (IDS is an open buildingSMART standard [V: https://catenda.com/glossary/buildingsmart-standards]).
- **T.O X can do better:** checks sit beside the model and the register (the Pulse rules already run over documents, activities, risks [R]); free.

### 1.10 BlenderBIM / Bonsai
- **Pricing:** free.
- **Openness:** Bonsai GPL-3.0-or-later; IfcOpenShell libraries LGPL [V: https://wiki.osarch.org/index.php/IfcOpenShell and the IfcOpenShell GitHub listing via search].
- **Strengths [M]:** (1) native IFC authoring; (2) scriptable in Python; (3) free, with an active community.
- **Weaknesses [M]:** (1) needs Blender and a learning period; (2) BIM UI not familiar to Revit users; (3) heavy for non-technical staff.
- **A browser tool can take:** nothing inside the page (needs Blender). Reachable as a desktop target through the agent bridge [R, BIM_ECOSYSTEM.md].
- **T.O X can do better:** no install, familiar ribbon, one file.

### 1.11 FreeCAD
- **Pricing:** free [M]. Licence LGPL [M, not verified this session]. FreeCAD imports IFC when ifcopenshell is present [V: https://wiki.freecad.org/IfcOpenShell].
- **Strengths [M]:** (1) parametric solid modelling; (2) Python scripting and headless use; (3) open formats.
- **Weaknesses [M]:** (1) UI and workflow rough for architects; (2) topological-naming problems in older versions; (3) BIM workbench smaller than commercial BIM.
- **A browser tool can take:** nothing in-page; a server-side agent target.
- **T.O X can do better:** instant start, project-level tabs, documents and schedule in the same place.

### 1.12 Speckle
- **Pricing:** free Explore plan: up to 10 users, 1 project, 30-day history, 100 versions, 50 monthly syncs; paid plans by syncs and versions; self-hosting free [V: https://speckle.systems/pricing/ and https://docs.speckle.systems/workspaces/new-plans-faq]. Pricing changed in 2026 [V: https://osarch.org/2026/01/21/speckle-announces-project-and-usage-based-plans/].
- **Openness:** server and viewer Apache-2.0 (enterprise modules separate) [V: https://github.com/specklesystems/speckle-server per `BIM_ECOSYSTEM.md`; viewer open source per https://docs.speckle.systems/developers/viewer/].
- **Strengths [M]:** (1) data-first exchange between Revit, Rhino, Grasshopper, Blender and others; (2) open viewer embeddable in a page; (3) versioned object model with API.
- **Weaknesses [M]:** (1) free tier tight (1 project) [V above]; (2) depends on connectors installed in desktop tools; (3) hosted model needs internet and account.
- **A browser tool can take:** an optional "send/receive" connector and the idea of versioned object commits. CORS from a static page not tested [R, BIM_ECOSYSTEM.md].
- **T.O X can do better:** no quota, offline, includes document control and schedule that Speckle does not.

### 1.13 That Open Engine (web-ifc, components)
- **Pricing:** free.
- **Openness:** web-ifc MPL-2.0 per most sources, one says MIT, check the repo LICENSE [R, BIM_ECOSYSTEM.md; https://github.com/ThatOpen/engine_web-ifc]. Runs fully in the browser as WebAssembly [R].
- **Strengths [M]:** (1) the same "browser only" philosophy as T.O X; (2) reads and writes IFC in JS; (3) active open community.
- **Weaknesses [M]:** (1) a toolkit, not a finished product; (2) component API changes quickly; (3) authoring tools are limited.
- **A browser tool can take:** all of it: IFC import as a locked layer, IFC4X3 option, BCF, fragments for big models.
- **T.O X can do better:** it is a finished workspace (schedule, DC, coordination) rather than building blocks. Best path is to use web-ifc inside T.O X.

### 1.14 QGIS and ArcGIS
- **Pricing:** QGIS free, GPL [M, not verified this session]. ArcGIS Pro / Online per named user per year: price not verified this session (search returned nothing) [unknown].
- **Openness:** QGIS open source with plugins and Python; ArcGIS proprietary with a large API set (ArcPy, JS API) [M].
- **Strengths [M]:** (1) real GIS analysis, projections and big raster/vector data; (2) huge plugin ecosystems; (3) standard formats (GeoPackage, shapefile, GeoJSON).
- **Weaknesses [M]:** (1) heavy for a quick site check; (2) steep learning; (3) ArcGIS licensing cost.
- **A browser tool can take:** MapLibre/Leaflet tiles and GeoJSON import/export, CRS conversion with a small library, KML.
- **T.O X can do better:** project-centric GIS tab tied to the model (sun path, wind, seismic, offline simulation [R]); it will not match real geoprocessing and should say so.

### 1.15 Coohom
- **Pricing:** not verified (search returned nothing) [unknown].
- **Openness:** proprietary cloud interior design service [M].
- **Strengths [M]:** (1) large furniture and material library; (2) quick room layout and cloud rendering; (3) easy for non-professionals.
- **Weaknesses [M]:** (1) library and renders tied to the vendor cloud; (2) limited engineering or BIM output; (3) cost of render credits (not verified).
- **A browser tool can take:** its workflow (room, library, drag, render) with own simple parametric items; `coohom_tab_spec.md` exists [R].
- **T.O X can do better:** items carry cost, brand and IFC class (hover data [R]) so interior layouts feed BOQ; offline.

### 1.16 SketchUp
- **Pricing:** Go $119, Pro $349, Studio $749 per year on SketchUp's 2024 price-update FAQ; a review site shows higher numbers [V: https://prod-aws-help.sketchup.com/pricing-update; V-weak: https://www.g2.com/products/sketchup/pricing]. Studio adds Revit and point-cloud import [V-weak, same G2/sketchup pages].
- **Openness:** proprietary; Ruby extension API and 3D Warehouse [M].
- **Strengths [M]:** (1) fastest push/pull modelling to learn; (2) huge extension and component library; (3) web version exists.
- **Weaknesses [M]:** (1) weak BIM data and quantities by default; (2) extensions needed for documentation; (3) subscription.
- **A browser tool can take:** push/pull, inference-style snapping, groups/components, section planes (`sketchup_tab_spec.md` [R]).
- **T.O X can do better:** the sketch becomes a priced, scheduled, IFC-classed model in the same page.

### 1.17 AI-first design tools (Arcol, Snaptrude, Hypar, Autodesk Forma, TestFit)
- **Pricing (all weak):** Forma Building Design free for Revit and AEC Collection subscribers per Autodesk-linked roundups [V-weak: https://resources.rework.com/tools/ai-tools/best-ai-tools-for-architects-2026]; Snaptrude about $499/year and a free option; TestFit reported from $100 to $250 per month (two sources disagree); Hypar free tier, paid on request; Arcol freemium. Treat all as unverified. See also https://architosh.com/2026/01/a-new-center-of-gravity-arcol-is-rebuilding-architectural-authoring/.
- **Openness:** all proprietary cloud services [M]; Hypar exposes functions and APIs [M].
- **Strengths [M]:** (1) fast massing, yield and feasibility studies; (2) real-time collaboration (Arcol, Snaptrude); (3) generative or rule-driven layouts (Hypar, TestFit).
- **Weaknesses [M]:** (1) design-stage only; thin construction documentation; (2) cloud and subscription dependence; (3) model detail and IFC fidelity vary by tool.
- **A browser tool can take:** a feasibility panel (area, units, parking yield from simple rules), program-to-massing and cost-per-area estimate. All client-side maths.
- **T.O X can do better:** an agent can run the whole chain from brief to handover gates (the 9-stage lifecycle in `BIM_ECOSYSTEM.md` section D [R]) with human approval gates, and the output feeds BOQ, schedule and DC. Weaker: no generative solver today.

---

## 2. Cross-cutting comparison: what T.O X can do better, and where it cannot

| Topic | Where T.O X is better | Where T.O X is weaker or cannot compete |
|---|---|---|
| Permissions and roles (owner, contractor, consultant) | Role views can be built cheaply and shown per document type; per-command agent permission is a small change (section 4, items 1-3). | Today "cooperative, not security" [R]. Real enforcement needs a server and identity (ACC, Procore, ProjectWise have it). Do not market roles as secure until then. |
| Flexibility | One file holds model, CAD, schedule, DC, GIS; any tab can be edited by script. | Not as deep as a dedicated tool in any one domain (families, Civil 3D corridors, P6 enterprise). |
| Speed | Opens in seconds, no install, no licence check, works offline [R]. | Very large models: performance on big models is listed as to-do [R]. |
| Keyboard shortcuts | Can copy proven sets cheaply (F9 schedule [V in gap_p6]; Navisworks Ctrl+F keys seen in a snippet) and add a command palette. | No complete verified shortcut table for Revit or AutoCAD was read this session; the CAD command line is still on the to-do list [R]. |
| Time saved | Fewer round trips: DC register, schedule and model together; agents fill repetitive registers. | Time saved is unmeasured; no benchmark exists. Do not claim numbers. |
| Project workflow | Nine-stage lifecycle with human gates mapped to ISO 19650-2 (eight stages, stage list [V: https://webstore.ansi.org/preview-pages/ISO/preview_ISO+19650-2-2018.pdf]). | No server CDE; handover between companies is by ZIP or link with state in the `#s=` hash [R]. |
| Automation by agents | `window.TOX` plus bridge exist; MCP server design is clear [R]. Competitors need add-ins (Revit) or paid APIs (APS Design Automation). | Missing arguments, results, permission classes, approvals, audit [R]. Prompt injection from documents is the main risk. |
| Offline | Core works offline; autosave and IndexedDB history [R]. | Some widgets need internet (radio, YouTube, Telegram) and were mock-tested only [R]. |
| Cost | Free. | No vendor support, no certification, no insurance. Stamped design remains with licensed engineers [R]. |

---

## 3. Ranked improvements for T.O X (value over effort, highest first)

Effort scale: S = hours to a day, M = days, L = weeks. Value is my judgement from the gap files, not measured.

1. **Per-command permission class and approval for agents** (read-only, edit, destructive; confirm dialog for risky). Value very high, effort S-M. Closes gaps 3-4 in `AGENT_CONTROL.md` [R].
2. **`TOX.run(id, args)` returning a structured result or error code.** Without it agents cannot work reliably. S-M.
3. **Persistent audit log** in IndexedDB with export, replacing the 60 in-memory lines. S.
4. **Move the bridge secret out of plain localStorage** (session-only or WebCrypto-wrapped) and add rate limit and origin binding. S.
5. **Role templates (owner, contractor, consultant)** that filter registers, show allowed document actions per type, and label clearly "not security". S-M.
6. **BCF (.bcfzip) import and export** with JSZip, no server (open standard [V: https://github.com/buildingSMART/BCF-API]). M. Gives issue exchange with Solibri, Trimble Connect, Navisworks-class tools [M].
7. **IFC import with web-ifc** as a locked reference layer. M. Largest interoperability gain; check MPL-2.0 file-level terms [R].
8. **Sets (selection and search sets) and Select Same / Hide / Require** (P0 in `gap_navisworks.md`). M. Feeds clash, TimeLiner and quantities.
9. **P6 core: relationship editing, calendars, constraints, Activity Details panel** (P0 in `gap_p6.md`). M-L. Without logic the CPM is not trustworthy.
10. **Command palette (Ctrl+K) and a user-editable shortcut table**, with a printable cheat sheet. S.
11. **Clash workflow: tests, rules, tolerance, statuses, grouping** (`gap_navisworks.md`). M-L.
12. **XER import** (tables such as TASK, TASKPRED, PROJWBS, CALENDAR per `gap_p6.md` [M]) so existing programmes load. M.
13. **IDS XML export plus a small property checker** from the information-requirements step. M.
14. **Schedules over element parameters with group, sort, totals, CSV/XLSX round trip** (Revit schedule gap, P3 in `gap_revit.md`). M.
15. **Real offline install (service worker / PWA) and project save to a folder** with the browser file APIs [M, support varies by browser]; plus a hash of each transmittal package for integrity. M.

---

## 4. Feature matrix

Legend: **yes** / **partial** / **no** / **unknown**. T.O X column is from the build log [R] and gap files; other columns are from memory [M] unless noted, so treat the matrix as a starting hypothesis, not evidence. "ACC" = Revit with ACC. Abbreviations: TOX, Rvt, TrC (Trimble Connect), Bnt (Bentley), Arc (Archicad), Prc (Procore), P6 (P6/Primavera Cloud), MSP, Nav, Sol, Bon (Bonsai), FC (FreeCAD), Spk (Speckle), TO (That Open), GIS (QGIS/ArcGIS), Coo, SKP, AI (AI-first tools).

| Feature | TOX | Rvt | TrC | Bnt | Arc | Prc | P6 | MSP | Nav | Sol | Bon | FC | Spk | TO | GIS | Coo | SKP | AI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Runs in browser only | yes | no | partial | no | no | partial | partial | partial | no | no | no | no | partial | yes | partial | yes | partial | yes |
| Works fully offline | yes | yes | no | yes | yes | no | yes | partial | yes | yes | yes | yes | no | yes | yes | no | yes | no |
| Free to use | yes | no | partial | no | no | no | no | no | no | no | yes | yes | partial | yes | partial | partial | partial | partial |
| Parametric BIM authoring | partial | yes | no | yes | yes | no | no | no | no | no | yes | partial | no | partial | no | no | partial | partial |
| IFC read | no | yes | yes | yes | yes | unknown | no | no | yes | yes | yes | yes | yes | yes | partial | unknown | partial | partial |
| IFC write | partial (IFC2X3 tested) | yes | unknown | yes | yes | no | no | no | no | no | yes | yes | partial | yes | no | unknown | partial | partial |
| 2D CAD drafting | partial | partial | no | yes | partial | no | no | no | no | no | partial | yes | no | no | partial | no | partial | no |
| CPM scheduling | partial | no | no | no | no | partial | yes | yes | no | no | no | no | no | no | no | no | no | no |
| 4D (model linked to schedule) | yes | no | partial | partial | no | no | partial | no | yes | no | partial | no | partial | partial | no | no | no | no |
| Clash detection | partial | partial | partial | yes | partial | no | no | no | yes | yes | yes | no | partial | partial | no | no | no | no |
| Rule-based model checking | partial | no | no | partial | partial | no | no | no | partial | yes | partial | no | partial | partial | no | no | no | partial |
| BCF issues | no | partial | yes | partial | yes | no | no | no | partial | yes | yes | partial | partial | yes | no | no | no | unknown |
| Document control register (RFI, submittal, NCR) | yes | partial | partial | yes | no | yes | no | no | no | no | no | no | no | no | no | no | no | no |
| Real server-side permissions and roles | no | yes | yes | yes | yes | yes | yes | yes | no | no | no | no | yes | no | yes | yes | partial | yes |
| Audit trail of changes | partial (activity log CSV) | yes | yes | yes | yes | yes | yes | partial | no | no | no | no | yes | no | partial | unknown | no | unknown |
| Multi-user live editing | partial (same browser or WebRTC) | yes | yes | yes | yes | yes | yes | yes | no | no | no | no | yes | no | yes | yes | partial | yes |
| Agent / API automation | partial (TOX bridge) | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | yes | unknown | yes | unknown |
| MCP server available | no (designed, not built) | yes | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown |
| GIS / site context | partial (offline simulation) | partial | partial | yes | partial | no | no | no | no | no | no | no | no | no | yes | no | partial | partial |
| Quantities / BOQ | yes | yes | partial | yes | yes | partial | no | no | yes | partial | yes | partial | partial | partial | no | partial | partial | partial |
| Interior library and render | no | partial | no | partial | partial | no | no | no | no | no | partial | no | no | no | no | yes | yes | partial |
| Arabic / RTL interface | yes | partial | unknown | unknown | unknown | unknown | unknown | unknown | unknown | unknown | partial | partial | unknown | unknown | partial | unknown | unknown | unknown |

Cells cited from a source: Navisworks Clash Detective is Manage only [V: Autodesk dockable-windows reference, see 1.8]; Revit offers PKCE browser access for ACC data through APS [V, see 1.1]; MCP server for Revit: exists per `AGENT_CONTROL.md` [R], MCP for the others was not researched, hence "unknown" rather than "no". Everything else is [M].

---

## 5. Risks

1. **Fake security.** Roles are cooperative only [R]. If a contractor or consultant is told roles protect data, a confidentiality failure follows. Label it and move real roles to a server before multi-company use.
2. **Prompt injection through documents.** An agent reading letters, RFIs or imported files may obey text inside them. Mitigation: treat all document text as data, require approval for edit or delete commands (items 1-2 above).
3. **Bridge secret in plain localStorage.** Readable by any script or extension in the same origin [R].
4. **Data leakage by publishing.** The page holds client project data and coordinates; the build log says ask before publishing and that the entry gate is only visual [R].
5. **Compatibility claims.** DWG, RVT, NWD cannot be written; IFC and DXF were checked only with open-source readers, never in the vendor products [R]. Do not claim vendor compatibility.
6. **Licence traps.** web-ifc MPL-2.0 (file-level copyleft) vs one source saying MIT; IfcOpenShell LGPL and Bonsai GPL are not for bundling in the page; the Autodesk Viewer is proprietary and breaks the "no vendor code" rule [R]. Re-check each LICENSE before reuse.
7. **Price and plan drift.** Every price above conflicts across sources or changes by region. Autodesk, Trimble, Speckle and Microsoft changed plans in 2025-2026 [V]. Re-check before any budget or marketing text.
8. **Engineering liability.** Outputs are drafts; calculations are not stamped; Egyptian code (ECP) methods are not implemented [R]. Say so in any hand-over.
9. **Scale and performance.** A single HTML file and bounding-box clashes will not match desktop tools on very large models; not benchmarked [R].
10. **Browser limits.** Browser storage can be cleared; IndexedDB history can be lost; some features were only mock-tested; phones and Safari not tested [R]. Provide folder or ZIP backup (item 15).
11. **Scope creep.** The owner's list covers many programmes; imitating each "exactly" risks half-built tabs. Gap files already show many commands listed but not built [R]. Prefer depth in P0 items.
12. **Comparison bias.** This file's strengths and weaknesses are largely [M], and several systems (Coohom, QGIS/ArcGIS pricing, FreeCAD licence) were not verified.

---

## 6. What was NOT verified
- Official current prices for ACC / Autodesk Build, Navisworks Manage, P6 and Primavera Cloud, Solibri, Coohom, ArcGIS, QGIS-licence page, AI-first tools.
- Licence of FreeCAD's BIM workbench, QGIS, That Open components (search did not return it).
- Every strength/weakness line marked [M]; the feature matrix cells except where cited.
- Keyboard shortcut tables for Revit and AutoCAD; time-saving figures; performance numbers.
- Full pages: most [V] items come from search excerpts, not from reading the whole page.
