import test from "node:test";
import assert from "node:assert/strict";
import {KOREAN_UNITS,KOREAN_LEVELS,KOREAN_LEXICON,KOREAN_COUNTS,HANGUL,getKoreanUnit} from "../lib/real-life-curriculum.mjs";
import {emptyStudy,safeStudy,reviewWord,dueCards,chooseExercises,finishMission,answerCorrect} from "../lib/real-life-study.mjs";

test("52 authored life units have unique stable ids and real dialogues",()=>{
 assert.equal(KOREAN_UNITS.length,52);
 assert.equal(KOREAN_COUNTS.uniqueWords,798);
 assert.equal(KOREAN_LEVELS.length,5);
 assert.deepEqual(KOREAN_LEVELS.map(x=>KOREAN_UNITS.filter(u=>u.level===x.id).length),[4,16,14,8,10]);
 assert.equal(new Set(KOREAN_UNITS.map(x=>x.id)).size,52);
 assert.ok(HANGUL.reduce((n,x)=>n+x.items.length,0)>=40);
 for(const u of KOREAN_UNITS){
  assert.ok(u.words.length>=10,u.id);
  assert.ok(u.dialogue.length>=2,u.id);
  assert.ok(u.canDo.length>=5&&u.mission.length>=7,u.id);
  for(const w of u.words){
   assert.match(w.ko,/[가-힣]/u,u.id+" "+w.ko);
   assert.ok(w.zh.length>=1,u.id);
  }
  for(const row of u.dialogue){
   assert.match(row.ko,/[가-힣]/u,u.id+" "+row.ko);
   assert.ok(row.zh.length>=2,u.id);
  }
  assert.equal(getKoreanUnit(u.id)?.title,u.title);
 }
 assert.equal(new Set(KOREAN_LEXICON.map(w=>w.ko)).size,KOREAN_LEXICON.length);
});
test("quizzes remain deterministic, include correct answers and unique choices",()=>{
 for(const u of KOREAN_UNITS){
  const questions=chooseExercises(u,0);
  assert.equal(questions.length,5,u.id);
  for(const q of questions){
   assert.equal(q.options.length,3,u.id);
   assert.ok(q.options.some(x=>x.ko===q.word.ko),u.id);
   assert.equal(new Set(q.options.map(x=>x.zh)).size,3,u.id);
  }
 }
});
test("recall mistakes become due soon and correct cards follow a longer review schedule",()=>{
 const now=1000000;
 let s=reviewWord(emptyStudy(),"안녕하세요",false,now);
 assert.deepEqual(dueCards(s,now),[]);
 assert.deepEqual(dueCards(s,now+600000),["안녕하세요"]);
 s=reviewWord(s,"안녕하세요",true,now+600000);
 assert.equal(s.cards["안녕하세요"].interval,1);
 assert.ok(s.cards["안녕하세요"].due>now+86400000);
 s=reviewWord(s,"안녕하세요",true,now+86400000+600000);
 assert.equal(s.cards["안녕하세요"].interval,3);
});
test("only independent answer with >=4 verified questions marks a unit as practice-passed",()=>{
 let s=emptyStudy();
 s=finishMission(s,"H01","우유를 주세요.","with-help",5,50000,{turns:3});
 assert.equal(s.units.H01.passed,false);
 s=finishMission(s,"H01","우유를 주세요.","independent",3,60000,{turns:3});
 assert.equal(s.units.H01.passed,false);
 s=finishMission(s,"H01","우유를 주세요.","independent",4,70000,{turns:3});
 assert.equal(s.units.H01.passed,true);
 assert.equal(s.lastUnit,"H02");
 assert.ok(answerCorrect("안녕하세요!","안녕하세요"));
 assert.ok(!answerCorrect("아니요","안녕하세요"));
 assert.equal(safeStudy({lastUnit:"bogus"}).lastUnit,"H01");
 assert.throws(()=>finishMission(s,"H03","","independent",5),/请先写下/);
});

test("advanced practice refuses repeated phrases, very short answers, and fake five-turn completion",()=>{
 const good=[
  "현재 상황을 먼저 확인한 뒤 중요한 자료를 정리해서 공유하겠습니다.",
  "여러 가지 방법이 있지만 예상되는 비용과 위험을 함께 검토해야 한다고 생각합니다.",
  "말씀하신 의견을 이해하며 다른 대안도 충분히 논의한 다음에 결정하겠습니다."
 ];
 assert.throws(()=>finishMission(emptyStudy(),"B201","연습","independent",5,100000,{turns:3,responses:[good[0],good[0],good[0]]}),/同一句话/);
 assert.throws(()=>finishMission(emptyStudy(),"B201","연습","independent",5,100000,{turns:3,responses:["네","아니요","감사합니다"]}),/回答太短/);
 assert.throws(()=>finishMission(emptyStudy(),"B210","연습","independent",5,100000,{turns:3,responses:good}),/五轮/);
 const state=finishMission(emptyStudy(),"B201","연습","independent",5,100000,{turns:3,responses:good});
 assert.equal(state.units.B201.passed,true);
 assert.equal(state.units.B201.turns,3);
});
