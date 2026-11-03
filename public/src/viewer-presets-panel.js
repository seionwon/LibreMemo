import {PRESET_LIMIT,PRESET_SORTS,SETTING_LABELS,findPresets,presetFit,presetFormats,presetSummary,uniqueName} from './viewer-presets.js';
const make=(doc,tag,className,text)=>{const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
const action=(doc,text,run,label)=>{const node=make(doc,'button','',text);node.type='button';node.onclick=run;if(label)node.setAttribute('aria-label',label);return node;};
const fitText=fit=>fit.level==='full'?'이 문서에 전체 적용':fit.level==='none'?'이 문서에 적용 불가':'일부 적용 · '+fit.skipped.map(key=>SETTING_LABELS[key]).join('·')+' 제외';
export function presetTab(reader,doc){
  const root=make(doc,'div','viewer-presets'),caps=reader.viewerCapabilities(),group=reader.viewerGroup();
  const notice=text=>reader.callbacks.onNotice?.(text);
  const presets=()=>reader.callbacks.viewerPresets?.()||[],defaults=()=>reader.callbacks.viewerDefaults?.()||{};
  const store=(viewerPresets,viewerDefaults=defaults())=>{reader.callbacks.onViewerPresets?.({viewerPresets,viewerDefaults});draw();};
  const change=(id,patch)=>store(presets().map(preset=>preset.id===id?{...preset,...patch}:preset));
  let query='',sort='fit',renaming='',deleting='';
  // Save form: only what this document can actually show can be captured.
  const form=make(doc,'form','viewer-preset-save'),name=make(doc,'input');name.placeholder='새 보기 설정 이름';name.maxLength=60;name.required=true;name.setAttribute('aria-label','보기 설정 이름');
  const save=make(doc,'button','','저장');save.type='submit';const picks=make(doc,'fieldset','viewer-preset-picks'),legend=make(doc,'legend','','포함할 설정');picks.append(legend);
  const boxes={};for(const [key,label] of Object.entries(SETTING_LABELS)){const box=make(doc,'label','',''),input=make(doc,'input');input.type='checkbox';input.checked=input.dataset.on=caps[key];input.disabled=!caps[key];boxes[key]=input;box.append(input,make(doc,'span','',label+(caps[key]?'':' (미지원)')));picks.append(box);}
  form.append(name,save,picks);
  form.onsubmit=event=>{
    event.preventDefault();
    const keys=Object.keys(boxes).filter(key=>boxes[key].checked),settings=reader.viewerSettings(keys),title=name.value.trim();
    if(!title)return;if(!Object.keys(settings).length){notice('저장할 설정을 하나 이상 골라주세요.');return;}
    if(presets().length>=PRESET_LIMIT){notice('보기 설정은 '+PRESET_LIMIT+'개까지 저장할 수 있습니다.');return;}
    const unique=uniqueName(title,presets());
    store([...presets(),{id:crypto.randomUUID(),name:unique,settings,favorite:false,createdAt:Date.now(),usedAt:0}]);name.value='';
    notice(unique===title?'보기 설정을 저장했습니다.':'같은 이름이 있어 “'+unique+'”(으)로 저장했습니다.');
  };
  const tools=make(doc,'div','viewer-preset-tools'),search=make(doc,'input');search.type='search';search.placeholder='이름·형식·내용 찾기';search.setAttribute('aria-label','보기 설정 찾기');search.oninput=()=>{query=search.value;draw();};
  const order=make(doc,'select');order.setAttribute('aria-label','정렬');for(const [value,label] of PRESET_SORTS){const option=make(doc,'option','',label);option.value=value;order.append(option);}order.onchange=()=>{sort=order.value;draw();};
  tools.append(search,order);
  const undo=action(doc,'방금 적용 취소',()=>{reader.undoViewerPreset();draw();}),list=make(doc,'ul','viewer-preset-list'),empty=make(doc,'p','viewer-preset-empty');undo.className='viewer-preset-undo';
  const row=preset=>{
    const item=make(doc,'li','viewer-preset'),fit=presetFit(preset.settings,caps),{full,partial}=presetFormats(preset.settings),head=make(doc,'div','viewer-preset-head');
    item.dataset.fit=fit.level;item.dataset.preset=preset.id;
    const star=action(doc,preset.favorite?'★':'☆',()=>change(preset.id,{favorite:!preset.favorite}),preset.name+(preset.favorite?' 즐겨찾기 해제':' 즐겨찾기'));star.className='viewer-preset-star';star.setAttribute('aria-pressed',String(preset.favorite));
    let title;
    if(renaming===preset.id){
      title=make(doc,'input');title.value=preset.name;title.maxLength=60;title.setAttribute('aria-label','새 이름');
      const finish=commit=>{renaming='';const next=title.value.trim();if(commit&&next&&next!==preset.name)change(preset.id,{name:uniqueName(next,presets().filter(other=>other.id!==preset.id))});else draw();};
      title.onkeydown=event=>{event.stopPropagation();if(event.key==='Enter'){event.preventDefault();finish(true);}if(event.key==='Escape')finish(false);};title.onblur=()=>finish(true);
    }else title=make(doc,'strong','',preset.name);
    head.append(star,title);
    const formats=make(doc,'p','viewer-preset-formats','적용 형식: '+(full.join(', ')||'없음')+(partial.length?' · 일부: '+partial.join(', '):''));
    const summary=make(doc,'p','viewer-preset-summary',presetSummary(preset.settings)),status=make(doc,'p','viewer-preset-fit',fitText(fit));
    const isDefault=defaults()[group]===preset.id,buttons=make(doc,'div','viewer-preset-actions');
    const apply=action(doc,'적용',()=>{const {applied,skipped}=reader.applyViewerPreset(preset.settings);change(preset.id,{usedAt:Date.now()});notice(skipped.length?applied.length+'개를 적용했습니다. '+skipped.map(key=>SETTING_LABELS[key]).join('·')+'은(는) 이 문서에 쓸 수 없습니다.':'“'+preset.name+'” 설정을 적용했습니다.');},preset.name+' 적용');apply.disabled=fit.level==='none';apply.className='viewer-preset-apply';
    const update=action(doc,'현재 설정으로 덮어쓰기',()=>{const settings=reader.viewerSettings(Object.keys(preset.settings));if(!Object.keys(settings).length){notice('이 문서에는 이 보기 설정에 담을 항목이 없습니다.');return;}change(preset.id,{settings:{...preset.settings,...settings}});notice('현재 설정으로 덮어썼습니다.');});
    const rename=action(doc,'이름 변경',()=>{renaming=preset.id;draw();list.querySelector('input')?.focus();});
    const copy=action(doc,'복제',()=>{if(presets().length>=PRESET_LIMIT){notice('보기 설정은 '+PRESET_LIMIT+'개까지 저장할 수 있습니다.');return;}store([...presets(),{...preset,id:crypto.randomUUID(),name:uniqueName(preset.name+' 사본',presets()),favorite:false,createdAt:Date.now(),usedAt:0}]);});
    const standard=action(doc,isDefault?'이 형식 기본값 해제':'이 형식의 기본값으로',()=>{const next={...defaults()};if(isDefault)delete next[group];else next[group]=preset.id;store(presets(),next);});standard.disabled=fit.level==='none';standard.setAttribute('aria-pressed',String(isDefault));
    const remove=action(doc,deleting===preset.id?'정말 삭제':'삭제',()=>{if(deleting!==preset.id){deleting=preset.id;draw();return;}deleting='';const next={...defaults()};for(const key of Object.keys(next))if(next[key]===preset.id)delete next[key];store(presets().filter(other=>other.id!==preset.id),next);});remove.className='danger';
    buttons.append(apply,update,rename,copy,standard,remove);item.append(head,formats,summary,status,buttons);return item;
  };
  const draw=()=>{
    undo.hidden=!reader.viewerUndo;
    const shown=findPresets(presets(),{query,sort,caps});list.replaceChildren(...shown.map(row));
    empty.hidden=!!shown.length;empty.textContent=presets().length?'찾는 보기 설정이 없습니다.':'아직 저장한 보기 설정이 없습니다. 지금 설정에 이름을 붙여 저장해 보세요.';
  };
  root.append(form,undo,tools,list,empty);draw();return root;
}
export function locationTab(reader,doc){
  const root=make(doc,'div','viewer-location'),range=make(doc,'input'),value=make(doc,'output'),left=make(doc,'p','viewer-location-left');
  range.type='range';range.min=0;range.max=100;range.step=1;range.setAttribute('aria-label','책 안의 위치');
  const sync=()=>{const percent=reader.readingPercent(),minutes=reader.readingMinutesLeft();range.value=percent;value.textContent=percent+'%';left.textContent=minutes?'남은 시간 약 '+(minutes<60?minutes+'분':Math.floor(minutes/60)+'시간 '+minutes%60+'분')+' (평균 독서 속도 기준)':'끝까지 읽었습니다.';};
  range.oninput=()=>{value.textContent=range.value+'%';};range.onchange=()=>{reader.goToReadingPercent(Number(range.value));requestAnimationFrame(sync);};
  const seek=make(doc,'span','reading-layout-range');seek.append(range,value);
  const label=make(doc,'label'),name=make(doc,'span','','위치');label.append(name,seek);
  const speed=make(doc,'select'),start=make(doc,'button','viewer-location-start');speed.setAttribute('aria-label','자동 스크롤 속도');start.type='button';
  for(const [number,text] of [[20,'느리게'],[40,'보통'],[80,'빠르게']]){const option=make(doc,'option','',text);option.value=number;speed.append(option);}speed.value=40;
  const paged=reader.readingLayout().flow==='paged',running=!!reader.pager?.autoSpeed;start.disabled=speed.disabled=paged;
  start.textContent=paged?'자동 스크롤 (연속 스크롤에서 사용)':running?'자동 스크롤 다시 시작':'자동 스크롤 시작';
  // Starting closes this panel: the floating bar takes over pause, speed and stop.
  start.onclick=()=>{if(reader.pager?.startAuto(Number(speed.value)))reader.layoutPanelClose?.();};
  const speedRow=make(doc,'div','viewer-location-auto');speedRow.append(start,speed);
  const hint=make(doc,'p','viewer-location-left',paged?'자동 스크롤은 읽기 방식이 연속 스크롤일 때 쓸 수 있습니다.':'시작하면 이 창이 닫히고 화면 아래에 일시정지·속도·끝내기 막대가 나옵니다. 스크롤하거나 본문을 누르면 잠시 멈춥니다.');
  const info=make(doc,'dl','viewer-book-info');for(const [term,text] of reader.bookInfo())info.append(make(doc,'dt','',term),make(doc,'dd','',text));
  root.append(label,left,speedRow,hint);if(info.children.length)root.append(make(doc,'h3','','책 정보'),info);
  sync();return root;
}
