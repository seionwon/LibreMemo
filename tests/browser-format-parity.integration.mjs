import {revealAppOutline,revealDocumentControl,clickDocumentControl} from './document-controls.mjs';
// Shared UI and user actions through the shipped app, in CI/trusted Chrome only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {root,prepareAssets,packageAssets} from '../scripts/assets.mjs';
import {pwaEntries} from '../public/src/distribution.js';
import {createServer} from '../scripts/server.mjs';
import {launchChrome,clickLibraryImport} from './chrome.mjs';
import {officeFixtures} from './office-fixtures.mjs';
import {ebookFixtures,ebookZip,epubParts} from './ebook-fixtures.mjs';
import {DOCUMENT_EXTENSIONS} from '../public/src/office-formats.js';
import {IMAGE_EXTENSIONS} from '../public/src/image-formats.js';
import {mediaFixtures} from './media-fixtures.mjs';

const host='document.querySelector(".document-host:not([hidden])")',frame=host+'.querySelector("iframe")',doc=frame+'.contentDocument';
const bar=host+'.querySelector("[data-htmlmemo-reading-controls]")';
const control=action=>'.document-host:not([hidden]) [data-action="'+action+'"]';
async function environment(){
  await prepareAssets();const folder=await mkdtemp(join(tmpdir(),'librememo-format-parity-'));
  for(const entry of pwaEntries(await packageAssets())){const path=join(folder,entry.name);await mkdir(join(path,'..'),{recursive:true});await writeFile(path,entry.data);}
  const server=createServer(folder);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {url:process.env.HTMLMEMO_SIDEBAR_TEST_URL||`http://127.0.0.1:${server.address().port}/`,async close(){await new Promise(resolve=>server.close(resolve));await rm(folder,{recursive:true,force:true});}};
}
async function chooseFile(page,bytes,name){
  await page.evaluate(`(async()=>{const root=await navigator.storage.getDirectory(),folder=await root.getDirectoryHandle('Parity incoming fixture',{create:true}),h=await folder.getFileHandle(${JSON.stringify(name)},{create:true}),w=await h.createWritable();await w.write(Uint8Array.from(atob(${JSON.stringify(Buffer.from(bytes).toString('base64'))}),c=>c.charCodeAt(0)));await w.close();window.showOpenFilePicker=async()=>[h];})()`);
  await clickLibraryImport(page);
  // Aliases deliberately share bytes. Use the real duplicate dialog, not a new
  // source identity or a bypass of the ordinary import path.
  await page.waitFor(`(async()=>{const rows=await(await import('./src/storage.js')).listDocuments();return !!document.querySelector('dialog[open] [data-duplicate-import]')||rows.some(r=>r.name===${JSON.stringify(name)});})()`,30000);
  if(await page.evaluate("!!document.querySelector('dialog[open] [data-duplicate-import]')"))await page.click('dialog[open] [data-duplicate-import] [value=new]');
  await saved(page,name);
}
async function saved(page,name,condition='true'){
  await page.waitFor(`(async()=>{const s=await import('./src/storage.js'),row=(await s.listDocuments()).find(r=>r.name===${JSON.stringify(name)});window.__parityRecord=row?await s.getDocument(row.id):null;return window.__parityRecord&&(${condition})&&${frame}?.style.visibility==='visible'&&!document.querySelector('.tab-dirty:not([hidden])');})()`,30000);
}
async function viewport(page,width){
  await page.send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<600});
  await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
  await page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
}
const metricCode=`const props=['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','backgroundColor','color','borderColor','borderWidth','borderRadius','paddingLeft','paddingRight','appearance'];const metric=node=>{const s=node.ownerDocument.defaultView.getComputedStyle(node),r=node.getBoundingClientRect();return {...Object.fromEntries(props.map(p=>[p,s[p]])),width:Math.round(r.width*100)/100,height:Math.round(r.height*100)/100};};`;
async function profile(page){
  return page.evaluate(`(()=>{${metricCode}const b=${bar},s=document.querySelector('#sidebar'),r=b.getBoundingClientRect();return {height:r.height,left:r.left,top:r.top,width:r.width,chrome:document.querySelector('.chrome').getBoundingClientRect().bottom,gap:getComputedStyle(b).gap,controls:[...b.querySelectorAll('button,select')].map(n=>({action:n.dataset.action||'theme',icon:n.querySelector('svg')?.outerHTML||'',...metric(n)})),floating:[...document.querySelectorAll('#toolbar button[data-action]')].map(n=>({action:n.dataset.action,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,font:getComputedStyle(n).fontSize})),sidebar:{height:s.querySelector('.sidebar-views').getBoundingClientRect().height,padding:getComputedStyle(s.querySelector('.sidebar-content')).padding,tabs:[...s.querySelectorAll('.sidebar-views button')].map(n=>({view:n.dataset.sidebarView||'close',icon:n.querySelector('svg')?.outerHTML||'',...metric(n)}))},overflow:document.documentElement.scrollWidth>innerWidth};})()`);
}
async function installSpeech(page){
  await page.evaluate(`(()=>{window.__paritySpoken=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};const engine=new EventTarget();engine.getVoices=()=>[];engine.cancel=()=>{};engine.speak=u=>{window.__paritySpoken.push(u.text);setTimeout(()=>u.onstart?.(),0);};Object.defineProperty(window,'speechSynthesis',{configurable:true,value:engine});})()`);
}
const html='<!doctype html><html><head><title>공통 도구 검사</title></head><body><header class="header"><strong>문서 제목</strong><form><input type="search"><button type="button">사이트 검색</button></form></header><main><h1>첫 장</h1><p>검색하는 한국어 본문입니다.</p><h2>첫 절</h2><p>두 번째 문장입니다.</p><h3>작은 절</h3><p>남겨 둘 문장입니다.</p><h1>둘째 장</h1><p>마지막 본문입니다.</p></main></body></html>';
const mhtml='MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="parity"\r\n\r\n--parity\r\nContent-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\nContent-Location: https://example.invalid/parity\r\n\r\n'+Buffer.from(html).toString('base64')+'\r\n--parity--\r\n';

