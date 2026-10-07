/* Korean Media Study · Product UI V3
   Task-specific presentation, real content first, no simulated model streaming. */
(()=>{
"use strict";
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const getSaved=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k))??fallback}catch{return fallback}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const getDegree=()=>localStorage.getItem("zacharyKoreanDegree")||"master";
const labels={undergrad:"本科",master:"硕士",phd:"博士"};
let activeView="today", activeModule="K01", quizIndex=0, dialogueIndex=0, dialogueTurn=0;
let dialogueLog=[];
const bank=[
 {q:"‘따라서’는 어떤 기능을 합니까?",zh:"따라서 在句中通常表示什么？",opts:["转折","得出结论","并列","举例"],a:1,explain:"따라서＝因此，用来引出由前文推导的结果。"},
 {q:"‘상관관계’와 ‘인과관계’는 어떻게 다릅니까?",zh:"相关关系与因果关系有什么区别？",opts:["完全一样","相关必然表示因果","相关不自动证明因果","只在文学研究中使用"],a:2,explain:"研究数据里即使发现相关，也不能直接说 A 导致 B。"},
 {q:"‘문의드리고 싶습니다’는 언제 적절합니까?",zh:"这个表达适用于哪种场景？",opts:["给大学行政工作人员礼貌咨询","命令陌生人","对朋友发火","结束考试"],a:0,explain:"드리다 表示谦敬；用于正式咨询邮件或与校方沟通更自然。"},
 {q:"캠페인 성과를 평가할 때 무엇이 중요합니까?",zh:"评估传播 Campaign 时应当做什么？",opts:["只看点赞","只看曝光","按目标综合看认知、态度、行为","不需要数据"],a:2,explain:"测量应与 Campaign 目标对应，单一指标不代表最终效果。"},
 {q:"‘저는 광고를 연구하고 싶습니다.’ 的意思是什么？",zh:"请选择最准确的翻译。",opts:["我研究过广告","我想研究广告","我不喜欢广告","我已经毕业"],a:1,explain:"-(으)고 싶습니다 表示希望做某事，语气正式。"}
];
const writePrompts={
 topik:{title:"TOPIK II 写作训练",ko:"생성형 AI가 광고와 미디어 산업에 미치는 영향에 대해 자신의 의견을 쓰십시오.",zh:"说明生成式 AI 对广告与媒体行业的影响，陈述观点、依据和合理的使用方式。",target:"PBT 54 题训练方向：600–700 字符，实际要求以官方真题为准",rubric:["是否完整回应题目","段落结构和逻辑连接","词汇、语法、正式书面语"]},
 email:{title:"给教授写邮件",ko:"연구 관심과 관련하여 교수님께 면담을 정중하게 요청하는 메일을 쓰십시오.",zh:"给教授写一封礼貌的研究方向咨询邮件，明确说明身份、目的和请求。",target:"真实任务，无固定字数",rubric:["邮件主题与称呼","清楚的目的和具体请求","礼貌自然的敬语"]},
 work:{title:"Campaign Brief",ko:"새로운 브랜드 캠페인의 타깃, 인사이트, 메시지, 채널과 성과 지표를 설명하십시오.",zh:"说明目标受众、洞察、传播信息、渠道角色和效果衡量。",target:"真实职场任务，无固定字数",rubric:["策略要素完整","指标与目标对应","专业用语自然、简洁"]}
};
const dialogues=[
 {key:"university",label:"大学行政咨询",goal:"确认面试材料与提交期限",
  rows:[["안녕하세요. 무엇을 도와드릴까요?","您好，有什么可以帮您？","입학 관련해서 문의드리고 싶습니다."],["어떤 서류를 확인하고 싶으세요?","您想确认什么材料？","서류 제출 마감일과 면접 일정을 확인하고 싶습니다."],["안내 페이지를 확인해 주시겠어요?","您可以查看信息页面吗？","네, 확인하겠습니다. 감사합니다."]]},
 {key:"agency",label:"广告客户会议",goal:"说明未知问题，并提出下一步验证",
  rows:[["노출은 늘었는데 전환은 왜 그대로인가요?","曝光增加了，为什么转化没有变化？","현재 자료만으로 원인을 단정하기 어렵습니다."],["그럼 먼저 무엇을 확인할 계획인가요?","那您打算先检查什么？","채널별 행동 데이터를 확인하고 가설을 비교하겠습니다."],["언제 결과를 공유할 수 있나요?","什么时候能分享结果？","일정을 확인한 뒤 가능한 시점을 안내드리겠습니다."]]},
 {key:"cafe",label:"咖啡店日常交流",goal:"清楚点单、确认金额与取餐",
  rows:[["어서 오세요. 주문하시겠어요?","欢迎光临，要点单吗？","아이스 아메리카노 한 잔 주세요."],["사이즈는 어떻게 해 드릴까요?","需要什么杯型？","중간 사이즈로 부탁드립니다."],["드시고 가세요, 가지고 가세요?","堂食还是外带？","가지고 갈게요. 감사합니다."]]}
];
const stage=$("#v3-studio-body");
function completed(){
 const arr=getSaved("zacharyKoreanDone",[]);
 return Array.isArray(arr)?arr.filter(x=>Number.isInteger(x)&&x>0&&x<=48):[];
}
function renderProgress(){
 const arr=completed();
 const number=$("#v3-count"),next=$("#v3-next-caption");
 if(number)number.textContent=arr.length+"/48 节课程已学习";
 if(next)next.textContent=arr.length===48?"48 节已标记完成。可继续做真实应用练习。":"已有 "+arr.length+" 节课程标记完成；从第 "+(Array.from({length:48},(_,i)=>i+1).find(i=>!arr.includes(i))||48)+" 课继续。";
}
function updateNav(){
 $$("[data-v3-nav]").forEach(b=>{const v=b.dataset.v3Nav;b.classList.toggle("active",v===activeView||(v==="practice"&&(activeView==="conversation"||activeView==="writing")));b.setAttribute("aria-current",b.classList.contains("active")?"page":"false");});
}
function scrollTop(){window.scrollTo({top:0,behavior:"instant"});}
function setView(view,opts={}){
 let v=view||"today";
 if(v==="practice")v="conversation";
 if(v==="vocab")v="vocab";
 activeView=v;
 document.body.dataset.view=v;
 updateNav();
 if(v==="course")activateModule(opts.module||activeModule,false);
 if(["topik","writing","conversation","vocab-card"].includes(v))renderStudio(v,opts);
 if(v==="today")renderProgress();
 if(!opts.silent){
   history.replaceState(null,"","#/"+(v==="course"?v+"/"+activeModule:v));
   scrollTop();
 }
}
function activateModule(id,scroll=true){
 if(!$("#"+id))id="K01";
 activeModule=id;
 $$(".module").forEach(el=>el.classList.toggle("active-module",el.id===id));
 $$(".v3-module-bar button").forEach(b=>{const same=b.dataset.module===id;b.classList.toggle("active",same);b.setAttribute("aria-pressed",same?"true":"false");});
 if(scroll)scrollTop();
}
function expandLesson(el){
 if(!el)return;
 $$(".lesson.v3-expanded").forEach(x=>{if(x!==el){x.classList.remove("v3-expanded");x.querySelector(".v3-open-label")?.replaceChildren("展开");}});
 el.classList.toggle("v3-expanded");
 const label=el.querySelector(".v3-open-label");if(label)label.textContent=el.classList.contains("v3-expanded")?"收起":"展开";
}
function openLesson(n){
 const id="K"+String(Math.ceil(n/4)).padStart(2,"0");
 setView("course",{module:id});
 const el=$("#L"+n);if(el&&!el.classList.contains("v3-expanded"))expandLesson(el);
 if(el)el.scrollIntoView({behavior:"smooth",block:"start"});
}
function sendToCopy(text,where){
 const status=where||$("#v3-status");
 if(navigator.clipboard?.writeText){
   navigator.clipboard.writeText(text).then(()=>{if(status)status.textContent="已复制。可以粘贴到你已连接的 ChatGPT 对话中继续练习。";}).catch(()=>{if(status)status.textContent="浏览器限制剪贴板，请手动选中文本复制。";});
 } else {
   const temp=document.createElement("textarea");temp.value=text;temp.style.position="fixed";temp.style.opacity="0";document.body.appendChild(temp);temp.select();const ok=document.execCommand?.("copy");temp.remove();
   if(status)status.textContent=ok?"已复制。":"无法自动复制，请手动复制。";
 }
}
function speakKo(text,where){
 if(!("speechSynthesis" in window)){if(where)where.textContent="本设备没有可用的语音朗读。";return}
 speechSynthesis.cancel();const utt=new SpeechSynthesisUtterance(text);utt.lang="ko-KR";utt.rate=.85;speechSynthesis.speak(utt);
}
function renderStudio(kind,opts={}){
 if(!stage)return;
 const heading=$("#v3-studio-heading"), kicker=$("#v3-studio-kicker");
 if(kind==="topik"){
   if(heading)heading.textContent="TOPIK，练到真正理解。";
   if(kicker)kicker.textContent="TOPIK PRACTICE";
   renderQuiz();
 }else if(kind==="writing"){
   if(heading)heading.textContent="先写你的想法，再修改。";
   if(kicker)kicker.textContent="WRITING PRACTICE";
   renderWriting(opts.kind||"topik");
 }else if(kind==="conversation"){
   if(heading)heading.textContent="让韩语进入真实生活。";
   if(kicker)kicker.textContent="REAL CONVERSATION";
   renderDialogue(opts.scene||dialogues[dialogueIndex]?.key||"university",true);
 }else if(kind==="vocab-card"){
   if(heading)heading.textContent="一个词，真的学会使用。";
   if(kicker)kicker.textContent="VOCABULARY";
   renderVocabCard(opts.term||"설득커뮤니케이션");
 }
}
function renderQuiz(){
 const q=bank[quizIndex%bank.length];
 stage.innerHTML='<p class="v3-lead">一题一题来；先作答，再看解释。以下为原创训练题，不是官方 TOPIK 原题。</p>'+
 '<section class="v3-stage"><div class="v3-row"><span class="v3-tag">练习 '+(quizIndex+1)+' / '+bank.length+'</span><span class="v3-small">TOPIK 思维训练</span></div><div class="v3-question" style="margin:18px 0 8px">'+esc(q.q)+'</div><p class="v3-lead">'+esc(q.zh)+'</p><div id="v3-options">'+q.opts.map((o,i)=>'<button type="button" class="v3-option" data-v3-option="'+i+'">'+String.fromCharCode(65+i)+' · '+esc(o)+'</button>').join("")+'</div><div id="v3-quiz-feedback" aria-live="polite"></div></section>'+
 '<div class="v3-action-row"><button class="v3-secondary" id="v3-next-quiz" type="button">下一题 →</button><button class="v3-secondary" type="button" data-v3-action="writing">练 TOPIK 写作</button></div>';
 $$("[data-v3-option]",stage).forEach(b=>b.addEventListener("click",()=>{
   if($("#v3-quiz-feedback").children.length)return;
   const choice=Number(b.dataset.v3Option);
   $$("[data-v3-option]",stage).forEach(x=>x.disabled=true);
   b.classList.add(choice===q.a?"correct":"wrong");
   stage.querySelector('[data-v3-option="'+q.a+'"]').classList.add("correct");
   $("#v3-quiz-feedback").innerHTML='<div class="v3-result"><strong>'+(choice===q.a?"答对了。":"这道题还没掌握。")+'</strong><p class="v3-lead">'+esc(q.explain)+'</p><details class="v3-reveal"><summary>为什么其他选项不对？</summary><p>理解题目中的连接词、语体或研究语境，比背选项更重要。试着用自己的话解释再继续。</p></details></div>';
 }));
 $("#v3-next-quiz").onclick=()=>{quizIndex=(quizIndex+1)%bank.length;renderQuiz();};
}
function renderWriting(kind){
 const keys=Object.keys(writePrompts),k=writePrompts[kind]?kind:"topik",task=writePrompts[k];
 const drafts=getSaved("koreanMediaSiteWritingDrafts",{});
 stage.innerHTML='<div class="v3-row-wrap"><label for="v3-kind" class="v3-label">选择写作任务</label><select id="v3-kind" class="v3-control">'+keys.map(x=>'<option value="'+x+'" '+(k===x?"selected":"")+'>'+esc(writePrompts[x].title)+'</option>').join("")+'</select></div>'+
 '<section class="v3-stage"><span class="v3-tag">真实输出练习</span><h3 style="margin:13px 0 9px">'+esc(task.title)+'</h3><div class="v3-question">'+esc(task.ko)+'</div><p class="v3-lead">'+esc(task.zh)+'</p><p class="v3-status">'+esc(task.target)+'</p></section>'+
 '<label for="v3-draft" class="v3-label">你的韩语正文</label><textarea id="v3-draft" class="v3-editor" spellcheck="false" placeholder="请先写完整一版，不必害怕犯错。"></textarea>'+
 '<div class="v3-row"><span class="v3-small" id="v3-char-count">0 字符</span><span class="v3-saved" id="v3-draft-state" role="status">自动保存在当前浏览器</span></div>'+
 '<div class="v3-action-row"><button id="v3-save-draft" class="v3-primary">保存草稿</button><button id="v3-copy-draft" class="v3-secondary">复制给 ChatGPT 批改</button><button id="v3-erase-draft" class="v3-secondary">清空当前草稿</button></div><p id="v3-status" class="v3-status" role="status">独立网页不会自动给写作打 AI 分数。连接 ChatGPT 中的插件后，可在对话里获取分项反馈并重写。</p>'+
 '<details class="v3-reveal"><summary>展开写作评价标准</summary><ol>'+task.rubric.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol></details>';
 const ta=$("#v3-draft");ta.value=drafts[k]||"";
 const count=$("#v3-char-count");const setCount=()=>{count.textContent=[...ta.value].length+" 字符";};setCount();
 ta.oninput=()=>{const next=getSaved("koreanMediaSiteWritingDrafts",{});next[k]=ta.value;const ok=save("koreanMediaSiteWritingDrafts",next);setCount();$("#v3-draft-state").textContent=ok?"已保存到本机":"保存失败，请先手动复制备份";};
 $("#v3-kind").onchange=e=>renderWriting(e.target.value);
 $("#v3-save-draft").onclick=()=>{const next=getSaved("koreanMediaSiteWritingDrafts",{});next[k]=ta.value;$("#v3-status").textContent=save("koreanMediaSiteWritingDrafts",next)?"草稿已保存在此浏览器。":"保存失败，请复制备份。";};
 $("#v3-copy-draft").onclick=()=>{
  if(!ta.value.trim()){$("#v3-status").textContent="请先写一段韩文，再提交批改。";return;}
  sendToCopy("请用韩语教师身份批改我的写作，先评价任务完成度、逻辑、用词与敬语，再逐句解释关键错误，保留原意给出更自然版本，最后要求我重写3句话。训练成绩不能当作官方TOPIK成绩。题目："+task.ko+"\n我的答案：\n"+ta.value+"\n评价维度："+task.rubric.join("、"),$("#v3-status"));
 };
 $("#v3-erase-draft").onclick=()=>{
  if(!confirm("清空这篇草稿？此操作无法撤销。"))return;
  ta.value="";ta.dispatchEvent(new Event("input"));$("#v3-status").textContent="当前草稿已清空。";
 };
}
function renderDialogue(key,reset=true){
 const i=dialogues.findIndex(x=>x.key===key);
 dialogueIndex=i===-1?0:i;
 const sc=dialogues[dialogueIndex];
 if(reset){dialogueTurn=0;dialogueLog=[];}
 const row=sc.rows[dialogueTurn]||sc.rows[0];
 stage.innerHTML='<div class="v3-row-wrap"><label class="v3-label" for="v3-scene">选择真实情境</label><select id="v3-scene" class="v3-control">'+dialogues.map(x=>'<option value="'+x.key+'" '+(x.key===sc.key?"selected":"")+'>'+esc(x.label)+'</option>').join("")+'</select></div>'+
 '<div class="v3-stage navy"><div class="v3-label" style="color:#b6cbdc">场景目标</div><h3 style="font-size:21px;margin:6px 0 10px">'+esc(sc.label)+'</h3><p class="v3-lead">'+esc(sc.goal)+'</p></div>'+
 '<div class="v3-row"><span class="v3-tag">第 '+(dialogueTurn+1)+' / '+sc.rows.length+' 回合</span><button id="v3-play-ko" class="v3-secondary">🔊 听对方说话</button></div>'+
 '<section class="v3-stage"><div class="v3-label">对方</div><div class="v3-question">'+esc(row[0])+'</div><p class="v3-lead">'+esc(row[1])+'</p></section>'+
 '<label class="v3-label" for="v3-reply">你的韩语回答</label><textarea class="v3-editor" id="v3-reply" style="min-height:115px" placeholder="请先独立回答。简单而准确，比背复杂句子更重要。"></textarea>'+
 '<div class="v3-action-row"><button class="v3-primary" id="v3-continue">提交本轮回答</button><button class="v3-secondary" id="v3-hint">先看一个表达提示</button><button class="v3-secondary" id="v3-copy-conversation">复制练习记录</button></div><div id="v3-dialogue-feedback" aria-live="polite"></div><p class="v3-status" id="v3-status">网页模式提供分轮场景和参考回应，不会假装独立完成 AI 语法评分。想要 AI 实时追问，请在已连接的 ChatGPT 插件中继续。</p>';
 $("#v3-scene").onchange=e=>renderDialogue(e.target.value,true);
 $("#v3-play-ko").onclick=()=>speakKo(row[0],$("#v3-status"));
 $("#v3-hint").onclick=()=>{$("#v3-dialogue-feedback").innerHTML='<div class="v3-result"><strong>表达提示</strong><p class="v3-answer">'+esc(row[2])+'</p><p class="v3-small">这是参考句，不是唯一正确答案。</p></div>';};
 $("#v3-continue").onclick=()=>{
  const answer=$("#v3-reply").value.trim();
  if(!answer){$("#v3-status").textContent="请先输入至少一句韩语。";return;}
  dialogueLog.push({question:row[0],answer,example:row[2]});
  $("#v3-dialogue-feedback").innerHTML='<div class="v3-result"><span class="v3-tag">完成本轮</span><h3>你已经完成了一次真实回应。</h3><p class="v3-small">参考表达（仅供比较，不是对你答案的自动评分）：</p><p class="v3-answer">'+esc(row[2])+'</p><details class="v3-reveal"><summary>对照自己的句子</summary><p>'+esc(answer)+'</p></details><div class="v3-action-row">'+(dialogueTurn<sc.rows.length-1?'<button type="button" id="v3-dialog-next" class="v3-primary">下一回合 →</button>':'<button type="button" id="v3-dialog-restart" class="v3-primary">重新挑战</button>')+'</div></div>';
  $("#v3-continue").disabled=true;
  const next=$("#v3-dialog-next");if(next)next.onclick=()=>{dialogueTurn++;renderDialogue(sc.key,false);};
  const restart=$("#v3-dialog-restart");if(restart)restart.onclick=()=>renderDialogue(sc.key,true);
 };
 $("#v3-copy-conversation").onclick=()=>{
  if(!dialogueLog.length){$("#v3-status").textContent="先完成一轮再复制。";return;}
  const content="请作为韩国本地对话伙伴，继续以下场景："+sc.label+"，先自然追问两轮，再从任务完成、敬语、自然度纠错并要求我重说。练习记录：\n"+dialogueLog.map((x,i)=>i+1+". 对方："+x.question+"\n我的回答："+x.answer).join("\n");
  sendToCopy(content,$("#v3-status"));
 };
}
function renderVocabCard(query){
 const q=String(query||"").trim();
 const vocab=$$(".vocab").map(el=>({ko:$("b",el)?.textContent.trim()||"",zh:$("span",el)?.textContent.trim()||"",en:$("small",el)?.textContent.trim()||""}));
 const hit=vocab.find(v=>v.ko===q)||vocab.find(v=>v.zh===q)||vocab.find(v=>v.ko.includes(q)||v.zh.includes(q))||null;
 if(!hit){
  stage.innerHTML='<div class="v3-result"><h3>词典里暂时没有这个词。</h3><p class="v3-lead">可以到完整专业词典中浏览已有词条；未收录的词不自动编造解释。</p><div class="v3-action-row"><button class="v3-primary" data-v3-action="vocab">打开词典</button></div></div>';
  return;
 }
 stage.innerHTML='<div class="v3-stage"><div class="v3-row"><div><div class="v3-label">专业韩语</div><h2 style="font-size:30px;margin:4px 0">'+esc(hit.ko)+'</h2><p class="v3-lead">'+esc(hit.zh)+' · '+esc(hit.en)+'</p></div><button id="v3-say-word" class="v3-secondary">🔊 发音</button></div></div>'+
 '<div class="v3-result"><span class="v3-tag">应用到真实场景</span><p class="v3-lead">试着把这个词放进一句你自己会说的话。不要只背中文释义。</p><div class="v3-action-row"><button class="v3-secondary" data-v3-action="conversation">去对话训练</button><button class="v3-secondary" data-v3-action="writing">去写作训练</button><button class="v3-secondary" data-v3-action="vocab">查看完整词典</button></div></div>';
 $("#v3-say-word").onclick=()=>speakKo(hit.ko);
}
function intent(q){
 const str=String(q||"").trim();
 if(!str)return setView("today");
 if(/TOPIK|考试|考级|模考|刷题|词义推断|阅读理解/i.test(str))return setView("topik");
 if(/写作|作文|邮件|写信|研究计划|批改|brief|文书/i.test(str))return setView("writing",{kind:/邮件|教授/i.test(str)?"email":/campaign|客户|品牌/i.test(str)?"work":"topik"});
 if(/对话|口语|开口|聊天|客户会议|面试|咖啡|沟通|交流/i.test(str)){
  const scene=/商务|客户|campaign|会议|AE/i.test(str)?"agency":/咖啡|点单|生活/i.test(str)?"cafe":"university";
  return setView("conversation",{scene});
 }
 if(/电视剧|韩剧|原声|原片|跟读|shadowing|预告/i.test(str))return setView("originals");
 if(/首尔大|中央大|学校|招生|SNU|CAU|大学|专业比较/i.test(str))return setView("schools");
 if(/词典|单词|词汇/i.test(str))return setView("vocab");
 if(/语法|字母|课程|48节/i.test(str))return setView("course");
 if(/[\uac00-\ud7af]/.test(str) && str.length<35)return setView("vocab-card",{term:str});
 $("#v3-answer").innerHTML='<div class="v3-result"><h3>先选一个你最想完成的学习任务。</h3><p class="v3-lead">这里先用明确的学习意图导航，不会假装已经理解所有自然语言。ChatGPT 中的 MCP 版本可由模型选择更适合的互动工具。</p><div class="v3-intent-chips"><button data-v3-action="topik">TOPIK</button><button data-v3-action="conversation">真实对话</button><button data-v3-action="writing">写作</button><button data-v3-action="originals">韩剧原片</button></div></div>';
 $("#v3-answer").scrollIntoView({behavior:"smooth",block:"nearest"});
}
function init(){
 renderProgress();
 const initial=location.hash.replace(/^#\//,"").split("/");
 const view=["today","topik","conversation","writing","originals","drama","phrases","course","vocab","vocab-card","schools","labs"].includes(initial[0])?initial[0]:"today";
 setView(view,{silent:true,module:initial[1]});
 const prompt=$("#v3-prompt");$("#v3-query")?.addEventListener("submit",e=>{e.preventDefault();intent(prompt.value);});
 $("#course-search")?.addEventListener("input",e=>{
   const query=e.target.value.trim().toLowerCase();
   if(!query)return;
   const match=$$(".lesson").find(x=>x.innerText.toLowerCase().includes(query));
   if(match){setView("course",{module:match.closest(".module").id});if(!match.classList.contains("v3-expanded"))expandLesson(match);}
 });
 $$("[data-v3-chip]").forEach(b=>b.onclick=()=>{prompt.value=b.dataset.v3Chip;intent(prompt.value);});
 $$("[data-v3-nav]").forEach(b=>b.onclick=()=>setView(b.dataset.v3Nav));
 const lesson=$("#v3-next-lesson");if(lesson)lesson.onclick=()=>{const ids=completed(),n=Array.from({length:48},(_,i)=>i+1).find(i=>!ids.includes(i))||1;openLesson(n);};
 document.addEventListener("click",ev=>{const b=ev.target.closest("[data-module]");if(b)setView("course",{module:b.dataset.module});});
 $$("[data-go]").forEach(b=>b.addEventListener("click",()=>{if(/^K\d{2}$/.test(b.dataset.go)){setView("course",{module:b.dataset.go});}else if(b.dataset.go==="originals"||b.dataset.go==="schools"||b.dataset.go==="drama"||b.dataset.go==="vocab"||b.dataset.go==="phrases"||b.dataset.go==="labs"){setView(b.dataset.go);}},true));
 $$(".lesson .lesson-head").forEach(head=>{
   const el=head.closest(".lesson");
   const h=head.querySelector("h3");if(!h)return;
   const n=el.dataset.num;
   h.setAttribute("role","button");h.setAttribute("tabindex","0");h.setAttribute("aria-label","展开或收起第"+n+"课");
   head.insertAdjacentHTML("beforeend",'<button type="button" class="v3-secondary v3-open-label" style="padding:5px 9px;font-size:11px" aria-label="展开课程内容">展开</button>');
   h.addEventListener("click",()=>expandLesson(el));
   h.addEventListener("keydown",ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();expandLesson(el);}});
   $(".v3-open-label",head).addEventListener("click",()=>expandLesson(el));
 });
 const outline=$("#v3-outline");
 if(outline)outline.innerHTML=Array.from({length:12},(_,i)=>{
  const id="K"+String(i+1).padStart(2,"0");
  const title=$("#"+id+" h2")?.textContent.trim().replace(/^第.+?｜/,"")||"阶段 "+(i+1);
  return '<button type="button" data-module="'+id+'">'+id+' · '+esc(title)+'</button>';
 }).join("");
 const go=$("#v3-course-map");
 if(go)go.onclick=()=>setView("course");
 activateModule(activeModule,false);
 document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-v3-action]");
  if(!btn)return;
  if(btn.closest("#v3-home")||btn.closest("#v3-studio")){setView(btn.dataset.v3Action);}
 });
 window.addEventListener("storage",ev=>{if(ev.key==="zacharyKoreanDone")renderProgress();});
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();
