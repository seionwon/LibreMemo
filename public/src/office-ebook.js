import {EPUB,MOBI,makeFB2,makeComicBook,InertDOMParser,resourceBlobs,parseCSS,activateEbookDOM} from '../vendor/ebook/foliate.js';
import {esc,safeLink} from './office-common.js';
import {inspectOfficeZip} from './office-render.js';

const MAX_PART=2*1024*1024*1024,MAX_TEXT=2*1024*1024*1024;
const parser=new InertDOMParser();
const imageMimes={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',bmp:'image/bmp',avif:'image/avif',jxl:'image/jxl',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf',css:'text/css'};
function bytes64(bytes){if(typeof bytes.toBase64==='function')return bytes.toBase64();let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);}
export function ebookResourceType(bytes){
  const s=new TextDecoder().decode(bytes.subarray(0,200));
  return bytes[0]===137&&bytes[1]===80?'image/png':bytes[0]===255&&bytes[1]===216?'image/jpeg':s.startsWith('GIF8')?'image/gif':s.startsWith('RIFF')&&s.slice(8,12)==='WEBP'?'image/webp':s.startsWith('BM')?'image/bmp':/<svg[\s>]/i.test(s)?'image/svg+xml':s.startsWith('wOFF')?'font/woff':s.startsWith('wOF2')?'font/woff2':s.startsWith('OTTO')?'font/otf':bytes[0]===0&&bytes[1]===1&&bytes[2]===0&&bytes[3]===0?'font/ttf':'';
}
export function validateMOBI(bytes){
  if(bytes.length<86||new TextDecoder().decode(bytes.subarray(60,68))!=='BOOKMOBI')throw Error('MOBI·AZW3 파일의 형식을 확인하지 못했습니다.');
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),count=v.getUint16(76);
  if(count<2||78+count*8>bytes.length)throw Error('전자책의 레코드 목록이 손상되었습니다.');
  let previous=78+count*8;for(let i=0;i<count;i++){const offset=v.getUint32(78+i*8);if(offset<previous||offset>=bytes.length)throw Error('전자책의 레코드 위치가 올바르지 않습니다.');previous=offset;}
  for(let i=0;i<count;i++){
    const start=v.getUint32(78+i*8),end=i+1<count?v.getUint32(86+i*8):bytes.length;
    // Check both headers in combo MOBI/KF8 files before decompression.
    if(i&&new TextDecoder().decode(bytes.subarray(start+16,start+20))!=='MOBI')continue;
    if(end-start<248||new TextDecoder().decode(bytes.subarray(start+16,start+20))!=='MOBI')throw Error('MOBI 헤더가 손상되었습니다.');
    if(v.getUint16(start+12)!==0)throw Error('DRM·암호로 보호된 전자책은 열 수 없습니다. 보호되지 않은 사본을 가져와 주세요.');
    if(v.getUint32(start+4)>MAX_TEXT||v.getUint16(start+8)>16384)throw Error('전자책 본문이 너무 큽니다.');
  }
}
export function validateFB2(bytes){
  if(bytes.length>MAX_PART)throw Error('FB2 파일은 2GB 이하로 나누어 가져와 주세요.');
  const head=new TextDecoder().decode(bytes.subarray(0,300));
  const encoding=bytes[0]===255&&bytes[1]===254?'utf-16le':bytes[0]===254&&bytes[1]===255?'utf-16be':head.match(/encoding\s*=\s*["']([^"']+)/i)?.[1]||'utf-8';
  let text;try{text=new TextDecoder(encoding,{fatal:true}).decode(bytes);}catch{throw Error('FB2 문자 인코딩을 읽지 못했습니다.');}
  if(/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(text))throw Error('엔터티 선언이 있는 FB2는 열 수 없습니다.');
  if(!/^\s*(?:<\?xml[^?]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)*<FictionBook\b/.test(text))throw Error('FB2의 FictionBook 문서 형식을 확인하지 못했습니다.');
  return new Blob([text.replace(/^\s*<\?xml[^?]*\?>/,'')]);
}
function selectors(text){const out=[];let start=0,depth=0,quote='';for(let i=0;i<text.length;i++){const c=text[i];if(quote){if(c===quote&&text[i-1]!=='\\')quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='('||c==='[')depth++;else if(c===')'||c===']')depth--;else if(c===','&&!depth){out.push(text.slice(start,i));start=i+1;}}out.push(text.slice(start));return out;}
const tags=new Set('a abbr address article aside b bdi bdo blockquote br caption cite code col colgroup dd del details dfn div dl dt em figcaption figure footer h1 h2 h3 h4 h5 h6 header hr i img ins kbd label li main mark nav ol p pre q rp rt ruby s samp section small span strong sub summary sup table tbody td tfoot th thead time tr u ul var wbr svg g defs path rect circle ellipse polygon polyline line text tspan image use symbol clippath lineargradient radialgradient stop title desc math mrow mi mn mo ms mtext mspace mfrac msqrt mroot msub msup msubsup munder mover munderover mtable mtr mtd semantics annotation'.split(' '));
const attrs=new Set('class title lang dir alt width height colspan rowspan scope datetime open start reversed type align valign viewbox preserveaspectratio d points x y x1 y1 x2 y2 cx cy r rx ry dx dy transform fill fill-rule fill-opacity stroke stroke-width stroke-opacity stroke-linecap stroke-linejoin stroke-dasharray opacity text-anchor dominant-baseline font-family font-size font-weight font-style offset stop-color stop-opacity gradientunits gradienttransform clip-path xmlns aria-label'.split(' '));
const voidTags=new Set('br col hr img wbr'.split(' '));
const dropTags=new Set('script iframe object embed template link meta base style form input button textarea select audio video source track foreignobject animate animatemotion animatetransform set'.split(' '));
function htmlNode(node){
  if(node.nodeType===3)return esc(node.textContent);
  if(node.nodeType!==1)return '';
  const tag=node.localName,attrList=node.attributes;
  let open='<'+tag;
  for(let i=0;i<attrList.length;i++){const a=attrList[i];open+=' '+a.name+'="'+esc(a.value)+'"';}
  open+='>';
  if(voidTags.has(tag))return open;
  const children=node.childNodes;let inner='';
  for(let i=0;i<children.length;i++)inner+=htmlNode(children[i]);
  return open+inner+'</'+tag+'>';
}

export async function renderEbook(bytes,format,warnings){
  // All object URLs are private in-memory references owned by this worker.
  // No fetch of document URLs, scripts, or remote resources is performed.
  activateEbookDOM();const persistent=new Set(resourceBlobs.keys());let book;
  try{
    let zip;
    if(['epub','epub3','cbz','fbz','fb2.zip'].includes(format))zip=await inspectOfficeZip(bytes,format,warnings);
    const loader={
      entries:zip?Object.values(zip.files).filter(f=>!f.dir).map(f=>({filename:f.name})):[],
      loadText:async name=>zip.file(name)?.async('string'),
      loadBlob:async name=>{const f=zip.file(name);if(!f)return null;return new Blob([await f.async('uint8array')],{type:imageMimes[name.split('.').at(-1).toLowerCase()]||''});},
      getSize:name=>zip.file(name)?._data?.uncompressedSize||0,
      sha1:async bytes=>new Uint8Array(await crypto.subtle.digest('SHA-1',bytes)),
    };
    if(format==='epub'||format==='epub3'){
      const mimetype=await loader.loadText('mimetype');if(mimetype?.trim()!=='application/epub+zip')throw Error('EPUB 파일의 형식 표지가 올바르지 않습니다.');
      const encryption=await loader.loadText('META-INF/encryption.xml');
      if(encryption){const d=parser.parseFromString(encryption,'application/xml');for(const el of d.querySelectorAll('EncryptionMethod'))if(!['http://www.idpf.org/2008/embedding','http://ns.adobe.com/pdf/enc#RC'].includes(el.getAttribute('Algorithm')))throw Error('DRM·암호로 보호된 EPUB은 열 수 없습니다.');}
      book=await new EPUB(loader).init();
    }else if(format==='cbz')book=makeComicBook(loader,{name:'만화'});
    else if(['fb2','fbz','fb2.zip'].includes(format)){
      if(zip){const files=Object.values(zip.files).filter(f=>!f.dir&&/\.fb2$/i.test(f.name));if(files.length!==1)throw Error('압축 파일 안에 FB2 문서가 하나 있어야 합니다.');bytes=await files[0].async('uint8array');}
      book=await makeFB2(validateFB2(bytes));
    }
    else{
      validateMOBI(bytes);
      book=await new MOBI({unzlib:async data=>{const reader=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate')).getReader(),parts=[];let n=0;try{for(;;){const {done,value}=await reader.read();if(done)break;n+=value.length;if(n>MAX_PART)throw Error('압축된 글꼴이 너무 큽니다.');parts.push(value);}}finally{await reader.cancel();}return new Uint8Array(await new Blob(parts).arrayBuffer());}}).open(new Blob([bytes]));
    }
    if(!book.sections?.length||book.sections.length>10000)throw Error('전자책은 1~10,000개 부분으로 나누어진 파일을 열 수 있습니다.');
    const docs=[],ids=new Map(),idMaps=[],sections=book.sections,sectionById=new Map(),sectionNodes=[],sectionAnchors=[],sectionStyles=[],textUsers=new Map(),blobTexts=new Map();let total=0;
    for(let index=0;index<sections.length;index++){
      if(sections[index].id!==undefined&&!sectionById.has(String(sections[index].id)))sectionById.set(String(sections[index].id),index);
      if(typeof sections[index].load!=='function'&&sections[index].linear==='no'){docs.push(null);idMaps.push(new Map());sectionNodes.push([]);sectionAnchors.push([]);sectionStyles.push([]);continue;}
      const url=await sections[index].load(),blob=resourceBlobs.get(url);
      if(!blob)throw Error('전자책 본문을 읽지 못했습니다.');
      if(blob.size>MAX_PART)throw Error('전자책의 한 부분이 너무 큽니다.');
      const text=await blob.text();total+=blob.size;if(total>MAX_TEXT)throw Error('전자책 읽기 화면이 너무 큽니다.');
      const doc=parser.parseFromString(text,/<html\b[^>]*\bxmlns\s*=\s*["']http:\/\/www\.w3\.org\/1999\/xhtml["']/i.test(text)?'application/xhtml+xml':'text/html');if(!doc.body)throw Error('전자책 본문이 비어 있습니다.');
      docs.push(doc);const map=new Map();idMaps.push(map);let number=0;
      const bodyEl=doc.body,rootEl=doc.documentElement;
      ids.set(bodyEl,'ebook-section-'+index);ids.set(rootEl,'ebook-section-'+index);
      const all=doc.querySelectorAll('*'),bodyNodes=[],anchors=[],styles=[];
      let inBody=false;
      for(let i=0;i<all.length;i++){
        const el=all[i],tag=el.localName.toLowerCase();
        if(el===bodyEl){inBody=true;const bodyName=el.getAttribute('id');if(bodyName&&!map.has(bodyName))map.set(bodyName,'ebook-section-'+index);continue;}
        const name=el.getAttribute('id')||(tag==='a'?el.getAttribute('name'):null);
        if(name){const id=el===rootEl?'ebook-section-'+index:'ebook-'+index+'-'+(++number);ids.set(el,id);if(!map.has(name))map.set(name,id);}
        if(tag==='a'&&el.hasAttribute('href'))anchors.push(el);
        if(tag==='style'||(tag==='link'&&/^stylesheet$/i.test(el.getAttribute('rel')||'')))styles.push(el);
        if(inBody)bodyNodes.push(el);
      }
      if(bodyNodes.length>1000000)throw Error('전자책의 한 부분에 개체가 너무 많습니다.');
      sectionNodes.push(bodyNodes);sectionAnchors.push(anchors);sectionStyles.push(styles);
    }
    const decodeFrag=s=>{try{return decodeURIComponent(s);}catch{return s;}};
    async function target(href,index){
      try{
        if(!href)return null;
        if(href.startsWith('#')&&index!==undefined){
          const frag=href.slice(1),hit=idMaps[index]?.get(frag)||idMaps[index]?.get(decodeFrag(frag));
          if(hit)return '#'+hit;
        }
        const resolved=index!==undefined&&sections[index].resolveHref?sections[index].resolveHref(href):href;
        if(typeof resolved==='string'&&!resolved.startsWith('epubcfi(')&&format!=='fb2'&&format!=='fbz'&&format!=='fb2.zip'){
          const hashIdx=resolved.indexOf('#'),rawPath=hashIdx>=0?resolved.slice(0,hashIdx):resolved,rawHash=hashIdx>=0?resolved.slice(hashIdx+1):'';
          let decodedPath=rawPath;try{decodedPath=decodeURI(rawPath);}catch{}
          const targetIdx=sectionById.get(decodedPath)??sectionById.get(rawPath);
          if(targetIdx!==undefined&&docs[targetIdx]){
            if(!rawHash)return '#ebook-section-'+targetIdx;
            const hit=idMaps[targetIdx].get(rawHash)||idMaps[targetIdx].get(decodeFrag(rawHash));
            if(hit)return '#'+hit;
          }
        }
        const result=await book.resolveHref?.(resolved);if(!result||!docs[result.index])return null;
        const node=result.anchor?.(docs[result.index]);let el=node?.nodeType===1?node:node?.startContainer?.parentElement;
        if(!el)el=docs[result.index].body;
        if(!ids.has(el))ids.set(el,'ebook-'+result.index+'-anchor-'+ids.size);
        return '#'+ids.get(el);
      }catch{return null;}
    }
    const outline=[];
    async function toc(items,level=1){if(level>20)return;for(const item of items||[]){if(outline.length>=50000)throw Error('전자책 목차가 너무 큽니다.');const href=await target(item.href);if(href&&item.label)outline.push({href,title:String(item.label).slice(0,1000),level});await toc(item.subitems,level+1);}}
    await toc(book.toc);
    const links=new Map();
    for(let index=0;index<docs.length;index++)for(const a of sectionAnchors[index]){
      const href=a.getAttribute('href');let dest=await target(href,index);
      if(!dest&&href.startsWith('#'))dest=idMaps[index].has(href.slice(1))?'#'+idMaps[index].get(href.slice(1)):null;
      links.set(a,dest||(!href.startsWith('#')?safeLink(href):null));
    }
    const cached=new Map();let embedded=0;
    async function resource(url,kind='image',depth=0){
      if(!url||depth>12)return null;
      if(url.startsWith('#'))return url;
      if(url.startsWith('data:'))return /^data:(?:image\/(?:png|jpeg|gif|webp|svg\+xml|bmp|avif)|font\/[\w.-]+|application\/(?:font-woff|vnd.ms-fontobject|octet-stream));base64,[a-z\d+/=\s]+$/i.test(url)?url:null;
      if(!resourceBlobs.has(url)){warnings.push('외부 그림·글꼴·미디어는 다운로드하지 않습니다.');return null;}
      if(cached.has(url))return cached.get(url);
      const blob=resourceBlobs.get(url);if(blob.size>MAX_PART)throw Error('전자책의 리소스가 너무 큽니다.');
      // KF8 resource blobs can omit their MIME type. Recognize actual font and
      // image signatures rather than dropping embedded fonts or guessing HTML.
      const data=new Uint8Array(await blob.arrayBuffer());let mime=blob.type.split(';')[0]||ebookResourceType(data);
      if(kind==='image'&&!/^image\/(?:png|jpeg|gif|webp|svg\+xml|bmp|avif|jxl)$/.test(mime))return null;
      if(kind==='font'&&!/^(?:font\/|application\/(?:font|octet-stream|vnd.ms-fontobject))/.test(mime)){warnings.push('표시할 수 없는 글꼴은 기기의 기본 글꼴을 사용합니다.');return null;}
      embedded+=data.length;if(embedded>MAX_TEXT)throw Error('전자책 그림·글꼴 합계가 너무 큽니다.');
      const result='data:'+mime+';base64,'+bytes64(data);cached.set(url,result);return result;
    }
    const declCache=new WeakMap(),sheetCache=new Map(),fontFaces=new Set(),inlineStyleCache=new Map();
    async function declarations(style,index,depth){
      const hit=declCache.get(style);if(hit)return hit;
      let output='',hasLocalUrl=false;
      for(let i=0;i<style.length;i++){
        const prop=style[i];let value=style.getPropertyValue(prop);
        if(!/^[-a-z]+$/.test(prop)||/^(?:behavior|-moz-binding|pointer-events|touch-action|user-select|z-index|content)$/.test(prop)||/\\|expression\s*\(|javascript:|@import|image-set\s*\(/i.test(value)||prop==='position'&&/fixed|sticky/i.test(value))continue;
        let valid=true;
        if(value.includes('url')&&/url\s*\(/i.test(value)){
          const urls=[...value.matchAll(/url\(\s*['"]?([^'"\)]*?)['"]?\s*\)/gi)];
          for(const match of urls){
            const u=match[1].trim();
            if(u.startsWith('#'))hasLocalUrl=true;
            const replacement=u.startsWith('#')?'#'+(idMaps[index].get(u.slice(1))||u.slice(1)):await resource(u,prop==='src'?'font':'image',depth+1);
            if(!replacement){valid=false;break;}
            value=value.replace(match[0],'url("'+replacement+'")');
          }
        }
        if(valid)output+=prop+':'+value+(style.getPropertyPriority(prop)?' !important':'')+';';
      }
      const res={css:output,hasLocalUrl};
      if(!hasLocalUrl)declCache.set(style,res);
      return res;
    }
    async function inlineDeclarations(styleText,index){
      const cacheable=!styleText.includes('#');
      if(cacheable&&inlineStyleCache.has(styleText))return inlineStyleCache.get(styleText);
      let out='';
      try{out=(await declarations(parseCSS('x{'+styleText+'}').cssRules[0].style,index,0)).css;}catch{}
      if(cacheable)inlineStyleCache.set(styleText,out);
      return out;
    }
    async function stylesheet(text,users,depth=0,seen=new Set()){
      if(depth>12||text.length>64*1024*1024)return '';
      let sheet=sheetCache.get(text);
      if(sheet===undefined){
        try{sheet=parseCSS(text);sheetCache.set(text,sheet);}
        catch{sheetCache.set(text,null);warnings.push('해석할 수 없는 전자책 스타일 일부는 기본 모양으로 표시합니다.');return '';}
      }
      if(!sheet)return '';
      let result='';
      const firstScope='#ebook-section-'+users[0],restScope=users.length>1?users.slice(1).map(i=>'#ebook-section-'+i).join(','):'';
      async function rules(list){for(const rule of list){
        if(rule.type===1){
          const rawSel=rule.selectorText||'',hasHash=rawSel.includes('#'),{css:baseDecl,hasLocalUrl}=await declarations(rule.style,users[0],depth);
          if(!hasHash&&!hasLocalUrl){
            const selector=selectors(rawSel).flatMap(s=>{
              s=s.trim().replace(/(^|[\s>+~])(html|body|:root)(?=[\s.#:[>+~]|$)/g,'$1:scope').replace(/:scope\s+(?=:scope)/g,'');
              return /^[.#:\[]/.test(s)&&!s.startsWith(':scope')?[s,':scope'+s]:[s];
            }).join(',');
            if(!/[{}\\]/.test(selector)){
              result+='@scope ('+firstScope+'){'+selector+'{'+baseDecl+'}}';
              if(restScope)result+='@scope ('+restScope+'){'+selector+'{'+baseDecl+'}}';
            }
          }else{
            const refIds=hasHash?[...rawSel.matchAll(/#([\w\u0080-\uffff-]+)/g)].map(m=>m[1]):[];
            for(const idx of users){
              if(idx!==users[0]&&!hasLocalUrl&&!refIds.some(id=>idMaps[idx].has(id)))continue;
              const selector=selectors(rawSel).flatMap(s=>{
                s=s.trim().replace(/#([\w\u0080-\uffff-]+)/g,(m,id)=>idMaps[idx].has(id)?'#'+idMaps[idx].get(id):m).replace(/(^|[\s>+~])(html|body|:root)(?=[\s.#:[>+~]|$)/g,'$1:scope').replace(/:scope\s+(?=:scope)/g,'');
                return /^[.#:\[]/.test(s)&&!s.startsWith(':scope')?[s,':scope'+s]:[s];
              }).join(',');
              if(!/[{}\\]/.test(selector)){
                const decl=hasLocalUrl&&idx!==users[0]?(await declarations(rule.style,idx,depth)).css:baseDecl;
                result+='@scope (#ebook-section-'+idx+'){'+selector+'{'+decl+'}}';
              }
            }
          }
        }
        else if(rule.type===5){
          const face='@font-face{'+(await declarations(rule.style,users[0],depth)).css+'}';
          if(!fontFaces.has(face)){fontFaces.add(face);result+=face;}
        }
        else if(rule.type===3){
          const url=rule.href;
          if(resourceBlobs.has(url)&&!seen.has(url)){
            seen.add(url);
            if(!blobTexts.has(url))blobTexts.set(url,await resourceBlobs.get(url).text());
            result+=await stylesheet(blobTexts.get(url),users,depth+1,seen);
          }
        }
        else if(rule.type===4&&rule.media?.mediaText&&!/[{}\\]/.test(rule.media.mediaText)){result+='@media '+rule.media.mediaText+'{';await rules(rule.cssRules);result+='}';}
      }}await rules(sheet.cssRules);return result.replace(/<\/style/gi,'');
    }
    const styleTexts=Array.from({length:docs.length},()=>[]);
    for(let index=0;index<docs.length;index++){
      for(const el of sectionStyles[index]){
        const href=el.getAttribute('href');
        let text='';
        if(el.localName.toLowerCase()==='style')text=el.textContent;
        else if(resourceBlobs.has(href)){
          if(!blobTexts.has(href))blobTexts.set(href,await resourceBlobs.get(href).text());
          text=blobTexts.get(href);
        }
        el.remove();
        if(!text)continue;
        styleTexts[index].push(text);
        let users=textUsers.get(text);
        if(!users){users=[];textUsers.set(text,users);}
        if(users.at(-1)!==index)users.push(index);
      }
    }
    const emittedSheets=new Set();
    const bodies=[],outlinedSections=new Set(),exactOutlineHrefs=new Map();
    for(const item of outline){
      if(!exactOutlineHrefs.has(item.href))exactOutlineHrefs.set(item.href,item.title);
      const m=/^#ebook(?:-section)?-(\d+)(?:-|$)/.exec(item.href);
      if(m)outlinedSections.add(Number(m[1]));
    }
    let outputBytes=0;
    for(let index=0;index<docs.length;index++){
      const doc=docs[index];if(!doc)continue;
      const viewportAttr=book.rendition?.layout==='pre-paginated'&&format!=='cbz'?doc.querySelector('meta[name=viewport]')?.getAttribute('content')||'':'';
      let css='';
      for(const text of styleTexts[index]){
        if(emittedSheets.has(text))continue;
        emittedSheets.add(text);
        css+=await stylesheet(text,textUsers.get(text)||[index]);
      }
      for(const el of sectionNodes[index]){
        const tag=el.localName.toLowerCase();
        if(dropTags.has(tag)){if(tag==='audio'||tag==='video')warnings.push('전자책의 오디오·영상은 재생하지 않습니다.');el.remove();continue;}
        if(!tags.has(tag)){el.replaceWith(...el.childNodes);continue;}
        const style=el.getAttribute('style');
        const image=(tag==='img'||tag==='image'||tag==='use')?(el.getAttribute(tag==='img'?'src':'href')||el.getAttribute('xlink:href')):null;
        const attrList=el.attributes;
        for(let i=attrList.length-1;i>=0;i--){
          const a=attrList[i];
          if(!attrs.has(a.name.toLowerCase())){el.removeAttribute(a.name);continue;}
          if(a.value.includes('url')&&/url\s*\(/i.test(a.value)){const ref=a.value.match(/^url\(\s*['"]?#([^'"\s)]+)['"]?\s*\)$/i),id=ref&&idMaps[index].get(ref[1]);if(id)el.setAttribute(a.name,'url(#'+id+')');else el.removeAttribute(a.name);}
        }
        if(ids.has(el))el.id=ids.get(el);
        if(style){const inl=await inlineDeclarations(style,index);if(inl)el.setAttribute('style',inl);}
        if(tag==='a'){const href=links.get(el);if(href)el.setAttribute('href',href);}
        if(tag==='img'||tag==='image'){
          const src=await resource(image);if(src)el.setAttribute(tag==='img'?'src':'href',src);else{el.replaceWith(doc.createTextNode(el.getAttribute('alt')||''));warnings.push('표시할 수 없는 그림이 있습니다. 원본 파일은 그대로 보관합니다.');}
        }
        if(tag==='use'){const ref=image||el.getAttribute('href');if(ref?.startsWith('#'))el.setAttribute('href','#'+(idMaps[index].get(ref.slice(1))||''));else el.remove();}
      }
      const id='ebook-section-'+index;
      if(!outlinedSections.has(index)){
        const heading=exactOutlineHrefs.get('#'+id)||doc.body.querySelector('h1,h2,h3')?.textContent.trim()||String(index+1)+'번째 부분';
        outline.push({href:'#'+id,title:heading,level:1});
      }
      const cls=esc((doc.documentElement.getAttribute('class')||'')+' '+(doc.body.getAttribute('class')||'')+(format==='cbz'?' ebook-comic-page':'')),style=doc.body.getAttribute('style');let inline='';if(style)inline=await inlineDeclarations(style,index);
      const bodyChildren=doc.body.childNodes;let innerHTML='';for(let i=0;i<bodyChildren.length;i++)innerHTML+=htmlNode(bodyChildren[i]);
      const content='<section class="ebook-section '+cls+'" id="'+id+'"'+(inline?' style="'+esc(inline)+'"':'')+'>'+innerHTML+'</section>';
      let page=content;
      if(book.rendition?.layout==='pre-paginated'&&format!=='cbz'){
        const dimension=key=>{const n=Number(viewportAttr.match(new RegExp(key+'\\s*=\\s*([\\d.]+)','i'))?.[1]);return Number.isFinite(n)&&n>=100&&n<=10000?n:key==='width'?600:800;},width=dimension('width'),height=dimension('height');
        page='<section class="office-page ebook-fixed-page" style="width:'+(width/16)+'em"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+width+' '+height+'"><foreignObject width="'+width+'" height="'+height+'"><div xmlns="http://www.w3.org/1999/xhtml" data-office-text style="font-size:16px;width:'+width+'px;height:'+height+'px">'+content+'</div></foreignObject></svg></section>';
      }
      if(css&&!css.includes('@scope'))css+='@scope (#'+id+'){}';
      const part=(css?'<style>'+css+'</style>':'')+page;
      outputBytes+=new Blob([part]).size;if(outputBytes>MAX_TEXT)throw Error('전자책 읽기 화면이 너무 큽니다.');bodies.push(part);
    }
    if(format==='cbz')warnings.push('만화 이미지에는 펜·도형·메모·북마크를 사용할 수 있습니다. 이미지 안 글자의 검색·선택·읽어주기는 OCR 없이 제공되지 않습니다.');
    const tocHTML='<template data-ebook-outline>'+outline.map(x=>'<a href="'+esc(x.href)+'" data-level="'+x.level+'">'+esc(x.title)+'</a>').join('')+'</template>';
    const head=tocHTML+'<article data-ebook data-ebook-layout="'+(book.rendition?.layout==='pre-paginated'?'fixed':'reflow')+'" dir="'+(book.dir==='rtl'?'rtl':'ltr')+'">';
    return outputBytes>=64*1024*1024?new Blob([head,...bodies,'</article>']):head+bodies.join('')+'</article>';
  }finally{book?.destroy?.();for(const url of resourceBlobs.keys())if(!persistent.has(url))resourceBlobs.delete(url);}
}
