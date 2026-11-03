import test from 'node:test';
import assert from 'node:assert/strict';
import { installDOM } from './dom.mjs';
import { zipFiles } from '../public/src/zip.js';
import { parseHTML, serializeHTML } from '../public/src/document.js';
import { parseYouTubeInput, parseStart, validateYouTube, youtubeDocumentHTML, cueTimes, cueAt, clock, playlistFolderName, matchSubtitleFiles, subtitlesFromZip, decodeSubtitle, subtitleFormat, subtitleSiteURL, DOWNLOAD_GUIDES, guideHTML } from '../public/src/youtube.js';
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

test('the download guide covers every platform and opens the site with the link filled in',()=>{
  assert.deepEqual(DOWNLOAD_GUIDES.map(g=>g.id),['mac','pc','android','iphone']);
  for(const guide of DOWNLOAD_GUIDES)assert.ok(guide.steps.length>=3);
  assert.match(guideHTML(),/data-guide="iphone" hidden/);
  assert.equal(subtitleSiteURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),'https://downsub.com/?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DdQw4w9WgXcQ');
});
