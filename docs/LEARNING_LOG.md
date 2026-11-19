# LEARNING LOG: continuous improvement of the BVT-1 template and this project

How learning works here:

1. In the page, "Accept" on a clash or conflict teaches the tool to ignore that item next time (stored in the browser and in the project JSON, key `data.learn.rules`).
2. In the Share tab, "Add lesson" records a dated lesson (`data.learn.lessons`). Export it as JSON and paste the important ones below.
3. Each lesson that changes the engine becomes a code change plus an entry here.

## Lessons so far

| Date | Lesson | Change made |
|---|---|---|
| 2026-11-19 | Chrome with canvas or WebGL blocked crashed the whole script and showed a blank page. | Init is now guarded; fallback message; error bar. |
| 2026-11-19 | `IfcPump`, `IfcValve`, `IfcFilter`, `IfcFan` do not exist in IFC2X3; a real parser (ifcopenshell) silently dropped them. | Use `IfcFlowMovingDevice`, `IfcFlowController`, `IfcFlowTreatmentDevice`; keep the IFC4 class in a property. |
| 2026-11-19 | Python from python.org on macOS has no CA bundle, so `urllib` failed in the build tool. | Build tool falls back to `curl`. |
| 2026-11-19 | Group-level bounding boxes gave false clashes (pipe runs against rails and bolts). | Clash check now works at mesh level with an allowlist of intended contacts. |
| 2026-11-19 | A section drawing without hatch, dimensions and level symbols is not a usable drawing. | Drafting engine (ISO 128 line weights, hatch, dimension chains, level symbols, tags). |

## Open learning items

- Real durations, crews and supplier lead times from the contractor.
- Real site layout (gate, laydown, crane position) to replace the assumed one.
- Review of the hazard register by the HSE officer; update severity and likelihood in the page.
