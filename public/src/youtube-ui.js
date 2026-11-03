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
const pref=(key,fallback,valid)=>{try{const v=Number(localStorage.getItem('librememo-youtube-'+key));return valid(v)?v:fallback;}catch{return fallback;}};
const savePref=(key,value)=>{try{localStorage.setItem('librememo-youtube-'+key,String(value));}catch{}};
export const skipSeconds=()=>pref('skip',5,v=>[5,10,15].includes(v));
export const setSkipSeconds=value=>savePref('skip',value);
const DOC_STYLE='.subtitle-time{cursor:pointer;border-radius:4px}.subtitle-time:hover{text-decoration:underline}'
  +'[data-htmlmemo-yt-now]{background:rgba(229,57,53,.08);box-shadow:inset 3px 0 #e53935;border-radius:4px}'
  +'[data-htmlmemo-yt-now] .subtitle-time{color:#d32f2f;font-weight:600}';

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
    // The bottom strip stays YouTube's own (progress bar, captions, settings, full screen).
    pane.innerHTML=`<div class="youtube-video"><div class="youtube-frame"></div>
      <div class="youtube-zones"><button type="button" data-yt="back" aria-label="${skip}초 뒤로"></button><button type="button" data-yt="play" aria-label="재생"></button><button type="button" data-yt="forward" aria-label="${skip}초 앞으로"></button></div>
      <div class="youtube-flash" aria-hidden="true"></div><p class="youtube-message" hidden></p></div>
      <div class="youtube-bar">
        <select class="youtube-rate" data-yt="rate" title="재생 속도" aria-label="재생 속도">${RATES.map(r=>`<option value="${r}" ${r===rate?'selected':''}>${r}×</option>`).join('')}</select>
        <span class="youtube-clock" data-yt="clock">0:00</span>
        <button type="button" class="youtube-button" data-yt="follow" aria-pressed="true" title="재생 중인 자막을 따라 화면을 움직입니다">${icon('list',15)}<span>따라가기</span></button>
        <button type="button" class="youtube-button" data-yt="mark" title="지금 장면을 북마크">${icon('bookmark',15)}<span>북마크</span></button>
        <button type="button" class="youtube-button" data-yt="chapters" title="영상 설명란의 챕터를 붙여넣어 목차로 쓰기">${icon('list',15)}<span>목차</span></button>
        <button type="button" class="youtube-button" data-yt="attach" title="자막 파일(.srt, .vtt 등) 붙이기">${icon('subtitles',15)}<span>${this.hasCues()?'자막 바꾸기':'자막 붙이기'}</span></button>
        <span class="youtube-nav"><button type="button" class="youtube-button" data-yt="prev" title="재생목록의 이전 영상" aria-label="이전 영상" hidden>${icon('back',15)}</button><button type="button" class="youtube-button" data-yt="next" title="재생목록의 다음 영상" aria-label="다음 영상" hidden>${icon('forward',15)}</button></span>
        <button type="button" class="youtube-button" data-yt="size" aria-pressed="false" title="영상 접기">${icon('chevron-down',15)}</button>
        <a class="youtube-button youtube-open" data-yt="open" href="${esc(watchURL(this.youtube.videoId,this.youtube.playlistId))}" target="_blank" rel="noopener noreferrer" title="YouTube에서 열기">${icon('external',15)}</a>
        <p class="youtube-now" data-yt="now" aria-live="off"></p>
      </div>`;
    const viewport=this.reader.viewport;viewport.before(pane);tab.host.classList.add('has-youtube');
    const $=name=>pane.querySelector(`[data-yt="${name}"]`);this.$=$;
    $('play').onclick=()=>{const playing=this.player?.getPlayerState?.()===1;this.toggle();this.flash(icon(playing?'pause':'play',34));};
    $('back').onclick=()=>{const n=skipSeconds();this.seekBy(-n);this.flash(icon('undo',26)+'<span>'+n+'초</span>');};
    $('forward').onclick=()=>{const n=skipSeconds();this.seekBy(n);this.flash('<span>'+n+'초</span>'+icon('redo',26));};
    $('rate').onchange=event=>{const value=Number(event.target.value);savePref('rate',value);this.player?.setPlaybackRate?.(value);};
    $('follow').onclick=()=>{this.follow=!this.follow;$('follow').setAttribute('aria-pressed',String(this.follow));this.quietUntil=0;if(this.follow)this.reveal(true);};
    $('mark').onclick=()=>this.bookmark();
    $('chapters').onclick=()=>callbacks.onChapters();$('attach').onclick=()=>callbacks.onAttach();
    $('prev').onclick=()=>callbacks.onNavigate(-1);$('next').onclick=()=>callbacks.onNavigate(1);
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
    this.cues=[...doc.querySelectorAll('.subtitle-cue')].map(el=>{const t=cueTimes(el.querySelector('.subtitle-time')?.textContent);return t&&{el,start:t.start,end:t.end,text:(el.querySelector('.subtitle-text')?.textContent||'').trim()};}).filter(Boolean).sort((a,b)=>a.start-b.start);
  }
  async mount(){
    let YT;try{YT=await loadYouTubeAPI();}catch(error){this.message(error.message);return;}
    if(this.disposed)return;
    this.player=new YT.Player(this.pane.querySelector('.youtube-frame'),{host:PLAYER_HOST,videoId:this.youtube.videoId,playerVars:{playsinline:1,rel:0,iv_load_policy:3,cc_load_policy:0,start:Math.floor(this.savedAt>3?this.savedAt-2:0),origin:location.origin},events:{
      onReady:()=>{this.ready=true;this.player.setPlaybackRate?.(Number(this.$('rate').value));},
      onStateChange:event=>{
        const playing=event.data===1;this.playing=playing;
        this.$('play').setAttribute('aria-label',playing?'일시정지':'재생');
        if(!playing&&this.ready)this.remember(true);
        if(event.data===0)this.callbacks.onEnded?.();
      },
      onError:event=>this.message([101,150,153].includes(event.data)?'이 영상은 다른 사이트에서 재생할 수 없게 막혀 있습니다. 「YouTube에서 열기」로 보세요. 자막과 주석은 여기서 계속 쓸 수 있습니다.':'영상을 재생하지 못했습니다. (YouTube 오류 '+event.data+')'),
    }});
  }
  // An unplayable video keeps YouTube's own message and links reachable.
  message(text){const el=this.pane.querySelector('.youtube-message');el.textContent=text;el.hidden=false;this.pane.querySelector('.youtube-zones').hidden=true;}
  /** A short sign in the middle of the picture, as YouTube shows for taps. */
  flash(html){const el=this.pane.querySelector('.youtube-flash');el.innerHTML=html;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');}
  /** The playing time; right after a seek, the target until the player reports it (it answers with the old time for a moment). */
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
    const t=this.time();this.$('clock').textContent=clock(t);
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
  dispose(){
    if(this.disposed)return;this.disposed=true;clearInterval(this.timer);this.visibility.disconnect();document.removeEventListener('click',this.onOutlineClick,true);
    if(this.ready)this.remember(true);
    try{this.player?.destroy?.();}catch{}
    for(const type of ['wheel','touchmove','keydown'])this.reader.viewport?.removeEventListener(type,this.onUserScroll);
    const doc=this.reader.doc;
    if(doc){doc.removeEventListener('click',this.onDocClick);doc.getElementById('htmlmemo-youtube-style')?.remove();doc.querySelectorAll('[data-htmlmemo-yt-now]').forEach(el=>el.removeAttribute('data-htmlmemo-yt-now'));}
    this.pane.remove();this.tab.host.classList.remove('has-youtube');
  }
}
