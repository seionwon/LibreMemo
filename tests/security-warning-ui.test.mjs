import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {documentFor} from './dom.mjs';

test('malicious-file messages use an alert and a distinct warning class, which clears for ordinary notices',async()=>{
  const source=await readFile(new URL('../public/src/app.js',import.meta.url),'utf8'),doc=documentFor('<html><body><div id="toast" hidden></div></body></html>');
  const context=vm.createContext({$:selector=>doc.querySelector(selector),setTimeout:()=>1,clearTimeout(){}});
  vm.runInContext(source.slice(source.indexOf('function isSecurityWarning('),source.indexOf('function showError(')),context);
  context.toast('악성코드가 포함되어 있는 파일입니다.',true);const notice=doc.getElementById('toast');
  assert.equal(notice.textContent,'악성코드가 포함되어 있는 파일입니다.');assert.ok(notice.classList.contains('security-warning'));assert.equal(notice.getAttribute('role'),'alert');assert.equal(notice.hidden,false);
  context.toast('저장했습니다.');assert.equal(notice.classList.contains('security-warning'),false);assert.equal(notice.classList.contains('error'),false);assert.equal(notice.getAttribute('role'),'status');
});
