import test from 'node:test';
import assert from 'node:assert/strict';
import {FORMAT_GROUPS,PRESET_LIMIT,findPresets,normalizeDefaults,normalizePresets,normalizeSettings,presetFit,presetFormats,uniqueName} from '../public/src/viewer-presets.js';
import {normalizePreferences} from '../public/src/preferences.js';
import {normalizeReadingLayout,readingLayoutCss} from '../public/src/reading-layout.js';
import {APP_FILES} from '../public/src/distribution.js';
const caps=id=>FORMAT_GROUPS.find(group=>group.id===id).caps,layout=normalizeReadingLayout({flow:'paged'});
const preset=(id,settings,extra={})=>({id,name:id,settings,favorite:false,createdAt:0,usedAt:0,...extra});
test('fit is judged per document from the settings a preset holds',()=>{
  const all={layout,fontScale:1.2,fontFamily:'serif',theme:'sepia'};
  assert.equal(presetFit(all,caps('ebook')).level,'full');
  assert.deepEqual(presetFit(all,caps('pdf')),{applied:['fontScale','theme'],skipped:['layout','fontFamily'],level:'partial'});
  assert.equal(presetFit({layout},caps('pdf')).level,'none');assert.equal(presetFit({theme:'dark'},caps('image')).level,'full');
  const html={layout:false,fontScale:false,fontFamily:false,theme:false};assert.equal(presetFit(all,html).level,'none');
});
test('the format label follows the contents of the preset',()=>{
  assert.deepEqual(presetFormats({layout}).full,['EPUB·MOBI·AZW3·FB2']);assert.deepEqual(presetFormats({layout}).partial,[]);
  assert.equal(presetFormats({theme:'dark'}).full.length,FORMAT_GROUPS.length);
  const mixed=presetFormats({layout,theme:'dark'});assert.deepEqual(mixed.full,['EPUB·MOBI·AZW3·FB2']);assert.equal(mixed.partial.length,3);
});
test('stored presets are cleaned: bad entries and duplicate names or ids go, limits hold',()=>{
  const list=normalizePresets([preset('a',{theme:'dark'}),{...preset('a',{theme:'light'})},{...preset('b',{theme:'light'}),name:' A '},preset('c',{}),preset('<x>',{theme:'dark'}),preset('d',{theme:'neon'}),'junk',preset('e',{fontScale:99,fontFamily:'a;b'})]);
  assert.deepEqual(list.map(entry=>entry.id),['a','e']);assert.equal(list[1].settings.fontScale,3.2);assert.equal(list[1].settings.fontFamily,undefined);
  assert.equal(normalizePresets(Array.from({length:PRESET_LIMIT+5},(_,i)=>preset('p'+i,{theme:'dark'}))).length,PRESET_LIMIT);
  assert.deepEqual(normalizeSettings(null),{});assert.deepEqual(normalizePresets('x'),[]);
});
test('a default pointing at a deleted preset disappears with it',()=>{
  const presets=[preset('a',{theme:'dark'})];assert.deepEqual(normalizeDefaults({ebook:'a',pdf:'gone',bogus:'a'},presets),{ebook:'a'});
  const p=normalizePreferences({viewerPresets:presets,viewerDefaults:{pdf:'a',ebook:'x'}});assert.deepEqual(p.viewerDefaults,{pdf:'a'});assert.equal(p.viewerPresets.length,1);
  assert.deepEqual(normalizePreferences({}).viewerPresets,[]);
});
test('search covers name, format and contents; favorites lead every sort',()=>{
  const list=[preset('밤 독서',{layout,theme:'dark'},{usedAt:5,createdAt:1}),preset('가벼운 글',{theme:'light'},{usedAt:9,createdAt:3}),preset('PDF용',{fontScale:1.5},{favorite:true,createdAt:2})];
  const pdf=caps('pdf'),names=o=>findPresets(list,{caps:pdf,...o}).map(entry=>entry.name);
  assert.deepEqual(names({query:'밤'}),['밤 독서']);assert.deepEqual(names({query:'쪽 단위'}),['밤 독서']);assert.equal(names({query:'epub'}).length,3);assert.deepEqual(names({query:'세피아'}),[]);assert.deepEqual(names({query:'글자 150'}),['PDF용']);
  assert.deepEqual(names({sort:'name'}),['PDF용','가벼운 글','밤 독서']);assert.deepEqual(names({sort:'used'}),['PDF용','가벼운 글','밤 독서']);assert.deepEqual(names({sort:'created'}),['PDF용','가벼운 글','밤 독서']);
  assert.deepEqual(names({sort:'fit'}),['PDF용','가벼운 글','밤 독서']);
});
test('names stay unique, and new typography settings stay within range',()=>{
  const list=[preset('밤',{theme:'dark'}),preset('밤 (2)',{theme:'dark'})];assert.equal(uniqueName('밤',list),'밤 (3)');assert.equal(uniqueName('낮',list),'낮');
  const safe=normalizeReadingLayout({letterSpacing:5,indent:-1,weight:900});assert.deepEqual([safe.letterSpacing,safe.indent,safe.weight],[.2,0,0]);
  assert.match(readingLayoutCss(normalizeReadingLayout({letterSpacing:.05,indent:2,weight:600})),/letter-spacing:0\.05em.*text-indent:2em.*font-weight:600/s);
  assert.ok(APP_FILES.includes('src/viewer-presets.js')&&APP_FILES.includes('src/viewer-presets-panel.js'));
});
