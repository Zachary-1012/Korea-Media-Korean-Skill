# Korea Media Korean Skill

## 非商用学习产品 V1.4.0｜扩展词书 + 韩语礼仪

本产品面向大众免费开放，**不经营付费课程、商业培训或词典收费服务**。升级后仍是网页学习产品，不声称 iOS/Android 原生 App 已上架。

- **基础学习**：<https://zachary-1012.github.io/Korea-Media-Korean-Skill/#/journey>，52 个原有 A0–B2 定向学习单元与课后情境互动保留。
- **扩展词书**：<https://zachary-1012.github.io/Korea-Media-Korean-Skill/#/wordbank>，4,704 个去重扩展词头，合法注明外部 CC BY 4.0 来源，部分词只附英文解释、词义及例句尚未经逐条母语教师确认；可搜索、收藏及间隔回忆。
- **韩国文化与礼仪**：<https://zachary-1012.github.io/Korea-Media-Korean-Skill/#/culture>，18 个原创韩语社交场景，包括敬语、半语、称谓、感谢道歉、拜访、聚餐、职场、尊重边界和跨文化协商。
- **客观教育证据**：<https://zachary-1012.github.io/Korea-Media-Korean-Skill/#/coach>，持续提供诊断、错题回流、异题复测、韩语回答记录及教师反馈引导。
- **版权与来源**：见 [NONCOMMERCIAL-SOURCES.md](NONCOMMERCIAL-SOURCES.md)。外部 Koko 词汇 CC BY 4.0 署名有效；原项目版权和商用授权控制不被改变。
- **官方词典**：<https://krdict.korean.go.kr/chn/mainAction>，需要独立取得官方 API 密钥才能在产品中通过接口搜索更广泛的官方词典信息。当前未把官方整部词典内置或接入，不对外宣称“所有韩语单词完整收录”。
- **教育效果**：扩充词库、完成题目、52 单元自动化浏览器 PASS，都不等于已有真实学习者达到 B2。必须有真人跨日、跨周完成无提示交流，及独立教师核验后才可认定 USER OUTCOME。

**单词和礼仪练习进度只存在用户自己浏览器中**，没有跨设备自动同步，开放网页不会自动把答案传给服务端。宣传视频继续冻结，待用户认可产品后再重制。

## Korean Media Study v1.3.0 Web｜从零基础到可追踪的韩语学习闭环

**网页入口：** https://zachary-1012.github.io/Korea-Media-Korean-Skill/#/coach

**学习路线：** https://zachary-1012.github.io/Korea-Media-Korean-Skill/#/journey

升级不以累计打卡、词条或静态课程为最终目标，而是形成下列可实际操作的训练流程：

1. **起点诊断**：A0 至 B2-oriented 的限定阅读/听力理解题决定推荐起点，不等于正式分级认证。
2. **适应性计划**：自动识别到期词卡、未完成真实任务、首次检查薄弱项以及到期纠错重练，选择今天先做什么。
3. **课程输入与主动回忆**：保留原有 52 个生活情境单元与 48 节专项课程；每单元词卡、听音、阅读、5 道检查题和多轮生活场景回答。
4. **独立验证**：每个阶段分别测试阅读、设备声音听辨、韩语听写及新的情境迁移；各维度显示证据，不用“一次总分”冒充口语流利。
5. **可解释纠错**：显示每题具体答案依据、听写目标与差距、情境关键词覆盖的限制；外部老师或同伴的反馈需要用户自行录入，并如实标记来源尚未由平台验证。
6. **再次输出与保持**：根据反馈重写韩语答案，调度隔天/3 天/7 天等复练；阶段初测通过后至少隔 24 小时使用另一组任务复测保持，不允许当天重复刷题伪造长期能力。
7. **本地数据与自主管理**：记录复习、错误、诊断与重练；支持 JSON 导出、恢复或删除，不要求账号，不创建服务器个人数据库。

**重要边界**：这是一套真实可操作的学习与形成性评价系统，不是经过真实长期学生样本验证的完整教育成果。当前网页版不提供经认证的 B2 口语等级、实时开放式 AI 教师自由交谈、独立可信的发音评分或真人人工教师服务。浏览器 Speech Synthesis 和 SpeechRecognition 能否使用取决于设备和供应商，语音转写不是发音评级。可将自由韩语表达复制到已连接的 ChatGPT 或交给合格韩语教师获取实质批改，再将反馈与改写任务记录回来。

**原创与使用边界**：本产品版权保留；借鉴公开的主动回忆、纠错和阶段迁移学习原理，不复制多邻国及其他机构的课程内容、视觉或音轨。韩国国立国语院独立词典：https://krdict.korean.go.kr/chn/mainAction ，其开发接口需要另行申领密钥，不冒充已接入全部官方词库。

