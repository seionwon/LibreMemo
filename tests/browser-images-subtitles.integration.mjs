// CI/trusted Chrome only. These fixtures contain no private screenshots/files.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {root,prepareAssets,packageAssets} from '../scripts/assets.mjs';
import {pwaEntries} from '../public/src/distribution.js';
import {createServer} from '../scripts/server.mjs';
import {launchChrome,clickLibraryImport} from './chrome.mjs';
import {chooseDocumentExport} from './export-flow.mjs';
import {subtitleFixtures} from './image-subtitle-fixtures.mjs';
const frame='document.querySelector(".document-host:not([hidden]) iframe.document-frame")',doc=frame+'.contentDocument';
const control=action=>'.document-host:not([hidden]) [data-action="'+action+'"]';
async function environment(){
  await prepareAssets();const folder=await mkdtemp(join(tmpdir(),'librememo-images-'));
  for(const entry of pwaEntries(await packageAssets())){const path=join(folder,entry.name);await mkdir(join(path,'..'),{recursive:true});await writeFile(path,entry.data);}
  const server=createServer(folder);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {url:process.env.HTMLMEMO_SIDEBAR_TEST_URL||`http://127.0.0.1:${server.address().port}/`,async close(){await new Promise(resolve=>server.close(resolve));await rm(folder,{recursive:true,force:true});}};
}
async function chooseFile(page,bytes,name){
  await page.evaluate(`(async()=>{const root=await navigator.storage.getDirectory(),incoming=await root.getDirectoryHandle('Image subtitle incoming',{create:true}),h=await incoming.getFileHandle(${JSON.stringify(name)},{create:true}),w=await h.createWritable();await w.write(Uint8Array.from(atob(${JSON.stringify(Buffer.from(bytes).toString('base64'))}),c=>c.charCodeAt(0)));await w.close();window.showOpenFilePicker=async()=>[h];})()`);await clickLibraryImport(page);
}
async function saved(page,name,condition='true'){
  await page.waitFor(`(async()=>{const s=await import('./src/storage.js'),rows=await s.listDocuments(),summary=rows.find(r=>${name?'r.name==='+JSON.stringify(name):'r.name.startsWith("스크린샷 ")'});window.__mediaRecord=summary?await s.getDocument(summary.id):null;return window.__mediaRecord&&(${condition})&&!document.querySelector('.tab-dirty:not([hidden])');})()`,30000);
  await page.waitFor(frame+'?.style.visibility==="visible"');
}
async function exportDocument(page,mode){
  await page.evaluate(`(async()=>{window.__mediaExport=await(await navigator.storage.getDirectory()).getFileHandle('image-subtitle-export.${mode==='archive'?'librememo':'html'}',{create:true});window.showSaveFilePicker=async()=>window.__mediaExport;})()`);
  await chooseDocumentExport(page,mode);await page.waitFor('document.querySelector("#toast").textContent.includes("내보냈습니다")');
  return Buffer.from(await page.evaluate(`(async()=>{const bytes=new Uint8Array(await(await window.__mediaExport.getFile()).arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);})()`),'base64');
}
async function fail(page,name){await writeFile(join(root,'test-results/pages-only-'+name+'-failure.png'),await page.screenshot());console.error(name,await page.evaluate('({toast:document.querySelector("#toast")?.textContent,status:document.querySelector("#status-left")?.textContent,dialog:document.querySelector("#dialog[open]")?.textContent})'));}
async function zoom(page,percent){await page.click(control('zoom'));await page.evaluate(`(()=>{const input=document.querySelector('#zoom-value');input.value=${JSON.stringify(String(percent))};input.dispatchEvent(new Event('change',{bubbles:true}));})()`);await page.click('[data-popover-close]');}
async function imagePoint(page,x,y){return page.evaluate(`(()=>{const f=${frame},i=f.contentDocument.getElementById('librememo-image'),b=f.getBoundingClientRect(),r=i.getBoundingClientRect(),z=b.width/f.offsetWidth;return{x:b.left+(r.left+r.width*${x})*z,y:b.top+(r.top+r.height*${y})*z};})()`);}
async function draw(page,tool,x1,y1,x2,y2){await page.click('#toolbar [data-action="'+tool+'"]');const from=await imagePoint(page,x1,y1),to=await imagePoint(page,x2,y2);await page.send('Input.dispatchMouseEvent',{type:'mousePressed',...from,button:'left',buttons:1,clickCount:1});for(let i=1;i<=8;i++)await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:from.x+(to.x-from.x)*i/8,y:from.y+(to.y-from.y)*i/8,button:'left',buttons:1});await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',...to,button:'left',clickCount:1});}
const geometry=`(()=>{const d=${doc},image=d.getElementById('librememo-image').getBoundingClientRect();return [...d.querySelectorAll('#htmlmemo-annotation-layer > [data-htmlmemo-id]')].map(n=>{const r=n.getBoundingClientRect();return{id:n.dataset.htmlmemoId,x:(r.left+r.width/2-image.left)/image.width,y:(r.top+r.height/2-image.top)/image.height};});})()`;

