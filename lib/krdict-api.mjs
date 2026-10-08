// Official National Institute of Korean Language Basic Korean Dictionary API.
// KEY lives only in the backend process environment, NEVER GitHub Pages.
import {XMLParser} from "fast-xml-parser";

export const KRDICT_ORIGIN="https://krdict.korean.go.kr";
export const KRDICT_SEARCH_URL=KRDICT_ORIGIN+"/api/search";
export const KRDICT_SOURCE_URL="https://krdict.korean.go.kr/chn/mainAction";
export const SEARCH_LIMIT=20;
const parser=new XMLParser({ignoreAttributes:true,parseTagValue:false,processEntities:false,trimValues:true});
const text=(v,max=400)=>typeof v==="string"?v.slice(0,max):Number.isFinite(v)?String(v):"";
const arr=v=>v==null?[]:Array.isArray(v)?v:[v];
const safeLink=(v)=>{
 try{const url=new URL(text(v,600));return url.protocol==="https:"&&url.hostname==="krdict.korean.go.kr"?url.toString():null}
 catch{return null}
};

export function validateKrdictQuery(input){
 const q=String(input??"").normalize("NFKC").trim();
 if([...q].length<1||[...q].length>40||/[\u0000-\u001f<>\\]/u.test(q))
  throw new KrdictError("INVALID_QUERY","请输入 1–40 个字的韩语词条",400);
 // Official headword searching is Korean-focused. Avoid non-Korean data sent to upstream.
 if(!/[가-힣ㄱ-ㅎㅏ-ㅣ]/u.test(q))
  throw new KrdictError("INVALID_QUERY","官方词典搜索请先输入韩语；中文可用本站扩展词库检索",400);
 return q;
}
export class KrdictError extends Error{
 constructor(code,message,status=502){super(message);this.name="KrdictError";this.code=code;this.status=status}
}
export function mapKrdictXml(xml){
 if(typeof xml!=="string"||xml.length<3||xml.length>350000)throw new KrdictError("INVALID_RESPONSE","官方词典返回了不可处理的数据");
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw new KrdictError("INVALID_RESPONSE","上游响应不符合预期");
 let parsed;
 try{parsed=parser.parse(xml)}catch{throw new KrdictError("INVALID_RESPONSE","官方词典返回了无法解析的内容")}
 if(parsed?.error){
  const code=text(parsed.error.error_code,8);
  if(code==="020")throw new KrdictError("UPSTREAM_KEY_REJECTED","官方词典未接受当前认证密钥",503);
  throw new KrdictError("UPSTREAM_ERROR","官方词典暂时无法查询",502);
 }
 const channel=parsed?.channel;
 if(!channel||typeof channel!=="object")throw new KrdictError("INVALID_RESPONSE","官方词典返回结构异常");
 const items=arr(channel.item).slice(0,SEARCH_LIMIT).map((item)=>{
  const word=text(item?.word,80);
  if(!word)return null;
  const senses=arr(item?.sense).slice(0,5).map(s=>{
   const trans=arr(s?.translation).find(t=>{
    const lang=text(t?.trans_lang,30);
    return /중국어|中文|Chinese|汉语/i.test(lang);
   })||arr(s?.translation)[0];
   return {
    order:text(s?.sense_order,8),
    definitionKo:text(s?.definition,700),
    translation:text(trans?.trans_word,320),
    definitionZh:text(trans?.trans_dfn,850),
   };
  });
  return {
   id:text(item.target_code,32),
   word,
   supNo:text(item.sup_no,8),
   pronunciation:text(item.pronunciation,90),
   pos:text(item.pos,60),
   level:text(item.word_grade,60),
   url:safeLink(item.link)||null,
   senses,
  };
 }).filter(Boolean);
 const total=Number(channel.total)||0;
 return {total:Math.max(total,items.length),items,source:{
  name:"韩国国立国语院《韩国语基础词典》",
  url:KRDICT_SOURCE_URL,
  official:true,
  language:"ko/zh",
  note:"按需检索的官方词条，不是本站预先下载或拥有的整部词典",
 }};
}
async function readLimitedBody(response,max=350000){
 const length=Number(response.headers.get("content-length")||0);
 if(length>max)throw new KrdictError("TOO_LARGE","官方词典响应超过允许大小");
 if(!response.body){
  const str=await response.text();
  if(str.length>max)throw new KrdictError("TOO_LARGE","官方词典响应超过允许大小");
  return str;
 }
 const reader=response.body.getReader();
 const chunks=[];let size=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;
   if(size>max)throw new KrdictError("TOO_LARGE","官方词典响应超过允许大小");
   chunks.push(value);
  }
 }finally{reader.releaseLock()}
 const merged=new Uint8Array(size);let at=0;
 for(const part of chunks){merged.set(part,at);at+=part.byteLength}
 return new TextDecoder("utf-8",{fatal:false}).decode(merged);
}
export async function lookupKrdict(q,{key=process.env.KRDICT_API_KEY,fetchImpl=fetch,limit=10}={}){
 const query=validateKrdictQuery(q);
 if(!/^[0-9A-Fa-f]{32}$/.test(key||""))throw new KrdictError("NOT_CONFIGURED","官方词典服务器密钥尚未配置",503);
 const num=Math.min(SEARCH_LIMIT,Math.max(10,Number(limit)||10));
 const params=new URLSearchParams({
  key,q:query,start:"1",num:String(num),part:"word",sort:"dict",translated:"y",trans_lang:"11",
 });
 const abort=new AbortController();
 const timeout=setTimeout(()=>abort.abort(),8500);
 try{
  // Never log this URL; it contains the provider-required secret parameter.
  const resp=await fetchImpl(KRDICT_SEARCH_URL+"?"+params.toString(),{
   signal:abort.signal,redirect:"error",headers:{"accept":"application/xml,text/xml;q=0.9"},
  });
  if(!resp.ok)throw new KrdictError("UPSTREAM_HTTP","官方词典暂时无法访问",502);
  const xml=await readLimitedBody(resp);
  return {query,...mapKrdictXml(xml)};
 }catch(error){
  if(error instanceof KrdictError)throw error;
  throw new KrdictError(error?.name==="AbortError"?"UPSTREAM_TIMEOUT":"UPSTREAM_UNAVAILABLE",
   "官方词典连接暂时不可用，请稍后重试",503);
 }finally{clearTimeout(timeout)}
}
