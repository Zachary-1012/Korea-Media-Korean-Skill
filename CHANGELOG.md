# Changelog

## v1.4.1 — Official dictionary live lookup with a private backend key

- Added a bounded read-only dictionary proxy to the existing Korean Media Study Railway MCP service. The credential stays in private service environment `KRDICT_API_KEY`, never GitHub Pages or the repository.
- Parses official XML search results for Korean words, Chinese translations, pronunciation text, part of speech and links, without copying the official dictionary in bulk.
- Frontend official search is separate from the 4,704-word attributed CC BY community dictionary. Learners can save official words to their existing personal spaced repetition flow.
- Added request validation, fixed official upstream, rate limits, upstream timeout/size safeguards, controlled browser origin and safe error responses. No new paid services.
- Added fake-key XML/provider tests and real browser search → save → recall → persistent source tests. Live provider authorization is verified separately from simulations.

## v1.4.0 — Noncommercial vocabulary and Korean etiquette

- Public learning positioning remains **free and non-commercial**; product copyright and external content licensing remain distinct.
- Adds a CC BY 4.0 attributed, independently collected 5,000-row community dataset, resulting in 4,704 distinct Korean headwords after filtering and duplicates. Chinese glosses converted to Simplified Chinese via MIT/Apache-licensed OpenCC-JS. Some source meanings remain English and are explicitly shown. Example quality not certified.
- Adds an expanded wordbook with Korean/Chinese search, page browsing, user-selected vocabulary, typed recall and interval scheduling; saved in browser localStorage.
- Adds 18 original Korean etiquette scenarios: speech levels, respectful titles, introductions, dining, handing objects, declining drinks, visiting homes, workplace messaging, disagreement and boundaries. Each includes a bounded choice, explanation, and learner's own Korean response.
- National Institute of Korean Language's official Korean-Chinese learner dictionary remains an external source. No authentication key has been proven available; the full official lexicon is not replicated or falsely claimed integrated.
- Browser and source QA audit each authored lesson independently; scripted simulations are not human learning outcomes and must never be labeled as such.
- Third-party license/source manifest: NONCOMMERCIAL-SOURCES.md. No third-party protected audio, drama scripts, or multimedia are imported.

## v1.3.0 — 学习结果闭环（Web Education Evidence）

以实际教育证据代替刷完课程：用户能从首页进入「诊断 / 复测 / 反馈」，学习系统根据正确、错误、记忆保持及用户录入的真实反馈推荐下一件学习任务。

- **起点诊断**：A0/A1/A2/B1/B2 五组循序阅读与听力理解题，分数只推荐课程起点，不冒充 CEFR 或 TOPIK 官方证书。设备无法真正播放韩语时，可用文本替代，但听力证据明确标为未验证。
- **阶段分项验证**：每一级都有不同的限定阅读、听辨、听写、情境迁移题。答题后才公布解释；听写计算归一化文本相似度，迁移题只校验已声明的关键语义词，不冒充语法和口语自动评分。
- **24 小时保持证据**：首次客观部分通过必须隔至少一天才进入另一组听写与迁移任务。当天复刷不能提前写入 retained 状态，时间以浏览器本机数据记录，仅作个人学习参考。
- **针对错题补练**：系统从阶段错误题目定位相关生活课程，优先安排复习；与已有 52 个生活单元的词卡间隔重复、实景多轮回答衔接。
- **具体纠错、重写与再复习**：用户可以把来自老师、同伴或自评的意见留成纠错任务，独立重写、避免直接照抄，并按隔天、3 天、7 天等节点再练；仅记录用户自行录入的评价，不假装平台核验教师身份、真实发音或交流水平。
- **学习证据管理**：包含诊断、错题、复测、修改记录、可选语音行为提示的本地学习日志；导出/恢复 JSON、可选择是否把私人旧版草稿纳入备份、清理本次本地数据。
- **移动端与兼容性**：公开站 `#/coach`；保留 `#/journey` 52 单元、48 节原有课程及原 TOPIK/对话/写作功能，无新付费 AI API、无用户账号与新的数据库服务。
- **分层事实**：MCP 远端既有插件服务、原有 ChatGPT 公共目录审核与独立网页版并非同一发布流程；本次升级仅面向现有 GitHub Pages，不虚报第三方审核、外部教师认证或长期用户学习效果。

