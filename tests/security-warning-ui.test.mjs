import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {documentFor,installDOM} from './dom.mjs';
import {isSecurityWarning} from '../public/src/utils.js';
import {Reader} from '../public/src/reader.js';
import {parseHTML,serializeHTML} from '../public/src/document.js';

test('malicious-file messages use an alert and a distinct warning class, which clears for ordinary notices',async()=>{
  const source=await readFile(new URL('../public/src/app.js',import.meta.url),'utf8'),doc=documentFor('<html><body><div id="toast" hidden></div></body></html>');
  const context=vm.createContext({$:selector=>doc.querySelector(selector),isSecurityWarning,setTimeout:()=>1,clearTimeout(){}});
  vm.runInContext(source.slice(source.indexOf('function toast('),source.indexOf('function showError(')),context);
  context.toast('악성코드가 포함되어 있는 파일입니다.',true);const notice=doc.getElementById('toast');
  assert.equal(notice.textContent,'악성코드가 포함되어 있는 파일입니다.');assert.ok(notice.classList.contains('security-warning'));assert.equal(notice.getAttribute('role'),'alert');assert.equal(notice.hidden,false);
  context.toast('저장했습니다.');assert.equal(notice.classList.contains('security-warning'),false);assert.equal(notice.classList.contains('error'),false);assert.equal(notice.getAttribute('role'),'status');
});

test('source TOC warnings preserve nodes, skip normal content, update with text and leave no export markers',()=>{
  assert.equal(isSecurityWarning('악성코드가\n포함되어 있는 파일입니다.'),true);
  installDOM();const message='악성코드가 포함되어 있는 파일입니다.',doc=documentFor('<html><head></head><body><nav><details><summary>블로그</summary><p id="warning">악성<strong>코드가 포함되어 있는</strong> 파일입니다.</p><a href="#chapter">정상 목차</a></details></nav><main><h1 id="chapter">본문</h1><p>'+message+'</p></main></body></html>');
  const r=Object.create(Reader.prototype),sidebar=doc.querySelector('nav'),warning=doc.getElementById('warning'),link=sidebar.querySelector('a');r.doc=doc;r.tocResize={sidebar};let clicks=0;link.addEventListener('click',()=>clicks++);
  r.syncTocSecurityWarnings();assert.deepEqual([...doc.querySelectorAll('[data-htmlmemo-security-warning]')].map(n=>n.id),['warning']);assert.equal(warning.textContent,message);assert.equal(warning.querySelector('strong').textContent,'코드가 포함되어 있는');link.click();assert.equal(clicks,1);
  warning.textContent='정상적으로 열었습니다.';r.syncTocSecurityWarnings();assert.equal(warning.hasAttribute('data-htmlmemo-security-warning'),false);
  const next=doc.createElement('p');next.textContent=message;sidebar.append(next);r.syncTocSecurityWarnings();assert.equal(next.hasAttribute('data-htmlmemo-security-warning'),true);assert.equal(doc.querySelector('main p').hasAttribute('data-htmlmemo-security-warning'),false);
  const exported=documentFor(serializeHTML(doc,parseHTML('<html><body><p>문서</p></body></html>').metadata));assert.equal(exported.querySelector('[data-htmlmemo-security-warning]'),null);assert.equal(exported.querySelector('nav > p').textContent,message);assert.equal(exported.querySelector('a').getAttribute('href'),'#chapter');
});
