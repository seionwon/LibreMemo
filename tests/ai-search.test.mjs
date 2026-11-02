import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {AI_SEARCH_LIMIT,AI_TEXT_LIMIT,DEFAULT_AI_SEARCH,aiSearchRequest,aiSearchURL,normalizeAiSearch} from '../public/src/ai-search.js';
import {normalizePreferences} from '../public/src/preferences.js';
import {APP_FILES} from '../public/src/distribution.js';
test('addresses must be plain web pages without credentials',()=>{
  assert.equal(aiSearchURL(' https://a.example/?q={text} '),'https://a.example/?q={text}');
  for(const bad of ['javascript:alert(1)','data:text/html,x','file:///etc/passwd','https://user:pw@a.example/','not a url','',null])assert.equal(aiSearchURL(bad),null);
});
test('stored lists keep valid entries, default to used and drop the rest',()=>{
  assert.deepEqual(normalizeAiSearch(undefined),DEFAULT_AI_SEARCH.map(entry=>({...entry})));assert.ok(DEFAULT_AI_SEARCH.every(entry=>entry.enabled));
  assert.deepEqual(normalizeAiSearch([]),[]);
  const list=normalizeAiSearch([{id:'a',name:' A ',url:'https://a.example/{text}'},{id:'b',name:'B',url:'https://b.example/',enabled:false},{id:'a',name:'dup',url:'https://c.example/'},{id:'x',name:'bad',url:'javascript:alert(1)'},{id:'<i>',name:'bad',url:'https://d.example/'},'junk']);
  assert.deepEqual(list,[{id:'a',name:'A',url:'https://a.example/{text}',enabled:true},{id:'b',name:'B',url:'https://b.example/',enabled:false}]);
  assert.equal(normalizeAiSearch(Array.from({length:30},(_,i)=>({id:'n'+i,name:'n',url:'https://a.example/'}))).length,AI_SEARCH_LIMIT);
  assert.deepEqual(normalizePreferences({aiSearch:[]}).aiSearch,[]);assert.equal(normalizePreferences({}).aiSearch.length,DEFAULT_AI_SEARCH.length);
});
test('the selection is encoded into the address, or carried by the clipboard',()=>{
  const direct={url:'https://a.example/?q={text}'};
  assert.deepEqual(aiSearchRequest(direct,'한글 & #?=<x>'),{url:'https://a.example/?q='+encodeURIComponent('한글 & #?=<x>'),copy:false,truncated:false});
  assert.deepEqual(aiSearchRequest({url:'https://a.example/app'},'글'),{url:'https://a.example/app',copy:true,truncated:false});
  const long=aiSearchRequest(direct,'가'.repeat(AI_TEXT_LIMIT+1));assert.equal(long.copy,true);assert.equal(long.truncated,true);assert.equal(decodeURIComponent(long.url.split('=')[1]).length,AI_TEXT_LIMIT);
});
test('AI search sits between read-aloud and web search, runs one engine directly and is shipped',async()=>{
  const app=await readFile('public/src/app.js','utf8');
  assert.match(app,/\['speak','읽어주기'\],\['aiSearch','AI 검색'\],\['webSearch','웹 검색'\]/);
  assert.match(app,/filter\(engine=>engine\.enabled\)/);assert.match(app,/engines\.length===1\)\{await runAiSearch\(engines\[0\],text\)/);
  assert.ok(APP_FILES.includes('src/ai-search.js'));
});
