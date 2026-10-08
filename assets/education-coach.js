import {LEVEL_IDS,ASSESSMENTS,checkpointItems} from "../lib/learning-assessments.mjs";
import {KOREAN_UNITS} from "../lib/real-life-curriculum.mjs";
import {STORE_KEY,emptyStudy,safeStudy} from "../lib/real-life-study.mjs";
import {EVIDENCE_KEY,emptyEvidence,safeEvidence,assessAnswers,computePlacement,
 createCheck,saveCheck,stageState,todayPlan,recordExternalReview,feedbackPrompt,
 dueRevisions,repeatWithFeedback,DAY}
 from "../lib/learning-evidence.mjs";
const root=document.querySelector("#education-coach");
if(!root)throw Error("Education coach container missing");
const enc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const get=(key,defaultValue)=>{try{return JSON.parse(localStorage.getItem(key))||defaultValue}catch{return defaultValue}};
let evidence=safeEvidence(get(EVIDENCE_KEY,emptyEvidence()));
let study=safeStudy(get(STORE_KEY,emptyStudy()));
let screen="home",run=null,placementScores={},result=null,checkLevel="A0",revisionId=null;
const el=id=>document.getElementById(id);
const saveEvidence=()=>{try{localStorage.setItem(EVIDENCE_KEY,JSON.stringify(evidence));return true}catch{message("浏览器无法保存学习证据，请导出备份。");return false}};
const refresh=()=>{evidence=safeEvidence(get(EVIDENCE_KEY,emptyEvidence()));study=safeStudy(get(STORE_KEY,emptyStudy()));};
function message(value){const x=el("ec-message");if(x)x.textContent=value;}
function shell(content){
 root.innerHTML='<div class="ec-shell">'+content+
 '<p id="ec-message" role="status" aria-live="polite" class="ec-note">分级检查只反映特定题目；软件不能独立认证韩语口语、发音或 CEFR 等级。</p></div>';
}
function openScreen(s){screen=s;render();root.scrollIntoView({block:"start",behavior:"instant"});}
function openUnit(id){
 document.dispatchEvent(new CustomEvent("kms:journey-request",{detail:{unitId:id}}));
}
function listen(ko,callback){
 if(!("speechSynthesis" in window)){message("本设备没有可用韩语朗读。可使用文字替代，但本题不计真实听力证据。");return;}
 const utterance=new SpeechSynthesisUtterance(ko);
 utterance.lang="ko-KR";utterance.rate=.82;
 const voices=speechSynthesis.getVoices?.()||[];
 const preferred=voices.find(v=>String(v.lang).toLowerCase().startsWith("ko"));
 if(preferred)utterance.voice=preferred;
 utterance.onstart=()=>{if(callback)callback();message("正在播放设备生成的韩语；此记录仅证明尝试了朗读练习。");};
 utterance.onerror=()=>message("朗读未能成功开始，不计听力证据。可使用文字模式继续。");
 speechSynthesis.cancel();speechSynthesis.speak(utterance);
}
function openQuiz(kind,level,repeat=false){
 run={kind,level,repeat,step:0,phase:"question",choices:[],heard:[],textFallback:[],dictationHeard:false,
    dictation:"",writing:"",usedHint:false};
 openScreen("quiz");
}
function initialPlacement(){
 placementScores={};openQuiz("placement","A0");
}
function levelLabel(level){return ASSESSMENTS[level].title;}
function renderHome(){
 refresh();const plan=todayPlan(evidence,study),placed=evidence.placement;
 const unit=KOREAN_UNITS.find(u=>u.id===plan.steps.find(s=>s.type==="lesson")?.unitId)||KOREAN_UNITS[0];
 const count=KOREAN_UNITS.filter(u=>study.units[u.id]?.practiced).length;
 const tasks=plan.steps.map((s,i)=>{
  const action=s.type==="placement"?"placement":s.type==="review"?"review":
   s.type==="checkpoint"?"recheck-"+s.level:s.type==="remediate"?"unit-"+s.unitId:
   s.type==="revision"?"revisions":s.type==="lesson"?"unit-"+s.unitId:"feedback";
  return '<button type="button" class="ec-plan-row" data-ec="'+action+'"><span class="ec-no">'+String(i+1).padStart(2,"0")+'</span>'+
   '<span><strong>'+enc(s.label)+'</strong><small>'+enc(s.reason)+'</small></span><em>'+s.minutes+' 分钟 →</em></button>';
 }).join("");
 const cards=LEVEL_IDS.map(level=>{
  const status=stageState(evidence,level);
  return '<div class="ec-stage"><div><span>'+enc(level)+'</span><h3>'+enc(levelLabel(level))+'</h3>'+
   '<p>'+enc(status.label)+'</p></div><button type="button" data-ec="check-'+level+'">'+
   (status.code==="retest"?"去延迟复测 →":status.code==="retained"?"查看保持记录 →":"做独立检查 →")+'</button></div>';
 }).join("");
 shell('<div class="ec-eyebrow">KOREAN MEDIA STUDY / LEARNING EVIDENCE</div>'+
 '<h1>知道自己学会了什么，还缺什么。</h1>'+
 '<p class="ec-lead">这不是刷完课程就升级。通过诊断找到起点，每天复习错误，做独立的听力、阅读与表达任务；24 小时以后验证是否真的记住。</p>'+
 '<div class="ec-metrics"><span><strong>'+count+'</strong> / 52 已练习单元</span>'+
 '<span><strong>'+plan.dueCount+'</strong> 个到期词汇</span>'+
 '<span><strong>'+(placed?enc(placed.recommend):"未诊断")+'</strong> 建议练习起点</span></div>'+
 '<div class="ec-actions"><button class="ec-primary" data-ec="'+(placed?"unit-"+unit.id:"placement")+'">'+
 (placed?"继续今天的真实任务 →":"开始零基础入学诊断 →")+'</button>'+
 '<button class="ec-secondary" data-ec="placement">重新做入学诊断</button>'+
 '<button class="ec-secondary" data-ec="backup">导出学习记录</button></div>'+
 '<div class="ec-block-title"><h2>今日学习建议</h2><p>先完成最可能影响保持与迁移的任务。</p></div>'+
 '<div class="ec-plan">'+tasks+'</div>'+
 '<div class="ec-block-title"><h2>五个阶段分别验收</h2><p>客观练习通过后，至少等待 24 小时再测试不同任务；仍不能替代真人自由会话评估。</p></div>'+
 '<div class="ec-stages">'+cards+'</div>'+
 '<div class="ec-block-title"><h2>获取可解释的反馈</h2><p>教师/练习伙伴的反馈要记录具体错误、修订与下一步。未经独立验证的反馈会如实标注。</p></div>'+
 '<div class="ec-actions"><button class="ec-secondary" data-ec="feedback">记录交流反馈 / 获取教师批改提示词</button>'+
 '<button class="ec-secondary" data-ec="records">复盘本机学习证据</button>'+
 '<button class="ec-secondary" data-ec="revisions">根据反馈重说 / 重写</button>'+
 '<button class="ec-secondary" data-ec="privacy">备份、恢复及清除进度</button></div>'+
 '<div class="ec-time"><label for="ec-minutes">每日计划：</label><select id="ec-minutes"><option value="10" '+(evidence.dailyMinutes===10?"selected":"")+
 '>10 分钟</option><option value="20" '+(evidence.dailyMinutes===20?"selected":"")+
 '>20 分钟</option><option value="30" '+(evidence.dailyMinutes===30?"selected":"")+
 '>30 分钟</option></select><span>学习建议按当前错题与证据动态调整，非强制计时。</span></div>');
}
function currentItem(){return checkpointItems(run.level,Boolean(run.repeat))[run.step];}
function renderQuiz(){
 const pack=ASSESSMENTS[run.level],q=currentItem();
 if(run.phase==="dictation")return renderDictation();
 if(run.phase==="transfer")return renderTransfer();
 const isListen=q.mode==="listening";
 const opts=q.options.map((value,i)=>'<button type="button" class="ec-choice" data-ec-choice="'+i+'"><span>'+String.fromCharCode(65+i)+'</span>'+enc(value)+'</button>').join("");
 shell('<button class="ec-back" data-ec="home">← 退出并返回进度</button>'+
 '<div class="ec-eyebrow">'+(run.kind==="placement"?"LEVEL PLACEMENT · 仅供分流":"INDEPENDENT SKILL CHECK · 客观部分")+'</div>'+
 '<h1>'+enc(pack.title)+'</h1><div class="ec-progress"><span>'+(run.step+1)+'/4</span><i style="width:'+((run.step+1)/4*100)+'%"></i></div>'+
 '<section class="ec-question"><p class="ec-label">'+(isListen?"听力理解 · 听完再选，不显示原文":"阅读理解 · 根据韩语句子选择意思")+'</p>'+
 (isListen?'<div class="ec-audio"><button type="button" data-ec="play-question">▶ 播放韩语</button>'+
 '<button class="ec-text-fallback" data-ec="reveal-question">声音不可用？改为文字</button>'+
 (run.textFallback[run.step]?'<p lang="ko">'+enc(q.ko)+'</p>':"")+'</div>':
 '<div class="ec-korean" lang="ko">'+enc(q.ko)+'</div>')+
 '<h2>'+enc(q.prompt)+'</h2><div class="ec-choices">'+opts+'</div></section>'+
 '<p class="ec-explain">每个选项只记录一次。答错的解释将在该阶段检查结束后展示，避免一题答案泄露到下一题。</p>');
}
function finishPlacementLevel(){
 const choices=run.choices.slice(),heard=run.heard.slice(),r=assessAnswers(run.level,choices,heard);
 placementScores[run.level]=r;
 const index=LEVEL_IDS.indexOf(run.level);
 if(r.score>=3&&index<LEVEL_IDS.length-1){openQuiz("placement",LEVEL_IDS[index+1]);return;}
 evidence.placement=computePlacement(placementScores);
 saveEvidence();openScreen("placement-result");
}
function renderPlacementResult(){
 const p=evidence.placement||computePlacement(placementScores);
 const scores=p.results.map(v=>'<div class="ec-score-row"><span>'+enc(v.level)+'</span><b>'+v.score+' / '+v.total+'</b></div>').join("");
 const next=KOREAN_UNITS.find(u=>u.level===p.recommend)||KOREAN_UNITS[0];
 shell('<div class="ec-eyebrow">PLACEMENT COMPLETED · 初步学习分流</div>'+
 '<h1>建议从 '+enc(p.recommend)+' 开始练习。</h1>'+
 '<p class="ec-lead">这是限定题目的阅读与词义理解分流建议，未独立检验发音、写作、自然会话或正式韩语级别。</p>'+
 '<div class="ec-score">'+scores+'</div>'+
 '<div class="ec-actions"><button class="ec-primary" data-ec="unit-'+next.id+'">从「'+enc(next.title)+'」开始 →</button>'+
 '<button class="ec-secondary" data-ec="home">回到今日学习计划</button></div>');
}

