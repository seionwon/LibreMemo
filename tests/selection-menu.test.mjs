import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {$,$$} from '../public/src/utils.js';
import {documentFor} from './dom.mjs';
import {aiSearchRequest,aiSearchURL} from '../public/src/ai-search.js';

const source=await readFile(new URL('../public/src/app.js',import.meta.url),'utf8');
const menu=source.slice(source.indexOf('function showSelectionMenu('),source.indexOf('function toolAction('));
function fixture({quote='선택한 글 & 웹 검색?',speech=true,engines=[],clipboardFails=false}={}){
  const doc=documentFor('<html><body><div id="tool-popover" hidden></div></body></html>'),pop=doc.querySelector('#tool-popover'),spoken=[],urls=[];
  const r={selection:{quote,start:10,end:10+quote.length,section:'v0:one'},metadata:{annotations:[{id:'existing-note',text:'기존 메모'}],bookmarks:[{id:'existing-bookmark'}]},speakSelection(){spoken.push(this.selection.quote);return speech;}};
  const toasts=[],copied=[],preferences={aiSearch:engines};
  const context=vm.createContext({$:(s,root=doc)=>$(s,root),$$:(s,root=doc)=>$$(s,root),safely:fn=>fn,openBrowser:async url=>urls.push(url),preferences,toast:(text,error=false)=>toasts.push([text,error]),positionPopover(){},esc:text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),AI_TEXT_LIMIT:2000,aiSearchRequest,navigator:{clipboard:{writeText:async text=>{if(clipboardFails)throw Error('denied');copied.push(text);}}}});
  context.closePopover=()=>{context.popoverName='';pop.hidden=true;};context.showPopover=(name,html,bind)=>{context.popoverName=name;pop.innerHTML=html;pop.hidden=false;bind();};
  vm.runInContext('var popoverName="";'+menu,context);
  return {r,pop,spoken,urls,toasts,copied,show:()=>context.showSelectionMenu(r)};
}

test('selected text menu contains Read aloud, AI search and Web search in the requested order',()=>{
  const a=fixture(),before=structuredClone(a.r.metadata);a.show();
  assert.deepEqual([...a.pop.querySelectorAll('[data-selection]')].map(b=>[b.dataset.selection,b.textContent]),[['speak','읽어주기'],['aiSearch','AI 검색'],['webSearch','웹 검색']]);
  assert.equal(a.pop.getAttribute('role'),'dialog');assert.equal(a.pop.getAttribute('aria-label'),'선택한 텍스트');assert.deepEqual(a.r.metadata,before);
});

test('the remaining selection menu buttons preserve the selection on pointer activation',()=>{
  const a=fixture(),anchor=a.r.selection;a.show();let prevented=0;
  for(const button of a.pop.querySelectorAll('[data-selection]'))button.onpointerdown({preventDefault(){prevented++;}});
  assert.equal(prevented,3);assert.strictEqual(a.r.selection,anchor);
});

test('Read aloud uses the captured quote and only dismisses the menu when the player accepts it',async()=>{
  for(const speech of [true,false]){const a=fixture({speech}),quote=a.r.selection.quote;a.show();a.r.selection={quote:'다른 선택'};await a.pop.querySelector('[data-selection=speak]').onclick();assert.deepEqual(a.spoken,[quote]);assert.deepEqual(a.urls,[]);assert.equal(a.pop.hidden,speech);}
});

test('Web search keeps the captured quote, URL encoding and 2000-character limit without modifying annotations',async()=>{
  const quote='한글 & 기호? / # '+ '긴 선택 '.repeat(600),a=fixture({quote}),before=structuredClone(a.r.metadata);a.show();a.r.selection={quote:'나중 선택'};
  await a.pop.querySelector('[data-selection=webSearch]').onclick();assert.deepEqual(a.urls,['https://www.google.com/search?q='+encodeURIComponent(quote.slice(0,2000))]);assert.deepEqual(a.spoken,[]);assert.equal(a.pop.hidden,true);assert.deepEqual(a.r.metadata,before);
});

test('no selection creates no menu and a new selection replaces rather than duplicates its actions',()=>{
  const a=fixture();a.r.selection=null;a.show();assert.equal(a.pop.hidden,true);assert.equal(a.pop.children.length,0);
  a.r.selection={quote:'첫 선택'};a.show();a.r.selection={quote:'다음 선택'};a.show();assert.equal(a.pop.hidden,false);assert.equal(a.pop.querySelectorAll('[data-selection]').length,3);
});

test('selection menu fits its two actions while retaining the viewport width limit',async()=>{
  const css=await readFile(new URL('../public/design.tailwind.css',import.meta.url),'utf8'),rule=css.match(/#tool-popover\.selection\s*\{[^}]*\}/)?.[0]||'';
  assert.match(rule,/width:max-content;[^}]*max-width:calc\(100vw - 20px\)/);
});

