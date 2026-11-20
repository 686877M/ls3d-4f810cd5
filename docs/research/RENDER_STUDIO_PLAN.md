# T.O X Render Studio: research and plan (2026-11-20)

Research only. No app source edited. Label rules: **[VERIFIED]** = read from a page, API or run in a browser this session. **[MEMORY]** = from my own knowledge, not re-checked. **[ESTIMATE]** = my reasoning, no measurement.

## ملخص عربي (8 سطور)

1. الاستوديو المقترح: تاب واحد اسمه "Render Studio" بتلات أقسام: Still (صورة)، Video (فيديو)، Batch (مجموعة منظورات) — زي Twinmotion/Enscape: الأول Presets بسيطة، وبعدين "Advanced".
2. الجودة: 5 مستويات (Draft / Standard / High / Ultra / Path-traced) كل مستوى بيغيّر: المقاس، الـ samples، الضل، AO، الانعكاس، الـ bloom، الـ motion blur.
3. الحركة: Orbit، Walkthrough على مسار، Fly-through بين المنظورات المحفوظة، Timelapse للجدول الزمني، Section animation — كلها بتتحول لـ "تايم لاين" واحد فيه keyframes وeasing.
4. الفيديو في المتصفح: الأضمن = رسم فريمات بشكل حتمي (deterministic، فريم فريم) + WebCodecs VideoEncoder + Mediabunny لتغليف MP4/WebM. اتأكدت إن `mp4-muxer` اتوقف رسميًا وبديله Mediabunny (MPL-2.0).
5. اتقاس هنا (Chrome 156 جوه التطبيق): MediaRecorder بيدعم VP9 وAV1 وH.264 MP4؛ وWebCodecs H.264 4K محتاج Level 5.1 (`avc1.640033`) مش 4.0.
6. الـ Path-tracing: `three-gpu-pathtracer` (MIT) صالح لصور ثابتة "Ultra" بس، وبطيء على كروت الـ integrated؛ مش للفيديو.
7. أول 20 ميزة مترتبة في القسم 7: أولها Presets الجودة + مقاسات + Still بدون ضوضاء + الفيديو الحتمي MP4.
8. ماقدرتش أقيس أداء الرسم الفعلي لأن لوحة المتصفح هنا مفيهاش WebGL/WebGPU — أرقام الـ GPU تقديرية؛ والقياس الحقيقي لازم على جهازك.

---

## 0. What this session verified

| Fact | Result | Source |
|---|---|---|
| three.js version / licence | 0.187.0, MIT | [VERIFIED] npm registry + GitHub API |
| `three-gpu-pathtracer` | npm 0.0.28 (2026-11-02), MIT, ~2.0 MB unpacked, peers: three >=0.187, three-mesh-bvh >=0.9.17, xatlas-web | [VERIFIED] |
| Path tracer API state | README on `main` documents only the **WebGPU** tracer (`three-gpu-pathtracer/webgpu`), says "requires WebGPU", warns it is unstable; only MeshStandard/MeshPhysical supported; has examples: DOF, denoise/upscale, HDR, area lights, **Animation Rendering (renderVideo.html)** | [VERIFIED] README |
| Path tracer WebGL build | 0.0.28 `exports` still has `"."` → `./src/index.js` (the older WebGL path tracer) beside `"./webgpu"`. README no longer documents it. Treat WebGL tracer as legacy | [VERIFIED] exports field; "legacy" is my inference |
| `mp4-muxer` | **Deprecated, unmaintained**; superseded by Mediabunny. `webm-muxer` last push 2025-07-03 (likely same fate, README not read) | [VERIFIED] mp4-muxer README, GitHub API |
| Mediabunny | MPL-2.0, 1.66.2; writes MP4, MOV, WebM, MKV, WAVE, MP3, Ogg…; uses WebCodecs; streaming output; tree-shakable "as small as 5 kB gzipped"; has `CanvasSource` for canvas → video, `Quality` presets | [VERIFIED] README |
| three.js postprocessing examples | `GTAOPass`, `SSAOPass`, `SAOPass`, `SSRPass`, `BokehPass`, `UnrealBloomPass`, `BloomPass`, `SSAARenderPass`, `TAARenderPass`, `SMAAPass`, `FXAAPass`, `OutputPass`, `LUTPass`, `AfterimagePass`, `OutlinePass`, `FilmPass`. **No motion-blur pass, no DOF-with-focus-pick UI** (BokehPass has focus/aperture/maxblur uniforms) | [VERIFIED] GitHub contents API |
| `postprocessing` (pmndrs) | 6.39.6, **Zlib**, 2.7 MB unpacked | [VERIFIED] |
| `n8ao` | 2.1.0, **ISC**, 1.0 MB unpacked, "SSAO with emphasis on temporal stability" | [VERIFIED] |
| `gifenc` | 1.0.3, MIT, 173 KB unpacked | [VERIFIED] |
| Babylon.js core / model-viewer | Apache-2.0; 74 MB / 43 MB unpacked on npm (tree-shaking / CDN builds are far smaller) | [VERIFIED] |
| Filament | Apache-2.0 | [VERIFIED] GitHub API |
| LuxCoreRender | Apache-2.0 | [VERIFIED] GitHub API |
| Mitsuba 3 | GitHub reports `NOASSERTION` (custom BSD-style file); read `LICENSE` before use | [VERIFIED] flag; [MEMORY] BSD-3 |
| Existing T.O X code | `c_render.js`: tiled still render to 12K, jitter averaging, 5 light presets, PNG/JPG, 268 Mpx canvas cap, "not path tracing". Recorders in `c_shell.js`, `c_office.js`: `captureStream` + MediaRecorder trying vp9→vp8→webm. `c_4d.js` timeline, `c_anim.js` small | [VERIFIED] read files |

