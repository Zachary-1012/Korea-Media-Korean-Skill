// Public read-only backend proxy for the official learner dictionary.
// Never log the provider API URL, key, body of failed upstream responses, or sensitive headers.
import {lookupKrdict,KrdictError} from "./krdict-api.mjs";
const CLIENT_ORIGIN="https://zachary-1012.github.io";
const minute=60000;
export function createKrdictRoute({lookup=lookupKrdict,now=()=>Date.now()}={}){
 const activity=new Map(),cache=new Map();
 let inFlight=0,globalWindow=0,globalCount=0;
 const respond=(res,status,payload,origin)=>{
  res.writeHead(status,{
   "content-type":"application/json; charset=utf-8",
   "cache-control":"no-store",
   "x-content-type-options":"nosniff",
   "referrer-policy":"no-referrer",
   "vary":"Origin",
   ...(origin===CLIENT_ORIGIN?{"access-control-allow-origin":CLIENT_ORIGIN}:{}),
  });
  res.end(JSON.stringify(payload));
 };
 return async (req,res,url)=>{
  const origin=String(req.headers.origin||"");
  if(origin&&origin!==CLIENT_ORIGIN){
   respond(res,403,{ok:false,code:"ORIGIN_DENIED",message:"仅允许从 Korean Media Study 学习网页访问"},origin);
   return;
  }
  if(req.method==="OPTIONS"){
   res.writeHead(204,{
    ...(origin===CLIENT_ORIGIN?{"access-control-allow-origin":CLIENT_ORIGIN}:{}),
    "access-control-allow-methods":"GET, OPTIONS",
    "access-control-allow-headers":"content-type",
    "access-control-max-age":"300","vary":"Origin",
   }).end();return;
  }
  if(req.method!=="GET"){
   respond(res,405,{ok:false,code:"METHOD_NOT_ALLOWED",message:"仅支持 GET 查询"},origin);
   return;
  }
  const q=String(url.searchParams.get("q")||"").trim();
  const key=q.normalize("NFKC").toLowerCase();
  if(key.length===0||[...key].length>40||/[\u0000-\u001f<>\\]/.test(key)){
   respond(res,400,{ok:false,code:"INVALID_QUERY",message:"请输入 1–40 个字符的韩语词条"},origin);
   return;
  }
  const current=now();
  if(current-globalWindow>=minute){globalWindow=current;globalCount=0}
  if(globalCount>=150){
   respond(res,429,{ok:false,code:"RATE_LIMIT",message:"查询较多，请稍后再试"},origin);
   return;
  }
  const ip=String(req.socket?.remoteAddress||"unknown").slice(0,75);
  const recent=activity.get(ip)||{count:0,since:current};
  if(current-recent.since>=minute){recent.since=current;recent.count=0}
  if(recent.count>=45){
   respond(res,429,{ok:false,code:"RATE_LIMIT",message:"操作过快，请一分钟后重试"},origin);
   return;
  }
  globalCount++;recent.count++;activity.set(ip,recent);
  if(activity.size>400){for(const [addr,row] of activity)if(current-row.since>=minute)activity.delete(addr)}
  const cached=cache.get(key);
  if(cached&&cached.until>current){respond(res,200,{ok:true,...cached.data,cached:true},origin);return;}
  if(inFlight>=5){
   respond(res,503,{ok:false,code:"BUSY",message:"官方词典查询繁忙，请稍后重试"},origin);
   return;
  }
  inFlight++;
  try{
   const data=await lookup(q);
   // Do not return provider URL with secret, raw response, or arbitrary HTML.
   cache.set(key,{data,until:current+10*minute});
   if(cache.size>120){const first=cache.keys().next().value;cache.delete(first)}
   respond(res,200,{ok:true,...data,cached:false},origin);
  }catch(e){
   const safe=e instanceof KrdictError?e:new KrdictError("UPSTREAM_UNAVAILABLE","暂时无法查询官方词典",503);
   respond(res,safe.status,{ok:false,code:safe.code,message:safe.message},origin);
  }finally{inFlight--}
 };
}
