// Card pictures from what the reader already shows: an image document's image,
// a PDF's first page, or the first sizeable picture in a page, book or office
// document. Text-only documents keep their format tile. Nothing is fetched.
const WIDTH=320,HEIGHT=180;
const loaded=img=>img&&img.complete&&img.naturalWidth>0&&img.naturalHeight>0?img:null;
function pictureOf(reader){
  const doc=reader.doc;if(!doc)return null;
  if(reader.pdf){
    const first=reader.pdf.slots?.get?.(1)?.image;
    const canvas=first?.canvas?.width>0?first.canvas:null;
    return loaded(first?.image)||canvas||loaded(doc.querySelector('img[data-pdf-raster]'));
  }
  const image=loaded(doc.getElementById('librememo-image'));if(image)return image;
  for(const img of doc.querySelectorAll('img')){
    if(!loaded(img)||img.closest('[data-htmlmemo-ui],nav,header,footer,aside'))continue;
    const ratio=img.naturalWidth/img.naturalHeight;
    if(img.naturalWidth>=160&&img.naturalHeight>=90&&ratio>.33&&ratio<3.5)return img;
  }
  return null;
}
/** Cover-crop to 16:9: pages keep their top (titles), pictures their middle. */
function draw(source,fromTop){
  const width=source.naturalWidth||source.width,height=source.naturalHeight||source.height;
  const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=HEIGHT;
  const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,WIDTH,HEIGHT);
  const scale=Math.max(WIDTH/width,HEIGHT/height),w=width*scale,h=height*scale;
  context.drawImage(source,(WIDTH-w)/2,fromTop?0:(HEIGHT-h)/2,w,h);
  // A remote, non-CORS image taints the canvas; such a document keeps its tile.
  try{return canvas.toDataURL('image/jpeg',.78);}catch{return '';}
}
/** A data URL, or '' when the document has no suitable picture. PDF pages may take a moment to paint. */
export async function documentThumbnail(reader,{wait=6000}={}){
  for(const until=Date.now()+wait;;){
    if(reader.disposed)return null;
    const picture=pictureOf(reader);
    if(picture)return draw(picture,!!reader.pdf);
    if(!reader.pdf&&!reader.doc?.querySelector('img:not([data-htmlmemo-ui] img)')||Date.now()>until)return '';
    await new Promise(resolve=>setTimeout(resolve,400));
  }
}
