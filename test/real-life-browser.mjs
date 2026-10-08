import { createServer } from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {dirname,resolve,extname,sep,join} from "node:path";
import {fileURLToPath} from "node:url";
import assert from "node:assert/strict";
import {chromium} from "playwright-core";
import {KOREAN_UNITS} from "../lib/real-life-curriculum.mjs";
import {chooseExercises} from "../lib/real-life-study.mjs";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const port=8899;
const errors=[];
const types={".html":"text/html",".css":"text/css",".js":"text/javascript",".mjs":"text/javascript",".svg":"image/svg+xml",".json":"application/json"};
const http=createServer(async(req,res)=>{
 try{
  const rel=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname).replace(/^\/+/, "")||"index.html";
  const target=resolve(root,rel);
  if(!target.startsWith(root+sep)){res.writeHead(403).end();return;}
  const content=await readFile(target);res.writeHead(200,{"content-type":types[extname(target)]||"application/octet-stream","cache-control":"no-store"}).end(content);
 }catch(e){res.writeHead(404).end(String(e));}
});
await new Promise(done=>http.listen(port,"127.0.0.1",done));
const browser=await chromium.launch({headless:true,executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"});
const out=join(root,"test-results");await mkdir(out,{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1365,height:920}});
 const page=await context.newPage();
 page.on("pageerror",err=>errors.push(String(err)));
 await page.goto("http://127.0.0.1:"+port+"/#/journey",{waitUntil:"networkidle"});
 await page.locator("#real-life-path .rl-frame").waitFor();
 assert.equal(await page.locator("body").getAttribute("data-view"),"journey");
 assert.match(await page.locator("#real-life-path").innerText(),/798 个去重生活词条/);
 assert.equal(await page.locator("[data-rl-unit]").count(),52);
 await page.screenshot({path:join(out,"real-life-overview-desktop.png")});
 await page.locator('[data-rl="resume"]').first().click();
 assert.match(await page.locator("#real-life-path h1").innerText(),/第一次认出韩文字母/);
 assert.ok((await page.locator(".rl-word").count())>=10);
 await page.locator('[data-rl="start"]').click();
 const qs=chooseExercises(KOREAN_UNITS[0],0);
 for(let i=0;i<5;i++){
  await page.locator('[data-rl-answer="'+qs[i].word.ko+'"]').click();
  assert.match(await page.locator(".rl-feedback").innerText(),/本题回忆正确/);
  await page.locator('[data-rl="next-question"]').click();
 }
 assert.match(await page.locator("#real-life-path h1").innerText(),/真正说出来/);
 for(let turn=0;turn<3;turn++){
  await page.locator("#rl-mission-answer").fill("우유를 주세요.");
  if(turn<2)await page.locator('[data-rl="mission-next"]').click();
 }
 assert.match(await page.locator("#real-life-path").innerText(),/第 3 \/ 3 回合/);
 await page.locator("#rl-self").selectOption("independent");
 await page.locator('[data-rl="mission-finish"]').click();
 assert.match(await page.locator("#real-life-path h1").innerText(),/达到练习条件/);
 await page.reload({waitUntil:"networkidle"});
 await page.locator("#real-life-path .rl-frame").waitFor();
 assert.match(await page.locator("#real-life-path").innerText(),/已练习达标/);
 await page.locator('[data-rl="dictionary"]').first().click();
 await page.locator("#rl-dict-query").fill("예약");
 assert.ok((await page.locator(".rl-dict-row").count())>=2);
 await page.locator(".v3-side-nav [data-v3-nav='topik']").click();
 assert.equal(await page.locator("body").getAttribute("data-view"),"topik");
 await page.screenshot({path:join(out,"real-life-old-feature-regression.png")});
 await context.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const mp=await mobile.newPage();
 mp.on("pageerror",err=>errors.push("mobile: "+String(err)));
 await mp.goto("http://127.0.0.1:"+port+"/#/journey",{waitUntil:"networkidle"});
 await mp.locator("#real-life-path .rl-frame").waitFor();
 const measures=await mp.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 assert.ok(measures.scroll<=measures.client+2,"Horizontal overflow "+JSON.stringify(measures));
 await mp.screenshot({path:join(out,"real-life-overview-mobile.png")});
 await mp.locator('.v3-bottom-nav [data-v3-nav="journey"]').click();
 await mp.locator('[data-rl="resume"]').first().click();
 await mp.screenshot({path:join(out,"real-life-lesson-mobile.png")});
 assert.equal(await mp.locator("body").getAttribute("data-view"),"journey");
 await mobile.close();
 assert.deepEqual(errors,[],"Page JS errors: "+errors.join("; "));
 console.log(JSON.stringify({ok:true,flow:["A0 route","52 units / 798 unique words","5 verified recalls","real-world task","persisted restart","search dictionary","legacy TOPIK","mobile 390px no overflow"],screenshots:["real-life-overview-desktop.png","real-life-overview-mobile.png","real-life-lesson-mobile.png"],errors},null,2));
}catch(e){console.error("REAL_LIFE_BROWSER_FAILED",e?.stack||String(e));console.error("JS_ERRORS",errors);process.exitCode=1;}
finally{await browser.close();await new Promise(done=>http.close(done));}
