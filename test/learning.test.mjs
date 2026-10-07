import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  comparePrograms,
  buildStudyPlan,
  getInterviewPractice,
  getDramaPractice,
  lookupKoreanTerm,
  getTopikQuiz,
  startDiagnostic,
  getRealWorldScenario,
  getWritingTask,
  getTopikExamMode,
  buildDailySession,
} from "../lib/learning.mjs";

test("media marketing comparison ranks CAU ADPR first", () => {
  const data = comparePrograms({ degree: "master", focus: "media marketing advertising PR" });
  assert.equal(data.ui_type, "compare");
  assert.equal(data.items[0].id, "cau-adpr");
  assert.equal(data.recommendation, "cau-adpr");
});

test("research comparison ranks SNU first", () => {
  const data = comparePrograms({ degree: "phd", focus: "communication research platform international" });
  assert.equal(data.items[0].id, "snu-communication");
  assert.match(data.degree, /博士/);
});

test("study plan clamps unsafe numeric inputs", () => {
  const data = buildStudyPlan({ degree: "master", months: 99, hours_per_week: 0, topik_target: 9 });
  assert.equal(data.months, 24);
  assert.equal(data.hours_per_week, 2);
  assert.equal(data.topik_target, 6);
  assert.equal(data.estimated_hours, data.weeks * 2);
});

test("interview next index stays inside degree pool", () => {
  const data = getInterviewPractice({ degree: "master", index: 999 });
  assert.equal(data.ui_type, "interview");
  assert.ok(data.question_ko.length > 3);
  assert.ok(data.next_index >= 0 && data.next_index < 8);
});

test("drama practice uses official clip link but original/adapted practice", () => {
  const data = getDramaPractice({ theme: "translation" });
  assert.equal(data.ui_type, "drama");
  assert.match(data.clip.url, /^https:\/\/www\.youtube\.com\/watch\?/);
  assert.ok(data.clip.practice.length >= 2);
  assert.match(data.copyright_note, /不托管/);
});

test("known vocabulary returns bilingual card", () => {
  const data = lookupKoreanTerm({ term: "설득커뮤니케이션" });
  assert.equal(data.zh, "说服传播");
  assert.equal(data.en, "persuasive communication");
});

test("unknown vocabulary is honest and does not fabricate a definition", () => {
  const data = lookupKoreanTerm({ term: "없는전문용어" });
  assert.equal(data.zh, "课程词典暂未收录");
});

test("TOPIK quiz returns answer index inside options", () => {
  const data = getTopikQuiz({ level: 5, index: 2 });
  assert.ok(data.answer >= 0 && data.answer < data.options.length);
});

test("diagnostic covers receptive and productive skills without claiming official score", () => {
  const data = startDiagnostic({ degree: "master", target_level: 5 });
  assert.equal(data.ui_type, "diagnostic");
  assert.ok(data.objective.some(q => q.skill === "listening"));
  assert.ok(data.objective.some(q => q.skill === "reading"));
  assert.ok(data.writing.prompt.length > 20);
  assert.ok(data.speaking.prompt.length > 20);
  assert.match(data.note, /不是官方 TOPIK/);
});

test("real-world scenario has role, consequence-oriented goal, and natural opening", () => {
  const data = getRealWorldScenario({ scenario: "agency-client", level: 5 });
  assert.equal(data.ui_type, "conversation");
  assert.match(data.role, /AI/);
  assert.ok(data.opening.length > 5);
  assert.ok(data.feedback_criteria.length >= 4);
});

test("TOPIK PBT writing uses official 54-style 600–700 character target and rubric dimensions", () => {
  const data = getWritingTask({ kind: "topik54_pbt", level: 5 });
  assert.equal(data.target_chars, "600–700자");
  assert.equal(data.rubric[0][0], "内容及任务完成");
  assert.equal(data.rubric[1][0], "文章展开结构");
  assert.equal(data.rubric[2][0], "语言使用");
  assert.equal(data.rubric.reduce((sum,r)=>sum+r[1],0), 50);
});

test("TOPIK exam mode exposes current format and refuses fake official score semantics", () => {
  const pbt = getTopikExamMode({ format: "topik2_pbt", target_level: 5 });
  assert.equal(pbt.official_format.sections[0][1], 50);
  assert.equal(pbt.official_format.sections[2][1], 4);
  assert.equal(pbt.target_score, 190);
  assert.match(pbt.training_rule, /不要把.*官方 TOPIK 成绩/);
  const ibt = getTopikExamMode({ format: "topik2_ibt", target_level: 6 });
  assert.equal(ibt.official_format.total, 600);
  assert.equal(ibt.target_score, 431);
});

test("daily session contains retrieval, input/output, and exam practice", () => {
  const data = buildDailySession({ degree: "master", minutes: 45, topik_target: 5, weak_skill: "speaking" });
  assert.equal(data.ui_type, "session");
  assert.equal(data.blocks.reduce((sum,b)=>sum+b.minutes,0), 45);
  assert.ok(data.blocks.some(b=>b.kind==="retrieval"));
  assert.ok(data.blocks.some(b=>b.kind==="conversation"));
  assert.ok(data.blocks.some(b=>b.kind==="exam"));
});

test("widget implements MCP Apps bridge, model follow-up, speech input, and productive practice", () => {
  const html = readFileSync(new URL("../public/smart-learning.html", import.meta.url), "utf8");
  assert.match(html, /ui\/initialize/);
  assert.match(html, /ui\/notifications\/tool-result/);
  assert.match(html, /tools\/call/);
  assert.match(html, /ui\/message/);
  assert.match(html, /SpeechRecognition/);
  assert.match(html, /renderDiagnostic/);
  assert.match(html, /renderConversation/);
  assert.match(html, /renderWriting/);
  assert.match(html, /renderExam/);
  assert.match(html, /renderSession/);
  assert.match(html, /requestDisplayMode/);
  assert.match(html, /speechSynthesis/);
  assert.match(html, /openExternal/);
});

test("public learner UI and Skill are generic and preserve honest learning limits", () => {
  const site = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const widget = readFileSync(new URL("../public/smart-learning.html", import.meta.url), "utf8");
  const skill = readFileSync(new URL("../skills/korea-media-korean/SKILL.md", import.meta.url), "utf8");
  const router = readFileSync(new URL("../assets/app-v3.js", import.meta.url), "utf8");
  assert.match(site, /assets\/app-v3\.js/);
  assert.match(site, /assets\/app-v3\.css/);
  assert.match(site, /id="v3-query"/);
  assert.match(site, /id="v3-studio"/);
  assert.doesNotMatch(site, /Zachary 的|给 Zachary 的|为 Zachary 定制/);
  assert.doesNotMatch(widget, /Zachary|Zack/);
  assert.doesNotMatch(skill, /The learner is \*\*Zachary\*\*/);
  assert.match(skill, /public learning product/i);
  assert.match(router, /不(?:会假装|自动给写作打 AI 分数)/);
  assert.match(router, /zacharyKoreanDone/); // Backward-compatible local progress key.
});

test("school comparison uses learner-neutral course fit notes", () => {
  const result = comparePrograms({ degree: "master", focus: "advertising" });
  assert.ok(result.items.every(x => x.fit_note && !Object.hasOwn(x,"zachary")));
  assert.equal(result.items[0].id,"cau-adpr");
});
