import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DOMParser} from 'linkedom';
import {
  THEME_CATEGORIES,
  APP_THEMES,
  THEME_SHAPE_OPTIONS,
  THEME_TEXTURE_OPTIONS,
  THEME_FONT_OPTIONS,
  THEME_FRAME_OPTIONS,
  THEME_ACCENT_PRESETS,
  DEFAULT_DESIGN_THEME,
  contrastRatio,
  normalizeDesignTheme,
  resolveDesignTheme,
  applyDesignThemeToDocument,
  describeDesignTheme,
} from '../public/src/app-themes.js';
import {normalizePreferences, storePreferences, loadPreferences, serializeSettings, parseSettings} from '../public/src/preferences.js';
import {syncSettingsDifferences} from '../public/src/sync-adapter.js';
import {supportsDataFolder, supportsIOSAppStorage, isIOSAppStorageHandle, openIOSAppStorage} from '../public/src/data-folder.js';

test('all 28 built-in design themes have unique IDs, valid categories and WCAG AA >= 4.5 contrast in both Light and Dark modes', () => {
  assert.equal(APP_THEMES.length, 28);
  const ids = new Set(APP_THEMES.map(t => t.id));
  assert.equal(ids.size, APP_THEMES.length);
  const categoryIds = new Set(THEME_CATEGORIES.filter(c => c.id !== 'all').map(c => c.id));
  assert.equal(categoryIds.size, 6);
  for (const catId of categoryIds) {
    assert.ok(APP_THEMES.some(t => t.category === catId), `category ${catId} has themes`);
  }

  for (const theme of APP_THEMES) {
    assert.ok(categoryIds.has(theme.category), `${theme.id} valid category`);
    for (const mode of ['light', 'dark']) {
      const resolved = resolveDesignTheme({id: theme.id}, mode);
      const v = resolved.variables;
      const textVsBg = contrastRatio(v['--text'], v['--bg']);
      const textVsSurface = contrastRatio(v['--text'], v['--surface']);
      const onAccentVsAccent = contrastRatio(v['--on-green'], v['--green']);
      const btnInkVsBtnBg = contrastRatio(v['--btn-primary-ink'], v['--btn-primary-bg']);
      const btnInkVsDesignBrand = contrastRatio(v['--btn-primary-ink'], v['--design-brand']);
      const toastInkVsToastBg = contrastRatio(v['--toast-ink'], v['--toast-bg']);
      assert.ok(textVsBg >= 4.5, `${theme.id}/${mode} text vs bg contrast ${textVsBg}`);
      assert.ok(textVsSurface >= 4.5, `${theme.id}/${mode} text vs surface contrast ${textVsSurface}`);
      assert.ok(onAccentVsAccent >= 4.5, `${theme.id}/${mode} onAccent vs accent contrast ${onAccentVsAccent}`);
      assert.ok(btnInkVsBtnBg >= 4.5, `${theme.id}/${mode} buttonInk vs buttonBg contrast ${btnInkVsBtnBg}`);
      assert.ok(btnInkVsDesignBrand >= 4.5, `${theme.id}/${mode} buttonInk vs designBrand contrast ${btnInkVsDesignBrand}`);
      assert.ok(toastInkVsToastBg >= 4.5, `${theme.id}/${mode} toastInk vs toastBg contrast ${toastInkVsToastBg}`);
    }
  }
});

test('5 customization axes and custom accent colors auto-adapt for readability and round-trip through preferences and device sync', () => {
  assert.ok(THEME_SHAPE_OPTIONS.length >= 5);
  assert.ok(THEME_TEXTURE_OPTIONS.length >= 8);
  assert.ok(THEME_FONT_OPTIONS.length >= 6);
  assert.ok(THEME_FRAME_OPTIONS.length >= 7);
  assert.equal(THEME_ACCENT_PRESETS.length, 16);

  for (const accent of ['#ffff00', '#050505', ...THEME_ACCENT_PRESETS]) {
    for (const mode of ['light', 'dark']) {
      const resolved = resolveDesignTheme({id: 'hanji-library', shape: 'round', texture: 'grid', font: 'serif', frame: 'brutal', accent}, mode);
      assert.equal(resolved.shape, 'round');
      assert.equal(resolved.texture, 'grid');
      assert.equal(resolved.font, 'serif');
      assert.equal(resolved.frame, 'brutal');
      assert.equal(resolved.usesBundledFont, 'LibreMemo Serif');
      assert.ok(contrastRatio(resolved.variables['--green'], resolved.variables['--surface']) >= 4.5, `accent ${accent}/${mode} readable on surface`);
      assert.ok(contrastRatio(resolved.variables['--on-green'], resolved.variables['--green']) >= 4.5, `onAccent readable on ${accent}/${mode}`);
    }
  }

  const localMap = new Map();
  const storage = {getItem: k => localMap.get(k) ?? null, setItem: (k, v) => localMap.set(k, v)};
  const stored = storePreferences({
    theme: 'dark',
    designTheme: {id: 'cupertino-glass', shape: 'round', texture: 'glow', font: 'rounded', frame: 'glass', accent: '#1D4ED8'},
  }, storage);
  assert.equal(stored.designTheme.accent, '#1d4ed8');
  assert.deepEqual(loadPreferences(storage), stored);
  assert.deepEqual(parseSettings(serializeSettings(stored)).preferences, stored);
  assert.match(describeDesignTheme(stored.designTheme), /쿠퍼티노 프로스트 글래스/);

  const baseEntries = {[`htmlmemo-preferences-v1`]: JSON.stringify(normalizePreferences())};
  const customEntries = {[`htmlmemo-preferences-v1`]: JSON.stringify(stored)};
  const diffs = syncSettingsDifferences({entries: baseEntries}, {entries: customEntries}).map(r => r.label);
  assert.ok(diffs.includes('화면 테마'));
  assert.ok(diffs.includes('디자인 테마'));

  for (const bad of [null, 'hanji-library', [], {id: 'nonexistent'}, {shape: 'hexagon'}, {texture: 'marble'}, {font: 'comic'}, {frame: 'neon'}, {accent: 'red'}, {accent: '#123'}]) {
    assert.throws(() => normalizeDesignTheme(bad));
    assert.throws(() => normalizePreferences({designTheme: bad}));
  }
});

