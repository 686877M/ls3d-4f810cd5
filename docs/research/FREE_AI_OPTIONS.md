# Free AI options for T.O X agents (research, 2026-11-20)

Method: WebSearch only (18 searches, snippets and result lists). I could not open provider pages in full, so **no row below is VERIFIED against an official page the way a fetched doc would be**. Marks used:
- **OFFICIAL-SNIPPET** = the search result quoted an official provider/doc page (docs.github.com, Cerebras docs, Mistral help center, Cloudflare docs, NVIDIA NIM FAQ on forums.developer.nvidia.com, Hugging Face docs, Alibaba Cloud help, OpenRouter docs/support, Groq community, Cohere docs).
- **THIRD-PARTY** = blogs, trackers, aggregators (yangmao.ai, benchlm.ai, apidog, dev.to, ...). They disagree with each other on numbers. Not copied as facts.
- **FROM MEMORY** = my own knowledge, no source seen. The app marks these `u:1` ("not confirmed from a source") and the Test button is the real check.
Every number in the app is written with its source kind and a "Verify on the provider site" line plus the provider link. Quotas change: re-check before relying on any.

## 0. Free API list (name | base URL | free-tier limits as found). EVERY limit: VERIFY on the provider site; marks and sources are in section 1.

| Name | Kind | Base URL | Free limits (verify) |
|---|---|---|---|
| Ollama (local) | LOCAL | `http://localhost:11434/v1` | Free on your own computer. |
| LM Studio (local) | LOCAL | `http://localhost:1234/v1` | Free on your own computer. |
| llama.cpp server (local) (unconfirmed) | LOCAL | `http://localhost:8080/v1` | Free on your own computer: llama-server -m model.gguf. |
| Groq | FREE | `https://api.groq.com/openai/v1` | Free plan with per-model limits (requests/min, requests/day, tokens/min, tokens/day). |
| Google Gemini | FREE | `https://generativelanguage.googleapis.com/v1beta/openai` | Free tier with a key from AI Studio. |
| OpenRouter (free models) | FREE | `https://openrouter.ai/api/v1` | Only model ids ending :free cost nothing. |
| Mistral (Experiment plan) (unconfirmed) | FREE | `https://api.mistral.ai/v1` | Free "Experiment" plan. |
| NVIDIA NIM (build.nvidia.com) (unconfirmed) | FREE | `https://integrate.api.nvidia.com/v1` | Free for NVIDIA Developer Program members for prototyping and research (NVIDIA NIM FAQ); production needs an enterprise licence. |
| GitHub Models (unconfirmed) | FREE | `https://models.github.ai/inference` | Free rate-limited access for all GitHub accounts (GitHub docs): limits per minute, per day, tokens per request and concurrent requests, varying by model and Copilot plan. |
| Cloudflare Workers AI | FREE | `https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/ai/v1` | 10,000 neurons/day free (Cloudflare pricing page, via search), then paid. |
| Hugging Face Inference Providers | FREE | `https://router.huggingface.co/v1` | Free accounts get a small monthly credit (docs list $0.10, "subject to change"; PRO $2). |
| SiliconFlow (Chinese + open models) (unconfirmed) | FREE | `https://api.siliconflow.com/v1` | Some small models are free (Qwen/Qwen3-8B is reported free); the free list rotates, so open the model list in your dashboard. |
| Z.ai GLM (Zhipu, international) (unconfirmed) | FREE | `https://api.z.ai/api/paas/v4` | Flash models are described as free by third-party trackers (glm-4.5-flash free since 2026-05-10 per one), with about 1 concurrent request. |
| Zhipu BigModel GLM (China site) (unconfirmed) | FREE | `https://open.bigmodel.cn/api/paas/v4` | glm-4-flash is listed free within rate limits by third parties; newer Flash models are the ones most often called free. |
| Qwen (Alibaba Model Studio, international) | TRIAL | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` | New-user free quota on the International (Singapore) endpoint, most often reported as 1 million tokens per eligible model for 90 days after you activate Model Studio; one Alibaba page says Beijing region only. |
| Cerebras Inference | TRIAL | `https://api.cerebras.ai/v1` | No standing free tier: Cerebras docs say new accounts get a one-time $5 trial credit after adding a verified payment method, expiring after 30 days. |
| SambaNova Cloud (unconfirmed) | TRIAL | `https://api.sambanova.ai/v1` | Sources conflict: a directory says $5 credit for 3 months, a guide says a capped free tier without a payment method. |
| Tencent Hunyuan (unconfirmed) | TRIAL | `https://api.hunyuan.cloud.tencent.com/v1` | One aggregator lists about 1M free tokens and 5 requests/min, flagged "needs recheck"; the model name hunyuan-lite is from memory (the sample used hunyuan-pro). |
| Doubao (Volcengine Ark) (unconfirmed) | TRIAL | `https://ark.cn-beijing.volces.com/api/v3` | A 2024 news report says about 500,000 free tokens for individual developers; trackers list 5 requests/min. |
| Cohere (trial key) (unconfirmed) | TRIAL | `https://api.cohere.ai/compatibility/v1` | Evaluation/trial keys are free but limited and not allowed for commercial use (Cohere docs per search); trackers say about 20 requests/min and 1,000 calls/month. |

