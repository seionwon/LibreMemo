// Browser side of YouTube documents: the official IFrame player, oEmbed titles,
// playlist IDs and the player pane shown above a subtitle document.
// Nothing here needs a server or an account. oEmbed and i.ytimg.com allow
// cross-origin reads; the playlist's video IDs come from the embedded player.
import {cueTimes,cueAt,clock,thumbnailURL,watchURL,playlistURL} from './youtube.js';
import {icon,escapeHTML as esc} from './utils.js';

const PLAYER_HOST='https://www.youtube-nocookie.com';
let apiPromise=null;
export function loadYouTubeAPI(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{
    const fail=message=>{apiPromise=null;reject(Error(message));};
    const previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{try{previous?.();}finally{resolve(window.YT);}};
    const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;
    script.onerror=()=>fail('YouTube 플레이어를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.');
    document.head.append(script);
    setTimeout(()=>{if(!window.YT?.Player)fail('YouTube 플레이어가 응답하지 않습니다. 인터넷 연결을 확인한 뒤 다시 시도해주세요.');},20000);
  });
  return apiPromise;
}
async function oembed(url){
  const response=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(url),{credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('oEmbed '+response.status);
  const data=await response.json();
  return {title:String(data.title||'').slice(0,500),channel:String(data.author_name||'').slice(0,300)};
}
/** Title and channel; an unavailable or private video yields empty strings. */
export const videoInfo=videoId=>oembed(watchURL(videoId)).catch(()=>({title:'',channel:''}));
export const playlistInfo=playlistId=>oembed(playlistURL(playlistId)).catch(()=>({title:'',channel:''}));
/** The 320×180 thumbnail as a data URL, so library cards also show it offline. */
export async function thumbnailData(videoId){
  try{
    const response=await fetch(thumbnailURL(videoId),{credentials:'omit',referrerPolicy:'no-referrer'});
    if(!response.ok)return '';
    const blob=await response.blob();if(blob.size>300000||!/^image\//.test(blob.type))return '';
    return await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>resolve('');reader.readAsDataURL(blob);});
  }catch{return '';}
}
/** Video IDs of a public playlist, read through a hidden embedded player (up to YouTube's limit of 200). */
export async function playlistVideoIds(playlistId){
  const YT=await loadYouTubeAPI();
  return new Promise((resolve,reject)=>{
    const holder=document.createElement('div');holder.setAttribute('aria-hidden','true');holder.style.cssText='position:fixed;left:-10000px;top:0;width:200px;height:120px;overflow:hidden';
    const target=document.createElement('div');holder.append(target);document.body.append(holder);
    let done=false,poll=0,player;
    const finish=(ids,error)=>{if(done)return;done=true;clearInterval(poll);clearTimeout(limit);try{player?.destroy();}catch{}holder.remove();if(error)reject(error);else resolve(ids);};
    const limit=setTimeout(()=>finish(null,Error('재생목록을 읽지 못했습니다. 공개(또는 일부 공개) 재생목록인지 확인해주세요.')),25000);
    player=new YT.Player(target,{width:200,height:120,host:PLAYER_HOST,playerVars:{listType:'playlist',list:playlistId,playsinline:1},events:{
      onReady:()=>{poll=setInterval(()=>{const ids=player.getPlaylist?.();if(Array.isArray(ids)&&ids.length)finish([...new Set(ids.filter(id=>/^[A-Za-z0-9_-]{11}$/.test(id)))]);},300);},
      onError:event=>finish(null,Error('재생목록을 열 수 없습니다. 비공개 재생목록이거나 주소가 잘못되었습니다. (YouTube 오류 '+event.data+')')),
    }});
  });
}
/** Run `task` over `items` with at most `limit` at once, keeping order. */
export async function mapLimit(items,limit,task){
  const results=new Array(items.length);let next=0;
  await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{while(next<items.length){const i=next++;results[i]=await task(items[i],i);}}));
  return results;
}