### Browser probe (Chrome 156 / Electron pane in the Claude app, Intel Mac, 32 GB, 6 cores)

| Probe | Result |
|---|---|
| `MediaRecorder.isTypeSupported` | webm vp9 ✔, vp8 ✔, av1 ✔, webm+h264 ✔, **mp4 avc1.42E01E ✔, avc1.640028 ✔**, mp4 + aac ✔, webm vp9+opus ✔, `hvc1` ✘ |
| `VideoEncoder.isConfigSupported` | avc1.640028 1080p ✔, **avc1.640028 4K ✘**, **avc1.640033 4K ✔**, vp09 4K ✔, av01 4K ✔, hev1 4K ✘ |
| `VideoEncoder`/`AudioEncoder`/`OffscreenCanvas`/`showSaveFilePicker` | all present |
| 16384×16384 2D canvas | allocated |
| **WebGL1 / WebGL2 / WebGPU adapter** | **all unavailable in this pane** (webgl2 false, `requestAdapter()` null) |
| WebCodecs encode throughput (synthetic 2D-canvas frames, `VideoFrame` from OffscreenCanvas, includes canvas fill, hardware unknown) | H.264 1080p **21 fps**, H.264 4K **4.7 fps**, VP9 1080p **17 fps**, VP9 4K **5 fps**. File size ≈ 0.026 MB/frame (1080p H.264 at ~6 Mbps), 0.088 MB/frame (4K) |

Caveats [VERIFIED limits]: Electron pane is not Safari or Firefox. No GPU in this pane so numbers are encoder+canvas only and probably software; real hardware encode on a Mac is usually faster [ESTIMATE]. Treat as a **floor**, not as typical.

---

## 1. How the other tools present rendering

### 1.1 Offline / DCC tools

