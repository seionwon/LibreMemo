// "AI search" opens the user's LLM in an ordinary browser tab, signed in as they
// already are; no key or API is involved and nothing goes through this app.
export const AI_TEXT_LIMIT=2000;
export const AI_SEARCH_LIMIT=20;
export const DEFAULT_AI_SEARCH=Object.freeze([
  Object.freeze({id:'chatgpt',name:'ChatGPT',url:'https://chatgpt.com/?q={text}',enabled:true}),
  Object.freeze({id:'claude',name:'Claude',url:'https://claude.ai/new?q={text}',enabled:true}),
  Object.freeze({id:'gemini',name:'Gemini',url:'https://gemini.google.com/app',enabled:true}),
  Object.freeze({id:'perplexity',name:'Perplexity',url:'https://www.perplexity.ai/search?q={text}',enabled:true}),
]);
export function aiSearchURL(value){
  const text=String(value??'').trim();
  try{const url=new URL(text.replaceAll('{text}','text'));return ['https:','http:'].includes(url.protocol)&&url.hostname&&!url.username&&!url.password?text:null;}catch{return null;}
}
export function normalizeAiSearch(value){
  if(!Array.isArray(value))return DEFAULT_AI_SEARCH.map(entry=>({...entry}));
  const seen=new Set(),result=[];
  for(const entry of value){
    const url=aiSearchURL(entry?.url),name=typeof entry?.name==='string'?entry.name.trim().slice(0,40):'',id=typeof entry?.id==='string'&&/^[\w-]{1,64}$/.test(entry.id)?entry.id:'';
    if(!url||!name||!id||seen.has(id)||result.length>=AI_SEARCH_LIMIT)continue;
    seen.add(id);result.push({id,name,url,enabled:entry.enabled!==false});
  }
  return result;
}
/** What to open for a selection, and whether the clipboard must carry the text. */
export function aiSearchRequest(entry,text){
  const direct=entry.url.includes('{text}'),clipped=text.slice(0,AI_TEXT_LIMIT);
  return {url:entry.url.replaceAll('{text}',encodeURIComponent(clipped)),copy:!direct||text.length>AI_TEXT_LIMIT,truncated:direct&&text.length>AI_TEXT_LIMIT};
}
