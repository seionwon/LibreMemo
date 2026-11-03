// YouTube videos as subtitle documents. Everything here is pure (no DOM, no
// network) so it can be tested in Node. The browser parts live in youtube-ui.js.
//
// A browser app cannot fetch YouTube captions itself (timedtext needs a token the
// page cannot get, and the player API rejects other origins), so the learner brings
// the subtitle file. The video plays from YouTube; the subtitle becomes an ordinary
// LibreMemo subtitle document, so highlights, notes, bookmarks, search and export
// all work exactly as for any other document.
import {renderSubtitles} from './office-subtitles.js';
import {officeHTML,esc} from './office-common.js';

export const SUBTITLE_FORMATS=['srt','vtt','smi','sami','ass','ssa'];
const ID=/^[A-Za-z0-9_-]{11}$/,LIST=/^[A-Za-z0-9_-]{10,64}$/;

/** Seconds from `t=`/`start=` values such as 90, 90s, 1m30s or 1h2m3s. */
export function parseStart(value){
  const s=String(value??'').trim();if(!s)return 0;
  if(/^\d+$/.test(s))return Number(s);
  const m=s.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
  return m&&(m[1]||m[2]||m[3])?(+m[1]||0)*3600+(+m[2]||0)*60+(+m[3]||0):0;
}
/** Any YouTube link (watch, youtu.be, shorts, embed, live, playlist, music) or a bare video ID. */
export function parseYouTubeInput(value){
  const text=String(value??'').trim();if(!text)return null;
  if(ID.test(text))return {videoId:text,playlistId:'',start:0};
  let url;try{url=new URL(/^[a-z]+:\/\//i.test(text)?text:'https://'+text);}catch{return null;}
  const host=url.hostname.replace(/^(?:www|m|music)\./,'');
  if(!['youtube.com','youtu.be','youtube-nocookie.com'].includes(host))return null;
  let videoId='';
  if(host==='youtu.be')videoId=url.pathname.slice(1).split('/')[0];
  else if(url.pathname==='/watch')videoId=url.searchParams.get('v')||'';
  else{const m=url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);if(m)videoId=m[1];}
  const list=url.searchParams.get('list')||'';
  const playlistId=LIST.test(list)&&!/^(?:RD|UL|LL|WL)/.test(list)?list:'';
  if(!ID.test(videoId))videoId='';
  if(!videoId&&!playlistId)return null;
  return {videoId,playlistId,start:parseStart(url.searchParams.get('t')||url.searchParams.get('start'))};
}
export const watchURL=(videoId,playlistId='')=>'https://www.youtube.com/watch?v='+videoId+(playlistId?'&list='+playlistId:'');
export const playlistURL=playlistId=>'https://www.youtube.com/playlist?list='+playlistId;
export const thumbnailURL=videoId=>'https://i.ytimg.com/vi/'+videoId+'/mqdefault.jpg';

/** The only shape kept in a document's metadata (also on export/import). */
export function validateYouTube(value){
  if(!value||typeof value!=='object'||!ID.test(value.videoId))return undefined;
  const text=(v,n)=>typeof v==='string'?v.slice(0,n):'';
  const out={videoId:value.videoId};
  if(LIST.test(value.playlistId||''))out.playlistId=value.playlistId;
  if(Number.isInteger(value.index)&&value.index>=0&&value.index<100000)out.index=value.index;
  for(const key of ['playlistTitle','channel'])if(text(value[key],300))out[key]=text(value[key],300);
  // A small JPEG kept inline so card thumbnails also work offline.
  if(typeof value.thumbnail==='string'&&value.thumbnail.length<=400000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value.thumbnail))out.thumbnail=value.thumbnail;
  if(value.subtitle&&typeof value.subtitle==='object'&&text(value.subtitle.name,300))out.subtitle={name:text(value.subtitle.name,300)};
  return out;
}

export function subtitleFormat(name){const ext=String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]||'';return SUBTITLE_FORMATS.includes(ext)?ext:'';}
/** Subtitle files are usually UTF-8; older Korean SAMI files are often EUC-KR. */
export function decodeSubtitle(bytes){
  try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{return new TextDecoder('euc-kr').decode(bytes);}
}

const STYLE='<style>.youtube-empty{max-width:640px;margin:48px auto;padding:24px;border:1px dashed var(--htmlmemo-reader-line,#d0d7e2);border-radius:12px;text-align:center;color:var(--htmlmemo-reader-muted,#667085)}.youtube-empty strong{display:block;color:var(--htmlmemo-reader-ink,#202633);font-size:1.15em;margin-bottom:.4em}</style>';
/**
 * The reading document of one video: its subtitle, or (until one is attached)
 * a short note. The note carries no time cues, so nothing in it is synced.
 */