test('real Chrome: Pages-only every format shares MemoSuite toolbar sizes, sidebar, annotations, bookmarks and TTS',{timeout:600000},async()=>{
  const env=await environment();let chrome;const results=[];
  try{
    chrome=await launchChrome();const page=chrome.page;await page.navigate(env.url);await installSpeech(page);
    const fixtures={html:Buffer.from(html),htm:Buffer.from(html+'\n'),mhtml:Buffer.from(mhtml),mht:Buffer.from(mhtml),pdf:await readFile(join(root,'tests/fixtures/unified-reader.pdf')),...await officeFixtures(),...await ebookFixtures(),...await mediaFixtures()};
    assert.deepEqual(Object.keys(fixtures).sort(),[...DOCUMENT_EXTENSIONS].sort());
    const baseline={};
    for(const [format,bytes] of Object.entries(fixtures)){
      const imageOnly=format==='cbz'||IMAGE_EXTENSIONS.includes(format);
      const name='공통 화면.'+format;await viewport(page,1280);await chooseFile(page,bytes,name);
      assert.equal(await page.evaluate(`!!${bar}?.querySelector('[data-action=previous-heading]')`),true,format+' complete toolbar');
      await page.click(control('zoom'));await page.click('#zoom-reset');await saved(page,name);
      for(const width of [1280,390,320]){
        await viewport(page,width);const actual=await profile(page);
        if(format==='html')baseline[width]=actual;
        else assert.deepEqual(actual,baseline[width],format+' shared geometry and CSS at '+width);
        assert.equal(actual.height,24);assert.equal(actual.left,0);assert.equal(actual.top,actual.chrome);assert.equal(actual.width,width);assert.equal(actual.overflow,false);
      }
      await viewport(page,1280);
      const title=await page.evaluate(`${bar}.querySelector('.reader-title').textContent`);assert.ok(title);
      // Opening the same player is always silent; only Play starts reading.
      const before=await page.evaluate('window.__paritySpoken.length');await page.click(control('speak'));await page.waitFor('!!document.querySelector(".mstts-player")');assert.equal(await page.evaluate('window.__paritySpoken.length'),before);
      if(!imageOnly){await page.click('.mstts-player [aria-label="소리내어 읽기"]');await page.waitFor('window.__paritySpoken.length>'+before);}
      await page.click('.mstts-player [aria-label="플레이어 닫기"]');
      // The HTML fallback, PDF and all converted formats use the same settings.
      await page.evaluate(`(()=>{const s=${bar}.querySelector('[data-reading-theme]');s.value='dark';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);await saved(page,name,'window.__parityRecord.metadata.view.readingTheme==="dark"');
      assert.equal(await page.evaluate(`${bar}.dataset.theme`),'dark');
      assert.equal(await page.evaluate(`${frame}.contentWindow.getComputedStyle(${doc}.body).backgroundColor`),format==='pdf'?'rgb(27, 30, 37)':'rgb(20, 22, 27)',format+' dark paper');
      await page.evaluate(`(()=>{const s=${bar}.querySelector('[data-reading-theme]');s.value='light';s.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      await page.click(control('font-larger'));await saved(page,name,'window.__parityRecord.metadata.view.fontScale===1.1');assert.equal(await page.evaluate(`${bar}.getBoundingClientRect().height`),24);
      if(!imageOnly){
        const selected=await page.evaluate(`(async()=>{const d=${doc},{textIndex,rangeFromOffsets}=await import('./src/document.js'),index=textIndex(d),root=d.querySelector('[data-office-text],.textLayer span,article p,main p,main h1')||d.body,runs=index.nodes.filter(n=>root.contains(n.node)),run=runs.find(n=>{if(!n.node.textContent.trim())return false;const r=d.createRange();r.selectNodeContents(n.node);return r.getBoundingClientRect().height>0;});if(!run)throw Error('No selectable body text');const end=Math.min(run.start+8,runs.at(-1).end),range=rangeFromOffsets(d,run.start,end,index);d.getSelection().removeAllRanges();d.getSelection().addRange(range);d.dispatchEvent(new Event('selectionchange'));return d.getSelection().toString();})()`);assert.ok(selected);
        await page.click('#toolbar [data-action=highlight]');await saved(page,name,'window.__parityRecord.metadata.annotations.length===1');
        assert.equal(await page.evaluate('document.querySelector("#sidebar [data-sidebar-count=annotations]").textContent'),'1');
      }
      await page.click('#sidebar [data-sidebar-view=bookmarks]');await page.click('#add-bookmark');await page.evaluate("document.querySelector('#note-text').value='공통 북마크'");await page.click('.note-form button[value=save]');await saved(page,name,'window.__parityRecord.metadata.bookmarks.length===1');
      assert.equal(await page.evaluate('document.querySelector("#sidebar [data-sidebar-count=bookmarks]").textContent'),'1');
      await page.click('#sidebar [data-bookmark-group] > summary');assert.equal(await page.evaluate('document.querySelectorAll("#sidebar [data-bookmark-group][open]").length>0'),true);await page.click('#sidebar [data-sidebar-view=bookmarks]');assert.equal(await page.evaluate('document.querySelectorAll("#sidebar [data-bookmark-group][open]").length'),0);
      await page.click('#sidebar [data-sidebar-view=outline]');
      if(['html','pdf','docx','xlsx','pptx','hwpx','epub','cbz','txt','png','srt','djvu'].includes(format)){
        await viewport(page,320);await writeFile(join(root,'test-results/pages-only-format-parity-'+format+'-320.png'),await page.screenshot());
      }
      results.push({format,widths:[1280,390,320],toolbar:true,sidebar:true,theme:true,font:true,annotation:imageOnly?'image drawing tests in browser-images-subtitles / ebook suites':true,bookmark:true,tts:imageOnly?'image only; no OCR':true});
    }
    assert.deepEqual(chrome.errors,[]);await writeFile(join(root,'test-results/pages-only-format-parity.json'),JSON.stringify({status:'pass',formats:results,baseline,errors:[]},null,2));
  }catch(error){if(chrome){await writeFile(join(root,'test-results/pages-only-format-parity-failure.png'),await chrome.page.screenshot());await writeFile(join(root,'test-results/pages-only-format-parity-failure.json'),JSON.stringify({completed:results,error:error.stack,state:await chrome.page.evaluate('({toast:document.querySelector("#toast")?.textContent,tab:document.querySelector(".tab.document.active")?.textContent})')},null,2));}throw error;}
  finally{await chrome?.close();await env.close();}
});

test('real Chrome: Pages-only common outline folding and horizontal search match HTML reading behavior',{timeout:120000},async()=>{
  const env=await environment();let chrome;
  try{
    chrome=await launchChrome();const page=chrome.page;await page.navigate(env.url);await chooseFile(page,Buffer.from(html),'계층 목차.html');
    assert.equal(await page.evaluate('document.querySelectorAll("#sidebar [data-outline-group]").length'),2);
    const headingRow=await page.evaluate(`(()=>{const row=document.querySelector('#sidebar [data-outline-group] > summary');return {height:row.getBoundingClientRect().height,titleHeight:row.querySelector('[data-heading]').getBoundingClientRect().height};})()`);
    assert.ok(Math.abs(headingRow.height-35.2)<.2,JSON.stringify(headingRow));assert.ok(Math.abs(headingRow.titleHeight-19.2)<.2,JSON.stringify(headingRow));
    assert.equal(await page.evaluate('document.querySelectorAll("#sidebar [data-outline-group][open]").length'),0);
    await revealAppOutline(page,'#sidebar [data-heading="2"]');await page.click('#sidebar [data-heading="2"]');assert.equal(await page.evaluate(`document.querySelector('#sidebar [data-heading="2"]').getAttribute('aria-current')`),'location');
    await page.click('#sidebar [data-sidebar-view=outline]');assert.equal(await page.evaluate('document.querySelectorAll("#sidebar [data-outline-group][open]").length'),0);
    await page.click('#sidebar [data-sidebar-view=search]');await page.click('#sidebar [data-sidebar-view=outline]');assert.equal(await page.evaluate('document.querySelectorAll("#sidebar [data-outline-group][open]").length'),0);
    const arrow=await page.evaluate("(()=>{const r=document.querySelector('#sidebar [data-outline-group=\"0\"] > summary').getBoundingClientRect();return {x:r.left+8,y:r.top+r.height/2};})()");
    for(const type of ['mousePressed','mouseReleased'])await page.send('Input.dispatchMouseEvent',{type,...arrow,button:'left',clickCount:1});
    await page.click('#sidebar [data-heading="0"]');assert.equal(await page.evaluate(`document.querySelector('#sidebar [data-outline-group="0"]').open`),false,'title navigation also closes an expanded branch');
    const csv=Array.from({length:40},(_,i)=>i===39?'숨은열검색':'열'+i).join(',')+'\n'+Array.from({length:40},(_,i)=>i).join(',');await chooseFile(page,Buffer.from(csv),'가로 검색.csv');
    await page.click('#sidebar [data-sidebar-view=search]');await page.evaluate("const i=document.querySelector('#book-search');i.value='숨은열검색';i.dispatchEvent(new Event('input'))");await page.waitFor('!!document.querySelector("[data-whole-search-index]")');await page.click('[data-whole-search-index="0"]');
    await page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const visible=await page.evaluate(`(()=>{const d=${doc},reader=document.querySelector('#sidebar').annotationReader,box=d.querySelector('.office-table-scroll'),mark=d.querySelector('[data-htmlmemo-book-search-hit]'),hit=mark.getBoundingClientRect(),r=box.getBoundingClientRect();return {nativeScroll:reader.nativeScroll,scrollHost:reader.scrollHostEl?.className,left:box.scrollLeft,scrollWidth:box.scrollWidth,clientWidth:box.clientWidth,hit:{text:mark.textContent,left:hit.left,right:hit.right},box:{left:r.left,right:r.right},inside:hit.left>=r.left&&hit.right<=r.right};})()`);
    await writeFile(join(root,'test-results/pages-only-format-parity-search.png'),await page.screenshot());
    await writeFile(join(root,'test-results/pages-only-format-parity-search.json'),JSON.stringify(visible,null,2));
    assert.equal(visible.inside,true,JSON.stringify(visible));if(visible.scrollWidth>visible.clientWidth)assert.ok(visible.left>0,JSON.stringify(visible));
    assert.deepEqual(chrome.errors,[]);await writeFile(join(root,'test-results/pages-only-format-parity-navigation.json'),JSON.stringify({status:'pass',hierarchicalOutline:true,collapseRetained:true,headingClickTogglesGroup:true,horizontalSearch:visible,errors:[]},null,2));
  }finally{await chrome?.close();await env.close();}
});

test('real Chrome: Pages-only MemoSuite book and fallback sidebar share tab, search and bookmark presentation',{timeout:120000},async()=>{
  const env=await environment();let chrome;
  try{
    chrome=await launchChrome();const page=chrome.page;await viewport(page,1280);await page.navigate(env.url);
    const reference=(await readFile(join(root,'tests/fixtures/source-toolbar.html'),'utf8')).replace('<h2>목차</h2>','<h2>목차</h2><input placeholder="책 전체 검색" aria-label="책 전체 검색어">').replace('</style>','#reader-shade{display:none}body.toc-open #reader-shade{display:block;position:fixed;inset:0;z-index:5;background:#0006}</style>').replace('</body>','<button id="reader-shade" aria-label="목차 닫기"></button></body>');
    await chooseFile(page,Buffer.from(reference),'MemoSuite 도구줄.html');await page.evaluate(`${doc}.querySelector('[data-action=zoom]').click()`);await page.click('#zoom-reset');
    const native=doc+`.querySelector('[data-htmlmemo-doc-sidebar-ui]')`;
    const sidebarMetric=async expression=>{await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});return page.evaluate(`(()=>{${metricCode}const p=${expression};return {tabs:[...p.querySelectorAll('.sidebar-views button')].map(n=>({key:n.dataset.sidebarView||'close',...metric(n)})),fields:[...p.querySelectorAll('input')].filter(n=>n.getBoundingClientRect().height>0).map(metric),add:p.querySelector('.bookmark-add-button')?metric(p.querySelector('.bookmark-add-button')):null};})()`);};
    const outlineMetric=expression=>page.evaluate(`(()=>{${metricCode}const node=${expression},{appearance,...result}=metric(node);return {...result,textDecorationLine:node.ownerDocument.defaultView.getComputedStyle(node).textDecorationLine};})()`);
    const nativeOutline=await outlineMetric(doc+`.querySelector('#reader-nav > a:last-of-type')`);
    await writeFile(join(root,'test-results/pages-only-format-parity-native-outline-1280.png'),await page.screenshot());
    await page.evaluate(`${native}.querySelector('[data-sidebar-view=search]').click()`);const nativeSearch=await sidebarMetric(native);
    assert.equal(nativeSearch.fields.length,2);assert.ok(nativeSearch.tabs.every(tab=>tab.height===24));
    await page.evaluate(`${native}.querySelector('[data-sidebar-view=bookmarks]').click()`);const nativeBookmarks=await sidebarMetric(native);
    await page.evaluate(`${native}.querySelector('[data-sidebar-view=outline]').click()`);
    const scaleStates=[];
    for(const width of [1280,390,320]){
      await viewport(page,width);
      for(const percent of [25,50,100,125,200]){
        await page.evaluate(`${doc}.querySelector('[data-action=zoom]').click()`);await page.waitFor('!document.querySelector("#tool-popover").hidden');
        await page.evaluate(`(()=>{const i=document.querySelector('#zoom-value');i.value=${JSON.stringify(String(percent))};i.dispatchEvent(new Event('change',{bubbles:true}));})()`);await page.click('[data-popover-close]');
        await page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
        const state=await page.evaluate(`(()=>{const f=${frame},d=f.contentDocument,fr=f.getBoundingClientRect(),s=fr.width/f.offsetWidth,b=d.querySelector('[data-htmlmemo-doc-topbar]').getBoundingClientRect(),n=d.querySelector('#reader-nav').getBoundingClientRect(),p=d.querySelector('[data-htmlmemo-doc-sidebar-ui] .sidebar-views').getBoundingClientRect(),link=d.querySelector('#reader-nav > a:last-of-type').getBoundingClientRect(),button=d.querySelector('[data-action=speak]'),r=button.getBoundingClientRect();return {width:innerWidth,percent:${percent},header:b.height*s,headerWidth:b.width*s,headerLeft:fr.left+b.left*s,headerTop:fr.top+b.top*s,chrome:document.querySelector('.chrome').getBoundingClientRect().bottom,sidebar:n.width*s,tabs:p.height*s,outlineRowHeight:link.height*s,outlineRowWidth:link.width*s,button:r.height*s,speakReachable:d.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('[data-action=speak]')===button};})()`);
        assert.ok(Math.abs(state.header-24)<.2,JSON.stringify(state));assert.ok(Math.abs(state.headerWidth-width)<1,JSON.stringify(state));assert.ok(Math.abs(state.headerLeft)<1,JSON.stringify(state));assert.ok(Math.abs(state.headerTop-state.chrome)<1,JSON.stringify(state));assert.ok(Math.abs(state.sidebar-Math.min(300,width-40))<1,JSON.stringify(state));assert.ok(Math.abs(state.tabs-25)<.2,JSON.stringify(state));assert.ok(Math.abs(state.button-20)<.2,JSON.stringify(state));assert.equal(state.speakReachable,true,JSON.stringify(state));scaleStates.push(state);
        assert.ok(Math.abs(state.outlineRowHeight-35.2)<.3,JSON.stringify(state));assert.ok(Math.abs(state.outlineRowWidth-(state.sidebar-25))<1.2,JSON.stringify(state));
      }
    }
    await page.evaluate(`${native}.querySelector('[data-sidebar-close]').click()`);assert.equal(await page.evaluate(`${doc}.body.classList.contains('toc-open')`),false);
    await page.click('#toolbar [data-action=more]');await page.click('#tool-popover [data-more=sidebar]');
    assert.equal(await page.evaluate(`${doc}.body.classList.contains('toc-open')`),true);assert.equal(await page.evaluate(`${native}.getBoundingClientRect().height>0`),true);
    await page.evaluate(`${doc}.body.classList.remove('toc-open')`);await viewport(page,1280);await page.evaluate(`${doc}.querySelector('[data-action=zoom]').click()`);await page.click('#zoom-reset');
    await chooseFile(page,Buffer.from(html.replace(/h[23]>/g,'h1>')),'공통 사이드바.html');await page.click(control('zoom'));await page.click('#zoom-reset');
    const commonOutline=await outlineMetric(`Array.from(document.querySelectorAll('#sidebar [data-heading]')).at(-1)`);assert.deepEqual(commonOutline,nativeOutline,'source plain links and common outline rows share size, fonts, colors and padding');
    await page.click('#sidebar [data-sidebar-view=search]');const sharedSearch=await sidebarMetric('document.querySelector("#sidebar")');
    assert.deepEqual(sharedSearch,nativeSearch,'source and fallback search fields and tabs have the same dimensions, fonts and colors');
    await page.click('#sidebar [data-sidebar-view=bookmarks]');const sharedBookmarks=await sidebarMetric('document.querySelector("#sidebar")');assert.deepEqual(sharedBookmarks,nativeBookmarks);
    await writeFile(join(root,'test-results/pages-only-format-parity-sidebar-1280.png'),await page.screenshot());
    assert.deepEqual(chrome.errors,[]);await writeFile(join(root,'test-results/pages-only-format-parity-sidebar.json'),JSON.stringify({status:'pass',outline:commonOutline,search:sharedSearch,bookmarks:sharedBookmarks,sourceAndFallbackMatch:true,compactCloseAndReopen:true,scaleStates,errors:[]},null,2));
  }finally{await chrome?.close();await env.close();}
});

test('real Chrome: Pages-only outline titles start folded, toggle on text and align the reading pane',{timeout:150000},async()=>{
  const env=await environment();let chrome;const positions=[];
  try{
    chrome=await launchChrome();const page=chrome.page;await viewport(page,1280);await page.navigate(env.url);await page.click('#paste-button');
    const text='# 첫 장\n\n'+('첫 장의 본문입니다.\n\n'.repeat(80))+'## 첫 절\n\n'+('첫 절의 본문입니다.\n\n'.repeat(80))+'### 마지막 절\n\n'+('뒤쪽 본문입니다.\n\n'.repeat(160));
    await page.evaluate(`document.querySelector('#paste-text').value=${JSON.stringify(text)}`);await page.click('#paste-save');await page.waitFor(`${frame}?.style.visibility==='visible'&&document.querySelector('#sidebar [data-heading="2"]')`);
    assert.equal(await page.evaluate('document.querySelectorAll("#sidebar [data-outline-group][open]").length'),0);
    await page.click('#sidebar [data-heading="0"]');assert.equal(await page.evaluate(`document.querySelector('[data-outline-group="0"]').open`),true);
    await page.click('#sidebar [data-heading="0"]');assert.equal(await page.evaluate(`document.querySelector('[data-outline-group="0"]').open`),false);
    await revealAppOutline(page,'#sidebar [data-heading="2"]');
    const zoom=async(percent,native=false)=>{if(native)await clickNative('[data-action=zoom]');else await page.click(control('zoom'));await page.evaluate(`(()=>{const i=document.querySelector('#zoom-value');i.value=${JSON.stringify(String(percent))};i.dispatchEvent(new Event('change',{bubbles:true}));})()`);await page.click('[data-popover-close]');};
    const placement=async(selector,native)=>{await page.evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');return page.evaluate(`(()=>{const f=${frame},d=f.contentDocument,r=${native?'d.querySelector("#reader-main")':'document.querySelector("#sidebar").annotationReader.viewport'},target=d.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(),b=f.getBoundingClientRect(),z=b.width/f.offsetWidth,box=r.getBoundingClientRect(),reader=${native?'null':'document.querySelector("#sidebar").annotationReader'};return {native:${native},top:b.top+target.top*z,expected:${native?'b.top+box.top*z':'box.top'}+12,left:reader?reader.scrollLeft:r.scrollLeft};})()`);};
    for(const percent of [50,100,200]){await zoom(percent);await page.click('#sidebar [data-heading="2"]');const state=await placement('h3',false);assert.ok(Math.abs(state.top-state.expected)<2,JSON.stringify(state));assert.equal(state.left,0);positions.push({percent,...state});}
    const source='<!doctype html><html><head><title>Native navigation</title><style>html,body{margin:0;height:100%;overflow:hidden;font:18px/1.7 sans-serif}.reader-head{height:24px;display:flex}.layout{display:grid;grid-template-columns:260px 1fr;height:calc(100% - 24px)}nav,main{overflow:auto;padding:12px}article{width:1800px}article>section{height:1800px}</style></head><body><header class="reader-head"><span class="reader-title">책</span><button id="reader-smaller">A−</button><button id="reader-larger">A+</button></header><div class="layout"><nav id="reader-nav"><div id="reader-tree"><details id="part" open><summary><a href="#chapter1">첫 장</a></summary><details id="subpart" open><summary><a href="#chapter2">첫 절</a></summary><a id="last-chapter" href="#chapter3">마지막 절</a></details></details></div></nav><main id="reader-main"><article id="reader-content"><section id="chapter1"><h1>첫 장</h1>첫 장의 본문</section><section id="chapter2"><h2>첫 절</h2>첫 절의 본문</section><section id="chapter3"><h3>마지막 절</h3>마지막 절의 본문</section></article></main></div><script>for(const a of document.querySelectorAll("#reader-tree a"))a.addEventListener("click",event=>{event.preventDefault();document.querySelector(a.getAttribute("href")).scrollIntoView();});</script></body></html>';
    await chooseFile(page,Buffer.from(source),'원래 목차 위치.html');await page.waitFor(`${doc}.querySelector('[data-htmlmemo-native-sidebar]')`);
    const clickNative=async selector=>{
      await revealDocumentControl(page,selector);
      const point=await page.evaluate(`(async()=>{const f=${frame},d=f.contentDocument,e=d.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'nearest',inline:'nearest'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const r=e.getBoundingClientRect(),b=f.getBoundingClientRect(),z=b.width/f.offsetWidth,p={x:b.left+(r.left+r.width/2)*z,y:b.top+(r.top+r.height/2)*z},inner=d.elementFromPoint(r.left+r.width/2,r.top+r.height/2),outer=document.elementFromPoint(p.x,p.y);if(outer!==f||!e.contains(inner))throw Error('TOC click is outside its visible target: '+JSON.stringify({selector:${JSON.stringify(selector)},point:p,node:r.toJSON(),frame:b.toJSON(),inner:inner?.outerHTML.slice(0,500),outer:outer?.outerHTML.slice(0,500)}));return p;})()`);
      for(const type of ['mousePressed','mouseReleased'])await page.send('Input.dispatchMouseEvent',{type,...point,button:'left',clickCount:1});
    };
    assert.equal(await page.evaluate(`${doc}.querySelectorAll('#reader-tree details[open]').length`),0);
    await clickNative('#part > summary a');await page.waitFor(`${doc}.querySelector('#part').open`);await clickNative('#part > summary a');await page.waitFor(`!${doc}.querySelector('#part').open`);
    await clickNative('#last-chapter');
    for(const percent of [50,100,200]){await zoom(percent,true);const start=Date.now();await clickNative('#last-chapter');await page.waitFor(`(()=>{const f=${frame},d=f.contentDocument,m=d.querySelector('#reader-main'),target=d.querySelector('#chapter3').getBoundingClientRect(),box=m.getBoundingClientRect(),scale=f.getBoundingClientRect().width/f.offsetWidth;return Math.abs((target.top-box.top)*scale-12)<2&&m.scrollLeft===0;})()`);const state={percent,navigateMs:Date.now()-start,...await placement('#chapter3',true)};assert.ok(Math.abs(state.top-state.expected)<2,JSON.stringify(state));assert.equal(state.left,0);positions.push({percent,...state});}
    await mkdir(join(root,'test-results'),{recursive:true});await writeFile(join(root,'test-results/pages-only-toc-start-position.png'),await page.screenshot());assert.deepEqual(chrome.errors,[]);
    await writeFile(join(root,'test-results/pages-only-toc-start-position.json'),JSON.stringify({status:'pass',initiallyFolded:true,titleClickToggles:true,positions,errors:[]},null,2));
  }catch(error){if(chrome){await mkdir(join(root,'test-results'),{recursive:true});await writeFile(join(root,'test-results/pages-only-toc-start-failure.json'),JSON.stringify({completed:positions,error:error.message,beforeCapture:await chrome.page.evaluate(`(()=>{const f=document.querySelector('.document-host:not([hidden]) iframe'),d=f?.contentDocument,m=d?.querySelector('#reader-main'),target=d?.querySelector('#chapter3'),r=d?.querySelector('[data-htmlmemo-doc-sidebar-ui]')?.annotationReader;return {zoom:r?.zoom,scrollTop:m?.scrollTop,scrollHost:r?.scrollHostEl?.id,history:r?.linkHistory.length,target:target?.getBoundingClientRect().toJSON(),main:m?.getBoundingClientRect().toJSON(),frame:f?.getBoundingClientRect().toJSON(),pending:r?.runtime?.queue?.constructor?.name};})()`).catch(()=>null)},null,2));await writeFile(join(root,'test-results/pages-only-toc-start-failure.png'),await chrome.page.screenshot());}throw error;}
  finally{await chrome?.close();await env.close();}
});

test('real Chrome: Pages-only malicious-file messages have a readable warning color',{timeout:60000},async()=>{
  const env=await environment();let chrome;
  try{
    chrome=await launchChrome();const page=chrome.page;await viewport(page,390);await page.navigate(env.url);
    await page.evaluate(`window.showOpenFilePicker=async()=>[{kind:'file',getFile:async()=>{throw new DOMException('악성코드가 포함되어 있는 파일입니다.','NotReadableError');}}]`);await clickLibraryImport(page);
    await page.waitFor("!document.querySelector('#toast').hidden&&document.querySelector('#toast').textContent==='악성코드가 포함되어 있는 파일입니다.'");
    const warning=await page.evaluate("(()=>{const n=document.querySelector('#toast'),s=getComputedStyle(n);return {role:n.getAttribute('role'),security:n.classList.contains('security-warning'),background:s.backgroundColor,color:s.color,border:s.borderColor};})()");
    assert.equal(warning.role,'alert');assert.equal(warning.security,true);assert.equal(warning.background,'rgb(153, 27, 27)');assert.equal(warning.color,'rgb(255, 255, 255)');
    await mkdir(join(root,'test-results'),{recursive:true});await writeFile(join(root,'test-results/pages-only-security-warning-390.png'),await page.screenshot());await writeFile(join(root,'test-results/pages-only-security-warning.json'),JSON.stringify({status:'pass',warning,errors:[]},null,2));assert.deepEqual(chrome.errors,[]);
  }finally{await chrome?.close();await env.close();}
});

test('real Chrome: Pages-only malicious-file messages inside the TOC keep a warning color across themes and updates',{timeout:120000},async()=>{
  const env=await environment();let chrome;const states=[],message='악성코드가 포함되어 있는 파일입니다.';
  try{
    chrome=await launchChrome();const page=chrome.page;await viewport(page,1280);await page.navigate(env.url);
    const source=(await readFile(join(root,'tests/fixtures/source-toolbar.html'),'utf8')).replace('<h2>목차</h2>','<h2>목차</h2><details><summary>블로그</summary><a href="#first">블로그 글</a></details><p id="toc-warning">'+message+'</p><button id="clear-warning" onclick="document.querySelector(\'#toc-warning\').textContent=\'정상적으로 열었습니다.\'">정상 상태</button><button id="restore-warning" onclick="document.querySelector(\'#toc-warning\').innerHTML=\'악성&lt;strong&gt;코드가 포함되어 있는&lt;/strong&gt; 파일입니다.\'">경고 상태</button>').replace('<p>화면과 버튼 모양만 비교하는 합성 문서입니다.</p>','<p>화면과 버튼 모양만 비교하는 합성 문서입니다.</p><p id="body-message">'+message+'</p>');
    await chooseFile(page,Buffer.from(source),'목차 경고.html');await page.waitFor(`${doc}.querySelector('#toc-warning[data-htmlmemo-security-warning]')`);
    const colors=expression=>page.evaluate(`(()=>{const n=${expression},d=n.ownerDocument,s=d.defaultView.getComputedStyle(n);return {text:n.textContent,color:s.color,background:s.backgroundColor,border:s.borderColor,marked:n.hasAttribute('data-htmlmemo-security-warning')};})()`);
    const check=state=>{assert.equal(state.text,message);assert.equal(state.marked,true);assert.equal(state.color,'rgb(255, 255, 255)');assert.equal(state.background,'rgb(153, 27, 27)');};
    const theme=async mode=>{await page.click('#settings-button');await page.evaluate(`(()=>{const s=document.querySelector('#appearance');s.value=${JSON.stringify(mode)};s.dispatchEvent(new Event('change',{bubbles:true}));})()`);await page.click('#dialog [data-dialog-close]');};
    for(const width of [1280,390])for(const mode of ['light','dark']){
      await viewport(page,width);await theme(mode);await revealDocumentControl(page,'#toc-warning');const state={kind:'native',width,theme:mode,...await colors(doc+`.querySelector('#toc-warning')`)};check(state);assert.equal(await page.evaluate(`${doc}.querySelector('#body-message').hasAttribute('data-htmlmemo-security-warning')`),false);states.push(state);
      await writeFile(join(root,`test-results/pages-only-toc-security-warning-${mode}-${width}.png`),await page.screenshot());
    }
    await clickDocumentControl(page,'#clear-warning');await page.waitFor(`!${doc}.querySelector('#toc-warning').hasAttribute('data-htmlmemo-security-warning')`);
    await clickDocumentControl(page,'#restore-warning');await page.waitFor(`${doc}.querySelector('#toc-warning[data-htmlmemo-security-warning] strong')`);check(await colors(doc+`.querySelector('#toc-warning')`));
    await page.click('#library-tab');await page.click('#paste-button');await page.evaluate(`document.querySelector('#paste-text').value=${JSON.stringify('# '+message+'\n\n본문입니다.\n\n# 정상 목차\n\n정상적인 본문입니다.')}`);await page.click('#paste-save');await page.waitFor('!!document.querySelector("#sidebar [data-htmlmemo-security-warning]")');await page.click('#sidebar [data-htmlmemo-security-warning]');check(await colors('document.querySelector("#sidebar [data-htmlmemo-security-warning]")'));
    states.push({kind:'generated',width:390,theme:'dark',...await colors('document.querySelector("#sidebar [data-htmlmemo-security-warning]")')});assert.deepEqual(chrome.errors,[]);
    await writeFile(join(root,'test-results/pages-only-toc-security-warning.json'),JSON.stringify({status:'pass',states,dynamicWarningClears:true,dynamicNestedWarningReturns:true,bodyUnchanged:true,errors:[]},null,2));
  }catch(error){if(chrome){await mkdir(join(root,'test-results'),{recursive:true});await writeFile(join(root,'test-results/pages-only-toc-security-warning-failure.json'),JSON.stringify({states,error:error.message,errors:chrome.errors},null,2));await writeFile(join(root,'test-results/pages-only-toc-security-warning-failure.png'),await chrome.page.screenshot());}throw error;}
  finally{await chrome?.close();await env.close();}
});
