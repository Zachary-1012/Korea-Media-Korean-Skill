import test from "node:test";
import assert from "node:assert/strict";
import {LEVEL_IDS,ASSESSMENTS,RETEST_ITEMS,checkpointItems} from "../lib/learning-assessments.mjs";
import {emptyStudy,reviewWord} from "../lib/real-life-study.mjs";
import {emptyEvidence,safeEvidence,auditItem,assessAnswers,computePlacement,
 textSimilarity,evaluateTransfer,createCheck,saveCheck,stageState,todayPlan,recordExternalReview,feedbackPrompt,
 dueRevisions,repeatWithFeedback,locateRemediationUnit,DAY}
 from "../lib/learning-evidence.mjs";
test("five levels have four unambiguous authored tasks and meaningful distinct transfer",()=>{
 assert.equal(LEVEL_IDS.length,5);
 for(const l of LEVEL_IDS){
  const a=ASSESSMENTS[l];
  assert.equal(a.items.length,4,l);
  assert.ok(a.items.every(auditItem),l);
  assert.ok(a.items.some(x=>x.mode==="reading"),l);
  assert.ok(a.items.some(x=>x.mode==="listening"),l);
  assert.ok(a.dictation.includes(" "),l);
  assert.notEqual(a.dictation,a.retry.dictation,l);
  assert.ok(a.transfer.required.length>=2,l);
  assert.ok(a.retry.required.length>=2,l);
 }
});
test("placement is honest reading/listening recommendation, no fake speaking level",()=>{
 const r=assessAnswers("A0",[0,1,0,1],[false,false,false,false]);
 assert.equal(r.score,4);
 assert.equal(r.listeningVerified,0);
 const plan=computePlacement({A0:r,A1:{score:1,total:4}});
 assert.equal(plan.recommend,"A1");
 assert.match(plan.limitations,/口语/);
 assert.throws(()=>computePlacement({}),/至少一个/);
});
test("hearing fallback never counts as real listening evidence",()=>{
 const a=ASSESSMENTS.A1;
 const choices=a.items.map(q=>q.answer);
 const r=assessAnswers("A1",choices,choices.map(()=>false));
 assert.equal(r.score,4);
 assert.equal(r.listeningVerified,0);
 const c=createCheck("A1",{choices,heard:choices.map(()=>false),dictation:a.dictation,
   dictationHeard:false,writing:"카드로 결제할 수 있어요?",usedHint:false},10);
 assert.equal(c.objectiveReady,false);
 assert.equal(c.dictationHeard,false);
});
test("dictation compares words transparently and transfer keyword coverage isn't grammar grading",()=>{
 assert.equal(textSimilarity("물 주세요!","물 주세요."),1);
 assert.ok(textSimilarity("카드","카드로 결제할 수 있어요?")<.5);
 const t=evaluateTransfer("금요일로 예약을 변경할 수 있을까요?",["금요일","변경"]);
 assert.equal(t.coverage,1);
 assert.match(t.limitations,/语法正确/);
});
test("objective result requires correct reading, actual TTS playback, dictation and independent transfer",()=>{
 const a=ASSESSMENTS.A0;
 const payload={choices:a.items.map(q=>q.answer),heard:a.items.map(q=>q.mode==="listening"),
  dictation:a.dictation,dictationHeard:true,writing:"물 좀 주세요.",usedHint:false};
 let r=createCheck("A0",payload,1000);
 assert.equal(r.objectiveReady,true);
 assert.equal(r.score,4);
 assert.equal(r.listeningVerified,2);
 assert.equal(createCheck("A0",{...payload,usedHint:true}).objectiveReady,false);
 assert.equal(createCheck("A0",{...payload,writing:"안녕하세요."}).objectiveReady,false);
 assert.equal(createCheck("A0",{...payload,dictation:"감사합니다."}).objectiveReady,false);
});
test("delayed transfer is impossible before 24 hours and initial practice not certification",()=>{
 const a=ASSESSMENTS.A0,at=100000;
 const payload={choices:a.items.map(q=>q.answer),heard:a.items.map(q=>q.mode==="listening"),
  dictation:a.dictation,dictationHeard:true,writing:"물 주세요.",usedHint:false};
 const first=createCheck("A0",payload,at);
 let state=saveCheck(emptyEvidence(),first,at);
 assert.equal(stageState(state,"A0",at).code,"waiting");
 const alternative=RETEST_ITEMS.A0;
 const retry=createCheck("A0",{...payload,repeat:true,
  choices:alternative.map(q=>q.answer),heard:alternative.map(q=>q.mode==="listening"),
  dictation:a.retry.dictation,writing:"우유 주세요."},at+DAY);
 assert.throws(()=>saveCheck(state,retry,at+1000),/24小时/);
 state=saveCheck(state,retry,at+DAY);
 assert.equal(state.checks.A0.retained,true);
 assert.equal(stageState(state,"A0",at+DAY).code,"retained");
 assert.equal(state.history.length,2);
});
test("daily plan prioritizes diagnostic and real due words before new unit",()=>{
 const now=DAY*7;
 let study=reviewWord(emptyStudy(),"우유",false,now-DAY);
 const p=todayPlan(emptyEvidence(),study,now);
 assert.equal(p.steps[0].type,"placement");
 assert.equal(p.steps[1].type,"review");
 assert.equal(p.steps.at(-1).type,"transfer");
 assert.ok(p.dueCount>=1);
});
test("teacher feedback is learner supplied, never marked externally verified",()=>{
 const s=recordExternalReview(emptyEvidence(),{level:"A1",communication:3,accuracy:2,fluency:2,
  notes:"忘记确认付款方式，下次需要在咖啡店再做三轮练习。",source:"teacher"},1000);
 assert.equal(s.teacherNotes[0].verifiedExternally,false);
 const noAudio=recordExternalReview(emptyEvidence(),{level:"A1",communication:2,accuracy:2,
  fluency:"na",notes:"只检查了书面表达，没有听到真实韩语朗读或口语回答。",source:"teacher"});
 assert.equal(noAudio.teacherNotes[0].fluency,null);
 assert.match(feedbackPrompt("A1","카드로 결제"),/未验证/);
 assert.throws(()=>recordExternalReview(s,{level:"A1",communication:9,accuracy:2,fluency:2,notes:"说明不够清晰",source:"teacher"}),/0到4分/);
 assert.deepEqual(safeEvidence(null),emptyEvidence());
});

