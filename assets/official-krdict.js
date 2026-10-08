// Official NIKL learner dictionary lookup: key ONLY on existing Railway backend.
// No user account, no external dictionary credential in this GitHub Pages bundle.
const element=document.querySelector("#official-krdict");
if(!element)throw Error("Official dictionary UI missing");
const ENDPOINT="https://korea-media-korean-mcp-production.up.railway.app/api/krdict/search";
const WORD_KEY="kmsExtendedVocabularyV1";
const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
let query="",status="",busy=false,data=null,abort=null;
const fmt=x=>String(x||"").trim();
function statusMsg(text){const p=element.querySelector("#nikl-status");if(p)p.textContent=text}
function render(){
 if(document.body.dataset.view!=="wordbank")return;
 const items=Array.isArray(data?.items)?data.items:[];
 element.innerHTML='<div class="nikl-shell">'+
 '<div class="nikl-eyebrow">NATIONAL INSTITUTE OF KOREAN LANGUAGE · OFFICIAL LOOKUP</div>'+
 '<h2>查韩国官方词典，把生词变成自己的课程。</h2>'+
 '<p class="nikl-intro">在韩国国立国语院的《韩国语基础词典》中按需查询韩语词头。中文翻译、词性和释义按官网实际结果显示。查询通过本产品现有后端，认证密钥不会发送给浏览器。</p>'+
 '<form id="nikl-form" class="nikl-form"><label for="nikl-query">输入韩语词头</label>'+
 '<div class="nikl-query-row"><input id="nikl-query" lang="ko" maxlength="40" autocomplete="off" placeholder="例如：나무、학교、감사하다" value="'+esc(query)+'"/>'+
 '<button type="submit" '+(busy?"disabled":"")+'>'+(busy?"正在查询…":"官方词典查询")+'</button></div></form>'+
 '<p id="nikl-status" role="status" aria-live="polite">'+esc(status||"与下方的社区词库互补；只有用户主动输入并点击查询时才请求官方接口。")+'</p>'+
 (data?'<div class="nikl-summary">官方检索到约 '+Number(data.total||0)+' 条结果；当前显示 '+items.length+' 条。不是整部词典下载。</div>'+
 '<div class="nikl-results">'+items.map((item,i)=>{
  const sense=Array.isArray(item.senses)?item.senses:[];
  const gloss=sense.map(x=>fmt(x.translation)).filter(Boolean).slice(0,3).join("；")||
    sense.map(x=>fmt(x.definitionZh)).filter(Boolean).slice(0,1).join("")||
    "暂无中文译词";
  return '<article class="nikl-entry"><div class="nikl-entry-top"><div><strong lang="ko">'+esc(item.word)+'</strong>'+
   '<span>'+esc(item.pos||"词性待补充")+(item.level?" · "+esc(item.level):"")+
   (item.pronunciation?" · "+esc(item.pronunciation):"")+'</span></div>'+
   '<button type="button" data-nikl-save="'+i+'">加入我的复习词书</button></div>'+
   '<p class="nikl-gloss">'+esc(gloss)+'</p>'+
   sense.slice(0,2).map((s,n)=>
    '<details><summary>第 '+(n+1)+' 个释义 · 韩语原文与中文说明</summary>'+
    (s.definitionKo?'<p lang="ko">'+esc(s.definitionKo)+'</p>':"")+
    (s.definitionZh?'<p>'+esc(s.definitionZh)+'</p>':"")+'</details>').join("")+
   (item.url?'<p><a href="'+esc(item.url)+'" target="_blank" rel="noopener noreferrer">查看官方词典原始词条 ↗</a></p>':"")+
   '</article>';
 }).join("")+'</div>':"")+
 '<p class="nikl-source">官方来源：<a href="https://krdict.korean.go.kr/chn/mainAction" target="_blank" rel="noopener noreferrer">韩国国立国语院《韩国语基础词典》↗</a>。学习进度仅存放在当前浏览器，词条准确性以官方网站为准。设备朗读不等于官方真人发音录音。</p>'+
 '</div>';
}
async function search(q){
 const chosen=String(q||"").trim();query=chosen;
 if(!/[가-힣ㄱ-ㅎㅏ-ㅣ]/u.test(chosen)||[...chosen].length>40){
  status="请填写 1–40 字以内的韩语词条；中文查询可使用下方社区词库。";
  data=null;render();return;
 }
 if(busy&&abort)abort.abort();
 abort=new AbortController();busy=true;status="正在通过 Korean Media Study 后端检索官方词典…";render();
 const t=setTimeout(()=>abort.abort(),12500);
 try{
  const request=new URL(ENDPOINT);
  request.searchParams.set("q",chosen);
  const response=await fetch(request.toString(),{mode:"cors",credentials:"omit",
    headers:{"accept":"application/json"},signal:abort.signal,redirect:"error"});
  const parsed=await response.json().catch(()=>null);
  if(!response.ok||!parsed?.ok||!Array.isArray(parsed.items)){
   throw new Error(parsed?.message||"官方查询暂时不可用，稍后重试或直接打开官方词典网站");
  }
  data=parsed;status=parsed.items.length?"已收到官方词条，请按需查看释义或收藏。":"未找到对应词条，尝试词典中的动词原形或更短词头。";
 }catch(e){
  data=null;
  status=e?.name==="AbortError"?"查询超时，请检查连接或稍后重试。":
   fmt(e?.message||"官方词典查询暂不可用").slice(0,150);
 }finally{clearTimeout(t);busy=false;render()}
}
function saveToWordbook(i){
 const item=data?.items?.[i];if(!item?.word)return;
 const gloss=item.senses?.map(x=>fmt(x.translation)).filter(Boolean).slice(0,3).join("；")||
   item.senses?.map(x=>fmt(x.definitionZh)).filter(Boolean).slice(0,1).join("")||
   "需要查看官方词典的详细释义";
 try{
  const saved=JSON.parse(localStorage.getItem(WORD_KEY)||'{"saved":{}}');
  if(!saved||typeof saved!=="object")throw Error("invalid saved data");
  saved.saved??={};
  const old=saved.saved[item.word]||{};
  const row=[item.word,gloss,item.pronunciation||"", "", "韩国国立国语院官方词典",item.level||"官方词条",0,gloss];
  saved.saved[item.word]={...old,source:"krdict",row,targetCode:item.id,url:item.url||null,
   due:Number.isFinite(old.due)?old.due:Date.now(),reps:Number(old.reps||0),
   errors:Number(old.errors||0),added:Number(old.added||Date.now())};
  localStorage.setItem(WORD_KEY,JSON.stringify(saved));
  status="已加入个人复习词书：「"+item.word+"」。你可在下方开启主动回忆训练。";
  document.dispatchEvent(new Event("kms:wordbank-updated"));
  render();
 }catch{
  status="无法保存到当前浏览器，请检查本地存储权限。";render();
 }
}
element.addEventListener("submit",e=>{
 if(e.target.id!=="nikl-form")return;
 e.preventDefault();search(element.querySelector("#nikl-query")?.value||"");
});
element.addEventListener("click",e=>{
 const b=e.target.closest("[data-nikl-save]");
 if(b)saveToWordbook(Number(b.dataset.niklSave));
});
document.addEventListener("kms:wordbank-open",()=>{render()});
if(document.body.dataset.view==="wordbank")render();
