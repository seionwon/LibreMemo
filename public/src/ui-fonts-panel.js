import {icon} from './utils.js';
import {UI_FONT_GROUPS,UI_FONT_FIELDS,UI_FONT_MIN,UI_FONT_MAX,effectiveUIFonts} from './ui-fonts.js';

export function openUIFontPanel({modal,settings,preview,save,onBack}) {
  const row = ([key,label,parent]) => `<div class="ui-font-row" data-font-row="${key}">
    <label for="ui-font-${key}" style="--sample-unit:var(--lm-font-${key},1px)">${label}</label>
    <input type="range" min="${UI_FONT_MIN}" max="${UI_FONT_MAX}" step="1" data-font-slider="${key}" aria-label="${label} 글자 크기 슬라이더">
    <div class="ui-font-value"><input id="ui-font-${key}" type="number" inputmode="numeric" min="${UI_FONT_MIN}" max="${UI_FONT_MAX}" step="1" data-font-number="${key}" aria-label="${label} 글자 크기 퍼센트"><span aria-hidden="true">%</span></div>
    <button type="button" class="icon-button ui-font-inherit" data-font-inherit="${key}" aria-label="${label} ${parent?'상위 설정 따르기':'기본값으로'}" title="${parent?'상위 설정 따르기':'100%로 돌아가기'}">${icon('reload',14)}</button></div>`;
  modal(`<section class="ui-font-panel"><div class="dialog-heading"><button id="ui-font-back" class="text-button" type="button" aria-label="설정으로 돌아가기">${icon('back',15)} 설정</button><h2>UI 글자 크기</h2><button class="icon-button" data-dialog-close aria-label="닫기">${icon('close')}</button></div>
    <p class="dialog-description">슬라이더를 움직이거나 60~200% 사이의 숫자를 입력하세요. 항목 이름에 크기가 미리 보입니다.</p>
    <div class="ui-font-master">${row(UI_FONT_FIELDS[0])}</div>
    ${UI_FONT_GROUPS.map((group,i)=>`<details class="ui-font-group" ${i===0?'open':''}><summary>${group.title}</summary>${group.fields.map(row).join('')}</details>`).join('')}
    <p class="ui-font-error" role="status" hidden></p>
    <p class="dialog-description small">개별 항목의 ↻를 누르면 상위 설정을 따릅니다. 본문 글자 크기는 문서 위의 A+와 A−로 조절하세요.</p>
    <div class="ui-font-footer"><button type="button" class="secondary-button" id="ui-font-reset">모두 기본값으로</button></div></section>`,dialog=>{
    const panel = dialog.querySelector('.ui-font-panel');
    const rows = [...panel.querySelectorAll('[data-font-row]')].map(node=>({
      key:node.dataset.fontRow, slider:node.querySelector('[type=range]'), number:node.querySelector('[type=number]'), reset:node.querySelector('button'),
    }));
    const resetAll = panel.querySelector('#ui-font-reset');
    const error = panel.querySelector('.ui-font-error');
    let draft = {...settings()};
    function reflect(editing) {
      const values = effectiveUIFonts(draft);
      for (const {key,slider,number,reset} of rows) {
        slider.value = values[key];
        if (number !== editing) number.value = values[key];
        reset.disabled = !Object.hasOwn(draft,key);
      }
      resetAll.disabled = !Object.keys(draft).length;
    }
    function edit(key,value) {
      if (value === undefined || (key === 'all' && value === 100)) delete draft[key];
      else draft[key] = value;
    }
    function commit(key) {
      error.hidden = true;
      const current = settings();
      // Other tabs can change a different field while this dialog stays open.
      const next = key ? {...current} : {};
      if (key && Object.hasOwn(draft,key)) next[key] = draft[key];
      else if (key) delete next[key];
      if (JSON.stringify(next) !== JSON.stringify(current)) save(next);
      draft = {...settings()};
      preview(draft);
      reflect();
    }
    for (const {key,slider,number,reset} of rows) {
      for (const input of [slider,number]) {
        input.oninput = ()=>{
          if (!input.validity.valid || !Number.isInteger(input.valueAsNumber)) return;
          error.hidden = true;
          edit(key,input.valueAsNumber);
          preview(draft);
          reflect(input);
        };
        input.onchange = ()=>{
          if (!input.validity.valid || !Number.isInteger(input.valueAsNumber)) {
            error.textContent = '60~200 사이의 정수를 입력하세요. 이전 크기로 돌아갔습니다.';
            error.hidden = false;
            draft={...settings()};preview(draft);reflect();return;
          }
          edit(key,input.valueAsNumber);commit(key);
        };
      }
      number.onfocus = ()=>number.select();
      number.onkeydown = event=>{if(event.key==='Enter'){event.preventDefault();number.blur();}};
      reset.onclick = ()=>{edit(key,undefined);commit(key);};
    }
    resetAll.onclick = ()=>{draft={};commit();};
    panel.addEventListener('ui-fonts-restored',()=>{draft={...settings()};reflect();});
    panel.querySelector('#ui-font-back').onclick = ()=>{preview(settings());onBack();};
    dialog.onclose = ()=>preview(settings());
    reflect();
  });
}
