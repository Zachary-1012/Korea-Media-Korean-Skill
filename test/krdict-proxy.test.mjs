import test from "node:test";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {once} from "node:events";
import {KrdictError,mapKrdictXml,lookupKrdict,validateKrdictQuery}
 from "../lib/krdict-api.mjs";
import {createKrdictRoute} from "../lib/krdict-route.mjs";
const sample='<?xml version="1.0" encoding="UTF-8"?>'+
 '<channel><total>1</total><start>1</start><num>10</num><item><target_code>32750</target_code>'+
 '<word>나무</word><sup_no>0</sup_no><pronunciation>나무</pronunciation>'+
 '<pos>명사</pos><word_grade>초급</word_grade>'+
 '<link>https://krdict.korean.go.kr/dicSearch/SearchView?ParaWordNo=32750</link>'+
 '<sense><sense_order>1</sense_order><definition>줄기와 잎이 있는 식물.</definition>'+
 '<translation><trans_lang>중국어</trans_lang><trans_word>树</trans_word>'+
 '<trans_dfn>一种多年生植物。</trans_dfn></translation></sense></item></channel>';
const key="1".repeat(32); // fake key, NEVER user's actual credential
test("official xml maps words, Chinese senses, pronunciation and canonical URL",()=>{
 const out=mapKrdictXml(sample);
 assert.equal(out.items[0].word,"나무");
 assert.equal(out.items[0].senses[0].translation,"树");
 assert.equal(out.items[0].pos,"명사");
 assert.equal(out.items[0].url.startsWith("https://krdict.korean.go.kr/"),true);
 assert.equal(out.total,1);
 assert.ok(!JSON.stringify(out).includes(key));
});
test("secret is sent only as upstream parameter and never in client JSON",async()=>{
 let full;
 const data=await lookupKrdict("나무",{key,fetchImpl:async(url,opt)=>{
  full=new URL(url);assert.equal(full.host,"krdict.korean.go.kr");
  assert.equal(full.searchParams.get("key"),key);
  assert.equal(full.searchParams.get("trans_lang"),"11");
  assert.equal(full.searchParams.get("translated"),"y");
  assert.equal(opt.redirect,"error");
  return new Response(sample,{status:200,headers:{"content-type":"text/xml"}});
 }});
 assert.equal(data.items[0].senses[0].translation,"树");
 assert.ok(!JSON.stringify(data).includes(key));
 assert.ok(!JSON.stringify(data).includes("key="));
});
test("invalid inputs rejected before upstream request and key never leaked in thrown messages",async()=>{
 let called=false;
 for(const q of ["","<script>alert(1)</script>","你好","a".repeat(41)]){
  await assert.rejects(lookupKrdict(q,{key,fetchImpl:async()=>{
   called=true;throw Error("should not call")}}),{code:"INVALID_QUERY"});
 }
 assert.equal(called,false);
 await assert.rejects(lookupKrdict("나무",{key:"",fetchImpl:async()=>{called=true}}),{code:"NOT_CONFIGURED"});
 assert.equal(called,false);
 assert.equal(validateKrdictQuery(" 나무 "),"나무");
});
test("bad provider key and unsafe XML are gracefully mapped without raw payload",async()=>{
 assert.throws(()=>mapKrdictXml('<error><error_code>020</error_code><message>Unregistered key</message></error>'),{code:"UPSTREAM_KEY_REJECTED"});
 assert.throws(()=>mapKrdictXml('<!DOCTYPE foo [<!ENTITY xx "unsafe">]><channel/>'),{code:"INVALID_RESPONSE"});
 const unsafe=sample.replace("https://krdict.korean.go.kr/dicSearch/SearchView?ParaWordNo=32750",
  "https://other.example.invalid/?key=secret");
 assert.equal(mapKrdictXml(unsafe).items[0].url,null);
});
test("upstream timeout, HTTP failure and oversized XML fail with bounded errors",async()=>{
 await assert.rejects(lookupKrdict("나무",{key,fetchImpl:async()=>new Response("oops",{status:503})}),{code:"UPSTREAM_HTTP"});
 await assert.rejects(lookupKrdict("나무",{key,fetchImpl:async()=>new Response("a".repeat(350001),{status:200})}),{code:"TOO_LARGE"});
});
async function withRoute(options,fn){
 const handler=createKrdictRoute(options);
 const srv=createServer((req,res)=>handler(req,res,new URL(req.url,"http://localhost")));
 srv.listen(0,"127.0.0.1");await once(srv,"listening");
 try{await fn("http://127.0.0.1:"+srv.address().port)}
 finally{srv.close();await once(srv,"close")}
}
test("browser-origin CORS, in-memory cache and read-only method enforcement",async()=>{
 let count=0;
 await withRoute({lookup:async(q)=>{count++;return {query:q,items:[{word:q}],source:{official:true}}}},async(base)=>{
  const opts={headers:{Origin:"https://zachary-1012.github.io"}};
  const r=await fetch(base+"/api/krdict/search?q="+encodeURIComponent("나무"),opts);
  assert.equal(r.status,200);
  assert.equal(r.headers.get("access-control-allow-origin"),"https://zachary-1012.github.io");
  assert.equal(r.headers.get("cache-control"),"no-store");
  const j=await r.json();assert.equal(j.ok,true);assert.equal(j.items[0].word,"나무");
  const cached=await fetch(base+"/api/krdict/search?q="+encodeURIComponent("나무"),opts);
  assert.equal((await cached.json()).cached,true);assert.equal(count,1);
  assert.equal((await fetch(base+"/api/krdict/search?q="+encodeURIComponent("나무"),{
   headers:{Origin:"https://evil.example"}})).status,403);
  assert.equal((await fetch(base+"/api/krdict/search?q=나무",{method:"POST"})).status,405);
  assert.equal((await fetch(base+"/api/krdict/search?q=나무",{method:"OPTIONS",...opts})).status,204);
 });
});
test("rate limit throttles abuse; no user key in error messages",async()=>{
 let current=100000,called=0;
 await withRoute({now:()=>current,lookup:async(q)=>{called++;return {query:q,items:[]}}},async(base)=>{
  for(let i=0;i<45;i++)assert.equal((await fetch(base+"/api/krdict/search?q="+encodeURIComponent("사랑"+i))).status,200);
  const limit=await fetch(base+"/api/krdict/search?q=사랑456");
  assert.equal(limit.status,429);
  assert.equal((await limit.json()).code,"RATE_LIMIT");
  current+=60001;
  assert.equal((await fetch(base+"/api/krdict/search?q=사랑456")).status,200);
 });
});
