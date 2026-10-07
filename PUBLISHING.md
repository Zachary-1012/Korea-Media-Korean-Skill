# Publishing Korean Media Study

## Already deployed

- Public 48-lesson site: https://zachary-1012.github.io/Korea-Media-Korean-Skill/
- Production MCP endpoint: https://korea-media-korean-mcp-production.up.railway.app/mcp
- Source and license: https://github.com/Zachary-1012/Korea-Media-Korean-Skill
- Figma editable Smart UI: https://www.figma.com/design/MeSjqKj6w2VHkGia3w4LEt

## Public ChatGPT / Codex directory

Official submission reference:
https://developers.openai.com/plugins/deploy/submission

1. In ChatGPT Plugins, choose Upload new or existing plugin.
2. Select your VERIFIED developer identity (individual or business).
3. Upload the latest release ZIP from the GitHub Release, keeping the `plugin.json` and `mcp.json` at ZIP root.
4. If the portal gives a domain-verification token, configure the dedicated Railway service variable `OPENAI_APPS_CHALLENGE` to that exact token and verify the endpoint in the portal. Never put the token into GitHub or this document.
5. Run Scan Tools and check all 12 tools, read-only annotations and UI.
6. Check review materials, 5 positive and 3 negative tests, legal links, screenshots and the video. Replace the technical simulator video with a real ChatGPT walkthrough if the reviewer requires that.
7. Submit for review. Once OpenAI approves, the verified publisher presses Publish. No assistant can bypass OpenAI's independent approval.

The public GitHub Pages site remains available independently even before plugin-directory approval. Connecting a custom MCP server inside ChatGPT is a separate user-authorized action.

## Updates

1. Test the independent learning repository only (do not touch LUMENIS/序境).
2. Merge/push changes to main. Railway deploys from main.
3. Re-test public `/healthz`, MCP tool calls, UI resource and browser workflows.
4. Public plugin metadata/skills changed → upload a new ZIP. Server-only tool changes → follow OpenAI's tool rescan/approval instructions.

## Costs

Railway hosts the public Node service under the publisher's Railway account. This is NOT a claim of a permanently free service: Railway's usage, quotas and any billing plan must be checked in the Railway dashboard. The learning tools do not call a paid external AI API themselves; ChatGPT-provided feedback is subject to the user's own ChatGPT access.

## Limits

No grade guarantee, no university admission guarantee. No persistent account-level mastery database or cross-device sync in v1. The browser SpeechRecognition availability differs by host and device.
