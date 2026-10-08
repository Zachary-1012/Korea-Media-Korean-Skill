import {KOREAN_UNITS,KOREAN_LEXICON,KOREAN_COUNTS,KOREAN_LEVELS,HANGUL,getKoreanUnit} from "../lib/real-life-curriculum.mjs";
import {STORE_KEY,safeStudy,emptyStudy,dueCards,reviewWord,answerCorrect,chooseExercises,finishMission} from "../lib/real-life-study.mjs";
const root=document.querySelector("#real-life-path");
if(!root)throw new Error("Real-life path root missing");
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const load=()=>{try{return safeStudy(JSON.parse(localStorage.getItem(STORE_KEY)))}catch{return emptyStudy()}};
let state=load(),unitId=state.lastUnit||"H01",panel="overview",exercise=null,review=[],reviewRevealed=false;
let missionAnswers=[],missionIndex=0,missionHintsUsed=false,voiceRecorder=null,voiceTracks=null;
const byId=id=>document.getElementById(id);
const unit=()=>getKoreanUnit(unitId)||KOREAN_UNITS[0];
function store(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));return true}catch{const el=byId("rl-status");if(el)el.textContent="本浏览器无法保存学习记录，请备份重要练习内容。";return false}}
function say(text){
 const status=byId("rl-status");
 if(!("speechSynthesis" in window)){if(status)status.textContent="设备未提供朗读，请先阅读文字或更换支持韩语语音的浏览器。";return;}
 const speech=window.speechSynthesis;
 speech.cancel();
 const u=new SpeechSynthesisUtterance(text);u.lang="ko-KR";u.rate=.82;u.pitch=1;
 const voices=speech.getVoices?.()||[];
 const voice=voices.find(v=>v.lang.toLowerCase().startsWith("ko"));
 if(voice)u.voice=voice;
 u.onerror=()=>{if(status)status.textContent="韩语朗读暂不可用；这次不能算已完成听辨。"};
 speech.speak(u);
}
function navigate(view){
 panel=view;
 if(!["exercise","mission","done"].includes(view))exercise=null;
 render();
 root.scrollIntoView({block:"start",behavior:"instant"});
}
function select(id){
 if(!getKoreanUnit(id))return;
 unitId=id;state.lastUnit=id;store();navigate("lesson");
}
function nextSuggested(){return KOREAN_UNITS.find(u=>!state.units[u.id]?.passed)||KOREAN_UNITS[KOREAN_UNITS.length-1]}
function stats(){
 const practiced=KOREAN_UNITS.filter(u=>state.units[u.id]?.practiced).length;
 const completed=KOREAN_UNITS.filter(u=>state.units[u.id]?.passed).length;
 return {practiced,completed,due:dueCards(state).length,reviewed:Object.keys(state.cards).length};
}
function shell(content){
 root.innerHTML='<div class="rl-frame">'+content+'<p class="rl-privacy" id="rl-status" role="status" aria-live="polite">练习记录仅保存在当前浏览器；单元练习通过不等于经验证的口语等级。语音由设备 / 浏览器提供。</p></div>';
}
function renderOverview(){
 const n=stats(),suggested=nextSuggested();
 const title='<div class="rl-eyebrow">REAL-LIFE KOREAN · FROM ZERO</div>'+
  '<h1>从零开始，直到能在生活中开口。</h1>'+
  '<p class="rl-intro">先学发音和基本句型，接着练点单、看病、问路、解决问题，再练解释经历与观点。每单元都要看、听、回忆、自己回答。</p>';
 const summary='<div class="rl-metrics"><span><b>'+n.completed+'</b> / '+KOREAN_COUNTS.units+' 单元自评通过</span><span><b>'+n.due+'</b> 个待复习</span><span><b>'+KOREAN_COUNTS.uniqueWords+'</b> 个去重生活词条</span></div>'+
 '<div class="rl-main-actions"><button class="rl-primary" data-rl="resume">开始：'+esc(suggested.title)+' →</button>'+
 '<button class="rl-outline" data-rl="review">复习到期词汇'+(n.due?"（"+n.due+"）":"")+'</button>'+
 '<button class="rl-outline" data-rl="dictionary">生活词库</button><button class="rl-outline" data-rl="coach">诊断 · 复测 · 纠错记录</button></div>';
 const levels=KOREAN_LEVELS.map(l=>{
 const us=KOREAN_UNITS.filter(u=>u.level===l.id);
 const count=us.filter(u=>state.units[u.id]?.passed).length;
 return '<details class="rl-level" '+(l.id===unit().level?"open":"")+'><summary><span class="rl-level-id">'+esc(l.id)+'</span><span><b>'+esc(l.name)+'</b><small>'+esc(l.description)+'</small></span><em>'+count+' / '+us.length+'</em></summary>'+
 '<div class="rl-units">'+us.map((u,i)=>{
 const saved=state.units[u.id];
 const mark=saved?.passed?"已练习达标":saved?.practiced?"待巩固":"未开始";
 return '<button type="button" data-rl-unit="'+esc(u.id)+'" class="rl-unit-row"><span class="rl-unit-number">'+String(i+1).padStart(2,"0")+'</span><span><strong>'+esc(u.title)+'</strong><small>'+esc(u.canDo)+'</small></span><span class="rl-unit-state">'+mark+' →</span></button>';
 }).join("")+'</div></details>';
 }).join("");
 shell(title+summary+
 '<div class="rl-section-head"><h2>你接下来会学习什么</h2><p>按照“可完成的真实任务”递进，支持随时跳到已掌握阶段。</p></div>'+
 levels+'<p class="rl-caveat">本路线包含 B2 情境练习，但练习完成不等于达到 B2。自然、复杂的韩语交流仍需要更多真实听力与阅读输入、充分实践和有资质人员的能力评价。</p>');
}
function renderLesson(){
 const u=unit(),n=stats();
 const pos=KOREAN_UNITS.indexOf(u);
 const letters=u.level==="A0"?
 '<details class="rl-letter-lab" open><summary>韩文字母与拼读工具</summary><p>点击字母尝试听设备朗读；字母发音和实际连续语流不完全相同。</p>'+
 HANGUL.map(g=>'<h4>'+esc(g.title)+'</h4><p class="rl-hint">'+esc(g.note)+'</p><div class="rl-letter-grid">'+g.items.map(v=>'<button type="button" data-rl-say="'+esc(v[0])+'" aria-label="听 '+esc(v[0])+' 的发音"><b>'+esc(v[0])+'</b><small>'+esc(v[1])+'</small></button>').join("")+'</div>').join("")+'</details>':"";
 const vocab='<div class="rl-section-head"><h2>先认识这些词</h2><p>每个词均能按需朗读。不要一次背完，随后会进入主动回忆。</p></div>'+
 '<div class="rl-words">'+u.words.map(w=>'<div class="rl-word"><div><strong lang="ko">'+esc(w.ko)+'</strong><span>'+esc(w.zh)+'</span></div><button type="button" data-rl-say="'+esc(w.ko)+'" aria-label="听 '+esc(w.ko)+'">听发音</button></div>').join("")+'</div>';
 const dialogs='<div class="rl-section-head"><h2>真实情境怎么说</h2><p>先听韩语，想好含义，再展开中文。轮流扮演双方人物。</p></div>'+
 '<div class="rl-dialogue">'+u.dialogue.map((line,i)=>
 '<div class="rl-turn"><span class="rl-turn-num">'+(i+1).toString().padStart(2,"0")+'</span><div><strong lang="ko">'+esc(line.ko)+'</strong><div class="rl-turn-tools"><button data-rl-say="'+esc(line.ko)+'">播放</button><button data-rl-reveal="'+i+'">看中文</button></div><p class="rl-translation" data-rl-translation="'+i+'" hidden>'+esc(line.zh)+'</p></div></div>').join("")+'</div>';
 shell('<button class="rl-back" data-rl="overview">← '+KOREAN_COUNTS.units+' 单元学习路线</button>'+
 '<div class="rl-eyebrow">'+esc(u.level)+' · '+(pos+1)+' / '+KOREAN_COUNTS.units+'</div>'+
 '<h1>'+esc(u.title)+'</h1>'+
 '<p class="rl-intro"><b>这单元的真实目标：</b>'+esc(u.canDo)+'</p>'+
 '<div class="rl-grammar"><span>本单元句型</span>'+esc(u.grammar)+'</div>'+
 '<div class="rl-main-actions"><button class="rl-primary" data-rl="start">开始 5 题主动回忆 →</button><button class="rl-outline" data-rl="overview">查看全学习路线</button></div>'+
 letters+vocab+dialogs+
 '<section class="rl-mission-preview"><span class="rl-eyebrow">REAL-WORLD CHALLENGE</span><h2>最后你要自己完成</h2><p>'+esc(u.mission)+'</p><p>这需要你实际开口或书写，而不是只点击“完成”。</p></section>'+
 '<p class="rl-hint">进度：'+n.completed+' 个单元自评通过，'+n.due+' 张复习卡已到期。尚未经过真人口语等级评测。</p>');
}
function newExercise(){
 const u=unit(),a=Number(state.sessions[u.id]||0);
 exercise={items:chooseExercises(u,a),index:0,score:0,feedback:null};
 missionAnswers=[];missionIndex=0;missionHintsUsed=false;
 state.sessions[u.id]=a+1;store();navigate("exercise");
}
function renderExercise(){
 if(!exercise){newExercise();return;}
 const x=exercise.items[exercise.index],u=unit(),i=exercise.index;
 const isType=x.mode==="type";
 const opts=x.options.map(w=>'<button type="button" data-rl-answer="'+esc(w.ko)+'" '+(exercise.feedback?"disabled":"")+'>'+esc(w.zh)+'</button>').join("");
 const prompt=isType?
 '<p class="rl-prompt">把中文意思写成韩语：<strong>'+esc(x.word.zh)+'</strong></p>'+
 '<label class="rl-hint" for="rl-typing">在韩语键盘输入准确的词或短语</label><input id="rl-typing" class="rl-input" lang="ko" placeholder="在这里输入韩语" autocapitalize="off" autocomplete="off"/>'+
 '<button class="rl-primary" data-rl="submit-type" '+(exercise.feedback?"disabled":"")+' type="button">检查这次回忆</button>':
 '<p class="rl-prompt">'+(x.mode==="listen"?"先听音频，选择意思（不看韩文）":"选择韩语词语的正确含义")+'</p>'+
 (x.mode==="listen"?'<button class="rl-audio" data-rl-say="'+esc(x.word.ko)+'">▶ 听韩语</button>':'<div class="rl-target" lang="ko">'+esc(x.word.ko)+'</div>')+
 '<div class="rl-choices">'+opts+'</div>';
 const result=exercise.feedback?
 '<div class="rl-feedback '+(exercise.feedback.ok?"ok":"again")+'" role="status"><strong>'+(exercise.feedback.ok?"本题回忆正确":"这张卡还需复习")+'</strong>'+
 '<p><span lang="ko">'+esc(x.word.ko)+'</span> — '+esc(x.word.zh)+'</p>'+
 '<p class="rl-hint">即使这次答错也可以继续；系统会提前安排下一次复习。</p>'+
 '<button class="rl-primary" data-rl="next-question">'+(i===4?"进入真实表达任务 →":"下一题 →")+'</button></div>':
 isType?'<button class="rl-outline" data-rl="show-answer">实在不会，显示答案并记为错题</button>':"";
 shell('<button class="rl-back" data-rl="lesson">← 返回这一课</button>'+
 '<div class="rl-eyebrow">'+esc(u.level)+' · 先独立回忆，再看解释</div>'+
 '<h1>'+esc(u.title)+'</h1><div class="rl-exercise-meter"><span>'+ (i+1)+' / 5</span><div><i style="width:'+((i+1)*20)+'%"></i></div><small>当前正确 '+exercise.score+' 题</small></div>'+
 '<section class="rl-exercise">'+prompt+result+'</section>'+
 '<p class="rl-hint">这是一组可重复、可检验的词汇回忆题。答对不等于口语发音评分，也不代表已经掌握全部语境。</p>');
}

