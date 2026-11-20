# BIM ecosystem research for T.O X (2026-11-20)

## ملخص بالعربي (5 سطور)
1. Autodesk APS (ACC و Model Derivative و Viewer و Design Automation) ينفع يتكلم من صفحة بدون سيرفر بس بـ PKCE (تطبيق Single Page) وبالتوكن بتاع المستخدم؛ الأجزاء اللي بتتحاسب (ترجمة الموديل، Design Automation) محتاجة حساب وتكلفة.
2. المفتوح: IFC (ISO 16739-1:2024 = IFC4.3) + web-ifc (MPL-2.0، يشتغل في المتصفح WASM) هو أنسب حاجة تتعاد استخدامها؛ IfcOpenShell (LGPL) و Bonsai (GPL) على الجهاز مش في الصفحة.
3. معايير دورة الحياة: ISO 19650-2 ثمان مراحل (احتياج، دعوة مناقصة، رد، تعيين، تعبئة، إنتاج تعاوني، تسليم، إغلاق) + EIR/BEP/MIDP/TIDP + LOIN (ISO 7817-1:2024) بدل LOD.
4. مقترح لـ T.O X: 9 مراحل من الـ brief للتسليم، كل مرحلة فيها دور وكيل + فحص + بوابة موافقة بشرية، وأداة مفتوحة لكل خطوة (web-ifc, BCF, IDS, bSDD).
5. اللي ماتأكدش منه مكتوب في آخر الملف (أسعار APS الحالية، ترخيص xBIM وSpeckle بالتفصيل، محتوى مراحل 6-8 من ISO 19650-2).

## Evidence labels
- **VERIFIED** = the claim appeared in a search result text from the cited URL on 2026-11-20. Note: I read search-result excerpts, not always the full page. Treat VERIFIED as "source seen", re-check before contract/legal use.
- **MEMORY** = from my own knowledge, no URL read in this session. Re-check before relying on it.
- Nothing here copies vendor code or artwork.

---

## A. Autodesk Construction Cloud (ACC / BIM 360) and Autodesk Platform Services (APS)