test('real Chrome: Pages-only image formats keep original pixels, copies, shared controls and a static animation frame',{timeout:180000},async()=>{
  const env=await environment();let chrome;
  try{
    chrome=await launchChrome();const page=chrome.page;await page.navigate(env.url);const results=[];
    for(const ext of ['png','jpg','webp','avif','bmp','gif','apng','svg']){
      const bytes=await readFile(join(root,'tests/fixtures/images/reading.'+ext)),name='읽기 이미지.'+ext;await chooseFile(page,bytes,name);await saved(page,name);
      const state=await page.evaluate(`(async()=>{const r=window.__mediaRecord,d=${doc},i=d.getElementById('librememo-image'),bar=document.querySelector('.document-host:not([hidden]) [data-htmlmemo-reading-controls]');return {width:i.naturalWidth,height:i.naturalHeight,complete:i.complete,source:i.src.slice(0,32),original:Array.from(new Uint8Array(await r.originalFile.arrayBuffer())),scripts:r.metadata.execution.allowScripts,heightUI:bar.getBoundingClientRect().height,sidebar:[...document.querySelectorAll('#sidebar [data-sidebar-view]')].map(n=>n.dataset.sidebarView)};})()`);
      assert.equal(state.width,ext==='bmp'?320:1600);assert.equal(state.height,ext==='bmp'?200:1000);assert.equal(state.complete,true);assert.equal(state.scripts,false);assert.equal(state.heightUI,24);assert.deepEqual(state.sidebar,['outline','search','annotations','bookmarks']);assert.deepEqual(state.original,[...bytes]);
      if(['gif','apng'].includes(ext))assert.ok(state.source.startsWith('data:image/png;'));
      results.push({format:ext,width:state.width,height:state.height,originalBytes:bytes.length,readOnly:true});
    }
    await page.waitFor('document.querySelector("#data-folder-status").textContent==="폴더 저장 완료"',30000);
    await chooseFile(page,Buffer.from('<script>unsafe()</script>'),'false.png');await page.waitFor('document.querySelector("#toast").textContent.includes("손상")');assert.equal(await page.evaluate('(async()=> (await(await import("./src/storage.js")).listDocuments()).some(r=>r.name==="false.png"))()'),false);
    assert.deepEqual(chrome.errors,[]);await writeFile(join(root,'test-results/pages-only-image-formats.json'),JSON.stringify({status:'pass',results,errors:[]},null,2));
  }catch(error){if(chrome)await fail(chrome.page,'image-formats');throw error;}finally{await chrome?.close();await env.close();}
});

