# AI stack plan for T.O X: Arabic LLM, "Jarvis" agent, speech in/out (2026-11-20)

## ملخص بالعربي (8 سطور)
1. أحسن موديل محلي لجهاز Intel Mac فيه 8–16 جيجا: `qwen3.5:4b` (حوالي 3.3–4 جيجا، بيدعم الأدوات، رخصة Apache). لو الجهاز 16 جيجا جرّب كمان `Jais-3-7B` (GGUF من IFM، 5.6 جيجا، أقوى في العربي حسب أرقام الشركة نفسها) بس دعمه للأدوات في Ollama مش متأكد منه. للجهاز القوي: `gemma4:26b` أو `Jais-3-32B`.
2. الجهاز الـ Intel بيشغّل Ollama على المعالج بس (CPU only، ومطلوب macOS 14+)، و LM Studio مش بيدعم Intel Mac خالص. يعني المتوقع بطيء (كام توكن في الثانية)، فخلّي قواعد الصفحة (Tier 0) تعمل أغلب الشغل والموديل للأسئلة الحرة بس.
3. "Hermes" = موديلات Nous Research **وكمان** وكيل جاهز اسمه Hermes Agent (MIT، بيتكلم MCP، وعنده سيرفر OpenAI-compatible على 127.0.0.1:8642، وبيشتغل من تليجرام): أرخص ربط إننا نضيف `tox_bridge.py` كسيرفر MCP في إعداداته. "Jarvis" مفيش مشروع واحد بالاسم؛ البدائل: Open Interpreter (Apache)، Home Assistant Assist (Apache)، LibreChat / AnythingLLM / LocalAI (MIT + MCP)، و Open WebUI (رخصة مخصصة بشرط الحفاظ على الاسم).
4. الصوت→نص: Whisper (MIT) هو الأساس؛ للجهاز الضعيف whisper.cpp بموديل small (حوالي 850 ميجا رام). فيه ضبط دقيق للمصري على Hugging Face بس أرقامه بيقيسها أصحابه، وحتى أحسن موديل (Jais-ASR) بيعمل ~47% خطأ كلمات على لهجات المحادثة. اللهجة لسه صعبة، فجرّب على صوتك أنت.
5. أونلاين مجاني: Groq (Whisper turbo + LLM)، Gemini (Transcribe و TTS مجاني ويدعم المصري)، OpenRouter (12 موديل مجاني منهم Gemma 4)، Cloudflare (10,000 neuron/يوم). اختبرت CORS بنفسي: Groq / OpenRouter / Gemini / Mistral / Together / Cerebras / HF بيسمحوا بالنداء من صفحة static؛ Cloudflare و GitHub Models و NVIDIA و SambaNova لأ. **كلهم محتاجين API key**، والمفتاح في صفحة static ظاهر لأي حد يفتح DevTools: استخدم مفتاح مخصص بحدود، أو وسيط Worker. خطة Gemini المجانية بتستخدم بياناتك لتحسين منتجاتهم.
6. TTS عربي: `speechSynthesis` في المتصفح أسهل حاجة (الأصوات حسب النظام). أحسن صوت مصري مجاني لقيته Gemini TTS (سحابي)، و Azure ar-EG (سحابي، مدفوع). Piper المحلي عنده صوت أردني بس. XTTS و MMS و Habibi-TTS رخصتها non-commercial.
7. المعمارية: Tier 0 قواعد الصفحة، Tier 1 موديل أونلاين مجاني، Tier 2 Ollama محلي، Tier 3 وكيل خارجي عبر الجسر. الـ wake word في Chrome: Web Speech API (`ar-EG`، continuous) + زر Push-to-talk دايماً؛ مفيش "always-on" حقيقي لو التاب اتقفل. القسم 6.3 فيه أول 10 إعدادات بالقيم.
8. لقيت إن ناس كتير بتقيس العربي بأسئلة اختيار من متعدد، ومفيش رقم مؤكد للمصري لأي موديل لغوي. كل أرقام Jais-3 من الشركة نفسها، وأنا ما حمّلتش أي موديل ولا قست سرعة على جهازك. القسم 7 فيه كل اللي ماقدرتش أتأكد منه.

---

## 0. Method and labels
- **VERIFIED** = read on 2026-11-20 from the cited page or API (Ollama library pages, Hugging Face API/model cards, GitHub API/README, vendor docs, PyPI JSON) or measured by me (CORS preflights).
- **VENDOR** = number published by the model's own authors; not independently reproduced.
- **MEMORY** = my own knowledge, not read today. Treat as a lead.
- I downloaded no model or media. I sent no user data in any request. CORS tests were `OPTIONS` preflights with a fake origin and no key.
- Machine assumption: owner's computer is probably an **Intel Mac** (my shell here reports `x86_64`). The macOS version is unknown; Ollama needs macOS 14+ (VERIFIED, docs/macos.mdx).
- The model landscape moved a lot in 2025-2026 (Qwen3.5/3.6, Gemma 4, Jais 2/3, Hermes 4.x). Several names below postdate older write-ups; everything was re-read today.

---

## 1. Arabic-capable LLMs

### 1.1 Hardware reality check (VERIFIED)
- Ollama on Mac: "Apple M series (CPU and GPU support) or x86 (CPU only)", macOS Sonoma 14+.
- LM Studio on Mac: Apple Silicon only, macOS 14+. "Intel-based Macs are currently not supported." So **LM Studio is out** for an Intel Mac.
- llama.cpp supports Intel Macs (CPU, Accelerate/AVX; MEMORY for exact speed).
- Rule of thumb (MEMORY): RAM needed at 4-bit = Ollama download size + 1 to 2 GB for a 4-8K context; more for long context. CPU-only 7-9B at Q4 on an older Intel laptop: roughly 2-5 tokens/s (estimate, measure with `ollama run <tag> --verbose`).
- Qwen3.5/Gemma 4 are "thinking" models by default: for voice, switch thinking off or the first word arrives late (MEMORY: Ollama API field `"think": false`).