| Tool | Where the controls live | Quality presets | Still output | Animation output |
|---|---|---|---|---|
| **Blender** (Cycles, EEVEE) [MEMORY] | Properties editor tabs: Render (engine, sampling viewport/render, denoise, light paths, motion blur, film transparent, **Color Management: view transform, look, exposure, gamma**), Output (resolution X/Y + %, frame range/step, fps, path, format), World (Nishita sky: sun elevation/rotation, or HDRI), Camera data (lens mm, sensor, DOF object/distance, f-stop) | none built in; user sets samples (Cycles) / soft shadows, AO, bloom (EEVEE legacy) or ray tracing options (EEVEE Next) | PNG, JPEG, OpenEXR, TIFF… | Image sequence or FFmpeg video (MPEG-4/Matroska/WebM; H.264/VP9/AV1; quality; audio). Camera animation via keyframes (Dope Sheet/Timeline), Follow Path constraint; Turntable via Empty + rotate |
| **3ds Max + Arnold** [MEMORY] | Render Setup (F10): Common tab (time output single/range, output size presets, save file), Arnold Renderer tab (camera AA, diffuse/specular/transmission/SSS/volume samples, ray depth, denoiser Optix/Noice), Environment & Effects | Arnold has no named presets; Max has Render Presets files | PNG/JPG/EXR/TIF | AVI/image sequence; Walkthrough via path constraint + Animate toggle; Motion blur toggle |
| **Revit** [MEMORY] | Render dialog: Quality group (Draft, Low, Medium, High, Best, Custom), Output (Screen / Printer, dpi), Lighting scheme (Exterior sun only, Interior sun, Artificial…), Sun by date/time/place, Background (Sky, Color, Image; haze; horizon), Image (Exposure, white point), Cloud render | **Draft → Best** + Custom | Save to project / export PNG, JPG, BMP, TIF | Walkthrough (path with keyframes, frames, speed) exported AVI / image sequence at "Visual style" or rendered |
| **Navisworks** [MEMORY] | Presentation → Autodesk Rendering (materials, lights, ray-trace style), Animator and Scripter (timelines, camera from saved viewpoints, objects/scene animation), Export Animation dialog (source, renderer viewport/Autodesk, format AVI/JPG/PNG/BMP, size, fps, anti-alias) | Few; **TimeLiner** simulation exported as animation | Image export with size/AA | **TimeLiner to video**, viewpoint animations, section plane animations |
| **SketchUp + V-Ray** [MEMORY] | V-Ray Asset Editor: Render settings, Camera (physical camera: f-number, shutter, ISO, DOF, motion blur), Environment (sun/sky, HDRI), Ray tracing (adaptive/AA), GI, Denoiser, Output (size, aspect lock, render region) | Draft / Low / Medium / High / Ultra style presets | PNG/JPG/EXR | Scenes → animation export (SketchUp: MP4/AVI, resolution presets, fps, loop, anti-alias); V-Ray renders per frame |
| **SketchUp + Podium** [MEMORY] | Small panel: Render options (Sun/Shadow, Reflection, Ambient, Bloom, Quality 1-5, Image size), Lights, Materials flag; one-click render | quality 1–5 | image | via SketchUp scenes |
| **Unreal** [MEMORY] | **Sequencer** (timeline, cine camera, camera cuts, tracks) + **Movie Render Queue** (job → settings: Output (PNG/JPG/EXR/ProRes/H.264 with plugin), resolution, anti-aliasing: temporal samples + spatial, warm-up frames, console variables, high-res tiles, motion blur subsamples). Cine Camera: filmback, focal length, aperture, focus distance, tracking focus | presets via Settings in MRQ | PNG, JPG, EXR | Frame-by-frame deterministic; audio track in Sequencer |
| **Unity** [MEMORY] | **Timeline**, **Cinemachine** (virtual cameras, dolly track, blends), **Recorder** (Movie MP4/WebM/ProRes, Image sequence PNG/JPG/EXR, Animation clip, Audio, GIF in older versions), Post-processing Volume (exposure, bloom, DOF, motion blur, tone mapping) | – | Image sequence | Fixed frame rate recording; deterministic via Recorder "Constant frame rate" |

### 1.2 Real-time archviz tools (the "familiar way" for the owner)

| Tool | Layout pattern | What a user touches first | Advanced |
|---|---|---|---|
| **Lumion** [MEMORY] | Three modes: **Build** (scene) / **Photo** (single image) / **Movie** (clips). Photo and Movie share an **effects panel**: add effect list (Sun, Sky light, Clouds, Fog, Depth of field, Bloom, Color correction, Reflection, Shadows, Sun study, Section plane…). Output: star-rated quality (1–5 stars), resolution list (HD…8K for photo), movie clips with camera keyframe set, effects per clip, fps 24/30/60 | Pick effect "Style" (Photo has preset thumbnails: *Photo styles*) | Each effect has sliders. Section plane animation, Sun study, **Weather**, Moving objects |
| **Twinmotion** [MEMORY] | Left **Library** + right **Properties**; bottom **Media** panel (Image / Panorama / Video / Presentation / Path tracer export). Top-right "Ambience" slider set (sun date/time/place via **Environment**), **Media > Video** uses keyframes + **Path** + **Phasing** (visibility by time, "Phases"). Export dialog: resolution, format PNG/JPG/TGA/EXR, video MP4/H.264, quality, fps, "Path tracer" checkbox with samples | Ambience preset thumbnails, Lens: FOV, DOF, exposure, **Quality: Low/Medium/High/Ultra** (video) | Post effects stack (Camera: lens flare, motion blur, **tone mapping**, grain, vignette); phasing/animation is a big selling point |
| **Enscape** [MEMORY] | Floating **Visual settings** window with tabs: **Render** (quality Draft/Medium/High/Ultra/Custom, resolution, **Rendering mode**), **Atmosphere** (Time of day, sky, clouds, fog, haze, background), **Image** (exposure, tone mapping, white balance, DOF, bloom, vignette, lens flare…), **Output/Capture** (screenshot, **Batch render**, panorama, video). **Video Editor**: add keyframes from views, set duration, speed, FOV, **Camera shake** | Quality dropdown + Time of day slider | **Custom** quality; render region; Collage/Batch |
| **D5 Render** [MEMORY] | Dark UI: top bar (Image/Video/Pano), **Render** panel with resolution, "Quality" (Standard / High / Ultra), denoise, **Path tracing ("D5 Ray tracing / PT")**; left Assets library; right Environment (sun time, HDRI, fog, clouds); camera tab (FOV, DOF, exposure); **Video timeline** with keyframes (Camera, Time, Weather, Object animation), output MP4 | Environment presets, Quality dropdown | Tone mapping, post effects, light probes |
| **Autodesk / Enscape in Revit** | Same as above embedded | | |

