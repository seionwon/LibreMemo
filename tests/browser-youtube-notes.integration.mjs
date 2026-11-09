import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createServer} from '../scripts/server.mjs';
import {prepareAssets,root} from '../scripts/assets.mjs';
import {launchChrome} from './chrome.mjs';
import {installYouTubeFixture} from './youtube-player-fixture.mjs';

test('real Chrome: Pages-only YouTube scene notes save, seek, edit, undo, export and survive reload without captions',{timeout:180000},async()=>{
  await prepareAssets();const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await launchChrome();const {page}=browser,url=process.env.HTMLMEMO_SIDEBAR_TEST_URL||'http://127.0.0.1:'+server.address().port+'/';
    await page.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await page.navigate(url);await page.evaluate('('+installYouTubeFixture.toString()+')()');
    const fill=async(selector,value)=>page.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    const state=()=>page.evaluate(`(async()=>{const s=await import('./src/storage.js'),list=await s.listDocuments(),r=list.find(r=>r.metadata.youtube);return r?{id:r.id,count:list.length,annotations:r.metadata.annotations,bookmarks:r.metadata.bookmarks,body:(await s.getDocument(r.id)).html}:null;})()`);
    const inFrame=expression=>page.evaluate(`(()=>{const d=document.querySelector('.document-host:not([hidden]) iframe').contentDocument;return ${expression};})()`);
    await page.click('#youtube-button');await page.click('[data-scene-save]');assert.match(await page.evaluate('document.querySelector("[data-scene-error]").textContent'),/주소/);
    await fill('[data-youtube-url]','https://youtu.be/M7lc1UVf-VE?t=83');assert.equal(await page.evaluate('document.querySelector("[data-scene-time]").value'),'1:23');
    await fill('[data-scene-text]','첫 장면의 핵심 <script>window.unsafeNote=true</script>');await page.click('[data-scene-save]');
    await page.waitFor('!document.querySelector("#dialog").open&&!!document.querySelector("[data-yt=note]")&&!!document.querySelector(".document-host:not([hidden]) iframe")');
    await page.waitFor('document.querySelector(".document-host:not([hidden]) iframe").contentDocument.querySelectorAll("[data-scene-row]").length===1');
    let saved=await state();assert.equal(saved.count,1);assert.equal(saved.annotations.length,1);assert.equal(saved.annotations[0].videoAnchor.seconds,83);const first=saved.annotations[0].id,original=saved.body;
    assert.equal(await inFrame('!!d.querySelector(".youtube-notes script")'),false);assert.equal(await page.evaluate('!!window.unsafeNote'),false);assert.notEqual(await page.evaluate('window.__ytPlayers.at(-1).state'),1);
    assert.equal(await inFrame('d.querySelectorAll("#htmlmemo-annotation-layer [data-htmlmemo-id]").length'),0,'time notes are not drawn at fake document coordinates');
    await page.waitFor('window.__ytPlayers.at(-1).fixtureReady');await page.evaluate('window.__ytPlayers.at(-1).t=140.9;window.__ytPlayers.at(-1).playVideo()');await page.click('[data-yt=note]');assert.equal(await page.evaluate('document.querySelector("[data-scene-time]").value'),'2:20');assert.equal(await page.evaluate('window.__ytPlayers.at(-1).state'),2);
    await fill('[data-scene-text]','두 번째 시점');await page.click('[data-scene-save]');await page.waitFor('!document.querySelector("#dialog").open');saved=await state();assert.equal(saved.annotations.length,2);const second=saved.annotations.find(a=>a.id!==first).id;
    await inFrame(`d.querySelector('[data-scene-edit="${second}"]').click()`);await fill('[data-scene-time]','1:35');await fill('[data-scene-text]','수정한 장면');await page.click('[data-scene-save]');await page.waitFor('!document.querySelector("#dialog").open');
    saved=await state();assert.equal(saved.annotations.find(a=>a.id===second).videoAnchor.seconds,95);assert.equal(saved.body,original,'notes never rewrite the immutable reading source');
    await inFrame(`d.querySelector('[data-scene-play="${second}"]').click()`);assert.deepEqual(await page.evaluate('({time:window.__ytPlayers.at(-1).t,state:window.__ytPlayers.at(-1).state})'),{time:95,state:1});assert.equal(await page.evaluate('document.querySelectorAll(".tab").length'),1,'playing a scene never opens a browser tab');
    await inFrame(`d.querySelector('[data-scene-edit="${second}"]').click()`);await fill('[data-scene-text]','취소할 변경');await page.click('#dialog [data-dialog-close]');assert.equal((await state()).annotations.find(a=>a.id===second).text,'수정한 장면');
    await inFrame(`d.querySelector('[data-scene-delete="${second}"]').click()`);await page.click('#dialog button[value=confirm]');await page.waitFor('!document.querySelector("#dialog").open');await page.waitFor('document.querySelector(".document-host:not([hidden]) iframe").contentDocument.querySelectorAll("[data-scene-row]").length===1');
    await page.click('#toolbar [data-action=undo]');await page.waitFor('document.querySelector(".document-host:not([hidden]) iframe").contentDocument.querySelectorAll("[data-scene-row]").length===2');
    await page.waitFor('document.querySelector("#status-left").textContent.includes("자동 저장됨")');
    // Append through the library entry again: no second document for the same video.
    await page.click('#library-tab');await page.click('#youtube-button');await fill('[data-youtube-url]','https://youtu.be/M7lc1UVf-VE?t=10');await fill('[data-scene-text]','링크로 추가한 장면');await page.click('[data-scene-save]');await page.waitFor('!document.querySelector("#dialog").open');saved=await state();assert.equal(saved.count,1);assert.equal(saved.annotations.length,3);
    const roundtrip=await page.evaluate(`(async()=>{const s=await import('./src/storage.js'),{parseHTML,serializeHTML}=await import('./src/document.js'),{createDocumentArchive,readDocumentArchive}=await import('./src/document-archive.js');const r=await s.getDocument(${JSON.stringify(saved.id)}),d=document.querySelector('.document-host:not([hidden]) iframe').contentDocument,html=serializeHTML(d,r.metadata),again=parseHTML(html),archive=await readDocumentArchive(await createDocumentArchive({name:r.name,original:new Blob([r.html]),metadata:r.metadata}));return {times:again.metadata.annotations.map(a=>a.videoAnchor.seconds).sort((a,b)=>a-b),links:new DOMParser().parseFromString(html,'text/html').querySelectorAll('[data-htmlmemo-video-notes] a').length,archiveVideo:archive.metadata.youtube.videoId,archiveCount:archive.metadata.annotations.length};})()`);
    assert.deepEqual(roundtrip,{times:[10,83,95],links:3,archiveVideo:'M7lc1UVf-VE',archiveCount:3});
    // Both sidebar routing and the reader list address the same annotation ID.
    await page.evaluate(`(()=>{const d=document.querySelector('.document-host:not([hidden]) iframe').contentDocument,button=d.querySelector('[data-sidebar-view=annotations]')||document.querySelector('[data-sidebar-view=annotations]');button.click();const panel=button.closest('section,aside');panel.querySelector('[data-annotation-group=video-notes] summary').click();panel.querySelector('[data-annotation="${first}"]').click();})()`);assert.equal(await page.evaluate('window.__ytPlayers.at(-1).t'),83);
    await mkdir(root+'/test-results',{recursive:true});await writeFile(root+'/test-results/youtube-moments-desktop.png',await page.screenshot());
    // Narrow portrait and landscape: composer keeps all controls inside the dialog.
    const layouts=[];
    for(const [width,height] of [[320,568],[568,320]]){
      await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});await page.click('[data-yt=note]');
      const layout=await page.evaluate(`(()=>{const d=document.querySelector('#dialog'),r=d.getBoundingClientRect();return {width:innerWidth,height:innerHeight,fit:r.left>=-1&&r.right<=innerWidth+1&&r.top>=-1&&r.bottom<=innerHeight+1,overflow:d.scrollWidth>d.clientWidth+1};})()`);assert.equal(layout.fit,true);assert.equal(layout.overflow,false);layouts.push(layout);
      await writeFile(root+'/test-results/youtube-moments-'+width+'.png',await page.screenshot());await page.click('#dialog [data-dialog-close]');
    }
    await page.navigate(url);await page.evaluate('('+installYouTubeFixture.toString()+')()');await page.click(`[data-open="${saved.id}"]`);await page.waitFor('!!document.querySelector("[data-yt=note]")');await page.waitFor('document.querySelector(".document-host:not([hidden]) iframe").contentDocument.querySelectorAll("[data-scene-row]").length===3');assert.equal((await state()).annotations.length,3);
    // Adding captions later keeps every time anchor; none goes through text matching.
    await page.evaluate(`window.showOpenFilePicker=async()=>[{getFile:async()=>new File(['1\\n00:00:01,000 --> 00:00:04,000\\n새 자막 첫 문장\\n\\n2\\n00:01:20,000 --> 00:01:30,000\\n다음 자막 문장\\n'],'later.srt',{type:'text/plain'})}];`);
    await page.click('[data-yt=attach]');await page.waitFor('!!document.querySelector("#dialog button[value=confirm]")');await page.click('#dialog button[value=confirm]');
    await page.waitFor('document.querySelector(".document-host:not([hidden]) iframe")?.contentDocument.querySelectorAll(".subtitle-cue").length===2');
    await page.waitFor('document.querySelector(".document-host:not([hidden]) iframe").contentDocument.querySelectorAll("[data-scene-row]").length===3');
    assert.deepEqual((await state()).annotations.map(a=>a.videoAnchor.seconds).sort((a,b)=>a-b),[10,83,95]);
    await writeFile(root+'/test-results/youtube-moments-verification.json',JSON.stringify({layouts,annotations:3,singleDocument:true,sourceUnchanged:true,reload:true,exportRoundTrip:true,deleteUndo:true,captionAttachmentPreservesTimes:true,playerBoundary:'deterministic YouTube API fixture; no external playback assertion'},null,2));assert.deepEqual(browser.errors,[]);
  }catch(error){if(browser)await writeFile(root+'/test-results/youtube-moments-failure.png',await browser.page.screenshot()).catch(()=>{});throw error;}
  finally{await browser?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
