// Hangul documents name fonts many devices lack, and the system's last resort
// is often poor (AppleMyungjo on macOS). These open fonts sit between the
// document's own font and that fallback. Only faces a document names are read.
export const HANGUL_FONTS={serif:'LibreMemo Serif',sans:'LibreMemo Sans'};
const FILES={[HANGUL_FONTS.serif]:'vendor/fonts/LibreMemoSerif.woff2',[HANGUL_FONTS.sans]:'vendor/fonts/LibreMemoSans.woff2'};
const SYSTEM_FALLBACKS=new Set(['Batang','바탕','Malgun Gothic','맑은 고딕','Nanum Myeongjo','AppleMyungjo','Apple SD Gothic Neo']);
const ALIASES=[['Batang','바탕'],['Malgun Gothic','맑은 고딕']];
const stacks=new Map();
export function withHangulFont(stack){
  let result=stacks.get(stack);
  if(result!==undefined)return result;
  const names=stack.split(',').map(name=>name.trim().replace(/^['"]|['"]$/g,'')),family=names.includes('AppleMyungjo')?HANGUL_FONTS.serif:names.includes('Apple SD Gothic Neo')?HANGUL_FONTS.sans:null;
  result=stack;
  if(family){
    const own=ALIASES.find(group=>group.includes(names[0]))||[names[0]];
    const index=names.findIndex((name,position)=>position>0&&SYSTEM_FALLBACKS.has(name)&&!own.includes(name));
    if(index>0)result=stack.split(',').toSpliced(index,0,"'"+family+"'").join(',');
  }
  stacks.set(stack,result);
  return result;
}
const buffers=new Map();
const fontBytes=family=>{
  if(!buffers.has(family))buffers.set(family,fetch(new URL(FILES[family],document.baseURI)).then(response=>{if(!response.ok)throw Error('font');return response.arrayBuffer();}).catch(error=>{buffers.delete(family);throw error;}));
  return buffers.get(family);
};
// FontFace takes the bytes directly, so the document's data:-only font-src
// policy stays closed. Without the files the document's own stack still works.
export async function loadHangulFonts(doc){
  const FontFace=doc.defaultView?.FontFace;
  if(!FontFace||!doc.fonts)return;
  await Promise.allSettled(Object.keys(FILES).filter(family=>doc.querySelector('[font-family*="'+family+'"]')).map(async family=>{
    const face=new FontFace(family,await fontBytes(family),{weight:'100 900'});
    doc.fonts.add(await face.load());
  }));
}
