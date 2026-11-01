import init,{WasmDocument} from '../vendor/djvu/djvu_rs.js';
import {esc,OFFICE_STYLE} from './office-common.js';

export const DJVU_MAX_PAGES=10000,DJVU_MAX_PIXELS=40000000,DJVU_MAX_OUTPUT=2*1024*1024*1024;
const decoder=new TextDecoder('ascii');let ready;
function pageSize(width,height){
  if(![width,height].every(n=>Number.isInteger(n)&&n>0&&n<=32768)||width*height>DJVU_MAX_PIXELS)throw Error('DjVu 한 쪽은 4천만 화소, 한 변 32,768픽셀 이하여야 합니다. 원본을 나누거나 해상도를 낮춘 사본을 가져와 주세요.');
}
// Inspect the bounded IFF containers before allowing a decoder allocation.
// An indirect DJVM names other files; never resolve those names as network URLs.
export function inspectDjvu(input){
  const b=input instanceof Uint8Array?input:new Uint8Array(input),v=new DataView(b.buffer,b.byteOffset,b.byteLength),word=(at)=>decoder.decode(b.subarray(at,at+4));
  if(b.length<16||word(0)!=='AT&T'||word(4)!=='FORM'||!['DJVU','DJVM','PM44','BM44'].includes(word(12)))throw Error('올바른 DjVu 파일이 아니거나 파일이 손상되었습니다.');
  if(b.length>1024*1024*1024)throw Error('DjVu 파일은 1GB 이하로 나누어 가져와 주세요.');
  let count=0,chunks=0;
  function scan(start,end,depth){
    if(depth>32)throw Error('DjVu 내부 구조가 너무 깊습니다.');
    for(let at=start;at<end;){
      if(++chunks>1000000||at+8>end)throw Error('DjVu 내부 구조가 손상되었거나 너무 복잡합니다.');
      const tag=word(at),size=v.getUint32(at+4),body=at+8,next=body+size;
      if(next>end)throw Error('DjVu 파일의 끝부분이 없거나 내부 길이가 잘못되었습니다.');
      if(tag==='FORM'){
        if(size<4)throw Error('DjVu 내부 문서 형식이 손상되었습니다.');
        const kind=word(body);
        if(['DJVU','PM44','BM44'].includes(kind)&&++count>DJVU_MAX_PAGES)throw Error('DjVu 문서는 10,000쪽 이하로 나누어 가져와 주세요.');
        scan(body+4,next,depth+1);
      }else if(tag==='DIRM'){
        if(size<3)throw Error('DjVu 쪽 목록이 손상되었습니다.');
        if(!(b[body]&128))throw Error('여러 파일로 나뉜 DjVu입니다. 모든 쪽을 포함한 단일 파일(bundled DjVu)로 저장한 뒤 가져와 주세요.');
        if(v.getUint16(body+1)>65000)throw Error('DjVu 구성 파일이 너무 많습니다.');
      }else if(tag==='INFO'){
        if(size<5)throw Error('DjVu 쪽 크기 정보가 손상되었습니다.');
        pageSize(v.getUint16(body),v.getUint16(body+2));
      }else if(['TXTa','TXTz','ANTa','ANTz','NAVM'].includes(tag)&&size>128*1024*1024)throw Error('DjVu의 문자·목차 정보가 너무 큽니다.');
      at=next+(size&1);if(at>end&&next!==end)throw Error('DjVu 내부 정렬 정보가 손상되었습니다.');
    }
  }
  const end=12+v.getUint32(8);if(end!==b.length&&!(end+1===b.length&&(end&1)))throw Error('DjVu 전체 파일 길이가 맞지 않습니다.');
  scan(4,end,0);return {pages:count};
}
export function djvuTextLayer(zones,width,height,measure,plain=''){
  if(!Array.isArray(zones)||zones.length>500000)throw Error('DjVu 한 쪽의 문자 위치 정보가 너무 큽니다.');
  let cursor=0,chars=0,locate=!!plain;
  const offsets=zones.map(z=>{const at=locate&&typeof z?.t==='string'?plain.indexOf(z.t,cursor):-1;if(at>=0)cursor=at+z.t.length;else locate=false;return at;});
  return zones.map((z,i)=>{
    if(typeof z?.t!=='string'||!['x','y','w','h'].every(k=>Number.isFinite(z[k])&&z[k]>=0)||z.x>width||z.y>height||z.w>width||z.h>height)throw Error('DjVu의 문자 위치가 올바르지 않습니다.');
    if(!z.t.trim()||!z.w||!z.h)return '';
    chars+=z.t.length;if(chars>5000000)throw Error('DjVu 한 쪽의 문자가 너무 많습니다.');
    const text=z.t.replace(/\s+/gu,' '),size=z.h,natural=measure(text,size),scale=z.w/Math.max(.1,natural);
    if(!Number.isFinite(scale)||scale<=0)throw Error('DjVu의 문자 폭을 표시하지 못했습니다.');
    const next=zones[i+1],newline=!next||Math.abs(next.y-z.y)>Math.max(z.h,next.h)*.5;
    let separator=newline?'\n':next.x-z.x-z.w>Math.min(z.h,next.h)*.15?' ':'';
    // Leaf zones can be individual characters. Prefer the source text's exact
    // word boundaries; inserting a space after every leaf breaks Korean search.
    if(offsets[i]>=0&&(!next||offsets[i+1]>=0)){
      const gap=plain.slice(offsets[i]+z.t.length,next?offsets[i+1]:plain.length);
      if(/^\s*$/u.test(gap))separator=/[\r\n\v\f\u2028\u2029]/u.test(gap)?'\n':gap?' ':'';
    }
    return '<foreignObject x="'+z.x+'" y="'+z.y+'" width="'+z.w+'" height="'+z.h+'" overflow="visible"><p xmlns="http://www.w3.org/1999/xhtml" data-office-text class="djvu-text" style="margin:0;padding:0;white-space:pre;line-height:1;color:transparent;font-size:'+size+'px;font-family:sans-serif;transform-origin:0 0;transform:scaleX('+scale+')">'+esc(text)+separator+'</p></foreignObject>';
  }).join('');
}
async function pngParts(blob){
  const parts=[];
  for(let offset=0;offset<blob.size;offset+=196608){const bytes=new Uint8Array(await blob.slice(offset,offset+196608).arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));parts.push(new Blob([btoa(raw)]));}
  return parts;
}
export async function renderDjvu(bytes,title,{initialize=()=>ready??=init(),encode,measure,onProgress=()=>{}}={}){
  inspectDjvu(bytes);await initialize();let doc,canvas,context,useWebp=false;
  const customEncode=!!encode;
  if(!encode){canvas=new OffscreenCanvas(1,1);context=canvas.getContext('2d');if(!context)throw Error('DjVu 읽기 화면을 만들지 못했습니다.');encode=async(pixels,w,h)=>{canvas.width=w;canvas.height=h;context.putImageData(new ImageData(pixels,w,h),0,0);return canvas.convertToBlob(useWebp?{type:'image/webp',quality:0.82}:{type:'image/png'});};}
  measure??=(text,size)=>{context.font=size+'px sans-serif';return context.measureText(text).width;};
  const parts=['<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>'+OFFICE_STYLE+'.djvu-scan{position:relative}.djvu-scan>svg{display:block;width:100%;height:auto;pointer-events:none;background:#fff}.djvu-text{pointer-events:auto;user-select:text}.djvu-text::selection,.djvu-text *::selection{color:transparent;background:#a9cafa80}</style></head><body><main data-tts-root><article data-office-pages data-djvu>'];
  let total=0;
  try{
    doc=WasmDocument.from_bytes(bytes);const count=doc.page_count();
    if(!count||count>DJVU_MAX_PAGES)throw Error('DjVu 문서는 1~10,000쪽 범위로 나누어 가져와 주세요.');
    useWebp=!customEncode&&count>10;
    const maxRenderPixels=!customEncode&&count>10?(count>200?1600000:count>50?2200000:3200000):DJVU_MAX_PIXELS;
    for(let i=0;i<count;i++){
      let page;
      try{
        page=doc.page(i);const dpi=page.dpi(),width=page.width_at(dpi),height=page.height_at(dpi);pageSize(width,height);
        const renderDpi=width*height>maxRenderPixels?Math.max(72,Math.floor(dpi*Math.sqrt(maxRenderPixels/(width*height)))):dpi;
        const rw=renderDpi===dpi?width:page.width_at(renderDpi),rh=renderDpi===dpi?height:page.height_at(renderDpi);
        const pixels=page.render(renderDpi);if(pixels.length!==rw*rh*4)throw Error('DjVu 쪽의 이미지 크기가 맞지 않습니다.');
        const png=await encode(pixels,rw,rh);total+=Math.ceil(png.size/3)*4;
        if(total>DJVU_MAX_OUTPUT)throw Error('DjVu 읽기 화면이 2GB를 넘습니다. 문서를 나누어 가져와 주세요.');
        const raw=page.text_zones_json(dpi),plain=page.text()||'';
        if(plain.length>5000000)throw Error('DjVu 한 쪽의 문자가 너무 많습니다.');
        const zones=raw?JSON.parse(raw):[],overlay=djvuTextLayer(zones,width,height,measure,plain);
        // Position-less text remains accessible as a separate transcript. Do not
        // invent OCR rectangles over the image when the file supplies none.
        const transcript=!overlay&&plain.trim()?'<p class="office-note" data-tts-skip>이 쪽의 문자 정보 · 원본에 글자별 위치가 없습니다.</p><pre class="office-plain">'+esc(plain)+'</pre>':'';
        const logicalWidth=Math.max(320,Math.min(1600,width*96/Math.max(25,dpi)));
        const mime=png.type==='image/webp'?'image/webp':'image/png';
        parts.push('<section class="office-page" style="width:'+logicalWidth/16+'em"><h2 id="djvu-page-'+(i+1)+'">'+(i+1)+'쪽</h2><div class="djvu-scan" data-djvu-page="'+(i+1)+'"><svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'"><image width="'+width+'" height="'+height+'" href="data:'+mime+';base64,',...await pngParts(png),'"/>'+overlay+'</svg></div>'+transcript+'</section>');
        total+=overlay.length+transcript.length;if(total>DJVU_MAX_OUTPUT)throw Error('DjVu 읽기 화면이 2GB를 넘습니다. 문서를 나누어 가져와 주세요.');
        onProgress(i+1,count);
      }finally{page?.free();}
    }
    parts.push('</article></main></body></html>');
    return {file:new Blob(parts,{type:'text/html;charset=utf-8'}),title,viewport:{width:1100,height:800},warnings:[],allowScripts:false};
  }finally{doc?.free();if(canvas)canvas.width=canvas.height=1;}
}
