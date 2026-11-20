# Gap: Primavera P6 Professional vs our `sched` tab

Legend: **[V]** verified from page read (URL below). **[M]** from memory, not verified. Own wording, no vendor text copied.

Pages read:
- [V1] https://docs.oracle.com/cd/F74771_01/client_help//en_US/activities_window.htm (Activities window, P6 Professional help v23)
- [V2] https://docs.oracle.com/cd/F74771_01/English/User_Guides/p6_pro_user/the_resource_usage_profile.htm (Resource Usage Profile)
- Search results only (titles/snippets, pages not fully read): Oracle P6 Professional User Guide PDFs v20/v21/v25 under docs.oracle.com/cd/*/English/User_Guides/p6_pro_user/p6_pro_user.pdf.

## 1. What real P6 Professional has

### Window structure
- Main windows [M]: Projects, WBS, Activities, Resource Assignments, Tracking, Reports, Resources, Roles, Calendars, Cost accounts, Codes etc. Each is a tab; Activities stays open until projects close [V1].
- Activities window [V1]: **top layout** + **bottom layout**. Top: Activity Table, Gantt Chart, Activity Network. Bottom: Activity Details, Activity Usage Profile, Resource Usage Profile, Activity Usage Spreadsheet, Resource Usage Spreadsheet, Trace Logic [V1/V2 say Resource Usage Profile only in bottom, Network only in top].
- Layout Options bar + View menu + Top/Bottom Layout toolbars switch layouts [V1].
- Compare view: a second activity view beside the first to compare projects or baselines, each layout independent [V1].
- Edit toolbar/menu: add, delete, cut, copy, paste, link, renumber, dissolve, undo [V1]. Assign toolbar: resources, roles, activity codes, predecessors, successors, step templates [V1].
- Right-click Expand All / Collapse All [V1]. "Hide If Empty" in Group and Sort for empty WBS bands [V1].

### Concepts the guide lists as first-class [V1]
Activity codes and values, activity dates, steps and step templates, activity types, relationships, baselines, calendars, earned value, expenses, future period bucket planning, grouping (by field / WBS path / hierarchy), leveling, progress spotlight, resources, roles, risks, scheduling, sorting, store period performance, summarizing, updating progress, WBS, work products and documents. Past period actuals, notebooks, constraints, durations/percent-complete types, milestones, activity owner (EPPM connected only).

### Resource Usage Profile [V2]
Histogram of units or cost for resources or roles, for one project or all projects (total allocation). Options: cost vs quantity, timescale, past-period actual vs actual-to-date, stacked histogram (colors/patterns), cumulative curves, "banana" curve early vs late, overload identification, average line, save/share profile. Uses resource curves and Usage Spreadsheet manual values.

### Menus [M]
File, Edit, View, Project, Enterprise, Tools, Admin, Help. Tools: Schedule (F9), Level Resources, Apply Actuals, Update Progress, Summarize, Store Period Performance, Claim Digger, Global Change, Reports, Tracking, Publish, Check-in/out, Schedule Check (newer). Enterprise: EPS, OBS, Resources, Roles, Calendars, Cost accounts, Codes, User Defined Fields.

## 2. Our `sched` tab today (from our_commands.json, 92 rows)
Have (built*): New, Open, Save, Projects, Print, Export XER/MS Project XML/XLSX/CSV, Undo/Redo, Find, Activities (Gantt), Timeline dock, 4D schedule, Zoom x3, WBS, Activities, Work Products and Documents, Expenses, Issues, Risks, Maintain Baselines, Project details, Calendar, Calendars, Schedule (F9), Update Progress, Scenarios and risk, Claim Digger, Check Schedule, Follow-up reports, Reports, Report Wizard, Tracking, Publish, Video of 4D, Users.
Listed but not built: everything else (Import XER/XLSX, Cut/Copy/Paste/Add/Delete/Dissolve/Renumber, all Assign items, Activity Network, Usage Spreadsheet, Resource Usage Profile, Columns/Bars/Timescale/Filters/Group and Sort/Bottom Layout/Progress Line, Resource Assignments, Thresholds, Assign Baselines, EPS/OBS/Resources/Roles/Cost Accounts/Codes/UDF, Level Resources, Apply Actuals, Recalculate Costs, Summarize, Store Period Performance, Global Change, admin items).

## 3. Gaps, prioritised (P0 = owner's complaint "missing details")

| Pri | Gap | Why | Browser build |
|---|---|---|---|
| P0 | **Top/bottom layout + Activity Details panel** (General, Status, Relationships, Resources, Codes, Steps, Notebook tabs) | Core P6 feel [V1] | Split pane; bottom panel is tabs bound to selected row |
| P0 | **Predecessor/successor editing** with FS/SS/FF/SF + lag, in table and by dragging in Gantt | Without logic no CPM | Relationship table + drag handle on bars; validate cycles |
| P0 | **Columns, Group and Sort, Filters** dialogs + saved layouts | Daily P6 use [V1] | Column picker, multi-key sort, group by WBS/code/any field, filter builder (field/op/value, AND/OR), localStorage layouts |
| P0 | **Activity types, duration types, percent-complete types, constraints, milestones** | Needed for correct dates [V1] | Fields on activity; engine honours them in F9 |
| P0 | **Calendars** (global/project/resource, holidays, exceptions) assigned per activity | Dates wrong otherwise | Calendar editor + work-day arithmetic in engine |
| P1 | Add/Delete/Dissolve/Cut/Copy/Paste/Renumber IDs | Basic editing [V1] | Row ops; Dissolve = reconnect preds to succs |
| P1 | **Resources, Roles, Assignments** + Resource Usage Profile/Spreadsheet | Histogram, overload [V2] | Resource dictionary, assignments, canvas histogram + cumulative curve, stacked mode, resource curves |
| P1 | **Baselines** (maintain, assign primary/secondary) + baseline bars in Gantt | Variance reporting | Snapshot activities into baseline sets; extra bars |
| P1 | **Activity Network** (boxes + lines) | Logic review [V1] | SVG/canvas auto layout by WBS or time; drag-create links |
| P1 | Progress: actual dates, % complete, remaining duration, Progress Line, progress spotlight | Update cycle [V1] | Data date; line drawn on Gantt |
| P1 | Level Resources, Apply Actuals, Summarize, Store Period Performance | Tools menu [V1] | Leveling = priority-based shift; summarize = roll-up to WBS |
| P2 | Steps and step templates, expenses detail, thresholds/issues, notebook topics | Detail fidelity [V1] | Child tables |
| P2 | Codes: activity/project codes, UDFs, EPS/OBS, cost accounts | Enterprise data [M] | Generic code-type tables used by group/filter |
| P2 | Compare view (project vs baseline) | [V1] | Second Gantt pane |
| P2 | Import XER/XLSX; Global Change; Report Wizard fields | Interop | XER text parser (tables TASK, TASKPRED, PROJWBS, CALENDAR); rule-based bulk edit |
| P3 | Trace Logic, Admin pages, security profiles, currencies, financial periods | Rarely used offline | Later |

## 4. How to build core features in a browser (concise)
- **CPM engine**: forward/backward pass on a DAG, 4 relationship types + lag in calendar units, constraints (start-on-or-after, finish-on-or-before, mandatory), total/free float, critical = TF ≤ 0. Calendar math is the hard part; unit-test against hand-computed XER sample.
- **Gantt**: canvas/SVG, timescale zoom levels, bar types configurable (current, baseline, critical, summary, milestone), relationship lines.
- **Table**: virtualised rows, editable cells, column resize/reorder, WBS tree with collapse.
- **Data model**: projects → WBS → activities → relationships / assignments / steps / codes; export XER by table mapping.

## 5. Not verified
Exact menu order and toolbar icons, keyboard shortcuts other than F9, Schedule Check availability by version, XER table list, P6 EPPM web differences. Filters/baselines/calendars pages not opened (only listed in V1 index).
