import test from 'node:test';
import assert from 'node:assert/strict';
import {documentFor} from './dom.mjs';
import {excerptMarkdown, openDocumentExport} from '../public/src/document-export.js';
import {Reader} from '../public/src/reader.js';

const group = (title, annotations, children = []) => ({id:title, title, annotations, children});
const mark = (id, type, quote, start) => ({id, type, color:'#fde047',textAnchor:{quote,start,end:start+quote.length}});
const textFixture = () => {
  const early = mark('early', 'highlight', '첫 문장\n다음 줄', 3);
  const later = {...mark('later', 'note', '간격 *실험*', 95),text:'다시 [질문](example)\n# 태그\n<img src=x>'};
  const drawing = {id:'draw',type:'pen',anchorTarget:{quote:'그림 뒤의 추정 문구'}};
  const end = {id:'end',type:'text',text:'마지막 메모'};
  const notes = [later, end, drawing, early];
  return {
    metadata:{title:'책',annotations:notes,bookmarks:[]},
    annotationTree:() => [group('1부',[],[group('첫 절',[later,drawing,early]),group('둘째 절',[end])])],
    annotationContexts:() => new Map([['draw',{quote:'그림 뒤의 추정 문구',heading:'첫 절'}]])
  };
};

test('Markdown excerpts retain the real heading path, paragraph order, marked text and author comment', () => {
  const r = textFixture(), original = structuredClone(r.metadata);
  const text = excerptMarkdown(r, '위치 # 독서\n노트');
  assert.ok(text.startsWith('# 위치 # 독서 노트\n\n## 1부 › 첫 절\n'));
  assert.ok(text.includes('> 첫 문장\n> 다음 줄'));
  assert.ok(text.includes('> 간격 \\*실험\\*'));
  assert.ok(text.includes('다시 \\[질문\\](example)\n\\# 태그\n&lt;img src=x&gt;'));
  assert.ok(text.indexOf('첫 문장') < text.indexOf('간격'));
  assert.ok(text.indexOf('간격') < text.indexOf('다시'));
  assert.ok(text.indexOf('다시') < text.indexOf('## 1부 › 둘째 절'));
  assert.ok(text.endsWith('마지막 메모\n'));
  assert.ok(!text.includes('추정 문구'));
  assert.deepEqual(r.metadata, original, 'exporting must not reorder or edit annotations');
  assert.equal(excerptMarkdown({metadata:{annotations:[{type:'pen',anchorTarget:{quote:'뒤에 있는 글'}}]}}), '');
});

test('PDF text marks sort by their first page rectangle and identify multi-page excerpts', () => {
  const above = {...mark('a','underline','위 문장',1000),pdfPage:2,pdfRects:[{page:2,y:.2}]};
  const across = {...mark('b','highlight','두 쪽에 걸침',10),pdfPage:2,pdfRects:[{page:2,y:.8},{page:3,y:.02}]};
  const r = {metadata:{title:'논문',annotations:[across,above]},annotationTree:() => [group('결과',[],[group('2쪽',[across,above])])]};
  const text = excerptMarkdown(r);
  assert.ok(text.includes('## 결과 › 2쪽'));
  assert.ok(text.indexOf('위 문장') < text.indexOf('2–3쪽'));
  assert.ok(text.includes('2–3쪽\n\n> 두 쪽에 걸침'));
});

test('scene memos and highlights on a subtitle preserve their own timestamp and canonical video link', () => {
  const videoId = 'M7lc1UVf-VE';
  const note = seconds => ({id:'scene'+seconds,type:'note',text:'장면 '+seconds,videoAnchor:{videoId,seconds}});
  const caption = mark('caption','highlight','자막 문장',30);
  const notes = [note(125),note(0),caption];
  const doc = documentFor('<html><body><section class="subtitle-cue"><span class="subtitle-time">00:00:12.500 --> 00:00:16.000</span><span class="subtitle-text" data-htmlmemo-mark data-htmlmemo-id="caption">자막 문장</span></section></body></html>');
  const reader = {doc,metadata:{title:'강의',youtube:{videoId},annotations:notes},
    headingContexts:() => ({outline:[],paths:[]}),drawingTargetContext:() => null,
    annotationContexts: Reader.prototype.annotationContexts,
    annotationTree:() => [group('장면 메모',notes.slice(0,2)),group('자막',[caption])]};
  assert.equal(reader.annotationContexts().get('caption').videoSeconds, 12);
  const text = excerptMarkdown(reader);
  for (const [stamp,seconds] of [['0:00',0],['2:05',125],['0:12',12]]) {
    assert.ok(text.includes('[' + stamp + '](https://www.youtube.com/watch?v=' + videoId + '&t=' + seconds + 's)'));
  }
  assert.ok(text.indexOf('장면 0') < text.indexOf('장면 125'));
  assert.ok(text.includes('> 자막 문장'));
});

