import test from 'node:test';
import assert from 'node:assert/strict';
import { installDOM } from './dom.mjs';
import { zipFiles } from '../public/src/zip.js';
import { parseHTML, serializeHTML } from '../public/src/document.js';
import { validThumbnail } from '../public/src/model.js';
import { parseYouTubeInput, parseStart, validateYouTube, youtubeDocumentHTML, cueTimes, cueAt, clock, playlistFolderName, matchSubtitleFiles, subtitlesFromZip, decodeSubtitle, subtitleFormat, parseChapters, outlineSections, withFirstWords, MAC_GUIDE, SUBTITLE_EXTENSION, guideHTML } from '../public/src/youtube.js';
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
  assert.ok(guideHTML().includes('>'+SUBTITLE_EXTENSION+'</a>'),'the exact store address is shown, not only behind a button');
  assert.match(guideHTML(),/같은 이름의 확장 프로그램이 여럿/);
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
  assert.deepEqual([...timed.querySelectorAll('h2')].map(h=>h.textContent),['0:00 Line 0','1:00 Line 1','2:00 Line 2','3:00 Line 3','4:00 Line 4','5:00 Line 5']);
  assert.deepEqual(withFirstWords([{start:0,title:'0:00'},{start:60000,title:'1:00'}],[{start:5000,text:'So we did Code in Place before Cursor and Cloud Code'},{start:61000,text:'Hi'}]).map(s=>s.title),['0:00 So we did Code in Place before…','1:00 Hi']);
  // Mid-sentence fragments give way to the next sentence; short cues are joined.
  const fragments=[{start:0,text:'Hi there'},{start:60000,text:'suppose, if I start'},{start:62000,text:'outsourcing my thinking.'},{start:64000,text:'Then what'},{start:66000,text:'happens to us?'}];
  assert.deepEqual(withFirstWords([{start:0,title:'0:00'},{start:60000,title:'1:00'}],fragments).map(s=>s.title),['0:00 Hi there','1:00 Then what happens to us?']);
  assert.equal(withFirstWords([{start:0,title:'0:00'}],[{start:0,text:'>> So, Karel [music] speaks'}])[0].title,'0:00 So, Karel speaks');
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

test('the player shows each cue compactly: start time to the second beside the text, saved label kept',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const long=SRT+'\n3\n01:02:03,900 --> 01:02:05,000\nLate line\n';
  const doc=new DOMParser().parseFromString(youtubeDocumentHTML('Video',{text:long,format:'srt'}),'text/html');
  const labels=[...doc.querySelectorAll('.subtitle-time')].map(n=>n.textContent);
  const pane={reader:{doc},onDocClick(){}};YouTubePane.prototype.indexCues.call(pane);
  assert.deepEqual([...doc.querySelectorAll('.subtitle-time')].map(n=>n.dataset.clock),['0:01','1:02','1:02:03']);
  assert.deepEqual([...doc.querySelectorAll('.subtitle-time')].map(n=>n.textContent),labels,'the saved label text is unchanged');
  assert.deepEqual(pane.cues.map(c=>c.start),[1,62.25,3723.9]);
  assert.equal(doc.querySelector('[data-subtitles]').hasAttribute('data-htmlmemo-yt-long'),true);
  const css=doc.getElementById('htmlmemo-youtube-style').textContent;
  assert.match(css,/\.subtitle-cue\{display:flex;align-items:baseline/);assert.match(css,/content:attr\(data-clock\)/);assert.match(css,/\.subtitle-time\{[^}]*color:transparent/);
});

