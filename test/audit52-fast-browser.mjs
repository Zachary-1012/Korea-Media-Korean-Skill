// Faster DOM-driven real-browser evaluation across ALL authored 52 units.
// This is simulation for software quality, NOT manual learner evaluation.
import {createServer} from "node:http";
import {readFile,writeFile} from "node:fs/promises";
import {dirname,resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright-core";
const root=resolve(dirname(fileURLToPath(import.meta.url)),".."),PORT=8947;
const mime={".html":"text/html",".css":"text/css",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json"};
const reportFile=new URL("../test-results/audit52-fast-result.json",import.meta.url);
const server=createServer(async(req,res)=>{
 try{
  const rel=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^\/+/,"")||"index.html";
  const file=resolve(root,rel);if(!file.startsWith(root+sep))throw Error("bad path");
  const bytes=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"}).end(bytes);
 }catch(e){res.writeHead(404).end(String(e));}
});
await new Promise(r=>server.listen(PORT,"127.0.0.1",r));
const hard=setTimeout(()=>{console.error("FAST52_HARD_TIMEOUT_240");process.exit(124)},240000);hard.unref();
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"msedge",args:["--disable-extensions"]});
 const ctx=await browser.newContext({viewport:{width:1260,height:860}});
 const page=await ctx.newPage();page.setDefaultTimeout(35000);
 const jsErrors=[];page.on("pageerror",e=>jsErrors.push(e.message));
 await page.goto("http://127.0.0.1:"+PORT+"/#/journey",{waitUntil:"domcontentloaded",timeout:45000});
 await page.locator("#real-life-path .rl-frame").waitFor({timeout:35000});
 const summary=await page.evaluate(async()=>{
  const [{KOREAN_UNITS},{chooseExercises}]=await Promise.all([
   import("/lib/real-life-curriculum.mjs"),import("/lib/real-life-study.mjs")]);
  const output={kind:"browser_DOM_controls_simulated_not_real_language_skills",started:new Date().toISOString(),
   expected:KOREAN_UNITS.length,completed:[],failures:[],proof:{}};
  const get=sel=>document.querySelector(sel);
  const pick=sel=>{const x=get(sel);if(!x)throw Error("Control missing "+sel);x.click();return x};
  const alternatives=[
   "추가 자료를 살펴보겠습니다.","관련된 방법을 함께 검토하겠습니다.",
   "나중에 결과를 다시 확인하겠습니다.","가능한 일정을 제안하겠습니다.","최종 내용을 정리하겠습니다."
  ];
  for(const u of KOREAN_UNITS){
   try{
    if(document.body.dataset.view!=="journey")throw Error("Wrong route");
    document.dispatchEvent(new CustomEvent("kms:journey-select",{detail:{unitId:u.id}}));
    if(get("#real-life-path h1")?.textContent.trim()!==u.title)throw Error("Wrong title");
    const nWords=document.querySelectorAll("#real-life-path .rl-word").length;
    const nDialogs=document.querySelectorAll("#real-life-path .rl-dialogue .rl-turn").length;
    if(nWords!==u.words.length||nDialogs!==u.dialogue.length)
     throw Error("Content mismatch words="+nWords+" dialog="+nDialogs);
    const reveal=pick('[data-rl-reveal="0"]');
    const translation=get('[data-rl-translation="0"]');
    if(!translation||translation.hidden)throw Error("Missing translation toggle");
    reveal.click();
    if(!translation.hidden)throw Error("Translation did not hide");
    pick('[data-rl="start"]');
    for(const q of chooseExercises(u,0)){
     if(q.mode==="type"){
      get("#rl-typing").value=q.word.ko;
      pick('[data-rl="submit-type"]');
     }else{
      const x=[...document.querySelectorAll("[data-rl-answer]")].find(e=>e.dataset.rlAnswer===q.word.ko);
      if(!x)throw Error("Correct option missing for "+q.word.ko);
      x.click();
     }
     if(!get(".rl-feedback")?.textContent.includes("本题回忆正确"))
      throw Error("Unexpected recall result "+q.word.ko);
     pick('[data-rl="next-question"]');
    }
    const nTurns=u.id==="B210"?5:Math.min(3,u.dialogue.length);
    for(let i=0;i<nTurns;i++){
     const el=get("#rl-mission-answer");if(!el)throw Error("No dialogue input turn "+i);
     el.value="안녕하세요. 먼저 상황을 확인하고 정확한 내용을 말씀드리겠습니다. "+alternatives[i];
     pick(i+1===nTurns?'[data-rl="mission-finish"]':'[data-rl="mission-next"]');
     if(i+1===nTurns){/* select actual self-assessment before finalizing, below */ }
    }
    // If final attempt blocked by missing rating, set rating and click again.
    const self=get("#rl-self");
    if(self){self.value="independent";pick('[data-rl="mission-finish"]');}
    const stored=JSON.parse(localStorage.getItem("kmsRealLifePathV1")||"{}")?.units?.[u.id];
    if(!stored?.practiced||!stored?.passed||stored.score!==5||stored.turns!==nTurns)
     throw Error("Completion not persisted "+JSON.stringify(stored));
    output.completed.push({id:u.id,level:u.level,words:nWords,dialogs:nDialogs,
     recall:5,turns:nTurns,simulatedBrowserFlow:"PASS",learnerOutcome:"NOT VERIFIED"});
    pick('[data-rl="overview"]');
   }catch(e){
    output.failures.push({id:u.id,error:String(e.message||e).slice(0,250)});
    // Local control recovery without discarding completed report.
    document.body.dataset.view="journey";
    document.dispatchEvent(new Event("kms:journey-open"));
   }
  }
  output.ended=new Date().toISOString();
  output.proof.savedPractice=Object.values(JSON.parse(localStorage.getItem("kmsRealLifePathV1")||"{}").units||{}).filter(x=>x?.practiced).length;
  return output;
 });
 summary.browserPageErrors=jsErrors;
 await writeFile(reportFile,JSON.stringify(summary,null,2));
 console.log("FAST52_ALL_UNITS",JSON.stringify({expected:summary.expected,
  passed:summary.completed.length,failed:summary.failures.length,
  persisted:summary.proof.savedPractice,errors:summary.failures,jsErrors}));
 if(summary.failures.length||summary.completed.length!==52||jsErrors.length)process.exitCode=1;
 await ctx.close();
}catch(e){console.error("FAST52_EXCEPTION",String(e.stack||e));process.exitCode=1;}
finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
