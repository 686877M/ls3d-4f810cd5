# Project 6868 - the complete life of a small building, mapped to T.O X

Generated 2026-11-21 for the guided-demo session (`mod-demo6868`). Documents in English, phase titles bilingual. Replies to the owner are in Arabic; this file is the engineering map.

**Project modelled:** 2-storey reinforced-concrete villa (BUA about 300-450 m2) with electrical, HVAC, plumbing/drainage and low-current, on a real plot, Egypt / Arab-world practice. Codes: ECP 203 (concrete), ECP 201 (loads), ECP 202 (soil and foundations); Eurocode 1/2/7/8 and ACI 318 / ASCE 7 noted as equivalents.

**Reading rules (honesty):** (1) Anything labelled `RULE OF THUMB` is a planning figure, NOT a design approval and NOT from a licensed code. (2) No clause numbers are quoted; where a limit depends on the code the text says "check the clause". (3) Every T.O X id below was checked against the built app (`vx_wired.html`) by dumping its real command registry in headless Chrome; ids marked `[stub]` exist on the ribbon but only say "not built yet". (4) Engineering outputs in the demo are demonstrations, not design approval.

**Status legend for steps:** `Y` tool exists and does it - `P` partly - `M` MISSING - `F` field/human work (no software role).

## 0. What is already true in T.O X (verified)