test('dragging the strip under the video bar sets the video height, remembered as a share of the window',async()=>{
  const {YouTubePane,VIDEO_SHARE_MAX,clampShare}=await import('../public/src/youtube-ui.js');
  const store=new Map(),listeners=[];
  const saved={window:globalThis.window,localStorage:globalThis.localStorage};
  globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))};
  globalThis.window={innerHeight:1000,addEventListener:(t,f)=>listeners.push(t),removeEventListener(){}};
  try{
    const doc=new DOMParser().parseFromString('<section class="youtube-pane"><div class="youtube-video"></div><div class="youtube-bar"></div><div class="youtube-resize"></div></section>','text/html');
    const pane=doc.querySelector('.youtube-pane'),video=pane.querySelector('.youtube-video'),handle=pane.querySelector('.youtube-resize');
    Object.defineProperty(pane,'clientWidth',{value:1600});
    video.getBoundingClientRect=()=>({height:pane.hasAttribute('data-yt-sized')?parseFloat(pane.style.getPropertyValue('--yt-video-h')):400});
    const self={pane,video,tab:{host:{clientHeight:950}}};Object.setPrototypeOf(self,YouTubePane.prototype);self.bindResize();
    assert.equal(pane.hasAttribute('data-yt-sized'),false,'default size until dragged');assert.deepEqual(listeners,['resize']);
    handle.onpointerdown({button:0,pointerId:3,clientY:500,preventDefault(){}});assert.equal(pane.classList.contains('youtube-resizing'),true);
    handle.onpointermove({pointerId:3,clientY:650});assert.equal(pane.style.getPropertyValue('--yt-video-h'),'550px');
    handle.onpointerup({pointerId:3});assert.equal(pane.classList.contains('youtube-resizing'),false);assert.equal(store.get('librememo-youtube-height'),'0.55');
    handle.onpointerdown({button:0,pointerId:4,clientY:500,preventDefault(){}});handle.onpointermove({pointerId:4,clientY:2000});handle.onpointerup({pointerId:4});
    assert.equal(pane.style.getPropertyValue('--yt-video-h'),'850px','no taller than 85% of the window');
    handle.onpointerdown({button:0,pointerId:5,clientY:500,preventDefault(){}});handle.onpointermove({pointerId:5,clientY:-2000});handle.onpointerup({pointerId:5});
    assert.equal(pane.style.getPropertyValue('--yt-video-h'),'120px');
    handle.onkeydown({key:'ArrowDown',preventDefault(){}});assert.equal(pane.style.getPropertyValue('--yt-video-h'),'170px');
    handle.ondblclick();assert.equal(pane.hasAttribute('data-yt-sized'),false);assert.equal(store.get('librememo-youtube-height'),'0');
    store.set('librememo-youtube-height','0.3');const again={pane,video,tab:{host:{clientHeight:950}}};Object.setPrototypeOf(again,YouTubePane.prototype);again.bindResize();
    assert.equal(pane.style.getPropertyValue('--yt-video-h'),'300px','a later video opens at the remembered size');
    assert.equal(clampShare(5),VIDEO_SHARE_MAX);
    pane.classList.add('youtube-collapsed');handle.onpointerdown({button:0,pointerId:6,clientY:0,preventDefault(){}});assert.equal(pane.classList.contains('youtube-resizing'),false,'no drag while folded');
  }finally{globalThis.window=saved.window;globalThis.localStorage=saved.localStorage;}
});

