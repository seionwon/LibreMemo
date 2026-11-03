import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_READING_LAYOUT,PAGE_BOTTOM,PAGE_TOP,normalizeReadingLayout,pageBreak,pageNumbers,readingLayoutCss} from '../public/src/reading-layout.js';
import {normalizePreferences} from '../public/src/preferences.js';
import {parseHTML,serializeHTML} from '../public/src/document.js';
import {APP_FILES} from '../public/src/distribution.js';
import {installDOM,documentFor} from './dom.mjs';
import {ebookNoteTarget} from '../public/src/reading-layout-panel.js';
installDOM();
test('the default is continuous with margins, and bad stored values cannot escape the ranges',()=>{
  assert.equal(DEFAULT_READING_LAYOUT.flow,'continuous');assert.equal(DEFAULT_READING_LAYOUT.enabled,true);assert.ok(DEFAULT_READING_LAYOUT.margin>0);
  assert.deepEqual(normalizeReadingLayout(null),{...DEFAULT_READING_LAYOUT});
  const bad=normalizeReadingLayout({flow:'spiral',margin:9999,width:1,lineHeight:'x',paragraph:NaN,align:'center;}',hyphens:'yes',enabled:0});
  assert.equal(bad.flow,'continuous');assert.equal(bad.margin,160);assert.equal(bad.width,400);assert.equal(bad.lineHeight,0);assert.equal(bad.align,'original');assert.equal(bad.hyphens,false);assert.equal(bad.enabled,true);
});
test('layout CSS reaches only reflowable books, and turning it off keeps the book layout',()=>{
  const css=readingLayoutCss(normalizeReadingLayout({margin:60,width:600,lineHeight:1.8,paragraph:.8,align:'justify',hyphens:true}));
  assert.match(css,/max-width:720px!important/);assert.match(css,/min\(60px,8vw\)/);assert.match(css,/line-height:1\.8!important/);assert.match(css,/text-align:justify/);assert.match(css,/hyphens:auto/);
  assert.match(css,/:not\(\[data-ebook-layout="fixed"\]\)/);assert.match(css,/:not\(\.ebook-comic-page\)/);
  const off=readingLayoutCss(normalizeReadingLayout({enabled:false}));assert.doesNotMatch(off,/max-width/);assert.match(off,/data-htmlmemo-paged/);
});
test('a page ends above a cut line or at a chapter, and always leaves room to progress',()=>{
  const height=800,limit=height-PAGE_BOTTOM;
  assert.equal(pageBreak({height}),limit);
  assert.equal(pageBreak({height,cut:{top:limit-10,bottom:limit+14}}),limit-10);
  assert.equal(pageBreak({height,cut:{top:limit-10,bottom:limit+14},sectionTop:300}),300);
  assert.equal(pageBreak({height,sectionTop:PAGE_TOP+10}),limit);
  assert.equal(pageBreak({height,cut:{top:PAGE_TOP-5,bottom:limit+100}}),limit);
});
test('page numbers stay in range at both ends of a book',()=>{
  assert.deepEqual(pageNumbers({top:0,contentHeight:7000,pageHeight:700}),{page:1,pages:10,percent:10});
  assert.deepEqual(pageNumbers({top:6300,contentHeight:7000,pageHeight:700}),{page:10,pages:10,percent:100});
  assert.equal(pageNumbers({top:9000,contentHeight:7000,pageHeight:700}).page,10);
});
test('a saved layout survives reopening, preferences and export without leaving page state',()=>{
  const parsed=parseHTML('<!doctype html><html data-htmlmemo-paged><body><article data-ebook><section class="ebook-section"><p>x</p></section></article><div id="htmlmemo-page-top"></div><div id="htmlmemo-page-bottom"></div></body></html>',{title:'b'},{includeMetadata:true});
  parsed.metadata.view.layout={flow:'paged',margin:20};
  const again=parseHTML('<html><body><p>x</p></body></html>',{title:'b',view:parsed.metadata.view});
  assert.ok(again);
  const doc=documentFor(parsed.html),html=serializeHTML(doc,parsed.metadata);
  assert.doesNotMatch(html,/<html[^>]*data-htmlmemo-paged/);assert.doesNotMatch(html,/id="htmlmemo-page-(?:top|bottom)"/);
  assert.equal(normalizePreferences({}).readingLayout.flow,'continuous');assert.equal(normalizePreferences({readingLayout:{flow:'paged'}}).readingLayout.flow,'paged');
  assert.ok(APP_FILES.includes('src/reading-layout.js')&&APP_FILES.includes('src/reading-layout-panel.js'));
});
test('only short note links open as a note; chapters and ordinary links navigate',()=>{
  const doc=documentFor('<html><body><article data-ebook><section class="ebook-section" id="s2"><h2 id="h">장</h2><p><sup><a id="a" href="#n1">1</a></sup> <a id="b" href="#h">다음 장</a> <a id="c" href="#s2">2</a> <a id="d" href="#gone">3</a></p><aside><p id="n1">각주 본문</p></aside></section></article></body></html>');
  assert.deepEqual(ebookNoteTarget(doc,doc.getElementById('a')),{hash:'#n1',text:'각주 본문'});
  for(const id of ['b','c','d'])assert.equal(ebookNoteTarget(doc,doc.getElementById(id)),null);
});

