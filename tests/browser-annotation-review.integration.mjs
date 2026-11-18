import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createServer} from '../scripts/server.mjs';
import {prepareAssets, root} from '../scripts/assets.mjs';
import {launchChrome} from './chrome.mjs';
import {seedReviewDocument} from './annotation-review-fixture.mjs';

test('real Chrome: Pages-only annotated passages can be filtered by a saved palette name and copied as Markdown', {timeout:120000}, async () => {
  await prepareAssets();
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = process.env.HTMLMEMO_SIDEBAR_TEST_URL || 'http://127.0.0.1:' + server.address().port + '/';
  const directory = join(root, 'test-results');
  await mkdir(directory, {recursive:true});
  let browser;
  try {
    browser = await launchChrome();
    const {page} = browser;
    await page.send('Emulation.setDeviceMetricsOverride', {width:1280,height:850,deviceScaleFactor:1,mobile:false});
    await page.navigate(url);
    await page.evaluate('(' + seedReviewDocument.toString() + ')()');
    const openBook = async () => {
      await page.waitFor('!!document.querySelector("[data-open=review-book]")');
      await page.click('[data-open=review-book]');
      await page.waitFor('!document.querySelector("#toolbar").hidden && !!document.querySelector("#sidebar [data-sidebar-view=annotations]")');
    };
    await openBook();
    const query = '#sidebar [data-annotation-query]';
    const color = '#sidebar [data-annotation-color]';
    const fill = async (selector, value, eventName='input') => page.evaluate(
      `(() => { const e=document.querySelector(${JSON.stringify(selector)}); e.value=${JSON.stringify(value)}; e.dispatchEvent(new Event(${JSON.stringify(eventName)}, {bubbles:true})); })()`
    );
    const ids = 'Array.from(document.querySelectorAll("#sidebar .annotation-row:not([hidden]) [data-annotation]"), e => e.dataset.annotation).sort()';
    const matches = async expected => page.waitFor('JSON.stringify(' + ids + ') === ' + JSON.stringify(JSON.stringify(expected)));
    const originalMarks = await page.evaluate('(async () => (await (await import("./src/storage.js")).getDocument("review-book")).metadata.annotations)()');
    await page.click('#sidebar [data-sidebar-view=annotations]');
    await page.waitFor('!!document.querySelector(' + JSON.stringify(query) + ')');
    await fill(query, '비교한다');
    await matches(['review-note','review-underline']);
    await page.click('#sidebar [data-annotation=review-underline]');
    await page.waitFor(`(() => {
      const frame = document.querySelector('.document-host:not([hidden]) iframe.document-frame');
      const mark = frame.contentDocument.querySelector('[data-htmlmemo-mark][data-htmlmemo-id=review-underline]');
      if (!mark) return false;
      const iframeRect = frame.getBoundingClientRect(), rect = mark.getBoundingClientRect();
      const viewport = frame.closest('.reader-viewport').getBoundingClientRect();
      const scale = iframeRect.width / frame.clientWidth;
      const top = iframeRect.top + rect.top * scale, bottom = iframeRect.top + rect.bottom * scale;
      return bottom > viewport.top && top < viewport.bottom;
    })()`);
    await fill(query, '없는말');
    await matches([]);
    await fill(query, '');
    await matches(['review-highlight','review-note','review-underline']);

    await page.click('#toolbar [data-action=palette]');
    await page.click('#highlight-color-names summary');
    await page.waitFor('!!document.querySelector(\'[data-highlight-color-name="#fde047"]\')');
    await fill('[data-highlight-color-name="#fde047"]', '핵심');
    await page.click('[data-save-highlight-names]');
    await page.waitFor('Array.from(document.querySelectorAll(' + JSON.stringify(color + ' option') + ')).some(o => o.textContent.includes("핵심"))');
    if (await page.evaluate('!document.querySelector("#tool-popover").hidden')) await page.click('[data-popover-close]');
    await fill(color, '#fde047', 'change');
    await matches(['review-highlight']); // excludes the memo with the same ink colour.
    await fill(query, '관찰 일지');
    await matches(['review-highlight']);
    const target = '#sidebar [data-annotation=review-highlight]';
    assert.equal(await page.evaluate('!!document.querySelector(' + JSON.stringify(target) + ')?.getClientRects().length'), true);
    await page.click(target);
    await writeFile(join(directory, 'pages-only-review-search.png'), await page.screenshot());

    await page.send('Browser.grantPermissions', {origin:new URL(url).origin, permissions:['clipboardReadWrite','clipboardSanitizedWrite']});
    await page.click('#save-page');
    await page.waitFor('!!document.querySelector("[data-excerpt-copy]:enabled")');
    await page.click('[data-excerpt-copy]');
    await page.waitFor('(async () => (await navigator.clipboard.readText()).includes("다시 확인할 질문"))()');
    const copied = await page.evaluate('navigator.clipboard.readText()');
    for (const text of ['독서 모임 노트','관찰 일지는 같은 자리에서 시작한다.','다음 답사에서 빛의 방향을 비교한다.','다시 확인할 질문']) assert.ok(copied.includes(text), text);
    assert.ok(copied.includes('> '), 'passages are Markdown quotations');
    // Only the clipboard boundary fails here. The same excerpt must still be available for manual copying.
    await page.send('Emulation.setDeviceMetricsOverride', {width:320,height:568,deviceScaleFactor:1,mobile:true});
    await page.evaluate('Object.defineProperty(navigator, "clipboard", {configurable:true, value:{writeText:async () => {throw new DOMException("Denied","NotAllowedError");}}})');
    if (!await page.evaluate('document.querySelector("#dialog").open')) await page.click('#save-page');
    await page.waitFor('!!document.querySelector("[data-excerpt-copy]:enabled")');
    await page.click('[data-excerpt-copy]');
    await page.waitFor('!!document.querySelector("[data-excerpt-manual]")?.getClientRects().length');
    assert.equal(await page.evaluate('document.querySelector("[data-excerpt-manual]").value'), copied);
    assert.equal(await page.evaluate(`(() => {
      const field = document.querySelector('[data-excerpt-manual]'), dialog = field.closest('dialog');
      const rect = dialog.getBoundingClientRect();
      return field.readOnly && field.selectionStart === 0 && field.selectionEnd === field.value.length
        && rect.left >= -1 && rect.right <= innerWidth + 1 && dialog.scrollWidth <= dialog.clientWidth + 1;
    })()`), true);
    await writeFile(join(directory, 'pages-only-review-excerpt.png'), await page.screenshot());

    await page.send('Emulation.setDeviceMetricsOverride', {width:1280,height:850,deviceScaleFactor:1,mobile:false});
    await page.navigate(url);
    await openBook();
    await page.click('#sidebar [data-sidebar-view=annotations]');
    await page.waitFor('Array.from(document.querySelectorAll(' + JSON.stringify(color + ' option') + ')).some(o => o.textContent.includes("핵심"))');
    await fill(color, '#fde047', 'change');
    await matches(['review-highlight']);
    const saved = await page.evaluate('(async () => (await (await import("./src/storage.js")).getDocument("review-book")).metadata.annotations)()');
    assert.deepEqual(saved, originalMarks);
    assert.deepEqual(browser.errors, []);
    await writeFile(join(directory, 'pages-only-review-result.json'), JSON.stringify({search:true, jumpToPassage:true, namedHighlights:true, persistedColorName:true, originalMarksPreserved:true, clipboard:true, mobileManualCopy:true, errors:browser.errors}));
  } catch (error) {
    if (browser) await writeFile(join(directory, 'pages-only-review-failure.png'), await browser.page.screenshot()).catch(() => {});
    throw error;
  } finally {
    await browser?.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
