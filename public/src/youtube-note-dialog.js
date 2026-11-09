import {parseYouTubeInput,clock} from './youtube.js';
import {parseVideoTime} from './youtube-notes.js';
import {escapeHTML as esc,icon} from './utils.js';

/** Shared composer for a pasted link, the current scene and editing a saved note. */
export function openVideoNoteDialog({modal,videoId='',seconds=0,note=null,title='',records=[],currentTime,save,onSubtitles,initialURL='',findNote=()=>null,onError=()=>{}}){
  const fixed=!!videoId;
  modal(`<section class="youtube-dialog youtube-moment-dialog" data-youtube-dialog>
    <div class="dialog-heading"><h2>${icon('video-note',20)} <span data-scene-title>${note?'시점 메모 편집':'유튜브 시점 메모'}</span></h2><button type="button" class="icon-button" data-dialog-close aria-label="닫기">${icon('close')}</button></div>
    ${onSubtitles?`<div class="youtube-modes" role="group" aria-label="주석 방식"><button type="button" aria-pressed="true">${icon('video-note',17)} 시점 메모</button><button type="button" data-youtube-mode="subtitles" aria-pressed="false">${icon('subtitles',17)} 자막에 주석</button></div>`:''}
    <p class="dialog-description">${fixed?esc(title)+' · ':''}기억할 시점과 메모만 남기세요. 자막 파일은 필요 없습니다.</p>
    <form data-scene-form novalidate>
      ${fixed?'':`<label class="youtube-field"><span>YouTube 주소</span><input type="url" data-youtube-url autocomplete="off" inputmode="url" spellcheck="false" placeholder="시간이 포함된 공유 링크도 붙여넣을 수 있어요"></label>`}
      <label class="youtube-field youtube-note-destination" hidden><span>메모를 넣을 문서</span><select data-scene-destination></select></label>
      <div class="youtube-moment-time"><label class="youtube-field"><span>시점</span><input data-scene-time type="text" inputmode="text" autocomplete="off" spellcheck="false" maxlength="300" value="${clock(seconds)}" aria-describedby="scene-time-help"></label>${currentTime?`<button type="button" class="secondary-button" data-scene-current>${icon('history',16)} 현재 시점</button>`:''}</div>
      <p id="scene-time-help" class="youtube-detect">예: 1:23 · 1:02:03 · 83초는 83으로 입력</p>
      <label class="youtube-field"><span>메모</span><textarea data-scene-text rows="5" maxlength="10000" placeholder="이 장면에서 기억하고 싶은 내용을 적으세요…">${esc(note?.text||'')}</textarea></label>
      <p class="youtube-detect" data-scene-hint aria-live="polite"></p>
      <p class="save-error" data-scene-error role="alert" hidden></p>
      <div class="dialog-actions"><button type="button" class="secondary-button" data-dialog-close>취소</button><button type="submit" class="primary-button" data-scene-save>${note?'변경 저장':'시점 메모 저장'}</button></div>
    </form></section>`,dialog=>{
    const q=s=>dialog.querySelector(s),form=q('[data-scene-form]'),url=q('[data-youtube-url]'),time=q('[data-scene-time]'),text=q('[data-scene-text]'),hint=q('[data-scene-hint]'),error=q('[data-scene-error]'),button=q('[data-scene-save]'),destination=q('[data-scene-destination]');
    let busy=false,selectedNote=note,draftKey='';const drafts=new Map();const controller=new AbortController(),alive=()=>dialog.open&&form.isConnected;
    const closed=()=>{if(alive())return;controller.abort();dialog.removeEventListener('close',closed);};dialog.addEventListener('close',closed);
    const parsed=()=>fixed?{videoId,start:seconds}:parseYouTubeInput(url.value);
    const errorMessage=()=>{const video=parsed();return !video?.videoId?'YouTube 영상 주소를 입력해주세요. 재생목록 주소만으로는 시점을 저장할 수 없습니다.':parseVideoTime(time.value,video.videoId)===null?'시점을 1:23, 1:02:03 또는 초 단위 숫자로 입력해주세요. 시간 링크는 같은 영상이어야 합니다.':!text.value.trim()?'메모 내용을 입력해주세요.':'';};
    const update=(snap=false)=>{
      const video=parsed(),matches=fixed?[]:records.filter(r=>r.metadata?.youtube?.videoId===video?.videoId),selected=destination.value;
      destination.innerHTML=matches.map(r=>`<option value="${esc(r.id)}">${esc(r.title)}${r.metadata.youtube.playlistTitle?' · '+esc(r.metadata.youtube.playlistTitle):''}</option>`).join('');
      if(matches.some(r=>r.id===selected))destination.value=selected;
      destination.closest('label').hidden=matches.length<2;
      const wasNew=!selectedNote;
      if(draftKey)drafts.set(draftKey,text.value);
      selectedNote=findNote({video,seconds:parseVideoTime(time.value,video?.videoId),targetId:destination.value})||note;
      if(snap&&selectedNote)time.value=clock(selectedNote.videoAnchor.seconds);
      const nextKey=[video?.videoId||'',destination.value,selectedNote?.id||'new'].join(':');
      if(nextKey!==draftKey){text.value=drafts.get(nextKey)??selectedNote?.text??(wasNew?drafts.get(draftKey):'')??'';draftKey=nextKey;}
      q('[data-scene-title]').textContent=selectedNote?'시점 메모 편집':'유튜브 시점 메모';
      if(!busy)button.textContent=selectedNote?'변경 저장':'시점 메모 저장';
      hint.textContent=selectedNote?(Math.abs(selectedNote.videoAnchor.seconds-parseVideoTime(time.value,video?.videoId))<=3?clock(selectedNote.videoAnchor.seconds)+'에 저장한 메모입니다. 전후 3초 이내의 메모를 열었습니다. 내용을 추가하거나 편집하세요.':'기존 메모의 시점과 내용을 변경합니다.'):matches.length?'같은 폴더의 기존 영상에 새 시점 메모를 추가합니다.':fixed?'시간을 누르면 저장한 장면부터 재생합니다.':'현재 폴더에 영상을 보관하고 시점 메모를 추가합니다.';
      if(!error.hidden){error.textContent=errorMessage();error.hidden=!error.textContent;}
    };
    if(url)url.oninput=()=>{const video=parsed();if(video?.videoId)time.value=clock(video.start);update(true);};
    time.oninput=()=>update();destination.onchange=()=>update(true);text.oninput=()=>{if(!error.hidden){error.textContent=errorMessage();error.hidden=!error.textContent;}};
    if(currentTime)q('[data-scene-current]').onclick=()=>{time.value=clock(currentTime());update(true);time.focus();};
    if(onSubtitles)q('[data-youtube-mode]').onclick=()=>{dialog.close();onSubtitles(url?.value||'');};
    form.onsubmit=async event=>{
      event.preventDefault();if(busy)return;const message=errorMessage();
      if(message){error.hidden=false;error.textContent=message;(!parsed()?.videoId?url:parseVideoTime(time.value,parsed().videoId)===null?time:text)?.focus();return;}
      busy=true;button.disabled=true;button.textContent='저장하는 중…';error.hidden=true;
      try{const afterSave=await save({video:parsed(),seconds:parseVideoTime(time.value,parsed().videoId),text:text.value.trim(),targetId:destination.value,note:selectedNote,signal:controller.signal});if(alive()){dialog.close();await afterSave?.();}}
      catch(e){if(alive()){error.textContent=e.message||'저장하지 못했습니다. 다시 시도해주세요.';error.hidden=false;}else if(e.name!=='AbortError')onError(e);}
      finally{busy=false;if(alive()){button.disabled=false;button.textContent=selectedNote?'변경 저장':'시점 메모 저장';}}
    };
    if(url&&initialURL){url.value=initialURL;url.oninput();}else update(true);requestAnimationFrame(()=> (fixed?text:url).focus());
  });
}
