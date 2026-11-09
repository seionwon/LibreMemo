// Time anchors are ordinary notes, so history, folder backup and device sync use
// the same annotation records. They never depend on caption text or page geometry.
import {clock,parseYouTubeInput,watchURL} from './youtube.js';
import {escapeHTML as esc,icon,uid} from './utils.js';

export const MAX_VIDEO_TIME=359999;
export function validVideoAnchor(value){
  return !!value&&typeof value==='object'&&typeof value.videoId==='string'&&/^[A-Za-z0-9_-]{11}$/.test(value.videoId)&&Number.isInteger(value.seconds)&&value.seconds>=0&&value.seconds<=MAX_VIDEO_TIME;
}
export const isVideoNote=note=>note?.type==='note'&&validVideoAnchor(note.videoAnchor);
export const videoNotes=metadata=>(metadata?.annotations||[]).filter(isVideoNote).sort((a,b)=>a.videoAnchor.seconds-b.videoAnchor.seconds||(a.created||0)-(b.created||0));
/** Explicit time fields reject typos instead of silently saving them at 0:00. */
export function parseVideoTime(value,videoId=''){
  const text=String(value??'').trim();let seconds;
  const linked=parseYouTubeInput(text);
  if(linked?.videoId){
    if(videoId&&linked.videoId!==videoId)return null;
    seconds=linked.start;
  }else if(/^\d{1,6}$/.test(text))seconds=Number(text);
  else if(/^\d{1,3}:[0-5]\d(?::[0-5]\d)?$/.test(text))seconds=text.split(':').reduce((sum,n)=>sum*60+Number(n),0);
  else if(/^(?:\d+h)?(?:\d+m)?(?:\d+s)?$/i.test(text)&&text){
    const m=text.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);seconds=(Number(m[1])||0)*3600+(Number(m[2])||0)*60+(Number(m[3])||0);
  }
  return Number.isInteger(seconds)&&seconds>=0&&seconds<=MAX_VIDEO_TIME?seconds:null;
}
export function makeVideoNote(videoId,seconds,text,previous=null){
  const videoAnchor={videoId,seconds},body=String(text??'').trim();
  if(!validVideoAnchor(videoAnchor))throw Error('영상 시점이 올바르지 않습니다. 1:23 또는 1:02:03처럼 입력해주세요.');
  if(!body||body.length>10000)throw Error('메모를 1~10,000자로 입력해주세요.');
  return {...(previous||{id:uid(),type:'note',color:'#334155',width:1,opacity:1,points:[{x:0,y:0}],created:Date.now()}),videoAnchor,text:body,modified:Date.now()};
}
export const videoNoteURL=note=>watchURL(note.videoAnchor.videoId)+'&t='+note.videoAnchor.seconds+'s';

export function videoNotesHTML(metadata,{interactive=false}={}){
  const notes=videoNotes(metadata);
  return `<section class="youtube-notes" ${interactive?'data-htmlmemo-ui data-htmlmemo-preview':'data-htmlmemo-video-notes'} aria-label="시점 메모">
    <div class="youtube-notes-heading"><strong>시점 메모 <small>${notes.length}</small></strong>${interactive?`<button type="button" data-scene-add>${icon('plus',16)} 현재 시점 메모</button>`:''}</div>
    ${notes.length?`<ol>${notes.map(note=>`<li data-scene-row="${esc(note.id)}"><div class="youtube-notes-row">
      ${interactive?`<button type="button" data-scene-play="${esc(note.id)}"`:`<a href="${esc(videoNoteURL(note))}" target="_blank" rel="noopener noreferrer"`} aria-label="${clock(note.videoAnchor.seconds)}부터 재생">${icon('play',13)} ${clock(note.videoAnchor.seconds)}${interactive?'</button>':'</a>'}
      ${interactive?`<button type="button" data-scene-edit="${esc(note.id)}" title="시점과 메모 편집" aria-label="${clock(note.videoAnchor.seconds)} 메모 편집">${icon('pen',15)}</button><button type="button" data-scene-delete="${esc(note.id)}" title="메모 삭제" aria-label="${clock(note.videoAnchor.seconds)} 메모 삭제">${icon('trash',15)}</button>`:''}</div><p>${esc(note.text)}</p></li>`).join('')}</ol>`:'<p class="youtube-notes-empty">기억하고 싶은 장면에서 「현재 시점 메모」를 누르세요. 자막 파일 없이 시간과 생각을 함께 보관합니다.</p>'}
  </section>`;
}
// Used by the isolated reading document and its self-contained HTML export.
export const VIDEO_NOTES_CSS=`.youtube-notes{box-sizing:border-box;max-width:900px;margin:16px auto;padding:16px;border:1px solid var(--htmlmemo-reader-line,#d0d7e2);border-radius:12px;color:var(--htmlmemo-reader-ink,#202633);background:var(--htmlmemo-reader-paper,#fff);font:inherit;line-height:1.5}.youtube-notes *{box-sizing:border-box}.youtube-notes-heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}.youtube-notes-heading strong{font-size:1em}.youtube-notes-heading small{font-variant-numeric:tabular-nums;font-weight:400;color:var(--htmlmemo-reader-muted,#667085)}.youtube-notes button,.youtube-notes a{display:inline-flex;align-items:center;justify-content:center;gap:4px;min-height:36px;padding:5px 9px;border:1px solid var(--htmlmemo-reader-line,#d0d7e2);border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:.875em;text-decoration:none;cursor:pointer}.youtube-notes button:hover,.youtube-notes a:hover{background:rgba(100,116,139,.12)}.youtube-notes :focus-visible{outline:2px solid currentColor;outline-offset:2px}.youtube-notes ol{margin:12px 0 0;padding:0;list-style:none;display:grid;gap:12px}.youtube-notes li{border-top:1px solid var(--htmlmemo-reader-line,#d0d7e2);padding-top:10px}.youtube-notes-row{display:flex;gap:6px;align-items:center}.youtube-notes-row a,.youtube-notes-row [data-scene-play]{margin-right:auto;font-variant-numeric:tabular-nums;font-weight:600}.youtube-notes p{white-space:pre-wrap;overflow-wrap:anywhere;margin:7px 0 0}.youtube-notes-empty{color:var(--htmlmemo-reader-muted,#667085);font-size:.9em}.youtube-notes [aria-current=true]{border-left:3px solid #64748b;padding-left:10px}@media(max-width:400px){.youtube-notes{padding:10px;margin:10px auto}.youtube-notes button,.youtube-notes a{min-height:40px}}`;
