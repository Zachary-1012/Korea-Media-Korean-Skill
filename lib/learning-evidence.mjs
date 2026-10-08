// Auditable learner evidence. Bounded assessments are not language certification.
import {LEVEL_IDS,ASSESSMENTS,checkpointItems} from "./learning-assessments.mjs";
import {normalizeKorean,dueCards,safeStudy} from "./real-life-study.mjs";
import {KOREAN_UNITS} from "./real-life-curriculum.mjs";
export const EVIDENCE_KEY="kmsEducationEvidenceV1";
export const DAY=86400000;
export function emptyEvidence(){return {version:1,placement:null,checks:{},history:[],teacherNotes:[],revisions:{},dailyMinutes:20};}
export function safeEvidence(raw){
 const o=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 const checks=o.checks&&typeof o.checks==="object"&&!Array.isArray(o.checks)?o.checks:{};
 const history=Array.isArray(o.history)?o.history.filter(x=>x&&Number.isFinite(x.time)&&LEVEL_IDS.includes(x.level)).slice(-200):[];
 const teacherNotes=Array.isArray(o.teacherNotes)?o.teacherNotes.slice(-100):[];
 const revisions=o.revisions&&typeof o.revisions==="object"&&!Array.isArray(o.revisions)?
  Object.fromEntries(Object.entries(o.revisions).filter(([,v])=>v&&Number.isFinite(v.due)).slice(-100)):{};
 const dailyMinutes=[10,20,30].includes(Number(o.dailyMinutes))?Number(o.dailyMinutes):20;
 const placement=o.placement&&LEVEL_IDS.includes(o.placement.recommend)?o.placement:null;
 return {version:1,placement,checks,history,teacherNotes,revisions,dailyMinutes};
}
export function auditItem(item){
 return !!(item&&["reading","listening"].includes(item.mode)&&
 typeof item.ko==="string"&&Array.isArray(item.options)&&item.options.length===4&&
 new Set(item.options).size===4&&Number.isInteger(item.answer)&&item.answer>=0&&item.answer<4&&
 item.options[item.answer]?.length>0);
}
export function assessAnswers(level,choices,audioExperienced=[],repeat=false){
 const items=checkpointItems(level,repeat);
 if(!items||!Array.isArray(choices)||choices.length!==items.length)throw Error("评估题数不完整");
 const details=items.map((q,i)=>{
  if(!auditItem(q))throw Error("题目数据不完整");
  const correct=Number.isInteger(choices[i])&&choices[i]===q.answer;
  const genuineListening=q.mode==="listening"&&audioExperienced[i]===true;
  return {index:i,mode:q.mode,correct,genuineListening,reason:q.reason,correctChoice:q.answer};
 });
 return {level,score:details.filter(x=>x.correct).length,total:details.length,
   listeningVerified:details.filter(x=>x.mode==="listening"&&x.correct&&x.genuineListening).length,
   listeningPossible:details.filter(x=>x.mode==="listening").length,details};
}
export function computePlacement(results,at=Date.now()){
 const scores=LEVEL_IDS.map(level=>{
  const r=results?.[level];
  return r&&Number.isFinite(r.score)?{level,score:r.score,total:r.total||4}:null;
 }).filter(Boolean);
 if(!scores.length)throw Error("必须完成至少一个水平的诊断");
 let recommend="A0";
 for(let i=0;i<LEVEL_IDS.length;i++){
  const r=results[LEVEL_IDS[i]];
  if(!r||r.score<3){recommend=LEVEL_IDS[i];break;}
  recommend=LEVEL_IDS[Math.min(i+1,LEVEL_IDS.length-1)];
 }
 return {time:at,recommend,results:scores,limitations:"词义/理解分流建议，不能证明口语、写作或正式 CEFR 等级。"};
}
export function textSimilarity(candidate,reference){
 const a=[...normalizeKorean(candidate)],b=[...normalizeKorean(reference)];
 if(!a.length||!b.length)return 0;
 const prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  let last=prev[0];prev[0]=i;
  for(let j=1;j<=b.length;j++){
   const old=prev[j];prev[j]=Math.min(prev[j]+1,prev[j-1]+1,last+(a[i-1]===b[j-1]?0:1));last=old;
  }
 }
 return Math.max(0,1-prev[b.length]/Math.max(a.length,b.length));
}
export function evaluateTransfer(value,required){
 const response=normalizeKorean(value),slots=required||[];
 if(!response||!slots.length)return {matched:[],missing:slots.slice(),coverage:0,language:"none"};
 const matched=slots.filter(w=>response.includes(normalizeKorean(w)));
 return {matched,missing:slots.filter(w=>!matched.includes(w)),coverage:matched.length/slots.length,
   language:/[가-힣]/.test(value)?"korean":"other",limitations:"仅检查限定功能词是否出现，不代表语法正确、自然或真正完成沟通。"};
}
export function createCheck(level,inputs={},now=Date.now()){
 const pack=ASSESSMENTS[level];if(!pack)throw Error("未知级别");
 const r=assessAnswers(level,inputs.choices,inputs.heard||[],Boolean(inputs.repeat));
 const repeat=Boolean(inputs.repeat),task=repeat?pack.retry:pack.transfer;
 const transcript=inputs.dictation||"",target=repeat?pack.retry.dictation:pack.dictation;
 const similarity=textSimilarity(transcript,target),audioIndependent=Boolean(inputs.dictationHeard);
 const transfer=evaluateTransfer(inputs.writing||"",task.required);
 const objectiveReady=r.score>=3&&r.listeningVerified>=1&&similarity>=.87&&audioIndependent&&
    transfer.coverage===1&&!inputs.usedHint;
 return {level,time:now,round:repeat?"delayed":"initial",
  score:r.score,total:r.total,listeningVerified:r.listeningVerified,listeningPossible:r.listeningPossible,
  dictationSimilarity:Math.round(similarity*100)/100,dictationHeard:audioIndependent,transfer,
  usedHint:Boolean(inputs.usedHint),objectiveReady,
  feedback:{
   answers:r.details.map(x=>({correct:x.correct,mode:x.mode,reason:x.reason,
     correctChoice:x.correctChoice,listeningObserved:x.genuineListening})),
   dictationTarget:target,dictationActual:transcript,
   transferActual:String(inputs.writing||"").slice(0,1400),
   transferReference:task.explanation||pack.transfer.explanation,missing:transfer.missing
  },
  limits:"封闭题、设备朗读/听写和关键词覆盖的客观练习；自由表达和发音未自动核验。"};
}
export function saveCheck(state,result,now=Date.now()){
 const s=safeEvidence(state);if(!LEVEL_IDS.includes(result.level))throw Error("未知评估");
 const old=s.checks[result.level]||{};
 if(result.round==="delayed"&&!old.initial?.objectiveReady)
   throw Error("先完成首次阶段评估并通过客观部分");
 if(result.round==="delayed"&&now-(old.initial?.time||0)<DAY)
   throw Error("需要在首次完成至少24小时后复测，不能马上重复代替保持证据");
 if(result.round==="initial")s.checks[result.level]={initial:result,delayed:null,retained:false};
 else s.checks[result.level]={...old,delayed:result,retained:Boolean(result.objectiveReady)};
 s.history=[...s.history,{time:now,level:result.level,round:result.round,
  objectiveReady:result.objectiveReady,score:result.score}].slice(-200);
 return s;
}
export function stageState(evidence,level,now=Date.now()){
 const s=safeEvidence(evidence),item=s.checks[level]||{};
 if(item.retained)return {code:"retained",label:"延迟复测客观部分通过（非正式等级）",next:"继续真实场景使用并获取教师反馈"};
 if(item.delayed&&!item.delayed.objectiveReady)return {code:"remediate",label:"延迟复测发现遗忘或迁移困难",next:"针对这次具体错题补练，再重新进行首次检查"};
 if(item.initial?.objectiveReady&&now-item.initial.time<DAY)
  return {code:"waiting",label:"首次客观练习通过，等待24小时后复测",next:"复习错题并在真实环境独立使用"};
 if(item.initial?.objectiveReady)return {code:"retest",label:"可以进行延迟迁移复测",next:"用不同任务验证保持效果"};
 if(item.initial)return {code:"remediate",label:"还有尚未通过的客观项目",next:"回到课程和错题补练"};
 return {code:"not_assessed",label:"尚未进行独立阶段检查",next:"学完当前阶段后再做独立评估"};
}
export function todayPlan(evidence,study,now=Date.now()){
 const e=safeEvidence(evidence),s=safeStudy(study),due=dueCards(s,now);
 const firstUnpracticed=(e.placement&&!Object.values(s.units).some(x=>x?.practiced)
  ?KOREAN_UNITS.find(u=>u.level===e.placement.recommend)
  :null)||KOREAN_UNITS.find(u=>!s.units[u.id]?.passed)||KOREAN_UNITS.at(-1);
 const recheck=LEVEL_IDS.find(l=>stageState(e,l,now).code==="retest");
 const needsReview=LEVEL_IDS.find(l=>stageState(e,l,now).code==="remediate");
 const steps=[];
 const outstanding=dueRevisions(e,now);
 if(!e.placement)steps.push({type:"placement",label:"先完成分级诊断",minutes:5,reason:"还没有学习起点证据"});
 if(due.length)steps.push({type:"review",label:"主动回忆 "+Math.min(due.length,15)+" 个到期词",minutes:5,reason:"优先巩固易忘词汇"});
 if(outstanding.length)steps.push({type:"revision",label:"重说 / 重写 "+Math.min(outstanding.length,5)+" 条反馈任务",minutes:6,reason:"先修正已暴露的沟通和表达缺陷"});
 if(recheck)steps.push({type:"checkpoint",level:recheck,label:recheck+" 延迟迁移复测",minutes:7,reason:"检测至少24小时后的保持"});
 else if(needsReview){
  const weak=e.checks[needsReview]?.delayed||e.checks[needsReview]?.initial;
  const unitId=locateRemediationUnit(needsReview,weak).id;
  steps.push({type:"remediate",level:needsReview,unitId,label:needsReview+" 弱项专题补练",minutes:7,
   reason:"根据答错的韩语场景推荐相应课程，再检查理解与迁移"});
 }
 steps.push({type:"lesson",unitId:firstUnpracticed.id,label:"学习 "+firstUnpracticed.title,minutes:e.dailyMinutes===10?6:12,reason:"补齐尚未完成的学习任务"});
 steps.push({type:"transfer",label:"在真实场景独立回答并记录反馈",minutes:5,reason:"不把选择题正确等同于交流"});
 return {time:now,budget:e.dailyMinutes,dueCount:due.length,revisionCount:outstanding.length,steps,priority:steps[0],
   warning:"计划基于本地练习与检查，不能保证学会或达到正式等级。"};
}
export function recordExternalReview(state,{level,communication,accuracy,fluency,notes,source,original},now=Date.now()){
 const e=safeEvidence(state);if(!LEVEL_IDS.includes(level))throw Error("未知级别");
 const scores=[communication,accuracy].map(Number);
 const speechScore=fluency==null||fluency==="na"?null:Number(fluency);
 if(!scores.every(v=>Number.isInteger(v)&&v>=0&&v<=4)||
    (speechScore!==null&&(!Number.isInteger(speechScore)||speechScore<0||speechScore>4)))
  throw Error("请完整填写实际已观察项目的0到4分，未听到语音时选择未验证");
 if(String(notes||"").trim().length<12)throw Error("需要至少12个字的具体纠正和下一步");
 if(!["teacher","partner","self"].includes(source))throw Error("请选择反馈来源");
 e.teacherNotes=[...e.teacherNotes,{time:now,level,communication:scores[0],accuracy:scores[1],
   fluency:speechScore,source,notes:String(notes).trim().slice(0,1000),verifiedExternally:false}].slice(-100);
 const id=level+":"+now+":"+e.teacherNotes.length;
 e.revisions={...e.revisions,[id]:{id,level,time:now,due:now,source,
   prompt:String(notes).trim().slice(0,1000),original:String(original||"").trim().slice(0,1000),attempts:[],status:"due"}};
 return e;
}
export function feedbackPrompt(level,learnerText){
 const pack=ASSESSMENTS[level];if(!pack)throw Error("未知级别");
 return "你是一位专业韩语教师。请对学习者作形成性反馈，而非声称官方认证。\n"+
 "级别学习目标："+pack.title+"；"+pack.canDo+"\n"+
 "请按：①能否完成沟通意图 ②词汇语法准确性 ③敬语自然程度 ④下一次可迁移场景，逐项评价。\n"+
 "无法从文字判断的发音或流利程度标为【未验证】，不得编造口语分数。\n"+
 "输出：优先修正两处错误→更自然示范→要求重说三句→24小时复测任务。\n我的真实表达：\n"+
 String(learnerText||"").slice(0,3000);
}