**Common shape (what "familiar" means):** (1) a **mode switch** Image | Video | Panorama/Batch; (2) a **quality dropdown with 3-5 named levels + Custom**; (3) a **resolution dropdown with aspect presets and a custom W×H lock**; (4) **Environment** (time of day / sky / fog) as its own section with big preset thumbnails; (5) **Camera/lens** section (FOV, DOF, exposure) with sliders; (6) **Effects** list with checkboxes; (7) a **timeline strip at bottom** for video with keyframe diamonds; (8) one **Render** button + progress + "Open folder".

### 1.3 Open-source engines (browser-feasible or helper)

| Engine | What it gives | Controls it exposes (the useful ones) | Licence / state |
|---|---|---|---|
| **three.js WebGLRenderer** [VERIFIED lic; rest MEMORY] | Shadow maps (Basic, PCF, PCFSoft, VSM) with `mapSize`, `radius`, `bias`; `PMREMGenerator` (HDRI to prefiltered env, fromScene for sky); tone mapping No/Linear/Reinhard/Cineon/ACES/AgX/Neutral + `toneMappingExposure`; `setPixelRatio`; `preserveDrawingBuffer`; MSAA via `antialias` | all above | MIT 0.187 |
| **three.js postprocessing examples** [VERIFIED list] | GTAO (better than SSAO, `GTAOPass` with blend/ output modes), SSR, Bokeh DOF (focus, aperture, maxblur), UnrealBloom, SSAA/TAA accumulation, SMAA/FXAA, LUT, Outline | per-pass uniforms | MIT (in three) |
| **pmndrs `postprocessing`** [VERIFIED lic] | Merges effects into fewer passes (faster than stacking examples) [MEMORY] | many effects incl. SSAO, DOF with focus distance, bloom, tone mapping modes, SMAA | Zlib |
| **n8ao** [VERIFIED] | High quality AO with temporal stability, quality modes, half-res option [MEMORY] | radius, intensity, quality | ISC |
| **three-gpu-pathtracer** [VERIFIED] | Physically based GI, area lights, DOF, HDRI, denoise/upscale example, animation rendering example | samples, bounces, MIS, filter, tiles | MIT; WebGPU tracer on main, legacy WebGL tracer in `"."` |
| **Babylon.js** [MEMORY features, VERIFIED lic] | `DefaultRenderingPipeline` (MSAA/FXAA, bloom, DOF, chromatic aberration, grain, sharpen, image processing: tone mapping, exposure, contrast, vignette), `SSAO2`, `SSR`, GlowLayer, motion blur post-process, `VideoRecorder`, animation system with easing | very complete, one object with properties | Apache-2.0; large; switching engine from three.js = rewrite |
| **model-viewer** [MEMORY] | Web component for glTF: `exposure`, `shadow-intensity`, `environment-image`, `skybox-image`, `tone-mapping` (neutral/agx/aces), auto-rotate, `toBlob()` snapshot | few controls | Apache-2.0 | no video, not useful for a studio |
| **Filament (web)** [MEMORY] | PBR renderer compiled to WASM/WebGL2, IBL, SSAO, bloom, DOF, tone mapping, VSM shadows | camera/exposure real-world units | Apache-2.0; separate scene format, no benefit over three.js here |
| **LuxCoreRender** [MEMORY] | Offline CPU/OpenCL/CUDA path tracer, bidirectional, Blender export plugin (BlendLuxCore), film outputs, denoiser | – | Apache-2.0 | needs local install |
| **Mitsuba 3** [MEMORY] | Research offline renderer (Python), differentiable, many integrators, scene XML | – | BSD-style | needs Python + LLVM/CUDA |

Offline helpers (LuxCore, Mitsuba, Blender CLI) only make sense through the existing optional **local bridge** (export glTF/OBJ + camera JSON → run → pull image back). Not for the static page [ESTIMATE].

---

## 2. Controls users expect and how each maps to three.js

Cost: **free** = one uniform; **S** = small shader/pass; **M** = non-trivial; **L** = heavy/risky.

