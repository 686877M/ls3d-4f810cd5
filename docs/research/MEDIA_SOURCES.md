# MEDIA_SOURCES — فيديو ومحتوى حر الترخيص لـ T.O X

Research date: 2026-11-20. Research only: **nothing downloaded, no app source edited.** File sizes came from HTTP `HEAD` (headers only).

## ملخص (6 أسطر)
1. لقيت فيديوهات حقيقية بترخيص حر للكعبة والمسجد النبوي والحج وزينة رمضان ومعالم مصر والسعودية ولقطات تجريدية (ذهبي/كهرماني) — الجداول تحت.
2. أنظف مصدر: **Pexels** (بدون إشارة مطلوبة) و **Pixabay** (بدون إشارة)؛ **Wikimedia Commons** فيه لقطات حج وكعبة حقيقية بس أغلبها **CC BY** (لازم اسم المصور).
3. ما قدرتش أتأكد من العلامة المائية (ما فتحتش الفيديوهات) — كل ملف لازم تتفرج عليه بنفسك قبل الاعتماد. لقطات "جوية" للكعبة ممكن تكون مولّدة بالذكاء الاصطناعي (الطيران بالدرون ممنوع هناك).
4. المناسبات: `Intl.DateTimeFormat('en-u-ca-islamic-umalqura')` شغال (اتجرب في Node)؛ فرق يوم واحد عن رؤية الهلال وارد — اعرض "نافذة ±1 يوم".
5. أيقونات/سبينر/ثيم: Lucide (ISC)، Tabler وPhosphor (MIT)، Material Symbols (Apache-2.0)، svg-spinners (MIT)، Lottie من LottieFiles (ترخيص Simple — الإشارة اختيارية).
6. التوصية: بذرة يومية للقطات + كارت "بطل" واحد بالمناسبة في النص + باقي الكروت متنوعة بنفس الألوان. أول 12 ملف للتحميل في آخر الملف — **محتاج موافقتك قبل أي تحميل**.

---

## 0. Legend and rules used
- **VERIFIED** = read from the live licence page/API or HTTP header during this session. **FROM MEMORY** = not re-checked today.
- Watermark column: **NOT CHECKED** everywhere (no frame was viewed). Treat as open until a human watches each file.
- Licence pages actually read:
  - Pexels: https://www.pexels.com/license/ (VERIFIED). Free use, no attribution, modification allowed. Not allowed: identifiable people in a bad light, selling unaltered copies, implying endorsement, redistributing on other stock sites, use inside a trademark.
  - Pixabay: https://pixabay.com/service/license-summary/ (VERIFIED, summary only). Free use, no attribution, modification allowed. Not allowed: standalone resale/redistribution, recognisable trademarks for commercial goods, misleading use. Only the full licence is legally binding; **the full text was not read** — read https://pixabay.com/service/license/ before launch (FROM MEMORY for that URL).
  - Wikimedia Commons: licence name and URL read through the Commons API `extmetadata` for each file (VERIFIED). CC BY 3.0 / 4.0 needs attribution. **CC BY-SA** also requires adaptations (re-encode, colour grade) to be shared under the same licence — avoid for hero assets unless the owner accepts that.
  - LottieFiles: https://lottiefiles.com/page/license (VERIFIED, "Lottie Simple License FL 9.13.21").
- Direct file URLs: Pexels = `contentUrl` from the page's own JSON-LD (VERIFIED, HTTP 200). Pixabay = `contentUrl` from page JSON-LD (VERIFIED, 200). Commons = API `url` (VERIFIED, 200 on the two HEAD-tested).
- **Provenance warning:** Pexels "aerial of the Kaaba" clips (uploader Earth Photart, Dec 2025) and some Pixabay clips have no stated source. Drone flights over the Haram are not allowed, so such "aerial" shots may be AI-generated or from towers. This is an inference, not a finding. Pixabay slugs marked `ai-generated` exist (e.g. 360197, 364320, 383307). Ask the owner whether AI-made footage is acceptable.
- Pexels clips are "not for identifiable people in a bad light": prefer wide crowd shots, no faces.
- Resolution note: Pexels `contentUrl` is a rendition (usually 2560×1440 for 4K originals; the 4K original is via `https://www.pexels.com/download/video/<id>/`). Sizes below are for the `contentUrl` file.