Paid / no free tier verified (listed for completeness): DeepSeek (official API) `https://api.deepseek.com`; Kimi / Moonshot (official API) `https://api.moonshot.ai/v1`; MiniMax (official API) `https://api.minimax.io/v1`; Yi / 01.ai `https://api.lingyiwanwu.com/v1`; Baichuan `https://api.baichuan-ai.com/v1`; Together AI `https://api.together.xyz/v1`.

Same list is in the AI pane ("Free API list").

## 1. API providers (all OpenAI-compatible `/chat/completions`, added as presets)
| Preset id | Base URL | Free? | What the sources said | Mark |
|---|---|---|---|---|
| groq | https://api.groq.com/openai/v1 | Free plan, per-model limits, 429 when exceeded | Groq community: new accounts start Free, limits per org and per model, see console. Numbers conflict across third parties (30 RPM/1,000 RPD vs 14,400/day), none copied | OFFICIAL-SNIPPET (plan, 429); URL THIRD-PARTY |
| gemini | https://generativelanguage.googleapis.com/v1beta/openai | Free tier | ai.google.dev compatibility page uses that base URL. Limits shown per project in AI Studio; third parties: 5-15 RPM, 100-1,500 RPD, Pro paid-only since 2026-04-01; one blog says 2.5 models shut down 2026-10-16 | URL OFFICIAL-SNIPPET; limits THIRD-PARTY, conflicting |
| openrouter | https://openrouter.ai/api/v1 | `:free` model ids | Support article: 20 req/min; 50 req/day, 1,000/day after >= ~$10 credits. Docs limits page showed unfilled template placeholders | OFFICIAL-SNIPPET (support) + docs unreadable; `openrouter/free` id FROM MEMORY/third-party |
| nvidia | https://integrate.api.nvidia.com/v1 | Free for NVIDIA Developer Program (prototyping/research) | NIM FAQ: free for members, enterprise licence for production. Forum users: 40 RPM default, increases not granted on request | FAQ OFFICIAL-SNIPPET; 40 RPM = user reports; base URL FROM MEMORY (not confirmed) |
| mistral | https://api.mistral.ai/v1 | Free "Experiment" plan | help.mistral.ai: 1 req/s, 500,000 tokens/min, 1 billion tokens/month for free-tier models; phone verification; tracker: data used for training | OFFICIAL-SNIPPET (help center); URL FROM MEMORY |
| github | https://models.github.ai/inference | Free, rate-limited, all GitHub accounts | docs.github.com: limits per minute/day/tokens per request/concurrent, vary by model and Copilot plan; PAT with `models:read`. Third parties disagree on endpoint (`models.inference.ai.azure.com`) and one claims retirement on 2026-07-30 (unresolved) | OFFICIAL-SNIPPET (free access, PAT); endpoint/retirement CONFLICT |
| cloudflare | https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/ai/v1 | 10,000 neurons/day free | developers.cloudflare.com OpenAI-compat page gives the URL form; pricing page 10,000 neurons/day (via search). Requests/day depends on model | OFFICIAL-SNIPPET |
| huggingface | https://router.huggingface.co/v1 | Tiny monthly credit | HF docs: free $0.10/month ("subject to change"), PRO $2; free users stop at zero | OFFICIAL-SNIPPET |
| siliconflow | https://api.siliconflow.com/v1 (China: .cn) | Some small models free, rotating | Aggregators: Qwen/Qwen3-8B free; limits 30 vs 1,000 RPM; SiliconFlow's own model page uses the .com host | THIRD-PARTY |
| zai (international GLM) | https://api.z.ai/api/paas/v4 | Flash models described as free | trackers: glm-4.5-flash free since 2026-05-10, ~1 concurrent request | THIRD-PARTY |
| zhipu (China GLM) | https://open.bigmodel.cn/api/paas/v4 | glm-4-flash free within limits; ~5M sign-up tokens (one page) | trackers only | THIRD-PARTY |
| qwen (Alibaba Model Studio, intl) | https://dashscope-intl.aliyuncs.com/compatible-mode/v1 | New-user quota, trial | Alibaba Cloud help pages: first-time free quota valid 90 days; commonly 1M tokens per eligible model on Singapore; one index page says Beijing only; newer pages show per-workspace hosts; "free quota only" switch stops billing | OFFICIAL-SNIPPET (quota exists, URL); 1M figure THIRD-PARTY |
| cerebras | https://api.cerebras.ai/v1 | **Trial, not a free tier** | Cerebras docs: no auto-renewing free tier; $5 one-time credit after a verified payment method, expires in 30 days; free-trial gpt-oss-120b 5 RPM, 1M tokens/day (third-party citing docs); temporary reductions noted | OFFICIAL-SNIPPET |
| sambanova | https://api.sambanova.ai/v1 | Trial, unclear | directory: $5 for 3 months; guide: capped free tier without payment method | THIRD-PARTY, conflicting |
| hunyuan | https://api.hunyuan.cloud.tencent.com/v1 | Trial ~1M tokens, 5 RPM (aggregator, "needs recheck") | model `hunyuan-lite` not confirmed (sample used hunyuan-pro) | THIRD-PARTY |
| doubao (Volcengine Ark) | https://ark.cn-beijing.volces.com/api/v3 | ~500k free tokens (2024 news), 5 RPM (trackers) | model field is an endpoint id `ep-...` | THIRD-PARTY / FROM MEMORY |
| cohere | https://api.cohere.ai/compatibility/v1 | Trial key, non-commercial | docs.cohere.com rate limits: evaluation keys free but limited, no commercial use; trackers 20 RPM, 1,000 calls/month. The compat URL not confirmed | OFFICIAL-SNIPPET (trial); URL FROM MEMORY |
| deepseek | https://api.deepseek.com | **No verified free tier** (paid, cheap) | one tutorial shows `api.deepseek.com/v1`; claims of $5 credit/50 req per day look old and unconfirmed. Free route: OpenRouter `:free`, NVIDIA, SiliconFlow, Ollama | THIRD-PARTY |
| kimi / Moonshot | https://api.moonshot.ai/v1 (China: .cn) | No verified free tier | one guide: add credits by card; trial offer claim unverified | THIRD-PARTY |
| minimax | https://api.minimax.io/v1 | Unknown | an article mentions a free tier for M2.7; no base URL in any source | UNVERIFIED |
| yi / 01.ai, baichuan | api.lingyiwanwu.com/v1, api.baichuan-ai.com/v1 | Unknown | **no search result at all**; services may have changed. From memory only | FROM MEMORY |
| together | https://api.together.xyz/v1 | No verified free tier | source says free tier not offered, needs $5; domain differs (together.ai) | THIRD-PARTY, conflicting |
| ollama, lmstudio, llamacpp | localhost:11434 / 1234 / 8080 `/v1` | Free on your hardware | Ollama needs `OLLAMA_ORIGINS` for browser calls (several guides). LM Studio CORS toggle: sources conflict on the default | guides THIRD-PARTY |