test('punctuation that machine translation pushes to the next cue goes back to the end of the cue before',async()=>{
  const {mendCuePunctuation}=await import('../public/src/office-subtitles.js');
  const cue=(start,text)=>({start,end:start+1000,text});
  assert.deepEqual(mendCuePunctuation([cue(0,'미국에 오게 되었습니다'),cue(2000,'. 저는 그저 호기심 많은 사람이었을 뿐입니다. 저는 처음부터'),cue(5000,'교수가 되려고 마음먹은 건 아니었어요'),cue(8000,'. 저는 배우는 걸 좋아하고'),cue(9000,' ?'),cue(9500,'...그래서')]).map(c=>c.text),
    ['미국에 오게 되었습니다.','저는 그저 호기심 많은 사람이었을 뿐입니다. 저는 처음부터','교수가 되려고 마음먹은 건 아니었어요.','저는 배우는 걸 좋아하고?','...그래서']);
  assert.deepEqual(mendCuePunctuation([cue(0,'. 처음')]).map(c=>c.text),['. 처음'],'the first cue has nothing before it');
  const srt='1\n00:02:30,000 --> 00:02:32,000\n결국 미국에 오게 되었습니다\n\n2\n00:02:32,000 --> 00:02:35,000\n. 저는 그저 호기심 많은 사람이었을 뿐입니다\n';
  const doc=new DOMParser().parseFromString(youtubeDocumentHTML('Video',{text:srt,format:'srt'}),'text/html');
  assert.deepEqual([...doc.querySelectorAll('.subtitle-text')].map(n=>n.textContent),['결국 미국에 오게 되었습니다.','저는 그저 호기심 많은 사람이었을 뿐입니다']);
});

test('the video player hides YouTube\'s own full-screen button; double-tapping the picture is the full-screen control',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('../public/src/youtube-ui.js',import.meta.url),'utf8');
  const main=source.match(/this\.player=new YT\.Player\([^;]*playerVars:\{([^}]*)\}/);
  assert.ok(main,'main player options');assert.match(main[1],/(^|,)fs:0(,|$)/);
  assert.match(source,/this\.toggleFullscreen\(\);return;/,'a second tap still toggles full screen');
  const css=await readFile(new URL('../public/design.tailwind.css',import.meta.url),'utf8');
  assert.match(css,/\.youtube-zones\{[^}]*bottom:clamp\(88px,16%,140px\)/,'tap zones stop above the progress bar');
});

test('the video clock reads "current / total" once the player knows the length',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const pane={player:{getDuration:()=>3723}};
  assert.equal(YouTubePane.prototype.clockText.call(pane,359),'5:59 / 1:02:03');
  pane.player.getDuration=()=>0;assert.equal(YouTubePane.prototype.clockText.call(pane,359),'5:59');
  assert.equal(YouTubePane.prototype.clockText.call({},5),'0:05');
});

test('clicking YouTube\'s own controls lets its panels (more videos, ✕) take clicks until the video plays again',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const doc=new DOMParser().parseFromString('<section><div class="youtube-video"><div class="youtube-frame"><iframe></iframe></div><div class="youtube-zones"></div></div><iframe id="other"></iframe></section>','text/html');
  const pane={pane:doc.querySelector('section'),video:doc.querySelector('.youtube-video')};
  const zones=doc.querySelector('.youtube-zones'),yieldZones=YouTubePane.prototype.yieldZones,resumeZones=YouTubePane.prototype.resumeZones;
  assert.equal(yieldZones.call(pane,doc.querySelector('#other')),false);assert.equal(zones.hasAttribute('data-yield'),false,'another frame does not count');
  assert.equal(yieldZones.call(pane,doc.querySelector('button')),false);
  assert.equal(yieldZones.call(pane,doc.querySelector('.youtube-frame iframe')),true);assert.equal(zones.hasAttribute('data-yield'),true);
  resumeZones.call(pane);assert.equal(zones.hasAttribute('data-yield'),false);
  const {readFile}=await import('node:fs/promises');
  const css=await readFile(new URL('../public/design.tailwind.css',import.meta.url),'utf8');assert.match(css,/\.youtube-zones\[data-yield\]\{pointer-events:none\}/);
  const source=await readFile(new URL('../public/src/youtube-ui.js',import.meta.url),'utf8');assert.match(source,/const playing=event\.data===1;this\.playing=playing;if\(playing\)this\.resumeZones\(\);/);
});

