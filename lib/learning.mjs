export const COURSE_URL = "https://zachary-1012.github.io/Korea-Media-Korean-Skill/";

export const degreeProfiles = {
  undergrad: {
    label: "本科 · 학부 / 학사과정",
    target: "TOPIK + 基础学术韩语 + 专业动机 + 校园适应",
    mix: [["基础韩语 / TOPIK",40],["韩剧听力 / Shadowing",25],["媒体广告基础韩语",20],["本科申请 / 面试",15]]
  },
  master: {
    label: "硕士 · 석사과정",
    target: "TOPIK 5/6 + 研究计划 + 专业面试 + 方法论",
    mix: [["TOPIK / 基础韩语",30],["韩剧听力 / Shadowing",25],["媒体广告传播专业韩语",25],["申请 / 面试 / 学术表达",20]]
  },
  phd: {
    label: "博士 · 박사과정",
    target: "文献综述 + 研究贡献 + 方法论 + 教授匹配 + 博士面试",
    mix: [["高级韩语 / TOPIK",20],["学术听说 / Seminar",20],["论文 / 方法论",35],["Research Proposal / 教授联系",25]]
  }
};

export const programs = [
  {
    id:"snu-communication", school:"SNU", name:"서울대학교 · 언론정보학과",
    english:"Seoul National University · Department of Communication",
    fit:["传播研究","国际传播","媒体产业","平台与社会","说服传播"], style:"研究型",
    description:"更强调传播理论、研究方法、媒体产业与政策、说服传播和统计方法。",
    fit_note:"适合希望深入研究传播效果、平台与国际传播、媒体产业和研究方法的学习者。",
    courses:["커뮤니케이션이론연구","연구방법론","설득커뮤니케이션","미디어 산업 및 정책","통계방법"]
  },
  {
    id:"cau-adpr", school:"CAU", name:"중앙대학교 · 광고홍보학과",
    english:"Chung-Ang University · Advertising & Public Relations",
    fit:["广告","品牌","营销传播","消费者","PR"], style:"实务衔接",
    description:"与广告、品牌、营销传播、消费者行为、数字广告和 PR 研究直接连接。",
    fit_note:"适合希望把媒体营销、品牌传播、广告公关经验进一步转化为研究问题的学习者。",
    courses:["광고와마케팅","소비자행동","디지털광고","브랜드자산관리론","이슈 및 위기관리론"]
  },
  {
    id:"cau-media", school:"CAU", name:"중앙대학교 · 미디어커뮤니케이션학과",
    english:"Chung-Ang University · Media & Communication",
    fit:["媒体","国际传播","平台","AI","数据研究"], style:"跨媒体研究",
    description:"把媒体产业、国际传播、平台、AI、文本挖掘与大数据方法连接起来。",
    fit_note:"适合希望从广告营销延伸到平台、AI、媒体产业与数据研究的学习者。",
    courses:["국제커뮤니케이션","미디어산업론","텍스트마이닝","빅데이터 방법론","AI 미디어 리터러시"]
  }
];

