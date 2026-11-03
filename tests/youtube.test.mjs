import test from 'node:test';
import assert from 'node:assert/strict';
import { installDOM } from './dom.mjs';
import { zipFiles } from '../public/src/zip.js';
import { parseHTML, serializeHTML } from '../public/src/document.js';
import { validThumbnail } from '../public/src/model.js';
import { parseYouTubeInput, parseStart, validateYouTube, youtubeDocumentHTML, cueTimes, cueAt, clock, playlistFolderName, matchSubtitleFiles, subtitlesFromZip, decodeSubtitle, subtitleFormat, parseChapters, outlineSections, MAC_GUIDE, SUBTITLE_EXTENSION, guideHTML } from '../public/src/youtube.js';
installDOM();

test('YouTube links of every common shape give the video, playlist and start time',()=>{
  assert.deepEqual(parseYouTubeInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s'),{videoId:'dQw4w9WgXcQ',playlistId:'',start:90});
  assert.deepEqual(parseYouTubeInput('youtu.be/dQw4w9WgXcQ?t=42'),{videoId:'dQw4w9WgXcQ',playlistId:'',start:42});
  assert.equal(parseYouTubeInput('https://m.youtube.com/shorts/dQw4w9WgXcQ').videoId,'dQw4w9WgXcQ');
  assert.equal(parseYouTubeInput('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ').videoId,'dQw4w9WgXcQ');
  assert.equal(parseYouTubeInput('https://www.youtube.com/live/dQw4w9WgXcQ').videoId,'dQw4w9WgXcQ');
  assert.deepEqual(parseYouTubeInput('https://www.youtube.com/playlist?list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb'),{videoId:'',playlistId:'PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb',start:0});
  assert.equal(parseYouTubeInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb').playlistId,'PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb');
  // Auto-generated mixes are not real playlists.
  assert.equal(parseYouTubeInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ').playlistId,'');
  assert.equal(parseYouTubeInput('dQw4w9WgXcQ').videoId,'dQw4w9WgXcQ');
  for(const bad of ['','https://example.com/watch?v=dQw4w9WgXcQ','https://www.youtube.com/@channel','not a link'])assert.equal(parseYouTubeInput(bad),null);
  assert.equal(parseStart('1h2m3s'),3723);assert.equal(parseStart('x'),0);
});

test('only the documented YouTube metadata survives',()=>{
  assert.equal(validateYouTube({videoId:'short'}),undefined);
  const kept=validateYouTube({videoId:'dQw4w9WgXcQ',playlistId:'PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb',index:3,channel:'C',playlistTitle:'P',thumbnail:'data:image/jpeg;base64,AAAA',subtitle:{name:'a.srt',evil:1},script:'<x>'});
  assert.deepEqual(kept,{videoId:'dQw4w9WgXcQ',playlistId:'PLUl4u3cNGP61Oq3tWYp6V_F-5jb5L2iHb',index:3,playlistTitle:'P',channel:'C',thumbnail:'data:image/jpeg;base64,AAAA',subtitle:{name:'a.srt'}});
  assert.equal(validateYouTube({videoId:'dQw4w9WgXcQ',thumbnail:'https://evil.test/x.jpg'}).thumbnail,undefined);
  assert.deepEqual(validateYouTube({videoId:'dQw4w9WgXcQ',chapters:[{t:83.4,title:' Setup '},{t:0,title:'Intro'},{t:5,title:''},{t:-1,title:'x'}]}).chapters,[{t:0,title:'Intro'},{t:83,title:'Setup'}]);
});

const SRT='1\n00:00:01,000 --> 00:00:03,500\nHello there\n\n2\n00:01:02,250 --> 00:01:04,000\nSecond line\n';
test('a subtitle becomes a timed document; its cue times read back as seconds',()=>{
  const html=youtubeDocumentHTML('Video',{text:SRT,format:'srt'}),doc=new DOMParser().parseFromString(html,'text/html');
  const cues=[...doc.querySelectorAll('.subtitle-cue')].map(el=>({...cueTimes(el.querySelector('.subtitle-time').textContent),text:el.querySelector('.subtitle-text').textContent}));
  assert.deepEqual(cues,[{start:1,end:3.5,text:'Hello there'},{start:62.25,end:64,text:'Second line'}]);
  assert.equal(cueAt(cues,0.5),-1);assert.equal(cueAt(cues,1),0);assert.equal(cueAt(cues,40),0);assert.equal(cueAt(cues,63),1);
  assert.equal(clock(62.9),'1:02');assert.equal(clock(3723),'1:02:03');
  const empty=new DOMParser().parseFromString(youtubeDocumentHTML('No subtitle',null),'text/html');
  assert.ok(empty.querySelector('[data-youtube-empty]'));assert.equal(empty.querySelectorAll('.subtitle-cue').length,0);
});

test('YouTube metadata and playback position survive export and re-import',()=>{
  const parsed=parseHTML(youtubeDocumentHTML('Video',{text:SRT,format:'srt'}),{title:'Video',source:'https://www.youtube.com/watch?v=dQw4w9WgXcQ'},{includeMetadata:true});
  parsed.metadata.youtube={videoId:'dQw4w9WgXcQ',channel:'C',evil:'x'};parsed.metadata.view.mediaTime=12.34;
  const doc=new DOMParser().parseFromString(parsed.html,'text/html');
  const again=parseHTML(serializeHTML(doc,parsed.metadata),{},{includeMetadata:true});
  assert.deepEqual(again.metadata.youtube,{videoId:'dQw4w9WgXcQ',channel:'C'});assert.equal(again.metadata.view.mediaTime,12.3);
  // The open player's marker never leaks into an export.
  const marked=new DOMParser().parseFromString(again.html,'text/html');marked.querySelector('.subtitle-cue').setAttribute('data-htmlmemo-yt-now','');
  const style=marked.createElement('style');style.id='htmlmemo-youtube-style';marked.head.append(style);
  const clean=parseHTML(serializeHTML(marked,again.metadata),{},{includeMetadata:true}).html;
  assert.doesNotMatch(clean,/data-htmlmemo-yt-now|htmlmemo-youtube-style/);
});

test('playlist names become valid, unique folder names',()=>{
  assert.equal(playlistFolderName('MIT 6.006: Algorithms / Fall'),'MIT 6.006 Algorithms Fall');
  assert.equal(playlistFolderName('강의',['강의','강의 (2)']),'강의 (3)');
  assert.equal(playlistFolderName(''),'YouTube 재생목록');assert.equal(playlistFolderName('LibreMemo'),'YouTube 재생목록');
});

test('downloaded subtitle files find their videos by ID first, then by title',()=>{
  const videos=[{videoId:'AAAAAAAAAAA',title:'1. Introduction'},{videoId:'BBBBBBBBBBB',title:'Lecture 2: Sorting'},{videoId:'CCCCCCCCCCC',title:'강의 3 — 그래프'}];
  const files=[{name:'[English] Lecture 2 Sorting [DownSub.com].srt'},{name:'AAAAAAAAAAA.en.vtt'},{name:'강의 3 그래프 (한국어).srt'},{name:'unrelated.srt'}];
  const {matches,unmatched}=matchSubtitleFiles(files,videos);
  assert.equal(matches.get('AAAAAAAAAAA').name,'AAAAAAAAAAA.en.vtt');
  assert.equal(matches.get('BBBBBBBBBBB').name,'[English] Lecture 2 Sorting [DownSub.com].srt');
  assert.equal(matches.get('CCCCCCCCCCC').name,'강의 3 그래프 (한국어).srt');
  assert.deepEqual(unmatched.map(f=>f.name),['unrelated.srt']);
});

test('subtitle files inside a zip are read; other entries are ignored',async()=>{
  const encoder=new TextEncoder(),bytes=zipFiles([{name:'subs/one.srt',data:encoder.encode(SRT)},{name:'__MACOSX/subs/._one.srt',data:encoder.encode('x')},{name:'notes.txt',data:encoder.encode('n')}]);
  const entries=await subtitlesFromZip(bytes instanceof Uint8Array?bytes:new Uint8Array(await new Blob([bytes]).arrayBuffer()));
  assert.deepEqual(entries.map(e=>[e.name,decodeSubtitle(e.bytes)]),[['one.srt',SRT]]);
  assert.equal(subtitleFormat('a.SMI'),'smi');assert.equal(subtitleFormat('a.txt'),'');
  assert.equal(decodeSubtitle(new Uint8Array([0xc7,0xd1])),'한');
});

test('the Mac guide uses the subtitle extension and the automatic translation YouTube shows',()=>{
  assert.equal(SUBTITLE_EXTENSION,'https://chromewebstore.google.com/detail/ognjcegpcoafidcfbepkfgnolnnibcjp');
  const text=MAC_GUIDE.join(' ');
  for(const words of ['YouTube Subtitle Downloader','자동 번역','한국어','SRT','챕터','자막 파일 고르기'])assert.ok(text.includes(words),words);
  assert.doesNotMatch(guideHTML(),/collabpals|data-guide-tab/i);
});

test('chapters pasted from a description become the outline; otherwise timestamps by length',()=>{
  assert.deepEqual(parseChapters('Today we learn.\n0:00 Intro\n1:23 - Setup part\n(12:05) Loops\nFunctions 1:02:03\n9:99 bad\nno time'),
    [{t:0,title:'Intro'},{t:83,title:'Setup part'},{t:725,title:'Loops'},{t:3723,title:'Functions'}]);
  assert.deepEqual(parseChapters('0:30 only one'),[]);
  assert.equal(parseChapters('0:15 A\n2:00 B')[0].t,0,'the first chapter starts the video');
  assert.deepEqual(outlineSections(1080).map(s=>s.title),['0:00','1:48','3:36','5:24','7:12','9:00','10:48','12:36','14:24','16:12']);
  assert.deepEqual(outlineSections(185).map(s=>s.title),['0:00','1:00','2:00','3:00']);
  assert.deepEqual(outlineSections(600).map(s=>s.start/1000),[0,60,120,180,240,300,360,420,480,540]);
  assert.deepEqual(outlineSections(1080,[{t:0,title:'Intro'},{t:83,title:'Setup'}]),[{start:0,title:'0:00 Intro'},{start:83000,title:'1:23 Setup'}]);
  const srt=Array.from({length:6},(_,i)=>`${i+1}\n00:0${i}:10,000 --> 00:0${i}:20,000\nLine ${i}\n`).join('\n');
  const timed=new DOMParser().parseFromString(youtubeDocumentHTML('V',{text:srt,format:'srt'}),'text/html');
  assert.deepEqual([...timed.querySelectorAll('h2')].map(h=>h.textContent),['0:00','1:00','2:00','3:00','4:00','5:00']);
  const chaptered=new DOMParser().parseFromString(youtubeDocumentHTML('V',{text:srt,format:'srt'},[],{chapters:[{t:0,title:'Intro'},{t:150,title:'Main'}]}),'text/html');
  assert.deepEqual([...chaptered.querySelectorAll('section')].map(s=>[s.querySelector('h2').textContent,s.querySelectorAll('.subtitle-cue').length]),[['0:00 Intro',3],['2:30 Main',3]]);
});

test('a card picture is kept on export only when it is a small inline image',()=>{
  assert.equal(validThumbnail(''),true);assert.equal(validThumbnail('data:image/jpeg;base64,AAAA'),true);
  for(const bad of ['https://x.test/a.jpg','data:image/svg+xml;base64,AAAA','data:image/jpeg;base64,'+'A'.repeat(400001),null])assert.equal(validThumbnail(bad),false);
  const parsed=parseHTML('<html><body><p>x</p></body></html>',{title:'T'},{includeMetadata:true});
  for(const [thumbnail,kept] of [['data:image/jpeg;base64,AAAA',true],['https://x.test/a.jpg',false]]){
    const doc=new DOMParser().parseFromString(parsed.html,'text/html'),again=parseHTML(serializeHTML(doc,{...parsed.metadata,thumbnail}),{},{includeMetadata:true});
    assert.equal(again.metadata.thumbnail,kept?thumbnail:undefined);
  }
});