function renderDictation(){
 const pack=ASSESSMENTS[run.level];
 const target=run.repeat?pack.retry.dictation:pack.dictation;
 shell('<button class="ec-back" data-ec="home">← 返回今日计划</button>'+
 '<div class="ec-eyebrow">AUDIO DICTATION · 真实听辨</div>'+
 '<h1>听一遍，然后自己写出韩文。</h1>'+
 '<p class="ec-lead">系统不会先显示原文。你可以重复听；如果设备不能播放，可使用文字方式学习，但此项不会计入独立听力通过。</p>'+
 '<div class="ec-question"><button class="ec-audio-primary" data-ec="play-dictation">▶ 听韩语句子</button>'+
 '<button class="ec-text-fallback" data-ec="reveal-dictation">设备没声音？显示原文（不计听力）</button>'+
 (run.usedHint?'<p class="ec-korean" lang="ko">'+enc(target)+'</p>':"")+
 '<label class="ec-label" for="ec-dictation">你实际听到的韩语</label>'+
 '<textarea id="ec-dictation" class="ec-input" lang="ko" placeholder="请在这里逐字输入韩语；标点和空格不计分"></textarea>'+
 '<button class="ec-primary" data-ec="dictation-done">保存听写并继续 →</button></div>');
 const box=el("ec-dictation");if(box)box.value=run.dictation||"";
}
function renderTransfer(){
 const p=ASSESSMENTS[run.level];
 const task=run.repeat?p.retry:p.transfer;
 shell('<button class="ec-back" data-ec="home">← 退出</button>'+
 '<div class="ec-eyebrow">TRANSFER TASK · 不同语境应用</div>'+
 '<h1>把刚学的韩语用到新的情境。</h1>'+
 '<div class="ec-question"><p class="ec-label">独立表达任务</p>'+
 '<p class="ec-prompt">'+enc(task.prompt)+'</p>'+
 '<label class="ec-label" for="ec-transfer">你的韩语回答</label>'+
 '<textarea id="ec-transfer" class="ec-input" lang="ko" placeholder="用韩文独立回答，不看示范也能表达意思。"></textarea>'+
 '<button class="ec-secondary" data-ec="show-reference">需要提示？展开参考表达</button>'+
 (run.usedHint?'<p class="ec-answer-reference">'+enc(task.explanation||p.transfer.explanation)+'</p>':"")+
 '<p class="ec-warning">系统只能核对必须表达的关键词、听写和封闭题。它不会假装能自动评价语法、敬语得体度或真实口语流利程度。</p>'+
 '<button class="ec-primary" data-ec="finish-check">提交本次能力证据 →</button></div>');
 const box=el("ec-transfer");if(box)box.value=run.writing||"";
}
function renderCheckResult(){
 const r=result;if(!r)return openScreen("home");
 const status=stageState(evidence,r.level);
 const report=r.feedback.answers.map((row,i)=>{
  const q=checkpointItems(r.level,r.round==="delayed")[i];
  return '<div class="ec-result-item"><strong>'+(row.correct?"理解正确":"需要补练")+
    ' · '+enc(q.mode==="listening"?"听力":"阅读")+'</strong><p lang="ko">'+enc(q.ko)+'</p>'+
    '<p>'+enc(row.reason)+'</p>'+
    (q.mode==="listening"&&!row.listeningObserved?'<small>本题未取得真实听音尝试证据，只能按文本理解处理。</small>':"")+
    '</div>';
 }).join("");
 const missed=r.feedback.missing.length?
  '迁移任务缺少这些限定表达：'+r.feedback.missing.map(enc).join("、"):"限定语义关键词已出现（不保证语法自然）。";
 const actions='<button class="ec-primary" data-ec="home">根据反馈调整今日学习 →</button>'+
 '<button class="ec-secondary" data-ec="check-'+r.level+'">重新练本级客观检查</button>'+
 '<button class="ec-secondary" data-ec="feedback">转入教师/同伴反馈</button>';
 shell('<div class="ec-eyebrow">EVIDENCE · '+enc(r.level)+'</div>'+
 '<h1>'+(r.objectiveReady?"本轮限定客观项目通过。":"当前还有需要继续练习的项目。")+'</h1>'+
 '<p class="ec-lead">'+enc(status.label)+'。这不是韩语口语或 CEFR 等级证书。</p>'+
 '<div class="ec-metrics"><span><strong>'+r.score+' / 4</strong> 理解题</span>'+
 '<span><strong>'+r.listeningVerified+' / '+r.listeningPossible+'</strong> 真实听辨尝试</span>'+
 '<span><strong>'+Math.round(r.dictationSimilarity*100)+'%</strong> 限定句子听写接近度</span></div>'+
 '<div class="ec-block-title"><h2>你这次具体学会和没学会什么</h2><p>每道题说明依据；不会用一个总分掩盖听力或表达证据缺失。</p></div>'+
 '<div class="ec-check-details">'+report+'</div>'+
 '<div class="ec-result-item"><strong>听写对照</strong><p lang="ko">'+enc(r.feedback.dictationTarget)+'</p>'+
 '<p>你的输入：'+enc(r.feedback.dictationActual||"未提交")+'</p></div>'+
 '<div class="ec-result-item"><strong>真实表达可检查部分</strong><p>'+enc(missed)+'</p>'+
 '<p>'+enc(r.feedback.transferReference)+'</p><small>关键词验证不等于发音与自由交谈合格。</small></div>'+
 '<p class="ec-warning">'+enc(status.next)+'。若首次通过，必须至少24小时后使用不同句子复测，才记为客观保持证据。</p>'+
 '<div class="ec-actions">'+actions+'</div>');
}
function recentReply(level){
 const matches=KOREAN_UNITS.filter(u=>u.level===level).map(u=>study.missions?.[u.id]).filter(Boolean).sort((a,b)=>b.time-a.time);
 return matches[0]?.reply||"";
}
function renderFeedback(){
 refresh();
 const level=checkLevel;
 const notes=evidence.teacherNotes.filter(x=>x.level===level).slice(-3).reverse();
 const rows=notes.map(n=>'<div class="ec-result-item"><strong>'+new Date(n.time).toLocaleDateString("zh-CN")+
 ' · '+(n.source==="teacher"?"自填：教师":n.source==="partner"?"自填：交流伙伴":"自评")+'</strong>'+
 '<p>沟通意图 '+n.communication+'/4 · 语言准确 '+n.accuracy+'/4 · 连贯表达 '+(n.fluency==null?"未验证":n.fluency+"/4")+'</p>'+
 '<p>'+enc(n.notes)+'</p><small>此反馈由用户录入，未由平台独立核实来源或评分者身份。</small></div>').join("");
 const select=LEVEL_IDS.map(l=>'<option value="'+l+'" '+(l===level?"selected":"")+'>'+l+'</option>').join("");
 shell('<button class="ec-back" data-ec="home">← 返回学习证据</button>'+
 '<div class="ec-eyebrow">FORMATIVE FEEDBACK</div>'+
 '<h1>获得纠错，再完成第二次表达。</h1>'+
 '<p class="ec-lead">可以将自己的真实回答交给已连接的 ChatGPT 或韩语老师批改。网页版不直接假造 AI 口语测评；需要把外部反馈明确记录成“用户自行录入”。</p>'+
 '<section class="ec-question"><label class="ec-label" for="ec-feedback-level">练习阶段</label>'+
 '<select id="ec-feedback-level">'+select+'</select>'+
 '<label class="ec-label" for="ec-text-for-review">你要获得批改的韩语表达</label>'+
 '<textarea id="ec-text-for-review" class="ec-input" lang="ko">'+enc(recentReply(level))+'</textarea>'+
 '<button type="button" class="ec-secondary" data-ec="copy-teacher">复制严格的韩语教师反馈提示词</button>'+
 '<p class="ec-explain">复制后由你决定是否粘贴到 ChatGPT 或发给老师；软件不会自动上传文字。</p></section>'+
 '<div class="ec-block-title"><h2>记录下一次改进的依据</h2><p>错误、老师建议和重练结果都应留下可追溯记录。</p></div>'+
 '<p class="ec-explain">参考评分：0＝无法完成任务；1＝只能说单词；2＝可表达基本意思但需协助；3＝大体达意有局部错误；4＝表达清晰并能应对追问。只能对实际观察过的能力评分，没有听到口语时必须选择“未验证”。</p>'+
 '<section class="ec-question"><label class="ec-label" for="ec-source">反馈来源（用户自行声明）</label>'+
 '<select id="ec-source"><option value="self">自己复盘</option><option value="partner">实际交流伙伴</option><option value="teacher">韩语教师</option></select>'+
 '<div class="ec-score-fields">'+
 ['communication','accuracy','fluency'].map((key,i)=>'<label>'+["能否完成沟通意图","词汇语法准确性","表达连贯与流利度"][i]+
 '<select id="ec-'+key+'"><option value="">请选择</option>'+
 (key==="fluency"?'<option value="na">未验证（未听到语音）</option>':"")+
 [0,1,2,3,4].map(n=>'<option value="'+n+'">'+n+'/4</option>').join("")+'</select></label>').join("")+'</div>'+
 '<label class="ec-label" for="ec-note">具体错误、修改方式与下次任务（不少于12字）</label>'+
 '<textarea id="ec-note" class="ec-input" placeholder="例如：预约情境遗漏了最终时间确认。下次练习请加上复述时间并征求对方确认。"></textarea>'+
 '<button class="ec-primary" data-ec="save-feedback">保存反馈与下次复练依据 →</button></section>'+
 '<div class="ec-actions"><button class="ec-secondary" data-ec="revisions">打开纠错重说任务 →</button></div>'+
 '<div class="ec-block-title"><h2>此前记录</h2></div>'+(rows||'<p class="ec-explain">本级还没有反馈记录。</p>'));
}