### 1.2 Model table (sizes = Ollama download at default quant, VERIFIED; "tools" = Ollama capability badge)
| Model | Exact Ollama tag(s) | Size on disk (~RAM at 4-bit) | Tools | Licence | Arabic evidence |
|---|---|---|---|---|---|
| **Qwen3.5** | `qwen3.5:4b` 3.3-4.0 GB, `:9b` 6.6-7.6 GB, `:27b` 17-20 GB, `:35b` 22 GB, `:2b` 2.7-3.1 GB, `:0.8b` | 4b: ~5-6 GB; 9b: ~9-10 GB | yes (+vision, thinking) | Apache-2.0 (HF: 4B, 9B, 27B) | Ollama page: "201 languages and dialects" (VENDOR). 9B in IFM table: ArabicMMLU 80.9, Dialectal MMLU 80.4, Arabic IFEval 73.8, FLORES 74.3, MCPMark 31.5 (VENDOR, section 1.3) |
| Qwen3 | `qwen3:4b` 2.5 GB, `:8b` 5.2 GB, `:14b` 9.3 GB, `:30b` 19 GB | 8b: ~7 GB | yes | Apache-2.0 (8B) | no Arabic number found |
| Qwen2.5 | `qwen2.5:7b` 4.7 GB, `:14b` 9.0 GB, `:32b` 20 GB | 7b: ~6 GB | yes | Apache-2.0 (7B) | HELM Arabic (Dec 2025) lists the Qwen2.5/Qwen3 families as strong open multilingual models; best open model there: Qwen3 235B, mean 0.786 (v1.0.0) |
| Qwen3.6 | `qwen3.6:27b` 18-19 GB, `:35b`/latest 23 GB | needs 24-32 GB | yes | not read | no Arabic number found |
| **Gemma 4** | `gemma4:e2b` 4.6-7.5, `:e4b` 6.6-9.5, `:12b` 7.7-8.0, `:26b` 16-19, `:31b` 19-20 GB | e4b ~8-10 GB | yes (+vision, thinking; E2B/E4B take audio input) | Apache-2.0 (HF 12B/26B-A4B/31B) | IFM table: 12B ArabicMMLU 84.1, Dialectal MMLU 83.5, AraGen 62.8; 31B: 89.5 / 89.4 / 73.4 (VENDOR) |
| Gemma 3 | `gemma3:4b` 3.4 GB, `:12b` 8.2 GB, `:27b` 17 GB | 12b ~10 GB | **no tools badge** | "gemma" custom terms | "140+ languages" (Ollama page). SILMA-9B is a Gemma-2 fine-tune (gemma licence) |
| Llama 3.1/3.2/3.3 | `llama3.1:8b` 4.9 GB, `llama3.2:3b` 2.0 GB, `llama3.3` (70B) | 8b ~7 GB | yes | Llama community licence | AraDiCE: multilingual Llama/Mistral "show substantial deficiency" on dialects (search snippet, arXiv 2409.11404). Arabic is not in Llama 3.1's official language list (MEMORY) |
| **Hermes 3** (Nous) | `hermes3:3b` 2.0 GB, `:8b` 4.7 GB, `:70b` 40 GB | 8b ~6.5 GB | yes (tuned for it) | llama3 licence (HF) | Llama-3.1 base, so Arabic is only so-so (MEMORY). No number found |
| **Hermes 4 / 4.3** (Nous) | not in official Ollama library (community repacks only, e.g. `edtorre/qwen3.5-hermes`). HF GGUF: `NousResearch/Hermes-4.3-36B-GGUF` Q4_K_M 21.8 GB | 36B: ~26 GB | yes (agent-tuned, MEMORY) | Apache-2.0 (4-14B, 4.3-36B); Hermes-4-70B = llama3 | no Arabic number found |
| Mistral 7B / Nemo 12B / Ministral 3 | `mistral:7b` 4.4 GB, `mistral-nemo:12b` 7.1 GB, `ministral-3:3b/8b/14b` 3.0/6.0/9.1 GB | nemo ~9 GB | yes | Apache-2.0 | Mistral 7B weak in Arabic (MEMORY); Nemo lists Arabic among its languages (MEMORY) |
| Aya Expanse | `aya-expanse:8b` 5.1 GB, `:32b` 20 GB (8K ctx) | 8b ~7 GB | yes | **CC-BY-NC** (non-commercial) | Arabic is one of 23 languages (MEMORY) |
| Command R7B Arabic | `command-r7b-arabic:7b` 5.1 GB (16K ctx) | ~7 GB | yes | **CC-BY-NC-4.0** (HF) | made for Arabic (Ollama page: "excels in advanced Arabic"); HELM did not include it |
| **Jais 3** (MBZUAI/IFM, released 2026-11-12) | **not in Ollama library** (`/library/jais` = 404). GGUF: `IFM/Jais-3-3.7B-GGUF` Q4_K_M 3.16 GB, `IFM/Jais-3-7B-GGUF` Q4_K_M 5.59 GB, `IFM/Jais-3-32B-GGUF` Q4_K_M 21.08 GB. Run: `ollama run hf.co/IFM/Jais-3-7B-GGUF:Q4_K_M` (MEMORY that Ollama accepts `hf.co/` GGUF; the model card says "GGUF for llama.cpp and Ollama") | 3.7b ~5 GB; 7b ~8 GB; 32b ~25 GB | card shows tool calling via vLLM/SGLang parser `k2_horizon`; **not verified in Ollama/llama.cpp** | Apache-2.0 (3.7B, 7B, 32B cards) | best Arabic numbers in section 1.3 (VENDOR). Only 8 days old: no third-party review yet |
| Jais 2 | `inception42/Jais-2-8B-Chat` (8.09 B params), `Jais-2-70B-Chat` | 8b: ~10 GB (no GGUF checked) | not stated | Apache-2.0 | card: "highest scores across nearly all AraGen metrics" vs Fanar-1-9B and ALLaM-7B (VENDOR); superseded by Jais 3 |
| ALLaM 7B (HUMAIN) | HF `humain-ai/ALLaM-7B-Instruct-preview` (+ bartowski GGUF); no Ollama tag (`/library/allam` = 404) | ~6 GB | not stated | Apache-2.0 | July 2025 preview; Jais-3 table: ArabicMMLU 71.2, IFEval 48.0, MCPMark 0 (VENDOR) |
| AceGPT-v2 / SILMA 9B | HF `FreedomIntelligence/AceGPT-v2-8B-Chat` (Apache-2.0), `silma-ai/SILMA-9B-Instruct-v1.0` (gemma licence) | 6-8 GB | no | see left | HELM Arabic: Arabic-specific older models (AceGPT-v2 Oct 2024) "underperformed" general multilingual ones |
| gpt-oss | `gpt-oss:20b` 14 GB | ~16 GB | yes | Apache-2.0 | no Arabic number found; too big for 8-16 GB CPU |
| Community Egyptian tunes | e.g. `mradermacher/gemma-3-egyptian-4b-v1-GGUF` (Apache-2.0) | ~4 GB | no | varies | 865 downloads; unvetted. Only worth an A/B test |