test('real Chrome: Pages-only screenshot clipboard, iframe paste, pen alignment, phone, original archive and offline reopen',{timeout:240000},async()=>{
  const env=await environment();let chrome,receiver;
  try{
    chrome=await launchChrome();const page=chrome.page;await page.navigate(env.url);await page.click('#library-tab');await page.waitFor('document.hasFocus()');
    await page.send('Browser.grantPermissions',{origin:new URL(env.url).origin,permissions:['clipboardReadWrite','clipboardSanitizedWrite']});
    const bytes=await readFile(join(root,'tests/fixtures/images/reading.png'));
    await page.evaluate(`navigator.clipboard.write([new ClipboardItem({'image/png':new Blob([Uint8Array.from(atob(${JSON.stringify(bytes.toString('base64'))}),c=>c.charCodeAt(0))],{type:'image/png'})})])`);
    await page.click('#image-paste-button');await page.click('[data-image-clipboard]');await saved(page,null);const name=await page.evaluate('window.__mediaRecord.name');
    await draw(page,'pen',.15,.35,.7,.35);await saved(page,name,'window.__mediaRecord.metadata.annotations.length===1');
    await draw(page,'rect',.15,.52,.45,.62);await saved(page,name,'window.__mediaRecord.metadata.annotations.length===2');const before=await page.evaluate(geometry);assert.equal(before.length,2);
    const checks=[];for(const percent of [75,125,50]){await zoom(page,percent);const after=await page.evaluate(geometry);assert.equal(after.length,2);for(let i=0;i<2;i++){assert.ok(Math.abs(after[i].x-before[i].x)<.003);assert.ok(Math.abs(after[i].y-before[i].y)<.003);}checks.push(percent);}
    await page.click(control('font-larger'));await saved(page,name,'window.__mediaRecord.metadata.view.fontScale===1.1');const larger=await page.evaluate(geometry);for(let i=0;i<2;i++){assert.ok(Math.abs(larger[i].x-before[i].x)<.003);assert.ok(Math.abs(larger[i].y-before[i].y)<.003);}
    await page.click('#toolbar [data-action=select]');await page.click('[data-sidebar-view=bookmarks]');await page.click('#add-bookmark');await page.evaluate('document.querySelector("#note-text").value="스크린샷 검토 위치"');await page.click('.note-form button[value=save]');await saved(page,name,'window.__mediaRecord.metadata.bookmarks.length===1');
    const archive=await exportDocument(page,'archive');
    const html=await exportDocument(page,'html');
    // A real keyboard paste in the iframe must reach the app and the ordinary
    // duplicate choice, without overwriting annotations on the current image.
    await page.evaluate(`${doc}.body.tabIndex=-1;${doc}.body.focus()`);
    await page.send('Input.dispatchKeyEvent',{type:'keyDown',modifiers:2,key:'v',code:'KeyV',windowsVirtualKeyCode:86});await page.send('Input.dispatchKeyEvent',{type:'keyUp',modifiers:2,key:'v',code:'KeyV',windowsVirtualKeyCode:86});
    await page.waitFor('document.querySelector("dialog[open] [data-duplicate-import]")');await page.click('[data-duplicate-import] [value=cancel]');
    receiver=await launchChrome();await receiver.page.navigate(env.url);await chooseFile(receiver.page,archive,'screenshot.librememo');await saved(receiver.page,name,'window.__mediaRecord.metadata.annotations.length===2&&window.__mediaRecord.metadata.bookmarks.length===1');assert.equal(await receiver.page.evaluate(geometry+'.length'),2);
    await chooseFile(receiver.page,html,'screenshot-shared.html');await saved(receiver.page,'screenshot-shared.html','window.__mediaRecord.metadata.annotations.length===2');assert.equal(await receiver.page.evaluate(geometry+'.length'),2);
    await page.send('Emulation.setDeviceMetricsOverride',{width:320,height:640,deviceScaleFactor:2,mobile:true});
    if(await page.evaluate('!document.querySelector("#sidebar").hidden'))await page.click('#close-sidebar');await zoom(page,20);await page.evaluate(doc+'.defaultView.scrollTo(0,0)');
    assert.equal(await page.evaluate('document.documentElement.scrollWidth>innerWidth'),false);assert.equal(await page.evaluate(doc+'.getElementById("librememo-image").naturalWidth'),1600);await writeFile(join(root,'test-results/pages-only-screenshot-320.png'),await page.screenshot());
    await page.send('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:2,mobile:false});await zoom(page,60);await page.evaluate(doc+'.defaultView.scrollTo(0,0)');await writeFile(join(root,'test-results/pages-only-screenshot-1280.png'),await page.screenshot());
    await page.click('#library-tab');await page.click('#image-paste-button');await writeFile(join(root,'test-results/pages-only-screenshot-paste.png'),await page.screenshot());await page.click('[data-image-paste] [data-dialog-close]');
    await page.evaluate('navigator.serviceWorker.ready');await page.waitFor('!!navigator.serviceWorker.controller',45000);await page.send('Network.enable');await page.send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});await page.navigate(env.url);await page.click('#library-tab');await page.click('#document-grid [data-open]');await saved(page,name,'window.__mediaRecord.metadata.annotations.length===2');
    assert.deepEqual(chrome.errors,[]);assert.deepEqual(receiver.errors,[]);await writeFile(join(root,'test-results/pages-only-screenshot-annotations.json'),JSON.stringify({status:'pass',clipboard:true,iframePaste:true,zoomPercent:checks,fontScale:1.1,annotations:2,bookmarks:1,archive:true,html:true,phone:320,offline:true,errors:[]},null,2));
  }catch(error){if(chrome)await fail(chrome.page,'screenshot');throw error;}finally{await receiver?.close();await chrome?.close();await env.close();}
});