test("teacher error -> independent rewrite -> delayed retrieval evidence (never automatic grammar pass)",()=>{
 const t=100000,base=recordExternalReview(emptyEvidence(),{
  level:"A1",communication:2,accuracy:1,fluency:2,source:"teacher",
  notes:"在结账情境忘了使用礼貌问句，请重写并确认可以使用银行卡支付。",
  original:"카드로 결제할 수 있을까요?"},t);
 const task=dueRevisions(base,t)[0];
 assert.ok(task&&task.level==="A1");
 assert.equal(task.attempts.length,0);
 assert.throws(()=>repeatWithFeedback(base,task.id,"카드로 결제할 수 있을까요?",{},t),/照抄/);
 assert.throws(()=>repeatWithFeedback(base,task.id,"네",{},t),/回答过短/);
 const revised=repeatWithFeedback(base,task.id,"여기에서 카드로 계산해도 될까요?",{},t);
 assert.equal(revised.revisions[task.id].attempts.length,1);
 assert.equal(revised.revisions[task.id].due,t+DAY);
 assert.deepEqual(dueRevisions(revised,t),[]);
 assert.throws(()=>repeatWithFeedback(revised,task.id,"카드로 결제할 수 있나요?",{},t+1000),/预约/);
 const reviewed=repeatWithFeedback(revised,task.id,"카드로 계산해도 괜찮습니까?",{},t+DAY);
 assert.equal(reviewed.revisions[task.id].attempts.length,2);
 assert.equal(reviewed.revisions[task.id].status,"scheduled");
 assert.equal(reviewed.revisions[task.id].due,t+4*DAY);
 assert.equal(reviewed.teacherNotes[0].verifiedExternally,false);
});
test("the next task is a related unit for objectively observed errors",()=>{
 const level="A1";
 const q=ASSESSMENTS[level].items;
 const answers=q.map((x,i)=>({mode:x.mode,correct:i!==0,genuineListening:true}));
 const picked=locateRemediationUnit(level,{feedback:{answers}});
 assert.equal(picked.level,"A1");
 assert.ok(picked.words.some(w=>q[0].ko.includes(w.ko)),"recommended unit matches a missed Korean word");
 const at=200000;
 const state=recordExternalReview(emptyEvidence(),{
  level:"A1",communication:1,accuracy:1,fluency:0,
  notes:"结账时请记得先询问付款方式并使用礼貌表达。",source:"self"},at);
 const next=todayPlan(state,emptyStudy(),at);
 assert.ok(next.steps.some(s=>s.type==="revision"));
});

test("24h retest comprehension differs from first check for all levels",()=>{
 for(const level of LEVEL_IDS){
  const fresh=checkpointItems(level,false),late=checkpointItems(level,true);
  assert.equal(late.length,4,level);
  assert.ok(late.every(auditItem),level);
  assert.ok(late.some(x=>x.mode==="reading"),level);
  assert.ok(late.some(x=>x.mode==="listening"),level);
  const first=new Set(fresh.map(q=>q.ko)),second=new Set(late.map(q=>q.ko));
  assert.equal([...second].filter(q=>first.has(q)).length,0,level);
  const scores=assessAnswers(level,late.map(q=>q.answer),late.map(q=>q.mode==="listening"),true);
  assert.equal(scores.score,4,level);
 }
 assert.equal(assessAnswers("A0",[null,null,null,null],[],false).score,0);
});
