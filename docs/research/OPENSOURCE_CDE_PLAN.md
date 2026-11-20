# Open-source plan for a T.O X project-lifecycle hub (CDE) — 2026-11-20

## ملخص بالعربي (6 سطور)
1. المطلوب "مركز مشروع" زي BIM 360/ACC: أدوار (مالك / مقاول / استشاري)، مجلدات (RFI, IR, MOM)، Submittals وTransmittals وIssues وجداول وطلبات، وأربع أوضاع: ابدأ من الصفر / استورد وعدّل / راجع وطبّق / متابعة مستمرة.
2. اللي ينفع نحطه فعلاً جوه صفحة ثابتة: **web-ifc** (MPL-2.0، WASM) + **That Open components/fragments** (MIT) لعرض IFC، و**frappe-gantt** (MIT) أو **DHTMLX Gantt Community** (طلع MIT دلوقتي، مش GPL، اتأكدت من الـ README والـ package.json) للجداول.
3. ممنوع نضمّن: **xeokit** و**BIMserver** و**OpenProject** و**Paperless-ngx** و**ERPNext** (AGPL/GPL = copyleft هيفرض ترخيصها على T.O X لو دمجنا الكود)؛ نتعلم منها الـ schema والـ workflow بس ونكتب بتاعنا.
4. **BCF و IDS** مواصفات buildingSMART بترخيص CC BY-ND (مسموح نقرأها ونطبّقها، ممنوع نعدّل نصها وننشره)؛ **Speckle** سيرفر Apache-2.0 (ما عدا مجلدين Enterprise) بس محتاج Docker وقاعدة بيانات = مش browser-only، نتعلم منه.
5. تحذير مهم: صفحة ثابتة مفيهاش سيرفر، فالأدوار (مالك/مقاول/استشاري) هتبقى **تنظيم شغل مش أمان**؛ المشاركة بين الأطراف بحزم Transmittal قابلة للتصدير/الاستيراد (ZIP + JSON موقّع بـ hash) لحد ما نضيف سيرفر اختياري.
6. أول 10 حاجات للإضافة في آخر الملف (الأولى: نموذج بيانات المشروع + سجل المستندات + حالات ISO 19650 + محرك الـ workflow)؛ كل الأرقام من GitHub API يوم 2026-11-20، وكل ما هو "من الذاكرة" متعلّم صراحة.

## Evidence labels and method
- **VERIFIED-API** = read from `gh api repos/<owner>/<repo>` (licence SPDX, `pushed_at`, size, archived) on 2026-11-20.
- **VERIFIED-FILE** = I read the LICENSE / README / package.json text of that repo on 2026-11-20 (what was read is named).
- **MEMORY** = from my own knowledge, no page read. Re-check before relying on it.
- `size` is the GitHub repo size in MB (git history + files), **not** the shipped bundle size.
- "NOASSERTION" from the API means GitHub could not classify the licence; I read the file where noted.
- Nothing here copies vendor code, schemas verbatim, or artwork. Read-only research; no app source was edited.
- Overlap: Autodesk APS facts (VERIFIED) are in `BIM_ECOSYSTEM.md`; news/CRM in `NEWS_CRM_PLAN.md`. Not repeated.

---

