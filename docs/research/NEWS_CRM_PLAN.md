# News and Opportunities tab (mini-CRM) - design plan for T.O X - 2026-11-20

## ملخص بالعربي (6 سطور)
1. التاب ده بيجمع أخبار ومناقصات ووظائف وإعلانات المقاولات والعقارات والبنية التحتية (مصر، الخليج/السعودية، العالم) في مكان واحد، وبيشتغل زي CRM بسيط: مشاريع، شركات، جهات اتصال، مناقصات، وظائف، إعلانات، أخبار، تاجات، ومتابعات.
2. المصادر RSS أو API رسمية بس، ولا scraping. اختبرت الروابط بـ curl النهاردة: مصر فيها Daily News Egypt وEgypt Independent (قسم Business) شغالين، لكن مفيش ولا مصدر مصري بيسمح CORS للمتصفح، فمحتاجين وسيط (بروكسي).
3. الأبسط والمجاني: Google Apps Script كوسيط على حساب المالك نفسه؛ البيانات كلها JSON على Google Drive بتاعه (نطاق drive.file)؛ مفيش سيرفر تاني.
4. ربط الشركات بلوحة 6868 X: جدول ticker mapping (اتأكدت من 10 رموز على Yahoo) + لينك خارجي للقراءة فقط. اللوحة حالياً مفيهاش باراميتر رمز في الـ URL (بس cls/theme/lang) فالنسخة الأولى لينك لصفحة Yahoo واللوحة العامة.
5. قواعد ثابتة: معلومات وروابط فقط، مفيش نصيحة استثمار، مفيش سعر مخترع (السعر يظهر بمصدره ووقته أو مايظهرش)، VERIFIED يعني لينك اتشاف، وFROM MEMORY يعني لسه محتاج تأكيد.
6. الخطة 5 مراحل؛ أصغر نسخة أولى = قارئ أخبار لـ 4 مصادر CORS-مفتوحة + إدخال يدوي للشركات والمتابعات محفوظ على Drive، من غير بروكسي ولا تنبيهات.

## Evidence labels
- **VERIFIED (probe)** = I called the URL with `curl` from this machine on 2026-11-20 (06:48 UTC), sending `Origin: https://example.github.io`, and read the status, `content-type` and `access-control-allow-origin` (ACAO) response headers. Logs: `feed_results.txt` and the second run in the session scratchpad.
- Limits of the probe: one request per URL, a plain curl user agent. A `403 "Just a moment"` page is a Cloudflare bot check; a real browser might pass it, but a page script reading the feed still needs ACAO, so those need a proxy anyway. A missing ACAO header = a browser page on another origin cannot read it (CORS), proxy needed. I did NOT check OPTIONS preflight except for TED, and I did not read any site's terms of service (marked "ToS: not read").
- **MEMORY** = from my knowledge, no URL read.
- Prices and financial figures: none are stated in this file. Never invent them.

---

## 1. Goals and non-goals
- One tab: **News and Opportunities**. Four views: News, Tenders, Jobs and Ads (opportunities), CRM (projects, companies, contacts, follow-ups).
- Works from the static page. Data lives on the owner's Google Drive. No T.O X server.
- Optional link to the owner's market dashboard (`6868 X`, `/Users/M7/Documents/ai-trading-dashboard`): a listed company shows a ticker chip and a read-only "market info" link.
- Non-goals: investment advice or signals, scraping sites against their terms, storing other people's personal data beyond what the owner enters, inventing prices.

## 2. Sources by region (RSS or official API only)
Probe results, 2026-11-20. "Proxy" = needs a CORS proxy (section 4). ToS: not read for any source; check before shipping, and always show title + snippet + link out, never copy full articles.

