import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const endpoint = process.env.MCP_URL || "http://127.0.0.1:8787/mcp";
const client = new Client({ name: "korea-media-korean-smoke", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(new URL(endpoint));
await client.connect(transport);

const tools = await client.listTools();
const names = tools.tools.map(t => t.name);
const required = [
  "compare_programs",
  "build_study_plan",
  "practice_interview",
  "practice_drama_shadowing",
  "look_up_korean_term",
  "practice_topik_quiz",
  "start_korean_diagnostic",
  "practice_real_world_korean",
  "practice_korean_writing",
  "open_topik_exam_mode",
  "build_daily_korean_session",
  "get_course_url",
];
for (const name of required) {
  if (!names.includes(name)) throw new Error("missing tool: " + name);
}

for (const name of required.filter(n => n !== "get_course_url")) {
  const t = tools.tools.find(x => x.name === name);
  if (t?._meta?.ui?.resourceUri !== "ui://korean-learning/smart-v1.html") {
    throw new Error(name + " missing UI resource metadata");
  }
}

const compare = await client.callTool({
  name: "compare_programs",
  arguments: { degree: "master", focus: "media marketing advertising PR" },
});
if (compare.structuredContent?.recommendation !== "cau-adpr") throw new Error("unexpected recommendation");

const diagnostic = await client.callTool({
  name: "start_korean_diagnostic",
  arguments: { degree: "master", target_level: 5 },
});
if (diagnostic.structuredContent?.ui_type !== "diagnostic") throw new Error("diagnostic missing");
if (!diagnostic.structuredContent?.writing?.prompt) throw new Error("diagnostic writing missing");

const conversation = await client.callTool({
  name: "practice_real_world_korean",
  arguments: { scenario: "agency-client", level: 5 },
});
if (conversation.structuredContent?.ui_type !== "conversation") throw new Error("conversation missing");

const writing = await client.callTool({
  name: "practice_korean_writing",
  arguments: { kind: "topik54_pbt", level: 5 },
});
if (writing.structuredContent?.target_chars !== "600–700자") throw new Error("writing target mismatch");

const exam = await client.callTool({
  name: "open_topik_exam_mode",
  arguments: { format: "topik2_pbt", target_level: 5 },
});
if (exam.structuredContent?.target_score !== 190) throw new Error("TOPIK threshold mismatch");

const session = await client.callTool({
  name: "build_daily_korean_session",
  arguments: { degree: "master", minutes: 45, topik_target: 5, weak_skill: "speaking" },
});
if (session.structuredContent?.blocks?.reduce((s,b)=>s+b.minutes,0) !== 45) throw new Error("session minutes mismatch");

const resource = await client.readResource({ uri: "ui://korean-learning/smart-v1.html" });
const ui = resource.contents?.[0];
if (!ui?.text?.includes("ui/initialize")) throw new Error("widget bridge missing");
if (!ui?.text?.includes("ui/message")) throw new Error("widget model follow-up missing");
if (!ui?.text?.includes("renderWriting")) throw new Error("writing UI missing");
if (ui?.mimeType !== "text/html;profile=mcp-app") throw new Error("widget MIME mismatch");

console.log(JSON.stringify({
  ok: true,
  endpoint,
  toolCount: names.length,
  tools: names,
  compareRecommendation: compare.structuredContent.recommendation,
  diagnostic: diagnostic.structuredContent.title,
  conversation: conversation.structuredContent.title,
  writing: writing.structuredContent.title,
  examTarget: exam.structuredContent.target_score,
  dailyMinutes: session.structuredContent.minutes,
  resourceMime: ui.mimeType,
}, null, 2));

await client.close();
