// Provenance: Koko AI "Koko Korean 5K", CC BY 4.0,
// https://huggingface.co/datasets/jaylee8864/korean-vocabulary-5000
// Original zh-TW JSONL preserved only in local source workspace; user-facing data kept attributed.
// Community language data is NOT an official Korean Basic Dictionary.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import * as OpenCC from "opencc-js";
const toSimplified=OpenCC.Converter({from:"tw",to:"cn"});
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const source=join(root,"data","third-party","koko-zh-TW-original.jsonl");
const original=(await readFile(source,"utf8")).split(/\r?\n/).filter(Boolean).map(JSON.parse);
const unique=new Map();let excluded=0,synthetic=0,latin=0;
const exampleGood=x=>typeof x==="string"&&/[가-힣]/u.test(x)&&
 !/이것은.{0,45}(예문|뜻|단어).{0,20}입니다|^\s*.+에 대한 예문입니다/u.test(x);
for(const raw of original){
 const ko=String(raw.korean_term||"").trim(),zh=String(raw.english_term||"").trim(),
       roman=String(raw.romanization||"").trim(),cat=String(raw.category||"").trim(),
       difficulty=String(raw.difficulty||"").trim();
 if(!/[가-힣]/u.test(ko)||ko.length>60||ko.length<1||!zh||zh.length>140){excluded++;continue;}
 const mayEnglish=/^[A-Za-z0-9 ()',.\-\/]+$/.test(zh);
 if(mayEnglish)latin++;
 const ex=exampleGood(raw.example_sentence_korean)?String(raw.example_sentence_korean).trim():"";
 if(!ex)synthetic++;
 const val=[ko,(mayEnglish?zh:toSimplified(zh)).slice(0,110),roman.slice(0,58),ex.slice(0,130),toSimplified(cat).slice(0,32),toSimplified(difficulty).slice(0,24),mayEnglish?1:0,zh.slice(0,110)];
 if(!unique.has(ko)){unique.set(ko,val);continue;}
 const old=unique.get(ko);
 // keep the more useful translation and meaningful example, not duplicate headwords
 if((old[6]&&!val[6])||(!old[3]&&val[3]&&!old[6]))unique.set(ko,val);
}
const rows=[...unique.values()];
const data={schema:1,source:{title:"Koko Korean 5K — Multilingual Vocabulary Dataset",
 url:"https://huggingface.co/datasets/jaylee8864/korean-vocabulary-5000",
 author:"Koko AI / kokoai.im",license:"CC BY 4.0",
 licenseUrl:"https://creativecommons.org/licenses/by/4.0/",
 attribution:"Koko AI (kokoai.im), CC BY 4.0. Original zh-TW source; Simplified Chinese converted using OpenCC-JS (MIT AND Apache-2.0), headwords de-duplicated, generic examples removed.",
 languages:"ko + zh-CN (converted from source zh-TW; some entries retain English glosses), original zh-TW retained",
 disclaimer:"This community dataset is not official KRDict or human-certified. Definitions and examples may need independent review."},
 count:rows.length,fields:["korean_term","zh_cn_or_en","romanization","example_korean","category","difficulty","is_english_gloss","source_zh_tw"],
 words:rows};
const dest=join(root,"data","noncommercial-korean-extended.json");
await mkdir(dirname(dest),{recursive:true});
await writeFile(dest,JSON.stringify(data),"utf8");
const counts={original:original.length,unique:rows.length,excluded,duplicateOrVariants:original.length-rows.length-excluded,
 englishLikeGlosses:rows.filter(x=>x[6]).length,
 exampleRows:rows.filter(x=>x[3]).length,
 strippedGenericExamples:synthetic,
 bytes:Buffer.byteLength(JSON.stringify(data)),
 license:data.source.license,first:rows.slice(0,2)};
console.log("VOCAB_PREPARED",JSON.stringify(counts));
await writeFile(join(root,"data","noncommercial-vocab-manifest.json"),JSON.stringify(counts,null,2),"utf8");
