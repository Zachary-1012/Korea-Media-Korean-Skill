// Deterministic, local-only spaced repetition helpers.
// This does not infer real-world proficiency from activity counts.
import {KOREAN_UNITS} from "./real-life-curriculum.mjs";
export const STORE_KEY="kmsRealLifePathV1";
export function emptyStudy(){return {version:1,cards:{},units:{},missions:{},sessions:{},lastUnit:"H01"};}
export function safeStudy(raw){
 const s=raw&&typeof raw==="object"?raw:{};
 const clean=o=>o&&!Array.isArray(o)&&typeof o==="object"?o:{};
 const ids=new Set(KOREAN_UNITS.map(u=>u.id));
 return {version:1,cards:clean(s.cards),units:clean(s.units),missions:clean(s.missions),sessions:clean(s.sessions),lastUnit:ids.has(s.lastUnit)?s.lastUnit:"H01"};
}
export function dueCards(state,now=Date.now()){
 const s=safeStudy(state);
 return Object.entries(s.cards).filter(([,c])=>Number.isFinite(c?.due)&&c.due<=now).sort((a,b)=>a[1].due-b[1].due).map(([word])=>word);
}
export function reviewWord(state,word,remembered,now=Date.now()){
 const s=safeStudy(state),base=s.cards[word]||{interval:0,reps:0,errors:0,due:0};
 const reps=remembered?Math.max(0,Number(base.reps)||0)+1:0;
 // Bound repetition: day 1, day 3, day 7, day 15, then near-doubling.
 const schedule=[1,3,7,15,30,60,120,240];
 const days=remembered?schedule[Math.min(reps-1,schedule.length-1)]:0;
 s.cards={...s.cards,[word]:{due:now+(remembered?days*86400000:10*60000),interval:days,reps,errors:(Number(base.errors)||0)+(remembered?0:1),last:now}};
 return s;
}
export function normalizeKorean(value){return String(value??"").normalize("NFKC").toLowerCase().replace(/[\s\p{P}\p{S}]/gu,"").trim();}
export function answerCorrect(given,expected){return normalizeKorean(given)===normalizeKorean(expected);}
export function chooseExercises(unit,attempt=0){
 if(!unit||unit.words.length<10)throw Error("Incomplete study unit");
 const ws=unit.words;
 const start=(Math.max(0,Number(attempt)||0)*3)%ws.length;
 const selected=[0,3,6,9,12].map((n)=>ws[(n+start)%ws.length]);
 return selected.map((w,index)=>{
  const other=ws.filter(x=>x.ko!==w.ko&&x.zh!==w.zh);
  const unique=[];
  for(const item of other)if(!unique.some(x=>x.zh===item.zh))unique.push(item);
  const distract=[unique[(index*3+start)%unique.length],unique[(index*3+start+2)%unique.length]];
  const mode=unit.level==="A0"?"choice":index===1?"listen":index>=3?"type":"choice";
  const opts=[w,...distract].filter(Boolean);
  const rotate=(index+start)%opts.length;
  return {mode,word:w,options:opts.slice(rotate).concat(opts.slice(0,rotate))};
 });
}
export function finishMission(state,unitId,reply,selfAssessment,score,now=Date.now(),evidence={}){
 const s=safeStudy(state),content=String(reply||"").trim();
 const turns=Math.max(0,Number(evidence.turns)||0),hintsUsed=Boolean(evidence.hintsUsed);
 const unit=KOREAN_UNITS.find(u=>u.id===unitId);
 const responses=Array.isArray(evidence.responses)?evidence.responses.map(x=>String(x||"").trim()):[];
 if(!unit)throw Error("找不到对应课程，不能保存无效任务");
 if(content.length<2)throw Error("请先写下或转写自己的韩语回答");
 if(responses.length){
  if(responses.length<2||responses.length!==turns)throw Error("需要连续完成规定回合");
  const min={A0:1,A1:3,A2:6,B1:12,B2:20}[unit.level]||3;
  if(responses.some(r=>(r.match(/[가-힣]/g)||[]).length<min))throw Error("回答太短：请按本级别用韩语充分表达后再继续");
  if(unit.level!=="A0"&&new Set(responses.map(normalizeKorean)).size<Math.min(3,responses.length))throw Error("不同回合不能复用同一句话；请针对追问分别回答");
 }
 if(unitId==="B210"&&turns<5)throw Error("综合挑战必须完成五轮回答");
 if(turns<2)throw Error("必须先完成至少两轮真实对话");
 if(!["independent","with-help","retry"].includes(selfAssessment))throw Error("需要自我评估");
 const passed=score>=4&&selfAssessment==="independent"&&!hintsUsed;
 s.missions={...s.missions,[unitId]:{time:now,reply:content.slice(0,3000),selfAssessment,score,turns,hintsUsed}};
 s.units={...s.units,[unitId]:{attempts:(Number(s.units[unitId]?.attempts)||0)+1,last:now,score,turns,hintsUsed,practiced:true,passed}};
 const next=KOREAN_UNITS.findIndex(x=>x.id===unitId)+1;
 if(passed&&next<KOREAN_UNITS.length)s.lastUnit=KOREAN_UNITS[next].id;
 else s.lastUnit=unitId;
 return s;
}
