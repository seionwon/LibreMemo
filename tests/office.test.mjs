import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {readFile} from 'node:fs/promises';
import {officeFixtures} from './office-fixtures.mjs';
import {installDOM,documentFor} from './dom.mjs';
import {renderOffice,inspectOfficeZip} from '../public/src/office-render.js';
import {OFFICE_FORMATS,officeFormat,verifyOffice} from '../public/src/office-formats.js';
import {readLocalHTML,droppedHTMLFiles,findLocalDuplicates,localFileIdentity,htmlExportName} from '../public/src/local-files.js';
import {parseHTML,textIndex,wrapOffsets,serializeHTML} from '../public/src/document.js';
import {Reader} from '../public/src/reader.js';
import {documentCopyName} from '../public/src/library-folders.js';
import {APP_FILES} from '../public/src/distribution.js';
installDOM();
const fixtures=await officeFixtures();
for(const format of Object.keys(fixtures))test('GenOffice read-only import: '+format,async()=>{
  const source=new File([fixtures[format]],'sample.'+format),local=await readLocalHTML(source,{identify:false});
  assert.equal(local.originalFile,source);assert.equal(local.handle,null);assert.equal(local.snapshot.office,source);assert.equal(local.snapshot.html,undefined);
  assert.deepEqual(await droppedHTMLFiles({files:[source]}),[source]);assert.equal(htmlExportName(source.name,true),'sample-주석.html');
  const identity=await localFileIdentity(source),record={id:'known',sourceIdentity:identity};assert.deepEqual(await findLocalDuplicates(local,[record],()=>{throw Error('no original reload');}),[record]);
  const rendered=await renderOffice(fixtures[format],format,source.name),parsed=parseHTML(rendered.html,{title:source.name});
  assert.ok(parsed.html.length>500);const doc=documentFor(parsed.html);assert.match(textIndex(doc).text,/본문|한국어/);assert.equal(doc.querySelectorAll('script,object,embed,[contenteditable]').length,0);
  assert.equal(rendered.allowScripts,false);assert.deepEqual(new Uint8Array(await source.arrayBuffer()),new Uint8Array(fixtures[format]));
  assert.match(documentCopyName({id:'known',name:source.name},{name:'a'.repeat(64)+'.'+format}),new RegExp('\\.'+format+'$'));
});
test('Word headings, merged tables and rich text use the common searchable HTML',async()=>{
  const doc=documentFor((await renderOffice(fixtures.docx,'docx','Word')).html);
  assert.equal(doc.querySelector('h1').textContent,'Office 첫 장');assert.equal(doc.querySelector('h2').textContent,'두 번째 절');assert.equal(doc.querySelector('td[colspan="2"]').textContent,'병합 셀');assert.equal(doc.querySelector('[style="font-weight:700"]').textContent,'검색하는 한국어 본문입니다.');
});
test('Slide body text uses HTML spans inside SVG so search and saved highlights survive reopening',async()=>{
  const parsed=parseHTML((await renderOffice(fixtures.pptx,'pptx','Slides')).html),doc=documentFor(parsed.html),index=textIndex(doc),start=index.text.indexOf('검색');assert.ok(start>=0);
  assert.equal(parsed.nativeScroll,true);
  assert.equal(doc.querySelectorAll('.office-slide').length,2);assert.equal(doc.querySelector('.office-slide h2'),null);assert.ok(doc.querySelector('foreignObject [data-office-text]'));
  const outlineFor=d=>Reader.prototype.outline.call({pdf:null,doc:d,slideOutlineTitle:Reader.prototype.slideOutlineTitle}).map(e=>e.title);
  assert.deepEqual(outlineFor(doc),['1/2 슬라이드 검색 본문 1','2/2 슬라이드 검색 본문 2']);
  const odpDoc=documentFor(parseHTML((await renderOffice(fixtures.odp,'odp','ODP')).html).html);
  assert.equal(odpDoc.querySelector('.office-slide h2'),null);assert.deepEqual(outlineFor(odpDoc),['1/1 OpenDocument 슬라이드 본문']);
  const legacyDoc=documentFor('<!doctype html><html><body><article data-office-slides><section class="office-slide" id="office-slide-1"><h2>슬라이드 1</h2><svg viewBox="0 0 960 540"><g transform="translate(48 24)"><foreignObject x="0" y="0"><span data-office-text style="font-size:13px">PART 1</span></foreignObject></g><g transform="translate(48 56)"><foreignObject x="0" y="0"><span data-office-text style="font-size:32px;font-weight:700">바이브 코딩의 핵심</span></foreignObject></g><g transform="translate(48 160)"><foreignObject x="0" y="0"><span data-office-text style="font-size:16px">본문 설명</span></foreignObject></g></svg></section></article></body></html>');
  assert.deepEqual(outlineFor(legacyDoc),['1/1 바이브 코딩의 핵심']);
  const marks=wrapOffsets(doc,start,start+2,{'data-htmlmemo-mark':'slide-highlight'},'background:#ff0',index);assert.ok(marks.length);assert.equal(marks[0].namespaceURI,'http://www.w3.org/1999/xhtml');
  const metadata={...parsed.metadata,annotations:[{id:'m',type:'highlight',color:'#ffee00',opacity:.3,width:2,textAnchor:{start,end:start+2,quote:'검색'}}],bookmarks:[{id:'b',title:'둘째 슬라이드',top:100,left:0}]};
  const restored=parseHTML(serializeHTML(doc,metadata),{}, {includeMetadata:true});assert.deepEqual(restored.metadata.annotations,metadata.annotations);assert.equal(restored.metadata.bookmarks.length,1);assert.match(textIndex(documentFor(restored.html)).text,/슬라이드 검색 본문 2/);
});
test('Spreadsheet values preserve leading zeros, cached formulas, dates, merged cells and every sheet',async()=>{
  for(const format of ['xlsx','xlsm','xls','ods','ots']){
    const doc=documentFor((await renderOffice(fixtures[format],format,format)).html);
    assert.equal(doc.querySelectorAll('.office-sheet').length,2);assert.equal(doc.querySelector('#office-cell-0-B2').textContent,'001');assert.equal(doc.querySelector('#office-cell-0-B3').textContent,'42');assert.equal(doc.querySelector('#office-cell-0-A4').getAttribute('colspan'),'2');assert.match(doc.querySelector('#office-cell-0-B5').textContent,/10\/31\/26/);
  }
  const csv=documentFor((await renderOffice(fixtures.csv,'csv','CSV')).html);assert.equal(csv.querySelector('#office-cell-0-B3').textContent,'=1+1');assert.equal(csv.querySelector('#office-cell-0-A3').textContent,'두 줄\n본문');
});
test('Office text, links and embedded resources cannot become executable or remote requests',async()=>{
  const zip=await JSZip.loadAsync(fixtures.docx),path='word/document.xml';zip.file(path,(await zip.file(path).async('string')).replace('검색하는 한국어 본문입니다.','&lt;img src=x onerror=bad()&gt;'));
  const result=await renderOffice(await zip.generateAsync({type:'uint8array'}),'docx','<script>title</script>'),doc=documentFor(result.html);assert.equal(doc.querySelector('script,img'),null);assert.match(doc.body.textContent,/<img src=x onerror=bad\(\)>/);
  for(const format of ['txt','json'])assert.equal(documentFor((await renderOffice(fixtures[format],format,format)).html).querySelector('script,img'),null);
  assert.equal(officeFormat({name:'macro.exe',type:'text/plain'}),null);
});