function renderMission(){
 const u=unit(),example=u.dialogue.find(x=>x.ko.length>12)||u.dialogue[0];
 shell('<button class="rl-back" data-rl="lesson">← 返回课程</button>'+
 '<div class="rl-eyebrow">YOUR TURN · REAL WORLD TASK</div><h1>现在由你自己说。</h1>'+
 '<p class="rl-intro">'+esc(u.mission)+'</p>'+
 '<div class="rl-task-instructions"><div><b>01</b><p>先组织内容，尽量不用提示用韩语说出来。</p></div><div><b>02</b><p>把自己的话写下；如浏览器支持，可选用韩语语音转写。</p></div><div><b>03</b><p>如实选择“独立 / 需要帮助 / 暂时不会”；系统不假装能自动评价自由表达。</p></div></div>'+
 '<label class="rl-label" for="rl-mission-answer">我的韩语回答</label>'+
 '<textarea id="rl-mission-answer" class="rl-textarea" lang="ko" spellcheck="false" placeholder="用韩文写下自己的回答，或使用可选的语音转写。"></textarea>'+
 '<div class="rl-main-actions"><button class="rl-outline" data-rl="mic">尝试语音转写（可选）</button>'+
 '<button class="rl-outline" data-rl-say="'+esc(example.ko)+'">听一个语境示范</button></div>'+
 '<details class="rl-example"><summary>需要提示时，展开对照句</summary><strong lang="ko">'+esc(example.ko)+'</strong><p>'+esc(example.zh)+'</p><p>这不是唯一正确答案；看过提示后请如实选择“需要帮助”。</p></details>'+
 '<label class="rl-label" for="rl-self">我完成真实场景任务的情况</label>'+
 '<select id="rl-self" class="rl-input"><option value="">选择真实情况</option><option value="independent">可以不用提示独立表达（自评）</option><option value="with-help">需要看例句或解释</option><option value="retry">还不能完成，下一次重练</option></select>'+
 '<p class="rl-hint">词汇回忆：'+(exercise?.score??0)+' / 5；至少 4/5 且自评独立，才记录练习达标。不是语言能力认证。</p>'+
 '<button class="rl-primary" data-rl="submit-mission">保存本次真实任务 →</button>');
}