### 2.1 Egypt
| Source | URL | Probe result | CORS for browser | Use |
|---|---|---|---|---|
| Daily News Egypt (all) | https://dailynewsegypt.com/feed/ | 200, `application/rss+xml` | no ACAO -> proxy | Egypt business, real estate; yes |
| Egypt Independent (Business) | https://www.egyptindependent.com/category/business/feed/ | 200, RSS | no ACAO -> proxy | Business; yes |
| Egypt Independent (main) | https://egyptindependent.com/feed/ | 403 Cloudflare check | proxy, may also fail | use the Business feed instead |
| Egypt Today | https://www.egypttoday.com/RSS | 403 Cloudflare check | proxy, may fail | not usable now |
| Ahram Online | https://english.ahram.org.eg/UI/Front/RSS.aspx and /rss/Business.aspx | 404 both (guessed paths) | n/a | **real RSS path NOT found**; look on the site footer, then probe again |
| Zawya (Egypt/Gulf, projects) | https://www.zawya.com/en/rss and /en/projects/feed | 404 both (guessed paths) | n/a | **real path NOT found**; Zawya Projects is a paid database (MEMORY), only free news pages are linkable |
| Mubasher (Arabic business) | https://www.mubasher.info/rss | 404 | n/a | path not found |
| Google News RSS search (query "Egypt construction") | https://news.google.com/rss/search?q=egypt+construction&hl=en | 200 after redirect, XML | no ACAO -> proxy | Works as a wide net per keyword. Google's terms for reuse of the feed: not read; show headline + link only |
| Egyptian e-tendering portal | https://etenders.gov.eg/ | connection failed from this machine (code 000) | n/a | status unknown; may be geo-limited. Link out; ask the owner for the correct current URL |
| Egypt Unified Procurement / Contractors union notices | not probed | n/a | n/a | MEMORY: public notices are posted as web pages and newspaper ads; no RSS known |

### 2.2 Gulf and KSA
| Source | URL | Probe | CORS | Use |
|---|---|---|---|---|
| Saudi Gazette | https://saudigazette.com.sa/rssFeed/1 | 200, XML, **`access-control-allow-origin: *`** | **direct from the page** | KSA general news; filter by keywords; yes |
| Arab News (taxonomy feed) | https://www.arabnews.com/taxonomy/term/1/feed | 200, RSS, **ACAO `*`** | **direct** | yes (term id 1 = a general section, not verified which; check content) |
| Arab News (site feed) | https://www.arabnews.com/rss.xml | 200, RSS | no ACAO -> proxy | alternative |
| The National (UAE) | https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml | 200, XML | no ACAO -> proxy | UAE news; yes |
| Construction Week Middle East | https://www.constructionweekonline.com/feed | 403 | proxy, may fail | not usable now |
| ME Construction News | https://www.meconstructionnews.com/feed | 200 after redirect, RSS | no ACAO -> proxy | **best Gulf-specific construction feed found**; yes |
| Arabian Business | https://www.arabianbusiness.com/rss | 403 | proxy, may fail | not usable now |
| Gulf Business | https://gulfbusiness.com/feed/ | 403 | proxy, may fail | not usable now |
| Gulf News | https://gulfnews.com/rss | 404 | n/a | path unknown |
| Khaleej Times | https://www.khaleejtimes.com/rss | 404 | n/a | path unknown |
| Etimad (KSA government tenders) | https://tenders.etimad.sa/Tender/AllTendersForVisitor | 200, an HTML page (visitor view); no feed or API verified | no ACAO | link out; do not scrape. Ask whether Etimad publishes an official API (not found) |
| MEED | https://www.mees.com/rss | 404 | n/a | MEED is paywalled (MEMORY); link only |