### 1.3 What is known about Arabic and Egyptian quality
**Benchmarks that exist (VERIFIED existence):**
- Open Arabic LLM Leaderboard v2 (HF/TII, blog 2025-02): ArabicMMLU, AlGhafa, MadinahQA, AraTrust, ALRAGE, Belebele (MSA + dialects). Space still running (last modified 2025-10-09). It is log-likelihood multiple choice; a community post warns it can be gamed by distillation.
- HELM Arabic (Stanford + Arabic.AI, 2025-12-18): 7 benchmarks. Best open model: Qwen3 235B A22B (mean 0.786). Older Arabic-specific models trailed.
- AraGen (generative, 3C3H metric), DialectalArabicMMLU (Syrian, **Egyptian**, Emirati, Saudi, Moroccan; LREC 2026), AraDiCE (Levantine + **Egyptian**), 3LM (Egyptian/Syrian/Gulf), AL-QASIDA (Egyptian + Moroccan generation).
- Findings in the abstracts I read: models **understand** dialect better than they **generate** it; they default to MSA; Arabic-centric models do better but still lag MSA/English. For AL-QASIDA one author needed 14 chat turns before the LLM kept the requested dialect (search snippet).
- **I could not extract per-model Egyptian-only scores** (tables did not parse). So there is **no verified Egyptian-dialect number for Qwen, Gemma or Jais** in this document.

**Only comparison I could read in full (VENDOR, from the Jais-3 model cards; authors chose the rivals and prompts):**
| 7-9B class | Jais-3-7B | Qwen3.5-9B | Gemma-4-12B | Gemma-4-E4B | ALLaM-7B | Fanar-1-9B |
|---|---|---|---|---|---|---|
| ArabicMMLU | 85.2 | 80.9 | 84.1 | 77.5 | 71.2 | 65.8 |
| Dialectal Arabic MMLU | 83.6 | 80.4 | 83.5 | 76.6 | 56.6 | 58.2 |
| Dialect ID (QADI) | 69.0 | 35.7 | 62.1 | 59.8 | 42.8 | 46.2 |
| AraGen v3 | 55.0 | 55.7 | 62.8 | 48.8 | 44.9 | 40.1 |
| Arabic IFEval | 80.2 | 73.8 | 78.7 | 72.3 | 48.0 | 44.6 |
| FLORES200+ (translation, judge) | 90.6 | 74.3 | 89.5 | 84.0 | 74.5 | 68.4 |
| MCPMark (tool use) | 49.6 | 31.5 | 17.3 | 3.2 | 0 | 0 |

| ~30B class | Jais-3-32B | Gemma-4-31B | Qwen3.8-27B | Fanar-2-27B |
|---|---|---|---|---|
| ArabicMMLU | 88.6 | 89.5 | 85.8 | 66.3 |
| Dialectal Arabic MMLU | 88.5 | 89.4 | 87.0 | 28.2 |
| AraGen v3 | 71.0 | 73.4 | 66.7 | 55.9 |
| Arabic IFEval | 80.0 | 78.7 | 77.0 | 49.8 |
| MCPMark | 66.1 | 48.8 | 49.6 | 12.1 |

Reading: Jais-3 and Gemma 4 are close at 12B/31B; Jais-3 leads at 7B on multiple choice and instruction following; Gemma-4-12B leads on open generation (AraGen). These are multiple-choice *understanding* tests, not Egyptian *conversation*. Treat as "likely good", then run your own 20-sentence Egyptian test (section 6, item 10).

### 1.4 Recommendation
- **Intel Mac, 8-16 GB, one model: `qwen3.5:4b`** (3.3-4.0 GB, Apache-2.0, tool calling badge, thinking switchable). Reason: only candidate that is small enough for 8 GB CPU-only, has verified tool calling in Ollama, and has an Arabic-family number (the 9B sibling) in the same table as the Arabic specialists. At 16 GB step up to `qwen3.5:9b`.
  - **A/B candidate, not yet recommended:** `hf.co/IFM/Jais-3-3.7B-GGUF:Q4_K_M` (3.16 GB) or Jais-3-7B (5.59 GB). Arabic should be better; tool calling and the chat template in Ollama are unverified. Try it for free-text answers only; keep Qwen for tool calls.
- **Stronger machine (Apple Silicon 32 GB+ or a GPU): `gemma4:26b`** (16-19 GB MoE with ~4B active per HF name `26B-A4B`, Apache-2.0, tools badge): fast and, for the 31B sibling, top of the table. Arabic-first alternative: Jais-3-32B Q4_K_M (21 GB), best tool-use score (MCPMark 66.1, VENDOR) but tooling in Ollama unverified.
- Hermes models are worth using for **agent/JSON discipline**, not for Arabic.