const RATES=[.5,.75,1,1.25,1.5,1.75,2];
/** YouTube player keyboard shortcuts, as YouTube lists them (shown by "?"). */
export const YOUTUBE_SHORTCUTS=[
  ['Space · K','재생 / 일시정지'],['← / →','5초 뒤로 / 앞으로'],['J / L','10초 뒤로 / 앞으로'],
  [', / .','일시정지 중 한 프레임 뒤로 / 앞으로'],['< / >','재생 속도 느리게 / 빠르게'],['0 – 9','영상의 0% – 90% 위치로'],
  ['Home / End','처음 / 끝으로'],['↑ / ↓','볼륨 5% 높이기 / 낮추기'],['M','음소거 / 해제'],['C','YouTube 자막 켜기 / 끄기'],
  ['F','영상 전체 화면 / 돌아오기'],['Shift + N / Shift + P','재생목록의 다음 / 이전 영상'],['?','이 단축키 목록'],
];
const pref=(key,fallback,valid)=>{try{const v=Number(localStorage.getItem('librememo-youtube-'+key));return valid(v)?v:fallback;}catch{return fallback;}};
const savePref=(key,value)=>{try{localStorage.setItem('librememo-youtube-'+key,String(value));}catch{}};
// Video height as a share of the window height (0 = default 40%).
export const VIDEO_SHARE_MIN=.12,VIDEO_SHARE_MAX=.85,VIDEO_MIN_PX=90;
export const clampShare=v=>Math.max(VIDEO_SHARE_MIN,Math.min(VIDEO_SHARE_MAX,Number(v)||VIDEO_SHARE_MIN));
export const skipSeconds=()=>pref('skip',5,v=>[5,10,15].includes(v));
export const setSkipSeconds=value=>savePref('skip',value);
// Compact cue rows: the start time (h:mm:ss / m:ss) beside the text on one row.
// The saved label ("00:01:02.345 → …") stays in the document for annotations and
// time parsing; it is clipped and the short clock is drawn from data-clock.
const DOC_STYLE='.subtitle-cue{display:flex;align-items:baseline;gap:.55em;padding:.12em .35em;border-bottom:0}'
  +'.subtitle-time{position:relative;flex:none;width:5.2ch;height:1.5em;margin:0;overflow:hidden;white-space:nowrap;color:transparent;cursor:pointer;border-radius:4px;user-select:none}'
  +'[data-htmlmemo-yt-long] .subtitle-time{width:7.2ch}'
  +'.subtitle-time::before{content:attr(data-clock);position:absolute;inset:0;color:var(--htmlmemo-reader-muted,#667085);line-height:1.5em;text-align:right}'
  +'.subtitle-time:hover::before{text-decoration:underline}'
  +'.subtitle-text{flex:1;min-width:0;margin:0}'
  +'[data-htmlmemo-yt-now]{background:rgba(229,57,53,.08);box-shadow:inset 3px 0 #e53935;border-radius:4px}'
  +'[data-htmlmemo-yt-now] .subtitle-time::before{color:#d32f2f;font-weight:600}';

/**
 * The player above one YouTube document. The subtitle stays the document: the pane
 * only marks the cue being spoken, scrolls it into view and seeks when a cue's time
 * is clicked. It never inserts text into the document, so annotation offsets hold.
 */