test('the − and + buttons in the video bar shrink and grow the video by a tenth of the window, within the same limits',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const store=new Map();const saved={window:globalThis.window,localStorage:globalThis.localStorage};
  globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))};
  globalThis.window={innerHeight:1000,addEventListener(){},removeEventListener(){}};
  try{
    const doc=new DOMParser().parseFromString('<section class="youtube-pane youtube-collapsed"><div class="youtube-video"></div><div class="youtube-bar"><button data-yt="smaller"></button><button data-yt="bigger"></button><button data-yt="size"></button></div><div class="youtube-resize"></div></section>','text/html');
    const pane=doc.querySelector('.youtube-pane'),video=pane.querySelector('.youtube-video');
    Object.defineProperty(pane,'clientWidth',{value:1600});
    video.getBoundingClientRect=()=>({height:pane.hasAttribute('data-yt-sized')?parseFloat(pane.style.getPropertyValue('--yt-video-h')):400});
    const self={pane,video,tab:{host:{clientHeight:950}},$:name=>pane.querySelector(`[data-yt="${name}"]`)};Object.setPrototypeOf(self,YouTubePane.prototype);
    pane.querySelector('[data-yt="size"]').onclick=()=>pane.classList.toggle('youtube-collapsed');
    self.bindResize();
    pane.querySelector('[data-yt="bigger"]').onclick();assert.equal(pane.classList.contains('youtube-collapsed'),false,'a collapsed video opens');
    assert.equal(pane.style.getPropertyValue('--yt-video-h'),'500px');assert.equal(store.get('librememo-youtube-height'),'0.5');
    pane.querySelector('[data-yt="smaller"]').onclick();pane.querySelector('[data-yt="smaller"]').onclick();assert.equal(pane.style.getPropertyValue('--yt-video-h'),'300px');
    for(let i=0;i<10;i++)pane.querySelector('[data-yt="smaller"]').onclick();assert.equal(pane.style.getPropertyValue('--yt-video-h'),'120px','never below 12% of the window');
    for(let i=0;i<12;i++)pane.querySelector('[data-yt="bigger"]').onclick();assert.equal(pane.style.getPropertyValue('--yt-video-h'),'850px','no taller than 85% of the window');
  }finally{globalThis.window=saved.window;globalThis.localStorage=saved.localStorage;}
});