## 1. The browser-only constraint (read this first)
T.O X is a static site. That decides most verdicts:
- **No server = no shared state.** Three parties (owner, contractor, consultant) cannot see one live register. Options, cheapest first: (a) **transmittal packages**: export a ZIP (files + `register.json` + SHA-256 per file), the other party imports it; works offline, auditable. (b) a shared folder / Git repo as the store (File System Access API or GitHub API with the user's own token). (c) optional sync server later (Supabase / own API); keep storage behind one adapter interface so this is a swap, not a rewrite.
- **Roles are workflow labels, not security.** Anyone with the file can edit `localStorage`/IndexedDB. Do not call this "access control" in the UI until a server enforces it. State this in the product text.
- **CORS:** feeds (RSS), most project APIs and Autodesk endpoints may not send CORS headers. News needs a tiny relay (see `NEWS_CRM_PLAN.md`). Autodesk calls are 3-legged PKCE only (VERIFIED in `BIM_ECOSYSTEM.md`).
- **Licence rule for embedding:** MIT / BSD / Apache-2.0 = embed freely with notice. MPL-2.0 = file-level copyleft, fine if we ship the library unmodified and keep its licence. LGPL = ok as a separate dynamically-loaded component, awkward in a bundled static page. GPL / AGPL = embedding forces the whole T.O X combined work under that licence and publishing source; AGPL also triggers on network use. Only embed those if the owner decides T.O X itself is released under the same licence. That is a business decision, not mine.

---

## 2. Candidate table

### 2a. BIM viewers, servers, formats
| Project | Licence | Last push | Size | Browser-only? | What we would take | Risks | Verdict |
|---|---|---|---|---|---|---|---|
| **web-ifc** (ThatOpen/engine_web-ifc) | MPL-2.0 (VERIFIED-API; npm `web-ifc` 0.0.80, MPL-2.0 VERIFIED) | 2026-11-20 | 284 MB | **Yes**, C++ built to WASM with emscripten (VERIFIED-FILE README: build via emscripten). Also runs in Node. | Parse IFC in the page: spatial tree, properties, quantities, geometry. This is the IFC engine. | MPL file-level: ship unmodified, keep notice. WASM memory on big models (MEMORY: hundreds of MB IFC can fail on mobile). Version 0.0.x = API churn, pin the version. | **EMBED** |
| **That Open engine_components** | MIT (VERIFIED-API) | 2026-11-08 | 267 MB | Yes (three.js based) | Ready-made loader, clipper, measurements, hider, **BCF topics** component (MEMORY: BCFTopics exists, not read). | Pulls three.js + fragments; keep to the pieces we need; semver churn. | **EMBED** (selective) |
| **That Open engine_fragment** | MIT (VERIFIED-API; npm `@thatopen/fragments` 3.6.1 MIT) | 2026-11-08 | 87 MB | Yes | Compact binary model format so IFC is converted once and reloaded fast. | Format may change between majors; store original IFC alongside. | **EMBED** |
| web-ifc-viewer / web-ifc-three | MIT | 2023-09-29 / 2024-04-17 | 54 / 41 MB | Yes | Nothing. Superseded by components. | Stale. | **SKIP** |
| **xeokit-sdk / xeokit-bim-viewer** | **AGPL-3.0** (VERIFIED-FILE: LICENSE is AGPL text; README says AGPLv3 and sells a commercial licence) | 2026-11-18 / 2026-11-16 | 2615 / 497 MB | Yes (WebGL) | Learn: tree/storey/section-plane UX, XKT idea of pre-converted compact model. | AGPL forces source release of anything combined with it, including over a network. Commercial licence costs money. | **LEARN-FROM** (do not bundle) |
| **BIMserver** (opensourceBIM) | AGPL-3.0 (VERIFIED-API) | 2026-03-13 | 632 MB | **No** (Java server) | Learn: revision model, IFC merge/diff, query-by-class API. | AGPL + server + Java; 8 months quiet. | **SKIP** (learn model only) |
| **IfcOpenShell** | LGPL-3.0 (VERIFIED-API) | 2026-11-19 | 386 MB | Native C++/Python. A Pyodide/WASM route exists (MEMORY, not verified). | Schema-aware read/write/validate, IDS checking, IFC4.3 authoring, BCF python (`ifcopenshell.api`), **Bonsai** is GPL (separate). | LGPL fine as a separate service; in-page WASM build is large (tens of MB, MEMORY) and loads slowly. | **LEARN-FROM** now; optional local helper later for IDS validation |
| **buildingSMART BCF-XML / BCF-API** | **CC BY-ND 4.0** (VERIFIED-FILE LICENSE) | 2024-10-21 / 2025-06-16 | 18 KB / 2 KB | Spec only | Issue file format: topics, comments, viewpoints (camera + clipping + component selection + snapshot), `.bcfzip`. Implement our own reader/writer. | ND = do not publish a modified copy of the spec text/schemas. Implementing the format is fine. Re-check ND wording with a lawyer before shipping a bundled XSD. | **LEARN-FROM / implement** |
| **buildingSMART IDS** | CC BY-ND 4.0 (VERIFIED-FILE) | 2026-09-25 | 98 MB | Spec only | Information Delivery Spec: machine-readable "what data each element must have" checks, ties to LOIN. | Same ND note. A JS checker is ours to write; IfcOpenShell has a reference one. | **LEARN-FROM** |

### 2b. CDE, document control, project management
| Project | Licence | Last push | Size | Browser-only? | What we would take | Risks | Verdict |
|---|---|---|---|---|---|---|---|
| **Speckle** (speckle-server) | Apache-2.0 except `workspaces/` and `gatekeeper/` dirs under Speckle Enterprise licence (VERIFIED-FILE LICENSE head) | 2026-11-12 | 419 MB | **No**: server packages incl. `server`, `frontend-2`, `ifc-import-service`, `fileimport-service`, `preview-service`, `webhook-service` (VERIFIED-API dir listing). Postgres + Redis + S3-style storage needed (MEMORY). `viewer`, `objectloader`, `objectsender` are separate packages. | Learn: object-graph commits (stream/project → model → version), connectors, webhooks. Possibly embed `@speckle/viewer` later if the owner hosts a Speckle server. | EE dirs must be avoided; self-host effort; viewer needs a server to feed it. | **LEARN-FROM** |
| **OpenProject** | GPL-3.0 (VERIFIED-API) | 2026-11-20 | 3.2 GB | No (Ruby on Rails). Has `bim`, `meeting`, `documents`, `gantt`, `backlogs`, `budgets`, `costs`, `storages`, `webhooks` modules (VERIFIED-API dir listing). | Learn: work-package types, statuses and **per-role workflow transitions**, meeting minutes (our MOM), BCF issue linkage, role/permission matrix. | GPL: cannot copy code into T.O X unless T.O X is GPL. Heavy install. | **LEARN-FROM** (best model for roles + workflows) |
| **Frappe Framework** | MIT (VERIFIED-API) | 2026-11-20 | 1.1 GB | No (Python + MariaDB server) | Learn: DocType + workflow-state + permission-per-role pattern. | Server-only; huge. | **LEARN-FROM** |
| **ERPNext (Projects)** | GPL-3.0 (VERIFIED-API) | 2026-11-20 | 2.1 GB | No | Learn: Project / Task / Timesheet / Issue field sets. | GPL. | **LEARN-FROM** (schema ideas only) |
| **Paperless-ngx** | GPL-3.0 (VERIFIED-API) | 2026-11-20 | 239 MB | No (Django + OCR) | Learn: correspondent / document type / tag / storage path, **auto-match rules**, consume-folder idea, full-text index, audit log. | GPL. OCR stack is heavy. | **LEARN-FROM** |
| **Nextcloud** (server, workflow engine) | AGPL-3.0 (VERIFIED-API) | 2026-11-20 | 7.6 GB | No (PHP server) | Learn: **Flow = event + conditions + action** rule builder; file tags; share links with expiry/password. | AGPL; server. | **LEARN-FROM** |
| **Plane** (makeplane/plane) | AGPL-3.0 (VERIFIED-API; `plane-so/plane` path 404, repo moved) | 2026-11-18 | 220 MB | No | Learn: issue / cycle / module / state-group model (backlog, unstarted, started, completed, cancelled). | AGPL. | **LEARN-FROM** |
| **Taiga back** | MPL-2.0 (VERIFIED-API) | 2026-11-03 | small | No (Django) | Learn: kanban/epics/user-story shape. | Not construction-specific. | **SKIP** |
| **PocketBase** | MIT (VERIFIED-FILE) | 2026-10-26 | 147 MB | No (single Go binary, but a server) | Would be the easy optional sync backend (auth, collections, rules, realtime) behind our adapter. | GitHub API says **archived = true** (VERIFIED-API); I did not read why. Do not depend on an archived project without a fork plan. | **SKIP** until status is clear |
| **Zulip, drawio, tldraw** | Apache-2.0 / Apache-2.0 / custom (NOASSERTION, MEMORY: watermark/commercial terms) | active | 665 / 1870 / 1665 MB | No / yes / yes | Not core. | tldraw licence is not permissive for us. | **SKIP** |

### 2c. Gantt and schedule
| Project | Licence | Last push | Size | Browser-only? | What we would take | Risks | Verdict |
|---|---|---|---|---|---|---|---|
| **frappe-gantt** | MIT (VERIFIED-API; npm 1.2.2 MIT) | 2026-06-18 | 2.7 MB | Yes, tiny SVG lib | Read-only-ish timeline with drag, dependencies arrows, view modes. Good for the hub's "schedule" tab. | No critical path, no resources, no baselines. We compute CPM ourselves (P.X already exists). | **EMBED** |
| **DHTMLX Gantt (Community)** | **MIT** (VERIFIED-FILE: README says Community Edition, MIT; `package.json` `"license": "MIT"`, version 10.0.4; npm `dhtmlx-gantt` license = MIT) | 2026-11-19 | 56 MB | Yes | Mature gantt with editing; README states **auto-scheduling, critical path, resource management are PRO (commercial)**. | **The "GPL caveat" in the brief is outdated for the Community package**: it is MIT now (older standard edition was GPL-2.0, MEMORY). Still: PRO features need a paid licence; check the Community feature table before promising baselines. Keep our own CPM so no dependency on PRO. | **EMBED** as optional richer view; keep frappe-gantt as default |
| jsgantt-improved | BSD-3-Clause (VERIFIED-FILE head) | 2026-04-14 | 5 MB | Yes | Alternative; old code style. | Smaller community. | **SKIP** (spare) |
| gantt-task-react | MIT | 2024-08-12 | 5.6 MB | React only | — | **Archived** (VERIFIED-API). | **SKIP** |
| mermaid | MIT | 2026-11-20 | 284 MB | Yes | Draw the workflow (state diagrams) in the docs/help tab; also has a `gantt` diagram type for quick views. | Not an editor. | **EMBED** (docs only) |
| bpmn-js | LICENSE starts with MIT text, © Camunda (VERIFIED-FILE head only) | 2026-11-19 | 18 MB | Yes | Visual workflow editor. | MEMORY: the bpmn.io licence adds a clause that the logo/watermark must stay visible. I did not read the rest of the file. Overkill for a fixed ISO 19650 state machine. | **LEARN-FROM** (skip until we need user-drawn workflows) |

### 2d. Viewer/utility pieces for the hub
| Project | Licence | Last push | Browser-only? | Use | Verdict |
|---|---|---|---|---|---|
| **pdf.js** | Apache-2.0 | 2026-11-20 | Yes | Preview drawings/submittals/RFIs, text layer for search, annotate overlay. | **EMBED** |
| **sql.js** / **wa-sqlite** | MIT (sql.js VERIFIED-FILE; wa-sqlite VERIFIED-API) | 2026-11-19 / 2026-11-18 | Yes (WASM SQLite; wa-sqlite can persist in OPFS) | Real queryable register in-page (filter, sort, join) instead of hand-rolled arrays. | **EMBED** (one of them) |
| **Yjs / Automerge** | MIT (yjs VERIFIED-FILE; Automerge VERIFIED-API) | 2026-11-16 / 2026-11-17 | Yes | CRDT merge so two parties' registers can be merged without a server (WebRTC/file exchange). Optional phase 2. | **LEARN-FROM** now, embed in phase 2 |
| **FreshRSS** / **Miniflux** | AGPL-3.0 / Apache-2.0 (VERIFIED-API) | 2026-11-20 / 2026-11-19 | No (servers) | Learn: OPML import, feed-item de-dup by GUID, folders, read/starred state. Miniflux (Apache) is a safe model to copy ideas from. In-browser we need a CORS relay. | **LEARN-FROM** |

---

## 3. Competitor lifecycle models (all MEMORY unless noted)
Autodesk ACC facts that were read are in `BIM_ECOSYSTEM.md` (VERIFIED there: ACC APIs, RFIs, Submittals, rate limits). The table below is my recollection of product positioning, not a page read today.

| Platform | Lifecycle model | Strengths | Weaknesses |
|---|---|---|---|
| **Autodesk BIM 360 / ACC** | Modules per phase: Docs (folders, versions, markups, sheets), Build (RFIs, submittals, issues, forms, assets), Design Collaboration (package sharing between disciplines), Takeoff, Cost; project roles + folder permissions; transmittals. | Tight with Revit/Civil 3D/Navisworks; versioning + markup; wide API (APS). | Per-seat cost; permission model complicated; BIM 360 being folded into ACC; vendor lock-in; weak on formal ISO 19650 naming/state out of the box (needs config). |
| **Procore** | Project-management first: bid → pre-construction → build → closeout; RFIs, submittals, daily logs, drawings, budget, change events/orders, punch lists, inspections. | Best owner/GC cost + field tooling; huge marketplace; mobile first. | Models/BIM are secondary; priced per project value; less design-side coordination. |
| **Aconex (Oracle)** | Document-centric **correspondence**: mail types, transmittals, formal workflows, audit trail, neutral to every party's system. | Contractual audit trail, large infrastructure/oil & gas use, multi-party neutrality (closest to formal "transmittal" culture). | Dated UI; model viewing weaker; heavy rollout. |
| **Trimble Connect** | Open CDE: files, 3D model viewing, issues/BCF, ToDos, apps ecosystem; works with Tekla, SketchUp, Viewpoint. | Open formats (IFC/BCF) friendly; free tier; good on-site field with Trimble hardware. | Less formal document-control workflow; fewer finance modules. |
| **Bentley ProjectWise** | Engineering-content CDE: managed-workspace, document check-in/out, formal **state and workflow** per document, civil/infrastructure (MicroStation, OpenRoads), iTwin for digital twins. | Strong infrastructure engineering, true document states + revision control, enterprise audit. | Complex/expensive; heavy admin; best only inside Bentley stack. |
| **ISO 19650 (neutral reference)** | CDE zones: **WIP → Shared → Published → Archive**, with approval gates and a naming convention; 8 stages (see `BIM_ECOSYSTEM.md`). | Vendor-neutral; maps cleanly to any tool. | A standard, not a product; needs implementation. |

**Gap T.O X can own:** free, offline-capable, Arabic-first, ISO 19650 states by default, transmittal packages as the sharing unit. We will not match their cloud, mobile or contract-grade audit; we say so.

---

## 4. Data model sketch (own implementation; ideas from ISO 19650, OpenProject workflows, Paperless metadata, Nextcloud flows, BCF)

### 4.1 Roles (workflow labels; real enforcement needs a server)
`owner` (client/employer), `consultant` (designer/supervisor/engineer of record), `contractor` (GC), `subcontractor`, `dctl` (document controller, can run transmittals), `viewer`.
Per role, per folder: `read | upload | review | approve | admin`. Matrix lives in `project.permissions[]`. Defaults:
- owner: approve on Contract / Approvals, read elsewhere.
- consultant: review + approve on Design, Submittals, RFI replies, IRs; upload on Design.
- contractor: upload on WIP/Shared contractor folders, raise RFI / IR / Submittal / Transmittal.
- dctl: admin on registers, issues transmittals, cannot approve content.

### 4.2 Entities
```
Project   { id, name, code, phases[], parties[], createdAt, mode }   // mode: scratch | import | review | followup
Party     { id, projectId, org, role, people[] }
Folder    { id, projectId, path, kind, namingTemplate, permissions[] }
Document  { id, projectId, folderId, number, title, discipline, type,
            rev, state, versions[ {rev, fileHash, size, by, at, note} ],
            tags[], linkedIds[], due, owner }
Workflow  { id, kind, states[], transitions[ {from,to,roles[],requires[]} ], sla }
Item      { id, kind, number, title, state, ballInCourt, due, priority,
            raisedBy, assignees[], docRefs[], modelRefs[], bcf?, thread[], history[] }
Transmittal { id, no, from, to[], purpose, items[docId@rev], issuedAt, responseDue, ackBy[], packageHash }
ScheduleTask { id, wbs, name, start, finish, deps[], pct, baseline?, linkedItems[] }
Meeting   { id, date, attendees[], agenda[], minutes[ {text, action?, owner, due} ], nextDate }
Audit     { at, who, action, entityId, before?, after?, hash }   // append-only, hash-chained
```

### 4.3 Folder tree (default; ISO 19650-inspired + the owner's RFI / IR / MOM folders)
```
00 Project Info (contract, EIR, BEP, MIDP)
01 WIP            (per party, private until shared)
02 Shared         (coordinated, review allowed)
03 Published      (approved for construction / for information)
04 Archive        (superseded, read-only)
10 Correspondence
   RFI/            (Requests for Information)
   IR/             (Inspection / Material Inspection Requests)
   Submittals/     (shop drawings, materials, samples, method statements)
   Transmittals/   (issued packages + receipts)
   MOM/            (Minutes of Meeting)
   Letters/
20 Design (Arch / Str / MEP / Civil / Survey)  -> models (IFC), drawings (PDF/DWG), specs, BOQ
30 Site (daily reports, photos, NCR, snag list)
40 Schedule & Cost (baseline, updates, EOT claims, payment certificates)
50 Closeout (as-built, O&M, warranties, handover)
```
Naming template (ISO 19650 style, editable): `PROJ-ORIG-VOL-LVL-TYPE-ROLE-CLASS-NUM_REV` e.g. `TOX-ABC-XX-00-DR-A-0001_P01`.

### 4.4 Document states (CDE) and revision codes
`WIP` (S0 / P-rev: private) → `Shared` (S1–S4: coordination, review, information) → `Published` (A-rev: approved) → `Archived` (superseded).
Review outcome codes (colourable): **A** approved, **B** approved with comments, **C** revise and resubmit, **D** rejected / for information only. Suitability: S0 WIP, S1 coordination, S2 information, S3 review/comment, S4 approval, A/B construction.

### 4.5 Workflows (state machines)
- **RFI:** `Draft → Submitted → In Review (ballInCourt = consultant) → Answered → Closed` (branches: `Rejected`, `Reopened`, `Overdue` auto-flag at due date). Links: drawing, model element (BCF viewpoint), spec clause. Cost/time impact flags (Y/N) feed the claim log.
- **IR (Inspection Request):** `Raised by contractor → Scheduled → Inspected → Approved | Approved with comments | Rejected → Re-inspect → Closed`. Attach checklist (ITP) and photos.
- **Submittal:** `Draft → Submitted → Reviewed (A/B/C/D) → Resubmit (new rev) → Approved → Closed`; multi-reviewer sequence (consultant → PM → owner).
- **Transmittal:** `Draft → Issued → Received/Acknowledged → Response due → Closed`; contains a frozen list of `doc@rev` + hash.
- **Issue / clash (BCF-shaped):** `Open → Assigned → In Progress → Resolved → Verified → Closed`, with viewpoint (camera, clip, components) and comments; export as `.bcfzip`.
- **MOM:** agenda → minutes → action items (each action becomes an Item with owner + due) → next meeting carries open actions.

### 4.6 The four modes
| Mode | What the hub does |
|---|---|
| **Start from scratch** | Wizard: project info, parties and roles, template folder tree + naming, workflow set, schedule skeleton. Output: empty project package. |
| **Import and edit** | Import ZIP / folder / IFC / BCF / CSV register / MS Project XML (MEMORY: common export). Map columns to fields, detect duplicates by number+rev, show a diff, then commit. |
| **Review and apply** | Reviewer queue by `ballInCourt`; side-by-side rev compare; stamp A/B/C/D; apply resolves linked Issues; produces a response transmittal. |
| **Ongoing follow-up** | Dashboards: overdue RFIs/IRs/submittals, aging, ball-in-court per party, schedule slip, open MOM actions; weekly digest; audit trail view. |

---

## 5. Ranked top 10 for T.O X (what to add next)
1. **Project + roles + folder + document-register model** (section 4) stored through one storage adapter (IndexedDB now). Own code; no dependency. Everything else hangs on it.
2. **ISO 19650 document states + naming/revision rules + A/B/C/D review codes**, with validation of file names on upload. Own code; spec-driven.
3. **Workflow engine** (data-driven transitions per role, due dates, ball-in-court, overdue flags) powering RFI, IR, Submittal, Issue. Learn from OpenProject / Frappe workflow, no copying.
4. **Transmittal package export/import** (ZIP + `register.json` + SHA-256 + hash-chained audit) = the sharing mechanism between owner / contractor / consultant without a server.
5. **IFC viewer embed**: web-ifc (MPL) + That Open components/fragments (MIT), with section planes and property panel; store converted fragments next to the original IFC.
6. **BCF 2.1/3.0 issue import/export** with viewpoints, written by us from the spec (CC BY-ND: implement, do not republish the spec files).
7. **Schedule tab**: frappe-gantt (MIT) bound to P.X data; optional DHTMLX Community (MIT) view; keep our CPM so no reliance on DHTMLX PRO.
8. **pdf.js preview + markup layer** for drawings, submittals, RFI attachments; link markups to Items.
9. **MOM module**: agenda/minutes/actions that spawn Items and carry forward open actions; print to PDF.
10. **Register query layer**: sql.js or wa-sqlite for filter/sort/aggregate and CSV/Excel export; then, as phase 2, a feed/news panel (Miniflux-style de-dup, needs the CORS relay) and optional Yjs merge or sync server.

Not recommended now: embedding xeokit, OpenProject, Paperless-ngx, ERPNext, BIMserver (copyleft or server-bound); building a BPMN editor; any "secure roles" claim without a server.

---

## 6. What I did not check
- Full text of bpmn-js and tldraw licences; PocketBase archive reason; Speckle EE licence terms; Bonsai/Blender licence beyond GPL (MEMORY).
- Actual bundle sizes and WASM load time of web-ifc / fragments in a browser (not run). Not tested with a real IFC.
- Whether That Open's `BCFTopics` supports BCF 3.0 fully (MEMORY only).
- Competitor features and pricing: memory only, no vendor page read today.
- Legal reading of CC BY-ND for implementing BCF/IDS: my reading is "implementing is allowed, republishing modified spec text is not"; this is not legal advice.
- GitHub "last push" can be a bot commit; it is a liveness hint, not proof of maintenance quality.