## 1. Kaaba and Masjid al-Haram
| # | Source / page | Direct file | Licence (read at) | Res · dur · size | Watermark | Attribution |
|---|---|---|---|---|---|---|
| 1.1 | Pexels 35743721 "Nighttime view of Grand Mosque in Mecca" (Mohammad Kheir, 2026-01) https://www.pexels.com/video/nighttime-view-of-grand-mosque-in-mecca-35743721/ | https://videos.pexels.com/video-files/35743721/15151110_1920_1080_30fps.mp4 | Pexels licence (pexels.com/license/) | 1920×1080 · 26 s · 8.2 MB | NOT CHECKED | none required |
| 1.2 | Pexels 38255869 "Pilgrims performing tawaf at Masjid al-Haram" (Yusuf Khan Afridi, 2026-06) https://www.pexels.com/video/pilgrims-performing-tawaf-at-masjid-al-haram-38255869/ | https://videos.pexels.com/video-files/38255869/16243374_2560_1440_60fps.mp4 | Pexels | 2560×1440 (orig 3840×2160) · 7 s · 16.4 MB | NOT CHECKED | none |
| 1.3 | Pexels 35110822 "Aerial view of Kaaba at Mecca's Grand Mosque" (Earth Photart) https://www.pexels.com/video/aerial-view-of-kaaba-at-mecca-s-grand-mosque-35110822/ | https://videos.pexels.com/video-files/35110822/14874746_2560_1440_60fps.mp4 | Pexels | 2560×1440 · 12 s · 20.4 MB | NOT CHECKED; provenance doubt (see warning) | none |
| 1.4 | Pexels 35098658 crowds around Kaaba (Earth Photart) | https://videos.pexels.com/video-files/35098658/14869473_2560_1440_60fps.mp4 | Pexels | 2560×1440 · 8 s · size not checked | NOT CHECKED | none |
| 1.5 | Pexels 41070642 "Night pilgrimage at the Kaaba" (Selim A, 2026-11-16) vertical | https://videos.pexels.com/video-files/41070642/17578959_1440_2560_60fps.mp4 | Pexels | 1440×2560 · 18 s · size not checked | NOT CHECKED | none |
| 1.6 | Pixabay 198048 "Mecca, Madina…" (muhammadarhamamin77800, 2024-01) https://pixabay.com/videos/mecca-madina-saudia-arabia-haram-198048/ | https://cdn.pixabay.com/video/2024/01/25/198048-906522343_large.mp4 | Pixabay Content Licence (license-summary) | 1920×1080 · 30 s · 20.4 MB | NOT CHECKED | none |
| 1.7 | Pixabay 198047 same author https://pixabay.com/videos/mecca-madina-saudia-arabia-haram-198047/ | https://cdn.pixabay.com/video/2024/01/25/198047-906522337_large.mp4 | Pixabay | 1920×1080 · 20 s · 14.7 MB | NOT CHECKED | none |
| 1.8 | Commons "Kaaba at Night (video) - Sep 28, 2016.webm" (Hamza Khan) https://commons.wikimedia.org/wiki/File:Kaaba_at_Night_(video)_-_Sep_28,_2016.webm | https://upload.wikimedia.org/wikipedia/commons/3/37/Kaaba_at_Night_%28video%29_-_Sep_28%2C_2016.webm | CC BY 3.0 (https://creativecommons.org/licenses/by/3.0) | 1920×1080 · 53 s · 49.0 MB | NOT CHECKED | "Hamza Khan, CC BY 3.0, via Wikimedia Commons" + link |
| 1.9 | Commons "Great Mosque of Mecca (4k video) - May 27, 2014.webm" (SHeGaRDeQ8i) | https://upload.wikimedia.org/wikipedia/commons/f/f4/Great_Mosque_of_Mecca_%284k_video%29_-_May_27%2C_2014.webm | CC BY 3.0 | 3840×2160 · 60 s · 128.2 MB | NOT CHECKED | "SHeGaRDeQ8i, CC BY 3.0, via Wikimedia Commons" |
| 1.10 | Commons "Makkah Al-Mukarramah -Kaaba- Ramadan 2016.webm" (World of Travel) | https://upload.wikimedia.org/wikipedia/commons/8/81/Makkah_Al-Mukarramah_-Kaaba-_Ramadan_2016.webm | CC BY 3.0 | 1920×1080 · 86 s · 97.7 MB | NOT CHECKED | "World of Travel, CC BY 3.0, via Wikimedia Commons" |

Gap: no clearly-licensed real **drone** footage of the Kaaba found. The only "aerial" ones are the unverified Pexels clips above.