test('auto-scroll pauses on reading input, resumes, changes speed and stops; the bar follows',async()=>{
  const {ReadingPager,AUTO_SCROLL_SPEEDS,autoScrollSpeed,stepAutoScrollSpeed,autoScrollLabel}=await import('../public/src/reading-layout.js');
  assert.equal(autoScrollSpeed(41),40);assert.equal(stepAutoScrollSpeed(40,1),60);assert.equal(stepAutoScrollSpeed(10,-1),10);assert.equal(stepAutoScrollSpeed(160,1),160);assert.equal(autoScrollLabel(40),'5 / '+AUTO_SCROLL_SPEEDS.length);
  let frame=null,scrolled=0,bottom=5000,now=0;const realNow=performance.now;performance.now=()=>now;
  const win={innerHeight:800,innerWidth:1000,requestAnimationFrame:f=>{frame=f;return 1;},cancelAnimationFrame:()=>{frame=null;},scrollBy:(x,y)=>{scrolled+=y;}};
  const article={getBoundingClientRect:()=>({bottom})};
  const doc={defaultView:win,querySelector:()=>article,getSelection:()=>''};
  const changes=[];const reader={doc,host:{hidden:false},tool:'select',readingLayout:()=>({flow:'continuous'}),supportsReadingLayout:()=>true,onAutoScrollChange:()=>changes.push(pager.autoPaused?'paused':pager.autoSpeed?'running':'stopped')};
  const pager=new ReadingPager(reader);pager.article=()=>article;
  const tick=ms=>{for(let left=ms;left>0;left-=100){now+=Math.min(100,left);const f=frame;frame=null;f?.(now);}};
  try{
    assert.equal(pager.startAuto(40),true);tick(1000);assert.equal(scrolled,40);
    pager.wheel({deltaY:10,preventDefault(){}});assert.equal(pager.autoPaused,true);assert.equal(pager.autoSpeed,40,'a wheel pauses, it does not end');
    tick(1000);assert.equal(scrolled,40,'nothing moves while paused');
    pager.toggleAuto();assert.equal(pager.autoPaused,false);tick(16);tick(500);assert.equal(scrolled,60);
    pager.setAutoSpeed(stepAutoScrollSpeed(pager.autoSpeed,1));assert.equal(pager.autoSpeed,60);tick(1000);assert.equal(scrolled,120);
    pager.click({target:null,clientX:500});assert.equal(pager.autoPaused,true,'a click on the page pauses');
    pager.touchStart({touches:[{clientX:1,clientY:1}]});assert.equal(pager.autoPaused,true);
    pager.resumeAuto();reader.host.hidden=true;tick(16);assert.equal(pager.autoPaused,true,'a hidden tab pauses');reader.host.hidden=false;
    pager.stopAuto();assert.equal(pager.autoSpeed,0);assert.equal(pager.resumeAuto(),false);
    assert.deepEqual(changes,['running','paused','running','running','paused','running','paused','stopped']);
    pager.startAuto(40);bottom=700;tick(16);assert.equal(pager.autoSpeed,0,'reaching the end stops');
  }finally{performance.now=realNow;}
});
