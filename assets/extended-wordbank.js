// Original learner UI. CC BY 4.0 external headwords are attributed on the page.
const root=document.querySelector("#expanded-vocabulary");
if(!root)throw Error("Extended vocabulary root missing");
const KEY="kmsExtendedVocabularyV1";
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const loadState=()=>{try{const s=JSON.parse(localStorage.getItem(KEY));return s&&typeof s==="object"&&s.saved&&typeof s.saved==="object"?s:{saved:{}}}catch{return {saved:{}}}};
let state=loadState(),wordRows=null,meta=null,loadPromise=null;
let search="",difficulty="全部",onlySaved=false,page=0,view="search",queue=[],focus=null,feedback=null;
const pageSize=35;
const get=()=>{try{return state.saved||{}}catch{return {}}};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{return false}}
const normalize=v=>String(v||"").normalize("NFKC").replace(/[\s\p{P}\p{S}]/gu,"").toLowerCase();
function speak(word){
 const msg=root.querySelector("#kw-status");
 if(!("speechSynthesis" in window)){if(msg)msg.textContent="本设备没有可用朗读。";return;}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(word);u.lang="ko-KR";u.rate=.84;
 u.onerror=()=>{if(msg)msg.textContent="韩语设备朗读不可用，请改为看文字。"};
 speechSynthesis.speak(u);
}
function renderShell(body){
 root.innerHTML='<section class="kw-shell">'+body+
 '<p class="kw-message" id="kw-status" role="status">扩展词汇数据来源为 Koko AI，CC BY 4.0；并非官方词典或逐词母语教师认证。</p></section>';
}
async function loadWords(){
 if(wordRows)return true;
 if(loadPromise)return loadPromise;
 loadPromise=(async()=>{
  const response=await fetch(new URL("../data/noncommercial-korean-extended.json",import.meta.url),{cache:"force-cache"});
  if(!response.ok)throw Error("词库 HTTP "+response.status);
  const data=await response.json();
  if(data.schema!==1||data.source?.license!=="CC BY 4.0"||!Array.isArray(data.words)||data.words.length<4000)
   throw Error("扩展词库来源或数据结构不符合要求");
  const unique=new Set(data.words.map(w=>w[0]));
  if(unique.size!==data.words.length)throw Error("词库存在重复的词头，无法安全复习");
  wordRows=data.words;meta=data;return true;
 })().catch(e=>{loadPromise=null;renderShell('<h1>扩展词库暂时无法加载。</h1><p>'+esc(e.message)+'</p>'+
 '<button class="kw-primary" data-kw="retry">重新加载词库</button>');return false});
 return loadPromise;
}
function allRows(){
 const official=new Map(Object.entries(get()).filter(([,v])=>v?.source==="krdict"&&Array.isArray(v.row))
  .map(([word,record])=>[word,record.row]));
 const base=wordRows.map(w=>official.get(w[0])||w);
 const known=new Set(base.map(w=>w[0]));
 for(const [word,row] of official)if(!known.has(word))base.push(row);
 return base;
}
function matchRows(){
 const query=search.trim().toLocaleLowerCase(),saved=get();
 return allRows().filter(w=>{
  if(onlySaved&&!saved[w[0]])return false;
  if(difficulty!=="全部"&&w[5]!==difficulty)return false;
  if(!query)return true;
  return [w[0],w[1],w[2],w[4],w[7]].some(v=>String(v||"").toLocaleLowerCase().includes(query));
 });
}
function library(){
 if(!wordRows){renderShell('<h1>正在读取合法授权的词汇数据…</h1>');return;}
 const matched=matchRows(),pages=Math.max(1,Math.ceil(matched.length/pageSize));
 if(page>=pages)page=pages-1;
 const viewRows=matched.slice(page*pageSize,(page+1)*pageSize),n=Object.keys(get()).length;
 const due=Object.values(get()).filter(w=>w.due<=Date.now()).length;
 renderShell('<div class="kw-eyebrow">EXTENDED KOREAN · NON-COMMERCIAL LEARNING</div>'+
 '<h1>认识更多词，也要把它们真正说出来。</h1>'+
 '<p class="kw-intro">已核查来源与授权、自动去重的 '+wordRows.length+' 个社区词头，支持韩文和中文搜索、场景例句、个人词书及间隔回忆。部分原词条仅附英文释义，例句和翻译需要进一步人工核对。</p>'+
 '<div class="kw-stats"><span><b>'+wordRows.length+'</b> 去重扩展词头</span>'+
 '<span><b>'+n+'</b> 加入我的词书</span><span><b>'+due+'</b> 到期复习</span></div>'+
 '<div class="kw-action-row"><button class="kw-primary" data-kw="study">复习我的词书 →</button>'+
 '<button class="kw-outline" data-kw="culture">学习韩国礼仪与敬语</button></div>'+
 '<div class="kw-search-row"><label><span>搜索韩语 / 中文 / 语义分类</span><input id="kw-search" value="'+esc(search)+'" autocomplete="off" placeholder="例：감사합니다、感谢、职场"/></label>'+
 '<label><span>学习难度</span><select id="kw-difficulty"><option value="全部">全部级别</option>'+
 [...new Set(wordRows.map(w=>w[5]))].sort().map(v=>'<option value="'+esc(v)+'" '+(difficulty===v?"selected":"")+'>'+esc(v)+'</option>').join("")+
 '</select></label></div>'+
 '<label class="kw-check"><input id="kw-saved-only" type="checkbox" '+(onlySaved?"checked":"")+'/> 只看我的词书</label>'+
 '<p class="kw-count">筛选找到 '+matched.length+' 词；第 '+(page+1)+' / '+pages+' 页</p>'+
 '<div class="kw-list">'+viewRows.map(w=>{
  const saved=Boolean(get()[w[0]]);
  return '<div class="kw-word"><div><strong lang="ko">'+esc(w[0])+'</strong><span>'+esc(w[1])+
   (w[6]?' · 英文释义':'')+'</span><small>'+esc(w[5])+' · '+esc(w[4]||"综合")+
   (w[2]?' · '+esc(w[2]):"")+'</small>'+
   (w[3]?'<details><summary>社区例句（需核对）</summary><p lang="ko">'+esc(w[3])+'</p></details>':"")+
   '</div><div class="kw-word-actions"><button data-kw-speak="'+esc(w[0])+'">听</button>'+
   '<button data-kw-save="'+esc(w[0])+'">'+(saved?"已收藏 ✓":"加入词书")+'</button></div></div>';
 }).join("")+'</div>'+
 '<div class="kw-paging"><button data-kw="prev" '+(page===0?"disabled":"")+'>← 上一页</button>'+
 '<span>'+ (page+1)+' / '+pages+'</span><button data-kw="next" '+(page+1>=pages?"disabled":"")+'>下一页 →</button></div>'+
 '<div class="kw-license"><h2>词库来源、质量与非商用边界</h2>'+
 '<p><a href="'+esc(meta.source.url)+'" target="_blank" rel="noopener noreferrer">Koko Korean 5K, Koko AI ↗</a>，'+
 '<a href="'+esc(meta.source.licenseUrl)+'" target="_blank" rel="noopener noreferrer">CC BY 4.0 ↗</a>。原始繁体数据经去重、模板例句过滤、简体转换；未声称由韩国国立国语院审核。</p>'+
 '<p>需要更权威的释义及生词：<a href="https://krdict.korean.go.kr/chn/mainAction" target="_blank" rel="noopener noreferrer">韩国国立国语院韩中学习词典 ↗</a>。官方词典已提供上方的按需在线检索入口；不会将官方词库全集复制到本站，也不会在浏览器公开 API 密钥。</p>'+
 '<p>收录词头总量不等于语言教学效果。用户添加词条后需要进行主动回忆与真实表达，学习者仍应向教师核实多义词及自然用法。</p></div>');
}
function beginStudy(){
 if(!wordRows){library();return;}
 const saved=get(),now=Date.now();
 queue=allRows().filter(w=>saved[w[0]]&&Number(saved[w[0]].due||0)<=now).slice(0,15);
 if(!queue.length)queue=allRows().filter(w=>saved[w[0]]).slice(0,10);
 view="study";feedback=null;renderStudy();
}
function renderStudy(){
 if(!queue.length){
  renderShell('<div class="kw-eyebrow">SPACED RETRIEVAL</div><h1>本次词汇回忆已完成。</h1>'+
  '<p>下次练习会根据你在每个词上的回答表现安排。答对不是口语或语境运用的自动认证。</p>'+
  '<button class="kw-primary" data-kw="back">回到词库 →</button>');return;
 }
 focus=queue[0];
 const card=focus,previous=feedback;
 renderShell('<button class="kw-back" data-kw="back">← 返回词库</button>'+
 '<div class="kw-eyebrow">PERSONAL VOCABULARY · '+queue.length+' 张待回忆</div>'+
 '<h1>先回忆词义，再自己写韩语。</h1>'+
 '<div class="kw-card"><span class="kw-zh">'+esc(card[1])+'</span><p>在不看韩语词头的情况下，输入你认为对应的韩文：</p>'+
 '<label for="kw-answer">你的韩语回忆</label><input id="kw-answer" lang="ko" autocomplete="off" placeholder="在这里输入韩语"/>'+
 (previous?'<div class="kw-feedback"><strong>'+(previous.ok?"字面回忆正确":"这张词卡还未记牢")+'</strong>'+
 '<p lang="ko">'+esc(card[0])+'</p><p>'+esc(card[1])+'</p>'+
 (card[3]?'<p>参考社区例句：<span lang="ko">'+esc(card[3])+'</span></p>':"")+
 '<button data-kw="next-card" class="kw-primary">继续下一词 →</button></div>':
 '<div class="kw-action-row"><button class="kw-primary" data-kw="check">检查本次回忆</button>'+
 '<button class="kw-outline" data-kw="forget">实在想不起来（记错题）</button></div>')+
 '</div><p class="kw-message">记忆间隔以当天本机时间计算；熟练使用还要靠听、说和语境迁移任务。</p>');
}
function updateRecall(remembered){
 if(!focus)return;
 const current=get()[focus[0]]||{reps:0,due:Date.now()};
 const reps=remembered?Math.max(0,Number(current.reps||0))+1:0;
 const days=[1,3,7,15,30,60,120][Math.min(Math.max(0,reps-1),6)];
 state.saved[focus[0]]={...current,due:Date.now()+(remembered?days*86400000:600000),reps,
  errors:Number(current.errors||0)+(remembered?0:1),last:Date.now()};
 save();feedback={ok:remembered};renderStudy();
}
async function render(){
 if(document.body.dataset.view!=="wordbank")return;
 if(!await loadWords())return;
 state=loadState();
 if(view==="study")renderStudy();else library();
}
let queryTimer=null;
root.addEventListener("input",e=>{
 if(e.target?.id!=="kw-search")return;
 search=e.target.value;page=0;
 clearTimeout(queryTimer);
 queryTimer=setTimeout(()=>{
  if(document.body.dataset.view!=="wordbank")return;
  library();const input=root.querySelector("#kw-search");
  if(input){input.focus();input.setSelectionRange(search.length,search.length);}
 },180);
});
root.addEventListener("change",e=>{
 if(e.target?.id==="kw-difficulty"){difficulty=e.target.value;page=0;library();}
 if(e.target?.id==="kw-saved-only"){onlySaved=e.target.checked;page=0;library();}
});
root.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.kwSpeak){speak(b.dataset.kwSpeak);return;}
 if(b.dataset.kwSave!==undefined){
  const word=b.dataset.kwSave;
  state.saved??={};
  if(!state.saved[word])state.saved[word]={due:Date.now(),reps:0,errors:0,added:Date.now()};
  save();library();return;
 }
 switch(b.dataset.kw){
  case "study":beginStudy();break;
  case "back":view="search";library();break;
  case "check":if(!focus||feedback)return;updateRecall(normalize(root.querySelector("#kw-answer")?.value)===normalize(focus[0]));break;
  case "forget":if(!feedback)updateRecall(false);break;
  case "next-card":queue.shift();feedback=null;renderStudy();break;
  case "prev":page=Math.max(0,page-1);library();break;
  case "next":page+=1;library();break;
  case "retry":loadPromise=null;render();break;
  case "culture":document.dispatchEvent(new Event("kms:wordbank-to-culture"));break;
 }
});
document.addEventListener("kms:wordbank-updated",()=>{
 state=loadState();if(view==="search"&&document.body.dataset.view==="wordbank")library();
});
document.addEventListener("kms:wordbank-open",()=>{view="search";render();});
if(document.body.dataset.view==="wordbank")render();