const engine=(id,url='https://'+id+'.example/?q={text}',enabled=true)=>({id,name:id.toUpperCase(),url,enabled});
const flush=()=>new Promise(resolve=>setTimeout(resolve,5));
const aiClick=async a=>{a.show();a.pop.querySelector('[data-selection="aiSearch"]').onclick();await flush();};
test('AI search opens the only checked LLM at once, ignoring unchecked ones',async()=>{
  const a=fixture({quote:'한글 & 질문',engines:[engine('off','https://off.example/?q={text}',false),engine('on')]});await aiClick(a);
  assert.deepEqual(a.urls,['https://on.example/?q='+encodeURIComponent('한글 & 질문')]);assert.equal(a.pop.hidden,true);
});
test('several checked LLMs become a list, and the chosen one receives the selection',async()=>{
  const a=fixture({quote:'질문',engines:[engine('a'),engine('b'),engine('c','https://c.example/',false)]});await aiClick(a);
  assert.deepEqual(a.urls,[]);assert.equal(a.pop.hidden,false);
  assert.deepEqual([...a.pop.querySelectorAll('[data-ai-engine]')].map(b=>b.textContent),['A','B']);
  a.pop.querySelector('[data-ai-engine="b"]').onclick();await flush();
  assert.deepEqual(a.urls,['https://b.example/?q='+encodeURIComponent('질문')]);assert.equal(a.pop.hidden,true);
});
test('with nothing checked no page opens and the user is told where to go',async()=>{
  const a=fixture({engines:[engine('a','https://a.example/',false)]});await aiClick(a);
  assert.deepEqual(a.urls,[]);assert.match(a.toasts[0][0],/설정 → AI 검색/);assert.equal(a.toasts[0][1],true);
});
test('an LLM without {text} gets the selection through the clipboard, and a refusal is reported',async()=>{
  const a=fixture({quote:'복사할 글',engines:[engine('g','https://g.example/app')]});await aiClick(a);
  assert.deepEqual(a.copied,['복사할 글']);assert.deepEqual(a.urls,['https://g.example/app']);assert.match(a.toasts[0][0],/붙여넣어/);
  const b=fixture({engines:[engine('g','https://g.example/app')],clipboardFails:true});await aiClick(b);
  assert.deepEqual(b.urls,['https://g.example/app']);assert.equal(b.toasts[0][1],true);
});
test('engine names from settings are escaped in the list',async()=>{
  const a=fixture({engines:[{...engine('a'),name:'<img src=x>'},engine('b')]});await aiClick(a);
  assert.equal(a.pop.querySelector('img'),null);assert.equal(a.pop.querySelector('[data-ai-engine="a"]').textContent,'<img src=x>');
});
function settings(aiSearch){
  const doc=documentFor('<html><body><div id="dialog"></div></body></html>'),box=doc.querySelector('#dialog'),toasts=[];
  const context=vm.createContext({$:(s,root=doc)=>$(s,root),$$:(s,root=doc)=>$$(s,root),preferences:{aiSearch},esc:text=>String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'),icon:()=>'',uid:()=>'new-id',aiSearchURL,toast:(text,error=false)=>toasts.push([text,error]),settingsDialog(){},modal(html,bind){box.innerHTML=html;bind();}});
  context.changePreferences=patch=>{context.preferences={...context.preferences,...patch};};
  vm.runInContext(menu,context);context.aiSearchDialog();
  const fire=(node,type)=>{const event=new doc.defaultView.Event(type,{bubbles:true});node.dispatchEvent(event);};
  return {context,doc,box,toasts,fire,list:()=>JSON.parse(JSON.stringify(context.preferences.aiSearch))};
}
test('a newly registered LLM is checked for use by default',()=>{
  const a=settings([]);a.box.querySelector('#ai-search-name').value='Grok';a.box.querySelector('#ai-search-url').value='https://grok.com/?q={text}';
  a.box.querySelector('#ai-search-add').onsubmit({preventDefault(){}});
  assert.deepEqual(a.list(),[{id:'new-id',name:'Grok',url:'https://grok.com/?q={text}',enabled:true}]);
  assert.equal(a.box.querySelector('[data-engine="new-id"] [data-field="enabled"]').hasAttribute('checked'),true);
});
test('unsafe addresses are refused when registering and when editing',()=>{
  const a=settings([engine('a')]);a.box.querySelector('#ai-search-name').value='x';a.box.querySelector('#ai-search-url').value='javascript:alert(1)';
  a.box.querySelector('#ai-search-add').onsubmit({preventDefault(){}});assert.equal(a.list().length,1);assert.equal(a.toasts[0][1],true);
  const url=a.box.querySelector('[data-field="url"]');url.value='file:///etc/passwd';a.fire(url,'change');assert.equal(a.list()[0].url,engine('a').url);
});
test('unchecking and deleting an LLM are saved',()=>{
  const a=settings([engine('a'),engine('b')]),use=a.box.querySelector('[data-engine="a"] [data-field="enabled"]');use.checked=false;a.fire(use,'change');
  assert.equal(a.list()[0].enabled,false);assert.equal(a.list()[1].enabled,true);
  a.fire(a.box.querySelector('[data-engine="b"] [data-remove]'),'click');assert.deepEqual(a.list().map(entry=>entry.id),['a']);
});
