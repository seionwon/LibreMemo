import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
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
  toggleFavoriteTheme,
  filterDesignThemes,
  resolveDesignTheme,
  applyDesignThemeToDocument,
  describeDesignTheme,
} from '../public/src/app-themes.js';
import {normalizePreferences, storePreferences, loadPreferences, serializeSettings, parseSettings} from '../public/src/preferences.js';
import {syncSettingsDifferences} from '../public/src/sync-adapter.js';
import {supportsDataFolder, supportsIOSAppStorage, isIOSAppStorageHandle, openIOSAppStorage} from '../public/src/data-folder.js';

const LEGACY_28_IDS = [
  'default', 'oneui-breeze', 'cupertino-glass', 'material-sage', 'nordic-arctic', 'fluent-mica',
  'hanji-library', 'vintage-hardcover', 'editorial-press', 'warm-bookcafe', 'eink-paperwhite',
  'grid-engineering', 'lined-diary', 'dot-bullet', 'kraft-scrapbook', 'blueprint-studio',
  'forest-moss', 'ocean-breeze', 'sakura-spring', 'autumn-terracotta', 'matcha-tea',
  'lavender-dream', 'peach-sorbet', 'midnight-astronomy', 'royal-velvet',
  'neo-brutal-pop', 'pop-mint-candy', 'cyber-terminal', 'retro-classic-os',
];

test('all 80 built-in design themes preserve legacy IDs, stay lightweight and satisfy WCAG AA >= 4.5 contrast in both Light and Dark modes', async () => {
  assert.equal(APP_THEMES.length, 80);
  const ids = new Set(APP_THEMES.map(t => t.id));
  assert.equal(ids.size, APP_THEMES.length);
  for (const legacyId of LEGACY_28_IDS) {
    assert.ok(ids.has(legacyId), `preserves theme ID ${legacyId}`);
  }
  const categoryIds = new Set(THEME_CATEGORIES.filter(c => c.id !== 'all').map(c => c.id));
  assert.equal(categoryIds.size, 10);
  for (const catId of categoryIds) {
    assert.equal(APP_THEMES.filter(t => t.category === catId).length, 8, `category ${catId} has 8 balanced themes`);
  }

  for (const theme of APP_THEMES) {
    assert.ok(categoryIds.has(theme.category), `${theme.id} valid category`);
    for (const mode of ['light', 'dark']) {
      const resolved = resolveDesignTheme({id: theme.id}, mode);
      const v = resolved.variables;
      const textVsBg = contrastRatio(v['--text'], v['--bg']);
      const textVsSurface = contrastRatio(v['--text'], v['--surface']);
      const mutedVsBg = contrastRatio(v['--muted'], v['--bg']);
      const mutedVsSurface = contrastRatio(v['--muted'], v['--surface']);
      const accentVsSurface = contrastRatio(v['--green'], v['--surface']);
      const accentVsSoft = contrastRatio(v['--green'], v['--green-light']);
      const onAccentVsAccent = contrastRatio(v['--on-green'], v['--green']);
      const btnInkVsBtnBg = contrastRatio(v['--btn-primary-ink'], v['--btn-primary-bg']);
      const btnInkVsDesignBrand = contrastRatio(v['--btn-primary-ink'], v['--design-brand']);
      const toastInkVsToastBg = contrastRatio(v['--toast-ink'], v['--toast-bg']);
      assert.ok(textVsBg >= 4.5, `${theme.id}/${mode} text vs bg contrast ${textVsBg}`);
      assert.ok(textVsSurface >= 4.5, `${theme.id}/${mode} text vs surface contrast ${textVsSurface}`);
      assert.ok(mutedVsBg >= 4.5, `${theme.id}/${mode} muted vs bg contrast ${mutedVsBg}`);
      assert.ok(mutedVsSurface >= 4.5, `${theme.id}/${mode} muted vs surface contrast ${mutedVsSurface}`);
      assert.ok(accentVsSurface >= 4.5, `${theme.id}/${mode} accent vs surface contrast ${accentVsSurface}`);
      assert.ok(accentVsSoft >= 4.5, `${theme.id}/${mode} accent vs accentSoft contrast ${accentVsSoft}`);
      assert.ok(onAccentVsAccent >= 4.5, `${theme.id}/${mode} onAccent vs accent contrast ${onAccentVsAccent}`);
      assert.ok(btnInkVsBtnBg >= 4.5, `${theme.id}/${mode} buttonInk vs buttonBg contrast ${btnInkVsBtnBg}`);
      assert.ok(btnInkVsDesignBrand >= 4.5, `${theme.id}/${mode} buttonInk vs designBrand contrast ${btnInkVsDesignBrand}`);
      assert.ok(toastInkVsToastBg >= 4.5, `${theme.id}/${mode} toastInk vs toastBg contrast ${toastInkVsToastBg}`);
    }
  }

  const rawModule = await readFile(new URL('../public/src/app-themes.js', import.meta.url));
  const gzippedBytes = gzipSync(rawModule).byteLength;
  assert.ok(gzippedBytes < 20 * 1024, `app-themes.js stays lightweight (${gzippedBytes} bytes gzipped)`);
  assert.doesNotMatch(rawModule.toString('utf8'), /data:image\/|\.(?:png|jpe?g|webp|gif)\b/i);
});