## 2. Masjid an-Nabawi and the Green Dome
Whether the dome is in frame is **not verified** for any of these (titles only).
| # | Page | Direct file | Licence | Res · dur · size | Watermark | Attribution |
|---|---|---|---|---|---|---|
| 2.1 | Pexels 31281542 "Evening at Al-Masjid an-Nabawi" (Yusuf Khan Afridi, 2025-03) https://www.pexels.com/video/evening-at-al-masjid-an-nabawi-in-madinah-31281542/ | https://videos.pexels.com/video-files/31281542/13358269_2560_1440_60fps.mp4 | Pexels | 2560×1440 · 17 s · 28.4 MB | NOT CHECKED | none |
| 2.2 | Pexels 18775984 "The mosque, Medina" (Aamir Somewhere, 2023) | https://videos.pexels.com/video-files/18775984/18775984-uhd_2560_1440_60fps.mp4 | Pexels | 2560×1440 · 9 s · 14.3 MB | NOT CHECKED | none |
| 2.3 | Pexels 26268247 "Masjid al-Nabawi … Madina" (Aamir Somewhere, 2024) | https://videos.pexels.com/video-files/26268247/11943873_2560_1440_60fps.mp4 | Pexels | 2560×1440 · 11 s · 36.0 MB | NOT CHECKED | none |
| 2.4 | Pexels 3687764 "People walking around the Prophet's Mosque" (Md Amir Umar, 2020) | https://videos.pexels.com/video-files/3687764/3687764-hd_1920_1080_30fps.mp4 | Pexels | 1920×1080 · 29 s · size not checked | NOT CHECKED | none |
| 2.5 | Pixabay 198164 "Madina, Saudia, Arabia" (a web search snippet tags it "Masjide Nabvi Gunbad") https://pixabay.com/videos/madina-saudia-arabia-masjid-198164/ | https://cdn.pixabay.com/video/2024/01/26/198164-906869460_large.mp4 | Pixabay | 1920×1080 · 49 s · 34.2 MB | NOT CHECKED | none |
| 2.6 | Pixabay 198163 same author | https://cdn.pixabay.com/video/2024/01/26/198163-906869458_large.mp4 | Pixabay | 1920×1080 · 25 s · size not checked | NOT CHECKED | none |

No Commons video for Masjid an-Nabawi turned up (Commons search returned nothing relevant).

## 3. Hajj (Arafat, Mina, Muzdalifah, tawaf)
| # | Page | Direct file | Licence | Res · dur · size | Watermark | Attribution |
|---|---|---|---|---|---|---|
| 3.1 | Commons "Tawaf Ifadha 2016 with Amm Salim.webm" | https://upload.wikimedia.org/wikipedia/commons/3/30/Tawaf_Ifadha_2016_with_Amm_Salim.webm | CC BY 3.0 | 1920×1080 · 14 s · 25.7 MB | NOT CHECKED | "Amm Salim, CC BY 3.0, via Wikimedia Commons" |
| 3.2 | Commons "Time lapse of Masjid al-Ḥarām (kaaba) & hajj rites.webm" (Masajida Allah) | https://upload.wikimedia.org/wikipedia/commons/4/43/Time_lapse_of_Masjid_al-%E1%B8%A4ar%C4%81m_%28kaaba%29_%26_hajj_rites.webm | CC BY 3.0 | 1920×1080 · 193 s · 84.5 MB | NOT CHECKED | "Masajida Allah, CC BY 3.0, via Wikimedia Commons" |
| 3.3 | Commons "Mina fly over - Flickr - Al Jazeera English.ogv" | https://upload.wikimedia.org/wikipedia/commons/a/a5/Mina_fly_over_-_Flickr_-_Al_Jazeera_English.ogv | **CC BY-SA 2.0** (share-alike) | 1280×720 · 30 s · 7.5 MB | Al Jazeera branding possible — NOT CHECKED, reject if present | "Omar Chatriwala / Al Jazeera English, CC BY-SA 2.0" |
| 3.4 | Commons "Hajj in1360-1361H.webm" (archival, ~1941-42) | https://upload.wikimedia.org/wikipedia/commons/e/e0/Hajj_in1360-1361H.webm | "Public domain" per Commons metadata (author unknown; PD basis not independently checked) | 1920×1080 · 261 s · 66.5 MB | NOT CHECKED | none, but cite Commons page |
| 3.5 | Pexels 38255869 / 38255868 tawaf (see 1.2) | — | Pexels | — | — | none |

Gaps: **no Arafat (Jabal al-Rahmah) or Muzdalifah footage found** under a clear free licence (Pexels "mount arafat" returned Uhud and desert clips; Pixabay Hajj results are Islamic motion-graphics by PANJTANPAK_GRAPHICS05, not verified). Keep Arafat/Mina cards on generative motion unless the owner finds footage.

