import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import {
  COURSE_URL,
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
} from "./lib/learning.mjs";

const widgetHtml = readFileSync("public/smart-learning.html", "utf8");
const UI_URI = "ui://korean-learning/smart-v1.html";
const port = Number(process.env.PORT || 8787);
const MCP_PATH = "/mcp";
const publicOrigin = String(process.env.PUBLIC_ORIGIN || "").replace(/\/+$/, "");
const challengeToken = process.env.OPENAI_APPS_CHALLENGE || "";

const noauth = [{ type: "noauth" }];
const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: true,
};

function resourceMeta() {
  const ui = {
    prefersBorder: false,
    permissions: {
      microphone: {},
    },
    csp: {
      connectDomains: [],
      resourceDomains: [],
      frameDomains: [],
    },
  };
  if (publicOrigin.startsWith("https://")) ui.domain = publicOrigin;
  return {
    ui,
    "openai/ui": { availableDisplayModes: ["inline", "fullscreen"] },
    "openai/widgetDescription":
      "Interactive Korean learning UI for SNU/CAU admissions, media/advertising Korean, TOPIK, interviews and drama shadowing.",
    "openai/widgetPrefersBorder": false,
    "openai/widgetCSP": {
      connect_domains: [],
      resource_domains: [],
      frame_domains: [],
      redirect_domains: [
        "https://zachary-1012.github.io",
        "https://www.youtube.com",
      ],
    },
    ...(publicOrigin.startsWith("https://")
      ? { "openai/widgetDomain": publicOrigin }
      : {}),
  };
}

function toolMeta(invoking, invoked) {
  return {
    securitySchemes: noauth,
    ui: { resourceUri: UI_URI },
    "openai/outputTemplate": UI_URI,
    "openai/toolInvocation/invoking": invoking,
    "openai/toolInvocation/invoked": invoked,
  };
}

function textResult(data, summary) {
  return {
    structuredContent: data,
    content: [{ type: "text", text: summary }],
  };
}