test('real Chrome: Pages-only subtitle formats share time outlines, text annotations, search and portable originals',{timeout:210000},async()=>{
  const env=await environment();let chrome,receiver;
  try{
    chrome=await launchChrome();receiver=await launchChrome();const page=chrome.page;await page.navigate(env.url);await receiver.page.navigate(env.url);const results=[];
    for(const format of ['srt','vtt','smi','sami','ass','ssa']){
      // Each filename gets a distinct original for the format loop; duplicate
      // detection itself is covered above and by its existing regression suite.
      const text=subtitleFixtures[format]+(format==='sami'?'\n<!-- SAMI -->':format==='ssa'?'\n; SSA':''),name='자막.'+format;await chooseFile(page,Buffer.from(text),name);await saved(page,name);
      const state=await page.evaluate(`(async()=>{const r=window.__mediaRecord,d=${doc};return{original:await r.originalFile.text(),scripts:r.metadata.execution.allowScripts,outline:[...document.querySelectorAll('#sidebar [data-heading]')].map(n=>n.textContent),timeSkip:!!d.querySelector('.subtitle-time[data-tts-skip]'),height:document.querySelector('.document-host:not([hidden]) [data-htmlmemo-reading-controls]').getBoundingClientRect().height};})()`);
      assert.equal(state.original,text);assert.equal(state.scripts,false);assert.equal(state.height,24);assert.equal(state.timeSkip,true);assert.deepEqual(state.outline,['00:00:00 – 00:05:00','00:05:00 – 00:10:00']);
      await page.click('#sidebar [data-heading="1"]');assert.equal(await page.evaluate(doc+'.querySelector("#subtitle-section-1").getClientRects().length>0'),true);
      const selected=await page.evaluate(`(()=>{const d=${doc},walk=d.createTreeWalker(d.querySelector('[data-subtitles]'),NodeFilter.SHOW_TEXT);let n;while(n=walk.nextNode()){const at=n.textContent.indexOf('한국어');if(at<0)continue;n.parentElement.scrollIntoView({block:'center'});const range=d.createRange();range.setStart(n,at);range.setEnd(n,at+3);d.getSelection().removeAllRanges();d.getSelection().addRange(range);d.dispatchEvent(new Event('selectionchange'));return d.getSelection().toString();}})()`);assert.equal(selected,'한국어');
      await page.click('#toolbar [data-action=highlight]');await saved(page,name,'window.__mediaRecord.metadata.annotations.length===1');assert.equal(await page.evaluate(doc+'.querySelectorAll("[data-htmlmemo-mark]").length>0'),true);
      await page.click('[data-sidebar-view=search]');await page.evaluate('(()=>{const input=document.querySelector("#book-search");input.value="두 번째";input.dispatchEvent(new Event("input",{bubbles:true}));})()');await page.waitFor('document.querySelector("[data-whole-search-index]")');await page.click('[data-whole-search-index="0"]');
      results.push({format,original:true,outline:2,highlight:true,search:true});
    }
    const archive=await exportDocument(page,'archive');await chooseFile(receiver.page,archive,'captions.librememo');await saved(receiver.page,'자막.ssa','window.__mediaRecord.metadata.annotations.length===1');assert.equal(await receiver.page.evaluate(doc+'.querySelectorAll("[data-htmlmemo-mark]").length>0'),true);
    await page.send('Emulation.setDeviceMetricsOverride',{width:320,height:640,deviceScaleFactor:1,mobile:true});if(await page.evaluate('!document.querySelector("#sidebar").hidden'))await page.click('#close-sidebar');await page.evaluate(doc+'.defaultView.scrollTo(0,0)');assert.equal(await page.evaluate('document.documentElement.scrollWidth>innerWidth'),false);await writeFile(join(root,'test-results/pages-only-subtitles-320.png'),await page.screenshot());
    await chooseFile(page,Buffer.from('invalid'),'broken.srt');await page.waitFor('document.querySelector("#toast").textContent.includes("찾지 못")');assert.equal(await page.evaluate('(async()=> (await(await import("./src/storage.js")).listDocuments()).some(r=>r.name==="broken.srt"))()'),false);
    assert.deepEqual(chrome.errors,[]);assert.deepEqual(receiver.errors,[]);await writeFile(join(root,'test-results/pages-only-subtitle-formats.json'),JSON.stringify({status:'pass',results,archive:true,phone:320,errors:[]},null,2));
  }catch(error){if(chrome)await fail(chrome.page,'subtitles');throw error;}finally{await receiver?.close();await chrome?.close();await env.close();}
});
