import {normalizeReadingLayout} from './reading-layout.js';
// Named viewer settings. Which setting works on which document is computed from
// the same conditions the reader enforces, so a label can never promise more
// than applying the preset does.
export const PRESET_LIMIT=100;
export const SETTING_LABELS=Object.freeze({layout:'페이지 레이아웃',fontScale:'글자 크기',fontFamily:'글꼴',theme:'화면 모드'});
export const FORMAT_GROUPS=Object.freeze([
  Object.freeze({id:'ebook',label:'EPUB·MOBI·AZW3·FB2',caps:Object.freeze({layout:true,fontScale:true,fontFamily:true,theme:true})}),
  Object.freeze({id:'document',label:'HTML·Office·한글·문서·자막',caps:Object.freeze({layout:false,fontScale:true,fontFamily:true,theme:true})}),
  Object.freeze({id:'pdf',label:'PDF',caps:Object.freeze({layout:false,fontScale:true,fontFamily:false,theme:true})}),
  Object.freeze({id:'image',label:'이미지·CBZ·스캔 DjVu',caps:Object.freeze({layout:false,fontScale:false,fontFamily:false,theme:true})}),
]);
const THEMES=['system','light','sepia','dark'];
export function normalizeSettings(value){
  const input=value&&typeof value==='object'?value:{},settings={};
  if(input.layout&&typeof input.layout==='object')settings.layout=normalizeReadingLayout(input.layout);
  if(Number.isFinite(input.fontScale))settings.fontScale=Math.min(3.2,Math.max(.6,input.fontScale));
  if(typeof input.fontFamily==='string'&&/^[\w-]{1,40}$/.test(input.fontFamily))settings.fontFamily=input.fontFamily;
  if(THEMES.includes(input.theme))settings.theme=input.theme;
  return settings;
}
export function normalizePresets(value){
  if(!Array.isArray(value))return [];
  const seen=new Set(),names=new Set(),result=[];
  for(const entry of value){
    const name=typeof entry?.name==='string'?entry.name.trim().slice(0,60):'',id=typeof entry?.id==='string'&&/^[\w-]{1,64}$/.test(entry.id)?entry.id:'',settings=normalizeSettings(entry?.settings);
    if(!name||!id||seen.has(id)||names.has(name.toLowerCase())||!Object.keys(settings).length||result.length>=PRESET_LIMIT)continue;
    seen.add(id);names.add(name.toLowerCase());
    const stamp=key=>Number.isFinite(entry[key])?entry[key]:0;
    result.push({id,name,settings,favorite:entry.favorite===true,createdAt:stamp('createdAt'),usedAt:stamp('usedAt')});
  }
  return result;
}
export function normalizeDefaults(value,presets){
  const result={},ids=new Set(presets.map(preset=>preset.id));
  for(const {id} of FORMAT_GROUPS)if(ids.has(value?.[id]))result[id]=value[id];
  return result;
}
/** Which of a preset's settings take effect under given capabilities. */
export function presetFit(settings,caps){
  const keys=Object.keys(settings),applied=keys.filter(key=>caps[key]),skipped=keys.filter(key=>!caps[key]);
  return {applied,skipped,level:!applied.length?'none':skipped.length?'partial':'full'};
}
export function presetFormats(settings){
  const full=[],partial=[];
  for(const group of FORMAT_GROUPS){const {level}=presetFit(settings,group.caps);if(level==='full')full.push(group.label);else if(level==='partial')partial.push(group.label);}
  return {full,partial};
}
export function presetSummary(settings){
  const parts=[];
  if(settings.layout)parts.push((settings.layout.flow==='paged'?'쪽 단위':'연속')+' · 여백 '+settings.layout.margin+' · 폭 '+settings.layout.width);
  if(settings.fontScale!==undefined)parts.push('글자 '+Math.round(settings.fontScale*100)+'%');
  if(settings.fontFamily)parts.push('글꼴 '+(settings.fontFamily==='default'?'기본':settings.fontFamily));
  if(settings.theme)parts.push({system:'시스템',light:'밝게',sepia:'세피아',dark:'어둡게'}[settings.theme]);
  return parts.join(' · ');
}
const collator=new Intl.Collator('ko',{numeric:true,sensitivity:'base'});
export const PRESET_SORTS=Object.freeze([['fit','적용 가능한 것 먼저'],['used','최근 사용순'],['name','이름순'],['created','최근 저장순']]);
export function findPresets(presets,{query='',sort='fit',caps}={}){
  const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const rank={full:0,partial:1,none:2},level=preset=>rank[presetFit(preset.settings,caps).level];
  const compare={fit:(a,b)=>level(a)-level(b),used:(a,b)=>b.usedAt-a.usedAt,name:()=>0,created:(a,b)=>b.createdAt-a.createdAt}[sort]||(()=>0);
  return presets.filter(preset=>{
    const {full,partial}=presetFormats(preset.settings),text=[preset.name,presetSummary(preset.settings),...full,...partial].join(' ').toLowerCase();
    return words.every(word=>text.includes(word));
  }).sort((a,b)=>Number(b.favorite)-Number(a.favorite)||compare(a,b)||collator.compare(a.name,b.name));
}
export function uniqueName(name,presets){
  const taken=new Set(presets.map(preset=>preset.name.toLowerCase()));if(!taken.has(name.toLowerCase()))return name;
  for(let n=2;;n++){const next=name.slice(0,54)+' ('+n+')';if(!taken.has(next.toLowerCase()))return next;}
}