test('5 customization axes, procedural textures/frames, favorites pinning and search round-trip cleanly', () => {
  assert.equal(THEME_SHAPE_OPTIONS.length, 6);
  assert.equal(THEME_TEXTURE_OPTIONS.length, 15);
  assert.equal(THEME_FONT_OPTIONS.length, 6);
  assert.equal(THEME_FRAME_OPTIONS.length, 11);
  assert.equal(THEME_ACCENT_PRESETS.length, 24);

  for (const texture of ['millimeter', 'cornell', 'manuscript', 'staff', 'starlight', 'canvas']) {
    const r = resolveDesignTheme({id: 'wongoji-manuscript', texture, shape: 'pebble', frame: 'double'}, 'light');
    assert.equal(r.texture, texture);
    assert.equal(r.shape, 'pebble');
    assert.equal(r.frame, 'double');
  }
  for (const frame of ['double', 'spiral', 'luminous']) {
    const r = resolveDesignTheme({id: 'aurora-borealis', frame}, 'dark');
    assert.equal(r.frame, frame);
  }

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

  let favTheme = toggleFavoriteTheme(DEFAULT_DESIGN_THEME, 'hanji-library');
  favTheme = toggleFavoriteTheme(favTheme, 'wongoji-manuscript');
  assert.deepEqual(favTheme.favorites, ['wongoji-manuscript', 'hanji-library']);
  const pinnedList = filterDesignThemes({category: 'all', favorites: favTheme.favorites});
  assert.equal(pinnedList[0].id, 'wongoji-manuscript');
  assert.equal(pinnedList[1].id, 'hanji-library');
  assert.deepEqual(filterDesignThemes({category: 'favorites', favorites: favTheme.favorites}).map(t => t.id), ['wongoji-manuscript', 'hanji-library']);
  assert.ok(filterDesignThemes({category: 'all', query: '원고지'}).some(t => t.id === 'wongoji-manuscript'));
  assert.ok(filterDesignThemes({category: 'all', query: '오선지'}).some(t => t.id === 'music-conservatory'));
  assert.ok(filterDesignThemes({category: 'all', query: '아몰레드'}).length >= 1);

  const unstarred = toggleFavoriteTheme(toggleFavoriteTheme(favTheme, 'hanji-library'), 'wongoji-manuscript');
  assert.equal('favorites' in unstarred, false);

  const localMap = new Map();
  const storage = {getItem: k => localMap.get(k) ?? null, setItem: (k, v) => localMap.set(k, v)};
  const stored = storePreferences({
    theme: 'dark',
    designTheme: {id: 'cupertino-glass', shape: 'round', texture: 'glow', font: 'rounded', frame: 'glass', accent: '#1D4ED8', favorites: ['kyoto-teahouse', 'hanji-library']},
  }, storage);
  assert.equal(stored.designTheme.accent, '#1d4ed8');
  assert.deepEqual(stored.designTheme.favorites, ['kyoto-teahouse', 'hanji-library']);
  assert.deepEqual(loadPreferences(storage), stored);
  assert.deepEqual(parseSettings(serializeSettings(stored)).preferences, stored);
  assert.match(describeDesignTheme(stored.designTheme), /쿠퍼티노 프로스트 글래스.*★2/);

  const baseEntries = {[`htmlmemo-preferences-v1`]: JSON.stringify(normalizePreferences())};
  const customEntries = {[`htmlmemo-preferences-v1`]: JSON.stringify(stored)};
  const diffs = syncSettingsDifferences({entries: baseEntries}, {entries: customEntries}).map(r => r.label);
  assert.ok(diffs.includes('화면 테마'));
  assert.ok(diffs.includes('디자인 테마'));

  for (const bad of [null, 'hanji-library', [], {id: 'nonexistent'}, {shape: 'hexagon'}, {texture: 'marble'}, {font: 'comic'}, {frame: 'neon'}, {accent: 'red'}, {accent: '#123'}, {favorites: 'hanji-library'}, {favorites: ['nonexistent']}]) {
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
