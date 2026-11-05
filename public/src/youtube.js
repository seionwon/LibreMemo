// YouTube videos as subtitle documents. Everything here is pure (no DOM, no
// network) so it can be tested in Node. The browser parts live in youtube-ui.js.
//
// A browser app cannot fetch YouTube captions itself (timedtext needs a token the
// page cannot get, and the player API rejects other origins), so the learner brings
// the subtitle file. The video plays from YouTube; the subtitle becomes an ordinary
// LibreMemo subtitle document, so highlights, notes, bookmarks, search and export
// all work exactly as for any other document.
import {renderSubtitles,parseSubtitles,mendCuePunctuation} from './office-subtitles.js';
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
  const chapters=Array.isArray(value.chapters)?value.chapters.filter(c=>c&&Number.isFinite(c.t)&&c.t>=0&&c.t<360000&&text(c.title,200).trim()).slice(0,500).map(c=>({t:Math.round(c.t),title:text(c.title,200).trim()})).sort((a,b)=>a.t-b.t):[];
  if(chapters.length)out.chapters=chapters;
  return out;
}

export function subtitleFormat(name){const ext=String(name||'').toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]||'';return SUBTITLE_FORMATS.includes(ext)?ext:'';}
/** Subtitle files are usually UTF-8; older Korean SAMI files are often EUC-KR. */
export function decodeSubtitle(bytes){
  try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{return new TextDecoder('euc-kr').decode(bytes);}
}

const STYLE='<style>.youtube-empty{max-width:640px;margin:48px auto;padding:24px;border:1px dashed var(--htmlmemo-reader-line,#d0d7e2);border-radius:12px;text-align:center;color:var(--htmlmemo-reader-muted,#667085)}.youtube-empty strong{display:block;color:var(--htmlmemo-reader-ink,#202633);font-size:1.15em;margin-bottom:.4em}</style>';
const TIME='(?:(\\d{1,2}):)?(\\d{1,2}):(\\d{2})';
const LEADING=new RegExp('^\\s*[\\[(]?'+TIME+'[\\])]?\\s*[-–—:|·.]*\\s*(.+)$'),TRAILING=new RegExp('^(.+?)\\s*[-–—:|·([]*\\s*'+TIME+'[\\])]?\\s*$');
/**
 * Chapters from a pasted YouTube description: lines such as "0:00 Intro",
 * "(1:02:03) Part 3" or "Part 3 - 12:34". Other lines are ignored. Two or more
 * timestamps are needed; the earliest becomes 0:00 when the list starts later.
 */
export function parseChapters(text){
  const seen=new Set(),out=[];
  for(const line of String(text||'').split(/\r?\n/)){
    let m=line.match(LEADING),h,mi,se,title;
    if(m)[,h,mi,se,title]=m;else if((m=line.match(TRAILING)))[,title,h,mi,se]=m;else continue;
    const t=(+h||0)*3600+(+mi)*60+(+se);title=title.replace(/^[-–—:|·.\s]+|[-–—:|·.\s]+$/g,'').slice(0,200);
    if(!title||+se>=60||seen.has(t))continue;seen.add(t);out.push({t,title});
  }
  out.sort((a,b)=>a.t-b.t);
  if(out.length<2)return [];
  if(out[0].t>0)out[0].t=0;
  return out;
}
/**
 * Outline sections for the sidebar: the chapters when there are any, otherwise
 * timestamps — every tenth of the length for videos over 10 minutes, every
 * minute for shorter ones. `duration` is in seconds.
 */
export function outlineSections(duration,chapters=[]){
  if(chapters.length)return chapters.map(c=>({start:c.t*1000,title:clock(c.t)+' '+c.title}));
  const length=Math.max(0,Math.ceil(duration||0));if(!length)return null;
  const step=length>600?length/10:60,starts=[];
  for(let at=0;at<length;at+=step)starts.push(Math.round(at));
  return starts.map(start=>({start:start*1000,title:clock(start)}));
}
/**
 * A timestamp heading followed by the start of what is said there: "1:40 Then what…".
 * Auto-generated captions break mid-sentence, so the heading starts at the first new
 * sentence near the beginning of the section when the section itself starts mid-sentence.
 */