---

## 2. "Hermes" and "Jarvis": open-source projects (GitHub API, VERIFIED 2026-11-20)

Note: GitHub star counts below are what the API returned; two (Hermes Agent, OpenClaw) are extremely high, so treat popularity as a signal, not as proof of quality.

| Project | Licence | Last push | Speaks | Cheapest way to connect to T.O X |
|---|---|---|---|---|
| **Hermes models** (Nous Research) | per model (above) | HF 2025-2026 | weights only | use as the local model in Ollama/llama.cpp (GGUF) |
| **Hermes Agent** `NousResearch/hermes-agent` | MIT | 2026-11-20 | **MCP client** (stdio + remote HTTP, OAuth, `mcp_servers:` in `~/.hermes/config.yaml`); **OpenAI-compatible server** on `127.0.0.1:8642/v1` (`API_SERVER_KEY`, optional `API_SERVER_CORS_ORIGINS`); gateway to Telegram/Discord/Slack/WhatsApp/Signal/email; voice mode with wake word ("hey hermes"); skills + memory | **MCP:** add `tox_bridge.py` (stdio, default mode) under `mcp_servers:`; the page must be open and connected to the bridge. **API:** point the T.O X Agent panel at `http://127.0.0.1:8642/v1`. **Caveat:** its docs say local Faster-Whisper is excluded on Intel macOS; use cloud or command-based STT. Its installer pulls Python 3.14, Node, ffmpeg |
| **Open Interpreter** `openinterpreter/openinterpreter` | Apache-2.0 (was AGPL earlier; the old `01` voice project is AGPL and last pushed 2024-11-01: dead) | 2026-11-20 | now "a coding agent for open models"; MCP, ACP, hooks, permissions, any OpenAI-compatible provider | MCP stdio entry for `tox_bridge.py`. Code-execution agent: keep permissions strict |
| **Home Assistant** (Assist) | Apache-2.0 | 2026-11-20 | voice pipeline (wake word, STT, TTS via Wyoming), OpenAI/LLM conversation agents, **MCP integration** (client side, documented) | Only if the owner already runs HA. Otherwise skip |
| **Open WebUI** | custom "Open WebUI License" (BSD-style **plus a branding-preservation clause**; GitHub shows NOASSERTION) | 2026-11-20 | Ollama + any OpenAI-compatible API; built to run offline; voice via external services | Add the bridge as an OpenAPI/MCP tool server (MEMORY; I could not open its MCP doc page, 404). Check the licence before any commercial use |
| **LibreChat** `LibreChat-AI/LibreChat` | MIT | 2026-11-20 | custom OpenAI-compatible endpoints, **MCP servers**, agents, speech | MCP stdio/HTTP entry in its config |
| **AnythingLLM** | MIT | 2026-11-20 | many providers, **MCP-compatibility**, built-in STT/TTS options | MCP server entry in its agent config; desktop app, easy on a Mac |
| **LocalAI** | MIT | 2026-11-20 | **one server for chat, STT, TTS**, in OpenAI and Anthropic formats; **MCP client and server**; backends llama.cpp, vLLM, MLX, whisper.cpp | Best "single local endpoint" candidate: `/v1/chat/completions` + `/v1/audio/transcriptions` + `/v1/audio/speech`. Runs in Docker (CPU on Intel Mac; RAM overhead) |
| **Goose** `aaif-goose/goose` | Apache-2.0 | 2026-11-20 | MCP-native extensible agent | MCP entry for the bridge |
| **OpenClaw** | MIT | 2026-11-20 | personal assistant over messaging, "any OS" (README not read) | not evaluated |
| **n8n** | fair-code (Sustainable Use; **not OSI open source**) | 2026-11-20 | workflows; MCP server/client nodes (MEMORY) | optional glue only |
| Voice frameworks: **pipecat** (BSD-2), **LiveKit Agents** (Apache-2.0), **Moshi** (Apache-2.0, English speech-text model) | | | | overkill for a static page |

The bridge facts (READ in `site/tools/tox_bridge.py`): default mode = MCP over stdio; `--http-only` = HTTP on `127.0.0.1:8766` with `POST /call {"tool","args"}` and header `x-tox-token`; CORS is `*` but the token is required. So any agent that can run a process (MCP) or send one HTTP POST can drive the page. No change needed for the options above.

---

## 3. Speech to text (Arabic, Egyptian)

