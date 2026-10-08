# Changelog

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