export function youtubeDocumentHTML(title,subtitle=null,warnings=[]){
  const body=subtitle?renderSubtitles(subtitle.text,subtitle.format,warnings)
    :STYLE+'<article class="office-subtitles youtube-empty" data-youtube-empty><strong>아직 자막이 없습니다.</strong><p>위쪽 영상 막대의 「자막 받기」로 자막 파일(.srt)을 받고 「자막 붙이기」로 고르면, 영상과 함께 움직이는 자막에 형광펜·메모·북마크를 달 수 있습니다.</p></article>';
  return officeHTML(title,body,warnings);
}

/** "00:01:02.345 → 00:01:04.000" (as rendered by office-subtitles) → seconds. */
export function cueTimes(label){
  const m=String(label||'').match(/(\d+):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(?:\s*→\s*(\d+):(\d{2}):(\d{2})(?:\.(\d{1,3}))?)?/);
  if(!m)return null;
  const s=(h,mi,se,ms)=>(+h)*3600+(+mi)*60+(+se)+(ms?Number(ms.padEnd(3,'0'))/1000:0);
  const start=s(m[1],m[2],m[3],m[4]);return {start,end:m[5]?s(m[5],m[6],m[7],m[8]):null};
}
/** Index of the cue playing at `time` (cues sorted by start), or -1 before the first. */
export function cueAt(cues,time){
  let lo=0,hi=cues.length-1,found=-1;
  while(lo<=hi){const mid=(lo+hi)>>1;if(cues[mid].start<=time+.05){found=mid;lo=mid+1;}else hi=mid-1;}
  return found;
}
export function clock(seconds){
  const v=Math.max(0,Math.floor(seconds||0)),h=Math.floor(v/3600),m=Math.floor(v%3600/60),s=v%60;
  return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(s).padStart(2,'0');
}

/** A playlist title usable as a library folder name (see library-folders.js folderName). */
export function playlistFolderName(title,taken=[]){
  let name=String(title||'').normalize('NFC').replace(/[\u0000-\u001f\u007f/\\<>:"|?*]+/g,' ').replace(/\s+/g,' ').trim().replace(/^\.+/,'').replace(/[. ]+$/,'');
  if(!name||/^(?:HTMLMemo|LibreMemo)(?:[.-]|$)/i.test(name)||/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))name='YouTube 재생목록';
  while(new TextEncoder().encode(name).length>200)name=name.slice(0,-1).trim();
  const used=new Set(taken.map(n=>n.normalize('NFC').toLocaleLowerCase('en-US')));
  let candidate=name;for(let n=2;used.has(candidate.toLocaleLowerCase('en-US'));n++)candidate=name+' ('+n+')';
  return candidate;
}

// Downloaded subtitle names look like "[English] Title [DownSub.com].srt",
// "Title (English).vtt" or contain the video ID. Compare letters and digits only.
const normal=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('ko').replace(/\.[a-z0-9]{2,4}$/,'')
  .replace(/\[(?:[^\]]*\.(?:com|net|org|io|co)|english|korean|한국어|영어|auto[- ]?generated|자동 생성)[^\]]*\]/gi,' ')
  .replace(/\((?:english|korean|한국어|영어)[^)]*\)/gi,' ').replace(/[^\p{L}\p{N}]+/gu,'');
/**
 * Pair subtitle files with videos: first by a video ID in the file name, then by
 * title. Each video and each file is used at most once; the rest are returned.
 */
export function matchSubtitleFiles(files,videos){
  const matches=new Map(),left=[];
  for(const file of files){
    const id=videos.find(v=>!matches.has(v.videoId)&&String(file.name).includes(v.videoId));
    if(id)matches.set(id.videoId,file);else left.push(file);
  }
  const unmatched=[];
  for(const file of left){
    const name=normal(file.name);let best=null;
    if(name.length>=2)for(const video of videos){
      if(matches.has(video.videoId))continue;const title=normal(video.title);
      if(title.length<2||!(name===title||name.includes(title)||title.includes(name)&&name.length>=Math.min(8,title.length)))continue;
      if(!best||title.length>normal(best.title).length)best=video;
    }
    if(best)matches.set(best.videoId,file);else unmatched.push(file);
  }
  return {matches,unmatched};
}

/** Subtitle entries inside a ZIP (stored or deflated). Other entries are ignored. */
export async function subtitlesFromZip(bytes){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),out=[],decoder=new TextDecoder();
  let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){end=i;break;}
  if(end<0)throw Error('zip 파일을 읽지 못했습니다.');
  let p=view.getUint32(end+16,true);
  for(let i=0,count=view.getUint16(end+10,true);i<count&&view.getUint32(p,true)===0x02014b50;i++){
    const method=view.getUint16(p+10,true),size=view.getUint32(p+20,true),length=view.getUint32(p+24,true),nameLength=view.getUint16(p+28,true),local=view.getUint32(p+42,true);
    const path=decoder.decode(bytes.subarray(p+46,p+46+nameLength)),name=path.split('/').pop();
    p+=46+nameLength+view.getUint16(p+30,true)+view.getUint16(p+32,true);
    if(!subtitleFormat(name)||/^__MACOSX\//.test(path)||name.startsWith('._'))continue;
    if(length>64*1024*1024)throw Error('zip 안의 자막 파일이 너무 큽니다.');
    const start=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true),data=bytes.subarray(start,start+size);
    let content;
    if(method===0)content=data;
    else if(method===8)content=new Uint8Array(await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    else continue;
    out.push({name,bytes:content});
  }
  return out;
}