## 4. Eid and Ramadan
| # | Page | Direct file | Licence | Res · dur · size | Watermark | Attribution |
|---|---|---|---|---|---|---|
| 4.1 | Pixabay 200850 "Lantern lamp Ramadan incense smoke" (Mohamed_hassan, 2024) https://pixabay.com/videos/lantern-lamp-ramadan-incense-smoke-200850/ | https://cdn.pixabay.com/video/2024/02/17/200850-914033010_large.mp4 | Pixabay | 1920×1080 · 24 s · 9.4 MB | NOT CHECKED | none |
| 4.2 | Pixabay 113621 "Islam crescent moon star muslim" (Eartvideos, 2022) | https://cdn.pixabay.com/video/2022/04/11/113621-698448438_large.mp4 | Pixabay | 3840×2160 · 30 s · 7.5 MB | NOT CHECKED | none |
| 4.3 | Pixabay 205172 "Islam islamic ramadan background" (Natsu_444, 2024) | https://cdn.pixabay.com/video/2024/03/22/205172-926480911_large.mp4 | Pixabay | 3840×2160 · 15 s · 7.3 MB | NOT CHECKED | none |
| 4.4 | Pixabay 202965 Eid mosque (Natsu_444) | https://cdn.pixabay.com/video/2024/03/04/202965-919289035_large.mp4 | Pixabay | 3840×2160 · 10 s · 24.8 MB | NOT CHECKED | none |
| 4.5 | Pixabay 333203 "Ramadan intro / theme" (AamirSomewhere, 2026-02) | https://cdn.pixabay.com/video/2026/02/07/333203_large.mp4 | Pixabay | 3840×2160 · 9 s · 36.6 MB | NOT CHECKED | none |
| 4.6 | Pexels 36587192 "Traditional Ramadan iftar gathering" (Cemrecan Yurtman, 2026-03) https://www.pexels.com/video/traditional-ramadan-iftar-gathering-at-dinner-table-36587192/ | https://videos.pexels.com/video-files/36587192/15511644_2560_1440_25fps.mp4 | Pexels | 2560×1440 · 6 s · 4.4 MB | NOT CHECKED | none |
| 4.7 | Pexels 36231487 "Majestic mosque illuminated at night" (eslem esra, 2026-02) | https://videos.pexels.com/video-files/36231487/15365366_2560_1440_30fps.mp4 | Pexels | 2560×1440 · 14 s · 8.5 MB | NOT CHECKED | none |
| 4.8 | Pexels 7248992 "Celebrating Eid Mubarak" (RDNE Stock project) | https://videos.pexels.com/video-files/7248992/7248992-hd_1920_1080_24fps.mp4 | Pexels | 1920×1080 · 8 s · 5.0 MB | NOT CHECKED (shows people/text card) | none |
| 4.9 | Pexels 6010701 "Al-Azhar Mosque under a dark sky" (Tima Miroshnichenko, 2020) vertical | https://videos.pexels.com/video-files/6010701/6010701-uhd_1440_2560_25fps.mp4 | Pexels | 1440×2560 · 9 s · 11.9 MB | NOT CHECKED | none |
| 4.10 | Commons "رمضان أهلاً.webm" / "تعليق الزينة.webm" / "فطار في الجمالية.webm" (Aya Eissa shehab; Egyptian Ramadan, vertical) | e.g. https://upload.wikimedia.org/wikipedia/commons/6/6e/%D8%B1%D9%85%D8%B6%D8%A7%D9%86_%D8%A3%D9%87%D9%84%D8%A7%D9%8B.webm | **CC BY-SA 4.0** (share-alike) | 1080×1920 · 39 / 31 / 25 s · 37.4 / 37.9 / 21.7 MB | NOT CHECKED | "Aya Eissa shehab, CC BY-SA 4.0, via Wikimedia Commons" |
| 4.11 | Commons "Crescent Moon, Olympus SP-820UZ.webm" (Guigo) | https://upload.wikimedia.org/wikipedia/commons/e/ed/Crescent_Moon%2C_Olympus_SP-820UZ.webm | CC BY-SA 3.0 | 1280×720 · 36 s · 1.7 MB | NOT CHECKED | "Guigo, CC BY-SA 3.0, via Wikimedia Commons" |

Notes: Pexels has no strong "fanous lantern" video hit (the "ramadan lantern" search returned letter-board/candle/tea scenes). The Pexels 4.8 clip contains people — Pexels rule on identifiable people applies. Pixabay Hajj/Eid hits by PANJTANPAK_GRAPHICS05 are Arabic-calligraphy motion graphics (not opened).

