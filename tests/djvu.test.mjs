import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {deflateSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import init,{WasmDocument,wasmSimd128Supported} from '../public/vendor/djvu/djvu_rs.js';
import {inspectDjvu,djvuTextLayer,renderDjvu} from '../public/src/office-djvu.js';
import {readLocalHTML,droppedHTMLFiles,findLocalDuplicates,localFileIdentity} from '../public/src/local-files.js';
import {parseHTML,textIndex,serializeHTML,wrapOffsets} from '../public/src/document.js';
import {createDocumentArchive,readDocumentArchive} from '../public/src/document-archive.js';
import {APP_FILES} from '../public/src/distribution.js';
import {crc32} from '../public/src/zip.js';
import {installDOM,documentFor} from './dom.mjs';
import {singleDjvu,djvuForm,iffChunk} from './djvu-fixtures.mjs';
installDOM();
const initialize=()=>init(readFile('public/vendor/djvu/'+(wasmSimd128Supported()?'simd128':'scalar')+'/djvu_rs_bg.wasm'));
function chunk(tag,bytes){const size=Buffer.alloc(4),crc=Buffer.alloc(4),data=Buffer.concat([Buffer.from(tag),bytes]);size.writeUInt32BE(bytes.length);crc.writeUInt32BE(crc32(data));return Buffer.concat([size,data,crc]);}
const options={initialize,measure:(text,size)=>Array.from(text).length*size*.6,encode:async(pixels,width,height)=>{
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
  const rows=Buffer.alloc((width*4+1)*height);for(let y=0;y<height;y++)rows.set(pixels.subarray(y*width*4,(y+1)*width*4),y*(width*4+1)+1);
  return new Blob([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))],{type:'image/png'});
}};
test('DjVu/DjV originals use the normal local import, duplicate and file-drop paths',async()=>{
  for(const ext of ['djvu','djv']){const file=new File([await singleDjvu()],'reading.'+ext,{type:'image/vnd.djvu'}),local=await readLocalHTML(file,{identify:false});assert.equal(local.originalFile,file);assert.equal(local.snapshot.office,file);assert.equal(local.snapshot.officeFormat,ext);assert.equal(local.handle,null);assert.deepEqual(await droppedHTMLFiles({files:[file]}),[file]);const record={id:'saved',sourceIdentity:await localFileIdentity(file)};assert.deepEqual(await findLocalDuplicates(local,[record],()=>{throw Error('no read needed');}),[record]);}
  await assert.rejects(readLocalHTML(new File(['<html>bad</html>'],'bad.djvu')),/DjVu/);
});
test('real DjVu WASM renders native pixels, Korean positions and common text anchors into an inert reading copy',async()=>{
  const original=new File([await singleDjvu()],'scan.djvu'),result=await renderDjvu(new Uint8Array(await original.arrayBuffer()),'scan',options),html=await result.file.text(),parsed=parseHTML(html),doc=documentFor(parsed.html),index=textIndex(doc);
  assert.equal(result.allowScripts,false);assert.equal(doc.querySelectorAll('[data-djvu-page]').length,1);assert.equal(doc.querySelector('svg').getAttribute('viewBox'),'0 0 1600 1000');assert.ok(doc.querySelector('svg image').getAttribute('href').startsWith('data:image/png;base64,'));assert.match(index.text,/DjVu 한국어 annotation test/);
  const start=index.text.indexOf('한국어');wrapOffsets(doc,start,start+3,{'data-htmlmemo-mark':'djvu-highlight'},'background:#ff0',index);
  parsed.metadata.annotations=[{id:'djvu-highlight',type:'highlight',color:'#ffee00',opacity:.3,width:2,textAnchor:{start,end:start+3,quote:'한국어'}}];parsed.metadata.bookmarks=[{id:'b1',title:'첫 쪽',top:200,left:0}];
  const reopened=parseHTML(serializeHTML(doc,parsed.metadata));assert.equal(reopened.metadata.annotations.length,1);
  const archive=await createDocumentArchive({original,name:original.name,reading:result.file,metadata:parsed.metadata}),restored=await readDocumentArchive(archive);assert.deepEqual(Buffer.from(await restored.original.arrayBuffer()),Buffer.from(await original.arrayBuffer()));assert.deepEqual(restored.metadata.annotations,parsed.metadata.annotations);assert.equal(restored.metadata.bookmarks.length,1);
});
test('bundled DjVu supplies every page in source order and reports progress',async()=>{
  const bytes=await readFile('tests/fixtures/djvu/bundled.djvu'),progress=[];assert.equal(inspectDjvu(bytes).pages,2);
  const result=await renderDjvu(bytes,'two pages',{...options,onProgress:(...args)=>progress.push(args)}),doc=documentFor(await result.file.text());
  assert.deepEqual([...doc.querySelectorAll('h2')].map(n=>n.textContent),['1쪽','2쪽']);assert.match(textIndex(doc).text,/한국어[\s\S]*Second page/);assert.deepEqual(progress,[[1,2],[2,2]]);
});
test('DjVu IW44 color and JB2 bilevel codecs render in both pinned WASM variants',async()=>{
  await initialize();const scalar=await import('../public/vendor/djvu/scalar/djvu_rs.js');await scalar.default({module_or_path:await readFile('public/vendor/djvu/scalar/djvu_rs_bg.wasm')});
  for(const name of ['photo','bilevel']){
    const bytes=await readFile('tests/fixtures/djvu/'+name+'.djvu');assert.equal(inspectDjvu(bytes).pages,1);assert.ok(bytes.includes(Buffer.from(name==='photo'?'BG44':'Sjbz')));
    const a=WasmDocument.from_bytes(bytes),b=scalar.WasmDocument.from_bytes(bytes),p=a.page(0),q=b.page(0);
    try{const pixels=p.render(100);assert.equal(pixels.length,320*200*4);assert.deepEqual(pixels,q.render(100));assert.ok(new Set(pixels).size>1);}finally{p.free();q.free();a.free();b.free();}
    const result=await renderDjvu(bytes,name,options),doc=documentFor(await result.file.text());assert.equal(doc.querySelector('svg').getAttribute('viewBox'),'0 0 320 200');assert.equal(doc.querySelector('foreignObject'),null);
  }
});
test('DjVu rotated pages align OCR coordinates, and positionless text remains a separate transcript',async()=>{
  const rotated=await renderDjvu(await singleDjvu({rotation:6}),'rotated',options),doc=documentFor(await rotated.file.text());assert.equal(doc.querySelector('svg').getAttribute('viewBox'),'0 0 1000 1600');assert.ok(doc.querySelector('foreignObject'));
  const plain=await renderDjvu(await singleDjvu({plain:true}),'plain',options),p=documentFor(await plain.file.text());assert.equal(p.querySelector('foreignObject'),null);assert.match(p.querySelector('pre').textContent,/한국어/);assert.match(p.body.textContent,/위치가 없습니다/);
});
test('DjVu input checks reject truncated containers, oversized rasters and indirect network references',async()=>{
  const bytes=await singleDjvu();assert.throws(()=>inspectDjvu(bytes.subarray(0,-8)),/길이/);
  const large=Buffer.from(bytes);large.writeUInt16BE(32768,24);large.writeUInt16BE(32768,26);assert.throws(()=>inspectDjvu(large),/화소/);
  const indirect=djvuForm('DJVM',[iffChunk('DIRM',Buffer.from([1,0,1]))]);assert.throws(()=>inspectDjvu(indirect),/단일 파일/);
  const broken=Buffer.from(bytes);broken.writeUInt32BE(0xffffffff,20);assert.throws(()=>inspectDjvu(broken),/내부 길이/);
  const unknown=Buffer.from(bytes);unknown.write('FAIL',12);assert.throws(()=>inspectDjvu(unknown),/올바른 DjVu/);
});
test('DjVu OCR escapes markup and rejects unbounded or non-finite boxes',()=>{
  const zone={t:'<img src=x onerror=alert(1)> & 한글',x:0,y:0,w:100,h:20},html=djvuTextLayer([zone],200,100,()=>100),doc=documentFor('<html><body><svg>'+html+'</svg></body></html>');assert.equal(doc.querySelector('img,script,iframe'),null);assert.match(doc.body.textContent,/<img src=x onerror=alert\(1\)> & 한글/);
  for(const patch of [{w:Infinity},{x:-1},{h:1e8},{t:[]}])assert.throws(()=>djvuTextLayer([{...zone,...patch}],200,100,()=>100),/위치/);
});
test('character-level DjVu OCR keeps source word boundaries for Korean search and TTS',()=>{
  const zones=['한','국','어','문','서'].map((t,i)=>({t,x:i*10,y:0,w:10,h:20})),html=djvuTextLayer(zones,200,100,()=>10,'한국어 문서\n'),doc=documentFor('<html><body><svg>'+html+'</svg></body></html>');assert.equal(textIndex(doc).text,'한국어 문서\n');
});
test('DjVu decoder and its transitive licenses are immutable local offline assets',async()=>{
  const upstream=JSON.parse(await readFile('public/vendor/djvu/UPSTREAM.json','utf8'));assert.equal(upstream.version,'0.43.0');assert.equal(upstream.license,'MIT');
  for(const [name,hash] of Object.entries(upstream.files)){assert.ok(APP_FILES.includes('vendor/djvu/'+name));const data=await readFile('public/vendor/djvu/'+name);assert.equal(createHash('sha256').update(data).digest('hex'),hash);assert.deepEqual(data,await readFile('node_modules/djvu-rs/'+name));}
  assert.ok(APP_FILES.includes('src/office-djvu.js'));assert.match(await readFile('public/vendor/djvu/THIRD_PARTY_NOTICES','utf8'),/Crates \(38\)/);
});