test('the export dialog copies while the separate file export is pending, and offers the same selectable text when denied', async t => {
  const doc = documentFor('<html><body><dialog open></dialog></body></html>');
  const dialog = doc.querySelector('dialog');
  dialog.open = true;
  const tab = {reader:textFixture(),record:{id:'stored-file',title:'검토',name:'검토.html'}};
  let rejectFile;
  const filePending = new Promise((resolve,reject) => {rejectFile = reject;});
  const modal = (html, ready) => {dialog.innerHTML = html; ready(dialog);};
  const expected = excerptMarkdown(tab.reader, tab.record.title);
  let written, refused = false;
  const originalNavigator = Object.getOwnPropertyDescriptor(globalThis,'navigator');
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{async writeText(text) {
    if (refused) throw new Error('clipboard unavailable');
    written = text;
  }}}});
  t.after(() => {if(originalNavigator)Object.defineProperty(globalThis,'navigator',originalNavigator);else delete globalThis.navigator;});
  openDocumentExport(tab,{modal,getDocument:() => filePending});
  await Promise.resolve();
  const copy = dialog.querySelector('[data-excerpt-copy]'), manual = dialog.querySelector('[data-excerpt-manual]');
  let selections = 0;
  manual.select = () => selections++;
  assert.equal(copy.disabled, false);
  await copy.onclick();
  assert.equal(written, expected);
  assert.match(dialog.querySelector('[data-excerpt-status]').textContent, /복사했습니다/);
  assert.ok(dialog.open && manual.hidden);
  refused = true;
  await copy.onclick();
  assert.equal(manual.value, expected); assert.equal(manual.hidden, false); assert.equal(selections, 1);
  assert.equal(copy.disabled, false); assert.equal(dialog.querySelector('[data-export-save]').disabled, true);
  rejectFile(new Error('원본 자료를 불러올 수 없습니다.')); await new Promise(resolve => setImmediate(resolve));
  assert.match(dialog.querySelector('[data-export-error]').textContent, /원본 자료를 불러올 수 없습니다/);
  assert.equal(copy.disabled, false); assert.equal(dialog.querySelector('[data-export-save]').disabled, true);
  tab.reader = {metadata:{bookmarks:[],annotations:[]}};
  openDocumentExport(tab,{modal,getDocument:async () => ({name:'검토.html',originalFile:new Blob(['원본'])})});
  await Promise.resolve();
  assert.equal(dialog.querySelector('[data-excerpt-copy]').disabled,true);
  assert.match(dialog.querySelector('[data-excerpt-status]').textContent, /복사할 문장이나 메모가 없습니다/);
  assert.equal(dialog.querySelector('[data-export-save]').disabled, false);
  assert.doesNotMatch(dialog.querySelector('[data-export-warning]').textContent, /원본 바이트를 보관하지/);
});

test('file export preserves the stored-original warning for PDF and refuses a removed document', async () => {
  const doc = documentFor('<html><body><dialog open></dialog></body></html>');
  const dialog = doc.querySelector('dialog');
  dialog.open = true;
  const tab = {reader:{...textFixture(),pdf:{}},record:{id:'stored-file',title:'검토',name:'검토.pdf'}};
  const modal = (html, ready) => {dialog.innerHTML = html; ready(dialog);};
  openDocumentExport(tab,{modal,getDocument:async () => ({name:'검토.pdf',originalExact:false})});
  await Promise.resolve();
  assert.match(dialog.querySelector('[data-export-warning]').textContent, /원본 바이트를 보관하지/);
  assert.equal(dialog.querySelector('[data-export-save]').disabled, false);
  openDocumentExport(tab,{modal,getDocument:async () => ({trashedAt:1})});
  await new Promise(resolve => setImmediate(resolve));
  assert.match(dialog.querySelector('[data-export-error]').textContent, /삭제되었거나 이동/);
  assert.equal(dialog.querySelector('[data-export-save]').disabled, true);
});
