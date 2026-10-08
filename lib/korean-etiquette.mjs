// Authored situational Korean etiquette curriculum. Explanations distinguish
// social tendencies from universal obligations; exact usage varies by person/context.
// Source pointers provide factual background, never reuse protected source scripts.
const GREET="https://www.korea.net/Events/Overseas/view?articleId=9189";
const HONOR="https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=24607";
const TABLE="https://www.korea.net/NewsFocus/Society/view?articleId=175173";
const LIFE="https://www.korea.net/koreanet/fileDownload?fileUrl=FILE%2FPDF%2Fgeneral%2F201209_liveinkorea_en.pdf";
const item=(id,level,topic,title,situation,good,bad,why,reply,challenge,source)=>
 Object.freeze({id,level,topic,title,situation,good,bad,why,reply,challenge,source});
export const CULTURE_CASES=[
 item("E01","A0","日常敬语","第一次见面","刚认识一位大学同学或公司同事。",
 "안녕하세요. 처음 뵙겠습니다.","야! 누구야?",
 "初次见面通常先用礼貌问候；双方熟悉后可以商量是否使用随意语体。年龄不能单独决定如何说话。",
 "반갑습니다. 저는 한국어를 공부하고 있어요.","不看中文，完成初次见面的问候、身份介绍。",GREET),
 item("E02","A0","问候与感谢","礼貌地请求重复","行政窗口工作人员讲话较快，你没有听清。",
 "죄송하지만 천천히 말씀해 주시겠어요?","뭐? 다시!",
 "礼貌表达听不懂比装懂更能推进真实沟通；-주시겠어요? 是委婉请求。",
 "물론이죠. 다시 말씀드리겠습니다.","完整地请求对方放慢语速，然后表示感谢。",HONOR),
 item("E03","A1","称谓","如何称呼教授","第一次给大学教授写邮件。",
 "교수님, 질문이 하나 있습니다.","야, 교수!",
 "教授通常称为 교수님。非正式人名和半语需在关系允许的场合使用。",
 "네, 어떤 질문이 있나요?","向教授礼貌提出一个具体的问题。",LIFE),
 item("E04","A1","敬语选择","日常 -요 和正式 -습니다","和新认识的韩国同事约明天见面。",
 "내일 시간 괜찮으세요?","내일 시간 돼?（初次正式联系时）",
 "해요体常适合日常礼貌交流；-습니다 则常用于较正式说明，反复强调职级并不总是自然。",
 "네, 내일 오후에는 괜찮습니다.","礼貌提出见面时间，并回应对方的修改意见。",HONOR),
 item("E05","A1","道别","谁离开，谁留下","你去店里买完东西，要向留下来的店员告别。",
 "감사합니다. 안녕히 계세요.","안녕히 가세요.（对留在店里的人）",
 "常见道别语中，안녕히 계세요 对留下的人说，안녕히 가세요 对离开的人说。简单说 감사합니다 也很自然。",
 "안녕히 가세요. 감사합니다.","分别练自己离开店里和送客人离开两种情境。",GREET),
 item("E06","A1","称谓关系","问对方希望怎么称呼","新加入韩国团队，不清楚对方习惯使用什么称呼。",
 "어떻게 불러 드리면 될까요?","너 몇 살이야?（上来询问年龄）",
 "职位称谓、名字+씨 等需要看组织文化和本人偏好；先询问称呼能避免凭外貌年龄推断。",
 "이름에 씨를 붙여서 불러 주세요.","询问合适称谓，再使用对方认可的称呼。",LIFE),
 item("E07","A1","接受物品","在正式窗口递交资料","给学校国际办公室交申请材料。",
 "서류 여기 있습니다. 확인 부탁드립니다.","여기.（随手扔下材料）",
 "正式递交物品常会用双手表达尊重，但实际流程、身体条件与对方需要更重要。",
 "네, 접수하겠습니다.","递交材料、确认是否收到，再问是否还需补交。",LIFE),
 item("E08","A1","用餐语言","开始和结束一顿饭","受朋友家人邀请吃韩国料理。",
 "잘 먹겠습니다. 감사합니다.","빨리 주세요!（在受邀聚餐时命令别人）",
 "잘 먹겠습니다 表示感谢款待、准备开动；吃完后可用 잘 먹었습니다。",
 "맛있게 드세요. 많이 드세요.","学习说开始用餐与吃完饭时的感谢表达。",TABLE),
 item("E09","A1","聚餐礼仪","家庭聚餐的座次和开始","第一次被韩国朋友邀请到其父母家吃饭。",
 "먼저 드세요. 저는 기다릴게요.","나 먼저 먹을게.（在正式聚餐中不确认）",
 "部分家庭或正式聚餐可能等待长辈先动筷，也有很多家庭较随意；遵循主人安排而非机械照搬刻板印象。",
 "편하게 드세요.","若不确定，礼貌询问是否可以开始用餐。",TABLE),
 item("E10","A1","餐具使用","筷子与米饭","餐厅里不确定筷子放置位置。",
 "젓가락은 어디에 놓으면 될까요?","젓가락을 밥에 세워 꽂겠습니다.",
 "将筷子竖直插在饭里常被视为不合适；不必僵化为每个家庭都相同的固定规则。",
 "옆에 놓으시면 됩니다.","请店员确认餐具的位置并表示感谢。",TABLE),
 item("E11","A2","社交边界","有人劝酒，如何婉拒","成年人公司聚餐，同事邀请你喝酒。",
 "감사합니다만 술은 마시지 않겠습니다. 물로 함께할게요.","무조건 마셔야 하나요?（被迫饮酒）",
 "喝酒不是义务；可以直接而礼貌地拒绝，并选择无酒精饮料。尊重他人不需要强迫自己饮酒。",
 "네, 편하게 하세요.","礼貌拒绝并提供一个可参与聚餐的替代方式。",TABLE),
 item("E12","A2","拜访住宅","进入韩国朋友家前先问","第一次到朋友家做客。",
 "신발을 여기서 벗으면 될까요?","허락 없이 신발 신고 들어가겠습니다.",
 "韩国民宅常需脱鞋，但家庭、空间和无障碍需求存在差异，最好先确认主人习惯。",
 "네, 신발장 옆에 두세요.","进入家门前询问鞋子与随身物品的放置位置。",LIFE),
 item("E13","A2","工作沟通","会议迟到时的表达","交通延误，可能晚到十分钟。",
 "예정보다 십 분 늦을 것 같습니다. 죄송합니다.","늦어요. 알아서 하세요.",
 "及时告知预计到达时间和解决办法，比只有笼统道歉更能让对方安排工作。",
 "알겠습니다. 도착하시면 연락해 주세요.","说明情况、预计到达时间、后续联系办法。",GREET),
 item("E14","A2","工作邮件","第一次联系客户","给不熟悉的韩国客户发会议确认邮件。",
 "안녕하세요. 회의 일정 확인차 연락드립니다.","회의 언제?（正式首次联络）",
 "首次联系先交代身份与主题，再提出具体确认事项；不同团队语言风格会变化。",
 "금요일 오후 세 시가 좋겠습니다.","写一条短而自然的韩语会议确认消息。",HONOR),
 item("E15","A2","表达道歉","文件发错了如何补救","给教授或主管发错了文件版本。",
 "파일을 잘못 보내 드렸습니다. 수정본을 다시 전달하겠습니다.","괜찮죠? 그냥 보세요.",
 "先承认具体错误、说明修正文件与时间，不用笼统口号代替行动。",
 "수정본은 언제 받을 수 있나요?","道歉并说明修改方式与截止时间。",GREET),
 item("E16","B1","边界与拒绝","如何拒绝不合理的请求","同事希望你周末加班，但你无法接受。",
 "이번 주말에는 어렵지만 월요일에는 도와드릴 수 있습니다.","네, 무조건 하겠습니다.（并不想答应）",
 "礼貌不等于必须服从。可以清楚拒绝并提出可行替代方案。",
 "알겠습니다. 월요일에 같이 확인해 봅시다.","礼貌拒绝，同时明确自己的时间边界。",HONOR),
 item("E17","B1","意见分歧","反对同事观点又不失尊重","韩国团队讨论两套方案，你持不同意见。",
 "말씀하신 점은 이해하지만 다른 방법도 검토해 보고 싶습니다.","그건 완전히 틀렸어요.（不提供依据）",
 "先复述对方关切，再说明依据和折中方案，比单纯用敬语否定对方更有效。",
 "좋습니다. 다른 방법의 장단점도 확인합시다.","先承认合理之处，再提出一个依据和一个折中方案。",HONOR),
 item("E18","B2","文化语用","敬语不等于所有人的统一规则","跨年龄和跨国籍团队里，成员对称谓有不同习惯。",
 "서로 편한 호칭과 말투를 먼저 정해 보면 어떨까요?","나이가 많으니까 무조건 내 말을 따라야 해요.",
 "称谓、语体、职级、年龄和个人意愿都影响交流；避免把文化习惯武断地变成普遍规定。",
 "좋아요. 서로 존중하는 방식으로 정합시다.","就团队礼貌称谓发起协商，并让每个人表达自己的偏好。",HONOR)
];
export const CULTURE_SOURCES=Object.freeze([
 {label:"Korea.net · Korean greetings and honorifics",url:GREET},
 {label:"National Institute of Korean Language · Honorific speech",url:HONOR},
 {label:"Korea.net · Table manners (contextual, not universal)",url:TABLE},
 {label:"Korea.net · Life and culture guide (PDF)",url:LIFE}
]);
export const CULTURE_TOPICS=Object.freeze([...new Set(CULTURE_CASES.map(c=>c.topic))]);
export function cultureCase(id){return CULTURE_CASES.find(c=>c.id===id)||null}
export function gradeEtiquette(caseId,choice){
 const c=cultureCase(caseId);if(!c)throw Error("Unknown Korean etiquette case");
 if(choice!=="good"&&choice!=="bad")throw Error("Please make a choice");
 return {caseId,correct:choice==="good",expected:c.good,explanation:c.why,source:c.source};
}
