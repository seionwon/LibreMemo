import {DEFAULT_READING_LAYOUT,autoScrollLabel,stepAutoScrollSpeed} from './reading-layout.js';
import {locationTab,presetTab} from './viewer-presets-panel.js';
// The panel and the footnote card live in the app document: book content is
// shown as plain text only, and no book style can reach these controls.
const OPTIONS={
  lineHeight:[[0,'원본 그대로'],[1.4,'좁게 1.4'],[1.6,'보통 1.6'],[1.8,'넓게 1.8'],[2.1,'아주 넓게 2.1']],
  paragraph:[[0,'원본 그대로'],[.4,'좁게'],[.8,'보통'],[1.3,'넓게']],
  align:[['original','원본 그대로'],['left','왼쪽 맞춤'],['justify','양쪽 맞춤']],
  letterSpacing:[[0,'원본 그대로'],[.02,'조금 넓게'],[.05,'넓게'],[.1,'아주 넓게']],
  indent:[[0,'원본 그대로'],[1,'1글자'],[2,'2글자']],
  weight:[[0,'원본 그대로'],[500,'조금 굵게'],[600,'굵게']],
};
export function closeReadingLayoutPanel(reader){reader.layoutPanelClose?.();}
export function toggleReadingLayoutPanel(reader,button){
  if(reader.layoutPanel){closeReadingLayoutPanel(reader);return;}
  const doc=button.ownerDocument,panel=doc.createElement('div');
  panel.className='reading-layout-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','보기 설정');panel.setAttribute('data-htmlmemo-ui','');
  const heading=text=>{const node=doc.createElement('h3');node.textContent=text;return node;};
  const row=(text,control)=>{const label=doc.createElement('label');const name=doc.createElement('span');name.textContent=text;label.append(name,control);return label;};
  const range=(key,low,high,step,unit)=>{
    const input=doc.createElement('input');input.type='range';input.min=low;input.max=high;input.step=step;input.dataset.layout=key;
    const value=doc.createElement('output'),box=doc.createElement('span');box.className='reading-layout-range';box.append(input,value);
    // Reflowing a whole book per pixel of a drag would stall; apply on release.
    input.oninput=()=>{value.textContent=input.value+unit;};input.onchange=()=>{reader.setReadingLayout({[key]:Number(input.value)});sync();};
    box.sync=layout=>{input.value=layout[key];value.textContent=layout[key]+unit;};return box;
  };
  const select=key=>{
    const node=doc.createElement('select');node.dataset.layout=key;
    for(const [value,label] of OPTIONS[key]){const option=doc.createElement('option');option.value=value;option.textContent=label;node.append(option);}
    node.onchange=()=>{reader.setReadingLayout({[key]:key==='align'?node.value:Number(node.value)});sync();};return node;
  };
  const check=(key,text)=>{const input=doc.createElement('input');input.type='checkbox';input.dataset.layout=key;input.onchange=()=>{reader.setReadingLayout({[key]:input.checked});sync();};const label=doc.createElement('label');label.className='reading-layout-check';const name=doc.createElement('span');name.textContent=text;label.append(input,name);return label;};
  const flow=doc.createElement('div');flow.className='reading-layout-flow';flow.setAttribute('role','radiogroup');flow.setAttribute('aria-label','읽기 방식');
  const flowButton=(value,text)=>{const node=doc.createElement('button');node.type='button';node.dataset.flow=value;node.setAttribute('role','radio');node.textContent=text;node.onclick=()=>{reader.setReadingLayout({flow:value});sync();};return node;};
  flow.append(flowButton('continuous','연속 스크롤'),flowButton('paged','쪽 단위'));
  const enabled=check('enabled','LibreMemo 페이지 레이아웃 사용'),margin=range('margin',0,160,4,'px'),width=range('width',400,1400,20,'px'),lineHeight=select('lineHeight'),paragraph=select('paragraph'),align=select('align'),letterSpacing=select('letterSpacing'),indent=select('indent'),weight=select('weight'),hyphens=check('hyphens','단어 나누기(하이픈)');
  const reset=doc.createElement('button'),save=doc.createElement('button'),actions=doc.createElement('div');actions.className='reading-layout-actions';
  reset.type=save.type='button';reset.textContent='기본값으로';save.textContent='모든 새 책의 기본값으로 저장';
  reset.onclick=()=>{reader.setReadingLayout({...DEFAULT_READING_LAYOUT,flow:reader.readingLayout().flow});sync();};
  save.onclick=()=>{reader.saveReadingLayoutDefault();reader.callbacks.onNotice?.('이 보기 설정을 새 책의 기본값으로 저장했습니다.');};
  actions.append(reset,save);
  const details=doc.createElement('div');details.className='reading-layout-details';
  details.append(row('좌우 여백',margin),row('본문 폭',width),row('줄 간격',lineHeight),row('문단 간격',paragraph),row('정렬',align),row('자간',letterSpacing),row('첫 줄 들여쓰기',indent),row('글자 굵기',weight),hyphens);
  const layoutTab=doc.createElement('div');layoutTab.append(heading('읽기 방식'),flow,heading('페이지 레이아웃'),enabled,details,actions);
  const supported=reader.supportsReadingLayout(),views=[...(supported?[['보기',()=>layoutTab]]:[]),['저장한 설정',()=>presetTab(reader,doc)],...(supported?[['이동',()=>locationTab(reader,doc)]]:[])];
  const tabs=doc.createElement('div'),content=doc.createElement('div');tabs.className='reading-panel-tabs';tabs.setAttribute('role','tablist');
  const show=index=>{[...tabs.children].forEach((node,at)=>node.setAttribute('aria-selected',String(at===index)));sync();content.replaceChildren(views[index][1]());};
  views.forEach(([text],index)=>{const node=doc.createElement('button');node.type='button';node.setAttribute('role','tab');node.textContent=text;node.onclick=()=>show(index);tabs.append(node);});
  panel.append(tabs,content);
  const sync=()=>{
    const layout=reader.readingLayout();
    margin.sync(layout);width.sync(layout);lineHeight.value=layout.lineHeight;paragraph.value=layout.paragraph;align.value=layout.align;letterSpacing.value=layout.letterSpacing;indent.value=layout.indent;weight.value=layout.weight;
    enabled.querySelector('input').checked=layout.enabled;hyphens.querySelector('input').checked=layout.hyphens;details.toggleAttribute('data-disabled',!layout.enabled);
    for(const node of details.querySelectorAll('input,select'))node.disabled=!layout.enabled;
    for(const node of flow.children)node.setAttribute('aria-checked',String(node.dataset.flow===layout.flow));
  };
  show(0);reader.host.append(panel);reader.layoutPanel=panel;button.setAttribute('aria-expanded','true');
  const outside=event=>{if(!panel.contains(event.target)&&!button.contains(event.target))closeReadingLayoutPanel(reader);},key=event=>{if(event.key==='Escape'){closeReadingLayoutPanel(reader);button.focus();}};
  doc.addEventListener('pointerdown',outside,true);reader.doc?.addEventListener('pointerdown',outside,true);doc.addEventListener('keydown',key,true);
  reader.layoutPanelClose=()=>{doc.removeEventListener('pointerdown',outside,true);reader.doc?.removeEventListener('pointerdown',outside,true);doc.removeEventListener('keydown',key,true);panel.remove();reader.layoutPanel=null;reader.layoutPanelClose=null;button.setAttribute('aria-expanded','false');};
  (panel.querySelector('[aria-checked="true"]')||tabs.firstChild)?.focus();
}
const AUTO_ICONS={pause:'<path d="M9 6v12M15 6v12"/>',play:'<path d="M8 5.5v13l10.5-6.5z"/>',stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/>',slower:'<path d="M6 12h12"/>',faster:'<path d="M6 12h12M12 6v12"/>'};
const autoIcon=name=>'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+AUTO_ICONS[name]+'</svg>';
/** Small floating controls shown while auto-scroll is running or paused.
 *  It sits at the bottom of the reading area so the text stays visible. */
export function syncAutoScrollBar(reader){
  const pager=reader.pager,running=!!pager?.autoSpeed&&!reader.disposed;
  if(!running){reader.autoScrollBar?.remove();reader.autoScrollBar=null;return null;}
  let bar=reader.autoScrollBar;const doc=reader.host.ownerDocument;
  if(!bar||!bar.isConnected){
    bar=doc.createElement('div');bar.className='auto-scroll-bar';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','자동 스크롤');bar.setAttribute('data-htmlmemo-ui','');
    const button=(action,label)=>{const node=doc.createElement('button');node.type='button';node.dataset.auto=action;node.setAttribute('aria-label',label);node.title=label;return node;};
    const toggle=button('toggle','일시정지'),slower=button('slower','느리게'),faster=button('faster','빠르게'),stop=button('stop','자동 스크롤 끝내기'),state=doc.createElement('span'),speed=doc.createElement('output');
    state.className='auto-scroll-state';speed.className='auto-scroll-speed';speed.setAttribute('aria-label','자동 스크롤 속도');
    slower.innerHTML=autoIcon('slower');faster.innerHTML=autoIcon('faster');stop.innerHTML=autoIcon('stop')+'<span>끝내기</span>';
    toggle.onclick=()=>reader.pager?.toggleAuto();
    slower.onclick=()=>reader.pager?.setAutoSpeed(stepAutoScrollSpeed(reader.pager.autoSpeed,-1));
    faster.onclick=()=>reader.pager?.setAutoSpeed(stepAutoScrollSpeed(reader.pager.autoSpeed,1));
    stop.onclick=()=>reader.pager?.stopAuto();
    const group=doc.createElement('span');group.className='auto-scroll-speed-group';group.append(slower,speed,faster);
    bar.append(toggle,state,group,stop);reader.host.append(bar);reader.autoScrollBar=bar;
  }
  const paused=!!pager.autoPaused,toggle=bar.querySelector('[data-auto=toggle]');
  bar.toggleAttribute('data-paused',paused);
  toggle.innerHTML=autoIcon(paused?'play':'pause')+'<span>'+(paused?'계속':'일시정지')+'</span>';
  toggle.setAttribute('aria-label',paused?'자동 스크롤 계속':'자동 스크롤 일시정지');toggle.title=toggle.getAttribute('aria-label');
  bar.querySelector('.auto-scroll-state').textContent=paused?'일시정지됨':'자동 스크롤 중';
  bar.querySelector('.auto-scroll-speed').textContent='속도 '+autoScrollLabel(pager.autoSpeed);
  return bar;
}
/** A short in-book note reached from a superscript or number-only link. */
export function ebookNoteTarget(doc,eventTarget){
  const node=eventTarget?.nodeType===1?eventTarget:eventTarget?.parentElement,link=node?.closest?.('a[href^="#"]');
  if(!link?.closest('article[data-ebook]'))return null;
  const label=link.textContent.trim();
  if(!link.closest('sup')&&!/^[\[(]?(?:\d{1,4}|[*†‡§])[\])]?$/.test(label))return null;
  let id;try{id=decodeURIComponent(link.getAttribute('href').slice(1));}catch{return null;}
  const hit=doc.getElementById(id);if(!hit||hit.matches('.ebook-section,h1,h2,h3,h4,h5,h6'))return null;
  const block=hit.closest('li,aside,p,dd,div,section');
  const text=(block&&!block.matches('.ebook-section')?block:hit).textContent.trim();
  return text&&text.length<=4000?{hash:link.getAttribute('href'),text}:null;
}
export function closeEbookNote(reader){reader.noteCard?.remove();reader.noteCard=null;}
export function openEbookNote(reader,{hash,text}){
  closeEbookNote(reader);
  const doc=reader.host.ownerDocument,card=doc.createElement('div'),body=doc.createElement('p'),actions=doc.createElement('div'),close=doc.createElement('button'),open=doc.createElement('button');
  card.className='ebook-note-card';card.setAttribute('role','dialog');card.setAttribute('aria-label','주석 내용');card.setAttribute('data-htmlmemo-ui','');
  body.textContent=text;close.type=open.type='button';close.textContent='닫기';open.textContent='본문에서 보기';
  close.onclick=()=>closeEbookNote(reader);open.onclick=()=>{closeEbookNote(reader);reader.linkHistory||=[];reader.linkHistory.push({top:reader.scrollTop,left:reader.scrollLeft});reader.jumpToHash(hash);reader.updateReadingControls();};
  actions.append(open,close);card.append(body,actions);reader.host.append(card);reader.noteCard=card;close.focus();
}
