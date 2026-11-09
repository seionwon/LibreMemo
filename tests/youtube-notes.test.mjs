import test from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from './dom.mjs';
import {parseYouTubeInput,youtubeDocumentHTML} from '../public/src/youtube.js';
import {parseVideoTime,makeVideoNote,isVideoNote,videoNotes,videoNotesHTML,matchingVideoRecords,findVideoNote} from '../public/src/youtube-notes.js';
import {validateAnnotations,History} from '../public/src/model.js';
import {parseHTML,serializeHTML,textIndex} from '../public/src/document.js';
import {YouTubePane} from '../public/src/youtube-ui.js';
import {createDocumentArchive,readDocumentArchive} from '../public/src/document-archive.js';
installDOM();
const id='M7lc1UVf-VE';

test('video note times accept clocks, seconds and matching links and reject malformed times',()=>{
  for(const [value,time] of [['0',0],['83',83],['1:23',83],['1:02:03',3723],['83s',83],['1h2m3s',3723],['https://youtu.be/'+id+'?t=83',83],['https://youtube.com/watch?v='+id+'#t=1m23s',83]])assert.equal(parseVideoTime(value,id),time,value);
  for(const value of ['', '-1','1:99','1:2:03','1.5','100:00:00','Infinity','360000','https://youtu.be/dQw4w9WgXcQ?t=83','https://youtu.be/'+id+'?t=nonsense'])assert.equal(parseVideoTime(value,id),null,value);
  for(const link of ['javascript://youtube.com/watch?v='+id,'https://evil.test/watch?v='+id,'https://user@youtube.com/watch?v='+id,'https://youtube.com:123/watch?v='+id,'https://youtu.be/'+id+'?t=999999999999999999999'])assert.equal(parseYouTubeInput(link),null,link);
});

test('time anchors validate through the common annotation path and keep identity on edits',()=>{
  const original=makeVideoNote(id,83,' 장면 메모 '),edited=makeVideoNote(id,95,'수정',original);
  assert.equal(edited.id,original.id);assert.equal(edited.created,original.created);assert.equal(original.text,'장면 메모');assert.ok(isVideoNote(edited));
  assert.deepEqual(validateAnnotations([original,makeVideoNote(id,2,'다른 시점')]).length,2);
  for(const videoAnchor of [{videoId:id,seconds:-1},{videoId:id,seconds:.5},{videoId:id,seconds:Infinity},{videoId:'evil" onclick="',seconds:1},{videoId:id,seconds:360000}])assert.throws(()=>validateAnnotations([{...original,videoAnchor}]),/영상 시점/);
  assert.throws(()=>makeVideoNote(id,83,'   '),/메모/);assert.throws(()=>makeVideoNote(id,83,'x'.repeat(10001)),/메모/);
  const history=new History([]);history.commit([original]);history.commit([edited]);assert.deepEqual(history.undo(),[original]);assert.deepEqual(history.redo(),[edited]);
});

test('readable HTML keeps safe clickable scene notes without changing reimported caption offsets',()=>{
  const raw=youtubeDocumentHTML('장면',{text:'1\n00:00:01,000 --> 00:00:05,000\nOriginal subtitle\n',format:'srt'}),parsed=parseHTML(raw),doc=new DOMParser().parseFromString(parsed.html,'text/html'),before=textIndex(doc).text;
  parsed.metadata.youtube={videoId:id};parsed.metadata.annotations=[makeVideoNote(id,83,'<script>alert(1)</script>\n둘째 줄'),makeVideoNote(id,3,'앞 장면')];
  const html=serializeHTML(doc,parsed.metadata),exported=new DOMParser().parseFromString(html,'text/html');
  assert.equal(exported.querySelectorAll('[data-htmlmemo-video-notes] li').length,2);assert.equal(exported.querySelector('[data-htmlmemo-video-notes] a').href,'https://www.youtube.com/watch?v='+id+'&t=3s');assert.equal(exported.querySelector('[data-htmlmemo-video-notes] script'),null);
  const again=parseHTML(html),clean=new DOMParser().parseFromString(again.html,'text/html');
  assert.deepEqual(again.metadata.annotations,parsed.metadata.annotations);assert.equal(textIndex(clean).text,before);assert.equal(clean.querySelector('[data-htmlmemo-video-notes]'),null);
  assert.equal(new DOMParser().parseFromString(serializeHTML(exported,again.metadata),'text/html').querySelectorAll('[data-htmlmemo-video-notes]').length,1,'repeated export does not duplicate the list');
});

test('scene rendering is time-ordered and escapes notes, with explicit play, edit and delete controls',()=>{
  const a=makeVideoNote(id,83,'<img src=x onerror=alert(1)>'),b=makeVideoNote(id,0,'처음'),metadata={annotations:[a,b]};
  assert.deepEqual(videoNotes(metadata).map(n=>n.id),[b.id,a.id]);const doc=new DOMParser().parseFromString(videoNotesHTML(metadata,{interactive:true}),'text/html');
  assert.equal(doc.querySelectorAll('[data-scene-play]').length,2);assert.equal(doc.querySelectorAll('[data-scene-edit]').length,2);assert.equal(doc.querySelectorAll('[data-scene-delete]').length,2);assert.equal(doc.querySelector('img'),null);assert.ok(doc.querySelector('[data-htmlmemo-ui][data-htmlmemo-preview]'));
});

