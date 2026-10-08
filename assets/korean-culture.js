import {CULTURE_CASES,CULTURE_SOURCES,gradeEtiquette,cultureCase} from "../lib/korean-etiquette.mjs";
const root=document.querySelector("#korean-culture");
if(!root)throw Error("Korean culture UI container missing");
const STORE="kmsKoreanEtiquetteV1";
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const get=()=>{try{const s=JSON.parse(localStorage.getItem(STORE));return s&&typeof s==="object"?s:{}}catch{return {}}};
let state=get(),active="E01",phase="list",answered=null;
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));return true}catch{return false}}
function say(ko){
 const status=root.querySelector("[data-culture-message]");
 if(!("speechSynthesis" in window)){if(status)status.textContent="当前设备不支持语音朗读，请改用文字学习。";return;}
 speechSynthesis.cancel();
 const speech=new SpeechSynthesisUtterance(ko);speech.lang="ko-KR";speech.rate=.82;
 speech.onerror=()=>{if(status)status.textContent="朗读不可用，不计作实际听力训练。"};
 speechSynthesis.speak(speech);
}
function shell(body){
 root.innerHTML='<div class="ks-culture">'+body+
 '<p class="ks-mini" data-culture-message aria-live="polite">此课程描述常见礼仪与语体，而不是规定所有韩国人必须如何行动。练习状态只保存在当前浏览器。</p></div>';
}
function overview(){
 const practiced=CULTURE_CASES.filter(c=>state[c.id]?.practice).length;
 const entries=CULTURE_CASES.map((c,i)=>
 '<button class="ks-case-row" data-case="'+c.id+'"><span class="ks-case-num">'+String(i+1).padStart(2,"0")+'</span>'+
 '<span><strong>'+esc(c.title)+'</strong><small>'+esc(c.topic)+' · '+esc(c.level)+' · '+esc(c.situation)+'</small></span>'+
 '<em>'+ (state[c.id]?.practice?"已练过":"开始")+' →</em></button>').join("");
 shell('<span class="ks-eyebrow">KOREAN ETIQUETTE · 존댓말과 생활문화</span>'+
 '<h1>会说韩语，也要知道什么时候怎么说。</h1>'+
 '<p class="ks-lead">从敬语、称谓、问候、餐桌行为，到职场沟通、拒绝和跨文化边界。学习的是情境判断与真实表达，而不是死记文化刻板印象。</p>'+
 '<div class="ks-stats"><span><b>'+practiced+'</b> / '+CULTURE_CASES.length+' 个场景有回答记录</span>'+
 '<span><b>18</b> 个原创生活礼仪情境</span></div>'+
 '<div class="ks-action-row"><button class="ks-primary" data-culture="resume">开始下一条礼仪练习 →</button>'+
 '<button class="ks-outline" data-culture="navigate-journey">回到零基础学习路线</button></div>'+
 '<div class="ks-section-title"><h2>真实生活礼仪与语言情境</h2><p>每一条都要先判断表达是否合适，再亲自用韩语回答。</p></div>'+
 '<div class="ks-case-list">'+entries+'</div>'+
 '<div class="ks-section-title"><h2>参考与边界</h2></div>'+
 '<p class="ks-mini">内容由本项目原创编写，参考韩国政府文化介绍和国立国语院词典释义，未复制影视台词或外部课程。文化行为因地区、家庭、年龄、组织和个人而不同。</p>'+
 CULTURE_SOURCES.map(x=>'<p class="ks-source"><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.label)+' ↗</a></p>').join(""));
}
function practice(id){
 const c=cultureCase(id);if(!c){phase="list";return overview();}
 active=id;phase="practice";
 const firstCorrect=Number(id.slice(1))%2===0;
 const choices=firstCorrect?
 [{label:c.good,value:"good"},{label:c.bad,value:"bad"}]:
 [{label:c.bad,value:"bad"},{label:c.good,value:"good"}];
 const options=choices.map((x,i)=>
 '<button class="ks-choice" data-culture-choice="'+x.value+'" '+(answered?"disabled":"")+'>'+
 '<span>'+String.fromCharCode(65+i)+'</span><b lang="ko">'+esc(x.label)+'</b></button>').join("");
 const idx=CULTURE_CASES.findIndex(x=>x.id===id);
 const next=CULTURE_CASES[idx+1]||CULTURE_CASES[0];
 const feedback=answered?
 '<section class="ks-feedback"><strong>'+(answered.correct?"这句话更符合此情境。":"这个说法在该情境可能不合适。")+'</strong>'+
 '<p lang="ko">'+esc(c.good)+'</p><p>'+esc(c.why)+'</p>'+
 '<button type="button" data-culture-say="'+esc(c.good)+'">▶ 听自然表达</button></section>':"";
 shell('<button class="ks-back" data-culture="back">← 返回全部礼仪课程</button>'+
 '<span class="ks-eyebrow">'+esc(c.level)+' · '+(idx+1)+' / '+CULTURE_CASES.length+' · '+esc(c.topic)+'</span>'+
 '<h1>'+esc(c.title)+'</h1><p class="ks-lead"><strong>现实情境：</strong>'+esc(c.situation)+'</p>'+
 '<div class="ks-scenario"><h2>你会怎么表达？</h2><p>请选择在这个情境里相对自然、礼貌、能够推进沟通的一句。</p>'+
 '<div class="ks-choices">'+options+'</div>'+feedback+'</div>'+
 (answered?
 '<section class="ks-reply"><span class="ks-eyebrow">YOUR TURN · 真实表达</span>'+
 '<h2>换成自己的话，独立回应。</h2><p>'+esc(c.challenge)+'</p>'+
 '<div class="ks-response"><span class="ks-mini">对方可能会这样回应：</span>'+
 '<p lang="ko">'+esc(c.reply)+'</p><button type="button" data-culture-say="'+esc(c.reply)+'">▶ 听韩语</button></div>'+
 '<label for="ks-my-answer">请亲自写下这次的韩语回答</label>'+
 '<textarea id="ks-my-answer" lang="ko" placeholder="不要直接复制示范句，尝试用自己真实情况表达。"></textarea>'+
 '<p class="ks-mini">保存意味着练过一次情境，不表示系统可靠评价了你的韩语发音或语法。</p>'+
 '<button class="ks-primary" data-culture="save-practice">保存本次真实表达 →</button></section>':
 '<p class="ks-mini">请先判断适合的礼貌表达，再进入自主回应。不能只翻阅课程就算完成。</p>')+
 '<div class="ks-action-row"><button class="ks-outline" data-culture="next" data-next="'+next.id+'">下一条礼仪课 →</button></div>');
}
function render(){if(document.body.dataset.view!=="culture")return;phase==="practice"?practice(active):overview();}
root.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.cultureSay!==undefined){say(b.dataset.cultureSay);return;}
 if(b.dataset.case){active=b.dataset.case;answered=null;phase="practice";render();return;}
 if(b.dataset.cultureChoice){
  if(answered)return;
  answered=gradeEtiquette(active,b.dataset.cultureChoice);
  state[active]={...(state[active]||{}),lastChoiceCorrect:answered.correct,lastAttempt:Date.now()};
  save();render();return;
 }
 switch(b.dataset.culture){
  case "back":phase="list";answered=null;render();break;
  case "resume":{
   const next=CULTURE_CASES.find(x=>!state[x.id]?.practice)||CULTURE_CASES[0];active=next.id;answered=null;phase="practice";render();break;
  }
  case "next":active=b.dataset.next;answered=null;phase="practice";render();break;
  case "save-practice":{
   const input=root.querySelector("#ks-my-answer"),value=input?.value.trim()||"";
   const min={A0:3,A1:6,A2:9,B1:13,B2:18}[cultureCase(active).level]||6;
   const n=(value.match(/[가-힣]/g)||[]).length;
   if(n<min){const note=root.querySelector("[data-culture-message]");if(note)note.textContent="回答太短或不是韩语，请按当前阶段用韩语完成更完整的表达。";return;}
   state[active]={...state[active],practice:{response:value.slice(0,1200),at:Date.now(),
     meaningUnverified:true,independentlyAssessed:false}};
   save();const note=root.querySelector("[data-culture-message]");if(note)note.textContent="已保存本机礼仪练习。语言准确度仍需要教师/交流伙伴核实。";
   const next=root.querySelector('[data-culture="next"]');if(next)next.textContent="已记录，继续下一条 →";break;
  }
  case "navigate-journey":document.dispatchEvent(new Event("kms:culture-to-journey"));break;
 }
});
document.addEventListener("kms:culture-open",()=>{state=get();render();});
if(document.body.dataset.view==="culture")render();
