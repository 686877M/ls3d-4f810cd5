# sttlocal.js - in-browser Arabic speech to text (provider `local-browser`)
Engine: Whisper (tiny or base, int8 ONNX) through transformers.js, run by onnxruntime-web WASM. No server, no key, audio never leaves the tab.

## Integrate
1. Add `site/src/incoming5/sttlocal.js` to the chunk chain AFTER c_ai.js, c_orb.js, c_agent2.js (it uses AI, AIS, aiTranscribe, say2, XCMD, b2, orbStatus) and before `window.__lsv=`. Nothing else is edited.
2. Ship `site/vendor/stt/` (transformers/ + models/) next to index.html. Path is `SL.dir='vendor/stt/'` (relative to the page); to host the files elsewhere change that one constant.
3. In the AI pane choose "Local in-browser Whisper"; the REC button and the always-on listener then use it. Model: the "Whisper model name" box (`whisper-base` default, `whisper-tiny` for speed).
4. Speed: add `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` to the static responses of tox_bridge.py `--serve` (and to https hosting). Without them the page is not cross-origin isolated and WASM runs on ONE thread (`SL.threads` shows it).
5. Test: `NODE_PATH=SP/pw/node_modules node site/src/incoming5/sttlocal_test.js [whisper-tiny|whisper-base]` (starts its own bridge on a random port, fake mic from a WAV, Cache API check). Command in the app: `stt_selftest`.

## What it does
- Lazy: nothing downloads until first use (or `slPreload()`). Progress bar bottom-left with MB. Files are fetched through the Cache API (`transformers-cache`), so later starts skip the download; ORT still needs a few seconds to compile the model.
- Audio (webm/opus/wav) -> 16 kHz mono -> energy VAD cuts (`slSplit`, silences >=300 ms, pieces <=22 s, silent audio -> no call) -> one Whisper call per piece, `max_new_tokens` capped by length (an uncapped decode loop hung the page once).
- Vocabulary hint: this Whisper port has no initial prompt, so `slHint` only fixes single-letter slips against ~50 engineering words (e.g. المنصوب -> المنسوب). Edit `SL.vocab`. It will not repair garbled words.
- Do not pass `chunk_length_s` to the pipeline: it hung in this build.

## Honest numbers (this i7-8850H, headless Chrome, 6 synthetic MSA sentences from `say -v Majed`, strict WER)
See the report; short version: tiny 29/53 words wrong, base 17/53, Vosk small-ar 18/53. Speed could not be measured cleanly: the Mac sat at load average 100-700 (12 threads) from other sessions.
