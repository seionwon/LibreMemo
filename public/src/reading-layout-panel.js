import {DEFAULT_READING_LAYOUT} from './reading-layout.js';
// The panel and the footnote card live in the app document: book content is
// shown as plain text only, and no book style can reach these controls.
const OPTIONS={
  lineHeight:[[0,'원본 그대로'],[1.4,'좁게 1.4'],[1.6,'보통 1.6'],[1.8,'넓게 1.8'],[2.1,'아주 넓게 2.1']],
  paragraph:[[0,'원본 그대로'],[.4,'좁게'],[.8,'보통'],[1.3,'넓게']],
  align:[['original','원본 그대로'],['left','왼쪽 맞춤'],['justify','양쪽 맞춤']],
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
  const enabled=check('enabled','LibreMemo 페이지 레이아웃 사용'),margin=range('margin',0,160,4,'px'),width=range('width',400,1400,20,'px'),lineHeight=select('lineHeight'),paragraph=select('paragraph'),align=select('align'),hyphens=check('hyphens','단어 나누기(하이픈)');
  const reset=doc.createElement('button'),save=doc.createElement('button'),actions=doc.createElement('div');actions.className='reading-layout-actions';
  reset.type=save.type='button';reset.textContent='기본값으로';save.textContent='모든 새 책의 기본값으로 저장';
  reset.onclick=()=>{reader.setReadingLayout({...DEFAULT_READING_LAYOUT,flow:reader.readingLayout().flow});sync();};
  save.onclick=()=>{reader.saveReadingLayoutDefault();reader.callbacks.onNotice?.('이 보기 설정을 새 책의 기본값으로 저장했습니다.');};
  actions.append(reset,save);
  const details=doc.createElement('div');details.className='reading-layout-details';
  details.append(row('좌우 여백',margin),row('본문 폭',width),row('줄 간격',lineHeight),row('문단 간격',paragraph),row('정렬',align),hyphens);
  panel.append(heading('읽기 방식'),flow,heading('페이지 레이아웃'),enabled,details,actions);
  const sync=()=>{
    const layout=reader.readingLayout();
    margin.sync(layout);width.sync(layout);lineHeight.value=layout.lineHeight;paragraph.value=layout.paragraph;align.value=layout.align;
    enabled.querySelector('input').checked=layout.enabled;hyphens.querySelector('input').checked=layout.hyphens;details.toggleAttribute('data-disabled',!layout.enabled);
    for(const node of details.querySelectorAll('input,select'))node.disabled=!layout.enabled;
    for(const node of flow.children)node.setAttribute('aria-checked',String(node.dataset.flow===layout.flow));
  };
  sync();reader.host.append(panel);reader.layoutPanel=panel;button.setAttribute('aria-expanded','true');
  const outside=event=>{if(!panel.contains(event.target)&&!button.contains(event.target))closeReadingLayoutPanel(reader);},key=event=>{if(event.key==='Escape'){closeReadingLayoutPanel(reader);button.focus();}};
  doc.addEventListener('pointerdown',outside,true);reader.doc?.addEventListener('pointerdown',outside,true);doc.addEventListener('keydown',key,true);
  reader.layoutPanelClose=()=>{doc.removeEventListener('pointerdown',outside,true);reader.doc?.removeEventListener('pointerdown',outside,true);doc.removeEventListener('keydown',key,true);panel.remove();reader.layoutPanel=null;reader.layoutPanelClose=null;button.setAttribute('aria-expanded','false');};
  panel.querySelector('[aria-checked="true"]')?.focus();
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