test('plain text and JSON retain their whitespace and explicitly participate in the common TTS player',async()=>{
  for(const format of ['txt','json']){
    const doc=documentFor((await renderOffice(fixtures[format],format,format)).html),pre=doc.querySelector('pre.office-plain');
    assert.ok(pre.hasAttribute('data-tts-keep'));assert.equal(pre.textContent,new TextDecoder().decode(fixtures[format]));
  }
});
test('Unsafe XML, archive paths, expansion bombs, empty, encrypted and mismatched files fail before library creation',async()=>{
  for(const [name,value,pattern] of [['word/document.xml','<!DOCTYPE test [<!ENTITY x SYSTEM "https://example.invalid/">]><w:document/>',/엔터티/],['../bad.xml','<x/>',/경로/]]){
    const zip=await JSZip.loadAsync(fixtures.docx);zip.file(name,value);await assert.rejects(renderOffice(await zip.generateAsync({type:'uint8array'}),'docx','bad'),pattern);
  }
  const bomb=new JSZip();bomb.file('large.xml','x'.repeat(65*1024*1024));await assert.rejects(inspectOfficeZip(await bomb.generateAsync({type:'uint8array',compression:'DEFLATE'}),'docx',[]),/limit|exceed/);
  await assert.rejects(verifyOffice(new File([],'empty.docx'),'docx'),/비어/);await assert.rejects(verifyOffice(new File(['not a zip'],'bad.docx'),'docx'),/손상/);
  await assert.rejects(verifyOffice(new File([new Uint8Array([0xd0,0xcf,0x11,0xe0,0xa1,0xb1,0x1a,0xe1])],'locked.docx'),'docx'),/암호/);
});
test('All read-only formats are available in the picker, PWA file handlers and offline assets',async()=>{
  const html=await readFile('public/index.html','utf8'),manifest=JSON.parse(await readFile('public/manifest.webmanifest','utf8')),accepted=Object.values(manifest.file_handlers[0].accept).flat();
  for(const ext of Object.keys(OFFICE_FORMATS)){assert.ok(html.includes('.'+ext));assert.ok(accepted.includes('.'+ext));}
  for(const name of ['office-worker','office-render','office-import','office-word','office-slides','office-sheets','office-common','office-formats'])assert.ok(APP_FILES.includes('src/'+name+'.js'));
  for(const name of ['genoffice.js','sheets.js','GENOFFICE-LICENSE.txt','GENOFFICE-NOTICE.txt','SHEETJS-LICENSE.txt'])assert.ok(APP_FILES.includes('vendor/office/'+name));
});
test('PPTX flipped or 180-degree rotated shapes keep text upright and Korean fonts with digits or latinLnBrk do not overlap characters',async()=>{
  const prevCanvas=globalThis.OffscreenCanvas;
  globalThis.OffscreenCanvas=class{
    getContext(){
      let currentSize=10;
      return {
        fontKerning:'normal',
        set font(value){
          const m=/^(?:italic\s+)?(?:700|400)\s+([\d.]+)px\s+(.+)$/.exec(String(value||'').trim());
          if(!m)return;
          const familyPart=m[2].trim();
          // Simulate browser CSS font shorthand parser rejecting unquoted family tokens starting with digits
          if(!familyPart.startsWith('"')&&/\b\d/.test(familyPart))return;
          currentSize=Number(m[1])||10;
        },
        measureText(text){return {width:[...String(text||'')].length*currentSize*.92};},
      };
    }
  };
  try{
    const zip=await JSZip.loadAsync(fixtures.pptx);
    const slideXml='<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>'
      +'<p:sp><p:nvSpPr><p:cNvPr id="2" name="FlippedBanner"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm flipH="1" flipV="1"><a:off x="914400" y="365760"/><a:ext cx="6400800" cy="685800"/></a:xfrm><a:prstGeom prst="round2SameRect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="E87331"/></a:solidFill></p:spPr><p:txBody><a:bodyPr anchor="ctr"/><a:lstStyle/><a:p><a:r><a:rPr lang="ko-KR" sz="2400" b="1"/><a:t>인터뷰 질문 학습모델 만들기</a:t></a:r></a:p></p:txBody></p:sp>'
      +'<p:sp><p:nvSpPr><p:cNvPr id="3" name="Rotated180Banner"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm rot="10800000"><a:off x="914400" y="1200000"/><a:ext cx="6400800" cy="685800"/></a:xfrm><a:prstGeom prst="round2SameRect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="E87331"/></a:solidFill></p:spPr><p:txBody><a:bodyPr anchor="ctr"/><a:lstStyle/><a:p><a:r><a:rPr lang="ko-KR" sz="2400" b="1"/><a:t>회전 배너 텍스트 정상 표시</a:t></a:r></a:p></p:txBody></p:sp>'
      +'<p:sp><p:nvSpPr><p:cNvPr id="4" name="LessonTitle"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="914400" y="2100000"/><a:ext cx="3657600" cy="1828800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="3D8587"/></a:solidFill></p:spPr><p:txBody><a:bodyPr anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr" latinLnBrk="1"/><a:r><a:rPr lang="ko-KR" sz="3600" b="1" spc="-2500"><a:latin typeface="1훈정글북 R"/><a:ea typeface="에스코어 드림 6 Bold"/></a:rPr><a:t>5교시 텍스트 인식하기</a:t></a:r></a:p></p:txBody></p:sp>'
      +'</p:spTree></p:cSld></p:sld>';
    zip.file('ppt/slides/slide1.xml',slideXml);
    const rendered=await renderOffice(await zip.generateAsync({type:'uint8array'}),'pptx','lesson.pptx');
    const doc=documentFor(parseHTML(rendered.html).html);
    const spans=[...doc.querySelectorAll('#office-slide-1 foreignObject [data-office-text]')];
    const banner1=spans.find(el=>el.textContent.includes('인터뷰 질문 학습모델 만들기'));
    const banner2=spans.find(el=>el.textContent.includes('회전 배너 텍스트 정상 표시'));
    const lesson=spans.find(el=>el.textContent.includes('5교시'));
    assert.ok(banner1);assert.ok(banner2);assert.ok(lesson);
    const chainTransforms=el=>{const out=[];for(let cur=el;cur&&cur.tagName?.toLowerCase()!=='svg';cur=cur.parentElement){const t=cur.getAttribute?.('transform');if(t)out.push(t);}return out.join(' ');};
    assert.doesNotMatch(chainTransforms(banner1),/scale\(-1|rotate\(180/);
    assert.doesNotMatch(chainTransforms(banner2),/scale\(-1|rotate\(180/);
    assert.equal(lesson.textContent,'5교시 텍스트 인식하기');
    assert.match(lesson.getAttribute('style')||'',/font-family:'에스코어 드림 6 Bold',sans-serif/);
  }finally{
    globalThis.OffscreenCanvas=prevCanvas;
  }
});