export function dueRevisions(state,now=Date.now()){
 const e=safeEvidence(state);
 return Object.values(e.revisions).filter(x=>x.status!=="archived"&&Number(x.due)<=now)
   .sort((a,b)=>a.due-b.due);
}
export function repeatWithFeedback(state,id,rewrite,{usedHint=false}={},now=Date.now()){
 const s=safeEvidence(state),task=s.revisions[id];
 if(!task)throw Error("未找到对应的错误重练任务");
 if(task.due>now)throw Error("请等到预约的复习时间再重练，不要用立即重复代替长期保持");
 const answer=String(rewrite||"").trim();
 const min={A0:3,A1:6,A2:10,B1:16,B2:22}[task.level]||6;
 const characters=(answer.match(/[가-힣]/g)||[]).length;
 if(characters<min)throw Error("韩语回答过短，请依照本阶段要求补充完整表达");
 const compare=[task.original,...(task.attempts||[]).map(x=>x.reply)];
 if(compare.filter(Boolean).some(v=>normalizeKorean(v)===normalizeKorean(answer)))
   throw Error("请尝试新的表达，不能直接照抄之前的回答");
 const attempts=[...(task.attempts||[]),{time:now,reply:answer.slice(0,1600),usedHint:Boolean(usedHint)}].slice(-8);
 const intervals=[DAY,3*DAY,7*DAY,14*DAY,30*DAY];
 s.revisions={...s.revisions,[id]:{...task,attempts,due:now+intervals[Math.min(attempts.length-1,intervals.length-1)],
   status:"scheduled",lastAttempt:now}};
 return s;
}

export function locateRemediationUnit(level,check){
 const units=KOREAN_UNITS.filter(u=>u.level===level);
 if(!units.length)throw Error("找不到该水平的课程");
 const gaps=(check?.feedback?.answers||[]).map((a,i)=>({a,q:ASSESSMENTS[level]?.items[i]}))
   .filter(({a})=>!a.correct||a.mode==="listening"&&!a.listeningObserved)
   .map(({q})=>q?.ko||"");
 if(!gaps.length)return units[0];
 const ranked=units.map((u,i)=>{
  let score=0;
  for(const ko of gaps){
   score+=u.words.reduce((sum,w)=>sum+(w.ko.length>=2&&ko.includes(w.ko)?3:0),0);
   score+=u.dialogue.reduce((sum,row)=>sum+(row.ko.slice(0,8)&&ko.includes(row.ko.slice(0,8))?1:0),0);
  }
  return {unit:u,score,index:i};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 return ranked[0].unit;
}