### 3.1 Models
| Model | Licence | Size / runtime | Evidence |
|---|---|---|---|
| **OpenAI Whisper** (tiny 39M ... large-v3 1.55B, turbo 809M; sizes MEMORY except turbo, HF card) | MIT (GitHub) | whisper.cpp RAM (VERIFIED README): tiny ~273 MB, base ~388 MB, small ~852 MB (disk 75/142/466 MiB). Larger: MEMORY | No Arabic-dialect WER for base Whisper verified today. |
| **faster-whisper** (CTranslate2) | MIT | PyPI `ctranslate2` 4.9.0 has **macOS x86_64 wheels** (VERIFIED), so it installs on Intel Macs even though Hermes Agent excludes it | speed: MEMORY, ~2-4x faster than openai-whisper on CPU |
| **whisper.cpp** | MIT | runs on Intel Mac (README: "Mac OS (Intel and Arm)", AVX, Accelerate, quantisation, WebAssembly) | best fit for an Intel CPU |
| distil-whisper | MIT | English-only distillation (MEMORY) | not useful for Arabic |
| **Egyptian Whisper fine-tunes (HF)** | MIT / Apache-2.0 | `MAdel121/whisper-small-egyptian-arabic` (MIT, card shows test WER 22.69 on its own split), `AbdelrahmanHassan/whisper-large-v3-egyptian-arabic` (Apache, LoRA on MGB-3; card WER field 0.4739 with a template comment, so unreliable), `mohammedaly22/whisper-large-v3-turbo-egyptian-code-switching` (MIT, 809M, keeps English words in Latin), `moeshawky/faster-whisper-small-egyptian-arabic` (MIT, CT2), `nabbra/whisper-medium-egyptian-arabic-ct2` | all self-reported, tiny download counts (hundreds). Must be tested on your own audio |
| **oddadmix dialectal Whisper** `whisper-large-v3-turbo-arabic-dialectal-v2` | Apache-2.0 | 809M | card: overall WER 0.3324 on its balanced 2.6k-clip test; **Egyptian subset WER 0.245 / CER 0.125 on 200 clips** (Saudi/Gulf 0.173; Maghrebi hardest). Self-reported |
| **Jais-ASR** (IFM) | Apache-2.0 | 11.4 GB bf16; community GGUF and W4A16 exist; vLLM plugin with OpenAI `/v1/audio/transcriptions` | **Open Universal Arabic ASR Leaderboard (VENDOR, card table):** avg WER 22.85 / CER 8.37 over six sets: SADA 30.85, Common Voice MSA 8.56, MASC clean 16.12, MASC noisy 25.44, MGB-2 9.59, **Casablanca (8 dialects, conversational) 46.56** |
| **Cohere Transcribe Arabic 07-2026** | Apache-2.0 (HF tag) | ~2.05 B params; official repo is gated; community GGUF `handy-computer/...-gguf` (Q4_K_M/Q8_0); runtime for those GGUFs unverified | same leaderboard: avg WER 25.87 (Common Voice 5.82 is the best of all columns) |
| Vosk Arabic / Kaldi | Apache-2.0 (vosk-api, vosk-server) | small offline models, WebSocket server | no Arabic WER read; accuracy is generally below Whisper (MEMORY) |
| NeMo (NVIDIA-NeMo/Speech) | Apache-2.0 | FastConformer; one Arabic SADA fine-tune on HF with 24 downloads | no usable number |
| SeamlessM4T v2 / MMS-1B-all | **CC-BY-NC-4.0** | 1-2B | non-commercial; heavy |

Take-aways: (1) even the best leaderboard model gets **~47% WER on conversational multi-dialect speech**; Egyptian-only fine-tune cards show 22-25% on their own data, which is not comparable. (2) For short **commands** ("افتح تاب الدوكيومنت") errors matter less because the rule layer can fuzzy-match; for dictation it matters. (3) Domain words (طلمبات، مانهول، منسوب) need an initial prompt/biasing (MEMORY: Whisper `initial_prompt`, `--prompt` in whisper.cpp).

### 3.2 Serve behind an OpenAI-compatible `/v1/audio/transcriptions`
| Server | How | Notes |
|---|---|---|
| **speaches** (`speaches-ai/speaches`, MIT, ex faster-whisper-server) | Docker or `uv`; OpenAI API compatible STT (faster-whisper), TTS (Kokoro, Piper), Realtime API | VERIFIED README. Intel Mac: Docker Desktop CPU path; model download on first call |
| **whisper.cpp server** (MIT) | `whisper-server -m ggml-small.bin --host 127.0.0.1 --port 8081 --convert -l ar` ; flag `--inference-path` exists (VERIFIED README), so `--inference-path /v1/audio/transcriptions` should make OpenAI SDKs work (**untested**; default path is `/inference`, field `file`, `response_format=json`) | `--convert` needs ffmpeg (you have x86_64 ffmpeg). CORS headers: not checked, so test or put a proxy in front |
| **LocalAI** (MIT) | STT/TTS/chat in one OpenAI-style server | heaviest, most complete |
| Jais-ASR | vLLM plugin gives the endpoint (README) | needs a GPU-class machine |

### 3.3 In the browser (transformers.js, Apache-2.0, pushed 2026-11-18)
Models `onnx-community/whisper-{tiny,base,small,large-v3-turbo}` (ONNX files, sizes VERIFIED from HF API; totals = encoder + merged decoder):
| Model | int8 download | q4 download | Realistic use |
|---|---|---|---|
| tiny | ~41 MB (10+31) | ~96 MB | wake-phrase check only; Arabic accuracy poor (MEMORY) |
| base | ~77 MB (23+54) | ~143 MB | short commands, MEMORY: poor on dialect |
| small | ~249 MB (92+157) | ~299 MB | usable for commands; on WASM CPU likely slower than real time on an Intel laptop (MEMORY, measure) |
| large-v3-turbo | ~1085 MB (645+440) | ~759 MB (425+334) | needs WebGPU; Intel iGPU speed unknown |
- WebGPU in Chrome on macOS: shipped (MEMORY); Intel iGPU performance is the unknown. Fall back to WASM (single/multi-thread needs cross-origin isolation headers for threads: MEMORY).
- whisper.cpp also builds to WASM (`examples/whisper.wasm`, in README list). Same size/speed trade-off.
- Cache the model in the browser (Cache API) so the first-time download happens once.
- Verdict: in-browser Whisper = offline fallback for **short commands** (base/small). For real dictation use a server (local or Groq).

---

## 4. Free ONLINE options (not tied to the owner's device)

**CORS column = my own `OPTIONS` preflight from a fake `https://example.github.io` origin, 2026-11-20 (VERIFIED, no key sent).** "Direct" means a static page can call it with `fetch`. Gemini and OpenAI echo the allowed origin (so the real page origin works).