function createLearningServer() {
  const server = new McpServer(
    {
      name: "korea-media-korean",
      version: "1.0.0",
    },
    {
      instructions:
        "Use these tools for Zachary's Korean study and SNU/CAU media, advertising, marketing and PR admissions. Use interactive UI when comparison, planning, practice, quiz, shadowing or interview interaction helps. For a simple factual question that does not need interaction, answer concisely without forcing UI.",
    }
  );

  registerAppResource(
    server,
    "korean-smart-learning-ui",
    UI_URI,
    {},
    async () => ({
      contents: [
        {
          uri: UI_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: widgetHtml,
          _meta: resourceMeta(),
        },
      ],
    })
  );

  registerAppTool(
    server,
    "compare_programs",
    {
      title: "Compare SNU and CAU programs",
      description:
        "Compare SNU Communication, CAU Advertising & PR, and CAU Media & Communication for the selected degree level and study focus. Use when the user wants an interactive school/major comparison or fit analysis.",
      inputSchema: {
        degree: z.enum(["undergrad", "master", "phd"]).optional(),
        focus: z.string().min(1).max(120).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Comparing programs…", "Program comparison ready"),
    },
    async (args) => {
      const data = comparePrograms(args || {});
      return textResult(
        data,
        "Compared SNU and CAU routes for " + data.degree + ". Recommended first route: " + data.items[0].name + "."
      );
    }
  );

  registerAppTool(
    server,
    "build_study_plan",
    {
      title: "Build Korean study plan",
      description:
        "Build an adjustable Korean study plan for undergraduate, master's, or PhD admissions. Use when the user wants a visual plan by months, weekly hours, TOPIK target, or admissions level.",
      inputSchema: {
        degree: z.enum(["undergrad", "master", "phd"]).optional(),
        months: z.number().int().min(1).max(24).optional(),
        hours_per_week: z.number().int().min(2).max(40).optional(),
        topik_target: z.number().int().min(1).max(6).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Building study plan…", "Study plan ready"),
    },
    async (args) => {
      const data = buildStudyPlan(args || {});
      return textResult(
        data,
        data.degree_label + ": " + data.weeks + " weeks, about " + data.estimated_hours + " study hours, TOPIK target " + data.topik_target + "."
      );
    }
  );

  registerAppTool(
    server,
    "practice_interview",
    {
      title: "Practice Korean admissions interview",
      description:
        "Return one interactive Korean admissions interview question with Chinese meaning, answer structure, timer, self-check criteria, and the next question. Use for SNU/CAU undergraduate, master's, or PhD interview practice.",
      inputSchema: {
        degree: z.enum(["undergrad", "master", "phd"]).optional(),
        school: z.string().min(1).max(40).optional(),
        major: z.string().min(1).max(80).optional(),
        index: z.number().int().min(0).max(1000).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Preparing interview question…", "Interview question ready"),
    },
    async (args) => {
      const data = getInterviewPractice(args || {});
      return textResult(
        data,
        "Interview question: " + data.question_ko + " (" + data.question_zh + ")"
      );
    }
  );

  registerAppTool(
    server,
    "practice_drama_shadowing",
    {
      title: "Practice Korean drama shadowing",
      description:
        "Create a drama-based Korean shadowing exercise using an official public clip link plus original/adapted study lines. It does not host or reproduce full copyrighted drama audio or scripts.",
      inputSchema: {
        theme: z.enum(["translation", "platform", "story", "workplace"]).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Preparing shadowing exercise…", "Shadowing exercise ready"),
    },
    async (args) => {
      const data = getDramaPractice(args || {});
      return textResult(
        data,
        data.clip.title + " — " + data.clip.focus + ". Official clip: " + data.clip.url
      );
    }
  );

  registerAppTool(
    server,
    "look_up_korean_term",
    {
      title: "Look up a Korean media term",
      description:
        "Show a Korean media, advertising, marketing, PR, admissions, or research term as an interactive vocabulary card with Chinese and English explanations plus a Korean example sentence.",
      inputSchema: {
        term: z.string().min(1).max(80),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Looking up Korean term…", "Vocabulary card ready"),
    },
    async (args) => {
      const data = lookupKoreanTerm(args || {});
      return textResult(
        data,
        data.term + " = " + data.zh + " (" + data.en + "). " + data.example
      );
    }
  );

  registerAppTool(
    server,
    "practice_topik_quiz",
    {
      title: "Practice an interactive TOPIK question",
      description:
        "Return one interactive TOPIK-style Korean question with answer choices, explanation, and a next-question action. Use when the user wants short visual practice instead of a long explanation.",
      inputSchema: {
        level: z.number().int().min(1).max(6).optional(),
        index: z.number().int().min(0).max(1000).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Preparing TOPIK question…", "TOPIK question ready"),
    },
    async (args) => {
      const data = getTopikQuiz(args || {});
      return textResult(data, data.prompt);
    }
  );

  registerAppTool(
    server,
    "start_korean_diagnostic",
    {
      title: "Start a Korean ability diagnostic",
      description:
        "Start an interactive diagnostic across listening, reading, vocabulary/grammar, writing, speaking, and academic/media Korean. Use before building a serious study plan or when the learner wants to know current weaknesses. This is a learning diagnostic, not an official TOPIK score.",
      inputSchema: {
        degree: z.enum(["undergrad", "master", "phd"]).optional(),
        target_level: z.number().int().min(1).max(6).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Preparing Korean diagnostic…", "Diagnostic ready"),
    },
    async (args) => {
      const data = startDiagnostic(args || {});
      return textResult(
        data,
        "Started a learning diagnostic across listening, speaking, reading, writing, vocabulary/grammar, and academic/media Korean. It does not claim an official TOPIK level."
      );
    }
  );

  registerAppTool(
    server,
    "practice_real_world_korean",
    {
      title: "Practice real-world Korean conversation",
      description:
        "Open a realistic Korean role-play for university administration, professor office hours, graduate team projects, agency-client meetings, campaign pitches, or seminars. Use when the learner wants practical Korean conversation, not textbook dialogue.",
      inputSchema: {
        scenario: z.enum(["university-office","professor-meeting","team-project","agency-client","campaign-pitch","seminar"]).optional(),
        level: z.number().int().min(1).max(6).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Preparing real-world Korean…", "Role-play ready"),
    },
    async (args) => {
      const data = getRealWorldScenario(args || {});
      return textResult(data, data.title + ": " + data.context + " Opening line: " + data.opening);
    }
  );

  registerAppTool(
    server,
    "practice_korean_writing",
    {
      title: "Practice Korean writing",
      description:
        "Open a real writing task for TOPIK II, professor email, research-interest statement, or professional campaign brief. The widget lets the learner write and send the draft back to ChatGPT for rubric-based correction and rewriting.",
      inputSchema: {
        kind: z.enum(["topik54_pbt","topik_ibt","professor_email","research_interest","campaign_brief"]).optional(),
        level: z.number().int().min(1).max(6).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Preparing writing task…", "Writing task ready"),
    },
    async (args) => {
      const data = getWritingTask(args || {});
      return textResult(data, data.title + " — " + data.prompt);
    }
  );

  registerAppTool(
    server,
    "open_topik_exam_mode",
    {
      title: "Open TOPIK exam mode",
      description:
        "Show the current official TOPIK I/II PBT, TOPIK II IBT, or TOPIK Speaking structure and target-score threshold, then route the learner into appropriate practice. Training scores are never represented as official TOPIK results.",
      inputSchema: {
        format: z.enum(["topik1_pbt","topik2_pbt","topik2_ibt","speaking"]).optional(),
        target_level: z.number().int().min(1).max(6).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Opening TOPIK mode…", "TOPIK mode ready"),
    },
    async (args) => {
      const data = getTopikExamMode(args || {});
      return textResult(
        data,
        data.title + ". Target official threshold: " + (data.target_score ?? "not applicable") + " / " + data.official_format.total + "."
      );
    }
  );

  registerAppTool(
    server,
    "build_daily_korean_session",
    {
      title: "Build today's adaptive Korean session",
      description:
        "Build a focused daily Korean session that mixes retrieval, high-quality input, productive speaking/writing, and TOPIK practice. Use when the learner asks what to study today or wants training targeted at a weak skill.",
      inputSchema: {
        degree: z.enum(["undergrad", "master", "phd"]).optional(),
        minutes: z.number().int().min(20).max(120).optional(),
        topik_target: z.number().int().min(1).max(6).optional(),
        weak_skill: z.enum(["listening","speaking","reading","writing","vocab_grammar","academic_media"]).optional(),
      },
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: toolMeta("Building today's session…", "Today's session ready"),
    },
    async (args) => {
      const data = buildDailySession(args || {});
      return textResult(data, data.title + ": " + data.minutes + " minutes, focus on " + data.weak_skill + ".");
    }
  );

  server.registerTool(
    "get_course_url",
    {
      title: "Get the full Korean course URL",
      description:
        "Return the public GitHub Pages URL for the complete 48-lesson Korean course. Use when the user wants to open the standalone full course outside ChatGPT.",
      inputSchema: {},
      securitySchemes: noauth,
      annotations: readOnlyAnnotations,
      _meta: { securitySchemes: noauth },
    },
    async () => ({
      structuredContent: { course_url: COURSE_URL },
      content: [{ type: "text", text: COURSE_URL }],
    })
  );

  return server;
}

const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }
  const url = new URL(req.url, "http://" + (req.headers.host || "localhost"));

  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id, mcp-protocol-version",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/healthz")) {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: true,
      service: "korea-media-korean",
      version: "1.0.0",
      mcp: MCP_PATH,
      ui: UI_URI,
      course: COURSE_URL,
    }));
    return;
  }

  if (req.method === "GET" && url.pathname === "/.well-known/openai-apps-challenge") {
    if (!challengeToken) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("challenge not configured");
      return;
    }
    res.writeHead(200, { "content-type": "text/plain; charset=utf-8" }).end(challengeToken);
    return;
  }

  const methods = new Set(["POST", "GET", "DELETE"]);
  if (url.pathname === MCP_PATH && req.method && methods.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
    const server = createLearningServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("MCP request failed", error);
      if (!res.headersSent) res.writeHead(500).end("Internal server error");
    }
    return;
  }

  res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not Found");
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log("Korea Media Korean MCP listening on port " + port + " at " + MCP_PATH);
});