test('YouTube player shortcuts work from the app, and fields, buttons and sliders keep their keys',async()=>{
  const {YouTubePane,YOUTUBE_SHORTCUTS}=await import('../public/src/youtube-ui.js');
  const store=new Map();const saved=globalThis.localStorage;globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))};
  try{
    const doc=new DOMParser().parseFromString('<section><select data-yt="rate"><option value="1" selected>1</option><option value="1.25">1.25</option><option value="0.75">0.75</option></select><button data-yt="next"></button><button data-yt="prev" hidden></button><input id="field"><button id="btn"></button><div role="separator" id="strip"></div><p id="text"></p></section>','text/html');
    const pane=doc.querySelector('section'),calls=[],log=[],rate={value:'1'};
    const p={state:2,t:30,volume:50,muted:false,rate:1,getPlayerState(){return this.state;},seekTo(t){this.t=t;log.push(['seek',Math.round(t*100)/100]);},playVideo(){this.state=1;log.push(['play']);},pauseVideo(){this.state=2;log.push(['pause']);},getCurrentTime(){return this.t;},getDuration:()=>200,getVolume(){return this.volume;},setVolume(v){this.volume=v;},unMute(){this.muted=false;},mute(){this.muted=true;},isMuted(){return this.muted;},setPlaybackRate(r){this.rate=r;},loadModule(m){log.push(['load',m]);},unloadModule(m){log.push(['unload',m]);},setOption(){}};
    const self={pane,player:p,ready:true,callbacks:{onShortcuts:()=>calls.push('?'),onNavigate:step=>calls.push(step)},$:name=>name==='rate'?rate:pane.querySelector(`[data-yt="${name}"]`),flash(){},tick(){},toggleFullscreen:()=>calls.push('full')};
    Object.setPrototypeOf(self,YouTubePane.prototype);
    const key=(k,target=doc.querySelector('#text'),extra={})=>self.handleKey({key:k,target,shiftKey:/^[A-Z?<>]$/.test(k),...extra});
    assert.equal(key(' '),true);assert.equal(p.state,1,'Space plays');assert.equal(key('k'),true);assert.equal(p.state,2,'K pauses');
    self.target=null;p.t=30;key('ArrowRight');assert.equal(p.t,35);self.target=null;key('j');assert.equal(p.t,25);self.target=null;key('l');assert.equal(p.t,35);self.target=null;key('ArrowLeft');assert.equal(p.t,30);
    self.target=null;key('.');assert.equal(Math.round(p.t*30),901,'one frame forward while paused');
    key('5');assert.equal(p.t,100,'5 → 50%');key('Home');assert.equal(p.t,0);key('End');assert.equal(p.t,199.5);
    key('ArrowUp');assert.equal(p.volume,55);key('ArrowDown');key('ArrowDown');assert.equal(p.volume,45);
    key('m');assert.equal(p.muted,true);key('m');assert.equal(p.muted,false);
    key('>');assert.equal(p.rate,1.25);assert.equal(rate.value,'1.25');assert.equal(store.get('librememo-youtube-rate'),'1.25');
    key('<');key('<');assert.equal(p.rate,.75);
    key('c');key('c');assert.deepEqual(log.filter(x=>x[0]!=='seek'&&x[0]!=='play'&&x[0]!=='pause'),[['load','captions'],['unload','captions']]);
    assert.equal(key('f'),true);assert.equal(key('?'),true);assert.equal(key('N'),true);assert.equal(key('P'),false,'no previous video: the key is left alone');
    assert.deepEqual(calls,['full','?',1]);
    const before=log.length;
    assert.equal(key(' ',doc.querySelector('#field')),false);assert.equal(key('k',doc.querySelector('#field')),false);
    assert.equal(key(' ',doc.querySelector('#btn')),false,'Space presses a focused button');assert.equal(key('ArrowLeft',doc.querySelector('#strip')),false,'the resize strip keeps its arrows');
    assert.equal(key('k',undefined,{ctrlKey:true}),false);assert.equal(key('v'),false,'tool keys stay with the app');assert.equal(key('n'),false);
    assert.equal(log.length,before);
    assert.ok(YOUTUBE_SHORTCUTS.some(([k])=>k==='?'));
  }finally{globalThis.localStorage=saved;}
});

test('the app hands keys to the YouTube pane before the reader and tool shortcuts',async()=>{
  const {readFile}=await import('node:fs/promises');
  const app=await readFile(new URL('../public/src/app.js',import.meta.url),'utf8');
  const routed=app.indexOf('if(active()?.youtube?.handleKey?.(event)){event.preventDefault();return;}');
  assert.ok(routed>0);assert.ok(routed<app.indexOf('if(reader().handleReadingKey?.(event))'));assert.ok(routed<app.indexOf("const tools={v:'select'"));
  assert.match(app,/onShortcuts:\(\)=>\{if\(!\$\('#dialog'\)\.open\)youtubeShortcutsDialog\(YOUTUBE_SHORTCUTS\);\}/);
});

test('the tap zones over the video never draw a focus box, and Space on one is the play shortcut',async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('../public/src/youtube-ui.js',import.meta.url),'utf8'),css=await readFile(new URL('../public/design.tailwind.css',import.meta.url),'utf8');
  for(const zone of ['back','play','forward'])assert.match(source,new RegExp(`<button type="button" tabindex="-1" data-yt="${zone}"`));
  assert.match(source,/const tap=action=>event=>\{event\?\.currentTarget\?\.blur\?\.\(\);/,'a click leaves no focus on the zone');
  assert.match(css,/\.youtube-zones button,\.youtube-zones button:focus,\.youtube-zones button:focus-visible\{outline:none\}/);assert.doesNotMatch(css,/\.youtube-zones button:focus-visible\{outline:2px/);
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const doc=new DOMParser().parseFromString('<div class="youtube-zones"><button data-yt="play"></button></div>','text/html');
  const p={state:2,getPlayerState(){return this.state;},playVideo(){this.state=1;},pauseVideo(){this.state=2;},seekTo(){}};
  const self={player:p,ready:true,callbacks:{},$:()=>null,flash(){}};Object.setPrototypeOf(self,YouTubePane.prototype);
  assert.equal(self.handleKey({key:' ',target:doc.querySelector('button')}),true);assert.equal(p.state,1);
});

