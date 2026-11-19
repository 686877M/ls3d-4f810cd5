# AGENTS: how an AI agent connects to the BVT-1 viewer

The viewer is a static page, so there is no server to call. An agent connects in one of three ways.

## 1. In-page JavaScript API (browser automation, devtools, bookmarklet)

```js
window.BVT.call('state')                           // parameters, day, schedule length, share link
window.BVT.call('setParam', {k:'t', v:0.5})         // change a design parameter (rebuilds everything)
window.BVT.call('setDay', {day:30})                 // move the 4D timeline
window.BVT.call('runChecks')                        // clashes, clearances and time-based conflicts
window.BVT.call('hazards')                          // hazard register with risk scores and controls
window.BVT.call('clashes')
window.BVT.call('items')                            // BOQ with quantities and costs
window.BVT.call('report')                           // text summary
window.BVT.call('lesson', {text:'...'})             // add a lesson learned
```

## 2. Embed in an iframe and use postMessage

```js
iframe.contentWindow.postMessage({bvt:true, id:1, cmd:'runChecks'}, '*');
window.addEventListener('message', e => { if (e.data && e.data.bvt) console.log(e.data.result); });
```

## 3. Share link with state

The Share tab builds a link whose `#s=` hash carries the parameters, the 4D day, the sequence and the camera. An agent can open that link to see exactly what the user saw.

The Share tab also has "Copy agent brief": a ready text (project, state, current issues) to paste into any agent.

## Rules for agents

- Do not invent data. Items marked `assumed` stay assumed until the owner confirms.
- Schedule durations, lead times and crews are editable assumptions, not contract data.
- Safety content is a reference list (ISO 45001, ISO 12100, ISO 7010, ISO 3864-1, ISO 12480-1, ISO 9927-1, ISO 31000 and local law). The project HSE officer and the approved HSE plan govern.
- Record every correction as a lesson (`BVT.call('lesson', ...)`) and update `docs/LEARNING_LOG.md`.
- Never claim a file opens in AutoCAD, Revit or Plant 3D unless you opened it there.
