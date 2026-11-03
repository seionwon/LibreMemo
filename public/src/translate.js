// Subtitles in the language the learner wants. Many videos have only English
// (often auto-generated) captions; YouTube translates them on screen, but a web
// app cannot download that translation. So LibreMemo translates the subtitle
// itself, keeping every cue's timing:
//   1. the browser's own on-device translator (Chrome/Edge desktop), unlimited;
//   2. otherwise MyMemory's free public API (limited each day). When that limit
//      is reached the untranslated cues keep their text and can be continued.
import {parseSubtitles} from './office-subtitles.js';

export const LANGUAGES=[['ko','한국어'],['en','English'],['ja','日本語'],['zh-Hans','中文(简体)'],['zh-Hant','中文(繁體)'],['es','Español'],['fr','Français'],['de','Deutsch'],['ru','Русский'],['pt','Português'],['it','Italiano'],['vi','Tiếng Việt'],['th','ไทย'],['id','Bahasa Indonesia']];
const CODES=new Set(LANGUAGES.map(([code])=>code));
const NAMES={english:'en',korean:'ko',japanese:'ja',chinese:'zh-Hans',spanish:'es',french:'fr',german:'de',russian:'ru',portuguese:'pt',italian:'it',vietnamese:'vi',thai:'th',indonesian:'id','한국어':'ko','영어':'en','일본어':'ja','중국어':'zh-Hans'};
export const languageName=code=>LANGUAGES.find(([c])=>c===code)?.[1]||code;
/** The device's language when LibreMemo supports it, else Korean. */
export function defaultLanguage(languages=[]){
  for(const tag of languages){
    const lower=String(tag).toLowerCase();
    if(/^zh-(?:tw|hk|mo|hant)/.test(lower))return 'zh-Hant';
    if(lower.startsWith('zh'))return 'zh-Hans';
    const base=lower.split('-')[0];if(CODES.has(base))return base;
  }
  return 'ko';
}
const base=code=>String(code||'').toLowerCase().startsWith('zh')?(/hant|tw|hk/i.test(code)?'zh-Hant':'zh-Hans'):String(code||'').toLowerCase().split('-')[0];
/**
 * The subtitle's language: a code in its file name ("-ko.srt", ".en.vtt",
 * "[English]", "(한국어)"), else the writing system of its text. A Latin text
 * without a code is reported as 'latin' (English, Spanish… cannot be told apart here).
 */
export function guessLanguage(name,text){
  const file=String(name||'');
  const word=file.match(/[[(]([^\])]+)[\])]/g)?.map(w=>NAMES[w.slice(1,-1).replace(/\s*\(.*$/,'').trim().toLowerCase()]).find(Boolean);if(word)return word;
  // The last part of the name: "talk-ko.srt", "talk.en.vtt", "talk.zh-Hans.srt", "talk.en.auto.srt".
  const parts=file.toLowerCase().replace(/\.(?:srt|vtt|smi|sami|ass|ssa)$/,'').split(/[.\-_ ]+/);while(['auto','asr','automatic'].includes(parts.at(-1)))parts.pop();
  const known=/^(?:en|ko|ja|zh|es|fr|de|ru|pt|it|vi|th|id)$/;
  if(parts.length>1&&known.test(parts.at(-1)))return base(parts.at(-1));
  if(parts.length>2&&parts.at(-2)==='zh')return base('zh-'+parts.at(-1));
  const sample=String(text||'').replace(/\d{1,2}:\d{2}:\d{2}[,.]\d{1,3}/g,'').slice(0,20000),count=re=>(sample.match(re)||[]).length;
  const scripts={ko:count(/[가-힣]/g),ja:count(/[぀-ヿ]/g),zh:count(/[一-鿿]/g),ru:count(/[Ѐ-ӿ]/g),th:count(/[฀-๿]/g),latin:count(/[A-Za-z]/g)};
  if(scripts.ja>20)return 'ja';
  const [best,n]=Object.entries(scripts).sort((a,b)=>b[1]-a[1])[0];
  return n<5?'':best==='zh'?'zh-Hans':best;
}
const LATIN=new Set(['en','es','fr','de','pt','it','vi','id']);
/** true/false, or null when it cannot be known (a Latin text without a code, for a Latin target). */
export function needsTranslation(detected,target){
  if(!detected)return null;
  if(detected==='latin')return LATIN.has(base(target))?null:true;
  return base(detected)!==base(target);
}

/** Cue texts packed into requests of at most `limit` UTF-8 bytes, one cue per line. */
export function batches(texts,limit=450){
  const out=[],encoder=new TextEncoder();let current=[],size=0;
  texts.forEach((text,index)=>{
    const line=text.replace(/\s+/g,' ').trim(),bytes=encoder.encode(line).length+1;
    if(current.length&&size+bytes>limit){out.push(current);current=[];size=0;}
    current.push({index,line});size+=bytes;
  });
  if(current.length)out.push(current);
  return out;
}
const pad=(n,w=2)=>String(n).padStart(w,'0');
const stamp=ms=>pad(Math.floor(ms/3600000))+':'+pad(Math.floor(ms/60000)%60)+':'+pad(Math.floor(ms/1000)%60)+','+pad(Math.round(ms%1000),3);
/** SRT text for cues ({start,end,text} in milliseconds). */
export function toSRT(cues){
  return cues.map((cue,i)=>(i+1)+'\n'+stamp(cue.start)+' --> '+stamp(cue.end??cue.start+2000)+'\n'+(cue.speaker?cue.speaker+': ':'')+cue.text).join('\n\n')+'\n';
}
/**
 * Auto-generated captions are fragments of speech ("I'm a" / "professor here…"), which
 * translate badly one by one. Join them into sentences (or ~12-second spans) first;
 * each joined cue keeps the first start and the last end, so the video still follows.
 */