### 2.3 World: construction, real estate, infrastructure
| Source | URL | Probe | CORS | Use |
|---|---|---|---|---|
| Construction Dive | https://www.constructiondive.com/feeds/news/ | 200, RSS, **ACAO `*`** | **direct** | US construction news; yes |
| The Construction Index (UK) | https://www.theconstructionindex.co.uk/news/rss | 200, XML (note: `/rss` returned HTML, use `/news/rss`) | no ACAO -> proxy | yes |
| Construction Enquirer (UK) | https://www.constructionenquirer.com/feed/ | 200, RSS | no ACAO -> proxy | yes |
| Construction News (UK) | https://www.constructionnews.co.uk/rss | 200 after redirect, RSS | no ACAO -> proxy | yes |
| AEC Magazine | https://www.aecmag.com/feed/ | 200 after redirect, RSS | no ACAO -> proxy | BIM/software news; yes |
| ArchDaily | https://www.archdaily.com/feed | 200 after redirect, XML | no ACAO -> proxy | projects and galleries (copyright: headline + link only) |
| Dezeen | https://www.dezeen.com/feed/ | 200, RSS | no ACAO -> proxy | design/architecture news |
| ENR | https://www.enr.com/rss/articles | 403 Cloudflare | proxy, may fail | not usable now |
| BD Online | https://www.bdonline.co.uk/rss | 202, HTML, ACAO `*` (but not a feed) | n/a | path wrong |
| BBC Business | https://feeds.bbci.co.uk/news/business/rss.xml | 200, XML | no ACAO -> proxy | general economy; BBC feed terms are for personal non-commercial use (MEMORY, verify) |
| Al Jazeera (all) | https://www.aljazeera.com/xml/rss/all.xml | 200, RSS | no ACAO -> proxy | world / region |
| Reuters | https://www.reuters.com/arc/outboundfeeds/rss/?outputType=xml | 404 | n/a | Reuters stopped public RSS (MEMORY); skip |
| Global Construction Review | https://www.globalconstruction.review/feed/ | connection failed (000) | n/a | recheck later |
| Construction Europe | https://www.construction-europe.com/rss | 404 | n/a | path unknown |

### 2.4 Tenders (official data)
| Source | URL | Probe | CORS | Notes |
|---|---|---|---|---|
| World Bank procurement notices API | https://search.worldbank.org/api/v2/procnotices?format=json&rows=1 | 200, JSON (`content-type: text/plain`), 427,594 total notices at probe time | no ACAO -> proxy | official; supports filters (country, etc., parameters MEMORY, test). Free to use; terms: World Bank open data terms (MEMORY, verify) |
| World Bank projects API (Egypt, `countrycode_exact=EG`) | https://search.worldbank.org/api/v2/projects?format=json&rows=1&countrycode_exact=EG | 200, JSON, 194 projects for Egypt at probe time | no ACAO -> proxy | good "projects" seed data, with sector, status, loan size fields as given by the API |
| World Bank Indicators API | https://api.worldbank.org/v2/country/EG?format=json | 200, JSON, **ACAO `*`** | **direct** | country metadata and macro indicators (inflation, construction GDP shares: indicator codes MEMORY) |
| EU TED v3 search | https://api.ted.europa.eu/v3/notices/search | GET returns 405 (POST only). OPTIONS preflight showed `vary: Access-Control-Request-*` but no ACAO line | proxy | EU tenders; low relevance for Egypt except EU-funded works; token-free per TED (MEMORY) |
| UNGM public notices | https://www.ungm.org/Public/Notice | 200, HTML only | no ACAO | link out; UN tender notices have no verified API here |
| Etimad, etenders.gov.eg | see 2.1 / 2.2 | no API found | | link out |
| AfDB, ADB, EIB | https://www.afdb.org/en/rss (403 Cloudflare), https://www.adb.org/rss (200, HTML not a feed), https://www.eib.org/en/rss (301) | not feeds as probed | | funders' project pages as manual links |