function renderMissionMulti(){
 const u=unit(),turns=u.dialogue.slice(0,u.id==="B210"?5:Math.min(u.dialogue.length,3)),turn=turns[missionIndex];
 if(!turn){missionIndex=0;return renderMissionMulti();}
 const final=missionIndex===turns.length-1;
 const previous=missionAnswers.length?'<div class="rl-dialogue-review"><h3>已经回应</h3>'+missionAnswers.map((ans,i)=>
 '<div class="rl-turn"><span class="rl-turn-num">'+(i+1)+'</span><div><span class="rl-hint">对方说：</span><p lang="ko">'+esc(turns[i].ko)+'</p><span class="rl-hint">你的回答：</span><p lang="ko">'+esc(ans.reply)+'</p></div></div>').join("")+'</div>':"";
 shell('<button class="rl-back" data-rl="lesson">← 返回课程</button>'+
 '<div class="rl-eyebrow">REAL-LIFE CONVERSATION · '+esc(u.id)+'</div>'+
 '<h1>把韩语真正说出来。</h1>'+
 '<p class="rl-intro">'+esc(u.mission)+'</p>'+
 '<div class="rl-exercise-meter"><span>第 '+(missionIndex+1)+' / '+turns.length+' 回合</span>'+
 '<div><i style="width:'+Math.round((missionIndex+1)/turns.length*100)+'%"></i></div><small>不要只复述示范句；请用自己的真实信息回答。</small></div>'+
 previous+
 '<section class="rl-mission-turn">'+
 '<div class="rl-eyebrow">PARTNER · 对方说</div>'+
 '<p class="rl-conversation-prompt" lang="ko">'+esc(turn.ko)+'</p>'+
 '<div class="rl-main-actions"><button class="rl-outline" data-rl-say="'+esc(turn.ko)+'">▶ 听对方说韩语</button>'+
 '<button class="rl-outline" data-rl="mission-hint">需要提示：显示中文和示范</button></div>'+
 '<div id="rl-mission-hint" class="rl-hint-panel" hidden><p>'+esc(turn.zh)+'</p>'+
 '<strong lang="ko">'+esc(turn.ko)+'</strong><p class="rl-hint">这里仅提供对方说的话，不能代替你自己的回答。</p></div>'+
 '<label class="rl-label" for="rl-mission-answer">我的第 '+(missionIndex+1)+' 轮韩语回答</label>'+
 '<textarea id="rl-mission-answer" class="rl-textarea" lang="ko" spellcheck="false" placeholder="用韩文回答；可以先开口说，再写下自己的话。"></textarea>'+
 '<div class="rl-main-actions"><button class="rl-outline" data-rl="mic">语音转写（可选）</button>'+
 '<button class="rl-outline" data-rl="voice-start">录下这轮发音</button>'+
 '<button class="rl-outline" data-rl="voice-stop" disabled>停止录音</button></div>'+
 '<div id="rl-voice-preview" role="status" class="rl-hint"></div>'+
 (final?'<label class="rl-label" for="rl-self">是否能独立回应全部回合？</label>'+
 '<select id="rl-self" class="rl-input"><option value="">选择实际情况</option>'+
 '<option value="independent">可以不看提示连续完成（自评）</option>'+
 '<option value="with-help">需要提示或翻译</option>'+
 '<option value="retry">还不能完成，需要再练</option></select>'+
 '<p class="rl-hint">自评不是 AI 批改。若本次查看过示范，将自动记录“使用过提示”。</p>':
 '<p class="rl-hint">先说自己的回答，再提交进入下一回合；对方不会自动为你判分。</p>')+
 '<button class="rl-primary" data-rl="'+(final?"mission-finish":"mission-next")+'">'+
 (final?"结束多轮挑战并保存 →":"提交回答，进入下一轮 →")+'</button>'+
 '</section><p class="rl-hint">当前词汇主动回忆 '+(exercise?.score||0)+' / 5。多轮对话练习记录只存在本设备上，录音文件不会上传。</p>');
}
async function startVoiceRecording(){
 const status=byId("rl-voice-preview"),stop=byId("rl-status");
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==="undefined"){
  if(status)status.textContent="当前设备不支持网页录音；可以使用语音转写或手动填写。";return;
 }
 try{
  voiceTracks=await navigator.mediaDevices.getUserMedia({audio:true});
  const recorder=new MediaRecorder(voiceTracks);
  let chunks=[];
  recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};
  recorder.onstop=()=>{
   const blob=new Blob(chunks,{type:recorder.mimeType||"audio/webm"});
   const url=URL.createObjectURL(blob);
   if(status){
    status.replaceChildren();
    const audio=document.createElement("audio");audio.controls=true;audio.src=url;
    const tip=document.createElement("span");tip.textContent="录音仅在当前页面临时保留，用于自己听回放。";
    status.append(audio,tip);
   }else URL.revokeObjectURL(url);
   voiceTracks?.getTracks().forEach(t=>t.stop());voiceTracks=null;voiceRecorder=null;
  };
  voiceRecorder=recorder;recorder.start();
  const start=byId("rl-voice-preview");
  if(start)start.textContent="正在录音，请用韩语回答，结束后可播放自己的录音。";
  const btn=byId("rl-voice-stop");if(btn)btn.disabled=false;
 }catch{
  if(stop)stop.textContent="麦克风未授权或不可用。录音非必需，可以直接输入。";
 }
}
function stopVoiceRecording(){
 if(voiceRecorder?.state==="recording")voiceRecorder.stop();
 const btn=byId("rl-voice-stop");if(btn)btn.disabled=true;
}
function currentMissionReply(){
 const reply=byId("rl-mission-answer")?.value.trim()||"";
 const status=byId("rl-status");
 if(!/[\uac00-\ud7a3]/u.test(reply)||reply.length<2){
  if(status)status.textContent="这一回合请先说或写出韩语回答，不能仅点下一步。";
  return null;
 }
 return reply;
}