## 5. Egyptian and Saudi landmarks, national-day motifs
| # | Page | Direct file | Licence | Res · dur · size | Watermark | Attribution |
|---|---|---|---|---|---|---|
| 5.1 | Pexels 7501212 "Mosque of Muhammad Ali" (The Instagrapher, 2021) | https://videos.pexels.com/video-files/7501212/7501212-hd_1920_1080_24fps.mp4 | Pexels | 1920×1080 · 25 s · 18.3 MB | NOT CHECKED | none |
| 5.2 | Pexels 10719817 "Aerial view on Cairo and pyramids" (Blanka OG, 2022) | https://videos.pexels.com/video-files/10719817/10719817-uhd_2560_1440_24fps.mp4 | Pexels | 2560×1440 · 122 s · **197.8 MB** | NOT CHECKED | none |
| 5.3 | Pexels 10717893 "Aerial view on pyramids in Cairo" (Blanka OG) | https://videos.pexels.com/video-files/10717893/10717893-uhd_2560_1440_24fps.mp4 | Pexels | 2560×1440 · 65 s · 104.0 MB | NOT CHECKED | none |
| 5.4 | Pexels 32537704 "Great Pyramids in Giza" (K, 2025-06) | https://videos.pexels.com/video-files/32537704/13876135_2560_1440_24fps.mp4 | Pexels | 2560×1440 · 21 s · 18.6 MB | NOT CHECKED | none |
| 5.5 | Pexels 32537717 "Egyptian flag waving" (K) | https://videos.pexels.com/video-files/32537717/13875836_2560_1440_24fps.mp4 | Pexels | 2560×1440 · 17 s · 12.1 MB | NOT CHECKED | none |
| 5.6 | Commons "Giza pyramid complex 3D flyover.webm" (Drummyfish; low-res 3D render) | https://upload.wikimedia.org/wikipedia/commons/4/43/Giza_pyramid_complex_3D_flyover.webm | **CC0** (http://creativecommons.org/publicdomain/zero/1.0/deed.en) | 1280×768 · 52 s · 2.5 MB | NOT CHECKED | none |
| 5.7 | Pexels 18819906 "AlUla old town" (Aamir Somewhere, 2023) | https://videos.pexels.com/video-files/18819906/18819906-uhd_2560_1440_30fps.mp4 | Pexels | 2560×1440 · 12 s · 23.0 MB | NOT CHECKED | none |
| 5.8 | Pexels 34747276 "Jeddah Corniche skyline" (Md Amir Umar, 2025) | https://videos.pexels.com/video-files/34747276/14730281_2560_1440_30fps.mp4 | Pexels | 2560×1440 · 18 s · 41.9 MB | NOT CHECKED | none |
| 5.9 | Pexels 34505477 "Kingdom Tower with light show, Riyadh" (Grbr Snts) vertical | https://videos.pexels.com/video-files/34505477/14619965_1440_2560_30fps.mp4 | Pexels | 1440×2560 · 20 s · size not checked | NOT CHECKED. Light-show may show sponsor logos/brands | none |
| 5.10 | Pexels 29815609 "Saudi flag waving in blue sky" (Aamir Somewhere) vertical | https://videos.pexels.com/video-files/29815609/12807884_1440_2560_60fps.mp4 | Pexels | 1440×2560 · 30 s · 39.6 MB | NOT CHECKED | none |
| 5.11 | Pexels 13786581 "Flag of Saudi Arabia" (Olex Lia) | https://videos.pexels.com/video-files/13786581/13786581-hd_1920_1080_25fps.mp4 | Pexels | 1920×1080 · 30 s · size not checked | NOT CHECKED | none |
| 5.12 | Commons "Jet d'eau of jeddah, saudi arabia.webm" (Mr X) | https://upload.wikimedia.org/wikipedia/commons/3/3e/Jet_d%27eau_of_jeddah%2C_saudi_arabia.webm | CC BY 3.0 | 720×1280 · 51 s · 9.2 MB | NOT CHECKED | "Mr X, CC BY 3.0, via Wikimedia Commons" |

Rejected: Commons "Google Timelapse - Cairo…" (Google Earth, CC BY 3.0) — a Google Earth overlay/logo is likely; I did not check, and the third-party mark rule applies. Commons Riyadh/Cairo "official visit" clips (White House etc.) are people/politics, not wanted.
Saudi/Egypt national-day motifs: only flags found. Fireworks/parade footage not searched on Pexels/Pixabay. Gap.

## 6. Abstract slow loops (gold, amber, cyan on black)
Colour match is judged from titles only, not from frames. Clips by Nicola Narracci, Chandresh Uike and others look AI/CGI-made (inference).
| # | Page | Direct file | Licence | Res · dur · size | Watermark | Attribution |
|---|---|---|---|---|---|---|
| 6.1 | Pexels 34645258 "Golden particle lines abstract motion background" (Chandresh Uike, 2025-11) | https://videos.pexels.com/video-files/34645258/14683978_2560_1440_30fps.mp4 | Pexels | 2560×1440 · 20 s · 30.2 MB | NOT CHECKED | none |
| 6.2 | Pexels 34645269 "Elegant golden particle lines" (same) | https://videos.pexels.com/video-files/34645269/14683984_2560_1440_30fps.mp4 | Pexels | 2560×1440 · 20 s · size not checked | NOT CHECKED | none |
| 6.3 | Pexels 29756785 "Glowing particles swirling in darkness" (Nicola Narracci) | https://videos.pexels.com/video-files/29756785/12788303_1920_1080_30fps.mp4 | Pexels | 1920×1080 · 10 s · 18.6 MB | NOT CHECKED | none |
| 6.4 | Pexels 34342111 "Neon topographic digital landscape" (Nicola Narracci) — neon, may need hue shift | https://videos.pexels.com/video-files/34342111/14549054_1920_1080_30fps.mp4 | Pexels | 1920×1080 · 10 s · 25.4 MB | NOT CHECKED | none |
| 6.5 | Pixabay 370048 "Topographic map contour lines" (Ceos_Stock, 2026-08) | https://cdn.pixabay.com/video/2026/08/11/370048_large.mp4 | Pixabay | 3840×2160 · 10 s · 16.6 MB | NOT CHECKED | none |
| 6.6 | Pixabay 123735 "Bokeh lights particles" (Project-Unknown, 2022) | https://cdn.pixabay.com/video/2022/07/10/123735-728698148_large.mp4 | Pixabay | 3840×2160 · 8 s · 19.0 MB | NOT CHECKED | none |
| 6.7 | Pixabay 5189 "Particle lines abstract lights" (tommyvideo, 2016) | https://cdn.pixabay.com/video/2016/09/13/5189-183786475_large.mp4 | Pixabay | 1920×1080 · 29 s · 16.3 MB | NOT CHECKED | none |
| 6.8 | Pexels 7168423 "Blurred city lights" (Tima Miroshnichenko, 2021) | https://videos.pexels.com/video-files/7168423/7168423-uhd_2560_1440_25fps.mp4 | Pexels | 2560×1440 · 15 s · 6.0 MB | NOT CHECKED | none |
| 6.9 | Pexels 6615523 "Blue plans" (Tima Miroshnichenko, 2021) — real blueprint footage | https://videos.pexels.com/video-files/6615523/6615523-uhd_2560_1440_25fps.mp4 | Pexels | 2560×1440 · 10 s · size not checked (URL pattern, not fetched) | NOT CHECKED. Blue-toned; needs grading to cyan | none |