### 2.5 Jobs
| Source | URL | Probe | CORS | Notes |
|---|---|---|---|---|
| Remotive API | https://remotive.com/api/remote-jobs?limit=1 | 200, JSON, **ACAO `*`**; response carries a notice to use the `remotive.com` domain | **direct** | remote jobs only (few construction roles); Remotive requires attribution and link-back and asks for limited polling (MEMORY, read the terms) |
| Arbeitnow API | https://www.arbeitnow.com/api/job-board-api | 200, JSON, **ACAO `*`** | **direct** | Europe/Germany focus, low relevance for Egypt |
| LinkedIn, Bayt, Wuzzuf, GulfTalent, Indeed | not probed | n/a | n/a | No public feed or API for this use found (MEMORY); scraping is against their terms (MEMORY) -> **link out with saved search URLs** (user opens, pastes the job into CRM via "add job by URL") |
| Google News RSS keyword for "hiring BIM Egypt" etc. | as 2.1 | 200 | proxy | headline level only |

### 2.6 Ads
No ad feed is used. Ads (sponsored posts, newspaper tender ads, supplier offers) are **entered manually** or via "paste URL + notes" and tagged `ad`. Reason: no terms-safe feed found (MEMORY: newspaper classifieds are copyrighted).

### 2.7 Feed health rule
Store per feed `lastStatus`, `lastOkAt`, `consecutiveFailures`. After 3 failures show a grey badge and stop polling until the user retries. Feeds in tables above with 403/404 start as "disabled".

---

## 3. Data model (JSON on the owner's Google Drive)
Storage: a folder `TOX_CRM/` on the user's Drive, created by the page after sign-in. Scope `drive.file` (the app only sees files it created; MEMORY of Google OAuth scopes, verify at https://developers.google.com/drive/api/guides/api-specific-auth). Sign-in from a static page: Google Identity Services token flow, client ID created by the owner in Google Cloud Console (MEMORY). One file per collection (`news.json`, `companies.json`, ...) plus `meta.json` (schema version). Writes use Drive `files.update` multipart upload; keep a `rev` counter and last-write-wins with a visible conflict warning (two devices).

Each record: `id` (ULID or `crypto.randomUUID()`), `createdAt`, `updatedAt` (ISO 8601 UTC), `source` (`manual` | `feed:<feedId>` | `api:<name>`), `verified` (`url_seen` | `from_memory` | `user_entered`), `tags[]`.

| Collection | Key fields |
|---|---|
| `projects` | name, nameAr, owner/client (company id), country, city, sector (residential, commercial, infrastructure, industrial, energy, water), stage (idea, design, tender, construction, handover), value {amount, currency, valueSource, asOf} (never invented; null if unknown), start/end dates, companyIds[], newsIds[], tenderIds[], notes, links[] |
| `companies` | name, nameAr, type (developer, contractor, consultant, supplier, authority), country, website, listed (bool), market {exchange, symbol, yahooSymbol, dashboardSymbol, mappedBy, mappedAt} or null, contactIds[], projectIds[], notes |
| `contacts` | name, role, companyId, email, phone, channel preferences, lastContactAt, consent note. Only data the owner types; shown with a "private" flag; not synced elsewhere |
| `tenders` | title, issuer (company id or free text), country, deadline, publishedAt, valueText (as printed), category, url (required), status (new, interested, preparing, submitted, won, lost, ignored), docsLinks[], followUpIds[] |
| `jobs` | title, company, country/city, postedAt, url (required), skills[] (BIM, Revit, P6...), status (saved, applied, interview, closed), notes |
| `ads` | title, advertiser, kind (supplier, product, event, tender-ad), url or image reference, validUntil, notes |
| `news` | title, url (required, canonical), sourceName, feedId, publishedAt, fetchedAt, snippet (<= 280 chars, from the feed), lang, tags[], companyIds[] (matched), projectIds[], read, starred. **No full-text storage** (copyright); keep link + snippet only |
| `tags` | id, label, labelAr, colour, kind (topic, region, sector, status) |
| `followups` | what, dueAt, doneAt, entityType + entityId (any of the above), owner, channel (call, email, site visit), notes |
| `feeds` | id, name, url, region, kind (rss, json-api), needsProxy, enabled, lastStatus, lastOkAt, failures, termsUrl, termsChecked (bool + date) |
| `tickers` | the mapping table (section 5), editable |