### Practical finding: CORS is the real blocker for a static page
A browser page can only call an API that sends CORS headers. I could not confirm CORS for most providers above (not checked live). The Test button reports "Network error ... CORS ..." with the exact exception. Where it fails, a local proxy is the clean fix (see freeai_note.md follow-up). Keys typed into a static page are readable by every script in that page: use limited/free keys only.

## 2. Non-API routes (all added)
1. **Bridge text relay (existing, improved)** `claudecode`: text typed, or voice transcribed by local Whisper outside any model, goes tab -> `~/.tox/inbox.jsonl` -> your Claude Code session (tools `tab_messages`, `reply_to_tab` exist in `tox_bridge.py`). Uses your own Claude subscription, no API key. Now reports exact errors (HTTP status, bridge down).
2. **Copy prompt / paste answer** `relay`: works with ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi, GLM, Mistral, HuggingChat web chats (links from memory). Builds a prompt with the tool list and project state; the pasted answer may contain one ```tox JSON block of actions; unknown tools are dropped and **nothing runs until you press Run**. No network request from T.O X at all.
3. **In-browser model (WebGPU, WebLLM)** `webllm`: viable on paper (WebLLM README: runs fully in browser, WebGPU, Qwen2 0.5B/1.5B/7B listed; transformers.js also supports WebGPU with a WASM fallback; browser support claims: Chrome/Edge 113+, Firefox 147+ default on Windows/macOS per one blog, Safari unconfirmed). Costs: first load downloads hundreds of MB to GBs; small models are weak at tool use, so answers are text with proposed actions. **The library is not bundled**: loaded from `vendor/web-llm/web-llm.js` or, opt-in, a pinned jsDelivr URL (third-party code would then run in the page with access to keys). transformers.js not wired (same need for a bundled library); not done.
4. **Not done**: Chrome built-in AI (Prompt API / Gemini Nano): API shape changed between versions and I saw no source; not written blind.

## 3. Speech to text
Voice is transcribed outside the model (existing `AIS` presets: browser Web Speech, T.O X local Whisper via bridge, any `/v1/audio/transcriptions` server, Groq Whisper). Nothing added: I found no verified free STT endpoint beyond these. The text then goes to whichever route above is selected.

## Sources (from the search results, 2026-11-20)
- Groq: https://community.groq.com/t/is-there-a-free-tier-and-what-are-its-limits/790 , https://console.groq.com/docs/rate-limits.md
- OpenRouter: https://openrouter.ai/docs/api-reference/limits , https://openrouter.zendesk.com/hc/en-us/articles/39501163636379 , https://www.openrouter.ai/docs/guides/routing/model-variants/free
- Gemini: https://ai.google.dev/api/compatibility , https://ai.google.dev/gemini-api/docs/rate-limits.md.txt
- NVIDIA: https://forums.developer.nvidia.com/t/nvidia-nim-faq/300317 , https://forums.developer.nvidia.com/t/is-nim-free/369368
- Alibaba: https://help.aliyun.com/en/model-studio/compatibility-of-openai-with-dashscope , https://www.alibabacloud.com/help/en/model-studio/first-api-call-to-qwen
- Zhipu / Z.ai (third-party only): https://freellm.net/models/z-ai-zhipu-ai/glm-4-5-flash , https://yangmao.ai/en/providers/zhipu/
- SiliconFlow (third-party): https://yangmao.ai/en/providers/siliconflow/ , https://www.siliconflow.com/models/qwen-qwen3-8b
- Mistral: https://help.mistral.ai/en/articles/225174-what-are-the-limits-of-the-free-tier , https://help.mistral.ai/en/articles/450104-how-can-i-try-the-api-for-free-with-the-experiment-plan
- Cerebras: https://inference-docs.cerebras.ai/support/rate-limits
- GitHub Models: https://docs.github.com/en/github-models/use-github-models/prototyping-with-ai-models
- Cloudflare: https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility
- Hugging Face: https://huggingface.co/docs/inference-providers/pricing
- Cohere: https://docs.cohere.com/docs/rate-limits
- Doubao (third-party): https://yangmao.ai/en/providers/doubao/free-api/
- Tencent / SambaNova (third-party): https://yangmao.ai/en/providers/hunyuan/ , https://github.com/open-free-llm-api/awesome-freellm-apis
- DeepSeek / Kimi / MiniMax (third-party): https://yangmao.ai/en/top-free-llm-apis-2026/
- Together (third-party): https://benchlm.ai/md/free-tier/together.md
- Ollama CORS guides: https://objectgraph.com/blog/ollama-cors/ , https://pooyagolchian.github.io/use-local-llm/docs/guides/cors-setup
- WebLLM / transformers.js: https://unpkg.com/@mlc-ai/web-llm@0.2.84/README.md , https://pinggy.io/amp/blog/run_llm_in_browser_webgpu/

## 4. No-API connector tools ("red logo, connects anything"): n8n (2026-11-20)
The red/coral logo is **n8n** (my identification from the description; not checked against the owner). Others by logo colour: Zapier orange, Make purple. All marks are THIRD-PARTY unless stated; licences must be checked in each repo.
| Tool | Self-host free? | Notes | Fit for T.O X |
|---|---|---|---|
| **n8n** | Yes, Community edition under the Sustainable Use License: free for internal use, no reselling/hosting for others; `.ee.` files are Enterprise (n8n license FAQ, OFFICIAL-SNIPPET) | Webhook node in/out, HTTP Request node, 400+ integrations, MCP Server Trigger and MCP Client Tool nodes (a blog reports no stdio transport and a trigger issue: unverified) | **Best fit. Implemented.** |
| Activepieces | Yes, community edition MIT (third-party) | cloud free tier figures conflict (100 credits/day vs 10 flows) | same webhook pattern works; not tested |
| Node-RED | Yes, Apache-2.0 | IoT/MQTT/hardware oriented, `http in` / `http response` nodes | good for hardware, works with the same webhook |
| Huginn | Yes, MIT (two sources say Apache-2.0) | agents that watch the web, developer-heavy | niche |
| Make | Managed only; free tier ~1,000 credits/month (one source) | webhook trigger | cloud only; data leaves the computer |
| Zapier | Managed only; free plan details not found | webhook trigger | cloud only |
| Browser Use | MIT, self-host, **needs an LLM key** or a local model | drives a browser for sites with no API | pair with a free model from section 0 |
| Playwright MCP | Apache-2.0 (one source), no LLM needed | step-by-step browser control via MCP | scripted flows; Claude Code can use it |
| Open Interpreter | **no data found in this research** | | not assessed |
Sources: https://docs.n8n.io/n8n-community-license/community-license/license-faq , https://dev.to/grove_chatforest/n8n-mcp-server-turn-any-workflow-into-an-ai-callable-tool-2hfn , https://findstack.com/resources/self-hosted-zapier-alternative , https://composio.dev/content/zapier-alternatives , https://dev.to/agdex_ai/ai-native-browser-automation-in-2026-browser-use-stagehand-steel-and-playwright-mcp-compared-160n
**Wired in T.O X (provider `n8n`):** (out) the page POSTs `{text, source, lang, history, tools[, state]}` to the Webhook node URL with header `x-tox-token`; the reply `{reply, actions[]}` (or plain text, or an array) is shown and actions wait for the Run click. (in) n8n calls the existing bridge from an HTTP Request node: `POST http://127.0.0.1:8766/call {tool,args}` or `/reply {text}` with header `x-tox-token` (the bridge already accepts that header and sends CORS `*`). (MCP) `tox_bridge.py` is already an MCP server over stdio; n8n's MCP Client Tool reportedly needs SSE/HTTP, so use the HTTP `/call` route from n8n instead (an MCP-over-HTTP endpoint in the bridge is a follow-up).