test('the video grows only until one subtitle line is left, and following keeps the playing line centred',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const store=new Map();const saved={window:globalThis.window,localStorage:globalThis.localStorage};
  globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))};
  globalThis.window={innerHeight:1000,addEventListener(){},removeEventListener(){}};
  try{
    const doc=new DOMParser().parseFromString('<section class="youtube-pane"><div class="youtube-video"></div><div class="youtube-bar"><button data-yt="smaller"></button><button data-yt="bigger"></button></div><div class="youtube-resize"></div></section>','text/html');
    const pane=doc.querySelector('.youtube-pane'),video=pane.querySelector('.youtube-video');Object.defineProperty(pane,'clientWidth',{value:1600});
    video.getBoundingClientRect=()=>({height:pane.hasAttribute('data-yt-sized')?parseFloat(pane.style.getPropertyValue('--yt-video-h')):400});
    const cueEl={ownerDocument:{defaultView:{getComputedStyle:()=>({lineHeight:'30px',paddingTop:'4px',paddingBottom:'4px'})}}};
    const host={clientHeight:600};
    const self={pane,video,tab:{host},cues:[{el:cueEl}],current:0,follow:false,reader:{},$:()=>null};Object.setPrototypeOf(self,YouTubePane.prototype);
    assert.equal(self.subtitleLine(),46,'line 30 + padding 8 + spacing 8');
    self.bindResize();for(let i=0;i<12;i++)pane.querySelector('[data-yt="bigger"]').onclick();
    assert.equal(pane.style.getPropertyValue('--yt-video-h'),'553px','600 − 1 − one 46px line');
    store.set('librememo-youtube-height','0');self.videoShare=null;host.clientHeight=300;self.applyVideoHeight();
    assert.equal(pane.style.getPropertyValue('--yt-video-h'),'253px','the default size also leaves one line on a short window');
    host.clientHeight=900;self.applyVideoHeight();assert.equal(pane.hasAttribute('data-yt-sized'),false,'back to the default when it fits');
  }finally{globalThis.window=saved.window;globalThis.localStorage=saved.localStorage;}
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('../public/src/youtube-ui.js',import.meta.url),'utf8');
  assert.match(source,/if\(cue&&this\.follow&&\(this\.playing\|\|force\)&&Date\.now\(\)>this\.quietUntil\)this\.reveal\(true\);/,'every new line is centred while following');
});
test('the centring space after the last subtitle is app UI that saving drops',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const {serializeHTML}=await import('../public/src/document.js');
  const doc=new DOMParser().parseFromString('<html><head></head><body><article data-subtitles><p>Line</p></article></body></html>','text/html');
  let measured=0;const self={reader:{doc,viewport:{clientHeight:500},measure:()=>measured++}};Object.setPrototypeOf(self,YouTubePane.prototype);
  self.ensureCenterSpace();const space=doc.getElementById('htmlmemo-yt-center-space');
  assert.equal(space.style.height,'250px');assert.equal(doc.body.lastElementChild,space);assert.equal(measured,1);
  self.ensureCenterSpace();assert.equal(measured,1,'unchanged height does not re-measure');
  assert.doesNotMatch(serializeHTML(doc,{version:1,annotations:[]}),/htmlmemo-yt-center-space/);
});