Region taxonomy: `EG`, `SA`, `AE`, `GULF`, `WORLD`. Sector tags as above. Arabic labels required for all tags (T.O X is Arabic-first).

Company matching in news: case-insensitive name + alias list per company (`aliases[]` incl. Arabic spellings); match on title and snippet only. Show a "matched: Talaat Moustafa" chip; the user can confirm or remove the match (store `matchConfirmed`).

---

## 4. Fetching: direct vs proxy
- **Direct from the page (ACAO `*` verified):** Saudi Gazette, Arab News taxonomy feed, Construction Dive, World Bank Indicators, Remotive, Arbeitnow.
- **Needs a proxy (no ACAO):** nearly everything Egyptian and Gulf, plus UK construction feeds, ArchDaily, Dezeen, BBC, Al Jazeera, World Bank procurement and projects APIs, Google News RSS.
- Proxy options, from least to most infrastructure (MEMORY unless stated):
  1. **Google Apps Script web app** run under the owner's own Google account: `UrlFetchApp.fetch(feedUrl)` then return the text with CORS handled by the Apps Script web-app response. No server, free quota, same account as Drive. Whitelist only the URLs in `feeds` (never an open proxy). Quotas apply; verify current limits in the Apps Script docs.
  2. A free Cloudflare Worker with a hard allow-list of feed URLs and `Access-Control-Allow-Origin` set to the T.O X origin only.
  3. Public CORS proxies (e.g. allorigins, corsproxy.io): **not recommended**: third party sees every request, can inject content, rate-limits unpredictably.
  4. rss2json style conversion services: third party, free limits; not recommended for the same reason.
- Parsing: `DOMParser` on the XML text (RSS 2.0 and Atom); sanitise: use `textContent` only, never `innerHTML` on feed fields. Resolve relative links. Cap 50 items per feed per fetch. De-duplicate by canonical URL hash.
- Etiquette: poll at most every 30-60 minutes per feed and only while the tab is open; honour 429/Retry-After; send no personal data in the proxy URL.
- Terms: before enabling any feed set `termsChecked=true` with the date and a link in the `feeds` record. Show source name on every item.

---

## 5. Linking a company in the news to the market dashboard (no advice)

### 5.1 Facts about the dashboard (VERIFIED by reading the repo)
- Streamlit app; page query params used in `main.py`: `theme`, `mat`, `lang`, `cls` (asset class). There is **no query param for a symbol** (grep of `st.query_params` in `/Users/M7/Documents/ai-trading-dashboard/main.py`, 2026-11-20).
- Symbol convention inside the dashboard: `Y:` prefix = embedded Yahoo (example in `PROJECT_STATUS.md`: `Y:EURUSD=X`); `HL:xyz:*` = Hyperliquid perpetuals; `FH:*` = Finnhub (from `CLAUDE.md`). Prices there are described by the owner as delayed for Yahoo rows.
- The app has login that is "ready but off" until launch (CLAUDE.md), so the public URL of the dashboard is the owner's to supply.

### 5.2 Mapping table (v1) - ticker verified through Yahoo's chart endpoint
Probe: `https://query1.finance.yahoo.com/v8/finance/chart/<SYMBOL>?range=1d`, status and the name field returned, 2026-11-20. This is an unofficial public endpoint (no ACAO header on the earlier probe, so a page cannot call it directly; terms: not read). It proves the symbol exists and its name; it is **not** an endorsement.