| Provider | Base URL (OpenAI-compatible) | Direct from static page? | Tools | Free-tier limits (VERIFIED unless noted) | Arabic | Privacy |
|---|---|---|---|---|---|---|
| **Groq** | `https://api.groq.com/openai/v1` (`/chat/completions`, `/audio/transcriptions`) | **Yes** (204, ACAO `*`) incl. STT endpoint | yes (Tool Use docs exist) | Free-plan tab: `openai/gpt-oss-20b` / `-120b` / `qwen/qwen3.8-27b`: 30 RPM, 1K RPD, 8K TPM, 200K TPD. `whisper-large-v3(-turbo)`: 20 RPM, 2K RPD, 7.2K audio-s/hour, 28.8K audio-s/day. `canopylabs/orpheus-arabic-saudi` (TTS): 10 RPM, 100 RPD, 3.6K TPD. (Rate table has a Developer-plan tab too; I read the table under the Free tab) | Whisper `language=ar`; LLM Arabic quality unmeasured | US cloud; retention policy not read |
| **Google Gemini API** | `https://generativelanguage.googleapis.com/v1beta/openai/` | **Yes** (echoes origin) | yes (function calling documented) | Free tier exists for Gemini 3.8 / 3.6 Flash, 3.5 Flash-Lite, **3.5 Transcribe**, **3.8 Flash TTS**; "not available" on Gemini 4 models. Quotas per project, reset midnight Pacific; exact RPD not read | strong Arabic; TTS table lists **Egyptian Arabic** | **Free tier: "Used to improve our products: Yes"** (pricing table); paid: No |
| **OpenRouter** | `https://openrouter.ai/api/v1` | **Yes** (ACAO `*`) | per model | 12 `:free` models today incl. `google/gemma-4-26b-a4b-it:free`, `google/gemma-4-31b-it:free` (both with tools, 262K ctx), several Nemotron. Free limits tier by credits bought; **exact numbers not extracted**, MEMORY: 20 RPM, 50/day below $10 purchased, 1000/day above (verify) | Gemma 4 = decent | free providers may log prompts (MEMORY) |
| **Hugging Face Inference Providers** | `https://router.huggingface.co/v1` | **Yes** | per model | **Free users: no monthly credits; must purchase credits** (VERIFIED); PRO gets $2.00/month | per model | per provider |
| **Mistral La Plateforme** | `https://api.mistral.ai/v1` (also `/audio/transcriptions`) | **Yes** | yes | free "Experiment" tier existence MEMORY (docs pages I tried returned 404/timeout; pricing page shows a Free plan with "Start Free") | Mistral Arabic: moderate (MEMORY) | free tier may train on data (MEMORY) |
| **Together** | `https://api.together.xyz/v1` | **Yes** | yes | no free tier verified (MEMORY: trial credit only) | per model | |
| **Cerebras** | `https://api.cerebras.ai/v1` | **Yes** | yes | rate-limit page fetched, numbers not extracted | per model | |
| **Cloudflare Workers AI** | `https://api.cloudflare.com/client/v4/accounts/<id>/ai/v1` (chat, embeddings, responses only) | **No** (OPTIONS = 405). Needs a Worker proxy | yes (model-dependent) | **10,000 Neurons/day free**, then $0.011 per 1,000 Neurons; resets 00:00 UTC. Models include Gemma 4, Qwen 3.8 27B, gpt-oss, Whisper (e.g. large-v3-turbo about $0.0005 per audio minute) and MeloTTS | Whisper ok; MeloTTS Arabic not confirmed | |
| GitHub Models, NVIDIA NIM (`integrate.api.nvidia.com`), SambaNova | | **No CORS headers** (preflight 200 without ACAO) | | not read | | proxy needed |
| Anthropic / OpenAI | | OpenAI echoes origin; Anthropic needs its opt-in browser header | | paid only | | not free |

**API keys, plainly:** every row above needs an API key (create an account first). None works key-less. A key typed into a static page is **readable by anyone who opens DevTools, by browser extensions, and by any script on the same origin**; if the page is public, never ship a key inside the file.
Options, cheapest first:
1. **Bring-your-own-key**: owner pastes a *dedicated* free-tier key at runtime; store in `sessionStorage` (cleared on tab close) rather than `localStorage`; one key per provider; set the provider's spend/usage limits; rotate if exposed. (Same weakness already noted for the bridge secret in AGENT_CONTROL.md.)
2. **Tiny proxy (Cloudflare Worker / any serverless)** holding the key as a secret, locked to the page's `Origin`, with a per-IP rate limit and a model allow-list. The key never reaches the browser. Cost: free tier (Worker free quota, MEMORY ~100K requests/day).
3. Local model (no key at all) for private data.
**Privacy:** do not send project drawings, client names or numbers to free tiers that train on data (Gemini free = yes, VERIFIED). Keep a "private mode" that forces Tier 0/2 only.

---

## 5. Arabic text to speech
| Option | Egyptian? | Licence | Notes |
|---|---|---|---|
| **Browser `speechSynthesis`** | depends on OS/browser voices | n/a | Zero setup. Voices list loads asynchronously (`voiceschanged`, MDN). Filter `v.lang.startsWith('ar')`; try `ar-EG`, fall back to `ar-SA`. macOS ships Arabic voices (MEMORY: Maged `ar-SA`; Egyptian voice not guaranteed). Edge exposes Azure "Online (Natural)" voices incl. `ar-EG` (MEMORY). Quality varies; **test on the owner's machine** |
| **Gemini TTS** (3.8 Flash TTS, Flash-Lite TTS) | **Yes**, "Egyptian Arabic" in supported languages table (VERIFIED) | cloud | **Free of charge on the free tier** (pricing table), CORS yes; free tier data is used to improve products |
| **Azure Neural / Edge voices** `ar-EG-SalmaNeural`, `ar-EG-ShakirNeural` | **Yes** (`ar-EG` listed in Azure language-support page, VERIFIED; voice names MEMORY) | cloud, paid | `edge-tts` (Python, 12.6K stars, licence NOASSERTION/LGPL?, not read) calls Edge's online service **unofficially**; Microsoft removed custom SSML; ToS risk, may break. Not for a product |
| **Piper** | Jordanian only: `ar_JO-kareem-low/medium` (VERIFIED, HF `rhasspy/piper-voices/ar`) | original `rhasspy/piper` MIT but **archived** 2025-08-26; active fork `OHF-Voice/piper1-gpl` is **GPL-3.0**; voice licences vary (check each) | CPU, fast, offline; runs behind speaches. No Egyptian voice |
| **Kokoro-82M** | no Arabic (card lists other languages) | Apache-2.0 | fast but skip for Arabic |
| **Coqui XTTS-v2** | Arabic supported (MEMORY), voice cloning | HF licence tag "other" (CPML, non-commercial, MEMORY); Coqui the company is gone (main repo last push 2024-08, fork `idiap/coqui-ai-TTS` MPL-2.0 for code) | heavy on CPU |
| **MMS-TTS** `facebook/mms-tts-ara` | MSA-like | **CC-BY-NC-4.0** | small VITS, robotic |
| **Habibi-TTS** `SWivid/Habibi-TTS` | multi-dialect Arabic (MEMORY: includes Egyptian) | **CC-BY-NC-SA-4.0** | non-commercial; F5-based, GPU wanted |
| **Egyptian community TTS** `NAMAA-Space/NAMAA-Egyptian-TTS` (MIT), `MAdel121/f5-tts-egyptian-arabic` (CC-BY-NC), `ehabnegm/masri-higgs-v3-egyptian-tts` | **Egyptian**, hundreds of downloads | MIT / NC / other | promising, unvetted; model sizes and CPU speed not checked |
| **Chatterbox Multilingual V3** (Resemble AI) | has `ar` in its language list (VERIFIED), dialect unknown | MIT | 0.5B; ONNX and GGUF ports exist; slow on Intel CPU (MEMORY) |
| Groq `orpheus-arabic-saudi` | Saudi, not Egyptian | per Groq terms | free: 100 requests/day only |