test('the line left under the video is not the one hidden by a low annotation toolbar',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const toolbar={hidden:false,getBoundingClientRect:()=>({top:720,height:20,bottom:740})};
  const host={getBoundingClientRect:()=>({top:50,height:720,bottom:770}),ownerDocument:{getElementById:id=>id==='toolbar'?toolbar:null}};
  const self={tab:{host}};Object.setPrototypeOf(self,YouTubePane.prototype);
  assert.equal(self.toolbarOverlap(),54,'770 − 720 + 4');
  toolbar.getBoundingClientRect=()=>({top:80,height:20,bottom:100});assert.equal(self.toolbarOverlap(),0,'a toolbar moved up over the video takes nothing');
  toolbar.hidden=true;assert.equal(self.toolbarOverlap(),0);
});

test('the playing line is centred in the visible part: below the top padding and above a low toolbar',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const {serializeHTML}=await import('../public/src/document.js');
  const doc=new DOMParser().parseFromString('<html><head></head><body><p data-htmlmemo-yt-now>Line</p></body></html>','text/html');
  const toolbar={hidden:false,getBoundingClientRect:()=>({top:700,height:20,bottom:720})};
  const viewport={getBoundingClientRect:()=>({top:300,height:440,bottom:740}),ownerDocument:{defaultView:{getComputedStyle:()=>({paddingTop:'24px'})}}};
  const self={reader:{doc,viewport,frame:{offsetWidth:500,getBoundingClientRect:()=>({width:1000})}},tab:{host:{ownerDocument:{getElementById:id=>id==='toolbar'?toolbar:null}}}};
  Object.setPrototypeOf(self,YouTubePane.prototype);
  assert.deepEqual(self.visibleCuts(),{top:24,bottom:44});
  self.centerMargins();assert.equal(doc.getElementById('htmlmemo-yt-center-style').textContent,'[data-htmlmemo-yt-now]{scroll-margin:12px 0 22px}','screen px divided by the 2× zoom');
  assert.doesNotMatch(serializeHTML(doc,{version:1,annotations:[]}),/htmlmemo-yt-center-style/);
});

test('annotating subtitles never starts a paused video: only a plain click on a time plays',async()=>{
  const {YouTubePane}=await import('../public/src/youtube-ui.js');
  const doc=new DOMParser().parseFromString('<article><p class="subtitle-cue"><span class="subtitle-time">0:05</span> Hello</p></article>','text/html');
  const time=doc.querySelector('.subtitle-time'),seeks=[];
  const pane=Object.create(YouTubePane.prototype);
  Object.assign(pane,{reader:{doc,tool:'select'},cues:[{el:doc.querySelector('.subtitle-cue'),start:5}],seek:(t,play)=>seeks.push([t,play])});
  // Pull the two handlers out of the constructor source so they run as written.
  const {readFile}=await import('node:fs/promises');const src=await readFile(new URL('../public/src/youtube-ui.js',import.meta.url),'utf8');
  const body=src.slice(src.indexOf('this.onDocPointerDown='),src.indexOf('// A timestamp in the outline'));
  new Function(body).call(pane);
  doc.getSelection=()=>({isCollapsed:true});
  const press=(x,y)=>pane.onDocPointerDown({clientX:x,clientY:y}),click=(x,y)=>pane.onDocClick({target:time,clientX:x,clientY:y});
  press(10,10);click(60,10);assert.deepEqual(seeks,[],'a drag from the time to mark text does not play');
  pane.reader.tool='highlight';press(10,10);click(10,10);assert.deepEqual(seeks,[],'annotation tools never play');
  pane.reader.tool='select';doc.getSelection=()=>({isCollapsed:false});press(10,10);click(10,10);assert.deepEqual(seeks,[],'a selection does not play');
  doc.getSelection=()=>({isCollapsed:true});press(10,10);click(11,10);assert.deepEqual(seeks,[[5,true]],'a plain click on the time plays from there');
});