export const interviewQuestions = {
  undergrad:[
    ["왜 한국에서 공부하고 싶습니까?","为什么想在韩国学习？","专业兴趣 → 韩国学习环境 → 未来目标"],
    ["왜 미디어·광고 분야에 관심이 있습니까?","为什么对媒体/广告感兴趣？","真实经历 → 兴趣形成 → 想学什么"],
    ["우리 학교에서 무엇을 배우고 싶습니까?","想在本校学习什么？","具体课程/方向 → 你的能力缺口"],
    ["졸업 후 어떤 일을 하고 싶습니까?","毕业后想做什么？","职业方向 → 大学学习如何支持"]
  ],
  master:[
    ["자기소개를 해 주세요.","请自我介绍。","当前工作 → 反复观察到的问题 → 研究兴趣 → 申请动机"],
    ["왜 우리 학과에 지원했습니까?","为什么申请本系？","专业匹配 → 课程/研究方向 → 你的问题意识"],
    ["현재 가장 관심 있는 연구 주제는 무엇입니까?","目前最感兴趣的研究主题是什么？","研究对象 → 变量/关系 → 为什么重要"],
    ["실무 경험이 연구와 어떻게 연결됩니까?","实务经验如何连接研究？","一个真实观察 → 不能只靠经验回答 → 需要研究"],
    ["연구 자료는 어떻게 수집할 계획입니까?","准备如何收集研究资料？","来源 → 样本 → 方法 → 权限/伦理 → 限制"],
    ["광고 효과를 어떤 기준으로 측정하시겠습니까?","如何测量广告效果？","认知/态度/行为 → 指标 → 不能只看点赞"],
    ["플랫폼 알고리즘이 브랜드 커뮤니케이션에 어떤 영향을 준다고 생각합니까?","平台算法如何影响品牌传播？","分发机制 → 受众暴露 → 内容策略 → 研究边界"],
    ["정량연구와 정성연구 중 어떤 방법을 선호합니까?","定量与定性更偏好哪种？","先看研究问题，再选方法；必要时混合方法"]
  ],
  phd:[
    ["박사과정에서 어떤 연구 기여를 만들고 싶습니까?","博士阶段希望产生什么研究贡献？","文献缺口 → 理论/方法贡献 → 可验证成果"],
    ["기존 연구와 본인의 연구는 무엇이 다릅니까?","你的研究和既有研究有什么不同？","已有结论 → 未解决问题 → 你的新视角"],
    ["연구 설계의 가장 큰 한계는 무엇입니까?","研究设计最大限制是什么？","主动承认限制 → 缓解方案 → 不夸大因果"],
    ["어떤 교수의 연구와 가장 잘 맞습니까?","与你最匹配的是哪位教授的研究？","教授具体主题 → 你的研究问题 → 双向匹配"],
    ["이 연구를 한국에서 해야 하는 이유는 무엇입니까?","为什么需要在韩国做这项研究？","研究现场/产业/语境，而不是“喜欢韩国”"]
  ]
};

export const dramaClips = [
  {id:"translated-love",title:"2026 · 이 사랑 통역 되나요?",focus:"跨文化传播 · 翻译语用 · 明星/节目制作",url:"https://www.youtube.com/watch?v=eNj4XwMW4no",practice:[["직역하면 뜻은 맞지만 느낌이 달라져요.","直译意思对，但感觉会变。"],["말보다 의도를 먼저 봐야 해요.","要先看意图，不只是字面。"],["문화가 바뀌면 해석도 달라질 수 있어요.","文化改变，解读也可能改变。"]]},
  {id:"boyfriend-on-demand",title:"2026 · 월간남친",focus:"内容制作 · 平台 · 虚拟服务 · 用户心理",url:"https://www.youtube.com/watch?v=Z-ZcZC4RiQM",practice:[["사용자는 왜 이 콘텐츠를 계속 볼까요?","用户为什么继续看这个内容？"],["서사와 추천 구조를 같이 봐야 해요.","要一起看叙事和推荐结构。"],["효과를 단정하면 안 됩니다.","不能断言效果。"]]},
  {id:"tangerines",title:"2025 · 폭싹 속았수다",focus:"叙事 · 世代 · 情感与语境",url:"https://www.youtube.com/watch?v=4ECAaQkNAbc",practice:[["같은 기억도 시간이 지나면 다르게 보입니다.","同一记忆随时间会有不同理解。"],["메시지는 맥락 없이 존재하지 않아요.","信息不能脱离语境存在。"]]},
  {id:"resident-playbook",title:"2025 · 언젠가는 슬기로울 전공의생활",focus:"职场敬语 · 层级 · 协作",url:"https://www.youtube.com/watch?v=sWtOe9DIK9o",practice:[["먼저 확인해야 할 게 있습니다.","先有一件事需要确认。"],["추측하지 말고 다시 확인하세요.","不要猜，重新确认。"]]}
];

