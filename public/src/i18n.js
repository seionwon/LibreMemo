// Interface language. The Korean text written in the source is the message key
// and the Korean translation itself; other languages map that text to theirs.
// Unknown text falls back to Korean, so a missing entry never breaks the app.
import {EN} from './locales/en.js';

export const LANGUAGES=Object.freeze([
  Object.freeze({id:'auto',label:'자동 (기기 언어)',native:'Auto (device language)'}),
  Object.freeze({id:'ko',label:'한국어',native:'한국어'}),
  Object.freeze({id:'en',label:'English',native:'English'}),
]);
export const LANGUAGE_KEY='librememo-language';
const DICTIONARIES={en:EN};
const LOCALES={ko:'ko-KR',en:'en-US'};

function storedChoice(){
  try{const value=globalThis.localStorage?.getItem(LANGUAGE_KEY);return ['ko','en'].includes(value)?value:'auto';}catch{return 'auto';}
}
function detect(){
  const forced=globalThis.LIBREMEMO_LANGUAGE;if(forced==='ko'||forced==='en')return forced;
  const choice=storedChoice();if(choice!=='auto')return choice;
  const list=[...(globalThis.navigator?.languages||[]),globalThis.navigator?.language].filter(Boolean).map(value=>String(value).toLowerCase());
  for(const value of list){if(value.startsWith('ko'))return 'ko';if(value.startsWith('en'))return 'en';}
  return list.length?'en':'ko';
}
let current=detect();

/** 'ko' or 'en' for this page. Changing it takes effect after a reload. */
export const language=()=>current;
export const languageChoice=storedChoice;
/** BCP 47 locale for dates and numbers. */
export const locale=()=>LOCALES[current]||'ko-KR';
export function setLanguageChoice(value){
  if(!LANGUAGES.some(entry=>entry.id===value))throw new Error('지원하지 않는 언어입니다.');
  try{if(value==='auto')globalThis.localStorage?.removeItem(LANGUAGE_KEY);else globalThis.localStorage?.setItem(LANGUAGE_KEY,value);}catch{/* Private mode keeps the current page language. */}
}
/** Tests only: switch the active language without reloading. */
export function useLanguage(value){current=value==='en'?'en':'ko';}

/**
 * Translate interface text. `text` is the Korean source string; `{name}`
 * placeholders are filled from `vars`. An English value may hold
 * "singular|plural" alternatives chosen by vars.n.
 */
export function t(text,vars){
  let value=text;
  if(current!=='ko'){const entry=DICTIONARIES[current]?.[text];if(typeof entry==='string')value=entry;}
  if(vars&&typeof value==='string'){
    if(value.includes('|')&&vars.n!==undefined&&current!=='ko'){const [one,other]=value.split('|');value=Number(vars.n)===1?one:other;}
    value=value.replace(/\{(\w+)\}/g,(match,name)=>Object.hasOwn(vars,name)?String(vars[name]):match);
  }
  return value;
}

const LOCALIZED_ATTRIBUTES=['placeholder','title','aria-label','alt','content'];
/**
 * Translate the app's own static markup (index.html templates and fixed
 * dialogs): text nodes and labelling attributes whose whole trimmed value is a
 * known Korean string. Never call this on document content or user data.
 */
export function localizeStatic(root){
  if(current==='ko'||!root)return;
  const doc=root.ownerDocument||root,walker=doc.createTreeWalker(root,4);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
    const raw=node.nodeValue,text=raw.trim();if(!text||!/[가-힣]/.test(text))continue;
    const value=t(text);if(value!==text)node.nodeValue=raw.replace(text,value);
  }
  const elements=root.querySelectorAll?root.querySelectorAll('*'):[];
  for(const element of [root,...elements])for(const name of LOCALIZED_ATTRIBUTES){
    const raw=element.getAttribute?.(name);if(!raw||!/[가-힣]/.test(raw))continue;
    const value=t(raw.trim());if(value!==raw.trim())element.setAttribute(name,value);
  }
  for(const template of root.querySelectorAll?.('template')||[])localizeStatic(template.content);
}

/**
 * Translate a short word whose English depends on where it appears (e.g. 이동 as
 * a "Go to" tab or a "Move" button). The dictionary key is "text#context"; Korean
 * shows the text itself, and a missing contextual entry falls back to t(text).
 */
export function pt(context,text,vars){
  if(current!=='ko'){const entry=DICTIONARIES[current]?.[text+'#'+context];if(typeof entry==='string')return t(text+'#'+context,vars);}
  return t(text,vars);
}