test('a portable archive keeps the player identity and time notes, including when captions are replaced',async()=>{
  const original=new Blob([youtubeDocumentHTML('영상')],{type:'text/html'}),metadata=parseHTML(await original.text()).metadata;
  metadata.youtube={videoId:id,subtitle:{name:'later.srt'},script:'discard'};metadata.view.mediaTime=83;metadata.annotations=[makeVideoNote(id,83,'자막과 독립된 메모')];
  const archive=await createDocumentArchive({name:'영상.html',original,metadata}),restored=await readDocumentArchive(archive);
  assert.deepEqual(restored.metadata.youtube,{videoId:id,subtitle:{name:'later.srt'}});assert.equal(restored.metadata.view.mediaTime,83);assert.deepEqual(restored.metadata.annotations,metadata.annotations);
  const newDoc=parseHTML(youtubeDocumentHTML('영상',{text:'1\n00:00:01,000 --> 00:00:04,000\n새 자막\n',format:'srt'}));
  const reread=parseHTML(serializeHTML(new DOMParser().parseFromString(newDoc.html,'text/html'),restored.metadata));assert.deepEqual(reread.metadata.annotations,metadata.annotations);
});

test('current scene capture pauses and freezes the exact time even while the player is loading',()=>{
  const calls=[],pane=Object.create(YouTubePane.prototype);Object.assign(pane,{savedAt:83,ready:false,player:{pauseVideo(){calls.push('pause');}},callbacks:{onNote:(t,note)=>calls.push([t,note])}});
  pane.addSceneNote();assert.deepEqual(calls,['pause',[83,null]]);
  pane.seek(121,true);assert.equal(pane.time(),121);assert.deepEqual(pane.pendingSeek,{seconds:121,play:true});
  pane.seek(0,false);assert.equal(pane.time(),0);assert.deepEqual(pane.pendingSeek,{seconds:0,play:false});
  pane.ready=true;pane.pendingSeek=null;pane.player={getCurrentTime:()=>33.9,pauseVideo:()=>calls.push('pause')};pane.addSceneNote();assert.equal(calls.at(-1)[0],33);
});

test('saving a scene cues it without seekTo autoplay, and retains its time until play',()=>{
  const calls=[],pane=Object.create(YouTubePane.prototype);Object.assign(pane,{youtube:{videoId:id},ready:false,tick(){}});
  pane.prepareScene(83);assert.deepEqual(pane.pendingSeek,{seconds:83,play:false,prepare:true});assert.equal(pane.time(),83);
  pane.ready=true;pane.pendingSeek=null;pane.player={cueVideoById:args=>calls.push(['cue',args]),seekTo:t=>calls.push(['seek',t]),playVideo:()=>calls.push(['play']),getCurrentTime:()=>0};
  pane.prepareScene(83);assert.deepEqual(calls,[['cue',{videoId:id,startSeconds:83}]]);assert.equal(pane.time(),83,'a cued player reporting 0 does not lose the chosen time');
  pane.seek(83,true);assert.deepEqual(calls.slice(1),[['seek',83],['play']]);assert.equal(pane.preparedTime,null);
});

test('scene notes do not enter caption text indexes or produce spatial annotation errors',()=>{
  const parsed=parseHTML(youtubeDocumentHTML('시점')),doc=new DOMParser().parseFromString(parsed.html,'text/html'),before=textIndex(doc).text;
  const pane=Object.create(YouTubePane.prototype);Object.assign(pane,{reader:{doc,metadata:{annotations:[makeVideoNote(id,83,'시점 메모')]},measure(){}},callbacks:{}});
  pane.renderNotes();assert.equal(textIndex(doc).text,before);const box=pane.notes;pane.renderNotes();assert.equal(pane.notes,box);
  pane.reader.metadata.annotations=[];pane.renderNotes();assert.equal(doc.querySelectorAll('[data-scene-row]').length,0);assert.match(pane.notes.textContent,/현재 시점 메모/);
});


test('scene matching stays inside the exact folder, including root, and excludes trash',()=>{
  const records=[{id:'root',metadata:{youtube:{videoId:id}}},{id:'a',folderId:'a',metadata:{youtube:{videoId:id}}},{id:'child',folderId:'a/child',metadata:{youtube:{videoId:id}}},{id:'trash',folderId:'a',trashedAt:1,metadata:{youtube:{videoId:id}}},{id:'other',folderId:'a',metadata:{youtube:{videoId:'dQw4w9WgXcQ'}}}];
  assert.deepEqual(matchingVideoRecords(records,id,'a').map(r=>r.id),['a']);
  assert.deepEqual(matchingVideoRecords(records,id).map(r=>r.id),['root']);
  assert.deepEqual(matchingVideoRecords(records,id,'missing'),[]);
  const note=makeVideoNote(id,83,'기존 메모'),metadata={annotations:[note,makeVideoNote(id,84,'다음 초')]};
  assert.equal(findVideoNote(metadata,id,83),note);assert.equal(findVideoNote(metadata,id,79),null);assert.equal(findVideoNote(metadata,'dQw4w9WgXcQ',83),null);
});


test('nearby time notes include both 3-second boundaries, choose the nearest and break ties by earlier time',()=>{
  const a=makeVideoNote(id,83,'앞 메모'),b=makeVideoNote(id,87,'뒤 메모');
  for(const seconds of [80,81,82,83,84,85,86])assert.equal(findVideoNote({annotations:[a]},id,seconds),a);
  for(const seconds of [79,87,null,undefined,NaN,-1])assert.equal(findVideoNote({annotations:[a]},id,seconds),null);
  const metadata={annotations:[b,a]};assert.equal(findVideoNote(metadata,id,85),a);assert.equal(findVideoNote(metadata,id,86),b);assert.equal(findVideoNote(metadata,id,87),b);
  const start=makeVideoNote(id,0,'처음');assert.equal(findVideoNote({annotations:[start]},id,3),start);assert.equal(findVideoNote({annotations:[start]},id,4),null);
});
