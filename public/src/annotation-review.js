import {escapeHTML as esc, formatOutlineTitle, icon} from './utils.js';
import {ANNOTATION_LABELS} from './model.js';
import {isVideoNote} from './youtube-notes.js';
import {clock} from './youtube.js';

export function annotationOverview(reader) {
  const contexts = reader.annotationContexts?.() || new Map();
  const annotations = reader.metadata.annotations;
  const tree = reader.annotationTree?.(contexts) || [{
    id: 'document', title: '문서 전체', count: annotations.length, annotations, children: []
  }];
  return {contexts, tree};
}

const foldedText = value => String(value || '').normalize('NFC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
const hasFilter = state => Boolean(state && (state.query.trim() || state.color));

// Search disclosures belong to the query; opening a result must not expand
// unrelated parts of the unfiltered table of contents.
export function annotationExpansion(reader) {
  return hasFilter(reader.annotationFilter) ? reader.annotationFilter.open : reader.annotationTreeOpen;
}

function fields(note, context, names) {
  const quote = note.textAnchor?.quote || context?.quote || note.anchorTarget?.quote || '';
  const kind = isVideoNote(note) ? '시점 메모' : ANNOTATION_LABELS[note.type] || '주석';
  const seconds = isVideoNote(note) ? note.videoAnchor.seconds : context?.videoSeconds;
  const time = Number.isFinite(seconds) ? clock(seconds) : '';
  const heading = [context?.heading, context?.heading !== time && time].filter(Boolean).join(' · ');
  const highlight = note.type === 'highlight' || note.type === 'area';
  const colorName = highlight ? names.get(note.color.toLowerCase()) || '' : '';
  return {quote, kind, heading, colorName};
}

function annotationRow(note, info) {
  const {quote, kind, heading, colorName} = info;
  const date = Number.isFinite(note.created) ? new Date(note.created).toLocaleString('ko-KR',
    {month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}) : '';
  const main = note.text || quote;
  const description = [main, [kind, colorName, heading, date].filter(Boolean).join(' · ')].filter(Boolean).join('\n');
  const meta = [esc(kind), esc(colorName), heading && formatOutlineTitle(heading), esc(date)].filter(Boolean).join(' · ');
  const toolIcon = {pen:'pen',note:'note',highlight:'highlight',underline:'underline'}[note.type] || 'shapes';
  return `<div class="annotation-row"><button type="button" class="annotation-item" data-annotation="${esc(note.id)}" title="${esc(description)}">
    <span class="annotation-type" style="color:${esc(note.color)}">${icon(toolIcon,16)}</span>
    <span class="annotation-text">${main ? `<span class="annotation-main">${esc(main)}</span>` : ''}
    ${note.text && quote ? `<span class="annotation-context">“${esc(quote)}”</span>` : ''}
    <span class="annotation-meta">${meta}</span></span></button>
    <button type="button" class="icon-button" data-delete-annotation="${esc(note.id)}" aria-label="주석 삭제">${icon('trash',14)}</button></div>`;
}

export function renderAnnotationReview(content, reader, getNamedColors) {
  if (!reader.metadata.annotations.length) {
    content.innerHTML = '<p class="panel-empty">아직 주석이 없어요.<br>툴바에서 도구를 골라 생각을 남겨보세요.</p>';
    return;
  }
  const {tree, contexts} = annotationOverview(reader);
  const state = reader.annotationFilter ||= {query:'', color:'', open:new Map()};
  // Keep live input/IME focus across annotation saves in the same document.
  let controls = content.querySelector('[data-annotation-filters]');
  if (!controls || controls.boundReader !== reader) {
    content.innerHTML = `<div class="annotation-filters" data-annotation-filters>
      <div class="search-field loaded-search-field"><input type="text" data-annotation-query aria-label="내 주석에서 찾기" placeholder="내 주석에서 찾기" autocomplete="off">
      <button type="button" class="icon-button loaded-search-clear" data-annotation-clear aria-label="주석 검색어 지우기" title="검색어 지우기" hidden>${icon('close',14)}</button></div>
      <select data-annotation-color aria-label="형광펜 색 이름으로 거르기" hidden></select></div>
      <div data-annotation-count role="status" class="annotation-filter-count" hidden></div><div data-annotation-results></div>`;
    controls = content.querySelector('[data-annotation-filters]');
    controls.boundReader = reader;
  }
  const input = controls.querySelector('[data-annotation-query]');
  const select = controls.querySelector('[data-annotation-color]');
  const clear = controls.querySelector('[data-annotation-clear]');
  const status = content.querySelector('[data-annotation-count]');
  const results = content.querySelector('[data-annotation-results]');
  const names = new Map();
  const byName = new Map();
  const entries = new Map();
  let filterName = '';
  if (input.value !== state.query) input.value = state.query;

  const groups = new Map();

  function buildBranch(group, parents) {
    const path = [...parents, group.title];
    const rows = group.annotations.map(note => {
      const info = fields(note, contexts.get(note.id), names);
      entries.set(note.id, {note, info, path});
      return annotationRow(note, info);
    });
    const children = group.children.map(child => buildBranch(child, path));
    return `<details class="annotation-group" data-annotation-group="${esc(group.id)}">
      <summary><span class="annotation-group-title">${formatOutlineTitle(group.title)}</span><span class="annotation-group-count"></span></summary>
      <div class="annotation-group-body">${children.join('')}${rows.join('')}</div></details>`;
  }
  function bindTree() {
    results.innerHTML = `<div class="annotation-tree" aria-label="목차별 주석">${tree.map(group => buildBranch(group, [])).join('')}</div>
      <p class="panel-empty" data-annotation-missing hidden>일치하는 주석이 없습니다.</p>`;
    for (const element of results.querySelectorAll('[data-annotation-group]')) {
      const id = element.dataset.annotationGroup;
      groups.set(id, {element, count:element.querySelector('.annotation-group-count')});
      element.ontoggle = () => {
        if (element.isConnected && !element.hidden) annotationExpansion(reader).set(id, !!(element.open || element.hasAttribute('open')));
      };
    }
    for (const button of results.querySelectorAll('[data-annotation]')) {
      const id = button.dataset.annotation;
      entries.get(id).element = button.parentElement;
      button.onclick = () => reader.jumpAnnotation(id);
    }
    for (const button of results.querySelectorAll('[data-delete-annotation]')) button.onclick = () => reader.remove(button.dataset.deleteAnnotation);
  }
  function draw(resetGroups = false) {
    if (resetGroups) state.open.clear();
    const tokens = foldedText(state.query).split(' ').filter(Boolean);
    const filtered = hasFilter(state), expansion = annotationExpansion(reader);

    function apply(group) {
      let count = 0;
      for (const child of group.children) count += apply(child);
      for (const note of group.annotations) {
        const entry = entries.get(note.id);
        let match = !filterName || entry.info.colorName === filterName;
        if (match && tokens.length) {
          entry.search ??= foldedText([note.text, entry.info.quote, entry.info.kind, entry.info.colorName, entry.info.heading, ...entry.path].filter(Boolean).join(' '));
          match = tokens.every(token => entry.search.includes(token));
        }
        if (match) count++;
        if (entry.element.hidden !== !match) entry.element.hidden = !match;
      }
      const item = groups.get(group.id);
      const open = expansion.get(group.id) ?? (filtered && count > 0);
      if (Boolean(item.element.open || item.element.hasAttribute('open')) !== open) {
        item.element.open = open;
        item.element.toggleAttribute('open', open);
      }
      if (item.element.hidden !== !count) item.element.hidden = !count;
      if (item.count.textContent !== String(count)) {
        item.count.textContent = String(count);
        item.count.setAttribute('aria-label', `${count}개 주석`);
      }
      return count;
    }
    let count = 0;
    for (const group of tree) count += apply(group);
    status.hidden = !filtered;
    status.textContent = filtered ? `${count}개 결과` : '';
    clear.hidden = !state.query;
    results.querySelector('[data-annotation-missing]').hidden = count > 0;
  }
  let lastColors = null;
  function updateColors() {
    const colors = getNamedColors();
    if (lastColors && colors.length === lastColors.length &&
        colors.every(({color, name}, index) => color === lastColors[index].color && name === lastColors[index].name)) return;
    lastColors = colors;
    names.clear();
    byName.clear();
    for (const {color, name} of colors) {
      names.set(color.toLowerCase(), name);
      if (!byName.has(name)) byName.set(name, color.toLowerCase());
    }
    filterName = names.get(state.color) || '';
    state.color = byName.get(filterName) || '';
    select.innerHTML = '<option value="">모든 주석</option>' + [...byName].map(([name,color]) =>
      `<option value="${esc(color)}"${state.color === color ? ' selected' : ''}>${esc(name)}</option>`).join('');
    select.hidden = !byName.size;
    bindTree();
    draw();
  }
  input.oninput = () => {state.query = input.value; draw(true);};
  clear.onclick = () => {input.value = ''; input.oninput(); input.focus();};
  select.onchange = () => {state.color = select.value; filterName = names.get(state.color) || ''; draw(true);};
  controls.updateColors = updateColors;
  updateColors();
}
