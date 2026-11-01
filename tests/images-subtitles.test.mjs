import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {installDOM,documentFor} from './dom.mjs';
import {imageType,imageDimensions,pastedImages,isImagePasteTarget,IMAGE_MIMES} from '../public/src/image-formats.js';
import {inspectImage} from '../public/src/image-document.js';
import {readLocalHTML,droppedHTMLFiles,findLocalDuplicates,localFileIdentity} from '../public/src/local-files.js';
import {parseSubtitles,renderSubtitles} from '../public/src/office-subtitles.js';
import {renderOffice} from '../public/src/office-render.js';
import {parseHTML,serializeHTML,textIndex,wrapOffsets} from '../public/src/document.js';
import {createDocumentArchive,readDocumentArchive} from '../public/src/document-archive.js';
import {APP_FILES} from '../public/src/distribution.js';
installDOM();
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7z8AAAAASUVORK5CYII=','base64');
import {srt,subtitleFixtures} from './image-subtitle-fixtures.mjs';
test('images enter the ordinary read-only import/duplicate/drop path with exact originals',async()=>{
  const file=new File([png],'캡처.png',{type:'image/png'}),local=await readLocalHTML(file,{identify:false});
  assert.equal(local.originalFile,file);assert.equal(local.snapshot.image,file);assert.equal(local.snapshot.html,undefined);assert.equal(local.handle,null);
  assert.equal(await inspectImage(file),'image/png');assert.deepEqual(await droppedHTMLFiles({files:[file]}),[file]);
  const record={id:'known',sourceIdentity:await localFileIdentity(file)};assert.deepEqual(await findLocalDuplicates(local,[record],()=>{throw Error('unnecessary read');}),[record]);
  for(const [type,extensions] of Object.entries(IMAGE_MIMES))for(const ext of extensions)assert.equal(imageType({name:'photo'+ext}),type);
  assert.equal(imageType({name:'bad.exe',type:'image/png'}),null);assert.equal(imageType({name:'photo.heic'}),null);
});
test('image import rejects false extensions, empty files and oversized pixel headers before decoding',async()=>{
  await assert.rejects(inspectImage(new File(['<html>bad</html>'],'bad.png')),/손상/);
  await assert.rejects(inspectImage(new File([],'empty.jpg')),/비어/);
  const huge=Buffer.from(png);huge.writeUInt32BE(100000,16);await assert.rejects(inspectImage(new File([huge],'huge.png')),/화소/);
  assert.throws(()=>imageDimensions(10000,5000),/화소/);assert.throws(()=>imageDimensions(0,100),/크기/);
  assert.deepEqual(imageDimensions(2560,1440),{width:2560,height:1440});
});
test('clipboard acquires screenshot bytes synchronously and leaves editable fields alone',async()=>{
  const file=new File([png],'image.png',{type:'image/png'}),now=new Date(2026,10,1,11,22,33);let called=0;
  const files=pastedImages({items:[{kind:'string'},{kind:'file',getAsFile:()=>{called++;return file;}}]},now);
  assert.equal(called,1);assert.equal(files[0].name,'스크린샷 2026-11-01 11.22.33.png');assert.deepEqual(new Uint8Array(await files[0].arrayBuffer()),new Uint8Array(png));
  assert.deepEqual(pastedImages({files:[new File(['x'],'unsupported.heic',{type:'image/heic'})]}),[]);
  const doc=documentFor('<html><body><input><textarea></textarea><div contenteditable><span>edit</span></div><p>document</p></body></html>');
  for(const node of doc.querySelectorAll('input,textarea,span'))assert.equal(isImagePasteTarget(node),false);assert.equal(isImagePasteTarget(doc.querySelector('p')),true);
});
for(const [format,source] of Object.entries(subtitleFixtures))test('subtitles '+format+' preserve timing, Korean, readonly originals and portable annotations',async()=>{
  const warnings=[],cues=parseSubtitles(source,format,warnings);assert.equal(cues[0].start,1250);assert.equal(cues.at(-1).start,312000);assert.ok(cues[0].text.includes('한국어'));assert.deepEqual(warnings,[]);
  const file=new File([source],'lesson.'+format),local=await readLocalHTML(file,{identify:false});assert.equal(local.originalFile,file);assert.equal(local.snapshot.officeFormat,format);assert.equal(local.handle,null);
  const rendered=await renderOffice(new TextEncoder().encode(source),format,file.name),parsed=parseHTML(rendered.html),doc=documentFor(parsed.html),index=textIndex(doc),start=index.text.indexOf('한국어');
  assert.equal(rendered.allowScripts,false);assert.equal(doc.querySelectorAll('h2').length,2);assert.ok(doc.querySelector('.subtitle-time[data-tts-skip]'));assert.ok(start>=0);
  wrapOffsets(doc,start,start+3,{'data-htmlmemo-mark':'caption'},'background:#ff0',index);
  parsed.metadata.annotations=[{id:'caption',type:'highlight',color:'#ffee00',opacity:.3,width:2,textAnchor:{start,end:start+3,quote:'한국어'}}];parsed.metadata.bookmarks=[{id:'b',title:'두 번째',top:200,left:0}];
  const archive=await createDocumentArchive({original:file,name:file.name,reading:new Blob([parsed.html],{type:'text/html'}),metadata:parsed.metadata}),restored=await readDocumentArchive(archive);
  assert.equal(await restored.original.text(),source);assert.deepEqual(restored.metadata.annotations,parsed.metadata.annotations);assert.equal(restored.metadata.bookmarks.length,1);
  assert.equal(parseHTML(serializeHTML(doc,parsed.metadata),{},{includeMetadata:true}).metadata.annotations.length,1);
});
test('subtitle text, styles and entities never execute or fetch external resources',()=>{
  const hostile='WEBVTT\n\nSTYLE\n::cue { background:url(https://example.invalid/a); }\n\n00:00.000 --> 00:02.000\n<v Person><script>bad()</script><img src=x onerror=bad()>대사 &lt;img src=x&gt; &amp; &#54620;';
  const doc=documentFor('<html><body>'+renderSubtitles(hostile,'vtt')+'</body></html>');assert.equal(doc.querySelector('script,img,style,a,iframe'),null);assert.match(doc.body.textContent,/Person: 대사 <img src=x> & 한/);
  const cues=parseSubtitles(subtitleFixtures.ass,'ass');assert.equal(cues[0].speaker,'강사');assert.match(cues[0].text,/둘째 줄, 쉼표 유지/);assert.doesNotMatch(cues[0].text,/\\b|숨긴/);
  assert.equal(parseSubtitles(subtitleFixtures.smi,'smi')[1].speaker,'English');
});
test('malformed subtitle timing is reported and files without valid cues fail',()=>{
  const warnings=[];assert.equal(parseSubtitles(srt+'\n\n3\n00:99:00,000 --> 00:00:01,000\nbad','srt',warnings).length,2);assert.match(warnings[0],/1개/);
  assert.throws(()=>parseSubtitles('not captions','srt'),/찾지/);assert.throws(()=>parseSubtitles('00:00.000 --> 00:01.000\ntext','vtt'),/시작/);
  const drawing=subtitleFixtures.ass+'\nDialogue: 0,0:06:00.00,0:06:02.00,Default,,0,0,0,,{\\p1}m 0 0 l 10 10';const w=[];assert.equal(parseSubtitles(drawing,'ass',w).length,2);assert.match(w[0],/벡터 그림 1개/);
});
test('subtitle BOM encodings and Korean legacy bytes remain readable',async()=>{
  const utf16=Buffer.concat([Buffer.from([255,254]),Buffer.from(srt,'utf16le')]);assert.match((await renderOffice(utf16,'srt','utf16')).html,/첫 번째 한국어/);
  const legacy=Buffer.concat([Buffer.from('1\n00:00:01,000 --> 00:00:02,000\n'),Buffer.from([0xc7,0xd1,0xb1,0xdb])]);assert.match((await renderOffice(legacy,'srt','legacy')).html,/한글/);
});
test('image/subtitle formats are present in file handlers, picker and offline distribution',async()=>{
  const html=await readFile('public/index.html','utf8'),manifest=JSON.parse(await readFile('public/manifest.webmanifest','utf8')),extensions=Object.values(manifest.file_handlers[0].accept).flat();
  for(const ext of [...Object.values(IMAGE_MIMES).flat(),'.srt','.vtt','.smi','.sami','.ass','.ssa']){assert.ok(html.includes(ext));assert.ok(extensions.includes(ext));}
  for(const name of ['image-formats','image-document','office-subtitles'])assert.ok(APP_FILES.includes('src/'+name+'.js'));
});
