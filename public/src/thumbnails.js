// Local card previews. Parse stored markup only in an inert template: document
// scripts, frames, stylesheets and remote pictures must never run or be fetched.
export const PREVIEW_WIDTH=320,PREVIEW_HEIGHT=180,PREVIEW_SOURCE_LIMIT=4*1024*1024;
const NS='http://www.w3.org/2000/svg';
const OMIT='script,style,template,title,meta,link,base,noscript,nav,header,footer,aside,button,input,select,textarea,iframe,object,embed,[hidden],[data-htmlmemo-ui],#htmlmemo-annotation-layer';
const INLINE_IMAGE=/^data:image\/(?:png|jpe?g|gif|webp|avif|bmp|svg\+xml)(?:;[^,]*)?,/i;
const aborted=signal=>{if(signal?.aborted)throw new DOMException('Preview cancelled','AbortError');};
function canvas(){const out=document.createElement('canvas');out.width=PREVIEW_WIDTH;out.height=PREVIEW_HEIGHT;return out;}
function jpeg(out){try{return out.toDataURL('image/jpeg',.8);}catch{return '';}finally{out.width=out.height=1;}}
function drawPicture(source,{page=false}={}){
  const width=source.naturalWidth||source.width,height=source.naturalHeight||source.height;
  if(!width||!height)return '';
  const out=canvas(),ctx=out.getContext('2d');if(!ctx)return '';
  ctx.fillStyle=page?'#edf0f4':'#fff';ctx.fillRect(0,0,out.width,out.height);
  const scale=page?Math.min((out.width-12)/width,(out.height-10)/height):Math.max(out.width/width,out.height/height);
  const w=width*scale,h=height*scale,x=(out.width-w)/2,y=(out.height-h)/2;
  if(page){ctx.fillStyle='#fff';ctx.fillRect(x,y,w,h);}
  ctx.drawImage(source,x,y,w,h);return jpeg(out);
}
async function imagePreview(source,{signal,page=false,minSize=false}={}){
  aborted(signal);
  const blob=source instanceof Blob,url=blob?URL.createObjectURL(source):source;
  const img=new Image();img.decoding='async';img.referrerPolicy='no-referrer';
  try{
    await new Promise((resolve,reject)=>{
      const finish=error=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);img.onload=img.onerror=null;error?reject(error):resolve();};
      const cancel=()=>{img.src='';finish(new DOMException('Preview cancelled','AbortError'));};
      const timer=setTimeout(()=>{img.src='';finish(Error('Preview image timed out'));},3000);
      img.onload=()=>finish();img.onerror=()=>finish(Error('Preview image unavailable'));
      signal?.addEventListener('abort',cancel,{once:true});img.src=url;
    });
    aborted(signal);if(img.naturalWidth*img.naturalHeight>40000000||minSize&&(img.naturalWidth<80||img.naturalHeight<45))return '';
    return drawPicture(img,{page});
  }finally{img.src='';if(blob)URL.revokeObjectURL(url);}
}
/** A bounded, inactive fragment, including truncated files whose </body> is far away. */
export function previewContent(html){
  const template=document.createElement('template');template.innerHTML=String(html||'').slice(0,PREVIEW_SOURCE_LIMIT);
  const root=template.content;root.querySelectorAll(OMIT).forEach(node=>node.remove());
  // Accessibility-only text layers can hide the real painted SVG glyphs from
  // assistive technology. Those aria-hidden graphics still belong in a picture.
  root.querySelectorAll('[aria-hidden="true"]').forEach(node=>{if(!node.closest('svg'))node.remove();});
  // Inline hidden banners and old annotation text are not book content.
  root.querySelectorAll('[style]').forEach(node=>{if(/(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\b/i.test(node.getAttribute('style')))node.remove();});
  return root;
}
const words=value=>String(value||'').replace(/\s+/gu,' ').trim();
export function previewText(root){
  const heading=root.querySelector('h1,h2,h3,[data-page-title]');
  const title=words(heading?.textContent||heading?.getAttribute('data-page-title')).slice(0,140);
  const lines=[];let visited=0;
  // Walk a limited prefix. Text nodes preserve ordinary div-based pages too.
  const visit=node=>{
    if(++visited>6000||lines.join('').length>1800)return;
    if(node.nodeType===3){const text=words(node.textContent);if(text)lines.push(text);return;}
    if(node===heading||node.nodeType===1&&node.localName==='svg')return;
    for(const child of node.childNodes||[]){visit(child);if(visited>6000||lines.length>200)break;}
  };
  visit(root);return {title,body:lines.join(' ').slice(0,1800)};
}
function drawText({title,body}){
  if(!title&&!body)return '';
  const out=canvas(),ctx=out.getContext('2d');if(!ctx)return '';
  ctx.fillStyle='#f3f5f8';ctx.fillRect(0,0,320,180);ctx.fillStyle='#fff';ctx.fillRect(12,7,296,173);
  const wrap=(text,x,y,size,color,maxLines)=>{
    ctx.font=(size>13?'600 ':'')+size+'px system-ui, sans-serif';ctx.fillStyle=color;let line='',count=0;
    for(const c of Array.from(text)){
      if(ctx.measureText(line+c).width>264&&line){ctx.fillText(line,x,y);y+=size*1.55;if(++count>=maxLines)return y;line='';}
      line+=c;
    }
    if(line){ctx.fillText(line,x,y);y+=size*1.55;}return y;
  };
  let y=26;if(title)y=wrap(title,28,y,17,'#273348',2)+5;
  wrap(body,28,y,12,'#536176',Math.max(1,Math.floor((174-y)/18.6)));
  return jpeg(out);
}
/** Only static vector artwork; no foreign HTML, CSS URLs, animation or events. */
function safeVector(source){
  const allowed=new Set('svg g a defs path rect circle ellipse polygon polyline line text tspan image use symbol clipPath linearGradient radialGradient stop title desc'.toLowerCase().split(' '));
  const attrs=new Set('xmlns viewbox width height preserveaspectratio d points x y x1 y1 x2 y2 cx cy r rx ry dx dy transform fill fill-rule fill-opacity stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-dasharray opacity text-anchor dominant-baseline font-family font-size font-weight font-style offset stop-color stop-opacity gradientunits gradienttransform clip-path id'.split(' '));
  const copy=(node,depth=0)=>{
    if(node.localName?.toLowerCase()==='foreignobject'){
      const span=node.querySelector('span,p'),style=span?.getAttribute('style')||'',text=words(span?.textContent);
      if(!text||/color\s*:\s*transparent/i.test(style))return null;
      const size=Number(style.match(/font-size\s*:\s*([\d.]+)/i)?.[1])||16,out=document.createElementNS(NS,'text');
      out.setAttribute('x',node.getAttribute('x')||'0');out.setAttribute('y',String((Number(node.getAttribute('y'))||0)+size));out.setAttribute('font-size',String(size));out.setAttribute('fill',style.match(/(?:^|;)\s*color\s*:\s*(#[a-f0-9]{3,8})/i)?.[1]||'#273348');
      out.setAttribute('font-family','sans-serif');if(node.hasAttribute('transform'))out.setAttribute('transform',node.getAttribute('transform'));out.textContent=text.slice(0,1000);return out;
    }
    if(depth>35||!allowed.has(node.localName?.toLowerCase()))return null;
    const out=document.createElementNS(NS,node.localName);
    for(const attr of node.attributes){
      const name=attr.name.toLowerCase(),value=attr.value;
      if(attrs.has(name)&&!/(?:url\(\s*['"]?(?!#)|javascript:|https?:|\/\/)/i.test(value))out.setAttribute(attr.name,value);
      else if((name==='href'||name==='xlink:href')&&(value.startsWith('#')||INLINE_IMAGE.test(value)))out.setAttribute('href',value);
    }
    for(const child of node.childNodes){if(child.nodeType===3)out.append(document.createTextNode(child.textContent));else if(child.nodeType===1){const next=copy(child,depth+1);if(next)out.append(next);}}
    return out;
  };
  const out=copy(source);if(!out)return null;out.setAttribute('xmlns',NS);
  const box=(out.getAttribute('viewBox')||'').trim().split(/[\s,]+/).map(Number);
  if(!out.hasAttribute('width'))out.setAttribute('width',String(box[2]>0?box[2]:800));if(!out.hasAttribute('height'))out.setAttribute('height',String(box[3]>0?box[3]:500));
  return new Blob([new XMLSerializer().serializeToString(out)],{type:'image/svg+xml'});
}
async function htmlPreview(html,{signal,page=false}={}){
  aborted(signal);const root=previewContent(html);
  // Office slides and scanned DjVu pages use SVG as the whole page, including
  // their pictures. Prefer that composition to a logo inside the page.
  const pageVector=root.querySelector('.office-page svg,.office-slide svg,[data-djvu-page] svg');
  if(pageVector&&pageVector.querySelectorAll('*').length<=5000){
    try{const vector=safeVector(pageVector),result=vector&&await imagePreview(vector,{signal,page:true});if(result)return result;}catch(error){if(error.name==='AbortError')throw error;}
  }
  const candidates=[...root.querySelectorAll('img,svg image')].slice(0,24);
  for(const img of candidates){
    aborted(signal);const src=img.getAttribute('src')||img.getAttribute('href')||img.getAttribute('xlink:href');
    if(!INLINE_IMAGE.test(src||'')||src.length>PREVIEW_SOURCE_LIMIT)continue;
    const width=Number(img.getAttribute('width')),height=Number(img.getAttribute('height'));
    if(width&&height&&(width<80||height<45))continue;
    try{const result=await imagePreview(src,{signal,minSize:true,page:page||!!img.closest('[data-djvu-page],.office-page,[id^="ebook-section-"]')});if(result)return result;}catch(error){if(error.name==='AbortError')throw error;}
  }
  for(const svg of [...root.querySelectorAll('svg')].slice(0,4)){
    if(svg===pageVector||svg.querySelectorAll('*').length>5000||!svg.querySelector('path,rect,circle,ellipse,line,polygon,polyline,text,image,use'))continue;
    const vector=safeVector(svg);if(!vector)continue;
    try{const result=await imagePreview(vector,{signal,page:true,minSize:true});if(result)return result;}catch(error){if(error.name==='AbortError')throw error;}
  }
  for(const node of [...root.querySelectorAll('[poster],[style]')].slice(0,24)){
    const source=node.getAttribute('poster')||node.getAttribute('style')?.match(/url\(\s*["']?(data:image\/[^)"']+)["']?\s*\)/i)?.[1];
    if(!INLINE_IMAGE.test(source||'')||source.length>PREVIEW_SOURCE_LIMIT)continue;
    try{const result=await imagePreview(source,{signal,minSize:true});if(result)return result;}catch(error){if(error.name==='AbortError')throw error;}
  }
  return drawText(previewText(root));
}
let pdfLibrary;
async function pdfPreview(file,signal){
  aborted(signal);
  const pdfjs=await(pdfLibrary??=import(new URL('../vendor/pdfjs/pdf.min.mjs',import.meta.url).href).catch(error=>{pdfLibrary=null;throw error;}));
  pdfjs.GlobalWorkerOptions.workerSrc=new URL('../vendor/pdfjs/pdf.worker.min.mjs',import.meta.url).href;
  const {blobRangeSource}=await import('./pdf-reader.js'),assets=new URL('../vendor/pdfjs/',import.meta.url).href;
  let loading,out,render;
  const cancel=()=>{render?.cancel();void loading?.destroy();};signal?.addEventListener('abort',cancel,{once:true});
  try{
    aborted(signal);
    loading=pdfjs.getDocument({...blobRangeSource(pdfjs,file,()=>cancel()),ownerDocument:document,cMapUrl:assets+'cmaps/',cMapPacked:true,standardFontDataUrl:assets+'standard_fonts/',wasmUrl:assets+'wasm/',isEvalSupported:false,enableScripting:false,enableXfa:false,maxImageSize:40000000,verbosity:0});
    loading.onPassword=()=>cancel();
    const pdf=await loading.promise;aborted(signal);const first=await pdf.getPage(1),base=first.getViewport({scale:1});
    const viewport=first.getViewport({scale:Math.min(640/base.width,360/base.height)});
    out=document.createElement('canvas');out.width=Math.ceil(viewport.width);out.height=Math.ceil(viewport.height);
    render=first.render({canvas:out,canvasContext:out.getContext('2d'),viewport,background:'#fff'});await render.promise;aborted(signal);
    return drawPicture(out,{page:true});
  }finally{signal?.removeEventListener('abort',cancel);await loading?.destroy().catch(()=>{});if(out)out.width=out.height=1;}
}
/** Existing prepared reading copies cover Office, ebooks, DjVu, text and subtitles. */
export async function recordThumbnail(record,{signal}={}){
  aborted(signal);
  if(record.metadata?.format==='pdf'&&record.file instanceof Blob)return pdfPreview(record.file,signal);
  if(record.originalFile instanceof Blob&&/^image\//i.test(record.originalFile.type)){
    try{return await imagePreview(record.originalFile,{signal});}catch(error){if(error.name==='AbortError')throw error;}
  }
  const html=typeof record.html==='string'?record.html.slice(0,PREVIEW_SOURCE_LIMIT):record.file instanceof Blob?await record.file.slice(0,PREVIEW_SOURCE_LIMIT).text():'';
  return htmlPreview(html,{signal,page:!!record.metadata?.ebook});
}