Best free Egyptian-sounding voice today = **Gemini TTS** (online). Best offline = whichever OS voice sounds acceptable; Piper `kareem` as a Levantine fallback.

---

## 6. Recommended architecture

### 6.1 Three tiers plus an optional external agent
```
Mic -> [wake/VAD] -> STT -> text
                           |
 Tier 0  in-page rules (Arabic intents, tools: open tab, build house, docs)  --handled--> speak/act
                           | not understood
 Tier 1  free online model  (Groq / Gemini / OpenRouter)   [needs key, not private]
                           | offline / private / quota hit
 Tier 2  local Ollama       (qwen3.5:4b, OpenAI-compatible, tools)
                           | long autonomous tasks
 Tier 3  external agent via bridge (Hermes Agent / Goose / Claude Code, MCP or HTTP POST /call)
text -> TTS (Gemini TTS | speechSynthesis | Piper)
```
Rules: Tier 0 first (instant, free, offline, safe). Route to Tier 1 only for non-sensitive text; Tier 2 for private text or when offline; tool results from documents are **untrusted data** (prompt injection). Tool allow-list, confirm destructive commands, max 4 tool steps, max 400 output tokens, timeout 20 s.

### 6.2 Wake word and always-listening in Chrome (what works)
- **Truth first:** a browser tab can only listen **while it is open, the mic permission is granted, and the OS is awake**. Chrome throttles background tabs; closing the tab ends everything. For a real always-on assistant you need a small local daemon, not a web page.
- **Design A (recommended, zero install):** Web Speech API `SpeechRecognition` with `lang='ar-EG'`, `continuous=true`, `interimResults=true`, auto-restart in `onend` (backoff 300 ms). Match wake phrases fuzzily ("جارفس"، "جارفيس"، "يا جارفس") on interim results. Caveats from MDN: recognition is **server-based by default on some browsers** (audio goes to the vendor), `processLocally` exists but is not universally available. Whether Chrome accepts `ar-EG` and keeps listening for hours: MEMORY, test it.
- **Design B (private, more work):** `@ricky0123/vad-web` (Silero VAD, ONNX Runtime Web, runs locally, MIT per package; GitHub shows NOASSERTION) detects speech start/end; send each segment to STT (Tier: browser whisper-base / local whisper.cpp / Groq) and check the transcript for the wake word. Costly if STT is cloud (quota: Groq 2K requests/day), so gate by VAD and by segment length (< 3 s).
- **Design C (daemon, truly always-on):** `openWakeWord` (Apache-2.0, Python/ONNX, has a pre-trained **"hey jarvis"** model, last push 2025-12-30) or Picovoice Porcupine (Apache-2.0 SDK, needs an AccessKey, MEMORY) running locally, then post text to the bridge `POST /call`. Intel Mac: onnxruntime works (MEMORY).
- Always provide **push-to-talk** (Space or a button) and a visible mic indicator. Stop recognition while TTS speaks (`speechSynthesis.speaking`) to avoid hearing itself. Request `navigator.wakeLock` (screen) only if the owner wants the tab to stay awake (MEMORY).
- Mixed content: an `https://` page calling `http://127.0.0.1:11434` is treated as a trustworthy origin by Chrome, but Chrome has been adding a "local network access" permission prompt (MEMORY, 2025-2026): expect a prompt.