export class YouTubePane {
  constructor(tab,callbacks){
    this.tab=tab;this.reader=tab.reader;this.callbacks=callbacks;this.youtube=this.reader.metadata.youtube;
    this.cues=[];this.current=-1;this.follow=true;this.quietUntil=0;this.savedAt=Number(this.reader.metadata.view?.mediaTime)||0;
    const pane=this.pane=document.createElement('section');pane.className='youtube-pane';pane.dataset.youtubePane='';pane.setAttribute('aria-label','YouTube 영상');
    const skip=skipSeconds(),rate=pref('rate',1,v=>RATES.includes(v));
    // The picture itself is the control: left quarter back, middle half play/pause, right quarter forward.
    // The bottom strip (progress bar and control row, 88-140px) stays YouTube's own. Its full-screen
    // button is hidden (fs:0): double-tapping the picture is the full-screen control.
    pane.innerHTML=`<div class="youtube-video"><div class="youtube-frame"></div>
      <div class="youtube-zones"><button type="button" data-yt="back" aria-label="${skip}초 뒤로"></button><button type="button" data-yt="play" aria-label="재생"></button><button type="button" data-yt="forward" aria-label="${skip}초 앞으로"></button></div>
      <div class="youtube-flash" aria-hidden="true"></div><p class="youtube-message" hidden></p></div>
      <div class="youtube-bar">
        <button type="button" class="youtube-button" data-yt="follow" aria-pressed="true" title="재생 중인 자막을 따라 화면을 움직입니다">${icon('list',15)}<span>따라가기</span></button>
        <span class="youtube-clock" data-yt="clock">0:00</span>
        <select class="youtube-rate" data-yt="rate" title="재생 속도" aria-label="재생 속도">${RATES.map(r=>`<option value="${r}" ${r===rate?'selected':''}>${r}×</option>`).join('')}</select>
        <button type="button" class="youtube-button" data-yt="mark" title="지금 장면을 북마크">${icon('bookmark',15)}<span>북마크</span></button>
        <button type="button" class="youtube-button" data-yt="chapters" title="영상 설명란의 챕터를 붙여넣어 목차로 쓰기">${icon('list',15)}<span>목차</span></button>
        <button type="button" class="youtube-button" data-yt="attach" title="자막 파일(.srt, .vtt 등) 붙이기">${icon('subtitles',15)}<span>${this.hasCues()?'자막 바꾸기':'자막 붙이기'}</span></button>
        <span class="youtube-nav"><button type="button" class="youtube-button" data-yt="prev" title="재생목록의 이전 영상" aria-label="이전 영상" hidden>${icon('back',15)}</button><button type="button" class="youtube-button" data-yt="next" title="재생목록의 다음 영상" aria-label="다음 영상" hidden>${icon('forward',15)}</button></span>
        <span class="youtube-sizes" role="group" aria-label="영상 크기"><button type="button" class="youtube-button" data-yt="smaller" title="영상 작게 (끝의 띠를 끌어도 됩니다)" aria-label="영상 작게">−</button><button type="button" class="youtube-button" data-yt="bigger" title="영상 크게 (끝의 띠를 끌어도 됩니다)" aria-label="영상 크게">+</button></span>
        <button type="button" class="youtube-button" data-yt="size" aria-pressed="false" title="영상 접기">${icon('chevron-down',15)}</button>
        <a class="youtube-button youtube-open" data-yt="open" href="${esc(watchURL(this.youtube.videoId,this.youtube.playlistId))}" target="_blank" rel="noopener noreferrer" title="YouTube에서 열기">${icon('external',15)}</a>
        <p class="youtube-now" data-yt="now" aria-live="off"></p>
      </div>
      <div class="youtube-resize" role="separator" aria-orientation="horizontal" tabindex="0" aria-label="영상 크기 조절" title="위아래로 끌어 영상 크기 조절 · 두 번 누르면 기본 크기"></div>`;
    const viewport=this.reader.viewport;viewport.before(pane);tab.host.classList.add('has-youtube');
    const $=name=>pane.querySelector(`[data-yt="${name}"]`);this.$=$;this.video=pane.querySelector('.youtube-video');
    // One tap acts after a short wait; a second tap in that time toggles full screen instead.
    const tap=action=>()=>{if(this.tapTimer){clearTimeout(this.tapTimer);this.tapTimer=0;this.toggleFullscreen();return;}this.tapTimer=setTimeout(()=>{this.tapTimer=0;action();},250);};
    $('play').onclick=tap(()=>{const playing=this.player?.getPlayerState?.()===1;this.toggle();this.flash(icon(playing?'pause':'play',34));});
    $('back').onclick=tap(()=>{const n=skipSeconds();this.seekBy(-n);this.flash(icon('undo',26)+'<span>'+n+'초</span>');});
    $('forward').onclick=tap(()=>{const n=skipSeconds();this.seekBy(n);this.flash('<span>'+n+'초</span>'+icon('redo',26));});
    // Clicking YouTube's own controls focuses its iframe and blurs this window. The tap
    // zones then step aside so YouTube's panels (more videos and its ✕) take clicks,
    // until the video plays again or focus comes back to the app.
    this.onWindowBlur=()=>setTimeout(()=>this.yieldZones(document.activeElement),0);
    this.onWindowFocus=()=>this.resumeZones();
    window.addEventListener('blur',this.onWindowBlur);window.addEventListener('focus',this.onWindowFocus);
    this.onFullscreenKey=event=>{if(event.key==='Escape'&&this.video.classList.contains('youtube-fill'))this.toggleFullscreen();};
    document.addEventListener('keydown',this.onFullscreenKey);
    $('rate').onchange=event=>{const value=Number(event.target.value);savePref('rate',value);this.player?.setPlaybackRate?.(value);};
    $('follow').onclick=()=>{this.follow=!this.follow;$('follow').setAttribute('aria-pressed',String(this.follow));this.quietUntil=0;if(this.follow)this.reveal(true);};
    $('mark').onclick=()=>this.bookmark();
    $('chapters').onclick=()=>callbacks.onChapters();$('attach').onclick=()=>callbacks.onAttach();
    $('prev').onclick=()=>callbacks.onNavigate(-1);$('next').onclick=()=>callbacks.onNavigate(1);
    this.bindResize();
    $('size').onclick=()=>{const small=pane.classList.toggle('youtube-collapsed');$('size').setAttribute('aria-pressed',String(small));$('size').title=small?'영상 펼치기':'영상 접기';};
    // Scrolling by hand pauses "follow" briefly instead of fighting the reader.
    this.onUserScroll=()=>{this.quietUntil=Date.now()+8000;};
    for(const type of ['wheel','touchmove','keydown'])viewport.addEventListener(type,this.onUserScroll,{passive:true});
    this.onDocClick=event=>{
      const time=event.target?.closest?.('.subtitle-time');if(!time)return;
      const selection=this.reader.doc?.getSelection?.();if(selection&&!selection.isCollapsed)return;
      const cue=this.cues.find(c=>c.el===time.closest('.subtitle-cue'));if(cue){this.quietUntil=0;this.seek(cue.start,true);}
    };
    // A timestamp in the outline ("1:40 …", in the app or the document sidebar) also moves the video there.
    this.onOutlineClick=event=>{
      if(tab.host.hidden)return;
      const item=event.target?.closest?.('.outline-item[data-heading]'),m=String(item?.title||item?.textContent||'').trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})(?:\s|$)/);
      if(m){this.quietUntil=0;this.seek((+m[1]||0)*3600+(+m[2])*60+(+m[3]));}
    };
    document.addEventListener('click',this.onOutlineClick,true);
    // A hidden tab stops speaking; the learner returns to the same place.
    this.visibility=new MutationObserver(()=>{if(tab.host.hidden)this.player?.pauseVideo?.();});
    this.visibility.observe(tab.host,{attributes:true,attributeFilter:['hidden']});
    this.indexCues();
    this.timer=setInterval(()=>this.tick(),250);
    void this.mount();
  }
  hasCues(){return !!this.reader.doc?.querySelector?.('.subtitle-cue .subtitle-time');}
  indexCues(){
    const doc=this.reader.doc;if(!doc)return;
    if(!doc.getElementById('htmlmemo-youtube-style')){const style=doc.createElement('style');style.id='htmlmemo-youtube-style';style.textContent=DOC_STYLE;doc.head.append(style);}
    doc.removeEventListener('click',this.onDocClick);doc.addEventListener('click',this.onDocClick);
    this.cues=[...doc.querySelectorAll('.subtitle-cue')].map(el=>{const time=el.querySelector('.subtitle-time'),t=cueTimes(time?.textContent);if(t&&time.dataset.clock!==clock(t.start))time.dataset.clock=clock(t.start);return t&&{el,start:t.start,end:t.end,text:(el.querySelector('.subtitle-text')?.textContent||'').trim()};}).filter(Boolean).sort((a,b)=>a.start-b.start);
    doc.querySelector('[data-subtitles]')?.toggleAttribute('data-htmlmemo-yt-long',this.cues.some(c=>c.start>=3600));
  }
  async mount(){
    let YT;try{YT=await loadYouTubeAPI();}catch(error){this.message(error.message);return;}
    if(this.disposed)return;
    this.player=new YT.Player(this.pane.querySelector('.youtube-frame'),{host:PLAYER_HOST,videoId:this.youtube.videoId,playerVars:{playsinline:1,rel:0,fs:0,iv_load_policy:3,cc_load_policy:0,start:Math.floor(this.savedAt>3?this.savedAt-2:0),origin:location.origin},events:{
      onReady:()=>{this.ready=true;this.player.setPlaybackRate?.(Number(this.$('rate').value));},
      onStateChange:event=>{
        const playing=event.data===1;this.playing=playing;if(playing)this.resumeZones();
        this.$('play').setAttribute('aria-label',playing?'일시정지':'재생');
        if(!playing&&this.ready)this.remember(true);
        if(event.data===0)this.callbacks.onEnded?.();
      },
      onError:event=>this.message([101,150,153].includes(event.data)?'이 영상은 다른 사이트에서 재생할 수 없게 막혀 있습니다. 「YouTube에서 열기」로 보세요. 자막과 주석은 여기서 계속 쓸 수 있습니다.':'영상을 재생하지 못했습니다. (YouTube 오류 '+event.data+')'),
    }});
  }
  /**
   * YouTube's own shortcuts while the app (not the video frame) has the keyboard.
   * Returns true when the key was used. Fields, buttons and sliders keep their keys.
   */
  handleKey(event){
    if(this.disposed||event.ctrlKey||event.metaKey||event.altKey)return false;
    const target=event.target?.nodeType===1?event.target:null,key=event.key;
    if(target?.closest?.('input,textarea,select,[contenteditable=""],[contenteditable=true],[role=separator],[role=slider]'))return false;
    if((key===' '||key==='Enter')&&target?.closest?.('button,a,summary,[role=button]'))return false;
    const p=this.player,ok=!!p?.seekTo&&this.ready,lower=key.length===1?key.toLowerCase():key;
    const skip=seconds=>{this.seekBy(seconds);this.flash(seconds<0?icon('undo',26)+'<span>'+(-seconds)+'초</span>':'<span>'+seconds+'초</span>'+icon('redo',26));};
    if(key==='?'){this.callbacks.onShortcuts?.();return true;}
    if(key==='N'&&event.shiftKey||key==='P'&&event.shiftKey){const button=this.$(key==='N'?'next':'prev');if(!button||button.hidden)return false;this.callbacks.onNavigate?.(key==='N'?1:-1);return true;}
    if(lower==='f'&&!event.shiftKey){this.toggleFullscreen();return true;}
    if(!ok)return key===' '||lower==='k'?true:false;
    const duration=()=>{try{return p.getDuration?.()||0;}catch{return 0;}};
    if(key===' '||lower==='k'){const playing=p.getPlayerState?.()===1;this.toggle();this.flash(icon(playing?'pause':'play',34));return true;}
    if(key==='ArrowLeft'||key==='ArrowRight'){skip(key==='ArrowLeft'?-5:5);return true;}
    if(lower==='j'||lower==='l'){skip(lower==='j'?-10:10);return true;}
    if((key===','||key==='.')&&p.getPlayerState?.()!==1){this.seek(this.time()+(key===','?-1:1)/30);return true;}
    if(key==='<'||key==='>'){
      const select=this.$('rate'),now=Number(select?.value)||1,i=RATES.indexOf(now),next=RATES[Math.max(0,Math.min(RATES.length-1,(i<0?2:i)+(key==='<'?-1:1)))];
      if(select)select.value=String(next);savePref('rate',next);p.setPlaybackRate?.(next);this.flash('<span>'+next+'×</span>');return true;
    }
    if(/^[0-9]$/.test(key)&&!event.shiftKey){const d=duration();if(d)this.seek(d*Number(key)/10);return true;}
    if(key==='Home'||key==='End'){const d=duration();this.seek(key==='Home'?0:Math.max(0,d-.5));return true;}
    if(key==='ArrowUp'||key==='ArrowDown'){
      const v=Math.max(0,Math.min(100,Math.round((p.getVolume?.()??100)+(key==='ArrowUp'?5:-5))));p.setVolume?.(v);if(v>0)p.unMute?.();
      this.flash(icon('speaker',22)+'<span>'+v+'%</span>');return true;
    }
    if(lower==='m'){const muted=p.isMuted?.();if(muted)p.unMute?.();else p.mute?.();this.flash(icon('speaker',22)+'<span>'+(muted?'소리 켬':'음소거')+'</span>');return true;}
    if(lower==='c'){
      try{if(this.captionsOn){p.unloadModule?.('captions');this.captionsOn=false;}else{p.loadModule?.('captions');p.setOption?.('captions','reload',true);this.captionsOn=true;}}catch{}
      this.flash('<span>'+(this.captionsOn?'YouTube 자막 켬':'YouTube 자막 끔')+'</span>');return true;
    }
    return false;
  }
  yieldZones(active){
    if(this.disposed||active?.localName!=='iframe'||!this.video?.contains(active))return false;
    this.pane.querySelector('.youtube-zones')?.setAttribute('data-yield','');return true;
  }
  resumeZones(){this.pane?.querySelector('.youtube-zones')?.removeAttribute('data-yield');}
  // An unplayable video keeps YouTube's own message and links reachable.
  message(text){const el=this.pane.querySelector('.youtube-message');el.textContent=text;el.hidden=false;this.pane.querySelector('.youtube-zones').hidden=true;}
  /**
   * Full screen for the video with its tap zones. Browsers without element full screen
   * (iPhone Safari) get the same picture filling the window; Esc or a double tap returns.
   */
  toggleFullscreen(){
    const video=this.video,doc=video.ownerDocument;
    if(doc.fullscreenElement===video||doc.webkitFullscreenElement===video){(doc.exitFullscreen||doc.webkitExitFullscreen)?.call(doc);return;}
    if(video.classList.contains('youtube-fill')){video.classList.remove('youtube-fill');return;}
    const fill=()=>video.classList.add('youtube-fill'),request=video.requestFullscreen||video.webkitRequestFullscreen;
    if(!request){fill();return;}
    try{const result=request.call(video);result?.catch?.(fill);}catch{fill();}
  }
  /** A short sign in the middle of the picture, as YouTube shows for taps. */
  flash(html){const el=this.pane.querySelector('.youtube-flash');el.innerHTML=html;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
  /** The playing time; right after a seek, the target until the player reports it (it answers with the old time for a moment). */
  // "current / total"; the total is left out until the player reports a duration.
  clockText(t){let total=0;try{total=this.player?.getDuration?.()||0;}catch{}return total>0?clock(t)+' / '+clock(total):clock(t);}
  time(){
    let t=0;try{t=this.player?.getCurrentTime?.()||0;}catch{}
    if(this.target){if(Math.abs(t-this.target.t)<1.5||Date.now()>this.target.until)this.target=null;else return this.target.t;}
    return t;
  }
  toggle(){if(!this.player?.getPlayerState)return;if(this.player.getPlayerState()===1)this.player.pauseVideo();else this.player.playVideo();}
  seek(seconds,play=false){if(!this.player?.seekTo)return;seconds=Math.max(0,seconds);this.target={t:seconds,until:Date.now()+2500};this.player.seekTo(seconds,true);if(play)this.player.playVideo();this.tick(true);}
  seekBy(delta){this.seek(this.time()+delta);}
  setSiblings(prev,next){this.$('prev').hidden=!prev;this.$('next').hidden=!next;this.$('prev').title=prev?'이전 영상: '+prev:'';this.$('next').title=next?'다음 영상: '+next:'';}
  tick(force=false){
    if(this.disposed||!this.ready)return;
    const t=this.time();this.$('clock').textContent=this.clockText(t);
    const index=cueAt(this.cues,t);
    if(index!==this.current||force){
      this.cues[this.current]?.el.removeAttribute('data-htmlmemo-yt-now');this.current=index;
      const cue=this.cues[index];
      if(cue){cue.el.setAttribute('data-htmlmemo-yt-now','');this.$('now').textContent=cue.text;}else this.$('now').textContent='';
      if(cue&&this.follow&&(this.playing||force)&&Date.now()>this.quietUntil)this.reveal();
    }
    if(this.playing&&Math.abs(t-this.savedAt)>=5)this.remember();
  }
  /** Scroll the current cue into view only when it has left the visible area. */
  reveal(always=false){
    const cue=this.cues[this.current];if(!cue)return;
    const frame=this.reader.frame.getBoundingClientRect(),scale=frame.width/(this.reader.frame.offsetWidth||frame.width)||1,rect=cue.el.getBoundingClientRect(),view=this.reader.viewport.getBoundingClientRect();
    const top=frame.top+rect.top*scale,bottom=frame.top+rect.bottom*scale;
    if(always||top<view.top+16||bottom>view.bottom-16)cue.el.scrollIntoView({block:'center',behavior:'smooth'});
  }
  remember(now=false){
    const t=this.time();if(!Number.isFinite(t))return;this.savedAt=t;
    this.reader.metadata.view={...this.reader.metadata.view,mediaTime:Math.round(t*10)/10};
    this.callbacks.onTime(now);
  }
  bookmark(){
    const cue=this.cues[this.current]||this.cues[cueAt(this.cues,this.time())];
    const at=cue?cue.start:this.time(),title=(clock(at)+' '+(cue?.text||'')).replace(/\s+/g,' ').trim().slice(0,80);
    if(cue)cue.el.scrollIntoView({block:'start'});
    // Let the scroll settle so the bookmark records this cue's place.
    requestAnimationFrame(()=>requestAnimationFrame(()=>this.callbacks.onBookmark(title)));
  }
  // Video height: a share of the window height, chosen by dragging the strip under the
  // video bar (double-click resets, arrow keys step). Width follows at 16:9.
  bindResize(){
    const handle=this.pane.querySelector('.youtube-resize');this.videoShare=pref('height',0,v=>v>=VIDEO_SHARE_MIN&&v<=VIDEO_SHARE_MAX)||null;
    this.applyVideoHeight();
    this.onWindowResize=()=>this.applyVideoHeight();window.addEventListener('resize',this.onWindowResize);
    const height=()=>this.video.getBoundingClientRect().height;
    const set=(px,save)=>{this.videoShare=clampShare(px/window.innerHeight);this.applyVideoHeight();if(save)savePref('height',this.videoShare);};
    let drag=null;
    handle.onpointerdown=event=>{
      if(event.button!==0||this.pane.classList.contains('youtube-collapsed'))return;event.preventDefault();
      drag={id:event.pointerId,y:event.clientY,start:height()};handle.setPointerCapture?.(event.pointerId);this.pane.classList.add('youtube-resizing');
    };
    handle.onpointermove=event=>{if(drag&&event.pointerId===drag.id)set(drag.start+event.clientY-drag.y,false);};
    const end=event=>{if(!drag||event.pointerId!==drag.id)return;drag=null;handle.releasePointerCapture?.(event.pointerId);this.pane.classList.remove('youtube-resizing');if(this.videoShare)savePref('height',this.videoShare);};
    handle.onpointerup=end;handle.onpointercancel=end;handle.onlostpointercapture=end;
    handle.ondblclick=()=>{this.videoShare=null;savePref('height',0);this.applyVideoHeight();};
    // Buttons for the same size, a tenth of the window height per press.
    const stepBy=step=>{if(this.pane.classList.contains('youtube-collapsed'))this.$?.('size')?.click();set(height()+step*window.innerHeight*.1,true);};
    const smaller=this.pane.querySelector('[data-yt="smaller"]'),bigger=this.pane.querySelector('[data-yt="bigger"]');
    if(smaller)smaller.onclick=()=>stepBy(-1);if(bigger)bigger.onclick=()=>stepBy(1);
    handle.onkeydown=event=>{
      const step=event.key==='ArrowUp'?-1:event.key==='ArrowDown'?1:0;
      if(event.key==='Home'||event.key==='Enter'){event.preventDefault();handle.ondblclick();return;}
      if(!step)return;event.preventDefault();set(height()+step*window.innerHeight*.05,true);
    };
  }
  applyVideoHeight(){
    const pane=this.pane,handle=pane.querySelector('.youtube-resize');
    if(!this.videoShare){pane.removeAttribute('data-yt-sized');pane.style.removeProperty('--yt-video-h');}
    else{
      // Never wider than the pane, and leave the video bar and a few subtitle lines below it.
      const bar=pane.querySelector('.youtube-bar')?.offsetHeight||0,room=(this.tab.host.clientHeight||window.innerHeight)-bar-120;
      const px=Math.round(Math.max(VIDEO_MIN_PX,Math.min(this.videoShare*window.innerHeight,(pane.clientWidth||Infinity)*9/16,Math.max(VIDEO_MIN_PX,room))));
      pane.setAttribute('data-yt-sized','');pane.style.setProperty('--yt-video-h',px+'px');
    }
    const now=Math.round(this.video.getBoundingClientRect?.().height||0);
    handle?.setAttribute('aria-valuenow',String(now));handle?.setAttribute('aria-valuetext',this.videoShare?'영상 높이 '+now+'px':'기본 크기');
  }
  dispose(){
    if(this.disposed)return;this.disposed=true;window.removeEventListener('resize',this.onWindowResize);window.removeEventListener('blur',this.onWindowBlur);window.removeEventListener('focus',this.onWindowFocus);clearInterval(this.timer);clearTimeout(this.tapTimer);document.removeEventListener('keydown',this.onFullscreenKey);this.visibility.disconnect();document.removeEventListener('click',this.onOutlineClick,true);
    if(this.ready)this.remember(true);
    try{this.player?.destroy?.();}catch{}
    for(const type of ['wheel','touchmove','keydown'])this.reader.viewport?.removeEventListener(type,this.onUserScroll);
    const doc=this.reader.doc;
    if(doc){doc.removeEventListener('click',this.onDocClick);doc.getElementById('htmlmemo-youtube-style')?.remove();doc.querySelectorAll('[data-htmlmemo-yt-now]').forEach(el=>el.removeAttribute('data-htmlmemo-yt-now'));}
    this.pane.remove();this.tab.host.classList.remove('has-youtube');
  }
}