export function sentenceCues(cues,{maxMs=12000,maxChars=220}={}){
  const out=[];let current=null;
  for(const cue of cues){
    const text=cue.text.replace(/\s+/g,' ').trim();if(!text)continue;
    if(!current)current={start:cue.start,end:cue.end,text,speaker:cue.speaker};
    else{current.text+=' '+text;current.end=cue.end??cue.start;}
    if(/[.?!…。？！]["'”’)\]]*$/.test(current.text)||(current.end??current.start)-current.start>=maxMs||current.text.length>=maxChars){out.push(current);current=null;}
  }
  if(current)out.push(current);
  return out;
}
/** 「한국어로」, 「English로」, 「日本語로」: the particle that follows a language name. */
export function toLanguage(name){
  const last=String(name).at(-1)||'',code=last.charCodeAt(0)-0xac00;
  return name+(code>=0&&code<11172&&code%28!==0&&code%28!==8?'으로':'로');
}
export const cuesOf=subtitle=>parseSubtitles(subtitle.text,subtitle.format).map(c=>({start:c.start,end:c.end,text:c.text,speaker:c.speaker}));

// ── engines (browser) ─────────────────────────────────────────────────────
const translatorAPI=()=>typeof globalThis.Translator!=='undefined'?globalThis.Translator:null;
/** The on-device translator when this browser has one for the pair; must be called during a click when it downloads a model. */
export async function browserTranslator(from,to,onDownload=()=>{}){
  const api=translatorAPI();if(!api||!from||from==='latin')return null;
  try{
    const pair={sourceLanguage:from,targetLanguage:to};
    if(await api.availability(pair)==='unavailable')return null;
    return await api.create({...pair,monitor(m){m.addEventListener('downloadprogress',e=>onDownload(e.loaded));}});
  }catch{return null;}
}
/** The source language of Latin text, from the browser's language detector when present. */
export async function detectLatin(text){
  try{
    if(typeof globalThis.LanguageDetector==='undefined')return 'en';
    const detector=await globalThis.LanguageDetector.create(),[top]=await detector.detect(String(text).slice(0,4000));
    return top?.detectedLanguage&&top.detectedLanguage!=='und'?base(top.detectedLanguage):'en';
  }catch{return 'en';}
}
export class QuotaError extends Error {}
const MYMEMORY_CODE={'zh-Hans':'zh-CN','zh-Hant':'zh-TW'};
async function myMemory(text,from,to){
  const params=new URLSearchParams({q:text,langpair:(MYMEMORY_CODE[from]||from)+'|'+(MYMEMORY_CODE[to]||to)});
  const response=await fetch('https://api.mymemory.translated.net/get?'+params,{credentials:'omit',referrerPolicy:'no-referrer'});
  const data=await response.json().catch(()=>null);
  if(response.status===429||data?.quotaFinished||/QUOTA|LIMIT/i.test(String(data?.responseDetails||'')))throw new QuotaError('quota');
  if(!response.ok||data?.responseStatus!==200)throw Error('번역 서비스가 응답하지 않습니다. 잠시 뒤 다시 시도해주세요.');
  return String(data.responseData?.translatedText||'');
}
/**
 * Translate cue texts from `start` on. Returns {texts, done}: `done` cues are
 * translated; the rest keep their text when the free daily amount runs out.
 */
export async function translateTexts(texts,{from,to,translator=null,start=0,onProgress=()=>{}}){
  const out=[...texts];let done=start;
  if(translator){
    for(let i=start;i<texts.length;i++){out[i]=await translator.translate(texts[i]);done=i+1;onProgress(done,texts.length);}
    return {texts:out,done};
  }
  for(const batch of batches(texts.slice(start)).map(b=>b.map(item=>({...item,index:item.index+start})))){
    let lines;
    try{lines=(await myMemory(batch.map(b=>b.line).join('\n'),from==='latin'?'en':from,to)).split('\n');}
    catch(error){if(error instanceof QuotaError)return {texts:out,done,quota:true};throw error;}
    // A batch that came back with a different number of lines is translated line by line.
    if(lines.length!==batch.length){lines=[];for(const b of batch){try{lines.push(await myMemory(b.line,from==='latin'?'en':from,to));}catch(error){if(error instanceof QuotaError)return {texts:out,done,quota:true};throw error;}}}
    batch.forEach((b,i)=>{out[b.index]=lines[i].trim()||texts[b.index];});done=batch.at(-1).index+1;onProgress(done,texts.length);
  }
  return {texts:out,done};
}
