import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {CULTURE_CASES,CULTURE_TOPICS,CULTURE_SOURCES,gradeEtiquette} from "../lib/korean-etiquette.mjs";
const payload=JSON.parse(await readFile(new URL("../data/noncommercial-korean-extended.json",import.meta.url),"utf8"));
test("noncommercially reusable extended vocabulary attributes external license explicitly",()=>{
 assert.equal(payload.source.license,"CC BY 4.0");
 assert.match(payload.source.attribution,/Koko AI/);
 assert.match(payload.source.url,/huggingface\.co/);
 assert.match(payload.source.languages,/zh-CN/);
 assert.ok(payload.words.length>=4500);
 assert.equal(payload.count,payload.words.length);
 assert.equal(new Set(payload.words.map(w=>w[0])).size,payload.words.length);
 assert.equal(payload.fields.length,8);
});
test("every lexical row follows useful typed format; generic placeholder examples excluded",()=>{
 const forbidden=/이것은.{0,45}(예문|뜻|단어).{0,20}입니다|^\s*.+에 대한 예문입니다/u;
 for(const w of payload.words){
  assert.equal(w.length,8);
  assert.match(w[0],/[가-힣]/u);
  assert.ok(w[1].trim().length>0,w[0]);
  assert.ok([0,1].includes(w[6]));
  assert.ok(!forbidden.test(w[3]),w[0]);
  if(w[3])assert.match(w[3],/[가-힣]/u,w[0]);
 }
 const thanks=payload.words.find(x=>x[0]==="감사합니다");
 assert.ok(thanks&&thanks[1].length>0);
 const love=payload.words.find(x=>x[0]==="사랑");
 assert.equal(love?.[1],"爱");
});
test("etiquette curriculum covers honorifics, titles, dining, work and boundaries with authored practice",()=>{
 assert.equal(CULTURE_CASES.length,18);
 assert.equal(new Set(CULTURE_CASES.map(x=>x.id)).size,18);
 assert.ok(CULTURE_TOPICS.length>=8);
 assert.ok(CULTURE_SOURCES.length>=3);
 for(const c of CULTURE_CASES){
  assert.match(c.good,/[가-힣]/u,c.id);
  assert.match(c.bad,/[가-힣]/u,c.id);
  assert.match(c.reply,/[가-힣]/u,c.id);
  assert.ok(c.why.length>=23,c.id);
  assert.ok(c.challenge.length>=10,c.id);
  assert.ok(c.source.startsWith("https://"),c.id);
  assert.equal(gradeEtiquette(c.id,"good").correct,true);
  assert.equal(gradeEtiquette(c.id,"bad").correct,false);
 }
 const refusing=CULTURE_CASES.find(x=>x.id==="E11");
 assert.match(refusing.good,/마시지 않/);
 assert.match(refusing.why,/不是义务/);
});
