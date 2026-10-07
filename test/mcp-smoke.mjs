import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({ name: "korea-media-korean-smoke", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(new URL("http://127.0.0.1:8787/mcp"));
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
  "get_course_url",
];
for (const name of required) {
  if (!names.includes(name)) throw new Error("missing tool: " + name);
}

const compareTool = tools.tools.find(t => t.name === "compare_programs");
if (compareTool?._meta?.ui?.resourceUri !== "ui://korean-learning/smart-v1.html") {
  throw new Error("compare_programs missing UI resource metadata");
}

const compare = await client.callTool({
  name: "compare_programs",
  arguments: { degree: "master", focus: "media marketing advertising PR" },
});
if (compare.structuredContent?.ui_type !== "compare") throw new Error("compare result missing ui_type");
if (compare.structuredContent?.recommendation !== "cau-adpr") throw new Error("unexpected recommendation");

const interview = await client.callTool({
  name: "practice_interview",
  arguments: { degree: "master", school: "CAU", major: "광고홍보학과", index: 0 },
});
if (!interview.structuredContent?.question_ko) throw new Error("interview question missing");

const vocab = await client.callTool({
  name: "look_up_korean_term",
  arguments: { term: "설득커뮤니케이션" },
});
if (vocab.structuredContent?.zh !== "说服传播") throw new Error("vocab mismatch");

const resource = await client.readResource({ uri: "ui://korean-learning/smart-v1.html" });
const content = resource.contents?.[0];
if (!content?.text?.includes("ui/initialize")) throw new Error("widget bridge missing");
if (content?.mimeType !== "text/html;profile=mcp-app") throw new Error("widget MIME mismatch");

console.log(JSON.stringify({
  ok: true,
  toolCount: names.length,
  tools: names,
  compareRecommendation: compare.structuredContent.recommendation,
  interviewQuestion: interview.structuredContent.question_ko,
  vocab: vocab.structuredContent,
  resourceMime: content.mimeType,
  resourceUri: compareTool._meta.ui.resourceUri,
}, null, 2));

await client.close();