Loop seams: none of these were checked for seamless looping. Cross-fade in the app or pick by eye.

---

## A. Islamic occasions in the browser

### A.1 Method (VERIFIED in Node 26 / ICU; browsers FROM MEMORY)
`Intl.DateTimeFormat` with the `islamic-umalqura` calendar is supported in current Chrome, Safari and Firefox (FROM MEMORY; test in the owner's browser). Use `-nu-latn` so digits are Latin. Compute Hijri parts from today's date; do not invert Hijri to Gregorian.
```js
const HF = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn',
  { year:'numeric', month:'numeric', day:'numeric', timeZone:'Asia/Riyadh' });
function hijri(date = new Date()) {
  const o = {}; HF.formatToParts(date).forEach(p => o[p.type] = +p.value);
  return { y:o.year, m:o.month, d:o.day };   // today 2026-11-20 -> {1448, 6, 10}
}
function occasion(h) {
  const {m,d} = h;
  if (m===9)  return d>=21 ? 'ramadan-last-ten' : 'ramadan';
  if (m===10 && d<=3)  return 'eid-fitr';
  if (m===12 && d>=8 && d<=13) return d===9 ? 'arafah' : d===10 ? 'eid-adha' : d===8 ? 'tarwiyah' : 'tashreeq';
  if (m===12 && d<=7)  return 'dhul-hijjah-first-days';
  if (m===1 && d===1)  return 'hijri-new-year';
  if (m===1 && d===10) return 'ashura';
  if (m===3 && d===12) return 'mawlid';
  return null;
}
```
Gregorian fixed days: Saudi National Day **23 Sep**, Saudi Founding Day **22 Feb**, Egypt Revolution Day **23 Jul**, Armed Forces Day **6 Oct**, Sinai Liberation Day **25 Apr** (all FROM MEMORY; use plain `getMonth()/getDate()`).

### A.2 One-day uncertainty
`islamic-umalqura` is the Saudi Umm al-Qura **calculated** calendar, not moon sighting. Real month starts follow sighting (Egypt's Dar al-Ifta; Saudi Supreme Court announcements for Ramadan, Shawwal, Dhul-Hijjah). Expect ±1 day. In my run `islamic-civil` was one day later than umalqura for several dates (e.g. today: civil 1448-06-09 vs umalqura 1448-06-10) — a measure of the spread. Hijri day also begins at sunset, while `Intl` switches at local midnight. Design: show the occasion for a **window** (date −1 … +1) and never label it with a hard date. Re-check against the official announcement before the real day (ramadan start).

### A.3 Upcoming dates by umalqura (computed in Node; Gregorian). Civil/tabular in brackets where different.
| Occasion (Hijri) | AH 1448 | AH 1449 |
|---|---|---|
| Islamic New Year (1 Muharram) | 2026-06-16 (civil 06-17) | 2027-06-06 |
| Ashura (10 Muharram) | 2026-06-25 (06-26) | 2027-06-15 |
| Mawlid (12 Rabi' I) | 2026-08-25 (08-26) | 2027-08-14 (08-15) |
| **Ramadan start (1 Ramadan)** | **2027-02-08** | 2028-01-28 |
| **Eid al-Fitr (1 Shawwal)** | **2027-03-09** (03-10) | 2028-02-26 (02-27) |
| Hajj 8 Dhul-Hijjah (Tarwiyah) | 2027-05-14 (05-15) | 2028-05-03 |
| Hajj 9 (Arafah) | 2027-05-15 (05-16) | 2028-05-04 |
| **Eid al-Adha (10)** | **2027-05-16** (05-17) | 2028-05-05 |
| Hajj 11 / 12 / 13 (Tashreeq) | 2027-05-17 / 05-18 / 05-19 | 2028-05-06 / 05-07 / 05-08 |
AH 1450 for reference: Muharram 1 = 2028-05-25, Ramadan 1 = 2029-01-16, Eid al-Fitr 2029-02-14, Eid al-Adha 2029-04-24.
Today (2026-11-20) is 10 Jumada II 1448: no occasion is active. Next: **Ramadan 1448 (~8 Feb 2027)**, so Ramadan content is next in ~80 days.
Mawlid and Ashura are not public holidays in Saudi Arabia (FROM MEMORY); Mawlid is an Egyptian public holiday. Treat Mawlid as optional.

## B. Open-source UI pieces (licences from npm registry `license` field and GitHub LICENSE files read today)
| Item | Licence | Size (npm unpacked, whole package) | Use here |
|---|---|---|---|
| Lucide icons (lucide, v1.77.0) | **ISC** (LICENSE read at https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE; the file is longer than a bare ISC text — probably carries an extra Feather MIT notice, not fully read) | 24.7 MB package; one SVG ≈ <1 KB (FROM MEMORY); inline only needed icons | Default set |
| Tabler Icons (@tabler/icons 3.52.0) | **MIT** (GitHub LICENSE read) | 12.1 MB, ~5,000+ icons | Alternative, huge range |
| Phosphor (@phosphor-icons/core 2.1.1) | **MIT** (read) | 6.5 MB, 6 weights | Duotone/gold look |
| Material Symbols (material-symbols 0.49) | **Apache-2.0** (read) — keep licence/NOTICE in the repo | 13.1 MB | Only if variable-font style wanted |
| SVG Spinners (n3r4zzurr0) | **MIT** (read) | 0.06 MB | Loading spinners (SMIL animated SVG) |
| SpinKit 2.0.1 | **MIT** (npm) | 0.04 MB | CSS spinners |
| Lottie playback: lottie-web 5.13 / @lottiefiles/dotlottie-web 0.83 | MIT (npm) | 25 MB package (≈300 KB min bundle FROM MEMORY) / 7 MB | Only if Lottie JSONs are used |
| LottieFiles animations | **Lottie Simple License FL 9.13.21** (read): free incl. commercial use, modify, publish. Attribution **optional**. Modified files must carry the same licence. Cannot be used to build a competing animation library. Check each animation page: some assets are Premium or have other terms. | JSON usually 5–100 KB | Loaders, check marks, tab open/close |
| Open Props (1.7.23) | **MIT** (npm) | 1.3 MB (CSS custom properties) | Spacing/easing/shadow tokens |
| Radix Colors 3.0 | **MIT** (npm) | 0.6 MB | Dark scales (amber, gold/yellow, cyan) |
| Style Dictionary 5.8 | **Apache-2.0** (npm) | build tool only | Tokens → CSS vars, if a token pipeline is wanted |
| Motion (motion 14.14) | MIT (npm) | 1.0 MB | Not needed — use CSS/WAAPI |
| @formkit/auto-animate | MIT (npm) | 60 KB | Tab add/remove list animation |
| GSAP 3.15 | custom "no charge" licence (npm field only; text not read) | 6.3 MB | Avoid; licence is not OSI |

Specific Lottie file URLs were **not** collected (LottieFiles downloads need an account page-by-page); pick them in the owner's session and read each asset's licence line.
Tab open/close motion: no library needed. Use CSS `grid-template-rows: 0fr→1fr` + `opacity/transform` with `transition`, or the native View Transitions API (FROM MEMORY). Honour `prefers-reduced-motion`.
Suggested tokens (own choice, not from a library): `--bg:#05060a; --gold:#d4a84b; --amber:#ffb000; --cyan:#35e0ff; --ink:#e8e2d0;`. Generate scales with Radix `gold`/`amber`/`cyan` as reference.

## C. Rotation scheme (recommendation)
1. **Daily seed:** `seed = hash("YYYY-MM-DD" + salt)` → small deterministic PRNG (e.g. mulberry32). Same day gives the same lineup on every device; no server.
2. **Pools** per tag: `haram`, `nabawi`, `hajj`, `ramadan`, `eid`, `egypt`, `saudi`, `abstract`, `city`. Tags are fixed in a JSON manifest (id, file, tag, licence, credit text, mood, poster).
3. **Hero card (centre)** = first match in this priority: active Hijri occasion (A.1) → Gregorian national day (±1 day) → daily-seed pick from `haram/nabawi`. Occasion tag map: Ramadan → `ramadan`; last ten nights → `ramadan` + `haram`; Eid → `eid`; Hajj days 8–13 → `hajj` + `haram`; Mawlid/New Year → `nabawi`; 23 Sep → `saudi`; 23 Jul / 6 Oct → `egypt`. Show an occasion badge only inside the ±1-day window.
4. **Other cards:** pick one each from different pools by seed, never the same tag twice in a row, never the hero's tag. At least one `abstract` card so the set stays coherent in gold/amber/cyan.
5. **Coherence:** apply one CSS grade over every video (black overlay + duotone/`mix-blend-mode`) so mixed stock reads as one look. Lottie/SVG overlays in the same three colours.
6. **Budget:** re-encode (later, after approval) to ≤1080p, 24–30 fps, 3–6 MB per loop; WebM + MP4; poster frame for each; preload only the hero; reduced-motion shows the poster. Keep a licence manifest in the repo and render credits (Commons CC BY) in an "About/Credits" screen.
7. **Safety rules:** no faces close-up, no brand/sponsor visuals, owner watches each clip once (watermark/loop/dome in frame) before it enters the manifest.

## D. Ranked shortlist: 12 assets to download first (owner approval needed — nothing downloaded yet)
| Rank | Asset | Pool | Why | Size |
|---|---|---|---|---|
| 1 | Pexels 31281542 Evening at an-Nabawi — https://videos.pexels.com/video-files/31281542/13358269_2560_1440_60fps.mp4 | nabawi | Sharp 1440p, dusk, no attribution | 28.4 MB |
| 2 | Pexels 35743721 Grand Mosque Mecca at night — https://videos.pexels.com/video-files/35743721/15151110_1920_1080_30fps.mp4 | haram | 1080p, 26 s long, light | 8.2 MB |
| 3 | Pixabay 198164 Madina night — https://cdn.pixabay.com/video/2024/01/26/198164-906869460_large.mp4 | nabawi | Likely shows the Green Dome (check) | 34.2 MB |
| 4 | Pexels 38255869 Tawaf at Masjid al-Haram — https://videos.pexels.com/video-files/38255869/16243374_2560_1440_60fps.mp4 | hajj/haram | Hajj hero candidate | 16.4 MB |
| 5 | Pixabay 200850 Ramadan lantern + incense — https://cdn.pixabay.com/video/2024/02/17/200850-914033010_large.mp4 | ramadan | Warm amber, lantern | 9.4 MB |
| 6 | Pixabay 113621 Crescent moon & star — https://cdn.pixabay.com/video/2022/04/11/113621-698448438_large.mp4 | ramadan/eid | Moon-sighting motif | 7.5 MB |
| 7 | Pexels 34645258 Golden particle lines — https://videos.pexels.com/video-files/34645258/14683978_2560_1440_30fps.mp4 | abstract | Gold on black (verify not AI-fussy) | 30.2 MB |
| 8 | Pexels 7501212 Muhammad Ali Mosque, Cairo — https://videos.pexels.com/video-files/7501212/7501212-hd_1920_1080_24fps.mp4 | egypt | Landmark, 1080p | 18.3 MB |
| 9 | Pexels 18819906 AlUla old town — https://videos.pexels.com/video-files/18819906/18819906-uhd_2560_1440_30fps.mp4 | saudi | Amber desert tones | 23.0 MB |
| 10 | Commons Tawaf Ifadha 2016 (CC BY 3.0, credit "Amm Salim") — https://upload.wikimedia.org/wikipedia/commons/3/30/Tawaf_Ifadha_2016_with_Amm_Salim.webm | hajj | Real Hajj tawaf; needs credit line | 25.7 MB |
| 11 | Pixabay 370048 Topographic contour lines — https://cdn.pixabay.com/video/2026/08/11/370048_large.mp4 | abstract | Matches topographic idea; colour unverified | 16.6 MB |
| 12 | Pexels 36587192 Ramadan iftar table — https://videos.pexels.com/video-files/36587192/15511644_2560_1440_25fps.mp4 | ramadan | Tiny file, iftar scene | 4.4 MB |
Total ≈ 222 MB raw (before re-encode).
Runners-up if any fail the watch test: Pexels 36231487 (illuminated mosque), Pexels 32537704 (Giza), Pixabay 205172 (Ramadan 4K), Pexels 7168423 (city lights, 6 MB), Commons Giza 3D flyover (CC0, 2.5 MB).
Also needed later and not found: Arafat/Mina/Muzdalifah footage, Egyptian National Day and Saudi National Day scenes, Lottie loader files.

## E. What was NOT checked
- No video was opened or downloaded: watermark, logo, loop seam, actual content (Green Dome in frame, people close-ups) are unchecked for every row.
- Pixabay full licence text (only the official summary page); Pexels/Pixabay per-clip licence is the site-wide one.
- Browser support of `islamic-umalqura` was not tested in Chrome/Safari/Firefox (tested in Node 26 only).
- Commons search is fuzzy; absent hits (Nabawi, Arafat, Riyadh skyline) may exist under other file names.