test('applyDesignThemeToDocument updates root dataset attributes, CSS variables and Android/iOS status-bar meta tags', async () => {
  const doc = new DOMParser().parseFromString(
    '<!doctype html><html><head><meta name="theme-color" content="#334155"><meta name="apple-mobile-web-app-status-bar-style" content="default"></head><body></body></html>',
    'text/html',
  );
  const darkCyber = applyDesignThemeToDocument(doc, 'dark', {id: 'cyber-terminal'});
  assert.equal(doc.documentElement.dataset.theme, 'dark');
  assert.equal(doc.documentElement.dataset.skin, 'cyber-terminal');
  assert.equal(doc.documentElement.dataset.skinShape, 'sharp');
  assert.equal(doc.documentElement.dataset.skinTexture, 'scanline');
  assert.equal(doc.documentElement.dataset.skinFont, 'mono');
  assert.equal(doc.documentElement.dataset.skinFrame, 'editorial');
  assert.equal(doc.querySelector('meta[name="theme-color"]').getAttribute('content'), darkCyber.themeColor);
  assert.equal(doc.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute('content'), 'black-translucent');
  const styleSheetText = doc.querySelector('#librememo-design-theme')?.textContent || '';
  assert.match(styleSheetText, /:root\{color-scheme:light;[^}]*--surface:#f7fcf9/);
  assert.match(styleSheetText, /:root\[data-theme="dark"\]\{color-scheme:dark;[^}]*--surface:#0e1713/);
  assert.equal(doc.documentElement.style.getPropertyValue('--surface') || '', '');

  const lightDefault = applyDesignThemeToDocument(doc, 'light', DEFAULT_DESIGN_THEME);
  assert.equal(doc.documentElement.dataset.theme, 'light');
  assert.equal(doc.documentElement.dataset.skin, 'default');
  assert.equal(lightDefault.themeColor, '#334155');
  assert.equal(doc.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute('content'), 'default');

  const css = await readFile(new URL('../public/design.tailwind.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /\.sync-scope input:checked\+span\{[^}]*color:white\b/);
  assert.match(css, /\.sync-scope input:checked\+span\{[^}]*var\(--btn-primary-ink/);
  assert.match(css, /\[data-design-primary\]\{[^}]*var\(--btn-primary-ink/);
});

test('iPhone and iPad automatically qualify for OPFS app storage while non-iOS browsers without folder picker do not', async () => {
  const memDir = name => {
    const dirs = new Map(), files = new Map();
    return {
      kind: 'directory',
      name,
      async getDirectoryHandle(child, opts) {
        if (!dirs.has(child)) {
          if (!opts?.create) { const e = new Error('Not found'); e.name = 'NotFoundError'; throw e; }
          dirs.set(child, memDir(child));
        }
        return dirs.get(child);
      },
      async getFileHandle(child, opts) {
        if (!files.has(child)) {
          if (!opts?.create) { const e = new Error('Not found'); e.name = 'NotFoundError'; throw e; }
          let bytes = new Uint8Array(0);
          files.set(child, {
            kind: 'file',
            name: child,
            getFile: async () => new File([bytes], child),
            createWritable: async () => ({
              async write(chunk) { bytes = typeof chunk === 'string' ? new TextEncoder().encode(chunk) : new Uint8Array(await new Blob([chunk]).arrayBuffer()); },
              async close() {},
              async abort() {},
            }),
          });
        }
        return files.get(child);
      },
      async *entries() {
        for (const entry of dirs) yield entry;
        for (const entry of files) yield entry;
      },
    };
  };

  const opfsRoot = memDir('');
  const locks = {request: async (_name, fn) => fn()};
  const iphoneNav = {userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1', storage: {getDirectory: async () => opfsRoot, persist: async () => true}, locks};
  const ipadDesktopModeNav = {userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', platform: 'MacIntel', maxTouchPoints: 5, storage: {getDirectory: async () => opfsRoot}, locks};
  const desktopNoPickerNav = {userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/145.0.0.0 Safari/537.36', platform: 'Linux x86_64', maxTouchPoints: 0, storage: {getDirectory: async () => opfsRoot}, locks};

  assert.equal(supportsDataFolder({}, iphoneNav), false);
  assert.equal(supportsIOSAppStorage({}, iphoneNav), true);
  assert.equal(supportsIOSAppStorage({}, ipadDesktopModeNav), true);
  assert.equal(supportsIOSAppStorage({}, desktopNoPickerNav), false);

  const handle = await openIOSAppStorage(iphoneNav);
  assert.equal(handle.name, 'LibreMemo');
  assert.equal(isIOSAppStorageHandle(handle), true);
  assert.equal(isIOSAppStorageHandle({iosAppStorage: true, name: 'LibreMemo'}), true);
  assert.equal(isIOSAppStorageHandle({name: 'LibreMemo'}), false);
});