function renderRecords(){
 refresh();
 const checks=LEVEL_IDS.map(l=>{
  const s=stageState(evidence,l);
  const a=evidence.checks[l]?.initial,d=evidence.checks[l]?.delayed;
  return '<div class="ec-stage"><div><span>'+l+'</span><h3>'+enc(s.label)+'</h3>'+
    '<p>初测：'+(a?a.score+'/4':'未做')+
    '；24小时复测：'+(d?d.score+'/4':'尚无')+'；真实会话：尚需外部验证。</p></div>'+
    '<button data-ec="check-'+l+'">'+(s.code==="retest"?"去复测":"练习或查看")+' →</button></div>';
 }).join("");
 const history=evidence.history.slice(-15).reverse().map(h=>'<div class="ec-history-row"><time>'+
 new Date(h.time).toLocaleDateString("zh-CN")+'</time><span>'+h.level+' '+(h.round==="delayed"?"延迟复测":"首次检查")+
 '</span><b>'+h.score+'/4</b><em>'+(h.objectiveReady?"限定检查通过":"需补练")+'</em></div>').join("");
 const stored=evidence.teacherNotes.length;
 shell('<button class="ec-back" data-ec="home">← 返回今日计划</button>'+
 '<div class="ec-eyebrow">EVIDENCE HISTORY · 学习证据</div><h1>用真实复测记录，而不是连续打卡代替学习。</h1>'+
 '<p class="ec-lead">记录有限客观题、设备听音尝试、学习者输入、复习和外部反馈，明确保留“不知道”“需要补练”“尚未验证”。</p>'+
 '<div class="ec-metrics"><span><strong>'+evidence.history.length+'</strong> 次限定能力检查</span>'+
 '<span><strong>'+stored+'</strong> 份自填人工/同伴反馈</span>'+
 '<span><strong>'+Object.keys(study.cards||{}).length+'</strong> 张已接触复习卡</span></div>'+
 '<div class="ec-block-title"><h2>各阶段状态</h2></div><div class="ec-stages">'+checks+'</div>'+
 '<div class="ec-block-title"><h2>最近的评估证据</h2></div><div class="ec-history">'+(history||'<p class="ec-explain">尚未进行能力检查。</p>')+'</div>'+
 '<div class="ec-actions"><button class="ec-primary" data-ec="feedback">补充教师纠错与重练计划 →</button>'+
 '<button class="ec-secondary" data-ec="backup">导出可保留的学习证据</button></div>');
}
function renderPrivacy(){
 shell('<button class="ec-back" data-ec="home">← 返回学习计划</button>'+
 '<div class="ec-eyebrow">DATA OWNERSHIP · 学习记录属于你</div>'+
 '<h1>保存、恢复或彻底清除学习进度。</h1>'+
 '<p class="ec-lead">本站不要求注册；个人练习、错题、阶段评估及反馈只保存在当前浏览器。更换设备或清理缓存会造成记录丢失；建议定期自行备份。</p>'+
 '<div class="ec-question"><h2>导出个人学习记录</h2>'+
 '<p class="ec-explain">导出 JSON 文件，含学习路径、答题结果、自由韩语回答和自己录入的反馈。请妥善保管，不要公开上传。</p>'+
 '<label class="ec-check"><input id="ec-private" type="checkbox"/> 同时包含旧版写作草稿、私人字幕练习盒及申请偏好（可能含敏感文字）</label>'+
 '<button class="ec-primary" data-ec="backup">下载我的本地学习备份 →</button></div>'+
 '<div class="ec-question"><h2>从之前的备份恢复</h2>'+
 '<p class="ec-explain">仅接受本站导出的 JSON，大小不超过 1MB；恢复会替换本浏览器学习记录，请先自行备份。</p>'+
 '<input id="ec-restore-file" type="file" accept=".json,application/json" class="ec-input"/></div>'+
 '<div class="ec-question"><h2>清除当前学习记录</h2>'+
 '<p class="ec-warning">清除仅作用于这个浏览器；原有专业写作草稿和私人字幕不会自动删掉。导出备份后再操作。</p>'+
 '<button type="button" class="ec-danger" data-ec="clear">清除本次升级的学习与评估记录</button></div>');
}
function downloadBackup(){
 const includePrivate=Boolean(el("ec-private")?.checked);
 const data={app:"Korean Media Study",schema:1,exportedAt:new Date().toISOString(),
  study:safeStudy(get(STORE_KEY,emptyStudy())),evidence:safeEvidence(get(EVIDENCE_KEY,emptyEvidence()))};
 if(includePrivate)data.legacy={drafts:get("koreanMediaSiteWritingDrafts",{}),
   degree:localStorage.getItem("zacharyKoreanDegree")||"",
   transcript:localStorage.getItem("zacharyPrivateKoreanTranscript")||"",
   lessons:get("zacharyKoreanDone",[])};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
 const href=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=href;a.download="Korean-Media-Study-Learner-Backup-"+new Date().toISOString().slice(0,10)+".json";
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(href),8000);
 message("已生成备份下载。文件可能包含自由韩语回答和个人练习记录，请勿公开。");
}
async function restoreFile(file){
 if(!file)return;
 if(file.size>1024*1024){message("文件超过1MB，已拒绝导入。");return;}
 let contents;
 try{contents=JSON.parse(await file.text())}catch{message("不是合法的 JSON 学习备份。");return;}
 if(contents.app!=="Korean Media Study"||contents.schema!==1||
    !contents.study||!contents.evidence){message("文件不是兼容的 Korean Media Study 学习备份。");return;}
 if(!confirm("恢复将覆盖此浏览器的学习路径与能力证据。确定恢复吗？"))return;
 const st=safeStudy(contents.study),ed=safeEvidence(contents.evidence);
 try{
  localStorage.setItem(STORE_KEY,JSON.stringify(st));
  localStorage.setItem(EVIDENCE_KEY,JSON.stringify(ed));
  if(contents.legacy){
   const old=contents.legacy;
   if(old.drafts&&typeof old.drafts==="object"&&!Array.isArray(old.drafts))
    localStorage.setItem("koreanMediaSiteWritingDrafts",JSON.stringify(old.drafts));
   if(typeof old.degree==="string")localStorage.setItem("zacharyKoreanDegree",old.degree);
   if(typeof old.transcript==="string")localStorage.setItem("zacharyPrivateKoreanTranscript",old.transcript.slice(0,100000));
   if(Array.isArray(old.lessons))localStorage.setItem("zacharyKoreanDone",JSON.stringify(old.lessons.slice(0,48)));
  }
  refresh();openScreen("home");message("本机学习记录已恢复，请检查今日计划和单元进度。");
 }catch{message("恢复失败，浏览器可能阻止本地数据写入。");}
}
function handleAnswer(choice){
 const item=currentItem();
 if(!Number.isInteger(choice)||choice<0||choice>=item.options.length)return;
 run.choices[run.step]=choice;
 if(run.step<3){run.step++;render();return;}
 if(run.kind==="placement"){finishPlacementLevel();return;}
 run.phase="dictation";render();
}
function finalCheck(){
 const box=el("ec-transfer");
 run.writing=box?.value?.trim()||"";
 if(!run.writing.includes("가")&&!/[가-힣]/.test(run.writing)){
  message("请先写下真实的韩语表达，才能保存迁移任务。");return;
 }
 try{
  result=createCheck(run.level,{
    choices:run.choices,heard:run.heard.map((v,i)=>Boolean(v)&&!run.textFallback[i]),repeat:run.repeat,dictation:run.dictation,
    dictationHeard:run.dictationHeard,writing:run.writing,usedHint:run.usedHint
  });
  evidence=saveCheck(evidence,result);
  saveEvidence();checkLevel=run.level;openScreen("check-result");
 }catch(err){message(err.message||"无法完成阶段检查。");}
}
function render(){
 if(document.body.dataset.view!=="coach")return;
 if(screen==="quiz")return renderQuiz();
 if(screen==="placement-result")return renderPlacementResult();
 if(screen==="check-result")return renderCheckResult();
 if(screen==="feedback")return renderFeedback();
 if(screen==="revisions")return renderRevisions();
 if(screen==="revision")return renderRevision();
 if(screen==="records")return renderRecords();
 if(screen==="privacy")return renderPrivacy();
 renderHome();
}
root.addEventListener("change",event=>{
 if(event.target?.id==="ec-minutes"){
  evidence.dailyMinutes=Number(event.target.value);
  saveEvidence();render();return;
 }
 if(event.target?.id==="ec-feedback-level"){
  checkLevel=event.target.value;render();return;
 }
 if(event.target?.id==="ec-restore-file"){restoreFile(event.target.files?.[0]);}
});
root.addEventListener("click",event=>{
 const button=event.target.closest("button");if(!button||!root.contains(button))return;
 const a=button.dataset.ec;
 if(button.dataset.ecChoice!==undefined){handleAnswer(Number(button.dataset.ecChoice));return;}
 if(button.dataset.ecRevision!==undefined){revisionId=button.dataset.ecRevision;openScreen("revision");return;}
 if(!a)return;
 if(a==="home")return openScreen("home");
 if(a==="placement")return initialPlacement();
 if(a==="records")return openScreen("records");
 if(a==="feedback")return openScreen("feedback");
 if(a==="revisions")return openScreen("revisions");
 if(a==="privacy")return openScreen("privacy");
 if(a==="backup")return downloadBackup();
 if(a==="clear"){
  const messageValue=prompt("清除后无法恢复，请输入 清除学习记录 确认：");
  if(messageValue!=="清除学习记录")return;
  localStorage.removeItem(STORE_KEY);localStorage.removeItem(EVIDENCE_KEY);
  evidence=emptyEvidence();study=emptyStudy();openScreen("home");
  message("当前浏览器的新学习路径和评估记录已清除。旧版课程、写作与私人字幕记录未受影响。");
  return;
 }
 if(a.startsWith("unit-"))return openUnit(a.slice(5));
 if(a==="review")return openUnit(study.lastUnit||"H01");
 if(a.startsWith("check-")||a.startsWith("recheck-")){
  const level=a.substring(a.indexOf("-")+1);
  if(!LEVEL_IDS.includes(level))return;
  checkLevel=level;
  const st=stageState(evidence,level);
  if(st.code==="waiting"||st.code==="retained"){openScreen("records");message(st.label);return;}
  openQuiz("check",level,st.code==="retest");
  return;
 }
 if(a==="play-question"&&run){
  const index=run.step;
  listen(currentItem().ko,()=>{if(run&&run.step===index)run.heard[index]=true;});return;
 }
 if(a==="reveal-question"&&run){run.textFallback[run.step]=true;render();return;}
 if(a==="play-dictation"&&run){
  const pack=ASSESSMENTS[run.level],target=run.repeat?pack.retry.dictation:pack.dictation;
  listen(target,()=>{if(run)run.dictationHeard=true;});return;
 }
 if(a==="reveal-dictation"&&run){run.usedHint=true;run.dictationHeard=false;render();return;}
 if(a==="dictation-done"&&run){
  run.dictation=el("ec-dictation")?.value.trim()||"";
  run.phase="transfer";render();return;
 }
 if(a==="show-reference"&&run){
  run.writing=el("ec-transfer")?.value.trim()||"";run.usedHint=true;render();return;
 }
 if(a==="finish-check"&&run){finalCheck();return;}
 if(a==="submit-revision"){
  const answer=el("ec-revision-answer")?.value||"";
  try{evidence=repeatWithFeedback(evidence,revisionId,answer,{});saveEvidence();openScreen("revisions");
   message("已记录新的韩语表达，并安排下一次延迟重练。这不是自动语法评分。");}
  catch(err){message(err.message||"本轮修改未保存。");}
  return;
 }
 if(a==="copy-teacher"){
  const content=el("ec-text-for-review")?.value||recentReply(checkLevel);
  if(!content.trim()){message("请先输入你真实说过或写过的韩语回答。");return;}
  if(!navigator.clipboard?.writeText){message("当前浏览器不允许一键复制，请改为手动复制学习者回答和教师评价要求。");return;}
  navigator.clipboard.writeText(feedbackPrompt(checkLevel,content))
  .then(()=>message("已复制教师批改提示词，由你决定是否发送给 ChatGPT 或老师。"))
  .catch(()=>message("浏览器拒绝剪贴板，请手动选中复制。"));return;
 }
 if(a==="save-feedback"){
  const fields={level:checkLevel,source:el("ec-source")?.value,
   original:el("ec-text-for-review")?.value||"",
   communication:el("ec-communication")?.value,accuracy:el("ec-accuracy")?.value,
   fluency:el("ec-fluency")?.value,notes:el("ec-note")?.value};
  if(["communication","accuracy","fluency"].some(k=>fields[k]==="")){
   message("请填写三个维度的评分或标明无法判断后再保存。");return;
  }
  try{evidence=recordExternalReview(evidence,fields);saveEvidence();openScreen("feedback");
   message("已保存用户自行录入的反馈；平台未验证评价者身份或真实口语能力。");}
  catch(err){message(err.message||"反馈尚未保存。");}return;
 }
});
document.addEventListener("kms:coach-open",()=>{refresh();screen="home";render();});
if(document.body.dataset.view==="coach")render();

