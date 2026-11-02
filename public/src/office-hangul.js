import init,{HwpDocument} from '../vendor/office/rhwp/rhwp.js';
import {XMLParser} from '../vendor/office/genoffice.js';
import {esc,font} from './office-common.js';

// Only the import worker loads WASM. The saved reading view needs no engine.
// A real Canvas measurement callback is installed before constructing a document.
let ready,context,contextFont,parser;
// Documents repeat a few thousand glyphs, so single characters are cached and
// the long font stack is reparsed by Canvas only when it actually changes.
const glyphWidths=new Map();
export function hangulMeasure(fontName,text){
  const cacheable=text.length<=2,key=cacheable?fontName+'\0'+text:'';
  if(cacheable){const known=glyphWidths.get(key);if(known!==undefined)return known;}
  const width=measureText(fontName,text);
  if(cacheable){if(glyphWidths.size>=200000)glyphWidths.clear();glyphWidths.set(key,width);}
  return width;
}
function measureText(fontName,text){
  context??=typeof OffscreenCanvas==='function'?new OffscreenCanvas(1,1).getContext('2d'):null;
  if(context){if(contextFont!==fontName)context.font=contextFont=fontName;return context.measureText(text).width;}
  // Deterministic fallback for environments without Canvas (unit tests).
  const size=Number(fontName.match(/([\d.]+)px/)?.[1])||16;
  return Array.from(text).reduce((sum,c)=>sum+(/[^\x00-\x7f]/.test(c)?1:.55),0)*size;
}
export function validateHML(bytes){
  if(bytes.length>2*1024*1024*1024)throw Error('HML 파일은 2GB 이하로 나누어 가져와 주세요.');
  const head=new TextDecoder().decode(bytes.subarray(0,200));
  const encoding=bytes[0]===0xff&&bytes[1]===0xfe||bytes[0]===0x3c&&bytes[1]===0?'utf-16le':bytes[0]===0xfe&&bytes[1]===0xff||bytes[0]===0&&bytes[1]===0x3c?'utf-16be':head.match(/encoding\s*=\s*["']([^"']+)/i)?.[1]||'utf-8';
  let text;try{text=new TextDecoder(encoding,{fatal:true}).decode(bytes);}catch{throw Error('HML 문서의 문자 인코딩을 읽지 못했습니다. UTF-8로 다시 저장한 사본을 가져와 주세요.');}
  if(/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(text))throw Error('외부 엔터티 선언이 있는 HML 문서는 열 수 없습니다.');
  if(!/^\s*(?:<\?xml[^?]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<HWPML\b/i.test(text))throw Error('HML 파일의 HWPML 문서 형식을 확인하지 못했습니다. 원본을 확인해주세요.');
}

const tags=new Set('svg g defs clipPath mask pattern linearGradient radialGradient stop filter feGaussianBlur feOffset feBlend feColorMatrix feComposite feFlood feMerge feMergeNode path rect line circle ellipse polyline polygon image text tspan a title desc use'.split(' '));
const attributes=new Set('id x y x1 y1 x2 y2 cx cy r rx ry width height viewBox preserveAspectRatio d points transform fill fill-rule fill-opacity stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-miterlimit stroke-dasharray stroke-dashoffset opacity clip-path clip-rule mask filter patternUnits patternContentUnits patternTransform gradientUnits gradientTransform offset stop-color stop-opacity spreadMethod fx fy fr text-anchor dominant-baseline alignment-baseline font-family font-size font-style font-weight font-stretch letter-spacing word-spacing textLength lengthAdjust rotate dx dy writing-mode text-decoration text-decoration-color text-decoration-style color-interpolation-filters stdDeviation in in2 result mode values type operator k1 k2 k3 k4 flood-color flood-opacity'.split(' '));
const tagOf=node=>Object.keys(node).find(key=>key!==':@');
const attrsOf=node=>Object.fromEntries(Object.entries(node[':@']||{}).map(([key,value])=>[key.replace(/^@_/,''),String(value)]));
const textOf=children=>children.map(child=>tagOf(child)==='#text'?String(child['#text']):Array.isArray(child[tagOf(child)])?textOf(child[tagOf(child)]):'').join('');
const fragment=value=>/^[\w.:-]{1,200}$/.test(value)?value:null;
const fixed=(value,digits=2)=>String(Number(value.toFixed(digits)));
// One x position per UTF-16 unit is only exact for text without clusters.
// Joining scripts, combining marks and conjoining jamo keep their own element.
const positionedChar=text=>text.length===1&&/^[\p{Script=Hangul}\p{Script=Han}\p{Script=Latin}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Common}]$/u.test(text)&&!/[\s\p{M}\p{Cf}\u1100-\u11ff\ua960-\ua97f\ud7b0-\ud7ff]/u.test(text);
const positionLocked=new Set(['textLength','lengthAdjust','rotate','dx','dy']);
const mergeableGlyph=g=>positionedChar(g.text)&&g.node.text.length===1&&tagOf(g.node.text[0])==='#text'&&(g.a['text-anchor']||'start')==='start'&&!Object.keys(g.a).some(key=>positionLocked.has(key));
const sharedGlyphKey=g=>JSON.stringify(Object.entries(g.a).filter(([key])=>key!=='x'));
function sourceGlyphs(layout){
  const grid=new Map(),runs=layout?.runs||[],key=r=>[r.secIdx,r.paraIdx,r.parentParaIdx,r.controlIdx,r.cellIdx,r.cellParaIdx].join(':');
  runs.forEach((run,id)=>{
    const chars=Array.from(run.text||'');if(run.charX?.length!==chars.length+1)return;
    const paragraphEnd=!runs[id+1]||key(run)!==key(runs[id+1]);
    chars.forEach((text,index)=>{
      if(/\s/u.test(text))return;
      const x=run.x+run.charX[index],y=run.y,k=Math.round(x)+':'+Math.round(y),items=grid.get(k)||[];
      items.push({id,x,y,index,chars,paragraphEnd});grid.set(k,items);
    });
  });
  return (text,x,y)=>{
    for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(const item of grid.get((Math.round(x)+dx)+':'+(Math.round(y)+dy))||[]){
      const length=Array.from(text).length;if(Math.abs(item.x-x)>1||Math.abs(item.y-y)>1||item.chars.slice(item.index,item.index+length).join('')!==text)continue;
      let end=item.index+length;while(end<item.chars.length&&/\s/u.test(item.chars[end]))end++;
      const prefix=item.chars.slice(0,item.index).join('');
      return {id:item.id,before:/^\s*$/u.test(prefix)?prefix:'',after:item.chars.slice(item.index+length,end).join(''),paragraphEnd:item.paragraphEnd&&end===item.chars.length};
    }
    return null;
  };
}

// Rebuild SVG through an allowlist, never inject upstream markup directly.
// Originals remain visible; transparent HTML glyphs at the same coordinates
// supply selection/search/TTS and the shared Reader's annotation wrappers.
// Keeping the vector text avoids changing rhwp's glyph spacing and equations.
export function hangulPage(svg,page,warnings=[],measure=hangulMeasure,layout=null){
  if(svg.length>256*1024*1024||/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(svg))throw Error('한글 문서의 한 쪽이 너무 크거나 안전하게 표시할 수 없습니다.');
  parser??=new XMLParser({ignoreAttributes:false,preserveOrder:true,trimValues:false,parseTagValue:false,parseAttributeValue:false});
  const parsed=parser.parse(svg);
  const root=parsed.find(node=>node.svg),size=attrsOf(root||{}),width=Number(size.width),height=Number(size.height),prefix='rhwp-'+page+'-';
  if(!root||![width,height].every(n=>Number.isFinite(n)&&n>0&&n<=20000))throw Error('한글 문서의 용지 크기가 올바르지 않습니다.');
  let count=0;const sourceFor=sourceGlyphs(layout),glyphs=new Map();
  const attrString=(tag,attrs)=>Object.entries(attrs).flatMap(([key,value])=>{
    if(key==='id')return fragment(value)?[[key,prefix+value]]:[];
    if(key==='href'||key==='xlink:href'){
      if(value.startsWith('#')&&fragment(value.slice(1)))return [['href','#'+prefix+value.slice(1)]];
      if(tag==='image'&&/^data:image\/(?:png|jpeg|gif|webp|svg\+xml|bmp);base64,[a-z\d+/=\s]+$/i.test(value))return [['href',value]];
      if(tag==='a'){try{const url=new URL(value);if(['https:','http:','mailto:','tel:'].includes(url.protocol)&&!url.username&&!url.password)return [['href',url.href]];}catch{}}
      warnings.push('외부 파일로 연결된 그림·개체는 가져오지 않습니다.');return [];
    }
    if(!attributes.has(key))return [];
    if(/url\s*\(/i.test(value)){const match=value.match(/^url\(#([\w.:-]{1,200})\)$/);if(!match)return [];value='url(#'+prefix+match[1]+')';}
    return [[key,value]];
  }).map(([key,value])=>' '+key+'="'+esc(value)+'"').join('');
  const plain=(node,depth)=>{
    if(++count>1000000||depth>128)throw Error('한글 문서의 개체가 너무 많거나 중첩이 깊습니다.');
    const tag=tagOf(node);if(tag==='#text')return esc(node[tag]);
    if(!tags.has(tag))return '';
    return '<'+tag+attrString(tag,attrsOf(node))+'>'+children(node[tag]||[],depth+1)+'</'+tag+'>';
  };
  // The run scanner reads one glyph ahead; the glyph that ended a run is the
  // next run's first, so it must not be parsed and measured a second time.
  const glyph=node=>{
    if(!glyphs.has(node))glyphs.set(node,parseGlyph(node));
    return glyphs.get(node);
  };
  const parseGlyph=node=>{
    if(tagOf(node)!=='text')return null;
    const a=attrsOf(node),x=Number(a.x),y=Number(a.y),size=Number(a['font-size']||16),text=textOf(node.text);
    if(!text||![x,y,size].every(Number.isFinite)||size<=0||size>2000)return null;
    // Complex tspans keep their SVG presentation, with one accessible run.
    const family=font(a['font-family']),weight=/^(?:[1-9]00|bold|normal)$/.test(a['font-weight'])?a['font-weight']:'normal',italic=a['font-style']==='italic'?'italic':'normal';
    const natural=Math.max(.01,measure(italic+' '+weight+' '+size+'px '+family,text));
    const length=Number(a.textLength),w=Number.isFinite(length)&&length>0?length:natural;
    const anchor=a['text-anchor']==='middle'?w/2:a['text-anchor']==='end'?w:0;
    return {node,a,x:x-anchor,y,size,text,w,natural,family,weight,italic,source:sourceFor(text,x-anchor,y-size*.85)};
  };
  // rhwp emits one <text> per character, which costs a million elements in a
  // long document. A single <text> with an x list draws the same positions.
  function visibleText(items,depth){
    let html='';
    for(let index=0;index<items.length;){
      const key=mergeableGlyph(items[index])?sharedGlyphKey(items[index]):null;let end=index+1;
      if(key)while(end<items.length&&mergeableGlyph(items[end])&&sharedGlyphKey(items[end])===key)end++;
      if(end-index<2)html+=plain(items[index].node,depth);
      else{
        count+=end-index;if(count>1000000)throw Error('한글 문서의 개체가 너무 많거나 중첩이 깊습니다.');
        const run=items.slice(index,end);
        html+='<text'+attrString('text',{...run[0].a,x:run.map(g=>fixed(g.x)).join(' ')})+'>'+esc(run.map(g=>g.text).join(''))+'</text>';
      }
      index=end;
    }
    return html;
  }
  function group(items,depth){
    const first=items[0],top=first.y-first.size*.85,maxSize=Math.max(...items.map(g=>g.size));let end=first.x,html='',word=null;
    const sameFace=(a,b)=>a.family===b.family&&a.weight===b.weight&&a.italic===b.italic&&a.size===b.size;
    // Substituted fonts are narrower than rhwp's advances, so the scale comes
    // from the glyph starts. Every glyph is checked at the scale the word gets.
    const wordScale=(word,g)=>{
      if(word.glyphs.length>=64)return null;
      const scale=(g.x-word.first.x)/word.natural,limit=Math.max(.5,g.size*.03);let advance=0;
      for(const item of [...word.glyphs,g]){
        const fitted=Number(item.a.textLength);
        if(Math.abs(item.x-word.first.x-advance*scale)>limit||fitted>0&&Math.abs(fitted-item.natural*scale)>limit)return null;
        advance+=item.natural;
      }
      return scale>0?scale:null;
    };
    const flush=()=>{
      if(!word)return;
      const g=word.first,natural=word.natural;
      const face=sameFace(g,first)?'':';font-family:'+esc(g.family)+';font-size:'+g.size+'px;font-weight:'+g.weight+';font-style:'+g.italic;
      html+='<span style="width:'+fixed(word.w)+'px'+face+'"><span style="transform:scaleX('+fixed(word.w/natural,4)+')">'+esc(word.text)+'</span></span>';
      word=null;
    };
    for(let index=0;index<items.length;index++){
      const g=items[index],next=items[index+1];
      if(next&&next.x>g.x&&next.x<g.x+g.w)g.w=next.x-g.x;
      const gap=Math.max(0,g.x-end);
      const previous=items[index-1],spaces=previous?.source?previous.source.after+(g.source?.before||''):gap>g.size*.2?' ':'';
      // Glyphs of one word share a text node while their original positions
      // stay on the word's scale; a larger drift starts a new span so selection
      // and highlight rectangles remain on the visible glyphs.
      const scale=word&&!spaces&&sameFace(g,word.first)?wordScale(word,g):null;
      if(scale){
        word.glyphs.push(g);word.text+=g.text;word.natural+=g.natural;word.w=word.natural*scale;
      }else{
        flush();
        if(gap>.01||spaces)html+='<span data-rhwp-gap style="width:'+fixed(gap)+'px">'+esc(spaces)+'</span>';
        word={first:g,glyphs:[g],text:g.text,natural:g.natural,w:g.w};
      }
      end=word.first.x+word.w;
    }
    flush();
    const transforms={};for(const key of ['transform','clip-path','mask'])if(first.a[key])transforms[key]=first.a[key];
    const last=items.at(-1).source,ending=last?last.after+(last.paragraphEnd?'\n':''):'\n';
    // rhwp repeats a long font stack on every glyph; the group inherits it once.
    const sharedFamily=first.a['font-family'];
    if(sharedFamily!==undefined)for(const g of items)if(g.a['font-family']===sharedFamily){delete g.a['font-family'];delete g.node[':@']['@_font-family'];}
    return '<g aria-hidden="true" pointer-events="none" style="user-select:none"'+(sharedFamily===undefined?'':attrString('g',{'font-family':sharedFamily}))+'>'+visibleText(items,depth)+'</g><foreignObject'+attrString('foreignObject',transforms)+' x="'+fixed(first.x)+'" y="'+fixed(top)+'" width="'+fixed(Math.max(.1,end-first.x))+'" height="'+fixed(maxSize*1.4)+'" overflow="visible"><p xmlns="http://www.w3.org/1999/xhtml" data-office-text class="rhwp-text" style="margin:0;padding:0;white-space:pre;line-height:1;color:transparent;font-family:'+esc(first.family)+';font-size:'+first.size+'px;font-weight:'+first.weight+';font-style:'+first.italic+'">'+html+esc(ending)+'</p></foreignObject>';
  }
  function children(nodes,depth){
    let result='';
    for(let i=0;i<nodes.length;i++){
      const first=glyph(nodes[i]);if(!first){result+=plain(nodes[i],depth);continue;}
      const items=[first];let last=first;
      while(i+1<nodes.length){
        // XML pretty-printing between SVG glyphs is not document text.
        const blank=tagOf(nodes[i+1])==='#text'&&!String(nodes[i+1]['#text']).trim();
        const next=glyph(nodes[i+(blank?2:1)]||{});
        const sameRun=next?.source&&last.source&&next.source.id===last.source.id;
        if(!next||Math.abs(next.y-first.y)>.1||Math.abs(next.size-first.size)>.1||!sameRun&&next.x-last.x-last.w>first.size*.6||next.x-last.x-last.w<-.5*first.size||['transform','clip-path','mask'].some(k=>next.a[k]!==first.a[k]))break;
        i+=blank?2:1;items.push(next);last=next;
      }
      result+=group(items,depth);
    }
    return result;
  }
  return '<section class="office-page" id="rhwp-page-'+(page+1)+'" data-page-title="'+(page+1)+'쪽" style="width:'+width/16+'em;aspect-ratio:'+width+'/'+height+'"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+width+' '+height+'" width="'+width+'" height="'+height+'">'+children(root.svg,0)+'</svg></section>';
}

export async function renderHangul(bytes,format,warnings,onProgress){
  if(format==='hml')validateHML(bytes);
  globalThis.measureTextWidth=hangulMeasure;
  ready??=init();await ready;
  let doc;
  try{
    doc=new HwpDocument(bytes);
    if(doc.getSourceFormat()!==format)throw Error('파일 확장자와 실제 한글 문서 형식이 다릅니다. 원본을 확인해주세요.');
    const pages=doc.pageCount();if(!pages||pages>10000)throw Error('한글 문서는 1~10,000쪽 범위로 나누어 가져와 주세요.');
    if(format==='hml'){
      const metadata=JSON.parse(doc.getHmlOpenMetadata());
      if(metadata.warnings?.length||metadata.resourceCount)warnings.push('이 HML 문서에는 rhwp가 완전히 표시하지 못하는 요소가 있습니다. 그림·연결 리소스·일부 개체가 생략될 수 있으며 원본 파일은 그대로 보관합니다.');
    }
    const body=[];let size=0;
    for(let page=0;page<pages;page++){
      const html=hangulPage(doc.renderPageSvg(page),page,warnings,hangulMeasure,JSON.parse(doc.getPageTextLayout(page)));size+=html.length;
      if(size>2*1024*1024*1024)throw Error('한글 문서의 읽기 화면이 2GB를 넘습니다. 문서를 나누어 가져와 주세요.');
      body.push(html);onProgress?.(page+1,pages);
    }
    const outline='<template data-ebook-outline>'+body.map((_,i)=>'<a href="#rhwp-page-'+(i+1)+'" data-level="1">'+(i+1)+'쪽</a>').join('')+'</template>';
    return size>=64*1024*1024?new Blob(['<article data-office-pages data-rhwp>',outline,...body,'</article>']):'<article data-office-pages data-rhwp>'+outline+body.join('')+'</article>';
  }finally{doc?.free();}
}
