// Real Chromium/Edge DOM interaction, mocked official HTTP response.
// This test NEVER uses a real dictionary API key.
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,dirname,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright-core";
import assert from "node:assert/strict";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const port=8921;
const server=createServer(async(req,res)=>{
 try{
  const filename=decodeURIComponent(new URL(req.url,"http://localhost").pathname).replace(/^\/+/,"")||"index.html";
  const file=resolve(root,filename);
  if(!file.startsWith(root+sep))throw Error("outside");
  const mime={".html":"text/html",".css":"text/css",".js":"text/javascript",".mjs":"text/javascript",".json":"application/json"};
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"}).end(data);
 }catch{res.writeHead(404).end("Not Found")}
});
await new Promise(r=>server.listen(port,"127.0.0.1",r));
const hard=setTimeout(()=>{console.error("KRDICT_BROWSER_HARD_TIMEOUT");process.exit(124)},85000);hard.unref();
let browser;
try{
 browser=await chromium.launch({channel:"msedge",headless:true,args:["--disable-extensions"]});
 const ctx=await browser.newContext({viewport:{width:1180,height:850}});
 const page=await ctx.newPage();
 page.setDefaultTimeout(11000);
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 let requestCount=0;
 await page.route("https://korea-media-korean-mcp-production.up.railway.app/api/krdict/search**",async route=>{
  requestCount++;
  const url=new URL(route.request().url());
  assert.equal(url.searchParams.get("q"),"나무");
  assert.equal(url.searchParams.has("key"),false);
  await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({
   ok:true,query:"나무",total:1,
   source:{official:true,url:"https://krdict.korean.go.kr/chn/mainAction",name:"韩国国立国语院《韩国语基础词典》"},
   items:[{id:"32750",word:"나무",pos:"명사",level:"초급",pronunciation:"나무",
    url:"https://krdict.korean.go.kr/chn/dicSearch/SearchView?ParaWordNo=32750",
    senses:[{order:"1",definitionKo:"줄기와 잎이 있는 식물.",translation:"树",definitionZh:"一种多年生植物。"}]}]
  })});
 });
 await page.goto("http://127.0.0.1:"+port+"/#/wordbank",{waitUntil:"domcontentloaded",timeout:30000});
 await page.locator("#official-krdict h2").waitFor();
 await page.locator("#nikl-query").fill("나무");
 await page.locator("#nikl-form button[type='submit']").evaluate(el=>el.click());
 await page.locator(".nikl-entry").waitFor();
 assert.match(await page.locator(".nikl-entry").innerText(),/树/);
 await page.locator('[data-nikl-save="0"]').evaluate(el=>el.click());
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("kmsExtendedVocabularyV1")).saved.나무);
 assert.equal(saved.source,"krdict");
 assert.equal(saved.row[1],"树");
 assert.ok(saved.url?.includes("krdict.korean.go.kr"));
 await page.locator("#kw-saved-only").check();
 assert.ok(await page.locator('[data-kw-save="나무"]').count()>0);
 assert.match(await page.locator(".kw-word").first().innerText(),/官方词典/);
 await page.locator('[data-kw="study"]').evaluate(el=>el.click());
 await page.locator("#kw-answer").fill("나무");
 await page.locator('[data-kw="check"]').evaluate(el=>el.click());
 assert.match(await page.locator(".kw-feedback").innerText(),/字面回忆正确/);
 const updated=await page.evaluate(()=>JSON.parse(localStorage.getItem("kmsExtendedVocabularyV1")).saved.나무);
 assert.equal(updated.source,"krdict");
 assert.equal(updated.reps,1);
 await page.locator('[data-kw="next-card"]').click();
 await page.locator('[data-kw="back"]').click();
 await page.locator("#nikl-query").fill("나무");
 await page.reload({waitUntil:"domcontentloaded",timeout:30000});
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("kmsExtendedVocabularyV1")).saved.나무.source),"krdict");
 await page.setViewportSize({width:390,height:844});
 const viewport=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
 assert.ok(viewport.scroll<=viewport.client+2,JSON.stringify(viewport));
 assert.deepEqual(errors,[]);
 console.log("KRDICT_BROWSER_PASS",JSON.stringify({queryCount:requestCount,officialSearch:true,
  savedToExistingWordbook:true,retrievalPractice:true,officialMetadataSurvives:true,
  localPersistence:true,viewport,jsErrors:errors}));
 await ctx.close();
}catch(err){console.error("KRDICT_BROWSER_FAILED",err?.stack||String(err));process.exitCode=1}
finally{if(browser)await browser.close();await new Promise(r=>server.close(r))}
