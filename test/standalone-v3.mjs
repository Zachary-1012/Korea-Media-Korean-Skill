import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { join, extname, resolve, sep } from "node:path";
import { chromium } from "playwright-core";
import assert from "node:assert/strict";

const root=resolve(new URL("..",import.meta.url).pathname.replace(/^\/([A-Za-z]:\/)/,"$1"));
const allowedTypes={".html":"text/html",".css":"text/css",".js":"application/javascript",".svg":"image/svg+xml",".png":"image/png",".json":"application/json"};
const server=createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,"http://localhost").pathname;
    if(path==="/favicon.ico"){res.writeHead(204).end();return;}
    const rel=path==="/"?"index.html":decodeURIComponent(path).replace(/^\/+/,"");
    const target=resolve(root,rel);
    if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403).end();return;}
    const file=await readFile(target);
    res.writeHead(200,{"content-type":(allowedTypes[extname(target)]||"application/octet-stream")+"; charset=utf-8","cache-control":"no-cache"});
    res.end(file);
  }catch(e){res.writeHead(404).end(e.message);}
});
await new Promise(resolve=>server.listen(8897,"127.0.0.1",resolve));
const report=[];
const errors=[];
const artifacts=join(root,"test-results");
await mkdir(artifacts,{recursive:true});
const browser=await chromium.launch({executablePath:"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",headless:true});
const desktop=await browser.newContext({viewport:{width:1365,height:920}});
const page=await desktop.newPage();
page.on("pageerror",e=>errors.push(e.message));
try{
 await page.goto("http://127.0.0.1:8897/",{waitUntil:"domcontentloaded"});
 await page.locator("#v3-query").waitFor();
 assert.equal(await page.title(),"Korean Media Study｜韩语学习");
 assert.equal(await page.locator(".lesson").count(),48);
 assert.equal(await page.locator(".scene").count(),18);
 assert.equal(await page.locator(".vocab").count(),133);
 assert.equal(await page.locator(".phrase").count(),64);
 assert.equal(await page.locator("body").getAttribute("data-view"),"today");
 assert.ok(!(await page.locator("body").innerText()).includes("Zachary"));
 await page.screenshot({path:join(artifacts,"v3-desktop.png"),fullPage:true});
 report.push("neutral product home + complete catalog, no personal name");

 await page.locator('[data-v3-chip="我想练 TOPIK"]').click();
 await page.locator('[data-v3-option="1"]').click();
 assert.match(await page.locator("#v3-quiz-feedback").innerText(),/答对了/);
 await page.locator("#v3-next-quiz").click();
 assert.match(await page.locator("#v3-studio-heading").innerText(),/TOPIK/);
 report.push("TOPIK quiz → correctness feedback → next item");

 await page.locator('.v3-side-nav [data-v3-nav="conversation"]').click();
 await page.locator("#v3-scene").selectOption("agency");
 assert.match(await page.locator(".v3-question").first().innerText(),/노출/);
 await page.locator("#v3-reply").fill("현재 자료만으로 원인을 단정하기 어렵습니다.");
 await page.locator("#v3-continue").click();
 assert.match(await page.locator("#v3-dialogue-feedback").innerText(),/참고|参考表达/);
 await page.locator("#v3-dialog-next").click();
 assert.match(await page.locator("#v3-studio-body").innerText(),/第 2 \/ 3 回合/);
 report.push("real scene → Korean response → sample comparison → next turn");

 await page.locator('.v3-side-nav [data-v3-nav="writing"]').click();
 await page.locator("#v3-kind").selectOption("email");
 await page.locator("#v3-draft").fill("교수님, 안녕하세요. 연구에 관해서 문의드리고 싶습니다.");
 assert.match(await page.locator("#v3-char-count").innerText(),/字符/);
 await page.reload();
 await page.locator('.v3-side-nav [data-v3-nav="writing"]').click();
 await page.locator("#v3-kind").selectOption("email");
 assert.match(await page.locator("#v3-draft").inputValue(),/교수님/);
 report.push("writing → local draft persisted on reload");

 await page.locator('.v3-side-nav [data-v3-nav="today"]').click();
 await page.locator("#v3-next-lesson").click();
 assert.equal(await page.locator("body").getAttribute("data-view"),"course");
 assert.equal(await page.locator("#L1.v3-expanded").count(),1);
 await page.locator('#v3-outline [data-module="K02"]').click();
 assert.equal(await page.locator("#K02.active-module").count(),1);
 report.push("resume lesson → expand → switch module");

 await page.locator(".topbar .about-open").click();
 assert.equal(await page.locator("#about-overlay.open").count(),1);
 assert.match(await page.locator("#about-overlay").innerText(),/商业授权/);
 assert.ok(!(await page.locator("#about-overlay").innerText()).includes("Zachary"));
 report.push("About drawer legal and license notice");

 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const mp=await mobile.newPage();
 mp.on("pageerror",e=>errors.push("mobile:"+e.message));
 await mp.goto("http://127.0.0.1:8897/",{waitUntil:"domcontentloaded"});
 await mp.locator(".v3-bottom-nav").waitFor();
 await mp.screenshot({path:join(artifacts,"v3-mobile.png"),fullPage:true});
 await mp.locator('.v3-bottom-nav [data-v3-nav="conversation"]').click();
 await mp.locator("#v3-reply").waitFor();
 const width=await mp.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
 assert.ok(width.scroll <= width.client+2,"mobile horizontal overflow "+JSON.stringify(width));
 await mp.locator('.v3-bottom-nav [data-v3-nav="writing"]').click();
 await mp.locator("#v3-draft").fill("안녕하세요. 저는 한국어를 배우고 있습니다.");
 assert.match(await mp.locator("#v3-draft-state").innerText(),/已保存/);
 report.push("390px touch navigation, real writing and no horizontal overflow");
 await mobile.close();
 console.log(JSON.stringify({ok:errors.length===0,checks:report,errors,preview:["test-results/v3-desktop.png","test-results/v3-mobile.png"]},null,2));
 if(errors.length)process.exitCode=1;
}catch(e){
 console.error("V3_BROWSER_E2E_FAILED",e?.stack||String(e));
 console.error("JS_ERRORS",errors);
 process.exitCode=1;
}finally{
 await desktop.close();
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
