import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {safeWebURL} from '../public/src/utils.js';
import {safeLinkedFields} from '../public/src/data-folder.js';

test('a stored address is a link only when it is plain http(s) without credentials',()=>{
  assert.equal(safeWebURL('https://example.com/a?b=1#c'),'https://example.com/a?b=1#c');
  assert.equal(safeWebURL('http://example.com/'),'http://example.com/');
  for(const bad of ['javascript:alert(1)','JaVaScRiPt:alert(1)',' javascript:alert(1)','data:text/html,<script>alert(1)</script>','file:///etc/passwd','blob:https://example.com/x','https://user:pass@example.com/','//example.com','not a url','',null,undefined,42,{}])assert.equal(safeWebURL(bad),'',String(bad));
});

test('records from a data folder or a paired device cannot carry a script link, a foreign video reference or a remote thumbnail',()=>{
  const thumbnail='data:image/jpeg;base64,AAAA';
  const good={id:'a',source:'https://www.youtube.com/watch?v=dQw4w9WgXcQ',metadata:{version:1,source:'https://www.youtube.com/watch?v=dQw4w9WgXcQ',warnings:['one'],thumbnail,youtube:{videoId:'dQw4w9WgXcQ',channel:'Channel',thumbnail,chapters:[{t:0,title:'Intro'}]}}};
  const kept=safeLinkedFields(good);
  assert.deepEqual(kept,good,'valid records are unchanged');assert.strictEqual(kept.metadata.youtube,good.metadata.youtube,'and their video data is not rewritten');
  const hostile={id:'b',source:'javascript:alert(document.cookie)',metadata:{version:1,source:'javascript:alert(1)',warnings:['ok',{toString(){return '<img onerror=1>';}}],thumbnail:'https://tracker.example/pixel.png',youtube:{videoId:'x" onload="alert(1)',thumbnail:'https://tracker.example/p.jpg'}}};
  const safe=safeLinkedFields(hostile);
  assert.equal(safe.source,'');assert.equal(safe.metadata.source,'');assert.equal('youtube' in safe.metadata,false);assert.equal('thumbnail' in safe.metadata,false);assert.deepEqual(safe.metadata.warnings,['ok']);
  assert.equal(hostile.metadata.source,'javascript:alert(1)','the input object is not modified');
  const partial=safeLinkedFields({id:'c',metadata:{version:1,youtube:{videoId:'dQw4w9WgXcQ',thumbnail:'https://tracker.example/p.jpg',playlistId:'bad id',extra:'<b>'}}});
  assert.deepEqual(partial.metadata.youtube,{videoId:'dQw4w9WgXcQ'},'a valid video keeps only its valid fields');
  assert.equal('source' in partial,false);
});

test('folder restore and device sync apply those rules, and document info links only safe addresses',async()=>{
  const folder=await readFile(new URL('../public/src/data-folder.js',import.meta.url),'utf8');
  assert.match(folder,/return \{record:safeLinkedFields\(portableRecord\(record\)\),revisions:/);
  const app=await readFile(new URL('../public/src/app.js',import.meta.url),'utf8');
  assert.match(app,/<dd>\$\{safeWebURL\(m\.source\)\?`<a href="\$\{esc\(safeWebURL\(m\.source\)\)\}" target="_blank" rel="noopener noreferrer">/);
  assert.doesNotMatch(app,/href="\$\{esc\(m\.source\)\}"/);
});
