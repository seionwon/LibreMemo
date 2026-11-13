import {chooseDocumentExport} from './export-flow.mjs';
// Requires permission to bind localhost and launch a dedicated Chrome process.
// These are real browser checks, separate from the DOM/unit test suite.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { root, prepareAssets } from '../scripts/assets.mjs';
import { createServer } from '../scripts/server.mjs';
import { launchChrome } from './chrome.mjs';
import { FORMAT_VERSION } from '../public/src/model.js';
test('real Chrome: MemoSuite TTS toolbar in LibreMemo',{timeout:90000},async t=>{
  await prepareAssets();await mkdir(join(root,'test-results'),{recursive:true});const folder=await mkdtemp(join(tmpdir(),'htmlmemo-web-test-'));await cp(join(root,'public'),folder,{recursive:true});await cp(join(root,'tests/fixtures'),join(folder,'fixtures'),{recursive:true});
  const server=createServer(folder);let chrome;
  try{
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});const url=`http://127.0.0.1:${server.address().port}/`;chrome=await launchChrome();const page=chrome.page;
    await page.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await page.navigate(url);await page.waitFor('document.querySelector("#status-left").textContent.includes("개의 문서")');
    await t.test('browser navigation and single-file capture',async()=>{
      await page.evaluate(`document.querySelector('#address').value=${JSON.stringify(url+'fixtures/capture.html')};document.querySelector('#address-form').requestSubmit();`);
      await page.waitFor('document.querySelector(".browser-frame")?.contentDocument?.title === "캡처 검증 문서"');
      // A native OPFS FileSystemFileHandle exercises the same browser write and
      // IndexedDB structured-clone contracts as an external picked file.
      await page.evaluate(`window.showSaveFilePicker=async()=>{const root=await navigator.storage.getDirectory();return root.getFileHandle('picked-document.html',{create:true});};`);
      await chooseDocumentExport(page,'html');await page.waitFor('!document.querySelector("#toolbar").hidden && document.querySelector("#status-left").textContent.includes("자동 저장됨")');
      await chooseDocumentExport(page,'html');await page.waitFor(`(async()=>{try{const root=await navigator.storage.getDirectory();return (await(await root.getFileHandle('picked-document.html')).getFile()).size>0;}catch{return false;}})()`);
      const html=await page.evaluate(`(async()=>{const root=await navigator.storage.getDirectory();return (await (await root.getFileHandle('picked-document.html')).getFile()).text();})()`);assert.match(html,/data:image\/svg\+xml;base64/);assert.match(html,/htmlmemo-data/);assert.ok(!html.includes('fixtureLoaded'));
    });
    await t.test('compact toolbar opens without speech and retains all playback controls',async()=>{try {
      await page.evaluate(`window.__speechCalls=[];window.__utterances=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;this.rate=1;this.pitch=1;this.volume=1;this.voice=null;}};const engine=new EventTarget();engine.getVoices=()=>[{voiceURI:'ko-test',name:'Google 한국어',lang:'ko-KR',localService:false},{voiceURI:'junk',name:'eSpeak',lang:'ko-KR',localService:true},{voiceURI:'en-test',name:'Google English',lang:'en-US',localService:false}];engine.cancel=()=>window.__speechCalls.push(['cancel']);engine.speak=u=>{window.__utterances.push(u);window.__speechCalls.push(['speak',u.text,u.lang,u.rate]);u.onstart?.();};void Object.defineProperty(window,'speechSynthesis',{configurable:true,value:engine});`);
      await page.evaluate(`(()=>{const d=document.querySelector('.document-host:not([hidden]) iframe').contentDocument;const sidebar=d.createElement('aside');sidebar.textContent='읽으면 안 되는 사이드바 목차.';d.body.prepend(sidebar);const toc=d.createElement('nav');toc.textContent='읽으면 안 되는 본문 안 목차.';d.querySelector('main').prepend(toc);})()`);
      assert.equal(await page.evaluate('!!document.querySelector("#toolbar [data-action=speak],#toolbar [data-action=zoom]")'),false);
      await page.click('.document-host:not([hidden]) > [data-htmlmemo-reading-controls] [data-action=speak]');
      await page.waitFor('!!document.querySelector("[data-memo-readaloud]")');
      assert.deepEqual(await page.evaluate('window.__speechCalls'),[]);
      assert.deepEqual(await page.evaluate('[...document.querySelectorAll(".mstts-player > button")].map(b=>b.textContent)'),['▶','⏮','⏭','1×','⚙','⏹','✕']);
      assert.deepEqual(await page.evaluate(`(()=>{const s=getComputedStyle(document.querySelector('.mstts-player'));return [s.padding,s.gap,s.borderRadius,s.fontSize,s.fontWeight,s.position];})()`),['0px 3px','1px','999px','10px','600','fixed']);
      assert.equal(await page.evaluate(`(()=>{const bar=document.querySelector('.mstts-player'),r=bar.getBoundingClientRect();return r.height===20&&r.width<185&&[...bar.querySelectorAll(':scope > button')].every(b=>b.getBoundingClientRect().height===18);})()`),true);
      await page.click('.mstts-player [aria-label="낭독 설정"]');
      await page.waitFor('!!document.querySelector(".mstts-panel")');
      await page.click('.mstts-select-trigger[aria-label="음성"]');
      assert.deepEqual(await page.evaluate('[...document.querySelectorAll("[role=option]")].map(b=>b.textContent.replace("✓",""))'),['자동 (UI 언어)','Google 한국어']);
      await page.evaluate(`document.querySelectorAll('[role=option]')[1].click();`);
      assert.equal(await page.evaluate('localStorage.getItem("msuite_tts_voice_ko")'),'ko-test');
      await writeFile(join(root,'test-results/reading-controls-tts-desktop.png'),await page.screenshot());
      await page.click('.mstts-player [aria-label="소리내어 읽기"]');
      await page.waitFor('window.__utterances.length===1');
      assert.equal(await page.evaluate('window.__utterances[0].voice.voiceURI'),'ko-test');
      assert.equal(await page.evaluate('!!document.querySelector(".mstts-panel")'),false);
      assert.equal(await page.evaluate('!!document.querySelector(".document-host:not([hidden]) iframe").contentWindow.CSS.highlights.get("mstts")'),true);
      const first=await page.evaluate('window.__utterances[0].text');
      assert.equal(first,'캡처 검증 문서');
      await page.click('.mstts-player [aria-label="일시정지"]');
      await page.evaluate('window.__utterances[0].onend()');
      assert.equal(await page.evaluate('window.__utterances.length'),1);
      await page.click('.mstts-player [aria-label="소리내어 읽기"]');
      assert.equal(await page.evaluate('window.__utterances.at(-1).text'),first);
      await page.click('.mstts-player [aria-label="다음 문장"]');
      assert.notEqual(await page.evaluate('window.__utterances.at(-1).text'),first);
      await page.click('.mstts-player [aria-label="이전 문장"]');
      assert.equal(await page.evaluate('window.__utterances.at(-1).text'),first);
      await page.click('.mstts-player [aria-label="읽는 속도"]');
      assert.equal(await page.evaluate('localStorage.getItem("msuite_tts_rate")'),'1.25');
      await page.click('.mstts-player [aria-label="정지"]');
      assert.equal(await page.evaluate('!!document.querySelector(".mstts-player")'),true);
      assert.equal(await page.evaluate('!!document.querySelector(".document-host:not([hidden]) iframe").contentWindow.CSS.highlights.get("mstts")'),false);
      await page.click('.mstts-player [aria-label="낭독 설정"]');
      await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      assert.equal(await page.evaluate('!!document.querySelector(".mstts-panel")'),false);
      assert.equal(await page.evaluate('!!document.querySelector(".mstts-player")'),true);
      await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      assert.equal(await page.evaluate('!!document.querySelector(".mstts-player")'),false);
      await page.click('.document-host:not([hidden]) > [data-htmlmemo-reading-controls] [data-action=speak]');
      assert.equal(await page.evaluate(`document.querySelector('.mstts-player [aria-label="읽는 속도"]').textContent`),'1.25×');
      await page.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
      await page.click('.mstts-player [aria-label="낭독 설정"]');
      await writeFile(join(root,'test-results/reading-controls-tts-mobile.png'),await page.screenshot());
      assert.equal(await page.evaluate(`(()=>{const r=document.querySelector('.mstts-player').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})()`),true);
      await page.click('.mstts-player [aria-label="낭독 설정"]');
      // Real pointer drag, not a CSS-only position change.
      const grip=await page.evaluate(`(()=>{const r=document.querySelector('.mstts-grip').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await page.send('Input.dispatchMouseEvent',{type:'mousePressed',x:grip.x,y:grip.y,button:'left',clickCount:1});
      await page.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:grip.x+32,y:150,button:'left',buttons:1});
      await page.send('Input.dispatchMouseEvent',{type:'mouseReleased',x:grip.x+32,y:150,button:'left',clickCount:1});
      const moved=await page.evaluate('document.querySelector(".mstts-player").getBoundingClientRect().top');
      assert.ok(moved<200);
      await page.click('.mstts-player [aria-label="플레이어 닫기"]');await page.click('.document-host:not([hidden]) > [data-htmlmemo-reading-controls] [data-action=speak]');
      assert.equal(await page.evaluate('document.querySelector(".mstts-player").getBoundingClientRect().top'),moved);
      await page.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
      await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'f',code:'KeyF',windowsVirtualKeyCode:70});await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'f',code:'KeyF',windowsVirtualKeyCode:70});
      await page.waitFor('document.querySelector("#app").classList.contains("reader-focus")');
      assert.equal(await page.evaluate('document.querySelector("#app").contains(document.querySelector(".mstts-player"))'),true);
      await page.click('.mstts-player [aria-label="소리내어 읽기"]');
      const count=await page.evaluate('window.__utterances.length');
      await page.click('.mstts-player [aria-label="플레이어 닫기"]');
      await page.evaluate('window.__utterances.at(-1).onend()');assert.equal(await page.evaluate('window.__utterances.length'),count);
      await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      await page.waitFor('!document.querySelector("#app").classList.contains("reader-focus")');
      await page.click('.document-host:not([hidden]) > [data-htmlmemo-reading-controls] [data-action=speak]');await page.click('#library-tab');
      assert.equal(await page.evaluate('!!document.querySelector(".mstts-player")'),false);
      assert.equal(await page.evaluate('window.__utterances.some(u=>u.text.includes("읽으면 안 되는"))'),false);
      assert.equal(chrome.errors.length,0,chrome.errors.join('\n'));
      }catch(error){console.error(error,chrome.errors,await page.evaluate('({toast:document.querySelector("#toast")?.textContent,bar:document.querySelector(".mstts-player")?.outerHTML,calls:window.__speechCalls})'));throw error;}
    });
    await t.test('pause, scroll and play starts at topmost visible line and preserves visible scroll position',async()=>{
      const lines=Array.from({length:45},(_,i)=>i===8
        ?'<p id="multi-line">다문장 첫째 줄입니다.<br>다문장 둘째 줄입니다.<br>다문장 셋째 줄입니다.</p>'
        :`<p id="row-${i}">스크롤 검증 문장 ${i}입니다.</p>`).join('');
      const html=`<!doctype html><html lang="ko"><head><title>TTS 최상단 줄 검증</title><style>html,body{margin:0;font:16px/24px system-ui}main{padding:12px 24px 800px}p{margin:0 0 4px}</style></head><body><main data-tts-root>${lines}</main></body></html>`;
      await page.send('Emulation.setDeviceMetricsOverride',{width:1280,height:720,deviceScaleFactor:1,mobile:false});
      await page.evaluate(`(()=>{window.__utterances=[];const t=new DataTransfer();t.items.add(new File([${JSON.stringify(html)}],'tts-top-line.html',{type:'text/html'}));const input=document.querySelector('#file-input');input.files=t.files;input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
      await page.waitFor('document.querySelector(".document-host:not([hidden]) iframe")?.contentDocument?.title==="TTS 최상단 줄 검증"&&document.querySelector(".document-host:not([hidden]) iframe")?.style.visibility==="visible"');
      await page.click('.document-host:not([hidden]) > [data-htmlmemo-reading-controls] [data-action=speak]');
      await page.waitFor('!!document.querySelector(".mstts-player")');
      await page.click('.mstts-player [aria-label="소리내어 읽기"]');
      await page.waitFor('window.__utterances.length===1');
      assert.equal(await page.evaluate('window.__utterances.at(-1).text'),'스크롤 검증 문장 0입니다.');
      await page.click('.mstts-player [aria-label="일시정지"]');

      // Scroll row-5 right to the very top of the viewport (+4px) so row-4 is offscreen above and row-6 is 2nd line.
      const readScroll=()=>page.evaluate(`(()=>{const v=document.querySelector('.document-host:not([hidden]) .reader-viewport'),f=v.querySelector('iframe'),scale=f.getBoundingClientRect().width/f.offsetWidth;return v.classList.contains('reader-native-scroll')?f.contentWindow.scrollY*scale:v.scrollTop;})()`);
      const scrollTargetToTop=expr=>page.evaluate(`(()=>{
        const v=document.querySelector('.document-host:not([hidden]) .reader-viewport'),f=v.querySelector('iframe'),d=f.contentDocument;
        const b=f.getBoundingClientRect(),scale=b.width/f.offsetWidth,targetY=${expr};
        const delta=b.top+targetY*scale-(v.getBoundingClientRect().top+4);
        if(v.classList.contains('reader-native-scroll'))d.defaultView.scrollBy(0,delta/scale);else v.scrollTop+=delta;
      })()`);
      await scrollTargetToTop('d.getElementById("row-5").getBoundingClientRect().top');
      await page.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
      const scrolledTop=await readScroll();
      assert.ok(scrolledTop>50);
      await page.click('.mstts-player [aria-label="소리내어 읽기"]');
      assert.equal(await page.evaluate('window.__utterances.at(-1).text'),'스크롤 검증 문장 5입니다.');
      assert.ok(Math.abs((await readScroll())-scrolledTop)<1,'topmost visible line must not trigger forced scroll');

      // Pause and scroll halfway into #multi-line so its 2nd line is the topmost visible line.
      await page.click('.mstts-player [aria-label="일시정지"]');
      await scrollTargetToTop('d.getElementById("multi-line").getBoundingClientRect().top+25');
      await page.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))');
      const multiScrollTop=await readScroll();
      await page.click('.mstts-player [aria-label="소리내어 읽기"]');
      assert.equal(await page.evaluate('window.__utterances.at(-1).text'),'다문장 둘째 줄입니다.');
      assert.ok(Math.abs((await readScroll())-multiScrollTop)<1,'partially scrolled paragraph keeps user scrollTop');

      // Advance while lines remain visible -> scroll stays untouched; once past bottom -> scrolls into view.
      for(let step=0;step<6;step++){
        await page.evaluate('window.__utterances.at(-1).onend()');
        assert.ok(Math.abs((await readScroll())-multiScrollTop)<1);
      }
      let autoScrolled=false;
      for(let step=0;step<35;step++){
        await page.evaluate('window.__utterances.at(-1).onend()');
        if((await readScroll())>multiScrollTop+100){autoScrolled=true;break;}
      }
      assert.equal(autoScrolled,true,'advancing past bottom of viewport scrolls new line into view');
      await page.click('.mstts-player [aria-label="플레이어 닫기"]');
    });
  } finally { await chrome?.close();await new Promise(resolve=>server.close(resolve));await rm(folder,{recursive:true,force:true}); }
});