// CollabPals: free, no sign-up, every caption language the video has (Korean included),
// one video at a time. It cannot take the link in its address, so LibreMemo copies the
// link to the clipboard and opens the page; the learner pastes it.
export const SUBTITLE_SITE='https://www.collabpals.com/tools/youtube-subtitle-downloader';
const PICK='「Language」에서 원하는 언어(한국어는 <b>Korean</b>, 자동 생성 자막은 「… (automatic)」)를 고르고, 「Format」은 <b>.srt</b> 그대로 둔 채 <b>Download .srt</b>를 누릅니다.';

// Shown in the YouTube dialog. Kept as data so tests can check every platform is covered.
export const DOWNLOAD_GUIDES=[
  {id:'mac',label:'Mac',steps:[
    '아래 「자막 사이트 열기」를 누릅니다. 영상 주소가 복사되고 자막 사이트(CollabPals)가 새 탭에 열립니다.',
    '「Paste a YouTube link」 칸을 누르고 <b>⌘V</b>로 붙여넣은 뒤 <b>Get subtitles</b>를 누릅니다.',
    PICK,
    '파일은 Finder의 <b>다운로드</b> 폴더에 저장됩니다. LibreMemo로 돌아와 「자막 파일 고르기」에서 그 .srt 파일을 고릅니다.']},
  {id:'pc',label:'Windows PC',steps:[
    '아래 「자막 사이트 열기」를 누릅니다. 영상 주소가 복사되고 자막 사이트(CollabPals)가 새 탭에 열립니다.',
    '「Paste a YouTube link」 칸을 누르고 <b>Ctrl+V</b>로 붙여넣은 뒤 <b>Get subtitles</b>를 누릅니다.',
    PICK,
    '파일은 파일 탐색기의 <b>다운로드</b> 폴더에 저장됩니다. LibreMemo로 돌아와 「자막 파일 고르기」에서 그 .srt 파일을 고릅니다.']},
  {id:'android',label:'Android',steps:[
    'YouTube 앱에서 보던 영상이라면 「공유」 → 「복사」로 링크를 복사해 위 칸에 붙여넣습니다.',
    '아래 「자막 사이트 열기」를 누르면 영상 주소가 복사되고 Chrome(또는 삼성 인터넷) 새 탭에서 자막 사이트가 열립니다.',
    '「Paste a YouTube link」 칸을 <b>길게 눌러 붙여넣기</b>한 뒤 <b>Get subtitles</b>를 누릅니다. '+PICK,
    '화면 아래에 다운로드 완료가 뜨면 LibreMemo로 돌아와 「자막 파일 고르기」를 누르고 <b>최근 항목</b>이나 <b>다운로드</b>에서 .srt 파일을 고릅니다.']},
  {id:'iphone',label:'iPhone',steps:[
    'YouTube 앱에서 보던 영상이라면 「공유」 → 「링크 복사」로 링크를 복사해 위 칸에 붙여넣습니다.',
    '아래 「자막 사이트 열기」를 누르면 영상 주소가 복사되고 Safari 새 탭에서 자막 사이트가 열립니다.',
    '「Paste a YouTube link」 칸을 <b>눌러 붙여넣기</b>한 뒤 <b>Get subtitles</b>를 누릅니다. '+PICK+' 「다운로드할까요?」가 나오면 <b>다운로드</b>를 누릅니다.',
    '파일은 <b>파일</b> 앱의 <b>다운로드</b> 폴더에 저장됩니다. LibreMemo로 돌아와 「자막 파일 고르기」 → 「찾아보기」 → 「다운로드」에서 .srt 파일을 고릅니다.']},
];
export function guideHTML(){
  return '<div class="youtube-guide-tabs" role="tablist">'+DOWNLOAD_GUIDES.map((g,i)=>'<button type="button" role="tab" data-guide-tab="'+g.id+'" aria-selected="'+(i===0)+'">'+esc(g.label)+'</button>').join('')+'</div>'
    +DOWNLOAD_GUIDES.map((g,i)=>'<ol class="youtube-guide-steps" data-guide="'+g.id+'"'+(i?' hidden':'')+'>'+g.steps.map(step=>'<li>'+step+'</li>').join('')+'</ol>').join('')
    +'<p class="youtube-guide-note">이 사이트는 영상을 하나씩만 받습니다. 재생목록은 각 영상 화면의 「자막 받기」로 영상마다 받은 뒤, 「자막 파일 고르기」에서 여러 파일(또는 zip 하나)을 한꺼번에 고르면 파일 이름으로 영상을 찾아 붙입니다. 자막은 개인 공부에만 쓰세요.</p>';
}
