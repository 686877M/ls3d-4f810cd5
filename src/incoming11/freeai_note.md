# freeai: free model access for the T.O X agents (API presets, chain, relay, in-browser)

Files in `site/src/incoming11/`: `freeai_data.js` (provider table `FAP`, order `FAO`), `freeai.js` (logic and UI, everything inside one IIFE, exports `window.FA`), `freeai_test.js` (Playwright, 78 checks, fetch mocked), `freeai_ui.png` (screenshot). Research: `site/docs/research/FREE_AI_OPTIONS.md`. No shared chunk was edited. Size: 27 KB + 37 KB source, no library, no network at load.

## Integration (lead)
In `patch_v3.py` replace `rd('c_orb.js')` with `rd('c_orb.js')+rd('freeai_data.js')+rd('freeai.js')` (copy both next to the `c_*.js`; they must come after c_ai, c_bridge, c_orb). Top-level names added: `FAP`, `FAO` only (checked: no clash). Wrapped (previous called): `aiRender`, `xaModel`, `wxDefs`. **Replaced**: `aiChat` (same contract: returns true or 'ESCALATE', never throws; now with exact errors). New commands: `airelay_open`, `ai_run_pending`. New pane id `pane:airelay`.
Run: `NODE_PATH=<dir with playwright-core> nice -n 15 node freeai_test.js file:///.../site/index.html` (one Chrome only).

## What it adds
- **28 presets** in the AI pane picker, free first, each with a badge: FREE (ongoing free tier), FREE TRIAL (credit or time limited), FREE LOCAL, FREE NO API (relay), PAID last. Local: Ollama, LM Studio, llama.cpp, WebGPU. Free tier: Groq, Gemini, OpenRouter, Mistral, NVIDIA NIM, GitHub Models, Cloudflare Workers AI, Hugging Face, SiliconFlow, Z.ai GLM, Zhipu GLM. Trial: Qwen (Alibaba Model Studio), Cerebras, SambaNova, Tencent Hunyuan, Doubao, Cohere. Paid, no free tier verified (listed so the owner sees why): DeepSeek, Kimi, MiniMax, Yi, Baichuan, Together. Old ids (`groq`, `openrouter`, `gemini`, `ollama`, `lmstudio`, `openai`, `claude`, `custom`, `claudecode`) are unchanged, so saved settings keep working. Defaults changed for openrouter (`openrouter/free`, was a paid Qwen) and gemini (`gemini-flash-latest`).
- **Provider card** above the old fields: badge, free limits as found with source kind, "Verify on the provider site" mark with links (site, get a key), "not confirmed from a source" for `u:1` rows, research date, CORS/setup note.
- **Model picker**: free models first with a FREE tag. "List models from the server" reads `/models`; for OpenRouter "Load live free list" reads the public list (no key) and flags free = price 0. Gemini Pro is not tagged free.
- **Test connection / Test tool calling**: GET `/models`, then one tiny chat call (about 16 tokens), optionally one tool call. Reports exact status, provider message, latency, tokens, `x-ratelimit-*`/`retry-after` headers, and for network errors the likely causes (CORS, offline, wrong URL, mixed content, unfilled `ACCOUNT_ID`). Keys are masked in everything shown.
- **Keys are per provider**. Found and fixed an old leak: switching the provider kept the key field, so a Groq key would have been sent to the next provider's host. Now switching swaps the key. Keys live in sessionStorage (tab only); "Remember keys on this computer" moves them to localStorage; "Forget all keys" wipes both. Settings (chain, flags) in `xto-fa` never hold a key.
- **Free chain** (cheap tier): ordered list; each entry has provider, base URL, model, key. On 429 (uses `Retry-After`, Gemini `retryDelay`, or "try again in Xs"; daily/quota wording cools for 1 h, else 60 s), 5xx (30 s), network error, or any other error, go to the next entry. Cooling entries are skipped without a request; entries without a key are skipped with the reason shown. The model may call `escalate` (as before) to pass to the main model; if all fail the main model is used, or with `rules` as main the built-in rules answer. If an error arrives **after a tool already ran**, it stops instead of trying another provider, so a studio command never runs twice. A 400 about tools retries once without tools and tells the user the model can talk but cannot run commands. The old single "cheap model" tier still works when the chain is off.
- **Relay: copy prompt / paste answer** (`relay`): window with the prompt (request, tool list, project state, `tox` action format), Copy, links to ChatGPT/Claude/Gemini/DeepSeek/Qwen/Kimi/GLM/Mistral/HuggingChat (from memory), answer box. Parsed actions are listed; unknown tools dropped; **runs only on the Run click**. Voice works the same way: Whisper transcribes outside, the text becomes the prompt.
- **Claude Code via bridge** (`claudecode`): same inbox path as before, now with exact errors (HTTP code, "bad token", "bridge not running, start tools/tox_bridge.py") and a "Check bridge" button (`/ping`).
- **In-browser model** (`webllm`): WebGPU through WebLLM; library not bundled (`vendor/web-llm/web-llm.js`, or opt-in pinned CDN URL); text answers, actions only proposed.