function renderRevisions(){
 refresh();
 const now=Date.now(),revisions=Object.values(evidence.revisions).sort((a,b)=>a.due-b.due);
 const due=dueRevisions(evidence,now);
 const rows=revisions.map(r=>{
  const open=Number(r.due)<=now;
  const practice=r.attempts?.length||0;
  return '<div class="ec-revision-row"><div>'+
  '<strong>'+enc(r.level)+' · '+enc(r.prompt.slice(0,120))+'</strong>'+
  '<p>'+practice+' 次修改练习 · '+(open?'现在需要重练':'预计 '+new Date(r.due).toLocaleDateString("zh-CN")+' 再练')+
  ' · 评分人来源由学习者自行填写</p></div>'+
  (open?'<button type="button" data-ec-revision="'+enc(r.id)+'">重说 / 重写 →</button>':
    '<span class="ec-not-due">尚未到期</span>')+'</div>';
 }).join("");
 shell('<button class="ec-back" data-ec="home">← 返回今日计划</button>'+
 '<div class="ec-eyebrow">ERROR → REVISION → DELAYED RETRIEVAL</div>'+
 '<h1>知道错误在哪里，还要重新说对。</h1>'+
 '<p class="ec-lead">从教师、交流伙伴或自己的反馈生成重练任务：先做一次真正的修改，再在第二天和数日后尝试另一种表达。系统不会把改了字数就算成语法正确。</p>'+
 '<div class="ec-metrics"><span><strong>'+due.length+'</strong> 条现在需要重练</span>'+
 '<span><strong>'+revisions.length+'</strong> 条反馈任务</span></div>'+
 '<div class="ec-revision-list">'+(rows||'<p class="ec-explain">还没有纠错任务。先去「获取可解释的反馈」，记录至少一条具体可操作的问题。</p>')+'</div>'+
 '<div class="ec-actions"><button class="ec-primary" data-ec="feedback">获取 / 记录真实反馈 →</button>'+
 '<button class="ec-secondary" data-ec="records">查看分项能力记录</button></div>');
}
function renderRevision(){
 refresh();
 const task=evidence.revisions[revisionId];
 if(!task){openScreen("revisions");return;}
 const now=Date.now(),due=task.due<=now;
 const past=(task.attempts||[]).slice(-3).map((x,i)=>
  '<div class="ec-result-item"><strong>'+new Date(x.time).toLocaleString("zh-CN")+' · 第'+(i+1)+'次修改</strong>'+
  '<p lang="ko">'+enc(x.reply)+'</p></div>').join("");
 shell('<button class="ec-back" data-ec="revisions">← 返回纠错任务</button>'+
 '<div class="ec-eyebrow">INDEPENDENT REWRITE · '+enc(task.level)+'</div>'+
 '<h1>针对这条错误，再独立表达一次。</h1>'+
 '<section class="ec-question"><p class="ec-label">此前具体反馈</p>'+
 '<p class="ec-prompt">'+enc(task.prompt)+'</p>'+
 (task.original?'<details class="ec-previous-answer"><summary>回看上一次原始答案（看过可能影响独立性）</summary>'+
 '<p lang="ko">'+enc(task.original)+'</p></details>':"")+
 (past?'<details class="ec-previous-answer"><summary>此前修改记录</summary>'+past+'</details>':"")+
 '<label class="ec-label" for="ec-revision-answer">这次自己的韩语回答</label>'+
 '<textarea id="ec-revision-answer" class="ec-input" lang="ko" placeholder="换一种真实情境或表达方式回答；不要直接抄袭上一版。"></textarea>'+
 '<p class="ec-explain">软件只检查是否独立提交了足量韩语、与上次不完全相同；请让真人教师确认意思、语法和发音。</p>'+
 '<button class="ec-primary" data-ec="submit-revision" '+(due?"":"disabled")+'>'+
 (due?"保存修改并安排延迟重练 →":"尚未到预约复练时间")+'</button></section>'+
 '<p class="ec-warning">'+(due?"当前可以重练。完成后会自动安排下一次间隔练习。":
 "当前预约时间为 "+new Date(task.due).toLocaleString("zh-CN")+"。请不要立刻重复充当长期记忆证据。")+'</p>');
}