export const vocab = {
  "광고":{zh:"广告",en:"advertising",example:"광고 효과를 어떻게 측정할 수 있을까요?",exampleZh:"广告效果可以如何测量？"},
  "마케팅":{zh:"营销",en:"marketing",example:"마케팅 전략은 소비자 이해에서 시작합니다.",exampleZh:"营销策略从理解消费者开始。"},
  "홍보":{zh:"宣传 / PR",en:"public relations",example:"위기 상황에서는 홍보 메시지의 신뢰가 중요합니다.",exampleZh:"危机情境中 PR 信息的可信度很重要。"},
  "설득커뮤니케이션":{zh:"说服传播",en:"persuasive communication",example:"설득커뮤니케이션은 태도와 행동의 변화를 연구합니다.",exampleZh:"说服传播研究态度与行为如何改变。"},
  "소비자행동":{zh:"消费者行为",en:"consumer behavior",example:"소비자행동은 브랜드 경험과 연결됩니다.",exampleZh:"消费者行为与品牌体验相关。"},
  "브랜드자산":{zh:"品牌资产",en:"brand equity",example:"브랜드자산은 단순한 팔로워 수가 아닙니다.",exampleZh:"品牌资产不只是粉丝数。"},
  "플랫폼":{zh:"平台",en:"platform",example:"플랫폼 알고리즘이 콘텐츠 노출에 영향을 줍니다.",exampleZh:"平台算法会影响内容曝光。"},
  "연구문제":{zh:"研究问题",en:"research question",example:"먼저 연구문제를 명확하게 정의해야 합니다.",exampleZh:"首先要清晰定义研究问题。"},
  "가설":{zh:"假设",en:"hypothesis",example:"가설은 검증할 수 있어야 합니다.",exampleZh:"假设应当可以被检验。"},
  "정량연구":{zh:"定量研究",en:"quantitative research",example:"정량연구는 수치 자료를 분석합니다.",exampleZh:"定量研究分析数值数据。"},
  "정성연구":{zh:"定性研究",en:"qualitative research",example:"정성연구는 경험과 의미를 깊게 탐색합니다.",exampleZh:"定性研究深入探索经验和意义。"},
  "면접":{zh:"面试",en:"interview",example:"면접에서는 연구 관심을 구체적으로 설명해야 합니다.",exampleZh:"面试中要具体说明研究兴趣。"}
};

export const topikQuestions = [
  {id:1,level:4,prompt:"‘따라서’와 가장 가까운 기능은 무엇입니까?",options:["转折","因果结论","举例","并列"],answer:1,explanation:"따라서 = 因此，用来引出前文推导出的结论。"},
  {id:2,level:5,prompt:"‘상관관계가 있다고 해서 인과관계가 있다고 단정할 수 없다’의 핵심은?",options:["相关一定导致因果","相关不等于因果","数据没有意义","只做定性研究"],answer:1,explanation:"研究方法中必须区分 correlation 和 causality。"},
  {id:3,level:5,prompt:"브랜드 메시지의 효과를 평가할 때 가장 적절한 것은?",options:["只看点赞","只看曝光","结合认知、态度与行为指标","不需要数据"],answer:2,explanation:"广告/传播效果不应只用单一互动指标替代。"}
];