## n8n and the free API list (owner addition)
- Provider `n8n` (webhook out): URL + token (header `x-tox-token`, token kept in the tab only, never in `xto-fa`), optional project state, 60 s timeout, exact errors, Test webhook button, reply `{reply,actions}`/array/plain text; actions only after Run. Button copies the "n8n calls T.O X" settings (HTTP Request node to bridge `/call` and `/reply`; no bridge edit needed).
- AI pane has a collapsible **Free API list** (name, base URL, limits marked verify, provider link); the same table is section 0 of FREE_AI_OPTIONS.md. Connector comparison is section 4 there.
- n8n not run for real: only mocked. n8n webhook CORS option name is from memory.
- Follow-up: MCP-over-HTTP/SSE endpoint in `tox_bridge.py` so n8n's MCP Client Tool can connect directly.

## Tests (88 checks, all pass; plus parity 126/126 on the new build, page load without page errors)
Mocked `fetch` in the page, no real key, no provider contacted: registry completeness (every provider has English + Arabic text, https/localhost URLs, no key-like strings), picker order, key isolation, tool loop, exact 429/401/404/network messages with the key masked, tool-less retry, chain order and fallback, cooldown skip, daily-quota cooldown, no double tool execution, escalate to main, old single-provider and old cheap-then-strong paths, connection test branches, OpenRouter live free flag, relay prompt/parse/confirm, broken JSON, bridge 200/401/down, WebLLM with a fake library and the no-WebGPU path, key storage rules, AI pane and Relay window render (English and Arabic).

## NOT tested
- No real provider was called: base URLs, model names, free quotas and whether each host sends CORS headers are **unverified in practice** (many are from third-party pages or memory; marked in the UI and the research file).
- WebGPU/WebLLM never ran on a real GPU; the library file and a real model download were not tried. Chrome only, no Safari/Firefox, no phone.
- Real tool-calling quality of free/small models not measured; the Test tool button checks only that a tool call comes back.
- The bridge side (`tox_bridge.py` inbox, a live Claude session replying) was mocked, not run.
- Arabic layout only checked on one screenshot-less text assertion; the English screenshot shows the pane works but is cramped at 46% width.
- Not tested: `Retry-After` cooldown timing over real time, reload persistence of the chain in a fresh browser profile, `file://` use of WebLLM (module import is blocked there).

## Follow-ups worth a session
1. **Local CORS proxy in `tox_bridge.py`** (`/proxy` that forwards to an allow-listed provider host with the key from the page): most hosts here may block browsers; this keeps keys on the owner's computer and makes every preset usable. Not done (bridge is not mine to edit).
2. Bundle `web-llm` (or transformers.js) under `vendor/` after a licence and size check.
3. Re-run the research in a month; free tiers move fast (Cerebras, Gemini, GitHub Models already show conflicting reports).