function renderDone(){
 const n=stats(),row=state.units[unitId]||{},next=nextSuggested();
 shell('<button class="rl-back" data-rl="overview">← 返回完整路径</button>'+
 '<div class="rl-eyebrow">PRACTICE LOG · LOCAL DEVICE</div>'+
 '<h1>'+(row.passed?"本单元达到练习条件。":"这一轮练过了，下一次继续。")+'</h1>'+
 '<p class="rl-intro">'+esc(unit().title)+'：回忆 '+Number(row.score||0)+' / 5，真实情境由你自己完成并自评。</p>'+
 '<div class="rl-metrics"><span>已练习 <b>'+n.practiced+'</b> 个单元</span><span>练习达标 <b>'+n.completed+'</b> 个</span><span>到期词汇 <b>'+n.due+'</b> 个</span></div>'+
 '<div class="rl-main-actions"><button class="rl-primary" data-rl="resume">继续：'+esc(next.title)+' →</button>'+
 '<button class="rl-outline" data-rl="review">复习已见词汇</button>'+
 '<button class="rl-outline" data-rl="lesson">重练本单元</button></div>'+
 '<p class="rl-caveat">语言能力需在没有提示、没有字幕且有真人追问的条件下核验。自评达标不能证明达到正式等级。</p>');
}
function renderReview(){
 if(review.length===0){
  const allDue=dueCards(state).filter(ko=>KOREAN_LEXICON.some(w=>w.ko===ko));
  review=allDue.slice(0,20);reviewRevealed=false;
 }
 if(!review.length){
  shell('<button class="rl-back" data-rl="overview">← 返回学习路径</button>'+
  '<div class="rl-eyebrow">SPACED REPETITION</div><h1>目前没有到期词条。</h1>'+
  '<p class="rl-intro">错词约 10 分钟后再现；记住的词按第 1、3、7、15、30 天等间隔复习。现在可以继续新单元。</p>'+
  '<button class="rl-primary" data-rl="resume">继续学习 →</button>');
  return;
 }
 const ko=review[0],w=KOREAN_LEXICON.find(x=>x.ko===ko);
 if(!w){review.shift();renderReview();return;}
 shell('<button class="rl-back" data-rl="overview">← 返回路线</button>'+
 '<div class="rl-eyebrow">REVIEW · '+review.length+' 张待复习</div>'+
 '<h1>不要先看中文，回忆意思。</h1>'+
 '<section class="rl-review"><div class="rl-review-word" lang="ko">'+esc(w.ko)+'</div>'+
 '<button class="rl-outline" data-rl-say="'+esc(w.ko)+'">▶ 听韩语</button>'+
 (reviewRevealed?'<p class="rl-review-answer">'+esc(w.zh)+'</p>'+
 '<div class="rl-main-actions"><button class="rl-outline" data-rl="forgot">忘了，早点再练</button><button class="rl-primary" data-rl="remembered">想起来了，延后复习</button></div>':
 '<button class="rl-primary" data-rl="reveal-card">揭晓中文意思 →</button>')+
 '</section><p class="rl-hint">复习时间按本机实际作答安排。主动回忆比不停翻卡更有意义。</p>');
}
function renderDictionary(){
 shell('<button class="rl-back" data-rl="overview">← 返回路径</button>'+
 '<div class="rl-eyebrow">REAL-LIFE WORDS · CURATED</div><h1>用得上的生活词库</h1>'+
 '<p class="rl-intro">当前 '+KOREAN_COUNTS.uniqueWords+' 个去重词条，分配在 '+KOREAN_UNITS.length+' 个进阶情境。与原来的专业词典互补；不声称覆盖全部韩语词汇。</p>'+
 '<label class="rl-label" for="rl-dict-query">输入韩语或中文，查找并听发音</label>'+
 '<input class="rl-input" id="rl-dict-query" placeholder="例如：도움、예약、退款、地铁" autocomplete="off"/>'+
 '<p class="rl-hint">需要更多词汇或查看用例，可打开 <a href="https://krdict.korean.go.kr/chn/mainAction" target="_blank" rel="noopener noreferrer">韩国国立国语院韩中学习词典 ↗</a>（官方独立资源，本站不会冒充收录，也不复制其词库）。</p>'+
 '<div id="rl-dict-result" class="rl-dict-results"></div>');
 paintDictionary("");
}
function paintDictionary(query){
 const holder=byId("rl-dict-result");if(!holder)return;
 const v=String(query||"").trim().toLowerCase();
 const aliases={"预约":"预订","退货":"反品","退款":"환불","问路":"路线","公交":"버스","听不懂":"不理解","汇报":"报告"};
 const searches=[v,...Object.entries(aliases).filter(([key])=>v.includes(key)).map(([,value])=>value)];
 const results=KOREAN_LEXICON.filter(w=>searches.some(q=>w.ko.toLowerCase().includes(q)||w.zh.toLowerCase().includes(q)));
 holder.innerHTML='<p class="rl-hint">符合条件 '+results.length+' 词'+(results.length>45?'；先显示前 45 个，请进一步缩小搜索范围。':'')+'</p>'+
 results.slice(0,45).map(w=>'<div class="rl-dict-row"><b lang="ko">'+esc(w.ko)+'</b><span>'+esc(w.zh)+'</span><button type="button" data-rl-say="'+esc(w.ko)+'">播放</button></div>').join("");
}
function render(){
 if(document.body.dataset.view!=="journey")return;
 if(panel==="lesson")return renderLesson();
 if(panel==="exercise")return renderExercise();
 if(panel==="mission")return renderMissionMulti();
 if(panel==="done")return renderDone();
 if(panel==="review")return renderReview();
 if(panel==="dictionary")return renderDictionary();
 renderOverview();
}
function solve(given){
 if(!exercise||exercise.feedback)return;
 const question=exercise.items[exercise.index],ok=answerCorrect(given,question.word.ko);
 exercise.feedback={ok};
 if(ok)exercise.score+=1;
 state=reviewWord(state,question.word.ko,ok);store();render();
}
function optionalMic(){
 const R=window.SpeechRecognition||window.webkitSpeechRecognition;
 const dest=byId("rl-mission-answer"),status=byId("rl-status");
 if(!dest)return;
 if(!R){if(status)status.textContent="当前浏览器不支持韩语语音转写，可直接写韩语或录音后手动回顾。";return;}
 if(!window.confirm("语音转写可能由浏览器或系统服务商通过网络处理音频。产品本身不会保存声音。确认启动吗？"))return;
 try{
  const recog=new R();recog.lang="ko-KR";recog.interimResults=false;recog.maxAlternatives=1;
  recog.onresult=e=>{
   const transcript=e.results?.[0]?.[0]?.transcript||"";
   dest.value=(dest.value?dest.value+"\n":"")+transcript;
   if(status)status.textContent="已插入识别文字。语音转写不是发音评分，也不代表达到口语等级。";
  };
  recog.onerror=e=>{if(status)status.textContent="语音识别失败（"+String(e.error||"未知")+"）。可改为输入。";};
  recog.onend=()=>{if(status&&!dest.value.trim())status.textContent="录音已结束；没有识别出文字，请自行输入。"};
  recog.start();
  if(status)status.textContent="正在通过浏览器语音识别服务转写…";
 }catch{if(status)status.textContent="麦克风不可用，请直接输入。";}
}
root.addEventListener("input",ev=>{if(ev.target?.id==="rl-dict-query")paintDictionary(ev.target.value);});
root.addEventListener("click",ev=>{
 const target=ev.target.closest("button");if(!target||!root.contains(target))return;
 if(target.dataset.rlSay!==undefined){say(target.dataset.rlSay);return;}
 if(target.dataset.rlAnswer!==undefined){solve(target.dataset.rlAnswer);return;}
 if(target.dataset.rlUnit){select(target.dataset.rlUnit);return;}
 if(target.dataset.rlReveal!==undefined){
  const p=root.querySelector('[data-rl-translation="'+target.dataset.rlReveal+'"]');
  if(p){p.hidden=!p.hidden;target.textContent=p.hidden?"看中文":"隐藏中文";}return;
 }
 const action=target.dataset.rl;if(!action)return;
 if(action==="coach"){document.dispatchEvent(new Event("kms:coach-request"));return;}
 if(action==="overview")return navigate("overview");
 if(action==="lesson")return navigate("lesson");
 if(action==="dictionary")return navigate("dictionary");
 if(action==="resume")return select(nextSuggested().id);
 if(action==="start")return newExercise();
 if(action==="review"){review=[];reviewRevealed=false;return navigate("review");}
 if(action==="reveal-card"){reviewRevealed=true;return render();}
 if(action==="forgot"||action==="remembered"){
  if(!review.length)return;
  state=reviewWord(state,review.shift(),action==="remembered");store();reviewRevealed=false;return render();
 }
 if(action==="submit-type"){solve(byId("rl-typing")?.value||"");return;}
 if(action==="show-answer"){solve("");return;}
 if(action==="next-question"&&exercise?.feedback){
  exercise.feedback=null;
  if(exercise.index<exercise.items.length-1)exercise.index+=1;
  else return navigate("mission");
  render();return;
 }
 if(action==="mission-hint"){
  missionHintsUsed=true;
  const area=byId("rl-mission-hint");if(area)area.hidden=false;
  target.disabled=true;return;
 }
 if(action==="voice-start"){startVoiceRecording();return;}
 if(action==="voice-stop"){stopVoiceRecording();return;}
 if(action==="mission-next"){
  const reply=currentMissionReply();if(!reply)return;
  stopVoiceRecording();
  missionAnswers.push({prompt:unit().dialogue[missionIndex].ko,reply});
  missionIndex+=1;render();return;
 }
 if(action==="mission-finish"){
  const reply=currentMissionReply();if(!reply)return;
  const rating=byId("rl-self")?.value||"",status=byId("rl-status");
  if(!rating){if(status)status.textContent="请如实选择你本次能否独立回答。";return;}
  if(missionHintsUsed&&rating==="independent"){
   if(status)status.textContent="本轮使用过提示，因此不能选择“完全独立”；请选择“需要提示”。";
   return;
  }
  stopVoiceRecording();
  const answers=[...missionAnswers,{prompt:unit().dialogue[missionIndex].ko,reply}];
  try{
   state=finishMission(state,unitId,answers.map((a,i)=>(i+1)+". "+a.prompt+"\n我的回答："+a.reply).join("\n\n"),rating,exercise?.score||0,Date.now(),{turns:answers.length,hintsUsed:missionHintsUsed,responses:answers.map(a=>a.reply)});
   store();return navigate("done");
  }catch(err){if(status)status.textContent=err.message||"保存失败";}
 }
 if(action==="submit-mission"){
  const reply=byId("rl-mission-answer")?.value||"",rating=byId("rl-self")?.value||"",status=byId("rl-status");
  if(!/[\uac00-\ud7a3]/u.test(reply)){if(status)status.textContent="请先用韩语回答至少一句；不能只输入中文或点击完成。";return;}
  try{state=finishMission(state,unitId,reply,rating,exercise?.score||0);store();return navigate("done");}
  catch(err){if(status)status.textContent=err.message||"请填写任务和自评。";}
 }
 if(action==="mic")optionalMic();
});
root.addEventListener("keydown",ev=>{
 if(ev.key==="Enter"&&ev.target?.id==="rl-typing"){ev.preventDefault();solve(ev.target.value);}
});
document.addEventListener("kms:journey-select",ev=>{if(ev.detail?.unitId)select(ev.detail.unitId);});
document.addEventListener("kms:journey-open",()=>{state=load();if(panel!=="overview"&&panel!=="lesson")panel="overview";render();});
if(document.body.dataset.view==="journey")render();