| Control | Expectation in other tools | three.js approach | Effort |
|---|---|---|---|
| Quality presets | named Draft…Ultra | preset object that sets all settings below | free |
| Resolution + aspect presets | HD/2K/4K/8K, 16:9, 1:1, 4:5, 9:16, 21:9, custom | already in `c_render.js` (RNS); add aspect + safe frame | S |
| Samples / supersampling | SPP 1-1000 | existing sub-pixel jitter; or `SSAARenderPass` | S |
| Denoise | one checkbox | none for raster; for path tracer use tracer's denoise; fake: temporal accumulation | M (path tracer only) |
| Exposure | EV slider | `renderer.toneMappingExposure` | free |
| Tone mapping | None/Reinhard/ACES/AgX/Neutral | `renderer.toneMapping` | free |
| Sun by date/time/location | slider | already `envApplySun(sunPos(...))` in code | free |
| Sky / HDRI | presets + upload | PMREM from `Sky` shader or `RGBELoader` | S |
| Shadows | quality, soft | `mapSize` 1k→8k, PCFSoft/VSM; sun frustum fit to scene bounds | S |
| AO | on/off + radius | GTAOPass (three) or n8ao | M |
| Reflections | on/off | env map; SSRPass for floors/glass | M |
| Bloom | strength/threshold | UnrealBloomPass | S |
| DOF + focus pick | click to set focus | BokehPass + raycast pick → focus distance | M |
| Motion blur | shutter angle | **render sub-frames at t±shutter/2 and average** (accumulation, only offline) | M |
| Fog | density/color/height | `scene.fog` (linear/exp2) | free |
| Camera lens / FOV | mm, sensor, FOV | `camera.setFocalLength`, `filmGauge` | free |
| Safe frames | title/action safe, aspect mask | 2D overlay | S |
| Transparent bg | checkbox | `alpha:true` + PNG; exists | free |
| Multiple views / batch | list of saved views → N stills | loop over saved cameras | S |
| Keyframes / path / easing | timeline | `Curve3` (CatmullRom), `Object3D` lerp, easing fns | M |
| Duration / fps / loop | – | timeline model | S |
| Turntable | degrees, speed | orbit around target as a generated path | S |
| Walkthrough speed | m/s | arc-length-parametrised path, eye height | M |
| Camera shake | off/on, amount | low-pass noise offset on camera (deterministic seed) | S |
| Timelapse of schedule | day range → frames | existing 4D/TimeLiner (`c_4d.js`): set date → visibility → render frame | M |
| Section / clip animation | plane moves | `renderer.clippingPlanes` constant animated | S |
| Visibility by phase | – | same as timelapse | S |
| Title overlay, watermark | text/logo | 2D canvas composite after render; **CJK/Arabic shaping via canvas OK** | S |
| Audio / music | upload track | WebCodecs AudioEncoder via Mediabunny (see 3.4) | M |
| Output | PNG/JPG seq, WebM/MP4, GIF | see section 3 | M |

---

## 3. Browser video export: options and limits

### 3.1 Options compared

| Method | Quality control | Deterministic? | Limits |
|---|---|---|---|
| **MediaRecorder on `canvas.captureStream(fps)`** | bitrate only (`videoBitsPerSecond`) | **No**: records real time; slow scene = dropped frames, wrong speed | Chrome gives VP9/VP8/AV1/H.264 in WebM and **MP4 (H.264/AAC) [VERIFIED in Chrome 156]**; older Chrome <126 had no MP4 [MEMORY]; Safari: MP4/H.264 (and recently WebM VP8/VP9 in 18.4+) [MEMORY]; Firefox: WebM, MP4 only recent [MEMORY]. Output WebM often has no seek index/duration (fix needed) [MEMORY]. Fine for the **screen recorder**, wrong for Render Studio |
| **WebCodecs `VideoEncoder` + muxer** | bitrate, keyframe interval, codec level, latency mode, per-frame timestamps | **Yes**: you choose each frame's timestamp | Chrome/Edge full; Safari 16.4+ video, audio later [MEMORY]; Firefox 130+ desktop [MEMORY]. Codec level limits (see below) |
| **PNG/JPG sequence → ZIP** | lossless | Yes | memory: keep a directory handle (`showDirectoryPicker`, Chromium only) or write blobs into a streamed ZIP; 4K PNG ≈ 8-15 MB each [ESTIMATE] |
| **GIF** (`gifenc`, MIT 173 KB [VERIFIED]) | 256 colours | Yes | file huge, only for short loops at ≤720p |

### 3.2 Muxers

* **Mediabunny (MPL-2.0)** is the one to use. `mp4-muxer` is deprecated and says so itself **[VERIFIED]**; `webm-muxer` is by the same author, last push 2025-07-03, no 2026 activity **[VERIFIED activity]**. Mediabunny: MP4/WebM/MOV/MKV out, `CanvasSource` feeds frames and handles the encoder, streaming target (no full-file RAM), audio sources, tree-shakable, 5 kB gz minimum **[VERIFIED README]**.
* **MPL-2.0** is file-level copyleft: fine to bundle, keep Mediabunny files unmodified or publish modifications to them **[VERIFIED README text]**.

### 3.3 Deterministic frame-by-frame loop (the core design)