export function normalizeDegree(degree="master"){
  const key=String(degree||"master").toLowerCase();
  return degreeProfiles[key]?key:"master";
}
export function comparePrograms({degree="master",focus="media_marketing"}={}){
  const d=normalizeDegree(degree);
  let ranked=[...programs];
  if(/advert|pr|brand|marketing|广告|营销|品牌/i.test(focus)) ranked=[programs[1],programs[2],programs[0]];
  else if(/research|international|platform|media|传播|研究|平台/i.test(focus)) ranked=[programs[0],programs[2],programs[1]];
  return {ui_type:"compare",degree:degreeProfiles[d].label,focus,title:"SNU / CAU 专业路线比较",recommendation:ranked[0].id,items:ranked,course_url:COURSE_URL};
}
export function buildStudyPlan({degree="master",months=9,hours_per_week=12,topik_target=5}={}){
  const d=normalizeDegree(degree);
  const rawMonths=Number(months),rawHours=Number(hours_per_week),rawTopik=Number(topik_target);
  const safeMonths=Math.min(24,Math.max(1,Number.isFinite(rawMonths)?rawMonths:9));
  const safeHours=Math.min(40,Math.max(2,Number.isFinite(rawHours)?rawHours:12));
  const safeTopik=Math.min(6,Math.max(1,Number.isFinite(rawTopik)?rawTopik:5));
  const weeks=Math.round(safeMonths*4.3);
  return {ui_type:"plan",title:degreeProfiles[d].label+" · 韩语学习计划",degree:d,degree_label:degreeProfiles[d].label,target:degreeProfiles[d].target,months:safeMonths,weeks,hours_per_week:safeHours,estimated_hours:weeks*safeHours,topik_target:safeTopik,mix:degreeProfiles[d].mix,milestones:["能完成 60–120 秒自我介绍","能读招生公告核心字段",d==="undergrad"?"能写专业动机与基础学习计划":"能解释研究兴趣、方法与限制","能完成真实媒体 / 广告 / PR 专业口头表达","能处理面试追问而不靠背稿"],course_url:COURSE_URL};
}
export function getInterviewPractice({degree="master",school="CAU",major="광고홍보학과",index=0}={}){
  const d=normalizeDegree(degree),pool=interviewQuestions[d],i=Math.abs(Number(index)||0)%pool.length,row=pool[i];
  return {ui_type:"interview",title:school+" · "+major+" 面试训练",degree:d,school,major,index:i,next_index:(i+1)%pool.length,question_ko:row[0],question_zh:row[1],hint:row[2],timer_seconds:d==="phd"?120:60,self_check:["先给结论","至少一个真实经历或研究依据","不要编数据","承认限制","回到学校/专业匹配"]};
}
export function getDramaPractice({theme="translation"}={}){
  const map={translation:dramaClips[0],platform:dramaClips[1],story:dramaClips[2],workplace:dramaClips[3]},clip=map[String(theme).toLowerCase()]||dramaClips[0];
  return {ui_type:"drama",title:"韩剧原片 Shadowing",theme,clip,steps:["第一遍不看字幕，只抓人物关系、情绪与关键词。","第二遍开官方字幕，记录 2–3 个真正听到的短句。","第三遍回退 5–10 秒，0.75× / 正速 Shadowing。","最后用自己的媒体/工作经历替换名词重新说一遍。"],copyright_note:"公开插件不托管完整韩剧音轨或完整正式剧本；原声入口指向官方公开视频。"};
}
export function lookupKoreanTerm({term="설득커뮤니케이션"}={}){
  const clean=String(term||"").trim(),hit=vocab[clean]||{zh:"课程词典暂未收录",en:"not in curated glossary",example:clean+"의 의미를 문맥에서 확인해 보세요.",exampleZh:"请在具体语境中确认“"+clean+"”的含义。"};
  return {ui_type:"vocab",title:"专业韩语词卡",term:clean,...hit,actions:["朗读","看例句","生成同主题小测"]};
}
export function getTopikQuiz({level=5,index=0}={}){
  const lv=Math.max(1,Math.min(6,Number(level)||5)),candidates=topikQuestions.filter(q=>q.level<=lv),pool=candidates.length?candidates:topikQuestions,i=Math.abs(Number(index)||0)%pool.length,q=pool[i];
  return {ui_type:"quiz",title:"TOPIK "+lv+" · 互动练习",...q,next_index:(i+1)%pool.length};
}

export const officialTopik = {
  topik1_pbt: {label:"TOPIK I · PBT",sections:[["듣기 / 听力",30],["읽기 / 阅读",40]],minutes:100,total:200,levels:{"1":80,"2":140}},
  topik2_pbt: {label:"TOPIK II · PBT",sections:[["듣기 / 听力",50],["읽기 / 阅读",50],["쓰기 / 写作",4]],minutes:180,total:300,levels:{"3":120,"4":150,"5":190,"6":230}},
  topik2_ibt: {label:"TOPIK II · IBT",sections:[["듣기 / 听力",30],["읽기 / 阅读",30],["쓰기 / 写作",3]],minutes:125,total:600,levels:{"3":191,"4":291,"5":361,"6":431}},
  speaking: {label:"TOPIK Speaking",sections:[["말하기 / 口语",6]],minutes:30,total:200,levels:{"1":20,"2":50,"3":90,"4":110,"5":130,"6":160}}
};

