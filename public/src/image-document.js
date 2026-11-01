import {imageType,imageFileSize,imageDimensions} from './image-formats.js';
import {escapeHTML as esc} from './utils.js';

// Check the actual signature before handing a local file to the browser decoder.
// Common large raster headers are bounded before allocating decoded pixels.
export async function inspectImage(file){
  imageFileSize(file);const type=imageType(file);
  const b=new Uint8Array(await file.slice(0,1048576).arrayBuffer()),v=new DataView(b.buffer),text=(at,n)=>String.fromCharCode(...b.subarray(at,at+n));
  let valid=false,width,height;
  if(type==='image/png'){
    valid=b.length>=24&&[137,80,78,71,13,10,26,10].every((x,i)=>x===b[i])&&text(12,4)==='IHDR';
    if(valid){width=v.getUint32(16);height=v.getUint32(20);}
  }else if(type==='image/gif'){
    valid=b.length>=10&&/^GIF8[79]a$/.test(text(0,6));if(valid){width=v.getUint16(6,true);height=v.getUint16(8,true);}
  }else if(type==='image/bmp'){
    valid=b.length>=26&&text(0,2)==='BM';if(valid){if(v.getUint32(14,true)===12){width=v.getUint16(18,true);height=v.getUint16(20,true);}else if(b.length>=26){width=v.getInt32(18,true);height=Math.abs(v.getInt32(22,true));}}
  }else if(type==='image/jpeg'){
    valid=b[0]===255&&b[1]===216&&b[2]===255;
    for(let at=2;valid&&at+9<b.length;){
      if(b[at++]!==255)break;while(b[at]===255)at++;const marker=b[at++];
      if(marker===0xd9||marker===0xda)break;
      const length=v.getUint16(at);if(length<2||at+length>b.length)break;
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){height=v.getUint16(at+3);width=v.getUint16(at+5);break;}at+=length;
    }
  }else if(type==='image/webp'){
    valid=b.length>=30&&text(0,4)==='RIFF'&&text(8,4)==='WEBP';
    if(valid&&text(12,4)==='VP8X'){width=1+b[24]+b[25]*256+b[26]*65536;height=1+b[27]+b[28]*256+b[29]*65536;}
    else if(valid&&text(12,4)==='VP8 '&&text(23,3)==='\x9d\x01\x2a'){width=v.getUint16(26,true)&16383;height=v.getUint16(28,true)&16383;}
    else if(valid&&text(12,4)==='VP8L'&&b[20]===47){const bits=v.getUint32(21,true);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;}
  }else if(type==='image/avif'){
    const length=b.length>=16?v.getUint32(0):0;
    valid=length>=16&&length<=b.length&&text(4,4)==='ftyp'&&Array.from({length:Math.floor((length-8)/4)},(_,i)=>i===1?'':text(8+i*4,4)).some(brand=>brand==='avif'||brand==='avis');
  }else if(type==='image/svg+xml'){
    const raw=await file.text();
    if(/<!\s*(?:DOCTYPE|ENTITY)\b/i.test(raw))throw Error('외부 선언이 포함된 SVG입니다. 자체 포함 SVG나 PNG로 저장한 사본을 가져와 주세요.');
    const doc=new DOMParser().parseFromString(raw,'image/svg+xml'),svg=doc.documentElement;
    valid=svg?.localName==='svg'&&svg.namespaceURI==='http://www.w3.org/2000/svg'&&!doc.querySelector('parsererror');
  }
  if(!valid)throw Error('파일 확장자와 실제 이미지 형식이 다르거나 이미지가 손상되었습니다.');
  if(width!==undefined)imageDimensions(width,height);
  return type;
}
async function decodeImage(blob){
  const url=URL.createObjectURL(blob),image=new Image();
  try{
    await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{image.src='';reject(Error('이미지를 여는 시간이 너무 오래 걸립니다. 다른 사본으로 시도해주세요.'));},20000);image.onload=()=>{clearTimeout(timer);resolve();};image.onerror=()=>{clearTimeout(timer);reject(Error('이 이미지를 표시하지 못했습니다. 파일이 손상되었거나 Chrome에서 지원하지 않는 이미지입니다.'));};image.src=url;});
    return {image,...imageDimensions(image.naturalWidth,image.naturalHeight)};
  }catch(error){image.src='';throw error;}finally{URL.revokeObjectURL(url);}
}
async function frozenImage(blob,width,height){
  // ImageBitmap selects the first frame of an animated source. PNG keeps every
  // original pixel; never use a thumbnail or a reduced-resolution canvas here.
  const bitmap=await createImageBitmap(blob),canvas=document.createElement('canvas');
  try{
    imageDimensions(bitmap.width,bitmap.height);canvas.width=width;canvas.height=height;
    const context=canvas.getContext('2d');if(!context)throw Error('이미지 읽기 화면을 만들지 못했습니다.');context.drawImage(bitmap,0,0,width,height);
    const result=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!result)throw Error('이미지 읽기 화면을 저장하지 못했습니다.');return result;
  }finally{bitmap.close();canvas.width=canvas.height=1;}
}
export async function prepareImage(snapshot){
  const source=snapshot.image,type=await inspectImage(source),typed=source.slice(0,source.size,type);
  const {image,width,height}=await decodeImage(typed);let display=typed;
  try{
    // These formats may animate. Freeze the reading copy so a mark always refers
    // to the same pixels. Keep JPEG/BMP and vector SVG at their native fidelity.
    if(await isAnimated(typed,type))display=await frozenImage(typed,width,height);
    const logicalWidth=Math.max(320,Math.min(4096,width)),title=snapshot.title||source.name||'이미지';
    const parts=[`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title><style>html,body{margin:0;padding:0}body{font:18px/1.5 system-ui,sans-serif}article[data-librememo-image]{width:${logicalWidth}px;max-width:100%;margin:0 auto}article[data-librememo-image]>img{display:block;width:100%;height:auto;max-width:none;user-select:none;-webkit-user-drag:none}</style></head><body><article data-librememo-image><img id="librememo-image" alt="${esc(title)}" width="${width}" height="${height}" draggable="false" src="data:${display.type};base64,`];
    for(let offset=0;offset<display.size;offset+=196608){const bytes=new Uint8Array(await display.slice(offset,offset+196608).arrayBuffer());let raw='';for(let i=0;i<bytes.length;i+=8192)raw+=String.fromCharCode(...bytes.subarray(i,i+8192));parts.push(new Blob([btoa(raw)]));}
    parts.push('"></article></body></html>');
    return {file:new Blob(parts,{type:'text/html;charset=utf-8'}),title,viewport:{width:logicalWidth,height:800},allowScripts:false};
  }finally{image.src='';}
}
async function hasPNGAnimation(blob){
  // PNG chunks preceding IDAT are tiny in ordinary screenshots; read only their
  // headers and skip payloads, including large color profiles or metadata.
  let count=0;for(let at=8;at+12<=blob.size;){if(++count>10000)throw Error('이미지의 관리 정보가 너무 많습니다. PNG 사본으로 다시 저장해주세요.');const b=new Uint8Array(await blob.slice(at,at+8).arrayBuffer()),type=String.fromCharCode(...b.subarray(4)),length=new DataView(b.buffer).getUint32(0);if(type==='acTL')return true;if(type==='IDAT'||type==='IEND')return false;if(at+12+length>blob.size)break;at+=12+length;}return false;
}
async function isAnimated(blob,type){
  if(type==='image/gif')return true;if(type==='image/png')return hasPNGAnimation(blob);
  if(type==='image/webp'){const b=new Uint8Array(await blob.slice(0,21).arrayBuffer());return String.fromCharCode(...b.subarray(12,16))==='VP8X'&&!!(b[20]&2);}
  if(type==='image/avif'){const b=new Uint8Array(await blob.slice(0,1048576).arrayBuffer()),length=new DataView(b.buffer).getUint32(0);for(let at=8;at<length;at+=4)if(at!==12&&String.fromCharCode(...b.subarray(at,at+4))==='avis')return true;}
  return false;
}