技术证据路径：`lib/learning-assessments.mjs`、`lib/learning-evidence.mjs`、`assets/education-coach.js`、`assets/education-coach.css`、`test/learning-evidence.test.mjs`、`test/education-closure-browser.mjs`。

设计依据：Council of Europe CEFR 限定任务与多能力维度（https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors）；Duolingo 公开的间隔复习与个性化纠错说明（https://blog.duolingo.com/spaced-repetition-for-learning/）；韩国国立国语院官方韩中学习词典（https://krdict.korean.go.kr/chn/mainAction）。不复用其他产品品牌、课程、商标或音轨。

## v1.2.0 — Real-life Korean, from Hangul to extended conversation (web)

- Added a general-audience five-stage practice path: A0, A1, A2, B1, and B2-oriented challenges, authored as 52 progressive units.
- Added 798 distinct Korean-Chinese everyday vocabulary entries, contextual dialogues, learning objectives, task prompts, and Hangul sound drills. The original 48 courses and professional/TOPIK features are preserved.
- Replaced passive mark-complete behavior in the new path with five answer-first recall checks, correct/incorrect feedback, deterministic spaced repetition and recorded learner practice attempts.
- Added real three-turn role-play practice; the B210 capstone requires five separate replies. Advanced modules reject repeated or unreasonably short responses but do **not** pretend to evaluate grammar/fluency automatically.
- Added optional browser Korean TTS, speech transcription (with consent and vendor privacy notice), and self-recording/playback; audio quality and voice availability vary by device.
- Added responsive mobile/desktop practice screens, visible daily follow-up and searchable everyday glossary with link to the National Institute of Korean Language's independently operated Korean-Chinese dictionary.
- Moved academic degree preferences to the school-specific area so ordinary learners start with everyday Korean.
- Learner state and user-entered practice responses are stored only in local browser storage, without cross-device account sync.
- No new paid AI API, no fictional pronunciation score, no guaranteed CEFR/TOPIK result; B2 labels describe course topics, not certified outcomes.
- No video assets were rebuilt in this product release. Video V3 is intentionally held for product-owner review of the upgraded site.

### Evidence and scope

- Source: `lib/real-life-curriculum.mjs`, `lib/b2-curriculum.mjs`, `lib/real-life-study.mjs`.
- Browser UI: `assets/real-life-path.js`, `assets/real-life-path.css`.
- QA: `npm run check`, `node test/real-life-browser.mjs`, `npm run test:browser` as available, plus public Pages source/output verification.
- Learning-design inspiration: official Duolingo public methodology on retrieval, spaced practice and task-based feedback (no copying of proprietary curriculum or visual assets).
- Real-world language proficiency is not verified by automated scripted test execution or self-assessed completion.

## v1.1.0 — Learning workspace first

- Replaced personal landing page with a general-audience task-first Korean learning workspace.
- Added adaptive *presentation selection* on the standalone site: TOPIK, real dialogue,
  writing, vocabulary and course routes. The site is deterministic, not an AI model.
- Preserved all 48 courses, 18 drama studies, 133 vocabulary cards and 64 phrases,
  plus existing local progress keys.
- Added real user-flow interactions: answer-first TOPIK practice, multi-turn scenario
  rehearsal, local writing drafts and deliberate feedback handoff.
- Added progressive disclosure, smaller mobile navigation, better accessibility and
  a compact Cue-inspired typography / ChatGPT-inspired calm UI system.
- Updated MCP UI semantics, error/loading feedback, neutral copy, and focus-based
  school comparison.
- Removed developer's personal name from learner-facing screens and skill instructions.
- Kept proprietary license, commercial authorization requirement and About legal info.
- No promotional video, marketing graphics or fake app screens shipped in this update.
- ChatGPT public directory submission/approval is separate from source/MCP deployment.

The older technical simulator video is intentionally not listed as the v1.1.0 demo.
A new review-grade real-host recording can be prepared separately when appropriate.