export const realWorldScenarios = {
  "university-office":{
    title:"大学行政办公室",
    role:"你是申请者 / 研究生，AI 扮演韩国大学行政老师。",
    context:"你需要确认申请材料、截止日期或面试安排。",
    opening:"안녕하세요. 무엇을 도와드릴까요?",
    goal:"清楚说明来意、确认关键信息、复述下一步。",
    phrases:["입학 관련해서 문의드리고 싶습니다.","제출 마감일을 확인하고 싶습니다.","제가 이해한 내용이 맞는지 확인해도 될까요?"]
  },
  "professor-meeting":{
    title:"教授 Office Hour",
    role:"你是研究生，AI 扮演韩国教授。",
    context:"你要说明研究兴趣，并接受教授追问。",
    opening:"요즘 어떤 연구 주제에 관심이 있습니까?",
    goal:"用 60–120 秒说明问题意识、研究对象、方法和限制。",
    phrases:["현재 가장 관심 있는 연구 주제는 ~입니다.","이 문제를 연구하고 싶은 이유는 ~입니다.","현재 단계의 한계는 ~라고 생각합니다."]
  },
  "team-project":{
    title:"研究生小组项目",
    role:"你是组员，AI 扮演韩国同学。",
    context:"你们需要分工、讨论不同意见并确定截止时间。",
    opening:"이번 발표는 어떻게 나눠서 준비할까요?",
    goal:"提出分工、表达不同意见、确认 deadline。",
    phrases:["제가 자료 조사를 맡겠습니다.","조금 다른 관점에서 보고 싶습니다.","마감 전에 한 번 같이 확인할까요?"]
  },
  "agency-client":{
    title:"广告代理公司 Client Meeting",
    role:"你是 AE / Planner，AI 扮演韩国品牌客户。",
    context:"客户质疑 Campaign 为什么没有直接转化。",
    opening:"노출은 늘었는데 전환은 왜 그대로인가요?",
    goal:"解释指标、承认未知、提出下一步验证方案。",
    phrases:["현재 데이터만으로 원인을 단정하기 어렵습니다.","채널별 행동 데이터를 다시 확인하겠습니다.","가설을 두 가지로 나눠 검증해 보겠습니다."]
  },
  "campaign-pitch":{
    title:"品牌 Campaign 提案",
    role:"你是策略/传播负责人，AI 扮演韩国客户团队。",
    context:"你要在 2 分钟内说明消费者 insight、核心信息、渠道与测量。",
    opening:"이 캠페인의 핵심 아이디어를 한 문장으로 설명해 주세요.",
    goal:"从 insight → message → channel → measurement 完成专业表达。",
    phrases:["핵심 인사이트는 ~입니다.","이 메시지를 통해 ~한 태도 변화를 기대합니다.","성과는 ~ 지표로 확인하겠습니다."]
  },
  "seminar":{
    title:"研究生 Seminar 讨论",
    role:"你是发表者/讨论者，AI 扮演教授或同学。",
    context:"你需要回应论文中的理论、方法与限制问题。",
    opening:"이 연구의 가장 중요한 한계는 무엇이라고 생각합니까?",
    goal:"能同意/不同意、引用证据、说明限制并提出后续研究。",
    phrases:["그 의견에 부분적으로 동의합니다.","다른 관점에서는 ~라고 볼 수 있습니다.","후속 연구에서는 ~를 보완할 필요가 있습니다."]
  }
};

