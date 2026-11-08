import test from 'node:test';
import assert from 'node:assert/strict';
import {DOMParser} from 'linkedom';
import {CardPreviewQueue,cardPreviewKey,savedCardPicture} from '../public/src/card-previews.js';
import {previewContent,previewText,PREVIEW_SOURCE_LIMIT} from '../public/src/thumbnails.js';
const image='data:image/jpeg;base64,AAAA',record=(id='a',contentKey='source')=>({id,contentKey,bodyVersion:1,metadata:{annotations:[{id:'keep'}]}});
async function until(check){for(let n=0;n<300;n++){if(check())return;await new Promise(resolve=>setTimeout(resolve,2));}throw Error('Preview did not settle');}
function queue(overrides={}){
 const saved=new Map(),events=[],loads=[],made=[],q=new CardPreviewQueue({delay:0,load:async id=>{loads.push(id);return record(id);},read:async key=>saved.get(key),write:async(key,value)=>saved.set(key,value),generate:async row=>{made.push(row.id);return image;},publish:(row,image)=>events.push({id:row.id,image}),...overrides});
 return {q,saved,events,loads,made};
}
test('card pictures accept only bounded inline rasters and ignore remote or executable metadata',()=>{
 assert.equal(savedCardPicture({metadata:{thumbnail:image}}),image);
 for(const thumbnail of ['https://tracking.test/pixel.png','data:image/svg+xml,<svg onload=bad()>','javascript:bad()','x'.repeat(400001),''])assert.equal(savedCardPicture({metadata:{thumbnail}}),'');
 assert.equal(savedCardPicture({metadata:{youtube:{thumbnail:image}}}),image);
});
test('preview cache identities survive annotations and scroll changes but invalidate a replaced source',()=>{
 const a=record(),b={...a,modified:99,metadata:{view:{scrollTop:500},annotations:[]}};
 assert.equal(cardPreviewKey(a),cardPreviewKey(b));assert.notEqual(cardPreviewKey(a),cardPreviewKey({...a,bodyVersion:2}));assert.notEqual(cardPreviewKey(a),cardPreviewKey({...a,contentKey:'new-source'}));
});
test('visible-card requests deduplicate work, persist derived results and reuse them across sessions',async()=>{
 const a=queue();for(let i=0;i<6;i++)a.q.request(record());await until(()=>a.saved.size===1&&!a.q.running);
 assert.deepEqual(a.loads,['a']);assert.deepEqual(a.made,['a']);assert.equal(a.events.length,1);
 const b=queue({read:async key=>a.saved.get(key)});b.q.request(record());await until(()=>b.events.length===1&&!b.q.running);
 assert.deepEqual(b.loads,[]);assert.deepEqual(b.made,[]);assert.deepEqual(b.events,a.events);a.q.pause();b.q.pause();
});
test('preview generation is serial and leaving the card view cancels pending source reads and writes',async()=>{
 let finish,active=0,peak=0;
 const a=queue({generate:async(row,{signal})=>{active++;peak=Math.max(peak,active);try{if(row.id==='a')await new Promise(resolve=>{finish=resolve;signal.addEventListener('abort',resolve,{once:true});});return image;}finally{active--;}}});
 a.q.request(record('a'));a.q.request(record('b'));await until(()=>!!finish);a.q.pause();await until(()=>!a.q.running);
 assert.equal(peak,1);assert.deepEqual(a.loads,['a']);assert.equal(a.saved.size,0);assert.deepEqual(a.events,[]);
 a.q.resume();a.q.request(record('b'));await until(()=>a.events.length===1);assert.deepEqual(a.loads,['a','b']);a.q.pause();
});
test('a replaced, deleted or no longer visible source never publishes a stale preview',async()=>{
 let current=true,finish;
 const a=queue({current:()=>current,generate:()=>new Promise(resolve=>finish=resolve)});a.q.request(record());await until(()=>!!finish);current=false;finish(image);await until(()=>!a.q.running);assert.equal(a.saved.size,0);assert.deepEqual(a.events,[]);
 const b=queue({load:async()=>record('a','replacement')});b.q.request(record());await until(()=>!b.q.running&&!b.q.timer);assert.deepEqual(b.made,[]);assert.equal(b.saved.size,0);a.q.pause();b.q.pause();
});
test('a card that reappears before its cancelled render finishes is queued again',async()=>{
 let finish,attempts=0;
 const a=queue({generate:async()=>{attempts++;if(attempts===1)await new Promise(resolve=>finish=resolve);return image;}});
 a.q.request(record());await until(()=>!!finish);a.q.pause();a.q.resume();a.q.request(record());finish();
 await until(()=>a.events.length===1&&!a.q.running);assert.equal(attempts,2);assert.equal(a.saved.size,1);a.q.pause();
});
test('full cache storage cannot block a preview, and empty files are checked only once',async()=>{
 const a=queue({write:async()=>{throw Error('QuotaExceededError');}});a.q.request(record());await until(()=>a.events.length===1&&!a.q.running);assert.deepEqual(a.events,[{id:'a',image}]);a.q.pause();
 const b=queue({generate:async()=>''});b.q.request(record());await until(()=>b.saved.size===1&&!b.q.running);b.q.request(record());await new Promise(resolve=>setTimeout(resolve,5));assert.deepEqual(b.loads,['a']);assert.equal(b.events.length,0);b.q.pause();
});
test('inert previews omit navigation, scripts, hidden content and annotation UI without duplicating the document title',()=>{
 const previous=globalThis.document;globalThis.document=new DOMParser().parseFromString('<html><body></body></html>','text/html');
 try{
  const root=previewContent('<html><head><title>metadata title</title><script>window.previewBad=true</script><link rel="stylesheet" href="https://bad.test/style"></head><body><nav>navigation</nav><h1>실제 제목</h1><p>한국어 본문입니다.</p><div>일반 div 본문</div><p hidden>hidden</p><p style="display:none">secret</p><div data-htmlmemo-ui>도구 메뉴</div><svg id="htmlmemo-annotation-layer"><text>주석</text></svg><iframe src="https://bad.test/frame"></iframe></body></html>');
  assert.deepEqual(previewText(root),{title:'실제 제목',body:'한국어 본문입니다. 일반 div 본문'});assert.equal(root.querySelector('script,link,iframe,[hidden],[data-htmlmemo-ui]'),null);assert.equal(globalThis.previewBad,undefined);
  const bounded=previewContent('<p>앞부분</p>'+('x'.repeat(PREVIEW_SOURCE_LIMIT))+'<p>뒷부분</p>');assert.equal(bounded.querySelectorAll('p').length,1);
 }finally{globalThis.document=previous;}
});