| Company | Type | Yahoo symbol | Name returned | Exchange / currency | Dashboard symbol (to confirm) |
|---|---|---|---|---|---|
| Talaat Moustafa Group Holding | developer EG | `TMGH.CA` | Talaat Moustafa Group Holding | CAI / EGP | `Y:TMGH.CA` |
| Palm Hills Developments | developer EG | `PHDC.CA` | Palm Hills Developments S.A.E. | CAI / EGP | `Y:PHDC.CA` |
| Emaar Misr for Development | developer EG | `EMFD.CA` | Emaar Misr for Development Company | CAI / EGP | `Y:EMFD.CA` |
| SODIC | developer EG | `OCDI.CA` | Sixth of October for Development and Investment (SODIC) | CAI / EGP | `Y:OCDI.CA` |
| Orascom Construction | contractor | `ORAS.CA` | Orascom Construction PLC | CAI / EGP | `Y:ORAS.CA` |
| Arab Developers Holding | developer EG | `ARAB.CA` | Arab Developers Holding | CAI / EGP | `Y:ARAB.CA` |
| El Sewedy Electric | industrial/EPC | `SWDY.CA` | El Sewedy Electric Company | CAI / EGP | `Y:SWDY.CA` |
| Dar Al Arkan | developer KSA | `4300.SR` | Dar Al Arkan Real Estate Development Company | SAU / SAR | `Y:4300.SR` |
| Saudi Real Estate Company | developer KSA | `4020.SR` | Saudi Real Estate Company | SAU / SAR | `Y:4020.SR` |
| Emaar Properties | developer UAE | `EMAAR.AE` | Emaar Properties PJSC | DFM / AED | `Y:EMAAR.AE` |
| Emaar Development | developer UAE | `EMAARDEV.AE` | Emaar Development PJSC | DFM / AED | `Y:EMAARDEV.AE` |

Failed guesses (do not use): `TMG.CA` (not found; correct is `TMGH.CA`), `ALDAR.AE` (not found). Lesson: **never guess a ticker**; a mapping row needs `mappedBy` (who confirmed) and `mappedAt`. The dashboard column `Y:...` follows the repo's convention but I did **not** test that the dashboard accepts these symbols (sandbox cannot run it against live data).

### 5.3 What the Company card shows
- Chip: `TMGH.CA - CAI - EGP`.
- Link 1 (works today, read-only): the public Yahoo Finance quote page `https://finance.yahoo.com/quote/<symbol>` (URL pattern MEMORY, open it to confirm; terms apply).
- Link 2: the dashboard home URL set by the owner in Settings (field `dashboardUrl`), optionally with `?cls=Stocks`. Whether `cls=Stocks` is a valid asset class name: **not verified**; list of valid values is in `modules/asset_classes.py` (not read).
- Optional later: if the owner adds a `?sym=` query param to the dashboard (a change in the other project, the owner decides), the link becomes a deep link. T.O X must not modify the dashboard.
- Price display: **none in v1.** If later added, show last price with source, timestamp and delay label, or show "n/a". Never an estimate, never a colour that implies a recommendation (no green/red "buy/sell" language).
- Mandatory footer on every card with a ticker: "Information and links only. Not investment advice. Check the source."
- Not covered by a ticker (private companies, government bodies): chip hidden; no mapping suggested.

### 5.4 Rules the code must enforce
1. No words such as "buy", "sell", "target price", "undervalued" generated by T.O X or by any AI summary. AI summaries of news (if added) go through a fixed prompt that forbids advice and returns only a neutral 2-sentence summary + source.
2. Mapping edits are manual; an AI may *suggest* a candidate, the owner confirms.
3. Never send the user's CRM data (names, notes, contacts) to the market dashboard or to any third party.

---

## 6. Alerts
In-page only for v1 (a static page cannot push when closed).
- Triggers: new item matching a **watch rule** (keywords, company id, region, sector, min-age), tender deadline within N days, follow-up due, feed down for > 24 h.
- Delivery: badge on the tab, a "since last visit" panel, optional browser Notification API if the user allows (MEMORY: needs permission and the page open or a service worker).
- Later (phase 4): daily digest email through a Google Apps Script time trigger under the owner's account (MEMORY: Apps Script supports time-driven triggers and `MailApp`); digest goes only to the owner's own address. Sending mail on behalf of the owner to others needs explicit per-use consent (project rule).
- Never auto-contact anyone from a news item.