export const writingTasks = {
  "topik54_pbt":{
    title:"TOPIK II PBT · 54 长作文",
    mode:"TOPIK",
    target_chars:"600–700자",
    prompt:"생성형 AI가 광고와 미디어 산업의 업무 방식에 미치는 영향에 대해 자신의 의견을 쓰십시오. 장점과 위험을 각각 설명하고, 바람직한 활용 방안을 제시하십시오.",
    promptZh:"就生成式 AI 对广告与媒体行业工作方式的影响写出你的观点。分别说明优势与风险，并提出合理的使用方案。",
    requirements:["600–700 韩文字","有明确中心观点","至少两个展开段","使用逻辑连接词","正式书面语"],
    rubric:[
      ["内容及任务完成",12,"是否完整回应题目、内容是否相关且充分"],
      ["文章展开结构",12,"结构是否清晰、中心思想是否组织良好、连接是否自然"],
      ["语言使用",26,"语法词汇是否丰富准确、拼写是否正确、文体是否正式得体"]
    ]
  },
  "topik_ibt":{
    title:"TOPIK II IBT · 写作练习",
    mode:"TOPIK",
    target_chars:"400–500자",
    prompt:"플랫폼 알고리즘이 이용자의 콘텐츠 선택에 미치는 영향에 대해 자신의 의견을 쓰고 두 가지 근거를 제시하십시오.",
    promptZh:"就平台算法如何影响用户内容选择表达观点，并提供两个理由。",
    requirements:["400–500 韩文字","观点清楚","两个理由","正式书面语"],
    rubric:[["任务完成",34,"是否回答题目要求"],["结构与衔接",33,"逻辑和段落是否清楚"],["语言",33,"词汇、语法、拼写和文体"]]
  },
  "professor_email":{
    title:"给教授的真实邮件",
    mode:"REAL_WORLD",
    target_chars:"120–220자",
    prompt:"연구 관심과 관련하여 교수님께 20분 면담을 정중하게 요청하는 메일을 쓰십시오.",
    promptZh:"写一封礼貌邮件，向教授请求 20 分钟面谈，讨论你的研究兴趣。",
    requirements:["有主题/称呼","一句话说明自己","明确目的","给出可协商时间","礼貌结尾"],
    rubric:[["信息完整",30,"目的与请求是否清楚"],["敬语与语用",30,"礼貌程度是否自然"],["语言准确",25,"语法词汇"],["简洁性",15,"是否像真实邮件而非作文"]]
  },
  "research_interest":{
    title:"研究兴趣陈述",
    mode:"ACADEMIC",
    target_chars:"350–550자",
    prompt:"미디어·마케팅 실무 경험에서 출발한 연구 관심을 설명하고, 대학원에서 탐구하고 싶은 연구문제를 제시하십시오.",
    promptZh:"说明从媒体营销实务经验形成的研究兴趣，并提出研究生阶段想探索的研究问题。",
    requirements:["经历不是流水账","有问题意识","提出可研究问题","说明为何需要研究"],
    rubric:[["问题意识",30,"是否从经历形成研究问题"],["可研究性",25,"对象/关系/范围是否清晰"],["逻辑",25,"经历→问题→研究的链条"],["韩语表达",20,"学术语体与准确性"]]
  },
  "campaign_brief":{
    title:"韩国职场 Campaign Brief",
    mode:"PROFESSIONAL",
    target_chars:"250–400자",
    prompt:"신제품 캠페인의 타깃, 인사이트, 핵심 메시지, 채널 역할, 측정 지표를 간결하게 정리하십시오.",
    promptZh:"简要整理新产品 Campaign 的目标受众、洞察、核心信息、渠道作用和测量指标。",
    requirements:["Target","Insight","Message","Channel Role","Measurement"],
    rubric:[["策略完整性",35,"五个要素是否齐全"],["因果逻辑",25,"洞察与策略是否连得上"],["专业语汇",20,"广告/营销词汇"],["简洁自然",20,"能否直接用于工作"]]
  }
};

export function startDiagnostic({degree="master",target_level=5}={}){
  const d=normalizeDegree(degree),lv=Math.max(1,Math.min(6,Number(target_level)||5));
  return {
    ui_type:"diagnostic",
    title:"韩语能力诊断 · 听说读写 + TOPIK",
    degree:d,target_level:lv,
    note:"这是学习诊断，不是官方 TOPIK 成绩。目标是定位下一步训练，而不是给虚假等级。",
    objective:[
      {id:"listen1",skill:"listening",audio:"회의 시간이 오후 세 시에서 네 시로 변경됐습니다. 발표자는 세 시 반까지 회의실에 와 주세요.",question:"발표자는 몇 시까지 와야 합니까?",options:["3시","3시 30분","4시","4시 30분"],answer:1},
      {id:"read1",skill:"reading",passage:"광고의 노출량이 증가해도 소비자의 태도나 행동이 자동으로 변하는 것은 아니다. 따라서 캠페인 성과를 평가할 때는 노출뿐 아니라 메시지 이해, 태도 변화, 행동 지표를 함께 살펴볼 필요가 있다.",question:"이 글의 중심 내용은 무엇입니까?",options:["노출량만 중요하다","광고는 측정할 수 없다","여러 효과 지표를 함께 봐야 한다","행동 지표는 필요 없다"],answer:2},
      {id:"logic1",skill:"vocab_grammar",question:"‘따라서’의 기능으로 가장 알맞은 것은?",options:["예시","원인에서 결론으로 연결","반대","시간 순서"],answer:1}
    ],
    writing:{prompt:"본인의 미디어·마케팅 경험이 대학원 연구 관심으로 어떻게 이어졌는지 180~250자로 쓰십시오.",target:"180–250자"},
    speaking:{prompt:"현재 하는 일과 대학원에서 연구하고 싶은 주제를 60초 동안 한국어로 설명해 보세요.",seconds:60},
    dimensions:["listening","speaking","reading","writing","vocab_grammar","academic_media"]
  };
}