- 18 program types (`WTYPES`): start, R.X model, C.X draft, P.X sched, S.X survey, N.X coord, D.X detect, Q.X takeoff, L.X levels, M.X sim, E.X analysis, O.X office, T.X plant, H.X home, V.X hvac, G.X gis, Missions hub, F.X capture. Registry: 1608 commands, 1462 working, 146 stubs.
- Ribbon coverage (working of total): R.X 213/280, C.X 138/173, S.X 111/115, N.X 113/115, O.X 90/99, Q.X 83/83, P.X 76/92, T.X 70/84, G.X 79/86, F.X 46/46.
- Calculation sheets (`p_calc`, `CALCS`): ONLY 7 - `flex` (concrete strip/beam flexure + shear, ACI 318 form, SBC 304 cited, cylinder f'c, simplified), `float` (flotation of a well), `hw` (Hazen-Williams), `ww` (wet-well volume), `man` (Manning full flow), `mot` (motor current + voltage drop), `bear` (bearing pressure W/A vs qa). **The ECP 203 method is deliberately NOT programmed** - the sheet says it needs a verified formula set from the licensed code.
- Codes panel (`p_codes`): 37 entries incl. ECP 203, ECP 201, ECP 202 as titles/scope only (no clauses by design).
- Templates (`TEMPLATES`): blank, sewage (lift station), `house2` (12 x 10 m, 2 floors + roof) and `office3`. **house2 contains 16 walls (t 0.25), 2 floors, 10 rooms, 9 doors, 16 windows, 1 stair, 1 roof - and NO columns, beams, footings or slabs-on-grade.** Its BOQ has 6 rows. This is why the demo "walls/structure" looked wrong: the structural skeleton does not exist in the template.
- R.X defaults (`RV.def`): wall h 3.0 t 0.2; column 0.4 x 0.4 x 3.0; door 0.9 x 2.1; window 1.2 x 1.2 sill 0.9; floor t 0.2; levels "Level 1" z0 and "Level 2" z3 (template uses Ground 0 / First 3 / Roof 6).
- Demo already has 13 chapters in `demo_ch1-3.js`: welcome, project, rx, site, sched, struct, elec, hvac, lowc, plumb, clash, boq, out.

## Phase index and coverage

| # | Phase | Y | P | M | F | typical duration |
|---|---|---|---|---|---|---|
| 0 | Brief, feasibility and budget / الفكرة والبرنامج وجدوى الميزانية | 3 | 3 | 1 | 1 | 1-3 weeks |
| 1 | Site: survey, soil, boundary, utilities, access / الموقع: الرفع المساحي والتربة والحدود والمرافق والوصول | 6 | 3 | 1 | 2 | 2-4 weeks (survey 3-5 days, boreholes + lab 1-3 weeks, report 1 week) |
| 2 | Concept and architectural design / التصميم المعماري: الفكرة ثم المخطط ثم الواجهات والقطاعات | 7 | 3 | 0 | 1 | 1-3 months including owner changes |
| 3 | Structural system choice, loads and preliminary sizing / النظام الإنشائي والأحمال والأبعاد المبدئية | 2 | 4 | 2 | 2 | 2-4 weeks |
| 4 | Detailed structural analysis and design / التحليل والتصميم الإنشائي التفصيلي (بلاطات وكمرات وأعمدة وأساسات وسلالم وحوائط ساندة) | 0 | 8 | 5 | 0 | 3-6 weeks for a villa (design) + 1 week checks |
| 5 | MEP design (electrical, HVAC, plumbing, low-current) / تصميم الكهروميكانيكا: الكهرباء والتكييف والسباكة والصرف والتيار الخفيف | 3 | 9 | 6 | 0 | 3-6 weeks for all disciplines (parallel to structural design) |
| 6 | Coordination, quantities, BOQ, specifications and cost estimate / التنسيق وحصر الكميات والمقايسة والمواصفات والتكلفة | 5 | 3 | 2 | 0 | 2-4 weeks |
| 7 | Tender and contracting / المناقصة والتعاقد | 2 | 2 | 0 | 3 | 3-6 weeks |
| 8 | Planning: WBS, schedule, resources, cash flow, safety plan / التخطيط: هيكل الأعمال والجدول والموارد والتدفق النقدي وخطة السلامة | 6 | 3 | 0 | 0 | 1-2 weeks (before construction starts) |
| 9 | Construction in true order, with inspections and hold points / التنفيذ بالترتيب الصحيح مع الفحوصات ونقاط الإيقاف | 3 | 3 | 0 | 0 | 10-14 months total (see durations rules in phase 8) |
| 10 | Testing, commissioning, snagging, handover, as-built, O&M and close-out / الاختبارات والتشغيل التجريبي والملاحظات والتسليم والرسومات التنفيذية وكتيبات التشغيل والإغلاق | 3 | 4 | 0 | 2 | 3-6 weeks + defects period |

**Dependency chain (must be respected by the demo order):** 0 -> 1 (soil + levels) -> 2 (plan) -> 3 (system + loads) -> 4 (structure) and 5 (MEP) in parallel with a coordination loop to 2/3 -> 6 (coordination, BOQ, spec, estimate) -> 7 (tender) -> 8 (planning) -> 9 (construction, stage order below) -> 10. Key hard dependencies: soil report before foundation type; architectural freeze before structural design; shaft/sleeve positions before slab reinforcement; MEP first-fix tested before plaster; flood/pressure tests before concealment.

---

## Phase 0 - Brief, feasibility and budget
**الفكرة والبرنامج وجدوى الميزانية**

**Purpose.** Turn 'I want a house' into a written brief, a first budget and a go / no-go decision before any design money is spent.

**Inputs**
- Owner wishes: family size, number of bedrooms, parking, garden, future extension (third floor?)
- Plot (owned or candidate), approximate area and location
- Money available (own funds, loan), target handover date
- Local planning rules for the district (permitted height, setbacks, coverage) - from the district technical office, not guessed

**Steps** (status, T.O X ids)

1. [P] Interview the owner and write the design brief (rooms, areas, adjacencies, finish level A/B/C, special needs).
   - T.O X: `o_report`, `lb_ox`  - O.X report editor + document templates can hold the brief; no brief/room-programme tool.
2. [P] Fix the areas: net room programme, then gross built-up area (BUA) = net / efficiency (0.80-0.85 for a villa incl. walls, stair, void).
   - T.O X: `o_sheet`, `qx_open`  - A spreadsheet does it; no dedicated programme sheet.
3. [M] Check plot rules: setbacks, max coverage %, number of floors, max height, parking count, easements.
   - T.O X: (none)  - No zoning / setback checker. Demo can only type the numbers into the project notes.
4. [P] Order-of-magnitude budget = BUA x cost per m2 for the finish level (rule of thumb, from recent local tenders, NOT a design figure); add design fees, permit fees, utilities connection, contingency 10-15 %.
   - T.O X: `dc_tnd`, `dc_fs`, `o_sheet`  - dc_tnd prices a BOQ (overhead, profit, contingency, VAT); dc_fs does NPV/IRR/payback. Neither ships a cost-per-m2 benchmark.
5. [Y] Feasibility if it is an investment (sell/rent): NPV, IRR, payback, sensitivity. Skip for an owner-occupied house.
   - T.O X: `dc_fs`  - Inputs are the owner's own numbers.
6. [Y] Risk list at idea stage (soil unknown, permit delay, price escalation, owner changes) with a first mitigation each.
   - T.O X: `p_scen`  - Risk register + Monte Carlo schedule risk.
7. [F] Choose delivery route: design-bid-build with separate consultant and contractor (recommended for a house), or design-build, or owner-managed with labour-only crews.
   - T.O X: (none)  - Decision; affects phase 7.
8. [Y] Go / no-go and sign the brief; open the project file and the document register.
   - T.O X: `new_from_template`, `setup`, `dc_reg`, `tpl:house2`  - tpChooser creates the project; setup stores name/client/number/currency. Template house2 is the R.X starter (see data inventory).

**Outputs / deliverables**
- Signed design brief (1-3 pages)
- Room programme and BUA estimate
- Budget range and funding plan
- Go/no-go record
- Project number and folder / register opened

**Checks and acceptance criteria**
- Brief signed by owner (date on it)
- Budget >= low estimate x 1.1 or scope reduced
- BUA within plot rules (coverage x floors)
- Every wish has either a room, a budget line or a written 'not now'

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB: villa BUA ~ 1.2-1.4 x net living area.
- RULE OF THUMB: contingency 10 % at brief stage, 5 % at tender, 3-5 % at construction.
- RULE OF THUMB: soft costs (design, supervision, permits, utilities) 8-15 % of construction cost.

**Common mistakes**
- Starting design before the plot rules are known
- Budget without utilities connection, landscaping, boundary wall, furniture
- Forgetting the owner's future extension (column and footing sizes then change)

**Typical duration:** 1-3 weeks

**Demo hint:** Fast: ch1 'project' already does the template + setup. Add a 20-second 'brief' caption and a dc_fs sample; do not spend long here.

---

## Phase 1 - Site: survey, soil, boundary, utilities, access
**الموقع: الرفع المساحي والتربة والحدود والمرافق والوصول**

**Purpose.** Know the ground (levels, boundary, soil, water table) and what the plot connects to, before the structure and the drainage are designed.

**Inputs**
- Plot title / cadastral sheet (حيازة / عقد / كروكي)
- Candidate plot coordinates
- Neighbours' building heights and foundation levels (adjacent excavation risk)

**Steps** (status, T.O X ids)

1. [Y] Locate the plot on the map, record coordinates (WGS84 and the local grid), north direction, nearby roads.
   - T.O X: `p_geo`, `gis_setproj`, `gis_id`, `gis_conv`, `xf_gis`  - G.X map + converter + 'Set project location'. Imagery needs internet.
2. [F] Order a topographic survey: total station / GNSS, grid of spot levels (every 5-10 m on a small plot + all break lines), boundary pegs, neighbours' walls, road kerb levels, manhole/pole positions.
   - T.O X: (none)  - Field work. T.O X receives the result.
3. [Y] Import survey points (PNEZD/CSV), build TIN surface, contours (0.25-0.5 m for a plot), spot-check against raw points.
   - T.O X: `p_survey`, `survey_37 [SURVEY Insert > Import > Import points]`, `survey_10 [SURVEY Home > Create Ground Data > Create TIN surface]`  - S.X (Civil 3D-like): points, TIN, contours, volumes, traverse with Bowditch (mod_cxsx), LandXML import/export.
4. [P] Draw the boundary as a closed polyline from the survey; compute area and compare with the title area (difference tolerance per authority).
   - T.O X: `c_pl`, `c_area`, `m_dist`  - CAD polyline + area. No 'compare with title' check.
5. [F] Soil investigation: 2-3 boreholes (or 1 per ~150-200 m2) to 6-10 m or to firm layer; SPT every 1-1.5 m; sampling; water table; lab tests (grain size, Atterberg, unit weight, shear strength / consolidation, chemical tests: sulphates, chlorides, pH). Geotechnical report with recommended foundation type, allowable bearing, settlement, aggressive-soil advice.
   - T.O X: (none)  - Field + lab. Egyptian reference: ECP 202 (soil mechanics and foundations; check edition/clauses).
6. [Y] Enter the borehole log and compute a preliminary bearing capacity (Terzaghi) as a screening check of the geotechnical report.
   - T.O X: `dc_soil`, `fn:dcBearing`, `env_gr`  - dcBearing = Terzaghi qu with shape factors, FS. No settlement, no layered soil, no ECP 202 method.
7. [P] Seismic and wind site data: seismic zone / design ground acceleration from the code map, site class from the boreholes, basic wind speed; liquefaction screening if loose saturated sand.
   - T.O X: `env_eq`, `env_wind`, `gis_seis`, `gis_windrep`, `gis_soil`  - Eurocode-8-form spectrum (the form ECP 201 uses) and ASCE 7 base shear; wind panel says ECP 201 has its own chapter and does NOT apply it. Zone values must be typed from the code map.
8. [Y] Sun path and orientation study for the building mass and glazing (shade, summer sun).
   - T.O X: `env_sun`, `gis_sunrep`, `env_en`  - Sun path, shadows on the model, energy.
9. [P] Utilities survey: electricity (nearest transformer / LV pole, available kVA), water (main DN, pressure), sewer (invert level of the nearest manhole - decides gravity vs septic), gas, telecom, storm. Written statement from each utility.
   - T.O X: `gis_import`, `lib:sxpipe`, `survey_17 [SURVEY Home > Create Design > Pipe Network]`  - Can draw/import the lines as layers; S.X pipe catalogue exists (placeholder sizes). No utility-capacity check.
10. [M] Access and logistics: road width for concrete trucks/pump, crane or no crane, material storage, neighbours, working hours.
   - T.O X: (none)  - No site-logistics tool; draw on the C.X plan.
11. [Y] Earthworks estimate: existing vs finished ground levels, cut/fill volume, disposal; excavation volume of foundations later (phase 6).
   - T.O X: `rc_open`, `rc_qty`, `rc_tin`, `rc_ter`, `survey_67 [SURVEY Analyze > Ground Data > Volumes]`  - F.X reality capture: TIN, cut and fill; S.X volumes.
12. [Y] Site report: summary of constraints and design implications (soil, level, utilities, orientation).
   - T.O X: `o_report`, `dc_rep`, `dc_soil`  - Report templates incl. technical and site visit.

**Outputs / deliverables**
- Topographic drawing (DWG/PDF) with boundary, levels, contours
- Soil report with allowable bearing and foundation advice
- Utilities letters / connection points
- Site constraints summary
- Seismic/wind inputs

**Checks and acceptance criteria**
- Survey closes: control points tie within tolerance (typical total-station traverse closure 1:10 000, per spec)
- Boundary area vs title within the authority's tolerance
- Soil report signed by a geotechnical consultant / accredited lab; borehole depth >= 1.5 x footing width below founding level (rule of thumb) or reaches firm layer
- Water table known; aggressive soil classified (sulphate / chloride)
- Every utility has a written connection point

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB: 1 borehole per 150-200 m2 of footprint, minimum 2; depth 6-10 m for a 2-storey house on normal soil.
- RULE OF THUMB: allowable bearing of 100-200 kPa is common for Egyptian normal soils; weak clays / fill / high water table are common exceptions - the soil report decides, not this figure.
- RULE OF THUMB: spot levels every 5-10 m on a small plot; contour interval 0.25-0.5 m.

**Common mistakes**
- Designing foundations without a soil report
- Taking levels from the road only (plot is lower than the street -> flooding, and sewer cannot be gravity)
- Ignoring neighbour's foundation depth (needs shoring or underpinning)
- Using a wrong datum between survey and drawings

**Typical duration:** 2-4 weeks (survey 3-5 days, boreholes + lab 1-3 weeks, report 1 week)

**Demo hint:** Today ch2 'site' only does survey/excavation/cost on the sample site. Add: borehole log typed into dc_soil -> bearing result; env_eq inputs typed; utilities shown as GIS layers.

---

## Phase 2 - Concept and architectural design
**التصميم المعماري: الفكرة ثم المخطط ثم الواجهات والقطاعات**

**Purpose.** Turn the brief and plot into a buildable plan: layout, facades, sections, openings - the geometry the structure and MEP will follow.

**Inputs**
- Approved brief and BUA
- Survey (levels, boundary)
- Plot rules (setbacks, height)
- Soil/orientation constraints

**Steps** (status, T.O X ids)

1. [P] Mass and site plan: footprint inside setbacks, parking, entrance, garden, orientation (living towards north/breeze, minimum west glass).
   - T.O X: `site`, `tab:draft`, `model_146 [MODEL Massing & Site > Model Site > Toposurface]`  - Site plan view in R.X is station-specific data; massing tools partly present.
2. [P] Concept plans by hand or CAD: bubble diagram -> block plan with room areas.
   - T.O X: `tab:draft`, `cad`, `lb_cx`, `hm_sample`, `hm_room`  - H.X home plan: drag rooms; C.X blocks library (arch 28, elec 19, plumb 9, fire 8, HVAC 13).
3. [Y] Set levels and grids in R.X. Ground floor level +0.00 = chosen vs road kerb (usually +0.45 to +1.0 m above road, per local rule); floor-to-floor 3.0-3.2 m; parapet 1.0 m.
   - T.O X: `model_30 [MODEL Architecture > Datum > Level]`, `model_31 [MODEL Architecture > Datum > Grid]`, `rv_level`, `rv_grid`  - Template house2 has levels Ground 0 / First 3 / Roof 6 and 4 grids.
4. [Y] Draw external and internal walls (structure grid first, then 25 cm external / 12 cm internal masonry, per Egyptian practice), doors, windows, columns positions coincide with grid.
   - T.O X: `rv_wall`, `rv_door`, `rv_window`, `rv_col`, `lb_rx`, `lib:rxfam`, `lib:rxasm`  - R.X walls/doors/windows (hosted openings). 45 family types + 12 layered assemblies; assembly sets wall thickness only, 3D stays a single box. NOTE: template house2 has 16 walls, 0 columns, 0 beams (see gaps).
5. [Y] Floors, stair (riser 15-17 cm, tread 28-30 cm, width >= 1.0 m; headroom >= 2.2 m), roof (flat with parapet and slope 1-2 % to drains), rooms with area tags.
   - T.O X: `rv_floor`, `rv_stair`, `rv_roof`, `rv_room`, `rv_rail`, `rv_ramp`, `rv_ceil`  - All present as R.X tools.
6. [Y] Check areas and clearances: room areas, net/gross, stair geometry, door widths (0.9 m main, 0.8 m rooms, 0.7 m bath), window sills.
   - T.O X: `rv_room`, `rv_props`, `model_22 [MODEL Architecture > Room & Area > Area]`  - Room area tags and Area (Gross/Rentable).
7. [Y] Elevations (4), sections (2, through stair and wet areas), plan with dims.
   - T.O X: `rv_plan`, `rv_elevN`, `rv_elevS`, `rv_elevE`, `rv_elevW`, `rv_secX`, `rv_secZ`, `rv_dim`, `rv_plancad`, `rv_sec2cad`  - SVG, no WebGL; 'to CAD' puts them on layers for PDF/DXF.
8. [Y] Interior layout and finishes: materials, furniture, lights.
   - T.O X: `hx_mat`, `hx_fur`, `hx_light`, `xf_hx`, `xf_rx`  - H.X materials (floors 19, walls 9, ...) and furniture models.
9. [Y] Render and walkthrough images for the owner approval.
   - T.O X: `render`, `rs_open`, `rs_still`, `rs_turntable`, `shot2`, `vx_export`  - Render Studio (stills up to 8K, turntable video) and true-vector SVG export of the view.
10. [P] Owner review round(s) and freeze; issue 'architectural design freeze' drawing set (plans, elevations, sections, door/window schedule).
   - T.O X: `sheet`, `e_pdf`, `e_dxf`, `model_190 [MODEL View > Create > Schedules]`, `dc_new`  - Sheet composer exists; door/window schedule via R.X schedule (rv_sched). No design-freeze status workflow.
11. [F] Submit for the building permit (authority forms: architectural + structural + soil report + title). Egypt: unified building law (Law 119 of 2008 and its executive regulations - verify current text).
   - T.O X: (none)  - Outside the software; tracked in the register (dc_new / dc_reg).

**Outputs / deliverables**
- Architectural drawing set (site plan, plans, 4 elevations, 2 sections, schedules)
- R.X model Level of Development ~ LOD 200-300 (walls, openings, floors, stair, roof)
- Renders
- Permit submission file

**Checks and acceptance criteria**
- Plan inside setbacks and coverage limits
- Stair rise/tread comply, headroom >= 2.2 m
- Every room has window/ventilation (or mechanical vent) and every wet area stacks over wet area where possible
- Grid spacing realistic for RC (spans 3.5-5.5 m, avoid > 6 m without extra beam)
- Owner signature on the freeze set

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB: keep slab spans <= 5 m for economical solid slab+beam; align walls above walls; stack wet rooms.
- RULE OF THUMB: floor-to-floor 3.0-3.2 m; clear height 2.7-2.9 m after finishes.
- RULE OF THUMB: external masonry 25 cm, internal 12 cm; wall self-weight ~ 2.0-3.5 kN/m2 of wall face - the load figure comes from ECP 201 / the materials, not from this.

**Common mistakes**
- Drawing walls first and columns later (columns end up in the middle of doors)
- Wet areas not stacked -> long drains
- No room for ducts / shafts (MEP riser 40x60 cm each)
- Stair with wrong rise/tread because floor height changed

**Typical duration:** 1-3 months including owner changes

**Demo hint:** Current ch1 'rx' + ch2 start. Needed: explicit grid + level first, then perimeter walls (thickness 0.25), then columns on the grid, then openings; sections after. The template house2 has no columns: demo must place them or the template must be extended.

---

## Phase 3 - Structural system choice, loads and preliminary sizing
**النظام الإنشائي والأحمال والأبعاد المبدئية**

**Purpose.** Pick the frame system and foundation type, define the loads, and size members roughly so the architect and MEP can reserve space.

**Inputs**
- Architectural plans and sections (freeze set)
- Soil report (allowable bearing, depth, water table)
- Codes chosen: ECP 201 loads, ECP 203 concrete, ECP 202 foundations (or Eurocode 1/2/7, or ACI 318 + ASCE 7)
- Material grades

**Steps** (status, T.O X ids)

1. [F] Choose the system: RC skeleton (columns + beams + solid slab) = default for a villa; flat slab / hollow-block (ribbed) alternatives; masonry fill, not load-bearing.
   - T.O X: (none)  - Engineering decision.
2. [F] Choose the foundation type from the soil report and column loads: isolated footings + tie beams (default on good soil), strap/combined footings near boundary, raft if footings cover > ~40-50 % of the footprint or soil is weak/water high, piles only if the report requires.
   - T.O X: (none)  - Engineering decision; revisit after load take-down.
3. [P] Fix materials: concrete grade (Egypt uses cube strength fcu: typical C25-C30 for a villa frame; check ECP 203 exposure and durability for foundations in sulphate soil), reinforcing steel grade (common Egyptian grades 24/35 mild, 36/52 high-yield, 40/60 high-strength - verify with the supplier and ES standard), cover, cement type (sulphate-resisting where the soil report says so).
   - T.O X: `p_codes`, `lib:rxfam`  - p_codes lists the codes (titles only, clause numbers deliberately not reproduced). No material-grade table.
4. [P] Define loads per ECP 201 (check clauses): dead (self weight + finishes + partitions), live by occupancy (residential rooms ~2 kN/m2, balconies/stairs higher - from the code table), roof live/maintenance, wind, seismic zone, earth pressure, water. Typical finishes allowance ~1.5-2.0 kN/m2 on floors; masonry wall line loads.
   - T.O X: `model_55 [MODEL Structure > Analytical Model > Load Combinations]`, `p_calc`, `env_wind`, `env_eq`  - R.X Load Combinations (floor loads, EN 1990 6.10 / ASCE 7 / characteristic) exists but no ECP 201 table and no wall line loads.
5. [P] Load combinations: ECP 203 ultimate (typical 1.4 D + 1.6 L, plus wind/seismic combinations - check the clause) and service combination for deflection/cracking/bearing.
   - T.O X: `model_55 [MODEL Structure > Analytical Model > Load Combinations]`  - EN/ASCE/characteristic forms only.
6. [M] Preliminary sizing by span/depth: slab t >= span/30-35 (one-way) or span/35-40 (two-way continuous); beam depth span/10-12 (simply supported to continuous), width 20-30 cm; column from load: Ac ~ N / (0.35-0.45 x fcu) as first guess; footing area = service load / allowable bearing x 1.1.
   - T.O X: (none)  - Rules of thumb only; no pre-sizing tool. Demo can type them into the R.X Properties (rv_props).
7. [P] Layout the structure on the grid: column positions (also at stair corners, around shafts), beam lines under walls, slab panels, cantilevers/balconies, expansion/construction joints, lift pit if any.
   - T.O X: `rv_col`, `rv_beam`, `rv_floor`, `rv_found`, `rv_fslab`, `model_42 [MODEL Structure > Structure > Beam System]`, `model_38 [MODEL Structure > Structure > Brace]`  - R.X elements exist; no automatic framing from walls.
8. [M] Check column load take-down (tributary area x total load x floors) and footing area once; revise sizes; fix final grid and dimensions with the architect.
   - T.O X: (none)  - No load take-down tool. p_calc sheets 'bear' (bearing pressure under base) can check one footing.
9. [Y] Coordination meeting: structure vs architecture vs MEP (beam depth under ducts, column vs door, slab openings for shafts).
   - T.O X: `clash`, `p_coord`, `coord_nv1`, `nv_clash`, `mom_new`  - N.X clash + MOM tool.
10. [Y] Write the structural design basis (1-2 pages): codes, loads, materials, foundation type, assumptions, software/method.
   - T.O X: `o_report`, `dc_rep`, `p_codes`  - Report editor; no design-basis template.

**Outputs / deliverables**
- Structural design basis document
- Structural layout drawings (column grid + beam layout + slab panels + foundation type) - preliminary
- Updated R.X model with columns/beams/slabs/foundations at preliminary sizes
- Load table

**Checks and acceptance criteria**
- Column continuity from foundation to roof (no column ends on a beam unless designed)
- Total preliminary concrete within the rule-of-thumb range (see phase 6)
- Footing areas fit inside the plot and clear neighbours
- All spans <= limits used in the span/depth table
- Design basis signed by the engineer in charge

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB: total concrete in a villa skeleton ~ 0.30-0.40 m3 per m2 of BUA incl. foundations; reinforcing steel 90-130 kg per m3 of concrete (~ 35-50 kg/m2 BUA). A quantity far outside this range = recheck.
- RULE OF THUMB: villa column grid 4-5.5 m, columns 25x60 to 30x70 cm in Egyptian practice (long side along the wall), beams 25x60 cm typical; footing 1.2-2.2 m square for 400-900 kN service load on 150 kPa soil.
- RULE OF THUMB: the 1st trial footing area = service load x 1.1 / allowable bearing.

**Common mistakes**
- Choosing isolated footings when they almost touch -> should be a raft
- Forgetting the tie beams / grade beams and the ground slab
- Using live loads from habit instead of the code table
- Changing the architectural plan after the structure is fixed

**Typical duration:** 2-4 weeks

**Demo hint:** Highlight: place columns on the grid, beams on the wall lines, foundation pads under columns, show the 'load take-down' table (needs a small build - see gaps).

---

## Phase 4 - Detailed structural analysis and design
**التحليل والتصميم الإنشائي التفصيلي (بلاطات وكمرات وأعمدة وأساسات وسلالم وحوائط ساندة)**

**Purpose.** Design every structural element to the code, detail the reinforcement and issue drawings, schedules and a calculation report that a checker can follow.

**Inputs**
- Phase 3 design basis, layout, loads, materials
- Soil report
- Final architectural dimensions and openings
- MEP penetrations and equipment weights (water tank, AC units, lift)

**Steps** (status, T.O X ids)

1. [M] Build the analysis model or the hand-calc scheme: slab panels (support conditions per edge), continuous beams, frames (2D or 3D), foundation model. State assumptions (rigid/elastic supports, cracked section factors).
   - T.O X: `model_54 [MODEL Structure > Analytical Model > Boundary Conditions]`, `model_52 [MODEL Structure > Analytical Model > Check]`  - R.X can tag boundary conditions (fixed/pinned/roller/free) on columns/foundations but there is NO structural solver (no frame/beam/slab analysis).
2. [P] Slabs: solid slab one-way (long/short >= 2) or two-way; bending moments from code coefficient tables or yield-line/FE; check minimum thickness for deflection; min steel (shrinkage/temperature) and max spacing; cantilevers/balconies design incl. edge beam torsion; shear check (usually no stirrups).
   - T.O X: `calc:flex`, `p_calc`  - Only the strip/beam flexure+shear sheet `flex` (ACI 318 form, simplified, cylinder f'c). No moment coefficients, no two-way slab, no deflection.
3. [P] Beams: flexure (rectangular / T-beam, singly then doubly reinforced), shear + stirrup spacing, torsion for edge/spandrel beams, deflection (span/depth or computed), crack width, support moment at continuity, development of top steel into columns.
   - T.O X: `calc:flex`  - `flex` gives As, As,min, tension-controlled strain, phi*Mn, phi*Vc only. No stirrup design, no T-beam, no torsion/deflection/crack.
4. [M] Columns: axial + uniaxial/biaxial moment (interaction diagram), slenderness (braced/unbraced), minimum eccentricity, steel ratio limits (min ~0.8 %, max ~4-6 % - check ECP 203), tie spacing/size, splice zone.
   - T.O X: (none)  - No column design sheet or interaction diagram.
5. [P] Foundations: service-load bearing check (q <= allowable, no uplift under combinations), settlement/differential settlement, ultimate design: one-way shear, punching shear at d/2, flexure in both directions, development length of bars, tie beams/strap design; raft: soil springs or rigid method, punching under columns, edge details. Egyptian reference ECP 202 (check clauses).
   - T.O X: `calc:bear`, `dc_soil`, `fn:dcBearing`, `calc:flex`  - `bear` = W/A vs qa for one base; Terzaghi qu from the log. No punching, no one-way shear for footings, no raft, no settlement.
6. [P] Stairs: waist slab as one-way inclined slab (span horizontal projection), landings, loads (self weight of steps + finishes + live), reinforcement incl. bent bars at re-entrant corners, support on beams/walls.
   - T.O X: `calc:flex`, `rv_stair`  - Can run `flex` per metre strip; stair geometry is in R.X.
7. [M] Retaining walls / basement walls / ramp walls if the plot has level change: active/at-rest earth pressure + surcharge + water; stability (overturning FS >= ~1.5-2.0, sliding FS >= ~1.5, bearing); stem and base design; drainage and waterproofing.
   - T.O X: `calc:float`  - Only flotation (`float`, for a well) exists - no retaining wall sheet.
8. [P] Seismic: ECP 201 zone + site class -> base shear, distribution, drift; check frame detailing class (ductility). Wind on a 2-storey villa rarely governs.
   - T.O X: `env_eq`, `env_wind`  - Eurocode-8-form spectrum and ASCE 7 base shear (ECP 201's own spectrum/zone table not coded; wind: ECP 201 has its own chapter - the panel says it does not apply it).
9. [M] Serviceability: deflection limit (e.g. span/250 total, span/350-500 after partitions - check ECP 203), crack width (typical 0.3 mm external/0.4 mm internal - check exposure class), vibration for long spans.
   - T.O X: (none)  - Not computed anywhere.
10. [M] Detailing: cover, bar spacing, development length ld and lap length (rule of thumb ld ~ 40-50 db for high-yield bars in 25-30 MPa cube concrete, lap = 1.3 ld for ~50 % splice - COMPUTE with the ECP 203 / ACI formula), hooks and bends, stirrup closure at 135 deg, splice location (columns just above slab, beams away from supports), stirrup spacing near supports (confinement zone), curtailment points.
   - T.O X: `model_50 [MODEL Structure > Reinforcement > Cover]` **[stub]**, `model_47 [MODEL Structure > Reinforcement > Area]` **[stub]**, `model_48 [MODEL Structure > Reinforcement > Path]` **[stub]**  - Ribbon entries Cover/Area/Path/Fabric Sheet/Couplers are stubs; Rebar entry runs the lift-station rebar viewer (`rb`/`p_rebar`) only.
11. [P] Reinforcement schedules / bar bending schedule (BBS): mark, diameter, shape code, cut length, number, total length, weight (kg = d2/162 x m, d in mm). Totals per element and per diameter for ordering.
   - T.O X: `dc_rb`, `rb`, `p_rebar`  - dc_rb = rebar take-off tab of document control; `rb` = station rebar. Not generated from R.X columns/beams/slabs.
12. [P] Structural drawings: foundation plan + sections, column schedule, beam layout + elevations, slab reinforcement plans per floor, stair detail, general notes (grades, cover, laps, curing), title block.
   - T.O X: `sheet`, `lb_cx`, `tab:draft`, `e_pdf`, `e_dxf`, `rv_plancad`  - C.X drawing + sheet composer + title blocks A1-A4. Drawings must be drawn; none auto-produced from a design.
13. [P] Calculation report: inputs, load table, results, pass/fail per check, reference clause. Independent check by a second engineer (+ authority stamp).
   - T.O X: `calc:flex`, `p_review`, `wf:struct`, `o_report`, `dc_rep`  - p_review recomputes the calc sheets and compares with the model; wf_struct is an ordered review (model data > calcs > soil > rebar > seismic > wind > liquefaction > clashes > drawing set).

**Outputs / deliverables**
- Calculation report
- Structural drawings: foundation, columns, beams, slabs, stair, details
- Reinforcement schedule / BBS
- Structural quantities (concrete m3, steel kg, formwork m2)
- Authority-approved structural set

**Checks and acceptance criteria**
- Flexure: Mu <= phi*Mn at every critical section; As >= As,min; As <= As,max (tension-controlled / ductile)
- Shear: Vu <= phi*Vn; stirrup spacing <= code max; minimum shear steel where required
- Punching (footings, flat slabs): vu <= phi*vc at d/2 from the column face
- Deflection: computed or span/depth ratio satisfied; crack width <= limit for the exposure class
- Columns: Pu-Mu point inside the interaction diagram; slenderness checked; 0.8 % <= rho <= code max (check ECP 203)
- Footing: service q <= allowable (and >= 0 everywhere, i.e. no uplift); differential settlement <= typical L/500 (check the code)
- Detailing: cover >= code/exposure; ld and lap provided >= required; bar spacing between min and max
- Overall: quantities per m2 BUA in the rule-of-thumb band; two-engineer sign-off

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- ECP 203 works with cube strength fcu and gamma_c = 1.5, gamma_s = 1.15 (check the clauses); ACI 318 works with cylinder f'c (rough conversion f'c ~ 0.8 fcu, NEVER use for final design); Eurocode 2 uses fck cylinder. T.O X `flex` is ACI/SBC-style - say so on screen.
- RULE OF THUMB steel weight per m3 concrete: footings 60-100, slabs 70-100, beams 130-180, columns 150-250 kg; average 100-130 kg/m3.
- RULE OF THUMB min dims: column >= 25x25 cm (check), slab >= 12 cm (roof/floor), beam width >= 20-25 cm, cover 25-30 mm in beams/columns indoors, 50-75 mm against soil.
- RULE OF THUMB two-way slab: effective depth d ~ L/35-L/40; simply supported one-way: L/20-L/25 (d); the code table is the authority.
- Bar weight kg/m = d^2/162 (d in mm): 10 mm 0.617, 12 mm 0.888, 16 mm 1.58, 18 mm 2.00, 20 mm 2.47, 25 mm 3.85.

**Common mistakes**
- Designing with unconfirmed loads or an unchecked soil bearing
- Missing top steel at continuous supports and cantilevers
- Stirrups too wide at column/beam joints, 90-degree stirrup hooks
- Forgetting punching at footing and slab-column joints
- Laps all at the same section
- Cover too small against soil -> corrosion
- Copying ACI formulas for an ECP submission

**Typical duration:** 3-6 weeks for a villa (design) + 1 week checks

**Demo hint:** Demo can truthfully show: R.X sizes -> concrete quantities -> `flex` bending check of one slab strip and one beam -> `bear` check of one footing -> rebar weight from dc_rb. It must say 'screening, ACI-form'. Anything more (columns, punching, deflection, ECP 203) is a BUILD item, see gaps 1-3.

---

## Phase 5 - MEP design (electrical, HVAC, plumbing, low-current)
**تصميم الكهروميكانيكا: الكهرباء والتكييف والسباكة والصرف والتيار الخفيف**

**Purpose.** Design the building services so they fit the architecture and structure, are safe, and can be quantified and priced.

**Inputs**
- Architectural plans (rooms, areas, use, glazing, orientation)
- Structural layout (beam depths, shafts, slab openings)
- Utility connection letters (kVA, water pressure, sewer level)
- Owner requirements (AC type, solar heater, smart home, CCTV)

**Steps** (status, T.O X ids)

1. [P] ELECTRICAL - Load schedule: every room's lighting (W/m2 or lux method), sockets (typ. 10 A / 16 A), AC units, water heaters, kitchen, pumps, lift, EV charger; connected load, demand/diversity factors, total kVA, phase balance (single/three-phase supply).
   - T.O X: `model_72 [MODEL Systems > Electrical > Electrical Equipment]`, `model_74 [MODEL Systems > Electrical > Lighting Fixture]`, `model_73 [MODEL Systems > Electrical > Device]`, `model_134 [MODEL Analyze > Reports & Schedules > Panel Schedules]`, `o_sheet`  - R.X placements carry watts; Panel Schedules assign loads to the nearest panel and sum connected watts. No demand/diversity factors, no kVA/phase-balance report.
2. [P] Distribution: main distribution board (MDB), sub-boards per floor, circuits (lighting 10 A, sockets 16 A, AC dedicated), RCDs 30 mA on socket/wet circuits, metering point from the utility.
   - T.O X: `model_134 [MODEL Analyze > Reports & Schedules > Panel Schedules]`, `lib:vxeq`  - Panel schedule only; no single-line diagram tool.
3. [P] Cable and breaker sizing: design current Ib = P/(sqrt3 x V x pf) (3-ph) or P/(V x pf) (1-ph); breaker In >= Ib; cable Iz >= In from the code's ampacity table with derating (grouping, temperature, installation); voltage drop <= ~3 % lighting / 5 % total (check local rule); short-circuit check at the board.
   - T.O X: `ace_open`, `ace_load`, `env_qc`, `calc:mot`  - AC unit table: power from cooling and COP, current, breaker from the standard rating series, cable from voltage drop (resistance at conductor temperature). Ampacity tables are NOT typed in: user pastes them. Motor/transformer/voltage-drop calc in env_qc. No lighting/socket circuit sizing, no short-circuit calc.
4. [M] Earthing and protection: TN-C-S or TT per utility, earth electrode (rod/plate/foundation earth - often the footing steel is bonded), main equipotential bonding, lightning protection if required, surge protection at MDB.
   - T.O X: `wf:mep`  - wf_mep has a step 'Earthing, lightning, fire, ventilation' that only checks a list; no earthing resistance calc.
5. [M] Lighting design: lux target per room (rule of thumb living 100-150, kitchen/desk 300, corridors 100, bath 150-200), lumen method N = E x A / (F x UF x MF), fixture schedule, switching.
   - T.O X: `lib:vxeq`  - No lighting calculation tool.
6. [Y] HVAC - cooling load room by room (envelope U-values, glass by orientation, people, lights, equipment, ventilation, infiltration), diversity, select unit capacity (split HP / TR) with margin 10 %.
   - T.O X: `tab:hv`, `hv_room`, `hv_import`, `xf_hv`, `hv_csv`, `model_128 [MODEL Analyze > Energy Analysis > Heating and Cooling Loads]`  - V.X hourly design-day estimate (conduction with sol-air, Meinel solar, people, lights, vent, infiltration; no thermal storage = conservative). All inputs editable placeholders.
7. [P] Select equipment: split / ducted split / VRF, indoor units per room, outdoor units on roof/balcony with service clearance, refrigerant pipe length limits, condensate drains.
   - T.O X: `lib:vxeq`, `model_64 [MODEL Systems > HVAC > Mechanical Equipment]`, `model_65 [MODEL Systems > HVAC > Air Terminal]`  - Equipment library (AHU, FCU, split, VRF, chillers, diffusers) is placeholder data.
8. [Y] Duct sizing (if ducted): flow per diffuser, equal-friction method, velocity limits, aspect ratio, fittings K values entered by the user, critical-path pressure, fan static.
   - T.O X: `du_sec`, `du_load`, `du_csv`, `dp_open`, `dp_flow`  - Darcy-Weisbach + Swamee-Jain, Huebscher rectangular equivalent; duct plan assigns flows downstream and finds the critical path. No fitting tables (user enters K).
9. [M] Fresh air and extract: toilets/kitchen extract (typ. 10-15 ACH bath, kitchen hood), stairwell/garage rules.
   - T.O X: (none)  - No ventilation calc.
10. [P] PLUMBING - Water supply: fixture units per fixture, demand (probable flow from fixture units), pipe sizes by velocity (<= 1.5-2.0 m/s) and pressure loss (Hazen-Williams), pressure at highest fixture (>= 1-1.5 bar), ground tank + pump or roof tank (volume = persons x 150-250 L/day x 1-2 days), booster pump selection.
   - T.O X: `calc:hw`, `calc:mot`, `env_qc`, `model_80 [MODEL Systems > Plumbing & Piping > Plumbing Fixture]`  - Hazen-Williams head loss + velocity and pump/motor calc exist. No fixture-unit demand table, no tank-volume or pipe-sizing tool, R.X Pipe/Pipe Sizing are stubs.
11. [M] Hot water: solar heater + electric backup, pipe lengths, insulation.
   - T.O X: (none)
12. [P] Drainage and vent: fixture units to branch/stack sizes (typ. WC 100 mm, others 50-75 mm), slopes (1-2 %: >= 1:50 for 100 mm, 1:100 for >= 150 mm), vents, manhole at turns/ends (spacing <= 15-25 m), inspection chambers, grease trap for kitchen if required.
   - T.O X: `calc:man`, `lib:sxpipe`, `tab:plant`  - Manning full-flow capacity of a gravity pipe; S.X pipe/structure catalogue (placeholder); T.X pipe runs with DN/spec/BOM/iso (not linked to R.X).
13. [M] Sewer or septic: connect to public sewer if invert level allows gravity (check cover and slope), otherwise septic tank + soakaway/cesspit (بيارة) sized by persons x 150-200 L/day x retention 1-2 days; setback from water well / boundary per authority.
   - T.O X: (none)  - No septic/soakaway tool. Networks sample data (sewer/storm/water/fire) exist from the lift-station sample only.
14. [M] Rainwater: roof drains (area x rainfall intensity), downpipes, storm connection or soakaway.
   - T.O X: (none)
15. [P] Fire fighting: extinguishers per area, civil-defence approval for the building class, hose reel/standpipe if required by class; smoke detectors.
   - T.O X: `lb_cx`, `wf:mep`  - C.X fire symbols (8); network sample for fire mains exists in sample data.
16. [P] LOW-CURRENT - Data/telephone: structured cabling (Cat6) to each room, rack location, wifi AP positions; TV/satellite; intercom/video door phone; CCTV cameras + NVR (storage = cameras x bitrate x days); fire alarm panel + detectors/sounders + battery sizing; access control; smart-home bus if any.
   - T.O X: `lb_cx`, `lib:cxblk`  - Only CAD symbols in the block library; no riser diagram, no cable schedule, no battery/NVR calc.
17. [P] Draw MEP layouts: lighting+socket plans, panel schedule, AC layout + duct, water + drainage plans/risers/isometrics, low-current plans, schedules, specifications.
   - T.O X: `tab:draft`, `lb_cx`, `sheet`, `rv_plancad`, `plant_sheet`  - CAD + sheets; T.X iso sheet generator for pipes.
18. [Y] MEP check: wf_mep runs pump, motor, voltage drop, transformer, pipe velocity, safety, earthing in order and says 'missing' where no data.
   - T.O X: `wf:mep`, `wf_mep`  - Checks station-type items (pump/transformer) well; building items are mostly missing.

**Outputs / deliverables**
- Electrical: load schedule, single-line diagram, panel schedules, cable/breaker table, lighting plan, socket plan, earthing detail
- HVAC: cooling-load table, unit schedule, duct drawing + table, drain plan
- Plumbing: fixture-unit table, supply/drain/vent plans, risers, tank & pump data, septic/sewer detail
- Low-current: layouts + riser diagrams + schedules
- MEP specifications + BOQ inputs

**Checks and acceptance criteria**
- Electrical: Ib <= In <= Iz for every circuit; VD <= limit; earth fault loop / RCD operation; main kVA <= utility approval; every socket circuit RCD-protected
- HVAC: unit capacity >= room load x (1.0-1.15); duct velocity <= limit; total static within fan data; condensate falls
- Plumbing: velocity within 0.6-2.0 m/s; residual pressure >= 1 bar at worst fixture; drain slope >= minimum and flow depth < ~0.7 D; vent for every trap
- Septic/sewer: capacity >= persons x per-capita; levels allow gravity
- Fire: civil-defence approval in file
- All penetrations through slabs and beams are shown on the structural set

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB HVAC (Egypt, residential): 120-180 W per m2 conditioned area; 1 TR = 3.517 kW; 1 HP split ~ 9000-12000 Btu/h; ~1 HP per 10-14 m2 in a villa room with average glazing. Load calc supersedes this.
- RULE OF THUMB electrical: villa connected load 80-150 W/m2, after diversity ~ 40-70 W/m2; typical main supply 3-phase 380/220 V 50 Hz, 63-125 A for a villa (utility decides).
- RULE OF THUMB water: 150-250 L/person/day (check local), tank volume 1-2 days; supply pipe velocity 1.0-1.5 m/s.
- RULE OF THUMB drains: 100 mm at 1 % (1:100) minimum for WC branches where allowed (check code), 50 mm basin/shower at 2 %; manholes every <= 15-20 m.
- RULE OF THUMB duct: main 6-8 m/s, branches 3-5 m/s, friction 0.8-1.0 Pa/m (residential 0.6-0.8).

**Common mistakes**
- AC outdoor units without airflow clearance
- Condensate drains forgotten
- Sockets without RCD in bathrooms/kitchens
- Panel placed in bathroom/kitchen wall or behind a door
- Septic tank too close to a water well or boundary
- No riser shafts reserved -> pipes through beams
- Cable sized for current only (no voltage drop / derating)

**Typical duration:** 3-6 weeks for all disciplines (parallel to structural design)

**Demo hint:** Good existing coverage for HVAC cooling load > duct > AC electrical. Electrical load schedule/panel and plumbing sizing need small builds to be convincing (gaps 5-7).

---

## Phase 6 - Coordination, quantities, BOQ, specifications and cost estimate
**التنسيق وحصر الكميات والمقايسة والمواصفات والتكلفة**

**Purpose.** Prove the design is clash-free, then extract every quantity, attach specifications and prices, and produce the engineer's estimate that the tender and the budget rely on.

**Inputs**
- Final architectural + structural + MEP models/drawings
- Specification library (or the consultant's spec)
- Current unit prices (suppliers, recent tenders, official price lists)
- Soil/earthwork quantities

**Steps** (status, T.O X ids)

1. [Y] Coordination: federate the models (arch + structure + MEP), run clash detection (hard clashes first: pipes vs beams, ducts vs beams, columns vs doors), assign issues, re-run until closed; keep a clash log.
   - T.O X: `tab:coord`, `clash`, `nv_clash`, `p_coord`, `coord_nv1`, `is_open`, `is_new`, `mom_new`, `wf_qa`  - N.X clash detective + coordination checks (specs vs codes) + BCF-shaped issues (viewpoint, section cut, snapshot). Needs MEP as 3D geometry to be meaningful: R.X Duct/Pipe are stubs; only boxes (Mechanical Equipment, Device, Plumbing Fixture...).
2. [P] Check headroom/clear height under beams, slab openings vs shafts, door clearances, equipment access.
   - T.O X: `m_dist`, `m_btw`, `sA`, `sB`, `sC`  - Section planes and measure tools; no rule-based headroom check.
3. [Y] Quantity take-off by trade, per phase of work (excavation, blinding, concrete by element and grade, formwork area, steel kg, masonry m2/m3 minus openings, plaster, flooring, ceilings, doors/windows, paint, waterproofing, MEP points/lengths).
   - T.O X: `p_bom`, `qx_open`, `e_boq`, `model_132 [MODEL Analyze > Reports & Schedules > Quantities and cost]`  - getItems() BOQ rows R01.. from R.X elements (walls, floors, doors, windows, columns, stairs, roofs...). Q.X sheet: Model quantities (live link), Build BOQ, Cost summary, pivots. In template house2 the BOQ currently has only 6 rows (R01 76.6 m3, R03 48 m3, R06 152.5 m2, R08 9 no., R09 16 no., R10 1 no.; names not checked) - no foundations/beams/columns/rebar rows until those are modelled.
4. [P] Reinforcement quantity: from the BBS (phase 4); cross-check with kg/m3 ranges.
   - T.O X: `dc_rb`  - Station-based; not linked to R.X.
5. [Y] Earthwork quantities and disposal.
   - T.O X: `rc_qty`, `rc_open`, `survey_67 [SURVEY Analyze > Ground Data > Volumes]`
6. [M] Specifications: concrete grade/slump/cement/aggregate/water-cement ratio; steel grade + tests; masonry brick class + mortar; plaster mix and thickness; waterproofing system; tiles/paint classes; doors/windows; MEP materials (cables LSZH, pipes PPR/uPVC, AC brands, fixtures). Each BOQ item points to a spec section.
   - T.O X: `p_codes`, `lib:txspec`  - No specification library (T.X spec class tables are placeholders for pipes only). p_codes lists code titles; clause text deliberately not reproduced.
7. [M] Unit prices: enter or import rates per BOQ item (materials + labour + equipment + overhead + profit), VAT; keep source and date per rate.
   - T.O X: `qx_open`, `dc_tnd`, `lib:pxres`  - Q.X rate/percentage cells ship EMPTY by design; dc_tnd rate0 = 0; P.X resource lists have rates 0. There is no sample price list.
8. [Y] Cost estimate: sum by trade; add preliminaries (site setup, supervision, insurance), overhead, profit, contingency, VAT; cost per m2 BUA; compare with budget (phase 0).
   - T.O X: `dc_tnd`, `qx_open`, `p_scen`  - dc_tnd: overhead, profit, contingency, VAT on the BOQ; Q.X cost summary; p_scen price comparison + 5D.
9. [P] Cash-flow forecast later from schedule x costs (phase 8).
   - T.O X: `xf_p6`, `o_sheet`  - Template sheet exists.
10. [Y] QA review before issue: quantities zero check, rates missing check, drawings consistent.
   - T.O X: `wf:qa`, `wf_qa`  - wf_qa steps: quantities and rates > schedule > document control > calculations > coordination > risks.

**Outputs / deliverables**
- Clash report (closed)
- BOQ by trade (xlsx/csv) with quantities and spec references
- Specification book (volume 2)
- Engineer's estimate with cost per m2
- Coordination log

**Checks and acceptance criteria**
- Zero open hard clashes; every soft clash has a decision
- Quantities sanity vs rules of thumb: concrete 0.30-0.40 m3/m2 BUA, steel 100-130 kg/m3, blockwork area ~ 1.0-1.5 m2 per m2 BUA, plaster area ~ 2.0-2.8 m2 per m2 BUA (RULES OF THUMB)
- No BOQ line with qty 0 or rate 0 (wf_qa reports it)
- Every BOQ item has unit, spec reference and source of rate
- Estimate within +/-10 % of independent cost-per-m2 benchmark

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB: structure ~ 25-35 %, finishes ~ 30-40 %, MEP ~ 15-25 % of a villa construction cost (varies strongly with finish level).
- RULE OF THUMB: formwork ~ 6-8 m2 per m3 of beam/column concrete, 5-6 m2 per m3 of slab.
- RULE OF THUMB: add waste: concrete 3-5 %, steel 3-5 % (laps/cut), tiles 7-10 %, brick 3-5 %.

**Common mistakes**
- Quantities taken from architectural walls only (no structure)
- No allowance for laps/waste/formwork
- Rates without date and source
- Spec says one thing, BOQ item another
- Forgetting preliminaries (site office, water/electricity for works, scaffolding)

**Typical duration:** 2-4 weeks

**Demo hint:** Today ch3 'boq' works on the 6 R.X rows. To be convincing it needs foundations/columns/beams/slabs/rebar rows and a sample, clearly labelled price list (gap 4).

---

## Phase 7 - Tender and contracting
**المناقصة والتعاقد**

**Purpose.** Choose a contractor on a clear scope and price, with a contract that fixes time, payment, quality and responsibilities.

**Inputs**
- Complete drawings, specifications, BOQ
- Estimate and budget
- Shortlist of contractors (or owner-managed crews)
- Permit approvals

**Steps** (status, T.O X ids)

1. [P] Prepare tender package: instructions to bidders, general + particular conditions (e.g. FIDIC-style or the owner's contract), drawings, spec, BOQ, schedule format, bid bond rules, retention %, advance payment %, defects period, liquidated damages.
   - T.O X: `o_report`, `lb_ox`, `dc_new`, `dc_tnd`  - O.X has 11 letter/form templates (letter, RFI, IR, MIR, MOM, transmittal, NCR, daily report, payment certificate, variation order, checklist) - no tender/contract template.
2. [Y] Pre-qualify and invite 3-5 bidders; issue tender; log clarifications (RFI) and issue addenda.
   - T.O X: `dc_reg`, `dc_new`, `cde_open`, `rq_open`  - Register + CDE states + follow-up dashboard.
3. [F] Site visit and bid submission date; receive sealed bids (log them).
   - T.O X: `dc_reg`
4. [P] Bid comparison: price per trade vs estimate, unbalanced rates, qualifications, schedule, references, payment terms; normalise to the same scope.
   - T.O X: `p_scen`, `qx_open`, `o_sheet`  - Price comparison inside p_scen; no bid-normalisation sheet.
5. [F] Negotiate, clarify, recommend award; owner approval.
   - T.O X: (none)
6. [F] Contract signing: contract sum, program, key staff, insurance, performance bond, advance payment guarantee; start-work order.
   - T.O X: `dc_new`  - Log the signed documents in the register.
7. [Y] Set up contract administration: register of letters/RFI/submittals, payment certificate routine, variation procedure, meeting schedule.
   - T.O X: `dc_reg`, `dc_ipc`, `mom_open`, `is_open`, `ct_cal`, `ct_pulse`  - Interim payment certificate (cumulative, retention, advance recovery), MOM, issue tracker, calendar.

**Outputs / deliverables**
- Tender documents
- Bid comparison
- Signed contract with BOQ and program
- Contract administration set-up

**Checks and acceptance criteria**
- Bids on identical scope and BOQ
- Contract sum = BOQ total + agreed adjustments
- Bonds/insurance received before start
- Retention and advance recovery terms written in the IPC settings

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB: advance payment 10-20 %, retention 5-10 % until completion + defects period (6-12 months)
- RULE OF THUMB: reject a bid > 15 % below the estimate without a written explanation (unbalanced / missing scope)

**Common mistakes**
- Awarding on lowest price without scope normalisation
- No variation procedure
- Vague drawings -> endless extra claims
- Starting work without permit and insurance

**Typical duration:** 3-6 weeks

**Demo hint:** Short chapter: show dc_tnd pricing of the BOQ and dc_ipc certificate. A comparison table of 3 sample bids would be a nice add (needs sample data).

---

## Phase 8 - Planning: WBS, schedule, resources, cash flow, safety plan
**التخطيط: هيكل الأعمال والجدول والموارد والتدفق النقدي وخطة السلامة**

**Purpose.** Turn the BOQ into a logic-driven programme that shows when each trade works, what it costs per month and how it is kept safe.

**Inputs**
- BOQ quantities
- Crew productivities (local), calendar (Friday off, Ramadan, holidays)
- Contract dates
- Site constraints (access, neighbours)

**Steps** (status, T.O X ids)

1. [Y] Build the WBS: 1 Preliminaries, 2 Earthworks, 3 Foundations, 4 Superstructure (floor by floor), 5 Masonry, 6 MEP first fix, 7 Plaster, 8 MEP second fix, 9 Finishes, 10 External works, 11 Testing and handover.
   - T.O X: `wbs_open`, `p6`, `lib:pxact`  - P.X WBS + activity template library (4 templates, 62 activities, placeholder durations).
2. [Y] Create activities with durations from quantity / (crew x productivity): e.g. column pour, slab pour, blockwork per floor; set calendars (5/6/7-day).
   - T.O X: `xf_p6`, `lib:pxcal`, `p6`  - xf_p6 turns quantities into chained activities with your productivity; 9 calendars in the library.
3. [Y] Add logic: FS links, lags (concrete cure 7 days before stripping soffit formwork - spec; masonry after frame; MEP first fix before plaster; second fix after plaster), constraints, milestones.
   - T.O X: `p6`, `gantt_open`, `sched_70 [SCHED Tools > Schedule > Schedule (F9)]`  - CPM, critical path, float, baseline, drag bars (gantt).
4. [P] Resource loading: crews (steel fixers, carpenters, masons...) and equipment; check peaks and levelling.
   - T.O X: `lib:pxres`, `sched_23 [SCHED Edit > Assign > Roles]`  - Role assignment exists; resource rates 0; no levelling algorithm confirmed (check).
5. [P] Cost-load the schedule, produce monthly cash flow and S-curve; align with owner payment capacity.
   - T.O X: `p_scen`, `o_sheet`, `dc_ipc`  - 5D in p_scen; O.X sheet templates cash flow 12 months + S-curve table.
6. [Y] Risk: Monte Carlo on durations, risk register (rain, strikes, material delivery, permits), contingency time.
   - T.O X: `p_scen`
7. [P] Safety plan (HSE): hazards by activity (excavation collapse, falls from height, formwork failure, electrocution, lifting), PPE, edge protection, scaffolding inspection, emergency plan, permits to work; induction.
   - T.O X: `p_safety`, `wf:mep`, `lb_ox`  - Site safety/clash panel + ISO 45001 listed in codes; no HSE-plan or hazard-register template.
8. [Y] Link schedule to model (4D) and render a 4D video for the owner/authority.
   - T.O X: `p_sched`, `lk_sched`, `recsch`, `nv_timeliner`, `p_tl`  - 4D linking + video.
9. [Y] Baseline the schedule, issue the master programme and look-ahead formats.
   - T.O X: `sched_55 [SCHED Project > Baselines > Maintain Baselines]`, `xer`, `xml`, `xlsxs`

**Outputs / deliverables**
- WBS + master programme (baseline)
- Resource histogram
- Monthly cash flow + S-curve
- HSE plan
- 4D animation

**Checks and acceptance criteria**
- Critical path is continuous and driven by logical links (no constraints forcing dates)
- Float on non-critical branches reported
- Calendars include weekends/holidays/curing
- Cash flow peak <= available funds + financing
- Every high-risk activity has a method statement

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB villa durations (BUA ~ 400 m2): site setup 1 wk; excavation + blinding 1-2 wks; foundations 3-4 wks; each floor frame (columns, beams, slab) 3-4 wks; masonry 4-6 wks (overlaps with 2nd floor); MEP first fix 4-6 wks; plaster 4-6 wks; second fix + finishes 12-18 wks; external works 4-6 wks; testing/handover 2-3 wks; total 10-14 months.
- RULE OF THUMB productivity (per crew/day): concrete pour 40-60 m3 with a pump; formwork 12-18 m2/carpenter-day; steel fixing 250-400 kg/steel-fixer-day; blockwork (25 cm) 8-12 m2/mason-day; plaster 20-30 m2/plasterer-day; tiling 8-15 m2/tiler-day. Replace with the contractor's real data.

**Common mistakes**
- Schedule without logic (all dates typed)
- No curing/strip time between pours
- Plaster before MEP first fix
- Ignoring Ramadan/holiday productivity
- Cash flow ignoring retention and payment delays

**Typical duration:** 1-2 weeks (before construction starts)

**Demo hint:** P.X chapter exists (ch2 'sched'); add: calendar choice, template insertion, xf_p6 from quantities, critical path highlight, monthly cash flow.

---

## Phase 9 - Construction in true order, with inspections and hold points
**التنفيذ بالترتيب الصحيح مع الفحوصات ونقاط الإيقاف**

**Purpose.** Build the house in the only order that works, and prove quality at each stage before the next one covers it.

**Inputs**
- Approved drawings/specs/BOQ
- Baseline programme
- Method statements and ITPs (inspection and test plans)
- Permits
- Crews, equipment, suppliers

**Construction stages in true order (9.1-9.13)** - each: steps, crews, equipment, hold point and record, T.O X support

### 9.1 Site setup and set-out / تجهيز الموقع والتوقيع
1. {'n': 1, 'text': "Hoarding/fence, site office, store, toilets, temporary water and power (distribution board with RCD), signboard, safety signs, neighbours' condition photos."}
2. {'n': 2, 'text': 'Surveyor sets out grid lines and benchmark; offsets kept outside excavation; verify against plot boundary.'}
- **Crews:** Site engineer, surveyor + chainman, foreman, 2-4 labourers, security
- **Equipment:** Total station/level, string line, hand tools, water tank
- **Hold point / record:** HOLD: set-out checked by the consultant before excavation. Record: set-out sheet.
- **T.O X:** P: o_sheet, lb_ox (daily report/checklist), rc_open (stakeout points CSV) ; no set-out tool

### 9.2 Excavation and shoring / الحفر والسند
1. {'n': 1, 'text': 'Strip topsoil; excavate to founding level (leave last 10-20 cm for hand finish); side slopes or shoring near neighbours/roads; dewatering if the water table is above the base; keep spoil away from the edge.'}
2. {'n': 2, 'text': 'Check level, dimensions, soil type against the report; geotechnical engineer confirms bearing stratum (plate test or proof by inspection).'}
- **Crews:** Excavator operator, truck drivers, 4-6 labourers, safety officer
- **Equipment:** Excavator, loader, tipper trucks, dewatering pump, shoring/trench boxes
- **Hold point / record:** HOLD: founding level and soil acceptance (consultant + geotech). Record: excavation approval form with level readings.
- **T.O X:** P: rc_qty (volume), env_gr (dewatering estimate), dc_soil; no excavation-inspection form

### 9.3 Blinding and waterproofing of foundations / الخرسانة العادية وعزل الأساسات
1. {'n': 1, 'text': 'Compact base; lay polyethylene sheet if specified; pour lean concrete 5-10 cm (C10-C15) to level; anti-termite treatment of soil where specified; apply bituminous/membrane protection to footing and tie-beam sides below ground if specified.'}
- **Crews:** Concrete gang 6-8, mason, waterproofing applicator
- **Equipment:** Mixer or ready-mix truck, vibrator, level
- **Hold point / record:** HOLD: blinding level and dimensions; waterproofing continuity. Record: blinding approval.
- **T.O X:** P: lb_ox checklist; no spec/ITP library

### 9.4 Footings, neck columns and tie beams / القواعد ورقاب الأعمدة والسملات
1. {'n': 1, 'text': 'Mark footing positions on blinding; fix bottom mat reinforcement with cover blocks (spacers 50-75 mm); column starter bars with correct lap length and tie position; formwork for neck columns/tie beams; pour footing, then columns to underside of tie beam, then beams (or per design).'}
2. {'n': 2, 'text': 'Backfill in 20-30 cm layers, compact (typ. >= 95 % modified Proctor - per spec) after concrete reaches strength.'}
- **Crews:** Steel fixers 4-6, carpenters 3-4, concrete gang 6-8, foreman, QC engineer
- **Equipment:** Rebar cutter/bender, vibrator, concrete pump or crane bucket, ready-mix trucks, compaction roller/plate
- **Hold point / record:** HOLD 1: rebar inspection before pour (diameter, spacing, cover, laps, starters, cleanliness, formwork). HOLD 2: pour with approved mix, slump test, cubes. Records: rebar inspection request (IR), pour record, cube register.
- **T.O X:** P: lb_ox (IR, MIR, checklist) + dc_reg + rq follow-up; no cube/slump statistics tool

### 9.5 Ground slab / plinth beams and DPC / أرضية الدور الأرضي والعزل الأفقي
1. {'n': 1, 'text': 'Sub-base fill + compaction, PE sheet, reinforcement mesh/bars, services sleeves cast in (drains, conduits), pour slab on grade or suspended ground slab; plinth DPC (horizontal damp-proof course) under first masonry course; termite barrier.'}
- **Crews:** Steel fixers 3, concrete gang 6-8, finisher
- **Equipment:** Compactor, vibrator, screed, laser/level
- **Hold point / record:** HOLD: sleeves/embedded services inspected BEFORE pour (MEP + QC). Record: embedded works checklist.
- **T.O X:** P: nv_clash + R.X Plumbing Fixture/Device boxes (for sleeve positions); no sleeve schedule

### 9.6 Columns, beams and slabs - each floor / الأعمدة والكمرات والبلاطات لكل دور
1. {'n': 1, 'text': "Cycle per floor: column reinforcement + formwork -> pour columns; beam and slab formwork + props (shores) -> beam/slab reinforcement incl. top steel, stirrups, openings, edge beams -> MEP sleeves and conduits embedded -> inspection -> pour slab and beams monolithically (continuous, 'cold joint' avoided) -> curing >= 7 days (wet burlap / curing compound) -> strip side forms 1-2 days, soffits and props by strength/time per spec (typ. >= 14-21 days for spans, re-propping) -> repeat for next floor; stair cast with the slab."}
2. {'n': 2, 'text': 'Level and plumb checks on columns; deflection and cracks watched after strip.'}
- **Crews:** Steel fixers 8-10, carpenters 8-12, concrete gang 8-10, electricians/plumbers (sleeves), foreman, QC
- **Equipment:** Concrete pump, ready-mix trucks, poker vibrators, props + scaffolding, hoist/crane, rebar bender, level, plumb bob
- **Hold point / record:** HOLD 1: formwork and props inspection. HOLD 2: rebar inspection (incl. top steel, stirrups, cover, laps, openings). HOLD 3: MEP embedded works. HOLD 4: pour permit with mix design, slump, temperature, cubes (set of 3 per pour / per 50 m3 or as spec; test 7 and 28 days), curing record. HOLD 5: strip permit.
- **T.O X:** P: lb_ox, dc_reg, mom_open, is_open, ct_cal; P.X activity chain (p6, xf_p6); no cube-test record/strength acceptance tool

### 9.7 Roof slab, parapet, roof waterproofing and tanks / سقف الدور الأخير والبرابيت وعزل الأسطح
1. {'n': 1, 'text': 'Slab as 9.6 + parapet, drains, slope screed (1-2 %), thermal insulation, waterproofing membrane with upturns, protection screed and tiles, water tank supports, AC outdoor platforms, flood test (24-48 h) before protection.'}
- **Crews:** Waterproofing crew 4-6, masons, tilers
- **Equipment:** Torch/roller, level, water for flood test
- **Hold point / record:** HOLD: flood test pass (no leaks after 24-48 h). Record: flood test report.
- **T.O X:** P: lb_ox checklist; no ITP library

### 9.8 Masonry (external and internal walls) / المباني (الطوب الخارجي والداخلي)
1. {'n': 1, 'text': 'Set out walls from grids; first course on DPC; courses with mortar joints 10-12 mm; lintels over openings; tie to columns; chases for conduits/pipes cut after masonry (not through columns); stop 2-3 cm below beam soffit and fill later; control joints; wet bricks before laying.'}
- **Crews:** Masons 6-10 + helpers, foreman
- **Equipment:** Mixer, scaffolds, level, plumb
- **Hold point / record:** HOLD: opening sizes, verticality, lintels, chase depth. Record: masonry inspection.
- **T.O X:** Y: R.X walls drive quantities; P: rv_dim, rv_sched

### 9.9 MEP first fix (rough-in) / أعمال الكهروميكانيكا الأولى (داخل الحوائط)
1. {'n': 1, 'text': 'Electrical: conduits and back boxes in walls/ceilings, pulling wire after plaster rough; earth electrode and bonding; panel boxes. Plumbing: water supply pipes (PPR) in chases, drain stacks/branches with correct slope, vent pipes, floor drains, pressure test. HVAC: refrigerant copper lines and condensate drains in walls/ceilings, duct frames; Low-current: conduits for data/CCTV/TV/fire alarm. Fire: pipe/detector conduits.'}
- **Crews:** Electricians 4-6, plumbers 3-5, HVAC fitters 3-4, low-current techs 2
- **Equipment:** Pipe benders, press tools, pressure-test pump, megger
- **Hold point / record:** HOLD: pressure test water pipes (typ. 1.5 x working pressure, 2-24 h per spec), drain water/air test, conduit continuity and earth continuity BEFORE plaster. Records: test certificates.
- **T.O X:** P: ace_*, du_*, nv_clash; no test-certificate register

### 9.10 Plaster (internal and external) / المحارة الداخلية والخارجية
1. {'n': 1, 'text': 'Prepare surface (clean, wet, mesh over junction of masonry and concrete), 3 coats typical (rough, second, finish) with screeds as guides, corners, cement-sand ratio per spec, curing; external work in shade/curing; check flatness and plumb (typ. 3-5 mm in 2 m).'}
- **Crews:** Plasterers 8-12 + helpers
- **Equipment:** Mixer, scaffolds, straightedge
- **Hold point / record:** HOLD: MEP first fix tested and closed before plaster. Record: plaster inspection.
- **T.O X:** P: BOQ items; no inspection form

### 9.11 Floors, wall finishes, ceilings, doors/windows, paint / الأرضيات وتشطيبات الحوائط والأسقف والأبواب والدهانات
1. {'n': 1, 'text': 'Screed under floor finishes -> waterproofing in wet rooms + flood test -> wall/floor tiling -> false ceilings/gypsum -> door frames/aluminium windows (often earlier, before plaster) -> joinery -> paint primer + putty + 2 coats -> kitchen units, sanitary ware.'}
- **Crews:** Tilers 6-10, gypsum 3-5, carpenters, aluminium fitters, painters 6-10
- **Equipment:** Tile cutter, level, spray
- **Hold point / record:** HOLD: wet-area waterproofing flood test; tile sampling approval; colour approvals.
- **T.O X:** P: hx_mat (materials), hx_fur, lb_rx families; no finishes schedule per room

### 9.12 MEP second fix (trim) / أعمال الكهروميكانيكا الثانية (التركيبات النهائية)
1. {'n': 1, 'text': 'Wires pulled, sockets/switches/fixtures, panels terminated and labelled; sanitary fixtures and taps; AC indoor/outdoor units installed, refrigerant vacuum and charge; low-current devices, CCTV cameras, intercom, fire alarm devices.'}
- **Crews:** Electricians, plumbers, HVAC technicians, low-current techs
- **Equipment:** Meggers, multimeter, vacuum pump, gauges
- **Hold point / record:** HOLD: insulation resistance (megger), earth resistance, RCD trip test, polarity before energising.
- **T.O X:** P: ace_*; no test form

### 9.13 External works / الأعمال الخارجية
1. {'n': 1, 'text': 'Boundary wall, gate, paving, drainage connections to sewer/septic, manholes, landscaping, external lighting, gas/water/electric meters rooms, final site clean.'}
- **Crews:** Masons, pavers, landscapers, electricians
- **Equipment:** Paver compactor, mixers
- **Hold point / record:** HOLD: manholes and drainage test, sewer connection approved.
- **T.O X:** P: rc_open/ S.X for levels; S.X pipe lib

**Cross-cutting steps (T.O X mapping)**

**Steps** (status, T.O X ids)

1. [P] Run construction as stages 9.1-9.13 (below), each with its inspection request, pass/fail and photo.
   - T.O X: `lb_ox`, `dc_reg`, `rq_open`, `ct_tg`, `ct_col`, `cde_open`  - Documents + register + Telegram photo logger + collection tool exist; hold points are not linked to activities.
2. [Y] Track progress: weekly/daily report, percent complete by activity, 4D comparison planned vs actual.
   - T.O X: `p6`, `ct_rep`, `p_sched`, `recsch`
3. [P] Material approvals: samples, test certificates (steel mill certificate + tensile/bend tests, cement, aggregate sieve, bricks, tiles), delivery notes; MIR (material inspection request).
   - T.O X: `lb_ox`, `dc_reg`  - MIR template exists.
4. [P] Variations and claims: variation order, time extension, daily records.
   - T.O X: `lb_ox`, `dc_reg`, `dc_ipc`  - Variation order template; IPC.
5. [Y] Payment: monthly IPC with progress, retention, advance recovery.
   - T.O X: `dc_ipc`
6. [Y] Non-conformance: NCR with root cause, corrective action, closure.
   - T.O X: `lb_ox`, `dc_reg`, `is_new`  - NCR template + issues.

**Outputs / deliverables**
- Daily/weekly reports
- Inspection requests and approvals (set-out, excavation, rebar, pour, embedded, tests)
- Cube/test records
- IPC certificates
- NCRs
- Progress photos
- Updated programme

**Checks and acceptance criteria**
- Concrete: cube compressive strength acceptance per ECP 203 / spec - typical rule: average of consecutive results >= fcu + margin and no single result below a lower limit (CHECK the clause; do not quote numbers without it)
- Slump within spec (typical pumpable 100-150 mm, +/-25 mm); no water added on site; temperature limits; pour continuity (no cold joint within initial set time)
- Rebar: diameter, spacing +/- tolerance, cover (spacer blocks), laps/hooks, steel certificates; no oil/loose rust
- Formwork: dimensions +/- 5-10 mm, plumb, props braced, camber on long spans if spec
- Curing >= 7 days; strike times respected
- Pressure/leak tests documented BEFORE concealment
- As-built deviations recorded for the as-built set

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB cube sampling: 1 set (3 cubes) per pour per day or per 50 m3 (spec decides); test 7 days (about 65-70 % of 28-day strength expected) and 28 days.
- RULE OF THUMB cover blocks: footings 50-75 mm, slabs/beams/columns 20-30 mm (spec decides).
- RULE OF THUMB strike: vertical forms 24-48 h, slab soffits 7-14 days with props kept, long spans 21-28 days (spec decides).
- RULE OF THUMB crews for a villa: ~25-40 workers at peak (structure phase 20-30, finishing phase 40-60).

**Common mistakes**
- Pouring without rebar inspection
- Adding water to concrete on site
- Short curing in Egyptian summer heat (cracks)
- Cutting columns/beams for pipes after concrete
- Plastering before pressure test
- No cube samples kept -> no proof of strength
- Removing props early

**Typical duration:** 10-14 months total (see durations rules in phase 8)

**Demo hint:** Highest 'show' value: 4D animation by stage plus a single hold-point example (rebar inspection IR -> pass -> pour). Needs a small hold-point/inspection register tool tied to P.X activities (gap 9).

---

## Phase 10 - Testing, commissioning, snagging, handover, as-built, O&M and close-out
**الاختبارات والتشغيل التجريبي والملاحظات والتسليم والرسومات التنفيذية وكتيبات التشغيل والإغلاق**

**Purpose.** Prove the building works, fix what does not, hand over complete records and close the contract.

**Inputs**
- Completed works
- Test procedures
- Punch (snag) list from the consultant and owner
- Supplier warranties

**Steps** (status, T.O X ids)

1. [P] Testing: electrical (insulation resistance, continuity, earth resistance, RCD trip, polarity, loop impedance), plumbing (pressure test repeat, flow at fixtures, hot water), drainage (flow test), HVAC (air flow at diffusers, temperature drop, condensate), fire alarm (every detector tested), low-current (cable test certification).
   - T.O X: `wf:mep`, `lb_ox`  - wf_mep + checklist templates; no test-certificate register.
2. [F] Commissioning: energise and run all systems 24-72 h; balance air and water; set controls; train the owner (operation, emergency shutoffs, filters).
   - T.O X: (none)
3. [P] Snagging: walk-through with owner and consultant room by room, photograph defects, list with location, trade, due date; contractor fixes; re-inspect; closure.
   - T.O X: `is_new`, `is_open`, `ct_tg`, `ct_col`, `dc_reg`  - BCF-shaped issues from the 3D model with viewpoint and snapshot = a good snag tool for model-located defects; no room-by-room snag sheet.
4. [Y] Handover rules check: all permits closed, tests passed, snags closed or agreed, documents delivered, retention terms understood.
   - T.O X: `wf:hand`, `wf_hand`, `ct_pulse`  - Handover rules + project pulse.
5. [P] As-built: update drawings and the R.X model with every change (site instructions, MEP routes); issue as-built DWG/PDF/IFC.
   - T.O X: `rv_wall`, `tab:model`, `e_ifc`, `e_pdf`, `e_dxf`, `pack`, `ifc_open`, `pdf_open`  - Edit the model and export; no as-built redline/versioning workflow.
6. [Y] O&M manuals and asset register: equipment list (make, model, serial, warranty dates), maintenance intervals, spare parts, supplier contacts, emergency procedures, warranty certificates.
   - T.O X: `ct_ast`, `dc_file`, `o_report`, `dc_rep`  - Asset register for operation and maintenance exists (`ct_ast`).
7. [P] Final account: measured quantities vs contract, variations, final IPC, release of retention after the defects period, performance bond return.
   - T.O X: `dc_ipc`, `dc_tnd`, `qx_open`  - IPC and BOQ tools; no final-account comparison sheet.
8. [F] Occupancy / completion certificate from the authority (as-built permit); utilities meters in the owner's name (electricity, water, gas).
   - T.O X: (none)  - Authority procedure.
9. [Y] Close-out: lessons learned, archive the project package (ZIP), update the cost per m2 database.
   - T.O X: `pack`, `out_open`, `dc_file`, `ct_life`  - Package ZIP, output centre, filing index, project cycle view.

**Outputs / deliverables**
- Test and commissioning certificates
- Snag list closed
- As-built drawings and model
- O&M manuals + asset register
- Handover certificate; final account
- Archive package

**Checks and acceptance criteria**
- All tests pass with recorded values; any failure re-tested
- Zero open Category A snags; B-snags agreed in writing
- As-built set matches site (spot check 10 %)
- Warranty dates start at handover date
- Retention release date calculated from handover

**Quantities, formulas and rules of thumb** (labelled; not design approval)
- RULE OF THUMB defects liability period 6-12 months; retention 5-10 % held until it ends.
- RULE OF THUMB snag list: 100-300 items for a villa at first walk-through; 2-3 rounds to close.

**Common mistakes**
- Handover without as-built and O&M
- Snags not located (which room?)
- Warranty start dates not recorded
- Owner not trained on shut-off valves and breaker panel

**Typical duration:** 3-6 weeks + defects period

**Demo hint:** Show: 4D finish -> issue a snag with viewpoint -> wf_hand 'handover possible?' -> pack ZIP. These all exist today.

---

## Gap list (ranked by importance for a convincing end-to-end demo)

Rank logic: (a) the engineer or the owner would notice the hole at once, (b) later chapters depend on it, (c) build cost. "Placeholder" = can be shown honestly with clearly labelled sample data.

| Rank | Gap | Why it matters | Exists today | Suggested build (size) |
|---|---|---|---|---|
| 1 | **RC skeleton missing in the house template and in the demo: no footings, tie beams, columns on a grid, beams, slabs-on-grade** | The owner said walls were wrong. house2 is a masonry-only box (16 walls, 0 columns/beams/footings); BOQ shows 6 rows; every later phase (structure, quantities, schedule) starves. | R.X tools rv_col, rv_beam, rv_found, rv_fslab, rv_floor exist and work (default col 0.4x0.4). | New template `villa_rc` (or extend house2) + a demo script that places grid > footings > tie beams > columns > beams > slabs > walls > openings in the correct order. SMALL-MEDIUM (data + demo steps, no new engine). |
| 2 | **Structural design engine for building elements: slabs (one/two-way), beams (flexure+shear+deflection+crack), columns (axial+biaxial), footings (bearing, one-way shear, punching, flexure), stairs** | Phase 4 is the heart of 'reinforcement design and checks' the owner asked for. Only one strip/beam sheet exists. | `flex` (ACI form, simplified, cylinder f'c) and `bear` (W/A vs qa). | Sheets with pass/fail rows in the existing p_calc format. Use ACI 318 / Eurocode 2 forms first (formulas public), label ECP 203 as 'compare with your licensed copy' until the formula set is verified. MEDIUM-LARGE. |
| 3 | **ECP 203 / ECP 201 / ECP 202 method itself (cube strength fcu, gamma_c 1.5 / gamma_s 1.15, ECP load combinations, ECP seismic zones and spectra, ECP wind chapter)** | The target practice is Egyptian; today the sheet explicitly refuses ECP 203. A reviewer in Egypt will ask for it. | `p_codes` titles only; `env_eq` uses the Eurocode-8 form 'used by ECP 201'; wind panel says ECP 201 wind is not applied. | Needs the owner's licensed copy to verify every formula and table before coding (clause numbers must be read, not recalled). Plan: ship ACI/EC2 first, then ECP module with a 'verified against: edition/clause' column. LARGE and legal/licence-gated. |
| 4 | **Reinforcement detailing and bar bending schedule from the model: R.X rebar (Area, Path, Cover, Fabric, Couplers are stubs), ld / lap length calculator, BBS with weights, rebar in BOQ** | 'Structural reinforcement design and checks' needs bars, laps, stirrups and a schedule. The Rebar ribbon button only opens the lift-station rebar viewer. | `rb`/`p_rebar` (station rebar only), `dc_rb` take-off tab, bar-weight rule d^2/162 can be shown in O.X sheet. | Rebar layout generator for column/beam/slab/footing from the designed As + BBS table + steel kg row into getItems. MEDIUM-LARGE. |
| 5 | **Unit price library and specification library (rates ship empty by policy; no spec text)** | Phase 6 cannot show a cost estimate or cost per m2; the demo BOQ would show zeros. 'Specs, unit prices, library items' were explicitly requested by the owner. | Q.X Cost summary, dc_tnd (overhead/profit/contingency/VAT), p_scen price comparison; `lib:txspec` placeholder spec classes (pipes). | A SAMPLE price book (EGP, labelled 'sample - replace with your own', with date/source column) + a short spec book (concrete grades, steel, masonry, plaster, waterproofing, MEP) as editable O.X docs. SMALL-MEDIUM, owner must approve the sample figures. |
| 6 | **Load take-down and frame analysis (member forces): tributary loads, column axial per floor, continuous-beam and slab moments, combinations ECP 201 style** | Without forces there is nothing to design; the demo would type numbers by hand. | R.X 'Load Combinations' (floor loads, EN 1990 6.10 / ASCE 7); Boundary Conditions tags; no solver. | Coefficient-method solver for continuous beams/slabs + column take-down table; optional 2D frame matrix solver. MEDIUM. |
| 7 | **Plumbing and drainage design for buildings: fixture-unit demand, supply pipe sizing, drain/vent sizing and slopes, tank volume, septic / soakaway or sewer connection, rainwater** | Owner listed plumbing supply/drainage, fixture units, slopes, septic/sewer explicitly. | `hw`, `man`, `mot`, `env_qc`, T.X pipe runs (plant), S.X pipe catalogue, `Plumbing Fixture` box; R.X Pipe / Pipe Fitting / Pipe Sizing / Check Pipe Systems are stubs. | Sheets: fixture units -> flow -> diameter; drain slope/capacity table; septic sizing; plus R.X Pipe tool or a riser diagram. MEDIUM. |
| 8 | **Electrical design beyond AC units: load schedule with demand/diversity, circuit sizing with ampacity + derating, short-circuit, earthing/lightning calc, lighting (lux/lumen method), single-line diagram** | Owner listed load schedule, cable and breaker sizing, earthing, lighting. | `ace_*` (AC unit circuits; ampacity table pasted by user), `env_qc` (motor/transformer/VD), Panel Schedules (connected watts), Electrical Equipment/Device/Lighting Fixture boxes; Wire/Conduit/Cable Tray/Check Circuits are stubs. | Load-schedule sheet + circuit sizer + lighting sheet + SLD generator. MEDIUM. |
| 9 | **Construction QA/QC: hold-point / inspection register tied to P.X activities; cube-test results with acceptance statistics; rebar/pour/test records; snag list by room** | Owner asked for inspections, hold points, cube tests per stage. Today these are only free templates (IR, MIR, NCR, checklist) without logic. | O.X templates (IR, MIR, NCR, daily report, checklist 4 variants), register, follow-up dashboard, issues (BCF-shaped). | ITP table per stage (data in this document, phase 9) + register with status pass/fail/waived linked to activity id + cube sheet (3 cubes, mean, min, flag). MEDIUM. |
| 10 | **Low-current design (data, CCTV, fire alarm, intercom): device schedule, riser diagram, cable lengths, NVR storage, battery sizing** | Owner listed low-current systems; demo chapter `lowc` only places symbols. | C.X block library has electrical, fire and HVAC symbols; no device data. | Device schedule from placed symbols + riser diagram + 3 small calcs. SMALL-MEDIUM. |
| 11 | **Duct and pipe as 3D geometry in R.X (Duct, Duct Fitting, Pipe, Check Duct/Pipe/Circuit stubs)** | Clash detection (phase 6) is only convincing if MEP has real routes; today MEP is boxes. | V.X duct plan (2D tables), T.X pipe runs, R.X equipment boxes, nv_clash. | R.X Duct + Pipe polylines with size and elevation, feed to clash. MEDIUM. |
| 12 | **Settlement, layered soil, ECP 202 method, retaining/basement wall design** | Foundations (phase 4) and level changes (phase 1) need them; today Terzaghi only. | `dc_soil` Terzaghi + FS, `env_gr`, liquefaction screening, `float`. | Settlement sheet (elastic + consolidation, user soil data), retaining wall sheet (Rankine/Coulomb). MEDIUM. |
| 13 | **Deflection, crack width and vibration (serviceability) checks** | Required pass/fail criteria in phase 4; absent. | none | Add to the element sheets (gap 2). SMALL once gap 2 exists. |
| 14 | **Planning-rule checks for the plot: setbacks, coverage, floors, height, parking; building-permit checklist (Egypt)** | Phase 0/2 realism; permit is a gate before construction. | none (G.X draws polygons; area/perimeter tools exist). | Rule sheet + polygon-offset setback overlay on the plot. SMALL. Local rules must come from the district technical office. |
| 15 | **Programme / cash-flow link: S-curve and monthly cash flow generated from P.X activities x rates; resource levelling** | Phase 8 'cash flow' and 'resources'. | p_scen 5D, O.X cash-flow and S-curve sheet templates (manual), resource role assignment. | Generate S-curve from activity cost; check levelling feature exists. SMALL-MEDIUM. |
| 16 | **Finishes schedule per room (floor, skirting, wall, ceiling, paint, door/window mark) and quantities from it** | Finishes are 30-40 % of cost; BOQ today covers walls/floors/doors/windows/roofs only. | R.X Room tool, H.X materials (floors/walls/ceilings), rv_sched. | Room finish schedule table linked to rooms + BOQ lines. SMALL-MEDIUM. |
| 17 | **Site logistics and temporary works (access, crane/pump position, hoarding, formwork/props design)** | Phase 9.1 and 9.6. | none (draw on C.X). | Optional: site-layout template + props/shuttering checklist. SMALL. |
| 18 | **Tender documents / contract template and bid-normalisation sheet** | Phase 7 deliverables. | O.X letters/forms; p_scen price comparison. | Templates + comparison sheet. SMALL. |
| 19 | **As-built workflow (redlines, change log, version of model), O&M manual template, final-account comparison** | Phase 10 deliverables. | tm_vers (versions), ct_ast (assets), dc_ipc, pack ZIP. | Templates + comparison. SMALL. |
| 20 | **Hot water, ventilation/extract, rainwater and fire-fighting design sheets** | Completeness of MEP phase. | none | Small sheets each. SMALL. |

## Data the demo needs and where it lives

| Data | Status | Where it is / what to do |
|---|---|---|
| Villa template with full RC skeleton (grid, footings, columns, beams, slabs, stair, roof, walls, openings) | MISSING | TEMPLATES has blank/sewage/house2/office3. house2 = masonry box only (see gap 1). Demo registers `sample6868` (= same starter as house2). |
| R.X family types and layered assemblies (45 types, 12 assemblies) | EXISTS (placeholder sizes) | `lib:rxfam`, `lib:rxasm` (c_lb_rvsx.js), command `lb_rx`. Sizes are generic placeholders, not a manufacturer catalogue. |
| Materials and furniture for interiors | EXISTS | H.X assets `hx_mat`, `hx_fur` (vendor/hx-assets, 9.7 MB, licences in CREDITS.md; notes in incoming3/hxassets.md). |
| CAD blocks (arch 28, elec 19, plumb 9, fire 8, HVAC 13), hatches 32, linetypes, title blocks A1-A4 | EXISTS | `lib:cxblk`, `lib:cxhat`, `lib:cxlt`, `lib:cxds` (c_lb_cad.js). |
| P.X calendars (9), activity templates (4 templates / 62 activities), resource/role/cost-account lists (43, rates 0) | EXISTS (rates 0, durations placeholder) | `lib:pxcal`, `lib:pxact`, `lib:pxres` (c_lb_px.js). Egyptian holidays not preloaded. |
| Sample unit-price book (EGP) with date/source | MISSING (by policy rates ship empty) | Would live in Q.X sheet or an O.X xlsx template; Q.X rate cells empty; dc_tnd rate0 = 0. |
| Specification book (concrete, steel, masonry, plaster, waterproofing, finishes, MEP) | MISSING | `lib:txspec` has pipe spec classes only. Write as O.X documents; ship as sample text. |
| Soil data sample (borehole log, SPT, c, phi, gamma, water table) | PARTIAL | `DC.soil` structure exists (bh[], c, phi, gam, B, Df, fs, shape); demo must type a sample log. Lift-station soil data exist in the station project only. |
| Survey sample (points for a 20x30 m plot) | PARTIAL | S.X point import (CSV/PNEZD); lift-station survey exists; a villa-plot point set must be generated (30-60 points). |
| Code references (titles only): ECP 201/202/203, ACI 318-19, ASCE 7, SBC 301/304, ISO 19650, IEC 61439-1, ISO 45001 ... | EXISTS | `CODES` (37 entries) in c_codes.js; clause numbers deliberately not reproduced. |
| Seismic / wind parameters | PARTIAL | `SIM.eq`, `SIM.wd` defaults (Ss 0.3, S1 0.1, V 40 m/s) flagged as defaults by wf_struct; user types zone values. |
| HVAC cooling load inputs (U-values, glass, people, lights), AC electrical table, duct tables | EXISTS (editable placeholders) | V.X (`c_hvac.js`, `c_hvac2.js`, `c_duct.js`, `c_duct2.js`); equipment `lib:vxeq` (10 items). |
| Document templates: letter, RFI, IR, MIR, MOM, transmittal, NCR, daily report, payment certificate, variation order, checklist (4 variants) x EN/AR/both; sheets: BOQ, cash flow 12 months, S-curve, risk register, procurement log | EXISTS | `lib:oxdoc`, `lib:oxxls` (c_lb_ox.js), command `lb_ox`. |
| Inspection and test plan (ITP) per construction stage, with hold points | MISSING as data | Phase 9 of this document gives the first draft (stages 9.1-9.13) ready to become a table; acceptance numbers must come from the project spec / ECP 203 (check the clause). |
| Network sample data (sewer, storm, water, fire) with profiles | EXISTS (lift-station sample only) | `NETS` (c_nets_data.js), notes networks_data_register.md; not a house plot. |
| Reality-capture / earthworks sample | EXISTS | F.X `rc_*` commands (TIN, cut and fill) with incoming9/rc_note.md. |

## Proposed demo order (maps this document to chapters)

| Seq | Demo chapter | Phase | Exists in demo_ch1-3 | Needs |
|---|---|---|---|---|
| 1 | welcome + project (ch1) | 0 | yes | Add 1 caption about brief + budget; keep fast. |
| 2 | NEW site: map, survey points, TIN, boundary, soil log, seismic/wind inputs | 1 | partly (ch2 `site` = survey/excavation/cost) | Sample villa-plot points, borehole log; show dc_soil bearing + env_eq. Demo asserts: surface created, bearing qa number. |
| 3 | R.X architecture: levels > grids > walls (t 0.25) > openings > floors > stair > roof > rooms > sheets | 2 | partly (ch1 `rx`: 3 walls, floor, door, window, column) | Proper order and slower pace; section/elevation/plan views; render still. |
| 4 | NEW structural system + preliminary sizing | 3 | no | Template villa_rc (gap 1); take-down table (gap 6); show rv_props sizes. |
| 5 | Structure: footings > tie beams > columns > beams > slabs; design checks | 4 | partly (ch2 `struct`: concrete quantities + one bending check) | Gaps 2, 4: element sheets, rebar, BBS. Until built: honest 'screening' caption using `flex`, `bear`. |
| 6 | MEP: electrical (load schedule, AC circuits), HVAC (cooling load, ducts), plumbing, low-current | 5 | yes (ch2 `elec`, `hvac`; ch3 `lowc`, `plumb`) | Gaps 7, 8, 10 for real design; HVAC chain is the strongest today. |
| 7 | N.X coordination and clashes | 6 | yes (ch3 `clash`) | MEP geometry (gap 11) to make clashes real. |
| 8 | BOQ, specs, unit prices, estimate | 6 | partly (ch3 `boq`) | Gap 5 sample price + spec books. |
| 9 | NEW tender and contract (comparison of 3 sample bids, contract admin set-up) | 7 | no | Sample bid data, gap 18. |
| 10 | P.X planning: WBS, logic, cash flow, risk, safety plan | 8 | partly (ch2 `sched`) | Template insertion, calendar, xf_p6, S-curve (gap 15). |
| 11 | NEW construction by stage with hold points (4D by stage) | 9 | no | ITP register (gap 9); 4D video exists. |
| 12 | NEW handover: tests, snags, wf_hand, as-built, O&M, pack | 10 | partly (ch3 `out`) | Snag from 3D viewpoint, wf_hand, ct_ast, pack - all exist. |
| 13 | outputs (sheets, ZIP, vector, render) | 10 | yes (ch3 `out`) | None. |

## Uncertainty and what was NOT verified

- Standards: ECP 203 (concrete), ECP 201 (loads), ECP 202 (soil/foundations) are named from memory of their titles. NO clause number, load value, safety factor or limit is quoted as code text; where the document mentions typical values (gamma_c 1.5, gamma_s 1.15, 1.4 D + 1.6 L, cover, deflection and crack limits, min column size) they are the well-known textbook / Egyptian-practice values marked 'check the clause' - verify against the licensed edition (2018 for ECP 203 is expected, confirm).
- Egyptian steel grades (24/35, 36/52, 40/60), cube strength convention (fcu), local standards (ES numbers), Law 119 of 2008 and its regulations, civil-defence and utility rules: stated from general knowledge of Egyptian practice; the editions and current numbers were not looked up (no network research was done for this task).
- Every RULE OF THUMB figure (kg steel per m3, W/m2 loads, productivities, durations, cost shares, septic per-capita, velocity ranges) is an order-of-magnitude planning aid from general engineering practice, not from a cited source and not for design.
- T.O X state was read from the built page `vx_wired.html` (scratchpad, 2026-11-21 09:12) plus the c_*.js sources; the demo session may have changed chunks since. The registry dump counts 1608 commands (1462 non-stub). Stub flags are runtime values, not guesses. What a 'built' command does in detail was taken from the module notes (rvx.md, qx.md, p2tog.md, mod_cxsx.md, px2.md, lb.md, hxassets.md) and code headers; I did NOT click through each of the ~1400 working commands. Statements like 'no ... tool' mean: nothing found by registry, XDESC and grep for the topic - a quick re-grep is advisable before building.
- Libraries (`lib:*`) load their items lazily; the counts (45 R.X types, 12 assemblies, 91 CAD blocks...) are from lb.md, not from the live registry.
- Not checked: whether P.X has automatic resource levelling; the exact content of the R.X 'Rebar' button behaviour in a house project (ribbon impl is `p_rebar` = lift-station rebar viewer per c_rebar.js header); Arabic UI strings.
- No numbers were validated by running design calculations; the doc defines what the demo should show, not that T.O X computes it correctly beyond what its own tests claim (see the module notes).
