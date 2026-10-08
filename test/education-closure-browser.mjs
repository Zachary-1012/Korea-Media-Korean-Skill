import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {join,extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright-core";
import assert from "node:assert/strict";
import {ASSESSMENTS,RETEST_ITEMS} from "../lib/learning-assessments.mjs";
import {EVIDENCE_KEY,DAY} from "../lib/learning-evidence.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const port=8902,report=[],jsErrors=[];
const hard=setTimeout(()=>{console.error("EDUCATION_QA_HARD_TIMEOUT_90000");process.exit(124)},90000);hard.unref();
const types={".html":"text/html",".css":"text/css",".js":"text/javascript",".mjs":"text/javascript",".svg":"image/svg+xml",".json":"application/json"};
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname).replace(/^\/+/,"")||"index.html";
  const target=resolve(root,pathname);
  if(!target.startsWith(root+sep)){res.writeHead(403).end();return;}
  const bytes=await readFile(target);res.writeHead(200,{"content-type":types[extname(target)]||"application/octet-stream","cache-control":"no-store"}).end(bytes);
 }catch(e){res.writeHead(404).end(String(e));}
});
await new Promise(r=>server.listen(port,"127.0.0.1",r));
const browser=await chromium.launch({headless:true,executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"});
const artifacts=join(root,"test-results");await mkdir(artifacts,{recursive:true});
try{
 const desktop=await browser.newContext({viewport:{width:1340,height:900},acceptDownloads:true});
 // Simulated browser TTS provider only tests UI propagation. It does not verify real spoken audio.
 await desktop.addInitScript(()=>{
  class MockUtterance{constructor(text){this.text=text;this.lang="";this.rate=1;this.onstart=null;this.onerror=null;}}
  Object.defineProperty(window,"SpeechSynthesisUtterance",{value:MockUtterance,configurable:true});
  Object.defineProperty(window,"speechSynthesis",{value:{
    cancel(){},getVoices(){return [{lang:"ko-KR",name:"Mock ko-KR"}]},
    speak(u){setTimeout(()=>u.onstart?.(),5);}
  },configurable:true});
 });
 const page=await desktop.newPage();
 page.setDefaultTimeout(9000);
 page.on("pageerror",e=>jsErrors.push("desktop:"+e.message));
 await page.goto("http://127.0.0.1:"+port+"/#/coach",{waitUntil:"networkidle"});
 await page.locator("#education-coach .ec-shell").waitFor();
 assert.equal(await page.locator("body").getAttribute("data-view"),"coach");
 assert.match(await page.locator("#education-coach h1").innerText(),/学会了什么/);
 await page.screenshot({path:join(artifacts,"education-dashboard-desktop.png")});
 report.push("coach dashboard loads and recommends baseline diagnostic");
 await page.locator('[data-ec="placement"]').first().click();
 const qs=ASSESSMENTS.A0.items;
 // deliberately fail baseline: one correct, three wrong.
 for(let i=0;i<4;i++){
  const actual=i===0?qs[i].answer:(qs[i].answer+1)%4;
  await page.locator('[data-ec-choice="'+actual+'"]').click();
 }
 assert.match(await page.locator("#education-coach h1").innerText(),/A0/);
 let stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),EVIDENCE_KEY);
 assert.equal(stored.placement.recommend,"A0");
 report.push("baseline: deterministic placement recommendation saved");
 await page.locator('[data-ec="home"]').first().click();
 await page.locator('[data-ec="check-A0"]').first().click();
 for(let i=0;i<4;i++){
  if(qs[i].mode==="listening"){
   await page.locator('[data-ec="play-question"]').click();
   await page.waitForTimeout(40);
  }
  await page.locator('[data-ec-choice="'+qs[i].answer+'"]').click();
 }
 assert.match(await page.locator("#education-coach h1").innerText(),/听一遍/);
 await page.locator('[data-ec="play-dictation"]').click();
 await page.waitForTimeout(40);
 await page.locator("#ec-dictation").fill(ASSESSMENTS.A0.dictation);
 await page.locator('[data-ec="dictation-done"]').click();
 await page.locator("#ec-transfer").fill("물 좀 주세요.");
 await page.locator('[data-ec="finish-check"]').click();
 assert.match(await page.locator("#education-coach h1").innerText(),/客观项目通过/);
 stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),EVIDENCE_KEY);
 assert.equal(stored.checks.A0.initial.objectiveReady,true);
 assert.equal(stored.checks.A0.retained,false);
 report.push("reading+mock-TTS listening+dictation+transfer yield ONLY provisional objective result");
 // Same-day attempt must not be recorded as retention.
 await page.locator('[data-ec="home"]').first().click();
 await page.locator('[data-ec="check-A0"]').first().click();
 assert.match(await page.locator("#education-coach").innerText(),/等待24小时/);
 // Simulate future day for retest; does not certify a real elapsed day.
 await page.evaluate(({key,day})=>{
   const s=JSON.parse(localStorage.getItem(key));s.checks.A0.initial.time-=day+1000;
   localStorage.setItem(key,JSON.stringify(s));
 },{key:EVIDENCE_KEY,day:DAY});
 await page.locator('[data-ec="home"]').first().click();
 await page.locator('[data-ec="check-A0"]').first().click();
 const retestQs=RETEST_ITEMS.A0;
 for(let i=0;i<4;i++){
  if(retestQs[i].mode==="listening"){await page.locator('[data-ec="play-question"]').click();await page.waitForTimeout(35);}
  await page.locator('[data-ec-choice="'+retestQs[i].answer+'"]').click();
 }
 await page.locator('[data-ec="play-dictation"]').click();
 await page.waitForTimeout(35);
 await page.locator("#ec-dictation").fill(ASSESSMENTS.A0.retry.dictation);
 await page.locator('[data-ec="dictation-done"]').click();
 await page.locator("#ec-transfer").fill("우유 주세요.");
 await page.locator('[data-ec="finish-check"]').click();
 stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),EVIDENCE_KEY);
 assert.equal(stored.checks.A0.retained,true);
 report.push("simulated 24h alternative challenge: objective retention data recorded, not language certificate");
 await page.locator('[data-ec="feedback"]').first().click();
 await page.locator("#ec-text-for-review").fill("우유 좀 주세요.");
 await page.locator("#ec-source").selectOption("self");
 for(const key of ["communication","accuracy","fluency"])await page.locator("#ec-"+key).selectOption("2");
 await page.locator("#ec-note").fill("请进一步练习在店内确认数量及礼貌表达的自然程度。");
 await page.locator('[data-ec="save-feedback"]').click();
 stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),EVIDENCE_KEY);
 assert.equal(stored.teacherNotes.at(-1).verifiedExternally,false);
 report.push("feedback source recorded without invented verifier identity");
 await page.locator('[data-ec="revisions"]').first().click();
 assert.equal(await page.locator("[data-ec-revision]").count(),1);
 await page.locator("[data-ec-revision]").first().click();
 await page.locator("#ec-revision-answer").fill("물 한 잔 주세요.");
 await page.locator('[data-ec="submit-revision"]').click();
 stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),EVIDENCE_KEY);
 assert.equal(Object.values(stored.revisions)[0].attempts.length,1);
 assert.ok(Object.values(stored.revisions)[0].due>Date.now());
 report.push("teacher/self feedback -> new response -> scheduled delayed rewriting");
 await page.locator('[data-ec="home"]').first().click();
 await page.evaluate(()=>{
  localStorage.setItem("kmsExtendedVocabularyV1",JSON.stringify({saved:{사랑:{reps:1,due:Date.now()+86400000}}}));
  localStorage.setItem("kmsKoreanEtiquetteV1",JSON.stringify({E01:{practice:{response:"안녕하세요.",at:Date.now()}}}));
 });
 await page.locator('[data-ec="privacy"]').click();
 const dl=page.waitForEvent("download");
 await page.locator('[data-ec="backup"]').last().click();
 const download=await dl;assert.match(download.suggestedFilename(),/Learner-Backup/);
 const downloaded=await download.path();
 const saved=JSON.parse(await readFile(downloaded,"utf8"));
 assert.equal(saved.app,"Korean Media Study");
 assert.equal(saved.evidence.checks.A0.retained,true);
 assert.equal(saved.wordbank.saved.사랑.reps,1);
 assert.ok(saved.etiquette.E01.practice.response);
 await page.once("dialog",dialog=>dialog.accept("清除学习记录"));
 await page.locator('[data-ec="clear"]').click();
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),EVIDENCE_KEY),null);
 await page.evaluate(()=>{localStorage.removeItem("kmsExtendedVocabularyV1");localStorage.removeItem("kmsKoreanEtiquetteV1");});
 await page.locator('[data-ec="privacy"]').click();
 page.once("dialog",dialog=>dialog.accept());
 await page.locator("#ec-restore-file").setInputFiles(downloaded);
 await page.waitForFunction(key=>{try{return JSON.parse(localStorage.getItem(key))?.checks?.A0?.retained===true}catch{return false}},EVIDENCE_KEY);
 assert.ok(await page.evaluate(()=>Boolean(JSON.parse(localStorage.getItem("kmsExtendedVocabularyV1"))?.saved?.사랑)));
 assert.ok(await page.evaluate(()=>Boolean(JSON.parse(localStorage.getItem("kmsKoreanEtiquetteV1"))?.E01?.practice)));
 report.push("learner backup → clear → restore recovers education, wordbook and etiquette data");
 await page.screenshot({path:join(artifacts,"education-feedback-desktop.png")});
 await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const mp=await mobile.newPage();mp.setDefaultTimeout(9000);
 mp.on("pageerror",e=>jsErrors.push("mobile:"+e.message));
 await mp.goto("http://127.0.0.1:"+port+"/#/coach",{waitUntil:"networkidle"});
 await mp.locator("#education-coach .ec-shell").waitFor();
 assert.equal(await mp.locator("body").getAttribute("data-view"),"coach");
 const measures=await mp.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 assert.ok(measures.scroll<=measures.client+2,"mobile overflow:"+JSON.stringify(measures));
 await mp.screenshot({path:join(artifacts,"education-dashboard-mobile.png")});
 await mp.locator('.v3-bottom-nav [data-v3-nav="journey"]').click();
 await mp.locator('[data-rl="coach"]').first().click();
 assert.equal(await mp.locator("body").getAttribute("data-view"),"coach");
 await mp.screenshot({path:join(artifacts,"education-check-mobile.png")});
 await mobile.close();
 assert.deepEqual(jsErrors,[]);
 console.log(JSON.stringify({pass:true,checks:report,errors:jsErrors,shots:["education-dashboard-desktop.png","education-feedback-desktop.png","education-dashboard-mobile.png","education-check-mobile.png"],tts:"simulated for UI only"},null,2));
}catch(e){console.error("EDUCATION_BROWSER_FAILED",e.stack||String(e));console.error("PAGE_ERRORS",jsErrors);process.exitCode=1;}
finally{await browser.close();await new Promise(r=>server.close(r));}