export function withFirstWords(sections,cues,limit=36){
  if(!sections)return sections;
  const clean=text=>String(text||'').replace(/(?:>>|&gt;&gt;)\s*|\[[^\]]{1,20}\]/g,'').replace(/\s+/g,' ').trim();
  const ended=text=>/[.?!…。？！]["'”’)\]]?$/.test(clean(text));
  return sections.map((section,i)=>{
    const end=sections[i+1]?.start??Infinity,inside=cues.filter(c=>c.start>=section.start&&c.start<end&&clean(c.text));
    if(!inside.length)return section;
    const before=cues[cues.indexOf(inside[0])-1],text=clean(inside.slice(0,10).map(c=>c.text).join(' '));
    let from=0;
    if(before&&!ended(before.text)){const m=/[.?!…。？！]["'”’)\]]?\s+(?=\S)/.exec(text.slice(0,200));if(m)from=m.index+m[0].length;}
    const words=text.slice(from);
    return {...section,title:section.title+' '+(words.length>limit?words.slice(0,limit).replace(/\s+\S*$/,'')+'…':words)};
  });
}
/**
 * The reading document of one video: its subtitle grouped by the outline above,
 * or (until one is attached) a short note with no time cues.
 */
export function youtubeDocumentHTML(title,subtitle=null,warnings=[],{chapters=[],duration=0}={}){
  let body;
  if(subtitle){
    // Without a known length, the subtitle's last cue gives it.
    const cues=mendCuePunctuation(parseSubtitles(subtitle.text,subtitle.format)),length=duration||Math.max(0,...cues.map(c=>(c.end??c.start)/1000));
    body=renderSubtitles(subtitle.text,subtitle.format,warnings,{mend:true,sections:chapters.length?outlineSections(length,chapters):withFirstWords(outlineSections(length),cues)});
  }else body=STYLE+'<article class="office-subtitles youtube-empty" data-youtube-empty><strong>아직 자막이 없습니다.</strong><p>위쪽 영상 막대의 「자막 붙이기」로 이 영상의 자막 파일(.srt, .vtt 등)을 고르면, 영상과 함께 움직이는 자막에 형광펜·메모·북마크를 달 수 있습니다. 받는 방법은 내 서재 → 유튜브의 「자막 파일 받는 방법」에 있습니다.</p></article>';
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

// Mac: the free Chrome extension "YouTube Subtitle Downloader" saves the subtitle
// YouTube is showing, including YouTube's own automatic translation (e.g. English
// auto-generated → Korean). Other devices are added once this path is settled.
export const SUBTITLE_EXTENSION='https://chromewebstore.google.com/detail/ognjcegpcoafidcfbepkfgnolnnibcjp';
export const MAC_GUIDE=[
  '<b>외부 도구를 사용할 경우:</b> 아래 「확장 프로그램 설치」를 누르거나 아래 주소를 Chrome 주소창에 붙여넣어 Chrome 웹 스토어에서 <b>YouTube Subtitle Downloader</b>를 <b>Chrome에 추가</b>합니다. 이 안내는 아래 주소의 확장 프로그램을 기준으로 합니다. 설치 전에 웹 스토어에서 이름·권한을 확인하세요. 주소창 오른쪽 퍼즐 모양 아이콘에서 핀을 눌러 두면 찾기 쉽습니다.',
  '아래 「YouTube에서 영상 열기」를 눌러 Chrome에서 영상을 열고 <b>재생</b>을 시작합니다.',
  '영상 아래쪽의 <b>⚙ 설정</b> → <b>자막</b>에서 원하는 언어를 고릅니다. 한국어 자막이 없으면 <b>영어(자동 생성)</b>를 고른 뒤, 다시 <b>⚙ 설정</b> → <b>자막</b> → <b>자동 번역</b> → <b>한국어</b>를 고릅니다.',
  '화면에 한국어 자막이 나오면, 주소창 오른쪽의 <b>YouTube Subtitle Downloader</b> 아이콘을 누르고 <b>SRT</b>로 <b>다운로드</b>합니다. 브라우저에서 지정한 다운로드 위치에서 파일을 찾습니다.',
  '영상 설명란에 <b>0:00 소개</b>처럼 시간과 제목이 적힌 <b>챕터</b>가 있으면, 그 줄들을 드래그해 복사(⌘C)한 뒤 유튜브 창의 「챕터」 칸에 붙여넣으면(⌘V) 사이드바 목차가 챕터로 나옵니다. 없으면 영상 길이에 맞춰 시각 목차를 만듭니다.',
  'LibreMemo로 돌아와 「자막 파일 고르기」에서 다운로드 폴더의 <b>.srt</b> 파일을 고르고 「만들기」를 누릅니다.',
];
export const SUBTITLE_EXTENSION_WARNING='같은 이름의 확장 프로그램이 여럿 있습니다. 아래는 이 안내에서 사용하는 확장의 주소이며, YouTube 변경이나 영상에 따라 다운로드가 안 될 수 있습니다.';
export function extensionLinkHTML(){
  return '<p class="youtube-guide-extension"><span>'+SUBTITLE_EXTENSION_WARNING+'</span><br>설치 주소: <a href="'+SUBTITLE_EXTENSION+'" target="_blank" rel="noopener noreferrer">'+SUBTITLE_EXTENSION+'</a></p>';
}
export function guideHTML(){
  return '<p class="youtube-guide-note">이미 자막 파일이 있으면 확장 프로그램 없이 바로 고르세요. 아래는 Mac Chrome에서 자막 파일을 준비하는 선택 방법입니다. LibreMemo가 자막을 직접 다운로드하거나 번역하는 기능은 아닙니다.</p>'+extensionLinkHTML()+'<ol class="youtube-guide-steps">'+MAC_GUIDE.map(step=>'<li>'+step+'</li>').join('')+'</ol>'
    +'<p class="youtube-guide-note">휴대폰 등 다른 기기에서는 준비된 자막 파일을 옮겨 「자막 파일 고르기」로 선택하세요. 이미 열린 유튜브 문서에는 「자막 붙이기」 또는 「자막 바꾸기」를 사용합니다.</p>';
}