### 6.3 Ten things to configure first (exact settings)
1. **Let the page call Ollama.** My preflight to `127.0.0.1:11434` answered **403** for a foreign origin, matching Ollama's origin check; docs: allowed by default only for `127.0.0.1`/`0.0.0.0`, others via `OLLAMA_ORIGINS` (VERIFIED, faq.mdx). On macOS: `launchctl setenv OLLAMA_ORIGINS "https://YOUR-PAGE-ORIGIN,http://localhost:*"` then quit and reopen the Ollama app. Test: `curl -i -X OPTIONS -H "Origin: https://YOUR-PAGE-ORIGIN" -H "Access-Control-Request-Method: POST" http://127.0.0.1:11434/v1/chat/completions` should return 2xx.
2. **Pull the model:** `ollama pull qwen3.5:4b` (3.3-4.0 GB). Agent panel: base URL `http://127.0.0.1:11434/v1`, model `qwen3.5:4b`, key `ollama` (dummy), temperature 0.3, max_tokens 400, tools on, max 4 tool steps. Turn thinking off for voice (Ollama request field `"think": false`, MEMORY).
3. **System prompt in Egyptian Arabic with 3-5 few-shot examples** ("رد بالمصري، جملة قصيرة، من غير تشكيل"), because models drift to MSA (AraDiCE/AL-QASIDA). Keep replies under ~25 words for TTS.
4. **Tier 1 online:** Groq base `https://api.groq.com/openai/v1`, model `openai/gpt-oss-20b` (30 RPM, 1K RPD, 200K TPD) for tools; or Gemini base `https://generativelanguage.googleapis.com/v1beta/openai/`, model `gemini-3.8-flash` (free). Third choice OpenRouter `google/gemma-4-26b-a4b-it:free`. One throwaway key per provider, stored in `sessionStorage`; client-side limiter: 20 calls/min, 200/day.
5. **Cloud STT:** `POST https://api.groq.com/openai/v1/audio/transcriptions`, multipart: `model=whisper-large-v3-turbo`, `language=ar`, `response_format=json`, `temperature=0`, `file=<MediaRecorder audio/webm;codecs=opus>` (webm accepted: MEMORY). Cap at 20 RPM / 7,200 audio-s per hour; record 8 s max per command.
6. **Local STT (private/offline):** build whisper.cpp, then `whisper-server -m models/ggml-small.bin --host 127.0.0.1 --port 8081 --convert -l ar --inference-path /v1/audio/transcriptions` and check CORS headers with the same `OPTIONS` test (if absent, add a tiny proxy). Expected RAM ~850 MB (VERIFIED README). Add `--prompt "هندسة مدنية، منسوب، مانهول، طلمبة، شبكة صرف"` to bias vocabulary (flag name MEMORY).
7. **Egyptian STT A/B:** record 20 of your own commands; compare plain `small` vs `MAdel121/whisper-small-egyptian-arabic` (MIT, convert with whisper.cpp's HF-to-ggml script, MEMORY) vs Groq turbo. Keep the winner by word error on *your* sentences. Do not trust model-card WERs.
8. **TTS:** default `speechSynthesis`: `speechSynthesis.getVoices()` after `voiceschanged`, pick first voice with `lang==='ar-EG'`, else `ar-SA`; rate 1.0, pitch 1.0; cancel on new user speech. Upgrade path: Gemini "3.8 Flash TTS" (free tier, Egyptian Arabic listed; I read the model's pricing heading, not its exact API id, so look it up in the Gemini models list) for a natural voice when online.
9. **Wake word:** Design A above (`ar-EG`, continuous, restart on `onend`) plus a push-to-talk key as the always-available fallback; echo guard while speaking.
10. **Connect the external agent and the safety gate:** run `python3 site/tools/tox_bridge.py` (MCP stdio) and add it as an MCP server in Hermes Agent / Goose / Open Interpreter; or `--http-only` and `curl -H "x-tox-token: TOKEN" -d '{"tool":"say","args":{"text":"..."}}' http://127.0.0.1:8766/call`. Set `TOX_TOKEN` yourself (not the printed random one if you script it). Hermes API server (optional): `API_SERVER_KEY=<random>`, `API_SERVER_CORS_ORIGINS=<page origin>`, then `hermes gateway`, base URL `http://127.0.0.1:8642/v1`. Require human confirmation for delete/overwrite commands; log every tool call.

---

## 7. What I could not verify
- **Egyptian-dialect quality of any LLM:** no per-model Egyptian number extracted (DialectalArabicMMLU tables did not parse). All comparisons in 1.3 are vendor-published, multiple-choice, and from the Jais-3 cards.
- Jais-3: released 2026-11-12; no independent review; **tool calling in Ollama/llama.cpp, chat template, and whether Ollama's `hf.co/` pull works for these GGUFs not tested**. 3.7B/32B licence read from tags/cards only for the headline models.
- Tokens/second on your Intel Mac for every model: not measured (no model was downloaded). RAM figures = download size + rule of thumb.
- Groq free-plan numbers: I read the table under the "Free Plan Limits" tab, but the page text also says limits shown are "the base limits for the Developer plan"; confirm in your Groq console. Gemini free RPD per model not read. OpenRouter exact free RPM/RPD not extracted. Cerebras limits not extracted. Mistral and Together free-tier terms not read (docs 404).
- Provider data-retention/training policies (Groq, OpenRouter free providers, Mistral, Together, Cloudflare): not read. Only Gemini's free-tier "used to improve products" was verified.
- CORS beyond preflight: I did not make real authenticated calls, so streaming, audio upload size limits and error-path CORS headers are untested. whisper.cpp server and speaches CORS behaviour not tested.
- Whether `--inference-path /v1/audio/transcriptions` makes whisper.cpp fully OpenAI-compatible (field names, response shape): untested.
- Web Speech API: `ar-EG` support, continuous-listening duration and server-vs-local processing in current Chrome: not tested. Chrome local-network-access prompt: from memory.
- Browser Whisper speed on Intel/WebGPU: unmeasured. Whisper base-model Arabic WER: not found.
- Jais-ASR, Cohere Transcribe Arabic: numbers are the vendors' own (Jais-ASR measured with the leaderboard script by its authors). Cohere GGUF runtime unknown; official Cohere repo is gated.
- Egyptian TTS community models (NAMAA, f5, Higgs): not listened to, size/speed unchecked. Edge/Azure voice names `ar-EG-Salma/Shakir`: `ar-EG` verified, names from memory. `edge-tts` licence not read.
- OpenClaw, Goose internals, Open WebUI MCP support, n8n MCP: only repo metadata/READMEs; not evaluated in depth. GitHub star counts for Hermes Agent and OpenClaw are unusually high; I did not audit them.
- Hermes 4 base models, Llama 3.1 official language list, Mistral Nemo language list, Aya's 23 languages, Whisper parameter sizes except where noted: MEMORY.
- Nothing here is investment, legal or personal advice. Licences summarised from tags and READMEs, not legal review: check each before shipping.
