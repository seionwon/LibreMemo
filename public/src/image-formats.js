// Formats Chrome can display locally, without a server or an extra decoder.
export const IMAGE_MIMES={
  'image/png':['.png','.apng'],'image/jpeg':['.jpg','.jpeg','.jpe','.jfif'],
  'image/webp':['.webp'],'image/avif':['.avif'],'image/gif':['.gif'],
  'image/bmp':['.bmp'],'image/svg+xml':['.svg'],
};
export const IMAGE_EXTENSIONS=Object.values(IMAGE_MIMES).flat().map(ext=>ext.slice(1));
export const IMAGE_MAX_BYTES=50*1024*1024,IMAGE_MAX_PIXELS=40000000,IMAGE_MAX_SIDE=32768;
export function imageType(file){
  const ext=String(file?.name||'').match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  if(ext)return Object.entries(IMAGE_MIMES).find(([,extensions])=>extensions.includes('.'+ext))?.[0]||null;
  const type=String(file?.type||'').split(';')[0].toLowerCase();
  return type==='image/apng'?'image/png':Object.hasOwn(IMAGE_MIMES,type)?type:null;
}
export function imageDimensions(width,height){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1)throw Error('이미지 크기를 확인하지 못했습니다. 원본 파일을 확인해주세요.');
  if(width>IMAGE_MAX_SIDE||height>IMAGE_MAX_SIDE||width*height>IMAGE_MAX_PIXELS)throw Error('이미지는 4천만 화소, 한 변 32,768픽셀 이하로 나누어 가져와 주세요.');
  return {width,height};
}
export function imageFileSize(file){
  if(!file?.size)throw Error('이미지 파일이 비어 있습니다.');
  if(file.size>IMAGE_MAX_BYTES)throw Error('이미지는 파일 하나당 50MB 이하로 가져와 주세요.');
}
export function clipboardImageFile(blob,index=0,now=new Date()){
  const type=blob.type==='image/apng'?'image/png':blob.type,ext=IMAGE_MIMES[type]?.[0];
  if(!ext)return null;
  const pad=value=>String(value).padStart(2,'0'),stamp=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+' '+pad(now.getHours())+'.'+pad(now.getMinutes())+'.'+pad(now.getSeconds());
  return new File([blob],'스크린샷 '+stamp+(index?' ('+(index+1)+')':'')+ext,{type,lastModified:now.getTime()});
}
// Copy the immutable Files synchronously, while the paste event still owns them.
export function pastedImages(transfer,now=new Date()){
  const items=[...(transfer?.items||[])].filter(item=>item.kind==='file');
  const files=items.length?items.map(item=>item.getAsFile?.()).filter(Boolean):[...(transfer?.files||[])];
  return files.map((file,index)=>clipboardImageFile(file,index,now)).filter(Boolean);
}
export function isImagePasteTarget(target){
  const el=target?.nodeType===1?target:target?.parentElement;
  return !el?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]');
}