```
for f in 0..N-1:
   t = f / fps
   timeline.apply(t)            // camera, sun, phase visibility, section plane, overlays
   renderStill(quality)         // same code as the Still renderer, same jitter seed
   motion blur: for s in 0..S-1: timeline.apply(t + (s/S-0.5)*shutter); render; accumulate
   frame = new VideoFrame(canvas, {timestamp: f*1e6/fps})
   await backpressure(encoder.encodeQueueSize < 4)   // never queue unbounded 4K frames
   encoder.encode(frame, {keyFrame: f % (fps*2) === 0}); frame.close()
await encoder.flush(); muxer.finalize()
```

Rules that matter [MEMORY unless marked]:
* One 4K RGBA frame = 33.2 MB; the encoder queue holds `VideoFrame`s on the GPU/CPU. Without back-pressure a 4K export can grow by >1 GB in seconds. **Bound the queue.**
* Use a **pause/resume + cancel** button; the browser tab must stay visible or at least not throttled (use `OffscreenCanvas` in a Worker or keep the tab foreground; background tab timers throttle to 1 Hz).
* Frame times must be **computed from the frame index**, never from `performance.now()`. Make animation code a pure function of `t`.
* Provide **resume from frame N** and write PNGs optionally so a crash does not lose an overnight render.

### 3.4 Limits and numbers

| Item | Value | Status |
|---|---|---|
| H.264 4K | needs **Level ≥ 5.1** codec string `avc1.640033`; `avc1.640028` (L4.0) rejected at 3840×2160 in Chrome 156 | [VERIFIED] |
| HEVC (`hev1`/`hvc1`) | rejected here | [VERIFIED] |
| VP9 / AV1 4K | accepted here | [VERIFIED] |
| Encode throughput (synthetic, floor) | H.264 1080p 21 fps, 4K 4.7 fps; VP9 1080p 17 fps, 4K 5 fps | [VERIFIED, with caveat above] |
| 8K video | not realistic: encoder level/hardware limits, memory | [ESTIMATE] |
| Max canvas | 16384² allocated here; existing code caps 268 Mpx (Chrome 2D canvas area limit, safe for 12K) | [VERIFIED allocate]; [MEMORY] limit values differ per browser/OS |
| Safari | canvas area limit 16.7 Mpx on iOS (≈4096²); desktop larger [MEMORY] |
| Audio | decode uploaded music with `AudioContext.decodeAudioData` → `AudioEncoder` (AAC for MP4, Opus for WebM) via Mediabunny `AudioBufferSource` [MEMORY], mix with simple gain + loop/trim + fade. No real-time mixing needed because export is offline |
| Streaming write | `showSaveFilePicker` (Chromium) → `FileSystemWritableFileStream` target so the full MP4 is not in RAM; fallback: BufferTarget up to ~1-2 GB [ESTIMATE] |

---

## 4. Recommended Render Studio layout

One docked tab (`render`), replacing the single-panel Render command. Right-side **inspector** (accordion, presets first), centre = live **preview** with safe frames, bottom = **timeline** (only in Video mode).