**开发与验收**：`npm run check`、`node test/real-life-browser.mjs`、`node test/education-closure-browser.mjs`、`node test/standalone-v3.mjs`。测试证明规定流程在浏览器按预期执行，不证明真实用户已经学会韩语。旧插件 MCP 路径、ChatGPT 目录审核与本次网页发布各自独立。宣传视频必须等产品实际体验验收后再启动。

## 网页端 V1.2.0｜零基础到真实生活交流

- **现在面向所有学习者。** 首页点击「从零开始·52 单元」，或直接打开 [日常韩语学习路径](https://zachary-1012.github.io/Korea-Media-Korean-Skill/#/journey)。
- **A0 → A1 → A2 → B1 → B2-oriented practice**：52 个自编真实情境单元、798 个去重韩中生活词条；旧的 48 节专业/TOPIK 课程、18 个韩剧情境及原专业词典仍保留。
- **真的要答题和输出**：每节有听发音、识词、五道主动回忆题、针对错误的间隔复习、多轮真实情境回答、困难与提示记录。B2 综合任务要求五轮独立应答。
- **进度为练习证据而非语言能力认证。** 网站记录答题正确率、自评及是否查看过提示；没有后台 AI 时不进行语法准确性、发音质量、自由对话能力的自动评分。达到流利交流需要长期输入、实际交流与真人评估。
- **手机网页可用**。手机或桌面浏览器会独立保存进度及个人练习文字；没有自动跨设备同步。可选韩语设备朗读、麦克风转写、自己录音回放，受各浏览器能力与隐私权限限制。
- **扩展词汇**：未收录的词请使用 [韩国国立国语院韩中学习词典](https://krdict.korean.go.kr/chn/mainAction) 独立检索。词典 API 需官方授权密钥，本产品不伪造已同步全部词典。
- **版权及使用范围**：学习路径与练习内容为本项目编写，不复制其他学习 App 的课程/视觉/音效，网站公开可学习但代码与商业复制权保留。
- **视频暂停**：在 Product Owner 验收升级后的网页版之前，不重新制作宣传视频。v1.1.0 现有 MCP 服务、ChatGPT 公共目录状态与此次网页端升级分层管理。

面向大众的韩语学习与韩国大学申请训练产品。

面向：
- 首尔大学（SNU）传播 / 媒体相关方向
- 中央大学（CAU）广告与公关、媒体传播相关方向
- 媒体传播、国际传播、广告、营销、品牌、PR、平台与 AI 研究
- 本科 / 硕士 / 博士三种申请层级（默认硕士）

## 在线学习

完整 48 节课程：

https://zachary-1012.github.io/Korea-Media-Korean-Skill/

## 产品目标

这不是“看完课程就算学会”的静态教材。

核心学习闭环：

1. 诊断当前真实能力；
2. 针对弱项训练；
3. 强制产生真实韩语输出；
4. 获得反馈；
5. 重说 / 重写；
6. 错误进入下一轮主动回忆；
7. 达标后再提高难度。

能力分别覆盖：

- 听力
- 口语
- 阅读
- 写作
- 词汇 / 语法
- TOPIK
- 媒体 / 广告 / 营销 / PR 专业韩语
- 研究生 / 博士学术韩语
- SNU / CAU 申请与面试

## Smart Learning UI

MCP Apps UI 会根据任务自动切换：

- 学校选择 → Compare UI
- 词汇 → Vocabulary UI
- 面试 → Interview UI
- 韩剧原片 → Shadowing UI
- TOPIK → Exam / Quiz UI
- 写作 → Writing Editor + Rubric
- 真实交流 → Role-play UI
- 水平不明确 → Diagnostic UI
- 每日学习 → Adaptive Session UI

简单问题不会强行显示复杂 UI。

## 真实应用场景

口语训练包含：

- 韩国大学行政办公室
- 教授 Office Hour
- 研究生小组项目
- Seminar 讨论
- 广告代理公司 Client Meeting
- Campaign Pitch

写作训练包含：

- TOPIK II 写作
- 教授邮件
- Research Interest
- Campaign Brief

## TOPIK

考试模式以当前 NIIED / TOPIK 官方结构为准。

产品会明确区分：

- 官方考试结构 / 等级门槛
- 内部练习
- AI 训练估分

任何内部练习分数都不冒充正式 TOPIK 成绩。

## 韩剧与听力

- 经典及 2025–2026 韩剧情境式学习
- 官方 Netflix / Netflix K-Content 公开视频入口
- Shadowing
- 设备本地 ko-KR TTS
- 私有字幕 / 剧本练习盒只保存在浏览器 localStorage

公开仓库不托管韩剧完整音轨或完整正式剧本。

## ChatGPT / Codex 插件

- 公共在线课程：<https://zachary-1012.github.io/Korea-Media-Korean-Skill/>
- 远程 MCP：<https://korea-media-korean-mcp-production.up.railway.app/mcp>
- 插件发布包：从本仓库 GitHub Releases 下载最新的 Korean-Media-Study ZIP
- 安装、审核、域名验证与更新说明：[PUBLISHING.md](./PUBLISHING.md)
- 审核测试与界面证明：[REVIEW-HANDOFF.md](./REVIEW-HANDOFF.md)
- 可编辑 Figma 视觉稿：<https://www.figma.com/design/MeSjqKj6w2VHkGia3w4LEt>

公开 GitHub Pages 可独立使用。ChatGPT 公共目录需要先完成 OpenAI 开发者身份、域名验证、审核和发布；插件 ZIP 及公网 MCP 上线不等于已上架目录。

## MCP

远程 MCP 使用 Node + 官方 MCP SDK + MCP Apps UI。

当前工具包括：

- compare_programs
- build_study_plan
- practice_interview
- practice_drama_shadowing
- look_up_korean_term
- practice_topik_quiz
- start_korean_diagnostic
- practice_real_world_korean
- practice_korean_writing
- open_topik_exam_mode
- build_daily_korean_session
- get_course_url

Skill：

`skills/korea-media-korean/SKILL.md`

## 隐私

- 当前远程 MCP 不要求用户账号登录；
- 不建立个人学习数据库；
- GitHub Pages 学习进度和私有练习盒保存在用户浏览器本地；
- 不应把用户完整学习正文作为持久用户档案记录。

详见：
- [Privacy Policy](./privacy.html)
- [Terms of Service](./terms.html)

## 授权与商业使用

**本仓库公开可见，但不是开源授权。**

普通用户可以通过官方托管页面和插件进行个人学习。

未经 Zachary 事先书面授权，第三方不得：

- 复制或修改源码后用于其他产品；
- 再发布、镜像、重新托管或分发课程；
- 发布 fork / 衍生版本；
- 用于付费培训、咨询、Agency 客户交付、企业商业培训、SaaS、订阅产品或白标服务；
- 翻译、重新包装、嵌入、捆绑、转售项目的重要部分；
- 在商业或分发型产品中复用 Smart Learning UI、MCP 工具、Skill、课程结构、提示词或原创教学材料。

商业授权、改编权、再分发权或机构部署必须事先取得书面授权。

详见：
- [LICENSE](./LICENSE)
- [Commercial Licensing](./COMMERCIAL-LICENSE.md)

Copyright © 2026 Zachary. All Rights Reserved.

## 招生信息

学校规则会变化。真正申请时必须重新核对对应年份、学历层级和项目的 SNU / CAU 官方招生简章。

本产品不能保证 TOPIK 通过或学校录取；它负责的是提高可验证的学习与申请准备能力。

## V3 · Task-driven learning workspace

Production learning UI is **not** the AI-generated promotional mockups.
The actual interface now uses a compact navigation rail, typography-driven
home screen, clearer course hierarchy and task-specific practice components.

- Today: enter a concrete study goal and choose an appropriate workspace;
- Course: browse 12 stages and progressively expand any of the original 48 lessons;
- TOPIK: answer one item before explanations and retry on the next item;
- Conversation: practice real Korean turns before seeing a reference response;
- Writing: compose in an editor, preserve local drafts, then explicitly copy
  into ChatGPT for AI feedback (website itself does not pretend to grade);
- Vocabulary and drama: preserve original course content and public clip links;
- About: admissions caveats, TTS/privacy disclosures, legal licensing.

The standalone site routes common intents deterministically. It is **not** a
model-driven UI compiler. In ChatGPT, MCP tool selection and the UI resource
provide task-specific components; progressive content is backed by real tool
results, not artificial model streaming or invented statuses.

Public learner-facing UI is neutral: no owner name, biography, or fake
personalized progress scores. Legacy browser lesson progress keys are preserved.
The 48 lessons, 18 adapted drama scenes, 133 vocabulary cards and 64 phrases
remain in the website.

Product works independently from LUMENIS/序境; no LUMENIS source/runtime/deploy
should be modified for this project.

## 版本记录

- [V1.1.0 产品升级](./CHANGELOG.md)：公众学习工作区、任务自适应 UI、真实练习路径和中性产品文案。
