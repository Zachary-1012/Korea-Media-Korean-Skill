# Plugin Review Handoff · v1.0.0

## Product

**Korean Media Study** is a Korean-learning MCP App for TOPIK, SNU/CAU admissions, real-world Korean conversation, writing feedback, and media/advertising/PR professional language.

No payment, account, credentials, or production data is required to use the 12 published read-only learning tools.

## Protocol and product evidence

- Production MCP: https://korea-media-korean-mcp-production.up.railway.app/mcp
- Public standalone course: https://zachary-1012.github.io/Korea-Media-Korean-Skill/
- UI resource: ui://korean-learning/smart-v1.html
- 12 tools detected and called through a real MCP client.
- Unit tests: npm run check.
- Browser interactive flow tests: npm run test:browser (uses a LOCAL MCP Apps host simulator with the real remote MCP backend; **not a substitute for a live ChatGPT test**).
- Desktop/mobile screenshots: assets/screenshot-{diagnostic,conversation,writing,mobile}.png.
- Technical demonstration video: assets/review/korean-smart-ui-technical-walkthrough.webm. This video is clearly labeled as a technical host simulator, not a recording inside ChatGPT.

## Initial reviewer cases

plugin.json includes exactly 5 positive cases and 3 negative cases.

Positive examples:
1. Korean listening/reading/writing/speaking diagnostic and targeted plan.
2. Real-world agency/client Korean dialogue.
3. TOPIK II essay writing and model-guided rewriting.
4. Official TOPIK exam-mode structure and practice routes.
5. SNU/CAU media, advertising and PR comparison.

Negative examples:
1. Does not log in or submit admissions applications.
2. Does not provide full copyrighted drama scripts or audio.
3. Does not guarantee TOPIK results or university admission.

## Annotation justifications

All 12 server tools declare:
- `readOnlyHint: true`: compute/retrieve static bounded learning prompts, plans, practice tasks and public course links; no user data is created/modified on the MCP server.
- `destructiveHint: false`: no deletion, overwriting, financial transaction, external posting or irreversible effect.
- `openWorldHint: false`: all tool behavior operates over the plugin's bounded built-in curriculum and learning catalog; no arbitrary web crawling, browsing or unbounded external destination.
- `idempotentHint: true`: same input returns equivalent task/plan data without side effects.

The **UI** may offer an official YouTube or TOPIK link as a user-click action, but the MCP tools themselves do not fetch these external sites.

The **UI** may send a user-initiated follow-up via the host's `ui/message` bridge for writing correction and role-play continuation. That changes the current ChatGPT conversation (under the host's own consent and privacy controls); it is not a server-side persistent write and is clearly labeled at the point of user action.

## UI microphone and privacy

- Server resource requests microphone permission using `_meta.ui.permissions.microphone`.
- Browser SpeechRecognition may use a browser or operating-system vendor's online speech recognition. The UI requests the learner's confirmation before using it.
- If microphone is unavailable/refused, typing still works.
- Ordinary TTS uses browser/device speech synthesis and may not be available offline on all devices.
- Speech transcription text does not prove pronunciation, oral fluency or official TOPIK Speaking ability.
- Full Korean drafts sent via `ui/message` are submitted intentionally to the active ChatGPT conversation for feedback, not stored in a personal database by this MCP service.

## Domain verification and developer steps

The service exposes `GET /.well-known/openai-apps-challenge`, returning the configured `OPENAI_APPS_CHALLENGE` token as exact plain text. The developer must get the exact challenge token from the authenticated Plugins submission portal and configure it in the dedicated Railway service before pressing Verify Domain.

The developer must select their verified OpenAI developer identity, upload the ZIP, scan tools and accept policy attestations. Public directory approval and publication are controlled by OpenAI and the verified publisher. The technical walkthrough is a simulator and **does not replace the reviewer's request for a real ChatGPT demonstration**.

## License

Public access for personal learning; **all source, UI, MCP, Skill and original content rights reserved**. Copying, modification, redistribution, rehosting, white-label use, institutional/commercial use and derivative products require prior written authorization from Zachary.

See LICENSE and COMMERCIAL-LICENSE.md.