```
┌ Mode: [Still] [Video] [Batch/Views]            [Quality ▾ Draft|Standard|High|Ultra|Path-traced|Custom]  [Render ▶] ┐
│                                                                                                                      │
│  PREVIEW (aspect-locked, safe-frame toggle, focus-pick cursor)          │ INSPECTOR (accordion)                      │
│                                                                         │ 1 Output   size preset, aspect, fps, fmt   │
│                                                                         │ 2 Environment  thumbs: Day/Golden/Overcast │
│                                                                         │              /Night/Studio + date-time-loc │
│                                                                         │ 3 Camera   lens mm/FOV, DOF+pick, exposure │
│                                                                         │ 4 Effects  AO, SSR, Bloom, MB, Fog, Vignette│
│                                                                         │ 5 Materials override: clay / wire / x-ray  │
│                                                                         │ 6 Overlay   title, watermark, logo, north  │
│                                                                         │ 7 Advanced  samples, shadow map, bounces…  │
├─────────────────────────────────────────────────────────────────────────┴────────────────────────────────────────────┤
│ TIMELINE (Video):  [Movement ▾ Orbit|Walkthrough|Fly-through|Timelapse|Section|Custom]  ▶ ◼  00:12 / 00:30           │
│  Camera ◆────◆───────◆    Sun ◆──────◆    Phases ▮▮▮▮    Section ◆──◆    Audio ▁▂▃▂▁   easing ▾  loop ☐  shake ☐      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**Movement presets (one dropdown, each fills the timeline):**
* **Orbit/turntable**: centre = scene or selection, direction, turns, height, duration.
* **Walkthrough**: draw a path (click points on plan or on 3D), eye height 1.6 m, speed m/s (1.0/1.4/2.0), look-ahead smoothing, auto corner slowdown.
* **Fly-through**: pick saved views in order; per segment duration + easing (ease-in-out default); arc option.
* **Timelapse**: schedule date range → frames, phase overlay (date label, progress bar), combined with orbit/fixed camera.
* **Section animation**: axis X/Y/Z or plan level, start/end offset, plane visible toggle, cap fill option.
* **Custom**: keyframe diamonds on camera/sun/section tracks.

**Quality presets (what each changes) [ESTIMATE, to tune on real hardware]:**

| Setting | Draft | Standard | High | Ultra | Path-traced (stills only) |
|---|---|---|---|---|---|
| Resolution scale | 0.5× | 1× | 1× | 1× / tiled to 8K | 1× |
| Sub-pixel samples (existing jitter) | 1 | 4 | 8 | 16 | n/a |
| Shadow | 1k PCF | 2k PCFSoft | 4k PCFSoft | 8k PCFSoft/VSM | real |
| AO | off | GTAO 8 samples half-res | GTAO full | GTAO full + 2nd radius | real |
| Reflections | env only | env | + SSR | + SSR full | real |
| Bloom | off | on | on | on | on (post) |
| Motion blur sub-frames (video) | 0 | 0 | 4 | 8 | n/a |
| Tone mapping | ACES | AgX/ACES | AgX | AgX | AgX |
| Denoise | n/a | n/a | n/a | n/a | tracer denoise on |
| Est. time per 1080p frame, integrated GPU | 0.05–0.15 s | 0.3–0.8 s | 1–3 s | 4–12 s | 5–30 s for 64 spp |

---

## 5. Ranked list: 20 features to build first

Feasibility in a static page: **Y** = plain three.js + canvas; **Y+lib** = needs one small library (see 6); **Helper** = needs the local bridge.

| # | Feature | Why first | Feasible | Effort |
|---|---|---|---|---|
| 1 | **Quality preset dropdown** driving all settings | the "familiar" entry point | Y | S |
| 2 | **Resolution + aspect presets + safe frames + live preview mask** | everyone expects it | Y | S |
| 3 | **Environment presets with thumbnails** + sun by date/time/location (code exists) | biggest visual change per click | Y | S |
| 4 | **Tone mapping (AgX/ACES/Neutral) + exposure** | free quality | Y | free |
| 5 | **Deterministic video exporter** (WebCodecs + Mediabunny → MP4, WebM fallback) | core of "video" | Y+lib | M |
| 6 | **Timeline model** (tracks, keyframes, easing, duration, fps, loop) shared with existing 4D | everything animated hangs on this | Y | M |
| 7 | **Orbit/turntable generator** | simplest, shows the system works | Y | S |
| 8 | **Fly-through between saved views** (CatmullRom + easing) | the most demanded | Y | M |
| 9 | **Walkthrough along drawn path** (speed m/s, eye height) | archviz standard | Y | M |
| 10 | **Timelapse of construction schedule** (links `c_4d.js`) + date overlay | the owner's differentiator vs Lumion | Y | M |
| 11 | **GTAO ambient occlusion** | biggest realism gain per ms | Y | M |
| 12 | **Soft sun shadows tuned** (frustum fit to bounds, bias auto) | cheap and visible | Y | S |
| 13 | **Section/clip animation** | engineering-specific | Y | S |
| 14 | **Batch render of saved views** (N stills, one ZIP) | Enscape/Twinmotion habit | Y | S |
| 15 | **Title / watermark / date overlay** | professional output | Y | S |
| 16 | **Bloom + vignette + exposure post stack** | polish | Y | S |
| 17 | **DOF with click-to-focus** | cinematic look | Y | M |
| 18 | **Motion blur by sub-frame accumulation** (video High/Ultra) | smooth walkthroughs | Y | M |
| 19 | **PNG sequence / ZIP output + resume + cancel + ETA** | long jobs must be safe | Y | M |
| 20 | **Audio track (mp3/wav) mux + fade** | videos for clients | Y+lib | M |

Next tier (not in 20): SSR for floors, camera shake, GIF, path-traced still (three-gpu-pathtracer), LUT colour grading, weather/fog layers, panorama 360 still (cube map → equirect), local bridge → Blender/LuxCore job.

---

## 6. Open-source components worth adding

| Component | Licence | Size [VERIFIED npm unpacked unless noted] | Gives | Verdict |
|---|---|---|---|---|
| **Mediabunny** | MPL-2.0 | 11.9 MB package, but **5 kB gz minimum when tree-shaken** | MP4/WebM mux, audio, streaming file target, `CanvasSource` | **Add** (replaces mp4-muxer) |
| three.js `examples/jsm/postprocessing` (EffectComposer, GTAOPass, BokehPass, UnrealBloomPass, OutputPass) | MIT | already part of three (pick files; each a few KB to tens of KB) [MEMORY] | AO, DOF, bloom, tone map output | **Add** (no new dependency) |
| `n8ao` | ISC | 1.0 MB package | nicer AO if GTAO is too slow/noisy | Optional A/B |
| `postprocessing` (pmndrs) | Zlib | 2.7 MB package | merged effect pass, faster than stacking | Optional, only if pass count hurts |
| `three-gpu-pathtracer` + `three-mesh-bvh` + `xatlas-web` | MIT | 2.0 MB + 2.3 MB + wasm [VERIFIED first two] | path-traced "Ultra" stills, HDRI/DOF, denoise | **Phase 2**, behind a "Path-traced" preset, stills only, warn about iGPU time and unsupported materials |
| `gifenc` | MIT | 173 KB | GIF export | Optional |
| `fflate` (ZIP/DEFLATE) | MIT [MEMORY] | ~30 KB [MEMORY] | ZIP of PNG sequence / batch | Add if no zip code exists in app (check `c_outputs.js` first) |
| Babylon.js, model-viewer, Filament | Apache-2.0 | large | – | **Do not add** (second engine, no gain) |
| LuxCoreRender / Mitsuba / Blender CLI | Apache-2.0 / BSD-style / GPL | local install | offline photoreal | Only via local bridge, optional |
| `webm-muxer`, `mp4-muxer`, `whammy`, `ccapture.js` | – | – | – | **Avoid**: deprecated or old |

---

## 7. Performance cost on integrated GPUs

**No WebGL or WebGPU was available in this session's browser pane, so no render timing was measured.** The numbers below are [ESTIMATE] from typical three.js behaviour on Intel UHD/Iris and Apple M1-class GPUs; validate with a test page on the owner's machine before choosing preset defaults. Percentages are relative cost of one 1080p frame vs a plain forward render of the same scene.

| Effect | Typical relative cost (iGPU) | Notes |
|---|---|---|
| Plain forward + sun shadow 2k PCFSoft | 1× (baseline) | scene triangle count dominates |
| Shadow map 4k–8k | +20–80% | memory bandwidth; 8k = 256 MB depth |
| GTAO full-res | +60–150% | half-res + blur is the cheap mode |
| SSR | +80–200% | per-pixel ray march; use only on floor/glass |
| Bloom (UnrealBloom) | +15–40% | mip chain |
| BokehPass DOF | +40–100% | needs depth pre-pass in three |
| SSAA ×N | ×N | linear; existing jitter accumulation same |
| Motion blur S sub-frames | ×S | offline only |
| Float render targets | needs `EXT_color_buffer_float` (usually present) | 2× memory |
| Tiled 8K/12K still | cost = pixels; ~16–36× 1080p per sample | memory-safe, already coded |
| Path tracing 1080p | ~0.5–5 spp/s on iGPU | 100 spp ≈ 20–200 s per still; **unusable for video** |
| WebCodecs encode | see section 0 probe: H.264 1080p ≥ 21 fps and 4K ≈ 5 fps on this pane's (probably software) encoder | CPU/hardware encoder, runs parallel to GPU |
| Whole video, Standard 1080p30, 30 s (900 frames) | ≈ 5–15 min | render ~0.3–0.8 s/frame |
| Whole video, High 4K30, 30 s | ≈ 1–3 h | render + 4K encode dominates |

Practical limits: default to **1080p** for video, offer 4K with a visible time estimate (frames × measured time of the first 3 frames), keep 8K video disabled.

---

## 8. What I could not verify

* **Any GPU render timing.** Pane had no WebGL1/WebGL2/WebGPU adapter. All section 7 render numbers are estimates.
* Whether the Electron-pane encoder was hardware or software; Safari, Firefox, mobile browsers not tested. All Safari/Firefox support statements are from memory.
* UI layouts, preset names and defaults for **Lumion, Twinmotion, Enscape, D5, Revit, Navisworks, SketchUp/V-Ray/Podium, Max/Arnold, Unreal, Unity, Blender** are from memory; I did not open their current docs or run the tools. Versions change names often (e.g. EEVEE Next, Twinmotion path tracer, Enscape 4, D5 versions).
* `webm-muxer` deprecation status (README not read); only inferred from activity.
* Whether the legacy WebGL path tracer in `three-gpu-pathtracer`'s `"."` export still works with three 0.187 (not run, no WebGL here).
* three-gpu-pathtracer speed on integrated GPUs and its handling of this app's materials (custom shaders, clipping, instanced meshes, thousands of meshes).
* `fflate` size/licence, GTAOPass/SSRPass actual cost, n8ao half-res mode, pmndrs effect list (memory).
* Mitsuba's exact licence text (GitHub says `NOASSERTION`).
* Mediabunny's actual bundle size for our use (only the "5 kB minimum" claim read), and whether its audio path fits all browsers.
* `c_render.js`/`c_shell.js`/`c_office.js` were only skimmed; `c_4d.js` timeline API was not read, so effort estimates for linking timelapse are guesses.