---

## 7. Phased build plan
| Phase | Scope | Needs | Done when |
|---|---|---|---|
| **0 (smallest first version, "v0.1")** | News view only. 4 direct-CORS feeds: Saudi Gazette, Arab News taxonomy, Construction Dive, World Bank Indicators (country card). Keyword filter, star/read, tags typed by hand. Companies list entered by hand (name, type, optional ticker row from section 5.2) with the two outbound links. Data saved to Drive `TOX_CRM/*.json`. A "paste URL" box that adds an item by hand (tender, job or ad) with a status. | Google client ID, no proxy, no alerts | Owner can read 4 sources, keep 10 companies and 10 follow-ups across devices; works with the feed list disabled |
| 1 | Apps Script allow-list proxy + Egypt and Gulf construction feeds (Daily News Egypt, Egypt Independent Business, ME Construction News, The National, UK construction feeds). Feed health panel, de-duplication, company name matching with confirm. | Apps Script deployment by the owner | 10+ feeds with status badges, matches shown |
| 2 | Full CRM views: projects, contacts, tenders, jobs, ads, follow-ups with due dates; links between records; Arabic/English labels; CSV export/import. World Bank projects and procurement notices via proxy. | none new | One project page lists its companies, news, tenders and follow-ups |
| 3 | In-page alerts (watch rules), "since last visit", deadline countdowns. Dashboard link field in Settings and ticker table editor. | none | Alerts fire for a test rule |
| 4 | Digest email via Apps Script trigger (to the owner only); optional neutral AI summary (project's Gemini-only rule for the app's own AI, `CLAUDE.md` in the dashboard repo, with the per-day cap); Arabic keyword normalisation. | Gemini key, owner approval | Digest arrives once a day; summaries contain no advice |
| 5 (optional) | If the owner wants it: a `?sym=` deep link on the dashboard side; market snapshot widget fed from the dashboard's own data (owner's decision, separate project). | change in other repo | Owner decides |

Test rule for every phase: mock feeds with local sample XML/JSON (the sandbox/CORS pattern the owner already uses: Playwright + `page.route`); mark results "mock-tested only" until run on the owner's real browser.

## 8. Risks and open questions
- **No Egyptian feed sends CORS** (probe): the proxy is not optional for Egypt coverage. Ask the owner to approve Apps Script (account-bound) vs a Cloudflare Worker.
- Ahram Online, Zawya, Mubasher feed URLs were **not found** (paths guessed gave 404). Need the real URLs from the sites or from the owner.
- Etimad and the Egyptian e-tender portal: no API found; the owner may have a registered account and a formal data route (ask).
- Many sites block bots (Cloudflare 403) from my probe; some may work from the owner's browser/proxy. Re-probe through the proxy once built.
- Terms of service not read for any feed; BBC, Reuters-type feeds often restrict commercial use (MEMORY).
- Personal data in `contacts`: stays on the owner's Drive; the owner is responsible for local data-protection rules (Egypt Personal Data Protection Law No. 151 of 2020, MEMORY, verify).
- Ticker table maintenance: symbols change (delisting, mergers). Each row has `mappedAt`; re-probe monthly.
- The dashboard's valid `cls` values and whether it accepts `Y:<ticker>.CA` Cairo symbols were not tested.

## 9. NOT checked this session
- Terms of service of every source; Apps Script and Drive quotas; Google OAuth scope behaviour; Notification API behaviour on mobile.
- Whether the feeds listed as 200 carry recent items and how many (only the first 90 bytes of each body were read).
- Browser-side behaviour of the 403 sources.
- Any price, return or market statistic: none was fetched or stated.