export function getRealWorldScenario({scenario="agency-client",level=5}={}){
  const key=realWorldScenarios[scenario]?scenario:"agency-client";
  const item=realWorldScenarios[key];
  return {ui_type:"conversation",title:item.title,scenario:key,level:Math.max(1,Math.min(6,Number(level)||5)),...item,feedback_criteria:["任务是否完成","表达是否自然","敬语/语体是否合适","语法与词汇准确性","是否能继续真实对话"]};
}

export function getWritingTask({kind="topik54_pbt",level=5}={}){
  const key=writingTasks[kind]?kind:"topik54_pbt";
  return {ui_type:"writing",kind,level:Math.max(1,Math.min(6,Number(level)||5)),...writingTasks[key]};
}

export function getTopikExamMode({format="topik2_pbt",target_level=5}={}){
  const key=officialTopik[format]?format:"topik2_pbt",spec=officialTopik[key],lv=String(Math.max(1,Math.min(6,Number(target_level)||5)));
  return {
    ui_type:"exam",
    title:spec.label+" · 备考模式",
    format:key,
    target_level:Number(lv),
    official_format:spec,
    target_score:spec.levels[lv]??null,
    official_source:"https://www.niied.go.kr/web/niied/contents/niied_topik",
    official_practice:"https://www.topik.go.kr/",
    training_rule:"练习分数只用于训练；不要把本产品估分冒充官方 TOPIK 成绩。",
    next_actions:key==="speaking"?["真实口语角色扮演","面试训练","60秒观点表达"]:["听力/阅读小测","写作训练","整套限时计划"]
  };
}

export function buildDailySession({degree="master",minutes=45,topik_target=5,weak_skill="writing"}={}){
  const d=normalizeDegree(degree),mins=Math.min(120,Math.max(20,Number(minutes)||45)),target=Math.max(1,Math.min(6,Number(topik_target)||5));
  const weak=String(weak_skill||"writing");
  const blocks=[
    {minutes:Math.round(mins*0.2),kind:"retrieval",title:"主动回忆",task:"不看答案复习专业词汇与上次错误。"},
    {minutes:Math.round(mins*0.25),kind:weak==="listening"?"drama":"input",title:weak==="listening"?"听力 / Shadowing":"高质量输入",task:weak==="listening"?"官方原片 1 段：听→字幕→跟读":"读一段与媒体/广告相关的韩文并找结构。"},
    {minutes:Math.round(mins*0.35),kind:weak==="speaking"?"conversation":"writing",title:weak==="speaking"?"真实对话输出":"写作输出",task:weak==="speaking"?"完成一个真实场景 5 轮对话":"完成一段限时写作并接受逐句反馈。"},
    {minutes:mins-(Math.round(mins*0.2)+Math.round(mins*0.25)+Math.round(mins*0.35)),kind:"exam",title:"TOPIK 小测",task:"做 1–3 道限时题，并记录错误原因。"}
  ];
  return {ui_type:"session",title:"今天的自适应韩语训练",degree:d,minutes:mins,topik_target:target,weak_skill:weak,blocks,mastery_rule:"同类任务连续 3 次达到标准后再升难度；错误进入下一次主动回忆。"};
}