APS was Forge, renamed 2021 (VERIFIED: https://aps.autodesk.com/node/2178). BIM 360 APIs and ACC APIs were being merged under the ACC naming (VERIFIED partly: RFI v2 consolidated with BIM 360 RFI, https://aps.autodesk.com/node/3723).

| Service | What it does | Auth | Limits / cost | Pure browser app? |
|---|---|---|---|---|
| Authentication (OAuth v2) | Gets 2-legged (app) or 3-legged (user) tokens | 3LO with PKCE for Single Page App type (VERIFIED: https://aps.autodesk.com/blog/getting-token-pkce-single-page-app, sample https://github.com/autodesk-platform-services/aps-pkce-webapp, MIT) | Authentication is listed as included, no per-call charge (VERIFIED, pricing profile via https://apis.io/plans/autodesk/autodesk-plans-pricing/, aggregator, weak) | YES for 3-legged with PKCE. 2-legged needs a client secret: never put it in the page (MEMORY, standard OAuth rule). |
| Data Management | Hubs, projects, folders, items, versions, OSS buckets (storage) | 3LO for ACC/BIM 360 hub data; 2LO for own buckets | Included in plan (aggregator, weak). 429 + retry-after when over limit (VERIFIED: https://aps.autodesk.com/en/docs/data/v2/developers_guide/rate-limiting/forge-rate-limits) | Probably yes with a 3LO token. CORS behaviour per endpoint NOT verified: test with a real call. |
| Model Derivative | Translates Revit/DWG/IFC/NWD etc. into viewable SVF2 and extracts properties/geometry | Token with data:read/write | Usage based, billed (VERIFIED: aggregator https://apis.io/plans/autodesk/autodesk-plans-pricing/) | Calls yes (if CORS ok); the cost goes to the signed-in user's APS app owner. |
| Viewer (JS) | Renders translated models in a page | Token | Viewer SDK calls included (aggregator, weak) | Yes, it is a JS library loaded from an Autodesk CDN. Licence: proprietary terms of service, MEMORY. It conflicts with the T.O X rule "no vendor code", so use only as an optional external link or iframe, not bundled. |
| Design Automation (now "Automation API") | Runs Revit/AutoCAD/Inventor/3ds Max headless in the cloud: WorkItem -> Activity -> Engine + AppBundles (VERIFIED: https://aps.autodesk.com/en/docs/design-automation/v3/developers_guide/field-guide) | 2LO or 3LO | 100 calls/min per app; quotas per engine; billed by usage (VERIFIED: https://aps.autodesk.com/en/docs/design-automation/v3/developers_guide/rate-limits/da-rate-limits). Renamed Automation API 2025-06-30 (VERIFIED: https://aps.autodesk.com/en/docs/design-automation/v3/change_history/changelog_v3/). | Needs a plugin (C# bundle) built on a desktop first. Calls from page are possible; the bundle is not. |
| Webhooks | Server pushes events (file versions, etc.) to a URL | 2LO or 3LO | Rate limits https://aps.autodesk.com/en/docs/webhooks/v1/developers_guide/rate-limits/forge-rate-limits (VERIFIED, numbers not read) | NO. A webhook needs a public HTTPS endpoint. A static page has none: use polling, or a tiny relay (n8n, serverless). |
| ACC Issues / RFIs / Submittals | Project-management data | 3LO (write depends on user permissions, VERIFIED for Submittals) | Submittals: 600 req/min per key and per user (VERIFIED: https://aps.autodesk.com/en/docs/acc/v1/overview/rate-limits/submittals-rate-limits). RFI v3 released July 2025, base path /construction/rfis/v3/projects/:projectId (VERIFIED: https://aps.autodesk.com/node/3723). Submittals write endpoints added in phases through March 2025 (VERIFIED: https://aps.autodesk.com/node/3607). | Calls yes with 3LO, subject to CORS test. |

Cost model (VERIFIED, mixed): chargeable APIs used Cloud Credits, moved to Flex tokens (Nov 2022, https://aps.autodesk.com/node/2386; end of 2025 notice https://aps.autodesk.com/node/3776); one APS page dated 27 Oct 2026 mentions an upcoming pricing change (https://aps.autodesk.com/node/3881). NOT VERIFIED: current per-unit prices. Get them in the APS console.

Account prerequisites (MEMORY): free APS developer account, an app with client ID; ACC data access also needs the project admin to add the app (custom integration) to the account. ACC itself is a paid product, not free.

**Can a pure browser app call it?** Auth: yes (PKCE). Data calls: likely, per-endpoint CORS not tested. Not possible: webhooks (need a server), Design Automation plugin build, 2LO (secret). All of it requires the user's own Autodesk login and (for paid parts) their billing. T.O X should treat APS as an optional connector, never as a dependency.

---

## B. Open source and open BIM

| Item | Licence | Language | Reusable by a browser app | Maturity / notes |
|---|---|---|---|---|
| IFC 2x3, 4, 4.3 (schema) | ISO 16739-1:2024 = IFC 4.3, adds roads, rail, bridges, waterways, ports (VERIFIED: https://www.iso.org/standard/84123.html, https://ifc43-docs.standards.buildingsmart.org/IFC/RELEASE/IFC4x3/HTML/content/scope.htm). IFC4X3_ADD2 docs = same schema + clarifications, page still marked "under development" (VERIFIED, same site). IFC2x3 and IFC4 are older ISO 16739 editions (MEMORY). | EXPRESS / STEP text, also ifcXML, ifcJSON (MEMORY) | Yes: the data model for T.O X export. Write STEP text from JS, simple subset first. | Stable standard. Real-world exporters mostly IFC2x3/IFC4 (MEMORY). |
| web-ifc (That Open Engine) | MPL-2.0 (VERIFIED by several results, one outlier says MIT; check LICENSE in repo: https://github.com/ThatOpen/engine_web-ifc) | C++ compiled to WebAssembly, JS API | YES, runs fully in browser, no server. Reads/writes IFC; IFC4X3 schema option exists (VERIFIED: https://skills.sh/openaec-foundation/thatopen-claude-skill-package/thatopen-core-web-ifc, secondary). | Active, widely used. MPL-2.0 is file-level copyleft: fine to load as a separate file, edits to its files must be shared. |
| That Open Components | licence of @thatopen/components NOT verified | TypeScript on three.js | Yes (viewer, fragments, BCF, IDS-related components per project docs, MEMORY) | Active; web-ifc-three is deprecated (VERIFIED, secondary: skills.sh page above). |
| IfcOpenShell | LGPL (VERIFIED: https://wiki.osarch.org/index.php/Free_software_libraries_for_AEC_software_development, and search results on github.com/IfcOpenShell) | C++ with Python bindings; also a WASM/JS build exists (MEMORY) | Desktop/server side: validation, IfcPatch, IDS check (ifctester), clash. A Pyodide-in-browser route exists in community (MEMORY, not tested). | Mature, the reference open toolkit. |
| Bonsai (ex BlenderBIM) | GPL-3.0-or-later (VERIFIED: search result tool table, github.com/IfcOpenShell family) | Python, Blender add-on | No (needs Blender). Useful as the "desktop model editor" a Blender MCP could drive. | Mature, active. |
| xBIM | CDDL per one source only (VERIFIED weakly: https://wiki.osarch.org/index.php/Free_software_libraries_for_AEC_software_development) | C# / .NET | No (server/desktop). | Mature. Re-check licence before use. |
| FreeCAD BIM workbench | LGPL (MEMORY; not verified this session) | Python/C++ | No. Desktop; scriptable headless, so a server-side agent target. | Mature but UI-heavy. |
| Speckle | Server code Apache-2.0 except enterprise modules (workspaces, gatekeeper) under a separate licence (VERIFIED: https://github.com/specklesystems/speckle-server and review page via search). Hosted platform is commercial. | TypeScript server, viewer, connectors in C#/Python | Speckle viewer and object model are JS; a free hosted account + token could work from a browser (CORS NOT tested). | Active. Connectors for Revit/AutoCAD exist (MEMORY). |
| BIMserver | Mostly AGPLv3 per project; IFCEngine part is NOT open source (VERIFIED: https://github.com/opensourceBIM/BIMserver/wiki/License) | Java | No: server. | Older, less active than Speckle (MEMORY). Avoid as default. |
| buildingSMART bSDD | Free service by buildingSMART (VERIFIED: https://www.buildingsmart.org/?p=29545) | REST/GraphQL API (MEMORY) | Yes: simple HTTPS lookups of class names and properties from the page (CORS not tested). | Production service. |
| BCF (issues) | Open standard; XML file (.bcfzip) and REST BCF-API (VERIFIED: https://github.com/buildingSMART/BCF-API, https://github.com/buildingsmart/bcf) | XML / JSON | Yes: T.O X can read/write .bcfzip with JSZip, no server. | Mature file format, v2.1 / v3.0 (MEMORY). |
| IDS (Information Delivery Specification) | buildingSMART open standard, machine-readable information requirements (VERIFIED, description only: https://catenda.com/glossary/buildingsmart-standards) | XML (XSD) | Yes: write IDS XML from the EIR step, check IFC with web-ifc in JS (own checker) or ifctester on desktop. | IDS 1.0 released 2024 (MEMORY). |
| openCDE APIs | Foundation API + Documents API 1.0 + BCF API (VERIFIED: https://github.com/buildingSMART/technical.buildingsmart.org/blob/main/openCDE-API.md, https://github.com/buildingSMART/documents-API). Described as still maturing (VERIFIED, secondary). | REST + OAuth2 | Possible client side, needs a CDE that implements it. | Early. Do not depend on it. |

Browser reuse summary: web-ifc (read/write IFC), BCF zip, IDS XML, bSDD lookups, optionally Speckle viewer. Everything else (IfcOpenShell, Bonsai, FreeCAD, xBIM, BIMserver) is desktop/server: reach it through the agent bridge (see AGENT_CONTROL.md), not inside the page.

---

## C. Standards for the project lifecycle

**ISO 19650-2 delivery phase, 8 stages** (VERIFIED list: ANSI preview https://webstore.ansi.org/preview-pages/ISO/preview_ISO+19650-2-2018.pdf and DIN TOC via search; clause detail for stages 6-8 NOT read):
1. Assessment and need (reference info, CDE, information protocol)
2. Invitation to tender (tender requirements, evaluation criteria)
3. Tender response (pre-appointment BEP, capability and capacity, mobilization plan, risk register)
4. Appointment (confirm BEP, responsibility matrix, MIDP)
5. Mobilization (resources, IT, test production methods)
6. Collaborative production of information
7. Information model delivery
8. Project close-out

**Document set** (VERIFIED, secondary: https://www.cdbb.cam.ac.uk/files/bep_guidance.pdf and designingbuildings wiki):
- EIR: Exchange Information Requirements, from the appointing party: what information, format, milestones.
- BEP: lead appointed party's plan to meet EIR; pre-appointment then confirmed post-appointment.
- MIDP: project-wide schedule of deliverables; living document.
- TIDP: each task team's part of the MIDP.
- A 2026 draft revision reportedly renames BEP to "Information Production Plan", final expected 2027: single secondary source, NOT verified.

**LOIN / LOD:** ISO 7817-1:2024 "Level of information need" is current (VERIFIED: https://www.iso.org/standard/82914.html; adopted from EN 17412-1, which is withdrawn). It moves away from LOD/LOG/LOI labels towards specifying need per purpose, per object (VERIFIED, secondary: https://constructionmanagement.co.uk/new-level-of-information-need-standard-published/). LOD 100-500 labels (AIA/BIMForum) are still widely used by contracts (MEMORY). Whether LOD is formally superseded: not stated by sources.

**COBie:** spreadsheet/IFC subset for handover asset data (MEMORY, no URL read; I did not verify details). Treat as a Phase-8 export from the model; the IFC Facility Management Handover MVD is the formal route (MEMORY).

**7D (asset/facility management data):** the usual convention is 3D model, 4D schedule, 5D cost, 6D sustainability, 7D facility management (MEMORY; conventions vary by author, no authoritative standard found). For T.O X: 7D = asset register (type, serial, warranty, maintenance interval) exported at handover.

---

## D. Recommended lifecycle for T.O X

Principle: map ISO 19650 stage names, but keep it light for a browser tool. Agents propose, humans approve at gates. Every output is stored with source and "verified / assumed" flag. No invented values: missing input becomes a question to the client.

| # | T.O X stage (ISO 19650-2 stage) | Agent role does | Automatic checks | Human gate | Open tool / format |
|---|---|---|---|---|---|
| 0 | Brief intake (1 Assessment and need) | **Client-liaison agent** turns text brief into structured requirements, asks missing questions (site, area, budget, code, climate) | Completeness list; unit sanity | G1: client confirms brief summary | Plain JSON; bSDD for class names |
| 1 | Information requirements (1-2) | **Information manager agent** drafts EIR and IDS | IDS XML schema-valid | G2: client approves EIR | IDS XML, BCF for questions |
| 2 | Plan (3-4) | **Project-manager agent** drafts BEP, MIDP, TIDP, responsibility matrix, programme (P6 tab) | Each deliverable has owner, due, LOIN | G3: lead approves BEP/MIDP | Own register in T.O X; export CSV/XER later |
| 3 | Setup (5 Mobilization) | **Information manager agent** creates folder/CDE structure and naming, tests the exchange formats | Naming rule check; round-trip test IFC | none (auto) | Folder tree, web-ifc test |
| 4 | Concept and analysis (6) | **Architect, civil, structural agents** produce massing, site grading, preliminary sizing | Own calc modules; units; code-clause list shown | G4: designer signs concept | T.O X tabs; calculations flagged "preliminary, not stamped" |
| 5 | Detailed design (6) | **Architect, structural, MEP, electrical agents** model in the tabs | Rule checks per discipline; schedule from model | G5: licensed engineer review per discipline | IFC export via web-ifc |
| 6 | Coordination and review (6) | **Coordination agent** runs clash, IDS check, compares LOIN, writes issues | Clash list; IDS pass/fail; missing-property list | G6: coordination meeting decision per issue | BCF issues; optional IfcOpenShell on desktop for clash/IDS |
| 7 | Delivery and approval (7) | **Reviewer agent** assembles package, checks MIDP vs delivered | Every MIDP item delivered or waived | G7: client/authority acceptance | IFC + BCF + PDF drawings |
| 8 | Handover and close-out (8) | **Asset agent** builds COBie/asset register, archive, lessons learned | Mandatory COBie fields filled | G8: client signs handover | COBie sheet, IFC |

Gate rules: a gate cannot be passed by an agent. The page shows a stage banner, an indicator of open questions, open issues, and unapproved outputs. Stage cannot advance with blocking issues. Everything an agent produced is tagged "AI draft" until a person approves.

Boundary statement for the UI: outputs are drafts for qualified engineers; T.O X does not replace stamped design (professional responsibility rests with licensed engineers).

---

## What was NOT verified
- Current APS per-unit prices and whether Cloud Credits are fully retired (conflicting pages).
- CORS behaviour of each APS endpoint from a browser origin (no live test).
- Licences of xBIM (one source), FreeCAD BIM, @thatopen/components; speckle-sharp licence.
- ISO 19650-2 clause content of stages 6-8; COBie details; 7D definition (convention only).
- Full text of any ISO standard (paywalled); only titles, abstracts and tables of contents.
- Most search results were excerpts, not full pages.
