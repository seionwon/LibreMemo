// How memo boxes and free text look. An annotation may carry a `style`; one without it
// keeps the original look (memo box: pale yellow, brown 14px; free text: pen colour 18px).
// The reader and the PDF export both draw from textLook(), so they always agree.

/** Colours are #rrggbb; 'pen' means the annotation's own pen colour; null means none. */
export const TEXT_STYLE_PRESETS=Object.freeze([
  {id:'memo',name:'기본 메모',style:{size:14,bold:false,color:'#544a30',background:'#fff9df',border:'pen'}},
  {id:'sticky',name:'노란 포스트잇',style:{size:15,bold:false,color:'#3b3200',background:'#fff3a8',border:null}},
  {id:'pink',name:'분홍 강조',style:{size:15,bold:true,color:'#7a1e44',background:'#ffe0ec',border:'#f48fb1'}},
  {id:'sky',name:'하늘 메모',style:{size:14,bold:false,color:'#0d3c61',background:'#e3f2fd',border:'#90caf9'}},
  {id:'mint',name:'민트 정리',style:{size:14,bold:false,color:'#14532d',background:'#dcfce7',border:'#86efac'}},
  {id:'board',name:'칠판',style:{size:15,bold:false,color:'#ffffff',background:'#263238',border:null}},
  {id:'warn',name:'경고',style:{size:14,bold:true,color:'#b71c1c',background:'#ffebee',border:'#e53935'}},
  {id:'title',name:'큰 제목',style:{size:26,bold:true,color:'pen',background:null,border:null}},
  {id:'plain',name:'펜 색 글씨',style:{size:18,bold:false,color:'pen',background:null,border:null}},
  {id:'small',name:'작은 설명',style:{size:12,bold:false,color:'#475569',background:null,border:null}},
]);
export const TEXT_SIZE_MIN=10,TEXT_SIZE_MAX=40;
const HEX=/^#[\da-f]{6}$/i;
const colorOK=(v,allowNull)=>v==='pen'||(allowNull&&v===null)||typeof v==='string'&&HEX.test(v);
/** A valid style (lower-case colours), or null. */
export function validTextStyle(value){
  if(!value||typeof value!=='object')return null;
  const {size,bold,color,background,border}=value;
  if(!Number.isFinite(size)||size<TEXT_SIZE_MIN||size>TEXT_SIZE_MAX||typeof bold!=='boolean'||!colorOK(color,false)||!colorOK(background??null,true)||!colorOK(border??null,true))return null;
  const lower=v=>typeof v==='string'&&v!=='pen'?v.toLowerCase():v??null;
  return {size:Math.round(size),bold,color:lower(color),background:lower(background),border:lower(border)};
}
/** Saved styles: [{id,name,style}], at most 30, names 1–30 characters. */
export function validTextStyles(list){
  if(!Array.isArray(list))return [];
  return list.slice(0,30).map(item=>{const style=validTextStyle(item?.style),name=typeof item?.name==='string'?item.name.trim().slice(0,30):'';return style&&name&&/^[\w-]{1,64}$/.test(item.id||'')?{id:item.id,name,style}:null;}).filter(Boolean);
}
const DEFAULTS={note:TEXT_STYLE_PRESETS[0].style,text:{size:18,bold:false,color:'pen',background:null,border:null}};
/**
 * Everything needed to draw a memo box or free text: resolved colours, font, padding,
 * line height and how many characters fit on a line at that size.
 */
export function textLook(annotation){
  const style=validTextStyle(annotation.style)||DEFAULTS[annotation.type==='note'?'note':'text'];
  const pen=annotation.color,resolve=v=>v==='pen'?pen:v;
  const boxed=!!(style.background||style.border);
  const look={size:style.size,weight:style.bold?700:400,color:resolve(style.color),background:resolve(style.background),border:resolve(style.border),boxed,
    pad:boxed?12:0,lineHeight:Math.round(style.size*1.55),chars:Math.max(8,Math.round(24*14/style.size*(style.size>=20?1.2:1))),baseline:Math.round(style.size*.93)};
  // Annotations made before styles existed keep their exact original layout.
  if(!annotation.style)Object.assign(look,{lineHeight:22,chars:24,baseline:annotation.type==='note'?13:16});
  return look;
}
export function textLines(text,chars){
  return (text||'메모').split('\n').flatMap(line=>{const parts=[];for(let i=0;i<Math.max(line.length,1);i+=chars)parts.push(line.slice(i,i+chars));return parts;});
}
/** A small inline preview of a style for buttons ("가나 Aa" in its colours). */
export function stylePreview(style,pen='#334155'){
  const look=textLook({type:'note',color:pen,style});
  return `background:${look.background||'transparent'};color:${look.color};border:1px ${look.border?'solid '+look.border:'dashed rgba(127,127,127,.45)'};font-weight:${look.weight}`;
}
