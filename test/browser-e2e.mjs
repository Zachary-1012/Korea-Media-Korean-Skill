import { chromium } from "playwright-core";
import { mkdirSync, copyFileSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { strict as assert } from "node:assert";
import { startHarness } from "./browser-harness.mjs";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const artifacts = fileURLToPath(new URL("../assets/review/",import.meta.url));
const screenshots = fileURLToPath(new URL("../assets/",import.meta.url));
mkdirSync(artifacts,{recursive:true});
const host=await startHarness();
const browser=await chromium.launch({executablePath:chromePath,headless:true,args:["--autoplay-policy=no-user-gesture-required"]});
const checks=[];

async function waitUi(page,selector){
  const frame=page.frameLocator("#ui");
  await frame.locator(selector).first().waitFor({timeout:25000});
  return frame;
}
async function resultCalls(page,name){
  await page.waitForFunction((n)=>window.__hostCalls.some(x=>x.name===n),name,{timeout:25000});
}
const context=await browser.newContext({viewport:{width:706,height:790},recordVideo:{dir:artifacts,size:{width:706,height:790}}});
const page=await context.newPage();
page.on("console", msg=>{if(msg.type()==="error")console.log("BROWSER_CONSOLE_ERROR",msg.text())});
page.on("pageerror", error=>console.log("BROWSER_PAGE_ERROR",error.message));

// School comparison + Next interview tool, actually through MCP.
await page.goto(host.url+"/?mode=compare");
let frame=await waitUi(page,".program");
assert.equal(await frame.locator(".program").count(),3);
await page.screenshot({path:join(screenshots,"screenshot-compare.png"),clip:{x:0,y:30,width:706,height:700}});
await frame.getByRole("button",{name:"直接练 CAU 面试"}).click();
await waitUi(page,"#next-q");
await frame.getByRole("button",{name:"下一题"}).click();
await resultCalls(page,"practice_interview");
checks.push("compare→interview→next");

// Writing input really sends ui/message to simulated host
await page.goto(host.url+"/?mode=writing");
frame=await waitUi(page,"#writing-draft");
await page.screenshot({path:join(screenshots,"screenshot-writing.png"),clip:{x:0,y:30,width:706,height:700}});
await frame.locator("#writing-draft").fill("저는 미디어와 마케팅 실무를 경험했습니다. 이 경험을 통해 소비자의 반응을 연구하고 싶어졌습니다.");
await frame.getByRole("button",{name:"提交给 ChatGPT 批改"}).click();
await page.waitForFunction(()=>window.__hostMessages.length>0,null,{timeout:25000});
let answer=await page.evaluate(()=>window.__hostMessages[0]);
assert.equal(answer.role,"user");assert.match(answer.content[0].text,/미디어와 마케팅/);
checks.push("writing→ui/message");

// Real-world conversation response
await page.goto(host.url+"/?mode=conversation");
frame=await waitUi(page,"#conv-answer");
await page.screenshot({path:join(screenshots,"screenshot-conversation.png"),clip:{x:0,y:30,width:706,height:700}});
await frame.locator("#conv-answer").fill("현재 데이터만으로 원인을 단정하기 어렵습니다. 채널별 행동 지표를 다시 확인하겠습니다.");
await frame.getByRole("button",{name:"发送并继续真实对话"}).click();
await page.waitForFunction(()=>window.__hostMessages.length>0,null,{timeout:25000});
answer=await page.evaluate(()=>window.__hostMessages[0]);
assert.match(answer.content[0].text,/채널별 행동 지표/);
checks.push("conversation→ui/message");

// Diagnostic reads, selects, sends writing answer and speaking answer
await page.goto(host.url+"/?mode=diagnostic");
frame=await waitUi(page,"#diag-writing");
await page.screenshot({path:join(screenshots,"screenshot-diagnostic.png"),clip:{x:0,y:30,width:706,height:700}});
await frame.locator('[data-q="0"][data-o="1"]').click();
assert.equal(await frame.locator(".diag-opt.correct").count(),0,"diagnostic must not reveal answers before submission");
await frame.locator("#diag-writing").fill("광고를 연구하고 싶습니다. 경험에서 배운 점이 있습니다.");
await frame.locator("#diag-speaking").fill("저는 미디어를 공부합니다.");
await frame.getByRole("button",{name:"提交给 ChatGPT 做完整诊断"}).click();
await page.waitForFunction(()=>window.__hostMessages.length>0,null,{timeout:25000});
answer=await page.evaluate(()=>window.__hostMessages[0]);
assert.match(answer.content[0].text,/listening: 正确/);
checks.push("diagnostic→answered→ui/message");

// Plan adjusts weekly hours and returns recalculated result from server.
await page.goto(host.url+"/?mode=plan");
frame=await waitUi(page,"#recalc");
await frame.locator("#hours").fill("16");
await frame.getByRole("button",{name:"重新计算"}).click();
await page.waitForFunction(()=>window.__hostCalls.some(x=>x.name==="build_study_plan"&&x.args.hours_per_week===16),null,{timeout:25000});
await frame.locator(".metric b").first().waitFor({timeout:25000});
checks.push("plan controls→server recalc");

// TOPIK exam route to writing practice
await page.goto(host.url+"/?mode=exam");
frame=await waitUi(page,"#exam-writing");
await frame.getByRole("button",{name:"练写作"}).click();
await waitUi(page,"#writing-draft");
checks.push("exam→writing");

// Vocab pronunciation action and quiz route
await page.goto(host.url+"/?mode=vocab");
frame=await waitUi(page,"#make-quiz");
await frame.getByRole("button",{name:"做 TOPIK 小测"}).click();
await waitUi(page,"#options");
checks.push("vocab→quiz");

// Mobile responsive: 390 px, screenshot and basic click
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const mp=await mobile.newPage();
await mp.goto(host.url+"/?mode=conversation");
const mf=await waitUi(mp,"#conv-answer");
await mp.screenshot({path:join(screenshots,"screenshot-mobile.png"),clip:{x:0,y:30,width:390,height:780}});
const info=await mf.locator("#conv-answer").boundingBox();
assert.ok(info && info.width <390,"mobile textarea overflows");
checks.push("mobile 390px layout");
await mobile.close();

// Video across multiple real tool-bound views (host simulator, not ChatGPT).
await page.goto(host.url+"/?mode=compare");
await waitUi(page,".program");
await page.waitForTimeout(900);
let ef=page.frameLocator("#ui");
await ef.getByRole("button",{name:"直接练 CAU 面试"}).click();
await waitUi(page,"#next-q");
await page.waitForTimeout(1200);
await page.goto(host.url+"/?mode=writing");
await waitUi(page,"#writing-draft");
await ef.locator("#writing-draft").fill("저는 한국의 브랜드 커뮤니케이션을 연구하고 싶습니다. 플랫폼 환경에 따른 소비자 반응의 차이가 궁금합니다.");
await page.waitForTimeout(1300);
await ef.getByRole("button",{name:"提交给 ChatGPT 批改"}).click();
await page.waitForTimeout(600);
await page.goto(host.url+"/?mode=conversation");
await waitUi(page,"#conv-answer");
await ef.locator("#conv-answer").fill("현재 데이터로는 단정하기 어렵습니다. 원인을 다시 확인하겠습니다.");
await page.waitForTimeout(800);
await ef.getByRole("button",{name:"发送并继续真实对话"}).click();
await page.waitForTimeout(800);
await page.goto(host.url+"/?mode=diagnostic");
await waitUi(page,"#diag-writing");
await page.waitForTimeout(1800);

const video=page.video();
await context.close();
const path=await video.path();
copyFileSync(path,join(artifacts,"korean-smart-ui-technical-walkthrough.webm"));
for(const file of readdirSync(artifacts)){
  if(file.startsWith("page@"))unlinkSync(join(artifacts,file));
}
await browser.close();
await host.close();
console.log(JSON.stringify({ok:true,checks,screen:["screenshot-compare.png","screenshot-writing.png","screenshot-conversation.png","screenshot-diagnostic.png","screenshot-mobile.png"],video:"assets/review/korean-smart-ui-technical-walkthrough.webm",note:"technical browser host simulator, NOT live ChatGPT plugin validation"},null,2));
